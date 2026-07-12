#!/usr/bin/env node

/**
 * Injects build-time values into HTML files
 * - Replaces {{BUILD_DATE}} and {{BUILD_YEAR}} placeholders in legal pages
 *
 * index.html's meta tags (%VITE_SEO_KEYWORDS%, %VITE_BASE_URL%, %VITE_OG_IMAGE%)
 * are handled natively by Vite's built-in env replacement during `vite build`,
 * not by this script.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { isFilenameSafe } from "./utils/filenameValidation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, "..", "dist");
const BUILD_DATE = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
const BUILD_YEAR = String(new Date().getFullYear());

// Revision dates per legal page — update the relevant entry when that policy changes, not on every deploy
const LEGAL_REVISION_DATES = {
  "privacy.html": "June 5, 2026",
  "terms.html": "June 5, 2026",
  "cookies.html": "June 27, 2026",
  "security.html": "June 27, 2026",
  "dmca.html": "June 27, 2026",
  "accessibility.html": "June 27, 2026",
};

// Configuration for production site
const SITE_URL = "https://paperlyte.app";

// Derive from LEGAL_REVISION_DATES so the two lists cannot drift and a missing
// revision date can never inject "undefined" into a page.
const LEGAL_FILES = Object.keys(LEGAL_REVISION_DATES);

console.log(`Injecting build values...`);
console.log(`- Build date: ${BUILD_DATE}`);
console.log(
  `- Legal revision dates: ${LEGAL_FILES.map(
    (file) => `${file.replace(/\.html$/, "")}=${LEGAL_REVISION_DATES[file]}`
  ).join(", ")}`
);
console.log(`- Site URL: ${SITE_URL}`);

// Process all legal pages (see LEGAL_REVISION_DATES)
LEGAL_FILES.forEach((file) => {
  // Validate filename
  if (!isFilenameSafe(file)) {
    console.error('✗ Invalid filename detected:', file);
    process.exit(1);
  }

  const filePath = join(DIST_DIR, file);

  try {
    const originalContent = readFileSync(filePath, "utf8");

    // Warn per placeholder independently so a replacement of one can never mask
    // the absence of the other.
    if (!originalContent.includes("{{BUILD_DATE}}")) {
      console.warn('⚠ Warning: No {{BUILD_DATE}} placeholder found in', file);
    }
    if (!originalContent.includes("{{BUILD_YEAR}}")) {
      console.warn('⚠ Warning: No {{BUILD_YEAR}} placeholder found in', file);
    }

    const content = originalContent
      // Replace placeholder with this file's revision date (not build date — changes only when policy content changes)
      .replace(/{{BUILD_DATE}}/g, LEGAL_REVISION_DATES[file])
      // Replace copyright year placeholder with the current build year
      .replace(/{{BUILD_YEAR}}/g, BUILD_YEAR);

    if (content !== originalContent) {
      writeFileSync(filePath, content, "utf8");
      console.log('✓ Updated', file);
    }
  } catch (error) {
    console.error('✗ Failed to process file:', file, error.message);
    process.exit(1);
  }
});

console.log("Injection complete!");
