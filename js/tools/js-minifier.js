export class JavaScriptMinifierTool {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.errorDisplay = null;
    this.statusDisplay = null;
    this.statsDisplay = null;
    this.indentSelect = null;
    this.currentMode = 'beautify';
    this.autoTimer = null;
    this.maxInputLength = 2000000;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.cacheElements();
    this.attachEventListeners();
    this.loadExample();
    this.updateStats();
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto p-4 sm:p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">JavaScript Minifier / Beautifier</h1>
          <p class="text-gray-600 dark:text-gray-400">Process JavaScript locally in your browser with safe, client-side minification and formatting. No code is sent to a server.</p>
        </div>

        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-2">
            <button type="button" data-action="beautify" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Beautify</button>
            <button type="button" data-action="minify" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Minify</button>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <label for="js-minifier-indent" class="text-sm font-medium text-gray-700 dark:text-gray-300">Indent</label>
            <select id="js-minifier-indent" data-indent class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="2 spaces">2 spaces</option>
              <option value="4 spaces">4 spaces</option>
              <option value="tabs">Tabs</option>
            </select>
          </div>
        </div>

        <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded hidden" data-error></div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">JavaScript Input</h2>
              <div class="flex flex-wrap gap-2">
                <button type="button" data-action="load-example" class="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Load Example</button>
              </div>
            </div>

            <textarea
              data-input
              class="w-full min-h-[420px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
              spellcheck="false"
              aria-label="JavaScript input"
              placeholder="Paste JavaScript code here..."
            ></textarea>

            <div class="flex flex-wrap items-center gap-2 mt-4">
              <button type="button" data-action="copy" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Copy</button>
              <button type="button" data-action="download" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Download</button>
              <button type="button" data-action="clear" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Clear</button>
            </div>
          </section>

          <section class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Processed Output</h2>
            </div>

            <textarea
              data-output
              class="w-full min-h-[420px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
              spellcheck="false"
              readonly
              aria-label="JavaScript output"
            ></textarea>

            <div class="mt-4 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span data-stat="input-chars">Input: 0 chars</span>
              <span data-stat="output-chars">Output: 0 chars</span>
              <span data-stat="lines">Lines: 0 / 0</span>
              <span data-stat="reduction">Reduction: 0%</span>
            </div>
          </section>
        </div>

        <div class="mt-4 text-sm text-gray-600 dark:text-gray-400" data-status aria-live="polite"></div>

        <div class="mt-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl p-5">
          <h2 class="font-semibold text-gray-900 dark:text-white mb-2">Notes</h2>
          <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc pl-5">
            <li>Processing happens entirely in your browser.</li>
            <li>Private source code is never sent to a server.</li>
            <li>Beautify preserves valid JavaScript syntax and formatting options.</li>
            <li>Minify uses Terser for battle-tested, safe JavaScript compression.</li>
          </ul>
        </div>
      </div>
    `;
  }

  cacheElements() {
    this.inputArea = this.container.querySelector('[data-input]');
    this.outputArea = this.container.querySelector('[data-output]');
    this.errorDisplay = this.container.querySelector('[data-error]');
    this.statusDisplay = this.container.querySelector('[data-status]');
    this.indentSelect = this.container.querySelector('[data-indent]');
    this.statsDisplay = {
      inputChars: this.container.querySelector('[data-stat="input-chars"]'),
      outputChars: this.container.querySelector('[data-stat="output-chars"]'),
      lines: this.container.querySelector('[data-stat="lines"]'),
      reduction: this.container.querySelector('[data-stat="reduction"]'),
    };
  }

  attachEventListeners() {
    this.container.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;

      const action = button.dataset.action;
      if (action === 'beautify') this.setMode('beautify').then(() => this.processCurrentMode());
      if (action === 'minify') this.setMode('minify').then(() => this.processCurrentMode());
      if (action === 'copy') this.copy();
      if (action === 'download') this.download();
      if (action === 'clear') this.clear();
      if (action === 'load-example') this.loadExample();
    });

    this.indentSelect.addEventListener('change', () => {
      if (this.currentMode === 'beautify') {
        this.processCurrentMode();
      }
    });

    this.inputArea.addEventListener('input', () => {
      this.clearError();
      this.updateStats();
      clearTimeout(this.autoTimer);
      this.autoTimer = setTimeout(() => {
        this.processCurrentMode();
      }, 400);
    });
  }

  async setMode(mode) {
    this.currentMode = mode;
    const beautifyBtn = this.container.querySelector('[data-action="beautify"]');
    const minifyBtn = this.container.querySelector('[data-action="minify"]');

    if (beautifyBtn) {
      beautifyBtn.className = mode === 'beautify'
        ? 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        : 'px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    }

    if (minifyBtn) {
      minifyBtn.className = mode === 'minify'
        ? 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        : 'px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    }
  }

  async processCurrentMode() {
    const input = this.inputArea.value;
    if (!input.trim()) {
      this.outputArea.value = '';
      this.clearError();
      this.updateStats();
      this.setStatus('Enter JavaScript to process.');
      return;
    }

    if (input.length > this.maxInputLength) {
      this.showError('Input is too large for browser-side processing. Please reduce the size and try again.');
      return;
    }

    try {
      if (this.currentMode === 'beautify') {
        const result = await this.beautifyCode(input, { indent: this.indentSelect.value });
        this.outputArea.value = result;
        this.setStatus('JavaScript beautified successfully.');
      } else {
        const result = await this.minifyCode(input);
        this.outputArea.value = result;
        this.setStatus('JavaScript minified successfully.');
      }
      this.clearError();
      this.updateStats();
    } catch (error) {
      this.outputArea.value = '';
      this.showError(this.getUserFriendlyError(error));
      this.setStatus('Could not process this JavaScript input.');
      this.updateStats();
    }
  }

  getUserFriendlyError(error) {
    const message = error && error.message ? error.message : String(error || 'Unknown error');
    const hints = [
      'Unexpected token',
      'Unexpected end',
      'Invalid or unexpected token',
      'Unexpected identifier',
      'Unexpected character',
      'Unterminated string',
      'Unterminated template',
      'Malformed',
      'Invalid syntax',
      'Missing',
    ];

    const matched = hints.find((hint) => message.toLowerCase().includes(hint.toLowerCase()));
    if (matched) {
      return `JavaScript syntax error: ${message.replace(/\s*at .*$/i, '')}. Please check the code and try again.`;
    }

    return 'Invalid JavaScript syntax. Check for unclosed braces, strings, comments, or regex literals and try again.';
  }

  async beautifyCode(source, options = {}) {
    if (!source || !source.trim()) return '';

    const { minify } = await import('terser');
    const indentValue = options.indent || '2 spaces';
    const indentLevel = indentValue === '4 spaces' || indentValue === 'tabs' ? 4 : 2;

    const result = await minify(source, {
      compress: false,
      mangle: false,
      format: {
        beautify: true,
        comments: true,
        semicolons: true,
        indent_level: indentLevel,
      },
    });

    if (result.error) {
      throw result.error;
    }

    const formatted = result.code || source;
    return indentValue === 'tabs' ? this.convertLeadingSpacesToTabs(formatted) : formatted;
  }

  async minifyCode(source) {
    if (!source || !source.trim()) return '';

    const { minify } = await import('terser');
    const result = await minify(source, {
      compress: true,
      mangle: true,
      format: {
        comments: false,
      },
    });

    if (result.error) {
      throw result.error;
    }

    return result.code || source;
  }

  convertLeadingSpacesToTabs(text) {
    return text
      .split('\n')
      .map((line) => {
        const match = line.match(/^( +)/);
        if (!match) return line;

        const leadingSpaces = match[1];
        const tabs = leadingSpaces.replace(/ {4}/g, '\t');
        return line.replace(/^( +)/, tabs);
      })
      .join('\n');
  }

  async copy() {
    const output = this.outputArea.value || this.inputArea.value;
    if (!output) {
      this.setStatus('Nothing to copy yet.');
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      this.setStatus('Copied to clipboard.');
    } catch (error) {
      this.outputArea.focus();
      this.outputArea.select();
      document.execCommand('copy');
      this.setStatus('Copied to clipboard.');
    }
  }

  download() {
    const output = this.outputArea.value || this.inputArea.value;
    if (!output) {
      this.setStatus('Nothing to download yet.');
      return;
    }

    const blob = new Blob([output], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'javascript-output.js';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    this.setStatus('Download started.');
  }

  clear() {
    this.inputArea.value = '';
    this.outputArea.value = '';
    this.clearError();
    this.setStatus('Input cleared.');
    this.updateStats();
  }

  loadExample() {
    const example = `const users = [
  { id: 1, name: 'Alice', active: true },
  { id: 2, name: 'Bob', active: false }
];

const activeUsers = users
  .filter((user) => user.active)
  .map(({ name }) => ({ name, message: \`Hello ${name}!\` }));

export function formatUsers() {
  return activeUsers.map((user) => {
    const pattern = /hello/i;
    return user.message.replace(pattern, 'Hi');
  });
}
`;

    this.inputArea.value = example;
    this.setMode('beautify');
    this.processCurrentMode();
  }

  showError(message) {
    if (!this.errorDisplay) return;
    this.errorDisplay.textContent = message;
    this.errorDisplay.classList.remove('hidden');
  }

  clearError() {
    if (!this.errorDisplay) return;
    this.errorDisplay.textContent = '';
    this.errorDisplay.classList.add('hidden');
  }

  setStatus(message) {
    if (!this.statusDisplay) return;
    this.statusDisplay.textContent = message;
  }

  updateStats() {
    const input = this.inputArea.value || '';
    const output = this.outputArea.value || '';

    const inputChars = input.length;
    const outputChars = output.length;
    const inputLines = input ? input.split(/\r?\n/).length : 0;
    const outputLines = output ? output.split(/\r?\n/).length : 0;

    const reduction = inputChars > 0 ? Math.max(0, ((inputChars - outputChars) / inputChars) * 100) : 0;

    if (this.statsDisplay.inputChars) {
      this.statsDisplay.inputChars.textContent = `Input: ${inputChars} chars`;
    }
    if (this.statsDisplay.outputChars) {
      this.statsDisplay.outputChars.textContent = `Output: ${outputChars} chars`;
    }
    if (this.statsDisplay.lines) {
      this.statsDisplay.lines.textContent = `Lines: ${inputLines} / ${outputLines}`;
    }
    if (this.statsDisplay.reduction) {
      this.statsDisplay.reduction.textContent = `Reduction: ${reduction.toFixed(1)}%`;
    }
  }
}
