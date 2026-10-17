#!/usr/bin/env python3
"""One-off: inline assets-src/out/*.svg into <!-- asset: name --> placeholders of a template html.
usage: inline.py template.html output.html"""
import os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
src = open(sys.argv[1]).read()
def sub(m):
    return open(os.path.join(here, 'out', m.group(1) + '.svg')).read()
open(sys.argv[2], 'w').write(re.sub(r'<!-- asset: ([a-z-]+) -->', sub, src))
