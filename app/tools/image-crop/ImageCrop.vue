<script setup lang="ts">
import type { Area } from '@antdv-next/vue-easy-crop'
import Cropper from '@antdv-next/vue-easy-crop'
import { App } from 'antdv-next'
import { RefreshCw, Upload } from 'lucide-vue-next'

const { message } = App.useApp()

type OutputFormat = 'png' | 'jpeg' | 'webp'

interface AspectOption {
  label: string
  value: number
}

const aspectOptions: AspectOption[] = [
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
const aspect = ref(1)
const cropShape = ref<'round' | 'rect'>('round')
const showGrid = ref(true)

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
  resetTransform()

  createImage(imageSrc.value)
    .then((img) => {
      sourceImage = img
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

/**
 * 用足够容纳旋转后图像的正方形画布先「摆正」源图，
 * 再从其上截取裁剪框区域，与 cropper 预览保持一致。
 */
function buildCroppedCanvas(area: Area, round: boolean, flattenWhite: boolean) {
  if (!sourceImage)
    return null

  const maxSide = Math.max(sourceImage.naturalWidth, sourceImage.naturalHeight)
  const safeSize = Math.round(maxSide * Math.SQRT2)

  const work = document.createElement('canvas')
  work.width = safeSize
  work.height = safeSize
  const workCtx = work.getContext('2d')
  if (!workCtx)
    return null

  workCtx.translate(safeSize / 2, safeSize / 2)
  workCtx.rotate((rotation.value * Math.PI) / 180)
  workCtx.translate(-safeSize / 2, -safeSize / 2)
  workCtx.drawImage(
    sourceImage,
    (safeSize - sourceImage.naturalWidth) / 2,
    (safeSize - sourceImage.naturalHeight) / 2,
  )

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
  const area = croppedAreaPixels.value
  const canvas = previewCanvasRef.value
  if (!area || !canvas || !sourceImage)
    return

  const cropped = buildCroppedCanvas(area, cropShape.value === 'round', false)
  if (!cropped)
    return

  // 预览画布内部分辨率对齐裁剪区域（封顶 800），显示尺寸固定收进预览框
  canvas.width = Math.min(cropped.width, 800)
  canvas.height = Math.min(cropped.height, 800)
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(cropped, 0, 0, canvas.width, canvas.height)
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

watch(cropShape, scheduleDraw)

const outputSizeLabel = computed(() => {
  const area = croppedAreaPixels.value
  if (!area)
    return ''
  return `${Math.round(area.width)} × ${Math.round(area.height)} px`
})

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
  const area = croppedAreaPixels.value
  if (!area || !sourceImage) {
    message.warning('请先选择图片')
    return
  }

  isExporting.value = true
  try {
    const canvas = buildCroppedCanvas(area, cropShape.value === 'round', outputFormat.value === 'jpeg')
    if (!canvas)
      throw new Error('导出失败')
    const blob = await toBlob(canvas, MIME[outputFormat.value], quality.value)
    const ext = outputFormat.value === 'jpeg' ? 'jpg' : outputFormat.value
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    anchor.download = `${fileNameBase.value}-cropped.${ext}`
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
              :aspect="aspect"
              :crop-shape="cropShape"
              :show-grid="showGrid"
              :min-zoom="1"
              :max-zoom="3"
              :zoom-with-scroll="true"
              @crop-area-change="onCropAreaChange"
            />
          </div>
          <p class="m-0 text-center text-xs text-muted-foreground">
            拖动调整位置 · 滚轮缩放 · 方向键微调
          </p>
        </div>

        <!-- 参数 -->
        <a-form layout="vertical" class="min-w-0">
          <a-form-item label="裁剪比例">
            <a-radio-group v-model:value="aspect" button-style="solid" size="small">
              <a-radio-button v-for="option in aspectOptions" :key="option.label" :value="option.value">
                {{ option.label }}
              </a-radio-button>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="裁剪形状">
            <a-radio-group v-model:value="cropShape" button-style="solid" size="small">
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
              <a-slider v-model:value="rotation" :min="-180" :max="180" :tip-formatter="(v?: number) => `${v ?? 0}°`" class="flex-1" />
              <a-button size="small" @click="rotation = 0">
                <template #icon>
                  <RefreshCw :size="13" />
                </template>
              </a-button>
            </div>
          </a-form-item>

          <a-form-item label="缩放">
            <a-slider v-model:value="zoom" :min="1" :max="3" :step="0.01" />
          </a-form-item>

          <a-form-item class="!mb-0">
            <a-checkbox v-model:checked="showGrid">
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
            将保存为 {{ fileNameBase || 'image' }}-cropped.{{ outputFormat === 'jpeg' ? 'jpg' : outputFormat }}
          </p>
        </a-form>
      </div>
    </template>
  </div>
</template>
