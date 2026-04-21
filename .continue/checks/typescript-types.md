# TypeScript Strict Typing

This project uses TypeScript with `strict: true` plus `noUnusedLocals`, `noUnusedParameters`, and `noUncheckedSideEffectImports`. All code must pass the compiler without errors and without using bare type-checker suppressions; any `@ts-ignore` or `@ts-expect-error` must follow the policy below.

## Check

Review changed TypeScript and TSX files for these violations:

1. **Use of `any`**: Explicit `any` type annotations or assertions are banned. If a type is genuinely unknown at a boundary (e.g., error catch blocks, JSON parsing), use `unknown` and narrow it explicitly. Flag every `any` usage and suggest the correct typed alternative.

2. **Type assertions without justification**: `as SomeType` casts that are not accompanied by a comment explaining why the cast is safe. Casts that widen a type (e.g., `as any`, `as unknown as Foo`) are especially suspicious and almost always indicate a design problem.

3. **Missing type annotations on exported APIs**: All exported functions and React components must declare an explicit return type. All exported props interfaces must be explicitly declared rather than inferred from usage. Inline arrow functions used as callbacks are exempt if the type is fully inferred from context.

4. **Loose event handler types**: Event handlers typed as `(e: any) => void` instead of the correct React event type (e.g., `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`, `React.FormEvent<HTMLFormElement>`).

5. **`@ts-ignore` and `@ts-expect-error` without explanation**: These directives must include a comment on the same line explaining the specific compiler limitation being worked around and, if applicable, a link to the relevant issue. Bare suppressions are not acceptable.

6. **Optional chaining masking real type errors**: Excessive use of `?.` to silence type errors rather than correctly typing the value as potentially `undefined` or `null` and handling that case explicitly.

7. **Incorrect `Props` interface patterns**: Component props must be defined as an `interface` (not `type`) unless union or intersection types are needed. Prop names must be descriptive — avoid single-letter generics in component APIs.

8. **Unused imports or variables**: The compiler already catches these, but verify changed files do not introduce dead code that would fail `tsc --noEmit` or the `noUnusedLocals` check.

For each issue found, provide the corrected type signature or code change.
