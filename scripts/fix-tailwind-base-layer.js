const fs = require("node:fs");
const postcss = require("postcss");

const cssPath = process.argv[2];
if (!cssPath) {
  throw new Error("Pass the generated CSS file path.");
}

const root = postcss.parse(fs.readFileSync(cssPath, "utf8"), { from: cssPath });
const imageDefaults = [];

root.walkRules((rule) => {
  if (
    rule.parent.type === "root" &&
    ["img", 'img[loading="lazy"]'].includes(rule.selector)
  ) {
    imageDefaults.push(rule);
  }
});

if (imageDefaults.length !== 2) {
  throw new Error(`Expected 2 global image rules, found ${imageDefaults.length}.`);
}

const baseLayer = postcss.atRule({ name: "layer", params: "base" });
for (const rule of imageDefaults) {
  rule.remove();
  baseLayer.append(rule);
}
root.append(baseLayer);

fs.writeFileSync(cssPath, root.toString());
