#!/usr/bin/env python3
"""
Run unit tests using pytest and generate a Markdown report.
"""
import subprocess
import sys

def main():
    # Execute pytest
    result = subprocess.run(
        ['pytest', '-q', '--disable-warnings', '--maxfail=1'],
        capture_output=True, text=True
    )
    # Prepare Markdown report
    lines = []
    lines.append('# Unit Test Report')
    lines.append('')
    lines.append('```')
    lines.append(result.stdout.strip())
    lines.append('```')
    lines.append('')
    lines.append(f'**Exit Code**: {result.returncode}')
    # Write report to file
    with open('unit_test_report.md', 'w') as f:
        f.write('\n'.join(lines))
    # Notify user
    if result.returncode == 0:
        print('unit_test_report.md generated successfully.')
        sys.exit(0)
    else:
        print('unit_test_report.md generated with test failures.')
        sys.exit(result.returncode)

if __name__ == '__main__':
    main()