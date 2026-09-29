import { md5, ripemd160 } from "hash-wasm";

self.addEventListener("message", async (event) => {
  const { type, data, requestId } = event.data || {};

  if (type !== "COMPUTE_HASHES") {
    return;
  }

  try {
    const inputType = data?.inputType;

    const outputFormat = data?.outputFormat || "hex";

    const bytes = parseInput(data?.input ?? "", inputType);

    const results = {};

    // MD5
    results.md5 = await formatHash(await md5(bytes), outputFormat);

    // RIPEMD-160
    results.ripemd160 = await formatHash(await ripemd160(bytes), outputFormat);

    // SHA algorithms
    const algorithms = [
      ["sha1", "SHA-1"],
      ["sha256", "SHA-256"],
      ["sha384", "SHA-384"],
      ["sha512", "SHA-512"],
    ];

    for (const [name, algorithm] of algorithms) {
      try {
        const digest = await crypto.subtle.digest(algorithm, bytes);

        results[name] =
          outputFormat === "hex"
            ? bytesToHex(new Uint8Array(digest))
            : bytesToBase64(new Uint8Array(digest));
      } catch (error) {
        results[name] = `Error: ${error.message}`;
      }
    }

    self.postMessage({
      type: "HASHES_RESULT",
      requestId,
      hashes: results,
    });
  } catch (error) {
    self.postMessage({
      type: "HASH_ERROR",
      requestId,
      message: error?.message || "Unable to hash input",
    });
  }
});

// ============================
// INPUT PARSERS
// ============================

function parseInput(input, inputType) {
  if (inputType === "text") {
    return new TextEncoder().encode(input);
  }

  if (inputType === "hex") {
    return hexToBytes(input);
  }

  if (inputType === "base64") {
    return base64ToBytes(input);
  }

  throw new Error(`Unsupported input type: ${inputType}`);
}

// ============================
// HASH OUTPUT
// ============================

async function formatHash(hex, outputFormat) {
  if (outputFormat === "hex") {
    return hex;
  }

  return bytesToBase64(hexToBytes(hex));
}

// ============================
// HEX
// ============================

function hexToBytes(hex) {
  const value = String(hex).trim();

  if (!value) {
    return new Uint8Array();
  }

  if (!/^[0-9a-fA-F]+$/.test(value) || value.length % 2 !== 0) {
    throw new Error(
      "Invalid hexadecimal input. Use pairs of 0-9, A-F characters.",
    );
  }

  const bytes = new Uint8Array(value.length / 2);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(value.slice(i * 2, i * 2 + 2), 16);
  }

  return bytes;
}

// ============================
// BASE64
// ============================

function base64ToBytes(base64) {
  const value = String(base64).trim().replace(/-/g, "+").replace(/_/g, "/");

  if (
    !value ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(value) ||
    value.length % 4 === 1
  ) {
    throw new Error("Invalid Base64 input.");
  }

  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);

  let binary;

  try {
    binary = atob(padded);
  } catch {
    throw new Error("Invalid Base64 input.");
  }

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

// ============================
// BYTES → HEX
// ============================

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

// ============================
// BYTES → BASE64
// ============================

function bytesToBase64(bytes) {
  let binary = "";

  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}
