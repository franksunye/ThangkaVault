import { FilePath, QUARTZ, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import fs from "fs"
import { glob } from "../../util/glob"
import { dirname } from "path"

const ROOT_FILES_DIR = joinSegments(QUARTZ, "root")

export const RootFiles: QuartzEmitterPlugin = () => ({
  name: "RootFiles",
  async *emit({ argv, cfg }) {
    const fps = await glob("**", ROOT_FILES_DIR, cfg.configuration.ignorePatterns)
    for (const fp of fps) {
      const src = joinSegments(ROOT_FILES_DIR, fp) as FilePath
      const dest = joinSegments(argv.output, fp) as FilePath
      await fs.promises.mkdir(dirname(dest), { recursive: true })
      await fs.promises.copyFile(src, dest)
      yield dest
    }
  },
  async *partialEmit() {},
})
