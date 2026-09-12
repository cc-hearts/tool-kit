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
    <!-- a-app 在 ConfigProvider 内部挂载 message / notification / modal 容器，
         工具组件统一通过 App.useApp() 取用，反馈弹层才能继承主题与语言 -->
    <a-app>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </a-app>
  </a-config-provider>
</template>
