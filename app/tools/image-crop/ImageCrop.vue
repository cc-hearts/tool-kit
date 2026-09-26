<script setup lang="ts">
import type { Area } from '@antdv-next/vue-easy-crop'
import Cropper from '@antdv-next/vue-easy-crop'
import { App } from 'antdv-next'
import { RefreshCw, Upload } from 'lucide-vue-next'

const { message } = App.useApp()

type OutputFormat = 'png' | 'jpeg' | 'webp'

/** 'original' = 原图模式：不裁剪，按自然尺寸导出完整图片 */
type AspectValue = 'original' | number

interface AspectOption {
  label: string
  value: AspectValue
}

const aspectOptions: AspectOption[] = [
  { label: '原图', value: 'original' },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
]

const MIME: Record<OutputFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

/* ---------- 源图状态 ---------- */
const imageSrc = ref<string | null>(null)
const fileNameBase = ref('image')
const isDragging = ref(false)

/** 解码后的源图元素（非响应式，避免大图被深度代理拖慢交互） */
let sourceImage: HTMLImageElement | null = null

/* ---------- 裁剪参数 ---------- */
const crop = ref({ x: 0, y: 0 })
const zoom = ref(1)
const rotation = ref(0)
const aspect = ref<AspectValue>('original')
const cropShape = ref<'round' | 'rect'>('rect')
const showGrid = ref(true)

/** 原图模式：锁定缩放/旋转/形状，导出完整自然尺寸 */
const keepOriginal = computed(() => aspect.value === 'original')

/** 自然尺寸（解码后才有值），原图模式据此决定裁剪框比例与导出尺寸 */
const naturalSize = ref<{ width: number, height: number } | null>(null)

/** 圆形裁剪被库强制为 1:1，非原图模式下裁剪框比例取其配置值 */
const effectiveAspect = computed(() => {
  if (keepOriginal.value) {
    const size = naturalSize.value
    return size ? size.width / size.height : 1
  }
  return aspect.value as number
})

const effectiveCropShape = computed<'round' | 'rect'>(() => (keepOriginal.value ? 'rect' : cropShape.value))

/** 圆形裁剪被库强制为 1:1，此时裁剪比例不可用（原图模式下形状被锁为方形） */
const isRoundCrop = computed(() => cropShape.value === 'round')

/* ---------- 导出参数 ---------- */
const outputFormat = ref<OutputFormat>('png')
const quality = ref(0.9)
const croppedAreaPixels = ref<Area | null>(null)

const previewCanvasRef = ref<HTMLCanvasElement | null>(null)

function createImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', () => reject(new Error('图片解码失败')))
    img.src = src
  })
}

