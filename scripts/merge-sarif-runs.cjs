/**
 * Merge SARIF runs to comply with GitHub Code Scanning limits
 *
 * ESLint 9's flat config generates multiple "runs" in SARIF output
 * (one per config object). GitHub Code Scanning has a limit of 20
 * runs per SARIF file. This script merges all runs into a single run.
 *
 * Usage: node scripts/merge-sarif-runs.cjs <sarif-file>
 */
const fs = require('fs')

const sarifPath = process.argv[2] || 'eslint-results.sarif'

if (!fs.existsSync(sarifPath)) {
  console.error(`SARIF file not found: ${sarifPath}`)
  process.exit(1)
}

let sarif
try {
  sarif = JSON.parse(fs.readFileSync(sarifPath, 'utf8'))
} catch (error) {
  console.error(`Failed to parse SARIF file: ${sarifPath}`)
  console.error(`Error: ${error.message}`)
  process.exit(1)
}

// Ensure runs is an array to avoid TypeError
if (!Array.isArray(sarif.runs)) {
  sarif.runs = []
}

if (sarif.runs.length > 1) {
  // Merge all runs into the first run
  const mergedRun = sarif.runs[0]

  // Ensure mergedRun.results is initialized as an array
  if (!Array.isArray(mergedRun.results)) {
    mergedRun.results = []
  }

  // Collect all results from all runs
  const allResults = []
  for (const run of sarif.runs) {
    if (Array.isArray(run.results)) {
      allResults.push(...run.results)
    }
  }

  // Build a deterministic key for a single location
  function getLocationKey(location) {
    if (!location || typeof location !== 'object') return ''

    const physicalLocation = location.physicalLocation || {}
    const artifactLocation = physicalLocation.artifactLocation || {}
    const region = physicalLocation.region || {}

    const uri = typeof artifactLocation.uri === 'string' ? artifactLocation.uri : ''
    const startLine = Number.isFinite(region.startLine) ? region.startLine : ''
    const startColumn = Number.isFinite(region.startColumn) ? region.startColumn : ''

    return `${uri}:${startLine}:${startColumn}`
  }

  // Build a deterministic key for a result, based on ruleId and locations
  function buildResultKey(result) {
    const ruleId = typeof result.ruleId === 'string' ? result.ruleId : ''
    const locations = Array.isArray(result.locations) ? result.locations : []
    const locationKeys = locations.map(getLocationKey).join('|')
    return `${ruleId}::${locationKeys}`
  }

  // Deduplicate results based on location and ruleId
  const seen = new Set()
  mergedRun.results = allResults.filter((result) => {
    const key = buildResultKey(result)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Keep only the merged run
  sarif.runs = [mergedRun]
}

fs.writeFileSync(sarifPath, JSON.stringify(sarif, null, 2))
console.log(`SARIF runs merged: now contains ${sarif.runs.length} run(s)`)
