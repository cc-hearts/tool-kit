<script setup lang="ts">
import { App } from 'antdv-next'
import { Check, Copy, RotateCcw, Sliders, Sparkles, Terminal } from 'lucide-vue-next'
import { extractVariableKeys, formatCliCommand, type PromptItem, replaceVariables } from '~/prompts'
import { copyText } from '~/utils/clipboard'

const props = defineProps<{
  open: boolean
  prompt: PromptItem | null
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'copied', id: string): void
}>()

const { message } = App.useApp()
const formValues = ref<Record<string, string>>({})
const copiedType = ref<'prompt' | 'cli' | 'negative' | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | undefined

// 动态变量清单（包含预设声明的变量 + 从文本提取的变量）
const activeVariables = computed(() => {
  if (!props.prompt)
    return []
  const defined = props.prompt.variables || []
  const definedKeys = new Set(defined.map(v => v.key))
  const extractedKeys = extractVariableKeys(props.prompt.prompt)

  const list = [...defined]
  for (const k of extractedKeys) {
    if (!definedKeys.has(k)) {
      list.push({
        key: k,
        label: k,
        defaultValue: '',
      })
    }
  }
  return list
})

// 初始化表单变量值
function initForm() {
  if (!props.prompt)
    return
  const next: Record<string, string> = {}
  for (const v of activeVariables.value) {
    next[v.key] = v.defaultValue || ''
  }
  formValues.value = next
}

watch(
  () => props.prompt,
  () => initForm(),
  { immediate: true },
)

// 计算拼装后的最终提示词
const compiledPrompt = computed(() => {
  if (!props.prompt)
    return ''
  return replaceVariables(props.prompt.prompt, formValues.value)
})

// 计算拼装后的 CLI 命令行
const compiledCli = computed(() => {
  if (!props.prompt)
    return ''
  return formatCliCommand(props.prompt, compiledPrompt.value)
})

function setOptionValue(key: string, option: string) {
  formValues.value[key] = option
}

function handleReset() {
  initForm()
  message.info('已恢复为默认变量值')
}

async function handleCopy(type: 'prompt' | 'cli' | 'negative') {
  if (!props.prompt)
    return
  let text = ''
  if (type === 'prompt')
    text = compiledPrompt.value
  else if (type === 'cli')
    text = compiledCli.value
  else if (type === 'negative')
    text = props.prompt.negativePrompt || ''

  if (!text) {
    message.warning('没有可复制的内容')
    return
  }

  const ok = await copyText(text)
  if (ok) {
    emit('copied', props.prompt.id)
    copiedType.value = type
    message.success(
      type === 'prompt'
        ? '已复制定制提示词'
        : type === 'cli'
          ? '已复制 Midjourney 命令'
          : '已复制反向提示词',
    )
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copiedType.value = null
    }, 2000)
  }
  else {
    message.error('复制失败，请检查剪贴板权限')
  }
}

onBeforeUnmount(() => clearTimeout(copyTimer))
</script>

