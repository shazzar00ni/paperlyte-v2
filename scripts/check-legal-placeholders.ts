#!/usr/bin/env ts-node

/**
 * Legal Placeholder Checker
 *
 * This script checks all legal documents and configuration files for
 * placeholders that need to be replaced before production.
 *
 * Usage: npx ts-node scripts/check-legal-placeholders.ts
 */

import * as fs from "fs";
import * as path from "path";

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

interface PlaceholderMatch {
  file: string;
  line: number;
  content: string;
  placeholder: string;
}

interface FileCheck {
  path: string;
  exists: boolean;
  placeholders: PlaceholderMatch[];
}

const filesToCheck = [
  "src/constants/legal.ts",
  "docs/PRIVACY-POLICY.md",
  "docs/TERMS-OF-SERVICE.md",
];

/**
 * Finds unresolved square-bracket placeholders in the given file.
 *
 * Ignores markdown links, numeric-only bracketed references, and bracketed URLs.
 *
 * @param filePath - Path to the file to scan
 * @returns An array of `PlaceholderMatch` objects describing each found placeholder (file, 1-based line number, trimmed line content, and the exact bracketed placeholder)
 */
function findPlaceholders(filePath: string): PlaceholderMatch[] {
  const placeholders: PlaceholderMatch[] = [];

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    // Match patterns like [Something] or [Something Text]
    const placeholderRegex = /\[([^\]]+)\]/g;

    lines.forEach((line, index) => {
      const matches = line.matchAll(placeholderRegex);
      for (const match of matches) {
        // Skip markdown links and legitimate brackets
        const afterMatch = line.substring(match.index + match[0].length);
        const isMarkdownLink = afterMatch.trimStart().startsWith("(");

        if (
          !isMarkdownLink && // Not a markdown link
          !match[1].match(/^\d+$/) && // Not a number reference
          !match[1].includes("http") // Not a URL inside brackets
        ) {
          placeholders.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            placeholder: match[0],
          });
        }
      }
    });
  } catch (error) {
    console.error(
      colors.red + 'Error reading file:' + colors.reset,
      filePath,
      error
    );
  }

  return placeholders;
}

/**
 * Validates that a file path is safe and doesn't contain path traversal patterns.
 *
 * @param filePath - The file path to validate
 * @returns True if the path is safe, false otherwise
 */
function isPathSafe(filePath: string): boolean {
  // Check for path traversal patterns
  if (filePath.includes("..")) {
    return false;
  }

  // Normalize and resolve the path
  const normalizedPath = path.normalize(filePath);
  const resolvedPath = path.resolve(process.cwd(), normalizedPath);
  const cwdPath = path.resolve(process.cwd());

  // Ensure the resolved path is within the project directory
  return resolvedPath.startsWith(cwdPath);
}

/**
 * Checks each path listed in `filesToCheck` for file existence and any detected placeholders.
 *
 * @returns An array of `FileCheck` objects where `path` is the relative file path, `exists` indicates whether the file exists, and `placeholders` contains any found `PlaceholderMatch` entries (empty if none or if the file does not exist)
 */
function checkFiles(): FileCheck[] {
  return filesToCheck.map((file) => {
    // Validate path safety before processing
    if (!isPathSafe(file)) {
      console.error(`${colors.red}Error: Invalid file path detected: ${file}${colors.reset}`);
      process.exit(1);
    }

    const fullPath = path.join(process.cwd(), file);
    const exists = fs.existsSync(fullPath);

    return {
      path: file,
      exists,
      placeholders: exists ? findPlaceholders(fullPath) : [],
    };
  });
}

/**
 * Prints a colored, human-readable report of placeholder checks for the provided files.
 *
 * Exits the process with status 0 when no placeholders or missing files are detected, otherwise exits with status 1.
 *
 * @param results - Array of file check results where each entry contains the file path, an existence flag, and any detected placeholder matches used to generate the report
 */
function printResults(results: FileCheck[]): void {
  console.log("\n" + "=".repeat(70));
  console.log(`${colors.cyan}Legal Placeholder Check Results${colors.reset}`);
  console.log("=".repeat(70) + "\n");

  let totalPlaceholders = 0;
  let hasIssues = false;

  results.forEach((result) => {
    if (!result.exists) {
      console.log(
        `${colors.red}✗ ${result.path} - File not found!${colors.reset}`
      );
      hasIssues = true;
      return;
    }

    if (result.placeholders.length === 0) {
      console.log(
        `${colors.green}✓ ${result.path} - No placeholders found${colors.reset}`
      );
    } else {
      console.log(
        `${colors.yellow}⚠ ${result.path} - ${result.placeholders.length} placeholder(s) found${colors.reset}`
      );
      totalPlaceholders += result.placeholders.length;
      hasIssues = true;

      result.placeholders.forEach((p) => {
        console.log(
          `  ${colors.blue}Line ${p.line}:${colors.reset} ${p.placeholder}`
        );
        console.log(`    ${colors.magenta}${p.content}${colors.reset}`);
      });
      console.log();
    }
  });

  console.log("=".repeat(70));

  if (!hasIssues) {
    console.log(
      `\n${colors.green}✓ All checks passed! Ready for production.${colors.reset}\n`
    );
    process.exit(0);
  } else {
    console.log(
      `\n${colors.yellow}⚠ Found ${totalPlaceholders} placeholder(s) that need attention.${colors.reset}`
    );
    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log(
      `  1. Update src/constants/legal.ts with your company information`
    );
    console.log(`  2. Replace placeholders in docs/PRIVACY-POLICY.md`);
    console.log(`  3. Replace placeholders in docs/TERMS-OF-SERVICE.md`);
    console.log(`  4. Run this script again to verify`);
    console.log(`  5. Have an attorney review all documents\n`);

    console.log(`${colors.cyan}Reference:${colors.reset}`);
    console.log(`  See docs/LEGAL-SETUP.md for detailed instructions\n`);

    process.exit(1);
  }
}

// Main execution
console.log(
  `${colors.cyan}Checking legal documents for placeholders...${colors.reset}\n`
);
const results = checkFiles();
printResults(results);