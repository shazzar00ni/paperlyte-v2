// scripts/generate-sitemap.cjs
// Dynamically generates sitemap.xml with <lastmod> tags using last git commit date for each page.
// Usage: node scripts/generate-sitemap.cjs

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Base domain for sitemap URLs
const DOMAIN = 'https://paperlyte.com';

// Map URLs to their source files for lastmod tracking
const pages = [
  {
    url: `${DOMAIN}/`,
    file: path.join(__dirname, '../index.html'),
    changefreq: 'weekly',
    priority: '1.0',
  },
  {
    url: `${DOMAIN}/privacy`,
    file: path.join(__dirname, '../public/privacy.html'),
    changefreq: 'monthly',
    priority: '0.5',
  },
  {
    url: `${DOMAIN}/terms`,
    file: path.join(__dirname, '../public/terms.html'),
    changefreq: 'monthly',
    priority: '0.5',
  },
];

/**
 * Retrieve the last Git commit date for a file as `YYYY-MM-DD`.
 *
 * @param {string} filePath - Path to the file to inspect.
 * @returns {string|null} The commit date in `YYYY-MM-DD` format if available and valid, `null` otherwise.
 */
function getLastGitCommitDate(filePath) {
  try {
    const date = execSync(`git log -1 --format=%cs -- "${filePath}"`, { encoding: 'utf8' }).trim();
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
 * Builds an XML sitemap string from an array of page descriptors.
 *
 * @param {Array<{url: string, file: string|null, changefreq: string, priority: string}>} pages - Array of page objects. Each object must include `url`, `changefreq`, and `priority`. If `file` is a string, the function will attempt to include a `<lastmod>` element based on that file's last Git commit date; if `file` is `null`, `<lastmod>` is omitted.
 * @returns {string} The complete sitemap XML containing `<url>` entries with `<loc>`, optional `<lastmod>`, `<changefreq>`, and `<priority>` elements.
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