<template>
  <a-modal
    :open="open"
    :title="null"
    :footer="null"
    width="720px"
    destroy-on-close
    :centered="true"
    @update:open="val => emit('update:open', val)"
  >
    <div v-if="prompt" class="flex max-h-[82vh] flex-col">
      <!-- 头部：标题与模型信息，右侧留足 56px 避免与右上角关闭图标重叠 -->
      <div class="shrink-0 border-b border-hairline pb-3 pr-14 pt-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="icon-box size-7 shrink-0 text-cinnabar">
                <Sliders :size="15" />
              </span>
              <h2 class="m-0 truncate text-base font-semibold tracking-tight">
                {{ prompt.title }}
              </h2>
            </div>
            <p class="mb-0 mt-1 line-clamp-2 text-xs text-muted-foreground">
              {{ prompt.description }}
            </p>
          </div>
          <span class="shrink-0 rounded border border-border bg-muted px-2 py-0.5 text-xs font-medium">
            {{ prompt.model }}
          </span>
        </div>
      </div>

      <!-- 内部滚动区域：变量表单 + 实时拼装结果，确保高度不超出一屏幕 -->
      <div class="flex-1 overflow-y-auto pr-1.5 pt-4 pb-1 space-y-4">
        <!-- 变量表单区域 -->
        <div v-if="activeVariables.length" class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              动态插槽参数 ({{ activeVariables.length }})
            </span>
            <a-button type="link" size="small" class="!flex items-center gap-1 !p-0 text-xs" @click="handleReset">
              <RotateCcw :size="12" />
              <span>重置预设</span>
            </a-button>
          </div>

        <div
          v-for="item in activeVariables"
          :key="item.key"
          class="rounded-lg border border-border/80 bg-muted/20 p-3.5"
        >
          <div class="mb-1.5 flex items-center justify-between">
            <label :for="`var-${item.key}`" class="text-xs font-medium text-foreground">
              {{ item.label || item.key }}
              <code class="ml-1 text-[11px] text-muted-foreground">{{ '{' + item.key + '}' }}</code>
            </label>
            <span v-if="item.description" class="text-[11px] text-muted-foreground">
              {{ item.description }}
            </span>
          </div>

          <!-- 输入框 -->
          <a-input
            :id="`var-${item.key}`"
            v-model:value="formValues[item.key]"
            size="middle"
            allow-clear
            :placeholder="`请输入${item.label || item.key}...`"
            class="mb-2"
          />

          <!-- 预设词快捷点选 chips -->
          <div v-if="item.options?.length" class="flex flex-wrap items-center gap-1.5">
            <span class="text-[11px] text-muted-foreground">快捷预设：</span>
            <button
              v-for="opt in item.options"
              :key="opt"
              type="button"
              class="max-w-full truncate rounded border px-2 py-0.5 text-left text-xs transition-colors"
              :class="formValues[item.key] === opt
                ? 'border-cinnabar-border bg-accent text-accent-foreground font-medium'
                : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'"
              @click="setOptionValue(item.key, opt)"
            >
              {{ opt }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="mb-6 rounded border border-border/60 bg-muted/20 p-4 text-center text-xs text-muted-foreground">
        该提示词暂无单独变量槽位，可直接复制或前往详情页查看。
      </div>

      <!-- 实时预览区域 -->
      <div class="rounded-lg border border-border bg-card p-4">
        <div class="mb-2 flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-xs font-semibold tracking-tight text-foreground">
            <Sparkles :size="13" class="text-cinnabar" />
            <span>实时拼装结果</span>
          </div>
          <span class="font-mono text-[11px] text-muted-foreground">
            {{ compiledPrompt.length }} 字符
          </span>
        </div>

        <div class="max-h-48 overflow-y-auto whitespace-pre-wrap rounded border border-border/60 bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground select-all">
          {{ compiledPrompt }}
        </div>

        <!-- 底部复制按钮行 -->
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <!-- 复制定制提示词 -->
          <a-button
            type="primary"
            size="middle"
            class="!flex flex-1 items-center justify-center gap-1.5"
            @click="handleCopy('prompt')"
          >
            <Check v-if="copiedType === 'prompt'" :size="14" />
            <Copy v-else :size="14" />
            <span>{{ copiedType === 'prompt' ? '已复制提示词' : '复制定制提示词' }}</span>
          </a-button>

          <!-- 复制 CLI 命令行 -->
          <a-button
            size="middle"
            class="!flex items-center justify-center gap-1.5"
            @click="handleCopy('cli')"
          >
            <Terminal :size="14" />
            <span>{{ copiedType === 'cli' ? '已复制命令' : '复制 /imagine 命令' }}</span>
          </a-button>

          <!-- 复制反向词（若有） -->
          <a-button
            v-if="prompt.negativePrompt"
            size="middle"
            class="!flex items-center justify-center gap-1.5"
            @click="handleCopy('negative')"
          >
            <span>{{ copiedType === 'negative' ? '已复制反向词' : '复制反向词' }}</span>
          </a-button>
        </div>
      </div>
    </div>
  </div>
</a-modal>
</template>
