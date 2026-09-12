<script setup lang="ts">
interface Props {
  size?: number | string
  variant?: 'mark' | 'badge'
}

withDefaults(defineProps<Props>(), {
  size: 20,
  variant: 'mark',
})
</script>

<template>
  <!-- Mark Variant: 响应当前文本色与主题（currentColor） -->
  <svg
    v-if="variant === 'mark'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    :width="size"
    :height="size"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    class="shrink-0 transition-transform duration-200"
  >
    <path d="M 7.5 24.5 L 11.5 20.5" stroke-width="2.5" />
    <path d="M 20.5 11.5 L 24.5 7.5" stroke-width="2.5" />
    <circle cx="16" cy="16" r="3.2" fill="currentColor" stroke="none" />
  </svg>

  <!-- Badge Variant: 独立圆角深色徽章 -->
  <svg
    v-else
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    :width="size"
    :height="size"
    fill="none"
    class="shrink-0"
  >
    <rect width="32" height="32" rx="7" fill="#09090b" />
    <path d="M 7.5 24.5 L 11.5 20.5" stroke="#fafafa" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 20.5 11.5 L 24.5 7.5" stroke="#fafafa" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="16" cy="16" r="3.2" fill="#fafafa" />
  </svg>
</template>
