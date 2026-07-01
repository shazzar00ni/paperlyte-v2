"""
Tests for scripts/maintenance/audit_branches.py

Scope: Only tests changes introduced in this PR:
  - CRITICAL_FILES paths updated to use docs/ prefix
    (docs/gitVersionControl.md and docs/review.md instead of bare filenames)
  - audit_branch() behavior with these new paths
"""
import unittest
from unittest.mock import patch


class TestCriticalFilesConstant(unittest.TestCase):
    """Tests that CRITICAL_FILES contains the correct updated paths."""

    def setUp(self):
        # Import here so mocking is applied before module-level side effects.
        import scripts.maintenance.audit_branches as ab
        self.ab = ab

    def test_docs_gitVersionControl_md_in_critical_files(self):
        """docs/gitVersionControl.md must be in CRITICAL_FILES (PR fix)."""
        self.assertIn("docs/gitVersionControl.md", self.ab.CRITICAL_FILES)

    def test_docs_review_md_in_critical_files(self):
        """docs/review.md must be in CRITICAL_FILES (PR fix)."""
        self.assertIn("docs/review.md", self.ab.CRITICAL_FILES)

    def test_bare_gitVersionControl_md_not_in_critical_files(self):
        """Old bare path gitVersionControl.md must NOT be in CRITICAL_FILES."""
        self.assertNotIn("gitVersionControl.md", self.ab.CRITICAL_FILES)

    def test_bare_review_md_not_in_critical_files(self):
        """Old bare path review.md must NOT be in CRITICAL_FILES."""
        self.assertNotIn("review.md", self.ab.CRITICAL_FILES)

    def test_npmrc_still_in_critical_files(self):
        """.npmrc should remain in CRITICAL_FILES (unmodified by PR)."""
        self.assertIn(".npmrc", self.ab.CRITICAL_FILES)

    def test_docs_roadmap_still_in_critical_files(self):
        """docs/ROADMAP.md should remain in CRITICAL_FILES (unmodified by PR)."""
        self.assertIn("docs/ROADMAP.md", self.ab.CRITICAL_FILES)

    def test_critical_files_length(self):
        """CRITICAL_FILES should contain exactly 4 entries."""
        self.assertEqual(len(self.ab.CRITICAL_FILES), 4)

    def test_critical_files_are_unique(self):
        """All entries in CRITICAL_FILES must be unique (no duplicates)."""
        self.assertEqual(len(self.ab.CRITICAL_FILES), len(set(self.ab.CRITICAL_FILES)))


