<script setup lang="ts">
import { App } from 'antdv-next'
import { RotateCcw, Upload } from 'lucide-vue-next'
import type { DownloadProgress } from './segment'
import {
  letterboxInfo,
  loadSession,
  maskToImageData,
  MODEL_INPUT_SIZE,
  padColor,
  runSegmentation,
  toTensor,
  upscaleMask,
} from './segment'

const { message } = App.useApp()

/** 输入图上限：超过则等比缩小，控制三张全分辨率画布的内存与推理耗时 */
const MAX_INPUT_SIZE = 2048

type Status = 'idle' | 'downloading' | 'running' | 'ready' | 'error'
type BrushMode = 'restore' | 'erase'

interface Point {
  x: number
  y: number
}

/* ---------- 源图状态（与 Image Crop 一致的上引流式：拖拽 / 粘贴 / 选择） ---------- */
const imageSrc = ref<string | null>(null)
const fileNameBase = ref('image')
const isDragging = ref(false)

/** 解码后的源图元素（非响应式，避免大图被深度代理拖慢交互） */
let sourceImage: HTMLImageElement | null = null

/* ---------- 处理流水线状态 ---------- */
const status = ref<Status>('idle')
const downloadProgress = ref<DownloadProgress | null>(null)
const errorText = ref('')

const isBusy = computed(() => status.value === 'downloading' || status.value === 'running')

/** 模型（4.4MB）+ wasm 运行时（14.2MB）首次使用从 CDN 下载，之后走浏览器缓存 */
const progressPercent = computed(() => {
  const progress = downloadProgress.value
  if (!progress?.total)
    return 0
  return Math.min(99, Math.round((progress.loaded / progress.total) * 100))
})

const progressLabel = computed(() => {
  const progress = downloadProgress.value
  if (!progress)
    return ''
  const mb = (bytes: number) => (bytes / 1048576).toFixed(1)
  return `${mb(progress.loaded)} / ${mb(progress.total)} MB`
})

/* ---------- 画布资产（非响应式，尺寸即输出尺寸） ---------- */
/** 缩放后的源图副本，合成与取色的基准 */
let sourceCanvas: HTMLCanvasElement | null = null
/** 掩码画布：初始为 AI 显著性图，笔刷直接在其上增删 alpha */
let maskCanvas: HTMLCanvasElement | null = null
/** AI 原始掩码（概率数组），「重置笔刷」时还原 */
let initialMask: Float32Array | null = null
let outputWidth = 0
let outputHeight = 0

const outCanvasRef = ref<HTMLCanvasElement | null>(null)

/* ---------- 笔刷状态 ---------- */
const brushMode = ref<BrushMode>('restore')
const brushSize = ref(32)
const hasRefined = ref(false)

let painting = false
let lastPoint: Point | null = null

/* ---------- 图片载入 ---------- */

function createImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', () => reject(new Error('图片解码失败')))
    img.src = src
  })
}

/** 源图 → 受尺寸上限约束的画布副本（合成、取色、导出均基于它） */
function buildSourceCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const scale = Math.min(1, MAX_INPUT_SIZE / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

function resetResult() {
  maskCanvas = null
  initialMask = null
  hasRefined.value = false
  status.value = 'idle'
  errorText.value = ''
  const out = outCanvasRef.value
  out?.getContext('2d')?.clearRect(0, 0, out.width, out.height)
}

function loadFile(file: File) {
  if (!file.type.startsWith('image/')) {
    message.warning('请选择图片文件')
    return
  }
  if (imageSrc.value)
    URL.revokeObjectURL(imageSrc.value)

  imageSrc.value = URL.createObjectURL(file)
  fileNameBase.value = file.name.replace(/\.[^.]+$/, '') || 'image'
  sourceImage = null
  resetResult()

  createImage(imageSrc.value)
    .then((img) => {
      sourceImage = img
      sourceCanvas = buildSourceCanvas(img)
      runBackgroundRemoval()
    })
    .catch(() => message.error('图片解码失败，请换一张试试'))
}

function pickFile(file: File) {
  loadFile(file)
  return false
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file)
    loadFile(file)
}

function onPaste(event: ClipboardEvent) {
  const file = Array.from(event.clipboardData?.files ?? []).find(item => item.type.startsWith('image/'))
  if (file)
    loadFile(file)
}

onMounted(() => window.addEventListener('paste', onPaste))
onBeforeUnmount(() => {
  window.removeEventListener('paste', onPaste)
  if (imageSrc.value)
    URL.revokeObjectURL(imageSrc.value)
})

/* ---------- 抠图主流水线 ---------- */

