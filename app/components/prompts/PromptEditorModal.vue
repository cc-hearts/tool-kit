<script setup lang="ts">
import { App } from 'antdv-next'
import { Plus } from 'lucide-vue-next'
import { promptCategories, type PromptCategory, type PromptItem } from '~/prompts'

const props = defineProps<{
  open: boolean
  prompt?: PromptItem | null
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'save', data: Partial<PromptItem> & { title: string; prompt: string }): void
}>()

const { message } = App.useApp()

const isEditing = computed(() => Boolean(props.prompt?.id))

const form = ref({
  title: '',
  category: 'commercial' as PromptCategory,
  model: 'Midjourney v6.1',
  description: '',
  prompt: '',
  negativePrompt: '',
  aspectRatio: '16:9',
  stylize: '250',
  previewImageUrl: '',
  tagsString: '',
})

const modelOptions = [
  { label: 'Midjourney v6.1', value: 'Midjourney v6.1' },
  { label: 'Flux.1 Dev', value: 'Flux.1 Dev' },
  { label: 'Flux.1 Schnell', value: 'Flux.1 Schnell' },
  { label: 'SDXL 1.0', value: 'SDXL 1.0' },
  { label: 'DALL-E 3', value: 'DALL-E 3' },
  { label: 'Stable Diffusion 3.5', value: 'Stable Diffusion 3.5' },
  { label: 'Claude / GPT-4o', value: 'Claude / GPT-4o' },
]

const categoryOptions = promptCategories.map(c => ({
  label: c.label,
  value: c.key,
}))

const aspectOptions = [
  { label: '16:9 (横屏宽幅)', value: '16:9' },
  { label: '3:4 (艺术刊物/海报)', value: '3:4' },
  { label: '1:1 (正方形/头像)', value: '1:1' },
  { label: '9:16 (竖屏手机海报)', value: '9:16' },
  { label: '4:5 (电商/社媒)', value: '4:5' },
  { label: '21:9 (电影全景)', value: '21:9' },
]

watch(
  () => props.prompt,
  (p) => {
    if (p) {
      form.value = {
        title: p.title || '',
        category: p.category || 'commercial',
        model: p.model || 'Midjourney v6.1',
        description: p.description || '',
        prompt: p.prompt || '',
        negativePrompt: p.negativePrompt || '',
        aspectRatio: p.parameters?.aspectRatio || '16:9',
        stylize: p.parameters?.stylize || '250',
        previewImageUrl: p.previewImages?.[0] || '',
        tagsString: (p.tags || []).join(', '),
      }
    }
    else {
      form.value = {
        title: '',
        category: 'commercial',
        model: 'Midjourney v6.1',
        description: '',
        prompt: '',
        negativePrompt: '',
        aspectRatio: '16:9',
        stylize: '250',
        previewImageUrl: '',
        tagsString: '',
      }
    }
  },
  { immediate: true },
)

function handleSubmit() {
  if (!form.value.title.trim()) {
    message.warning('请输入提示词标题')
    return
  }
  if (!form.value.prompt.trim()) {
    message.warning('请输入核心提示词内容')
    return
  }

  const tags = form.value.tagsString
    .split(/[,，]/)
    .map(t => t.trim())
    .filter(Boolean)

  const previewImages = form.value.previewImageUrl.trim()
    ? [form.value.previewImageUrl.trim()]
    : props.prompt?.previewImages || []

  emit('save', {
    id: props.prompt?.id,
    title: form.value.title.trim(),
    category: form.value.category,
    model: form.value.model as any,
    description: form.value.description.trim(),
    prompt: form.value.prompt.trim(),
    negativePrompt: form.value.negativePrompt.trim(),
    parameters: {
      ...(props.prompt?.parameters || {}),
      aspectRatio: form.value.aspectRatio,
      stylize: form.value.stylize,
    },
    previewImages,
    tags,
  })

  emit('update:open', false)
  message.success(isEditing.value ? '已更新提示词' : '已添加新提示词')
}
</script>

<template>
  <a-modal
    :open="open"
    :title="isEditing ? '编辑提示词' : '新建提示词'"
    width="640px"
    destroy-on-close
    :centered="true"
    @update:open="val => emit('update:open', val)"
    @ok="handleSubmit"
  >
    <div class="max-h-[72vh] overflow-y-auto space-y-4 pr-1.5 pt-2">
      <div>
        <label class="mb-1 block text-xs font-medium text-foreground">
          标题 <span class="text-cinnabar">*</span>
        </label>
        <a-input v-model:value="form.title" placeholder="例如：8K 电影级人像摄影" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">分类</label>
          <a-select v-model:value="form.category" :options="categoryOptions" class="w-full" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">主力模型</label>
          <a-select v-model:value="form.model" :options="modelOptions" class="w-full" />
        </div>
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-foreground">一句话效果描述</label>
        <a-input v-model:value="form.description" placeholder="简述生图效果、光影或构图要点..." />
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-foreground">
          核心提示词 (Prompt) <span class="text-cinnabar">*</span>
          <span class="ml-1 text-[11px] font-normal text-muted-foreground">支持使用 {{ '{变量名}' }} 声明插槽</span>
        </label>
        <a-textarea
          v-model:value="form.prompt"
          :rows="4"
          placeholder="例如：A cinematic portrait of {subject}, shot on Hasselblad, dramatic {lighting} --ar 16:9"
          class="font-mono text-xs"
        />
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-foreground">反向提示词 (Negative Prompt，可选)</label>
        <a-textarea
          v-model:value="form.negativePrompt"
          :rows="2"
          placeholder="blurry, bad anatomy, distorted, low quality..."
          class="font-mono text-xs"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">画幅比例</label>
          <a-select v-model:value="form.aspectRatio" :options="aspectOptions" class="w-full" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">风格化 (--stylize)</label>
          <a-input v-model:value="form.stylize" placeholder="例如：250" />
        </div>
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-foreground">预览图链接 (URL，可选)</label>
        <a-input v-model:value="form.previewImageUrl" placeholder="https://images.unsplash.com/..." />
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-foreground">标签 (逗号分隔)</label>
        <a-input v-model:value="form.tagsString" placeholder="摄影, 胶片, 8K, 丁达尔光" />
      </div>
    </div>
  </a-modal>
</template>