function resetTransform() {
  crop.value = { x: 0, y: 0 }
  zoom.value = 1
  rotation.value = 0
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
  naturalSize.value = null
  resetTransform()

  createImage(imageSrc.value)
    .then((img) => {
      sourceImage = img
      naturalSize.value = { width: img.naturalWidth, height: img.naturalHeight }
      scheduleDraw()
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

/* ---------- 裁剪结果 → Canvas ---------- */

/** 旋转后图像的包围盒尺寸，与 cropper 库内部算法保持一致 */
function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

/**
 * 原图模式：按自然尺寸 1:1 重绘，不做任何裁剪、旋转或缩放，
 * 因此导出尺寸与源图完全一致（不依赖裁剪框的取整结果）。
 */
function buildOriginalCanvas() {
  const size = naturalSize.value
  if (!sourceImage || !size)
    return null

  const out = document.createElement('canvas')
  out.width = size.width
  out.height = size.height
  const ctx = out.getContext('2d')
  if (!ctx)
    return null

  ctx.drawImage(sourceImage, 0, 0)
  return out
}

/** 统一出口：原图模式走整图重绘，其余按裁剪框截取 */
function buildResultCanvas(flattenWhite: boolean) {
  if (keepOriginal.value)
    return buildOriginalCanvas()

  const area = croppedAreaPixels.value
  if (!area)
    return null
  return buildCroppedCanvas(area, cropShape.value === 'round', flattenWhite)
}

/**
 * cropper 返回的 croppedAreaPixels 以「旋转后包围盒」为坐标系：
 * 先把旋转后的图像画到与包围盒同尺寸的画布上（图像居中旋转），
 * 再直接用 area.x/y 截取，即可与裁剪框所见保持一致。
 */
function buildCroppedCanvas(area: Area, round: boolean, flattenWhite: boolean) {
  if (!sourceImage)
    return null

  const naturalWidth = sourceImage.naturalWidth
  const naturalHeight = sourceImage.naturalHeight
  const bbox = rotateSize(naturalWidth, naturalHeight, rotation.value)

  const work = document.createElement('canvas')
  work.width = Math.max(1, Math.round(bbox.width))
  work.height = Math.max(1, Math.round(bbox.height))
  const workCtx = work.getContext('2d')
  if (!workCtx)
    return null

  workCtx.translate(work.width / 2, work.height / 2)
  workCtx.rotate((rotation.value * Math.PI) / 180)
  workCtx.translate(-naturalWidth / 2, -naturalHeight / 2)
  workCtx.drawImage(sourceImage, 0, 0)

  const width = Math.max(1, Math.round(area.width))
  const height = Math.max(1, Math.round(area.height))

  const out = document.createElement('canvas')
  out.width = width
  out.height = height
  const ctx = out.getContext('2d')
  if (!ctx)
    return null

  if (flattenWhite) {
    // JPEG 不支持透明，圆形裁剪的四个角需要垫白底
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }

  if (round) {
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2)
    ctx.clip()
  }

  ctx.drawImage(work, area.x, area.y, area.width, area.height, 0, 0, width, height)

  if (round)
    ctx.restore()

  return out
}

function drawPreview() {
  const canvas = previewCanvasRef.value
  if (!canvas || !sourceImage)
    return

  const result = buildResultCanvas(false)
  if (!result)
    return

  // 预览画布内部分辨率对齐结果尺寸（封顶 800），显示尺寸固定收进预览框
  canvas.width = Math.min(result.width, 800)
  canvas.height = Math.min(result.height, 800)
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(result, 0, 0, canvas.width, canvas.height)
}

let drawRafId = 0

/** 交互过程中 rAF 节流重绘预览，避免每次移动都全量绘制 */
function scheduleDraw() {
  if (drawRafId)
    return
  drawRafId = requestAnimationFrame(() => {
    drawRafId = 0
    drawPreview()
  })
}

function onCropAreaChange(_percentages: Area, pixels: Area) {
  croppedAreaPixels.value = pixels
  scheduleDraw()
}

/** 进入原图模式时复位变换与形状：该模式下不裁剪、不旋转、不缩放 */
watch(keepOriginal, (value) => {
  if (value) {
    crop.value = { x: 0, y: 0 }
    zoom.value = 1
    rotation.value = 0
    // 圆形被库强制为 1:1，与原图模式互斥；退出原图模式后保持方形
    cropShape.value = 'rect'
  }
  scheduleDraw()
})

/** 自然尺寸就绪后，原图模式的裁剪框比例与结果尺寸同步刷新 */
watch(naturalSize, scheduleDraw)

/** 圆形裁剪被库强制为 1:1，切换形状时收敛比例，避免「选了比例却仍是方形」 */
watch(cropShape, (shape) => {
  if (shape === 'round' && !keepOriginal.value)
    aspect.value = 1
  scheduleDraw()
})

/**
 * 库在 aspect 变化后只重算裁剪框尺寸、不再派发 crop-area-change，
 * 这里更新一次 crop 引用触发其重新派发，避免预览/输出尺寸停留在上一个比例。
 */
watch(aspect, () => {
  crop.value = { ...crop.value }
}, { flush: 'post' })

const outputSizeLabel = computed(() => {
  if (keepOriginal.value) {
    const size = naturalSize.value
    return size ? `${size.width} × ${size.height} px · 原图` : '原图'
  }
  const area = croppedAreaPixels.value
  if (!area)
    return ''
  return `${Math.round(area.width)} × ${Math.round(area.height)} px`
})

/** 文件名后缀：原图模式不裁剪，用 -original 区分 */
const outputSuffix = computed(() => (keepOriginal.value ? 'original' : 'cropped'))

/* ---------- 下载 ---------- */

const isExporting = ref(false)

function toBlob(canvas: HTMLCanvasElement, mime: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob)
          resolve(blob)
        else
          reject(new Error('导出失败'))
      },
      mime,
      quality,
    )
  })
}

