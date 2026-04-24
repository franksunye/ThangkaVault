import fs from "fs"
import path from "path"
import sharp from "sharp"
import { IMAGE_VARIANTS, isOptimizableImagePath, variantUrl } from "./imageVariants"

type GeneratedImage = {
  original: string
  originalBytes: number
  originalWidth?: number
  originalHeight?: number
  variants: Array<{
    kind: string
    path: string
    width: number
    bytes: number
  }>
}

const IMAGE_EXT_RE = /\.(avif|jpe?g|png|webp)$/i

async function walkImages(dir: string): Promise<string[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === "generated") return []
        return walkImages(fullPath)
      }
      return IMAGE_EXT_RE.test(entry.name) ? [fullPath] : []
    }),
  )

  return files.flat()
}

export async function generateImageVariants(staticDir: string, outputStaticDir: string) {
  const imageRoot = path.join(staticDir, "images")
  const outputImageRoot = path.join(outputStaticDir, "images")

  if (!fs.existsSync(imageRoot)) return []

  const imageFiles = await walkImages(imageRoot)
  const generated: GeneratedImage[] = []

  for (const file of imageFiles) {
    const relative = path.relative(imageRoot, file).split(path.sep).join("/")
    const publicSrc = `/static/images/${relative}`
    if (!isOptimizableImagePath(publicSrc)) continue

    const metadata = await sharp(file).metadata()
    const originalBytes = (await fs.promises.stat(file)).size
    const variants: GeneratedImage["variants"] = []

    for (const variant of IMAGE_VARIANTS) {
      const publicVariant = variantUrl(publicSrc, variant)
      const outputPath = path.join(
        outputStaticDir,
        publicVariant.slice("/static/".length).split("/").join(path.sep),
      )
      await fs.promises.mkdir(path.dirname(outputPath), { recursive: true })

      await sharp(file)
        .rotate()
        .resize({
          width: variant.width,
          withoutEnlargement: true,
        })
        .webp({
          quality: variant.quality,
          effort: 5,
        })
        .toFile(outputPath)

      variants.push({
        kind: variant.suffix,
        path: publicVariant,
        width: variant.width,
        bytes: (await fs.promises.stat(outputPath)).size,
      })
    }

    generated.push({
      original: publicSrc,
      originalBytes,
      originalWidth: metadata.width,
      originalHeight: metadata.height,
      variants,
    })
  }

  const manifestPath = path.join(outputImageRoot, "generated", "manifest.json")
  await fs.promises.mkdir(path.dirname(manifestPath), { recursive: true })
  await fs.promises.writeFile(manifestPath, JSON.stringify(generated, null, 2))

  return generated
}
