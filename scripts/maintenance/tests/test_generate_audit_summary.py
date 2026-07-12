"""
Tests for scripts/maintenance/generate_audit_summary.py

Scope: Only tests changes introduced in this PR:
  - MAPPING keys updated:
      'Missing gitVersionControl.md' → 'Missing docs/gitVersionControl.md'
      'Missing review.md'            → 'Missing docs/review.md'
  - generate_markdown_summary() table rows now show docs/ prefixed paths.
  - process_blocked_branches() correctly aggregates stats using new MAPPING keys.
"""
import unittest
from unittest.mock import patch


class TestMappingConstant(unittest.TestCase):
    """Tests for the updated MAPPING dictionary keys."""

    def setUp(self):
        import scripts.maintenance.generate_audit_summary as gas
        self.gas = gas

    # --- New keys must be present ---

    def test_new_gvc_key_in_mapping(self):
        """MAPPING must contain 'Missing docs/gitVersionControl.md' (PR fix)."""
        self.assertIn("Missing docs/gitVersionControl.md", self.gas.MAPPING)

    def test_new_review_key_in_mapping(self):
        """MAPPING must contain 'Missing docs/review.md' (PR fix)."""
        self.assertIn("Missing docs/review.md", self.gas.MAPPING)

    # --- Old keys must NOT be present ---

    def test_old_gvc_key_not_in_mapping(self):
        """Old key 'Missing gitVersionControl.md' must NOT be in MAPPING."""
        self.assertNotIn("Missing gitVersionControl.md", self.gas.MAPPING)

    def test_old_review_key_not_in_mapping(self):
        """Old key 'Missing review.md' must NOT be in MAPPING."""
        self.assertNotIn("Missing review.md", self.gas.MAPPING)

    # --- Mapped values are correct ---

    def test_new_gvc_key_maps_to_GVC(self):
        """'Missing docs/gitVersionControl.md' must map to 'GVC'."""
        self.assertEqual(self.gas.MAPPING["Missing docs/gitVersionControl.md"], "GVC")

    def test_new_review_key_maps_to_REVIEW(self):
        """'Missing docs/review.md' must map to 'REVIEW'."""
        self.assertEqual(self.gas.MAPPING["Missing docs/review.md"], "REVIEW")

    # --- Other keys remain intact ---

    def test_orphan_key_unchanged(self):
        self.assertEqual(self.gas.MAPPING["Orphan branch"], "Orphan")

    def test_npmrc_key_unchanged(self):
        self.assertEqual(self.gas.MAPPING["Missing .npmrc"], "NPMRC")

    def test_roadmap_key_unchanged(self):
        self.assertEqual(self.gas.MAPPING["Missing docs/ROADMAP.md"], "ROADMAP")

    def test_helpers_key_unchanged(self):
        self.assertEqual(self.gas.MAPPING["security helper"], "HELPERS")

    def test_unreadable_key_unchanged(self):
        self.assertEqual(self.gas.MAPPING["Could not read src/utils/navigation.ts"], "UNREADABLE")


class TestGenerateMarkdownSummary(unittest.TestCase):
    """Tests that generate_markdown_summary() emits updated docs/ paths."""

    def setUp(self):
        import scripts.maintenance.generate_audit_summary as gas
        self.gas = gas
        self.default_stats = {
            "Orphan": 0, "NPMRC": 0, "ROADMAP": 0,
            "GVC": 0, "REVIEW": 0, "HELPERS": 0, "UNREADABLE": 0,
        }

    # --- docs/gitVersionControl.md appears in the table ---

    def test_markdown_contains_docs_gitVersionControl_path(self):
        """Markdown output must reference docs/gitVersionControl.md (PR fix)."""
        summary = self.gas.generate_markdown_summary(10, self.default_stats)
        self.assertIn("docs/gitVersionControl.md", summary)

    def test_markdown_contains_docs_review_path(self):
        """Markdown output must reference docs/review.md (PR fix)."""
        summary = self.gas.generate_markdown_summary(10, self.default_stats)
        self.assertIn("docs/review.md", summary)

    # --- Old bare paths must NOT appear ---

    def test_markdown_does_not_contain_bare_gitVersionControl_path(self):
        """Markdown output must NOT contain the old bare 'gitVersionControl.md' row label."""
        summary = self.gas.generate_markdown_summary(10, self.default_stats)
        # The old table cell was: "| Missing `gitVersionControl.md` |"
        # Ensure it's absent while the new one is present.
        self.assertNotIn("Missing `gitVersionControl.md`", summary)

    def test_markdown_does_not_contain_bare_review_path(self):
        """Markdown output must NOT contain the old bare 'review.md' row label."""
        summary = self.gas.generate_markdown_summary(10, self.default_stats)
        self.assertNotIn("Missing `review.md`", summary)

    # --- Stat counts are rendered ---

    def test_gvc_count_rendered_in_markdown(self):
        """GVC stat count should appear in the docs/gitVersionControl.md table row."""
        stats = dict(self.default_stats)
        stats["GVC"] = 7
        summary = self.gas.generate_markdown_summary(10, stats)
        # Row should contain the count value
        self.assertIn("7", summary)
        gvc_line = [line for line in summary.splitlines() if "docs/gitVersionControl.md" in line]
        self.assertTrue(gvc_line, "No line found containing docs/gitVersionControl.md")
        self.assertIn("7", gvc_line[0])

    def test_review_count_rendered_in_markdown(self):
        """REVIEW stat count should appear in the docs/review.md table row."""
        stats = dict(self.default_stats)
        stats["REVIEW"] = 3
        summary = self.gas.generate_markdown_summary(10, stats)
        review_line = [line for line in summary.splitlines() if "docs/review.md" in line]
        self.assertTrue(review_line, "No line found containing docs/review.md")
        self.assertIn("3", review_line[0])

    # --- Severity labels preserved ---

    def test_gvc_row_has_high_severity(self):
        """docs/gitVersionControl.md row must retain '🟠 High' severity."""
        summary = self.gas.generate_audit_summary(10, self.default_stats) if hasattr(
            self.gas, "generate_audit_summary"
        ) else self.gas.generate_markdown_summary(10, self.default_stats)
        gvc_line = next(
            (line for line in summary.splitlines() if "docs/gitVersionControl.md" in line), ""
        )
        self.assertIn("🟠 High", gvc_line)

    def test_review_row_has_medium_severity(self):
        """docs/review.md row must retain '🟡 Medium' severity."""
        summary = self.gas.generate_markdown_summary(10, self.default_stats)
        review_line = next(
            (line for line in summary.splitlines() if "docs/review.md" in line), ""
        )
        self.assertIn("🟡 Medium", review_line)

    # --- Regression: zero counts render correctly ---

    def test_zero_gvc_count_does_not_break_output(self):
        """GVC count of 0 should render without error."""
        stats = dict(self.default_stats)
        stats["GVC"] = 0
        summary = self.gas.generate_markdown_summary(5, stats)
        self.assertIn("docs/gitVersionControl.md", summary)

    def test_zero_review_count_does_not_break_output(self):
        """REVIEW count of 0 should render without error."""
        stats = dict(self.default_stats)
        stats["REVIEW"] = 0
        summary = self.gas.generate_markdown_summary(5, stats)
        self.assertIn("docs/review.md", summary)


