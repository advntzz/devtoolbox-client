export class RegexTester {
  constructor() {
    this.container = null;
    this.patternInput = null;
    this.testInput = null;
    this.flagsInputs = {};
    this.outputArea = null;
    this.matchesArea = null;

    this.maxTestLength = 200000;
    this.maxMatches = 10000;
    this.processTimer = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.attachEventListeners();
    this.loadExample();
  }

  destroy() {
    if (this.processTimer) {
      clearTimeout(this.processTimer);
      this.processTimer = null;
    }

    this.container = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Regex Tester</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Test regular expressions with real-time pattern matching and highlighting
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div class="mb-4">
            <label for="regex-pattern" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Regular Expression
            </label>

            <div class="flex items-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2">
              <span class="text-gray-500 font-mono text-lg">/</span>

              <input
                type="text"
                id="regex-pattern"
                class="flex-1 px-2 py-1 bg-transparent text-gray-900 dark:text-white font-mono text-sm focus:outline-none"
                placeholder="[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.[a-zA-Z]+"
                spellcheck="false"
                autocomplete="off"
              />

              <span class="text-gray-500 font-mono text-lg">/</span>

              <div class="flex flex-wrap gap-1 ml-2">
                <label class="flex items-center px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer" title="Global match">
                  <input type="checkbox" id="flag-g" class="mr-1" checked />
                  <span class="font-mono">g</span>
                </label>

                <label class="flex items-center px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer" title="Case insensitive">
                  <input type="checkbox" id="flag-i" class="mr-1" />
                  <span class="font-mono">i</span>
                </label>

                <label class="flex items-center px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer" title="Multiline">
                  <input type="checkbox" id="flag-m" class="mr-1" />
                  <span class="font-mono">m</span>
                </label>

                <label class="flex items-center px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer" title="Dot matches newline">
                  <input type="checkbox" id="flag-s" class="mr-1" />
                  <span class="font-mono">s</span>
                </label>

                <label class="flex items-center px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer" title="Unicode">
                  <input type="checkbox" id="flag-u" class="mr-1" />
                  <span class="font-mono">u</span>
                </label>
              </div>
            </div>

            <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Maximum test text: 200,000 characters · Maximum displayed matches: 10,000
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Common Patterns:
            </label>

            <div class="flex flex-wrap gap-2">
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="email">Email</button>
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="url">URL</button>
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="phone">Phone</button>
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="ipv4">IPv4</button>
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="date">Date</button>
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="hex">Hex Color</button>
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="uuid">UUID</button>
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="creditcard">Credit Card</button>
            </div>
          </div>
        </div>

        <div class="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6" data-error hidden></div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <label for="test-string" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test String
            </label>

            <textarea
              id="test-string"
              class="w-full h-40 p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter text to test against the regex pattern..."
              spellcheck="false"
            >Contact us at support@example.com or sales@company.org for more information.
Our phone numbers are (555) 123-4567 and 555-987-6543.
Visit our website at https://www.example.com</textarea>

            <div class="mt-2 text-xs text-gray-500 dark:text-gray-400" id="test-length">
              0 characters
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Highlighted Matches
            </label>

            <div
              id="highlighted-output"
              class="h-40 p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm text-gray-900 dark:text-white whitespace-pre-wrap overflow-auto"
            ></div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Match Information</h3>

          <div class="flex flex-wrap gap-6 mb-4 text-sm">
            <span class="text-gray-700 dark:text-gray-300">
              <strong>Total Matches:</strong>
              <span id="match-count" class="ml-1 font-mono">0</span>
            </span>

            <span class="text-gray-700 dark:text-gray-300">
              <strong>Pattern Valid:</strong>
              <span id="pattern-valid" class="ml-1 font-mono">—</span>
            </span>
          </div>

          <div class="space-y-3" id="matches-grid"></div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Reference</h3>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">.</code>
              <span class="text-gray-700 dark:text-gray-300">Any character except newline</span>
            </div>

            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">\\d</code>
              <span class="text-gray-700 dark:text-gray-300">Digit (0-9)</span>
            </div>

            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">\\w</code>
              <span class="text-gray-700 dark:text-gray-300">Word character</span>
            </div>

            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">\\s</code>
              <span class="text-gray-700 dark:text-gray-300">Whitespace</span>
            </div>

            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">^</code>
              <span class="text-gray-700 dark:text-gray-300">Start of string/line</span>
            </div>

            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">$</code>
              <span class="text-gray-700 dark:text-gray-300">End of string/line</span>
            </div>

            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">*</code>
              <span class="text-gray-700 dark:text-gray-300">0 or more</span>
            </div>

            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">+</code>
              <span class="text-gray-700 dark:text-gray-300">1 or more</span>
            </div>

            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">?</code>
              <span class="text-gray-700 dark:text-gray-300">0 or 1</span>
            </div>

            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">{n,m}</code>
              <span class="text-gray-700 dark:text-gray-300">Between n and m</span>
            </div>

            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">[abc]</code>
              <span class="text-gray-700 dark:text-gray-300">Character class</span>
            </div>

            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">(abc)</code>
              <span class="text-gray-700 dark:text-gray-300">Capture group</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.patternInput = this.container.querySelector("#regex-pattern");
    this.testInput = this.container.querySelector("#test-string");
    this.outputArea = this.container.querySelector("#highlighted-output");
    this.matchesArea = this.container.querySelector("#matches-grid");
    this.errorDisplay = this.container.querySelector("[data-error]");
    this.testLength = this.container.querySelector("#test-length");

    ["g", "i", "m", "s", "u"].forEach((flag) => {
      this.flagsInputs[flag] = this.container.querySelector(`#flag-${flag}`);
    });

    this.updateTestLength();
  }

  attachEventListeners() {
    this.patternInput.addEventListener("input", () => this.scheduleTest());
    this.testInput.addEventListener("input", () => {
      this.updateTestLength();
      this.scheduleTest();
    });

    Object.values(this.flagsInputs).forEach((input) => {
      input.addEventListener("change", () => this.test());
    });

    this.container.querySelectorAll("[data-pattern]").forEach((button) => {
      button.addEventListener("click", () => {
        const pattern = this.getCommonPattern(button.dataset.pattern);

        if (!pattern) return;

        this.applyPatternExample(pattern);
      });
    });
  }

  scheduleTest() {
    clearTimeout(this.processTimer);

    this.processTimer = setTimeout(() => {
      this.test();
    }, 120);
  }

  getCommonPattern(name) {
    const patterns = {
      email: {
        regex: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
        flags: "gi",
        testString:
          "Contact us at support@example.com or sales@company.org for more information.",
      },

      url: {
        regex:
          "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&\\/\\/=]*)",
        flags: "gi",
        testString:
          "Visit https://www.example.com and https://github.com/openai for more information.",
      },

      phone: {
        regex: "\\(?\\d{3}\\)?[-. ]?\\d{3}[-. ]?\\d{4}",
        flags: "g",
        testString: "Call us at (555) 123-4567 or 555-987-6543 for assistance.",
      },

      ipv4: {
        regex:
          "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
        flags: "g",
        testString:
          "DNS servers: 8.8.8.8 and 1.1.1.1. Local network: 192.168.1.1.",
      },

      date: {
        regex: "\\d{4}[-/]\\d{2}[-/]\\d{2}|\\d{2}[-/]\\d{2}[-/]\\d{4}",
        flags: "g",
        testString: "Important dates: 2026-09-12, 2026/12/25, and 01-01-2027.",
      },

      hex: {
        regex: "#[0-9A-Fa-f]{6}\\b",
        flags: "gi",
        testString: "Brand colors: #FF0000, #00FF00, #3366CC, and #1a2b3c.",
      },

      uuid: {
        regex: "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
        flags: "gi",
        testString:
          "Request IDs: 550e8400-e29b-41d4-a716-446655440000 and 123e4567-e89b-12d3-a456-426614174000.",
      },

      creditcard: {
        regex: "\\b(?:\\d[ -]*?){13,16}\\b",
        flags: "g",
        testString: "Test cards: 4111 1111 1111 1111 and 5555-5555-5555-4444.",
      },
    };

    return patterns[name];
  }

  loadExample() {
    const example = this.getCommonPattern("email");

    this.applyPatternExample(example);
  }

  applyPatternExample(pattern) {
    if (!pattern) return;

    this.patternInput.value = pattern.regex;
    this.testInput.value = pattern.testString || "";

    Object.keys(this.flagsInputs).forEach((flag) => {
      this.flagsInputs[flag].checked = pattern.flags.includes(flag);
    });

    this.updateTestLength();
    this.test();
  }

  test() {
    if (!this.patternInput || !this.testInput) return;

    const pattern = this.patternInput.value;
    const testString = this.testInput.value;

    this.hideError();

    if (!pattern) {
      this.clearResults();
      this.setPatternValid(null);
      return;
    }

    if (testString.length > this.maxTestLength) {
      this.showError(
        `Test string is too long. Maximum allowed length is ${this.maxTestLength.toLocaleString()} characters.`,
      );
      this.clearResults();
      this.setPatternValid(null);
      return;
    }

    try {
      const flags = Object.keys(this.flagsInputs)
        .filter((flag) => this.flagsInputs[flag].checked)
        .join("");

      const regex = new RegExp(pattern, flags);

      this.setPatternValid(true);

      const matches = this.collectMatches(regex, testString);

      this.container.querySelector("#match-count").textContent =
        matches.length.toLocaleString();

      this.highlightMatches(testString, matches);
      this.displayMatches(matches);
    } catch (error) {
      this.setPatternValid(false);
      this.clearResults();
      this.showError(`Invalid regex: ${error.message}`);
    }
  }

  collectMatches(regex, testString) {
    const matches = [];

    if (!regex.global) {
      const match = regex.exec(testString);

      if (match) {
        matches.push(this.normalizeMatch(match));
      }

      return matches;
    }

    while (matches.length < this.maxMatches) {
      const match = regex.exec(testString);

      if (!match) break;

      matches.push(this.normalizeMatch(match));

      /*
       * Important:
       * JavaScript RegExp.exec() can return a zero-length match without
       * advancing lastIndex. We manually advance by one code point to
       * guarantee progress and avoid an infinite loop.
       */
      if (match[0].length === 0) {
        const nextIndex = this.advanceStringIndex(
          testString,
          regex.lastIndex,
          regex.unicode,
        );

        regex.lastIndex = nextIndex;
      }
    }

    if (matches.length >= this.maxMatches) {
      this.showError(
        `Match limit reached (${this.maxMatches.toLocaleString()}). Results were truncated to protect browser performance.`,
      );
    }

    return matches;
  }

  normalizeMatch(match) {
    return {
      text: match[0],
      index: match.index,
      groups: Array.from(match.slice(1)),
    };
  }

  advanceStringIndex(string, index, unicode) {
    if (!unicode || index >= string.length) {
      return Math.min(index + 1, string.length);
    }

    const first = string.charCodeAt(index);

    if (first >= 0xd800 && first <= 0xdbff && index + 1 < string.length) {
      const second = string.charCodeAt(index + 1);

      if (second >= 0xdc00 && second <= 0xdfff) {
        return index + 2;
      }
    }

    return Math.min(index + 1, string.length);
  }

  highlightMatches(text, matches) {
    if (!text) {
      this.outputArea.textContent = "";
      return;
    }

    if (matches.length === 0) {
      this.outputArea.textContent = text;
      return;
    }

    const sortedMatches = [...matches]
      .filter((match) => match.index >= 0 && match.index <= text.length)
      .sort((a, b) => a.index - b.index);

    let html = "";
    let lastIndex = 0;

    sortedMatches.forEach((match) => {
      const start = Math.max(lastIndex, match.index);
      const end = Math.min(text.length, match.index + match.text.length);

      if (start > lastIndex) {
        html += this.escapeHtml(text.slice(lastIndex, start));
      }

      if (end > start) {
        html += `
          <mark class="bg-yellow-200 dark:bg-yellow-800 text-gray-900 dark:text-white px-1 rounded">
            ${this.escapeHtml(text.slice(start, end))}
          </mark>
        `;
        lastIndex = end;
      } else if (match.text.length === 0) {
        /*
         * Zero-length matches have no visible characters to highlight.
         * We intentionally don't insert an empty <mark>, because that can
         * create confusing visual artifacts.
         */
        if (start > lastIndex) {
          lastIndex = start;
        }
      }
    });

    if (lastIndex < text.length) {
      html += this.escapeHtml(text.slice(lastIndex));
    }

    this.outputArea.innerHTML = html;
  }

  displayMatches(matches) {
    if (matches.length === 0) {
      this.matchesArea.innerHTML = `
        <div class="text-gray-500 dark:text-gray-400 text-center py-4">
          No matches found
        </div>
      `;
      return;
    }

    this.matchesArea.innerHTML = matches
      .map((match, index) => {
        const groups = match.groups
          .map(
            (group, groupIndex) => `
              <div class="flex gap-3 py-1">
                <span class="text-gray-500 dark:text-gray-400 shrink-0">
                  Group ${groupIndex + 1}:
                </span>
                <code class="font-mono text-gray-900 dark:text-white break-all">
                  ${this.escapeHtml(group ?? "undefined")}
                </code>
              </div>
            `,
          )
          .join("");

        return `
          <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-900">
            <div class="flex flex-wrap justify-between gap-2 mb-2">
              <span class="font-semibold text-gray-900 dark:text-white">
                Match ${index + 1}
              </span>

              <span class="text-sm text-gray-500 dark:text-gray-400 font-mono">
                Index: ${match.index}
              </span>
            </div>

            <div class="mb-2">
              <div class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                Matched Text
              </div>

              <code class="block font-mono text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 rounded p-2 break-all whitespace-pre-wrap">
                ${this.escapeHtml(match.text)}
              </code>
            </div>

            ${
              groups
                ? `
                  <div>
                    <div class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                      Capture Groups
                    </div>
                    ${groups}
                  </div>
                `
                : ""
            }
          </div>
        `;
      })
      .join("");
  }

  clearResults() {
    this.container.querySelector("#match-count").textContent = "0";
    this.outputArea.textContent = "";

    this.matchesArea.innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-4">
        No matches
      </div>
    `;
  }

  setPatternValid(valid) {
    const indicator = this.container.querySelector("#pattern-valid");

    if (valid === true) {
      indicator.textContent = "✓";
      indicator.className = "ml-1 font-mono text-green-600 dark:text-green-400";
    } else if (valid === false) {
      indicator.textContent = "✗";
      indicator.className = "ml-1 font-mono text-red-600 dark:text-red-400";
    } else {
      indicator.textContent = "—";
      indicator.className = "ml-1 font-mono text-gray-500 dark:text-gray-400";
    }
  }

  updateTestLength() {
    if (!this.testLength || !this.testInput) return;

    const length = this.testInput.value.length;
    this.testLength.textContent = `${length.toLocaleString()} / ${this.maxTestLength.toLocaleString()} characters`;

    if (length > this.maxTestLength) {
      this.testLength.className =
        "mt-2 text-xs text-red-600 dark:text-red-400 font-medium";
    } else {
      this.testLength.className =
        "mt-2 text-xs text-gray-500 dark:text-gray-400";
    }
  }

  showError(message) {
    this.errorDisplay.textContent = message;
    this.errorDisplay.hidden = false;
  }

  hideError() {
    this.errorDisplay.textContent = "";
    this.errorDisplay.hidden = true;
  }

  escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = String(str ?? "");
    return div.innerHTML;
  }
}
