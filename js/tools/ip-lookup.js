export class IPLookup {
  constructor() {
    this.container = null;
    this.lookupHistory = [];
    this.abortController = null;
    this.requestTimeout = 12000;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.attachEventListeners();
    this.detectCurrentIP();
  }

  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">IP Address Lookup</h1>
          <p class="text-gray-600 dark:text-gray-400">Get geolocation, ISP, and network information for any IP address</p>
        </div>

        <div class="mb-6 flex flex-wrap gap-2">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="lookup" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Lookup
          </button>

          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="current" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            My IP
          </button>

          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="clear" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="space-y-4">
                <div>
                  <label for="ip-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IP Address</label>
                  <input
                    type="text"
                    id="ip-input"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="8.8.8.8 or 2001:4860:4860::8888"
                    spellcheck="false"
                    autocomplete="off"
                    inputmode="text"
                  />
                </div>

                <div id="current-ip-display" class="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded hidden">
                  <div class="text-sm text-blue-700 dark:text-blue-300">Your Current IP</div>
                  <div class="text-lg font-mono font-semibold text-blue-900 dark:text-blue-100" id="current-ip"></div>
                </div>
              </div>
            </div>

            <div class="mt-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Examples</h3>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="8.8.8.8">Google DNS</button>
                <button type="button" class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="1.1.1.1">Cloudflare</button>
                <button type="button" class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="140.82.114.4">GitHub</button>
                <button type="button" class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="104.17.24.14">Cloudflare</button>
              </div>
            </div>
          </div>

          <div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">IP Information</h3>
              <div id="ip-results" class="space-y-3">
                <div class="text-gray-500 dark:text-gray-400 text-center py-8">
                  Enter an IP address and click Lookup to get information
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lookup History</h3>
          <div id="lookup-history" class="space-y-2">
            <div class="text-gray-500 dark:text-gray-400 text-sm">No lookups yet</div>
          </div>
        </div>

        <div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded hidden" data-error role="alert"></div>

        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
          <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">API Information</h4>
          <p class="text-sm text-blue-700 dark:text-blue-300">
            Public IP geolocation is provided by the ipapi.co service.
            <br/>• The free endpoint may be rate-limited.
            <br/>• Geolocation results are approximate and may vary by provider.
            <br/>• HTTPS API is used directly from your browser.
            <br/>• Private/reserved IP ranges are classified locally and are not sent to the geolocation API.
          </p>
        </div>
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
      .querySelector('[data-action="current"]')
      .addEventListener("click", () => {
        this.detectCurrentIP();
      });

    this.container
      .querySelector('[data-action="clear"]')
      .addEventListener("click", () => {
        this.clear();
      });

    this.container
      .querySelector("#ip-input")
      .addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          this.performLookup();
        }
      });

    this.container.querySelectorAll("[data-example]").forEach((button) => {
      button.addEventListener("click", () => {
        this.container.querySelector("#ip-input").value =
          button.dataset.example;
        this.performLookup();
      });
    });

    this.container.addEventListener("click", (event) => {
      const historyItem = event.target.closest(".history-item");
      if (!historyItem || !this.container.contains(historyItem)) return;

      const ip = historyItem.dataset.ip;
      if (!ip) return;

      this.container.querySelector("#ip-input").value = ip;
      this.performLookup();
    });
  }

  async detectCurrentIP() {
    const currentIpDisplay = this.container.querySelector(
      "#current-ip-display",
    );
    const currentIpElement = this.container.querySelector("#current-ip");
    const input = this.container.querySelector("#ip-input");

    try {
      this.clearError();
      currentIpElement.textContent = "Detecting...";
      currentIpDisplay.classList.remove("hidden");

      const currentIP = await this.getCurrentIP();

      if (!this.isValidIP(currentIP)) {
        throw new Error("The IP service returned an invalid IP address.");
      }

      currentIpElement.textContent = currentIP;
      input.value = currentIP;

      await this.performLookup();
    } catch (error) {
      currentIpDisplay.classList.add("hidden");

      if (error.name !== "AbortError") {
        this.showError(`Failed to detect current IP: ${error.message}`);
      }
    }
  }

  async getCurrentIP() {
    const endpoints = [
      "https://ipapi.co/json/",
      "https://api.ipify.org?format=json",
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const data = await this.fetchJson(endpoint);
        const ip = typeof data?.ip === "string" ? data.ip.trim() : "";

        if (this.isValidIP(ip)) {
          return ip;
        }

        throw new Error("Invalid IP returned by service.");
      } catch (error) {
        lastError = error;

        if (error.name === "AbortError") {
          throw error;
        }
      }
    }

    throw lastError || new Error("Unable to detect current IP address.");
  }

  async performLookup() {
    const input = this.container.querySelector("#ip-input");
    const resultsDiv = this.container.querySelector("#ip-results");
    const ip = input.value.trim();

    if (!ip) {
      this.showError("Please enter an IP address.");
      return;
    }

    if (!this.isValidIP(ip)) {
      this.showError(
        "Invalid IP address format. Use a valid IPv4 or IPv6 address.",
      );
      return;
    }

    this.clearError();

    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();

    resultsDiv.innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        <div class="mt-2">Looking up IP information...</div>
      </div>
    `;

    try {
      const ipInfo = await this.getIPInfo(ip, this.abortController.signal);
      this.displayResults(ipInfo);
      this.addToHistory(ip, ipInfo);
    } catch (error) {
      if (error.name === "AbortError") return;

      console.error("IP lookup failed:", error);
      this.showError(`Failed to lookup IP information: ${error.message}`);

      resultsDiv.innerHTML = `
        <div class="text-gray-500 dark:text-gray-400 text-center py-8">
          Unable to retrieve IP information.
        </div>
      `;
    } finally {
      this.abortController = null;
    }
  }

  async getIPInfo(ip, signal = undefined) {
    const type = this.getIPType(ip);
    const scope = this.getIPScope(ip);

    if (scope !== "public") {
      return this.buildLocalScopeInfo(ip, type, scope);
    }

    const encodedIP = encodeURIComponent(ip);
    const endpoint = `https://ipapi.co/${encodedIP}/json/`;
    const data = await this.fetchJson(endpoint, signal);

    if (data?.error) {
      throw new Error(
        data.reason || "The geolocation service rejected this IP.",
      );
    }

    if (typeof data?.ip !== "string" || !this.isValidIP(data.ip)) {
      throw new Error("The geolocation service returned an invalid response.");
    }

    return {
      ip: data.ip,
      type,
      continent: data.continent_code || "Unknown",
      continent_code: data.continent_code || "N/A",
      country: data.country_name || "Unknown",
      country_code: data.country_code || "N/A",
      region: data.region || "Unknown",
      region_code: data.region_code || "N/A",
      city: data.city || "Unknown",
      zip: data.postal || "N/A",
      latitude: this.normalizeCoordinate(data.latitude),
      longitude: this.normalizeCoordinate(data.longitude),
      timezone: data.timezone || "N/A",
      isp: data.org || "Unknown",
      org: data.org || "Unknown",
      as: data.asn
        ? String(data.asn).startsWith("AS")
          ? String(data.asn)
          : `AS${data.asn}`
        : "N/A",
      asname: data.org || "N/A",
      reverse: "N/A",
      mobile: false,
      proxy: false,
      hosting: false,
    };
  }

  async fetchJson(url, signal = undefined) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    const relayAbort = () => controller.abort();

    if (signal) {
      if (signal.aborted) {
        clearTimeout(timeoutId);
        throw new DOMException("Request aborted", "AbortError");
      }

      signal.addEventListener("abort", relayAbort, { once: true });
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        const timeoutError = new Error("Request timed out.");
        timeoutError.name = signal?.aborted ? "AbortError" : "TimeoutError";
        throw timeoutError;
      }

      throw new Error(error.message || "Network request failed.");
    } finally {
      clearTimeout(timeoutId);

      if (signal) {
        signal.removeEventListener("abort", relayAbort);
      }
    }
  }

  buildLocalScopeInfo(ip, type, scope) {
    const labels = {
      private: "Private Network",
      loopback: "Loopback",
      linkLocal: "Link-Local",
      unspecified: "Unspecified",
      documentation: "Documentation/Test Range",
      multicast: "Multicast",
      reserved: "Reserved Network",
    };

    const label = labels[scope] || "Non-Public Network";

    return {
      ip,
      type,
      continent: "N/A",
      continent_code: "N/A",
      country: label,
      country_code: "N/A",
      region: "N/A",
      region_code: "N/A",
      city: "N/A",
      zip: "N/A",
      latitude: null,
      longitude: null,
      timezone: "N/A",
      isp: label,
      org: label,
      as: "N/A",
      asname: "N/A",
      reverse: "N/A",
      mobile: false,
      proxy: false,
      hosting: false,
      scope,
    };
  }

  displayResults(info) {
    const resultsDiv = this.container.querySelector("#ip-results");

    const safe = (value) =>
      this.escapeHtml(
        value === null || value === undefined || value === ""
          ? "N/A"
          : String(value),
      );

    const safeCoordinate = (value) =>
      safe(value === null || value === undefined ? "N/A" : value);

    const scopeLabel =
      info.scope && info.scope !== "public"
        ? `<div class="mb-3 px-3 py-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm">
           This address is classified locally as <strong>${safe(this.getScopeLabel(info.scope))}</strong>.
           No geolocation API request was made.
         </div>`
        : "";

    resultsDiv.innerHTML = `
      <div class="space-y-3">
        ${scopeLabel}

        <div class="border-b border-gray-200 dark:border-gray-600 pb-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Basic Information</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">IP Address:</span>
              <span class="ml-2 font-mono text-gray-900 dark:text-white">${safe(info.ip)}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Type:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${safe(info.type)}</span>
            </div>
            ${
              info.reverse !== "N/A"
                ? `
            <div class="col-span-2">
              <span class="text-gray-500 dark:text-gray-400">Hostname:</span>
              <span class="ml-2 font-mono text-gray-900 dark:text-white text-xs">${safe(info.reverse)}</span>
            </div>
            `
                : ""
            }
          </div>
        </div>

        ${
          info.scope === "public" || !info.scope
            ? `
        <div class="border-b border-gray-200 dark:border-gray-600 pb-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">Country:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${safe(info.country)} (${safe(info.country_code)})</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Region:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${safe(info.region)}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">City:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${safe(info.city)}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">ZIP:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${safe(info.zip)}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Timezone:</span>
              <span class="ml-2 text-gray-900 dark:text-white text-xs">${safe(info.timezone)}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Coordinates:</span>
              <span class="ml-2 text-gray-900 dark:text-white text-xs">${safeCoordinate(info.latitude)}, ${safeCoordinate(info.longitude)}</span>
            </div>
          </div>
        </div>
        `
            : ""
        }

        <div class="border-b border-gray-200 dark:border-gray-600 pb-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Network Information</h4>
          <div class="space-y-1 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">ISP:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${safe(info.isp)}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Organization:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${safe(info.org)}</span>
            </div>
            ${
              info.as !== "N/A"
                ? `
            <div>
              <span class="text-gray-500 dark:text-gray-400">AS Number:</span>
              <span class="ml-2 font-mono text-gray-900 dark:text-white">${safe(info.as)} (${safe(info.asname)})</span>
            </div>
            `
                : ""
            }
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Attributes</h4>
          <div class="flex flex-wrap gap-2">
            <span class="px-2 py-1 text-xs rounded-full ${info.mobile ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}">
              ${info.mobile ? "📱" : "💻"} ${info.mobile ? "Mobile" : "Fixed"}
            </span>
            <span class="px-2 py-1 text-xs rounded-full ${info.proxy ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}">
              ${info.proxy ? "🔄" : "✓"} ${info.proxy ? "Proxy" : "Direct"}
            </span>
            <span class="px-2 py-1 text-xs rounded-full ${info.hosting ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}">
              ${info.hosting ? "🖥️" : "🏠"} ${info.hosting ? "Hosting" : "Residential"}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  addToHistory(ip, info) {
    this.lookupHistory.unshift({
      ip,
      country: info.country,
      isp: info.isp,
      timestamp: new Date().toLocaleTimeString(),
    });

    this.lookupHistory = this.lookupHistory.slice(0, 10);

    const historyDiv = this.container.querySelector("#lookup-history");

    if (this.lookupHistory.length === 0) {
      historyDiv.innerHTML =
        '<div class="text-gray-500 dark:text-gray-400 text-sm">No lookups yet</div>';
      return;
    }

    historyDiv.innerHTML = this.lookupHistory
      .map(
        (item) => `
      <div class="history-item flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" data-ip="${this.escapeHtml(item.ip)}" tabindex="0" role="button" aria-label="Lookup ${this.escapeHtml(item.ip)}">
        <div class="flex-1">
          <span class="font-mono text-sm text-gray-900 dark:text-white">${this.escapeHtml(item.ip)}</span>
          <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">${this.escapeHtml(item.country)} • ${this.escapeHtml(item.isp)}</span>
        </div>
        <span class="text-xs text-gray-400 dark:text-gray-500">${this.escapeHtml(item.timestamp)}</span>
      </div>
    `,
      )
      .join("");
  }

  isValidIP(ip) {
    if (typeof ip !== "string" || !ip.trim()) return false;

    const value = ip.trim();

    if (this.isValidIPv4(value)) {
      return true;
    }

    return this.isValidIPv6(value);
  }

  isValidIPv4(ip) {
    const parts = ip.split(".");
    if (parts.length !== 4) return false;

    return parts.every((part) => {
      if (!/^\d{1,3}$/.test(part)) return false;
      const number = Number(part);
      return number >= 0 && number <= 255;
    });
  }   

  isValidIPv6(ip) {
    if (!/^[0-9a-fA-F:.]+$/.test(ip)) return false;
    if (!ip.includes(":")) return false;

    // IPv4-embedded IPv6, e.g. ::ffff:192.0.2.1
    let value = ip;
    if (value.includes(".")) {
      const lastColon = value.lastIndexOf(":");
      if (lastColon === -1) return false;

      const ipv4Part = value.slice(lastColon + 1);
      if (!this.isValidIPv4(ipv4Part)) return false;

      value = `${value.slice(0, lastColon)}:0:0`;
    }

    const hasCompression = value.includes("::");

    if (value.split("::").length > 2) return false;

    const groups = value.split(":");

    if (hasCompression) {
      const left = groups[0] ? groups[0].split(":").filter(Boolean) : [];
      const right = groups[1] ? groups[1].split(":").filter(Boolean) : [];

      if (left.some((group) => !/^[0-9a-fA-F]{1,4}$/.test(group))) return false;
      if (right.some((group) => !/^[0-9a-fA-F]{1,4}$/.test(group)))
        return false;

      return left.length + right.length < 8;
    }

    if (groups.length !== 8) return false;

    return groups.every((group) => /^[0-9a-fA-F]{1,4}$/.test(group));
  }

  getIPType(ip) {
    return ip.includes(":") ? "IPv6" : "IPv4";
  }

  getIPScope(ip) {
    const value = ip.trim();

    if (this.isValidIPv4(value)) {
      const parts = value.split(".").map(Number);
      const [a, b, c] = parts;

      if (a === 0) return "unspecified";
      if (a === 10) return "private";
      if (a === 100 && b >= 64 && b <= 127) return "reserved";
      if (a === 127) return "loopback";
      if (a === 169 && b === 254) return "linkLocal";
      if (a === 172 && b >= 16 && b <= 31) return "private";
      if (a === 192 && b === 168) return "private";
      if (a === 192 && b === 0 && c === 0) return "reserved";
      if (a === 192 && b === 0 && c === 2) return "documentation";
      if (a === 198 && b === 18) return "reserved";
      if (a === 198 && b === 19) return "reserved";
      if (a === 198 && b === 51 && c === 100) return "documentation";
      if (a === 203 && b === 0 && c === 113) return "documentation";
      if (a >= 224 && a <= 239) return "multicast";
      if (a >= 240) return "reserved";

      return "public";
    }

    const normalized = value.toLowerCase();

    if (normalized === "::" || normalized === "0:0:0:0:0:0:0:0") {
      return "unspecified";
    }

    if (normalized === "::1") {
      return "loopback";
    }

    if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
      return "private";
    }

    if (this.isIPv6LinkLocal(normalized)) {
      return "linkLocal";
    }

    if (this.isIPv6Documentation(normalized)) {
      return "documentation";
    }

    if (this.isIPv6Multicast(normalized)) {
      return "multicast";
    }

    return "public";
  }

  isIPv6LinkLocal(ip) {
    const firstGroup = this.getFirstIPv6Group(ip);
    return firstGroup >= 0xfe80 && firstGroup <= 0xfebf;
  }

  isIPv6Documentation(ip) {
    const groups = this.expandIPv6(ip);
    return groups?.slice(0, 4).join(":") === "2001:db8:0:0";
  }

  isIPv6Multicast(ip) {
    return ip.toLowerCase().startsWith("ff");
  }

  getFirstIPv6Group(ip) {
    const groups = this.expandIPv6(ip);
    if (!groups) return -1;
    return parseInt(groups[0], 16);
  }

  expandIPv6(ip) {
    let value = ip.toLowerCase();

    if (value.includes(".")) {
      const lastColon = value.lastIndexOf(":");
      if (lastColon === -1) return null;

      const ipv4 = value.slice(lastColon + 1);
      if (!this.isValidIPv4(ipv4)) return null;

      const parts = ipv4.split(".").map(Number);
      const high = ((parts[0] << 8) | parts[1]).toString(16);
      const low = ((parts[2] << 8) | parts[3]).toString(16);

      value = `${value.slice(0, lastColon)}:${high}:${low}`;
    }

    if (value.includes("::")) {
      if (value.split("::").length !== 2) return null;

      const [leftPart, rightPart] = value.split("::");
      const left = leftPart ? leftPart.split(":").filter(Boolean) : [];
      const right = rightPart ? rightPart.split(":").filter(Boolean) : [];
      const missing = 8 - left.length - right.length;

      if (missing < 1) return null;

      return [...left, ...Array(missing).fill("0"), ...right].map((group) =>
        group.padStart(4, "0"),
      );
    }

    const groups = value.split(":");
    if (groups.length !== 8) return null;

    return groups.map((group) => group.padStart(4, "0"));
  }

  getScopeLabel(scope) {
    const labels = {
      public: "Public",
      private: "Private Network",
      loopback: "Loopback",
      linkLocal: "Link-Local",
      unspecified: "Unspecified",
      documentation: "Documentation/Test Range",
      multicast: "Multicast",
      reserved: "Reserved Network",
    };

    return labels[scope] || "Non-Public Network";
  }

  normalizeCoordinate(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  clear() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    this.container.querySelector("#ip-input").value = "";

    this.container.querySelector("#ip-results").innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-8">
        Enter an IP address and click Lookup to get information
      </div>
    `;

    this.container.querySelector("#current-ip-display").classList.add("hidden");
    this.clearError();
  }

  showError(message) {
    const errorDiv = this.container.querySelector("[data-error]");
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");
  }

  clearError() {
    const errorDiv = this.container.querySelector("[data-error]");
    errorDiv.textContent = "";
    errorDiv.classList.add("hidden");
  }

  escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent =
      value === null || value === undefined ? "" : String(value);
    return div.innerHTML;
  }
}
