import { feedback } from "../utils/feedback.js";
import { formatBytes } from "../utils/common.js";
import { ToolEnhancements } from "../utils/tool-enhancements.js";

export class Base64Tool {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.mode = "encode";
    this.processTimeout = null;
    this.maxInputBytes = 10 * 1024 * 1024;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Base64 Encode / Decode
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Encode text to Base64 or decode Base64 back to UTF-8 text. Supports standard and URL-safe Base64.
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div class="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium btn-primary"
              data-mode="encode"
            >Encode</button>
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium btn-secondary"
              data-mode="decode"
            >Decode</button>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-action="swap"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" aria-hidden="true">
                <polyline points="17 1 21 5 17 9"/>
                <polyline points="3 11 7 7 11 11"/>
                <path d="M21 5H9"/>
                <path d="M3 19h12"/>
                <polyline points="7 23 3 19 7 15"/>
              </svg>
              Swap
            </button>

            <button
              type="button"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-action="copy"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy Result
            </button>

            <div id="download-button-container" class="inline-flex"></div>

            <button
              type="button"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-action="clear"
            >Clear</button>
          </div>
        </div>

        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 hidden" data-error role="alert">
          <p class="text-red-800 dark:text-red-300 text-sm"></p>
        </div>

        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-3">
              <label for="base64-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Input</label>
              <label class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                Upload Text File
                <input id="base64-file" type="file" accept="text/plain,.txt,.json,.csv,.xml,.html,.css,.js,.md,.yaml,.yml" class="hidden" />
              </label>
            </div>

            <textarea
              id="base64-input"
              class="w-full h-64 p-4 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter text to encode..."
              spellcheck="false"
              maxlength="10485760"
            >Hello, World!</textarea>
            <div class="text-xs text-gray-500 dark:text-gray-400" data-input-limit>Maximum input: 10 MB</div>
          </div>

          <div class="space-y-2">
            <label for="base64-output" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Output</label>
            <textarea
              id="base64-output"
              class="w-full h-64 p-4 font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg"
              placeholder="Base64 encoded result will appear here..."
              spellcheck="false"
              readonly
            ></textarea>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span class="text-gray-600 dark:text-gray-400">
              <span class="font-medium text-gray-900 dark:text-white" data-stat="input-size">0 bytes</span> input
            </span>
            <span class="text-gray-600 dark:text-gray-400">
              <span class="font-medium text-gray-900 dark:text-white" data-stat="output-size">0 bytes</span> output
            </span>
            <span class="text-gray-600 dark:text-gray-400" data-stat="ratio">Ratio: 0%</span>
          </div>

