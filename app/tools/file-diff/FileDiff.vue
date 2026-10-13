<script setup lang="ts">
import { App } from 'antdv-next'
import { ArrowLeftRight, Eraser, FileUp } from 'lucide-vue-next'
import type { DiffCell } from './diff'
import { DIFF_LINE_LIMIT, diffTexts } from './diff'
import DiffText from './DiffText.vue'

type Side = 'left' | 'right'

interface UnifiedLine {
  /** 原文件行号；该行只在另一侧存在时为 null */
  oldLine: number | null
  /** 新文件行号；该行只在另一侧存在时为 null */
  newLine: number | null
  cell: DiffCell
}

/** 单侧文件大小上限：整份文本要读进内存参与对比，再大就超出浏览器可承受范围 */
const MAX_FILE_BYTES = 4 * 1024 * 1024

/** 差异行高（px）：等宽字体单行不换行，行高固定后虚拟滚动才能按行号直接换算偏移 */
const ROW_HEIGHT = 20

/** 视口外多渲染的行数：快速滚动时留出缓冲，避免边缘空白 */
const OVERSCAN = 8

/** 并排视图栏宽下限（ch）：窗口很窄时也要保证两栏可读 */
const MIN_PANE_CH = 28

/** 并排视图栏宽上限（ch）：超长行（压缩代码、min.js）交给单元格自己横向滚动，不撑爆整页 */
const MAX_PANE_CH = 320

/** 行首标记：与 git diff 观感保持一致 */
const markers: Record<DiffCell['state'], string> = { equal: ' ', added: '+', removed: '-' }

const { message } = App.useApp()

const sides = [
  { key: 'left' as Side, title: '原文件（旧）', placeholder: '粘贴旧内容，或点右上角「选择文件」' },
  { key: 'right' as Side, title: '新文件（新）', placeholder: '粘贴新内容，或点右上角「选择文件」' },
]

const panes = reactive<Record<Side, { text: string, name: string }>>({
  left: { text: '', name: '' },
  right: { text: '', name: '' },
})

const view = ref<'split' | 'unified'>('split')

// 原生 file input 由「选择文件」按钮间接触发，省掉一层上传组件
const fileInputs: Record<Side, HTMLInputElement | null> = { left: null, right: null }

// 虚拟滚动状态：结果区自身是滚动容器，只渲染窗口内的行
const bodyRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const viewportHeight = ref(0)

const result = computed(() => (panes.left.text || panes.right.text)
  ? diffTexts(panes.left.text, panes.right.text)
  : null)

const identical = computed(() => result.value !== null
  && result.value.stats.added === 0
  && result.value.stats.removed === 0)

/**
 * 估算文本的显示列数：CJK / 全角字符按 2 列计。
 * 并排视图用它算出稳定的栏宽 —— 若交给浏览器按窗口内容自动定宽，
 * 滚动时窗口内的行变了，列宽会跟着抖动。
 */
function displayWidth(text: string): number {
  let width = 0
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    const wide = code >= 0x1100 && (code <= 0x115f
      || (code >= 0x2e80 && code <= 0xa4cf)
      || (code >= 0xac00 && code <= 0xd7a3)
      || (code >= 0xf900 && code <= 0xfaff)
      || (code >= 0xfe30 && code <= 0xfe6f)
      || (code >= 0xff00 && code <= 0xff60)
      || (code >= 0xffe0 && code <= 0xffe6))
    width += wide ? 2 : 1
  }
  return width
}

/** 并排视图栏宽（CSS 长度）：最长行宽度 + 行号/标记占位，用 ch 单位保证等宽字体下对齐 */
const paneWidth = computed(() => {
  let maxWidth = 0
  for (const row of result.value?.rows ?? []) {
    if (row.left)
      maxWidth = Math.max(maxWidth, displayWidth(row.left.text))
    if (row.right)
      maxWidth = Math.max(maxWidth, displayWidth(row.right.text))
  }
  // 8ch 覆盖行号、标记与内边距
  return `${Math.min(Math.max(maxWidth + 8, MIN_PANE_CH), MAX_PANE_CH)}ch`
})

/** 统一视图的行模型：相等行占一行、显示两侧行号；配对的差异行拆成删除行与新增行 */
const unifiedLines = computed(() => (result.value?.rows ?? []).flatMap<UnifiedLine>((row) => {
  if (!row.changed && row.left && row.right)
    return [{ oldLine: row.left.line, newLine: row.right.line, cell: row.left }]

  const lines: UnifiedLine[] = []
  if (row.left)
    lines.push({ oldLine: row.left.line, newLine: null, cell: row.left })
  if (row.right)
    lines.push({ oldLine: null, newLine: row.right.line, cell: row.right })
  return lines
}))

/** 当前视图的逻辑总行数（统一视图一行可能拆成两行） */
const totalLines = computed(() => view.value === 'split'
  ? (result.value?.rows.length ?? 0)
  : unifiedLines.value.length)

