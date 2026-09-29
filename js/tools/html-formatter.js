export class HTMLFormatter {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.status = null;
    this.indentSize = 2;
    this.lastOutput = "";
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
            HTML Formatter
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Format, minify, validate, and download HTML directly in your browser.
          </p>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section class="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">HTML Input</h2>
              <div class="flex flex-wrap gap-2">
                <label class="text-sm text-gray-600 dark:text-gray-300">
                  Indent
                  <select data-indent class="form-select ml-2">
                    <option value="2">2 spaces</option>
                    <option value="4">4 spaces</option>
                    <option value="tab">Tabs</option>
                  </select>
                </label>
              </div>
            </div>

            <textarea
              data-input
              class="form-textarea w-full min-h-[420px] font-mono text-sm"
              spellcheck="false"
              placeholder="Paste your HTML here..."
              aria-label="HTML input"
            ></textarea>

            <div class="flex flex-wrap gap-2 mt-4">
              <button data-action="format" class="btn btn-primary" type="button">Format</button>
              <button data-action="minify" class="btn" type="button">Minify</button>
              <button data-action="upload" class="btn" type="button">Upload HTML</button>
              <button data-action="clear" class="btn" type="button">Clear</button>
              <input data-file type="file" accept=".html,.htm,text/html" hidden>
            </div>

            <div class="flex flex-wrap justify-between gap-2 mt-3 text-sm">
              <span data-status class="text-gray-600 dark:text-gray-400" aria-live="polite"></span>
              <span data-stats class="text-gray-600 dark:text-gray-400"></span>
            </div>
          </section>

          <section class="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Formatted HTML</h2>
              <div class="flex flex-wrap gap-2">
                <button data-action="copy" class="btn btn-sm" type="button">Copy</button>
                <button data-action="download" class="btn btn-sm" type="button">Download</button>
              </div>
            </div>

            <textarea
              data-output
              class="form-textarea w-full min-h-[420px] font-mono text-sm"
              spellcheck="false"
              readonly
              aria-label="Formatted HTML output"
            ></textarea>

            <div class="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Output is generated locally in your browser.
            </div>
          </section>
        </div>

        <section class="mt-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl p-5">
          <h2 class="font-semibold text-gray-900 dark:text-white mb-2">HTML Formatter Notes</h2>
          <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc pl-5">
            <li>Formatting does not send your HTML to a server.</li>
            <li>Script and style contents are preserved as raw text.</li>
            <li>Minify removes formatting whitespace between tags without rewriting text nodes.</li>
          </ul>
        </section>
      </div>
    `;
  }

  cacheElements() {
    this.inputArea = this.container.querySelector("[data-input]");
    this.outputArea = this.container.querySelector("[data-output]");
    this.status = this.container.querySelector("[data-status]");
    this.stats = this.container.querySelector("[data-stats]");
    this.indentSelect = this.container.querySelector("[data-indent]");
    this.fileInput = this.container.querySelector("[data-file]");
  }

  attachEventListeners() {
    this.container.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button || !this.container.contains(button)) return;

      const action = button.dataset.action;
      if (action === "format") this.format();
      if (action === "minify") this.minify();
      if (action === "clear") this.clear();
      if (action === "copy") this.copy();
      if (action === "download") this.download();
      if (action === "upload") this.fileInput?.click();
    });

    this.inputArea.addEventListener("input", () => {
      this.updateStats();
      this.setStatus("");
    });

    this.indentSelect.addEventListener("change", () => {
      this.indentSize = this.indentSelect.value;
    });

    this.fileInput.addEventListener("change", async () => {
      const file = this.fileInput.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        this.setStatus("File is too large. Maximum size is 5 MB.", "error");
        this.fileInput.value = "";
        return;
      }

      try {
        this.inputArea.value = await file.text();
        this.updateStats();
        this.setStatus(`Loaded ${file.name}`, "success");
      } catch {
        this.setStatus("Could not read the selected file.", "error");
      } finally {
        this.fileInput.value = "";
      }
    });
  }

  getIndentUnit() {
    return this.indentSize === "tab"
      ? "\t"
      : " ".repeat(Number(this.indentSize));
  }

  format() {
    const input = this.inputArea.value;
    if (!input.trim()) {
      this.setStatus("Please enter some HTML first.", "warning");
      return;
    }

    const result = this.prettyPrint(input);
    this.outputArea.value = result;
    this.lastOutput = result;
    this.setStatus("HTML formatted successfully.", "success");
    this.updateStats();
  }

  minify() {
    const input = this.inputArea.value;
    if (!input.trim()) {
      this.setStatus("Please enter some HTML first.", "warning");
      return;
    }

    const result = this.minifyHTML(input);
    this.outputArea.value = result;
    this.lastOutput = result;
    this.setStatus("HTML minified successfully.", "success");
    this.updateStats();
  }

  clear() {
    this.inputArea.value = "";
    this.outputArea.value = "";
    this.lastOutput = "";
    this.setStatus("");
    this.updateStats();
  }

  async copy() {
    const output = this.outputArea.value || this.inputArea.value;
    if (!output) {
      this.setStatus("Nothing to copy.", "warning");
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      this.setStatus("HTML copied to clipboard.", "success");
    } catch {
      this.outputArea.select();
      document.execCommand("copy");
      this.setStatus("HTML copied to clipboard.", "success");
    }
  }

  download() {
    const output = this.outputArea.value || this.inputArea.value;
    if (!output) {
      this.setStatus("Nothing to download.", "warning");
      return;
    }

    const blob = new Blob([output], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "formatted.html";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    this.setStatus("HTML downloaded.", "success");
  }

  setStatus(message, type = "info") {
    if (!this.status) return;

    this.status.textContent = message;
    this.status.className = "text-sm";

    const classes = {
      success: ["text-green-600", "dark:text-green-400"],
      error: ["text-red-600", "dark:text-red-400"],
      warning: ["text-yellow-600", "dark:text-yellow-400"],
      info: ["text-gray-600", "dark:text-gray-400"],
    };

    this.status.classList.add(...(classes[type] || classes.info));
  }

  updateStats() {
    const text = this.inputArea?.value || "";
    const chars = text.length;
    const lines = text ? text.split(/\r?\n/).length : 0;
    const bytes = new Blob([text]).size;

    if (this.stats) {
      this.stats.textContent = `${chars.toLocaleString()} chars · ${lines.toLocaleString()} lines · ${bytes.toLocaleString()} bytes`;
    }
  }

  tokenize(html) {
    const tokens = [];
    let i = 0;

    while (i < html.length) {
      if (html.startsWith("<!--", i)) {
        const end = html.indexOf("-->", i + 4);
        const endIndex = end === -1 ? html.length : end + 3;
        tokens.push({ type: "comment", value: html.slice(i, endIndex) });
        i = endIndex;
        continue;
      }

      if (html[i] !== "<") {
        const next = html.indexOf("<", i);
        const end = next === -1 ? html.length : next;
        const value = html.slice(i, end);
        if (value) tokens.push({ type: "text", value });
        i = end;
        continue;
      }

      // Scan a tag until an unquoted >.
      let quote = null;
      let j = i + 1;

      for (; j < html.length; j++) {
        const char = html[j];

        if (quote) {
          if (char === quote) quote = null;
          continue;
        }

        if (char === '"' || char === "'") {
          quote = char;
        } else if (char === ">") {
          j++;
          break;
        }
      }

      if (j > html.length) j = html.length;

      const value = html.slice(i, j);
      const match = value.match(/^<\s*(\/?)\s*([^\s/>]+)/);

      if (!match) {
        tokens.push({ type: "text", value });
      } else {
        const closing = Boolean(match[1]);
        const name = match[2].toLowerCase();

        let type = "open";
        if (closing) type = "close";
        else if (/^!doctype$/i.test(name)) type = "doctype";
        else if (/^!/.test(name)) type = "declaration";
        else if (/^\\?/.test(name)) type = "processing";
        else if (/\/\s*>$/.test(value)) type = "self";

        tokens.push({ type, name, value });
      }

      i = j;
    }

    return tokens;
  }

  prettyPrint(html) {
    const tokens = this.tokenize(html);
    const indent = this.getIndentUnit();
    const voidElements = new Set([
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
    ]);

    const rawTextElements = new Set(["script", "style", "textarea"]);
    const inlineElements = new Set([
      "a",
      "abbr",
      "b",
      "bdi",
      "bdo",
      "cite",
      "code",
      "data",
      "del",
      "dfn",
      "em",
      "i",
      "ins",
      "kbd",
      "mark",
      "q",
      "s",
      "samp",
      "small",
      "span",
      "strong",
      "sub",
      "sup",
      "time",
      "u",
      "var",
    ]);

    const lines = [];
    let level = 0;
    let inlineBuffer = "";
    let rawTag = null;

    const flushInline = () => {
      const value = inlineBuffer.trim();
      if (value) lines.push(indent.repeat(level) + value);
      inlineBuffer = "";
    };

    const pushTag = (value, levelOverride = level) => {
      lines.push(indent.repeat(Math.max(0, levelOverride)) + value.trim());
    };

    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];

      if (
        token.type === "comment" ||
        token.type === "doctype" ||
        token.type === "declaration" ||
        token.type === "processing"
      ) {
        flushInline();
        pushTag(token.value);
        continue;
      }

      if (token.type === "open" || token.type === "self") {
        const isVoid = voidElements.has(token.name);
        const isInline = inlineElements.has(token.name);

        if (isInline) {
          inlineBuffer += (inlineBuffer ? " " : "") + token.value.trim();

          // If the next token is text/inline content, keep building the same line.
          if (token.type === "self" || isVoid) {
            flushInline();
          }
          continue;
        }

        flushInline();
        pushTag(token.value);

        if (token.type === "open" && !isVoid && !/\/\s*>$/.test(token.value)) {
          level++;
          rawTag = rawTextElements.has(token.name) ? token.name : null;
        }
        continue;
      }

      if (token.type === "close") {
        if (rawTag === token.name) rawTag = null;
        flushInline();
        level = Math.max(0, level - 1);
        pushTag(token.value);
        continue;
      }

      if (token.type === "text") {
        const value = token.value.replace(/\s+/g, " ").trim();
        if (!value) continue;

        if (rawTag) {
          // Raw text content must not be reformatted.
          flushInline();
          lines.push(indent.repeat(level) + token.value.trim());
        } else if (inlineBuffer) {
          inlineBuffer += ` ${value}`;
        } else {
          lines.push(indent.repeat(level) + value);
        }
      }
    }

    flushInline();
    return lines
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  minifyHTML(html) {
    // Remove BOM and normalize line endings.
    let result = html.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");

    // Remove HTML comments except conditional comments.
    result = result.replace(/<!--(?!\[if\b)[\s\S]*?-->/gi, "");

    // Remove whitespace between tags only.
    result = result.replace(/>\s+</g, "><");

    return result.trim();
  }
}
