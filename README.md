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
- `content/static`: symlink to `../quartz/static` so Obsidian can preview `/static/...` assets when the vault is opened at `content/`
- `quartz/`: Quartz framework source
- `quartz/static/images/`: source images copied into the generated site as `/static/images/...`
- `.codex/skills/`: repository-local authoring skill for maintaining the content vault

## Obsidian Workflow

For smooth local writing and browsing in Obsidian, open:

- `/Users/yesun/OB/ThangkaVault/content`

Do not open the repository root in Obsidian unless you explicitly want to browse build and framework files. The root now contains Quartz config, package metadata, and generated-site tooling that are not part of the knowledge vault itself.

The `content/static` symlink exists only to improve local authoring:

- Markdown entries reference images as `/static/images/...` for Quartz
- Obsidian opened at `content/` can still preview those images through the symlink
- The published site still serves assets from `quartz/static/`

Recommended editor split:

- `Obsidian`: open `content/` for writing, linking, and reading notes
- `VS Code / Codex`: open the repository root for Quartz config, deployment, and bulk maintenance

## Cloudflare Pages

Create a Pages project connected to this repository and use:

- Production branch: `main`
- Framework preset: `None`
- Build command: `git fetch --unshallow && npx quartz build`
- Build output directory: `public`

If you do not need git-based timestamps, `npx quartz build` is enough. The `git fetch --unshallow &&` prefix follows Quartz's Cloudflare Pages guidance.

`baseUrl` is set to the production domain `thangka.visutry.com`. If the site domain changes later, update it in [quartz.config.ts](/Users/yesun/OB/ThangkaVault/quartz.config.ts:1) before the next deploy.

## Content Notes

- Main content lives in `content/`
- Folder index pages act as category landing pages
- Real image sources are tracked in [content/image-sources.md](/Users/yesun/OB/ThangkaVault/content/image-sources.md:1)
- Source images should live under `quartz/static/images/`, not `public/`
- Do not move images into `content/`; keep `content/` as the authoring vault and `quartz/static/` as the publishable asset layer
