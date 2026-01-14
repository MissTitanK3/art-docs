# Region Dispatch docs

This app uses [Nextra](https://nextra.site/) (app router) with the `nextra-theme-docs` theme to serve the Region Dispatch constitution, specs, and language guides. The doc structure mirrors the `region-dispatch-constitution` folder so each section stays discoverable.

## Run locally

```bash
pnpm dev --filter docs
# defaults to http://localhost:3001
```

## Editing content

- Markdown/MDX lives in `content/` and is grouped by domain (constitution, specs, compliance, language, versions).
- `_meta.json` files control ordering and labels in the sidebar (one per folder).
- `app/[[...mdxPath]]/page.tsx` renders MDX via `nextra/pages`; `theme.config.tsx` manages shared chrome (title template, footer, sidebar behavior).
