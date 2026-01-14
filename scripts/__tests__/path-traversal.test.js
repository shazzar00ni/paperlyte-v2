/**
 * Test script to verify path traversal protection in icon generation scripts
 * This test ensures that malicious path inputs are properly blocked
 */

import { isPathSafe } from '../path-utils.js'

// Test cases
const tests = [
  // Valid paths that should be allowed
  { baseDir: '/tmp/test', filePath: 'favicon.png', expected: true, description: 'Simple filename' },
  { baseDir: '/tmp/test', filePath: 'subdir/favicon.png', expected: true, description: 'File in subdirectory' },
  { baseDir: '/tmp/test', filePath: 'icons/16x16/favicon.png', expected: true, description: 'File in nested subdirectory' },
  { baseDir: '/tmp/test', filePath: '.', expected: true, description: 'Current directory (edge case)' },
  
  // Malicious paths that should be blocked
  { baseDir: '/tmp/test', filePath: '../favicon.png', expected: false, description: 'Parent directory traversal' },
  { baseDir: '/tmp/test', filePath: '../../etc/passwd', expected: false, description: 'Multiple parent directory traversal' },
  { baseDir: '/tmp/test', filePath: '/etc/passwd', expected: false, description: 'Absolute path' },
  { baseDir: '/tmp/test', filePath: '../../../etc/passwd', expected: false, description: 'Deep traversal attempt' },
  { baseDir: '/tmp/test', filePath: 'subdir/../../etc/passwd', expected: false, description: 'Traversal with subdirectory prefix' },
  
  // Edge cases - invalid inputs
  { baseDir: '/tmp/test', filePath: '', expected: false, description: 'Empty string path' },
  { baseDir: '/tmp/test', filePath: '   ', expected: false, description: 'Whitespace-only path' },
  
  // Real-world cases
  { baseDir: '/app/public', filePath: 'favicon-16x16.png', expected: true, description: 'Real-world icon filename' },
  { baseDir: '/app/public', filePath: 'android-chrome-512x512.webp', expected: true, description: 'Real-world icon with format' },
]

// Run tests
console.log('🧪 Path Traversal Protection Tests\n')

let passed = 0
let failed = 0

for (const test of tests) {
  const result = isPathSafe(test.baseDir, test.filePath)
  const status = result === test.expected ? '✅ PASS' : '❌ FAIL'
  
  if (result === test.expected) {
    passed++
  } else {
    failed++
    console.log(`${status}: ${test.description}`)
    console.log(`  Base: ${test.baseDir}`)
    console.log(`  Path: ${test.filePath}`)
    console.log(`  Expected: ${test.expected}, Got: ${result}`)
    console.log('')
  }
}

console.log(`\n📊 Results: ${passed}/${tests.length} tests passed`)

if (failed > 0) {
  console.log(`❌ ${failed} test(s) failed`)
  process.exit(1)
} else {
  console.log('✨ All tests passed!')
}
