const DOMAIN_BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";
const IPV4_BOOTSTRAP_URL = "https://data.iana.org/rdap/ipv4.json";
const IPV6_BOOTSTRAP_URL = "https://data.iana.org/rdap/ipv6.json";

const REQUEST_TIMEOUT_MS = 12000;
const MAX_HISTORY = 10;

export class RDAPLookup {
  constructor() {
    this.container = null;
    this.lookupHistory = this.loadHistory();
    this.abortController = null;
    this.lastResult = null;
    this.bootstrapCache = new Map();
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.attachEventListeners();
    this.renderHistory();
  }

  destroy() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.container = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-8">
          <div class="flex flex-wrap items-center gap-3 mb-2">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">RDAP Lookup</h1>
            <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
              Live
            </span>
          </div>
          <p class="text-gray-600 dark:text-gray-400">
            Query live domain and IP registration data using RDAP (Registration Data Access Protocol).
          </p>
        </div>

        <div class="mb-6 flex flex-wrap gap-2">
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            data-action="lookup"
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
                  <label for="rdap-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Domain Name / IP Address
                  </label>
                  <input
                    type="text"
                    id="rdap-input"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="example.com or 8.8.8.8"
                    spellcheck="false"
                    autocomplete="off"
                  />
                </div>

                <div>
                  <label for="rdap-query-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Query Type
                  </label>
                  <select
                    id="rdap-query-type"
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
                <button
                  class="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left"
                  data-example="google.com"
                >
                  google.com
                </button>
                <button
                  class="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left"
                  data-example="github.com"
                >
                  github.com
                </button>
                <button
                  class="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left"
                  data-example="8.8.8.8"
                >
                  8.8.8.8 (Google DNS)
                </button>
                <button
                  class="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left"
                  data-example="cloudflare.com"
                >
                  cloudflare.com
                </button>
                <button
                  class="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left"
                  data-example="1.1.1.1"
                >
                  1.1.1.1 (Cloudflare)
                </button>
              </div>
            </div>

            <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="flex items-center justify-between gap-3 mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Lookup History</h3>
                <button
                  class="text-xs text-red-600 dark:text-red-400 hover:underline"
                  data-action="clear-history"
                >
                  Clear
                </button>
              </div>
              <div id="rdap-history" class="space-y-2">
                <div class="text-gray-500 dark:text-gray-400 text-sm">No lookups yet</div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="flex flex-wrap justify-between items-center gap-2 mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">RDAP Information</h3>
                <div id="rdap-status" class="text-sm text-gray-600 dark:text-gray-400"></div>
              </div>

              <div id="rdap-results" class="space-y-4">
                <div class="text-gray-500 dark:text-gray-400 text-center py-12">
                  Enter a domain name or IP address and click Lookup.
                </div>
              </div>
            </div>

