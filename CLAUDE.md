# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

EasyCLA Landing Page — a small Angular 15 single-page app that provides links to the Project Control Center (PCC) for CLA onboarding, the Corporate Console for managing CLA approval lists, and contributor documentation. Deployed to AWS via Serverless Framework (S3 + CloudFront + Lambda@Edge).

## Commands

```bash
yarn install                  # Install dependencies (requires Node >= 18)
yarn serve                    # Dev server on http://localhost:8100 (dev config)
yarn serve:staging:local      # Dev server with staging config
yarn serve:prod:local         # Dev server with prod config
yarn build                    # Build for dev (runs SSM prefetch, outputs to dist/landing-page)
yarn build:prod               # Build for prod
yarn test                     # Unit tests (Karma + ChromeHeadless, non-interactive)
yarn eslint                   # ESLint on src/**/*.ts
yarn eslint-fix               # ESLint with auto-fix
```

## Build Configuration

Builds require AWS SSM Parameter Store access. The `prebuild:dev` / `prebuild:prod` scripts run `prefetch-ssm.js` which fetches runtime config and writes it to `src/app/config/cla-env-config.json`. The `STAGE_ENV` environment variable controls which SSM parameters are fetched. Without AWS credentials, builds will fail at the prefetch step.

Environment-specific Angular configs are in `src/environments/` and swapped via `angular.json` file replacements. Three configurations exist: `dev`, `staging`, `production`.

## Architecture

- **Single NgModule** (`AppModule`) — no lazy loading, no feature modules
- **Hash-based routing** (`useHash: true`) — only two routes: `/` (HomeComponent) and `**` (PageNotFoundComponent)
- **Auth0 integration** — `AuthService` in `core/services/` manages authentication via Auth0 SPA SDK with BehaviorSubject state
- **LFX platform header/footer** — header script URL comes from `environment.lfxHeader` (Angular environment file); footer URL comes from `cla-env-config.json`. Both rendered as web components, managed by `LfxHeaderService`
- **Runtime config** — `cla-env-config.json` is pre-fetched from AWS SSM at build time; consumed via `EnvConfig` in `cla-env-utils.ts`
- **Components**: `home`, `cla-console-section` (reusable card with `@Input()` configuration), `cla-footer`, `lfx-header`, `page-not-found`
- **`LandingPageService`** in `src/app/service/` — fetches console card data; used by `ClaConsoleSectionComponent`
- **CUSTOM_ELEMENTS_SCHEMA** enabled in AppModule for the LFX web component header/footer

## Conventions

- **License headers required** on all source files: `// Copyright The Linux Foundation and each contributor to CommunityBridge.` + `// SPDX-License-Identifier: MIT`. Enforced by `check-headers.sh`.
- **Commit messages** follow Conventional Commits (commitlint via husky `commit-msg` hook).
- **DCO required** — every commit must have `Signed-off-by: Name <email>`. Always use `git commit --signoff`. If a PR has DCO failures, rebase and add `--signoff` to each commit, then force-push.
- **Angular 15 only** — do not introduce patterns from newer Angular versions (signals, standalone components, etc.).
- **SCSS** for all component styles; Bootstrap 5 utility classes preferred.
- **Deployment** uses Serverless Framework: `serverless-finch` for S3 upload, CloudFront distribution with Lambda@Edge for security headers. Region is always `us-east-1`.
