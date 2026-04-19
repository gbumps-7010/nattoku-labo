#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SKIP = new Set(["node_modules", ".git"]);
const EXT = /\.(html|xml|js|ps1|txt)$/i;
const FROM = "https://nattoku-labo.com";
const TO = "https://nattoku-labo.com";

function walk(dir, out) {
  let names;
  try {
    names = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) {
    return;
  }
  for (const e of names) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (EXT.test(e.name)) out.push(p);
  }
}

function main() {
  const files = [];
  walk(ROOT, files);
  let n = 0;
  for (const f of files) {
    let s;
    try {
      s = fs.readFileSync(f, "utf8");
    } catch (_) {
      continue;
    }
    if (!s.includes("www.nattoku-labo.com")) continue;
    fs.writeFileSync(f, s.split(FROM).join(TO), "utf8");
    console.log(path.relative(ROOT, f));
    n++;
  }
  console.log("updated", n, "files");
}

main();
