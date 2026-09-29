export class WHOISLookup {
  constructor() {
    this.container = null;
    this.lookupHistory = [];
    this.abortController = null;
    this.lastResult = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.attachEventListeners();
    this.updatePlaceholder();
  }

  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-8">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">RDAP Lookup</h1>
            <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Live</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400">
            Query live domain and IP registration data using RDAP (Registration Data Access Protocol).
          </p>
        </div>

        <div class="mb-6 flex flex-wrap gap-2">
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            data-action="lookup"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Lookup
          </button>

          <button
            class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            data-action="clear"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>

          <button
            class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            data-action="copy"
            type="button"
            disabled
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy JSON
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="space-y-4">
                <div>
                  <label for="domain-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Domain Name / IP Address
                  </label>
                  <input
                    type="text"
                    id="domain-input"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="example.com or 8.8.8.8"
                    spellcheck="false"
                    autocomplete="off"
                  />
                </div>

                <div>
                  <label for="query-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Query Type
                  </label>
                  <select
                    id="query-type"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="domain">Domain</option>
                    <option value="ip">IP Address</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="mt-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Examples</h3>
              <div class="space-y-2">
                <button type="button" class="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left" data-example="google.com">google.com</button>
                <button type="button" class="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left" data-example="github.com">github.com</button>
                <button type="button" class="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left" data-example="8.8.8.8">8.8.8.8 (Google DNS)</button>
                <button type="button" class="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left" data-example="1.1.1.1">1.1.1.1 (Cloudflare)</button>
                <button type="button" class="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left" data-example="2001:4860:4860::8888">2001:4860:4860::8888 (Google IPv6)</button>
              </div>
            </div>

            <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Lookup History</h3>
                <button type="button" data-action="clear-history" class="text-sm text-red-600 dark:text-red-400 hover:underline">
                  Clear
                </button>
              </div>
              <div id="lookup-history" class="space-y-2">
                <div class="text-gray-500 dark:text-gray-400 text-sm">No lookups yet</div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="flex flex-wrap justify-between items-center gap-2 mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">RDAP Information</h3>
                <div id="lookup-status" class="text-sm text-gray-600 dark:text-gray-400"></div>
              </div>

              <div id="rdap-results" class="space-y-4">
                <div class="text-gray-500 dark:text-gray-400 text-center py-12">
                  Enter a domain name or IP address and click Lookup.
                </div>
              </div>
            </div>

            <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">About RDAP</h4>
              <div class="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p>RDAP is the modern HTTP/JSON registration-data protocol used by domain registries and Regional Internet Registries.</p>
                <p>This tool discovers the responsible RDAP service through the IANA bootstrap registries and queries that service directly from your browser.</p>
                <p>Returned fields depend on the registry. Some contact information may be redacted.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg">
          <div class="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Privacy note:</strong> Queries are sent directly from your browser to IANA bootstrap data and the selected RDAP service. Do not enter sensitive information.
          </div>
        </div>

        <div class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg hidden" data-error></div>
      </div>
    `;
  }

  attachEventListeners() {
    this.container.querySelector('[data-action="lookup"]').addEventListener('click', () => {
      this.performLookup();
    });

    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => {
      this.clear();
    });

    this.container.querySelector('[data-action="copy"]').addEventListener('click', () => {
      this.copyResults();
    });

    this.container.querySelector('[data-action="clear-history"]').addEventListener('click', () => {
      this.lookupHistory = [];
      this.updateHistoryDisplay();
    });

    this.container.querySelector('#domain-input').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.performLookup();
      }
    });

    this.container.querySelector('#query-type').addEventListener('change', () => {
      this.updatePlaceholder();
    });

    this.container.querySelectorAll('[data-example]').forEach((button) => {
      button.addEventListener('click', () => {
        const value = button.dataset.example;
        const input = this.container.querySelector('#domain-input');
        const typeSelect = this.container.querySelector('#query-type');

        input.value = value;
        typeSelect.value = this.detectQueryType(value);
        this.updatePlaceholder();
        this.performLookup();
      });
    });

    this.container.addEventListener('click', (event) => {
      const historyItem = event.target.closest('.history-item');
      if (!historyItem) return;

      const input = this.container.querySelector('#domain-input');
      const typeSelect = this.container.querySelector('#query-type');

      input.value = historyItem.dataset.query;
      typeSelect.value = historyItem.dataset.type;
      this.updatePlaceholder();
      this.performLookup();
    });
  }

  updatePlaceholder() {
    const type = this.container.querySelector('#query-type').value;
    const input = this.container.querySelector('#domain-input');

    if (type === 'ip') {
      input.placeholder = '8.8.8.8 or 2001:4860:4860::8888';
    } else if (type === 'domain') {
      input.placeholder = 'example.com';
    } else {
      input.placeholder = 'example.com or 8.8.8.8';
    }
  }

  async performLookup() {
    const input = this.container.querySelector('#domain-input');
    const query = input.value.trim();

    if (!query) {
      this.showError('Please enter a domain name or IP address.');
      return;
    }

    const selectedType = this.container.querySelector('#query-type').value;
    const queryType = selectedType === 'auto'
      ? this.detectQueryType(query)
      : selectedType;

    if (queryType === 'domain' && !this.isValidDomain(query)) {
      this.showError('Invalid domain name. Use a hostname such as example.com.');
      return;
    }

    if (queryType === 'ip' && !this.isValidIP(query)) {
      this.showError('Invalid IPv4 or IPv6 address.');
      return;
    }

    this.clearError();
    this.lastResult = null;
    this.setCopyEnabled(false);

    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();

    const resultsDiv = this.container.querySelector('#rdap-results');
    const statusDiv = this.container.querySelector('#lookup-status');

    resultsDiv.innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        <div class="mt-2">Discovering RDAP service...</div>
      </div>
    `;
    statusDiv.textContent = 'Connecting...';

    try {
      const result = queryType === 'domain'
        ? await this.lookupDomain(query, this.abortController.signal)
        : await this.lookupIP(query, this.abortController.signal);

      this.lastResult = result;
      this.displayResult(result, queryType);
      this.addToHistory(query, queryType);
      this.setCopyEnabled(true);

      statusDiv.textContent = `Live result • ${new Date().toLocaleTimeString()}`;
    } catch (error) {
      if (error?.name === 'AbortError') return;

      this.lastResult = null;
      this.setCopyEnabled(false);
      resultsDiv.innerHTML = '';
      this.showError(this.formatLookupError(error));
      statusDiv.textContent = 'Lookup failed';
    }
  }

  async lookupDomain(domain, signal) {
    const normalized = this.normalizeDomain(domain);
    const tld = normalized.split('.').pop().toLowerCase();

    const bootstrap = await this.fetchJSON(
      'https://data.iana.org/rdap/dns.json',
      signal,
      'IANA domain RDAP bootstrap'
    );

    const service = this.findBootstrapService(bootstrap, tld);

    if (!service) {
      throw new Error(`No RDAP service was found in the IANA bootstrap registry for .${tld}.`);
    }

    const baseURL = this.ensureRDAPBaseURL(service[0]);
    const endpoint = `${baseURL}domain/${encodeURIComponent(normalized)}`;

    const data = await this.fetchJSON(endpoint, signal, 'domain RDAP service');

    return {
      query: normalized,
      type: 'domain',
      endpoint,
      bootstrapSource: 'IANA RDAP DNS bootstrap',
      data
    };
  }

  async lookupIP(ip, signal) {
    const normalized = this.normalizeIP(ip);
    const bootstrapURL = this.isIPv4(normalized)
      ? 'https://data.iana.org/rdap/ipv4.json'
      : 'https://data.iana.org/rdap/ipv6.json';

    const bootstrap = await this.fetchJSON(
      bootstrapURL,
      signal,
      'IANA IP RDAP bootstrap'
    );

    const service = this.findIPBootstrapService(bootstrap, normalized);

    if (!service) {
      throw new Error(`No RDAP service was found in the IANA bootstrap registry for ${normalized}.`);
    }

    const baseURL = this.ensureRDAPBaseURL(service[0]);
    const endpoint = `${baseURL}ip/${encodeURIComponent(normalized)}`;

    const data = await this.fetchJSON(endpoint, signal, 'IP RDAP service');

    return {
      query: normalized,
      type: 'ip',
      endpoint,
      bootstrapSource: this.isIPv4(normalized)
        ? 'IANA RDAP IPv4 bootstrap'
        : 'IANA RDAP IPv6 bootstrap',
      data
    };
  }

  async fetchJSON(url, signal, label) {
    let response;

    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/rdap+json, application/json;q=0.9'
        },
        signal
      });
    } catch (error) {
      if (error?.name === 'AbortError') throw error;

      throw new Error(
        `Could not reach ${label}. The registry may block browser requests (CORS) or be temporarily unavailable.`
      );
    }

    if (!response.ok) {
      let detail = '';

      try {
        const text = await response.text();
        if (text) {
          detail = ` ${text.slice(0, 180).replace(/\s+/g, ' ')}`;
        }
      } catch {
        // Ignore body parsing errors.
      }

      if (response.status === 404) {
        throw new Error(`RDAP returned 404: the requested object was not found.${detail}`);
      }

      if (response.status === 429) {
        throw new Error(`RDAP rate limit reached (HTTP 429). Please try again later.`);
      }

      throw new Error(`RDAP request failed with HTTP ${response.status}.${detail}`);
    }

    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('json') && !contentType.includes('rdap')) {
      throw new Error(`The RDAP service returned an unexpected content type: ${contentType || 'unknown'}.`);
    }

    try {
      return await response.json();
    } catch {
      throw new Error('The RDAP service returned invalid JSON.');
    }
  }

  findBootstrapService(bootstrap, tld) {
    if (!bootstrap || !Array.isArray(bootstrap.services)) return null;

    const wanted = `.${tld}`;

    return bootstrap.services.find((service) => {
      if (!Array.isArray(service) || !Array.isArray(service[0])) return false;
      return service[0].some((item) => String(item).toLowerCase() === wanted);
    }) || null;
  }

  findIPBootstrapService(bootstrap, ip) {
    if (!bootstrap || !Array.isArray(bootstrap.services)) return null;

    const candidates = [];

    for (const service of bootstrap.services) {
      if (!Array.isArray(service) || !Array.isArray(service[0]) || !Array.isArray(service[1])) {
        continue;
      }

      for (const cidr of service[0]) {
        if (this.ipInCIDR(ip, cidr)) {
          candidates.push({
            service,
            prefixLength: this.getCIDRPrefixLength(cidr)
          });
        }
      }
    }

    candidates.sort((a, b) => b.prefixLength - a.prefixLength);
    return candidates.length ? candidates[0].service : null;
  }

  ensureRDAPBaseURL(value) {
    const base = String(value || '').trim();

    if (!/^https?:\/\//i.test(base)) {
      throw new Error('The RDAP bootstrap registry returned an invalid service URL.');
    }

    return base.endsWith('/') ? base : `${base}/`;
  }

  detectQueryType(value) {
    return this.isValidIP(value.trim()) ? 'ip' : 'domain';
  }

  normalizeDomain(domain) {
    return domain
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/\/$/, '')
      .replace(/\.$/, '')
      .toLowerCase();
  }

  normalizeIP(ip) {
    return ip.trim().replace(/^\[/, '').replace(/\]$/, '');
  }

  isValidDomain(domain) {
    const value = this.normalizeDomain(domain);

    if (!value || value.length > 253 || value.includes('..')) {
      return false;
    }

    const labels = value.split('.');

    if (labels.length < 2) return false;

    return labels.every((label) => (
      label.length >= 1 &&
      label.length <= 63 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
    ));
  }

  isValidIP(ip) {
    const value = this.normalizeIP(ip);
    return this.isIPv4(value) || this.isIPv6(value);
  }

  isIPv4(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;

    return parts.every((part) => {
      if (!/^\d{1,3}$/.test(part)) return false;
      const number = Number(part);
      return number >= 0 && number <= 255;
    });
  }

  isIPv6(ip) {
    const value = ip.toLowerCase();

    if (!value.includes(':')) return false;
    if (!/^[0-9a-f:.]+$/i.test(value)) return false;

    if (value.includes('.')) {
      const lastColon = value.lastIndexOf(':');
      const embeddedIPv4 = value.slice(lastColon + 1);

      if (!this.isIPv4(embeddedIPv4)) return false;
    }

    const doubleColonCount = (value.match(/::/g) || []).length;

    if (doubleColonCount > 1) return false;

    const parts = value.split(':');

    if (doubleColonCount === 0) {
      const groups = parts.filter(Boolean);
      if (groups.length !== 8) return false;
    } else {
      const groups = parts.filter(Boolean);
      if (groups.length >= 8) return false;
    }

    return parts
      .filter(Boolean)
      .every((group) => {
        if (group.includes('.')) {
          return this.isValidIPv4MappedTail(group);
        }

        return /^[0-9a-f]{1,4}$/i.test(group);
      });
  }

  isValidIPv4MappedTail(value) {
    return this.isIPv4(value);
  }

  ipInCIDR(ip, cidr) {
    const [network, prefixText] = String(cidr).split('/');
    const prefix = Number(prefixText);

    if (!Number.isInteger(prefix)) return false;

    if (this.isIPv4(ip) && this.isIPv4(network)) {
      if (prefix < 0 || prefix > 32) return false;

      const ipNumber = this.ipv4ToNumber(ip);
      const networkNumber = this.ipv4ToNumber(network);

      const mask = prefix === 0
        ? 0
        : (0xffffffff << (32 - prefix)) >>> 0;

      return ((ipNumber & mask) >>> 0) === ((networkNumber & mask) >>> 0);
    }

    if (this.isIPv6(ip) && this.isIPv6(network)) {
      if (prefix < 0 || prefix > 128) return false;

      const ipBits = this.ipv6ToBits(ip);
      const networkBits = this.ipv6ToBits(network);

      return ipBits.slice(0, prefix) === networkBits.slice(0, prefix);
    }

    return false;
  }

  getCIDRPrefixLength(cidr) {
    const value = Number(String(cidr).split('/')[1]);
    return Number.isInteger(value) ? value : -1;
  }

  ipv4ToNumber(ip) {
    return ip
      .split('.')
      .reduce((value, part) => ((value * 256) + Number(part)) >>> 0, 0);
  }

  ipv6ToBits(ip) {
    const groups = this.expandIPv6(ip);

    return groups
      .map((group) => Number.parseInt(group, 16).toString(2).padStart(16, '0'))
      .join('');
  }

  expandIPv6(ip) {
    let value = ip.toLowerCase();

    let ipv4Tail = null;

    if (value.includes('.')) {
      const lastColon = value.lastIndexOf(':');
      const ipv4 = value.slice(lastColon + 1);
      const numbers = ipv4.split('.').map(Number);

      const first = ((numbers[0] << 8) | numbers[1]).toString(16);
      const second = ((numbers[2] << 8) | numbers[3]).toString(16);

      ipv4Tail = `${first}:${second}`;
      value = `${value.slice(0, lastColon)}:${ipv4Tail}`;
    }

    const halves = value.split('::');

    if (halves.length > 2) {
      throw new Error('Invalid IPv6 address.');
    }

    const left = halves[0] ? halves[0].split(':').filter(Boolean) : [];
    const right = halves.length === 2 && halves[1]
      ? halves[1].split(':').filter(Boolean)
      : [];

    const missing = 8 - (left.length + right.length);

    if (halves.length === 1 && missing !== 0) {
      throw new Error('Invalid IPv6 address.');
    }

    const groups = halves.length === 2
      ? [...left, ...Array(Math.max(0, missing)).fill('0'), ...right]
      : [...left];

    if (groups.length !== 8) {
      throw new Error('Invalid IPv6 address.');
    }

    return groups.map((group) => group.padStart(4, '0'));
  }

  displayResult(result, queryType) {
    const resultsDiv = this.container.querySelector('#rdap-results');

    if (queryType === 'domain') {
      resultsDiv.innerHTML = this.formatDomainResult(result);
    } else {
      resultsDiv.innerHTML = this.formatIPResult(result);
    }
  }

  formatDomainResult(result) {
    const data = result.data;

    const events = this.getEvents(data);
    const statuses = Array.isArray(data.status) ? data.status : [];
    const nameservers = Array.isArray(data.nameservers) ? data.nameservers : [];
    const entities = Array.isArray(data.entities) ? data.entities : [];

    const registrar = this.findEntityByRole(entities, 'registrar');
    const registrant = this.findEntityByRole(entities, 'registrant');

    return `
      ${this.resultHeader(result)}

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Domain Information</h4>
        ${this.row('Domain Name', data.ldhName || data.unicodeName || result.query, true)}
        ${this.row('Object Class', data.objectClassName || 'domain')}
        ${this.row('Handle', data.handle || 'Not provided', true)}
        ${this.row('Port43 WHOIS', data.port43 || 'Not provided')}
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Registration Events</h4>
        ${
          events.length
            ? events.map((event) => this.row(
                this.eventLabel(event.eventAction),
                this.formatDate(event.eventDate)
              )).join('')
            : '<div class="text-sm text-gray-500 dark:text-gray-400">No event dates were returned.</div>'
        }
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Domain Status</h4>
        ${
          statuses.length
            ? `<div class="flex flex-wrap gap-2">
                ${statuses.map((status) => `
                  <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    ${this.escapeHtml(status)}
                  </span>
                `).join('')}
              </div>`
            : '<div class="text-sm text-gray-500 dark:text-gray-400">No status values were returned.</div>'
        }
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Name Servers</h4>
        ${
          nameservers.length
            ? `<div class="space-y-1">
                ${nameservers.map((ns) => `
                  <div class="text-sm font-mono text-gray-900 dark:text-white">
                    ${this.escapeHtml(ns.ldhName || ns.unicodeName || 'Unknown')}
                  </div>
                `).join('')}
              </div>`
            : '<div class="text-sm text-gray-500 dark:text-gray-400">No name servers were returned.</div>'
        }
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Entities</h4>
        ${this.entitySummary('Registrar', registrar)}
        ${this.entitySummary('Registrant', registrant)}
        ${
          !registrar && !registrant
            ? '<div class="text-sm text-gray-500 dark:text-gray-400">No registrar or registrant entity was returned.</div>'
            : ''
        }
      </div>

      ${this.rawJSONBlock(data)}
    `;
  }

  formatIPResult(result) {
    const data = result.data;

    const events = this.getEvents(data);
    const entities = Array.isArray(data.entities) ? data.entities : [];

    return `
      ${this.resultHeader(result)}

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Network Information</h4>
        ${this.row('IP Query', result.query, true)}
        ${this.row('Object Class', data.objectClassName || 'ip network')}
        ${this.row('Handle', data.handle || 'Not provided', true)}
        ${this.row('Name', data.name || 'Not provided')}
        ${this.row('Start Address', data.startAddress || 'Not provided', true)}
        ${this.row('End Address', data.endAddress || 'Not provided', true)}
        ${this.row('IP Version', data.ipVersion || 'Not provided')}
        ${this.row('Country', data.country || 'Not provided')}
        ${this.row('Parent Handle', data.parentHandle || 'Not provided', true)}
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Registration Events</h4>
        ${
          events.length
            ? events.map((event) => this.row(
                this.eventLabel(event.eventAction),
                this.formatDate(event.eventDate)
              )).join('')
            : '<div class="text-sm text-gray-500 dark:text-gray-400">No event dates were returned.</div>'
        }
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Entities</h4>
        ${
          entities.length
            ? entities.map((entity) => this.entityCard(entity)).join('')
            : '<div class="text-sm text-gray-500 dark:text-gray-400">No entity information was returned.</div>'
        }
      </div>

      ${this.rawJSONBlock(data)}
    `;
  }

  resultHeader(result) {
    return `
      <div class="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-lg p-4">
        <div class="flex flex-wrap justify-between gap-2">
          <div>
            <div class="font-semibold text-green-800 dark:text-green-200">✓ Live RDAP result</div>
            <div class="text-sm text-green-700 dark:text-green-300 mt-1">
              ${this.escapeHtml(result.query)}
            </div>
          </div>
          <div class="text-xs text-green-700 dark:text-green-300 break-all">
            ${this.escapeHtml(result.endpoint)}
          </div>
        </div>
      </div>
    `;
  }

  row(label, value, mono = false) {
    return `
      <div class="flex flex-col sm:flex-row sm:justify-between gap-1 py-1 text-sm">
        <span class="text-gray-600 dark:text-gray-400">${this.escapeHtml(label)}</span>
        <span class="${mono ? 'font-mono ' : ''}text-gray-900 dark:text-white sm:text-right break-all">
          ${this.escapeHtml(String(value))}
        </span>
      </div>
    `;
  }

  entitySummary(label, entity) {
    if (!entity) {
      return `
        <div class="mb-3">
          <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">${this.escapeHtml(label)}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Not returned by registry.</div>
        </div>
      `;
    }

    return `
      <div class="mb-4">
        <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">${this.escapeHtml(label)}</div>
        ${this.entityCard(entity)}
      </div>
    `;
  }

  entityCard(entity) {
    const vcard = this.getVCardProperties(entity);

    return `
      <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
        ${this.row('Handle', entity.handle || 'Not provided', true)}
        ${this.row('Roles', Array.isArray(entity.roles) ? entity.roles.join(', ') : 'Not provided')}
        ${this.row('Name', vcard.name || 'Not provided')}
        ${this.row('Organization', vcard.org || 'Not provided')}
        ${this.row('Email', vcard.email || 'Not provided')}
      </div>
    `;
  }

  getVCardProperties(entity) {
    const result = {
      name: '',
      org: '',
      email: ''
    };

    if (!Array.isArray(entity?.vcardArray) || entity.vcardArray.length < 2) {
      return result;
    }

    const properties = entity.vcardArray[1];

    for (const property of properties) {
      if (!Array.isArray(property) || property.length < 4) continue;

      const name = String(property[0]).toLowerCase();
      const value = Array.isArray(property[3])
        ? property[3].join(' ')
        : String(property[3] ?? '');

      if (name === 'fn') result.name = value;
      if (name === 'org') result.org = value;
      if (name === 'email') result.email = value;
    }

    return result;
  }

  findEntityByRole(entities, role) {
    return entities.find((entity) => (
      Array.isArray(entity?.roles) && entity.roles.includes(role)
    )) || null;
  }

  getEvents(data) {
    return Array.isArray(data?.events) ? data.events : [];
  }

  eventLabel(action) {
   const labels = {
     registration: "Registration",
     reregistration: "Re-registration",
     "last changed": "Last Changed",
     "last update of RDAP database": "Last RDAP Database Update",
     expiration: "Expiration",
     deletion: "Deletion",
     reinstantiation: "Reinstantiation",
     transfer: "Transfer",
     "last update of WHOIS database": "Last WHOIS Database Update",
   };

    return labels[action] || action || 'Event';
  }

  formatDate(value) {
    if (!value) return 'Not provided';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  rawJSONBlock(data) {
    let formatted;

    try {
      formatted = JSON.stringify(data, null, 2);
    } catch {
      formatted = String(data);
    }

    return `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div class="flex justify-between items-center mb-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Raw RDAP JSON</h4>
          <button
            type="button"
            class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            data-action="toggle-raw"
          >
            Toggle
          </button>
        </div>
        <pre data-raw-output class="hidden text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">${this.escapeHtml(formatted)}</pre>
      </div>
    `;
  }

  addToHistory(query, type) {
    this.lookupHistory = [
      {
        query,
        type,
        timestamp: new Date().toLocaleTimeString()
      },
      ...this.lookupHistory.filter(
        (item) => !(item.query === query && item.type === type)
      )
    ].slice(0, 10);

    this.updateHistoryDisplay();
  }

  updateHistoryDisplay() {
    const historyDiv = this.container.querySelector('#lookup-history');

    if (!this.lookupHistory.length) {
      historyDiv.innerHTML = '<div class="text-gray-500 dark:text-gray-400 text-sm">No lookups yet</div>';
      return;
    }

    historyDiv.innerHTML = this.lookupHistory.map((item) => `
      <button
        type="button"
        class="history-item w-full flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 text-left"
        data-query="${this.escapeHtml(item.query)}"
        data-type="${this.escapeHtml(item.type)}"
      >
        <span class="flex-1 min-w-0">
          <span class="text-sm font-mono text-gray-900 dark:text-white break-all">${this.escapeHtml(item.query)}</span>
          <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">${item.type === 'ip' ? 'IP' : 'Domain'}</span>
        </span>
        <span class="text-xs text-gray-400 dark:text-gray-500 ml-2">${this.escapeHtml(item.timestamp)}</span>
      </button>
    `).join('');
  }

  async copyResults() {
    if (!this.lastResult) return;

    const text = JSON.stringify(this.lastResult.data, null, 2);

    try {
      await navigator.clipboard.writeText(text);

      const button = this.container.querySelector('[data-action="copy"]');
      const original = button.innerHTML;

      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Copied!
      `;

      setTimeout(() => {
        if (!button.isConnected) return;
        button.innerHTML = original;
      }, 1500);
    } catch {
      this.showError('Could not copy the RDAP JSON to the clipboard.');
    }
  }

  clear() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    this.lastResult = null;

    this.container.querySelector('#domain-input').value = '';
    this.container.querySelector('#query-type').value = 'auto';
    this.container.querySelector('#rdap-results').innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-12">
        Enter a domain name or IP address and click Lookup.
      </div>
    `;
    this.container.querySelector('#lookup-status').textContent = '';

    this.setCopyEnabled(false);
    this.clearError();
    this.updatePlaceholder();
  }

  setCopyEnabled(enabled) {
    const button = this.container.querySelector('[data-action="copy"]');
    button.disabled = !enabled;
    button.classList.toggle('opacity-50', !enabled);
    button.classList.toggle('cursor-not-allowed', !enabled);
  }

  showError(message) {
    const errorDiv = this.container.querySelector('[data-error]');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');

    const resultsDiv = this.container.querySelector('#rdap-results');
    resultsDiv.innerHTML = `
      <div class="text-red-600 dark:text-red-400 text-center py-12">
        ${this.escapeHtml(message)}
      </div>
    `;
  }

  clearError() {
    const errorDiv = this.container.querySelector('[data-error]');
    errorDiv.textContent = '';
    errorDiv.classList.add('hidden');
  }

  formatLookupError(error) {
    if (!error) return 'RDAP lookup failed.';

    if (error.message) {
      return error.message;
    }

    return 'RDAP lookup failed because the registry returned an unknown error.';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = String(text ?? '');
    return div.innerHTML;
  }
}
