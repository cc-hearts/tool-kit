<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import type { ToolMeta } from '~/tools/types'

defineProps<{ tool: ToolMeta }>()
</script>

<template>
  <div class="mx-auto w-full max-w-1000px flex-1 px-4 py-8 sm:px-6">
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
    >
      <ArrowLeft :size="14" />
      返回工具市场
    </NuxtLink>

    <header class="mb-6 mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
      <span
        class="icon-box size-12 shrink-0"
        :style="tool.accent ? { color: tool.accent, backgroundColor: `${tool.accent}1a` } : undefined"
      >
        <component :is="tool.icon" :size="24" />
      </span>
      <div class="min-w-0 flex-1 basis-60">
        <h1 class="m-0 text-2xl font-bold tracking-tight">{{ tool.name }}</h1>
        <p class="mb-0 mt-1 text-sm text-muted-foreground">
          {{ tool.description }}
        </p>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <a-tag v-for="tag in tool.tags" :key="tag" class="!m-0">
          {{ tag }}
        </a-tag>
      </div>
    </header>

    <div class="tool-surface p-4 md:p-6">
      <slot />
    </div>
  </div>
</template>
