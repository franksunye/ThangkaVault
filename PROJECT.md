# ThangkaVault Project

Current phase: `1.0 POC`

## What This Project Is

ThangkaVault is a content-first Thangka site built to prove one thing:

- high-quality images + beginner-friendly explanations can become a real product, not just a document archive

## What We Are Doing Now

- maintaining the knowledge vault in `content/`
- publishing with `Quartz`
- deploying on `Cloudflare Pages`
- improving homepage, category pages, and reading flow
- expanding content slowly with sourced images and clear structure

## What We Are Not Doing Now

- user accounts
- comments or community features
- monetization
- complex recommendation systems
- large-scale content expansion without structure control

## Source Of Truth

- content: `content/`
- publishable images: `quartz/static/images/`
- site config and UI: repo root + `quartz/`
- local writing in Obsidian: open `content/`

## Architecture Direction

The project should keep a strict 3-layer split:

1. Content layer: pure Markdown knowledge notes under `content/`
2. Presentation layer: isolated CSS/JS and Quartz components under `quartz/`
3. Transformation layer: Quartz build pipeline that converts content into the site

This split matters because the repository is both:

- an Obsidian knowledge vault
- a publishable website

If page layout markup keeps leaking into Markdown, the vault stops being a clean content source and becomes tightly coupled to the current frontend.

## Layer Boundary Rules

### 1. Content Layer

Files under `content/` should default to content-first Markdown.

Allowed:

- frontmatter
- headings, paragraphs, lists, blockquotes, tables
- normal Obsidian links and image references
- minimal placeholders such as `图片URL` or `待补充`

Not allowed by default:

- page-layout HTML such as repeated `section`, `div`, and site-only wrapper classes
- CSS-oriented markup that exists only to support homepage or landing-page layout
- Quartz-specific presentational structure embedded into ordinary knowledge notes

### 2. Presentation Layer

Visual rhythm, card layout, homepage structure, category landing presentation, and interaction patterns belong in:

- `quartz/`
- site styles
- Quartz layout or component code

Markdown should provide content and light structure, not page chrome.

### 3. Transformation Layer

Quartz is the renderer and transformer, not the place where content truth lives.

Quartz should be able to:

- consume clean Markdown notes
- render homepage and category surfaces from structured content inputs
- evolve site presentation without forcing a rewrite of knowledge notes

## Page Types And Rules

### Pure Knowledge Notes

Examples:

- `content/佛像/*.md`
- `content/菩萨/*.md`
- `content/曼荼罗/*.md`
- `content/基础知识/*.md`

Rule:

- keep these as pure Markdown notes
- do not add site-layout wrappers
- optimize for Obsidian readability first

### Category Index Pages

Examples:

- `content/佛像/index.md`
- `content/菩萨/index.md`

Rule:

- may contain light structure and curated copy
- should still stay mostly Markdown-readable in Obsidian
- avoid complex repeated layout wrappers when the same effect can live in Quartz

Current target contract:

- small frontmatter only for page-level metadata such as title, description, eyebrow, and cover image
- readable Markdown body for the actual note content
- Quartz may consume specific Markdown sections such as curated reading lists or extension lists
- those consumed sections must remain human-readable in Obsidian even before rendering

### Homepage And Special Landing Pages

Examples:

- `content/index.md`
- future campaign or exhibition landing pages

Rule:

- these are the only pages that may temporarily carry limited presentational structure during the POC
- they should be treated as exceptions, not the model for the content system
- before scale-up, their layout should move into Quartz components or structured rendering

Exception policy:

- exception pages must be explicitly documented in this file
- do not silently create new presentation-heavy Markdown pages
- if a new special surface is needed, decide first whether it belongs in Quartz instead of `content/`

Current known exceptions:

- `content/index.md`

## Current Risk

The current homepage work proved product direction, but it also showed a boundary problem:

- homepage presentation has started to live inside Markdown
- this makes Obsidian notes less pure
- it increases coupling between the vault and the current frontend

This is acceptable as a short POC shortcut, but it should not become the default content authoring model.

## Next 3 Things

1. move homepage and other high-design surfaces toward Quartz-owned rendering instead of Markdown-owned layout
2. improve featured cards, category pages, and click-through flow without contaminating ordinary notes
3. optimize image weight and loading speed before adding much more content

## Pre-Scale Plan

Before large content expansion or broader publishing, complete these steps:

1. Freeze the rule that ordinary knowledge notes remain pure Markdown.
2. Audit `content/` for pages carrying presentational HTML.
3. Keep homepage-level exceptions explicit and documented.
4. Gradually migrate homepage and future special surfaces into Quartz components or structured data rendering.
5. Expand content only after the content/presentation boundary is stable.

## Migration Order

To keep the long-term architecture stable, use this implementation order:

1. lock the rules for pure notes, category pages, and exception pages
2. establish one working category-page pattern with Markdown-readable content and Quartz-side rendering
3. migrate the remaining category index pages onto the same pattern
4. revisit homepage implementation after category-page rendering rules are proven
5. only then expand content volume or add new landing surfaces

## Long-Term Development Rule

When product polish and architecture cleanliness conflict, prefer solutions that preserve:

- clean ordinary notes in Obsidian
- explicit contracts between Markdown and Quartz
- a small number of exception surfaces

The site can evolve visually, but the content model must stay boring, legible, and durable.

## 1.0 Success Check

The POC is working if:

- a first-time visitor knows where to start
- the site feels curated, not dumped
- key entries are attractive enough to keep browsing
- content production stays simple in Obsidian + Markdown
- homepage polish does not force ordinary notes to stop being clean vault content
