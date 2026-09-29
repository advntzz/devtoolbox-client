import { ToolTemplate } from "./tool-template.js";

export class WebhookTester extends ToolTemplate {
  constructor() {
    super();

    this.config = {
      name: "Webhook Payload Simulator",
      description: "Build and preview webhook requests locally in your browser",
      version: "2.0.0",
      author: "DevToolbox",
      category: "Developer Tools",
      keywords: [
        "webhook",
        "http",
        "api",
        "testing",
        "requests",
        "debug",
        "curl",
        "payload",
        "github",
        "stripe",
        "slack",
      ],
    };

    this.requests = [];
    this.maxRequests = 100;
    this.selectedRequestId = null;
    this.requestSequence = 0;
  }

  render() {
    this.container.innerHTML = `
      <div class="tool-container">
        <div class="tool-header">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ${this.escapeHtml(this.config.name)}
          </h1>
          <p class="text-gray-600 dark:text-gray-300">
            ${this.escapeHtml(this.config.description)}
          </p>
        </div>

        <div class="tool-body bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">

          <!-- Local simulator notice -->
          <div class="mb-6 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-lg p-4">
            <h3 class="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
              Local Simulator
            </h3>
            <p class="text-sm text-blue-800 dark:text-blue-200">
              This tool does not create a public webhook endpoint or send data to a server.
              Requests are generated and inspected locally in your browser.
            </p>
          </div>

          <!-- Request Builder -->
          <div class="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Request Builder
              </h3>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                Client-side only
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label for="test-method"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  HTTP Method
                </label>
                <select id="test-method"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="GET">GET</option>
                  <option value="POST" selected>POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                  <option value="HEAD">HEAD</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label for="test-path"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Request Path
                </label>
                <input type="text" id="test-path"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono"
                  placeholder="/webhooks/example"
                  value="/webhooks/test">
              </div>
            </div>

            <div class="mb-4">
              <label for="test-headers"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Request Headers
              </label>
              <textarea id="test-headers"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                rows="4">Content-Type: application/json
X-Webhook-Event: test
X-Custom-Header: test-value</textarea>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                One header per line: <code>Header-Name: Value</code>
              </p>
            </div>

            <div class="mb-4">
              <label for="test-body"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Request Body
              </label>
              <textarea id="test-body"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                rows="7">{
  "test": true,
  "timestamp": "${new Date().toISOString()}",
  "message": "Hello from Webhook Payload Simulator!"
}</textarea>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                data-action="send-test">
                Simulate Request
              </button>

              <button
                class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                data-action="clear-builder">
                Clear Builder
              </button>
            </div>
          </div>

          <!-- Presets -->
          <div class="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Webhook Presets
            </h3>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                class="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                data-tool="simulate-github">
                <span class="text-sm font-medium">GitHub Push</span>
              </button>

              <button
                class="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                data-tool="simulate-stripe">
                <span class="text-sm font-medium">Stripe Payment</span>
              </button>

              <button
                class="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                data-tool="simulate-slack">
                <span class="text-sm font-medium">Slack Event</span>
              </button>

              <button
                class="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                data-tool="simulate-custom">
                <span class="text-sm font-medium">Custom Event</span>
              </button>
            </div>
          </div>

          <!-- Request History -->
          <div class="mb-6">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Simulated Requests
                <span class="request-count text-gray-500 dark:text-gray-400">(0)</span>
              </h3>

              <div class="flex items-center gap-2">
                <button
                  class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  data-action="clear-all">
                  Clear All
                </button>

                <button
                  class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  data-action="export-har">
                  Export HAR
                </button>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto"
              id="requests-list">
              <div class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400 mb-2">
                  No simulated requests yet
                </p>
                <p class="text-sm text-gray-400 dark:text-gray-500">
                  Build a request or choose a preset to preview it here
                </p>
              </div>
            </div>
          </div>

          <!-- Request Detail -->
          <div class="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4" id="request-detail" hidden>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Request Details
              </h3>

              <button
                class="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md"
                data-action="close-detail"
                aria-label="Close request details">
                ×
              </button>
            </div>

            <div id="detail-content"
              class="text-sm text-gray-700 dark:text-gray-300"></div>
          </div>

          <!-- cURL Preview -->
          <div class="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                cURL Preview
              </h3>

              <button
                class="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                data-action="copy-curl"
                disabled>
                Copy
              </button>
            </div>

            <pre id="curl-preview"
              class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all text-gray-800 dark:text-gray-200">Simulate a request to generate a cURL preview.</pre>
          </div>

          <!-- About -->
          <div class="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-lg p-4">
            <h3 class="font-medium text-blue-900 dark:text-blue-100 mb-2">
              How it works
            </h3>
            <ul class="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• Builds webhook-style HTTP requests entirely in your browser.</li>
              <li>• Presets provide realistic example payloads for common services.</li>
              <li>• No public endpoint, server connection, or external request is required.</li>
              <li>• Request history stays in the current page session.</li>
            </ul>
          </div>

        </div>
      </div>
    `;
  }

