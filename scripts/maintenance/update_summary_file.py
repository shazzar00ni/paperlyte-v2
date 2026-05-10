#!/usr/bin/env python3
import sys
import os
import argparse

def main():
    parser = argparse.ArgumentParser(description='Update PR_REVIEW_SUMMARY.md with daily audit results.')
    parser.add_argument('--summary-file', default='PR_REVIEW_SUMMARY.md', help='Path to the summary file.')
    parser.add_argument('--daily-file', default='daily_summary.txt', help='Path to the daily results file.')
    parser.add_argument('--manual-feedback', help='Path to a file containing manual feedback.')

    args = parser.parse_args()

    try:
        summary_file = args.summary_file
        daily_file = args.daily_file

        if not os.path.exists(daily_file):
            print(f"Error: {daily_file} not found.")
            return

        with open(summary_file, 'r') as f:
            original_lines = f.readlines()

        with open(daily_file, 'r') as f:
            daily_summary = f.read().strip()

        manual_feedback_content = ""
        if args.manual_feedback and os.path.exists(args.manual_feedback):
            with open(args.manual_feedback, 'r') as f:
                manual_feedback_content = "\n" + f.read().strip() + "\n"

        insertion_point = 0
        header_found = False
        for i, line in enumerate(original_lines):
            if '# PR Review Summary' in line or '# Pull Request Review Summary' in line:
                header_found = True
                insertion_point = i + 1
                # Move past the description line if it exists
                if i + 2 < len(original_lines) and 'This file contains' in original_lines[i + 2]:
                     insertion_point = i + 3
                elif i + 1 < len(original_lines) and 'This file contains' in original_lines[i + 1]:
                     insertion_point = i + 2
                break

        if not header_found:
            insertion_point = 0

        new_entry = f"\n{daily_summary}\n{manual_feedback_content}\n---\n"

        final_lines = original_lines[:insertion_point] + [new_entry] + original_lines[insertion_point:]

        with open(summary_file, 'w') as f:
            f.writelines(final_lines)
        print("Summary updated successfully.")
    except Exception as e:
        print(f"Error updating summary: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
