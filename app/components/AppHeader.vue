<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { isDark, toggle } = useTheme()

const keyword = ref(typeof route.query.q === 'string' ? route.query.q : '')
/** 输入法组合期间的中间态不写回 URL（中文输入会逐字触发 input） */
let composing = false
let syncTimer: ReturnType<typeof setTimeout> | undefined

// 关键词以 URL query 为唯一数据源，市场页与头部搜索框保持同步
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
    router.replace({ path: '/', query: { ...route.query, q: next || undefined } })
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
</script>

<template>
  <header class="app-header sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
    <div class="page-container flex h-14 items-center gap-3">
      <NuxtLink to="/" class="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
        <span class="icon-box size-8">
          <AppLogo :size="18" />
        </span>
        <span class="text-base">Tool Kit</span>
      </NuxtLink>

      <div class="flex-1" />

      <a-input-search
        v-model:value="keyword"
        class="hidden w-64 sm:flex"
        placeholder="搜索工具..."
        allow-clear
        aria-label="搜索工具"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
      />

      <a-tooltip :title="isDark ? '切换为亮色模式' : '切换为暗色模式'">
        <a-button
          type="text"
          class="!flex size-9 items-center justify-center"
          :aria-label="isDark ? '切换为亮色模式' : '切换为暗色模式'"
          @click="toggle"
        >
          <template #icon>
            <Moon v-if="!isDark" :size="16" />
            <Sun v-else :size="16" />
          </template>
        </a-button>
      </a-tooltip>
    </div>
  </header>
</template>
