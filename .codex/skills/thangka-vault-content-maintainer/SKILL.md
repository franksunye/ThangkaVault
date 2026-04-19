---
name: thangka-vault-content-maintainer
description: Maintain the ThangkaVault Obsidian knowledge vault. Use when creating, revising, standardizing, or reviewing Markdown entries about Thangka knowledge, image explanations, category pages, tags, filenames, or image/source placeholders in this repository.
---

# ThangkaVault Content Maintainer

Use this skill when working on Markdown content inside this repository's `content/` tree.

## What This Skill Owns

- New Thangka knowledge entries
- Revisions to existing entries
- Category index pages
- Markdown structure consistency
- Filename, tag, and image-path consistency
- Source placeholder hygiene

Do not invent deployment, frontend, or Quartz details unless the user asks for them.

This skill exists to protect the Markdown content layer. It should resist mixing presentation-layer layout into ordinary notes.

## First Step

Before editing, inspect the closest existing files in `content/` and match the repository's current style rather than introducing a new house style.

At minimum:

1. Read the target file if it exists.
2. Read 1 to 2 sibling files in the same category when adding a new entry.
3. Preserve any user-written wording unless there is a clear reason to tighten it.

## Repository Conventions

- Content lives under `content/`.
- Current top-level categories are Chinese folder names:
  - `content/佛像`
  - `content/菩萨`
  - `content/曼荼罗`
  - `content/护法`
  - `content/基础知识`
- Images live under `public/images/` by English category.
- Markdown filenames should use lowercase kebab-case English slugs.

Architecture boundary:

- ordinary knowledge notes should stay pure Markdown
- homepage or special landing-page layout belongs in Quartz or isolated presentation code
- do not treat homepage exceptions as the default pattern for the vault

Read [references/style-guide.md](references/style-guide.md) when you need the exact content template, naming rules, or editorial guardrails.

## Content Purity Rule

For normal knowledge entries, do not add:

- repeated `div` or `section` wrappers for layout
- CSS hook classes used only for site presentation
- custom HTML card systems inside article notes

Allowed exceptions:

- frontmatter
- image embeds
- normal Markdown tables, lists, blockquotes, and separators
- category or homepage work only when the user explicitly wants a landing surface

If the user asks for homepage or special landing-page work, treat that as an exception and keep the pattern contained to that page instead of spreading it across the vault.

## Default Entry Structure

Unless the user requests a different format, keep this section order:

1. Chinese title as `#`
2. English title as `#`
3. Image line
4. `一句话理解`
5. `基本信息`
6. `这幅图在表达什么？`
7. Recognition or concept section
8. Optional `延伸理解`
9. `标签`
10. `来源说明`

Keep the output directly usable as a Markdown note.

## Writing Rules

- Write for beginners first.
- Prefer short paragraphs and concrete language.
- Explain what the viewer is seeing before explaining abstract meaning.
- Keep religious or art-historical claims conservative if the source context is uncertain.
- Do not fabricate image sources, dates, provenance, or attribution.
- Do not pad entries into essays.

## Editing Rules

When revising existing notes:

- Keep the original structure if it is already coherent.
- Improve clarity before adding depth.
- Preserve placeholders such as `图片URL` or `XXX` unless the user provided real data.
- Tighten repetition and jargon.
- Normalize obvious inconsistencies in headings, bullets, punctuation, and tags.
- Remove presentational HTML from ordinary notes when it is not essential to content meaning.

## Creation Rules

When creating a new note:

1. Pick the correct Chinese category folder.
2. Use an English kebab-case filename.
3. Keep tags to roughly 3 to 6 items.
4. Use an image placeholder or a real `/images/...` path only when known.
5. Add a source section even if it only says `待补充`.
6. Prefer pure Markdown over embedded HTML.

## Review Mode

If the user asks for a review, focus on:

- Structural drift from the repository template
- Unclear beginner-facing explanations
- Unsupported factual claims
- Inconsistent tags, filenames, or image references
- Missing or misleading source statements
- Leakage of presentation-layer markup into content-layer notes

## Typical Requests This Skill Should Handle

- "给唐卡条目补一版规范"
- "把这篇条目整理成我们现在的格式"
- "新建一个绿度母词条"
- "统一这个 vault 里的标签和图片占位"
- "review 这些 Markdown 有没有跑偏"
