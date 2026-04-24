import { Element, Root } from "hast"
import { QuartzTransformerPlugin } from "../types"
import { getResponsiveImageProps, isOptimizableImagePath } from "../../util/imageVariants"

function classList(node: Element) {
  const value = node.properties?.className ?? node.properties?.class
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === "string") return value.split(/\s+/).filter(Boolean)
  return []
}

function hasClass(node: Element | undefined, className: string) {
  return node ? classList(node).includes(className) : false
}

function imageSizes(ancestors: Element[]) {
  if (ancestors.some((node) => hasClass(node, "hero-visual") || hasClass(node, "category-hero"))) {
    return "(max-width: 800px) 100vw, 680px"
  }

  if (ancestors.some((node) => hasClass(node, "entry-card"))) {
    return "(max-width: 800px) 100vw, 520px"
  }

  return "(max-width: 800px) 100vw, 760px"
}

function optimizeImages(node: Element | Root, ancestors: Element[] = []) {
  if (
    node.type === "element" &&
    node.tagName === "img" &&
    typeof node.properties?.src === "string"
  ) {
    const src = node.properties.src
    if (isOptimizableImagePath(src)) {
      node.properties = {
        ...node.properties,
        ...getResponsiveImageProps(src, imageSizes(ancestors)),
      }
    }
  }

  if ("children" in node) {
    const nextAncestors = node.type === "element" ? [...ancestors, node] : ancestors
    for (const child of node.children) {
      if (child.type === "element") {
        optimizeImages(child, nextAncestors)
      }
    }
  }
}

export const ImageOptimization: QuartzTransformerPlugin = () => ({
  name: "ImageOptimization",
  htmlPlugins() {
    return [
      () => {
        return (tree: Root) => {
          optimizeImages(tree)
        }
      },
    ]
  },
})
