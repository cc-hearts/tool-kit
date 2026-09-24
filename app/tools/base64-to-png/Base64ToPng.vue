<script setup lang="ts">
import { message } from 'antdv-next'
import {
  ArrowRightLeft,
  Check,
  Clipboard,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  FileImage,
  ImageIcon,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-vue-next'
import { copyText } from '~/utils/clipboard'
import { SAMPLE_PNG_BASE64 } from './sample'

type Mode = 'b64-to-png' | 'png-to-b64'

const mode = ref<Mode>('b64-to-png')

/* =========================================================================
   通用辅助函数
   ========================================================================= */

function formatBytes(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function calculateGcd(a: number, b: number): number {
  return b === 0 ? a : calculateGcd(b, a % b)
}

function getAspectRatio(w: number, h: number): string {
  if (!w || !h)
    return '—'
  const gcd = calculateGcd(w, h)
  const rw = w / gcd
  const rh = h / gcd
  if (rw <= 21 && rh <= 21)
    return `${rw}:${rh}`
  return `${(w / h).toFixed(2)}:1`
}

/* =========================================================================
   模式一：Base64 转 PNG
   ========================================================================= */

const inputBase64 = ref('')
const b64FileName = ref('image')
const isConverting = ref(false)
const parseError = ref('')

interface ConvertedPngState {
  blob: Blob
  objectUrl: string
  dataUrl: string
  width: number
  height: number
  originalMime: string
  originalSizeEstimate: number
  isConvertedFromOtherFormat: boolean
}

const convertedState = shallowRef<ConvertedPngState | null>(null)

// 跟踪创建的 ObjectURL 以便销毁
let currentB64ObjectUrl = ''

function cleanupB64ObjectUrl() {
  if (currentB64ObjectUrl) {
    URL.revokeObjectURL(currentB64ObjectUrl)
    currentB64ObjectUrl = ''
  }
}

/** 清理并提取纯净的 Base64 与 Mime 类型 */
function sanitizeBase64(raw: string): { mimeType: string, cleanBase64: string } | null {
  let text = raw.trim()
  if (!text)
    return null

  // 剔除两侧的引号
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith('\'') && text.endsWith('\'')))
    text = text.slice(1, -1).trim()

  // 剔除 CSS url(...) 包裹
  const urlMatch = /^url\(\s*['"]?(.*?)['"]?\s*\)$/i.exec(text)
  if (urlMatch && urlMatch[1])
    text = urlMatch[1].trim()

  // 剔除 Markdown 语法：![...](...)
  const mdMatch = /!\[.*?\]\(\s*['"]?(.*?)['"]?\s*\)/.exec(text)
  if (mdMatch && mdMatch[1])
    text = mdMatch[1].trim()

  // 剔除 HTML img 标签 src 属性
  const imgMatch = /<img[^>]+src=["']([^"']+)["']/i.exec(text)
  if (imgMatch && imgMatch[1])
    text = imgMatch[1].trim()

  // 匹配带头部 Data URL: data:image/xxx;base64,xxxx
  const dataUrlRegex = /^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/is
  const dataUrlMatch = dataUrlRegex.exec(text)

  if (dataUrlMatch) {
    const rawMime = dataUrlMatch[1]?.toLowerCase() ?? 'png'
    const cleanBase64 = (dataUrlMatch[2] ?? '').replace(/\s+/g, '')
    return {
      mimeType: rawMime === 'svg' ? 'svg+xml' : rawMime,
      cleanBase64,
    }
  }

  // 无头部纯 Base64：清除内部空格/换行
  const cleanBase64 = text.replace(/\s+/g, '')

  // 基于常见文件魔数推测格式
  let guessedMime = 'png'
  if (cleanBase64.startsWith('iVBORw0KGgo'))
    guessedMime = 'png'
  else if (cleanBase64.startsWith('/9j/'))
    guessedMime = 'jpeg'
  else if (cleanBase64.startsWith('R0lGOD'))
    guessedMime = 'gif'
  else if (cleanBase64.startsWith('UklGR'))
    guessedMime = 'webp'
  else if (cleanBase64.startsWith('PHN2Zy') || cleanBase64.startsWith('PD94bW'))
    guessedMime = 'svg+xml'
  else if (cleanBase64.startsWith('Qk0'))
    guessedMime = 'bmp'

  return {
    mimeType: guessedMime,
    cleanBase64,
  }
}

/** 将 Base64 还原为二进制 Uint8Array */
function base64ToUint8Array(base64: string): Uint8Array {
  let standard = base64.replace(/-/g, '+').replace(/_/g, '/')
  const pad = standard.length % 4
  if (pad)
    standard += '='.repeat(4 - pad)

  const binaryStr = atob(standard)
  const len = binaryStr.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++)
    bytes[i] = binaryStr.charCodeAt(i)
  return bytes
}

let parseTimer: ReturnType<typeof setTimeout> | undefined

watch(inputBase64, (val) => {
  clearTimeout(parseTimer)
  parseTimer = setTimeout(() => {
    processBase64Input(val)
  }, 250)
})

async function processBase64Input(raw: string) {
  cleanupB64ObjectUrl()
  convertedState.value = null
  parseError.value = ''

  if (!raw.trim())
    return

  isConverting.value = true

  try {
    const parsed = sanitizeBase64(raw)
    if (!parsed || !parsed.cleanBase64) {
      parseError.value = '未检测到有效的 Base64 字符串'
      isConverting.value = false
      return
    }

    const { mimeType, cleanBase64 } = parsed

    // 语法级检验
    let bytes: Uint8Array
    try {
      bytes = base64ToUint8Array(cleanBase64)
    }
    catch {
      parseError.value = 'Base64 字符编码非法，请检查是否存在乱码或截断'
      isConverting.value = false
      return
    }

    const sourceDataUrl = `data:image/${mimeType};base64,${cleanBase64}`

    // 载入图片对象以检验其能否被图形管线成功解码
    const img = new Image()
    const loadPromise = new Promise<{ width: number, height: number }>((resolve, reject) => {
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = () => reject(new Error('图片解码失败，Base64 数据可能已损坏'))
    })

    img.src = sourceDataUrl
    const { width, height } = await loadPromise

    // 若原图就是 PNG，可直接从二进制构造 Blob，保留 100% 原始字节与元数据
    let finalBlob: Blob
    let isConverted = false

    if (mimeType === 'png') {
      finalBlob = new Blob([bytes], { type: 'image/png' })
    }
    else {
      // 若原图为 JPEG / WebP / SVG 等格式，通过 Canvas 绘制并强制转为真正的 PNG
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx)
        throw new Error('Canvas 2D 上下文获取失败')

      ctx.drawImage(img, 0, 0)
      const blobPromise = new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob)
            resolve(blob)
          else reject(new Error('Canvas 导出 PNG 失败'))
        }, 'image/png')
      })
      finalBlob = await blobPromise
      isConverted = true
    }

    currentB64ObjectUrl = URL.createObjectURL(finalBlob)

    convertedState.value = {
      blob: finalBlob,
      objectUrl: currentB64ObjectUrl,
      dataUrl: mimeType === 'png' ? sourceDataUrl : await blobToDataUrl(finalBlob),
      width,
      height,
      originalMime: mimeType.toUpperCase(),
      originalSizeEstimate: bytes.length,
      isConvertedFromOtherFormat: isConverted,
    }
  }
  catch (err: any) {
    parseError.value = err.message || '图片解析失败，请检查 Base64 内容'
  }
  finally {
    isConverting.value = false
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/** 一键填入示例数据 */
function fillSample() {
  inputBase64.value = SAMPLE_PNG_BASE64
  message.success('已填入示例 PNG Base64 数据')
}

/** 从剪贴板粘贴文本 */
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    if (!text.trim()) {
      message.warning('剪贴板中没有文本内容')
      return
    }
    inputBase64.value = text
    message.success('已从剪贴板粘贴')
  }
  catch {
    message.error('无法读取剪贴板，请使用 Ctrl+V 手动粘贴')
  }
}