/** 虚拟滚动窗口：内容变化后长度可能变短，因此起点要钳在最后一行之内 */
const visibleWindow = computed(() => {
  const total = totalLines.value
  const start = Math.min(
    Math.max(0, total - 1),
    Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - OVERSCAN),
  )
  const end = Math.min(
    total,
    Math.max(start + 1, Math.ceil((scrollTop.value + viewportHeight.value) / ROW_HEIGHT) + OVERSCAN),
  )
  return { start, end: Math.max(end, start) }
})

const topSpacerHeight = computed(() => visibleWindow.value.start * ROW_HEIGHT)

const bottomSpacerHeight = computed(() => Math.max(0, totalLines.value - visibleWindow.value.end) * ROW_HEIGHT)

const renderedRows = computed(() => (result.value?.rows ?? [])
  .slice(visibleWindow.value.start, visibleWindow.value.end))

const renderedUnifiedLines = computed(() => unifiedLines.value
  .slice(visibleWindow.value.start, visibleWindow.value.end))

function onScroll() {
  scrollTop.value = bodyRef.value?.scrollTop ?? 0
}

function measureViewport() {
  viewportHeight.value = bodyRef.value?.clientHeight ?? 0
}

let resizeObserver: ResizeObserver | undefined

onMounted(() => {
  resizeObserver = new ResizeObserver(measureViewport)
  if (bodyRef.value)
    resizeObserver.observe(bodyRef.value)
  measureViewport()
})

onBeforeUnmount(() => resizeObserver?.disconnect())

// 结果区挂载 / 卸载时重新绑定观察者，并回到顶部
watch(bodyRef, (element) => {
  resizeObserver?.disconnect()
  if (!element)
    return
  resizeObserver?.observe(element)
  element.scrollTop = 0
  scrollTop.value = 0
  measureViewport()
}, { flush: 'post' })

// 两个视图的行号含义不同，切换后回到顶部，避免停在错位处
watch(view, () => {
  if (bodyRef.value)
    bodyRef.value.scrollTop = 0
  scrollTop.value = 0
})

async function loadFile(side: Side, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  // 清空 value，否则再次选择同一个文件不会触发 change
  input.value = ''
  if (!file)
    return

  if (file.size > MAX_FILE_BYTES) {
    message.error(`文件超过 ${MAX_FILE_BYTES / 1024 / 1024}MB，无法在浏览器内对比`)
    return
  }

  const text = await file.text()
  if (text.includes('\u0000')) {
    message.error('检测到二进制内容，无法按文本对比')
    return
  }

  panes[side].text = text
  panes[side].name = file.name
}

function clearPane(side: Side) {
  panes[side].text = ''
  panes[side].name = ''
}

