import sys

def main():
    try:
        with open('PR_REVIEW_SUMMARY.md', 'r') as f:
            original_lines = f.readlines()

        with open('daily_summary.txt', 'r') as f:
            daily_summary = f.read()

        with open('manual_feedback.txt', 'r') as f:
            manual_feedback = f.read()

        insertion_point = 0
        for i, line in enumerate(original_lines):
            if '# PR Review Summary' in line:
                insertion_point = i + 1
                # Move past the description line if it exists
                if i + 2 < len(original_lines) and 'This file contains' in original_lines[i + 2]:
                     insertion_point = i + 3
                elif i + 1 < len(original_lines) and 'This file contains' in original_lines[i + 1]:
                     insertion_point = i + 2
                break

        new_entry = f"\n{daily_summary.strip()}\n\n{manual_feedback.strip()}\n\n---\n"

        final_lines = original_lines[:insertion_point] + [new_entry] + original_lines[insertion_point:]

        with open('PR_REVIEW_SUMMARY.md', 'w') as f:
            f.writelines(final_lines)
        print("Summary updated successfully.")
    except Exception as e:
        print(f"Error updating summary: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
