const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'apps/frontend/src'));
let fixedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Fix: button missing type
  // Match <button ...> but not type="..."
  content = content.replace(/<button(?![^>]*type=)([^>]*)>/g, '<button type="button"$1>');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    fixedCount++;
  }
}

console.log(`Fixed button types in ${fixedCount} files`);
