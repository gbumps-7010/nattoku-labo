/**
 * One-off / repeatable: add viewport-fit=cover for safe-area on notched phones.
 */
const fs = require("fs");
const path = require("path");

const OLD = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
const NEU =
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">';

function patchFile(fp) {
  let s = fs.readFileSync(fp, "utf8");
  if (!s.includes(OLD) || s.includes("viewport-fit=cover")) return false;
  fs.writeFileSync(fp, s.split(OLD).join(NEU), "utf8");
  return true;
}

function patchDir(dir) {
  let n = 0;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".html")) continue;
    const fp = path.join(dir, name);
    if (!fs.statSync(fp).isFile()) continue;
    if (patchFile(fp)) {
      n++;
      console.log(path.relative(process.cwd(), fp));
    }
  }
  return n;
}

const root = path.join(__dirname, "..");
process.chdir(root);
let total = patchDir(path.join(root, "products"));
for (const f of ["about.html", "privacy.html"]) {
  const fp = path.join(root, f);
  if (fs.existsSync(fp) && patchFile(fp)) {
    total++;
    console.log(f);
  }
}
console.log("patched:", total);
