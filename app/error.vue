<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number, statusMessage?: string } }>()

const isNotFound = computed(() => props.error.statusCode === 404)

function backToMarket() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
    <a-result
      :status="isNotFound ? '404' : '500'"
      :title="String(error.statusCode ?? 500)"
      :sub-title="isNotFound ? '工具不存在或已被移除' : '页面出错了，请稍后重试'"
    >
      <template #extra>
        <a-button type="primary" @click="backToMarket">
          返回工具市场
        </a-button>
      </template>
    </a-result>
  </div>
</template>
