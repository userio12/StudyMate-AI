import { spawn } from 'child_process';

const child = spawn('npx', ['drizzle-kit', 'generate'], {
  cwd: 'packages/db',
  shell: true,
  stdio: ['pipe', 'inherit', 'inherit']
});

let interval = setInterval(() => {
  if (child.stdin.writable) {
    child.stdin.write('\n');
  }
}, 500);

child.on('close', (code) => {
  clearInterval(interval);
  process.exit(code);
});
