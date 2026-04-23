import type { Root, Element, ElementContent } from "hast"
import { GlobalConfiguration } from "../cfg"
import { i18n } from "../i18n"
import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, joinSegments } from "./path"
import { unescapeHTML } from "./escape"

type JsonLdValue = string | number | boolean | null | JsonLdValue[] | { [key: string]: JsonLdValue }
type JsonLdObject = { [key: string]: JsonLdValue }

const SITE_NAME = "唐卡知库"
const SITE_ALT_NAME = "ThangkaVault"

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return ["true", "1", "yes", "on"].includes(normalized)
  }
  return false
}

function asStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0)
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  return undefined
}

function sanitizeJsonLd<T extends JsonLdObject>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, currentValue) => {
      if (currentValue === undefined) return undefined
      if (Array.isArray(currentValue)) {
        return currentValue.filter((item) => item !== undefined && item !== null && item !== "")
      }
      return currentValue
    }),
  ) as T
}

function getSiteUrl(cfg: GlobalConfiguration): string {
  return `https://${cfg.baseUrl ?? "example.com"}`
}

export function getPageUrl(cfg: GlobalConfiguration, slug?: string): string {
  const siteUrl = getSiteUrl(cfg)
  if (!slug || slug === "404" || slug === "index") return siteUrl
  return `${siteUrl}/${slug}`
}

export function getPageTitle(cfg: GlobalConfiguration, fileData: QuartzPluginData): string {
  const titleSuffix = cfg.pageTitleSuffix ?? ""
  return (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
}

export function getPageDescription(cfg: GlobalConfiguration, fileData: QuartzPluginData): string {
  return (
    fileData.frontmatter?.socialDescription ??
    fileData.frontmatter?.description ??
    unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)
  )
}

function firstImageFromAst(root: Root | undefined): string | undefined {
  if (!root) return undefined

  const queue: ElementContent[] = [...root.children]
  while (queue.length > 0) {
    const node = queue.shift()
    if (!node || node.type !== "element") continue

    const element = node as Element
    if (element.tagName === "img") {
      const src = element.properties?.src
      if (typeof src === "string" && src.length > 0) {
        return src
      }
    }

    if (element.children?.length) {
      queue.push(...element.children)
    }
  }

  return undefined
}

function toAbsoluteUrl(
  cfg: GlobalConfiguration,
  value: string | undefined,
  slug?: string,
): string | undefined {
  if (!value) return undefined
  if (/^https?:\/\//.test(value)) return value
  const normalizedRelative = value.replace(/^(\.\.\/)+/, "/").replace(/^\.\//, "/")
  if (normalizedRelative.startsWith("/")) {
    return `${getSiteUrl(cfg)}${normalizedRelative}`
  }
  if (value.startsWith("/")) {
    return `${getSiteUrl(cfg)}${value}`
  }
  return new URL(value, getPageUrl(cfg, slug)).toString()
}

export function getPrimaryImage(cfg: GlobalConfiguration, fileData: QuartzPluginData): string | undefined {
  const fromFrontmatter =
    typeof fileData.frontmatter?.socialImage === "string" ? fileData.frontmatter.socialImage : undefined
  const fromAst = firstImageFromAst(fileData.htmlAst as Root | undefined)
  return toAbsoluteUrl(cfg, fromFrontmatter ?? fromAst, fileData.slug)
}

type PageKind = "home" | "folder" | "tag" | "content" | "error"

function getPageKind(slug?: string): PageKind {
  if (!slug || slug === "index") return "home"
  if (slug === "404") return "error"
  if (slug.startsWith("tags/")) return "tag"
  if (slug.endsWith("/index")) return "folder"
  return "content"
}

function getCategory(slug?: string): string | undefined {
  if (!slug || slug === "index" || slug === "404") return undefined
  const [first] = slug.split("/")
  if (first === "tags") return "tags"
  return first
}

function buildBreadcrumbs(
  cfg: GlobalConfiguration,
  slug?: string,
  pageTitle?: string,
): JsonLdObject | undefined {
  if (!slug || slug === "index" || slug === "404") return undefined

  const segments = slug.split("/")
  const itemListElement = segments.map((segment, index) => {
    const itemSlug = segments.slice(0, index + 1).join("/") as FullSlug
    const isFolderIndex = segment === "index"
    const isLast = index === segments.length - 1
    const label = isLast && pageTitle
      ? pageTitle
      : isFolderIndex
        ? segments[index - 1] ?? SITE_NAME
        : decodeURIComponent(segment).replace(/-/g, " ")

    return sanitizeJsonLd({
      "@type": "ListItem",
      position: index + 1,
      name: label,
      item: getPageUrl(cfg, itemSlug),
    })
  })

  return sanitizeJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  })
}

