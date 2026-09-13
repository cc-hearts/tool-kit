<script setup lang="ts">
import type { PromptItem } from '~/prompts'

defineProps<{
  prompts: PromptItem[]
}>()

const emit = defineEmits<{
  (e: 'openVariables', prompt: PromptItem): void
  (e: 'openDetail', prompt: PromptItem): void
  (e: 'toggleFavorite', id: string): void
  (e: 'copied', id: string): void
}>()
</script>

<template>
  <div v-if="prompts.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <PromptCard
      v-for="item in prompts"
      :key="item.id"
      :prompt="item"
      @open-variables="p => emit('openVariables', p)"
      @open-detail="p => emit('openDetail', p)"
      @toggle-favorite="id => emit('toggleFavorite', id)"
      @copied="id => emit('copied', id)"
    />
  </div>
  <a-empty v-else description="没有找到匹配的提示词模板" class="mt-20" />
</template>
