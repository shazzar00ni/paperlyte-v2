import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'

/**
 * JSDOM querySelectorAll Ordering Bug - Minimal Reproduction
 *
 * Purpose: Documents and reproduces a bug in JSDOM 27.3.0 (@asamuzakjp/dom-selector 6.7.6)
 * where adding "details > summary" to a long compound selector causes querySelectorAll
 * to return elements in wrong order, violating W3C spec (must be in document order).
 *
 * This bug affects the keyboard navigation utilities in src/utils/keyboard.ts,
 * requiring a workaround that sorts results by compareDocumentPosition.
 *
 * Key findings:
 * 1. The bug occurs even when NO <details> or <summary> elements exist in the DOM
 * 2. Simple selectors work correctly
 * 3. The bug only manifests when "details > summary" is added to a long compound selector
 * 4. The bug is specific to the @asamuzakjp/dom-selector library used in JSDOM 27.x
 *
 * Issue tracker: https://github.com/asamuzaK/domSelector/issues
 * (No bug report filed yet as of 2026-01-09)
 */
describe('JSDOM querySelectorAll ordering bug', () => {
  it('should return elements in document order with simple selector', () => {
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#download">Download</a></li>
            <li><button type="button">Get Started</button></li>
          </ul>
        </body>
      </html>
    `)

    const ul = dom.window.document.querySelector('ul')!

    // Simple selector - should work correctly
    const simpleSelector = ul.querySelectorAll('button, [href]')
    expect(simpleSelector.length).toBe(3)
    expect(simpleSelector[0].textContent).toBe('Features')
    expect(simpleSelector[1].textContent).toBe('Download')
    expect(simpleSelector[2].textContent).toBe('Get Started')
  })

  it('should return elements in document order even with "details > summary" in selector', () => {
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#download">Download</a></li>
            <li><button type="button">Get Started</button></li>
          </ul>
        </body>
      </html>
    `)

    const ul = dom.window.document.querySelector('ul')!

    // Compound selector with "details > summary" - FAILS in JSDOM
    // Note: No <details> or <summary> elements exist in the DOM!
    const compoundSelector = ul.querySelectorAll('button, [href], details > summary')

    expect(compoundSelector.length).toBe(3)

    // Expected order (document order): Features, Download, Get Started
    // Actual order in JSDOM: Get Started, Features, Download
    console.log('Actual order:', Array.from(compoundSelector).map(el => el.textContent))

    // This test WILL FAIL in JSDOM, proving the bug exists
    expect(compoundSelector[0].textContent).toBe('Features')
    expect(compoundSelector[1].textContent).toBe('Download')
    expect(compoundSelector[2].textContent).toBe('Get Started')
  })

  it('should handle valid <details> structure correctly', () => {
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <ul>
            <li><a href="#features">Features</a></li>
            <li>
              <details>
                <summary>More Info</summary>
                <p>Details content</p>
              </details>
            </li>
            <li><button type="button">Get Started</button></li>
          </ul>
        </body>
      </html>
    `)

    const ul = dom.window.document.querySelector('ul')!

    // This selector should match: a, summary, button (in that order)
    const elements = ul.querySelectorAll('button, [href], details > summary')

    expect(elements.length).toBe(3)

    // Expected document order: Features, More Info, Get Started
    console.log('Order with valid <details>:', Array.from(elements).map(el => el.textContent?.trim()))

    // This may also fail depending on JSDOM version
    expect(elements[0].textContent).toBe('Features')
    expect(elements[1].textContent).toBe('More Info')
    expect(elements[2].textContent).toBe('Get Started')
  })

  it('should narrow down which part of FOCUSABLE_SELECTOR causes the bug', () => {
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#download">Download</a></li>
            <li><button type="button">Get Started</button></li>
          </ul>
        </body>
      </html>
    `)

    const ul = dom.window.document.querySelector('ul')!

    // Test progressively more complex selectors
    const s1 = 'button:not([disabled]), [href]'
    const s2 = 'button:not([disabled]), [href], input:not([disabled])'
    const s3 = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
    const s4 = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const s5 = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]:not([contenteditable="false"])'
    const s6 = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]:not([contenteditable="false"]), audio[controls]'
    const s7 = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]:not([contenteditable="false"]), audio[controls], video[controls]'
    const s8 = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]:not([contenteditable="false"]), audio[controls], video[controls], details > summary'

    const tests = [
      { name: 's1 (button, [href])', selector: s1 },
      { name: 's2 (+ input)', selector: s2 },
      { name: 's3 (+ select, textarea)', selector: s3 },
      { name: 's4 (+ [tabindex])', selector: s4 },
      { name: 's5 (+ [contenteditable])', selector: s5 },
      { name: 's6 (+ audio)', selector: s6 },
      { name: 's7 (+ video)', selector: s7 },
      { name: 's8 (+ details > summary) [FULL]', selector: s8 }
    ]

    console.log('\n=== Testing progressively complex selectors ===')
    for (const test of tests) {
      const elements = ul.querySelectorAll(test.selector)
      const order = Array.from(elements).map(el => el.textContent)
      const isCorrect = order[0] === 'Features' && order[1] === 'Download' && order[2] === 'Get Started'
      console.log(`${test.name}: [${order.join(', ')}] ${isCorrect ? '✓' : '✗ WRONG ORDER'}`)
    }
    console.log('==============================================\n')

    // Just verify the test runs
    expect(true).toBe(true)
  })

  it('should match the FOCUSABLE_SELECTOR behavior exactly', () => {
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#download">Download</a></li>
            <li><button type="button">Get Started</button></li>
          </ul>
        </body>
      </html>
    `)

    const ul = dom.window.document.querySelector('ul')!

    // This is the actual FOCUSABLE_SELECTOR from keyboard.ts
    const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]:not([contenteditable="false"]), audio[controls], video[controls], details > summary'

    const elements = ul.querySelectorAll(FOCUSABLE_SELECTOR)

    expect(elements.length).toBe(3)

    console.log('FOCUSABLE_SELECTOR order:', Array.from(elements).map(el => el.textContent))

    // Document order should be: Features, Download, Get Started
    // But JSDOM returns: Get Started, Features, Download
    expect(elements[0].textContent).toBe('Features')
    expect(elements[1].textContent).toBe('Download')
    expect(elements[2].textContent).toBe('Get Started')
  })
})
