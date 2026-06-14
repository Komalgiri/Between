const fs = require('fs');
const path = require('path');

const nodeModules = path.join(__dirname, 'node_modules');

// Find all metro-* packages
const packages = fs.readdirSync(nodeModules).filter(d => d.startsWith('metro'));

let patched = 0;
packages.forEach(pkg => {
  const pkgJsonPath = path.join(nodeModules, pkg, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) return;

  const json = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  if (!json.exports) return;

  // Already patched
  if (json.exports['./src/*']) return;

  json.exports['./src/*'] = './src/*.js';
  fs.writeFileSync(pkgJsonPath, JSON.stringify(json, null, 2));
  console.log(`✅ Patched: ${pkg}`);
  patched++;
});

console.log(`\nDone! Patched ${patched} packages.`);
