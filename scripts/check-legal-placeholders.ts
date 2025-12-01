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

function findPlaceholders(filePath: string): PlaceholderMatch[] {
  const placeholders: PlaceholderMatch[] = [];

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    // Match patterns like [Something] or [Something Text]
    const placeholderRegex = /\[([^\]]+)\]/g;

    lines.forEach((line, index) => {
      let match;
      while ((match = placeholderRegex.exec(line)) !== null) {
        // Skip markdown links and legitimate brackets
        if (
          !line.includes("](") && // Not a markdown link
          !line.includes("https://") && // Not a URL
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
      `${colors.red}Error reading file ${filePath}:${colors.reset}`,
      error,
    );
  }

  return placeholders;
}

function checkFiles(): FileCheck[] {
  return filesToCheck.map((file) => {
    const fullPath = path.join(process.cwd(), file);
    const exists = fs.existsSync(fullPath);

    return {
      path: file,
      exists,
      placeholders: exists ? findPlaceholders(fullPath) : [],
    };
  });
}

function printResults(results: FileCheck[]) {
  console.log("\n" + "=".repeat(70));
  console.log(`${colors.cyan}Legal Placeholder Check Results${colors.reset}`);
  console.log("=".repeat(70) + "\n");

  let totalPlaceholders = 0;
  let hasIssues = false;

  results.forEach((result) => {
    if (!result.exists) {
      console.log(
        `${colors.red}✗ ${result.path} - File not found!${colors.reset}`,
      );
      hasIssues = true;
      return;
    }

    if (result.placeholders.length === 0) {
      console.log(
        `${colors.green}✓ ${result.path} - No placeholders found${colors.reset}`,
      );
    } else {
      console.log(
        `${colors.yellow}⚠ ${result.path} - ${result.placeholders.length} placeholder(s) found${colors.reset}`,
      );
      totalPlaceholders += result.placeholders.length;
      hasIssues = true;

      result.placeholders.forEach((p) => {
        console.log(
          `  ${colors.blue}Line ${p.line}:${colors.reset} ${p.placeholder}`,
        );
        console.log(`    ${colors.magenta}${p.content}${colors.reset}`);
      });
      console.log();
    }
  });

  console.log("=".repeat(70));

  if (!hasIssues) {
    console.log(
      `\n${colors.green}✓ All checks passed! Ready for production.${colors.reset}\n`,
    );
    process.exit(0);
  } else {
    console.log(
      `\n${colors.yellow}⚠ Found ${totalPlaceholders} placeholder(s) that need attention.${colors.reset}`,
    );
    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log(
      `  1. Update src/constants/legal.ts with your company information`,
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
  `${colors.cyan}Checking legal documents for placeholders...${colors.reset}\n`,
);
const results = checkFiles();
printResults(results);
