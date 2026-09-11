<script setup lang="ts">
import { message } from 'ant-design-vue'
import { ExternalLink, Images, Link2, Trash2, Upload } from 'lucide-vue-next'

type Mode = 'single' | 'multi'

interface ImageItem {
  /** 图片地址：http(s) / data: / 本地 blob: */
  src: string
  /** 展示名：文件名或链接末段 */
  name: string
  /** 本地文件大小（字节），链接图为空 */
  bytes?: number
}

const SINGLE_PLACEHOLDER = '输入图片链接（http/https），回车立即预览'
const MULTI_PLACEHOLDER = `每行一个图片链接，或粘贴 JSON 数组：\n["https://example.com/a.png", "https://example.com/b.png"]`

/** 加载失败时的内置占位图，避免浏览器原生破图样式 */
const IMAGE_FALLBACK
  = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'150\'%3E%3Crect width=\'200\' height=\'150\' fill=\'%23e4e4e7\'/%3E%3Cpath d=\'M60 105 L90 70 L112 95 L128 80 L150 105 Z\' fill=\'%23a1a1aa\'/%3E%3Ccircle cx=\'72\' cy=\'50\' r=\'12\' fill=\'%23a1a1aa\'/%3E%3C/svg%3E'

const mode = ref<Mode>('single')
const isDragging = ref(false)

/* ---------- 对象 URL 生命周期 ---------- */
const createdUrls = new Set<string>()

function trackObjectUrl(url: string) {
  createdUrls.add(url)
}

function revokeUrl(url: string) {
  if (!createdUrls.delete(url))
    return
  URL.revokeObjectURL(url)
}

/* ---------- 文件 → 预览项 ---------- */

function fileToItem(file: File): ImageItem {
  const src = URL.createObjectURL(file)
  trackObjectUrl(src)
  return { src, name: file.name, bytes: file.size }
}

function pickImageFiles(files: File[]) {
  return files.filter(file => file.type.startsWith('image/'))
}

/* ---------- 单图模式 ---------- */

const singleInput = ref('')
const singleItem = ref<ImageItem | null>(null)
const singleError = ref(false)
const singleSize = ref<{ width: number, height: number } | null>(null)

// 链接输入防抖生效，避免逐字输入时反复触发加载
const appliedSingleText = ref('')
let singleTimer: ReturnType<typeof setTimeout> | undefined

watch(singleInput, (value) => {
  clearTimeout(singleTimer)
  singleTimer = setTimeout(() => applySingleText(value), 400)
})

function applySingleText(value: string) {
  const src = value.trim()
  if (!src || src === singleItem.value?.src)
    return
  singleItem.value = { src, name: src }
}

function flushSingleInput() {
  clearTimeout(singleTimer)
  applySingleText(singleInput.value)
}

// 用探针获取原始尺寸与加载结果（a-image 内部 img 无法直接监听 load）
watch(() => singleItem.value?.src, (src) => {
  singleSize.value = null
  singleError.value = false
  if (!src)
    return
  const probe = new Image()
  probe.onload = () => {
    if (singleItem.value?.src !== src)
      return
    singleSize.value = { width: probe.naturalWidth, height: probe.naturalHeight }
  }
  probe.onerror = () => {
    if (singleItem.value?.src === src)
      singleError.value = true
  }
  probe.src = src
})

function loadSingleFiles(files: File[]) {
  const first = pickImageFiles(files)[0]
  if (!first) {
    message.warning('请选择图片文件')
    return
  }
  singleItem.value = fileToItem(first)
  singleInput.value = ''
}

function pickSingleFile(file: File) {
  loadSingleFiles([file])
  return false
}

/* ---------- 多图模式 ---------- */

const multiInput = ref('')
const appliedMultiText = ref('')
let multiTimer: ReturnType<typeof setTimeout> | undefined

watch(multiInput, (value) => {
  clearTimeout(multiTimer)
  multiTimer = setTimeout(() => {
    appliedMultiText.value = value
  }, 400)
})

/** 解析多图输入：支持 JSON 字符串数组或每行一个链接 */
function parseImageSources(raw: string): string[] {
  const text = raw.trim()
  if (!text)
    return []
  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text) as unknown
      if (Array.isArray(parsed))
        return parsed
          .filter((item): item is string => typeof item === 'string' && item.trim() !== '')
          .map(item => item.trim())
    }
    catch {
      // 非法 JSON 回退为逐行解析
    }
  }
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
}

function urlLabel(src: string) {
  if (src.startsWith('data:'))
    return '内联图片'
  try {
    const last = new URL(src).pathname.split('/').filter(Boolean).pop()
    return last ? decodeURIComponent(last) : src
  }
  catch {
    return src
  }
}

