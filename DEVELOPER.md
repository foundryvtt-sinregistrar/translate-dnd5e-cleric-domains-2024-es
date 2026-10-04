# Development and release guide

## Checks

Run from the repository root while the base module is installed beside this repository:

```sh
npm test
npm run test:release
npm run build:release
```

CI checks out base module tag `v0.0.2` into `.deps/dnd5e-2024-cleric-domains` and sets `CLERIC_DOMAINS_BASE_PATH` before running the translation tests.

## Release procedure

1. Move completed notes from `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD`.
2. Set the same version in `module.json` and its versioned `download` URL.
3. Commit and run all checks.
4. Create and push annotated tag `vX.Y.Z` from `main`.
5. Review the draft release created by GitHub Actions and publish it.

Never change Item, folder, activity, effect, advancement, UUID, module, or compendium IDs as part of a translation release.
