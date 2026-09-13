<script setup lang="ts">
import { App } from 'antdv-next'
import { Copy, Heart, Sliders, Terminal } from 'lucide-vue-next'
import { formatCliCommand, type PromptItem } from '~/prompts'
import { copyText } from '~/utils/clipboard'

const props = defineProps<{
  open: boolean
  prompt: PromptItem | null
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'openVariables', prompt: PromptItem): void
  (e: 'toggleFavorite', id: string): void
  (e: 'copied', id: string): void
}>()

const { message } = App.useApp()
const activeImageIndex = ref(0)

watch(
  () => props.prompt,
  () => {
    activeImageIndex.value = 0
  },
)

async function copyContent(text: string, tip: string) {
  if (!text)
    return
  const ok = await copyText(text)
  if (ok) {
    if (props.prompt)
      emit('copied', props.prompt.id)
    message.success(tip)
  }
  else {
    message.error('复制失败，请检查剪贴板权限')
  }
}
</script>

<template>
  <a-modal
    :open="open"
    :title="null"
    :footer="null"
    width="880px"
    destroy-on-close
    :centered="true"
    @update:open="val => emit('update:open', val)"
  >
    <div v-if="prompt" class="flex max-h-[84vh] flex-col">
      <!-- 顶部标题与元数据，右侧预留 56px 避免遮挡关闭图标 -->
      <div class="shrink-0 border-b border-hairline pb-3.5 pr-14 pt-1">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <h2 class="m-0 truncate text-lg font-semibold tracking-tight">
              {{ prompt.title }}
            </h2>
            <p class="mb-0 mt-1 line-clamp-2 text-xs text-muted-foreground">
              {{ prompt.description }}
            </p>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <span class="rounded border border-border bg-muted px-2.5 py-1 text-xs font-medium">
              {{ prompt.model }}
            </span>
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-cinnabar"
              :class="{ '!text-cinnabar !border-cinnabar-border': prompt.isFavorite }"
              :aria-label="prompt.isFavorite ? '取消收藏' : '加入收藏'"
              @click="emit('toggleFavorite', prompt.id)"
            >
              <Heart :size="16" :class="{ 'fill-current': prompt.isFavorite }" />
            </button>
          </div>
        </div>
      </div>

      <!-- 内部滚动区域：确保弹窗整体高度不超过屏幕 -->
      <div class="flex-1 overflow-y-auto pr-1.5 pt-4 pb-1">
        <div class="grid gap-6 md:grid-cols-12">
        <!-- 左侧：生图样张大图预览 -->
        <div class="md:col-span-6">
          <div class="overflow-hidden rounded-lg border border-border bg-muted">
            <img
              v-if="prompt.previewImages?.[activeImageIndex]"
              :src="prompt.previewImages[activeImageIndex]"
              :alt="prompt.title"
              class="max-h-[380px] w-full object-cover"
            >
            <div v-else class="flex h-64 items-center justify-center text-xs text-muted-foreground">
              暂无预览图
            </div>
          </div>

          <!-- 多图缩略图切换 -->
          <div v-if="(prompt.previewImages || []).length > 1" class="mt-2.5 flex gap-2 overflow-x-auto pb-1">
            <button
              v-for="(img, idx) in prompt.previewImages"
              :key="img"
              type="button"
              class="size-14 shrink-0 overflow-hidden rounded border transition-all"
              :class="activeImageIndex === idx ? 'border-cinnabar ring-2 ring-cinnabar/20' : 'border-border opacity-70 hover:opacity-100'"
              @click="activeImageIndex = idx"
            >
              <img :src="img" class="size-full object-cover">
            </button>
          </div>

          <!-- 标签展示 -->
          <div class="mt-4 flex flex-wrap gap-1.5">
            <a-tag v-for="tag in prompt.tags" :key="tag" class="!m-0 text-xs">
              {{ tag }}
            </a-tag>
          </div>
        </div>

        <!-- 右侧：生成参数与提示词细节 -->
        <div class="flex flex-col md:col-span-6">
          <!-- 结构化参数栅格 -->
          <div class="mb-4 grid grid-cols-3 gap-2 rounded-lg border border-border/80 bg-muted/25 p-3 text-xs">
            <div>
              <div class="text-[11px] text-muted-foreground">
                画幅比例
              </div>
              <div class="mt-0.5 font-mono font-medium">
                {{ prompt.parameters.aspectRatio || '默认' }}
              </div>
            </div>
            <div>
              <div class="text-[11px] text-muted-foreground">
                模型标识
              </div>
              <div class="mt-0.5 font-mono font-medium">
                {{ prompt.parameters.model || prompt.model }}
              </div>
            </div>
            <div>
              <div class="text-[11px] text-muted-foreground">
                风格化 (--s)
              </div>
              <div class="mt-0.5 font-mono font-medium">
                {{ prompt.parameters.stylize || '-' }}
              </div>
            </div>
            <div v-if="prompt.parameters.sampler">
              <div class="text-[11px] text-muted-foreground">
                采样器
              </div>
              <div class="mt-0.5 font-mono font-medium truncate">
                {{ prompt.parameters.sampler }}
              </div>
            </div>
            <div v-if="prompt.parameters.steps">
              <div class="text-[11px] text-muted-foreground">
                迭代步数
              </div>
              <div class="mt-0.5 font-mono font-medium">
                {{ prompt.parameters.steps }}
              </div>
            </div>
            <div v-if="prompt.parameters.cfgScale">
              <div class="text-[11px] text-muted-foreground">
                CFG Scale
              </div>
              <div class="mt-0.5 font-mono font-medium">
                {{ prompt.parameters.cfgScale }}
              </div>
            </div>
          </div>

          <!-- 核心提示词 -->
          <div class="mb-3 flex-1">
            <div class="mb-1.5 flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                核心提示词 (Prompt)
              </span>
              <a-button
                type="link"
                size="small"
                class="!flex items-center gap-1 !p-0 text-xs"
                @click="copyContent(prompt.prompt, '已复制核心提示词')"
              >
                <Copy :size="12" />
                <span>复制</span>
              </a-button>
            </div>
            <div class="max-h-44 overflow-y-auto whitespace-pre-wrap rounded border border-border/70 bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground select-all">
              {{ prompt.prompt }}
            </div>
          </div>

          <!-- 反向提示词 -->
          <div v-if="prompt.negativePrompt" class="mb-4">
            <div class="mb-1.5 flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                反向提示词 (Negative)
              </span>
              <a-button
                type="link"
                size="small"
                class="!flex items-center gap-1 !p-0 text-xs"
                @click="copyContent(prompt.negativePrompt, '已复制反向提示词')"
              >
                <Copy :size="12" />
                <span>复制</span>
              </a-button>
            </div>
            <div class="max-h-24 overflow-y-auto rounded border border-border/70 bg-muted/30 p-2.5 font-mono text-xs text-muted-foreground select-all">
              {{ prompt.negativePrompt }}
            </div>
          </div>

          <!-- 底部主操作条 -->
          <div class="mt-auto flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
            <a-button
              type="primary"
              class="!flex flex-1 items-center justify-center gap-1.5"
              @click="copyContent(prompt.prompt, '已复制提示词')"
            >
              <Copy :size="14" />
              <span>复制提示词</span>
            </a-button>

            <a-button
              class="!flex items-center justify-center gap-1.5"
              @click="copyContent(formatCliCommand(prompt), '已复制 Midjourney 命令行')"
            >
              <Terminal :size="14" />
              <span>/imagine 命令</span>
            </a-button>

            <a-button
              class="!flex items-center justify-center gap-1.5"
              @click="() => { emit('update:open', false); emit('openVariables', prompt) }"
            >
              <Sliders :size="14" />
              <span>变量工坊</span>
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</a-modal>
</template>
