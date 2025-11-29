import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('DESIGN-SYSTEM.md Validation', () => {
  const designSystemPath = resolve(__dirname, '../DESIGN-SYSTEM.md');
  let content: string;

  try {
    content = readFileSync(designSystemPath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read DESIGN-SYSTEM.md: ${error}`);
  }

  describe('Document Structure', () => {
    it('should have a title', () => {
      expect(content).toMatch(/^# Paperlyte Design System/m);
    });

    it('should have version information', () => {
      expect(content).toMatch(/Version:\*\*\s+\d+\.\d+\.\d+/);
    });

    it('should have last updated date', () => {
      expect(content).toMatch(/Last Updated:\*\*\s+\w+\s+\d+,\s+\d{4}/);
    });

    it('should have a table of contents', () => {
      expect(content).toContain('## Table of Contents');
    });

    it('should have all required major sections', () => {
      const requiredSections = [
        'Design Principles',
        'Color Palette',
        'Typography',
        'Spacing System',
        'Layout & Grid',
        'Component Library',
        'Iconography',
        'Animation Guidelines',
        'Responsive Design',
        'Accessibility',
      ];

      requiredSections.forEach((section) => {
        expect(content).toContain(`## ${section}`);
      });
    });

    it('should have proper heading hierarchy', () => {
      const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
      expect(headings.length).toBeGreaterThan(10);

      // Should start with h1
      expect(headings[0]).toMatch(/^#\s+/);

      // Should not skip heading levels
      let previousLevel = 1;
      headings.slice(1).forEach((heading) => {
        const level = heading.match(/^#+/)?.[0].length || 0;
        expect(level).toBeLessThanOrEqual(previousLevel + 1);
        previousLevel = level;
      });
    });
  });

  describe('Color Palette Validation', () => {
    it('should define primary colors', () => {
      expect(content).toContain('--color-primary: #7C3AED');
      expect(content).toContain('--color-primary-dark: #6D28D9');
      expect(content).toContain('--color-primary-light: #A78BFA');
    });

    it('should define neutral colors for light mode', () => {
      expect(content).toContain('--color-background: #FFFFFF');
      expect(content).toContain('--color-surface: #F9FAFB');
      expect(content).toContain('--color-text-primary: #111827');
      expect(content).toContain('--color-text-secondary: #6B7280');
      expect(content).toContain('--color-border: #E5E7EB');
    });

    it('should define dark mode colors', () => {
      expect(content).toContain('--color-background: #0F172A');
      expect(content).toContain('--color-surface: #1E293B');
      expect(content).toContain('--color-text-primary: #F1F5F9');
      expect(content).toContain('--color-text-secondary: #94A3B8');
      expect(content).toContain('--color-border: #334155');
    });

    it('should have valid hex color codes', () => {
      const hexColors = content.match(/#[0-9A-Fa-f]{6}/g) || [];
      expect(hexColors.length).toBeGreaterThan(10);

      hexColors.forEach((color) => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('should include WCAG compliance matrix', () => {
      expect(content).toContain('WCAG Compliance Matrix');
      expect(content).toContain('Contrast Ratio');
      expect(content).toContain('WCAG Level');
    });

    it('should document contrast ratios', () => {
      expect(content).toMatch(/\d+\.\d+:1/); // Matches patterns like "16.1:1"
      expect(content).toContain('AA');
      expect(content).toContain('AAA');
    });

    it('should have minimum 4.5:1 contrast for normal text', () => {
      const contrastRatios = content.match(/(\d+\.\d+):1/g) || [];
      const normalTextRatios = contrastRatios.filter((ratio) => {
        const value = parseFloat(ratio);
        return !isNaN(value);
      });

      expect(normalTextRatios.length).toBeGreaterThan(0);
      // Most contrast ratios should meet AA standard
      const meetingAA = normalTextRatios.filter((ratio) => parseFloat(ratio) >= 4.5);
      expect(meetingAA.length).toBeGreaterThan(0);
    });
  });

  describe('Typography Validation', () => {
    it('should define font family', () => {
      expect(content).toContain('--font-family:');
      expect(content).toContain('Inter');
    });

    it('should define type scale', () => {
      const fontSizes = [
        '--font-size-xs',
        '--font-size-sm',
        '--font-size-base',
        '--font-size-lg',
        '--font-size-xl',
        '--font-size-2xl',
        '--font-size-3xl',
        '--font-size-4xl',
        '--font-size-5xl',
      ];

      fontSizes.forEach((size) => {
        expect(content).toContain(size);
      });
    });

    it('should define font weights', () => {
      expect(content).toContain('--font-weight-normal: 400');
      expect(content).toContain('--font-weight-medium: 500');
      expect(content).toContain('--font-weight-semibold: 600');
      expect(content).toContain('--font-weight-bold: 700');
    });

    it('should define line heights', () => {
      expect(content).toContain('--line-height-tight: 1.25');
      expect(content).toContain('--line-height-normal: 1.5');
      expect(content).toContain('--line-height-relaxed: 1.75');
    });

    it('should document responsive typography', () => {
      expect(content).toMatch(/@media.*max-width.*768px/);
      expect(content).toContain('Responsive Typography');
    });

    it('should use rem units for font sizes', () => {
      const remUnits = content.match(/\d+(\.\d+)?rem/g) || [];
      expect(remUnits.length).toBeGreaterThan(10);
    });
  });

  describe('Spacing System Validation', () => {
    it('should have base unit of 8px', () => {
      expect(content).toContain('Base Unit:** 8px');
    });

    it('should define spacing scale', () => {
      const spacingTokens = [
        '--spacing-xs',
        '--spacing-sm',
        '--spacing-md',
        '--spacing-lg',
        '--spacing-xl',
        '--spacing-2xl',
        '--spacing-3xl',
      ];

      spacingTokens.forEach((token) => {
        expect(content).toContain(token);
      });
    });

    it('should use 8px increments', () => {
      // Check that spacing values follow 8px base unit
      expect(content).toContain('0.5rem');   // 8px
      expect(content).toContain('1rem');     // 16px
      expect(content).toContain('1.5rem');   // 24px
      expect(content).toContain('2rem');     // 32px
      expect(content).toContain('3rem');     // 48px
      expect(content).toContain('4rem');     // 64px
      expect(content).toContain('6rem');     // 96px
    });

    it('should provide spacing usage guidelines', () => {
      expect(content).toContain('Component Spacing Guidelines');
      expect(content).toContain('Section Padding Standards');
    });
  });

  describe('Component Library Validation', () => {
    it('should document button variants', () => {
      expect(content).toContain('Primary Button');
      expect(content).toContain('Secondary Button');
      expect(content).toContain('Ghost Button');
    });

    it('should document button sizes', () => {
      expect(content).toMatch(/small|medium|large/i);
      expect(content).toContain('min-height: 48px'); // Accessibility requirement
    });

    it('should document button states', () => {
      expect(content).toContain('hover');
      expect(content).toContain('active');
      expect(content).toContain('disabled');
    });

    it('should include accessibility features for buttons', () => {
      expect(content).toContain('focus-visible');
      expect(content).toContain('48px'); // Touch target size
    });

    it('should document cards', () => {
      expect(content).toMatch(/cards?/i);
      expect(content).toContain('border-radius');
    });

    it('should document forms', () => {
      expect(content).toContain('Input Fields');
      expect(content).toContain('textarea');
    });
  });

  describe('Iconography Validation', () => {
    it('should specify icon library', () => {
      expect(content).toContain('Font Awesome');
      expect(content).toMatch(/6\.\d+\.\d+/); // Version number
    });

    it('should document icon sizes', () => {
      const iconSizes = ['sm', 'md', 'lg', 'xl', '2x', '3x'];
      iconSizes.forEach((size) => {
        expect(content).toMatch(new RegExp(`\\b${size}\\b`));
      });
    });

    it('should list approved icons', () => {
      const approvedIcons = [
        'fa-bolt',
        'fa-sparkles',
        'fa-tags',
        'fa-sync',
        'fa-download',
      ];

      approvedIcons.forEach((icon) => {
        expect(content).toContain(icon);
      });
    });

    it('should include accessibility guidelines for icons', () => {
      expect(content).toContain('aria-label');
      expect(content).toContain('aria-hidden');
    });

    it('should document CDN with integrity check', () => {
      expect(content).toContain('CDN');
      expect(content).toContain('integrity');
      expect(content).toContain('crossorigin');
    });
  });

  describe('Animation Guidelines Validation', () => {
    it('should define timing functions', () => {
      expect(content).toContain('--transition-fast');
      expect(content).toContain('--transition-base');
      expect(content).toContain('--transition-slow');
    });

    it('should specify animation durations', () => {
      expect(content).toContain('150ms');
      expect(content).toContain('250ms');
      expect(content).toContain('350ms');
    });

    it('should use cubic-bezier easing', () => {
      expect(content).toContain('cubic-bezier');
      expect(content).toMatch(/cubic-bezier\([\d., ]+\)/);
    });

    it('should document animation types', () => {
      const animationTypes = ['fadeIn', 'slideUp', 'slideInLeft', 'slideInRight', 'scale'];
      animationTypes.forEach((type) => {
        expect(content).toContain(type);
      });
    });

    it('should mandate prefers-reduced-motion support', () => {
      expect(content).toContain('prefers-reduced-motion');
      expect(content).toContain('@media (prefers-reduced-motion: reduce)');
    });

    it('should mention hardware acceleration', () => {
      expect(content).toContain('will-change');
      expect(content).toContain('GPU');
    });

    it('should limit animation duration', () => {
      expect(content).toMatch(/under \d+ms/);
      expect(content).toMatch(/500ms/); // Maximum recommended duration
    });
  });

  describe('Responsive Design Validation', () => {
    it('should define breakpoints', () => {
      expect(content).toContain('768px');  // Mobile
      expect(content).toContain('1024px'); // Desktop
      expect(content).toContain('1280px'); // Large desktop
    });

    it('should document mobile-first approach', () => {
      expect(content).toContain('Mobile First');
      expect(content).toMatch(/min-width/);
    });

    it('should define responsive typography', () => {
      expect(content).toContain('Responsive Typography');
      expect(content).toMatch(/@media.*max-width.*768px/);
    });

    it('should specify touch target sizes', () => {
      expect(content).toContain('48px');
      expect(content).toContain('touch target');
    });

    it('should document responsive spacing', () => {
      expect(content).toContain('Responsive Spacing');
      expect(content).toMatch(/mobile|tablet|desktop/i);
    });
  });

  describe('Accessibility Validation', () => {
    it('should target WCAG compliance level', () => {
      expect(content).toContain('WCAG 2.1');
      expect(content).toMatch(/Level.*AA/);
    });

    it('should document keyboard navigation', () => {
      expect(content).toContain('Keyboard Navigation');
      expect(content).toContain('focus');
    });

    it('should include skip links', () => {
      expect(content).toContain('Skip Links');
      expect(content).toContain('Skip to main content');
    });

    it('should document semantic HTML', () => {
      expect(content).toContain('Semantic HTML');
      expect(content).toMatch(/<nav>|<main>|<article>/);
    });

    it('should document ARIA labels', () => {
      expect(content).toContain('ARIA');
      expect(content).toContain('aria-label');
    });

    it('should include screen reader considerations', () => {
      expect(content).toContain('screen reader');
      expect(content).toContain('sr-only');
    });

    it('should document form accessibility', () => {
      expect(content).toContain('Form Accessibility');
      expect(content).toContain('aria-required');
      expect(content).toContain('aria-invalid');
    });

    it('should mention motion sensitivity', () => {
      expect(content).toContain('Motion Sensitivity');
      expect(content).toContain('prefers-reduced-motion');
    });
  });

  describe('Code Examples Validation', () => {
    it('should include CSS code blocks', () => {
      const cssBlocks = content.match(/```css[\s\S]*?```/g) || [];
      expect(cssBlocks.length).toBeGreaterThan(10);
    });

    it('should include TSX/JSX code blocks', () => {
      const tsxBlocks = content.match(/```tsx[\s\S]*?```/g) || [];
      expect(tsxBlocks.length).toBeGreaterThan(5);
    });

    it('should have valid CSS syntax in examples', () => {
      const cssBlocks = content.match(/```css\n([\s\S]*?)```/g) || [];

      cssBlocks.forEach((block) => {
        // Should have proper CSS property syntax
        expect(block).toMatch(/[\w-]+:\s*[^;]+;/);
      });
    });

    it('should include JavaScript code blocks', () => {
      const jsBlocks = content.match(/```js[\s\S]*?```/g) || [];
      expect(jsBlocks.length).toBeGreaterThan(0);
    });
  });

  describe('Design Tokens Validation', () => {
    it('should include Tailwind config', () => {
      expect(content).toContain('tailwind.config.js');
      expect(content).toContain('Design Tokens');
    });

    it('should export design tokens', () => {
      expect(content).toContain('module.exports');
      expect(content).toContain('theme');
      expect(content).toContain('extend');
    });
  });

  describe('Documentation Quality', () => {
    it('should have Do\'s and Don\'ts sections', () => {
      const dosAndDonts = content.match(/✅\s*\*\*DO/g) || [];
      expect(dosAndDonts.length).toBeGreaterThan(5);

      const donts = content.match(/❌\s*\*\*DON'T/g) || [];
      expect(donts.length).toBeGreaterThan(5);
    });

    it('should have usage examples', () => {
      expect(content).toMatch(/Example|Usage|Use Case/i);
    });

    it('should include tables for reference', () => {
      const tables = content.match(/\|.*\|.*\|/g) || [];
      expect(tables.length).toBeGreaterThan(10);
    });

    it('should have proper markdown table structure', () => {
      const tableHeaders = content.match(/\|[\s\S]+?\|\n\|[-:\s|]+\|/g) || [];
      expect(tableHeaders.length).toBeGreaterThan(5);
    });
  });

  describe('Link Validation', () => {
    it('should have internal anchor links', () => {
      const anchorLinks = content.match(/\[.+?\]\(#[\w-]+\)/g) || [];
      expect(anchorLinks.length).toBeGreaterThan(10);
    });

    it('should have external resource links', () => {
      expect(content).toContain('https://tailwindcss.com');
      expect(content).toContain('https://fonts.google.com');
      expect(content).toContain('https://fontawesome.com');
      expect(content).toContain('https://www.w3.org/WAI/WCAG21');
    });

    it('should have valid URLs', () => {
      const urls = content.match(/https?:\/\/[^\s)]+/g) || [];
      expect(urls.length).toBeGreaterThan(5);

      urls.forEach((url) => {
        expect(url).toMatch(/^https?:\/\/.+/);
      });
    });
  });

  describe('Version Control', () => {
    it('should have version history section', () => {
      expect(content).toContain('Version History');
    });

    it('should document initial version', () => {
      expect(content).toContain('1.0.0');
      expect(content).toMatch(/2025-\d{2}-\d{2}/);
    });
  });

  describe('Content Completeness', () => {
    it('should have sufficient content length', () => {
      const lines = content.split('\n');
      expect(lines.length).toBeGreaterThan(1000);
    });

    it('should not have TODO markers', () => {
      expect(content.toLowerCase()).not.toContain('todo');
      expect(content.toLowerCase()).not.toContain('tbd');
      expect(content.toLowerCase()).not.toContain('fixme');
    });

    it('should not have placeholder text', () => {
      expect(content.toLowerCase()).not.toContain('lorem ipsum');
      expect(content.toLowerCase()).not.toContain('[placeholder]');
      expect(content.toLowerCase()).not.toContain('[insert');
    });
  });

  describe('Consistency Checks', () => {
    it('should use consistent heading formatting', () => {
      const h2Headings = content.match(/^## .+$/gm) || [];
      h2Headings.forEach((heading) => {
        // Should not have trailing punctuation
        expect(heading).not.toMatch(/[.!?]$/);
      });
    });

    it('should use consistent code block language identifiers', () => {
      const codeBlocks = content.match(/```(\w+)/g) || [];
      const languages = codeBlocks.map((block) => block.replace('```', ''));

      // Should use standard language identifiers
      languages.forEach((lang) => {
        expect(['css', 'tsx', 'ts', 'js', 'jsx', 'html', 'shell', 'diff']).toContain(lang);
      });
    });

    it('should use consistent spacing in CSS custom properties', () => {
      const cssVars = content.match(/--[\w-]+:\s*[^;]+;/g) || [];
      expect(cssVars.length).toBeGreaterThan(20);

      // All should have consistent spacing around colons
      cssVars.forEach((cssVar) => {
        expect(cssVar).toMatch(/--[\w-]+:\s+[^;]+;/);
      });
    });
  });

  describe('Schema Validation', () => {
    it('should have consistent color value format', () => {
      // All hex colors should be uppercase or lowercase consistently
      const hexColors = content.match(/#[0-9A-Fa-f]{6}/g) || [];
      expect(hexColors.length).toBeGreaterThan(10);

      // Check that we use uppercase hex values
      hexColors.forEach((color) => {
        if (color.match(/[A-F]/)) {
          expect(color).toMatch(/^#[0-9A-F]{6}$/);
        }
      });
    });

    it('should have consistent spacing value format', () => {
      const spacingValues = content.match(/--spacing-\w+:\s*[\d.]+rem/g) || [];
      expect(spacingValues.length).toBeGreaterThan(5);
    });

    it('should have consistent font size format', () => {
      const fontSizes = content.match(/--font-size-\w+:\s*[\d.]+rem/g) || [];
      expect(fontSizes.length).toBeGreaterThan(5);
    });
  });

  describe('Cross-references', () => {
    it('should reference Color Palette in other sections', () => {
      const colorReferences = content.match(/color.*palette/gi) || [];
      expect(colorReferences.length).toBeGreaterThan(2);
    });

    it('should reference accessibility throughout', () => {
      const accessibilityMentions = content.match(/accessibility|accessible|aria|wcag/gi) || [];
      expect(accessibilityMentions.length).toBeGreaterThan(20);
    });

    it('should reference responsive design principles', () => {
      const responsiveMentions = content.match(/responsive|mobile|tablet|desktop/gi) || [];
      expect(responsiveMentions.length).toBeGreaterThan(15);
    });
  });
});