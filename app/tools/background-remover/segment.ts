import type { InferenceSession } from 'onnxruntime-web/wasm'

/** u2netp 输入边长（HF config.json: input_shape [1, 3, 320, 320]） */
export const MODEL_INPUT_SIZE = 320

/** ImageNet 归一化参数，与模型仓库 preprocessor_config.json 一致 */
const MEAN = [0.485, 0.456, 0.406] as const
const STD = [0.229, 0.224, 0.225] as const

/** 归一化零点对应的 0-255 像素色：letterbox 补边用它填充，补边区在归一化后恰为 0，避免边缘伪影 */
const PAD_RGB: [number, number, number] = [
  Math.round(MEAN[0] * 255),
  Math.round(MEAN[1] * 255),
  Math.round(MEAN[2] * 255),
]

/** 合成掩码输出名：u2net 有 7 个 side output，config.json 的 output_composite 指向融合结果 */
const COMPOSITE_OUTPUT = '1959'

/** onnxruntime-web wasm 运行时：jsDelivr npm 源，版本与 package.json 依赖锁定一致（含 glue .mjs 与 .wasm） */
const WASM_PATHS = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/'

/** 模型权重：u2netp（Apache-2.0，约 4.4MB，HuggingFace BritishWerewolf/U-2-Netp），第二个为国内镜像兜底 */
const MODEL_URLS = [
  'https://huggingface.co/BritishWerewolf/U-2-Netp/resolve/main/onnx/model.onnx',
  'https://hf-mirror.com/BritishWerewolf/U-2-Netp/resolve/main/onnx/model.onnx',
]

export interface DownloadProgress {
  loaded: number
  total: number
}

/** letterbox 布局：模型要求 320² 输入，保持比例缩放后居中补边 */
export interface LetterboxInfo {
  scale: number
  offsetX: number
  offsetY: number
  scaledWidth: number
  scaledHeight: number
}

let sessionPromise: Promise<InferenceSession> | null = null

/**
 * 下载模型并创建推理会话（全局单例，同页面再次抠图直接复用）。
 * onnxruntime-web 仅在浏览器端动态导入，SSR 阶段不会加载。
 */
export function loadSession(onProgress?: (progress: DownloadProgress) => void): Promise<InferenceSession> {
  sessionPromise ??= (async () => {
    const ort = await import('onnxruntime-web/wasm')
    // 单线程推理：不依赖 SharedArrayBuffer，免去 COOP/COEP 跨域隔离配置
    ort.env.wasm.numThreads = 1
    // wasm 运行时走 CDN：默认按 import.meta.url 推断路径，打包场景下会 404
    ort.env.wasm.wasmPaths = WASM_PATHS
    try {
      const weights = await fetchModel(MODEL_URLS, onProgress)
      return await ort.InferenceSession.create(new Uint8Array(weights), {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      })
    }
    catch (error) {
      // 失败后清除缓存，允许用户重试
      sessionPromise = null
      throw error
    }
  })()
  return sessionPromise
}

/** 按顺序尝试各镜像源下载模型权重，全部失败才抛错（保留最后一个源的错误） */
async function fetchModel(urls: string[], onProgress?: (progress: DownloadProgress) => void): Promise<ArrayBuffer> {
  let lastError: unknown
  for (const url of urls) {
    try {
      return await downloadWithProgress(url, onProgress)
    }
    catch (error) {
      lastError = error
    }
  }
  throw lastError
}

/** 带进度回调地下载模型权重 */
async function downloadWithProgress(url: string, onProgress?: (progress: DownloadProgress) => void): Promise<ArrayBuffer> {
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`模型下载失败（HTTP ${response.status}）`)

  const total = Number(response.headers.get('content-length') ?? 0)
  // 无响应流或无进度回调时退化为一次性读取
  if (!onProgress || !response.body || !total)
    return response.arrayBuffer()

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done)
      break
    chunks.push(value)
    loaded += value.byteLength
    onProgress({ loaded, total })
  }

  const merged = new Uint8Array(loaded)
  chunks.reduce((offset, chunk) => {
    merged.set(chunk, offset)
    return offset + chunk.byteLength
  }, 0)
  return merged.buffer
}

/** 计算保持比例的 letterbox 布局（与 HF U2NetProcessor 的 do_pad 行为一致） */
export function letterboxInfo(width: number, height: number): LetterboxInfo {
  const scale = MODEL_INPUT_SIZE / Math.max(width, height)
  const scaledWidth = Math.max(1, Math.round(width * scale))
  const scaledHeight = Math.max(1, Math.round(height * scale))
  return {
    scale,
    scaledWidth,
    scaledHeight,
    offsetX: Math.floor((MODEL_INPUT_SIZE - scaledWidth) / 2),
    offsetY: Math.floor((MODEL_INPUT_SIZE - scaledHeight) / 2),
  }
}

