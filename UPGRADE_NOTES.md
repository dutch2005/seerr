# Seerr Dependency & React 19 / Node 24 Upgrade Guide

This PR aggressively modernizes the Seerr codebase and its core dependency tree to unlock full Node.js 24 compatibility, prevent memory exhaustion bugs during the Next.js build step, and migrate onto the latest major frameworks.

## What Was Upgraded?

1. **Node.js**: The PNPM strictly-enforced `engine` parameter was updated to explicitly allow `>=24.0.0`.
2. **React 19 & Next.js 16**: Upgraded the frontend completely from React 18 / Next.js 14. This includes configuring the much-faster Next.js `Turbopack` engine in `next.config.js`.
3. **Tailwind CSS v4**: Removed the legacy `tailwind.config.js` and migrated to the unified CSS-variable architecture with the `@tailwindcss/postcss` setup in `postcss.config.js`.
4. **Express v5**: Replaced wildcard catch-alls (e.g. `/*`) that were fundamentally broken in `path-to-regexp v8` (used by Express v5) with their correct regex implementations (`/(.*)` or `/*path`).
5. **Typescript & Yup**: Aggressively typed over breaking validation updates inside Yup 1.7 schemas, and handled React 19 `JSX` namespace typing changes across hundreds of files using an automated script patch.
6. **ESLint 8.57**: Retained ESLint v8 but upgraded all the nested Next.js and React plugins due to severe flat-config incompatibilities present in ESLint 10 for current React component ecosystems.

## Why Was This Upgraded?

The codebase was experiencing out-of-memory fatal crashes (`JavaScript heap out of memory`) when building with Node 24. While increasing `NODE_OPTIONS=--max-old-space-size=4096` prevents the crash, Node 22 reaches EOL earlier than Node 24. Furthermore, sticking with legacy React 18, Tailwind 3, and Express 4 leaves the codebase highly susceptible to future security vulnerabilities and developer friction. This PR ensures the application is extremely robust and future-proofed for the coming years.

## Testing Performed

All Cypress end-to-end tests successfully execute against the running production build of Seerr. Manual verifications were performed to ensure settings migrations, database spinups, server paths, and the new Tailwind v4 styling properly serve.
