import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Marketing Plan Document Validation", () => {
  let content: string;
  let lines: string[];
  let sections: Map<string, { line: number; content: string }>;

  beforeAll(() => {
    // Read the marketing plan document
    const filePath = join(process.cwd(), "docs", "MARKETING-PLAN.md");
    content = readFileSync(filePath, "utf-8");
    lines = content.split("\n");

    // Parse sections
    sections = new Map();
    let currentSection = "";
    let currentContent: string[] = [];
    let sectionLine = 0;

    lines.forEach((line, index) => {
      if (line.match(/^##\s+/)) {
        if (currentSection) {
          sections.set(currentSection, {
            line: sectionLine,
            content: currentContent.join("\n"),
          });
        }
        currentSection = line.replace(/^##\s+/, "").trim();
        currentContent = [];
        sectionLine = index + 1;
      } else if (currentSection) {
        currentContent.push(line);
      }
    });

    // Add the last section
    if (currentSection) {
      sections.set(currentSection, {
        line: sectionLine,
        content: currentContent.join("\n"),
      });
    }
  });

  describe("Document Structure", () => {
    it("should have a title", () => {
      const firstLine = lines[0];
      expect(firstLine).toMatch(/^#\s+Paperlyte Marketing Plan/i);
    });

    it("should include document metadata", () => {
      const metadataSection = lines.slice(0, 10).join("\n");
      expect(metadataSection).toContain("Version");
      expect(metadataSection).toContain("Last Updated");
      expect(metadataSection).toContain("Owner");
      expect(metadataSection).toContain("Status");
    });

    it("should have all required major sections", () => {
      const requiredSections = [
        "Executive Summary",
        "Market Analysis",
        "Target Audience",
        "Brand Positioning",
        "Marketing Strategy",
        "Content Strategy",
        "Metrics & KPIs",
        "Competitive Monitoring",
        "Risk Mitigation",
        "Launch Timeline",
        "Team & Responsibilities",
        "Success Criteria",
      ];

      requiredSections.forEach((section) => {
        expect(
          sections.has(section),
          `Missing required section: ${section}`,
        ).toBe(true);
      });
    });

    it("should have properly formatted section headers", () => {
      const headers = lines.filter((line) => line.match(/^#{1,4}\s+/));
      expect(headers.length).toBeGreaterThan(20);

      headers.forEach((header) => {
        // Headers should have proper spacing
        expect(header).toMatch(/^#+\s+\S/);
        // Should not have trailing hashes
        expect(header).not.toMatch(/#+$/);
      });
    });
  });

  describe("Executive Summary", () => {
    it("should include primary goal with specific target", () => {
      const summary = sections.get("Executive Summary")?.content || "";
      expect(summary).toContain("Primary Goal");
      expect(summary).toMatch(/10,?000.*users/i);
      expect(summary).toMatch(/6 months/i);
    });

    it("should include secondary goals", () => {
      const summary = sections.get("Executive Summary")?.content || "";
      expect(summary).toContain("Secondary Goals");
      expect(summary).toMatch(/email.*list/i);
      expect(summary).toMatch(/conversion.*rate/i);
    });

    it("should have quantifiable metrics in goals", () => {
      const summary = sections.get("Executive Summary")?.content || "";
      const numbers = summary.match(/\d+[,\d]*[%+]?/g);
      expect(numbers).toBeTruthy();
      expect(numbers!.length).toBeGreaterThan(3);
    });
  });

  describe("Market Analysis", () => {
    it("should include TAM, SAM, and SOM analysis", () => {
      const analysis = sections.get("Market Analysis")?.content || "";
      expect(analysis).toContain("Total Addressable Market");
      expect(analysis).toContain("Serviceable Addressable Market");
      expect(analysis).toContain("Serviceable Obtainable Market");
      expect(analysis).toMatch(/TAM/);
      expect(analysis).toMatch(/SAM/);
      expect(analysis).toMatch(/SOM/);
    });

    it("should identify direct competitors", () => {
      const analysis = sections.get("Market Analysis")?.content || "";
      expect(analysis).toContain("Direct Competitors");
      expect(analysis).toMatch(/Simplenote|Bear|Standard Notes/);
    });

    it("should identify indirect competitors", () => {
      const analysis = sections.get("Market Analysis")?.content || "";
      expect(analysis).toContain("Indirect Competitors");
      expect(analysis).toMatch(/Notion|Obsidian|Evernote/);
    });

    it("should list competitive advantages", () => {
      const analysis = sections.get("Market Analysis")?.content || "";
      expect(analysis).toContain("Competitive Advantages");
      expect(analysis).toMatch(/Speed|Simplicity|Cross-platform/i);
    });

    it("should have market size numbers", () => {
      const analysis = sections.get("Market Analysis")?.content || "";
      const marketSizes = analysis.match(/\d+[MK]?\+?\s*users/gi);
      expect(marketSizes).toBeTruthy();
      expect(marketSizes!.length).toBeGreaterThan(3);
    });
  });

  describe("Target Audience", () => {
    it("should define primary personas", () => {
      const audience = sections.get("Target Audience")?.content || "";
      expect(audience).toContain("Primary Personas");
    });

    it("should include persona demographics", () => {
      const audience = sections.get("Target Audience")?.content || "";
      expect(audience).toMatch(/Age:/i);
      expect(audience).toMatch(/Occupation:/i);
    });

    it("should identify pain points for personas", () => {
      const audience = sections.get("Target Audience")?.content || "";
      const painPoints = audience.match(/\*\*Pain Points\*\*/gi);
      expect(painPoints).toBeTruthy();
      expect(painPoints!.length).toBeGreaterThan(2);
    });

    it("should list motivations for each persona", () => {
      const audience = sections.get("Target Audience")?.content || "";
      const motivations = audience.match(/\*\*Motivations\*\*/gi);
      expect(motivations).toBeTruthy();
      expect(motivations!.length).toBeGreaterThan(2);
    });

    it("should specify channels for reaching each persona", () => {
      const audience = sections.get("Target Audience")?.content || "";
      const channels = audience.match(/\*\*Channels\*\*/gi);
      expect(channels).toBeTruthy();
      expect(channels!.length).toBeGreaterThan(2);
    });
  });

  describe("Brand Positioning", () => {
    it("should have a clear value proposition", () => {
      const positioning = sections.get("Brand Positioning")?.content || "";
      expect(positioning).toContain("Value Proposition");
      expect(positioning).toContain("Primary Message");
    });

    it("should define brand voice and tone", () => {
      const positioning = sections.get("Brand Positioning")?.content || "";
      expect(positioning).toMatch(/Brand Voice.*Tone/is);
      expect(positioning).toMatch(/Voice Attributes/i);
    });

    it("should include tone examples with do and don't", () => {
      const positioning = sections.get("Brand Positioning")?.content || "";
      expect(positioning).toMatch(/✅/);
      expect(positioning).toMatch(/❌/);
    });

    it("should describe brand personality", () => {
      const positioning = sections.get("Brand Positioning")?.content || "";
      expect(positioning).toContain("Brand Personality");
    });
  });

  describe("Marketing Strategy", () => {
    it("should have phase-based strategy", () => {
      const strategy = sections.get("Marketing Strategy")?.content || "";
      expect(strategy).toMatch(/Phase 1.*Pre-Launch/is);
      expect(strategy).toMatch(/Phase 2.*Launch/is);
      expect(strategy).toMatch(/Phase 3.*Growth/is);
      expect(strategy).toMatch(/Phase 4.*Retention/is);
    });

    it("should define objectives for each phase", () => {
      const strategy = sections.get("Marketing Strategy")?.content || "";
      const objectives = strategy.match(/\*\*Objectives\*\*/gi);
      expect(objectives).toBeTruthy();
      expect(objectives!.length).toBeGreaterThan(3);
    });

    it("should list tactics for each phase", () => {
      const strategy = sections.get("Marketing Strategy")?.content || "";
      const tactics = strategy.match(/\*\*Tactics\*\*/gi);
      expect(tactics).toBeTruthy();
      expect(tactics!.length).toBeGreaterThan(1);
    });

    it("should include Product Hunt launch strategy", () => {
      const strategy = sections.get("Marketing Strategy")?.content || "";
      expect(strategy).toMatch(/Product Hunt/i);
      expect(strategy).toMatch(/Launch Day/i);
    });

    it("should have email marketing sequences defined", () => {
      const strategy = sections.get("Marketing Strategy")?.content || "";
      expect(strategy).toMatch(/Email.*Sequence/i);
      expect(strategy).toMatch(/Email \d+/);
    });

    it("should include referral program details", () => {
      const strategy = sections.get("Marketing Strategy")?.content || "";
      expect(strategy).toMatch(/Referral Program/i);
    });
  });

  describe("Budget and Resource Allocation", () => {
    it("should have a defined budget table", () => {
      const budget =
        sections.get("Marketing Channels & Budget Allocation")?.content ||
        content;
      expect(budget).toMatch(/\|\s*Channel\s*\|.*Budget/);
    });

    it("should include budget breakdown by channel", () => {
      const budget =
        sections.get("Marketing Channels & Budget Allocation")?.content ||
        content;
      expect(budget).toMatch(/Content Marketing/i);
      expect(budget).toMatch(/Paid Acquisition/i);
      expect(budget).toMatch(/Community.*Social/i);
    });

    it("should have budget percentages that add up reasonably", () => {
      const budget =
        sections.get("Marketing Channels & Budget Allocation")?.content ||
        content;

      // Extract percentage values from the budget table
      const percentages = budget.match(/\|\s*\d+%\s*\|/g);
      if (percentages) {
        const values = percentages.map((p) =>
          parseInt(p.replace(/[|%\s]/g, "")),
        );
        const total = values.reduce((sum, val) => sum + val, 0);

        // Should be approximately 100% (allow small rounding differences)
        expect(total).toBeGreaterThanOrEqual(95);
        expect(total).toBeLessThanOrEqual(105);
      }
    });

    it("should prioritize channels into tiers", () => {
      const budget =
        sections.get("Marketing Channels & Budget Allocation")?.content ||
        content;
      expect(budget).toMatch(/Tier 1/i);
      expect(budget).toMatch(/Tier 2/i);
    });
  });

  describe("Metrics and KPIs", () => {
    it("should define a North Star Metric", () => {
      const metrics = sections.get("Metrics & KPIs")?.content || "";
      expect(metrics).toContain("North Star Metric");
      expect(metrics).toMatch(/Weekly Active Users|WAU/i);
    });

    it("should include acquisition metrics table", () => {
      const metrics = sections.get("Metrics & KPIs")?.content || "";
      expect(metrics).toMatch(/Acquisition Metrics/i);
      expect(metrics).toMatch(/\|\s*Metric\s*\|.*Target/);
    });

    it("should include engagement metrics", () => {
      const metrics = sections.get("Metrics & KPIs")?.content || "";
      expect(metrics).toMatch(/Engagement Metrics/i);
      expect(metrics).toMatch(/Daily Active Users|DAU/);
      expect(metrics).toMatch(/Weekly Active Users|WAU/);
    });

    it("should include retention metrics", () => {
      const metrics = sections.get("Metrics & KPIs")?.content || "";
      expect(metrics).toMatch(/Retention Metrics/i);
      expect(metrics).toMatch(/Day [17] Retention/i);
      expect(metrics).toMatch(/Churn Rate/i);
    });

    it("should have measurement frequencies for metrics", () => {
      const metrics = sections.get("Metrics & KPIs")?.content || "";
      expect(metrics).toMatch(/Daily|Weekly|Monthly|Quarterly/);
      const frequencies = metrics.match(
        /\|\s*(Daily|Weekly|Monthly|Quarterly)\s*\|/g,
      );
      expect(frequencies).toBeTruthy();
      expect(frequencies!.length).toBeGreaterThan(5);
    });

    it("should include virality metrics", () => {
      const metrics = sections.get("Metrics & KPIs")?.content || "";
      expect(metrics).toMatch(/Virality Metrics/i);
      expect(metrics).toMatch(/Net Promoter Score|NPS/i);
      expect(metrics).toMatch(/Viral Coefficient/i);
    });

    it("should have realistic metric targets", () => {
      const metrics = sections.get("Metrics & KPIs")?.content || "";

      // Check for percentage targets that make sense
      const percentTargets = metrics.match(/>\s*\d+%/g);
      if (percentTargets) {
        percentTargets.forEach((target) => {
          const value = parseInt(target.replace(/[>%\s]/g, ""));
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThanOrEqual(100);
        });
      }
    });
  });

  describe("Timeline and Milestones", () => {
    it("should have a pre-launch timeline", () => {
      const timeline = sections.get("Launch Timeline")?.content || "";
      expect(timeline).toMatch(/Pre-Launch.*Month -3/i);
    });

    it("should have a launch timeline", () => {
      const timeline = sections.get("Launch Timeline")?.content || "";
      expect(timeline).toMatch(/Launch.*Month 0/i);
    });

    it("should have post-launch timeline", () => {
      const timeline = sections.get("Launch Timeline")?.content || "";
      expect(timeline).toMatch(/Post-Launch.*Month.*1-6/i);
    });

    it("should include specific week-by-week breakdown", () => {
      const timeline = sections.get("Launch Timeline")?.content || "";
      expect(timeline).toMatch(/Week \d+/);
    });

    it("should have checkboxes for tasks", () => {
      const timeline = sections.get("Launch Timeline")?.content || "";
      const checkboxes = timeline.match(/✅/g);
      expect(checkboxes).toBeTruthy();
      expect(checkboxes!.length).toBeGreaterThan(10);
    });

    it("should define success criteria at milestones", () => {
      const timeline = sections.get("Launch Timeline")?.content || "";
      expect(timeline).toMatch(/Success Criteria/i);
      expect(timeline).toMatch(/Target by Launch/i);
    });
  });

  describe("Success Criteria", () => {
    it("should have checkpoint milestones", () => {
      const success = sections.get("Success Criteria")?.content || "";
      expect(success).toMatch(/Month 3 Checkpoint/i);
      expect(success).toMatch(/Month 6 Checkpoint/i);
    });

    it("should distinguish must-have from nice-to-have", () => {
      const success = sections.get("Success Criteria")?.content || "";
      expect(success).toMatch(/Must-Have/i);
      expect(success).toMatch(/Nice-to-Have/i);
    });

    it("should include go/no-go decision points", () => {
      const success = sections.get("Success Criteria")?.content || "";
      const decisions = success.match(/Go\/No-Go Decision/gi);
      expect(decisions).toBeTruthy();
      expect(decisions!.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Risk Mitigation", () => {
    it("should identify potential risks", () => {
      const risks = sections.get("Risk Mitigation")?.content || "";
      expect(risks).toMatch(/Risk \d+/);
    });

    it("should include impact assessment for each risk", () => {
      const risks = sections.get("Risk Mitigation")?.content || "";
      const impacts = risks.match(/\*\*Impact\*\*/gi);
      expect(impacts).toBeTruthy();
      expect(impacts!.length).toBeGreaterThan(3);
    });

    it("should have mitigation strategies", () => {
      const risks = sections.get("Risk Mitigation")?.content || "";
      const mitigations = risks.match(/\*\*Mitigation\*\*/gi);
      expect(mitigations).toBeTruthy();
      expect(mitigations!.length).toBeGreaterThan(3);
    });

    it("should have response plans", () => {
      const risks = sections.get("Risk Mitigation")?.content || "";
      const responses = risks.match(/\*\*Response\*\*/gi);
      expect(responses).toBeTruthy();
      expect(responses!.length).toBeGreaterThan(3);
    });
  });

  describe("Team and Responsibilities", () => {
    it("should define team roles", () => {
      const team = sections.get("Team & Responsibilities")?.content || "";
      expect(team).toMatch(/Marketing Roles|Team Roles/i);
    });

    it("should assign responsibilities to roles", () => {
      const team = sections.get("Team & Responsibilities")?.content || "";
      expect(team).toMatch(/Founder|CEO|Marketing Lead/i);
    });

    it("should consider scaling needs", () => {
      const team = sections.get("Team & Responsibilities")?.content || "";
      expect(team).toMatch(/As You Scale|Month 6\+/i);
    });
  });

  describe("Content Strategy", () => {
    it("should define content pillars", () => {
      const content = sections.get("Content Strategy")?.content || "";
      expect(content).toMatch(/Content Pillars/i);
    });

    it("should include a content calendar", () => {
      const content = sections.get("Content Strategy")?.content || "";
      expect(content).toMatch(/Content Calendar/i);
      expect(content).toMatch(/Week \d+/);
    });

    it("should have SEO strategy", () => {
      const content = sections.get("Content Strategy")?.content || "";
      expect(content).toMatch(/SEO Strategy/i);
      expect(content).toMatch(/Target Keywords/i);
    });

    it("should define content types", () => {
      const content = sections.get("Content Strategy")?.content || "";
      expect(content).toMatch(/Blog.*Video.*Social/is);
    });
  });

  describe("Document Quality", () => {
    it("should not have broken markdown formatting", () => {
      // Check for common markdown issues
      const unbalancedBrackets = content.match(/\[[^\]]*\([^)]*$/gm);
      expect(unbalancedBrackets).toBeNull();
    });

    it("should have consistent list formatting", () => {
      const listItems = lines.filter((line) => line.match(/^\s*[-*]\s+/));
      listItems.forEach((item) => {
        expect(item).toMatch(/^\s*[-*]\s+\S/);
      });
    });

    it("should have proper table formatting", () => {
      const tableLines = lines.filter((line) => line.match(/^\|.*\|$/));
      if (tableLines.length > 0) {
        // Each table should have header separator
        const tableSections = content.split("\n\n");
        tableSections.forEach((section) => {
          if (section.includes("|") && section.split("\n").length > 2) {
            const sectionLines = section.split("\n");
            const hasHeader = sectionLines[0].includes("|");
            const hasSeparator = sectionLines[1].match(/^|[:\s-]+|$/);
            if (hasHeader) {
              expect(hasSeparator).toBeTruthy();
            }
          }
        });
      }
    });

    it("should use consistent heading levels", () => {
      const headings = lines
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => line.match(/^#{1,6}\s+/));

      headings.forEach(({ line, index }) => {
        const level = (line.match(/^#+/) || [""])[0].length;
        expect(level).toBeGreaterThan(0);
        expect(level).toBeLessThanOrEqual(6);
      });
    });

    it("should not have excessive line length", () => {
      const longLines = lines.filter(
        (line) => line.length > 200 && !line.match(/^\|/), // Exclude tables
      );

      // Allow some long lines but flag if excessive
      expect(longLines.length).toBeLessThan(50);
    });

    it("should have consistent spacing around headers", () => {
      lines.forEach((line, index) => {
        if (line.match(/^##\s+/) && index > 0) {
          // Major sections should have blank line before
          const prevLine = lines[index - 1];
          if (prevLine.trim() !== "---" && prevLine.trim() !== "") {
            // Some flexibility for formatting
            const prevPrevLine = lines[index - 2] || "";
            expect(
              prevLine === "" || prevPrevLine === "",
              `Section header at line ${index + 1} should have blank line before`,
            ).toBeTruthy();
          }
        }
      });
    });
  });

  describe("Completeness and Consistency", () => {
    it("should have a conclusion section", () => {
      expect(sections.has("Conclusion")).toBe(true);
    });

    it("should reference related documents", () => {
      const conclusion = sections.get("Conclusion")?.content || "";
      expect(conclusion).toMatch(/Related Documents/i);
    });

    it("should have document version history", () => {
      expect(content).toMatch(/Version History|Document Version/i);
    });

    it("should have consistent metric formatting", () => {
      // Numbers should use consistent thousand separators
      const numbers = content.match(/\d{1,3}(,\d{3})+/g);
      if (numbers) {
        numbers.forEach((num) => {
          // Verify format is correct (e.g., 10,000 not 10,00)
          const parts = num.split(",");
          parts.slice(1).forEach((part) => {
            expect(part.length).toBe(3);
          });
        });
      }
    });

    it("should have consistent terminology", () => {
      // Check for consistent use of key terms
      const hasConsistentWAU = content.match(/Weekly Active Users/gi);
      const hasConsistentDAU = content.match(/Daily Active Users/gi);

      if (hasConsistentWAU && hasConsistentWAU.length > 1) {
        // If term is used multiple times, check consistency
        const firstUse = hasConsistentWAU[0];
        hasConsistentWAU.forEach((use) => {
          // Allow for some variation but check general consistency
          expect(use.toLowerCase()).toBe(firstUse.toLowerCase());
        });
      }
    });

    it("should maintain consistent date formatting", () => {
      const dates = content.match(/November \d{4}|Month [0-6-]+|Day \d+/g);
      expect(dates).toBeTruthy();

      // Dates should follow consistent format
      dates?.forEach((date) => {
        expect(date).toMatch(/^(November \d{4}|Month [-\d]+|Day \d+)$/);
      });
    });
  });

  describe("Actionability", () => {
    it("should have specific, measurable targets", () => {
      // Count quantified targets throughout the document
      const targets = content.match(
        /\d+[,\d]*\+?\s*(users|subscribers|%|downloads)/gi,
      );
      expect(targets).toBeTruthy();
      expect(targets!.length).toBeGreaterThan(20);
    });

    it("should include specific action items", () => {
      const actionVerbs = content.match(
        /\b(Launch|Create|Build|Develop|Write|Run|Execute|Track|Monitor|Analyze|Review)\b/gi,
      );
      expect(actionVerbs).toBeTruthy();
      expect(actionVerbs!.length).toBeGreaterThan(30);
    });

    it("should reference specific tools and platforms", () => {
      const tools = content.match(
        /\b(Product Hunt|Twitter|Reddit|Instagram|LinkedIn|Discord|Slack|ConvertKit|Mailchimp|Google Analytics|Mixpanel|Amplitude)\b/gi,
      );
      expect(tools).toBeTruthy();
      expect(tools!.length).toBeGreaterThan(10);
    });

    it("should provide concrete examples", () => {
      // Look for example indicators
      const examples = content.match(
        /Example:|For example|e\.g\.|such as|"[^"]+"/gi,
      );
      expect(examples).toBeTruthy();
      expect(examples!.length).toBeGreaterThan(15);
    });
  });
});
