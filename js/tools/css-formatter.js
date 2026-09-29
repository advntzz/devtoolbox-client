import * as csstree from "css-tree";
import { minify as minifyCss } from "csso";

export class CSSFormatterTool {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.status = null;
    this.stats = null;
    this.fileInput = null;
    this.indentMode = "2";
    this.lastOutput = "";
    this.autoFormatTimer = null;
    this.activeMode = "format";
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.cacheElements();
    this.attachEventListeners();
    this.updateStats();
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            CSS Formatter / Minifier
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Beautify, minify, validate, and download CSS directly in your browser.
          </p>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section class="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">CSS Input</h2>

              <div class="flex flex-wrap items-center gap-3">
                <label class="text-sm text-gray-600 dark:text-gray-300">
                  Indent
                  <select data-indent class="form-select ml-2">
                    <option value="2">2 spaces</option>
                    <option value="4">4 spaces</option>
                    <option value="tab">Tabs</option>
                  </select>
                </label>

                <label class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <input data-comments type="checkbox" checked>
                  Preserve comments
                </label>
              </div>
            </div>

            <textarea
              data-input
              class="form-textarea w-full min-h-[420px] font-mono text-sm"
              spellcheck="false"
              placeholder=".example{color:red;margin:0 1rem}@media (max-width:600px){.example{color:blue}}"
              aria-label="CSS input"
            ></textarea>

            <div class="flex flex-wrap gap-2 mt-4">
              <button data-action="format" class="btn btn-primary" type="button">Beautify</button>
              <button data-action="minify" class="btn" type="button">Minify</button>
              <button data-action="upload" class="btn" type="button">Upload CSS</button>
              <button data-action="clear" class="btn" type="button">Clear</button>
              <input data-file type="file" accept=".css,text/css" hidden>
            </div>

            <div class="flex flex-wrap justify-between gap-2 mt-3 text-sm">
              <span data-status class="text-gray-600 dark:text-gray-400" aria-live="polite"></span>
              <span data-stats class="text-gray-600 dark:text-gray-400"></span>
            </div>
          </section>

          <section class="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">CSS Output</h2>
              <div class="flex flex-wrap gap-2">
                <button data-action="copy" class="btn" type="button">Copy</button>
                <button data-action="download" class="btn" type="button">Download</button>
              </div>
            </div>

            <textarea
              data-output
              class="form-textarea w-full min-h-[420px] font-mono text-sm"
              spellcheck="false"
              readonly
              aria-label="CSS output"
              placeholder="Formatted or minified CSS will appear here..."
            ></textarea>

