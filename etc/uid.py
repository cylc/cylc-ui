# Copyright (C) NIWA & British Crown (Met Office) & Contributors.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

import os
from pathlib import Path
import re
import sys
from textwrap import indent, dedent

from cylc.flow.id import UNIVERSAL_ID, RELATIVE_ID


def strip_comments(pattern):
    r"""JS doesn't support verbose regexes.

    >>> strip_comments('foo # bar\nbaz')
    'foo\nbaz'

    """
    return re.sub(r'\s*#.*\n', '\n', pattern)


def strip_named_groups(pattern):
    r"""JS doesn't support named groups.

    >>> strip_named_groups('(?P<group>pattern)')
    '(pattern)'

    """
    return re.sub(r'\?P<\w+>', '', pattern)


def format_regex(name, regex):
    # extract pattern from compiled regex
    pattern = regex.pattern
    pattern = strip_comments(pattern)
    pattern = strip_named_groups(pattern)
    pattern = re.sub(r'\?<\w+>', '', pattern)
    pattern = dedent(pattern).strip()  # strip leading / trailing whitespace
    # format as JS code
    return (
        f'const {name} = new RegExp(`\n'
        f'{indent(pattern, "    ")}\n'
        r'`.replace(/[\s\n\r]/g, '"''"'))'
    )


def extract_regex(name, uid_code):
    match = re.search(
        rf'const {name} = new RegExp\(.*(\n.*)+?\n`.*\)',
        uid_code
    )
    return match # .group()


def check(fix=False):
    with open(Path('../src/utils/uid.js'), 'r') as uid_file:
        uid_code = uid_file.read()
        for name, regex in [
            ('UNIVERSAL_ID', UNIVERSAL_ID),
            ('RELATIVE_ID', RELATIVE_ID),
        ]:
            current_code = extract_regex(name, uid_code)
            new_code = format_regex(name, regex)

            if current_code != new_code:
                if fix:
                    uid_code = fix_code(uid_code, current_code, new_code)
                else:
                    report(name, current_code, new_code)
    if fix:
        with open(Path('../src/utils/uid.js'), 'w') as uid_file:
            uid_file.write(uid_code)


def report(name, current_code, new_code):
    print(f'{name} (current)', file=sys.stderr)
    print(current_code.group(), file=sys.stderr)
    print(f'{name} (new)', file=sys.stderr)
    print(new_code, file=sys.stderr)
    sys.exit(1)


def fix_code(uid_code, current_code, new_code):
    start, end = current_code.span()
    before = uid_code[:start]
    after = uid_code[end:]
    return f'{before}{new_code}{after}'


if __name__ == '__main__':
    os.chdir(Path(__file__).parent)
    check('--fix' in sys.argv)
