import { saveAs } from 'file-saver'
import create from 'zustand'
import { createZip } from './createZip'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'
import parserTS from 'prettier/parser-typescript'
import { Group, REVISION } from 'three'
import { WebGLRenderer } from 'three'
import { SandboxCodeFiles } from './sandboxCode'

const { parse } = require('gltfjsx')
const MeshoptDecoder = require('three/examples/jsm/libs/meshopt_decoder.module.js')

interface ParseConfig {
  types: boolean
  shadows: boolean
  instanceall: boolean
  instance: boolean
  verbose: boolean
  keepnames: boolean
  keepgroups: boolean
  aggressive: boolean
  meta: boolean
  precision: number
}

let gltfLoader: GLTFLoader
if (typeof window !== 'undefined') {
  const THREE_PATH = `https://unpkg.zcom/three@0.${REVISION}.x`
  const dracoloader = new DRACOLoader().setDecoderPath(`${THREE_PATH}/examples/js/libs/draco/gltf/`)
  const ktx2Loader = new KTX2Loader().setTranscoderPath(`${THREE_PATH}/examples/js/libs/basis/`)

  gltfLoader = new GLTFLoader()
    .setCrossOrigin('anonymous')
    .setDRACOLoader(dracoloader)
    .setKTX2Loader(ktx2Loader.detectSupport(new WebGLRenderer()))
    .setMeshoptDecoder(MeshoptDecoder)
}

interface Store {
  fileName: string
  buffer: string | null
  textOriginalFile: string
  animations: boolean
  code: string
  scene: Group | null
  createZip: (options: { sandboxCode: SandboxCodeFiles }) => void
  generateScene: (config: ParseConfig) => void
}
const useStore = create<Store>((set, get) => ({
  fileName: '',
  buffer: null,
  textOriginalFile: '',
  animations: false,
  code: '',
  scene: null,
  createZip: async ({ sandboxCode }) => {
    await import('./createZip').then((mod) => mod.createZip)
    const { fileName, textOriginalFile, buffer } = get()
    const blob = await createZip({ sandboxCode, fileName, textOriginalFile, buffer })

    saveAs(blob, `${fileName.split('.')[0]}.zip`)
  },
  generateScene: async (config) => {
    const { fileName, buffer } = get()
    const result = await new Promise<GLTF>((resolve, reject) => gltfLoader.parse(buffer as string, '', resolve, reject))

    const code = parse(fileName, result, { ...config, printwidth: 100 }) as string

    try {
      const prettierConfig = config.types
        ? { parser: 'typescript', plugins: [parserTS] }
        : { parser: 'babel', plugins: [parserBabel] }

      set({
        code: prettier.format(code, prettierConfig),
      })
    } catch {
      set({
        code: code,
      })
    }
    set({
      animations: !!result.animations.length,
    })
    if (!get().scene) set({ scene: result.scene })
  },
}))

export default useStore
