'use strict';

// Mirrors sanitizeInput from src/utils/validation.ts for fuzz testing.
// Keeping this as plain JS avoids a TS compilation step in the fuzz runner.
const DANGEROUS_PROTOCOLS = /(javascript|data|vbscript|file|about)\s*:\/*/gi;
const EVENT_HANDLERS = /\bon\w+\s*=/gi;

function sanitizeInput(input) {
  if (!input) return '';

  let sanitized = input.trim();
  sanitized = sanitized.replace(/[<>]/g, '');

  const MAX_ITERATIONS = 10;
  let prev = '';
  let i = 0;
  while (sanitized !== prev && i < MAX_ITERATIONS) {
    prev = sanitized;
    sanitized = sanitized.replace(DANGEROUS_PROTOCOLS, '');
    i++;
  }

  prev = '';
  i = 0;
  while (sanitized !== prev && i < MAX_ITERATIONS) {
    prev = sanitized;
    sanitized = sanitized.replace(EVENT_HANDLERS, '');
    i++;
  }

  sanitized = sanitized.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
  return sanitized.trim().slice(0, 500);
}

module.exports.fuzz = function (data) {
  const input = data.toString('utf-8');
  sanitizeInput(input);
};
