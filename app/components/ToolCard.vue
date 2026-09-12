<script setup lang="ts">
import type { ToolMeta } from '~/tools/types'

defineProps<{ tool: ToolMeta }>()
</script>

<template>
  <NuxtLink
    :to="`/tools/${tool.slug}`"
    class="tool-surface group flex flex-col gap-3 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
  >
    <div class="flex items-start gap-3">
      <span
        class="icon-box size-10 shrink-0"
        :style="tool.accent ? { color: tool.accent, backgroundColor: `${tool.accent}1a` } : undefined"
      >
        <component :is="tool.icon" :size="20" />
      </span>
      <div class="min-w-0">
        <div class="text-sm font-semibold tracking-tight transition-colors group-hover:text-cinnabar-deep">
          {{ tool.name }}
        </div>
        <p class="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {{ tool.description }}
        </p>
      </div>
    </div>
    <div class="flex flex-wrap gap-1.5">
      <a-tag v-for="tag in tool.tags" :key="tag" class="!m-0">
        {{ tag }}
      </a-tag>
    </div>
  </NuxtLink>
</template>