async function downloadImage() {
  if (!sourceImage) {
    message.warning('请先选择图片')
    return
  }

  isExporting.value = true
  try {
    const canvas = buildResultCanvas(outputFormat.value === 'jpeg')
    if (!canvas)
      throw new Error('导出失败')
    const blob = await toBlob(canvas, MIME[outputFormat.value], quality.value)
    const ext = outputFormat.value === 'jpeg' ? 'jpg' : outputFormat.value
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    anchor.download = `${fileNameBase.value}-${outputSuffix.value}.${ext}`
    anchor.click()
    URL.revokeObjectURL(anchor.href)
  }
  catch {
    message.error('导出失败，请重试')
  }
  finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div
    class="flex flex-col gap-4"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
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
    </div>

    <template v-else>
      <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <!-- 裁剪区 -->
        <div class="flex min-w-0 flex-col gap-2">
          <!-- cropper 根节点为绝对定位铺满最近定位祖先，容器必须保持 relative -->
          <div class="relative h-360px overflow-hidden rounded-md border border-border bg-muted lg:h-420px">
            <Cropper
              v-model:crop="crop"
              v-model:zoom="zoom"
              v-model:rotation="rotation"
              :image="imageSrc"
              :aspect="effectiveAspect"
              :crop-shape="effectiveCropShape"
              :show-grid="showGrid"
              :min-zoom="1"
              :max-zoom="keepOriginal ? 1 : 3"
              :zoom-with-scroll="!keepOriginal"
              @crop-area-change="onCropAreaChange"
            />
          </div>
          <p class="m-0 text-center text-xs text-muted-foreground">
            {{ keepOriginal ? '原图模式：不裁剪，导出完整原图' : '拖动调整位置 · 滚轮缩放 · 方向键微调' }}
          </p>
        </div>

        <!-- 参数 -->
        <a-form layout="vertical" class="min-w-0">
          <a-form-item label="裁剪比例">
            <a-radio-group v-model:value="aspect" button-style="solid" size="small" :disabled="isRoundCrop">
              <a-radio-button v-for="option in aspectOptions" :key="option.label" :value="option.value">
                {{ option.label }}
              </a-radio-button>
            </a-radio-group>
            <p class="mb-0 mt-1 text-xs text-muted-foreground">
              {{ isRoundCrop ? '圆形裁剪固定 1:1' : '选「原图」按原始尺寸整图导出，不裁剪' }}
            </p>
          </a-form-item>

          <a-form-item label="裁剪形状">
            <a-radio-group v-model:value="cropShape" button-style="solid" size="small" :disabled="keepOriginal">
              <a-radio-button value="round">
                圆形
              </a-radio-button>
              <a-radio-button value="rect">
                方形
              </a-radio-button>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="旋转">
            <div class="flex items-center gap-2">
              <a-slider v-model:value="rotation" :min="-180" :max="180" :disabled="keepOriginal" :tip-formatter="(v?: number) => `${v ?? 0}°`" class="flex-1" />
              <a-button size="small" :disabled="keepOriginal" @click="rotation = 0">
                <template #icon>
                  <RefreshCw :size="13" />
                </template>
              </a-button>
            </div>
          </a-form-item>

          <a-form-item label="缩放">
            <a-slider v-model:value="zoom" :min="1" :max="3" :step="0.01" :disabled="keepOriginal" />
          </a-form-item>

          <a-form-item class="!mb-0">
            <a-checkbox v-model:checked="showGrid" :disabled="keepOriginal">
              显示网格线
            </a-checkbox>
          </a-form-item>
        </a-form>
      </div>

      <div class="grid items-start gap-4 md:grid-cols-[200px_minmax(0,1fr)]">
        <!-- 预览 -->
        <div class="flex flex-col items-center gap-2 rounded-md border border-border p-4">
          <div class="flex h-176px w-176px items-center justify-center overflow-hidden">
            <canvas
              ref="previewCanvasRef"
              class="max-h-full max-w-full rounded-sm"
              aria-label="裁剪预览"
            />
          </div>
          <span class="text-xs text-muted-foreground">{{ outputSizeLabel || '预览' }}</span>
        </div>

        <!-- 导出 -->
        <a-form layout="vertical">
          <a-form-item label="导出格式">
            <a-radio-group v-model:value="outputFormat" button-style="solid" size="small">
              <a-radio-button value="png">
                PNG
              </a-radio-button>
              <a-radio-button value="jpeg">
                JPEG
              </a-radio-button>
              <a-radio-button value="webp">
                WebP
              </a-radio-button>
            </a-radio-group>
          </a-form-item>

          <a-form-item v-if="outputFormat !== 'png'" label="画质">
            <a-slider v-model:value="quality" :min="0.1" :max="1" :step="0.05" :tip-formatter="(v?: number) => `${Math.round((v ?? 1) * 100)}%`" />
          </a-form-item>

          <a-form-item label="文件名">
            <a-input v-model:value="fileNameBase" placeholder="image" />
          </a-form-item>

          <a-space wrap>
            <a-button type="primary" :loading="isExporting" @click="downloadImage">
              下载裁剪结果
            </a-button>
            <a-upload accept="image/*" :show-upload-list="false" :before-upload="pickFile">
              <a-button>
                <template #icon>
                  <Upload :size="14" />
                </template>
                换一张图片
              </a-button>
            </a-upload>
          </a-space>

          <p class="mb-0 mt-2 text-xs text-muted-foreground">
            将保存为 {{ fileNameBase || 'image' }}-{{ outputSuffix }}.{{ outputFormat === 'jpeg' ? 'jpg' : outputFormat }}
          </p>
        </a-form>
      </div>
    </template>
  </div>
</template>
