import { ToolTemplate } from "./tool-template.js";

export class GraphQLTester extends ToolTemplate {
  constructor() {
    super();

    this.config = {
      name: "GraphQL Tester",
      description:
        "Test GraphQL queries and mutations with variables, headers, and introspection",
      version: "2.0.0",
      author: "DevToolbox",
      category: "Developer Tools",
      keywords: [
        "graphql",
        "query",
        "mutation",
        "api",
        "testing",
        "variables",
        "introspection",
      ],
    };

    this.queryHistory = [];
    this.abortController = null;
    this.timeoutId = null;
    this.requestTimeout = 15000;
    this.activeTab = "query";
  }

  render() {
    this.container.innerHTML = `
      <div class="tool-container">
        <div class="tool-header">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">${this.escapeHtml(this.config.name)}</h1>
          <p class="text-gray-600 dark:text-gray-400">${this.escapeHtml(this.config.description)}</p>
        </div>

        <div class="tool-body bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div class="mb-6 flex flex-wrap gap-2">
            <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="execute" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Execute Query
            </button>

            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="prettify" type="button">
              Prettify
            </button>

            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="copy-query" type="button">
              Copy Query
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
              <div class="mb-4">
                <label for="endpoint-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  GraphQL Endpoint
                </label>
                <input
                  type="text"
                  id="endpoint-input"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="https://api.example.com/graphql"
                  value="https://countries.trevorblades.com/"
                  autocomplete="url"
                  spellcheck="false"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Use an HTTP or HTTPS GraphQL endpoint that allows browser requests.
                </p>
              </div>

              <div>
                <div class="flex mb-2 border-b border-gray-200 dark:border-gray-700" role="tablist">
                  <button class="px-4 py-2 text-sm font-medium" data-tab="query" type="button" role="tab">Query</button>
                  <button class="px-4 py-2 text-sm font-medium" data-tab="variables" type="button" role="tab">Variables</button>
                  <button class="px-4 py-2 text-sm font-medium" data-tab="headers" type="button" role="tab">Headers</button>
                </div>

                <div>
                  <div class="tab-pane" data-pane="query">
                    <textarea
                      id="query-editor"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="query {&#10;  field&#10;}"
                      spellcheck="false"
                      rows="12"
                    ></textarea>
                    <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Ctrl/Cmd + Enter: execute · Ctrl/Cmd + Shift + P: prettify
                    </div>
                  </div>

                  <div class="tab-pane hidden" data-pane="variables">
                    <textarea
                      id="variables-editor"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder='{"variableName":"value"}'
                      spellcheck="false"
                      rows="12"
                    >{}</textarea>
                    <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Variables must be valid JSON.
                    </div>
                  </div>

                  <div class="tab-pane hidden" data-pane="headers">
                    <div id="headers-list" class="space-y-2 mb-3"></div>
                    <button class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30" data-add="header" type="button">
                      Add Header
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="flex justify-between items-center mb-4 gap-3">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Response</h3>
                <div class="text-sm text-gray-600 dark:text-gray-400" id="response-meta"></div>
              </div>

              <pre id="response-output" class="w-full p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white font-mono text-sm overflow-auto" style="min-height: 200px; max-height: 500px;"><span class="text-gray-500 dark:text-gray-400">Execute a query to see the response here</span></pre>

              <button class="mt-3 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="copy-response" type="button" hidden>
                Copy Response
              </button>
            </div>
          </div>

          <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Query History</h3>
            <div id="query-history" class="space-y-2"></div>
          </div>

          <div class="mt-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Example Queries</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="countries" type="button">Countries API</button>
              <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="spacex" type="button">SpaceX API</button>
              <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="github" type="button">GitHub API</button>
              <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="pokemon" type="button">Pokemon API</button>
              <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="introspection" type="button">Introspection</button>
              <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="mutation" type="button">Mutation Example</button>
            </div>
          </div>

          <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">GraphQL Tester Information</h4>
            <p class="text-sm text-blue-700 dark:text-blue-300">
              • Sends real GraphQL POST requests from your browser<br/>
              • Variables and custom headers are included in the request<br/>
              • Browser CORS rules still apply to the target endpoint<br/>
              • A failed network request does not generate a fake response
            </p>
          </div>
        </div>
      </div>
    `;

    this.renderDefaultHeaders();
    this.switchTab("query");
    this.updateHistoryDisplay();
  }