const urlItems = computed<ImageItem[]>(() =>
  parseImageSources(appliedMultiText.value).map(src => ({ src, name: urlLabel(src) })))

const fileItems = ref<ImageItem[]>([])

function appendFiles(files: File[]) {
  const items = pickImageFiles(files).map(fileToItem)
  if (items.length)
    fileItems.value.push(...items)
}

function pickMultiFile(file: File) {
  appendFiles([file])
  return false
}

const allItems = computed<ImageItem[]>(() => [...urlItems.value, ...fileItems.value])

const failedSrcs = ref(new Set<string>())
const failedCount = computed(() => failedSrcs.value.size)

function markFailed(src: string) {
  const next = new Set(failedSrcs.value)
  next.add(src)
  failedSrcs.value = next
}

// 列表变化后清理已移除条目的失败记录
watch(allItems, (items) => {
  const alive = new Set(items.map(item => item.src))
  if ([...failedSrcs.value].some(src => !alive.has(src)))
    failedSrcs.value = new Set([...failedSrcs.value].filter(src => alive.has(src)))
})

function clearMulti() {
  multiInput.value = ''
  appliedMultiText.value = ''
  for (const item of fileItems.value)
    revokeUrl(item.src)
  fileItems.value = []
  failedSrcs.value = new Set()
}

/* ---------- 拖拽 / 粘贴 ---------- */

function receiveFiles(files: File[]) {
  if (mode.value === 'single')
    loadSingleFiles(files)
  else
    appendFiles(files)
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const files = Array.from(event.dataTransfer?.files ?? [])
  if (files.length)
    receiveFiles(files)
}

// 输入框内粘贴交给原生行为，避免与全局粘贴冲突
function onPaste(event: ClipboardEvent) {
  const target = event.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable))
    return
  const files = Array.from(event.clipboardData?.files ?? [])
  if (files.length)
    receiveFiles(files)
}

onMounted(() => window.addEventListener('paste', onPaste))
onBeforeUnmount(() => {
  window.removeEventListener('paste', onPaste)
  for (const url of createdUrls)
    URL.revokeObjectURL(url)
  createdUrls.clear()
})

/* ---------- 展示辅助 ---------- */

