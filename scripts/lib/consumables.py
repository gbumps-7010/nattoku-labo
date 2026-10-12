# -*- coding: utf-8 -*-
"""Official consumables data (scripts/data/consumables/*.json) -> yearly / 3-year cost ranges.

Only parts with an official price and an official replacement interval are listed in the data,
so a product missing from the data means "not verified yet", never "no consumables".
"""
from __future__ import annotations

import json
from pathlib import Path

YEARS = 3


def _round10(n: float) -> int:
    return int(n / 10.0 + 0.5) * 10


def part_annual(part: dict) -> tuple[float, float]:
    unit = part["packPrice"] / part["packQty"] * part.get("perSwap", 1)
    short, long_ = part["intervalMonths"]
    return 12 / long_ * unit, 12 / short * unit


def summarize(entry: dict, price: int | None = None) -> dict:
    lo = hi = 0.0
    parts = []
    for p in entry["parts"]:
        a, b = part_annual(p)
        lo += a
        hi += b
        parts.append({**p, "annualLo": _round10(a), "annualHi": _round10(b)})
    out = {
        "annualLo": _round10(lo),
        "annualHi": _round10(hi),
        "parts": parts,
        "excluded": entry.get("excluded") or [],
        "note": entry.get("note") or "",
        "checkedAt": entry.get("checkedAt") or "",
    }
    if price:
        out["tco3Lo"] = price + YEARS * out["annualLo"]
        out["tco3Hi"] = price + YEARS * out["annualHi"]
        out["tco3Mid"] = (out["tco3Lo"] + out["tco3Hi"]) // 2
    return out


def load_verified(data_dir: Path) -> dict[str, dict]:
    verified: dict[str, dict] = {}
    if not data_dir.exists():
        return verified
    for path in sorted(data_dir.glob("*.json")):
        payload = json.loads(path.read_text(encoding="utf-8"))
        checked = payload.get("checkedAt") or ""
        for slug, entry in (payload.get("products") or {}).items():
            verified[slug] = {**entry, "checkedAt": entry.get("checkedAt") or checked}
    return verified
