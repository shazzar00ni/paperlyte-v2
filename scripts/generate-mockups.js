/**
 * Mockup Image Generation Script
 *
 * Generates optimized mockup images in modern formats (PNG, WebP, AVIF) from SVG sources.
 * - PNG: High-quality baseline format for universal compatibility
 * - WebP: Modern format with ~25-35% better compression than PNG
 * - AVIF: Next-gen format with ~40-50% better compression than PNG
 *
 * Usage: node scripts/generate-mockups.js
 *
 * Requires: npm install --save-dev sharp
 */

import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import { isPathSafe } from './path-utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const mockupsDir = join(projectRoot, 'public', 'mockups')

/**
 * Mockup configurations
 * Each entry defines the source SVG, output dimensions, and responsive width variants
 */
const mockups = [
  { source: 'notes-list.svg', width: 1100, height: 800, widths: [400, 800, 1100] },
  { source: 'note-detail.svg', width: 800, height: 600, widths: [400, 800] },
]

/**
 * Output formats with encoding settings
 */
const formats = [
  { ext: 'png', options: {} },
  { ext: 'webp', options: { quality: 85, effort: 6 } },
  { ext: 'avif', options: { quality: 75, effort: 6 } },
]

// Valid format extensions for validation
const VALID_FORMATS = ['png', 'webp', 'avif']

/**
 * Generate a mockup image from SVG source in the specified format
 * @param {string} sourceName - Source SVG filename
 * @param {number} width - Output width in pixels
 * @param {number} height - Output height in pixels
 * @param {string} format - Output format ('png', 'webp', or 'avif')
 * @param {object} options - Format-specific encoding options
 * @param {number|null} [outputWidth] - Width suffix for responsive variants (e.g. 400 → 'notes-list-400w.avif')
 */
