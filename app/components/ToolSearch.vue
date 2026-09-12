<script setup lang="ts">
import { activeSection } from '~/sections'

/**
 * 搜索框。
 * 关键词以 URL query 为唯一数据源，因此任何位置的实例都天然保持同步。
 */
interface Props {
  placeholder?: string
  size?: 'middle' | 'large'
  /** 外层最大宽度，默认 36rem */
  maxWidth?: string
  /** 是否展示 ⌘K 快捷键提示 */
  showShortcut?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索工具...',
  size: 'middle',
  maxWidth: '36rem',
  showShortcut: false,
})

const route = useRoute()
const router = useRouter()

const keyword = ref(typeof route.query.q === 'string' ? route.query.q : '')

/** 输入法组合期间的中间态不写回 URL（中文输入会逐字触发 input） */
let composing = false
let syncTimer: ReturnType<typeof setTimeout> | undefined

watch(() => route.query.q, (q) => {
  const next = typeof q === 'string' ? q : ''
  if (next !== keyword.value)
    keyword.value = next
})

// 输入防抖：逐字 replace 会让路由与工具列表反复重算
function scheduleSync() {
  if (composing)
    return
  clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    const next = keyword.value.trim()
    const current = typeof route.query.q === 'string' ? route.query.q : ''
    if (next === current)
      return
    // 搜索始终落在当前栏目内，避免在 /prompts 输入时被弹回首页
    router.replace({
      path: activeSection(route.path)?.to ?? '/',
      query: { ...route.query, q: next || undefined },
    })
  }, 250)
}

function onCompositionStart() {
  composing = true
}

function onCompositionEnd() {
  composing = false
  scheduleSync()
}

watch(keyword, scheduleSync)

onBeforeUnmount(() => clearTimeout(syncTimer))

/** 供外部（顶部栏 ⌘K）聚焦输入框 */
const rootRef = ref<HTMLElement>()
defineExpose({
  focus: () => rootRef.value?.querySelector('input')?.focus(),
})

/** 快捷键提示文案：Mac 显示 ⌘K，其余平台显示 Ctrl K（客户端判定，避免 SSR 水合不一致） */
const shortcutHint = ref('⌘K')
onMounted(() => {
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
  shortcutHint.value = isMac ? '⌘K' : 'Ctrl K'
})
</script>

<template>
  <div ref="rootRef" class="w-full" :style="{ maxWidth: props.maxWidth }">
    <!-- 用 a-input 而不是 a-input-search：搜索是即时筛选，不需要尾部那个提交按钮 -->
    <a-input
      v-model:value="keyword"
      :size="props.size"
      :placeholder="props.placeholder"
      allow-clear
      aria-label="搜索"
      class="tool-search"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
    >
      <template v-if="props.showShortcut" #suffix>
        <!-- 隐藏交给外层 span：scoped 样式带 data 属性，优先级高于 max-sm:hidden 工具类，
             直接写在 .shortcut-badge 上会盖掉 display:none -->
        <ClientOnly>
          <span class="max-sm:hidden">
            <kbd class="shortcut-badge">{{ shortcutHint }}</kbd>
          </span>
        </ClientOnly>
      </template>
    </a-input>
  </div>
</template>

<style scoped>
/* 开了 allow-clear 时，a-input 的根节点本身就是 .ant-input-affix-wrapper，
   所以描边与阴影直接落在 .tool-search 上（不再是后代选择器）。
   搜索框是顶部栏的主操作，给它一条更结实的描边与柔和外扩阴影，
   和页面的纸感形成层次（其余 antd 控件保持默认 token 描边）。 */
.tool-search {
  width: 100%;
  border-color: rgb(var(--foreground) / 0.25);
  box-shadow: 0 1px 2px rgb(var(--foreground) / 0.04);
}

.tool-search:hover {
  border-color: rgb(var(--foreground) / 0.4);
}

.tool-search.ant-input-affix-wrapper-focused {
  border-color: rgb(var(--cinnabar));
  box-shadow: 0 0 0 3px rgb(var(--cinnabar) / 0.12);
}

.shortcut-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.0625rem 0.3125rem;
  border: 1px solid rgb(var(--border));
  border-radius: 0.3125rem;
  background: rgb(var(--muted));
  color: rgb(var(--muted-foreground));
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.6875rem;
  line-height: 1.5;
  pointer-events: none;
}
</style>
