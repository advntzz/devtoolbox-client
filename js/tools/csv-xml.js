export class CSVXMLConverter {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.errorDisplay = null;
    this.stats = null;
    this.optionMode = null;
    this.optionPretty = null;
    this.optionIndent = null;
    this.delimiter = ',';
    this.debounceMs = 400;
    this.debounceTimer = null;
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
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">CSV ↔ XML Converter</h1>
          <p class="text-gray-600 dark:text-gray-400">Convert between CSV and XML directly in your browser.</p>
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
                <option value="csv-to-xml">CSV → XML</option>
                <option value="xml-to-csv">XML → CSV</option>
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
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300" data-left-label>CSV</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">Input</span>
            </label>
            <textarea data-input class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" spellcheck="false" rows="12" placeholder='Enter CSV here...'></textarea>
          </div>

          <div>
            <label class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300" data-right-label>XML</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">Output</span>
            </label>
            <textarea data-output readonly class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" spellcheck="false" rows="12" placeholder='Result will appear here...'></textarea>
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
    this.optionMode = this.container.querySelector('[data-option="mode"]');
    this.optionPretty = this.container.querySelector('[data-option="pretty"]');
    this.optionIndent = this.container.querySelector('[data-option="indent"]');
    this.leftLabel = this.container.querySelector('[data-left-label]');
    this.rightLabel = this.container.querySelector('[data-right-label]');
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
      this.updateStats();
      this.clearError();
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.performConversion(true), this.debounceMs);
    });

    this.inputArea.addEventListener('paste', () => {
      setTimeout(() => this.performConversion(true), 10);
    });

    this.optionMode?.addEventListener('change', () => this.updateModeUI());
    this.optionPretty?.addEventListener('change', () => {});
    this.optionIndent?.addEventListener('change', () => {});
  }

  updateModeUI() {
    const mode = this.optionMode?.value || 'csv-to-xml';
    if (mode === 'csv-to-xml') {
      if (this.leftLabel) this.leftLabel.textContent = 'CSV';
      if (this.rightLabel) this.rightLabel.textContent = 'XML';
      if (this.inputArea) this.inputArea.placeholder = 'Enter CSV here...';
      if (this.outputArea) this.outputArea.placeholder = 'Result will appear here...';
    } else {
      if (this.leftLabel) this.leftLabel.textContent = 'XML';
      if (this.rightLabel) this.rightLabel.textContent = 'CSV';
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

  // Manual convert
  convert() {
    this.performConversion(false);
  }

  performConversion(silent = false) {
    if (!this.inputArea) return;
    if (!silent) this.clearError();
    const text = this.inputArea.value.trim();
    if (!text) {
      this.outputArea.value = '';
      this.updateStats();
      return;
    }

    const mode = this.optionMode?.value || 'csv-to-xml';
    try {
      if (mode === 'csv-to-xml') {
        const xml = this.convertCsvToXml(text);
        this.outputArea.value = this.optionPretty.checked ? this.prettyPrintXml(xml, parseInt(this.optionIndent.value, 10) || 2) : xml;
      } else {
        const csv = this.convertXmlToCsv(text);
        this.outputArea.value = csv;
      }
      this.updateStats();
    } catch (err) {
      if (!silent) {
        this.outputArea.value = '';
        this.setError(err.message || 'Conversion failed');
        this.updateStats();
      }
    }
  }

  // CSV parsing adapted from existing csv-json tool
  parseCSVLine(line, delimiter=',') {
    const result = [];
    let current = '';
    let inQuotes = false;

    // Normalize line endings and remove BOM
    line = line.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/^\uFEFF/, '');

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // skip next
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  escapeXmlText(text) {
    if (text == null) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  isValidXmlName(name) {
    return typeof name === 'string' && /^[A-Za-z_][A-Za-z0-9._-]*$/.test(name);
  }

  convertCsvToXml(csvText) {
    const delimiter = this.delimiter || ',';
    // Split into lines supporting CRLF and LF
    const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const nonEmptyLines = lines.filter(l => l.trim() !== '');
    if (nonEmptyLines.length === 0) throw new Error('No data to convert');

    const rows = nonEmptyLines.map(line => this.parseCSVLine(line, delimiter));

    const headers = rows[0];
    const expected = headers.length;

    // Validate consistency
    rows.forEach((r, idx) => {
      if (r.length !== expected) throw new Error(`Row ${idx+1} has ${r.length} columns; expected ${expected}`);
    });

    // Build XML using DOM to ensure proper escaping
    const doc = document.implementation.createDocument('', '', null);
    const root = doc.createElement('rows');
    doc.appendChild(root);

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowEl = doc.createElement('row');
      for (let j = 0; j < headers.length; j++) {
        const h = headers[j] || `col${j+1}`;
        let cellName = h;
        let cellEl;
        if (this.isValidXmlName(h)) {
          cellEl = doc.createElement(h);
        } else {
          cellEl = doc.createElement('property');
          cellEl.setAttribute('name', h);
        }
        const text = row[j] === undefined ? '' : row[j];
        cellEl.appendChild(doc.createTextNode(String(text)));
        rowEl.appendChild(cellEl);
      }
      root.appendChild(rowEl);
    }

    const serializer = new XMLSerializer();
    let xmlStr = serializer.serializeToString(doc);
    // Ensure quotes in text nodes are escaped to &quot; and apostrophes to &apos;
    xmlStr = xmlStr.replace(/>([^<]*)</g, (m, p1) => {
      return '>' + p1.replace(/"/g, '&quot;').replace(/'/g, '&apos;') + '<';
    });
    return xmlStr;
  }

  // Convert XML -> CSV
  convertXmlToCsv(xmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');
    const errs = doc.getElementsByTagName('parsererror');
    if (errs && errs.length) throw new Error('Invalid XML');

    const root = doc.documentElement;
    if (!root) throw new Error('Empty XML');

    // Find immediate row elements (either <row> children or each child of root treated as row if root child elements each represent rows)
    let rowEls = Array.from(root.getElementsByTagName('row'));
    if (rowEls.length === 0) {
      // maybe structure is <rows><row>..</row></rows> or <root><r>..</r></root>
      // If root children look like rows (each child has similar child tags), treat immediate children as rows
      const immediate = Array.from(root.children || []);
      if (immediate.length === 0) throw new Error('No rows found in XML');
      // Determine if immediate children are row-like (have child elements)
      const areRowLike = immediate.every(n => n.children && n.children.length > 0);
      if (areRowLike) {
        rowEls = immediate;
      }
    }

    if (rowEls.length === 0) throw new Error('No rows found in XML');

    // Determine headers by collecting child tag names and max occurrence per tag
    const tagCounts = {};
    rowEls.forEach(row => {
      const counts = {};
      Array.from(row.children).forEach(child => {
        const name = child.tagName === 'property' && child.getAttribute('name') ? child.getAttribute('name') : child.tagName;
        counts[name] = (counts[name] || 0) + 1;
        tagCounts[name] = Math.max(tagCounts[name] || 0, counts[name]);
      });
    });

    // Build headers: if a tag has max>1, create multiple columns name, name_2, name_3...
    const headers = [];
    Object.keys(tagCounts).forEach(name => {
      const max = tagCounts[name];
      if (max <= 1) headers.push(name);
      else {
        for (let i = 1; i <= max; i++) {
          headers.push(i === 1 ? name : `${name}_${i}`);
        }
      }
    });

    // Build CSV rows
    const rows = [];
    rows.push(headers.map(h => this.escapeCSVValue(h, ',')).join(','));

    rowEls.forEach(row => {
      const valuesByName = {};
      Array.from(row.children).forEach(child => {
        const name = child.tagName === 'property' && child.getAttribute('name') ? child.getAttribute('name') : child.tagName;
        const text = child.textContent || '';
        valuesByName[name] = valuesByName[name] || [];
        valuesByName[name].push(text);
      });

      const rowValues = [];
      headers.forEach(h => {
        // handle suffix _n
        const m = h.match(/^(.*)_(\d+)$/);
        if (m) {
          const base = m[1];
          const idx = parseInt(m[2], 10) - 1;
          const arr = valuesByName[base] || [];
          rowValues.push(this.escapeCSVValue(arr[idx] === undefined ? '' : arr[idx], ','));
        } else {
          const arr = valuesByName[h] || valuesByName[h] || [];
          rowValues.push(this.escapeCSVValue(arr[0] === undefined ? '' : arr[0], ','));
        }
      });

      rows.push(rowValues.join(','));
    });

    return rows.join('\n');
  }

  escapeCSVValue(value, delimiter) {
    if (value === null || value === undefined) return '';
    const s = String(value);
    if (s.includes(delimiter) || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  prettyPrintXml(xmlStr, indentSize = 2) {
    const indent = indentSize > 0 ? ' '.repeat(indentSize) : '';
    let formatted = xmlStr.replace(/>(\s*)</g, '>$1\n<');
    const lines = formatted.split(/\n/);
    let depth = 0;
    const out = [];
    lines.forEach(lineRaw => {
      const line = lineRaw.trim();
      if (line.match(/^<\//)) {
        depth = Math.max(depth - 1, 0);
      }
      out.push(indent.repeat(depth) + line);
      if (line.match(/^<[^!?][^>]*[^/]?>/) && !line.match(/^<.*\/\s*>$/) && !line.match(/^<\?/)) {
        if (!line.match(/<[^>]+>.*<\//)) depth++;
      }
    });
    return out.join('\n');
  }

  swap() {
    const out = this.outputArea.value;
    if (!out) return this.setError('Nothing to swap');
    const current = this.optionMode?.value || 'csv-to-xml';
    const newMode = current === 'csv-to-xml' ? 'xml-to-csv' : 'csv-to-xml';
    if (this.optionMode) this.optionMode.value = newMode;
    this.updateModeUI();
    this.inputArea.value = out;
    this.outputArea.value = '';
    this.updateStats();
    this.performConversion(false);
  }

  copy() {
    const v = this.outputArea.value;
    if (!v) return this.setError('Nothing to copy');
    navigator.clipboard.writeText(v).catch(() => {
      this.setError('Copy failed');
    });
  }

  download() {
    const v = this.outputArea.value;
    if (!v) return this.setError('Nothing to download');
    const mode = this.optionMode?.value || 'csv-to-xml';
    const mime = mode === 'csv-to-xml' ? 'application/xml;charset=utf-8' : 'text/csv;charset=utf-8';
    const ext = mode === 'csv-to-xml' ? 'xml' : 'csv';
    const blob = new Blob([v], { type: mime });
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
    const mode = this.optionMode?.value || 'csv-to-xml';
    if (mode === 'csv-to-xml') {
      const ex = `name,age,city\nDom,20,Yogyakarta\nNayla,20,Jakarta`;
      this.inputArea.value = ex;
    } else {
      const ex = `<rows>\n  <row>\n    <name>Dom</name>\n    <age>20</age>\n    <city>Yogyakarta</city>\n  </row>\n  <row>\n    <name>Nayla</name>\n    <age>20</age>\n    <city>Jakarta</city>\n  </row>\n</rows>`;
      this.inputArea.value = ex;
    }
    this.outputArea.value = '';
    this.clearError();
    this.updateStats();
  }
}