          <label class="flex items-center space-x-2 text-sm">
            <input type="checkbox" id="url-safe" class="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-2" />
            <span class="text-gray-700 dark:text-gray-300">URL Safe (RFC 4648)</span>
          </label>
        </div>
      </div>
    `;

    this.inputArea = this.container.querySelector("#base64-input");
    this.outputArea = this.container.querySelector("#base64-output");
    this.errorDisplay = this.container.querySelector("[data-error]");
    this.fileInput = this.container.querySelector("#base64-file");
    this.urlSafeCheckbox = this.container.querySelector("#url-safe");
  }

  attachEventListeners() {
    this.container.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.setMode(btn.dataset.mode);
        this.process();
      });
    });

    this.container
      .querySelector('[data-action="swap"]')
      ?.addEventListener("click", () => this.swap());
    this.container
      .querySelector('[data-action="copy"]')
      ?.addEventListener("click", () => this.copy());
    this.container
      .querySelector('[data-action="clear"]')
      ?.addEventListener("click", () => this.clear());

    this.inputArea.addEventListener("input", () => {
      this.updateStats();
      clearTimeout(this.processTimeout);
      this.processTimeout = setTimeout(() => this.process(), 250);
    });

    this.urlSafeCheckbox.addEventListener("change", () => this.process());

    this.fileInput?.addEventListener("change", (event) =>
      this.handleFileUpload(event),
    );

    this.initializeEnhancements();
    this.setMode(this.mode);
    this.updateStats();

    if (this.inputArea.value) {
      this.process();
    }
  }

  initializeEnhancements() {
    const commonTooltips = ToolEnhancements.getCommonTooltips();

    ToolEnhancements.enhanceCheckbox(
      this.urlSafeCheckbox,
      commonTooltips.urlSafe.description,
      commonTooltips.urlSafe.link,
    );

    const copyButton = this.container.querySelector('[data-action="copy"]');
    ToolEnhancements.enhanceCopyButton(
      copyButton,
      this.outputArea,
      "Copy Result",
    );

    const downloadContainer = this.container.querySelector(
      "#download-button-container",
    );
    const downloadButton = ToolEnhancements.createDownloadButton(
      () => this.getOutputContent(),
      () => this.getDownloadFilename(),
      "text/plain",
      "Download",
    );
    downloadContainer.appendChild(downloadButton);

    const ratioElement = this.container.querySelector('[data-stat="ratio"]');
    ToolEnhancements.addRatioTooltip(
      ratioElement,
      "Shows the size change between input and output. Standard Base64 encoding usually increases size by about 33%. URL-safe Base64 removes padding.",
    );
  }

  setMode(mode) {
    this.mode = mode === "decode" ? "decode" : "encode";

    this.container.querySelectorAll("[data-mode]").forEach((btn) => {
      const active = btn.dataset.mode === this.mode;
      btn.classList.toggle("btn-primary", active);
      btn.classList.toggle("btn-secondary", !active);
    });

    if (this.mode === "encode") {
      this.inputArea.placeholder = "Enter text to encode...";
      this.outputArea.placeholder = "Base64 encoded result will appear here...";
      if (this.fileInput) this.fileInput.disabled = false;
    } else {
      this.inputArea.placeholder = "Enter Base64 to decode...";
      this.outputArea.placeholder = "Decoded UTF-8 text will appear here...";
      if (this.fileInput) this.fileInput.disabled = true;
    }
  }

  process() {
    const rawInput = this.inputArea.value;

    if (!rawInput) {
      this.outputArea.value = "";
      this.clearError();
      this.updateStats();
      return;
    }

    const inputBytes = new TextEncoder().encode(rawInput).byteLength;
    if (inputBytes > this.maxInputBytes) {
      this.outputArea.value = "";
      this.showError("Input is too large. Maximum size is 10 MB.");
      this.updateStats();
      return;
    }

    const urlSafe = this.urlSafeCheckbox.checked;

    try {
      const result =
        this.mode === "encode"
          ? this.encode(rawInput, urlSafe)
          : this.decode(rawInput, urlSafe);

      this.outputArea.value = result;
      this.clearError();
      this.updateStats();
    } catch (error) {
      this.outputArea.value = "";
      this.showError(`Failed to ${this.mode}: ${error.message}`);
      feedback.showToast(`Failed to ${this.mode}: ${error.message}`, "error");
      this.updateStats();
    }
  }

  encode(str, urlSafe = false) {
    const bytes = new TextEncoder().encode(str);
    let binary = "";

    // Avoid call-stack/memory issues from String.fromCharCode(...bytes)
    // when encoding large inputs.
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    let base64 = btoa(binary);

    if (urlSafe) {
      base64 = base64
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
    }

    return base64;
  }

  decode(str, urlSafe = false) {
    let base64 = str.replace(/[\r\n\t ]/g, "");

    if (!base64) return "";

    if (urlSafe) {
      if (/[^A-Za-z0-9_-]/.test(base64)) {
        throw new Error("Invalid URL-safe Base64 characters");
      }

      base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
    } else if (/[^A-Za-z0-9+/=]/.test(base64)) {
      throw new Error("Invalid Base64 characters");
    }

    // Padding can only appear at the end and may contain one or two '='.
    if (/=[^=]/.test(base64) || /={3,}$/.test(base64)) {
      throw new Error("Invalid Base64 padding");
    }

    const unpaddedLength = base64.replace(/=+$/, "").length;
    if (unpaddedLength % 4 === 1) {
      throw new Error("Invalid Base64 length");
    }

    const remainder = base64.length % 4;
    if (remainder !== 0) {
      base64 += "=".repeat(4 - remainder);
    }

    let binary;
    try {
      binary = atob(base64);
    } catch {
      throw new Error("Invalid Base64 string");
    }

    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw new Error("Decoded data is not valid UTF-8 text");
    }
  }

  async handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > this.maxInputBytes) {
      this.showError("File is too large. Maximum size is 10 MB.");
      feedback.showToast("File is too large. Maximum size is 10 MB.", "error");
      event.target.value = "";
      return;
    }

    try {
      this.inputArea.value = await file.text();
      this.updateStats();
      this.process();
      feedback.showToast(`Loaded ${file.name}`, "success");
    } catch (error) {
      this.showError(`Failed to read file: ${error.message}`);
      feedback.showToast(`Failed to read file: ${error.message}`, "error");
    } finally {
      event.target.value = "";
    }
  }

  swap() {
    const input = this.inputArea.value;
    const output = this.outputArea.value;

    this.inputArea.value = output;
    this.outputArea.value = input;

    this.setMode(this.mode === "encode" ? "decode" : "encode");
    this.updateStats();
    this.process();
  }

  copy() {
    const output = this.outputArea.value;
    if (!output) {
      feedback.showToast("Nothing to copy", "warning");
      return;
    }

    feedback.copyToClipboard(
      output,
      `${this.mode === "encode" ? "Encoded" : "Decoded"} result copied`,
    );
  }

  clear() {
    clearTimeout(this.processTimeout);
    this.inputArea.value = "";
    this.outputArea.value = "";
    this.clearError();
    this.updateStats();

    if (this.fileInput) {
      this.fileInput.value = "";
    }
  }

  updateStats() {
    const inputBytes = new TextEncoder().encode(
      this.inputArea.value,
    ).byteLength;
    const outputBytes = new TextEncoder().encode(
      this.outputArea.value,
    ).byteLength;

    this.container.querySelector('[data-stat="input-size"]').textContent =
      formatBytes(inputBytes);
    this.container.querySelector('[data-stat="output-size"]').textContent =
      formatBytes(outputBytes);

    if (inputBytes > 0) {
      const ratio = Math.round((outputBytes / inputBytes) * 100);
      this.container.querySelector('[data-stat="ratio"]').textContent =
        `Ratio: ${ratio}%`;
    } else {
      this.container.querySelector('[data-stat="ratio"]').textContent =
        "Ratio: 0%";
    }
  }

  showError(message) {
    this.errorDisplay.querySelector("p").textContent = message;
    this.errorDisplay.classList.remove("hidden");
  }

  clearError() {
    this.errorDisplay.querySelector("p").textContent = "";
    this.errorDisplay.classList.add("hidden");
  }

  getOutputContent() {
    const output = this.outputArea.value;
    if (!output.trim()) {
      throw new Error("No content to download");
    }
    return output;
  }

  getDownloadFilename() {
    return this.mode === "encode" ? "encoded_data.base64" : "decoded_data.txt";
  }
}
