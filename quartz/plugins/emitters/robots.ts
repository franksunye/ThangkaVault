import { QuartzEmitterPlugin } from "../types"
import { FilePath } from "../../util/path"
import fs from "fs"
import path from "path"

export const Robots: QuartzEmitterPlugin = () => ({
  name: "Robots",
  async *emit(ctx) {
    const lines = ["User-agent: *", "Allow: /"]
    const baseUrl = ctx.cfg.configuration.baseUrl
    if (baseUrl) {
      lines.push(`Sitemap: https://${baseUrl}/sitemap.xml`)
    }

    const output = lines.join("\n") + "\n"
    const target = path.join(ctx.argv.output, "robots.txt") as FilePath
    await fs.promises.mkdir(path.dirname(target), { recursive: true })
    await fs.promises.writeFile(target, output)
    yield target
  },
  async *partialEmit() {},
})
