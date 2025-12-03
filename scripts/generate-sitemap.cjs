// scripts/generate-sitemap.cjs
// Dynamically generates sitemap.xml with <lastmod> tags using last git commit date for each page.
// Usage: node scripts/generate-sitemap.cjs

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

function getLastGitCommitDate(filePath) {
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
fs.writeFileSync(outPath, sitemap, 'utf8');
console.log(`Sitemap generated at ${outPath}`);