  attachEventListeners() {
    this.loadExampleQuery();

    this.container
      .querySelector('[data-action="execute"]')
      ?.addEventListener("click", () => this.executeQuery());
    this.container
      .querySelector('[data-action="prettify"]')
      ?.addEventListener("click", () => this.prettifyQuery());
    this.container
      .querySelector('[data-action="copy-query"]')
      ?.addEventListener("click", (event) =>
        this.copyQuery(event.currentTarget),
      );
    this.container
      .querySelector('[data-action="copy-response"]')
      ?.addEventListener("click", (event) =>
        this.copyResponse(event.currentTarget),
      );
    this.container
      .querySelector('[data-action="clear"]')
      ?.addEventListener("click", () => this.clear());

    this.container.querySelectorAll("[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
    });

    this.container
      .querySelector('[data-add="header"]')
      ?.addEventListener("click", () => this.addHeader());

    this.container.addEventListener("click", (event) => {
      const removeButton = event.target.closest('[data-remove="header"]');
      if (removeButton && this.container.contains(removeButton)) {
        removeButton.closest("[data-header-row]")?.remove();
      }

      const historyItem = event.target.closest(".history-item");
      if (historyItem && this.container.contains(historyItem)) {
        const index = Number(historyItem.dataset.index);
        this.loadFromHistory(index);
      }
    });

