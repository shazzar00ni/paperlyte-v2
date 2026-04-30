// scripts/generate-sitemap.cjs
// Dynamically generates sitemap.xml with <lastmod> tags using last git commit date for each page.
// Usage: node scripts/generate-sitemap.cjs

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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
 * Resolve the absolute path to the git executable by checking known safe
 * directories, or return null if none is found.
 *
 * @returns {string|null}
 */
function resolveGitExecutable() {
  const candidates = [
    '/usr/bin/git',
    '/bin/git',
    '/usr/local/bin/git',
    '/opt/homebrew/bin/git',
  ];
  for (const candidate of candidates) {
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return candidate;
    } catch {
      // not found or not executable at this path
    }
  }
  return null;
}

/**
 * Retrieve the last Git commit date for a file as `YYYY-MM-DD`.
 *
 * @param {string} filePath - Path to the file to inspect.
 * @returns {string|null} The commit date in `YYYY-MM-DD` format if available and valid, `null` otherwise.
 */
function getLastGitCommitDate(filePath) {
  const gitExe = resolveGitExecutable();

  let executable;
  let spawnEnv;

  if (gitExe) {
    // Use the absolute path; restrict PATH to only the directory that contains it.
    executable = gitExe;
    spawnEnv = { PATH: path.dirname(gitExe) };
  } else {
    // git not found in known safe locations — fail closed to avoid PATH-based lookup.
    console.warn(
      'Warning: git executable not found in known safe directories. ' +
      'Skipping git lookup to avoid PATH-based command resolution; <lastmod> will be omitted.'
    );
    return null;
  }

  const result = spawnSync(
    executable,
    ['log', '-1', '--format=%cs', '--', filePath],
    { encoding: 'utf8', env: spawnEnv }
  );
  if (result.status !== 0 || result.error) return null;
  const date = result.stdout.trim();
  // Validate YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  return null;
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
    '        https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
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
// Target the dist directory for Netlify deployment
const outPath = path.join(__dirname, '../dist/sitemap.xml');

try {
  fs.writeFileSync(outPath, sitemap, 'utf8');
  console.log(`✓ Sitemap generated at ${outPath}`);
} catch (error) {
  console.error(`✗ Failed to write sitemap: ${error.message}`);
  process.exit(1);
}