<script setup lang="ts">
import { Github, Moon, Sun } from 'lucide-vue-next'
import { activeSection } from '~/sections'

const GITHUB_URL = 'https://github.com/cc-hearts/tool-kit'

const route = useRoute()
const { isDark, toggle } = useTheme()

/** 搜索占位文案跟随当前栏目；Latin 栏目名前后补空格更自然 */
const searchPlaceholder = computed(() => {
  const label = activeSection(route.path)?.label ?? '内容'
  return `搜索${/^[A-Za-z]/.test(label) ? ' ' : ''}${label}...`
})

/** ⌘K / Ctrl+K 聚焦顶部搜索 */
const searchRef = ref<{ focus: () => void }>()

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchRef.value?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <!-- 顶部栏对齐 mcp.so：上行「品牌 + 宽搜索 + GitHub / 主题」，下行栏目 tab。
       两行共用一条底边，tab 的选中下划线压在底边上。
       背景用不透明的 bg-background：半透明 + backdrop-blur 会让方格纸底纹从头部透出来，
       头部区域出现几道淡淡的网格线，读起来很脏 -->
  <header class="app-header sticky top-0 z-50 border-b border-border bg-transparent backdrop-blur-[4px]">
    <div class="page-container flex h-14 items-center gap-3">
      <NuxtLink to="/" class="group flex shrink-0 items-center gap-2 font-semibold tracking-tight">
        <span class="icon-box size-8 transition-colors group-hover:border-cinnabar-border group-hover:text-cinnabar">
          <AppLogo :size="18" />
        </span>
        <span class="text-base max-sm:hidden">Tool Kit</span>
      </NuxtLink>

      <!-- 搜索居中、宽度收敛到 26rem：
           顶部栏是「品牌 / 搜索 / 操作」三段式，搜索过宽会读成一条横贯的表单 -->
      <div class="flex min-w-0 flex-1 justify-center">
        <ToolSearch ref="searchRef" :placeholder="searchPlaceholder" size="middle" max-width="26rem" show-shortcut />
      </div>

      <a-tooltip title="GitHub 仓库">
        <a-button type="text" :href="GITHUB_URL" target="_blank" rel="noopener noreferrer"
          class="!flex size-9 shrink-0 items-center justify-center" aria-label="GitHub 仓库">
          <template #icon>
            <Github :size="16" />
          </template>
        </a-button>
      </a-tooltip>

      <a-tooltip :title="isDark ? '切换为亮色模式' : '切换为暗色模式'">
        <a-button type="text" class="!flex size-9 shrink-0 items-center justify-center"
          :aria-label="isDark ? '切换为亮色模式' : '切换为暗色模式'" @click="toggle">
          <template #icon>
            <Moon v-if="!isDark" :size="16" />
            <Sun v-else :size="16" />
          </template>
        </a-button>
      </a-tooltip>
    </div>

    <div class="page-container">
      <SectionNav />
    </div>
  </header>
</template>
