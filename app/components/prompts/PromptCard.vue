<script setup lang="ts">
import { App } from 'antdv-next'
import { Check, Copy, Eye, Heart, Sliders, Terminal } from 'lucide-vue-next'
import { formatCliCommand, type PromptItem } from '~/prompts'
import { copyText } from '~/utils/clipboard'

const props = defineProps<{
  prompt: PromptItem
}>()

const emit = defineEmits<{
  (e: 'openVariables', prompt: PromptItem): void
  (e: 'openDetail', prompt: PromptItem): void
  (e: 'toggleFavorite', id: string): void
  (e: 'copied', id: string): void
}>()

const { message } = App.useApp()
const isCopied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | undefined

async function handleCopyPrompt() {
  const ok = await copyText(props.prompt.prompt)
  if (ok) {
    emit('copied', props.prompt.id)
    isCopied.value = true
    message.success('已复制核心提示词')
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      isCopied.value = false
    }, 2000)
  }
  else {
    message.error('复制失败，请检查剪贴板权限')
  }
}

async function handleCopyCli() {
  const cliText = formatCliCommand(props.prompt)
  const ok = await copyText(cliText)
  if (ok) {
    emit('copied', props.prompt.id)
    message.success('已复制 /imagine 生图命令')
  }
  else {
    message.error('复制失败，请检查剪贴板权限')
  }
}

onBeforeUnmount(() => clearTimeout(copyTimer))
</script>

<template>
  <article class="tool-surface group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
    <!-- 顶部生图效果缩略图 -->
    <div class="relative aspect-[16/10] w-full overflow-hidden bg-muted">
      <img
        v-if="prompt.previewImages?.[0]"
        :src="prompt.previewImages[0]"
        :alt="prompt.title"
        loading="lazy"
        class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
      >
      <div v-else class="flex size-full items-center justify-center text-xs text-muted-foreground">
        无预览图
      </div>

      <!-- 顶部浮层标签 -->
      <div class="absolute inset-x-2.5 top-2.5 flex items-center justify-between">
        <!-- 模型标签 -->
        <span class="rounded-md border border-border/50 bg-background/85 px-2 py-0.5 text-xs font-medium backdrop-blur-md">
          {{ prompt.model }}
        </span>

        <!-- 收藏按钮 -->
        <button
          type="button"
          class="flex size-7 items-center justify-center rounded-full border border-border/50 bg-background/85 text-muted-foreground backdrop-blur-md transition-colors hover:text-cinnabar"
          :class="{ '!text-cinnabar !border-cinnabar-border': prompt.isFavorite }"
          :aria-label="prompt.isFavorite ? '取消收藏' : '加入收藏'"
          @click.stop="emit('toggleFavorite', prompt.id)"
        >
          <Heart :size="14" :class="{ 'fill-current': prompt.isFavorite }" />
        </button>
      </div>

      <!-- 底部右侧画幅比例标识 -->
      <div v-if="prompt.parameters.aspectRatio" class="absolute bottom-2 right-2">
        <span class="rounded bg-black/60 px-1.5 py-0.5 font-mono text-[11px] text-white/90 backdrop-blur-sm">
          {{ prompt.parameters.aspectRatio }}
        </span>
      </div>
    </div>

    <!-- 卡片内容区域 -->
    <div class="flex flex-1 flex-col p-4">
      <div class="flex items-start justify-between gap-2">
        <h3 class="line-clamp-1 m-0 text-sm font-semibold tracking-tight transition-colors group-hover:text-cinnabar-deep">
          {{ prompt.title }}
        </h3>
      </div>

      <p class="mb-3 mt-1.5 line-clamp-2 text-xs text-muted-foreground">
        {{ prompt.description }}
      </p>

      <!-- 提示词代码预览块 -->
      <div class="mb-3 rounded border border-border/60 bg-muted/40 p-2 font-mono text-xs text-foreground/80">
        <div class="line-clamp-2 leading-relaxed">
          {{ prompt.prompt }}
        </div>
      </div>

      <!-- 标签与参数行 -->
      <div class="mb-4 mt-auto flex flex-wrap items-center gap-1.5">
        <a-tag v-for="tag in (prompt.tags || []).slice(0, 3)" :key="tag" class="!m-0 text-[11px]">
          {{ tag }}
        </a-tag>
        <span
          v-if="prompt.variables?.length"
          class="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
        >
          {{ prompt.variables.length }} 个变量
        </span>
        <span
          v-if="prompt.copyCount"
          class="ml-auto text-[11px] tabular-nums text-muted-foreground/75"
        >
          已复制 {{ prompt.copyCount }} 次
        </span>
      </div>

      <!-- 底部快捷动作条 -->
      <div class="flex items-center gap-1.5 border-t border-hairline pt-3">
        <!-- 核心复制按钮 -->
        <a-button
          type="primary"
          size="small"
          class="!flex flex-1 items-center justify-center gap-1.5 text-xs font-medium"
          @click.stop="handleCopyPrompt"
        >
          <Check v-if="isCopied" :size="13" />
          <Copy v-else :size="13" />
          <span>{{ isCopied ? '已复制' : '复制词' }}</span>
        </a-button>

        <!-- 复制 /imagine 命令 -->
        <a-tooltip title="复制 Midjourney /imagine 命令行">
          <a-button
            size="small"
            class="!flex size-7 items-center justify-center p-0"
            aria-label="复制生图命令"
            @click.stop="handleCopyCli"
          >
            <Terminal :size="13" />
          </a-button>
        </a-tooltip>

        <!-- 变量调节工坊 -->
        <a-tooltip :title="prompt.variables?.length ? '调节变量参数' : '定制提示词'">
          <a-button
            size="small"
            class="!flex size-7 items-center justify-center p-0"
            aria-label="调节变量"
            @click.stop="emit('openVariables', prompt)"
          >
            <Sliders :size="13" />
          </a-button>
        </a-tooltip>

        <!-- 详情弹窗 -->
        <a-tooltip title="查看完整详情与参数">
          <a-button
            size="small"
            class="!flex size-7 items-center justify-center p-0"
            aria-label="查看详情"
            @click.stop="emit('openDetail', prompt)"
          >
            <Eye :size="13" />
          </a-button>
        </a-tooltip>
      </div>
    </div>
  </article>
</template>
