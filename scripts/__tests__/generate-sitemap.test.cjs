// scripts/__tests__/generate-sitemap.test.cjs
// Tests for sitemap generation script, especially command injection prevention

const fs = require('fs');
const path = require('path');
// Note: execSync is used here safely to test the script execution itself,
// not for constructing git commands with user input
const { execSync } = require('child_process');

// We'll test the script's behavior to ensure it's secure

describe('Sitemap Generation Security', () => {
  const scriptPath = path.join(__dirname, '../generate-sitemap.cjs');
  const testOutputPath = path.join(__dirname, '../../public/sitemap.xml');

  it('should use execFileSync instead of execSync to prevent command injection', () => {
    // Read the script file and verify it uses execFileSync
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    expect(scriptContent).toContain('execFileSync');
    expect(scriptContent).not.toContain('execSync(');
    expect(scriptContent).toContain("['log', '-1', '--format=%cs', '--', filePath]");
  });

  it('should pass git arguments as an array, not as a string', () => {
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Verify that the git command uses array syntax
    expect(scriptContent).toMatch(/\['log',\s*'-1',\s*'--format=%cs',\s*'--',\s*filePath\]/);
    
    // Ensure old vulnerable pattern is not present
    expect(scriptContent).not.toMatch(/git log.*--.*\$\{.*\}/);
    expect(scriptContent).not.toMatch(/`git log.*\$\{filePath\}`/);
  });

  it('should successfully generate sitemap without errors', () => {
    expect(() => {
      execSync('node scripts/generate-sitemap.cjs', {
        cwd: path.join(__dirname, '../../'),
        encoding: 'utf8'
      });
    }).not.toThrow();

    // Verify the sitemap was created
    expect(fs.existsSync(testOutputPath)).toBe(true);
  });

  it('should generate valid XML sitemap with expected structure', () => {
    execSync('node scripts/generate-sitemap.cjs', {
      cwd: path.join(__dirname, '../../'),
      encoding: 'utf8'
    });

    const sitemapContent = fs.readFileSync(testOutputPath, 'utf8');
    
    // Verify XML structure
    expect(sitemapContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemapContent).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(sitemapContent).toContain('<loc>https://paperlyte.com/</loc>');
    expect(sitemapContent).toContain('<changefreq>');
    expect(sitemapContent).toContain('<priority>');
    
    // Check for lastmod dates in YYYY-MM-DD format
    expect(sitemapContent).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  });
});

describe('getLastGitCommitDate function behavior', () => {
  it('should handle file paths with special characters safely', () => {
    // This test verifies that even if a malicious path is provided,
    // execFileSync will treat it as a literal path, not as shell commands
    
    const scriptPath = path.join(__dirname, '../generate-sitemap.cjs');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Verify the implementation uses execFileSync which is safe
    expect(scriptContent).toContain('execFileSync');
    
    // The key security feature is that execFileSync doesn't invoke a shell
    // So even paths like 'file.txt"; malicious_command; echo "' are treated literally
    expect(scriptContent).toContain("['log', '-1', '--format=%cs', '--', filePath]");
  });

  it('should validate date format returned from git', () => {
    const scriptContent = fs.readFileSync(
      path.join(__dirname, '../generate-sitemap.cjs'),
      'utf8'
    );
    
    // Verify date validation regex pattern is present in the code
    // Looking for the pattern that validates YYYY-MM-DD format
    expect(scriptContent).toContain('\\d{4}-\\d{2}-\\d{2}');
    expect(scriptContent).toContain('.test(date)');
  });
});
