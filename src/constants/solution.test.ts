/**
 * Solution Constants Tests
 *
 * Tests for SOLUTION_VALUE_PROPS constant to ensure data structure correctness
 * and validate value proposition content.
 */

import { describe, it, expect } from 'vitest'
import { SOLUTION_VALUE_PROPS, type ValueProp } from './solution'
import { LAUNCH_QUARTER } from './waitlist'

describe('Solution Constants', () => {
  describe('SOLUTION_VALUE_PROPS Structure', () => {
    it('should export SOLUTION_VALUE_PROPS as an array', () => {
      expect(Array.isArray(SOLUTION_VALUE_PROPS)).toBe(true)
    })

    it('should have exactly 3 value propositions', () => {
      expect(SOLUTION_VALUE_PROPS.length).toBe(3)
    })

    it('should have all required fields for each value proposition', () => {
      SOLUTION_VALUE_PROPS.forEach((prop, index) => {
        expect(prop, `Value prop at index ${index} should have an icon`).toHaveProperty('icon')
        expect(prop, `Value prop at index ${index} should have an emoji`).toHaveProperty('emoji')
        expect(prop, `Value prop at index ${index} should have a headline`).toHaveProperty(
          'headline'
        )
        expect(prop, `Value prop at index ${index} should have a title`).toHaveProperty('title')
        expect(prop, `Value prop at index ${index} should have a body`).toHaveProperty('body')
        expect(prop, `Value prop at index ${index} should have a proof`).toHaveProperty('proof')
      })
    })

    it('should have unique headlines for all value propositions', () => {
      const headlines = SOLUTION_VALUE_PROPS.map((p) => p.headline)
      expect(headlines.length).toBe(new Set(headlines).size)
    })

    it('should have proper TypeScript types', () => {
      const prop: ValueProp = SOLUTION_VALUE_PROPS[0]
      expect(typeof prop.icon).toBe('string')
      expect(typeof prop.emoji).toBe('string')
      expect(typeof prop.headline).toBe('string')
      expect(typeof prop.title).toBe('string')
      expect(Array.isArray(prop.body)).toBe(true)
      expect(typeof prop.proof).toBe('string')
    })
  })

  describe('Value Proposition Content Validation', () => {
    it('should have valid Font Awesome icon format', () => {
      SOLUTION_VALUE_PROPS.forEach((prop) => {
        expect(prop.icon, `Icon for "${prop.headline}" should start with fa-`).toMatch(/^fa-/)
      })
    })

    it('should have non-empty body paragraphs', () => {
      SOLUTION_VALUE_PROPS.forEach((prop) => {
        expect(prop.body.length, `Body for "${prop.headline}" should not be empty`).toBeGreaterThan(
          0
        )
        prop.body.forEach((paragraph) => {
          expect(paragraph.length).toBeGreaterThan(0)
        })
      })
    })

    it('should interpolate LAUNCH_QUARTER in the cross-platform value proposition', () => {
      const crossPlatform = SOLUTION_VALUE_PROPS.find((p) => p.headline === 'Works Everywhere, Always')
      expect(crossPlatform).toBeDefined()
      expect(crossPlatform?.proof).toContain(LAUNCH_QUARTER)
      expect(crossPlatform?.body.some((p) => p.includes(LAUNCH_QUARTER))).toBe(true)
    })
  })

  describe('Snapshot Tests', () => {
    it('should match SOLUTION_VALUE_PROPS snapshot', () => {
      expect(SOLUTION_VALUE_PROPS).toMatchSnapshot()
    })
  })
})
