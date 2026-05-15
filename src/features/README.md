# Feature Module Convention

## Rule

Each feature module under `src/features/<name>/` MUST expose its public API through a single `index.ts` facade.

## Allowed imports

```ts
// OK — public facade
import { LibraryScreen, useUserLibrary } from '@/features/library';

// BLOCKED by ESLint — internal path
import { useUserLibrary } from '@/features/library/hooks/useLibrary';
```

## Same-feature internal references

Within a feature module, prefer **relative paths** for sibling files:

```ts
// OK — inside src/features/reader/components/Reader.tsx
import { useReadingProgress } from '../hooks/useReadingProgress';

// AVOID — alias path back into own feature
import { useReadingProgress } from '@/features/reader/hooks/useReadingProgress';
```

## Subdirectory conventions

| Directory    | Purpose                          | Goes in `index.ts`?                        |
| ------------ | -------------------------------- | ------------------------------------------ |
| `components/`| React components                 | Public screens + reusable components only  |
| `hooks/`     | Custom hooks                     | Public hooks consumed by other features    |
| `stores/`    | Zustand stores                   | Stores consumed by other features          |
| `services/`  | API clients, native bridges      | Public service functions only              |
| `types/`     | Domain types                     | Public types only                          |
| `theme/`     | Feature-specific theme tokens    | Public tokens                              |

Internal helpers (private components, hooks, utilities) should NOT be re-exported.

## index.ts shape

Two acceptable styles. Don't mix within one feature.

**Explicit (recommended for small/mid features):**

```ts
export { LibraryScreen } from './components/LibraryScreen';
export { useUserLibrary, useAddToLibrary } from './hooks/useLibrary';
export type { LibraryItem } from './types';
```

**Wildcard (only when subdir already has its own index.ts):**

```ts
export * from './components';   // requires components/index.ts
export * from './hooks';        // requires hooks/index.ts
```

## Adding a new feature

1. Create `src/features/<name>/` with the directories you need (no need to make all 5).
2. Create `src/features/<name>/index.ts` from day one.
3. ESLint will block any consumer that tries to import internal paths.

## Adding an export to an existing feature

Add the named export to `src/features/<name>/index.ts`. Don't ask consumers to import internals.
