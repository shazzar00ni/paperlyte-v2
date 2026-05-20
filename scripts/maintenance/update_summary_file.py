#!/usr/bin/env python3
import sys
import os
import argparse

def find_insertion_point(lines):
    """Finds the correct line index to insert the new summary."""
    for i, line in enumerate(lines):
        if '# PR Review Summary' in line or '# Pull Request Review Summary' in line:
            # Move past header and description
            for offset in [2, 1]:
                if i + offset < len(lines) and 'This file contains' in lines[i + offset]:
                    return i + offset + 1
            return i + 1
    return 0

def main():
    parser = argparse.ArgumentParser(description='Update PR_REVIEW_SUMMARY.md')
    parser.add_argument('--summary-file', default='PR_REVIEW_SUMMARY.md')
    parser.add_argument('--daily-file', default='daily_summary.txt')
    parser.add_argument('--manual-feedback')
    args = parser.parse_args()

    if not os.path.exists(args.daily_file):
        print(f"Error: {args.daily_file} not found.")
        return

    with open(args.summary_file, 'r') as f:
        original_lines = f.readlines()
    with open(args.daily_file, 'r') as f:
        daily_summary = f.read().strip()

    manual_content = ""
    if args.manual_feedback and os.path.exists(args.manual_feedback):
        with open(args.manual_feedback, 'r') as f:
            manual_content = "\n" + f.read().strip() + "\n"

    point = find_insertion_point(original_lines)
    new_entry = f"\n{daily_summary}\n{manual_content}\n---\n"
    final_lines = original_lines[:point] + [new_entry] + original_lines[point:]

    with open(args.summary_file, 'w') as f:
        f.writelines(final_lines)
    print("Summary updated successfully.")

if __name__ == "__main__":
    main()
