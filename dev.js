#!/usr/bin/env node

import { spawn } from "node:child_process";
import { watch } from "node:fs";

function runBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["build-css.js"], {
      stdio: "inherit",
    });

    child.on("error", reject);

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`CSS build exited with code ${code}`));
      }
    });
  });
}

let timer = null;
let building = false;
let queued = false;

async function rebuildCSS() {
  if (building) {
    queued = true;
    return;
  }

  building = true;

  try {
    await runBuild();
  } catch (error) {
    console.error("CSS rebuild failed:", error.message);
  } finally {
    building = false;

    if (queued) {
      queued = false;
      rebuildCSS();
    }
  }
}

await rebuildCSS();

console.log("Watching css/input.css for changes...");

watch("css/input.css", { persistent: true }, () => {
  clearTimeout(timer);

  timer = setTimeout(() => {
    rebuildCSS();
  }, 120);
});

const vite = spawn(process.execPath, ["node_modules/vite/bin/vite.js"], {
  stdio: "inherit",
});

function shutdown(signal) {
  console.log(`\n${signal} received. Stopping DevToolbox...`);

  vite.kill("SIGINT");
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
