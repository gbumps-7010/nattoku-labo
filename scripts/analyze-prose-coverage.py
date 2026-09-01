#!/usr/bin/env python3
"""Analyze prose emphasis coverage across product data."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts/lib"))
from format_prose import format_prose  # noqa: E402


def collect_texts() -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    for p in sorted((ROOT / "products/data").glob("*.json")):
        d = json.loads(p.read_text(encoding="utf-8"))
        if not isinstance(d, dict):
            continue
        perf = d.get("performance") or {}
        if isinstance(perf, dict):
            for v in perf.values():
                if isinstance(v, dict) and (v.get("comment") or "").strip():
                    out.append((f"{p.stem}:perf", v["comment"].strip()))
        for block in d.get("attributeScores") or []:
            if isinstance(block, dict):
                for item in block.get("items") or []:
                    c = (item.get("comment") or "").strip()
                    if c:
                        out.append((f"{p.stem}:attr", c))
        rel = d.get("reliability") or {}
        for k in ("dataAdequacy", "consistency", "freshness"):
            desc = (rel.get(k) or {}).get("description", "").strip()
            if desc:
                out.append((f"{p.stem}:rel.{k}", desc))
        for item in d.get("topComplaints") or []:
            for field in ("complaint", "description", "details"):
                t = (item.get(field) or "").strip()
                if t:
                    out.append((f"{p.stem}:complaint", t))
    return out


def highlights(html: str) -> list[str]:
    return [m.replace("\u2060", "") for m in re.findall(r'<strong class="em-key[^"]*">([^<]*)</strong>', html)]


def main() -> None:
    texts = collect_texts()
    missed = []
    for src, text in texts:
        h = highlights(format_prose(text))
        if not h:
            missed.append((src, text))

    print(f"total={len(texts)} missed={len(missed)} ({100*len(missed)/len(texts):.1f}%)")
    for src, text in missed[:25]:
        print(f"\n[{src}]")
        print(text[:120] + ("..." if len(text) > 120 else ""))


if __name__ == "__main__":
    main()
