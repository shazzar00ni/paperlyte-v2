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

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const publicDir = join(projectRoot, 'public')
const faviconSource = join(publicDir, 'favicon.svg')

/**
 * Icon sizes to generate
 * Each entry defines the output filename and dimensions
 */
const iconSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
]

/**
 * Generate a PNG icon from SVG source
 * @param {string} outputName - Output filename
 * @param {number} size - Icon size in pixels (width and height)
 */
async function generateIcon(outputName, size) {
  try {
    const outputPath = join(publicDir, outputName)

    await sharp(faviconSource, { density: 300 }) // High DPI for crisp rasterization
      .resize(size, size, {
        fit: 'cover', // Source SVG is square, avoid padding
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
      })
      .png()
      .toFile(outputPath)

    console.log(`✅ Generated ${outputName} (${size}x${size})`)
  } catch (error) {
    // Safely handle any thrown value (may not be an Error object)
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`❌ Failed to generate ${outputName}:`, errorMessage)

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

  // Generate all icon sizes
  try {
    // Generate PNG icons first
    for (const { name, size } of iconSizes) {
      await generateIcon(name, size)
    }

    // Generate favicon.ico from the PNG files
    await generateFaviconIco()

    console.log('\n✨ All icons generated successfully!')
    console.log('\nGenerated files:')
    iconSizes.forEach(({ name }) => {
      console.log(`  - ${name}`)
    })
    console.log(`  - favicon.ico`)
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
