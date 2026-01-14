/**
 * Icon Generation Script
 *
 * Generates PNG icons and favicon.ico from the SVG favicon source file.
 * - PNG icons: Using the sharp image processing library
 * - ICO file: Multi-resolution favicon.ico for legacy browser support
 *
 * Usage: node scripts/generate-icons.js
 *
 * Requires: npm install --save-dev sharp png-to-ico
 */

import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, writeFileSync } from 'fs'
import { isFilenameSafe } from './utils/filenameValidation.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const publicDir = join(projectRoot, 'public')
const faviconSource = join(publicDir, 'favicon.svg')

/**
 * Icon sizes to generate
 * Each entry defines the base filename (without extension), dimensions, and formats
 * Small icons (16x16, 32x32) and apple-touch-icon stay PNG-only for compatibility
 * Large icons (192x192, 512x512) get modern formats (WebP, AVIF) for better compression
 */
const iconSizes = [
  { name: 'favicon-16x16', size: 16, formats: ['png'] },
  { name: 'favicon-32x32', size: 32, formats: ['png'] },
  { name: 'apple-touch-icon', size: 180, formats: ['png'] },
  { name: 'android-chrome-192x192', size: 192, formats: ['png', 'webp', 'avif'] },
  { name: 'android-chrome-512x512', size: 512, formats: ['png', 'webp', 'avif'] },
]

/**
 * Generate an icon from SVG source in the specified format
 * @param {string} baseName - Base filename (without extension)
 * @param {number} size - Icon size in pixels (width and height)
 * @param {string} format - Output format ('png', 'webp', or 'avif')
 */
async function generateIcon(baseName, size, format) {
  try {
    // Validate inputs
    if (!isFilenameSafe(baseName) || !isFilenameSafe(format)) {
      throw new Error(`Invalid filename or format: ${baseName}.${format}`)
    }

    const outputName = `${baseName}.${format}`
    const outputPath = join(publicDir, outputName)

    const image = sharp(faviconSource, { density: 300 }) // High DPI for crisp rasterization
      .resize(size, size, {
        fit: 'cover', // Source SVG is square, avoid padding
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
      })

    // Apply format-specific encoding
    if (format === 'png') {
      await image.png().toFile(outputPath)
    } else if (format === 'webp') {
      await image.webp({ quality: 85, effort: 6 }).toFile(outputPath)
    } else if (format === 'avif') {
      await image.avif({ quality: 75, effort: 6 }).toFile(outputPath)
    } else {
      throw new Error(`Unsupported format: ${format}`)
    }

    console.log(`✅ Generated ${outputName} (${size}x${size})`)
  } catch (error) {
    // Safely handle any thrown value (may not be an Error object)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const outputName = `${baseName}.${format}`
    console.error('❌ Failed to generate icon:', outputName, errorMessage)

    // Always throw a normalized Error instance for consistent error handling
    throw new Error(`Failed to generate ${outputName}: ${errorMessage}`)
  }
}

/**
 * Generate favicon.ico from PNG sources
 * Creates a multi-resolution ICO file for legacy browser support
 */
async function generateFaviconIco() {
  try {
    const favicon16Path = join(publicDir, 'favicon-16x16.png')
    const favicon32Path = join(publicDir, 'favicon-32x32.png')
    const icoOutputPath = join(publicDir, 'favicon.ico')

    // Verify source PNG files exist
    if (!existsSync(favicon16Path) || !existsSync(favicon32Path)) {
      throw new Error('Required PNG files (16x16 and 32x32) not found')
    }

    // Generate ICO file with multiple resolutions
    const icoBuffer = await pngToIco([favicon16Path, favicon32Path])
    writeFileSync(icoOutputPath, icoBuffer)

    console.log(`✅ Generated favicon.ico (16x16, 32x32)`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`❌ Failed to generate favicon.ico:`, errorMessage)
    throw new Error(`Failed to generate favicon.ico: ${errorMessage}`)
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🎨 Paperlyte Icon Generator\n')

  // Check if source SVG exists
  if (!existsSync(faviconSource)) {
    console.error(`❌ Source SVG not found: ${faviconSource}`)
    console.error('Please ensure public/favicon.svg exists')
    process.exit(1)
  }

  console.log(`📂 Source: ${faviconSource}`)
  console.log(`📂 Output: ${publicDir}\n`)

  // Generate all icon sizes and formats
  try {
    const generatedFiles = []

    // Generate icons in all specified formats
    for (const { name, size, formats } of iconSizes) {
      for (const format of formats) {
        await generateIcon(name, size, format)
        generatedFiles.push(`${name}.${format}`)
      }
    }

    // Generate favicon.ico from the PNG files
    await generateFaviconIco()
    generatedFiles.push('favicon.ico')

    console.log('\n✨ All icons generated successfully!')
    console.log('\nGenerated files:')
    generatedFiles.forEach((file) => {
      console.log(`  - ${file}`)
    })
  } catch (error) {
    console.error('\n❌ Icon generation failed')
    process.exit(1)
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
