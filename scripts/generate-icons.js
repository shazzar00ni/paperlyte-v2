/**
 * PNG Icon Generation Script
 *
 * Generates PNG icons from the SVG favicon source file
 * using the sharp image processing library.
 *
 * Usage: node scripts/generate-icons.js
 *
 * Requires: npm install --save-dev sharp
 */

import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

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

    await sharp(faviconSource)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
      })
      .png()
      .toFile(outputPath)

    console.log(`✅ Generated ${outputName} (${size}x${size})`)
  } catch (error) {
    console.error(`❌ Failed to generate ${outputName}:`, error.message)
    throw error
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
    for (const { name, size } of iconSizes) {
      await generateIcon(name, size)
    }

    console.log('\n✨ All icons generated successfully!')
    console.log('\nGenerated files:')
    iconSizes.forEach(({ name }) => {
      console.log(`  - ${name}`)
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
