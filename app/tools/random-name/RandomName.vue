<script setup lang="ts">
import { App } from 'antdv-next'
import { Copy, RefreshCw } from 'lucide-vue-next'
import { copyText } from '~/utils/clipboard'
import {
  chineseSeriesOptions,
  englishSeriesOptions,
  generateBatch,
  generateFunnyName,
  type ChineseSeries,
  type EnglishFormat,
  type EnglishSeries,
} from './names'

const { message } = App.useApp()

const activeTab = ref<'chinese' | 'english'>('chinese')

/* ---------- 批量与结果 ---------- */
const batchSize = ref<5 | 10 | 15 | 20>(10)
const results = ref<string[]>([])

/* ---------- 沙雕中文 ---------- */
const chineseSeries = ref<ChineseSeries>('random')

/* ---------- 沙雕英文 ---------- */
const englishSeries = ref<EnglishSeries>('random')
const englishFormat = ref<EnglishFormat>('camel')
const withDigits = ref(false)

function regenerate() {
  results.value = generateBatch(batchSize.value, () => generateFunnyName(
    activeTab.value,
    activeTab.value === 'chinese' ? chineseSeries.value : englishSeries.value,
    { digits: withDigits.value },
    englishFormat.value,
  ))
}

watch([batchSize, chineseSeries, englishSeries, englishFormat, withDigits], regenerate)
watch(activeTab, regenerate)
onMounted(regenerate)

/* ---------- 复制 ---------- */

async function copyName(name: string) {
  if (await copyText(name))
    message.success(`已复制「${name}」`)
  else
    message.error('复制失败，请检查浏览器剪贴板权限')
}

async function copyAll() {
  if (await copyText(results.value.join('\n')))
    message.success(`已复制全部 ${results.value.length} 条`)
  else
    message.error('复制失败，请检查浏览器剪贴板权限')
}
</script>

<template>
  <div class="mx-auto flex max-w-720px flex-col gap-4">
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="chinese" tab="沙雕中文">
        <a-form layout="vertical">
          <a-form-item label="系列">
            <a-radio-group v-model:value="chineseSeries" button-style="solid">
              <a-radio-button v-for="option in chineseSeriesOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item class="!mb-0">
            <div class="flex flex-col items-start gap-2 rounded-md bg-muted px-4 py-3 text-sm sm:flex-row sm:items-center">
              <span class="font-medium">国家一级退堂鼓演奏家</span>
              <span class="text-muted-foreground">模板 + 槽位拼装，越沙雕越上头</span>
            </div>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="english" tab="沙雕英文">
        <a-form layout="vertical">
          <a-form-item label="系列">
            <a-radio-group v-model:value="englishSeries" button-style="solid">
              <a-radio-button v-for="option in englishSeriesOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="格式">
            <a-radio-group v-model:value="englishFormat" button-style="solid">
              <a-radio-button value="camel">
                ChiefNapOfficer
              </a-radio-button>
              <a-radio-button value="snake">
                chief_nap_officer
              </a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item class="!mb-0">
            <a-checkbox v-model:checked="withDigits">
              追加数字后缀（注册防占用）
            </a-checkbox>
          </a-form-item>
          <a-form-item class="!mb-0">
            <div class="flex flex-col items-start gap-2 rounded-md bg-muted px-4 py-3 text-sm sm:flex-row sm:items-center">
              <span class="font-medium">CtrlAltDefeat</span>
              <span class="text-muted-foreground">技术梗 / 头衔梗 / 自嘲梗，注册不撞名</span>
            </div>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>

    <!-- 批量操作 -->
    <div class="flex flex-wrap items-center gap-3">
      <a-button type="primary" @click="regenerate">
        <template #icon>
          <RefreshCw :size="14" />
        </template>
        换一批
      </a-button>
      <a-button :disabled="!results.length" @click="copyAll">
        <template #icon>
          <Copy :size="14" />
        </template>
        复制全部
      </a-button>
      <span class="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
        数量
        <a-select
          v-model:value="batchSize"
          class="w-80px"
          :options="[5, 10, 15, 20].map(count => ({ label: `${count} 条`, value: count }))"
        />
      </span>
    </div>

    <!-- 结果列表：整行点击复制 -->
    <div class="overflow-hidden rounded-md border border-border">
      <button
        v-for="(name, index) in results"
        :key="`${name}-${index}`"
        type="button"
        class="flex w-full items-center justify-between gap-3 border-0 border-b border-solid border-b-border bg-transparent px-4 py-2.5 text-left text-sm transition-colors last:border-b-0 hover:bg-muted"
        :aria-label="`复制 ${name}`"
        @click="copyName(name)"
      >
        <span class="truncate">{{ name }}</span>
        <Copy :size="14" class="shrink-0 text-muted-foreground" />
      </button>
    </div>

    <p class="mb-0 text-center text-xs text-muted-foreground">
      点击任意一行即可复制 · 名字完全由本地随机生成
    </p>
  </div>
</template>
