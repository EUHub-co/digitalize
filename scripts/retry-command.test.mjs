import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const retryScript = join(scriptsDir, 'retry-command.mjs');

test('retries a command until a later attempt succeeds', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'retry-command-'));
  const counterFile = join(tempDir, 'attempts.txt');
  const targetFile = join(tempDir, 'flaky-target.mjs');

  writeFileSync(targetFile, `
    import { existsSync, readFileSync, writeFileSync } from 'node:fs';
    const counter = process.argv[2];
    const attempts = existsSync(counter) ? Number(readFileSync(counter, 'utf8')) + 1 : 1;
    writeFileSync(counter, String(attempts));
    process.exit(attempts >= 3 ? 0 : 1);
  `);

  const result = spawnSync(process.execPath, [
    retryScript,
    '--attempts', '3',
    '--delay-ms', '1',
    '--',
    process.execPath, targetFile, counterFile,
  ], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(counterFile, 'utf8'), '3');
});

test('returns the final failure when every attempt fails', () => {
  const result = spawnSync(process.execPath, [
    retryScript,
    '--attempts', '2',
    '--delay-ms', '1',
    '--',
    process.execPath, '-e', 'process.exit(7)',
  ], { encoding: 'utf8' });

  assert.equal(result.status, 7);
});
