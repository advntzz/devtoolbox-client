export class URLEncodeTool {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.errorDisplay = null;
    this.paramsContainer = null;
    this.paramsGrid = null;
    this.mode = "encode";
    this.processTimer = null;
    this.maxInputLength = 5 * 1024 * 1024;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);

    if (!this.container) {
      return;
    }

    this.render();
    this.attachEventListeners();
    this.process();
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            URL Encode/Decode
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Encode and decode URLs with support for query parameters
          </p>
        </div>

        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              data-mode="encode"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Encode
            </button>

            <button
              type="button"
              data-mode="decode"
              class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
"
            >
              Decode
            </button>

            <button
              type="button"
              data-mode="encodeComponent"
              class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Encode Component
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              data-action="upload"
              class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Upload
            </button>

            <button
              type="button"
              data-action="copy"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Copy
            </button>

            <button
              type="button"
              data-action="download"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Download
            </button>

            <button
  type="button"
  data-action="clear"
  class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
>
  Clear
</button>

            <input
              type="file"
              data-file-input
              accept=".txt,.url,text/plain"
              class="hidden"
            />
          </div>
        </div>

        <div
          data-error
          class="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded-lg mb-6"
          hidden
          role="alert"
        ></div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <div class="flex justify-between items-center mb-2">
              <label
                for="url-input"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Input
              </label>

              <span
                data-input-size
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                0 / 5 MB
              </span>
            </div>

            <textarea
              id="url-input"
              class="w-full h-44 p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              placeholder="Enter URL or text..."
              spellcheck="false"
              autocomplete="off"
            >https://example.com/search?q=hello world&lang=en</textarea>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label
                for="url-output"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Output
              </label>

              <span
                data-output-size
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                0 bytes
              </span>
            </div>

            <textarea
              id="url-output"
              class="w-full h-44 p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Result will appear here..."
              spellcheck="false"
              readonly
            ></textarea>
          </div>
        </div>

        <div
          id="query-params"
          class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          hidden
        >
          <div class="flex justify-between items-center gap-4 mb-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Query Parameters
            </h3>

            <span
              data-param-count
              class="text-xs text-gray-500 dark:text-gray-400"
            ></span>
          </div>

          <div class="space-y-2" id="params-grid"></div>
        </div>
      </div>
    `;

    this.inputArea = this.container.querySelector("#url-input");
    this.outputArea = this.container.querySelector("#url-output");
    this.errorDisplay = this.container.querySelector("[data-error]");
    this.paramsContainer = this.container.querySelector("#query-params");
    this.paramsGrid = this.container.querySelector("#params-grid");
    this.fileInput = this.container.querySelector("[data-file-input]");
    this.inputSize = this.container.querySelector("[data-input-size]");
    this.outputSize = this.container.querySelector("[data-output-size]");
    this.paramCount = this.container.querySelector("[data-param-count]");
  }

  attachEventListeners() {
    this.container.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        this.setMode(button.dataset.mode);
        this.process();
      });
    });

    this.container
      .querySelector('[data-action="upload"]')
      .addEventListener("click", () => {
        this.fileInput.click();
      });

    this.container
      .querySelector('[data-action="copy"]')
      .addEventListener("click", () => {
        this.copy();
      });

    this.container
      .querySelector('[data-action="download"]')
      .addEventListener("click", () => {
        this.download();
      });

    this.container
      .querySelector('[data-action="clear"]')
      .addEventListener("click", () => {
        this.clear();
      });

    this.fileInput.addEventListener("change", (event) => {
      this.handleFileUpload(event);
    });

    this.inputArea.addEventListener("input", () => {
      this.updateInputSize();

      clearTimeout(this.processTimer);

      this.processTimer = setTimeout(() => {
        this.process();
      }, 250);
    });
  }

  setMode(mode) {
    if (!["encode", "decode", "encodeComponent"].includes(mode)) {
      return;
    }

    this.mode = mode;

    this.container.querySelectorAll("[data-mode]").forEach((button) => {
      const active = button.dataset.mode === mode;

      if (active) {
        button.className =
          "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors";
      } else {
        btn.className =
          "px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors";
      }
    });
  }

  process() {
    const input = this.inputArea.value;

    this.updateInputSize();

    if (!input) {
      this.outputArea.value = "";
      this.updateOutputSize();
      this.hideQueryParams();
      this.clearError();
      return;
    }

    if (input.length > this.maxInputLength) {
      this.outputArea.value = "";
      this.updateOutputSize();
      this.hideQueryParams();
      this.showError("Input exceeds the 5 MB limit.");
      return;
    }

    try {
      let result = "";

      if (this.mode === "encode") {
        result = encodeURI(input);
        this.parseQueryParams(input);
      }

      if (this.mode === "decode") {
        result = decodeURI(input);
        this.parseQueryParams(result);
      }

      if (this.mode === "encodeComponent") {
        result = encodeURIComponent(input);
        this.hideQueryParams();
      }

      this.outputArea.value = result;
      this.updateOutputSize();
      this.clearError();
    } catch (error) {
      this.outputArea.value = "";
      this.updateOutputSize();
      this.hideQueryParams();

      const message =
        error instanceof Error ? error.message : "Invalid URL encoding";

      this.showError(`Failed to ${this.mode}: ${message}`);
    }
  }

  parseQueryParams(value) {
    try {
      const url = new URL(value);

      if (!url.search) {
        this.hideQueryParams();
        return;
      }

      const params = Array.from(url.searchParams.entries());

      if (params.length === 0) {
        this.hideQueryParams();
        return;
      }

      this.paramsGrid.innerHTML = params
        .map(
          ([key, parameterValue], index) => `
            <div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded">
              <div class="min-w-0">
                <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Parameter ${index + 1}
                </span>
                <span class="font-semibold text-gray-700 dark:text-gray-300 break-all">
                  ${this.escapeHtml(key)}
                </span>
              </div>

              <div class="min-w-0">
                <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Value
                </span>
                <span class="text-gray-900 dark:text-white font-mono text-sm break-all">
                  ${this.escapeHtml(parameterValue)}
                </span>
              </div>
            </div>
          `,
        )
        .join("");

      this.paramCount.textContent = `${params.length} parameter${params.length === 1 ? "" : "s"}`;

      this.paramsContainer.hidden = false;
    } catch {
      this.hideQueryParams();
    }
  }

  hideQueryParams() {
    this.paramsContainer.hidden = true;
    this.paramsGrid.innerHTML = "";
    this.paramCount.textContent = "";
  }

  async handleFileUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > this.maxInputLength) {
      this.showError("Selected file exceeds the 5 MB limit.");
      event.target.value = "";
      return;
    }

    try {
      const text = await file.text();

      if (text.length > this.maxInputLength) {
        this.showError("File content exceeds the 5 MB limit.");
        return;
      }

      this.inputArea.value = text;
      this.process();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to read file";

      this.showError(`Failed to read file: ${message}`);
    } finally {
      event.target.value = "";
    }
  }

  async copy() {
    const output = this.outputArea.value;

    if (!output) {
      this.showError("Nothing to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(output);

      const button = this.container.querySelector('[data-action="copy"]');
      const originalText = button.textContent;

      button.textContent = "Copied!";
      button.className =
        "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors";

      setTimeout(() => {
        button.textContent = originalText;
        button.className =
          "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors";
      }, 1500);
    } catch {
      this.showError("Unable to copy result. Please copy it manually.");
    }
  }

  download() {
    const output = this.outputArea.value;

    if (!output) {
      this.showError("Nothing to download.");
      return;
    }

    const blob = new Blob([output], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = this.getDownloadName();
    link.click();

    URL.revokeObjectURL(url);
  }

  getDownloadName() {
    if (this.mode === "encode") {
      return "encoded-url.txt";
    }

    if (this.mode === "decode") {
      return "decoded-url.txt";
    }

    return "encoded-component.txt";
  }

  clear() {
    clearTimeout(this.processTimer);

    this.inputArea.value = "";
    this.outputArea.value = "";

    this.updateInputSize();
    this.updateOutputSize();
    this.hideQueryParams();
    this.clearError();
  }

  updateInputSize() {
    if (!this.inputSize) {
      return;
    }

    const bytes = new Blob([this.inputArea.value]).size;
    this.inputSize.textContent = `${this.formatBytes(bytes)} / 5 MB`;
  }

  updateOutputSize() {
    if (!this.outputSize) {
      return;
    }

    const bytes = new Blob([this.outputArea.value]).size;
    this.outputSize.textContent = `${this.formatBytes(bytes)} output`;
  }

  formatBytes(bytes) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  showError(message) {
    this.errorDisplay.textContent = message;
    this.errorDisplay.hidden = false;
  }

  clearError() {
    this.errorDisplay.textContent = "";
    this.errorDisplay.hidden = true;
  }

  escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
  }
}