            <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                About RDAP
              </h4>
              <div class="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p>
                  RDAP is the modern HTTP/JSON registration-data protocol used by domain registries
                  and Regional Internet Registries.
                </p>
                <p>
                  Results come from the registry service selected through the IANA RDAP bootstrap registries.
                  Availability and returned fields depend on the registry.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded hidden"
          data-error
        ></div>
      </div>
    `;
  }

  attachEventListeners() {
    this.container
      .querySelector('[data-action="lookup"]')
      .addEventListener("click", () => {
        this.performLookup();
      });

    this.container
      .querySelector('[data-action="clear"]')
      .addEventListener("click", () => {
        this.clear();
      });

    this.container
      .querySelector('[data-action="copy"]')
      .addEventListener("click", () => {
        this.copyResults();
      });

    this.container
      .querySelector('[data-action="clear-history"]')
      .addEventListener("click", () => {
        this.clearHistory();
      });

    const input = this.container.querySelector("#rdap-input");

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.performLookup();
      }
    });

    this.container
      .querySelector("#rdap-query-type")
      .addEventListener("change", () => {
        this.updatePlaceholder();
      });

    this.container.querySelectorAll("[data-example]").forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.dataset.example;
        input.value = value;

        const type = this.isIPAddress(value) ? "ip" : "domain";
        this.container.querySelector("#rdap-query-type").value = type;

        this.performLookup();
      });
    });

    this.container
      .querySelector("#rdap-history")
      .addEventListener("click", (event) => {
        const button = event.target.closest("[data-history-index]");
        if (!button) return;

        const index = Number(button.dataset.historyIndex);
        const item = this.lookupHistory[index];
        if (!item) return;

        input.value = item.query;
        this.container.querySelector("#rdap-query-type").value = item.type;
        this.performLookup();
      });
  }

  updatePlaceholder() {
    const type = this.container.querySelector("#rdap-query-type").value;
    const input = this.container.querySelector("#rdap-input");

    if (type === "ip") {
      input.placeholder = "8.8.8.8 or 2001:4860:4860::8888";
    } else if (type === "domain") {
      input.placeholder = "example.com";
    } else {
      input.placeholder = "example.com or 8.8.8.8";
    }
  }

  async performLookup() {
    const input = this.container.querySelector("#rdap-input");
    const queryTypeSelect = this.container.querySelector("#rdap-query-type");
    const query = input.value.trim();

    this.hideError();

    if (!query) {
      this.showError("Please enter a domain name or IP address.");
      input.focus();
      return;
    }

    let type = queryTypeSelect.value;

    if (type === "auto") {
      type = this.isIPAddress(query) ? "ip" : "domain";
    }

    if (type === "ip" && !this.isIPAddress(query)) {
      this.showError(
        "The selected query type is IP Address, but the value is not a valid IPv4 or IPv6 address.",
      );
      return;
    }

    if (type === "domain" && !this.isValidDomain(query)) {
      this.showError("Please enter a valid domain name.");
      return;
    }

    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();

    const lookupButton = this.container.querySelector('[data-action="lookup"]');
    lookupButton.disabled = true;
    lookupButton.classList.add("opacity-60", "cursor-not-allowed");

    this.setStatus("Finding RDAP service…");

    try {
      const rdapUrl = await this.resolveRDAPUrl(
        query,
        type,
        this.abortController.signal,
      );

      this.setStatus("Querying registry…");

      const response = await this.fetchWithTimeout(
        rdapUrl,
        {
          method: "GET",
          headers: {
            Accept: "application/rdap+json, application/json;q=0.9",
          },
          signal: this.abortController.signal,
        },
        REQUEST_TIMEOUT_MS,
      );

      const text = await response.text();

      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(
          "The RDAP server returned a response that is not valid JSON.",
        );
      }

      if (!response.ok) {
        const serverMessage =
          data?.errorCode ||
          data?.title ||
          data?.description ||
          `HTTP ${response.status}`;

        throw new Error(`RDAP request failed: ${serverMessage}`);
      }

      if (!data || typeof data !== "object") {
        throw new Error(
          "The RDAP server returned an empty or invalid response.",
        );
      }

      this.lastResult = {
        query,
        type,
        url: rdapUrl,
        data,
      };

      this.addHistory({ query, type });
      this.renderResults(data, rdapUrl, response.status);
      this.setStatus(`HTTP ${response.status}`);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      console.error("RDAP lookup failed:", error);
      this.lastResult = null;
      this.setStatus("Lookup failed");
      this.showError(this.getFriendlyError(error));
    } finally {
      lookupButton.disabled = false;
      lookupButton.classList.remove("opacity-60", "cursor-not-allowed");
      this.abortController = null;
    }
  }

  async resolveRDAPUrl(query, type, signal) {
    if (type === "domain") {
      const bootstrap = await this.getBootstrap(DOMAIN_BOOTSTRAP_URL, signal);
      const service = this.findDomainService(bootstrap, query);

      if (!service) {
        throw new Error(
          `No RDAP service was found in the IANA bootstrap registry for "${query}".`,
        );
      }

      return this.buildLookupUrl(service, "domain", query);
    }

    const isIPv6 = query.includes(":");
    const bootstrapUrl = isIPv6 ? IPV6_BOOTSTRAP_URL : IPV4_BOOTSTRAP_URL;
    const bootstrap = await this.getBootstrap(bootstrapUrl, signal);
    const service = this.findIPService(bootstrap, query);

    if (!service) {
      throw new Error(
        `No RDAP service was found in the IANA bootstrap registry for "${query}".`,
      );
    }

    return this.buildLookupUrl(service, "ip", query);
  }

  async getBootstrap(url, signal) {
    if (this.bootstrapCache.has(url)) {
      return this.bootstrapCache.get(url);
    }

    const response = await this.fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal,
      },
      REQUEST_TIMEOUT_MS,
    );

    if (!response.ok) {
      throw new Error(
        `Unable to load the IANA RDAP bootstrap registry (HTTP ${response.status}).`,
      );
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.services)) {
      throw new Error(
        "The IANA RDAP bootstrap registry returned an invalid structure.",
      );
    }

    this.bootstrapCache.set(url, data);
    return data;
  }

  findDomainService(bootstrap, domain) {
    const normalized = domain.toLowerCase().replace(/\.$/, "");

    for (const service of bootstrap.services) {
      const tlds = service[0];
      const urls = service[1];

      if (!Array.isArray(tlds) || !Array.isArray(urls)) continue;

      const matches = tlds.some((tld) => {
        const cleanTld = String(tld).toLowerCase().replace(/^\./, "");
        return normalized === cleanTld || normalized.endsWith(`.${cleanTld}`);
      });

      if (matches && urls.length > 0) {
        return urls[0];
      }
    }

    return null;
  }

  findIPService(bootstrap, ip) {
    const value = this.ipToComparable(ip);

    if (value === null) return null;

    for (const service of bootstrap.services) {
      const ranges = service[0];
      const urls = service[1];

      if (!Array.isArray(ranges) || !Array.isArray(urls)) continue;

      for (const cidr of ranges) {
        if (this.ipInCIDR(value, cidr)) {
          return urls[0] || null;
        }
      }
    }

    return null;
  }

  buildLookupUrl(baseUrl, type, value) {
    const normalizedBase = String(baseUrl).replace(/\/+$/, "");
    const encodedValue = encodeURIComponent(
      type === "domain" ? value.toLowerCase().replace(/\.$/, "") : value,
    );

    return `${normalizedBase}/${type}/${encodedValue}`;
  }

  async fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const externalSignal = options.signal;

    const onAbort = () => controller.abort();

    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener("abort", onAbort, { once: true });
      }
    }

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) {
        const timeoutError = new Error("Request timed out.");
        timeoutError.name = externalSignal?.aborted
          ? "AbortError"
          : "TimeoutError";
        throw timeoutError;
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", onAbort);
    }
  }

  renderResults(data, rdapUrl, statusCode) {
    const results = this.container.querySelector("#rdap-results");
    const copyButton = this.container.querySelector('[data-action="copy"]');

    copyButton.disabled = false;

    const objectClassName = this.escapeHtml(data.objectClassName || "unknown");
    const handle = this.escapeHtml(data.handle || "—");
    const name = this.escapeHtml(
      data.ldhName || data.unicodeName || data.name || data.handle || "—",
    );

    const statusList = Array.isArray(data.status)
      ? data.status.map((item) => this.escapeHtml(item)).join(", ")
      : "—";

    const events = this.renderEvents(data.events);
    const entities = this.renderEntities(data.entities);
    const nameservers = this.renderNameservers(data.nameservers);
    const remarks = this.renderRemarks(data.remarks);
    const links = this.renderLinks(data.links);

    results.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${this.infoCard("Object", objectClassName)}
        ${this.infoCard("Name / Address", name)}
        ${this.infoCard("Handle", handle)}
        ${this.infoCard("Status", statusList)}
      </div>

      ${events}
      ${entities}
      ${nameservers}
      ${remarks}
      ${links}

      <div class="mt-6">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h4 class="font-semibold text-gray-900 dark:text-white">Raw RDAP JSON</h4>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            HTTP ${this.escapeHtml(String(statusCode))}
          </span>
        </div>

        <pre
  class="rdap-json-output max-h-[520px] overflow-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 p-4 text-sm leading-6 whitespace-pre-wrap break-words text-gray-800 dark:text-gray-100"
><code class="font-mono text-inherit bg-transparent">${this.escapeHtml(
      JSON.stringify(data, null, 2),
    )}</code></pre>

        <div class="mt-3">
          <a
            href="${this.escapeHtml(rdapUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            Open RDAP response
          </a>
        </div>
      </div>
    `;
  }

  infoCard(label, value) {
    return `
      <div class="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4">
        <div class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
          ${this.escapeHtml(label)}
        </div>
        <div class="text-sm font-medium text-gray-900 dark:text-white break-words">
          ${value}
        </div>
      </div>
    `;
  }

  renderEvents(events) {
    if (!Array.isArray(events) || events.length === 0) return "";

    const items = events
      .map((event) => {
        const action = this.escapeHtml(event.eventAction || "event");
        const date = event.eventDate ? this.formatDate(event.eventDate) : "—";

        return `
          <div class="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-gray-200 dark:border-gray-600 py-2 last:border-0">
            <span class="font-medium text-gray-700 dark:text-gray-200">${action}</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">${this.escapeHtml(date)}</span>
          </div>
        `;
      })
      .join("");

    return `
      <div class="mt-6">
        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Events</h4>
        <div class="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4">
          ${items}
        </div>
      </div>
    `;
  }

  renderEntities(entities) {
    if (!Array.isArray(entities) || entities.length === 0) return "";

    const items = entities
      .map((entity) => {
        const roles = Array.isArray(entity.roles)
          ? entity.roles.map((role) => this.escapeHtml(role)).join(", ")
          : "—";

        const handle = this.escapeHtml(entity.handle || "—");
        const name = this.escapeHtml(
          this.getVCardField(entity.vcardArray, "fn") ||
            entity.handle ||
            "Entity",
        );

        return `
          <div class="border-b border-gray-200 dark:border-gray-600 py-3 last:border-0">
            <div class="flex flex-wrap justify-between gap-2">
              <span class="font-medium text-gray-800 dark:text-gray-200">${name}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">${handle}</span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Roles: ${roles}
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="mt-6">
        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Entities</h4>
        <div class="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4">
          ${items}
        </div>
      </div>
    `;
  }

  renderNameservers(nameservers) {
    if (!Array.isArray(nameservers) || nameservers.length === 0) return "";

    const items = nameservers
      .map((server) => {
        const name = this.escapeHtml(
          server.ldhName || server.unicodeName || "—",
        );
        const addresses = Array.isArray(server.ipAddresses)
          ? Object.values(server.ipAddresses)
              .flat()
              .map((ip) => this.escapeHtml(ip))
              .join(", ")
          : "";

        return `
          <div class="border-b border-gray-200 dark:border-gray-600 py-2 last:border-0">
            <div class="font-medium text-gray-800 dark:text-gray-200">${name}</div>
            ${addresses ? `<div class="text-sm text-gray-600 dark:text-gray-400">${addresses}</div>` : ""}
          </div>
        `;
      })
      .join("");

    return `
      <div class="mt-6">
        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Name Servers</h4>
        <div class="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4">
          ${items}
        </div>
      </div>
    `;
  }

  renderRemarks(remarks) {
    if (!Array.isArray(remarks) || remarks.length === 0) return "";

    const text = remarks
      .flatMap((remark) =>
        Array.isArray(remark.description) ? remark.description : [],
      )
      .map((line) => this.escapeHtml(line))
      .join("<br>");

    if (!text) return "";

    return `
      <div class="mt-6">
        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Remarks</h4>
        <div class="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 text-sm text-gray-700 dark:text-gray-300 break-words">
          ${text}
        </div>
      </div>
    `;
  }

  renderLinks(links) {
    if (!Array.isArray(links) || links.length === 0) return "";

    const items = links
      .map((link) => {
        if (!link || typeof link.href !== "string") return "";

        const href = this.escapeHtml(link.href);
        const rel = this.escapeHtml(link.rel || "related");
        const value = this.escapeHtml(link.value || link.href);

        return `
          <li>
            <a
              href="${href}"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 dark:text-blue-400 hover:underline break-all"
            >
              ${rel}: ${value}
            </a>
          </li>
        `;
      })
      .filter(Boolean)
      .join("");

    if (!items) return "";

    return `
      <div class="mt-6">
        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Links</h4>
        <ul class="list-disc list-inside space-y-1 text-sm">
          ${items}
        </ul>
      </div>
    `;
  }

  getVCardField(vcardArray, fieldName) {
    if (!Array.isArray(vcardArray) || !Array.isArray(vcardArray[1])) {
      return "";
    }

    const field = vcardArray[1].find(
      (item) => Array.isArray(item) && item[0] === fieldName,
    );

    if (!field) return "";

    const value = field[3];
    return typeof value === "string" ? value : "";
  }

  formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  async copyResults() {
    if (!this.lastResult?.data) return;

    const text = JSON.stringify(this.lastResult.data, null, 2);

    try {
      await navigator.clipboard.writeText(text);
      this.setStatus("JSON copied");
    } catch {
      this.showError("Unable to copy the RDAP JSON to the clipboard.");
    }
  }

  clear() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    const input = this.container.querySelector("#rdap-input");
    const select = this.container.querySelector("#rdap-query-type");
    const results = this.container.querySelector("#rdap-results");
    const copyButton = this.container.querySelector('[data-action="copy"]');

    input.value = "";
    select.value = "auto";
    results.innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-12">
        Enter a domain name or IP address and click Lookup.
      </div>
    `;

    copyButton.disabled = true;
    this.lastResult = null;
    this.setStatus("");
    this.hideError();
    this.updatePlaceholder();
    input.focus();
  }

  addHistory(item) {
    this.lookupHistory = [
      item,
      ...this.lookupHistory.filter(
        (entry) => !(entry.query === item.query && entry.type === item.type),
      ),
    ].slice(0, MAX_HISTORY);

    try {
      localStorage.setItem(
        "rdapLookupHistory",
        JSON.stringify(this.lookupHistory),
      );
    } catch {
      // Ignore storage failures.
    }

    this.renderHistory();
  }

  loadHistory() {
    try {
      const stored = JSON.parse(
        localStorage.getItem("rdapLookupHistory") || "[]",
      );
      return Array.isArray(stored) ? stored.slice(0, MAX_HISTORY) : [];
    } catch {
      return [];
    }
  }

  clearHistory() {
    this.lookupHistory = [];

    try {
      localStorage.removeItem("rdapLookupHistory");
    } catch {
      // Ignore storage failures.
    }

    this.renderHistory();
  }

  renderHistory() {
    const history = this.container?.querySelector("#rdap-history");
    if (!history) return;

    if (this.lookupHistory.length === 0) {
      history.innerHTML = `
        <div class="text-gray-500 dark:text-gray-400 text-sm">No lookups yet</div>
      `;
      return;
    }

    history.innerHTML = this.lookupHistory
      .map(
        (item, index) => `
        <button
          type="button"
          data-history-index="${index}"
          class="w-full text-left px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
        >
          <div class="text-sm font-medium text-gray-800 dark:text-gray-200 break-all">
            ${this.escapeHtml(item.query)}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ${this.escapeHtml(item.type.toUpperCase())}
          </div>
        </button>
      `,
      )
      .join("");
  }

  setStatus(message) {
    const status = this.container?.querySelector("#rdap-status");
    if (status) {
      status.textContent = message;
    }
  }

  showError(message) {
    const errorBox = this.container?.querySelector("[data-error]");
    if (!errorBox) return;

    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
  }

  hideError() {
    const errorBox = this.container?.querySelector("[data-error]");
    if (!errorBox) return;

    errorBox.textContent = "";
    errorBox.classList.add("hidden");
  }

  getFriendlyError(error) {
    if (error?.name === "TimeoutError") {
      return "The RDAP request timed out. The registry may be slow or temporarily unavailable.";
    }

    if (error?.name === "TypeError") {
      return "The RDAP request could not be completed. The registry may block browser requests (CORS), be unavailable, or have a network problem.";
    }

    return error?.message || "RDAP lookup failed.";
  }

  isValidDomain(value) {
    const domain = value.trim().replace(/\.$/, "");

    if (!domain || domain.length > 253 || !domain.includes(".")) {
      return false;
    }

    if (/[\s/\\?#]/.test(domain)) {
      return false;
    }

    const labels = domain.split(".");

    return labels.every(
      (label) =>
        label.length >= 1 &&
        label.length <= 63 &&
        !label.startsWith("-") &&
        !label.endsWith("-") &&
        /^[a-zA-Z0-9\u0080-\uffff-]+$/.test(label),
    );
  }

  isIPAddress(value) {
    return this.isIPv4(value) || this.isIPv6(value);
  }

  isIPv4(value) {
    const parts = value.split(".");
    if (parts.length !== 4) return false;

    return parts.every((part) => {
      if (!/^\d+$/.test(part)) return false;
      const number = Number(part);
      return number >= 0 && number <= 255;
    });
  }

  isIPv6(value) {
    if (!value.includes(":")) return false;
    if (value.includes("%")) return false;

    const parts = value.split("::");

    if (parts.length > 2) return false;

    const validatePart = (part) => {
      if (!part) return true;

      const groups = part.split(":");

      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];

        if (group.includes(".")) {
          if (i !== groups.length - 1 || !this.isIPv4(group)) {
            return false;
          }
          continue;
        }

        if (!/^[0-9a-fA-F]{1,4}$/.test(group)) {
          return false;
        }
      }

      return true;
    };

    if (!validatePart(parts[0])) return false;
    if (parts.length === 2 && !validatePart(parts[1])) return false;

    const countGroups = (part) => {
      if (!part) return 0;

      return part.split(":").reduce((total, group) => {
        if (group.includes(".")) return total + 2;
        return total + 1;
      }, 0);
    };

    const leftGroups = countGroups(parts[0]);
    const rightGroups = parts.length === 2 ? countGroups(parts[1]) : 0;

    if (parts.length === 1) {
      return leftGroups === 8;
    }

    return leftGroups + rightGroups < 8;
  }

  ipToComparable(ip) {
    if (this.isIPv4(ip)) {
      return ip
        .split(".")
        .map((part) => Number(part).toString(16).padStart(2, "0"))
        .join("");
    }

    if (!this.isIPv6(ip)) return null;

    const groups = this.expandIPv6(ip);
    if (!groups) return null;

    return groups.join("");
  }

  expandIPv6(ip) {
    let value = ip.toLowerCase();

    if (value.includes(".")) {
      const lastColon = value.lastIndexOf(":");
      const ipv4 = value.slice(lastColon + 1);

      if (!this.isIPv4(ipv4)) return null;

      const parts = ipv4.split(".").map(Number);
      const first = ((parts[0] << 8) | parts[1]).toString(16).padStart(4, "0");
      const second = ((parts[2] << 8) | parts[3]).toString(16).padStart(4, "0");

      value = `${value.slice(0, lastColon)}:${first}:${second}`;
    }

    const pieces = value.split("::");

    if (pieces.length > 2) return null;

    const left = pieces[0] ? pieces[0].split(":") : [];
    const right = pieces.length === 2 && pieces[1] ? pieces[1].split(":") : [];

    const total = left.length + right.length;

    if (pieces.length === 1) {
      if (total !== 8) return null;
      return [...left].map((group) => group.padStart(4, "0"));
    }

    const missing = 8 - total;

    if (missing <= 0) return null;

    return [
      ...left,
      ...Array.from({ length: missing }, () => "0000"),
      ...right,
    ].map((group) => group.padStart(4, "0"));
  }

  ipInCIDR(ipHex, cidr) {
    const [network, prefixText] = String(cidr).split("/");
    const prefix = Number(prefixText);

    if (!network || !Number.isInteger(prefix)) return false;

    const networkHex = this.ipToComparable(network);
    if (!networkHex || networkHex.length !== ipHex.length) return false;

    const maxBits = ipHex.length * 4;

    if (prefix < 0 || prefix > maxBits) return false;

    const fullNibbles = Math.floor(prefix / 4);
    const remainingBits = prefix % 4;

    if (
      fullNibbles > 0 &&
      ipHex.slice(0, fullNibbles) !== networkHex.slice(0, fullNibbles)
    ) {
      return false;
    }

    if (remainingBits === 0) return true;

    const ipNibble = parseInt(ipHex[fullNibbles], 16);
    const networkNibble = parseInt(networkHex[fullNibbles], 16);
    const mask = 0xf << (4 - remainingBits);

    return (ipNibble & mask) === (networkNibble & mask);
  }

  escapeHtml(value) {
    const text = String(value ?? "");

    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