class TestAuditBranchMissingDocsPaths(unittest.TestCase):
    """
    Tests that audit_branch() reports issues for the updated docs/ paths.
    """

    def _make_branch_files(self, exclude=()):
        """Return a newline-separated file listing with given paths excluded."""
        all_files = [
            ".npmrc",
            "docs/ROADMAP.md",
            "docs/gitVersionControl.md",
            "docs/review.md",
            "src/utils/navigation.ts",
        ]
        return "\n".join(f for f in all_files if f not in exclude)

    def _nav_content_with_helpers(self):
        return (
            "export function hasDangerousProtocol(url) { return false; }\n"
            "export const isRelativeUrl = (url) => !url.startsWith('http');\n"
        )

    def _run_audit(self, branch_files_output, nav_content="", merge_base="abc123"):
        """Helper: patch run_command and call audit_branch."""
        import scripts.maintenance.audit_branches as ab

        def fake_run_command(args):
            if args[0] == "git" and args[1] == "merge-base":
                return merge_base
            if args[0] == "git" and args[1] == "ls-tree":
                return branch_files_output
            if args[0] == "git" and args[1] == "show":
                return nav_content
            return None

        with patch("scripts.maintenance.audit_branches.run_command", side_effect=fake_run_command):
            return ab.audit_branch("origin/feature-branch")

    # --- Missing docs/gitVersionControl.md ---

    def test_missing_docs_gitVersionControl_md_is_reported(self):
        """audit_branch() must report an issue when docs/gitVersionControl.md is absent."""
        branch_files = self._make_branch_files(exclude=("docs/gitVersionControl.md",))
        issues = self._run_audit(branch_files, self._nav_content_with_helpers())
        self.assertTrue(
            any("docs/gitVersionControl.md" in issue for issue in issues),
            f"Expected issue about docs/gitVersionControl.md, got: {issues}",
        )

    def test_bare_gitVersionControl_md_present_still_causes_missing_issue(self):
        """
        If only bare gitVersionControl.md is present (no docs/ prefix), the branch
        should still be flagged for missing docs/gitVersionControl.md.
        """
        # Simulate a branch that has the old (incorrect) path but not the new one
        branch_files = self._make_branch_files(exclude=("docs/gitVersionControl.md",))
        branch_files += "\ngitVersionControl.md"  # old bare path present
        issues = self._run_audit(branch_files, self._nav_content_with_helpers())
        self.assertTrue(
            any("docs/gitVersionControl.md" in issue for issue in issues),
            f"Old bare path should not satisfy new docs/ requirement, got: {issues}",
        )

    # --- Missing docs/review.md ---

    def test_missing_docs_review_md_is_reported(self):
        """audit_branch() must report an issue when docs/review.md is absent."""
        branch_files = self._make_branch_files(exclude=("docs/review.md",))
        issues = self._run_audit(branch_files, self._nav_content_with_helpers())
        self.assertTrue(
            any("docs/review.md" in issue for issue in issues),
            f"Expected issue about docs/review.md, got: {issues}",
        )

    def test_bare_review_md_present_still_causes_missing_issue(self):
        """
        If only bare review.md is present (no docs/ prefix), the branch
        should still be flagged for missing docs/review.md.
        """
        branch_files = self._make_branch_files(exclude=("docs/review.md",))
        branch_files += "\nreview.md"  # old bare path present
        issues = self._run_audit(branch_files, self._nav_content_with_helpers())
        self.assertTrue(
            any("docs/review.md" in issue for issue in issues),
            f"Old bare path should not satisfy new docs/ requirement, got: {issues}",
        )

    # --- Happy path: all files present ---

    def test_no_missing_file_issues_when_all_docs_paths_present(self):
        """audit_branch() must report no file-missing issues when all new docs/ paths exist."""
        branch_files = self._make_branch_files()
        issues = self._run_audit(branch_files, self._nav_content_with_helpers())
        file_issues = [i for i in issues if i.startswith("Missing")]
        self.assertEqual(
            file_issues,
            [],
            f"Expected no 'Missing' issues, got: {file_issues}",
        )

    # --- Both docs/ paths missing simultaneously ---

    def test_both_docs_paths_missing_reports_two_issues(self):
        """When both docs/gitVersionControl.md and docs/review.md are absent, both are reported."""
        branch_files = self._make_branch_files(
            exclude=("docs/gitVersionControl.md", "docs/review.md")
        )
        issues = self._run_audit(branch_files, self._nav_content_with_helpers())
        gvc_missing = any("docs/gitVersionControl.md" in i for i in issues)
        review_missing = any("docs/review.md" in i for i in issues)
        self.assertTrue(gvc_missing, f"Expected docs/gitVersionControl.md issue; got: {issues}")
        self.assertTrue(review_missing, f"Expected docs/review.md issue; got: {issues}")

    # --- Issue message format ---

    def test_missing_docs_gitVersionControl_message_format(self):
        """Issue message for missing docs/gitVersionControl.md uses the correct full path."""
        branch_files = self._make_branch_files(exclude=("docs/gitVersionControl.md",))
        issues = self._run_audit(branch_files, self._nav_content_with_helpers())
        matching = [i for i in issues if "docs/gitVersionControl.md" in i]
        self.assertEqual(len(matching), 1)
        self.assertIn("Missing docs/gitVersionControl.md", matching[0])

    def test_missing_docs_review_message_format(self):
        """Issue message for missing docs/review.md uses the correct full path."""
        branch_files = self._make_branch_files(exclude=("docs/review.md",))
        issues = self._run_audit(branch_files, self._nav_content_with_helpers())
        matching = [i for i in issues if "docs/review.md" in i]
        self.assertEqual(len(matching), 1)
        self.assertIn("Missing docs/review.md", matching[0])


if __name__ == "__main__":
    unittest.main()