    this.container.querySelectorAll("[data-example]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.loadExample(btn.dataset.example);
      });
    });

    const queryEditor = this.container.querySelector("#query-editor");
    queryEditor?.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        this.executeQuery();
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "p"
      ) {
        event.preventDefault();
        this.prettifyQuery();
      }
    });
  }

  switchTab(tab) {
    const allowedTabs = ["query", "variables", "headers"];
    if (!allowedTabs.includes(tab)) return;

    this.activeTab = tab;

    this.container.querySelectorAll("[data-tab]").forEach((btn) => {
      const active = btn.dataset.tab === tab;
      btn.className = active
        ? "px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
        : "px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white";
      btn.setAttribute("aria-selected", String(active));
    });

    this.container.querySelectorAll(".tab-pane").forEach((pane) => {
      const active = pane.dataset.pane === tab;
      pane.classList.toggle("hidden", !active);
      pane.classList.toggle("block", active);
    });
  }

  async executeQuery() {
    const endpoint =
      this.container.querySelector("#endpoint-input")?.value.trim() || "";
    const query =
      this.container.querySelector("#query-editor")?.value.trim() || "";

    if (!endpoint) {
      this.showError("Please enter a GraphQL endpoint.");
      return;
    }

    if (!this.isValidEndpoint(endpoint)) {
      this.showError(
        "Invalid GraphQL endpoint. Use a valid HTTP or HTTPS URL.",
      );
      return;
    }

    if (!query) {
      this.showError("Please enter a GraphQL query.");
      return;
    }

    let variables = {};
    const variablesText =
      this.container.querySelector("#variables-editor")?.value.trim() || "";

    if (variablesText) {
      try {
        variables = JSON.parse(variablesText);
      } catch (error) {
        this.showError(`Invalid JSON in variables: ${error.message}`);
        return;
      }

      if (
        !variables ||
        Array.isArray(variables) ||
        typeof variables !== "object"
      ) {
        this.showError("GraphQL variables must be a JSON object.");
        return;
      }
    }

    const headers = this.collectHeaders();

    this.cancelActiveRequest();

    const executeButton = this.container.querySelector(
      '[data-action="execute"]',
    );
    const responseOutput = this.container.querySelector("#response-output");
    const responseMeta = this.container.querySelector("#response-meta");
    const copyResponseButton = this.container.querySelector(
      '[data-action="copy-response"]',
    );

    if (executeButton) {
      executeButton.disabled = true;
      executeButton.textContent = "Executing...";
    }

    if (copyResponseButton) {
      copyResponseButton.hidden = true;
    }

    if (responseOutput) {
      responseOutput.innerHTML =
        '<span class="text-gray-500 dark:text-gray-400">Executing real GraphQL request...</span>';
    }

    if (responseMeta) {
      responseMeta.textContent = "";
    }

    const startTime = performance.now();
    this.abortController = new AbortController();

    this.timeoutId = setTimeout(() => {
      this.abortController?.abort();
    }, this.requestTimeout);

    try {
      const result = await this.sendGraphQLRequest(
        endpoint,
        query,
        variables,
        headers,
        this.abortController.signal,
      );

      const duration = Math.round(performance.now() - startTime);

      this.displayResponse(result.body, {
        duration,
        status: result.status,
        statusText: result.statusText,
        size: result.size,
        contentType: result.contentType,
      });

      this.addToHistory(query, endpoint, variables);

      if (copyResponseButton) {
        copyResponseButton.hidden = false;
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        this.showError(
          `Request timed out after ${Math.round(this.requestTimeout / 1000)} seconds or was cancelled.`,
        );
      } else {
        this.showError(`Request failed: ${error?.message || "Unknown error"}`);
      }
    } finally {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }

      this.abortController = null;

      if (executeButton) {
        executeButton.disabled = false;
        executeButton.textContent = "Execute Query";
      }
    }
  }

  async sendGraphQLRequest(endpoint, query, variables, headers, signal) {
    const payload = {
      query,
      variables,
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal,
      credentials: "omit",
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") || "";
    const rawText = await response.text();
    const size = new Blob([rawText]).size;

    let body = rawText;

    if (
      contentType.toLowerCase().includes("application/json") ||
      this.looksLikeJSON(rawText)
    ) {
      try {
        body = rawText ? JSON.parse(rawText) : null;
      } catch {
        body = rawText;
      }
    }

    if (!response.ok) {
      const detail = this.getHTTPErrorDetail(body);
      throw new Error(
        `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}${detail ? ` — ${detail}` : ""}`,
      );
    }

    return {
      body,
      status: response.status,
      statusText: response.statusText,
      size,
      contentType,
    };
  }

  collectHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    this.container.querySelectorAll("[data-header-row]").forEach((row) => {
      const keyInput = row.querySelector("[data-header-key]");
      const valueInput = row.querySelector("[data-header-value]");
      const key = keyInput?.value.trim() || "";
      const value = valueInput?.value ?? "";

      if (key) {
        headers[key] = value;
      }
    });

    headers["Content-Type"] = "application/json";

    return headers;
  }

  renderDefaultHeaders() {
    const headersList = this.container.querySelector("#headers-list");
    if (!headersList) return;

    headersList.replaceChildren();
    this.addHeader("Content-Type", "application/json");
  }

  addHeader(name = "", value = "") {
    const headersList = this.container.querySelector("#headers-list");
    if (!headersList) return;

    const row = document.createElement("div");
    row.className = "flex gap-2";
    row.dataset.headerRow = "";

    const keyInput = document.createElement("input");
    keyInput.type = "text";
    keyInput.className =
      "flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white";
    keyInput.placeholder = "Header name";
    keyInput.value = name;
    keyInput.dataset.headerKey = "";

    const valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.className =
      "flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white";
    valueInput.placeholder = "Header value";
    valueInput.value = value;
    valueInput.dataset.headerValue = "";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className =
      "p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md";
    removeButton.dataset.remove = "header";
    removeButton.setAttribute("aria-label", "Remove header");
    removeButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    `;

    row.append(keyInput, valueInput, removeButton);
    headersList.appendChild(row);
  }

  displayResponse(response, meta = {}) {
    const responseOutput = this.container.querySelector("#response-output");
    const responseMeta = this.container.querySelector("#response-meta");

    if (!responseOutput) return;

    const formatted =
      typeof response === "string"
        ? response
        : JSON.stringify(response, null, 2);

    if (typeof response === "string") {
      responseOutput.textContent = formatted;
    } else {
      responseOutput.innerHTML = this.syntaxHighlightJSON(formatted);
    }

    if (responseMeta) {
      responseMeta.replaceChildren();

      const status = document.createElement("span");
      status.className = `response-status ${this.hasGraphQLErrors(response) ? "error" : "success"}`;
      status.textContent = `${meta.status ?? "—"}${meta.statusText ? ` ${meta.statusText}` : ""}`;

      const time = document.createElement("span");
      time.className = "response-time ml-2";
      time.textContent = `${meta.duration ?? 0}ms`;

      const size = document.createElement("span");
      size.className = "response-size ml-2";
      size.textContent = `${meta.size ?? new Blob([formatted]).size} bytes`;

      responseMeta.append(status, time, size);
    }
  }

  syntaxHighlightJSON(json) {
    const escaped = this.escapeHtml(json);

    return escaped.replace(
      /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = "json-number";

        if (match.startsWith('"')) {
          cls = /:\s*$/.test(match) ? "json-key" : "json-string";
        } else if (match === "true" || match === "false") {
          cls = "json-boolean";
        } else if (match === "null") {
          cls = "json-null";
        }

        return `<span class="${cls}">${match}</span>`;
      },
    );
  }

  prettifyQuery() {
    const queryEditor = this.container.querySelector("#query-editor");
    if (!queryEditor?.value.trim()) return;

    try {
      queryEditor.value = this.prettifyGraphQL(queryEditor.value);
    } catch {
      this.showError("Failed to prettify query.");
    }
  }

  prettifyGraphQL(query) {
    const source = String(query).trim();
    let result = "";
    let indent = 0;
    let inString = false;
    let inComment = false;
    let escapeNext = false;
    let lineStart = true;

    const appendIndent = () => {
      if (lineStart) {
        result += "  ".repeat(indent);
        lineStart = false;
      }
    };

    for (let i = 0; i < source.length; i++) {
      const char = source[i];
      const next = source[i + 1];

      if (inComment) {
        appendIndent();
        result += char;
        if (char === "\n") {
          inComment = false;
          lineStart = true;
        }
        continue;
      }

      if (inString) {
        appendIndent();
        result += char;

        if (escapeNext) {
          escapeNext = false;
        } else if (char === "\\") {
          escapeNext = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === "#" && !inString) {
        appendIndent();
        result += char;
        inComment = true;
        continue;
      }

      if (char === '"') {
        appendIndent();
        result += char;
        inString = true;
        continue;
      }

      if (/\s/.test(char)) {
        if (char === "\n") {
          if (!result.endsWith("\n")) result += "\n";
          lineStart = true;
        } else if (
          !lineStart &&
          !result.endsWith(" ") &&
          !result.endsWith("\n")
        ) {
          result += " ";
        }
        continue;
      }

      if (char === "{") {
        appendIndent();
        result = result.trimEnd() + " {\n";
        indent++;
        lineStart = true;
        continue;
      }

      if (char === "}") {
        if (!result.endsWith("\n")) result += "\n";
        indent = Math.max(0, indent - 1);
        result += "  ".repeat(indent) + "}";
        lineStart = false;

        if (next && next !== "}" && next !== ")" && next !== ",") {
          result += "\n";
          lineStart = true;
        }
        continue;
      }

      if (char === "(") {
        appendIndent();
        result = result.trimEnd() + "(";
        continue;
      }

      if (char === ")") {
        result = result.trimEnd() + ")";
        continue;
      }

      if (char === ":") {
        result = result.trimEnd() + ": ";
        continue;
      }

      if (char === ",") {
        result = result.trimEnd() + ", ";
        continue;
      }

      appendIndent();
      result += char;
    }

    return result
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  addToHistory(query, endpoint, variables) {
    this.queryHistory.unshift({
      query,
      endpoint,
      variables,
      timestamp: new Date().toISOString(),
    });

    if (this.queryHistory.length > 10) {
      this.queryHistory.length = 10;
    }

    this.updateHistoryDisplay();
  }

  updateHistoryDisplay() {
    const historyDiv = this.container.querySelector("#query-history");
    if (!historyDiv) return;

    historyDiv.replaceChildren();

    if (this.queryHistory.length === 0) {
      const empty = document.createElement("div");
      empty.className = "text-gray-500 dark:text-gray-400 text-sm";
      empty.textContent = "No query history yet";
      historyDiv.appendChild(empty);
      return;
    }

    this.queryHistory.forEach((item, index) => {
      const historyItem = document.createElement("div");
      historyItem.className =
        "history-item p-3 bg-white dark:bg-gray-800 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors";
      historyItem.dataset.index = String(index);

      const preview = document.createElement("div");
      preview.className =
        "history-query font-mono text-sm text-gray-800 dark:text-gray-200 break-all";
      const firstLine =
        String(item.query)
          .split("\n")
          .find((line) => line.trim()) || item.query;
      preview.textContent = `${firstLine.substring(0, 80)}${firstLine.length > 80 ? "…" : ""}`;

      const meta = document.createElement("div");
      meta.className =
        "history-meta text-xs text-gray-500 dark:text-gray-400 mt-1 flex gap-2 flex-wrap";

      const endpoint = document.createElement("span");
      endpoint.className = "history-endpoint";
      endpoint.textContent = this.getEndpointLabel(item.endpoint);

      const time = document.createElement("span");
      time.className = "history-time";
      time.textContent = new Date(item.timestamp).toLocaleTimeString();

      meta.append(endpoint, time);
      historyItem.append(preview, meta);
      historyDiv.appendChild(historyItem);
    });
  }

  loadFromHistory(index) {
    const item = this.queryHistory[index];
    if (!item) return;

    this.container.querySelector("#endpoint-input").value = item.endpoint;
    this.container.querySelector("#query-editor").value = item.query;
    this.container.querySelector("#variables-editor").value = JSON.stringify(
      item.variables ?? {},
      null,
      2,
    );

    this.updateLineNumbers();
    this.switchTab("query");
  }

  async copyQuery(button) {
    const query = this.container.querySelector("#query-editor")?.value || "";

    if (!query) {
      this.showError("Nothing to copy.");
      return;
    }

    await this.copyText(query, button, "Query copied");
  }

  async copyResponse(button) {
    const output = this.container.querySelector("#response-output");
    const response = output?.textContent || "";

    if (!response) {
      this.showError("No response to copy.");
      return;
    }

    await this.copyText(response, button, "Response copied");
  }

  async copyText(text, button, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      this.showSuccess(successMessage, button);
    } catch {
      this.showError("Clipboard access failed. Copy the text manually.");
    }
  }

  clear() {
    this.cancelActiveRequest();

    const queryEditor = this.container.querySelector("#query-editor");
    const variablesEditor = this.container.querySelector("#variables-editor");
    const endpointInput = this.container.querySelector("#endpoint-input");
    const responseOutput = this.container.querySelector("#response-output");
    const responseMeta = this.container.querySelector("#response-meta");
    const copyResponseButton = this.container.querySelector(
      '[data-action="copy-response"]',
    );

    if (queryEditor) queryEditor.value = "";
    if (variablesEditor) variablesEditor.value = "{}";
    if (endpointInput)
      endpointInput.value = "https://countries.trevorblades.com/";

    if (responseOutput) {
      responseOutput.innerHTML =
        '<span class="text-gray-500 dark:text-gray-400">Execute a query to see the response here</span>';
    }

    if (responseMeta) responseMeta.textContent = "";
    if (copyResponseButton) copyResponseButton.hidden = true;

    this.renderDefaultHeaders();
    this.switchTab("query");
  }

  showError(message) {
    const responseOutput = this.container.querySelector("#response-output");
    const responseMeta = this.container.querySelector("#response-meta");

    if (responseOutput) {
      responseOutput.replaceChildren();

      const error = document.createElement("span");
      error.className = "text-red-600 dark:text-red-400";
      error.textContent = String(message);

      responseOutput.appendChild(error);
    }

    if (responseMeta) {
      responseMeta.replaceChildren();

      const status = document.createElement("span");
      status.className = "response-status error";
      status.textContent = "Error";

      responseMeta.appendChild(status);
    }
  }

  showSuccess(message, button) {
    if (!button) return;

    const originalText = button.textContent;
    button.textContent = message;
    button.classList.add("btn-success");

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove("btn-success");
    }, 1500);
  }

  cancelActiveRequest() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  isValidEndpoint(endpoint) {
    try {
      const url = new URL(endpoint);

      if (!["http:", "https:"].includes(url.protocol)) {
        return false;
      }

      if (!url.hostname) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  looksLikeJSON(text) {
    const value = String(text).trim();
    return value.startsWith("{") || value.startsWith("[");
  }

  getHTTPErrorDetail(body) {
    if (!body) return "";

    if (typeof body === "string") {
      return body.replace(/\s+/g, " ").trim().substring(0, 300);
    }

    if (Array.isArray(body.errors) && body.errors.length) {
      return body.errors
        .map((error) => error?.message)
        .filter(Boolean)
        .join("; ")
        .substring(0, 300);
    }

    return "";
  }

  hasGraphQLErrors(response) {
    return Boolean(
      response &&
      typeof response === "object" &&
      Array.isArray(response.errors) &&
      response.errors.length,
    );
  }

  getEndpointLabel(endpoint) {
    try {
      return new URL(endpoint).hostname;
    } catch {
      return String(endpoint);
    }
  }

  loadExample(type) {
    const examples = {
      countries: {
        endpoint: "https://countries.trevorblades.com/",
        query: `query GetCountries {
  countries {
    code
    name
    emoji
    capital
    currency
    languages {
      code
      name
    }
  }
}`,
        variables: {},
      },

      spacex: {
        endpoint: "https://api.spacex.land/graphql/",
        query: `query GetLaunches($limit: Int!) {
  launches(limit: $limit) {
    id
    mission_name
    launch_year
    launch_success
    rocket {
      rocket_name
      rocket_type
    }
  }
}`,
        variables: { limit: 10 },
      },

      github: {
        endpoint: "https://api.github.com/graphql",
        query: `query GetUserInfo($login: String!) {
  user(login: $login) {
    name
    bio
    avatarUrl
    repositories(first: 10) {
      nodes {
        name
        description
        stargazerCount
      }
    }
  }
}`,
        variables: { login: "octocat" },
      },

      pokemon: {
        endpoint: "https://graphql-pokemon2.vercel.app/",
        query: `query GetPokemon($name: String!) {
  pokemon(name: $name) {
    id
    number
    name
    types
    resistant
    weaknesses
    attacks {
      fast {
        name
        type
        damage
      }
    }
  }
}`,
        variables: { name: "Pikachu" },
      },

      introspection: {
        endpoint: "https://countries.trevorblades.com/",
        query: `query IntrospectionQuery {
  __schema {
    queryType {
      name
    }
    mutationType {
      name
    }
    subscriptionType {
      name
    }
    types {
      kind
      name
      description
    }
  }
}`,
        variables: {},
      },

      mutation: {
        endpoint: "https://api.example.com/graphql",
        query: `mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
    createdAt
  }
}`,
        variables: {
          input: {
            name: "John Doe",
            email: "john@example.com",
            password: "secure123",
          },
        },
      },
    };

    const example = examples[type];
    if (!example) return;

    this.container.querySelector("#endpoint-input").value = example.endpoint;
    this.container.querySelector("#query-editor").value = example.query;
    this.container.querySelector("#variables-editor").value = JSON.stringify(
      example.variables,
      null,
      2,
    );

    this.switchTab("query");
  }

  loadExampleQuery() {
    this.loadExample("countries");
  }

  updateLineNumbers() {
    // Kept as a compatibility hook for the original tool architecture.
    // The current editor uses a normal textarea without a separate line-number pane.
  }

  syncLineNumberScroll() {
    // Compatibility hook.
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text ?? "");
    return div.innerHTML;
  }
}
