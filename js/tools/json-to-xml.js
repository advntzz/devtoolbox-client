export class JSONToXMLConverter {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.errorDisplay = null;
    this.stats = null;
    this.options = { pretty: true, indent: 2, maxDepth: 200, maxNodes: 20000 };
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
    this.cacheElements();
    this.updateModeUI();
    this.attachEventListeners();
    this.updateStats();
  }

  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">JSON ↔ XML Converter</h1>
          <p class="text-gray-600 dark:text-gray-400">Convert between JSON and XML on the client (both directions). Invalid XML element names are preserved via a <code>property name="..."</code> wrapper.</p>
        </div>

        <div class="mb-6 flex flex-wrap justify-between gap-4 items-center">
          <div class="flex gap-2">
            <button data-action="convert" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Convert</button>
            <button data-action="swap" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md">Swap</button>
            <button data-action="copy" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md">Copy</button>
            <button data-action="download" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md">Download</button>
            <button data-action="clear" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md">Clear</button>
            <button data-action="example" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md">Load Example</button>
          </div>

          <div class="flex items-center gap-3">
            <label class="flex items-center text-sm">
              <span class="mr-2">Mode:</span>
              <select data-option="mode" class="px-2 py-1 rounded border bg-white dark:bg-gray-900">
                <option value="json-to-xml">JSON → XML</option>
                <option value="xml-to-json">XML → JSON</option>
              </select>
            </label>
          </div>

          <div class="flex items-center gap-3">
            <label class="flex items-center text-sm">
              <input type="checkbox" data-option="pretty" checked class="mr-2" /> Pretty print
            </label>
            <label class="flex items-center text-sm">
              Indent:
              <select data-option="indent" class="ml-2 px-2 py-1 rounded border bg-white dark:bg-gray-900">
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="0">None</option>
              </select>
            </label>
          </div>
        </div>

        <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded hidden" data-error></div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300" data-left-label>JSON</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">Input</span>
            </label>
            <textarea data-input class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" spellcheck="false" rows="14" placeholder='Enter JSON here...'></textarea>
          </div>

          <div>
            <label class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300" data-right-label>XML</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">Output</span>
            </label>
            <textarea data-output readonly class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" spellcheck="false" rows="14" placeholder="Result will appear here..."></textarea>
          </div>
        </div>

        <div class="mt-4 flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <div class="flex gap-4">
            <span data-stat-input>Input: 0 chars / 0 bytes</span>
            <span data-stat-output>Output: 0 chars / 0 bytes</span>
          </div>
        </div>
      </div>
    `;
  }

  cacheElements() {
    this.inputArea = this.container.querySelector('[data-input]');
    this.outputArea = this.container.querySelector('[data-output]');
    this.errorDisplay = this.container.querySelector('[data-error]');
    this.stats = {
      input: this.container.querySelector('[data-stat-input]'),
      output: this.container.querySelector('[data-stat-output]'),
    };
    this.optionPretty = this.container.querySelector('[data-option="pretty"]');
    this.optionIndent = this.container.querySelector('[data-option="indent"]');
    this.optionMode = this.container.querySelector('[data-option="mode"]');
    this.leftLabel = this.container.querySelector('[data-left-label]');
    this.rightLabel = this.container.querySelector('[data-right-label]');
    this.debounceMs = 400;
    this.debounceTimer = null;
  }

  attachEventListeners() {
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'convert') return this.convert();
      if (action === 'swap') return this.swap();
      if (action === 'copy') return this.copy();
      if (action === 'download') return this.download();
      if (action === 'clear') return this.clear();
      if (action === 'example') return this.loadExample();
    });

    this.inputArea.addEventListener('input', () => {
      // Update stats immediately but debounce conversion
      this.updateStats();
      // Clear visible errors while user types to avoid spam
      this.clearError();
      // Debounce auto-convert
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.performConversion(true), this.debounceMs);
    });

    this.inputArea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.convert();
      }
    });

    this.optionPretty.addEventListener('change', () => this.updateOptions());
    this.optionIndent.addEventListener('change', () => this.updateOptions());
    if (this.optionMode) {
      this.optionMode.addEventListener('change', () => {
        this.updateModeUI();
      });
    }
  }

  updateOptions() {
    this.options.pretty = this.optionPretty.checked;
    this.options.indent = parseInt(this.optionIndent.value, 10) || 0;
  }

  updateModeUI() {
    const mode = this.optionMode?.value || 'json-to-xml';
    if (mode === 'json-to-xml') {
      if (this.leftLabel) this.leftLabel.textContent = 'JSON';
      if (this.rightLabel) this.rightLabel.textContent = 'XML';
      if (this.inputArea) this.inputArea.placeholder = 'Enter JSON here...';
      if (this.outputArea) this.outputArea.placeholder = 'Result will appear here...';
    } else {
      if (this.leftLabel) this.leftLabel.textContent = 'XML';
      if (this.rightLabel) this.rightLabel.textContent = 'JSON';
      if (this.inputArea) this.inputArea.placeholder = 'Enter XML here...';
      if (this.outputArea) this.outputArea.placeholder = 'Result will appear here...';
    }
  }

  setError(msg) {
    if (!this.errorDisplay) return;
    this.errorDisplay.textContent = msg;
    this.errorDisplay.hidden = false;
  }

  clearError() {
    if (!this.errorDisplay) return;
    this.errorDisplay.textContent = '';
    this.errorDisplay.hidden = true;
  }

  updateStats() {
    const input = this.inputArea?.value || '';
    const output = this.outputArea?.value || '';
    const inputBytes = new Blob([input]).size;
    const outputBytes = new Blob([output]).size;
    if (this.stats.input) this.stats.input.textContent = `Input: ${input.length.toLocaleString()} chars / ${inputBytes.toLocaleString()} bytes`;
    if (this.stats.output) this.stats.output.textContent = `Output: ${output.length.toLocaleString()} chars / ${outputBytes.toLocaleString()} bytes`;
  }

  // Public convert entry used by UI; keeps errors scoped and displayed
  convert() {
    // Manual convert (show errors)
    this.performConversion(false);
  }

  // performConversion(silent): if silent=true, do not surface errors and preserve previous output on failure
  performConversion(silent = false) {
    if (!this.inputArea) return;
    if (!silent) this.clearError();
    this.updateOptions();
    const text = this.inputArea.value.trim();
    if (!text) {
      this.outputArea.value = '';
      this.updateStats();
      return;
    }

    const mode = this.optionMode?.value || 'json-to-xml';
    try {
      if (mode === 'json-to-xml') {
        const xml = JSONToXMLConverter.convertJsonToXmlString(text, this.options);
        this.outputArea.value = xml;
      } else {
        const json = JSONToXMLConverter.convertXmlToJsonString(text, this.options);
        this.outputArea.value = json;
      }
      this.updateStats();
    } catch (err) {
      // On silent mode, do not clear output or spam errors; on manual mode, show the error
      if (!silent) {
        this.outputArea.value = '';
        this.setError(err.message || 'Conversion failed');
        this.updateStats();
      }
      // If silent, keep previous output and do not update stats
    }
  }

  swap() {
    const out = this.outputArea.value;
    if (!out) return this.setError('Nothing to swap');

    // Toggle mode
    const current = this.optionMode?.value || 'json-to-xml';
    const newMode = current === 'json-to-xml' ? 'xml-to-json' : 'json-to-xml';
    if (this.optionMode) {
      this.optionMode.value = newMode;
    }
    this.updateModeUI();

    // Move current output into input, clear output, update stats, then perform conversion (show errors)
    this.inputArea.value = out;
    this.outputArea.value = '';
    this.updateStats();
    // Immediate conversion after swap (manual behavior)
    this.performConversion(false);
  }

  async copy() {
    const value = this.outputArea.value;
    if (!value) return this.setError('Nothing to copy');
    try {
      await navigator.clipboard.writeText(value);
    } catch (e) {
      this.outputArea.select();
      document.execCommand('copy');
    }
  }

  download() {
    const value = this.outputArea.value;
    if (!value) return this.setError('Nothing to download');
    const mode = this.optionMode?.value || 'json-to-xml';
    const mime = mode === 'json-to-xml' ? 'application/xml;charset=utf-8' : 'application/json;charset=utf-8';
    const ext = mode === 'json-to-xml' ? 'xml' : 'json';
    const blob = new Blob([value], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  clear() {
    this.inputArea.value = '';
    this.outputArea.value = '';
    this.clearError();
    this.updateStats();
  }

  loadExample() {
    const mode = this.optionMode?.value || 'json-to-xml';
    if (mode === 'json-to-xml') {
      const examples = [
        JSON.stringify({ person: { name: 'John', age: 30, tags: ['dev', 'js'] } }, null, 2),
        JSON.stringify(['a', 'b', { x: 1 }], null, 2),
        JSON.stringify({ '123 invalid name': 'value', nested: { emptyObj: {}, emptyArr: [] } }, null, 2),
        '"simple string root"',
        'null',
      ];
      this.inputArea.value = examples[Math.floor(Math.random() * examples.length)];
    } else {
      const examples = [
        `<root><person><name type="string">John</name><age type="number">30</age><tags><item type="string">dev</item><item type="string">js</item></tags></person></root>`,
        `<root><item type="string">a</item><item type="string">b</item><item><x type="number">1</x></item></root>`,
        `<root><property name="123 invalid name">value</property><nested><emptyObj></emptyObj><emptyArr></emptyArr></nested></root>`,
        `<root><value type="string">simple string root</value></root>`,
        `<root><value nil="true"/></root>`,
      ];
      this.inputArea.value = examples[Math.floor(Math.random() * examples.length)];
    }
    this.outputArea.value = '';
    this.clearError();
    this.updateStats();
  }

  // Static, testable converter that returns XML string for given JSON input (string or object)
  static convertJsonToXmlString(input, options = {}) {
    const opts = Object.assign({ pretty: true, indent: 2, maxDepth: 200, maxNodes: 20000 }, options || {});

    let obj;
    if (typeof input === 'string') {
      try {
        obj = JSON.parse(input);
      } catch (e) {
        throw new Error('Invalid JSON: ' + e.message);
      }
    } else {
      obj = input;
    }

    // Use DOM APIs to construct XML safely
    const xmlDoc = document.implementation.createDocument('', '', null);
    const root = xmlDoc.createElement('root');
    xmlDoc.appendChild(root);

    let nodeCount = 1;

    function isValidXmlName(name) {
      return typeof name === 'string' && /^[A-Za-z_][A-Za-z0-9._-]*$/.test(name);
    }

    function ensureLimits(depth) {
      if (depth > opts.maxDepth) throw new Error('Exceeded maximum recursion depth');
      if (nodeCount > opts.maxNodes) throw new Error('Exceeded maximum node count');
    }

    function appendValue(parent, key, value, depth) {
      ensureLimits(depth);
      let el;
      if (key == null) {
        el = parent.ownerDocument.createElement('item');
      } else if (isValidXmlName(key)) {
        el = parent.ownerDocument.createElement(key);
      } else {
        el = parent.ownerDocument.createElement('property');
        el.setAttribute('name', String(key));
      }
      nodeCount++;

      if (value === null) {
        el.setAttribute('nil', 'true');
        parent.appendChild(el);
        return;
      }

      const t = typeof value;
      if (t === 'object') {
        if (Array.isArray(value)) {
          if (value.length === 0) {
            parent.appendChild(el);
            return;
          }
          value.forEach((item) => {
            appendValue(el, null, item, depth + 1);
          });
        } else {
          const keys = Object.keys(value);
          if (keys.length === 0) {
            parent.appendChild(el);
            return;
          }
          keys.forEach((k) => appendValue(el, k, value[k], depth + 1));
        }
        parent.appendChild(el);
        return;
      }

      // Primitive types
      el.setAttribute('type', t);
      el.appendChild(parent.ownerDocument.createTextNode(String(value)));
      parent.appendChild(el);
    }

    // If root is primitive, still append under <root>
    if (obj === null || typeof obj !== 'object') {
      appendValue(root, 'value', obj, 0);
    } else if (Array.isArray(obj)) {
      // top-level array -> wrap under root
      obj.forEach(item => appendValue(root, null, item, 0));
    } else {
      Object.keys(obj).forEach(k => appendValue(root, k, obj[k], 0));
    }

    // Serialize
    const serializer = new XMLSerializer();
    let xmlString = serializer.serializeToString(xmlDoc);

    if (opts.pretty) {
      xmlString = JSONToXMLConverter.prettyPrintXml(xmlString, opts.indent);
    }

    return xmlString;
  }

  // Simple pretty-printer that inserts indentation/newlines; preserves text content
  static prettyPrintXml(xml, indentSize = 2) {
    const indent = indentSize > 0 ? ' '.repeat(indentSize) : '';
    // Insert newlines between tags
    let formatted = xml.replace(/>(\s*)</g, '>$1\n<');
    const lines = formatted.split(/\n/);
    let depth = 0;
    const out = [];
    for (let raw of lines) {
      let line = raw.trim();
      if (line.match(/^<\/?\w/)) {
        if (line.match(/^<\//)) {
          depth = Math.max(depth - 1, 0);
        }
        out.push(indent.repeat(depth) + line);
        if (line.match(/^<[^!?][^>]*[^/]?>/) && !line.match(/^<.*\/\s*>$/) && !line.match(/^<\?/)) {
          if (!line.match(/^<[^>]+>.*<\//)) {
            // increase depth for non-self-closing and non-inline closing
            if (!line.match(/<[^>]+>.*<\//)) depth++;
          }
        }
      } else {
        out.push(indent.repeat(depth) + line);
      }
    }
    return out.join('\n');
  }

  // Parse XML string and return a JSON string (honors maxDepth/maxNodes)
  static convertXmlToJsonString(input, options = {}) {
    const opts = Object.assign({ pretty: true, indent: 2, maxDepth: 200, maxNodes: 20000 }, options || {});
    let doc;
    if (typeof input === 'string') {
      const parser = new DOMParser();
      doc = parser.parseFromString(input, 'application/xml');
      const errs = doc.getElementsByTagName('parsererror');
      if (errs && errs.length) throw new Error('Invalid XML');
    } else if (input instanceof Document) {
      doc = input;
    } else {
      throw new Error('Invalid XML input');
    }

    let nodeCount = 1;

    function ensureLimits(depth) {
      if (depth > opts.maxDepth) throw new Error('Exceeded maximum recursion depth');
      if (nodeCount > opts.maxNodes) throw new Error('Exceeded maximum node count');
    }

    function getImmediateText(node) {
      return Array.from(node.childNodes).filter(n => n.nodeType === 3).map(n => n.nodeValue).join('').trim();
    }

    function castByType(text, type) {
      if (type === 'number') {
        const n = Number(text);
        return Number.isNaN(n) ? text : n;
      }
      if (type === 'boolean') return text === 'true';
      return text;
    }

    function elementToValue(el, depth) {
      ensureLimits(depth);
      nodeCount++;
      if (el.getAttribute && el.getAttribute('nil') === 'true') return null;

      const attrs = {};
      if (el.attributes && el.attributes.length) {
        for (let i = 0; i < el.attributes.length; i++) {
          const a = el.attributes[i];
          if (a.name === 'nil') continue;
          if (a.name === 'type') continue;
          if (a.name === 'name' && el.tagName === 'property') continue;
          attrs['@' + a.name] = a.value;
        }
      }

      const childEls = Array.from(el.children || []);
      const text = getImmediateText(el);

      if (childEls.length === 0) {
        const t = el.getAttribute && el.getAttribute('type');
        if (t) return castByType(text, t);
        if (Object.keys(attrs).length) {
          if (text) attrs['#text'] = text;
          return attrs;
        }
        // plain text
        return text;
      }

      // If all children are <item>, treat as array
      if (childEls.every(c => c.tagName === 'item')) {
        return childEls.map(c => elementToValue(c, depth + 1));
      }

      // Otherwise build object, merging repeated keys into arrays
      const out = {};
      for (let child of childEls) {
        let key = child.tagName;
        if (child.tagName === 'property' && child.getAttribute('name')) {
          key = child.getAttribute('name');
        }
        const val = elementToValue(child, depth + 1);
        if (Object.prototype.hasOwnProperty.call(out, key)) {
          if (!Array.isArray(out[key])) out[key] = [out[key]];
          out[key].push(val);
        } else {
          out[key] = val;
        }
      }

      if (Object.keys(attrs).length) {
        Object.keys(attrs).forEach(k => { out[k] = attrs[k]; });
      }
      if (text) out['#text'] = text;
      return out;
    }

    const root = doc.documentElement;
    let result;
    if (!root) return JSON.stringify(null);
    // If root contains only <item> children, return array
    const rootChildren = Array.from(root.children || []);
    if (rootChildren.length > 0 && rootChildren.every(c => c.tagName === 'item')) {
      result = rootChildren.map(c => elementToValue(c, 0));
    } else if (rootChildren.length === 0) {
      // root alone may be a value
      result = elementToValue(root, 0);
    } else {
      // object mapping
      const out = {};
      for (let child of rootChildren) {
        let key = child.tagName === 'property' && child.getAttribute('name') ? child.getAttribute('name') : child.tagName;
        const val = elementToValue(child, 0);
        if (Object.prototype.hasOwnProperty.call(out, key)) {
          if (!Array.isArray(out[key])) out[key] = [out[key]];
          out[key].push(val);
        } else {
          out[key] = val;
        }
      }
      result = out;
    }

    return JSON.stringify(result, null, opts.pretty ? opts.indent : 0);
  }
}
