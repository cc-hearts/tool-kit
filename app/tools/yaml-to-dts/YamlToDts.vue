<script setup lang="ts">
// 该包为 CJS 互导出，仅提供 default 导出
import generateTypeDeclaration from '@cc-heart/object-to-declare'
import { parse } from 'yaml'
import { Copy, Download } from 'lucide-vue-next'
import { copyText } from '~/utils/clipboard'

const source = ref('')
// 留空时使用库默认根名 IRootName
const rootName = ref('')

const parseResult = computed<{ dts: string, error: string }>(() => {
  if (!source.value.trim())
    return { dts: '', error: '' }

  try {
    const data = parse(source.value)
    const options = rootName.value.trim() ? { rootName: rootName.value.trim() } : undefined
    return { dts: data ? generateTypeDeclaration(data, options) : '', error: '' }
  }
  catch {
    return { dts: '', error: 'YAML 解析失败，请检查内容格式' }
  }
})

function downloadOutput() {
  if (!parseResult.value.dts)
    return
  const blob = new Blob([parseResult.value.dts], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${rootName.value.trim() || 'types'}.d.ts`
  anchor.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <a-form layout="inline">
      <a-form-item label="根接口名">
        <a-input
          v-model:value="rootName"
          class="!w-48"
          placeholder="IRootName（默认）"
          allow-clear
        />
      </a-form-item>
    </a-form>

    <div class="grid gap-4 lg:grid-cols-2">
      <a-card size="small" title="YAML 输入" class="h-full">
        <a-textarea v-model:value="source" :rows="14" placeholder="在此粘贴 YAML 内容..." />
        <a-alert v-if="parseResult.error" type="error" :message="parseResult.error" show-icon class="mt-2" />
      </a-card>

      <a-card size="small" title="TypeScript 类型声明" class="h-full">
        <template #extra>
          <a-space>
            <a-button size="small" type="text" :disabled="!parseResult.dts" @click="copyText(parseResult.dts)">
              <template #icon>
                <Copy :size="14" />
              </template>
              复制
            </a-button>
            <a-button size="small" type="text" :disabled="!parseResult.dts" @click="downloadOutput">
              <template #icon>
                <Download :size="14" />
              </template>
              下载 .d.ts
            </a-button>
          </a-space>
        </template>
        <a-textarea :value="parseResult.dts" :rows="14" readonly placeholder="转换结果" />
      </a-card>
    </div>
  </div>
</template>
