<script setup lang="ts">
import { getToolBySlug } from '~/tools'

const route = useRoute()
const tool = getToolBySlug(String(route.params.slug))

if (!tool) {
  throw createError({ statusCode: 404, statusMessage: '工具不存在', fatal: true })
}

// 工具视图按需加载：仅访问对应详情页时才下载实现代码
const ToolView = defineAsyncComponent(tool.component)

useSeoMeta({
  title: `${tool.name} · Tool Kit`,
  description: tool.description,
  ogTitle: `${tool.name} · Tool Kit`,
  ogDescription: tool.description,
  twitterTitle: `${tool.name} · Tool Kit`,
  twitterDescription: tool.description,
})
</script>

<template>
  <ToolPageShell :tool="tool">
    <!-- 懒加载期间的占位，避免客户端切换工具时内容区闪空 -->
    <Suspense>
      <ToolView />
      <template #fallback>
        <a-skeleton active :paragraph="{ rows: 6 }" />
      </template>
    </Suspense>
  </ToolPageShell>
</template>
