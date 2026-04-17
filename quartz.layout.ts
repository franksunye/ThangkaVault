import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

const isProductLanding = (page: Parameters<NonNullable<typeof Component.ConditionalRender>>[0]["condition"] extends (page: infer T) => boolean ? T : never) =>
  page.fileData.slug === "index" || page.fileData.frontmatter?.cssclasses?.includes("landing-page")

const isCategoryPage = (page: Parameters<NonNullable<typeof Component.ConditionalRender>>[0]["condition"] extends (page: infer T) => boolean ? T : never) =>
  page.fileData.frontmatter?.cssclasses?.includes("category-page") ?? false

const isProductSurface = (page: Parameters<NonNullable<typeof Component.ConditionalRender>>[0]["condition"] extends (page: infer T) => boolean ? T : never) =>
  isProductLanding(page) || isCategoryPage(page)

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/franksunye/ThangkaVault",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => !isProductSurface(page),
    }),
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => !isProductSurface(page),
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => !isProductSurface(page),
    }),
    Component.ConditionalRender({
      component: Component.TagList(),
      condition: (page) => !isProductSurface(page),
    }),
  ],
  left: [
    Component.ConditionalRender({
      component: Component.PageTitle(),
      condition: (page) => !isProductLanding(page),
    }),
    Component.ConditionalRender({
      component: Component.MobileOnly(Component.Spacer()),
      condition: (page) => !isProductLanding(page),
    }),
    Component.ConditionalRender({
      component: Component.Flex({
        components: [
          {
            Component: Component.Search(),
            grow: true,
          },
          { Component: Component.Darkmode() },
        ],
      }),
      condition: (page) => !isProductLanding(page),
    }),
    Component.ConditionalRender({
      component: Component.Explorer(),
      condition: (page) => !isProductLanding(page),
    }),
  ],
  right: [
    Component.ConditionalRender({
      component: Component.DesktopOnly(Component.TableOfContents()),
      condition: (page) => !isProductSurface(page),
    }),
    Component.ConditionalRender({
      component: Component.Backlinks(),
      condition: (page) => !isProductSurface(page),
    }),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => !isCategoryPage(page),
    }),
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => !isCategoryPage(page),
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => !isCategoryPage(page),
    }),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