/** 读取上传的 Base64 文本文件或图片文件 */
function handleB64FileUpload(file: File) {
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = () => {
      inputBase64.value = reader.result as string
      message.success(`已载入图片：${file.name}`)
    }
    reader.readAsDataURL(file)
  }
  else {
    const reader = new FileReader()
    reader.onload = () => {
      inputBase64.value = (reader.result as string) || ''
      message.success(`已载入文件：${file.name}`)
    }
    reader.readAsText(file)
  }
  return false
}

/** 下载 PNG 文件 */
function downloadPng() {
  if (!convertedState.value)
    return
  const safeName = (b64FileName.value.trim() || 'image').replace(/\.png$/i, '')
  const a = document.createElement('a')
  a.href = convertedState.value.objectUrl
  a.download = `${safeName}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  message.success(`开始下载 ${safeName}.png`)
}

/** 复制 PNG 图片到系统剪贴板（可直接粘贴进聊天软件、Office、Figma） */
async function copyPngImageToClipboard() {
  if (!convertedState.value)
    return

  if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
    message.warning('当前浏览器环境不支持直接向剪贴板写入图片文件，请点击“下载图片”')
    return
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': convertedState.value.blob,
      }),
    ])
    message.success('已复制 PNG 图片，可直接在飞书、微信、Figma 等应用中 Ctrl+V 粘贴')
  }
  catch {
    message.error('复制图片失败，可能受浏览器权限或操作系统限制，建议直接下载')
  }
}

/** 复制 Data URL */
async function copyPngDataUrl() {
  if (!convertedState.value)
    return
  await copyText(convertedState.value.dataUrl)
  message.success('已复制完整 Data URL')
}

/** 复制纯 Base64 */
async function copyPureBase64() {
  if (!convertedState.value)
    return
  const pure = convertedState.value.dataUrl.replace(/^data:image\/[a-z0-9+.-]+;base64,/i, '')
  await copyText(pure)
  message.success('已复制纯 Base64 编码')
}

function clearB64Input() {
  inputBase64.value = ''
  convertedState.value = null
  parseError.value = ''
  cleanupB64ObjectUrl()
}

/* =========================================================================
   模式二：PNG 转 Base64
   ========================================================================= */

const isP2BDragging = ref(false)
const p2bImageFile = ref<File | null>(null)
const p2bDataUrl = ref('')
const p2bWidth = ref(0)
const p2bHeight = ref(0)
const p2bFileSize = ref(0)
const p2bActiveFormat = ref<'dataUrl' | 'pure' | 'img' | 'css'>('dataUrl')

let p2bCurrentObjectUrl = ''

function cleanupP2bObjectUrl() {
  if (p2bCurrentObjectUrl) {
    URL.revokeObjectURL(p2bCurrentObjectUrl)
    p2bCurrentObjectUrl = ''
  }
}

function handleP2bFile(file: File) {
  if (!file.type.startsWith('image/')) {
    message.warning('请选择图片文件')
    return false
  }

  cleanupP2bObjectUrl()
  p2bImageFile.value = file
  p2bFileSize.value = file.size

  const reader = new FileReader()
  reader.onload = () => {
    const rawDataUrl = reader.result as string
    const probe = new Image()
    probe.onload = () => {
      p2bWidth.value = probe.naturalWidth
      p2bHeight.value = probe.naturalHeight

      // 如果不是 PNG，通过 Canvas 转换为真正的 PNG 格式输出
      if (file.type !== 'image/png') {
        const canvas = document.createElement('canvas')
        canvas.width = probe.naturalWidth
        canvas.height = probe.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(probe, 0, 0)
        p2bDataUrl.value = canvas.toDataURL('image/png')
      }
      else {
        p2bDataUrl.value = rawDataUrl
      }
      p2bCurrentObjectUrl = URL.createObjectURL(file)
    }
    probe.src = rawDataUrl
  }
  reader.readAsDataURL(file)
  return false
}

function onP2bDrop(event: DragEvent) {
  isP2BDragging.value = false
  const files = Array.from(event.dataTransfer?.files ?? [])
  const first = files.find(f => f.type.startsWith('image/'))
  if (first)
    handleP2bFile(first)
  else
    message.warning('拖入的文件中未找到支持的图片')
}

const p2bPureBase64 = computed(() => {
  if (!p2bDataUrl.value)
    return ''
  return p2bDataUrl.value.replace(/^data:image\/[a-z0-9+.-]+;base64,/i, '')
})

const p2bHtmlTag = computed(() => {
  if (!p2bDataUrl.value)
    return ''
  return `<img src="${p2bDataUrl.value}" alt="${p2bImageFile.value?.name || 'image'}" />`
})

const p2bCssBackground = computed(() => {
  if (!p2bDataUrl.value)
    return ''
  return `background-image: url('${p2bDataUrl.value}');`
})

const currentFormatValue = computed(() => {
  switch (p2bActiveFormat.value) {
    case 'dataUrl':
      return p2bDataUrl.value
    case 'pure':
      return p2bPureBase64.value
    case 'img':
      return p2bHtmlTag.value
    case 'css':
      return p2bCssBackground.value
  }
})

async function copyCurrentFormat() {
  if (!currentFormatValue.value)
    return
  await copyText(currentFormatValue.value)
  message.success('已复制到剪贴板')
}

function clearP2b() {
  cleanupP2bObjectUrl()
  p2bImageFile.value = null
  p2bDataUrl.value = ''
  p2bWidth.value = 0
  p2bHeight.value = 0
  p2bFileSize.value = 0
}

/* 全局剪贴板图片粘贴（支持截图直接粘贴） */
function handleGlobalPaste(e: ClipboardEvent) {
  const target = e.target as HTMLElement | null
  // 避免在普通文本输入框内拦截
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable))
    return

  const items = Array.from(e.clipboardData?.items ?? [])
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        if (mode.value === 'b64-to-png') {
          // 在 Base64 模式下转为 dataUrl 赋给输入框
          const reader = new FileReader()
          reader.onload = () => {
            inputBase64.value = reader.result as string
            message.success('已从剪贴板截图载入 Base64')
          }
          reader.readAsDataURL(file)
        }
        else {
          handleP2bFile(file)
          message.success('已从剪贴板截图载入图片')
        }
        break
      }
    }
  }
}

onMounted(() => {
  window.addEventListener('paste', handleGlobalPaste)
})

onBeforeUnmount(() => {
  window.removeEventListener('paste', handleGlobalPaste)
  cleanupB64ObjectUrl()
  cleanupP2bObjectUrl()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 顶部模式切换 -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <a-radio-group v-model:value="mode" button-style="solid">
        <a-radio-button value="b64-to-png">
          <span class="inline-flex items-center gap-1.5">
            <FileImage :size="15" />
            Base64 转 PNG
          </span>
        </a-radio-button>
        <a-radio-button value="png-to-b64">
          <span class="inline-flex items-center gap-1.5">
            <ArrowRightLeft :size="15" />
            PNG 转 Base64
          </span>
        </a-radio-button>
      </a-radio-group>
      <span class="text-xs text-muted-foreground">
        100% 浏览器本地解析转换 · 零网络传输 · 隐私安全
      </span>
    </div>

    <!-- ==================== 模式一：Base64 转 PNG ==================== -->
    <template v-if="mode === 'b64-to-png'">
      <div class="flex flex-col gap-3">
        <!-- 操作栏 -->
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <a-button size="small" @click="pasteFromClipboard">
              <template #icon>
                <Clipboard :size="13" />
              </template>
              从剪贴板粘贴
            </a-button>
            <a-button size="small" @click="fillSample">
              <template #icon>
                <Sparkles :size="13" />
              </template>
              填入示例
            </a-button>
            <a-upload
              accept=".txt,.b64,image/*"
              :show-upload-list="false"
              :before-upload="handleB64FileUpload"
            >
              <a-button size="small">
                <template #icon>
                  <Upload :size="13" />
                </template>
                导入文件
              </a-button>
            </a-upload>
          </div>
          <a-button
            v-if="inputBase64"
            danger
            type="text"
            size="small"
            @click="clearB64Input"
          >
            <template #icon>
              <Trash2 :size="13" />
            </template>
            清空输入
          </a-button>
        </div>

        <!-- Base64 输入框 -->
        <a-textarea
          v-model:value="inputBase64"
          :rows="5"
          placeholder="粘贴 Base64 字符串或 Data URL（如 data:image/png;base64,iVBORw0KGgo...），支持 url(...) 或 Markdown 语法"
          allow-clear
          class="font-mono text-xs"
        />

        <div class="flex items-center justify-between text-xs text-muted-foreground">
          <span>输入长度：{{ inputBase64.length.toLocaleString() }} 字符</span>
          <span>支持 PNG、JPEG、WebP、GIF、SVG、BMP 自动识别与转为标准 PNG</span>
        </div>
      </div>

      <!-- 错误提示 -->
      <a-alert
        v-if="parseError"
        type="error"
        show-icon
        :message="parseError"
        class="mb-2"
      />

      <!-- 空状态 -->
      <div
        v-if="!convertedState && !parseError"
        class="flex min-h-240px flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border p-8 text-center"
      >
        <span class="icon-box size-12 text-muted-foreground">
          <FileImage :size="24" />
        </span>
        <p class="m-0 text-sm font-medium">
          请在上方输入框粘贴 Base64 数据
        </p>
        <p class="m-0 text-xs text-muted-foreground">
          或直接点击「填入示例」快速预览透明底 PNG 转换效果
        </p>
      </div>

      <!-- 转换成功展示区 -->
      <div v-else-if="convertedState" class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <!-- 画布：棋盘格透明背景 -->
        <div class="flex flex-col gap-2">
          <div class="preview-stage flex min-h-340px items-center justify-center overflow-hidden rounded-md border border-border p-6">
            <a-image
              :src="convertedState.objectUrl"
              alt="Base64 转换预览"
            />
          </div>
          <span class="text-center text-xs text-muted-foreground">
            透明底棋盘网格已开启 · 点击图片可放大、旋转查看细节
          </span>
        </div>

        <!-- 右侧元信息与操作面板 -->
        <aside class="flex flex-col gap-4 rounded-md border border-border bg-card p-5">
          <div class="flex items-center justify-between border-b border-border pb-3">
            <h3 class="m-0 text-base font-semibold">
              图片元信息
            </h3>
            <a-tag color="blue">
              PNG (image/png)
            </a-tag>
          </div>

          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p class="mb-1 text-xs text-muted-foreground">
                图片尺寸
              </p>
              <p class="m-0 font-medium">
                {{ convertedState.width }} × {{ convertedState.height }} px
              </p>
            </div>
            <div>
              <p class="mb-1 text-xs text-muted-foreground">
                宽高比
              </p>
              <p class="m-0 font-medium">
                {{ getAspectRatio(convertedState.width, convertedState.height) }}
              </p>
            </div>
            <div>
              <p class="mb-1 text-xs text-muted-foreground">
                PNG 文件大小
              </p>
              <p class="m-0 font-medium text-primary">
                {{ formatBytes(convertedState.blob.size) }}
              </p>
            </div>
            <div>
              <p class="mb-1 text-xs text-muted-foreground">
                源格式
              </p>
              <p class="m-0 font-medium">
                {{ convertedState.originalMime }}
                <span v-if="convertedState.isConvertedFromOtherFormat" class="text-xs text-amber-500">
                  (已转PNG)
                </span>
              </p>
            </div>
          </div>

          <div class="rounded bg-muted p-2.5 text-xs text-muted-foreground">
            <span>Base64 文本开销约为二进制文件的 133%，下载为 PNG 文件可节省约 <strong>33%</strong> 存储空间与带宽。</span>
          </div>

          <!-- 导出配置与按钮 -->
          <div class="flex flex-col gap-3 pt-2">
            <div>
              <label class="mb-1.5 block text-xs text-muted-foreground">
                保存文件名
              </label>
              <a-input
                v-model:value="b64FileName"
                placeholder="文件名"
                addon-after=".png"
              />
            </div>

            <!-- 主动作：下载 PNG -->
            <a-button
              type="primary"
              block
              size="large"
              class="flex items-center justify-center gap-1.5 font-medium"
              @click="downloadPng"
            >
              <Download :size="16" />
              下载 PNG 图片
            </a-button>

            <!-- 复制图片到剪贴板 -->
            <a-button
              block
              class="flex items-center justify-center gap-1.5"
              @click="copyPngImageToClipboard"
            >
              <Copy :size="14" />
              复制图片到剪贴板
            </a-button>

            <!-- 更多辅助复制 -->
            <div class="grid grid-cols-2 gap-2">
              <a-button size="small" @click="copyPngDataUrl">
                <FileCode :size="13" />
                复制 Data URL
              </a-button>
              <a-button size="small" @click="copyPureBase64">
                <Copy :size="13" />
                复制纯 Base64
              </a-button>
            </div>

            <a-button
              type="link"
              size="small"
              :href="convertedState.objectUrl"
              target="_blank"
              class="flex items-center justify-center gap-1 text-xs text-muted-foreground"
            >
              <ExternalLink :size="13" />
              在新窗口中打开原图
            </a-button>
          </div>
        </aside>
      </div>
    </template>

    <!-- ==================== 模式二：PNG 转 Base64 ==================== -->
    <template v-else>
      <div
        class="flex min-h-200px flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border p-8 text-center transition-colors"
        :class="isP2BDragging ? 'border-primary bg-primary/5' : ''"
        @dragover.prevent="isP2BDragging = true"
        @dragleave.prevent="isP2BDragging = false"
        @drop.prevent="onP2bDrop"
      >
        <span class="icon-box size-12 text-muted-foreground">
          <Upload :size="22" />
        </span>
        <div>
          <p class="m-0 text-sm font-medium">
            拖拽 PNG / 图片文件至此处，或
          </p>
          <p class="m-0 mt-0.5 text-xs text-muted-foreground">
            也支持直接使用 Ctrl+V 粘贴系统截图
          </p>
        </div>
        <a-upload
          accept="image/*"
          :show-upload-list="false"
          :before-upload="handleP2bFile"
        >
          <a-button type="primary">
            <template #icon>
              <Upload :size="14" />
            </template>
            选择本地图片
          </a-button>
        </a-upload>
      </div>

      <!-- 输出区域 -->
      <template v-if="p2bDataUrl">
        <div class="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <!-- 预览缩略图 -->
          <div class="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
            <div class="preview-stage flex h-160px items-center justify-center overflow-hidden rounded border border-border">
              <a-image :src="p2bDataUrl" />
            </div>
            <div class="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
              <span class="truncate font-medium text-foreground">
                {{ p2bImageFile?.name || 'pasted-image.png' }}
              </span>
              <span>尺寸：{{ p2bWidth }} × {{ p2bHeight }} px</span>
              <span>原始体积：{{ formatBytes(p2bFileSize) }}</span>
              <span>Base64 长度：{{ p2bPureBase64.length.toLocaleString() }} 字符</span>
            </div>
            <a-button danger size="small" class="mt-2" @click="clearP2b">
              <template #icon>
                <Trash2 :size="13" />
              </template>
              清空重选
            </a-button>
          </div>

          <!-- Base64 输出代码与格式切换 -->
          <div class="flex flex-col gap-3 rounded-md border border-border bg-card p-5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <a-radio-group v-model:value="p2bActiveFormat" size="small" button-style="solid">
                <a-radio-button value="dataUrl">
                  完整 Data URL
                </a-radio-button>
                <a-radio-button value="pure">
                  纯 Base64
                </a-radio-button>
                <a-radio-button value="img">
                  HTML &lt;img&gt;
                </a-radio-button>
                <a-radio-button value="css">
                  CSS Background
                </a-radio-button>
              </a-radio-group>

              <a-button type="primary" size="small" @click="copyCurrentFormat">
                <template #icon>
                  <Copy :size="13" />
                </template>
                一键复制
              </a-button>
            </div>

            <a-textarea
              :value="currentFormatValue"
              readonly
              :rows="8"
              class="font-mono text-xs"
            />

            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span>点击“一键复制”可直接拷走对应格式代码</span>
              <a-button type="link" size="small" class="!p-0 text-xs" @click="copyCurrentFormat">
                复制当前格式 ({{ currentFormatValue.length.toLocaleString() }} 字符)
              </a-button>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
/* 经典透明底棋盘格样式 */
.preview-stage {
  background-image:
    linear-gradient(45deg, rgb(var(--muted)) 25%, transparent 25%),
    linear-gradient(-45deg, rgb(var(--muted)) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgb(var(--muted)) 75%),
    linear-gradient(-45deg, transparent 75%, rgb(var(--muted)) 75%);
  background-size: 16px 16px;
  background-position:
    0 0,
    0 8px,
    8px -8px,
    -8px 0;
}

.preview-stage :deep(img) {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 380px;
  object-fit: contain;
}
</style>
