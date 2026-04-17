# ThangkaVault Project

## Goal

Build a content-first Thangka website that combines:

- high-quality images
- beginner-friendly explanations
- a low-cost, repeatable Markdown publishing workflow

Current phase: `1.0 POC`

## Current Scope

Included:

- Obsidian-based content vault in `content/`
- Quartz-based publishing layer
- Cloudflare Pages deployment
- initial knowledge structure and sourced images
- homepage and category pages with product-style presentation

Not included yet:

- user accounts
- comments/community features
- monetization features
- advanced search or recommendation logic

## Source Of Truth

- Content: `content/`
- Publishable images: `quartz/static/images/`
- Site config and UI: repo root + `quartz/`
- Local writing in Obsidian: open `content/`

## Working Rules

- Keep `content/` focused on knowledge content, not engineering files
- Keep images out of `content/`; store them in `quartz/static/images/`
- New content should follow the existing entry template and naming style
- Prefer improving clarity and structure over adding more volume
- Product changes should first improve homepage, category pages, and reading flow

## Current Priorities

1. Stabilize homepage and category-page presentation
2. Improve reading flow from homepage to key entries
3. Continue adding high-quality sourced images
4. Expand core content slowly, keeping structure consistent

## Next Milestones

- `1.1`: refine homepage, category pages, and visual rhythm
- `1.2`: optimize image size and loading performance
- `1.3`: expand core entries in Buddha / Bodhisattva / Symbols
- `2.0`: evaluate stronger navigation, search, and lightweight growth features

## Success Check For 1.0

The POC is working if:

- the site feels more like a product than a document dump
- a first-time visitor can understand where to start
- key entries are visually attractive and easy to continue reading
- content production remains simple inside Obsidian + Markdown
