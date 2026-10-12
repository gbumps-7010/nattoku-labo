"use strict";

// Same calculation as scripts/lib/consumables.py (guides). Keep the two in sync.

const fs = require("fs");
const path = require("path");

const YEARS = 3;

function round10(n) {
  return Math.floor(n / 10 + 0.5) * 10;
}

function partAnnual(part) {
  const unit = (part.packPrice / part.packQty) * (part.perSwap || 1);
  const [short, long] = part.intervalMonths;
  return [(12 / long) * unit, (12 / short) * unit];
}

function summarize(entry, price) {
  let lo = 0;
  let hi = 0;
  const parts = entry.parts.map((p) => {
    const [a, b] = partAnnual(p);
    lo += a;
    hi += b;
    return { ...p, annualLo: round10(a), annualHi: round10(b) };
  });
  const out = {
    annualLo: round10(lo),
    annualHi: round10(hi),
    parts,
    excluded: entry.excluded || [],
    note: entry.note || "",
    checkedAt: entry.checkedAt || "",
  };
  if (price) {
    out.tco3Lo = price + YEARS * out.annualLo;
    out.tco3Hi = price + YEARS * out.annualHi;
  }
  return out;
}

function loadVerified(dataDir) {
  const verified = {};
  if (!fs.existsSync(dataDir)) return verified;
  for (const file of fs.readdirSync(dataDir).filter((f) => f.endsWith(".json")).sort()) {
    const payload = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
    for (const [slug, entry] of Object.entries(payload.products || {})) {
      verified[slug] = { ...entry, checkedAt: entry.checkedAt || payload.checkedAt || "" };
    }
  }
  return verified;
}

module.exports = { loadVerified, summarize };
