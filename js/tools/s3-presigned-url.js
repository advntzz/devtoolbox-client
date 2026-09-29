export class S3PresignedURL {
  constructor() {
    this.container = null;
    this.urlHistory = [];
    this.customHeaders = [];
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">S3 Pre-signed URL Generator</h1>
          <p class="text-gray-600 dark:text-gray-400">Generate AWS Signature Version 4 pre-signed URLs locally in your browser.</p>
        </div>

        <div class="mb-6 flex flex-wrap gap-2">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="generate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            Generate URL
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="clear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">S3 Configuration</h3>
              <div class="space-y-4">
                <div>
                  <label for="bucket-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bucket Name</label>
                  <input type="text" id="bucket-name" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="my-bucket-name" value="example-bucket" />
                </div>

                <div>
                  <label for="object-key" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Object Key</label>
                  <input type="text" id="object-key" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="path/to/file.pdf" value="documents/report.pdf" />
                </div>

                <div>
                  <label for="region" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
                  <select id="region" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-east-2">US East (Ohio)</option>
                    <option value="us-west-1">US West (N. California)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">EU (Ireland)</option>
                    <option value="eu-central-1">EU (Frankfurt)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                    <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                    <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                    <option value="sa-east-1">South America (São Paulo)</option>
                  </select>
                </div>

                <div>
                  <label for="http-method" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HTTP Method</label>
                  <select id="http-method" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    <option value="GET">GET (Download)</option>
                    <option value="PUT">PUT (Upload)</option>
                    <option value="DELETE">DELETE</option>
                    <option value="HEAD">HEAD</option>
                  </select>
                </div>

                <div>
                  <label for="expiration-value" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiration Time</label>
                  <div class="grid grid-cols-2 gap-2">
                    <input type="number" id="expiration-value" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" value="15" min="1" />
                    <select id="expiration-unit" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum: 7 days (604800 seconds)</p>
                </div>
              </div>
            </div>

            <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">AWS Credentials</h3>
              <div class="space-y-4">
                <div>
                  <label for="access-key" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Access Key ID</label>
                  <input type="text" id="access-key" autocomplete="off" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" placeholder="AKIA..." />
                </div>

                <div>
                  <label for="secret-key" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secret Access Key</label>
                  <input type="password" id="secret-key" autocomplete="off" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" placeholder="Secret access key" />
                </div>

                <div>
                  <label for="session-token" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session Token (Optional)</label>
                  <input type="password" id="session-token" autocomplete="off" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" placeholder="For temporary credentials only" />
                </div>

                <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
                  <p class="text-xs text-yellow-700 dark:text-yellow-300"><strong>Security Note:</strong> Credentials are processed locally with the Web Crypto API. Never enter production credentials into a site you do not trust.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generated Pre-signed URL</h3>
              <div id="url-result" class="space-y-4">
                <div class="text-gray-500 dark:text-gray-400 text-center py-8">Configure settings and click "Generate URL" to create a pre-signed URL</div>
              </div>
            </div>

            <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Options</h3>
              <div class="space-y-4">
                <div>
                  <label class="flex items-center">
                    <input type="checkbox" id="use-path-style" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
                    <span class="text-sm text-gray-700 dark:text-gray-300">Use path-style URLs (S3-compatible services such as MinIO/Ceph)</span>
                  </label>
                </div>

                <div>
                  <label class="flex items-center">
                    <input type="checkbox" id="add-headers" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
                    <span class="text-sm text-gray-700 dark:text-gray-300">Sign additional request headers</span>
                  </label>
                </div>

                <div id="custom-headers" class="hidden space-y-2">
                  <div class="grid grid-cols-2 gap-2">
                    <input type="text" id="s3-header-name" placeholder="Header name (e.g. x-amz-meta-id)" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                    <input type="text" id="s3-header-value" placeholder="Header value" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                  </div>
                  <button class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30" data-action="add-header">Add Header</button>
                  <div id="headers-list" class="space-y-1"></div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Signed headers must also be sent with the eventual S3 request exactly as generated.</p>
                </div>

                <div>
                  <label for="content-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content-Type (for PUT)</label>
                  <input type="text" id="content-type" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" placeholder="application/pdf" />
                </div>

                <div>
                  <label for="content-disposition" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Response Content-Disposition (GET)</label>
                  <input type="text" id="content-disposition" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" placeholder="attachment; filename=download.pdf" />
                </div>
              </div>
            </div>

            <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">URL History</h3>
              <div id="url-history" class="space-y-2">
                <div class="text-gray-500 dark:text-gray-400 text-sm">No URLs generated yet</div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">How it works</h4>
          <div class="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <div>• Uses AWS Signature Version 4 (SigV4), including SHA-256 and HMAC-SHA256.</div>
            <div>• The signing key is derived entirely in the browser and is never sent to AWS by this tool.</div>
            <div>• Maximum pre-signing lifetime is 7 days, as required by S3 query authentication.</div>
          </div>
        </div>

        <div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded hidden" data-error></div>
      </div>
    `;
  }

  attachEventListeners() {
    this.container
      .querySelector('[data-action="generate"]')
      .addEventListener("click", () => this.generatePresignedURL());
    this.container
      .querySelector('[data-action="clear"]')
      .addEventListener("click", () => this.clear());

    this.container
      .querySelector("#add-headers")
      .addEventListener("change", (event) => {
        this.container
          .querySelector("#custom-headers")
          .classList.toggle("hidden", !event.target.checked);
      });

    this.container
      .querySelector('[data-action="add-header"]')
      .addEventListener("click", () => this.addCustomHeader());

    this.container
      .querySelector("#http-method")
      .addEventListener("change", (event) => {
        this.updateContentTypeVisibility(event.target.value);
      });

    this.updateContentTypeVisibility(
      this.container.querySelector("#http-method").value,
    );

    this.container.addEventListener("click", (event) => {
      const copyButton = event.target.closest("[data-copy-url]");
      if (copyButton) {
        this.copyToClipboard(copyButton.dataset.copyUrl, copyButton);
      }
    });
  }

  updateContentTypeVisibility(method) {
    const input = this.container.querySelector("#content-type");
    input.closest("div").style.display = method === "PUT" ? "block" : "none";
  }

  async generatePresignedURL() {
    this.clearError();
    this.container.querySelector("#url-result").innerHTML =
      '<div class="text-gray-500 dark:text-gray-400 text-center py-8">Configure settings and click "Generate URL" to create a pre-signed URL</div>';
    const bucket = this.container.querySelector("#bucket-name").value.trim();
    const objectKey = this.container.querySelector("#object-key").value;
    const region = this.container.querySelector("#region").value;
    const method = this.container.querySelector("#http-method").value;
    const accessKey = this.container.querySelector("#access-key").value.trim();
    const secretKey = this.container.querySelector("#secret-key").value.trim();
    const sessionToken = this.container
      .querySelector("#session-token")
      .value.trim();
    const expirationValue = Number(
      this.container.querySelector("#expiration-value").value,
    );
    const expirationUnit =
      this.container.querySelector("#expiration-unit").value;
    const usePathStyle =
      this.container.querySelector("#use-path-style").checked;
    const contentType = this.container
      .querySelector("#content-type")
      .value.trim();
    const contentDisposition = this.container
      .querySelector("#content-disposition")
      .value.trim();

    if (!bucket || !objectKey.trim() || !accessKey || !secretKey) {
      this.showError(
        "Please fill in bucket name, object key, Access Key ID, and Secret Access Key.",
      );
      return;
    }

    if (!Number.isFinite(expirationValue) || expirationValue < 1) {
      this.showError("Expiration must be a positive number.");
      return;
    }

    let expirationSeconds;
    if (expirationUnit === "minutes")
      expirationSeconds = Math.floor(expirationValue * 60);
    else if (expirationUnit === "hours")
      expirationSeconds = Math.floor(expirationValue * 3600);
    else expirationSeconds = Math.floor(expirationValue * 86400);

    if (expirationSeconds > 604800) {
      this.showError("Maximum expiration time is 7 days (604800 seconds).");
      return;
    }

    if (!/^\S+$/.test(accessKey)) {
      this.showError("Access Key ID cannot contain whitespace.");
      return;
    }

    if (sessionToken && /[\r\n]/.test(sessionToken)) {
      this.showError("Session token cannot contain line breaks.");
      return;
    }

    const button = this.container.querySelector('[data-action="generate"]');
    const originalButtonText = button.textContent.trim();
    button.disabled = true;
    button.textContent = "Generating…";
    this.clearError();

    try {
      const url = await this.createPresignedURL({
        bucket,
        objectKey,
        region,
        method,
        accessKey,
        secretKey,
        sessionToken,
        expirationSeconds,
        usePathStyle,
        contentType,
        contentDisposition,
        customHeaders: this.getCustomHeaders(),
      });

      this.displayURL(url, expirationSeconds, method);
      this.addToHistory({
        bucket,
        objectKey,
        method,
        url,
        expiration: expirationSeconds,
        timestamp: new Date(),
      });
    } catch (error) {
      this.showError(
        `Error generating URL: ${error.message || "Unable to create signature."}`,
      );
    } finally {
      button.disabled = false;
      button.textContent = originalButtonText;
    }
  }

  async createPresignedURL(params) {
    const {
      bucket,
      objectKey,
      region,
      method,
      accessKey,
      secretKey,
      expirationSeconds,
      usePathStyle,
      contentType,
      contentDisposition,
      sessionToken,
      customHeaders = [],
    } = params;

    if (!globalThis.crypto?.subtle) {
      throw new Error(
        "Web Crypto API is not available in this browser context.",
      );
    }

    const now = new Date();
    const amzDate = this.toAmzDate(now);
    const dateStamp = amzDate.slice(0, 8);
    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;

    const host = usePathStyle
      ? `s3.${region}.amazonaws.com`
      : `${bucket}.s3.${region}.amazonaws.com`;

    const canonicalUri = usePathStyle
      ? `/${this.awsEncode(bucket)}/${this.encodeObjectKey(objectKey)}`
      : `/${this.encodeObjectKey(objectKey)}`;

    const headers = { host };

    if (method === "PUT" && contentType) {
      this.validateHeaderValue("content-type", contentType);
      headers["content-type"] = this.normalizeHeaderValue(contentType);
    }

    for (const header of customHeaders) {
      const name = header.name.toLowerCase();
      if (name === "host")
        throw new Error("Host cannot be added as a custom header.");
      if (name === "content-type" && method !== "PUT") {
        throw new Error(
          "Content-Type can only be signed here for PUT requests.",
        );
      }
      this.validateHeaderName(name);
      this.validateHeaderValue(name, header.value);
      headers[name] = this.normalizeHeaderValue(header.value);
    }

    const signedHeaderNames = Object.keys(headers).sort();
    const signedHeaders = signedHeaderNames.join(";");
    const canonicalHeaders = signedHeaderNames
      .map((name) => `${name}:${headers[name]}\n`)
      .join("");

    const query = {
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${accessKey}/${credentialScope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": String(expirationSeconds),
      "X-Amz-SignedHeaders": signedHeaders,
    };

    if (sessionToken) query["X-Amz-Security-Token"] = sessionToken;

    // S3 response-content-disposition is a GET response override, not a signed request header.
    if (method === "GET" && contentDisposition) {
      query["response-content-disposition"] = contentDisposition;
    }

    const canonicalQueryString = this.canonicalQueryString(query);
    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      "UNSIGNED-PAYLOAD",
    ].join("\n");

    const canonicalRequestHash = await this.sha256Hex(canonicalRequest);
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      canonicalRequestHash,
    ].join("\n");

    const signingKey = await this.getSignatureKey(
      secretKey,
      dateStamp,
      region,
      "s3",
    );
    const signature = await this.hmacHex(signingKey, stringToSign);

    return `https://${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
  }

  async getSignatureKey(secretKey, dateStamp, region, service) {
    const kDate = await this.hmacRaw(
      new TextEncoder().encode(`AWS4${secretKey}`),
      dateStamp,
    );
    const kRegion = await this.hmacRaw(kDate, region);
    const kService = await this.hmacRaw(kRegion, service);
    return this.hmacRaw(kService, "aws4_request");
  }

  async sha256Hex(message) {
    const data = new TextEncoder().encode(message);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return this.bytesToHex(new Uint8Array(digest));
  }

  async hmacRaw(keyBytes, message) {
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(message),
    );
    return new Uint8Array(signature);
  }

  async hmacHex(keyBytes, message) {
    return this.bytesToHex(await this.hmacRaw(keyBytes, message));
  }

  canonicalQueryString(params) {
    return Object.keys(params)
      .sort((a, b) => {
        const ea = this.awsEncode(a);
        const eb = this.awsEncode(b);
        return ea < eb ? -1 : ea > eb ? 1 : 0;
      })
      .map(
        (key) =>
          `${this.awsEncode(key)}=${this.awsEncode(String(params[key]))}`,
      )
      .join("&");
  }

  encodeObjectKey(objectKey) {
    return objectKey
      .split("/")
      .map((segment) => this.awsEncode(segment))
      .join("/");
  }

  awsEncode(value) {
    return encodeURIComponent(String(value)).replace(
      /[!'()*]/g,
      (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
    );
  }

  normalizeHeaderValue(value) {
    return String(value)
      .trim()
      .replace(/[\t ]+/g, " ");
  }

  validateHeaderName(name) {
    if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name)) {
      throw new Error(`Invalid header name: ${name}`);
    }
  }

  validateHeaderValue(name, value) {
    if (/[\r\n]/.test(value)) {
      throw new Error(`Header value for ${name} cannot contain line breaks.`);
    }
  }

  toAmzDate(date) {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  }

  bytesToHex(bytes) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  displayURL(url, expirationSeconds, method) {
    const resultDiv = this.container.querySelector("#url-result");
    const expiresAt = new Date(Date.now() + expirationSeconds * 1000);

    resultDiv.innerHTML = `
      <div class="space-y-4">
        <div class="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
          <p class="text-sm text-green-700 dark:text-green-300 font-semibold mb-2">✓ AWS SigV4 pre-signed URL generated successfully</p>
          <p class="text-xs text-green-600 dark:text-green-400">Expires: ${this.escapeHtml(expiresAt.toLocaleString())}</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">Generated URL:</span>
            <button class="text-xs text-blue-600 dark:text-blue-400 hover:underline" data-copy-url>Copy</button>
          </div>
          <div class="font-mono text-xs text-gray-800 dark:text-gray-200 break-all bg-gray-50 dark:bg-gray-900 p-2 rounded">${this.escapeHtml(url)}</div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><span class="text-gray-600 dark:text-gray-400">Valid for:</span><span class="ml-2 font-semibold text-gray-900 dark:text-white">${this.escapeHtml(this.formatDuration(expirationSeconds))}</span></div>
          <div><span class="text-gray-600 dark:text-gray-400">Method:</span><span class="ml-2 font-semibold text-gray-900 dark:text-white">${this.escapeHtml(method)}</span></div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">Usage:</p>
          <div class="bg-gray-50 dark:bg-gray-900 rounded p-2"><code class="text-xs text-gray-800 dark:text-gray-200 break-all">${this.escapeHtml(this.getUsageExample(url, method))}</code></div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30" data-action="test-url">Test URL</button>
          <button class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-copy-url>Copy to Clipboard</button>
        </div>
      </div>
    `;

    const copyButtons = resultDiv.querySelectorAll("[data-copy-url]");
    copyButtons.forEach((button) => {
      button.dataset.copyUrl = url;
    });

    resultDiv
      .querySelector('[data-action="test-url"]')
      .addEventListener("click", () => {
        window.open(url, "_blank", "noopener,noreferrer");
      });
  }

  formatDuration(seconds) {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  }

  getUsageExample(url, method) {
    if (method === "GET") return `curl "${url}"`;
    if (method === "PUT") return `curl -X PUT -T file.pdf "${url}"`;
    if (method === "DELETE") return `curl -X DELETE "${url}"`;
    return `curl -I "${url}"`;
  }

  addToHistory(item) {
    this.urlHistory.unshift(item);
    if (this.urlHistory.length > 5) this.urlHistory.pop();
    this.updateHistoryDisplay();
  }

  updateHistoryDisplay() {
    const historyDiv = this.container.querySelector("#url-history");
    if (this.urlHistory.length === 0) {
      historyDiv.innerHTML =
        '<div class="text-gray-500 dark:text-gray-400 text-sm">No URLs generated yet</div>';
      return;
    }

    historyDiv.innerHTML = this.urlHistory
      .map(
        (item) => `
      <div class="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
        <div class="flex justify-between items-start gap-2">
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-gray-900 dark:text-white break-all">${this.escapeHtml(item.bucket)}/${this.escapeHtml(item.objectKey)}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">${this.escapeHtml(item.method)} • ${this.escapeHtml(this.formatDuration(item.expiration))} • ${this.escapeHtml(new Date(item.timestamp).toLocaleTimeString())}</div>
          </div>
          <button class="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-2" data-copy-url>Copy</button>
        </div>
      </div>
    `,
      )
      .join("");

    const copyButtons = historyDiv.querySelectorAll("[data-copy-url]");
    copyButtons.forEach((button, index) => {
      button.dataset.copyUrl = this.urlHistory[index].url;
    });
  }

  getCustomHeaders() {
    return this.customHeaders.map((header) => ({ ...header }));
  }

  addCustomHeader() {
    const nameInput = this.container.querySelector("#s3-header-name");
    const valueInput = this.container.querySelector("#s3-header-value");
    const name = nameInput.value.trim().toLowerCase();
    const value = valueInput.value.trim();

    if (!name || !value) {
      this.showError("Enter both a header name and value.");
      return;
    }

    if (name === "host") {
      this.showError(
        "Host is generated automatically and cannot be added manually.",
      );
      return;
    }

    try {
      this.validateHeaderName(name);
      this.validateHeaderValue(name, value);
    } catch (error) {
      this.showError(error.message);
      return;
    }

    const existingIndex = this.customHeaders.findIndex(
      (header) => header.name === name,
    );
    if (existingIndex >= 0) {
      this.customHeaders[existingIndex].value = value;
    } else {
      this.customHeaders.push({ name, value });
    }

    nameInput.value = "";
    valueInput.value = "";
    this.clearError();
    this.updateHeadersDisplay();
  }

  updateHeadersDisplay() {
    const list = this.container.querySelector("#headers-list");
    list.replaceChildren();

    this.customHeaders.forEach((header, index) => {
      const row = document.createElement("div");
      row.className =
        "flex justify-between items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded";

      const text = document.createElement("span");
      text.className = "text-sm text-gray-700 dark:text-gray-300 break-all";
      const strong = document.createElement("strong");
      strong.textContent = `${header.name}: `;
      text.appendChild(strong);
      text.appendChild(document.createTextNode(header.value));

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className =
        "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        this.customHeaders.splice(index, 1);
        this.updateHeadersDisplay();
      });

      row.appendChild(text);
      row.appendChild(remove);
      list.appendChild(row);
    });
  }

  async copyToClipboard(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      const originalText = button.textContent;
      button.textContent = "Copied!";
      button.classList.add("text-green-600", "dark:text-green-400");
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("text-green-600", "dark:text-green-400");
      }, 2000);
    } catch {
      this.showError("Unable to copy to clipboard.");
    }
  }

  clear() {
    this.container.querySelector("#bucket-name").value = "";
    this.container.querySelector("#object-key").value = "";
    this.container.querySelector("#access-key").value = "";
    this.container.querySelector("#secret-key").value = "";
    this.container.querySelector("#session-token").value = "";
    this.container.querySelector("#expiration-value").value = "15";
    this.container.querySelector("#expiration-unit").value = "minutes";
    this.container.querySelector("#content-type").value = "";
    this.container.querySelector("#content-disposition").value = "";
    this.container.querySelector("#use-path-style").checked = false;
    this.container.querySelector("#add-headers").checked = false;
    this.container.querySelector("#custom-headers").classList.add("hidden");
    this.container.querySelector("#s3-header-name").value = "";
    this.container.querySelector("#s3-header-value").value = "";
    this.customHeaders = [];
    this.updateHeadersDisplay();
    this.container.querySelector("#url-result").innerHTML =
      '<div class="text-gray-500 dark:text-gray-400 text-center py-8">Configure settings and click "Generate URL" to create a pre-signed URL</div>';
    this.clearError();
  }

  showError(message) {
    const errorDiv = this.container.querySelector("[data-error]");
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");
  }

  clearError() {
    const errorDiv = this.container.querySelector("[data-error]");
    errorDiv.textContent = "";
    errorDiv.classList.add("hidden");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
  }
}
