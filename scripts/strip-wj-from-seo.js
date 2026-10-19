#!/usr/bin/env node
"use strict";

/**
 * P2-1: Remove U+2060 (WORD JOINER) from SEO-critical spots only:
 * title, meta description, og/twitter tags, h1–h3, JSON-LD.
 * Body prose keeps WJ for Japanese line-break control.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const WJ = /\u2060/g;

const TARGETS = [
  "index.html",
  "about.html",
  "makers",
  "guides",
  "compare",
  "rankings",
  "products",
];

function listHtmlFiles(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  const st = fs.statSync(abs);
  if (st.isFile()) return abs.endsWith(".html") ? [abs] : [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".html") && !/template|test/i.test(f))
    .map((f) => path.join(abs, f));
}

function stripInMatch(html, re) {
  return html.replace(re, (full) => full.replace(WJ, ""));
}

function processFile(filePath) {
  let html = fs.readFileSync(filePath, "utf8");
  const before = html;
  html = stripInMatch(html, /<title>[\s\S]*?<\/title>/gi);
  html = stripInMatch(html, /<meta\s+[^>]*(?:name|property)=["'][^"']*["'][^>]*>/gi);
  html = stripInMatch(html, /<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/gi);
  html = stripInMatch(html, /<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/gi);
  if (html !== before) {
    fs.writeFileSync(filePath, html, "utf8");
    return true;
  }
  return false;
}

function main() {
  const files = TARGETS.flatMap(listHtmlFiles);
  let updated = 0;
  for (const file of files) {
    if (processFile(file)) updated += 1;
  }
  console.log(`✅ Stripped WORD JOINER from SEO spots in ${updated}/${files.length} HTML files`);
}

main();