async function runBackgroundRemoval() {
  if (!sourceCanvas)
    return

  status.value = 'downloading'
  downloadProgress.value = null
  errorText.value = ''

  try {
    // 会话单例：首次下载模型 + 加载 wasm 运行时，后续直接复用
    const session = await loadSession(progress => (downloadProgress.value = progress))
    status.value = 'running'
    downloadProgress.value = null

    const width = sourceCanvas.width
    const height = sourceCanvas.height
    const info = letterboxInfo(width, height)

    // letterbox 预处理：保持比例缩放后居中，补边色即归一化零点
    const box = document.createElement('canvas')
    box.width = MODEL_INPUT_SIZE
    box.height = MODEL_INPUT_SIZE
    const boxCtx = box.getContext('2d')!
    boxCtx.fillStyle = padColor()
    boxCtx.fillRect(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE)
    boxCtx.drawImage(sourceCanvas, info.offsetX, info.offsetY, info.scaledWidth, info.scaledHeight)

    const tensor = toTensor(boxCtx.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE).data)
    const mask = upscaleMask(await runSegmentation(session, tensor), info, width, height)

    initialMask = mask
    outputWidth = width
    outputHeight = height
    paintMask(mask)
    composite()
    status.value = 'ready'
  }
  catch (error) {
    status.value = 'error'
    errorText.value = error instanceof Error ? error.message : '处理失败'
    message.error(errorText.value)
  }
}

/** 概率掩码 → 掩码画布（黑底 + alpha 通道承载概率） */
function paintMask(mask: Float32Array) {
  const canvas = document.createElement('canvas')
  canvas.width = outputWidth
  canvas.height = outputHeight
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(maskToImageData(mask, outputWidth, outputHeight), 0, 0)
  maskCanvas = canvas
}

/** 合成输出：源图叠加掩码 alpha，即得透明背景结果 */
function composite() {
  const out = outCanvasRef.value
  const ctx = out?.getContext('2d')
  if (!out || !ctx || !sourceCanvas || !maskCanvas)
    return

  out.width = outputWidth
  out.height = outputHeight
  ctx.clearRect(0, 0, out.width, out.height)
  ctx.drawImage(sourceCanvas, 0, 0)
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(maskCanvas, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
}

let compositeRafId = 0

/** 笔刷拖动时 rAF 节流重绘，避免每帧都全量合成 */
function scheduleComposite() {
  if (compositeRafId)
    return
  compositeRafId = requestAnimationFrame(() => {
    compositeRafId = 0
    composite()
  })
}

/* ---------- 笔刷微调 ---------- */

/** 指针坐标 → 画布内部分辨率坐标（画布被 CSS 缩放显示） */
function canvasPoint(event: PointerEvent): Point {
  const canvas = outCanvasRef.value!
  const rect = canvas.getBoundingClientRect()
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  }
}

function onPointerDown(event: PointerEvent) {
  if (status.value !== 'ready')
    return
  painting = true
  lastPoint = canvasPoint(event)
  ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  paintStroke(lastPoint, lastPoint)
}

function onPointerMove(event: PointerEvent) {
  if (!painting || !lastPoint)
    return
  const point = canvasPoint(event)
  paintStroke(lastPoint, point)
  lastPoint = point
}

function onPointerUp() {
  painting = false
  lastPoint = null
}

/**
 * 沿路径以软边圆点盖章：
 * - 恢复 = source-over 涂白，抬升掩码 alpha（补回主体）
 * - 擦除 = destination-out 打薄掩码 alpha（去掉多余背景）
 */
function paintStroke(from: Point, to: Point) {
  const ctx = maskCanvas?.getContext('2d')
  const out = outCanvasRef.value
  if (!ctx || !out)
    return

  // 笔刷粗细按显示缩放换算，保证视觉大小与滑杆一致
  const displayScale = out.width / out.getBoundingClientRect().width
  const radius = Math.max(1, (brushSize.value / 2) * displayScale)
  const isErase = brushMode.value === 'erase'
  const edge = isErase ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)'
  const fade = isErase ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 0)'

  ctx.save()
  ctx.globalCompositeOperation = isErase ? 'destination-out' : 'source-over'

  const distance = Math.hypot(to.x - from.x, to.y - from.y)
  const steps = Math.max(1, Math.ceil(distance / (radius / 2)))
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = from.x + (to.x - from.x) * t
    const y = from.y + (to.y - from.y) * t
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, edge)
    gradient.addColorStop(1, fade)
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
  hasRefined.value = true
  scheduleComposite()
}

function resetMask() {
  if (!initialMask)
    return
  paintMask(initialMask)
  composite()
  hasRefined.value = false
}

/* ---------- 导出 ---------- */

function toBlob(canvas: HTMLCanvasElement, mime: string) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob)
          resolve(blob)
        else
          reject(new Error('导出失败'))
      },
      mime,
    )
  })
}

