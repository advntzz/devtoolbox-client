export class JSONValidatorTool {
  constructor() {
    this.container = null;
    this.input = null;
    this.output = null;
    this.errorBox = null;
    this.status = null;
    this.fileInput = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.attachEventListeners();
    this.validate();
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <div class="flex flex-wrap items-center gap-3 mb-2">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">JSON Validator</h1>
            <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              Client-side
            </span>
          </div>
          <p class="text-gray-600 dark:text-gray-400">
            Validate JSON syntax locally in your browser with clear error details.
          </p>
        </div>

        <div class="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            data-action="validate"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Validate
          </button>

          <button
            type="button"
            data-action="format"
            class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Format
          </button>

          <button
            type="button"
            data-action="minify"
            class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Minify
          </button>

          <button
            type="button"
            data-action="copy"
            class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Copy
          </button>

          <button
            type="button"
            data-action="download"
            class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Download
          </button>

          <button
            type="button"
            data-action="clear"
            class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Clear
          </button>

          <label class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            Upload JSON
            <input type="file" accept=".json,application/json,text/json" data-file-input class="hidden">
          </label>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <section class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
            <div class="flex items-center justify-between gap-3 mb-3">
              <label for="json-validator-input" class="text-lg font-semibold text-gray-900 dark:text-white">
                JSON Input
              </label>
              <button
                type="button"
                data-action="sample"
                class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Load sample
              </button>
            </div>

            <textarea
              id="json-validator-input"
              spellcheck="false"
              class="w-full min-h-[520px] px-4 py-3 font-mono text-sm leading-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              placeholder='Paste JSON here, for example: {"name":"John","age":30}'></textarea>

            <div class="flex flex-wrap justify-between gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span data-input-stats>0 characters · 0 lines</span>
              <span>Validation runs locally in your browser.</span>
            </div>
          </section>

          <section class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Validation Result</h2>
              <span data-status class="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                Waiting
              </span>
            </div>

            <div data-error class="hidden mb-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
            </div>

            <div data-success class="hidden mb-4 p-4 rounded-lg border border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
              <div class="font-semibold mb-1">Valid JSON</div>
              <div data-success-details></div>
            </div>

            <pre
              data-output
              class="w-full min-h-[420px] max-h-[620px] overflow-auto p-4 font-mono text-sm leading-6 whitespace-pre-wrap break-words bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg"
            ></pre>

            <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
              The result is generated from the parsed JSON value and is never executed as HTML.
            </div>
          </section>
        </div>

        <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
          <h2 class="font-semibold text-blue-900 dark:text-blue-200 mb-2">JSON Validation</h2>
          <p class="text-sm text-blue-800 dark:text-blue-300">
            This validator uses the browser's native JSON parser. It checks syntax only;
            it does not validate a custom JSON Schema or application-specific fields.
          </p>
        </div>
      </div>
    `;

    this.input = this.container.querySelector("#json-validator-input");
    this.output = this.container.querySelector("[data-output]");
    this.errorBox = this.container.querySelector("[data-error]");
    this.status = this.container.querySelector("[data-status]");
    this.fileInput = this.container.querySelector("[data-file-input]");
  }

  attachEventListeners() {
    this.input.addEventListener("input", () => {
      this.updateInputStats();
      this.validate();
    });

    this.container
      .querySelector('[data-action="validate"]')
      .addEventListener("click", () => {
        this.validate();
      });

    this.container
      .querySelector('[data-action="format"]')
      .addEventListener("click", () => {
        this.transform(true);
      });

    this.container
      .querySelector('[data-action="minify"]')
      .addEventListener("click", () => {
        this.transform(false);
      });

    this.container
      .querySelector('[data-action="copy"]')
      .addEventListener("click", () => {
        this.copyResult();
      });

    this.container
      .querySelector('[data-action="download"]')
      .addEventListener("click", () => {
        this.downloadResult();
      });

    this.container
      .querySelector('[data-action="clear"]')
      .addEventListener("click", () => {
        this.clear();
      });

    this.container
      .querySelector('[data-action="sample"]')
      .addEventListener("click", () => {
        this.input.value = this.getSample();
        this.updateInputStats();
        this.validate();
      });

    this.fileInput.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (file) this.loadFile(file);
    });

    this.updateInputStats();
  }

  validate() {
    const text = this.input.value;

    if (!text.trim()) {
      this.showWaiting();
      return { valid: false, empty: true };
    }

    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);

      this.errorBox.classList.add("hidden");
      this.container.querySelector("[data-success]").classList.remove("hidden");
      this.container.querySelector("[data-success-details]").textContent =
        `Parsed successfully · ${this.formatBytes(new Blob([text]).size)} input`;

      this.status.textContent = "Valid";
      this.status.className =
        "px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";

      this.output.textContent = formatted;
      return { valid: true, data: parsed, formatted };
    } catch (error) {
      this.showError(this.getParseError(error, text));
      this.output.textContent = "";
      return { valid: false, error };
    }
  }

  transform(pretty) {
    const result = this.validate();

    if (!result.valid) return;

    this.input.value = JSON.stringify(result.data, null, pretty ? 2 : 0);
    this.updateInputStats();
    this.validate();
  }

  getParseError(error, text) {
    const message = error instanceof Error ? error.message : "Invalid JSON.";
    const match = message.match(/position\s+(\d+)/i);

    if (!match) {
      return `Invalid JSON: ${message}`;
    }

    const position = Number(match[1]);
    const before = text.slice(0, position);
    const line = before.split("\n").length;
    const lastNewline = before.lastIndexOf("\n");
    const column = position - lastNewline;

    return `Invalid JSON: ${message} · Line ${line}, column ${column}.`;
  }

  showError(message) {
    const success = this.container.querySelector("[data-success]");
    success.classList.add("hidden");

    this.errorBox.textContent = message;
    this.errorBox.classList.remove("hidden");

    this.status.textContent = "Invalid";
    this.status.className =
      "px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  }

  showWaiting() {
    this.errorBox.classList.add("hidden");
    this.container.querySelector("[data-success]").classList.add("hidden");
    this.output.textContent = "";

    this.status.textContent = "Waiting";
    this.status.className =
      "px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  }

  updateInputStats() {
    const text = this.input.value;
    const lines = text ? text.split("\n").length : 0;
    const stats = this.container.querySelector("[data-input-stats]");
    stats.textContent = `${text.length.toLocaleString()} characters · ${lines.toLocaleString()} lines`;
  }

  async copyResult() {
    const result = this.validate();
    if (!result.valid) return;

    const text = this.output.textContent;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      this.flashAction("copy", "Copied");
    } catch (error) {
      console.error("Failed to copy JSON:", error);
    }
  }

  downloadResult() {
    const result = this.validate();
    if (!result.valid) return;

    const blob = new Blob([this.output.textContent], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "validated.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async loadFile(file) {
    try {
      const text = await file.text();
      this.input.value = text;
      this.updateInputStats();
      this.validate();
    } catch (error) {
      this.showError("Unable to read the selected JSON file.");
    } finally {
      this.fileInput.value = "";
    }
  }

  clear() {
    this.input.value = "";
    this.updateInputStats();
    this.showWaiting();
  }

  flashAction(action, label) {
    const button = this.container.querySelector(`[data-action="${action}"]`);
    if (!button) return;

    const original = button.textContent;
    button.textContent = label;

    setTimeout(() => {
      if (button.isConnected) button.textContent = original;
    }, 1200);
  }

  getSample() {
    return JSON.stringify(
      {
        name: "John Doe",
        age: 30,
        active: true,
        hobbies: ["reading", "coding"],
        address: {
          city: "New York",
          zip: 10001,
        },
      },
      null,
      2,
    );
  }

  formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  destroy() {}
}
