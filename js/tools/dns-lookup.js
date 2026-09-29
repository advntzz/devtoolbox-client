export class DNSLookup {
  constructor() {
    this.container = null;
    this.lookupHistory = [];
    this.abortController = null;
    this.timeoutId = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.attachEventListeners();
    this.updateHistoryDisplay();
  }

  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">DNS Lookup</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Query live DNS records using DNS over HTTPS (DoH)
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
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
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
                    placeholder="example.com"
                    value="example.com"
                    autocomplete="off"
                    spellcheck="false"
                  />
                  <p id="input-help" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter a domain for normal DNS records, or an IPv4/IPv6 address for PTR.
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Record Types
                  </label>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 record-types">
                    ${this.renderRecordCheckbox("A", "A (IPv4)", true)}
                    ${this.renderRecordCheckbox("AAAA", "AAAA (IPv6)", false)}
                    ${this.renderRecordCheckbox("MX", "MX (Mail)", true)}
                    ${this.renderRecordCheckbox("TXT", "TXT", true)}
                    ${this.renderRecordCheckbox("NS", "NS", true)}
                    ${this.renderRecordCheckbox("CNAME", "CNAME", false)}
                    ${this.renderRecordCheckbox("SOA", "SOA", false)}
                    ${this.renderRecordCheckbox("PTR", "PTR (Reverse DNS)", false)}
                    ${this.renderRecordCheckbox("CAA", "CAA", false)}
                  </div>
                </div>

                <div>
                  <label for="dns-server" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    DNS Resolver
                  </label>
                  <select
                    id="dns-server"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="cloudflare">Cloudflare DoH (1.1.1.1)</option>
                    <option value="google">Google DoH (8.8.8.8)</option>
                  </select>
                </div>

                <div>
                  <label for="query-class" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Query Class
                  </label>
                  <select
                    id="query-class"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="IN">IN (Internet)</option>
                  </select>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Internet (IN) is supported by the selected browser DoH resolvers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">DNS Records</h3>
                <span id="lookup-status" class="text-xs text-gray-500 dark:text-gray-400"></span>
              </div>
              <div id="dns-results" class="space-y-3">
                <div class="text-gray-500 dark:text-gray-400 text-center py-8">
                  Enter a domain and click Lookup to query live DNS records
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lookup History</h3>
              <div id="lookup-history" class="space-y-2"></div>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Examples</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            ${this.renderExampleButton("google.com")}
            ${this.renderExampleButton("github.com")}
            ${this.renderExampleButton("cloudflare.com")}
            ${this.renderExampleButton("stackoverflow.com")}
            ${this.renderExampleButton("wikipedia.org")}
            ${this.renderExampleButton("amazon.com")}
          </div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
          <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            DNS Lookup Information
          </h4>
          <p class="text-sm text-blue-700 dark:text-blue-300">
            • Uses real DNS over HTTPS (DoH) resolvers<br/>
            • Cloudflare and Google queries return live DNS records<br/>
            • Results include record values and TTL from the resolver<br/>
            • Queries are performed directly from your browser<br/>
            • No simulated or randomly generated DNS records are used
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">DNS Record Types</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${this.renderRecordInfo("A", "Maps a domain to an IPv4 address")}
            ${this.renderRecordInfo("AAAA", "Maps a domain to an IPv6 address")}
            ${this.renderRecordInfo("MX", "Mail exchange servers for the domain")}
            ${this.renderRecordInfo("TXT", "Text records such as SPF, DKIM, and verification records")}
            ${this.renderRecordInfo("NS", "Authoritative name servers for the domain")}
            ${this.renderRecordInfo("CNAME", "Canonical name / alias for a hostname")}
            ${this.renderRecordInfo("SOA", "Start of Authority information for a DNS zone")}
            ${this.renderRecordInfo("PTR", "Reverse DNS pointer record")}
            ${this.renderRecordInfo("CAA", "Certificate Authority Authorization")}
          </div>
        </div>
      </div>
    `;
  }

  renderRecordCheckbox(value, label, checked = false) {
    return `
      <label class="flex items-center">
        <input
          type="checkbox"
          value="${value}"
          ${checked ? "checked" : ""}
          class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
        >
        <span class="text-sm text-gray-700 dark:text-gray-300">${label}</span>
      </label>
    `;
  }

  renderExampleButton(domain) {
    const safeDomain = this.escapeHtml(domain);
    return `
      <button
        class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
        data-example="${safeDomain}"
        type="button"
      >${safeDomain}</button>
    `;
  }

  renderRecordInfo(type, description) {
    return `
      <div class="text-sm text-gray-700 dark:text-gray-300">
        <strong class="text-gray-900 dark:text-white">${type}:</strong> ${description}
      </div>
    `;
  }

  attachEventListeners() {
    this.container
      .querySelector('[data-action="lookup"]')
      ?.addEventListener("click", () => {
        this.performLookup();
      });

    this.container
      .querySelector('[data-action="clear"]')
      ?.addEventListener("click", () => {
        this.clear();
      });

    this.container
      .querySelector("#domain-input")
      ?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.performLookup();
        }
      });

    this.container
      .querySelector("#domain-input")
      ?.addEventListener("input", () => {
        this.updateInputHelp();
      });

    this.container
      .querySelectorAll('.record-types input[type="checkbox"]')
      .forEach((input) => {
        input.addEventListener("change", () => this.updateInputHelp());
      });

    this.container.querySelectorAll("[data-example]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = this.container.querySelector("#domain-input");
        if (!input) return;

        input.value = btn.dataset.example || "";
        this.updateInputHelp();
        this.performLookup();
      });
    });

    this.container.addEventListener("click", (e) => {
      const historyItem = e.target.closest(".history-item");
      if (!historyItem || !this.container.contains(historyItem)) return;

      const domain = historyItem.dataset.domain;
      if (!domain) return;

      const input = this.container.querySelector("#domain-input");
      if (!input) return;

      input.value = domain;
      this.updateInputHelp();
      this.performLookup();
    });
  }

  async performLookup() {
    const input = this.container.querySelector("#domain-input");
    const domain = input?.value.trim() || "";

    if (!domain) {
      this.showError("Please enter a domain name or IP address.");
      return;
    }

    const recordTypes = Array.from(
      this.container.querySelectorAll(
        '.record-types input[type="checkbox"]:checked',
      ),
    ).map((input) => input.value);

    if (recordTypes.length === 0) {
      this.showError("Please select at least one record type.");
      return;
    }

    const hasPTR = recordTypes.includes("PTR");
    const hasNonPTR = recordTypes.some((type) => type !== "PTR");

    if (hasPTR && hasNonPTR) {
      this.showError(
        "PTR is a reverse-DNS lookup and must be queried by itself.",
      );
      return;
    }

    if (hasPTR) {
      if (!this.isValidIPAddress(domain)) {
        this.showError("PTR lookup requires a valid IPv4 or IPv6 address.");
        return;
      }
    } else if (!this.isValidDomain(domain)) {
      this.showError("Invalid domain format. Example: example.com");
      return;
    }

    const dnsServer =
      this.container.querySelector("#dns-server")?.value || "cloudflare";
    const queryClass =
      this.container.querySelector("#query-class")?.value || "IN";

    this.cancelActiveLookup();

    const resultsDiv = this.container.querySelector("#dns-results");
    const status = this.container.querySelector("#lookup-status");

    if (resultsDiv) {
      resultsDiv.innerHTML = `
        <div class="text-gray-500 dark:text-gray-400 text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <div class="mt-2">Performing live DNS lookup...</div>
        </div>
      `;
    }

    if (status) {
      status.textContent = "Querying...";
    }

    this.abortController = new AbortController();

    this.timeoutId = setTimeout(() => {
      this.abortController?.abort();
    }, 10000);

    try {
      const results = await this.performRealLookup(
        domain,
        recordTypes,
        dnsServer,
        queryClass,
        this.abortController.signal,
      );

      this.displayResults(results);
      this.addToHistory(domain);

      if (status) {
        status.textContent = "Complete";
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        this.showError("DNS lookup timed out or was cancelled.");
      } else {
        this.showError(`Lookup failed: ${error?.message || "Unknown error"}`);
      }
    } finally {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      this.abortController = null;
    }
  }

  async performRealLookup(domain, recordTypes, dnsServer, queryClass, signal) {
    const results = {
      domain,
      timestamp: new Date().toISOString(),
      server: this.getDNSServerInfo(dnsServer),
      records: {},
      status: 0,
    };

    for (const type of recordTypes) {
      if (signal?.aborted) {
        throw new DOMException("DNS lookup cancelled", "AbortError");
      }

      const queryName = type === "PTR" ? this.ipToReverseName(domain) : domain;

      const data = await this.queryDNS(
        queryName,
        type,
        dnsServer,
        queryClass,
        signal,
      );

      results.status = data.Status ?? 0;

      if (data.Status !== undefined && data.Status !== 0) {
        const message = this.getDNSStatusMessage(data.Status);
        throw new Error(`${message} (${type})`);
      }

      results.records[type] = this.normalizeDNSRecords(data, type);
    }

    return results;
  }

  async queryDNS(domain, type, dnsServer, queryClass, signal) {
    const encodedDomain = encodeURIComponent(domain);
    const encodedType = encodeURIComponent(type);

    let url;
    let headers = {
      Accept: "application/dns-json",
    };

    switch (dnsServer) {
      case "google":
        url =
          `https://dns.google/resolve` +
          `?name=${encodedDomain}` +
          `&type=${encodedType}` +
          `&cd=false`;
        break;

      case "cloudflare":
      default:
        url =
          `https://cloudflare-dns.com/dns-query` +
          `?name=${encodedDomain}` +
          `&type=${encodedType}` +
          `&ct=application/dns-json`;

        headers = {
          Accept: "application/dns-json",
        };
        break;
    }

    if (queryClass !== "IN") {
      throw new Error(
        "Only the IN (Internet) query class is supported by this browser DoH mode.",
      );
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      signal,
    });

    if (!response.ok) {
      throw new Error(`DNS resolver returned HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data || typeof data !== "object") {
      throw new Error("Invalid DNS response.");
    }

    return data;
  }

  normalizeDNSRecords(data, requestedType) {
    if (!data || !Array.isArray(data.Answer)) {
      return [];
    }

    return data.Answer.filter(
      (answer) => this.getRecordTypeName(answer.type) === requestedType,
    ).map((answer) => {
      const value = answer.data ?? "";

      return {
        name: String(answer.name || ""),
        type: this.getRecordTypeName(answer.type),
        ttl: Number.isFinite(Number(answer.TTL)) ? Number(answer.TTL) : 0,
        value: String(value),
        priority: answer.type === 15 ? this.parseMXPriority(value) : null,
        raw: String(value),
      };
    });
  }

  parseMXPriority(value) {
    const match = String(value).match(/^(\d+)\s+(.+)$/);
    return match ? Number(match[1]) : null;
  }

  getDNSStatusMessage(status) {
    const messages = {
      0: "No error",
      1: "Format error",
      2: "Server failure",
      3: "Domain does not exist",
      4: "Not implemented",
      5: "Query refused",
    };

    return messages[status] || `DNS server returned status ${status}`;
  }

  getRecordTypeName(typeNum) {
    const types = {
      1: "A",
      5: "CNAME",
      6: "SOA",
      12: "PTR",
      15: "MX",
      16: "TXT",
      28: "AAAA",
      2: "NS",
      257: "CAA",
    };

    return types[typeNum] || `Type${typeNum}`;
  }

  displayResults(results) {
    const resultsDiv = this.container.querySelector("#dns-results");
    if (!resultsDiv) return;

    resultsDiv.replaceChildren();

    const summary = document.createElement("div");
    summary.className = "bg-white dark:bg-gray-800 rounded-lg p-3 mb-3";

    const summaryTop = document.createElement("div");
    summaryTop.className = "flex justify-between items-start gap-4 flex-wrap";

    const summaryLeft = document.createElement("div");

    const domainEl = document.createElement("strong");
    domainEl.className = "text-gray-900 dark:text-white text-lg";
    domainEl.textContent = results.domain;

    const queriedAt = document.createElement("div");
    queriedAt.className = "text-sm text-gray-500 dark:text-gray-400";
    queriedAt.textContent = `Queried at ${new Date(results.timestamp).toLocaleTimeString()}`;

    summaryLeft.append(domainEl, queriedAt);

    const serverEl = document.createElement("div");
    serverEl.className = "text-sm text-gray-600 dark:text-gray-300";
    serverEl.textContent = `DNS Resolver: ${results.server.name} (${results.server.ip})`;

    summaryTop.append(summaryLeft, serverEl);
    summary.appendChild(summaryTop);
    resultsDiv.appendChild(summary);

    let displayedRecordCount = 0;

    for (const [type, records] of Object.entries(results.records)) {
      const section = document.createElement("div");
      section.className = "bg-white dark:bg-gray-800 rounded-lg p-3 mb-3";

      const heading = document.createElement("h4");
      heading.className =
        "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2";
      heading.textContent = `${type} Records`;

      const list = document.createElement("div");
      list.className = "space-y-2";

      if (!records.length) {
        const empty = document.createElement("div");
        empty.className = "text-sm text-gray-500 dark:text-gray-400 py-2";
        empty.textContent = "No records found.";
        list.appendChild(empty);
      } else {
        displayedRecordCount += records.length;
        records.forEach((record) => {
          list.appendChild(this.createRecordElement(type, record));
        });
      }

      section.append(heading, list);
      resultsDiv.appendChild(section);
    }

    if (displayedRecordCount === 0) {
      const empty = document.createElement("div");
      empty.className = "text-gray-500 dark:text-gray-400 text-center py-4";
      empty.textContent = "No DNS records found for the selected types.";
      resultsDiv.appendChild(empty);
    }
  }

  createRecordElement(type, record) {
    const wrapper = document.createElement("div");
    wrapper.className = "bg-gray-50 dark:bg-gray-700 rounded p-2 text-sm";

    if (type === "SOA") {
      const value = this.parseSOAValue(record.value);

      const grid = document.createElement("div");
      grid.className = "grid grid-cols-1 sm:grid-cols-2 gap-2";

      this.appendDetail(grid, "Primary NS", value.mname || "—");
      this.appendDetail(grid, "Admin Email", value.rname || "—");
      this.appendDetail(grid, "Serial", value.serial || "—");
      this.appendDetail(
        grid,
        "Refresh",
        value.refresh ? `${value.refresh}s` : "—",
      );
      this.appendDetail(grid, "Retry", value.retry ? `${value.retry}s` : "—");
      this.appendDetail(
        grid,
        "Expire",
        value.expire ? `${value.expire}s` : "—",
      );
      this.appendDetail(
        grid,
        "Min TTL",
        value.minimum ? `${value.minimum}s` : "—",
      );
      this.appendDetail(grid, "TTL", `${record.ttl}s`);

      wrapper.appendChild(grid);
      return wrapper;
    }

    if (type === "MX") {
      const row = document.createElement("div");
      row.className = "flex justify-between items-center gap-3 flex-wrap";

      const left = document.createElement("div");
      left.className = "flex items-center gap-2 min-w-0";

      if (record.priority !== null) {
        const priority = document.createElement("span");
        priority.className =
          "inline-block min-w-12 text-center bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded px-2 py-1";
        priority.textContent = String(record.priority);
        left.appendChild(priority);
      }

      const value = document.createElement("span");
      value.className = "font-mono text-gray-900 dark:text-white break-all";
      value.textContent = this.stripMXPriority(record.value);
      left.appendChild(value);

      const ttl = document.createElement("span");
      ttl.className =
        "text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap";
      ttl.textContent = `TTL: ${record.ttl}s`;

      row.append(left, ttl);
      wrapper.appendChild(row);
      return wrapper;
    }

    if (type === "CAA") {
      const parsed = this.parseCAAValue(record.value);

      const row = document.createElement("div");
      row.className = "flex justify-between items-center gap-3 flex-wrap";

      const left = document.createElement("div");
      left.className = "flex items-center gap-2 flex-wrap";

      this.appendBadge(left, `Flags: ${parsed.flags}`);
      this.appendBadge(left, parsed.tag);
      this.appendText(left, parsed.value ? `"${parsed.value}"` : record.value);

      const ttl = document.createElement("span");
      ttl.className =
        "text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap";
      ttl.textContent = `TTL: ${record.ttl}s`;

      row.append(left, ttl);
      wrapper.appendChild(row);
      return wrapper;
    }

    const row = document.createElement("div");
    row.className = "flex justify-between items-center gap-3 flex-wrap";

    const value = document.createElement("span");
    value.className = "font-mono text-gray-900 dark:text-white break-all";
    value.textContent = record.value;

    const ttl = document.createElement("span");
    ttl.className =
      "text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap";
    ttl.textContent = `TTL: ${record.ttl}s`;

    row.append(value, ttl);
    wrapper.appendChild(row);

    return wrapper;
  }

  appendDetail(parent, label, value) {
    const wrapper = document.createElement("div");

    const labelEl = document.createElement("span");
    labelEl.className = "text-gray-600 dark:text-gray-400";
    labelEl.textContent = `${label}: `;

    const valueEl = document.createElement("span");
    valueEl.className = "font-mono text-gray-900 dark:text-white break-all";
    valueEl.textContent = value;

    wrapper.append(labelEl, valueEl);
    parent.appendChild(wrapper);
  }

  appendBadge(parent, text) {
    const badge = document.createElement("span");
    badge.className =
      "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded px-2 py-1";
    badge.textContent = text;
    parent.appendChild(badge);
  }

  appendText(parent, text) {
    const span = document.createElement("span");
    span.className = "font-mono text-gray-900 dark:text-white break-all";
    span.textContent = text;
    parent.appendChild(span);
  }

  parseSOAValue(value) {
    const parts = String(value).trim().split(/\s+/);

    return {
      mname: parts[0] || "",
      rname: parts[1] || "",
      serial: parts[2] || "",
      refresh: parts[3] || "",
      retry: parts[4] || "",
      expire: parts[5] || "",
      minimum: parts[6] || "",
    };
  }

  parseCAAValue(value) {
    const match = String(value).match(/^(\d+)\s+([^\s]+)\s+"?([^"]*)"?$/);

    if (!match) {
      return {
        flags: "—",
        tag: "—",
        value: String(value),
      };
    }

    return {
      flags: match[1],
      tag: match[2],
      value: match[3],
    };
  }

  stripMXPriority(value) {
    return String(value).replace(/^\d+\s+/, "");
  }

  addToHistory(domain) {
    const normalized = String(domain).trim().toLowerCase();
    if (!normalized) return;

    this.lookupHistory = [
      normalized,
      ...this.lookupHistory.filter((item) => item !== normalized),
    ].slice(0, 10);

    this.updateHistoryDisplay();
  }

  updateHistoryDisplay() {
    const historyDiv = this.container?.querySelector("#lookup-history");
    if (!historyDiv) return;

    historyDiv.replaceChildren();

    if (this.lookupHistory.length === 0) {
      const empty = document.createElement("div");
      empty.className = "text-gray-500 dark:text-gray-400 text-sm";
      empty.textContent = "No lookup history yet";
      historyDiv.appendChild(empty);
      return;
    }

    this.lookupHistory.forEach((domain) => {
      const item = document.createElement("div");
      item.className =
        "history-item flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors";
      item.dataset.domain = domain;

      const icon = document.createElement("span");
      icon.className = "text-gray-400";
      icon.textContent = "◷";

      const text = document.createElement("span");
      text.className = "text-sm text-gray-700 dark:text-gray-300 break-all";
      text.textContent = domain;

      item.append(icon, text);
      historyDiv.appendChild(item);
    });
  }

  updateInputHelp() {
    const help = this.container?.querySelector("#input-help");
    const domain =
      this.container?.querySelector("#domain-input")?.value.trim() || "";
    const selectedTypes = Array.from(
      this.container?.querySelectorAll(
        '.record-types input[type="checkbox"]:checked',
      ) || [],
    ).map((input) => input.value);

    if (!help) return;

    if (selectedTypes.includes("PTR")) {
      help.textContent =
        "PTR lookup expects an IPv4 or IPv6 address and must be queried alone.";
      return;
    }

    if (domain) {
      help.textContent = "Enter a domain name such as example.com.";
    } else {
      help.textContent =
        "Enter a domain for normal DNS records, or an IP address for PTR.";
    }
  }

  isValidDomain(domain) {
    const value = String(domain).trim().replace(/\.$/, "");

    if (!value || value.length > 253) return false;
    if (value.includes("..")) return false;

    const labels = value.split(".");

    if (labels.length < 2) return false;

    return labels.every((label) => {
      if (!label || label.length > 63) return false;
      if (label.startsWith("-") || label.endsWith("-")) return false;
      return /^[a-zA-Z0-9-]+$/.test(label);
    });
  }

  isValidIPAddress(value) {
    return this.isValidIPv4(value) || this.isValidIPv6(value);
  }

  isValidIPv4(value) {
    const parts = String(value).trim().split(".");
    if (parts.length !== 4) return false;

    return parts.every((part) => {
      if (!/^\d{1,3}$/.test(part)) return false;
      const number = Number(part);
      return number >= 0 && number <= 255;
    });
  }

  isValidIPv6(value) {
    const input = String(value).trim();

    if (!input || !input.includes(":")) return false;
    if (input.includes(":::")) return false;

    const parts = input.split("::");

    if (parts.length > 2) return false;

    const validateGroups = (groups) => {
      if (!groups) return 0;

      const values = groups.split(":");
      if (values.some((group) => !/^[0-9a-fA-F]{1,4}$/.test(group))) {
        return -1;
      }

      return values.length;
    };

    if (parts.length === 2) {
      const leftCount = validateGroups(parts[0]);
      const rightCount = validateGroups(parts[1]);

      if (leftCount < 0 || rightCount < 0) return false;
      return leftCount + rightCount < 8;
    }

    return validateGroups(input) === 8;
  }

  ipToReverseName(ip) {
    if (this.isValidIPv4(ip)) {
      return `${ip.split(".").reverse().join(".")}.in-addr.arpa`;
    }

    return `${this.ipv6ToReverse(ip)}.ip6.arpa`;
  }

  ipv6ToReverse(ip) {
    let value = String(ip).toLowerCase();

    const parts = value.split("::");

    if (parts.length === 2) {
      const left = parts[0] ? parts[0].split(":") : [];
      const right = parts[1] ? parts[1].split(":") : [];
      const missing = 8 - left.length - right.length;
      const expanded = [
        ...left,
        ...Array(Math.max(0, missing)).fill("0"),
        ...right,
      ];
      value = expanded.map((group) => group.padStart(4, "0")).join(":");
    } else {
      value = value
        .split(":")
        .map((group) => group.padStart(4, "0"))
        .join(":");
    }

    return value.replace(/:/g, "").split("").reverse().join(".");
  }

  getDNSServerInfo(server) {
    const servers = {
      cloudflare: {
        name: "Cloudflare DoH",
        ip: "1.1.1.1",
      },
      google: {
        name: "Google DoH",
        ip: "8.8.8.8",
      },
    };

    return servers[server] || servers.cloudflare;
  }

  cancelActiveLookup() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  showError(message) {
    const resultsDiv = this.container?.querySelector("#dns-results");
    const status = this.container?.querySelector("#lookup-status");

    if (!resultsDiv) return;

    resultsDiv.replaceChildren();

    const box = document.createElement("div");
    box.className =
      "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded p-3";

    const text = document.createElement("p");
    text.className = "text-red-700 dark:text-red-300";
    text.textContent = String(message);

    box.appendChild(text);
    resultsDiv.appendChild(box);

    if (status) {
      status.textContent = "Failed";
    }
  }

  clear() {
    this.cancelActiveLookup();

    const input = this.container?.querySelector("#domain-input");
    const results = this.container?.querySelector("#dns-results");
    const status = this.container?.querySelector("#lookup-status");

    if (input) {
      input.value = "";
    }

    if (results) {
      results.innerHTML = `
        <div class="text-gray-500 dark:text-gray-400 text-center py-8">
          Enter a domain and click Lookup to query live DNS records
        </div>
      `;
    }

    if (status) {
      status.textContent = "";
    }

    this.container
      ?.querySelectorAll('.record-types input[type="checkbox"]')
      .forEach((input) => {
        input.checked = ["A", "MX", "TXT", "NS"].includes(input.value);
      });

    const queryClass = this.container?.querySelector("#query-class");
    if (queryClass) {
      queryClass.value = "IN";
    }

    const dnsServer = this.container?.querySelector("#dns-server");
    if (dnsServer) {
      dnsServer.value = "cloudflare";
    }

    this.updateInputHelp();
  }

  escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
  }
}