async function downloadImage() {
  const out = outCanvasRef.value
  if (!out || status.value !== 'ready') {
    message.warning('请先完成抠图')
    return
  }

  try {
    const blob = await toBlob(out, 'image/png')
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    anchor.download = `${fileNameBase.value || 'image'}-no-bg.png`
    anchor.click()
    URL.revokeObjectURL(anchor.href)
  }
  catch {
    message.error('导出失败，请重试')
  }
}

/** 棋盘格底纹：透明区域以此提示，颜色跟随亮暗主题的 muted 令牌 */
const checkerboardStyle = {
  backgroundImage: [
    'linear-gradient(45deg, rgb(var(--muted)) 25%, transparent 25%)',
    'linear-gradient(-45deg, rgb(var(--muted)) 25%, transparent 25%)',
    'linear-gradient(45deg, transparent 75%, rgb(var(--muted)) 75%)',
    'linear-gradient(-45deg, transparent 75%, rgb(var(--muted)) 75%)',
  ].join(','),
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
}
</script>

<template>
  <div
    class="flex flex-col gap-4"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
  >
    <!-- 空状态：上传引导 -->
    <div
      v-if="!imageSrc"
      class="flex min-h-320px flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border p-8 text-center transition-colors"
      :class="isDragging ? 'border-primary bg-primary/5' : ''"
    >
      <span class="icon-box size-12 text-muted-foreground">
        <Upload :size="22" />
      </span>
      <p class="m-0 text-sm text-muted-foreground">
        将图片拖到这里、粘贴截图，或
      </p>
      <a-upload accept="image/*" :show-upload-list="false" :before-upload="pickFile">
        <a-button type="primary">
          选择图片
        </a-button>
      </a-upload>
      <p class="m-0 text-xs text-muted-foreground">
        首次使用需下载约 19MB 模型与推理引擎（之后缓存生效），图片全程不出浏览器
      </p>
    </div>

    <template v-else>
      <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <!-- 预览区：棋盘格上直接涂抹修正 -->
        <div class="flex min-w-0 flex-col gap-2">
          <div
            class="relative flex h-360px items-center justify-center overflow-hidden rounded-md border border-border lg:h-420px"
            :style="checkerboardStyle"
          >
            <canvas
              ref="outCanvasRef"
              class="max-h-full max-w-full"
              :class="status === 'ready' ? 'cursor-crosshair' : ''"
              style="touch-action: none"
              aria-label="抠图结果预览"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointercancel="onPointerUp"
            />

            <!-- 处理中 / 失败覆盖层 -->
            <div
              v-if="isBusy || status === 'error'"
              class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/85 p-4 text-center"
            >
              <template v-if="status === 'downloading'">
                <a-progress :percent="progressPercent" :format="() => progressLabel" stroke-color="rgb(var(--primary))" class="w-220px" />
                <p class="m-0 text-sm text-muted-foreground">
                  正在下载 AI 模型，首次约 19MB…
                </p>
              </template>
              <template v-else-if="status === 'running'">
                <a-spin />
                <p class="m-0 text-sm text-muted-foreground">
                  AI 正在分割主体（首次还需加载推理引擎）…
                </p>
              </template>
              <template v-else>
                <p class="m-0 text-sm text-cinnabar">
                  {{ errorText }}
                </p>
                <a-button size="small" @click="runBackgroundRemoval">
                  重试
                </a-button>
              </template>
            </div>
          </div>
          <p class="m-0 text-center text-xs text-muted-foreground">
            {{ status === 'ready' ? '在图上拖动涂抹修正：恢复补回主体，擦除去掉多余部分' : '透明区域以棋盘格显示' }}
          </p>
        </div>

        <!-- 参数 -->
        <a-form layout="vertical" class="min-w-0">
          <a-form-item label="笔刷">
            <a-radio-group v-model:value="brushMode" button-style="solid" size="small" :disabled="status !== 'ready'">
              <a-radio-button value="restore">
                恢复
              </a-radio-button>
              <a-radio-button value="erase">
                擦除
              </a-radio-button>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="笔刷粗细">
            <a-slider v-model:value="brushSize" :min="8" :max="96" :disabled="status !== 'ready'" />
          </a-form-item>

          <a-form-item class="!mb-0">
            <a-space wrap>
              <a-button type="primary" :disabled="status !== 'ready'" @click="downloadImage">
                下载 PNG
              </a-button>
              <a-button :disabled="!hasRefined" @click="resetMask">
                <template #icon>
                  <RotateCcw :size="13" />
                </template>
                重置笔刷
              </a-button>
              <a-upload accept="image/*" :show-upload-list="false" :before-upload="pickFile">
                <a-button>
                  <template #icon>
                    <Upload :size="14" />
                  </template>
                  换一张
                </a-button>
              </a-upload>
            </a-space>
          </a-form-item>
        </a-form>
      </div>
    </template>
  </div>
</template>
