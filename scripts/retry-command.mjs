import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const separator = args.indexOf('--');

function option(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 ? Number(args[index + 1]) : fallback;
}

const attempts = option('--attempts', 1);
const delayMs = option('--delay-ms', 0);
const command = separator >= 0 ? args[separator + 1] : undefined;
const commandArgs = separator >= 0 ? args.slice(separator + 2) : [];

if (!command || !Number.isInteger(attempts) || attempts < 1 || !Number.isFinite(delayMs) || delayMs < 0) {
  console.error('Usage: node scripts/retry-command.mjs --attempts <count> --delay-ms <ms> -- <command> [args...]');
  process.exit(2);
}

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  console.log(`Attempt ${attempt}/${attempts}: ${command} ${commandArgs.join(' ')}`);
  const result = spawnSync(command, commandArgs, { stdio: 'inherit' });

  if (result.status === 0) process.exit(0);
  if (attempt === attempts) process.exit(result.status ?? 1);

  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