class TestProcessBlockedBranches(unittest.TestCase):
    """
    Tests that process_blocked_branches() correctly aggregates GVC and REVIEW
    stats using the new MAPPING keys (docs/ prefixed paths).
    """

    def setUp(self):
        import scripts.maintenance.generate_audit_summary as gas
        self.gas = gas

    def _run_process(self, blocked_items):
        """Run process_blocked_branches with an empty pr_map (no gh calls)."""
        with patch.object(self.gas, "comment_on_pr"):
            return self.gas.process_blocked_branches(blocked_items, pr_map={})

    # --- New path strings trigger GVC/REVIEW stats ---

    def test_missing_docs_gitVersionControl_increments_GVC(self):
        """Issue 'Missing docs/gitVersionControl.md' must increment GVC counter."""
        blocked = [{"branch": "feat/x", "issues": ["Missing docs/gitVersionControl.md"]}]
        stats = self._run_process(blocked)
        self.assertEqual(stats["GVC"], 1)

    def test_missing_docs_review_increments_REVIEW(self):
        """Issue 'Missing docs/review.md' must increment REVIEW counter."""
        blocked = [{"branch": "feat/x", "issues": ["Missing docs/review.md"]}]
        stats = self._run_process(blocked)
        self.assertEqual(stats["REVIEW"], 1)

    # --- Old bare path strings must NOT trigger GVC/REVIEW stats ---

    def test_old_bare_gitVersionControl_does_not_increment_GVC(self):
        """
        Old-format issue 'Missing gitVersionControl.md' (no docs/ prefix)
        must NOT increment GVC — confirming the MAPPING key was updated.
        """
        blocked = [{"branch": "feat/x", "issues": ["Missing gitVersionControl.md"]}]
        stats = self._run_process(blocked)
        self.assertEqual(stats["GVC"], 0)

    def test_old_bare_review_does_not_increment_REVIEW(self):
        """
        Old-format issue 'Missing review.md' (no docs/ prefix)
        must NOT increment REVIEW — confirming the MAPPING key was updated.
        """
        blocked = [{"branch": "feat/x", "issues": ["Missing review.md"]}]
        stats = self._run_process(blocked)
        self.assertEqual(stats["REVIEW"], 0)

    # --- Multiple branches aggregate correctly ---

    def test_multiple_branches_with_docs_paths_aggregate_correctly(self):
        """GVC and REVIEW stats accumulate across multiple blocked branches."""
        blocked = [
            {"branch": "feat/a", "issues": ["Missing docs/gitVersionControl.md"]},
            {"branch": "feat/b", "issues": ["Missing docs/gitVersionControl.md", "Missing docs/review.md"]},
            {"branch": "feat/c", "issues": ["Missing docs/review.md"]},
        ]
        stats = self._run_process(blocked)
        self.assertEqual(stats["GVC"], 2)
        self.assertEqual(stats["REVIEW"], 2)

    # --- Mixed issue sets ---

    def test_branch_with_mixed_issues_counts_only_matching_stats(self):
        """A branch with multiple issue types increments only the matching stats."""
        blocked = [
            {
                "branch": "feat/mixed",
                "issues": [
                    "Missing .npmrc",
                    "Missing docs/gitVersionControl.md",
                    "Missing docs/review.md",
                ],
            }
        ]
        stats = self._run_process(blocked)
        self.assertEqual(stats["NPMRC"], 1)
        self.assertEqual(stats["GVC"], 1)
        self.assertEqual(stats["REVIEW"], 1)
        self.assertEqual(stats["Orphan"], 0)

    # --- Empty input ---

    def test_empty_blocked_list_returns_all_zero_stats(self):
        """process_blocked_branches() with no blocked branches returns all-zero stats."""
        stats = self._run_process([])
        self.assertTrue(all(v == 0 for v in stats.values()), f"Expected all zeros, got: {stats}")


if __name__ == "__main__":
    unittest.main()