export class XMLEscape {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.status = null;
    this.stats = null;
    this.mode = 'escape';
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
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">XML Escape / Unescape</h1>
          <p class="text-gray-600 dark:text-gray-400">Escape XML special characters or decode XML entities directly in your browser.</p>
        </div>

        <div class="mb-6 flex flex-wrap gap-2">
          <button data-mode="escape" data-action="mode" type="button" class="mode-button btn btn-primary">Escape XML</button>
          <button data-mode="unescape" data-action="mode" type="button" class="mode-button btn">Unescape XML</button>
          <button data-action="swap" type="button" class="btn">Swap</button>
          <button data-action="clear" type="button" class="btn">Clear</button>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section class="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
            <div class="flex items-center justify-between gap-3 mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Input</h2>
              <span data-mode-label class="text-sm text-gray-500 dark:text-gray-400">Escape mode</span>
            </div>

            <textarea data-input class="form-textarea w-full min-h-[420px] font-mono text-sm" spellcheck="false" placeholder="Enter XML or text here..." aria-label="XML input"></textarea>

            <div class="flex flex-wrap gap-2 mt-4">
              <button data-action="process" type="button" class="btn btn-primary">Escape</button>
              <button data-action="example" type="button" class="btn">Load Example</button>
            </div>

            <div class="flex flex-wrap justify-between gap-2 mt-3 text-sm">
              <span data-status class="text-gray-600 dark:text-gray-400" aria-live="polite"></span>
              <span data-stats class="text-gray-600 dark:text-gray-400"></span>
            </div>
          </section>

          <section class="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Output</h2>
              <div class="flex flex-wrap gap-2">
                <button data-action="copy" type="button" class="btn btn-sm">Copy</button>
                <button data-action="download" type="button" class="btn btn-sm">Download</button>
              </div>
            </div>

            <textarea data-output class="form-textarea w-full min-h-[420px] font-mono text-sm" spellcheck="false" readonly aria-label="XML output" placeholder="Result will appear here..."></textarea>

            <div class="mt-3 text-sm text-gray-500 dark:text-gray-400">Output is shown as plain text and is never rendered.</div>
          </section>
        </div>

        <section class="mt-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl p-5">
          <h2 class="font-semibold text-gray-900 dark:text-white mb-2">Notes</h2>
          <p class="text-sm text-gray-700 dark:text-gray-300">Escape mode handles &amp;, &lt;, &gt;, &quot;, and &#39;. Unescape decodes named and numeric XML character references. CDATA sections are preserved.</p>
        </section>

