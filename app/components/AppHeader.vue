<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { isDark, toggle } = useTheme()

const keyword = ref(typeof route.query.q === 'string' ? route.query.q : '')

// 关键词以 URL query 为唯一数据源，市场页与头部搜索框保持同步
watch(() => route.query.q, (q) => {
  keyword.value = typeof q === 'string' ? q : ''
})

watch(keyword, (value) => {
  router.replace({ path: '/', query: { ...route.query, q: value.trim() || undefined } })
})
</script>

<template>
  <header class="app-header sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
    <div class="page-container mx-auto flex h-14 max-w-1200px items-center gap-3">
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
      />

      <a-tooltip :title="isDark ? '切换为亮色模式' : '切换为暗色模式'">
        <a-button type="text" class="!flex size-9 items-center justify-center" @click="toggle">
          <template #icon>
            <Moon v-if="!isDark" :size="16" />
            <Sun v-else :size="16" />
          </template>
        </a-button>
      </a-tooltip>
    </div>
  </header>
</template>