            <div class="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Processing happens locally in your browser.
            </div>
          </section>
        </div>
      </div>
    `;
  }

  cacheElements() {
    this.inputArea = this.container.querySelector("[data-input]");
    this.outputArea = this.container.querySelector("[data-output]");
    this.status = this.container.querySelector("[data-status]");
    this.stats = this.container.querySelector("[data-stats]");
    this.fileInput = this.container.querySelector("[data-file]");
    this.indentSelect = this.container.querySelector("[data-indent]");
    this.commentsCheckbox = this.container.querySelector("[data-comments]");
  }

  attachEventListeners() {
    this.container.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;

      if (action === "format") {
        this.setActiveMode("format");
        this.format();
      }

      if (action === "minify") {
        this.setActiveMode("minify");
        this.minify();
      }

        if (action === "upload") this.fileInput?.click();
        if (action === "clear") {
          this.clear();
          this.setActiveMode(null);
        }
        if (action === "copy") this.copy();
        if (action === "download") this.download();
      });
    });

    this.indentSelect?.addEventListener("change", () => {
      this.indentMode = this.indentSelect.value;

      if (this.inputArea.value.trim()) {
        if (this.activeMode === "minify") {
          this.minify();
        } else {
          this.format();
        }
      }
    });

    this.commentsCheckbox?.addEventListener("change", () => {
      if (this.inputArea.value.trim()) {
        if (this.activeMode === "minify") {
          this.minify();
        } else {
          this.format();
        }
      }
    });

    this.inputArea?.addEventListener("input", () => {
      this.clearStatus();

      // Jangan tampilkan output lama ketika input berubah.
      this.outputArea.value = "";
      this.lastOutput = "";
      this.updateStats();

      // Debounce agar parser tidak berjalan setiap karakter.
      clearTimeout(this.autoFormatTimer);

      const source = this.inputArea.value.trim();
      if (!source) return;

      this.autoFormatTimer = setTimeout(() => {
        if (this.activeMode === "minify") {
          this.minify();
        } else {
          this.format();
        }
      }, 450);
    });
  }

  setActiveMode(mode) {
    this.activeMode = mode || "format";
    const formatButton = this.container.querySelector('[data-action="format"]');

    const minifyButton = this.container.querySelector('[data-action="minify"]');

    const buttons = [formatButton, minifyButton].filter(Boolean);

    buttons.forEach((button) => {
      const isActive =
        (mode === "format" && button.dataset.action === "format") ||
        (mode === "minify" && button.dataset.action === "minify");

      button.classList.toggle("btn-primary", isActive);

      if (isActive) {
        button.setAttribute("aria-pressed", "true");
        button.classList.add("ring-2", "ring-blue-300");
      } else {
        button.setAttribute("aria-pressed", "false");
        button.classList.remove("ring-2", "ring-blue-300");
      }
    });
  }



  getIndentUnit() {
    if (this.indentMode === "tab") return "\t";
    return " ".repeat(Number(this.indentMode) || 2);
  }

  parseCSS(source) {
    let parseError = null;

    try {
      const ast = csstree.parse(source, {
        onParseError(error) {
          if (!parseError) parseError = error;
        },
      });

      if (parseError) {
        throw this.createParseError(parseError);
      }

      return ast;
    } catch (error) {
      throw this.createParseError(error);
    }
  }

  createParseError(error) {
    if (
      error instanceof Error &&
      error.message.startsWith("CSS parse error:")
    ) {
      return error;
    }

    const message = error?.rawMessage || error?.message || "Invalid CSS";

    const offset = Number.isFinite(error?.offset) ? error.offset : null;

    const location = offset !== null ? ` at character ${offset + 1}` : "";

    const wrapped = new Error(`CSS parse error${location}: ${message}`);

    wrapped.cause = error;
    return wrapped;
  }

  format() {
    const source = this.inputArea.value;

    if (!source.trim()) {
      this.outputArea.value = "";
      this.lastOutput = "";
      this.setStatus("Enter some CSS first.", "error");
      this.updateStats();
      return;
    }

    try {
      // Validate before formatting.
      this.parseCSS(source);

      const output = this.beautifyCSS(source, {
        indent: this.getIndentUnit(),
        preserveComments: this.commentsCheckbox?.checked !== false,
      });

      this.outputArea.value = output;
      this.lastOutput = output;

      this.setStatus("CSS formatted successfully.", "success");

      this.updateStats();
    } catch (error) {
      this.outputArea.value = "";
      this.lastOutput = "";

      this.setStatus(error.message || "Could not format CSS.", "error");

      this.updateStats();
    }
  }

  minify() {
    const source = this.inputArea.value;

    if (!source.trim()) {
      this.outputArea.value = "";
      this.lastOutput = "";
      this.setStatus("Enter some CSS first.", "error");
      this.updateStats();
      return;
    }

    try {
      this.parseCSS(source);

      const preserveComments = this.commentsCheckbox?.checked !== false;

      const result = minifyCss(source, {
        comments: preserveComments ? "exclamation" : false,
      });

      const output = result.css || "";

      this.outputArea.value = output;
      this.lastOutput = output;

      this.setStatus("CSS minified successfully.", "success");

      this.updateStats();
    } catch (error) {
      this.outputArea.value = "";
      this.lastOutput = "";

      this.setStatus(error.message || "Could not minify CSS.", "error");

      this.updateStats();
    }
  }

  beautifyCSS(source, options = {}) {
    const indent = options.indent ?? "  ";
    const preserveComments = options.preserveComments !== false;

    const input = String(source).replace(/\r\n?/g, "\n").trim();

    const output = [];

    let buffer = "";
    let depth = 0;
    let parenDepth = 0;
    let bracketDepth = 0;

    let quote = null;
    let escaped = false;

    let comment = false;
    let commentBuffer = "";

    const pushText = (text) => {
      const clean = text.replace(/\s+/g, " ").trim();

      if (clean) {
        buffer += clean;
      }
    };

    const flushStatement = () => {
      const statement = buffer.trim();

      if (!statement) return;

      output.push(`${indent.repeat(depth)}${statement};`);

      buffer = "";
    };

    const flushBeforeBlock = () => {
      const selector = buffer.trim();

      if (!selector) {
        buffer = "";
        return;
      }

      output.push(`${indent.repeat(depth)}${selector} {`);

      buffer = "";
    };

    const pushComment = (value) => {
      if (!preserveComments) return;

      const normalized = value
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((line) => line.trim())
        .join("\n");

      normalized.split("\n").forEach((line) => {
        output.push(`${indent.repeat(depth)}${line}`);
      });
    };

    for (let i = 0; i < input.length; i += 1) {
      const ch = input[i];
      const next = input[i + 1];

      // CSS comment mode.
      if (comment) {
        commentBuffer += ch;

        if (ch === "*" && next === "/") {
          commentBuffer += "/";
          i += 1;

          comment = false;

          pushComment(commentBuffer);
          commentBuffer = "";
        }

        continue;
      }

      // CSS string mode.
      if (quote) {
        buffer += ch;

        if (escaped) {
          escaped = false;
        } else if (ch === "\\") {
          escaped = true;
        } else if (ch === quote) {
          quote = null;
        }

        continue;
      }

      // Start comment.
      if (ch === "/" && next === "*") {
        if (buffer.trim()) {
          pushText(buffer);
          buffer = "";
        }

        comment = true;
        commentBuffer = "/*";

        i += 1;
        continue;
      }

      // Start string.
      if (ch === '"' || ch === "'") {
        quote = ch;
        buffer += ch;
        continue;
      }

      // Parentheses and brackets protect semicolons/braces.
      if (ch === "(") {
        parenDepth += 1;
        buffer += "(";
        continue;
      }

      if (ch === ")" && parenDepth > 0) {
        parenDepth -= 1;
        buffer = `${buffer.trimEnd()})`;
        continue;
      }

      if (ch === "[") {
        bracketDepth += 1;
        buffer += "[";
        continue;
      }

      if (ch === "]" && bracketDepth > 0) {
        bracketDepth -= 1;
        buffer = `${buffer.trimEnd()}]`;
        continue;
      }

      if (parenDepth > 0 || bracketDepth > 0) {
        if (/\s/.test(ch)) {
          if (buffer && !/\s$/.test(buffer)) {
            buffer += " ";
          }
        } else {
          buffer += ch;
        }

        continue;
      }

      // Opening block.
      if (ch === "{") {
        flushBeforeBlock();
        depth += 1;
        continue;
      }

      // Closing block.
      if (ch === "}") {
        if (buffer.trim()) {
          flushStatement();
        }

        depth = Math.max(0, depth - 1);

        output.push(`${indent.repeat(depth)}}`);

        continue;
      }

      // Declaration / at-rule terminator.
      if (ch === ";") {
        flushStatement();
        continue;
      }

      // Normalize whitespace outside protected contexts.
      if (ch === "\n" || ch === "\r" || ch === "\t" || ch === " ") {
        if (buffer && !/\s$/.test(buffer)) {
          buffer += " ";
        }

        continue;
      }

      buffer += ch;
    }

    if (comment) {
      throw new Error("CSS parse error: unterminated comment");
    }

    if (quote) {
      throw new Error("CSS parse error: unterminated string");
    }

    if (buffer.trim()) {
      output.push(`${indent.repeat(depth)}${buffer.trim()}`);
    }

    return output
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  async copy() {
    const text = this.outputArea.value;

    if (!text) {
      this.setStatus("Nothing to copy yet.", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);

      this.setStatus("Copied to clipboard.", "success");
    } catch {
      this.outputArea.select();

      document.execCommand("copy");

      this.setStatus("Copied to clipboard.", "success");

      this.outputArea.setSelectionRange(0, 0);
    }
  }

  download() {
    const text = this.outputArea.value;

    if (!text) {
      this.setStatus("Nothing to download yet.", "error");
      return;
    }

    const blob = new Blob([text], { type: "text/css;charset=utf-8" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "formatted.css";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    this.setStatus("CSS file downloaded.", "success");
  }

  clear() {
    clearTimeout(this.autoFormatTimer);
    this.autoFormatTimer = null;
    this.inputArea.value = "";
    this.outputArea.value = "";
    this.lastOutput = "";

    this.clearStatus();
    this.updateStats();

    this.inputArea.focus();
  }

  clearStatus() {
    if (!this.status) return;

    this.status.textContent = "";
    this.status.className = "text-gray-600 dark:text-gray-400";
  }

  setStatus(message, type = "info") {
    if (!this.status) return;

    this.status.textContent = message;

    if (type === "error") {
      this.status.className = "text-red-600 dark:text-red-400";
    } else if (type === "success") {
      this.status.className = "text-green-600 dark:text-green-400";
    } else {
      this.status.className = "text-gray-600 dark:text-gray-400";
    }
  }

  updateStats() {
    if (!this.stats) return;

    const input = this.inputArea?.value || "";
    const output = this.outputArea?.value || "";

    const inputBytes = new Blob([input]).size;
    const outputBytes = new Blob([output]).size;

    const ratio =
      inputBytes > 0 && outputBytes > 0
        ? `${Math.round((1 - outputBytes / inputBytes) * 100)}%`
        : "—";

    this.stats.textContent =
      `Input: ${input.length.toLocaleString()} chars • ` +
      `Output: ${output.length.toLocaleString()} chars • ` +
      `Change: ${ratio}`;
  }
}
