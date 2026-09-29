import { feedback } from "../utils/feedback.js";
import { formatBytes } from "../utils/common.js";
import { ToolEnhancements } from "../utils/tool-enhancements.js";

export class JSONFormatter {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.formatBtn = null;
    this.minifyBtn = null;
    this.copyBtn = null;
    this.clearBtn = null;
    this.downloadContainer = null;
    this.prettyPrintCheckbox = null;
    this.sortKeysCheckbox = null;
    this.errorDisplay = null;
    this.errorDiffView = null;
    this.errorDiffContent = null;
    this.errorOverlay = null;
    this.lastErrorLocation = null;
    this.formatTimeout = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <style>
        .json-error-line {
          font-family: 'Courier New', monospace;
          padding: 8px 12px;
          border-left: 3px solid transparent;
          white-space: pre-wrap;
          font-size: 14px;
          line-height: 1.4;
        }

        .json-error-line.error {
          background: #fef2f2;
          border-left-color: #ef4444;
        }

        .dark .json-error-line.error {
          background: #450a0a;
          border-left-color: #ef4444;
        }

        .json-error-line.context {
          background: #f9fafb;
        }

        .dark .json-error-line.context {
          background: #111827;
        }

        .json-error-line-number {
          display: inline-block;
          width: 40px;
          margin-right: 12px;
          text-align: right;
          color: #6b7280;
          font-weight: 500;
          user-select: none;
        }

        .json-error-indicator {
          color: #ef4444;
          font-weight: 700;
          margin-left: 4px;
        }

        .json-error-char {
          background: #fca5a5;
          border-radius: 2px;
          padding: 1px 2px;
        }

        .dark .json-error-char {
          background: #dc2626;
          color: white;
        }

        .json-suggestion {
          margin-top: 12px;
          padding: 12px;
          border: 1px solid #d1fae5;
          border-radius: 6px;
          background: #ecfdf5;
          font-size: 13px;
        }

        .dark .json-suggestion {
          border-color: #065f46;
          background: #064e3b;
        }

        .json-suggestion-title {
          margin-bottom: 4px;
          font-weight: 600;
          color: #065f46;
        }

        .dark .json-suggestion-title {
          color: #34d399;
        }

