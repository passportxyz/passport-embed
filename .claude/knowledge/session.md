### [22:32] [gotcha] Webpack chunk splitting causes SSR errors in Next.js

**Details**: When building a library with webpack, default optimization settings can cause code splitting which creates separate chunk files (e.g., 721.index.js). These chunks use webpack runtime globals like `webpackChunk_human_tech_passport_embed` that don't exist in Next.js SSR context, causing "Cannot read properties of undefined" errors during build. Solution: Disable splitChunks in webpack.config.js optimization section for library builds.
**Files**: webpack.config.js

---
