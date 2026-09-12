<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { sections } from '~/sections'

const section = sections.find(item => item.key === 'prompts')!

useHead({ title: '提示词 · Tool Kit' })
</script>

<template>
  <!-- 栏目占位页：沿用同一套栏目体系，后续接入真实数据即可 -->
  <div class="page-container flex flex-1 flex-col items-center justify-center py-24 text-center">
    <span class="icon-box size-12">
      <Sparkles :size="22" />
    </span>
    <h1 class="mb-0 mt-5 text-xl font-semibold tracking-tight">
      {{ section.label }}
    </h1>
    <p class="mb-0 mt-2 max-w-md text-sm text-muted-foreground">
      {{ section.description }}
    </p>
    <a-tag class="mt-6">
      建设中
    </a-tag>
  </div>
</template>
