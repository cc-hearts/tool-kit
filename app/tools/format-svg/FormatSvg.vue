<script setup lang="ts">
import { js2xml, xml2json } from 'xml-js'
import { Copy, Download, Upload } from 'lucide-vue-next'
import type { UploadProps } from 'ant-design-vue'
import { copyText } from '~/utils/clipboard'

const source = ref('')
const isDragging = ref(false)

/**
 * 图标化清洗：
 * - 所有元素的 fill/stroke（含 style 内联样式）统一为 currentColor，保留 fill="none" 的镂空语义
 * - 剔除 title / script / 注释节点与 on* 事件属性，输出可直接用于 v-html 预览
 */
function transformNode(node: any) {
  if (!node)
    return

  if (Array.isArray(node.elements)) {
    node.elements = node.elements.filter(
      (target: any) => target.type !== 'comment' && !['title', 'script'].includes(target.name),
    )
    node.elements.forEach(target => transformNode(target))
  }

  if (node.type !== 'element')
    return

  const attrs = node.attributes
  if (!attrs)
    return

  for (const name of Object.keys(attrs)) {
    // 事件属性一律移除（onload / onclick 等），避免内联 SVG 执行任意代码
    if (/^on/i.test(name))
      delete attrs[name]
  }

  for (const name of ['fill', 'stroke']) {
    const value = attrs[name]
    if (value && value !== 'none')
      attrs[name] = 'currentColor'
  }

  if (typeof attrs.style === 'string') {
    attrs.style = attrs.style
      .replace(/(fill|stroke)\s*:\s*(?!none)[^;]+/g, '$1: currentColor')
      .trim()
    if (!attrs.style)
      delete attrs.style
  }
}

const parseResult = computed<{ output: string, error: string }>(() => {
  if (!source.value.trim())
    return { output: '', error: '' }

  try {
    const root = JSON.parse(xml2json(source.value, { compact: false }))
    transformNode(root)
    return { output: js2xml(root, { spaces: 2 }), error: '' }
  }
  catch {
    return { output: '', error: 'SVG 解析失败，请检查内容是否为合法的 SVG 源码' }
  }
})

/** 预览：currentColor 由容器文字色提供，可直接观察暗色下的呈现 */
const previewNode = computed(() => {
  if (!parseResult.value.output)
    return ''
  const wrapped = JSON.parse(xml2json(parseResult.value.output, { compact: false }))
  const svgRoot = wrapped.elements?.find((node: any) => node.name === 'svg')
  if (svgRoot?.attributes) {
    svgRoot.attributes.width = '100%'
    svgRoot.attributes.height = '100%'
    delete svgRoot.attributes.id
  }
  return js2xml(wrapped)
})

function downloadOutput() {
  if (!parseResult.value.output)
    return
  const blob = new Blob([parseResult.value.output], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'icon.svg'
  anchor.click()
  URL.revokeObjectURL(url)
}

function readFile(file: File) {
  const reader = new FileReader()
  reader.onload = () => (source.value = String(reader.result ?? ''))
  reader.readAsText(file)
}

/** 阻断 a-upload 自动上传，文件内容交给本地解析 */
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  readFile(file as unknown as File)
  return false
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file)
    readFile(file)
}

function onDragOver() {
  isDragging.value = true
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      class="grid items-stretch gap-4 lg:grid-cols-[1fr_240px]"
      @dragover.prevent="onDragOver"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
    >
      <a-card
        size="small"
        title="SVG 源码"
        :class="isDragging ? 'border-primary' : ''"
        class="h-full transition-colors"
      >
        <template #extra>
          <a-upload accept=".svg,image/svg+xml" :show-upload-list="false" :before-upload="beforeUpload">
            <a-button size="small" type="text">
              <template #icon>
                <Upload :size="14" />
              </template>
              选择文件
            </a-button>
          </a-upload>
        </template>
        <a-textarea
          v-model:value="source"
          :rows="14"
          placeholder="在此粘贴 SVG 源码，或将 .svg 文件拖入页面..."
        />
        <a-alert v-if="parseResult.error" type="error" :message="parseResult.error" show-icon class="mt-2" />
      </a-card>

      <a-card
        size="small"
        title="预览"
        class="h-full"
        :body-style="{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '176px' }"
      >
        <span
          v-if="previewNode"
          class="block h-40 w-full text-foreground [&>svg]:h-full [&>svg]:w-full"
          v-html="previewNode"
        />
        <span v-else class="text-xs text-muted-foreground">暂无内容</span>
      </a-card>
    </div>

    <a-card size="small" title="格式化结果">
      <template #extra>
        <a-space>
          <a-button size="small" type="text" :disabled="!parseResult.output" @click="copyText(parseResult.output)">
            <template #icon>
              <Copy :size="14" />
            </template>
            复制
          </a-button>
          <a-button size="small" type="text" :disabled="!parseResult.output" @click="downloadOutput">
            <template #icon>
              <Download :size="14" />
            </template>
            下载 .svg
          </a-button>
        </a-space>
      </template>
      <a-textarea :value="parseResult.output" :rows="14" readonly placeholder="格式化结果" />
    </a-card>
  </div>
</template>
