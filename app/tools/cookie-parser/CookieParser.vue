<script setup lang="ts">
import { Cookie, Copy, Eraser } from 'lucide-vue-next'
import { App } from 'antdv-next'
import type { CookieKind } from './parse'
import { parseCookieInput } from './parse'
import { copyText } from '~/utils/clipboard'

const { message } = App.useApp()

const source = ref('')
/** cookie 值常经 encodeURIComponent 编码，默认还原成可读文本 */
const decodeUrl = ref(true)
/** 结果视图：结构化 JSON / 表格 */
const activeView = ref<'json' | 'table'>('json')

const placeholder = `sessionid=8f2a1c9e; theme=dark; nickname=%E5%B0%8F%E6%98%8E
也支持 Set-Cookie 响应头，或 DevTools 导出的 JSON`

const KIND_LABELS: Record<CookieKind, string> = {
  cookie: '请求 Cookie',
  'set-cookie': '响应 Set-Cookie',
  json: 'JSON',
}

interface CookieRow {
  key: string
  name: string
  value: string
  /** 仅 Set-Cookie 形态有；请求 Cookie 没有额外属性 */
  attributes?: Record<string, unknown>
}

const parsed = computed(() => (source.value.trim() ? parseCookieInput(source.value, decodeUrl.value) : null))

const json = computed(() => {
  const result = parsed.value
  return result?.ok ? JSON.stringify(result.data, null, 2) : ''
})

const error = computed(() => {
  const result = parsed.value
  return result && !result.ok ? result.error : ''
})

const kindLabel = computed(() => {
  const result = parsed.value
  return result?.ok ? KIND_LABELS[result.kind] : ''
})

/** 表格视图只对 cookie 形态有意义：JSON 导出没有固定的列结构 */
const canUseTable = computed(() => {
  const result = parsed.value
  return result?.ok === true && result.kind !== 'json'
})

const isSetCookie = computed(() => {
  const result = parsed.value
  return result?.ok === true && result.kind === 'set-cookie'
})

// JSON 导出切回来时表格已不可用，避免停在一个禁用标签上
watch(canUseTable, (canUse) => {
  if (!canUse)
    activeView.value = 'json'
})

const rows = computed<CookieRow[]>(() => {
  const result = parsed.value
  if (!result?.ok)
    return []

  if (result.kind === 'cookie') {
    return Object.entries(result.data as Record<string, string>)
      .map(([name, value]) => ({ key: name, name, value }))
  }

  if (result.kind === 'set-cookie') {
    const list = (Array.isArray(result.data) ? result.data : [result.data]) as Array<Record<string, unknown>>
    return list.map((record, index) => {
      const { name = '', value = '', ...attributes } = record
      return { key: `${index}-${String(name)}`, name: String(name), value: String(value), attributes }
    })
  }

  return []
})

const baseColumns = [
  { title: '名称', dataIndex: 'name', key: 'name', width: 180 },
  { title: '值', dataIndex: 'value', key: 'value', ellipsis: true },
]

const columns = computed(() => (isSetCookie.value
  ? [...baseColumns, { title: '属性', dataIndex: 'attributes', key: 'attributes', width: 320 }]
  : baseColumns))

/** 属性的可读写法：标志位只留名字，其余写成 `key=value` */
function formatAttribute(key: string, value: unknown): string {
  return value === true ? key : `${key}=${String(value)}`
}

/** 表格视图的复制内容走 TSV，可直接粘进 Excel / 飞书表格 */
const tableText = computed(() => rows.value
  .map((row) => {
    const attributes = row.attributes
      ? Object.entries(row.attributes).map(([key, value]) => formatAttribute(key, value)).join('; ')
      : ''
    return [row.name, row.value, attributes].filter(Boolean).join('\t')
  })
  .join('\n'))

const summary = computed(() => {
  const result = parsed.value
  if (!result?.ok)
    return ''
  if (result.kind === 'cookie')
    return `已解析 ${result.count} 个 cookie`
  if (result.kind === 'set-cookie')
    return `已解析 ${result.count} 条 Set-Cookie`
  return `JSON 结构，顶层 ${result.count} 项`
})

/** JSON 导出本身就是结构化数据，URL 解码开关对它没有意义 */
const decodeDisabled = computed(() => {
  const result = parsed.value
  return result?.ok === true && result.kind === 'json'
})

async function copyResult() {
  const isTable = activeView.value === 'table'
  const text = isTable ? tableText.value : json.value
  if (!text)
    return

  if (await copyText(text))
    message.success(isTable ? '已复制表格内容（TSV）' : '已复制 JSON')
  else
    message.error('复制失败，请检查浏览器剪贴板权限')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <a-switch v-model:checked="decodeUrl" :disabled="decodeDisabled" size="small" />
      <span class="text-sm">URL 解码</span>
      <span class="text-xs text-muted-foreground">还原 %XX 转义，得到可读的 cookie 值</span>
      <a-button class="ml-auto" size="small" type="text" :disabled="!source" @click="source = ''">
        <template #icon>
          <Eraser :size="14" />
        </template>
        清空
      </a-button>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <a-card size="small" title="Cookie 字符串" class="h-full">
        <a-textarea v-model:value="source" :rows="16" :placeholder="placeholder" />
        <a-alert v-if="error" type="error" :message="error" show-icon class="mt-2" />
      </a-card>

      <a-card size="small" title="解析结果" class="h-full">
        <template #extra>
          <a-space :size="8">
            <a-tag v-if="kindLabel" class="!m-0">
              {{ kindLabel }}
            </a-tag>
            <a-button size="small" type="text" :disabled="!json" @click="copyResult">
              <template #icon>
                <Copy :size="14" />
              </template>
              复制
            </a-button>
          </a-space>
        </template>

        <a-tabs v-model:activeKey="activeView" size="small">
          <a-tab-pane key="json" tab="JSON">
            <a-textarea :value="json" :rows="15" readonly placeholder="解析结果" />
          </a-tab-pane>

          <a-tab-pane key="table" tab="表格" :disabled="!canUseTable">
            <a-table
              :columns="columns"
              :data-source="rows"
              :pagination="false"
              :scroll="{ y: 322 }"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'attributes'">
                  <a-space :size="4" wrap>
                    <a-tag v-for="(value, key) in record.attributes" :key="key" class="!m-0">
                      {{ formatAttribute(String(key), value) }}
                    </a-tag>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>

        <p class="mb-0 mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Cookie :size="12" />
          {{ summary || '粘贴 cookie 字符串后自动解析' }}
        </p>
      </a-card>
    </div>

    <p class="mb-0 text-center text-xs text-muted-foreground">
      解析全部在浏览器本地完成，不会上传任何数据。
    </p>
  </div>
</template>
