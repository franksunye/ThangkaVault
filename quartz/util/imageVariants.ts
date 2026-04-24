import path from "path"

export type ImageVariantKey = "card" | "article" | "detail"

export type ImageVariant = {
  width: number
  quality: number
  suffix: ImageVariantKey
}

export type ImageVariantSet = {
  original: string
  card: string
  article: string
  detail: string
  srcset: string
}

export const IMAGE_VARIANTS: ImageVariant[] = [
  { suffix: "card", width: 720, quality: 76 },
  { suffix: "article", width: 1400, quality: 82 },
  { suffix: "detail", width: 2400, quality: 86 },
]

const IMAGE_PREFIX = "/static/images/"
const GENERATED_PREFIX = "/static/images/generated/"
const IMAGE_EXT_RE = /\.(avif|jpe?g|png|webp)$/i

export function isOptimizableImagePath(src: string | undefined): src is string {
  if (!src) return false
  if (!src.startsWith(IMAGE_PREFIX)) return false
  if (src.startsWith(GENERATED_PREFIX)) return false
  return IMAGE_EXT_RE.test(src.split(/[?#]/)[0])
}

export function variantUrl(src: string, variant: ImageVariant): string {
  const cleanSrc = src.split(/[?#]/)[0]
  const parsed = path.posix.parse(cleanSrc.slice(IMAGE_PREFIX.length))
  return `${GENERATED_PREFIX}${parsed.dir ? `${parsed.dir}/` : ""}${parsed.name}-${variant.suffix}-${variant.width}.webp`
}

export function getImageVariantSet(src: string): ImageVariantSet | null {
  if (!isOptimizableImagePath(src)) return null

  const card = variantUrl(src, IMAGE_VARIANTS[0])
  const article = variantUrl(src, IMAGE_VARIANTS[1])
  const detail = variantUrl(src, IMAGE_VARIANTS[2])

  return {
    original: src,
    card,
    article,
    detail,
    srcset: `${card} ${IMAGE_VARIANTS[0].width}w, ${article} ${IMAGE_VARIANTS[1].width}w, ${detail} ${IMAGE_VARIANTS[2].width}w`,
  }
}

export function getResponsiveImageProps(src: string, sizes = "(max-width: 800px) 100vw, 760px") {
  const variants = getImageVariantSet(src)
  if (!variants) return { src }

  return {
    src: variants.article,
    srcSet: variants.srcset,
    sizes,
    loading: "lazy" as const,
    decoding: "async" as const,
    "data-original-src": variants.original,
    "data-detail-src": variants.detail,
  }
}
