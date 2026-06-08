#!/usr/bin/env node

/**
 * Injects build-time values into HTML files
 * - Replaces {{BUILD_DATE}} placeholder with formatted date in legal pages
 * - Replaces __META_KEYWORDS__, __SITE_URL__, __OG_IMAGE_URL__ in index.html
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

// Revision dates per legal page — update the relevant entry when that policy changes, not on every deploy
const LEGAL_REVISION_DATES = {
  "privacy.html": "June 5, 2026",
  "terms.html": "June 5, 2026",
};

// Configuration for production site
const SITE_URL = "https://paperlyte.app";
const OG_IMAGE_URL = "https://paperlyte.app/og-image.jpg";
const META_KEYWORDS = "note-taking app, distraction-free notes, offline notes, fast note app, tag-based organization, simple notes, privacy-focused notes, cross-platform notes, real-time sync, minimalist note app";

const LEGAL_FILES = ["privacy.html", "terms.html"];

const getHtmlAttribute = (tag, attributeName) => {
  const match = tag.match(new RegExp(`\\b${attributeName}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? match[1] : null;
};

const getMetaContent = (html, selectorAttribute, selectorValue) => {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];

  for (const tag of metaTags) {
    if (getHtmlAttribute(tag, selectorAttribute) === selectorValue) {
      return getHtmlAttribute(tag, "content");
    }
  }

  return null;
};

const validateConfiguredIndexMeta = (html) => {
  const expectedMeta = [
    {
      label: 'meta[name="keywords"]',
      actual: getMetaContent(html, "name", "keywords"),
      expected: META_KEYWORDS,
    },
    {
      label: 'meta[property="og:url"]',
      actual: getMetaContent(html, "property", "og:url"),
      expected: `${SITE_URL}/`,
    },
    {
      label: 'meta[property="og:image"]',
      actual: getMetaContent(html, "property", "og:image"),
      expected: OG_IMAGE_URL,
    },
    {
      label: 'meta[name="twitter:url"]',
      actual: getMetaContent(html, "name", "twitter:url"),
      expected: `${SITE_URL}/`,
    },
    {
      label: 'meta[name="twitter:image"]',
      actual: getMetaContent(html, "name", "twitter:image"),
      expected: OG_IMAGE_URL,
    },
  ];

  const invalidMeta = expectedMeta.filter((meta) => meta.actual !== meta.expected);

  if (invalidMeta.length > 0) {
    console.error('✗ index.html is missing required configured meta values:');
    invalidMeta.forEach((meta) => {
      console.error(`  - ${meta.label} expected "${meta.expected}" but found "${meta.actual || 'missing'}"`);
    });
    process.exit(1);
  }
};

console.log(`Injecting build values...`);
console.log(`- Build date: ${BUILD_DATE}`);
console.log(`- Legal revision dates: privacy=${LEGAL_REVISION_DATES["privacy.html"]}, terms=${LEGAL_REVISION_DATES["terms.html"]}`);
console.log(`- Site URL: ${SITE_URL}`);

// Process legal pages (privacy, terms)
LEGAL_FILES.forEach((file) => {
  // Validate filename
  if (!isFilenameSafe(file)) {
    console.error('✗ Invalid filename detected:', file);
    process.exit(1);
  }

  const filePath = join(DIST_DIR, file);

  try {
    const originalContent = readFileSync(filePath, "utf8");
    let content = originalContent;

    // Replace placeholder with this file's revision date (not build date — changes only when policy content changes)
    content = content.replace(/{{BUILD_DATE}}/g, LEGAL_REVISION_DATES[file]);

    // Verify that placeholders were actually replaced
    if (originalContent === content) {
      console.warn('⚠ Warning: No {{BUILD_DATE}} placeholder found in', file);
    } else {
      writeFileSync(filePath, content, "utf8");
      console.log('✓ Updated', file);
    }
  } catch (error) {
    console.error('✗ Failed to process file:', file, error.message);
    process.exit(1);
  }
});

// Process index.html (meta tags)
const indexPath = join(DIST_DIR, "index.html");
try {
  const originalContent = readFileSync(indexPath, "utf8");
  let content = originalContent;

  // Replace meta placeholders
  content = content.replace(/__META_KEYWORDS__/g, META_KEYWORDS);
  content = content.replace(/__SITE_URL__/g, SITE_URL);
  content = content.replace(/__OG_IMAGE_URL__/g, OG_IMAGE_URL);

  // Verify whether placeholders were present before validating the final configured values
  const replacements = [
    { placeholder: "__META_KEYWORDS__", found: originalContent.includes("__META_KEYWORDS__") },
    { placeholder: "__SITE_URL__", found: originalContent.includes("__SITE_URL__") },
    { placeholder: "__OG_IMAGE_URL__", found: originalContent.includes("__OG_IMAGE_URL__") },
  ];

  const foundPlaceholders = replacements.filter((replacement) => replacement.found);

  validateConfiguredIndexMeta(content);

  if (foundPlaceholders.length === 0) {
    console.log('✓ index.html meta values already configured');
  } else {
    writeFileSync(indexPath, content, "utf8");
    console.log('✓ Updated index.html (replaced', foundPlaceholders.length, 'placeholder types)');
  }
} catch (error) {
  console.error('✗ Failed to process index.html:', error.message);
  process.exit(1);
}

console.log("Injection complete!");