function formatBytes(bytes: number) {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function guessFormat(item: ImageItem) {
  const inline = /^data:image\/([a-z0-9.+-]+)/i.exec(item.src)
  if (inline)
    return inline[1]?.toUpperCase() ?? '—'
  const match = /\.([a-z0-9]{2,5})(?:[?#]|$)/i.exec(item.name)
  return match?.[1]?.toUpperCase() ?? '—'
}
</script>

<template>
  <div
    class="flex flex-col gap-4"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
  >
    <!-- 模式切换 -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <a-radio-group v-model:value="mode" button-style="solid">
        <a-radio-button value="single">
          单图预览
        </a-radio-button>
        <a-radio-button value="multi">
          多图预览
        </a-radio-button>
      </a-radio-group>
      <span class="text-xs text-muted-foreground">支持拖拽 / 粘贴图片，图片仅在本地处理</span>
    </div>

    <!-- ========== 单图预览 ========== -->
    <template v-if="mode === 'single'">
      <div class="flex flex-wrap items-center gap-2">
        <a-input
          v-model:value="singleInput"
          class="min-w-240px flex-1"
          :placeholder="SINGLE_PLACEHOLDER"
          allow-clear
          @press-enter="flushSingleInput"
        >
          <template #prefix>
            <Link2 :size="14" class="text-muted-foreground" />
          </template>
        </a-input>
        <a-upload accept="image/*" :show-upload-list="false" :before-upload="pickSingleFile">
          <a-button>
            <template #icon>
              <Upload :size="14" />
            </template>
            选择图片
          </a-button>
        </a-upload>
      </div>

      <!-- 空状态 -->
      <div
        v-if="!singleItem"
        class="flex min-h-320px flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border p-8 text-center transition-colors"
        :class="isDragging ? 'border-primary bg-primary/5' : ''"
      >
        <span class="icon-box size-12 text-muted-foreground">
          <Images :size="22" />
        </span>
        <p class="m-0 text-sm text-muted-foreground">
          输入图片链接、拖入本地图片或直接粘贴截图开始预览
        </p>
      </div>

      <template v-else>
        <a-alert
          v-if="singleError"
          type="error"
          show-icon
          message="图片加载失败，请检查链接是否有效"
        />

        <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <!-- 画布：棋盘格背景便于查看透明图 -->
          <div class="preview-stage flex min-h-320px items-center justify-center overflow-hidden rounded-md border border-border p-4">
            <a-image :src="singleItem.src" :alt="singleItem.name" :fallback="IMAGE_FALLBACK" />
          </div>

          <aside class="flex flex-col gap-4 rounded-md border border-border p-4">
            <div>
              <p class="mb-1 text-xs text-muted-foreground">
                来源
              </p>
              <p class="m-0 break-all text-sm line-clamp-3">
                {{ singleItem.name }}
              </p>
            </div>
            <div>
              <p class="mb-1 text-xs text-muted-foreground">
                原始尺寸
              </p>
              <p class="m-0 text-sm">
                {{ singleSize ? `${singleSize.width} × ${singleSize.height} px` : '加载中…' }}
              </p>
            </div>
            <div class="flex gap-8">
              <div>
                <p class="mb-1 text-xs text-muted-foreground">
                  大小
                </p>
                <p class="m-0 text-sm">
                  {{ singleItem.bytes != null ? formatBytes(singleItem.bytes) : '—' }}
                </p>
              </div>
              <div>
                <p class="mb-1 text-xs text-muted-foreground">
                  格式
                </p>
                <p class="m-0 text-sm">
                  {{ guessFormat(singleItem) }}
                </p>
              </div>
            </div>
            <a-space wrap class="mt-1">
              <a-upload accept="image/*" :show-upload-list="false" :before-upload="pickSingleFile">
                <a-button>
                  <template #icon>
                    <Upload :size="14" />
                  </template>
                  换一张
                </a-button>
              </a-upload>
              <a-button :href="singleItem.src" target="_blank" rel="noreferrer">
                <template #icon>
                  <ExternalLink :size="14" />
                </template>
                新窗口打开
              </a-button>
            </a-space>
            <p class="mb-0 text-xs text-muted-foreground">
              点击图片进入大图预览，支持缩放、旋转与翻转
            </p>
          </aside>
        </div>
      </template>
    </template>

    <!-- ========== 多图预览 ========== -->
    <template v-else>
      <a-textarea
        v-model:value="multiInput"
        :rows="4"
        :placeholder="MULTI_PLACEHOLDER"
        allow-clear
      />

      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-xs text-muted-foreground">
          已加载 {{ allItems.length }} 张图片<span v-if="fileItems.length">（含本地上传 {{ fileItems.length }} 张）</span>
        </span>
        <a-space>
          <a-upload accept="image/*" multiple :show-upload-list="false" :before-upload="pickMultiFile">
            <a-button>
              <template #icon>
                <Upload :size="14" />
              </template>
              添加本地图
            </a-button>
          </a-upload>
          <a-button danger :disabled="!allItems.length" @click="clearMulti">
            <template #icon>
              <Trash2 :size="14" />
            </template>
            清空
          </a-button>
        </a-space>
      </div>

      <a-alert
        v-if="failedCount"
        type="warning"
        show-icon
        :message="`${failedCount} 张图片加载失败，将以占位图展示`"
      />

      <!-- 空状态 -->
      <div
        v-if="!allItems.length"
        class="flex min-h-240px flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border p-8 text-center transition-colors"
        :class="isDragging ? 'border-primary bg-primary/5' : ''"
      >
        <span class="icon-box size-12 text-muted-foreground">
          <Images :size="22" />
        </span>
        <p class="m-0 text-sm text-muted-foreground">
          粘贴图片链接数组、拖入多张图片或上传本地图开始预览
        </p>
      </div>

      <template v-else>
        <!-- PreviewGroup 渲染 Fragment，网格布局挂在外层容器上 -->
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <a-image-preview-group>
            <div
              v-for="(item, index) in allItems"
              :key="item.src"
              class="thumb relative h-150px overflow-hidden rounded-md border border-border"
            >
              <span class="absolute left-1.5 top-1.5 z-10 rounded bg-black/55 px-1.5 py-0.5 text-xs text-white">
                {{ index + 1 }}
              </span>
              <a-image :src="item.src" :alt="item.name" :fallback="IMAGE_FALLBACK" @error="markFailed(item.src)" />
            </div>
          </a-image-preview-group>
        </div>

        <p class="mb-0 text-xs text-muted-foreground">
          点击任意图片进入大图浏览，支持 ← / → 切换、缩放与旋转
        </p>
      </template>
    </template>
  </div>
</template>

<style scoped>
/* 透明底棋盘格，便于查看透明 PNG */
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
  max-height: 480px;
  object-fit: contain;
}

.thumb :deep(.ant-image) {
  display: block;
  width: 100%;
  height: 100%;
}

.thumb :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
