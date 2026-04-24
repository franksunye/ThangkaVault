import path from "path"
import { generateImageVariants } from "../quartz/util/generateImageVariants"

const root = process.cwd()
const staticDir = path.join(root, "quartz", "static")
const outputStaticDir = path.join(root, "public", "static")

const generated = await generateImageVariants(staticDir, outputStaticDir)
const originalBytes = generated.reduce((sum, image) => sum + image.originalBytes, 0)
const variantBytes = generated.reduce(
  (sum, image) => sum + image.variants.reduce((inner, variant) => inner + variant.bytes, 0),
  0,
)

console.log(`Generated ${generated.length} image variant sets`)
console.log(`Original source bytes: ${(originalBytes / 1024 / 1024).toFixed(2)} MB`)
console.log(`Generated delivery bytes: ${(variantBytes / 1024 / 1024).toFixed(2)} MB`)
