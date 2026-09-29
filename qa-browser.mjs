import { chromium } from "playwright";

const BASE_URL = "http://localhost:52474/";

const browser = await chromium.launch({
  headless: true,
});

const page = await browser.newPage({
  viewport: {
    width: 1440,
    height: 900,
  },
});

const results = [];

console.log("");
console.log("╔════════════════════════════════════════════╗");
console.log("║       DEVTOOLBOX BROWSER SMOKE QA         ║");
console.log("╚════════════════════════════════════════════╝");
console.log("");

try {
  // Open homepage first
  await page.goto(BASE_URL, {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });

  await page.waitForTimeout(500);

  // Collect all sidebar routes dynamically
  const tools = await page.locator("a.nav-link").evaluateAll((links) =>
    links
      .map((link) => ({
        name: link.textContent.trim(),
        href: link.getAttribute("href"),
      }))
      .filter((item) => item.href && item.href.startsWith("#")),
  );

  console.log(`Found ${tools.length} sidebar routes.`);
  console.log("");

  if (!tools.length) {
    throw new Error("No .nav-link routes found in sidebar.");
  }

  for (const tool of tools) {
    const consoleErrors = [];
    const pageErrors = [];

    const onConsole = (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    };

    const onPageError = (error) => {
      pageErrors.push(error.message);
    };

    page.on("console", onConsole);
    page.on("pageerror", onPageError);

    try {
      const url = `${BASE_URL}${tool.href}`;

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      // Give the lazy-loaded tool time to initialize.
      await page.waitForTimeout(700);

      const activeLink = await page
        .locator(`a.nav-link[href="${tool.href}"]`)
        .count();

      const mainText = await page
        .locator("main")
        .innerText()
        .catch(() => "");

      const hasWelcomePage =
        mainText.includes("Welcome to DevToolbox") &&
        mainText.includes("Select a tool from the sidebar");

      const hasContent = mainText.trim().length > 50;

      const hasFatalConsoleError = consoleErrors.some(
        (error) => !error.toLowerCase().includes("serviceworker"),
      );

      const hasPageError = pageErrors.length > 0;

      const passed =
        activeLink > 0 &&
        hasContent &&
        !hasWelcomePage &&
        !hasPageError &&
        !hasFatalConsoleError;

      if (passed) {
        console.log(`[PASS] ${tool.name}`);
      } else {
        console.log(`[FAIL] ${tool.name}`);

        if (!hasContent) {
          console.log("       - Main content appears empty");
        }

        if (hasWelcomePage) {
          console.log("       - Still showing homepage");
        }

        if (hasPageError) {
          console.log("       - Page error:");
          pageErrors.forEach((error) => {
            console.log(`         ${error}`);
          });
        }

        if (hasFatalConsoleError) {
          console.log("       - Console error:");
          consoleErrors.forEach((error) => {
            console.log(`         ${error}`);
          });
        }
      }

      results.push({
        name: tool.name,
        href: tool.href,
        passed,
      });
    } catch (error) {
      console.log(`[FAIL] ${tool.name}`);
      console.log(`       - ${error.message}`);

      results.push({
        name: tool.name,
        href: tool.href,
        passed: false,
      });
    }

    page.off("console", onConsole);
    page.off("pageerror", onPageError);
  }
} catch (error) {
  console.error("");
  console.error("FATAL QA ERROR:");
  console.error(error.message);
  await browser.close();
  process.exit(1);
}

await browser.close();

const passed = results.filter((result) => result.passed).length;
const failed = results.length - passed;

console.log("");
console.log("────────────────────────────────────────────");
console.log(`PASS:  ${passed}`);
console.log(`FAIL:  ${failed}`);
console.log(`TOTAL: ${results.length}`);
console.log("────────────────────────────────────────────");

if (failed === 0) {
  console.log("");
  console.log("🎉 ALL BROWSER ROUTES PASSED!");
  console.log("");
  process.exit(0);
} else {
  console.log("");
  console.log("❌ SOME BROWSER ROUTES FAILED.");
  console.log("");
  process.exit(1);
}
