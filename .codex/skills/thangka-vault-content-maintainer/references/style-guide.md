# ThangkaVault Style Guide

## Scope

This guide covers Markdown content under `content/` for the ThangkaVault knowledge vault.

Primary rule: treat `content/` as the content layer first, not the page-layout layer.

## Folder Mapping

- `content/佛像`: Buddhas and related Buddha-image entries
- `content/菩萨`: Bodhisattvas such as 观音、度母、文殊
- `content/曼荼罗`: Mandala or structure-centered entries
- `content/护法`: Protector deities and wrathful figures
- `content/基础知识`: Introductory or conceptual guides

## Content vs Presentation Boundary

By default, Markdown notes should stay clean enough to read naturally inside Obsidian.

Good:

- headings
- paragraphs
- lists
- tables
- blockquotes
- image embeds
- frontmatter

Avoid in ordinary notes:

- nested page-layout wrappers
- repeated `div` or `section` structures used only for card layout
- CSS hook classes whose only purpose is frontend presentation

Exception:

- homepage and rare special landing pages may temporarily carry extra structure during the POC
- this should remain explicit and limited
- do not copy those patterns into normal knowledge entries

## Filename Rule

- Use English lowercase kebab-case
- Example: `green-tara-seated.md`
- Avoid spaces, Chinese filenames, and version suffixes like `final-v2`

## Image Rule

- If the actual file is unknown, keep a neutral placeholder such as `![...](图片URL)`.
- If the actual file is known, use `/images/<category>/<filename>.jpg`.
- Do not invent museum names, collection ids, or rights statements.

## Default Template

```md
# 中文标题
# English Title

![图片说明](图片URL)

> **一句话理解：**
> 用一句话解释读者眼前到底看到了什么。

---

## 基本信息

- 类型：
- 名称：
- 核心象征：

---

## 这幅图在表达什么？

用 2 到 5 句解释画面和意义，先讲可见内容，再讲象征含义。

---

## 如何识别？

- 用视觉特征判断
- 避免空泛形容

---

## 延伸理解

可选。只在确实能增加理解时保留。

---

## 标签

#标签1 #标签2 #标签3

---

## 来源说明

图片来源：待补充
内容整理：唐卡知库（ThangkaVault）
```

## Editorial Guardrails

- Audience: beginners, not specialists
- Tone: calm, clear, not academic
- Paragraphs: short
- Bullets: concrete and visual
- Claims: conservative when uncertain
- Goal: help the reader understand the image, not overwhelm them
- Obsidian readability matters; do not turn ordinary notes into frontend templates

## Tag Rule

Keep tags lean. A good default set is:

- 1 category tag, such as `#佛像` or `#菩萨`
- 1 subject tag, such as `#释迦牟尼` or `#观音菩萨`
- 1 concept tag, such as `#慈悲` or `#触地印`
- Optional English tags when useful

Avoid long tag lists.

## Revision Priorities

When cleaning up an existing note, prioritize in this order:

1. Preserve meaning
2. Fix structure
3. Improve readability
4. Normalize tags and placeholders
5. Add only minimal missing context
6. Remove unnecessary presentation markup from ordinary notes
