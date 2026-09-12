<script setup lang="ts">
import zhCN from 'antdv-next/locale/zh_CN'
import 'dayjs/locale/zh-cn'

const { isDark, themeConfig } = useTheme()

// dark class 放在 html 上，驱动 UnoCSS 的 dark: 变体；SSR 阶段即输出，避免首帧闪烁
useHead({
  htmlAttrs: {
    class: computed(() => (isDark.value ? 'dark' : '')),
  },
  bodyAttrs: {
    class: 'bg-background',
  },
})
</script>

<template>
  <a-config-provider :locale="zhCN" :theme="themeConfig">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </a-config-provider>
</template>
