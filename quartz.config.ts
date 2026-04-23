import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "唐卡知库",
    pageTitleSuffix: " | ThangkaVault",
    enableSPA: true,
    enablePopovers: false,
    analytics: {
      provider: "google",
      tagId: "G-9Q4783MBNM",
    },
    locale: "zh-CN",
    baseUrl: "thangka.visutry.com",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Noto Serif SC",
        body: "Noto Sans SC",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#f8f5ef",
          lightgray: "#e8dfd2",
          gray: "#8a7f73",
          darkgray: "#4a413a",
          dark: "#1e1a17",
          secondary: "#8b1e3f",
          tertiary: "#c89b3c",
          highlight: "rgba(200, 155, 60, 0.14)",
          textHighlight: "#f3df9d88",
        },
        darkMode: {
          light: "#191513",
          lightgray: "#2a2420",
          gray: "#9f9386",
          darkgray: "#ddd2c6",
          dark: "#f5eee5",
          secondary: "#d4af37",
          tertiary: "#8b1e3f",
          highlight: "rgba(212, 175, 55, 0.15)",
          textHighlight: "#8b1e3f55",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
        rssLimit: 20,
      }),
      Plugin.RootFiles(),
      Plugin.Robots(),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
