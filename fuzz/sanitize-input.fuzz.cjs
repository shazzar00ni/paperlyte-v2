'use strict';

// Requires the real sanitizeInput compiled from src/utils/validation.ts.
// The fuzzing workflow runs esbuild to produce fuzz/validation.cjs before
// invoking this script, so any changes to the production sanitizer are
// automatically covered by the fuzz run.
const { sanitizeInput } = require('./validation.cjs');

// Corpus of known-dangerous seed inputs.
const SEEDS = [
  '<script>alert("xss")</script>',
  'javascript:alert(1)',
  'data:text/html,<h1>test</h1>',
  'vbscript:msgbox("xss")',
  'onerror=alert(1)',
  'onclick=alert(1)',
  '<img src=x onerror=alert(1)>',
  '<<script>alert("xss");//<</script>',
  'jAvAsCrIpT:alert(1)',
  'java\tscript:alert(1)',
  '&lt;script&gt;alert(1)&lt;/script&gt;',
  '\x00\x01\x02\x03',
  'a'.repeat(600),
  '',
  '   ',
  '\n\t\r',
];

function mutate(input) {
  const { randomBytes } = require('crypto');
  const buf = Buffer.from(input, 'utf-8');
  if (buf.length === 0) return randomBytes(1).toString('latin1');

  const r = randomBytes(3);
  const op = r[0] % 4;
  const pos = Math.floor((r[1] / 256) * buf.length);

  switch (op) {
    case 0: { // flip a byte
      const copy = Buffer.from(buf);
      copy[pos] = r[2];
      return copy.toString('utf-8');
    }
    case 1: // insert a byte
      return buf.slice(0, pos).toString('utf-8') +
             String.fromCharCode(r[2]) +
             buf.slice(pos).toString('utf-8');
    case 2: // delete a byte
      return buf.length > 1
        ? buf.slice(0, pos).toString('utf-8') + buf.slice(pos + 1).toString('utf-8')
        : buf.toString('utf-8');
    case 3: // duplicate a trailing section
      return buf.slice(0, pos).toString('utf-8') +
             buf.slice(pos).toString('utf-8') +
             buf.slice(pos).toString('utf-8');
    default:
      return buf.toString('utf-8');
  }
}

function runFuzzer(iterations) {
  for (let i = 0; i < iterations; i++) {
    const seed = SEEDS[i % SEEDS.length];
    const input = i < SEEDS.length ? seed : mutate(seed);

    let result;
    try {
      result = sanitizeInput(input);
    } catch (e) {
      process.stderr.write(
        `CRASH: sanitizeInput threw for input ${JSON.stringify(input)}: ${e.message}\n`
      );
      process.exit(1);
    }

    if (typeof result !== 'string') {
      process.stderr.write(
        `CRASH: sanitizeInput returned non-string for input ${JSON.stringify(input)}\n`
      );
      process.exit(1);
    }
    if (result.length > 500) {
      process.stderr.write('CRASH: sanitizeInput returned string longer than 500 chars\n');
      process.exit(1);
    }
  }

  const iter = iterations.toLocaleString();
  process.stdout.write(`Fuzz run complete: ${iter} iterations, no crashes.\n`);
}

const ITERATIONS = Number.parseInt(process.env.FUZZ_ITERATIONS || '50000', 10);
if (!Number.isInteger(ITERATIONS) || ITERATIONS <= 0) {
  process.stderr.write(
    `Invalid FUZZ_ITERATIONS "${process.env.FUZZ_ITERATIONS}": must be a positive integer.\n`
  );
  process.exit(1);
}
runFuzzer(ITERATIONS);
