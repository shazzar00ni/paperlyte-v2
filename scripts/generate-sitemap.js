// scripts/generate-sitemap.js
// Dynamically generates sitemap.xml with <lastmod> tags using last git commit date for each page.
// Usage: node scripts/generate-sitemap.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Map URLs to their source files for lastmod tracking
const pages = [
  {
    url: 'https://paperlyte.com/',
    file: path.join(__dirname, '../index.html'),
    changefreq: 'weekly',
    priority: '1.0',
  },
  {
    url: 'https://paperlyte.com/privacy',
    file: path.join(__dirname, '../public/privacy.html'),
    changefreq: 'monthly',
    priority: '0.5',
  },
  {
    url: 'https://paperlyte.com/terms',
    file: path.join(__dirname, '../public/terms.html'),
    changefreq: 'monthly',
    priority: '0.5',
  },
  {
    url: 'https://paperlyte.com/data-deletion',
    // No direct file, so omit lastmod
    file: null,
    changefreq: 'monthly',
    priority: '0.3',
  },
];

/**
 * Retrieve the last Git commit date for the given file as `YYYY-MM-DD`.
 *
 * Attempts to read the most recent commit date for the file from Git. If the date
 * is present and matches the `YYYY-MM-DD` pattern, it is returned; otherwise `null` is returned.
 *
 * @param {string} filePath - Path to the file (as passed to `git`) to query.
 * @returns {string|null} The last commit date in `YYYY-MM-DD` format, or `null` if unavailable or invalid.
 */
function getLastGitCommitDate(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const date = execSync(
      `git log -1 --format=%cs -- "${filePath}"`,
      { encoding: 'utf8' }
    ).trim();
    // Validate YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Build an XML sitemap string containing each page's URL and metadata.
 *
 * Constructs a sitemap with a <url> entry for every element in `pages`. If a page has an associated source `file` and a valid Git commit date is available, a `<lastmod>` element is included for that entry. Every entry includes `<loc>`, `<changefreq>`, and `<priority>`.
 *
 * @param {Array<{url: string, file: string|null, changefreq: string, priority: string}>} pages - Array of page descriptors; `file` may be null when no source file is available.
 * @returns {string} The complete sitemap XML as a string.
 */
function buildSitemap(pages) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
    '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
    '',
  ];
  for (const page of pages) {
    lines.push('  <url>');
    lines.push(`    <loc>${page.url}</loc>`);
    if (page.file) {
      const lastmod = getLastGitCommitDate(page.file);
      if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
    }
    lines.push(`    <changefreq>${page.changefreq}</changefreq>`);
    lines.push(`    <priority>${page.priority}</priority>`);
    lines.push('  </url>');
    lines.push('');
  }
  lines.push('</urlset>');
  return lines.join('\n');
}

const sitemap = buildSitemap(pages);
const outPath = path.join(__dirname, '../public/sitemap.xml');

try {
  fs.writeFileSync(outPath, sitemap, 'utf8');
  console.log(`✓ Sitemap generated at ${outPath}`);
} catch (error) {
  console.error(`✗ Failed to write sitemap: ${error.message}`);
  process.exit(1);
}