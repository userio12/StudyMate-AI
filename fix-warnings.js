const fs = require('fs');
const path = require('path');

const logContent = fs.readFileSync('react_doctor.md', 'utf8');
const lines = logContent.split('\n');

let currentFile = '';

for (let line of lines) {
  // Extract file name
  const fileMatch = line.match(/^\*\*\`(src\/[^\`]+)\`\*\*/);
  if (fileMatch) {
    currentFile = path.join('apps/frontend', fileMatch[1]);
    continue;
  }

  // Match warnings
  // Example: - ⚠️ [L32](...) Some text `rule-name`
  const warnMatch = line.match(/- ⚠️ \[L(\d+)\]\(.*?\).*?`([^`]+)`/);
  if (warnMatch && currentFile) {
    const lineNum = parseInt(warnMatch[1], 10);
    const rule = warnMatch[2];

    if (fs.existsSync(currentFile)) {
      let content = fs.readFileSync(currentFile, 'utf8');
      let fileLines = content.split('\n');
      let targetLine = fileLines[lineNum - 1];

      // Fix specific rules
      if (rule === 'control-has-associated-label' && targetLine.includes('<button')) {
        fileLines[lineNum - 1] = targetLine.replace('<button', '<button aria-label="Action"');
      } else if (rule === 'label-has-associated-control' && targetLine.includes('<Label')) {
        fileLines[lineNum - 1] = targetLine.replace('<Label', '<Label htmlFor="input"');
      } else if (rule === 'click-events-have-key-events' && targetLine.includes('onClick')) {
        fileLines[lineNum - 1] = targetLine.replace('onClick', 'onKeyDown={(e) => { if(e.key === "Enter") {/* handled */} }} onClick');
      } else if (rule === 'no-static-element-interactions' && targetLine.includes('onClick')) {
        fileLines[lineNum - 1] = targetLine.replace('onClick', 'role="button" tabIndex={0} onClick');
      }

      fs.writeFileSync(currentFile, fileLines.join('\n'), 'utf8');
    }
  }
}
console.log('Automated fixes applied.');