function swapSides() {
  const left = { ...panes.left }
  panes.left = { ...panes.right }
  panes.right = left
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-4 lg:grid-cols-2">
      <a-card v-for="side in sides" :key="side.key" size="small" :title="side.title">
        <template #extra>
          <a-space :size="4">
            <span v-if="panes[side.key].name" class="max-w-40 truncate text-xs text-muted-foreground">
              {{ panes[side.key].name }}
            </span>
            <a-button size="small" type="text" @click="fileInputs[side.key]?.click()">
              <template #icon>
                <FileUp :size="14" />
              </template>
              选择文件
            </a-button>
            <a-button size="small" type="text" :disabled="!panes[side.key].text" @click="clearPane(side.key)">
              <template #icon>
                <Eraser :size="14" />
              </template>
              清空
            </a-button>
          </a-space>
        </template>

        <a-textarea
          v-model:value="panes[side.key].text"
          class="!font-mono !text-xs"
          :rows="10"
          :placeholder="side.placeholder"
        />
        <input
          :ref="(el) => { fileInputs[side.key] = el as HTMLInputElement | null }"
          type="file"
          class="hidden"
          @change="loadFile(side.key, $event)"
        >
      </a-card>
    </div>

    <a-card size="small" title="差异结果">
      <template #extra>
        <a-space :size="4">
          <a-radio-group v-model:value="view" size="small" button-style="solid">
            <a-radio-button value="split">
              并排
            </a-radio-button>
            <a-radio-button value="unified">
              统一
            </a-radio-button>
          </a-radio-group>
          <a-button
            size="small"
            type="text"
            :disabled="!panes.left.text && !panes.right.text"
            @click="swapSides"
          >
            <template #icon>
              <ArrowLeftRight :size="14" />
            </template>
            交换
          </a-button>
        </a-space>
      </template>

      <a-empty v-if="!result" description="粘贴内容或选择文件后自动对比" />

      <template v-else>
        <div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
          <a-tag color="green" class="!m-0">
            +{{ result.stats.added }}
          </a-tag>
          <a-tag color="red" class="!m-0">
            -{{ result.stats.removed }}
          </a-tag>
          <span class="text-muted-foreground">{{ result.stats.unchanged }} 行未变</span>
          <a-tag v-if="identical" color="blue" class="!m-0">
            两侧内容完全一致
          </a-tag>
        </div>

        <a-alert
          v-if="result.coarse"
          type="warning"
          show-icon
          class="mb-3"
          :message="`两侧合计超过 ${DIFF_LINE_LIMIT} 行，已改用粗略对比（中间整块视为替换）`"
        />

        <!-- 虚拟滚动：只渲染窗口内的行，上下用占位块撑出真实滚动高度 -->
        <div
          ref="bodyRef"
          class="diff-body font-mono text-xs"
          :style="{ '--diff-row-h': `${ROW_HEIGHT}px`, '--pane-w': paneWidth }"
          @scroll.passive="onScroll"
        >
          <div v-if="view === 'split'" class="diff-grid">
            <div v-if="topSpacerHeight" class="diff-spacer" :style="{ height: `${topSpacerHeight}px` }" />

            <div
              v-for="(row, rowIndex) in renderedRows"
              :key="visibleWindow.start + rowIndex"
              class="diff-row"
            >
              <div
                class="diff-cell"
                :class="row.left ? `diff-cell--${row.left.state}` : 'diff-cell--void'"
              >
                <span class="diff-gutter">{{ row.left?.line ?? '' }}</span>
                <span class="diff-marker">{{ row.left ? markers[row.left.state] : '' }}</span>
                <DiffText v-if="row.left" :cell="row.left" />
              </div>
              <div
                class="diff-cell"
                :class="row.right ? `diff-cell--${row.right.state}` : 'diff-cell--void'"
              >
                <span class="diff-gutter">{{ row.right?.line ?? '' }}</span>
                <span class="diff-marker">{{ row.right ? markers[row.right.state] : '' }}</span>
                <DiffText v-if="row.right" :cell="row.right" />
              </div>
            </div>

            <div v-if="bottomSpacerHeight" class="diff-spacer" :style="{ height: `${bottomSpacerHeight}px` }" />
          </div>

          <template v-else>
            <div v-if="topSpacerHeight" class="diff-spacer" :style="{ height: `${topSpacerHeight}px` }" />

            <div
              v-for="(line, lineIndex) in renderedUnifiedLines"
              :key="visibleWindow.start + lineIndex"
              class="diff-cell"
              :class="`diff-cell--${line.cell.state}`"
            >
              <span class="diff-gutter">{{ line.oldLine ?? '' }}</span>
              <span class="diff-gutter">{{ line.newLine ?? '' }}</span>
              <span class="diff-marker">{{ markers[line.cell.state] }}</span>
              <DiffText :cell="line.cell" />
            </div>

            <div v-if="bottomSpacerHeight" class="diff-spacer" :style="{ height: `${bottomSpacerHeight}px` }" />
          </template>
        </div>

        <p class="mb-0 mt-3 text-center text-xs text-muted-foreground">
          对比全部在浏览器本地完成，不会上传任何数据。
        </p>
      </template>
    </a-card>
  </div>
</template>

<style scoped>
.diff-body {
  max-height: 34rem;
  overflow: auto;
  border: 1px solid rgb(var(--border));
  border-radius: 10px;
  background-color: rgb(var(--card));
}

/* 并排视图：列宽由 --pane-w 给出（JS 按全量文本算），滚动时列宽稳定；
   容器不够宽时两列一起溢出，交给 .diff-body 横向滚动 */
.diff-grid {
  display: grid;
  grid-template-columns: minmax(var(--pane-w), 1fr) minmax(var(--pane-w), 1fr);
  width: 100%;
}

.diff-row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  height: var(--diff-row-h);
}

.diff-spacer {
  flex: none;
}

.diff-grid .diff-spacer {
  grid-column: 1 / -1;
}

.diff-cell {
  display: flex;
  align-items: center;
  height: var(--diff-row-h);
  padding: 0 8px;
  white-space: pre;
}

/* 并排视图的单元格宽度由列宽封顶，超长行在单元格内自滚动；
   统一视图保留整行宽度，横向滚动统一交给 .diff-body */
.diff-grid .diff-cell {
  overflow-x: auto;
  overflow-y: hidden;
}

.diff-grid .diff-cell + .diff-cell {
  border-left: 1px solid rgb(var(--border));
}

/* 一侧没有对应行时用斜纹占位，避免读成「空白行」 */
.diff-cell--void {
  background-image: repeating-linear-gradient(
    45deg,
    transparent 0 5px,
    rgb(var(--muted) / 0.7) 5px 10px
  );
}

.diff-cell--removed {
  background-color: rgb(192 57 43 / 0.1);
}

.diff-cell--added {
  background-color: rgb(16 185 129 / 0.12);
}

.dark .diff-cell--removed {
  background-color: rgb(224 106 82 / 0.16);
}

.dark .diff-cell--added {
  background-color: rgb(16 185 129 / 0.18);
}

.diff-gutter {
  flex: none;
  width: 3.5em;
  padding-right: 8px;
  color: rgb(var(--muted-foreground));
  text-align: right;
  font-variant-numeric: tabular-nums;
  user-select: none;
}

.diff-marker {
  flex: none;
  width: 1.2em;
  text-align: center;
  user-select: none;
}
</style>