        .json-output .json-key { color: #2563eb; }
        .json-output .json-string { color: #059669; }
        .json-output .json-number { color: #d97706; }
        .json-output .json-boolean { color: #7c3aed; }
        .json-output .json-null { color: #dc2626; }

        .dark .json-output .json-key { color: #60a5fa; }
        .dark .json-output .json-string { color: #34d399; }
        .dark .json-output .json-number { color: #fbbf24; }
        .dark .json-output .json-boolean { color: #a78bfa; }
        .dark .json-output .json-null { color: #f87171; }
      </style>

      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <div class="flex flex-wrap items-center gap-3 mb-2">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              JSON Formatter
            </h1>
            <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              Client-side
            </span>
          </div>
          <p class="text-gray-600 dark:text-gray-400">
            Format, beautify, and minify JSON data directly in your browser.
          </p>
        </div>

        <div class="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-action="format"
          >
            Format JSON
          </button>

          <button
            type="button"
            class="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-action="minify"
          >
            Minify
          </button>

          <button
            type="button"
            class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-action="copy"
          >
            Copy Result
          </button>

          <div id="download-button-container" class="inline-flex"></div>

          <button
            type="button"
            class="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-action="clear"
          >
            Clear
          </button>
        </div>

        <div class="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              id="pretty-print"
              checked
              class="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-2"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              Pretty Print JSON
            </span>
          </label>

          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              id="sort-keys"
              class="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-2"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              Sort Keys Alphabetically
            </span>
          </label>
        </div>

        <div
          class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 hidden"
          data-error
        ></div>

        <div id="error-diff-view" class="hidden mb-6">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-750 rounded-t-lg">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                JSON Syntax Error Analysis
              </h3>
            </div>
            <div id="error-diff-content" class="p-0"></div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div class="flex items-center justify-between mb-2">
              <label
                for="json-input"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Input JSON
              </label>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                Paste JSON to preview
              </span>
            </div>

            <div class="relative">
              <textarea
                id="json-input"
                class="w-full h-96 p-4 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                placeholder='{"name":"John","age":30}'
                spellcheck="false"
              >{
  "example": "data",
  "number": 123,
  "nested": {
    "array": [1, 2, 3]
  }
}</textarea>
              <div
                class="absolute inset-0 pointer-events-none hidden"
                id="error-overlay"
              ></div>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label
                for="json-output"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Formatted Output
              </label>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                Read-only
              </span>
            </div>

            <pre
              id="json-output"
              class="json-output w-full h-96 p-4 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto whitespace-pre-wrap"
            ></pre>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span data-stat="chars">0 characters</span>
          <span data-stat="lines">0 lines</span>
          <span data-stat="size">0 bytes</span>
        </div>

        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p class="text-sm text-blue-800 dark:text-blue-300">
            JSON Formatter validates the input before formatting or minifying it.
            For dedicated syntax validation and detailed validation-only results,
            use the separate JSON Validator tool.
          </p>
        </div>
      </div>
    `;

    this.inputArea = this.container.querySelector("#json-input");
    this.outputArea = this.container.querySelector("#json-output");
    this.errorDisplay = this.container.querySelector("[data-error]");
    this.errorOverlay = this.container.querySelector("#error-overlay");
    this.errorDiffView = this.container.querySelector("#error-diff-view");
    this.errorDiffContent = this.container.querySelector("#error-diff-content");
    this.formatBtn = this.container.querySelector('[data-action="format"]');
    this.minifyBtn = this.container.querySelector('[data-action="minify"]');
    this.copyBtn = this.container.querySelector('[data-action="copy"]');
    this.clearBtn = this.container.querySelector('[data-action="clear"]');
    this.downloadContainer = this.container.querySelector(
      "#download-button-container",
    );
    this.prettyPrintCheckbox = this.container.querySelector("#pretty-print");
    this.sortKeysCheckbox = this.container.querySelector("#sort-keys");
  }

  attachEventListeners() {
    this.initializeEnhancements();

    this.formatBtn.addEventListener("click", () => this.format());
    this.minifyBtn.addEventListener("click", () => this.minify());
    this.copyBtn.addEventListener("click", () => this.copy());
    this.clearBtn.addEventListener("click", () => this.clear());

    this.inputArea.addEventListener("scroll", () => {
      if (this.lastErrorLocation && !this.errorOverlay.hidden) {
        this.showInlineError(this.lastErrorLocation, this.inputArea.value);
      }
    });

    this.inputArea.addEventListener("input", () => {
      this.updateStats();
      this.clearError();

      clearTimeout(this.formatTimeout);
      this.formatTimeout = setTimeout(() => {
        this.preview();
      }, 300);
    });

    this.inputArea.addEventListener("paste", () => {
      setTimeout(() => {
        this.updateStats();
        this.preview();
      }, 10);
    });

    this.prettyPrintCheckbox.addEventListener("change", () => {
      this.preview();
    });

    this.sortKeysCheckbox.addEventListener("change", () => {
      this.preview();
    });

    this.updateStats();
    this.preview();
  }

  initializeEnhancements() {
    ToolEnhancements.enhanceCheckbox(
      this.prettyPrintCheckbox,
      "Show formatted JSON with indentation and line breaks for easier reading",
    );

    ToolEnhancements.enhanceCheckbox(
      this.sortKeysCheckbox,
      "Sort object keys alphabetically before formatting",
    );

    ToolEnhancements.enhanceCopyButton(
      this.copyBtn,
      () => this.outputArea.textContent || this.inputArea.value,
      "Copy Result",
    );

    const downloadButton = ToolEnhancements.createDownloadButton(
      () => this.getFormattedOutput(),
      "formatted.json",
      "application/json",
      "Download JSON",
    );

    this.downloadContainer.appendChild(downloadButton);
  }

  preview() {
    const input = this.inputArea.value.trim();

    if (!input) {
      this.outputArea.textContent = "";
      this.clearError();
      return;
    }

    try {
      let parsed = JSON.parse(input);

      if (this.sortKeysCheckbox.checked) {
        parsed = this.sortObjectKeys(parsed);
      }

      const indent = this.prettyPrintCheckbox.checked ? 2 : 0;
      const formatted = JSON.stringify(parsed, null, indent);

      this.displayOutput(formatted);
      this.clearError();
    } catch (error) {
      const location = this.getErrorLocation(error.message, input);
      this.showInlineError(location, input);
      this.showErrorDiffView(location, input);
      this.outputArea.textContent = "";
    }
  }

  format() {
    const input = this.inputArea.value.trim();

    if (!input) {
      feedback.showToast("Please enter some JSON data", "warning");
      return;
    }

    try {
      let parsed = JSON.parse(input);

      if (this.sortKeysCheckbox.checked) {
        parsed = this.sortObjectKeys(parsed);
      }

      const indent = this.prettyPrintCheckbox.checked ? 2 : 0;
      const formatted = JSON.stringify(parsed, null, indent);

      this.displayOutput(formatted);
      this.inputArea.value = formatted;
      this.updateStats();
      this.clearError();
      feedback.showToast("JSON formatted successfully", "success");
    } catch (error) {
      this.handleParseError(error, input, "JSON formatting failed");
    }
  }

  minify() {
    const input = this.inputArea.value.trim();

    if (!input) {
      feedback.showToast("Please enter some JSON data", "warning");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);

      this.displayOutput(minified);
      this.inputArea.value = minified;
      this.updateStats();
      this.clearError();
      feedback.showToast("JSON minified successfully", "success");
    } catch (error) {
      this.handleParseError(error, input, "JSON minification failed");
    }
  }

  handleParseError(error, input, prefix) {
    const message = error instanceof Error ? error.message : String(error);
    const location = this.getErrorLocation(message, input);

    this.showInlineError(location, input);
    this.showErrorDiffView(location, input);
    this.outputArea.textContent = "";

    feedback.showToast(`${prefix}: ${message}`, "error");
  }

  async copy() {
    const output = this.outputArea.textContent || this.inputArea.value;

    if (!output.trim()) {
      feedback.showToast("Nothing to copy", "warning");
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      feedback.showToast("JSON copied to clipboard", "success");
    } catch (error) {
      console.error("Failed to copy JSON:", error);
      feedback.showToast("Failed to copy JSON", "error");
    }
  }

  clear() {
    clearTimeout(this.formatTimeout);

    this.inputArea.value = "";
    this.outputArea.textContent = "";
    this.lastErrorLocation = null;
    this.clearError();
    this.updateStats();
  }

  displayOutput(json) {
    const safeJson = this.escapeHtml(json);

    const highlighted = safeJson.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "json-number";

        if (/^"/.test(match)) {
          cls = /:\s*$/.test(match) ? "json-key" : "json-string";
        } else if (/^(true|false)$/.test(match)) {
          cls = "json-boolean";
        } else if (match === "null") {
          cls = "json-null";
        }

        return `<span class="${cls}">${match}</span>`;
      },
    );

    this.outputArea.innerHTML = highlighted;
  }

  showError(message) {
    this.errorDisplay.textContent = message;
    this.errorDisplay.hidden = false;
  }

  clearError() {
    this.errorDisplay.textContent = "";
    this.errorDisplay.hidden = true;
    this.errorOverlay.hidden = true;
    this.errorOverlay.innerHTML = "";
    this.errorDiffView.classList.add("hidden");
    this.errorDiffContent.innerHTML = "";
    this.lastErrorLocation = null;
  }

  updateStats() {
    const text = this.inputArea.value;
    const chars = text.length;
    const lines = text ? text.split("\n").length : 0;
    const bytes = new Blob([text]).size;

    this.container.querySelector('[data-stat="chars"]').textContent =
      `${chars.toLocaleString()} characters`;

    this.container.querySelector('[data-stat="lines"]').textContent =
      `${lines.toLocaleString()} lines`;

    this.container.querySelector('[data-stat="size"]').textContent =
      formatBytes(bytes);
  }

  getErrorLocation(errorMessage, jsonString) {
    let position = -1;
    let line = 1;
    let column = 1;

    const positionMatch = errorMessage.match(
      /(?:at position|position)\s+(\d+)/i,
    );

    if (positionMatch) {
      position = Number.parseInt(positionMatch[1], 10);
    }

    const lineColMatch = errorMessage.match(
      /(?:at\s+)?line\s+(\d+)\s+(?:column|col)\s+(\d+)/i,
    );

    if (lineColMatch) {
      line = Number.parseInt(lineColMatch[1], 10);
      column = Number.parseInt(lineColMatch[2], 10);
    } else if (position >= 0) {
      const safePosition = Math.min(position, jsonString.length);
      const before = jsonString.slice(0, safePosition);
      const newlineCount = (before.match(/\n/g) || []).length;

      line = newlineCount + 1;

      const lastNewline = before.lastIndexOf("\n");
      column = safePosition - lastNewline;
    }

    return {
      line,
      column,
      position,
      message: errorMessage,
    };
  }

  showInlineError(errorLocation, jsonString) {
    const { line, column, message } = errorLocation;
    this.lastErrorLocation = errorLocation;

    this.errorOverlay.innerHTML = "";
    this.errorOverlay.hidden = false;

    const lines = jsonString.split("\n");

    if (line < 1 || line > lines.length) {
      this.showError(`JSON error: ${message}`);
      return;
    }

    const textareaStyles = window.getComputedStyle(this.inputArea);
    const lineHeight = Number.parseFloat(textareaStyles.lineHeight) || 20;
    const fontSize = Number.parseFloat(textareaStyles.fontSize) || 14;
    const paddingTop = Number.parseFloat(textareaStyles.paddingTop) || 0;
    const paddingLeft = Number.parseFloat(textareaStyles.paddingLeft) || 0;
    const charWidth = fontSize * 0.6;

    const topPosition =
      paddingTop + (line - 1) * lineHeight - this.inputArea.scrollTop;
    const leftPosition = paddingLeft + Math.max(0, column - 1) * charWidth;

    const pointer = document.createElement("div");
    pointer.className = "error-pointer";
    pointer.style.position = "absolute";
    pointer.style.top = `${topPosition}px`;
    pointer.style.left = `${leftPosition}px`;
    pointer.title = `Line ${line}, Column ${column}: ${message}`;
    pointer.textContent = "▲";

    this.errorOverlay.appendChild(pointer);

    this.showError(`Error at line ${line}, column ${column}: ${message}`);
  }

  showErrorDiffView(errorLocation, jsonString) {
    const { line, column, message } = errorLocation;
    const lines = jsonString.split("\n");

    const contextBefore = 3;
    const contextAfter = 3;
    const startLine = Math.max(0, line - 1 - contextBefore);
    const endLine = Math.min(lines.length - 1, line - 1 + contextAfter);

    let diffHtml = "";

    for (let i = startLine; i <= endLine; i++) {
      const lineNumber = i + 1;
      const lineContent = lines[i] || "";
      const isErrorLine = lineNumber === line;
      const lineClass = isErrorLine ? "error" : "context";

      let displayContent = this.escapeHtml(lineContent);

      if (isErrorLine && column > 0) {
        const beforeError = this.escapeHtml(
          lineContent.substring(0, Math.max(0, column - 1)),
        );
        const errorChar = this.escapeHtml(
          lineContent.charAt(Math.max(0, column - 1)) || " ",
        );
        const afterError = this.escapeHtml(
          lineContent.substring(Math.max(0, column)),
        );

        displayContent = `${beforeError}<span class="json-error-char">${errorChar}</span>${afterError}`;

        if (column <= lineContent.length) {
          displayContent +=
            '<span class="json-error-indicator"> ← Error here</span>';
        }
      }

      diffHtml += `
        <div class="json-error-line ${lineClass}">
          <span class="json-error-line-number">${lineNumber}</span>${displayContent}
        </div>
      `;
    }

    const suggestions = this.getErrorSuggestions(
      message,
      lines[line - 1] || "",
      column,
    );

    if (suggestions.length > 0) {
      diffHtml += `
        <div class="json-suggestion">
          <div class="json-suggestion-title">💡 Possible fixes:</div>
          ${suggestions
            .map((suggestion) => `<div>• ${this.escapeHtml(suggestion)}</div>`)
            .join("")}
        </div>
      `;
    }

    this.errorDiffContent.innerHTML = diffHtml;
    this.errorDiffView.classList.remove("hidden");
  }

  getErrorSuggestions(errorMessage, errorLine, column) {
    const suggestions = [];
    const message = errorMessage.toLowerCase();

    if (message.includes("unexpected token")) {
      if (message.includes("'")) {
        suggestions.push(
          "Replace single quotes with double quotes - JSON requires double quotes for strings.",
        );
      }

      if (message.includes(",")) {
        suggestions.push(
          "Remove trailing commas - JSON does not allow trailing commas.",
        );
      }

      if (message.includes("}") || message.includes("]")) {
        suggestions.push(
          "Check for a missing comma before this closing bracket.",
        );
      }
    }

    if (
      message.includes("unexpected end") ||
      message.includes("unexpected end of json")
    ) {
      suggestions.push("Check for missing closing brackets: } or ].");
      suggestions.push(
        "Ensure every opened object and array is properly closed.",
      );
    }

    if (
      message.includes("property name") ||
      message.includes("double quoted")
    ) {
      suggestions.push(
        'Object property names must use double quotes, for example: {"name":"Dom"}.',
      );
    }

    if (errorLine) {
      if (errorLine.includes("//") || errorLine.includes("/*")) {
        suggestions.push(
          "Remove comments - standard JSON does not support comments.",
        );
      }

      if (/[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/.test(errorLine)) {
        suggestions.push("Add double quotes around unquoted property names.");
      }

      if (column > errorLine.length + 1) {
        suggestions.push(
          "Check the end of the line for a missing value, quote, comma, or bracket.",
        );
      }
    }

    if (suggestions.length === 0) {
      suggestions.push(
        "Check brackets, quotes, commas, and JSON property names around the reported location.",
      );
    }

    return suggestions;
  }

  sortObjectKeys(value) {
    if (Array.isArray(value)) {
      return value.map((item) => this.sortObjectKeys(item));
    }

    if (value !== null && typeof value === "object") {
      const sorted = {};

      Object.keys(value)
        .sort((a, b) => a.localeCompare(b))
        .forEach((key) => {
          sorted[key] = this.sortObjectKeys(value[key]);
        });

      return sorted;
    }

    return value;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text ?? "");
    return div.innerHTML;
  }

  getFormattedOutput() {
    const output = this.outputArea.textContent || this.inputArea.value;

    if (!output.trim()) {
      throw new Error("No content to download");
    }

    return output;
  }

  destroy() {
    clearTimeout(this.formatTimeout);
    this.formatTimeout = null;
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
  }
}
