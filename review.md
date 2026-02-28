Analyze this repository and generate a concise AI PR reviewer instruction file in Markdown.

The file should give a PR reviewer the essential context that won't be visible in a diff. Cover:

- **Purpose**: What this repo does in 1-2 sentences.
- **Architecture**: High-level structure, patterns used (e.g. MVC, event-driven, monorepo, etc.).
- **Folder structure**: Key directories and what lives in each. Skip obvious ones.
- **Stack**: Languages, frameworks, major libraries, and their roles.
- **Testing**: Framework used, where tests live, what's expected to be tested.
- **Code style & conventions**: Naming, file organization, formatting tools, any patterns enforced.
- **PR-specific rules**: Branch strategy, what a PR should/shouldn't include, migration rules, etc.
- **Common pitfalls**: Things reviewers should flag — anti-patterns, known gotchas, areas that break easily.
- **Out of scope**: Anything reviewers should explicitly ignore or not enforce.

Rules for the output:

- Output only the Markdown content, no preamble or explanation.
- Be concise. Every line should earn its place — no filler.
- Use short sections with bullet points. Avoid long prose.
- If something is not applicable or not inferable, omit the section entirely.
