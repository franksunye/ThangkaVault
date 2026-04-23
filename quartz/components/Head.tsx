import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { CustomOgImagesEmitterName } from "../plugins/emitters/ogImage"
import {
  buildStructuredData,
  getOgType,
  getPageDescription,
  getPrimaryImage,
  getPageTitle,
  getPageUrl,
  getRobotsDirective,
} from "../util/structuredData"
export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const title = getPageTitle(cfg, fileData)
    const description = getPageDescription(cfg, fileData)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    const canonicalUrl = getPageUrl(cfg, fileData.slug)
    const robots = getRobotsDirective(fileData)
    const ogType = getOgType(fileData)
    const structuredData = buildStructuredData(cfg, fileData)
    const published = fileData.frontmatter?.published?.toString()
    const modified = fileData.frontmatter?.modified?.toString()

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some(
      (e) => e.name === CustomOgImagesEmitterName,
    )
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`
    const socialImage = getPrimaryImage(cfg, fileData) ?? ogImageDefaultPath

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content={ogType} />
        <meta property="og:locale" content={cfg.locale} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={socialImage} />
            <meta property="og:image:url" content={socialImage} />
            <meta name="twitter:image" content={socialImage} />
            <meta
              property="og:image:type"
              content={`image/${(getFileExtension(socialImage) ?? ".png").replace(/^\./, "")}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={canonicalUrl}></meta>
            <meta property="twitter:url" content={canonicalUrl}></meta>
          </>
        )}

        {published && <meta property="article:published_time" content={published} />}
        {modified && <meta property="article:modified_time" content={modified} />}

        <link rel="canonical" href={canonicalUrl} />
        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="robots" content={robots} />
        <meta name="generator" content="Quartz" />
        {structuredData.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
            }}
          />
        )}

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