async function generateMockup(sourceName, width, height, format, options, outputWidth = null) {
  try {
    // Validate sourceName BEFORE any string manipulation to prevent traversal
    if (!isPathSafe(mockupsDir, sourceName)) {
      throw new Error(`Invalid source path: ${sourceName}. Path traversal detected.`)
    }

    // Validate format parameter to prevent unexpected values
    if (!VALID_FORMATS.includes(format)) {
      throw new Error(`Invalid format: ${format}. Must be one of: ${VALID_FORMATS.join(', ')}`)
    }

    // Validate file extension
    if (!sourceName.toLowerCase().endsWith('.svg')) {
      throw new Error(`Invalid file type: ${sourceName}. Only SVG files are supported.`)
    }

    const baseName = sourceName.replace('.svg', '')
    const sourcePath = join(mockupsDir, sourceName)
    const widthSuffix = outputWidth !== null ? `-${outputWidth}w` : ''
    const outputName = `${baseName}${widthSuffix}.${format}`

    // Defense-in-depth: validate outputName even though it's derived from validated inputs
    if (!isPathSafe(mockupsDir, outputName)) {
      throw new Error(`Invalid output path: ${outputName}. Path traversal detected.`)
    }

    const outputPath = join(mockupsDir, outputName)

    // Verify source file exists
    if (!existsSync(sourcePath)) {
      throw new Error(`Source file not found: ${sourceName}`)
    }

    const image = sharp(sourcePath, { density: 300 }) // High DPI for crisp rasterization
      .resize(width, height, {
        fit: 'contain', // Preserve aspect ratio, add padding if needed
        background: { r: 255, g: 255, b: 255, alpha: 0 }, // Transparent background
      })

    // Apply format-specific encoding
    switch (format) {
      case 'png':
        await image.png(options).toFile(outputPath)
        break
      case 'webp':
        await image.webp(options).toFile(outputPath)
        break
      case 'avif':
        await image.avif(options).toFile(outputPath)
        break
      default:
        throw new Error(`Unsupported format: ${format}`)
    }

    console.log(`✅ Generated ${outputName} (${width}x${height})`)
  } catch (error) {
    // Safely handle any thrown value (may not be an Error object)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const baseName = sourceName.replace('.svg', '')
    const widthSuffix = outputWidth !== null ? `-${outputWidth}w` : ''
    const outputName = `${baseName}${widthSuffix}.${format}`
    console.error('❌ Failed to generate mockup:', outputName, errorMessage)

    // Always throw a normalized Error instance for consistent error handling
    throw new Error(`Failed to generate ${outputName}: ${errorMessage}`)
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🎨 Paperlyte Mockup Generator\n')

  // Check if mockups directory exists
  if (!existsSync(mockupsDir)) {
    console.error(`❌ Mockups directory not found: ${mockupsDir}`)
    console.error('Please ensure public/mockups/ exists')
    process.exit(1)
  }

  console.log(`📂 Source: ${mockupsDir}`)
  console.log(`📂 Output: ${mockupsDir}\n`)

  // Generate all mockup images
  try {
    const generatedFiles = []
    const failedGenerations = []

    for (const mockup of mockups) {
      const { source, width, height, widths } = mockup

      // Verify source SVG exists
      const sourcePath = join(mockupsDir, source)
      if (!existsSync(sourcePath)) {
        console.warn(`⚠️  Skipping ${source} (file not found)`)
        continue
      }

      console.log(`Processing ${source}...`)

      // Generate all formats for each responsive width variant
      for (const variantWidth of widths) {
        // Scale height proportionally for non-full-size variants
        const scale = variantWidth / width
        const variantHeight = Math.round(height * scale)
        // Use null suffix for the largest (original) size, width suffix for smaller variants
        const outputWidth = variantWidth === width ? null : variantWidth

        for (const { ext, options } of formats) {
          try {
            await generateMockup(source, variantWidth, variantHeight, ext, options, outputWidth)
            const baseName = source.replace('.svg', '')
            const widthSuffix = outputWidth !== null ? `-${outputWidth}w` : ''
            generatedFiles.push(`${baseName}${widthSuffix}.${ext}`)
          } catch (error) {
            // Log error but continue to next format
            const errorMessage = error instanceof Error ? error.message : String(error)
            console.error(`❌ Failed to generate ${source} (${variantWidth}w) -> .${ext}: ${errorMessage}`)
            failedGenerations.push({ source, format: ext, error: errorMessage })
          }
        }
      }

      console.log('') // Empty line between mockups
    }

    if (generatedFiles.length === 0) {
      console.warn('⚠️  No mockup files were generated')
      console.warn('Please ensure SVG source files exist in public/mockups/')
      process.exit(1)
    }

    // Report results
    if (failedGenerations.length === 0) {
      console.log('✨ All mockups generated successfully!')
    } else {
      console.log('⚠️  Mockup generation completed with some failures\n')
      console.log('Failed generations:')
      failedGenerations.forEach(({ source, format, error }) => {
        console.log(`  ❌ ${source} -> .${format}: ${error}`)
      })
      console.log('')
    }

    console.log('Generated files:')
    generatedFiles.forEach((file) => {
      console.log(`  - ${file}`)
    })

    // Check if critical formats failed
    // PNG is considered critical as it's the universal fallback
    const criticalFailures = failedGenerations.filter((f) => f.format === 'png')

    if (criticalFailures.length > 0) {
      console.error('\n❌ Critical format (PNG) generation failed!')
      console.error('PNG is required as the universal fallback format.')
      console.error('\nFailed PNG generations:')
      criticalFailures.forEach(({ source, error }) => {
        console.error(`  - ${source}: ${error}`)
      })
      process.exit(1)
    } else if (failedGenerations.length > 0) {
      console.log('\n⚠️  Note: Some modern formats failed, but PNG fallbacks are available.')
      console.log('The site will still work, but some browsers may not get optimized images.')
      // Exit successfully - graceful degradation
    }
  } catch (error) {
    console.error('\n❌ Mockup generation failed')
    process.exit(1)
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
