#!/usr/bin/env node

/**
 * Injects current build date into legal pages (privacy.html, terms.html)
 * Replaces {{BUILD_DATE}} placeholder with formatted date
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, "..", "dist");
const BUILD_DATE = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const FILES_TO_PROCESS = ["privacy.html", "terms.html"];

console.log(`Injecting build date: ${BUILD_DATE}`);

FILES_TO_PROCESS.forEach((file) => {
  const filePath = join(DIST_DIR, file);

  try {
    let content = readFileSync(filePath, "utf8");

    // Replace placeholder with actual build date
    content = content.replace(/{{BUILD_DATE}}/g, BUILD_DATE);

    writeFileSync(filePath, content, "utf8");
    console.log(`✓ Updated ${file}`);
  } catch (error) {
    console.error(`✗ Failed to process ${file}:`, error.message);
    process.exit(1);
  }
});

console.log("Date injection complete!");
