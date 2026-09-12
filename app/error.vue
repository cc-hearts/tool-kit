<script setup lang="ts">
import zhCN from 'antdv-next/locale/zh_CN'

const props = defineProps<{ error: { statusCode?: number, statusMessage?: string } }>()

const isNotFound = computed(() => props.error.statusCode === 404)
const { isDark, themeConfig } = useTheme()

// error.vue 不在 app.vue 的根组件树内，需在此补齐 .dark 类与 ConfigProvider，
// 否则错误页会退回 antdv 默认亮色主题
useHead({
  htmlAttrs: {
    class: computed(() => (isDark.value ? 'dark' : '')),
  },
})

function backToMarket() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <a-config-provider :locale="zhCN" :theme="themeConfig">
    <div class="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <a-result
        :status="isNotFound ? '404' : '500'"
        :title="String(error.statusCode ?? 500)"
        :sub-title="isNotFound ? '工具不存在或已被移除' : '页面出错了，请稍后重试'"
      >
        <template #extra>
          <a-button type="primary" @click="backToMarket">
            返回工具市场
          </a-button>
        </template>
      </a-result>
    </div>
  </a-config-provider>
</template>
