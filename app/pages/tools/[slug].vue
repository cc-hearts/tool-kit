<script setup lang="ts">
import { getToolBySlug } from '~/tools'

const route = useRoute()
const tool = getToolBySlug(String(route.params.slug))

if (!tool) {
  throw createError({ statusCode: 404, statusMessage: '工具不存在', fatal: true })
}

// 工具视图按需加载：仅访问对应详情页时才下载实现代码
const ToolView = defineAsyncComponent(tool.component)

useHead({ title: `${tool.name} · Tool Kit` })
</script>

<template>
  <ToolPageShell :tool="tool">
    <ToolView />
  </ToolPageShell>
</template>
