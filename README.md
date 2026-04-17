# ThangkaVault

ThangkaVault is a content-first Thangka knowledge site built from an Obsidian-style Markdown vault and published with Quartz.

## Stack

- Content authoring: `Obsidian` + `Markdown`
- Site generator: `Quartz v4`
- Hosting target: `Cloudflare Pages`
- Source control: `GitHub`

## Local Development

Requirements:

- `Node >= 22`
- `npm >= 10.9.2`

Install dependencies:

```bash
npm install
```

Run local preview:

```bash
npm run dev
```

Build static output:

```bash
npm run build
```

Quartz writes the generated site to `public/`.

## Repository Structure

- `content/`: Markdown content source
- `quartz/`: Quartz framework source
- `quartz/static/images/`: source images copied into the generated site as `/static/images/...`
- `.codex/skills/`: repository-local authoring skill for maintaining the content vault

## Cloudflare Pages

Create a Pages project connected to this repository and use:

- Production branch: `main`
- Framework preset: `None`
- Build command: `git fetch --unshallow && npx quartz build`
- Build output directory: `public`

If you do not need git-based timestamps, `npx quartz build` is enough. The `git fetch --unshallow &&` prefix follows Quartz's Cloudflare Pages guidance.

Before production launch, update `baseUrl` in [quartz.config.ts](/Users/yesun/OB/ThangkaVault/quartz.config.ts:1) to your actual `*.pages.dev` or custom domain.

## Content Notes

- Main content lives in `content/`
- Folder index pages act as category landing pages
- Real image sources are tracked in [content/image-sources.md](/Users/yesun/OB/ThangkaVault/content/image-sources.md:1)
- Source images should live under `quartz/static/images/`, not `public/`