        <section class="mt-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
          <h2 class="font-semibold text-gray-900 dark:text-white mb-2">Examples</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <button type="button" data-example-value="<note><to>User</to><from>Dev</from><body>Tom &amp; Jerry</body></note>" class="example-button text-left p-3 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">Simple XML</button>
            <button type="button" data-example-value="<![CDATA[<raw>&not;escaped</raw>]]>" class="example-button text-left p-3 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">CDATA example</button>
            <button type="button" data-example-value="<tag attr=\"a&b\">Some 'text' &amp; chars</tag>" class="example-button text-left p-3 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">Attributes</button>
            <button type="button" data-example-value="&lt;root&gt;&amp;#65;&lt;/root&gt;" class="example-button text-left p-3 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">Encoded entities</button>
          </div>
        </section>
      </div>
    `;
  }

  cacheElements() {
    this.inputArea = this.container.querySelector('[data-input]');
    this.outputArea = this.container.querySelector('[data-output]');
    this.status = this.container.querySelector('[data-status]');
    this.stats = this.container.querySelector('[data-stats]');
    this.modeLabel = this.container.querySelector('[data-mode-label]');
    this.processButton = this.container.querySelector('[data-action="process"]');
  }

  attachEventListeners() {
    this.container.addEventListener('click', (event) => {
      const actionButton = event.target.closest('[data-action]');
      if (actionButton && this.container.contains(actionButton)) {
        const action = actionButton.dataset.action;
        if (action === 'mode') this.setMode(actionButton.dataset.mode);
        else if (action === 'process') this.process();
        else if (action === 'swap') this.swap();
        else if (action === 'clear') this.clear();
        else if (action === 'copy') this.copy();
        else if (action === 'download') this.download();
        else if (action === 'example') this.loadExample();
        return;
      }

      const exampleButton = event.target.closest('[data-example-value]');
      if (exampleButton && this.container.contains(exampleButton)) {
        this.inputArea.value = this.decodeAttributeValue(exampleButton.dataset.exampleValue);
        this.outputArea.value = '';
        this.clearStatus();
        this.updateStats();
      }
    });

    this.inputArea.addEventListener('input', () => {
      this.updateStats();
      this.clearStatus();
    });

    this.inputArea.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        this.process();
      }
    });
  }

  setMode(mode) {
    if (mode !== 'escape' && mode !== 'unescape') return;
    this.mode = mode;
    this.container.querySelectorAll('.mode-button').forEach((button) => {
      button.classList.toggle('btn-primary', button.dataset.mode === mode);
    });
    this.modeLabel.textContent = mode === 'escape' ? 'Escape mode' : 'Unescape mode';
    this.processButton.textContent = mode === 'escape' ? 'Escape' : 'Unescape';
    this.clearStatus();
  }

  process() {
    const input = this.inputArea.value;
    if (!input) {
      this.outputArea.value = '';
      this.setStatus('Please enter some text first.', 'warning');
      return;
    }

    const result = this.mode === 'escape' ? this.escapeXml(input) : this.unescapeXml(input);
    this.outputArea.value = result;
    this.setStatus(this.mode === 'escape' ? 'XML escaped successfully.' : 'XML unescaped successfully.', 'success');
    this.updateStats();
  }

  // Preserve CDATA sections while escaping/unescaping other parts
  splitByCdata(text) {
    const parts = [];
    let lastIndex = 0;
    const regex = /<!\[CDATA\[[\s\S]*?\]\]>/g;
    let m;
    while ((m = regex.exec(text)) !== null) {
      if (m.index > lastIndex) parts.push({ type: 'text', value: text.slice(lastIndex, m.index) });
      parts.push({ type: 'cdata', value: m[0] });
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < text.length) parts.push({ type: 'text', value: text.slice(lastIndex) });
    return parts;
  }

  escapeXml(value) {
    const parts = this.splitByCdata(value);
    const out = parts.map(part => {
      if (part.type === 'cdata') return part.value; // preserve CDATA
      // use text node to escape & < > " then replace ' with numeric entity
      const wrapper = document.createElement('div');
      wrapper.appendChild(document.createTextNode(part.value));
      return wrapper.innerHTML.replace(/'/g, '&#39;');
    });
    return out.join('');
  }

  unescapeXml(value) {
    const parts = this.splitByCdata(value);
    const out = parts.map(part => {
      if (part.type === 'cdata') return part.value;
      const textarea = document.createElement('textarea');
      textarea.innerHTML = part.value;
      return textarea.value;
    });
    return out.join('');
  }

  swap() {
    const input = this.inputArea.value;
    const output = this.outputArea.value;
    this.inputArea.value = output;
    this.outputArea.value = input;
    this.clearStatus();
    this.updateStats();
    this.inputArea.focus();
  }

  clear() {
    this.inputArea.value = '';
    this.outputArea.value = '';
    this.clearStatus();
    this.updateStats();
    this.inputArea.focus();
  }

  async copy() {
    const value = this.outputArea.value;
    if (!value) { this.setStatus('Nothing to copy.', 'warning'); return; }
    try { await navigator.clipboard.writeText(value); this.setStatus('Output copied to clipboard.', 'success'); }
    catch { this.outputArea.select(); document.execCommand('copy'); this.setStatus('Output copied to clipboard.', 'success'); }
  }

  download() {
    const value = this.outputArea.value;
    if (!value) { this.setStatus('Nothing to download.', 'warning'); return; }
    const blob = new Blob([value], { type: 'text/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = this.mode === 'escape' ? 'escaped-xml.xml' : 'unescaped-xml.xml';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    this.setStatus('Output downloaded.', 'success');
  }

  loadExample() {
    const examples = this.mode === 'escape' ? [
      '<note><to>User</to><from>Dev</from><body>Tom & Jerry</body></note>',
      '<tag attr="a&b">Some \'text\' & chars</tag>',
      '<root>5 < 10 & 7 > 3</root>',
      '<![CDATA[<raw>&not;escaped</raw>]]>'
    ] : [
      '&lt;note&gt;&lt;to&gt;User&lt;/to&gt;&lt;body&gt;Tom &amp; Jerry&lt;/body&gt;&lt;/note&gt;',
      '&lt;tag attr=&quot;a&amp;b&quot;&gt;Some &#39;text&#39; &amp; chars&lt;/tag&gt;',
      '&lt;root&gt;5 &lt; 10 &amp; 7 &gt; 3&lt;/root&gt;'
    ];
    this.inputArea.value = examples[Math.floor(Math.random() * examples.length)];
    this.outputArea.value = '';
    this.clearStatus();
    this.updateStats();
    this.inputArea.focus();
  }

  decodeAttributeValue(value) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
  }

  setStatus(message, type = 'info') {
    this.status.textContent = message;
    this.status.className = 'text-sm';
    const classes = {
      success: ['text-green-600', 'dark:text-green-400'],
      warning: ['text-yellow-600', 'dark:text-yellow-400'],
      error: ['text-red-600', 'dark:text-red-400'],
      info: ['text-gray-600', 'dark:text-gray-400'],
    };
    this.status.classList.add(...(classes[type] || classes.info));
  }

  clearStatus() {
    this.status.textContent = '';
    this.status.className = 'text-sm text-gray-600 dark:text-gray-400';
  }

  updateStats() {
    const input = this.inputArea?.value || '';
    const output = this.outputArea?.value || '';
    const inputBytes = new Blob([input]).size;
    const outputBytes = new Blob([output]).size;
    this.stats.textContent = `Input: ${input.length.toLocaleString()} chars / ${inputBytes.toLocaleString()} bytes · ` +
      `Output: ${output.length.toLocaleString()} chars / ${outputBytes.toLocaleString()} bytes`;
  }
}
