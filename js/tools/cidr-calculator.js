export class CIDRCalculator {
  constructor() {
    this.container = null;
    this.currentCIDR = null;
    this.autoCalculateTimer = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.attachEventListeners();
    this.calculate();
  }

  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">CIDR Calculator</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Calculate IPv4 network ranges, subnet masks, host capacity, and subnet divisions from CIDR notation
          </p>
        </div>

        <div class="mb-6 flex flex-wrap gap-2">
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            data-action="calculate"
          >
            Calculate
          </button>

          <button
            class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            data-action="clear"
          >
            Clear
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Input</h3>

              <div class="space-y-4">
                <div>
                  <label for="cidr-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CIDR Notation
                  </label>
                  <input
                    type="text"
                    id="cidr-input"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono"
                    placeholder="192.168.1.0/24"
                    value="192.168.1.0/24"
                    spellcheck="false"
                    autocomplete="off"
                  />
                </div>

                <div class="text-sm text-gray-600 dark:text-gray-400">
                  Enter an IPv4 address with CIDR notation, for example <code class="font-mono">10.0.0.0/8</code>.
                </div>

                <div>
                  <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Convert Subnet Mask to CIDR</h4>

                  <div class="space-y-3">
                    <div>
                      <label for="ip-address" class="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        IP Address
                      </label>
                      <input
                        type="text"
                        id="ip-address"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                        placeholder="192.168.1.0"
                        spellcheck="false"
                        autocomplete="off"
                      />
                    </div>

                    <div>
                      <label for="subnet-mask" class="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Subnet Mask
                      </label>
                      <input
                        type="text"
                        id="subnet-mask"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                        placeholder="255.255.255.0"
                        spellcheck="false"
                        autocomplete="off"
                      />
                    </div>

                    <button
                      class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30"
                      data-action="convert"
                    >
                      Convert to CIDR
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Common CIDR Blocks</h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="10.0.0.0/8">
                  10.0.0.0/8 (Private)
                </button>
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="172.16.0.0/12">
                  172.16.0.0/12 (Private)
                </button>
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="192.168.0.0/16">
                  192.168.0.0/16 (Private)
                </button>
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="192.168.1.0/24">
                  192.168.1.0/24 (Subnet)
                </button>
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="0.0.0.0/0">
                  0.0.0.0/0 (All IPv4)
                </button>
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="10.10.10.0/28">
                  10.10.10.0/28 (Small)
                </button>
              </div>
            </div>
          </div>

          <div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Results</h3>
              <div id="calculation-results" class="space-y-3">
                <div class="text-gray-500 dark:text-gray-400 text-center py-8">
                  Enter CIDR notation to see calculations
                </div>
              </div>
            </div>

            <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subnet Division</h3>

              <div class="mb-3">
                <label for="subnet-bits" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Divide into subnets (bits to borrow)
                </label>

                <div class="flex gap-2">
                  <input
                    type="number"
                    id="subnet-bits"
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    min="0"
                    max="8"
                    value="0"
                  />

                  <button
                    class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    data-action="divide"
                  >
                    Divide
                  </button>
                </div>
              </div>

              <div class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Up to 16 subnet entries are displayed to keep large divisions readable.
              </div>

              <div id="subnet-results" class="space-y-2"></div>
            </div>
          </div>
        </div>

        <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">IP Range Visualizer</h3>
          <div id="ip-visualizer" class="space-y-2"></div>
        </div>

        <div class="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Quick Reference</h4>
          <div class="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <p><strong>/8:</strong> 16,777,216 total addresses</p>
            <p><strong>/16:</strong> 65,536 total addresses</p>
            <p><strong>/24:</strong> 256 total addresses</p>
            <p><strong>/28:</strong> 16 total addresses</p>
            <p><strong>/30:</strong> 4 total addresses</p>
            <p><strong>/31:</strong> 2 addresses (point-to-point)</p>
            <p><strong>/32:</strong> 1 address (single host)</p>
          </div>
        </div>

        <div
          class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded hidden"
          data-error
          role="alert"
          aria-live="polite"
        ></div>
      </div>
    `;
  }

  attachEventListeners() {
    this.container
      .querySelector('[data-action="calculate"]')
      .addEventListener("click", () => this.calculate());

    this.container
      .querySelector('[data-action="clear"]')
      .addEventListener("click", () => this.clear());

    this.container
      .querySelector('[data-action="convert"]')
      .addEventListener("click", () => this.convertToCIDR());

    this.container
      .querySelector('[data-action="divide"]')
      .addEventListener("click", () => this.divideSubnets());

    const cidrInput = this.container.querySelector("#cidr-input");

    cidrInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.calculate();
      }
    });

    cidrInput.addEventListener("input", () => {
      this.clearError();

      clearTimeout(this.autoCalculateTimer);
      this.autoCalculateTimer = setTimeout(() => {
        const value = cidrInput.value.trim();

        if (!value) {
          this.clearResults();
          return;
        }

        this.calculate();
      }, 350);
    });

    this.container.querySelectorAll("[data-example]").forEach((button) => {
      button.addEventListener("click", () => {
        cidrInput.value = button.dataset.example;
        this.calculate();
      });
    });

    this.container
      .querySelector("#subnet-bits")
      .addEventListener("change", () => {
        if (this.currentCIDR) {
          this.divideSubnets();
        }
      });
  }

  calculate() {
    const cidrInput = this.container.querySelector("#cidr-input").value.trim();

    if (!cidrInput) {
      this.clearResults();
      this.showError("Please enter CIDR notation.");
      return;
    }

    try {
      const cidr = this.parseCIDR(cidrInput);
      const results = this.calculateCIDRInfo(cidr);

      this.currentCIDR = cidr;
      this.displayResults(results);
      this.visualizeIPRange(results);
      this.clearError();

      this.container.querySelector("#subnet-bits").value = "0";
      this.container.querySelector("#subnet-results").innerHTML = "";
    } catch (error) {
      this.currentCIDR = null;
      this.clearResults();
      this.showError(
        error instanceof Error
          ? error.message
          : "Unable to calculate CIDR information.",
      );
    }
  }

  parseCIDR(cidrStr) {
    const match = /^([0-9]{1,3}(?:\.[0-9]{1,3}){3})\/([0-9]{1,2})$/.exec(
      cidrStr,
    );

    if (!match) {
      throw new Error(
        "Invalid CIDR format. Use IPv4 notation such as 192.168.1.0/24.",
      );
    }

    const ip = this.parseIPv4(match[1]);
    const prefix = Number(match[2]);

    if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
      throw new Error(
        "Invalid CIDR prefix. Prefix length must be between 0 and 32.",
      );
    }

    return {
      ip,
      prefix,
      ipString: ip.join("."),
    };
  }

  parseIPv4(value) {
    const parts = value.split(".");

    if (parts.length !== 4) {
      throw new Error(
        "Invalid IPv4 address. It must contain exactly four octets.",
      );
    }

    const octets = parts.map((part) => {
      if (!/^\d{1,3}$/.test(part)) {
        throw new Error(
          "Invalid IPv4 address. Each octet must be a number from 0 to 255.",
        );
      }

      const number = Number(part);

      if (number < 0 || number > 255) {
        throw new Error(
          "Invalid IPv4 address. Each octet must be between 0 and 255.",
        );
      }

      return number;
    });

    return octets;
  }

  calculateCIDRInfo(cidr) {
    const { ip, prefix } = cidr;

    const ipValue = this.ipToBigInt(ip);
    const maskValue = this.prefixToMaskBigInt(prefix);
    const networkValue = ipValue & maskValue;
    const totalAddresses = 2n ** BigInt(32 - prefix);
    const broadcastValue = networkValue + totalAddresses - 1n;

    const networkAddress = this.bigIntToIP(networkValue);
    const broadcastAddress = this.bigIntToIP(broadcastValue);
    const subnetMask = this.prefixToSubnetMask(prefix);
    const wildcardMask = subnetMask.map((octet) => 255 - octet);

    let firstHost;
    let lastHost;
    let usableHosts;

    if (prefix === 32) {
      firstHost = networkAddress;
      lastHost = networkAddress;
      usableHosts = 1n;
    } else if (prefix === 31) {
      firstHost = networkAddress;
      lastHost = broadcastAddress;
      usableHosts = 2n;
    } else {
      firstHost = this.bigIntToIP(networkValue + 1n);
      lastHost = this.bigIntToIP(broadcastValue - 1n);
      usableHosts = totalAddresses - 2n;
    }

    const classification = this.classifyNetwork(
      networkValue,
      broadcastValue,
      prefix,
      ip,
    );

    return {
      cidr: `${cidr.ipString}/${prefix}`,
      inputAddress: cidr.ipString,
      networkAddress: networkAddress.join("."),
      broadcastAddress: broadcastAddress.join("."),
      subnetMask: subnetMask.join("."),
      wildcardMask: wildcardMask.join("."),
      prefix,
      hostBits: 32 - prefix,
      totalAddresses,
      usableHosts,
      firstHost: firstHost.join("."),
      lastHost: lastHost.join("."),
      classification,
      binary: {
        network: this.toBinary(networkAddress),
        subnet: this.toBinary(subnetMask),
      },
    };
  }

  prefixToMaskBigInt(prefix) {
    if (prefix === 0) return 0n;

    const hostBits = 32 - prefix;
    return ((1n << 32n) - 1n) ^ ((1n << BigInt(hostBits)) - 1n);
  }

  prefixToSubnetMask(prefix) {
    const mask = [];

    for (let i = 0; i < 4; i += 1) {
      const remaining = prefix - i * 8;

      if (remaining >= 8) {
        mask.push(255);
      } else if (remaining <= 0) {
        mask.push(0);
      } else {
        mask.push(256 - 2 ** (8 - remaining));
      }
    }

    return mask;
  }

  subnetMaskToPrefix(mask) {
    const octets = this.parseIPv4(mask);
    let prefix = 0;
    let encounteredZero = false;

    for (const octet of octets) {
      if (octet === 255) {
        if (encounteredZero) {
          throw new Error("Invalid subnet mask: mask bits must be contiguous.");
        }

        prefix += 8;
        continue;
      }

      if (octet === 0) {
        encounteredZero = true;
        continue;
      }

      if (encounteredZero) {
        throw new Error("Invalid subnet mask: mask bits must be contiguous.");
      }

      const binary = octet.toString(2).padStart(8, "0");

      if (!/^1*0*$/.test(binary)) {
        throw new Error("Invalid subnet mask: mask bits must be contiguous.");
      }

      prefix += binary.indexOf("0");
      encounteredZero = true;
    }

    if (this.prefixToSubnetMask(prefix).join(".") !== octets.join(".")) {
      throw new Error("Invalid subnet mask: mask bits must be contiguous.");
    }

    return prefix;
  }

  classifyNetwork(networkValue, broadcastValue, prefix, ip) {
    const inputValue = this.ipToBigInt(ip);

    // /0 represents the complete IPv4 address space.
    // Check this before 0.0.0.0/32 (Unspecified).
    if (networkValue === 0n && broadcastValue === 0xffffffffn) {
      return { label: "All IPv4", tone: "gray" };
    }

    // Limited broadcast address: 255.255.255.255/32.
    // Check before the general reserved range.
    if (prefix === 32 && inputValue === 0xffffffffn) {
      return { label: "Limited broadcast", tone: "yellow" };
    }

    if (this.rangeContains(inputValue, 0x7f000000n, 0x7fffffffn)) {
      return { label: "Loopback", tone: "yellow" };
    }

    if (this.rangeContains(inputValue, 0xa9fe0000n, 0xa9feffffn)) {
      return { label: "Link-local", tone: "yellow" };
    }

    if (this.rangeContains(inputValue, 0x0a000000n, 0x0affffffn)) {
      return { label: "Private", tone: "green" };
    }

    if (this.rangeContains(inputValue, 0xac100000n, 0xac1fffffn)) {
      return { label: "Private", tone: "green" };
    }

    if (this.rangeContains(inputValue, 0xc0a80000n, 0xc0a8ffffn)) {
      return { label: "Private", tone: "green" };
    }

    if (this.rangeContains(inputValue, 0xe0000000n, 0xefffffffn)) {
      return { label: "Multicast", tone: "purple" };
    }

    if (this.rangeContains(inputValue, 0x00000000n, 0x00000000n)) {
      return { label: "Unspecified", tone: "gray" };
    }

    if (this.rangeContains(inputValue, 0xc0000200n, 0xc00002ffn)) {
      return { label: "Documentation", tone: "blue" };
    }

    if (this.rangeContains(inputValue, 0xc6336400n, 0xc63364ffn)) {
      return { label: "Documentation", tone: "blue" };
    }

    if (this.rangeContains(inputValue, 0xcb007100n, 0xcb0071ffn)) {
      return { label: "Documentation", tone: "blue" };
    }

    if (this.rangeContains(inputValue, 0xf0000000n, 0xffffffffn)) {
      return { label: "Reserved", tone: "gray" };
    }

    return { label: "Public / Routable", tone: "blue" };
  }

  rangeContains(value, start, end) {
    return value >= start && value <= end;
  }

  ipToBigInt(octets) {
    return (
      (BigInt(octets[0]) << 24n) |
      (BigInt(octets[1]) << 16n) |
      (BigInt(octets[2]) << 8n) |
      BigInt(octets[3])
    );
  }

  bigIntToIP(value) {
    return [
      Number((value >> 24n) & 255n),
      Number((value >> 16n) & 255n),
      Number((value >> 8n) & 255n),
      Number(value & 255n),
    ];
  }

  toBinary(octets) {
    return octets.map((octet) => octet.toString(2).padStart(8, "0")).join(".");
  }

  displayResults(results) {
    const resultsDiv = this.container.querySelector("#calculation-results");

    const classificationClass =
      {
        green: "text-green-600 dark:text-green-400",
        blue: "text-blue-600 dark:text-blue-400",
        yellow: "text-yellow-600 dark:text-yellow-400",
        purple: "text-purple-600 dark:text-purple-400",
        gray: "text-gray-600 dark:text-gray-400",
      }[results.classification.tone] || "text-gray-900 dark:text-white";

    resultsDiv.innerHTML = `
      <div class="space-y-2">
        ${this.resultRow("Network Address", results.networkAddress)}
        ${this.resultRow("Broadcast Address", results.broadcastAddress)}
        ${this.resultRow("Subnet Mask", results.subnetMask)}
        ${this.resultRow("Wildcard Mask", results.wildcardMask)}
        ${this.resultRow("Prefix Length", `/${results.prefix}`)}
        ${this.resultRow("Host Bits", results.hostBits)}
        ${this.resultRow("Total Addresses", this.formatBigInt(results.totalAddresses))}
        ${this.resultRow("Usable Hosts", this.formatBigInt(results.usableHosts))}
        ${this.resultRow("First Host", results.firstHost)}
        ${this.resultRow("Last Host", results.lastHost)}
        <div class="flex justify-between gap-4 py-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">Network Type:</span>
          <span class="text-sm font-semibold ${classificationClass}">
            ${results.classification.label}
          </span>
        </div>
      </div>

      <div class="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
        <h4 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Binary Representation</h4>

        <div class="space-y-1">
          <div class="text-xs break-all">
            <span class="text-gray-600 dark:text-gray-400">Network:</span>
            <span class="font-mono text-gray-900 dark:text-white ml-2">${results.binary.network}</span>
          </div>

          <div class="text-xs break-all">
            <span class="text-gray-600 dark:text-gray-400">Mask:</span>
            <span class="font-mono text-gray-900 dark:text-white ml-2">${results.binary.subnet}</span>
          </div>
        </div>
      </div>
    `;
  }

  resultRow(label, value) {
    return `
      <div class="flex justify-between gap-4 py-2 border-b border-gray-200 dark:border-gray-600">
        <span class="text-sm text-gray-600 dark:text-gray-400">${label}:</span>
        <span class="text-sm font-mono font-semibold text-gray-900 dark:text-white text-right break-all">${value}</span>
      </div>
    `;
  }

  formatBigInt(value) {
    return value.toLocaleString("en-US");
  }

  visualizeIPRange(results) {
    const visualizer = this.container.querySelector("#ip-visualizer");

    const prefixPercent = (results.prefix / 32) * 100;
    const hostPercent = 100 - prefixPercent;

    visualizer.innerHTML = `
      <div class="space-y-3">
        <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 font-mono gap-4">
          <span>${results.networkAddress}</span>
          <span>${results.broadcastAddress}</span>
        </div>

        <div
          class="h-8 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600"
          aria-label="CIDR prefix visualization"
          title="${results.cidr}"
        >
          <div
            class="h-full bg-gradient-to-r from-blue-500 to-green-500"
            style="width: ${Math.max(8, 100 - prefixPercent)}%"
          ></div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <div class="text-gray-500 dark:text-gray-400">Network bits</div>
            <div class="font-mono font-semibold text-gray-900 dark:text-white">${results.prefix} bits</div>
          </div>

          <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <div class="text-gray-500 dark:text-gray-400">Host bits</div>
            <div class="font-mono font-semibold text-gray-900 dark:text-white">${results.hostBits} bits</div>
          </div>
        </div>

        <div class="text-xs text-gray-600 dark:text-gray-400 text-center">
          ${this.formatBigInt(results.totalAddresses)} total addresses · ${this.formatBigInt(results.usableHosts)} usable hosts
        </div>
      </div>
    `;
  }

  convertToCIDR() {
    const ipAddress = this.container.querySelector("#ip-address").value.trim();
    const subnetMask = this.container
      .querySelector("#subnet-mask")
      .value.trim();

    if (!ipAddress || !subnetMask) {
      this.showError("Please enter both an IP address and a subnet mask.");
      return;
    }

    try {
      this.parseIPv4(ipAddress);
      const prefix = this.subnetMaskToPrefix(subnetMask);

      const cidrInput = this.container.querySelector("#cidr-input");
      cidrInput.value = `${ipAddress}/${prefix}`;

      this.calculate();
    } catch (error) {
      this.showError(
        error instanceof Error
          ? error.message
          : "Unable to convert subnet mask.",
      );
    }
  }

  divideSubnets() {
    if (!this.currentCIDR) {
      this.showError("Please calculate a CIDR block first.");
      return;
    }

    const subnetBitsInput = this.container.querySelector("#subnet-bits");
    const subnetBits = Number.parseInt(subnetBitsInput.value, 10);

    if (!Number.isInteger(subnetBits) || subnetBits < 0 || subnetBits > 8) {
      this.showError("Subnet bits must be an integer between 0 and 8.");
      return;
    }

    if (subnetBits === 0) {
      this.container.querySelector("#subnet-results").innerHTML = "";
      this.clearError();
      return;
    }

    const newPrefix = this.currentCIDR.prefix + subnetBits;

    if (newPrefix > 32) {
      this.showError(
        `Cannot create subnets with prefix /${newPrefix}. Maximum is /32.`,
      );
      return;
    }

    if (newPrefix >= 31) {
      this.showError(
        "Subnet division requires subnets with at least 4 addresses (prefix /30 or shorter).",
      );
      return;
    }

    const totalSubnets = 2n ** BigInt(subnetBits);
    const addressesPerSubnet = 2n ** BigInt(32 - newPrefix);
    const networkValue = this.ipToBigInt(
      this.parseIPv4(this.currentCIDR.ipString),
    );

    const baseNetwork =
      networkValue & this.prefixToMaskBigInt(this.currentCIDR.prefix);
    const visibleCount = Number(totalSubnets > 16n ? 16n : totalSubnets);

    const subnets = [];

    for (let index = 0; index < visibleCount; index += 1) {
      const offset = BigInt(index) * addressesPerSubnet;
      const subnetNetwork = baseNetwork + offset;
      const subnetBroadcast = subnetNetwork + addressesPerSubnet - 1n;

      subnets.push({
        network: `${this.bigIntToIP(subnetNetwork).join(".")}/${newPrefix}`,
        firstHost: this.bigIntToIP(subnetNetwork + 1n).join("."),
        lastHost: this.bigIntToIP(subnetBroadcast - 1n).join("."),
        broadcast: this.bigIntToIP(subnetBroadcast).join("."),
        hosts: addressesPerSubnet - 2n,
      });
    }

    this.displaySubnets(subnets, totalSubnets);
    this.clearError();
  }

  displaySubnets(subnets, total) {
    const resultsDiv = this.container.querySelector("#subnet-results");

    let html = `
      <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Showing ${subnets.length} of ${this.formatBigInt(total)} subnets
      </div>
    `;

    html += '<div class="space-y-2 max-h-80 overflow-y-auto">';

    subnets.forEach((subnet, index) => {
      html += `
        <div class="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
          <div class="flex flex-wrap justify-between items-center gap-2">
            <span class="text-sm font-semibold text-gray-900 dark:text-white">
              Subnet ${index + 1}
            </span>

            <span class="text-xs font-mono text-blue-600 dark:text-blue-400">
              ${subnet.network}
            </span>
          </div>

          <div class="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div>Range: <span class="font-mono">${subnet.firstHost} - ${subnet.lastHost}</span></div>
            <div>
              Broadcast: <span class="font-mono">${subnet.broadcast}</span>
              · Hosts: <span class="font-mono">${this.formatBigInt(subnet.hosts)}</span>
            </div>
          </div>
        </div>
      `;
    });

    if (total > BigInt(subnets.length)) {
      html += `
        <div class="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
          ... and ${this.formatBigInt(total - BigInt(subnets.length))} more subnets
        </div>
      `;
    }

    html += "</div>";
    resultsDiv.innerHTML = html;
  }

  clearResults() {
    this.container.querySelector("#calculation-results").innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-8">
        Enter CIDR notation to see calculations
      </div>
    `;

    this.container.querySelector("#subnet-results").innerHTML = "";
    this.container.querySelector("#ip-visualizer").innerHTML = "";
    this.container.querySelector("#subnet-bits").value = "0";
  }

  clear() {
    clearTimeout(this.autoCalculateTimer);

    this.container.querySelector("#cidr-input").value = "";
    this.container.querySelector("#ip-address").value = "";
    this.container.querySelector("#subnet-mask").value = "";
    this.container.querySelector("#subnet-bits").value = "0";

    this.currentCIDR = null;
    this.clearResults();
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
}
