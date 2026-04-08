import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WATCH_INTERVAL = 5 * 60 * 1000;
const SCRIPT = path.join(__dirname, 'auto-push.sh');

function runPush() {
  exec(`bash "${SCRIPT}"`, (err, stdout, stderr) => {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    if (err && err.code !== 0) {
      console.error(`[${new Date().toLocaleTimeString()}] Hitilafu:`, err.message);
    }
  });
}

console.log(`[${new Date().toLocaleTimeString()}] YALLY BET Auto-Push imeanza`);
console.log(`[${new Date().toLocaleTimeString()}] Itapush kila dakika 5 kama kuna mabadiliko`);

runPush();
setInterval(runPush, WATCH_INTERVAL);
