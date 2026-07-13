const fs = require('fs');
const path = require('path');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixImports(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // regex to match: from './some-file' or from '../some-file'
      // replacing with from './some-file.js'
      const newContent = content.replace(/from\s+['"](\.\.?\/[^'"]+)['"]/g, (match, p1) => {
        if (!p1.endsWith('.js') && !p1.endsWith('.ts')) {
          return `from '${p1}.js'`;
        }
        return match;
      });

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Fixed', fullPath);
      }
    }
  }
}

fixImports(path.join(__dirname, 'apps/backend/src'));
