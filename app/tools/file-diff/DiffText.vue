<script setup lang="ts">
import type { DiffCell } from './diff'

/** 单行文本渲染：带有词级片段时按片段着色，否则整行输出 */
defineProps<{ cell: DiffCell }>()
</script>

<template>
  <span v-if="!cell.segments" class="diff-text">{{ cell.text }}</span>
  <span v-else class="diff-text">
    <span
      v-for="(segment, index) in cell.segments"
      :key="index"
      :class="segment.changed ? `diff-seg diff-seg--${cell.state}` : undefined"
    >{{ segment.text }}</span>
  </span>
</template>

<style scoped>
/* 词级差异底色比整行底色重一档，才能在一整行高亮里看出具体改了哪几个词 */
.diff-text {
  white-space: pre;
}

.diff-seg {
  border-radius: 2px;
}

.diff-seg--removed {
  background-color: rgb(192 57 43 / 0.3);
}

.diff-seg--added {
  background-color: rgb(16 185 129 / 0.32);
}

.dark .diff-seg--removed {
  background-color: rgb(224 106 82 / 0.34);
}

.dark .diff-seg--added {
  background-color: rgb(16 185 129 / 0.36);
}
</style>