  attachEventListeners() {
    this.container
      .querySelector('[data-action="send-test"]')
      .addEventListener("click", () => this.sendTestRequest());

    this.container
      .querySelector('[data-action="clear-builder"]')
      .addEventListener("click", () => this.clearBuilder());

    this.container
      .querySelector('[data-action="clear-all"]')
      .addEventListener("click", () => this.clearAllRequests());

    this.container
      .querySelector('[data-action="export-har"]')
      .addEventListener("click", () => this.exportHAR());

    this.container
      .querySelector('[data-action="close-detail"]')
      .addEventListener("click", () => {
        this.container.querySelector("#request-detail").hidden = true;
        this.selectedRequestId = null;
      });

    this.container
      .querySelector('[data-action="copy-curl"]')
      .addEventListener("click", () => this.copyCurl());

    this.container.querySelectorAll("[data-tool]").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.simulateWebhook(btn.dataset.tool),
      );
    });
  }

  sendTestRequest() {
    const method = this.container.querySelector("#test-method").value;
    const pathInput = this.container.querySelector("#test-path").value.trim();
    const bodyText = this.container.querySelector("#test-body").value;
    const headersText = this.container.querySelector("#test-headers").value;

    const path = this.normalizePath(pathInput);

    if (!path) {
      this.showError("Please enter a request path.");
      return;
    }

    let body = null;

    if (bodyText.trim()) {
      try {
        body = JSON.parse(bodyText);
      } catch (error) {
        this.showError(`Invalid JSON body: ${error.message}`);
        return;
      }
    }

    const headerResult = this.parseHeaders(headersText);

    if (headerResult.errors.length > 0) {
      this.showError(
        `Invalid header line${headerResult.errors.length > 1 ? "s" : ""}: ${headerResult.errors.join(", ")}`,
      );
      return;
    }

    const request = this.createRequest({
      method,
      path,
      headers: headerResult.headers,
      body,
      origin: "Custom",
    });

    this.addRequest(request);
  }

  parseHeaders(text) {
    const headers = {};
    const errors = [];

    const lines = String(text || "").split(/\r?\n/);

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) return;

      const colonIndex = trimmed.indexOf(":");

      if (colonIndex <= 0) {
        errors.push(String(index + 1));
        return;
      }

      const key = trimmed.slice(0, colonIndex).trim();
      const value = trimmed.slice(colonIndex + 1).trim();

      if (!key || !value) {
        errors.push(String(index + 1));
        return;
      }

      headers[key] = value;
    });

    return { headers, errors };
  }

  normalizePath(path) {
    if (!path) return "/";

    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path)) {
      try {
        const url = new URL(path);
        return `${url.pathname || "/"}${url.search}`;
      } catch {
        return null;
      }
    }

    return path.startsWith("/") ? path : `/${path}`;
  }

  createRequest({
    method,
    path,
    headers = {},
    body = null,
    origin = "Custom",
  }) {
    this.requestSequence += 1;

    return {
      id: `${Date.now()}-${this.requestSequence}`,
      timestamp: new Date().toISOString(),
      method,
      path,
      headers: { ...headers },
      body,
      query: this.extractQuery(path),
      ip: "Local simulator",
      origin,
    };
  }

  extractQuery(path) {
    try {
      const url = new URL(path, "https://devtoolbox.local");
      const query = {};

      url.searchParams.forEach((value, key) => {
        if (Object.prototype.hasOwnProperty.call(query, key)) {
          if (Array.isArray(query[key])) {
            query[key].push(value);
          } else {
            query[key] = [query[key], value];
          }
        } else {
          query[key] = value;
        }
      });

      return query;
    } catch {
      return {};
    }
  }

  addRequest(request) {
    this.requests.unshift(request);

    if (this.requests.length > this.maxRequests) {
      this.requests = this.requests.slice(0, this.maxRequests);
    }

    this.selectedRequestId = request.id;

    this.renderRequests();
    this.updateRequestCount();
    this.showRequestDetail(request);
    this.updateCurlPreview(request);
  }

  renderRequests() {
    const list = this.container.querySelector("#requests-list");

    if (this.requests.length === 0) {
      list.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400 mb-2">
            No simulated requests yet
          </p>
          <p class="text-sm text-gray-400 dark:text-gray-500">
            Build a request or choose a preset to preview it here
          </p>
        </div>
      `;
      return;
    }

    list.innerHTML = this.requests
      .map((req) => {
        const bodyPreview =
          req.body === null
            ? "No body"
            : this.truncate(JSON.stringify(req.body), 140);

        return `
        <button
          type="button"
          class="w-full text-left bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border border-gray-200 dark:border-gray-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-id="${this.escapeHtml(req.id)}">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              ${this.escapeHtml(req.method)}
            </span>

            <span class="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
              ${this.escapeHtml(req.path)}
            </span>

            <span class="text-sm text-gray-500 dark:text-gray-500">
              ${this.escapeHtml(new Date(req.timestamp).toLocaleTimeString())}
            </span>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Source: ${this.escapeHtml(req.origin)}</span>
            <span class="font-mono break-all">${this.escapeHtml(bodyPreview)}</span>
          </div>
        </button>
      `;
      })
      .join("");

    list.querySelectorAll("[data-id]").forEach((item) => {
      item.addEventListener("click", () => {
        const request = this.requests.find(
          (requestItem) => requestItem.id === item.dataset.id,
        );

        if (request) {
          this.selectedRequestId = request.id;
          this.showRequestDetail(request);
          this.updateCurlPreview(request);
        }
      });
    });
  }

  showRequestDetail(request) {
    const detail = this.container.querySelector("#request-detail");
    const content = this.container.querySelector("#detail-content");

    const queryHtml = Object.keys(request.query).length
      ? `
        <div class="mb-6">
          <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">
            Query Parameters
          </h4>
          <pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">${this.escapeHtml(
            JSON.stringify(request.query, null, 2),
          )}</pre>
        </div>
      `
      : "";

    const bodyHtml =
      request.body !== null
        ? `
        <div class="mb-6">
          <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">
            Body
          </h4>
          <pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">${this.escapeHtml(
            JSON.stringify(request.body, null, 2),
          )}</pre>
        </div>
      `
        : `
        <div class="mb-6">
          <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">
            Body
          </h4>
          <p class="italic text-gray-500 dark:text-gray-400">No body</p>
        </div>
      `;

    content.innerHTML = `
      <div class="mb-6">
        <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">
          General
        </h4>

        <div class="space-y-2">
          <div class="flex flex-wrap justify-between gap-2">
            <span class="text-gray-600 dark:text-gray-400">Method:</span>
            <span class="font-mono">${this.escapeHtml(request.method)}</span>
          </div>

          <div class="flex flex-wrap justify-between gap-2">
            <span class="text-gray-600 dark:text-gray-400">Path:</span>
            <span class="font-mono break-all">${this.escapeHtml(request.path)}</span>
          </div>

          <div class="flex flex-wrap justify-between gap-2">
            <span class="text-gray-600 dark:text-gray-400">Time:</span>
            <span>${this.escapeHtml(new Date(request.timestamp).toLocaleString())}</span>
          </div>

          <div class="flex flex-wrap justify-between gap-2">
            <span class="text-gray-600 dark:text-gray-400">Source:</span>
            <span>${this.escapeHtml(request.origin)}</span>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">
          Headers
        </h4>
        <pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">${this.escapeHtml(
          JSON.stringify(request.headers, null, 2),
        )}</pre>
      </div>

      ${queryHtml}
      ${bodyHtml}

      <div class="mb-2">
        <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">
          Raw Request
        </h4>
        <pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">${this.escapeHtml(
          this.formatRawRequest(request),
        )}</pre>
      </div>
    `;

    detail.hidden = false;
  }

  formatRawRequest(request) {
    let raw = `${request.method} ${request.path} HTTP/1.1\n`;
    raw += `Host: devtoolbox.local\n`;

    Object.entries(request.headers).forEach(([key, value]) => {
      raw += `${key}: ${value}\n`;
    });

    if (request.body !== null) {
      raw += `\n${JSON.stringify(request.body, null, 2)}`;
    }

    return raw;
  }

  updateCurlPreview(request) {
    const preview = this.container.querySelector("#curl-preview");
    const copyButton = this.container.querySelector(
      '[data-action="copy-curl"]',
    );

    if (!request) {
      preview.textContent = "Simulate a request to generate a cURL preview.";
      copyButton.disabled = true;
      return;
    }

    const curl = this.generateCurl(request);

    preview.textContent = curl;
    copyButton.disabled = false;
    copyButton.dataset.curl = curl;
  }

  generateCurl(request) {
    const baseUrl = `https://example.test${request.path}`;

    const parts = ["curl"];

    if (request.method !== "GET") {
      parts.push("-X", this.shellQuote(request.method));
    }

    Object.entries(request.headers).forEach(([key, value]) => {
      parts.push("-H", this.shellQuote(`${key}: ${value}`));
    });

    if (request.body !== null && !["GET", "HEAD"].includes(request.method)) {
      parts.push("--data-raw", this.shellQuote(JSON.stringify(request.body)));
    }

    parts.push(this.shellQuote(baseUrl));

    return parts.join(" ");
  }

  shellQuote(value) {
    return `'${String(value).replace(/'/g, `'\\''`)}'`;
  }

  async copyCurl() {
    const button = this.container.querySelector('[data-action="copy-curl"]');
    const curl = button.dataset.curl;

    if (!curl) return;

    await this.copyToClipboard(curl);

    const original = button.textContent;
    button.textContent = "Copied";

    setTimeout(() => {
      button.textContent = original;
    }, 1200);
  }

  clearBuilder() {
    this.container.querySelector("#test-method").value = "POST";
    this.container.querySelector("#test-path").value = "/webhooks/test";

    this.container.querySelector("#test-headers").value =
      `Content-Type: application/json
X-Webhook-Event: test
X-Custom-Header: test-value`;

    this.container.querySelector("#test-body").value = `{
  "test": true,
  "timestamp": "${new Date().toISOString()}",
  "message": "Hello from Webhook Payload Simulator!"
}`;

    this.showInfo("Request builder reset.");
  }

  clearAllRequests() {
    this.requests = [];
    this.selectedRequestId = null;

    const detail = this.container.querySelector("#request-detail");
    detail.hidden = true;

    this.renderRequests();
    this.updateRequestCount();
    this.updateCurlPreview(null);
  }

  updateRequestCount() {
    const count = this.container.querySelector(".request-count");

    if (count) {
      count.textContent = `(${this.requests.length})`;
    }
  }

  simulateWebhook(type) {
    let request;

    switch (type) {
      case "simulate-github":
        request = this.createRequest({
          method: "POST",
          path: "/webhooks/github",
          headers: {
            "Content-Type": "application/json",
            "X-GitHub-Event": "push",
            "X-GitHub-Delivery": this.randomId(),
          },
          body: {
            ref: "refs/heads/main",
            repository: {
              name: "example-repo",
              full_name: "user/example-repo",
            },
            pusher: {
              name: "developer",
              email: "developer@example.com",
            },
            commits: [
              {
                message: "Update README.md",
                author: {
                  name: "developer",
                  email: "developer@example.com",
                },
              },
            ],
          },
          origin: "GitHub",
        });
        break;

      case "simulate-stripe":
        request = this.createRequest({
          method: "POST",
          path: "/webhooks/stripe",
          headers: {
            "Content-Type": "application/json",
            "Stripe-Signature": `t=${Math.floor(Date.now() / 1000)},v1=${this.randomHex(32)}`,
          },
          body: {
            id: `evt_${this.randomId()}`,
            object: "event",
            type: "payment_intent.succeeded",
            data: {
              object: {
                id: `pi_${this.randomId()}`,
                amount: 2000,
                currency: "usd",
                status: "succeeded",
              },
            },
          },
          origin: "Stripe",
        });
        break;

      case "simulate-slack":
        request = this.createRequest({
          method: "POST",
          path: "/webhooks/slack",
          headers: {
            "Content-Type": "application/json",
            "X-Slack-Event-Type": "event_callback",
          },
          body: {
            type: "event_callback",
            event: {
              type: "message",
              channel: "C1234567890",
              user: "U1234567890",
              text: "Hello from Slack!",
              ts: String(Date.now() / 1000),
            },
          },
          origin: "Slack",
        });
        break;

      default:
        request = this.createRequest({
          method: "POST",
          path: "/webhooks/custom",
          headers: {
            "Content-Type": "application/json",
            "X-Custom-Header": "custom-value",
          },
          body: {
            event: "custom.event",
            data: {
              message: "Custom webhook test",
              timestamp: new Date().toISOString(),
            },
          },
          origin: "Custom",
        });
        break;
    }

    this.addRequest(request);
  }

  randomId() {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }

    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
  }

  randomHex(length = 32) {
    const bytes = new Uint8Array(Math.ceil(length / 2));

    if (globalThis.crypto?.getRandomValues) {
      globalThis.crypto.getRandomValues(bytes);
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, length);
    }

    return Array.from({ length }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
  }

  truncate(value, maxLength) {
    const text = String(value);

    return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
  }

  escapeHtml(value) {
    const text = String(value ?? "");

    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  showError(message) {
    this.showMessage(message, "error");
  }

  showInfo(message) {
    this.showMessage(message, "info");
  }

  showMessage(message, type = "info") {
    const existing = this.container.querySelector("[data-simulator-message]");

    if (existing) {
      existing.remove();
    }

    const styles =
      type === "error"
        ? "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200"
        : "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200";

    const wrapper = document.createElement("div");
    wrapper.dataset.simulatorMessage = "true";
    wrapper.className = `mb-6 border-l-4 rounded-lg p-4 ${styles}`;
    wrapper.textContent = message;

    const body = this.container.querySelector(".tool-body");

    if (body) {
      body.prepend(wrapper);
    }
  }

  exportHAR() {
    const entries = this.requests.map((req) => {
      const headers = Object.entries(req.headers).map(([name, value]) => ({
        name,
        value: String(value),
      }));

      const entry = {
        startedDateTime: req.timestamp,
        time: 0,
        request: {
          method: req.method,
          url: `https://example.test${req.path}`,
          httpVersion: "HTTP/1.1",
          headers,
          queryString: Object.entries(req.query).flatMap(([name, value]) => {
            const values = Array.isArray(value) ? value : [value];

            return values.map((item) => ({
              name,
              value: String(item),
            }));
          }),
          cookies: [],
          headersSize: -1,
          bodySize: req.body === null ? 0 : JSON.stringify(req.body).length,
        },
        response: {
          status: 200,
          statusText: "Simulated",
          httpVersion: "HTTP/1.1",
          headers: [],
          cookies: [],
          content: {
            size: 0,
            mimeType: "application/json",
            text: "",
          },
          redirectURL: "",
          headersSize: -1,
          bodySize: 0,
        },
        cache: {},
        timings: {
          send: 0,
          wait: 0,
          receive: 0,
        },
      };

      if (req.body !== null) {
        entry.request.postData = {
          mimeType:
            this.getHeaderValue(req.headers, "content-type") ||
            "application/json",
          text: JSON.stringify(req.body),
        };
      }

      return entry;
    });

    const har = {
      log: {
        version: "1.2",
        creator: {
          name: "DevToolbox Webhook Payload Simulator",
          version: this.config.version,
        },
        entries,
      },
    };

    const blob = new Blob([JSON.stringify(har, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `webhook-simulator-${Date.now()}.har`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  getHeaderValue(headers, targetName) {
    const target = targetName.toLowerCase();

    const entry = Object.entries(headers).find(
      ([name]) => name.toLowerCase() === target,
    );

    return entry ? entry[1] : "";
  }
}
  