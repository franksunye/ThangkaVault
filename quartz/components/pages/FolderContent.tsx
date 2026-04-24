import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/listPage.scss"
import { PageList, SortFn } from "../PageList"
import { Element, ElementContent, Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { QuartzPluginData } from "../../plugins/vfile"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"
import { trieFromAllFiles } from "../../util/ctx"
import { getResponsiveImageProps } from "../../util/imageVariants"

interface FolderContentOptions {
  /**
   * Whether to display number of folders
   */
  showFolderCount: boolean
  showSubfolders: boolean
  sort?: SortFn
}

const defaultOptions: FolderContentOptions = {
  showFolderCount: true,
  showSubfolders: true,
}

interface CategoryLandingItem {
  title?: string
  description?: string
  href?: string
  image?: string
  imageAlt?: string
}

interface CategoryLandingSection {
  title?: string
  description?: string
  style?: string
  items?: CategoryLandingItem[]
}

function ResponsiveImage({ src, alt, sizes }: { src: string; alt: string; sizes?: string }) {
  return <img {...getResponsiveImageProps(src, sizes)} alt={alt} />
}

function renderCategoryLanding(
  fileData: QuartzComponentProps["fileData"],
  sections: CategoryLandingSection[],
) {
  if (sections.length === 0) return null

  const eyebrow = fileData.frontmatter?.categoryEyebrow as string | undefined
  const lead = fileData.frontmatter?.description as string | undefined
  const image = fileData.frontmatter?.categoryCover as string | undefined
  const imageAlt = fileData.frontmatter?.categoryCoverAlt as string | undefined
  const pageTitle = fileData.frontmatter?.title

  return (
    <>
      {(eyebrow || lead || image) && (
        <section class="category-hero">
          <div>
            {eyebrow && <p class="eyebrow">{eyebrow}</p>}
            {pageTitle && <h1>{pageTitle}</h1>}
            {lead && <p class="lead">{lead}</p>}
          </div>
          {image && (
            <ResponsiveImage
              src={image}
              alt={imageAlt ?? pageTitle ?? "Category cover"}
              sizes="(max-width: 800px) 100vw, 680px"
            />
          )}
        </section>
      )}
      {sections.map((section) => {
        const items = section.items ?? []
        const variant = section.style ?? "feature"
        const sectionClass =
          variant === "entry"
            ? "entry-grid compact"
            : variant === "theme"
              ? "theme-grid"
              : "feature-path"

        return (
          <section class="landing-section stage-intro">
            {section.title && <h2>{section.title}</h2>}
            {section.description && <p>{section.description}</p>}
            <div class={sectionClass}>
              {items.map((item, index) => {
                if (!item.href) return null

                if (variant === "entry") {
                  return (
                    <a class="entry-card" href={item.href}>
                      {item.image && (
                        <ResponsiveImage
                          src={item.image}
                          alt={item.imageAlt ?? item.title ?? "Entry cover"}
                          sizes="(max-width: 800px) 100vw, 520px"
                        />
                      )}
                      <div>
                        {item.title && <div class="card-title">{item.title}</div>}
                        {item.description && <div class="card-copy">{item.description}</div>}
                      </div>
                    </a>
                  )
                }

                if (variant === "theme") {
                  return (
                    <a class="theme-card" href={item.href}>
                      {item.title && <strong>{item.title}</strong>}
                      {item.description && <span>{item.description}</span>}
                    </a>
                  )
                }

                return (
                  <a class="feature-step" href={item.href}>
                    <div class="feature-step-index">{String(index + 1).padStart(2, "0")}</div>
                    <div class="feature-step-body">
                      {item.title && <div class="feature-step-title">{item.title}</div>}
                      {item.description && <p>{item.description}</p>}
                    </div>
                  </a>
                )
              })}
            </div>
          </section>
        )
      })}
    </>
  )
}

function extractCategoryLanding(root: Root) {
  const sectionStyles: Record<string, string> = {
    推荐阅读顺序: "feature",
    继续延伸: "theme",
  }

  const sections: CategoryLandingSection[] = []
  const keptChildren: ElementContent[] = []

  for (let i = 0; i < root.children.length; i++) {
    const node = root.children[i]

    if (isElement(node) && node.tagName === "h2") {
      const title = getNodeText(node).trim()
      const nextIndex = findNextSignificantIndex(root.children, i + 1)
      const nextNode = nextIndex !== -1 ? root.children[nextIndex] : undefined
      const style = sectionStyles[title]

      if (
        style &&
        isElement(nextNode) &&
        (nextNode.tagName === "ol" || nextNode.tagName === "ul")
      ) {
        sections.push({
          title,
          style,
          items: parseLandingItems(nextNode),
        })
        i = nextIndex
        continue
      }
    }

    keptChildren.push(node)
  }

  return {
    sections,
    contentRoot: {
      ...root,
      children: keptChildren,
    } satisfies Root,
  }
}

function parseLandingItems(listNode: Element): CategoryLandingItem[] {
  return listNode.children
    .filter((child): child is Element => isElement(child) && child.tagName === "li")
    .map((item) => {
      const paragraphs = item.children.filter(
        (child): child is Element => isElement(child) && child.tagName === "p",
      )
      const firstParagraph = paragraphs[0]
      const descriptionParagraph = paragraphs.find((_, index) => index > 0)
      const link = firstParagraph ? findFirstLink(firstParagraph) : undefined

      return {
        title: link?.title ?? (firstParagraph ? getNodeText(firstParagraph).trim() : undefined),
        href: link?.href,
        description: descriptionParagraph ? getNodeText(descriptionParagraph).trim() : undefined,
      }
    })
    .filter((item) => item.href && item.title)
}

function findFirstLink(node: ElementContent): { href?: string; title?: string } | undefined {
  if (!isElement(node)) return undefined

  if (node.tagName === "a") {
    const href = typeof node.properties?.href === "string" ? node.properties.href : undefined
    return { href, title: getNodeText(node).trim() }
  }

  for (const child of node.children) {
    const link = findFirstLink(child)
    if (link) return link
  }

  return undefined
}

function getNodeText(node: ElementContent): string {
  if (node.type === "text") return node.value
  if (!isElement(node)) return ""
  return node.children.map((child) => getNodeText(child)).join("")
}

function isElement(node: ElementContent | Root["children"][number] | undefined): node is Element {
  return !!node && node.type === "element"
}

function findNextSignificantIndex(children: Root["children"], start: number) {
  for (let i = start; i < children.length; i++) {
    const node = children[i]
    if (node.type === "text" && node.value.trim() === "") continue
    return i
  }

  return -1
}

export default ((opts?: Partial<FolderContentOptions>) => {
  const options: FolderContentOptions = { ...defaultOptions, ...opts }

  const FolderContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, cfg } = props

    const trie = (props.ctx.trie ??= trieFromAllFiles(allFiles))
    const folder = trie.findNode(fileData.slug!.split("/"))
    if (!folder) {
      return null
    }

    const allPagesInFolder: QuartzPluginData[] =
      folder.children
        .map((node) => {
          // regular file, proceed
          if (node.data) {
            return node.data
          }

          if (node.isFolder && options.showSubfolders) {
            // folders that dont have data need synthetic files
            const getMostRecentDates = (): QuartzPluginData["dates"] => {
              let maybeDates: QuartzPluginData["dates"] | undefined = undefined
              for (const child of node.children) {
                if (child.data?.dates) {
                  // compare all dates and assign to maybeDates if its more recent or its not set
                  if (!maybeDates) {
                    maybeDates = { ...child.data.dates }
                  } else {
                    if (child.data.dates.created > maybeDates.created) {
                      maybeDates.created = child.data.dates.created
                    }

                    if (child.data.dates.modified > maybeDates.modified) {
                      maybeDates.modified = child.data.dates.modified
                    }

                    if (child.data.dates.published > maybeDates.published) {
                      maybeDates.published = child.data.dates.published
                    }
                  }
                }
              }
              return (
                maybeDates ?? {
                  created: new Date(),
                  modified: new Date(),
                  published: new Date(),
                }
              )
            }

            return {
              slug: node.slug,
              dates: getMostRecentDates(),
              frontmatter: {
                title: node.displayName,
                tags: [],
              },
            }
          }
        })
        .filter((page) => page !== undefined) ?? []
    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")
    const listProps = {
      ...props,
      sort: options.sort,
      allFiles: allPagesInFolder,
    }

    const pageTree = tree as Root
    const extractedLanding = isCategoryPage(fileData) ? extractCategoryLanding(pageTree) : null
    const contentTree = extractedLanding?.contentRoot ?? pageTree
    const content = (
      contentTree.children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, contentTree)
    ) as ComponentChildren
    const categoryLanding =
      isCategoryPage(fileData) && extractedLanding
        ? renderCategoryLanding(fileData, extractedLanding.sections)
        : null

    return (
      <div class="popover-hint">
        <article class={classes}>
          {categoryLanding}
          {content}
        </article>
        <div class="page-listing">
          {options.showFolderCount && (
            <p>
              {i18n(cfg.locale).pages.folderContent.itemsUnderFolder({
                count: allPagesInFolder.length,
              })}
            </p>
          )}
          <div>
            <PageList {...listProps} />
          </div>
        </div>
      </div>
    )
  }

  FolderContent.css = concatenateResources(style, PageList.css)
  return FolderContent
}) satisfies QuartzComponentConstructor

function isCategoryPage(fileData: QuartzComponentProps["fileData"]) {
  return fileData.frontmatter?.cssclasses?.includes("category-page") ?? false
}
