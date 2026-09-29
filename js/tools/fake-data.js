export class FakeDataGenerator {
  constructor() {
    this.container = null;
    this.generatedData = [];
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Fake Data Generator</h1>
          <p class="text-gray-600 dark:text-gray-400">Generate realistic fake data for testing including names, emails, addresses, and custom datasets</p>
        </div>
        
        <div class="mb-6 flex flex-wrap gap-2">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="generate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
            </svg>
            Generate Data
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="copy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="export">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="clear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        </div>
        
        <div class="grid lg:grid-cols-2 gap-6">
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Configuration</h3>
            
            <div class="grid sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label for="data-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Type</label>
                <select id="data-type" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="person">Person</option>
                  <option value="company">Company</option>
                  <option value="product">Product</option>
                  <option value="address">Address</option>
                  <option value="credit-card">Credit Card</option>
                  <option value="custom">Custom Schema</option>
                </select>
              </div>
              
              <div>
                <label for="count" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Count</label>
                <input type="number" id="count" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="10" min="1" max="1000" />
              </div>
              
              <div>
                <label for="format" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
                <select id="format" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="sql">SQL Insert</option>
                  <option value="xml">XML</option>
                </select>
              </div>
            </div>
            
            <div class="mb-4">
              <label for="locale" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Locale</label>
              <select id="locale" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="en_US">English (US)</option>
                <option value="en_GB">English (UK)</option>
                <option value="es_ES">Spanish</option>
                <option value="fr_FR">French</option>
                <option value="de_DE">German</option>
                <option value="it_IT">Italian</option>
                <option value="pt_BR">Portuguese (Brazil)</option>
                <option value="ja_JP">Japanese</option>
                <option value="zh_CN">Chinese</option>
              </select>
            </div>
            
            <div id="type-options" class="space-y-2 mb-4">
              <!-- Dynamic options based on data type -->
            </div>
            
            <div id="custom-schema" class="space-y-4" hidden>
              <h4 class="text-md font-semibold text-gray-900 dark:text-white">Custom Schema</h4>
              <div id="schema-fields" class="space-y-2">
                <div class="flex gap-2 items-center">
                  <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Field name" value="id" />
                  <select class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="uuid">UUID</option>
                    <option value="number">Number</option>
                    <option value="string">String</option>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="date">Date</option>
                    <option value="boolean">Boolean</option>
                    <option value="url">URL</option>
                    <option value="ip">IP Address</option>
                  </select>
                  <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Options (optional)" />
                  <button class="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" data-remove="field">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
              <button class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-add="field">Add Field</button>
            </div>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generated Data</h3>
            <div class="flex gap-4 mb-4">
              <label class="flex items-center">
                <input type="checkbox" id="pretty-print" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
                <span class="text-sm text-gray-700 dark:text-gray-300">Pretty Print</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" id="include-null" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
                <span class="text-sm text-gray-700 dark:text-gray-300">Include Null Values</span>
              </label>
            </div>
            <pre id="data-output" class="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm overflow-auto">
<span class="text-gray-500 dark:text-gray-400">Click "Generate Data" to create fake data</span>
            </pre>
          </div>
        </div>
        
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Templates</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <button class="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-template="users">User Database</button>
            <button class="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-template="ecommerce">E-commerce</button>
            <button class="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-template="blog">Blog Posts</button>
            <button class="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-template="employees">Employees</button>
            <button class="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-template="transactions">Transactions</button>
            <button class="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-template="iot">IoT Sensors</button>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Generate button
    this.container
      .querySelector('[data-action="generate"]')
      .addEventListener("click", () => {
        this.generateData();
      });

    // Copy button
    this.container
      .querySelector('[data-action="copy"]')
      .addEventListener("click", () => {
        this.copyData();
      });

    // Export button
    this.container
      .querySelector('[data-action="export"]')
      .addEventListener("click", () => {
        this.exportData();
      });

    // Clear button
    this.container
      .querySelector('[data-action="clear"]')
      .addEventListener("click", () => {
        this.clear();
      });

    // Data type change
    this.container
      .querySelector("#data-type")
      .addEventListener("change", (e) => {
        this.updateTypeOptions(e.target.value);
      });

    // Format change
    this.container.querySelector("#format").addEventListener("change", () => {
      this.displayData();
    });

    // Pretty print toggle
    this.container
      .querySelector("#pretty-print")
      .addEventListener("change", () => {
        this.displayData();
      });

    // Include null toggle
    this.container
      .querySelector("#include-null")
      .addEventListener("change", () => {
        this.displayData();
      });

    // Add custom field
    this.container
      .querySelector('[data-add="field"]')
      .addEventListener("click", () => {
        this.addCustomField();
      });

    // Remove field (delegated)
    this.container.addEventListener("click", (e) => {
      if (e.target.closest('[data-remove="field"]')) {
        e.target.closest(".flex").remove();
      }
    });

    // Template buttons
    this.container.querySelectorAll("[data-template]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.loadTemplate(btn.dataset.template);
      });
    });

    // Initialize type options
    this.updateTypeOptions("person");
  }

  updateTypeOptions(type) {
    const optionsDiv = this.container.querySelector("#type-options");
    const customSchema = this.container.querySelector("#custom-schema");

    if (type === "custom") {
      optionsDiv.innerHTML = "";
      customSchema.hidden = false;
    } else {
      customSchema.hidden = true;

      const options = this.getTypeOptions(type);
      optionsDiv.innerHTML = options
        .map(
          (option) => `
        <label class="flex items-center">
          <input type="checkbox" data-field="${option.field}" ${option.default ? "checked" : ""} class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
          <span class="text-sm text-gray-700 dark:text-gray-300">${option.label}</span>
        </label>
      `,
        )
        .join("");
    }
  }

  getTypeOptions(type) {
    const options = {
      person: [
        { field: "id", label: "ID", default: true },
        { field: "firstName", label: "First Name", default: true },
        { field: "lastName", label: "Last Name", default: true },
        { field: "email", label: "Email", default: true },
        { field: "phone", label: "Phone", default: true },
        { field: "birthDate", label: "Birth Date", default: false },
        { field: "gender", label: "Gender", default: false },
        { field: "avatar", label: "Avatar URL", default: false },
        { field: "username", label: "Username", default: false },
        { field: "password", label: "Password Hash", default: false },
      ],
      company: [
        { field: "id", label: "ID", default: true },
        { field: "name", label: "Company Name", default: true },
        { field: "industry", label: "Industry", default: true },
        { field: "website", label: "Website", default: true },
        { field: "email", label: "Email", default: true },
        { field: "phone", label: "Phone", default: true },
        { field: "employees", label: "Employee Count", default: false },
        { field: "revenue", label: "Revenue", default: false },
        { field: "founded", label: "Founded Year", default: false },
        { field: "description", label: "Description", default: false },
      ],
      product: [
        { field: "id", label: "ID", default: true },
        { field: "name", label: "Product Name", default: true },
        { field: "category", label: "Category", default: true },
        { field: "price", label: "Price", default: true },
        { field: "sku", label: "SKU", default: true },
        { field: "stock", label: "Stock", default: true },
        { field: "description", label: "Description", default: false },
        { field: "brand", label: "Brand", default: false },
        { field: "rating", label: "Rating", default: false },
        { field: "image", label: "Image URL", default: false },
      ],
      address: [
        { field: "id", label: "ID", default: true },
        { field: "street", label: "Street", default: true },
        { field: "city", label: "City", default: true },
        { field: "state", label: "State/Province", default: true },
        { field: "zipCode", label: "ZIP/Postal Code", default: true },
        { field: "country", label: "Country", default: true },
        { field: "latitude", label: "Latitude", default: false },
        { field: "longitude", label: "Longitude", default: false },
        { field: "type", label: "Address Type", default: false },
      ],
      "credit-card": [
        { field: "id", label: "ID", default: true },
        { field: "number", label: "Card Number", default: true },
        { field: "holder", label: "Card Holder", default: true },
        { field: "expiryDate", label: "Expiry Date", default: true },
        { field: "cvv", label: "CVV", default: true },
        { field: "type", label: "Card Type", default: true },
        { field: "bank", label: "Issuing Bank", default: false },
        { field: "billingAddress", label: "Billing Address", default: false },
      ],
    };

    return options[type] || [];
  }

  generateData() {
    const type = this.container.querySelector("#data-type").value;

    let count = parseInt(this.container.querySelector("#count").value, 10);

    if (!Number.isFinite(count)) {
      count = 10;
    }

    // Hard limit: 1–1000 records
    count = Math.min(Math.max(count, 1), 1000);

    this.container.querySelector("#count").value = count;

    const locale = this.container.querySelector("#locale").value;

    this.generatedData = [];

    for (let i = 0; i < count; i++) {
      if (type === "custom") {
        this.generatedData.push(this.generateCustomData(i));
      } else {
        this.generatedData.push(this.generateTypedData(type, i, locale));
      }
    }

    this.displayData();
  }

  generateTypedData(type, index, locale) {
    const data = {};
    const fields = this.container.querySelectorAll(
      "#type-options input:checked",
    );

    // Generate one card object per record.
    // This keeps number, type, and CVV consistent.
    const generatedCard =
      type === "credit-card" ? this.randomCreditCardNumber() : null;

    fields.forEach((field) => {
      const fieldName = field.dataset.field;

      if (generatedCard) {
        if (fieldName === "number") {
          data[fieldName] = generatedCard.number;
          return;
        }

        if (fieldName === "type") {
          data[fieldName] = generatedCard.type;
          return;
        }

        if (fieldName === "cvv") {
          data[fieldName] =
            generatedCard.type === "Amex"
              ? Math.floor(1000 + Math.random() * 9000)
              : Math.floor(100 + Math.random() * 900);

          return;
        }
      }

      data[fieldName] = this.generateFieldValue(type, fieldName, index, locale);
    });

    return data;
  }

  generateFieldValue(type, field, index, locale) {
    const generators = {
      person: {
        id: () => index + 1,
        firstName: () => this.randomFirstName(locale),
        lastName: () => this.randomLastName(locale),
        email: () => `${this.randomUsername()}@${this.randomDomain()}`,
        phone: () => this.randomPhone(locale),
        birthDate: () =>
          this.randomDate(new Date(1950, 0, 1), new Date(2005, 11, 31)),
        gender: () => (Math.random() > 0.5 ? "Male" : "Female"),
        avatar: () =>
          `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        username: () => this.randomUsername(),
        password: () => this.randomHash(),
      },
      company: {
        id: () => index + 1,
        name: () => this.randomCompanyName(),
        industry: () => this.randomIndustry(),
        website: () => `https://${this.randomDomain()}`,
        email: () => `contact@${this.randomDomain()}`,
        phone: () => this.randomPhone(locale),
        employees: () => Math.floor(Math.random() * 10000) + 10,
        revenue: () => `$${(Math.random() * 100).toFixed(2)}M`,
        founded: () => Math.floor(Math.random() * 50) + 1970,
        description: () => this.randomSentence(),
      },
      product: {
        id: () => index + 1,
        name: () => this.randomProductName(),
        category: () => this.randomCategory(),
        price: () => (Math.random() * 1000).toFixed(2),
        sku: () =>
          `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        stock: () => Math.floor(Math.random() * 1000),
        description: () => this.randomSentence(),
        brand: () => this.randomBrand(),
        rating: () => (Math.random() * 5).toFixed(1),
        image: () => `https://picsum.photos/200/200?random=${index}`,
      },
      address: {
        id: () => index + 1,
        street: () =>
          `${Math.floor(Math.random() * 9999)} ${this.randomStreetName()}`,
        city: () => this.randomCity(),
        state: () => this.randomState(),
        zipCode: () => Math.floor(Math.random() * 90000) + 10000,
        country: () => this.randomCountry(locale),
        latitude: () => (Math.random() * 180 - 90).toFixed(6),
        longitude: () => (Math.random() * 360 - 180).toFixed(6),
        type: () =>
          ["Home", "Work", "Billing", "Shipping"][
            Math.floor(Math.random() * 4)
          ],
      },
      "credit-card": {
        id: () => index + 1,
        number: () => this.randomCreditCardNumber(),
        holder: () => `${this.randomFirstName()} ${this.randomLastName()}`,
        expiryDate: () => this.randomExpiryDate(),
        cvv: () => Math.floor(Math.random() * 900) + 100,
        type: () =>
          ["Visa", "MasterCard", "Amex", "Discover"][
            Math.floor(Math.random() * 4)
          ],
        bank: () => this.randomBank(),
        billingAddress: () =>
          `${Math.floor(Math.random() * 9999)} ${this.randomStreetName()}`,
      },
    };

    return generators[type] && generators[type][field]
      ? generators[type][field]()
      : null;
  }

  generateCustomData(index) {
    const data = {};
    const fields = this.container.querySelectorAll("#schema-fields > .flex");

    fields.forEach((field, fieldIndex) => {
      const nameInput = field.querySelector('input[type="text"]');
      const typeSelect = field.querySelector("select");
      const optionInput = field.querySelectorAll('input[type="text"]')[1];

      const rawName = String(nameInput?.value || "").trim();
      const type = typeSelect?.value || "string";
      const options = String(optionInput?.value || "").trim();

      const name = rawName || `field_${fieldIndex + 1}`;

      data[name] = this.generateCustomFieldValue(type, options, index);
    });

    return data;
  }
  generateCustomFieldValue(type, options, index) {
    const generators = {
      uuid: () => this.generateUUID(),

      number: () => {
        const raw = String(options || "").trim();

        // No option → default 0-999
        if (!raw) {
          return Math.floor(Math.random() * 1000);
        }

        // Support range formats:
        // 18-80
        // 18 - 80
        // 18,80
        // 18..80
        const rangeMatch = raw.match(
          /^(-?\d+(?:\.\d+)?)\s*(?:-|,|\.\.)\s*(-?\d+(?:\.\d+)?)$/,
        );

        if (rangeMatch) {
          let min = Number(rangeMatch[1]);
          let max = Number(rangeMatch[2]);

          if (!Number.isFinite(min) || !Number.isFinite(max)) {
            return Math.floor(Math.random() * 1000);
          }

          if (min > max) {
            [min, max] = [max, min];
          }

          // Integer range
          if (Number.isInteger(min) && Number.isInteger(max)) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
          }

          // Decimal range
          return Number((Math.random() * (max - min) + min).toFixed(2));
        }

        // Single number, e.g. "50"
        const singleValue = Number(raw);

        if (Number.isFinite(singleValue)) {
          return singleValue;
        }

        // Invalid option → fallback
        return Math.floor(Math.random() * 1000);
      },

      string: () => options || this.randomString(10),

      name: () => `${this.randomFirstName()} ${this.randomLastName()}`,

      email: () => `${this.randomUsername()}@${this.randomDomain()}`,

      phone: () => this.randomPhone("en_US"),

      date: () => this.randomDate().toISOString(),

      boolean: () => Math.random() > 0.5,

      url: () => `https://${this.randomDomain()}/${this.randomString(8)}`,

      ip: () => this.randomIPv4(),
    };

    return generators[type] ? generators[type]() : null;
  }

  // Random data generators
  randomFirstName(locale = "en_US") {
    const names = {
      en_US: [
        "John",
        "Jane",
        "Michael",
        "Sarah",
        "David",
        "Emily",
        "James",
        "Emma",
        "Robert",
        "Olivia",
      ],
      en_GB: [
        "Oliver",
        "Amelia",
        "George",
        "Isla",
        "Harry",
        "Ava",
        "Jack",
        "Emily",
        "Jacob",
        "Poppy",
      ],
      es_ES: [
        "Carlos",
        "Maria",
        "Jose",
        "Carmen",
        "Juan",
        "Ana",
        "Luis",
        "Isabel",
        "Miguel",
        "Sofia",
      ],
      fr_FR: [
        "Pierre",
        "Marie",
        "Jean",
        "Sophie",
        "Michel",
        "Julie",
        "Philippe",
        "Isabelle",
        "Alain",
        "Nathalie",
      ],
      de_DE: [
        "Hans",
        "Anna",
        "Peter",
        "Maria",
        "Klaus",
        "Eva",
        "Michael",
        "Julia",
        "Thomas",
        "Lisa",
      ],
    };
    const list = names[locale] || names.en_US;
    return list[Math.floor(Math.random() * list.length)];
  }

  randomLastName(locale = "en_US") {
    const names = {
      en_US: [
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Garcia",
        "Miller",
        "Davis",
        "Rodriguez",
        "Martinez",
      ],
      en_GB: [
        "Smith",
        "Jones",
        "Taylor",
        "Williams",
        "Brown",
        "Davies",
        "Evans",
        "Wilson",
        "Thomas",
        "Roberts",
      ],
      es_ES: [
        "Garcia",
        "Rodriguez",
        "Gonzalez",
        "Fernandez",
        "Lopez",
        "Martinez",
        "Sanchez",
        "Perez",
        "Gomez",
        "Martin",
      ],
      fr_FR: [
        "Martin",
        "Bernard",
        "Dubois",
        "Thomas",
        "Robert",
        "Richard",
        "Petit",
        "Durand",
        "Leroy",
        "Moreau",
      ],
      de_DE: [
        "Mueller",
        "Schmidt",
        "Schneider",
        "Fischer",
        "Weber",
        "Meyer",
        "Wagner",
        "Becker",
        "Schulz",
        "Hoffmann",
      ],
    };
    const list = names[locale] || names.en_US;
    return list[Math.floor(Math.random() * list.length)];
  }

  randomUsername() {
    const adjectives = [
      "cool",
      "super",
      "mega",
      "ultra",
      "pro",
      "epic",
      "ninja",
      "cyber",
      "tech",
      "digital",
    ];
    const nouns = [
      "user",
      "player",
      "coder",
      "hacker",
      "gamer",
      "developer",
      "designer",
      "creator",
      "builder",
      "maker",
    ];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 999)}`;
  }

  randomDomain() {
    const domains = [
      "example.com",
      "test.com",
      "email.com",
      "mail.com",
      "demo.com",
      "sample.org",
      "company.net",
    ];
    return domains[Math.floor(Math.random() * domains.length)];
  }

  randomPhone(locale = "en_US") {
    const formats = {
      en_US: () =>
        `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      en_GB: () =>
        `+44 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 900000) + 100000}`,
      default: () =>
        `+${Math.floor(Math.random() * 99) + 1} ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    };
    return (formats[locale] || formats.default)();
  }

  randomCompanyName() {
    const prefixes = [
      "Global",
      "United",
      "National",
      "International",
      "Advanced",
      "Premier",
      "Elite",
      "Professional",
    ];
    const suffixes = [
      "Corp",
      "Inc",
      "LLC",
      "Group",
      "Holdings",
      "Solutions",
      "Services",
      "Technologies",
    ];
    const names = [
      "Tech",
      "Data",
      "Cloud",
      "Digital",
      "Cyber",
      "Net",
      "Web",
      "Soft",
    ];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${names[Math.floor(Math.random() * names.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  }

  randomIndustry() {
    const industries = [
      "Technology",
      "Healthcare",
      "Finance",
      "Retail",
      "Manufacturing",
      "Education",
      "Real Estate",
      "Transportation",
      "Energy",
      "Entertainment",
    ];
    return industries[Math.floor(Math.random() * industries.length)];
  }

  randomProductName() {
    const adjectives = [
      "Premium",
      "Deluxe",
      "Professional",
      "Ultimate",
      "Essential",
      "Classic",
      "Modern",
      "Advanced",
    ];
    const products = [
      "Widget",
      "Gadget",
      "Tool",
      "Device",
      "System",
      "Solution",
      "Platform",
      "Service",
    ];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${products[Math.floor(Math.random() * products.length)]} ${Math.floor(Math.random() * 999) + 1}`;
  }

  randomCategory() {
    const categories = [
      "Electronics",
      "Clothing",
      "Home & Garden",
      "Sports",
      "Books",
      "Toys",
      "Health",
      "Beauty",
      "Food",
      "Automotive",
    ];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  randomBrand() {
    const brands = [
      "TechCo",
      "MegaBrand",
      "ProLine",
      "EliteWorks",
      "PrimeTech",
      "MaxPro",
      "UltraCore",
      "SuperTech",
    ];
    return brands[Math.floor(Math.random() * brands.length)];
  }

  randomStreetName() {
    const streets = [
      "Main St",
      "Oak Ave",
      "Elm St",
      "Park Rd",
      "First Ave",
      "Second St",
      "Maple Dr",
      "Cedar Ln",
      "Washington Blvd",
      "Lincoln Way",
    ];
    return streets[Math.floor(Math.random() * streets.length)];
  }

  randomCity() {
    const cities = [
      "New York",
      "Los Angeles",
      "Chicago",
      "Houston",
      "Phoenix",
      "Philadelphia",
      "San Antonio",
      "San Diego",
      "Dallas",
      "San Jose",
    ];
    return cities[Math.floor(Math.random() * cities.length)];
  }

  randomState() {
    const states = ["CA", "TX", "FL", "NY", "PA", "IL", "OH", "GA", "NC", "MI"];
    return states[Math.floor(Math.random() * states.length)];
  }

  randomCountry(locale = "en_US") {
    const countries = {
      en_US: "United States",
      en_GB: "United Kingdom",
      es_ES: "Spain",
      fr_FR: "France",
      de_DE: "Germany",
      it_IT: "Italy",
      pt_BR: "Brazil",
      ja_JP: "Japan",
      zh_CN: "China",
    };
    return countries[locale] || "United States";
  }

  randomBank() {
    const banks = [
      "Chase",
      "Bank of America",
      "Wells Fargo",
      "Citibank",
      "Capital One",
      "HSBC",
      "Barclays",
      "Deutsche Bank",
    ];
    return banks[Math.floor(Math.random() * banks.length)];
  }

  randomCreditCardNumber() {
    // Synthetic Luhn-valid test card number.
    // NOT a real payment card.

    const cardTypes = [
      {
        type: "Visa",
        prefix: "4",
        length: 16,
      },
      {
        type: "Mastercard",
        prefix: String(Math.floor(Math.random() * 5) + 51),
        length: 16,
      },
      {
        type: "Amex",
        prefix: Math.random() < 0.5 ? "34" : "37",
        length: 15,
      },
      {
        type: "Discover",
        prefix: ["6011", "65", "644", "645", "646", "647", "648", "649"][
          Math.floor(Math.random() * 8)
        ],
        length: 16,
      },
    ];

    const card = cardTypes[Math.floor(Math.random() * cardTypes.length)];

    let number = card.prefix;

    // Fill until the final check digit.
    while (number.length < card.length - 1) {
      number += Math.floor(Math.random() * 10);
    }

    // Luhn checksum
    let sum = 0;
    let shouldDouble = true;

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = Number(number[i]);

      if (shouldDouble) {
        digit *= 2;

        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    const checkDigit = (10 - (sum % 10)) % 10;

    number += checkDigit;

    return {
      number: number.match(/.{1,4}/g).join(" "),
      type: card.type,
    };
  }

  randomExpiryDate() {
    const month = Math.floor(Math.random() * 12) + 1;
    const year = new Date().getFullYear() + Math.floor(Math.random() * 5) + 1;
    return `${month.toString().padStart(2, "0")}/${year.toString().slice(-2)}`;
  }

  randomDate(start = new Date(2020, 0, 1), end = new Date()) {
    let startDate = start instanceof Date ? new Date(start) : new Date(start);
    let endDate = end instanceof Date ? new Date(end) : new Date(end);

    // Fallback when an invalid date is supplied
    if (Number.isNaN(startDate.getTime())) {
      startDate = new Date(2020, 0, 1);
    }

    if (Number.isNaN(endDate.getTime())) {
      endDate = new Date();
    }

    // Keep the range valid even if start and end are reversed
    if (startDate.getTime() > endDate.getTime()) {
      [startDate, endDate] = [endDate, startDate];
    }

    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    // If both dates are identical, return an independent Date object
    if (startTime === endTime) {
      return new Date(startTime);
    }

    return new Date(startTime + Math.random() * (endTime - startTime));
  }

  randomSentence() {
    const sentences = [
      "High-quality product with excellent features and great value.",
      "Innovative solution designed for modern needs and requirements.",
      "Professional grade equipment built to last.",
      "Cutting-edge technology meets user-friendly design.",
      "Exceptional performance and reliability guaranteed.",
    ];
    return sentences[Math.floor(Math.random() * sentences.length)];
  }

  randomIPv4() {
    // Generate a synthetic IPv4 address.
    // Avoid common special/reserved ranges:
    // - 0.0.0.0/8
    // - 10.0.0.0/8
    // - 100.64.0.0/10 (CGNAT)
    // - 127.0.0.0/8 (loopback)
    // - 169.254.0.0/16 (link-local)
    // - 172.16.0.0/12 (private)
    // - 192.0.0.0/24
    // - 192.168.0.0/16 (private)
    // - 198.18.0.0/15 (benchmarking)
    // - 224.0.0.0/4 (multicast)
    // - 240.0.0.0/4 (reserved)

    while (true) {
      const first = Math.floor(Math.random() * 223) + 1;
      const second = Math.floor(Math.random() * 256);
      const third = Math.floor(Math.random() * 256);
      const fourth = Math.floor(Math.random() * 256);

      // Loopback
      if (first === 127) continue;

      // Private 10.0.0.0/8
      if (first === 10) continue;

      // Private 172.16.0.0/12
      if (first === 172 && second >= 16 && second <= 31) {
        continue;
      }

      // Private 192.168.0.0/16
      if (first === 192 && second === 168) continue;

      // CGNAT 100.64.0.0/10
      if (first === 100 && second >= 64 && second <= 127) {
        continue;
      }

      // Link-local 169.254.0.0/16
      if (first === 169 && second === 254) continue;

      // 192.0.0.0/24
      if (first === 192 && second === 0 && third === 0) {
        continue;
      }

      // Benchmarking 198.18.0.0/15
      if (first === 198 && (second === 18 || second === 19)) {
        continue;
      }

      return `${first}.${second}.${third}.${fourth}`;
    }
  }
  randomString(length = 10) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  randomHash() {
    return "sha256:" + this.randomString(64);
  }

  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  displayData() {
    if (this.generatedData.length === 0) return;

    const format = this.container.querySelector("#format").value;
    const prettyPrint = this.container.querySelector("#pretty-print").checked;
    const includeNull = this.container.querySelector("#include-null").checked;

    let output = "";

    // Filter null values if needed
    let data = this.generatedData;
    if (!includeNull) {
      data = data.map((item) => {
        const filtered = {};
        for (const [key, value] of Object.entries(item)) {
          if (value !== null && value !== undefined) {
            filtered[key] = value;
          }
        }
        return filtered;
      });
    }

    switch (format) {
      case "json":
        output = prettyPrint
          ? JSON.stringify(data, null, 2)
          : JSON.stringify(data);
        break;
      case "csv":
        output = this.toCSV(data);
        break;
      case "sql":
        output = this.toSQL(data);
        break;
      case "xml":
        output = this.toXML(data);
        break;
    }

    this.container.querySelector("#data-output").textContent = output;
  }

  toCSV(data) {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);

    const escapeCSV = (value) => {
      if (value === null || value === undefined) {
        return "";
      }

      const stringValue = String(value);

      // CSV requires quoting when value contains:
      // comma, quote, newline, or carriage return.
      if (/[",\r\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    };

    const rows = data.map((item) =>
      headers.map((header) => escapeCSV(item[header])).join(","),
    );

    return [headers.map(escapeCSV).join(","), ...rows].join("\n");
  }

  toSQL(data) {
    if (data.length === 0) return "";

    const tableName = "data_table";

    // Convert arbitrary field names into safe SQL identifiers.
    const sanitizeSQLIdentifier = (value) => {
      let name = String(value ?? "")
        .trim()
        .replace(/[^a-zA-Z0-9_$]/g, "_")
        .replace(/_+/g, "_");

      // Empty identifier fallback
      if (!name) {
        name = "field";
      }

      // SQL identifiers should not start with a number
      if (/^\d/.test(name)) {
        name = `field_${name}`;
      }

      // Avoid common SQL reserved words
      const reservedWords = new Set([
        "select",
        "from",
        "where",
        "insert",
        "update",
        "delete",
        "table",
        "into",
        "values",
        "order",
        "group",
        "by",
        "limit",
        "user",
        "index",
        "key",
        "primary",
        "foreign",
        "create",
        "drop",
        "alter",
        "join",
        "on",
        "and",
        "or",
        "not",
        "null",
        "true",
        "false",
      ]);

      if (reservedWords.has(name.toLowerCase())) {
        name = `field_${name}`;
      }

      return name;
    };

    const escapeSQLValue = (value) => {
      if (value === null || value === undefined) {
        return "NULL";
      }

      if (typeof value === "boolean") {
        return value ? "TRUE" : "FALSE";
      }

      if (typeof value === "number") {
        return Number.isFinite(value) ? String(value) : "NULL";
      }

      if (typeof value === "string") {
        return `'${value.replace(/'/g, "''")}'`;
      }

      // Support objects/arrays safely if they ever appear in generated data
      if (typeof value === "object") {
        const jsonValue = JSON.stringify(value);
        return `'${jsonValue.replace(/'/g, "''")}'`;
      }

      return `'${String(value).replace(/'/g, "''")}'`;
    };

    const statements = data.map((item) => {
      const originalKeys = Object.keys(item).filter(
        (key) => item[key] !== null && item[key] !== undefined,
      );

      // Prevent collisions after sanitizing identifiers.
      // Example:
      // "first-name" -> first_name
      // "first name" -> first_name
      // becomes:
      // first_name
      // first_name_2
      const usedIdentifiers = new Map();

      const keys = originalKeys.map((originalKey) => {
        const baseName = sanitizeSQLIdentifier(originalKey);
        const count = usedIdentifiers.get(baseName) || 0;

        usedIdentifiers.set(baseName, count + 1);

        return count === 0 ? baseName : `${baseName}_${count + 1}`;
      });

      const values = originalKeys.map((key) => escapeSQLValue(item[key]));

      return `INSERT INTO ${tableName} (${keys.join(
        ", ",
      )}) VALUES (${values.join(", ")});`;
    });

    return statements.join("\n");
  }
  toXML(data) {
    const xml = ['<?xml version="1.0" encoding="UTF-8"?>', "<data>"];

    data.forEach((item) => {
      xml.push("  <record>");
      for (const [key, value] of Object.entries(item)) {
        if (value !== null && value !== undefined) {
          const safeKey = this.sanitizeXMLTagName(key);

          xml.push(`    <${safeKey}>${this.escapeXML(value)}</${safeKey}>`);
        }
      }
      xml.push("  </record>");
    });

    xml.push("</data>");
    return xml.join("\n");
  }

  escapeXML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  sanitizeXMLTagName(value) {
    let name = String(value)
      .trim()
      .replace(/[^a-zA-Z0-9_.-]/g, "_");

    // XML tag names cannot start with a number.
    if (!/^[a-zA-Z_]/.test(name)) {
      name = `field_${name}`;
    }

    return name || "field";
  }

  addCustomField() {
    const schemaFields = this.container.querySelector("#schema-fields");
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "flex gap-2 items-center";
    fieldDiv.innerHTML = `
      <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Field name" />
      <select class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <option value="uuid">UUID</option>
        <option value="number">Number</option>
        <option value="string">String</option>
        <option value="name">Name</option>
        <option value="email">Email</option>
        <option value="phone">Phone</option>
        <option value="date">Date</option>
        <option value="boolean">Boolean</option>
        <option value="url">URL</option>
        <option value="ip">IP Address</option>
      </select>
      <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Options (optional)" />
      <button class="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" data-remove="field">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    schemaFields.appendChild(fieldDiv);
  }

  copyData() {
    const output = this.container.querySelector("#data-output").textContent;
    navigator.clipboard.writeText(output).then(() => {
      const btn = this.container.querySelector('[data-action="copy"]');
      const originalHTML = btn.innerHTML;
      const originalClasses = btn.className;
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Copied!
      `;
      btn.className =
        "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2";
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.className = originalClasses;
      }, 2000);
    });
  }

  exportData() {
    const format = this.container.querySelector("#format").value;
    const output = this.container.querySelector("#data-output").textContent;

    const extensions = {
      json: "json",
      csv: "csv",
      sql: "sql",
      xml: "xml",
    };

    const mimeTypes = {
      json: "application/json",
      csv: "text/csv",
      sql: "text/plain",
      xml: "application/xml",
    };

    const blob = new Blob([output], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fake-data.${extensions[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  clear() {
    this.generatedData = [];
    this.container.querySelector("#data-output").innerHTML =
      '<span class="text-gray-500 dark:text-gray-400">Click "Generate Data" to create fake data</span>';
    this.container.querySelector("#count").value = "10";
    this.container.querySelector("#data-type").value = "person";
    this.container.querySelector("#format").value = "json";
    this.updateTypeOptions("person");
  }

  loadTemplate(template) {
    const templates = {
      users: {
        type: "custom",
        fields: [
          { name: "id", type: "uuid" },
          { name: "username", type: "string" },
          { name: "email", type: "email" },
          { name: "fullName", type: "name" },
          { name: "phone", type: "phone" },
          { name: "createdAt", type: "date" },
          { name: "isActive", type: "boolean" },
        ],
      },
      ecommerce: {
        type: "product",
        count: 20,
      },
      blog: {
        type: "custom",
        fields: [
          { name: "id", type: "number" },
          { name: "title", type: "string" },
          { name: "author", type: "name" },
          { name: "publishedAt", type: "date" },
          { name: "views", type: "number" },
          { name: "likes", type: "number" },
        ],
      },
      employees: {
        type: "person",
        count: 50,
      },
      transactions: {
        type: "custom",
        fields: [
          { name: "transactionId", type: "uuid" },
          { name: "amount", type: "number" },
          { name: "currency", type: "string", options: "USD" },
          { name: "timestamp", type: "date" },
          { name: "status", type: "string", options: "completed" },
        ],
      },
      iot: {
        type: "custom",
        fields: [
          { name: "deviceId", type: "uuid" },
          { name: "temperature", type: "number" },
          { name: "humidity", type: "number" },
          { name: "location", type: "string" },
          { name: "timestamp", type: "date" },
        ],
      },
    };

    const tmpl = templates[template];
    if (tmpl) {
      this.container.querySelector("#data-type").value = tmpl.type;
      this.updateTypeOptions(tmpl.type);

      if (tmpl.count) {
        this.container.querySelector("#count").value = tmpl.count;
      }

      if (tmpl.type === "custom" && tmpl.fields) {
        const schemaFields = this.container.querySelector("#schema-fields");
        schemaFields.innerHTML = "";

        tmpl.fields.forEach((field) => {
          const fieldDiv = document.createElement("div");
          fieldDiv.className = "flex gap-2 items-center";
          fieldDiv.innerHTML = `
            <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="${field.name}" />
            <select class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              ${[
                "uuid",
                "number",
                "string",
                "name",
                "email",
                "phone",
                "date",
                "boolean",
                "url",
                "ip",
              ]
                .map(
                  (t) =>
                    `<option value="${t}" ${t === field.type ? "selected" : ""}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`,
                )
                .join("")}
            </select>
            <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value="${field.options || ""}" placeholder="Options (optional)" />
            <button class="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" data-remove="field">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          `;
          schemaFields.appendChild(fieldDiv);
        });
      }

      // Auto-generate after loading template
      this.generateData();
    }
  }
}