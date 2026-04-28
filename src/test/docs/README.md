# Documentation Testing

This directory contains validation tests for documentation files in the repository.

## Purpose

While documentation files (Markdown, etc.) are not traditional code, they are critical project assets that benefit from automated validation. These tests ensure:

- **Structural Integrity**: All required sections are present and properly formatted
- **Consistency**: Terminology, formatting, and styling are consistent throughout
- **Completeness**: Key information is not missing
- **Quality**: Tables, metrics, and data are properly formatted and coherent
- **Actionability**: Strategic documents contain specific, measurable targets

## Test Files

### `marketing-plan.test.ts`

Comprehensive validation suite for `docs/MARKETING-PLAN.md` that verifies:

- **Document Structure**: Title, metadata, required sections, header formatting
- **Content Completeness**: All major sections are present with appropriate content
- **Data Integrity**: Budget tables add up correctly, metrics are realistic
- **Strategic Elements**: Goals, personas, timelines, risks are properly defined
- **Document Quality**: Markdown formatting, table structure, consistent terminology
- **Actionability**: Specific targets, action items, tools, and examples are present

## Running Tests

Run all documentation tests:

```bash
npm test -- src/test/docs
```

Run a specific test file:

```bash
npm test -- src/test/docs/marketing-plan.test.ts
```

Run with coverage:

```bash
npm test -- src/test/docs --coverage
```

## Benefits

1. **Catches Errors Early**: Identifies missing sections or broken formatting before documents are shared
2. **Maintains Quality**: Ensures documentation meets quality standards over time
3. **Validates Updates**: When documents are updated, tests verify changes maintain integrity
4. **Documentation as Code**: Treats important documentation with the same rigor as code
5. **Team Alignment**: Tests codify expectations for document structure and content

## Adding New Documentation Tests

When adding new strategic documents (like design specs, product roadmaps, etc.):

1. Create a test file in this directory: `{document-name}.test.ts`
2. Use the marketing plan test as a template
3. Customize tests to validate the specific requirements of that document type
4. Update this README with information about the new test file

## Test Philosophy

These tests strike a balance between:
- **Structure validation** (ensuring documents are well-organized)
- **Content validation** (ensuring key information is present)
- **Quality checks** (ensuring professional formatting and consistency)

They are intentionally flexible to allow for content evolution while maintaining quality standards.
