import JSZip from 'jszip'
import { isGlb, isJson } from './isExtension'
import { SandboxCodeFiles } from './sandboxCode'

interface CreateZipOptions {
  sandboxCode: SandboxCodeFiles
  fileName: string
  textOriginalFile: string
  buffer: string | null
}
export const createZip = async ({ sandboxCode, fileName, textOriginalFile, buffer }: CreateZipOptions) => {
  var zip = new JSZip()
  Object.keys(sandboxCode.files).map((file) => {
    if (file === `public/${fileName}`) {
      zip.file(`public/${fileName}`, isGlb(fileName) ? (buffer as string) : textOriginalFile, {
        binary: isGlb(fileName),
      })
    } else {
      zip.file(
        file,
        isJson(file)
          ? JSON.stringify(sandboxCode.files[file].content, null, 2)
          : (sandboxCode.files[file].content as string)
      )
    }
  })

  const blob = await zip.generateAsync({ type: 'blob' })

  return blob
}