export function getRobotsDirective(fileData: QuartzPluginData): string {
  if (fileData.slug === "404" || asBoolean(fileData.frontmatter?.noindex)) {
    return "noindex, nofollow"
  }
  return "index, follow"
}

export function getOgType(fileData: QuartzPluginData): "website" | "article" {
  return getPageKind(fileData.slug) === "content" ? "article" : "website"
}

export function buildStructuredData(
  cfg: GlobalConfiguration,
  fileData: QuartzPluginData,
): JsonLdObject[] {
  const pageKind = getPageKind(fileData.slug)
  if (pageKind === "error") return []

  const pageUrl = getPageUrl(cfg, fileData.slug)
  const title = getPageTitle(cfg, fileData)
  const description = getPageDescription(cfg, fileData)
  const image = getPrimaryImage(cfg, fileData)
  const published = fileData.frontmatter?.published?.toString()
  const modified = fileData.frontmatter?.modified?.toString()
  const tags = asStringArray(fileData.frontmatter?.tags)
  const keywords = asStringArray(fileData.frontmatter?.keywords) ?? tags
  const category = getCategory(fileData.slug)
  const sourceUrl =
    typeof fileData.frontmatter?.sourceUrl === "string" ? fileData.frontmatter.sourceUrl : undefined
  const sourceOrganization =
    typeof fileData.frontmatter?.sourceOrganization === "string"
      ? fileData.frontmatter.sourceOrganization
      : undefined
  const sourceLicense =
    typeof fileData.frontmatter?.sourceLicense === "string"
      ? fileData.frontmatter.sourceLicense
      : undefined
  const sameAs = asStringArray(fileData.frontmatter?.sameAs)

  const website = sanitizeJsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getSiteUrl(cfg)}#website`,
    url: getSiteUrl(cfg),
    name: SITE_NAME,
    alternateName: SITE_ALT_NAME,
    inLanguage: cfg.locale,
  })

  const webPageType =
    pageKind === "folder" ? "CollectionPage" : pageKind === "home" ? "WebPage" : "WebPage"

  const webPage = sanitizeJsonLd({
    "@context": "https://schema.org",
    "@type": webPageType,
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    description,
    inLanguage: cfg.locale,
    isPartOf: { "@id": `${getSiteUrl(cfg)}#website` },
    breadcrumb: fileData.slug && fileData.slug !== "index" ? `${pageUrl}#breadcrumb` : undefined,
    primaryImageOfPage: image
      ? {
          "@type": "ImageObject",
          url: image,
        }
      : undefined,
  })

  const structured: JsonLdObject[] = [website, webPage]

  const breadcrumb = buildBreadcrumbs(
    cfg,
    fileData.slug,
    typeof fileData.frontmatter?.title === "string" ? fileData.frontmatter.title : undefined,
  )
  if (breadcrumb) {
    breadcrumb["@id"] = `${pageUrl}#breadcrumb`
    structured.push(breadcrumb)
  }

  if (pageKind === "content") {
    structured.push(
      sanitizeJsonLd({
        "@context": "https://schema.org",
        "@type": ["Article", "LearningResource"],
        "@id": `${pageUrl}#article`,
        mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
        headline: fileData.frontmatter?.title,
        description,
        image: image ? [image] : undefined,
        inLanguage: cfg.locale,
        isAccessibleForFree: true,
        author: {
          "@type": "Organization",
          name: SITE_NAME,
          alternateName: SITE_ALT_NAME,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          alternateName: SITE_ALT_NAME,
          logo: {
            "@type": "ImageObject",
            url: `${getSiteUrl(cfg)}/static/icon.png`,
          },
        },
        datePublished: published,
        dateModified: modified,
        articleSection: category,
        keywords,
        about: category ? [{ "@type": "Thing", name: category }] : undefined,
        citation: sourceUrl ? [sourceUrl] : undefined,
        sourceOrganization: sourceOrganization,
        license: sourceLicense,
        sameAs,
      }),
    )
  }

  return structured
}
