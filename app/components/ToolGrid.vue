<script setup lang="ts">
import type { ToolMeta } from '~/tools/types'

defineProps<{ tools: ToolMeta[] }>()
</script>

<template>
  <div v-if="tools.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <ToolCard v-for="tool in tools" :key="tool.slug" :tool="tool" />
  </div>
  <a-empty v-else description="没有找到匹配的工具" class="mt-20" />
</template>
