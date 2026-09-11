const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const hosts = JSON.parse(fs.readFileSync(path.join(__dirname, "shop-hosts.json"), "utf8"));
const manifestPath = path.join(root, "extension", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const matches = [];
for (const host of hosts) {
  matches.push(`*://${host}/*`);
  matches.push(`*://*.${host}/*`);
}

manifest.host_permissions = matches;
manifest.optional_host_permissions = ["http://*/*", "https://*/*"];
manifest.content_scripts[0].matches = matches;
delete manifest.content_scripts[0].exclude_matches;
manifest.homepage_url = "https://thensanity.github.io/wehaveit/";
if (Array.isArray(manifest.web_accessible_resources) && manifest.web_accessible_resources.length === 0) {
  delete manifest.web_accessible_resources;
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Wrote ${matches.length} host match patterns`);