/** letterbox 补边色（CSS rgb 字符串） */
export function padColor(): string {
  return `rgb(${PAD_RGB[0]}, ${PAD_RGB[1]}, ${PAD_RGB[2]})`
}

/** 320² RGBA → CHW float32 张量（/255 + ImageNet 归一化），忽略 alpha 通道 */
export function toTensor(rgba: Uint8ClampedArray): Float32Array {
  const pixels = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE
  const tensor = new Float32Array(pixels * 3)
  for (let i = 0; i < pixels; i++) {
    tensor[i] = (rgba[i * 4] / 255 - MEAN[0]) / STD[0]
    tensor[pixels + i] = (rgba[i * 4 + 1] / 255 - MEAN[1]) / STD[1]
    tensor[pixels * 2 + i] = (rgba[i * 4 + 2] / 255 - MEAN[2]) / STD[2]
  }
  return tensor
}

/** 执行推理，返回 320² 显著性图（概率形式，双线性放大由调用方处理） */
export async function runSegmentation(session: InferenceSession, tensor: Float32Array): Promise<Float32Array> {
  const ort = await import('onnxruntime-web/wasm')
  const input = new ort.Tensor('float32', tensor, [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE])
  const feeds: Record<string, ort.Tensor> = { [session.inputNames[0]]: input }
  const results = await session.run(feeds)
  // 优先取融合输出；模型变更时退化为首个输出
  const outputName = session.outputNames.includes(COMPOSITE_OUTPUT)
    ? COMPOSITE_OUTPUT
    : session.outputNames[0]
  return activate(results[outputName].data as Float32Array)
}

/** 模型输出可能是 sigmoid 后的概率（[0,1]）或原始 logits（含负值），按最小值判定后统一到 [0,1] */
function activate(data: Float32Array): Float32Array {
  let min = Infinity
  for (let i = 0; i < data.length; i++) {
    if (data[i] < min)
      min = data[i]
  }

  const out = new Float32Array(data.length)
  if (min < 0) {
    for (let i = 0; i < data.length; i++)
      out[i] = 1 / (1 + Math.exp(-data[i]))
  }
  else {
    for (let i = 0; i < data.length; i++)
      out[i] = Math.min(Math.max(data[i], 0), 1)
  }
  return out
}

/**
 * 把 320² 显著性图中对应有效图像的区域双线性放大到目标尺寸。
 * letterbox 补边区不参与放大，保证掩码与原图严格对齐。
 */
export function upscaleMask(mask: Float32Array, info: LetterboxInfo, width: number, height: number): Float32Array {
  const out = new Float32Array(width * height)
  const regionRight = info.offsetX + info.scaledWidth - 1
  const regionBottom = info.offsetY + info.scaledHeight - 1

  for (let y = 0; y < height; y++) {
    // 目标像素中心映射回 320 画布坐标（ALIGN_CORNERS=False 语义）
    const sy = (y + 0.5) * info.scaledHeight / height - 0.5 + info.offsetY
    const y0 = Math.min(Math.max(Math.floor(sy), info.offsetY), regionBottom)
    const y1 = Math.min(y0 + 1, regionBottom)
    const fy = Math.min(Math.max(sy - y0, 0), 1)

    for (let x = 0; x < width; x++) {
      const sx = (x + 0.5) * info.scaledWidth / width - 0.5 + info.offsetX
      const x0 = Math.min(Math.max(Math.floor(sx), info.offsetX), regionRight)
      const x1 = Math.min(x0 + 1, regionRight)
      const fx = Math.min(Math.max(sx - x0, 0), 1)

      const top = mask[y0 * MODEL_INPUT_SIZE + x0] * (1 - fx) + mask[y0 * MODEL_INPUT_SIZE + x1] * fx
      const bottom = mask[y1 * MODEL_INPUT_SIZE + x0] * (1 - fx) + mask[y1 * MODEL_INPUT_SIZE + x1] * fx
      out[y * width + x] = top * (1 - fy) + bottom * fy
    }
  }
  return out
}

/**
 * 掩码（0-1 概率）→ RGBA 像素（黑底，alpha = 概率）。
 * 用于 putImageData 到掩码画布，再以 destination-in 合成出透明背景。
 */
export function maskToImageData(mask: Float32Array, width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < mask.length; i++)
    data[i * 4 + 3] = mask[i] * 255
  return new ImageData(data, width, height)
}
