#!/usr/bin/env python3
"""Inline svg/*.svg into index.template.html at <!-- asset: name --> placeholders and write ../index.html."""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
tpl = open(os.path.join(HERE, "index.template.html"), encoding="utf-8").read()


def sub(m):
    name = m.group(1).strip()
    path = os.path.join(HERE, "svg", name + ".svg")
    svg = open(path, encoding="utf-8").read().strip()
    return svg.replace(' xmlns="http://www.w3.org/2000/svg"', "", 1)


out = re.sub(r"<!--\s*asset:\s*([a-z0-9-]+)\s*-->", sub, tpl)
assert "asset:" not in out, "unresolved placeholder"
open(os.path.join(HERE, "..", "index.html"), "w", encoding="utf-8").write(out)
print("index.html", len(out), "bytes")
