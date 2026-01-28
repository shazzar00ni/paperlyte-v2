/**
 * Merge SARIF runs to comply with GitHub Code Scanning limits
 *
 * ESLint 9's flat config generates multiple "runs" in SARIF output
 * (one per config object). GitHub Code Scanning has a limit of 20
 * runs per SARIF file. This script merges all runs into a single run.
 *
 * Usage: node scripts/merge-sarif-runs.js <sarif-file>
 */
const fs = require('fs')

const sarifPath = process.argv[2] || 'eslint-results.sarif'

if (!fs.existsSync(sarifPath)) {
  console.error(`SARIF file not found: ${sarifPath}`)
  process.exit(1)
}

const sarif = JSON.parse(fs.readFileSync(sarifPath, 'utf8'))

if (sarif.runs && sarif.runs.length > 1) {
  // Merge all runs into the first run
  const mergedRun = sarif.runs[0]

  // Collect all results from all runs
  const allResults = []
  for (const run of sarif.runs) {
    if (run.results) {
      allResults.push(...run.results)
    }
  }

  // Deduplicate results based on location and ruleId
  const seen = new Set()
  mergedRun.results = allResults.filter((result) => {
    const key = JSON.stringify({
      ruleId: result.ruleId,
      locations: result.locations,
    })
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Keep only the merged run
  sarif.runs = [mergedRun]
}

fs.writeFileSync(sarifPath, JSON.stringify(sarif, null, 2))
console.log(`SARIF runs merged: now contains ${sarif.runs.length} run(s)`)
