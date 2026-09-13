<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import {
  countPromptsByCategory,
  getPromptsByCategory,
  promptCategories,
  type PromptItem,
} from '~/prompts'
import { usePromptStorage } from '~/composables/usePromptStorage'

const route = useRoute()
const router = useRouter()

const {
  prompts,
  toggleFavorite,
  incrementCopyCount,
  savePrompt,
} = usePromptStorage()

// 状态与筛选（与 URL query 绑定）
const activeCategory = computed(() => (typeof route.query.category === 'string' ? route.query.category : 'all'))
const keyword = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim().toLowerCase() : ''))
const modelFilter = computed(() => (typeof route.query.model === 'string' ? route.query.model : 'all'))
const sort = computed(() => (typeof route.query.sort === 'string' ? route.query.sort : 'default'))

// 分类数量统计
const counts = computed(() => countPromptsByCategory(prompts.value))

// 侧栏分类列表（全部 + 收藏 + 各分类）
const categoryItems = computed(() => [
  { key: 'all', label: '全部提示词', count: counts.value.all ?? 0 },
  { key: 'favorite', label: '我的收藏', count: counts.value.favorite ?? 0 },
  ...promptCategories.map(cat => ({
    key: cat.key,
    label: cat.label,
    count: counts.value[cat.key] ?? 0,
  })),
])

const activeCategoryLabel = computed(() => {
  if (activeCategory.value === 'all')
    return '全部提示词'
  if (activeCategory.value === 'favorite')
    return '我的收藏'
  return promptCategories.find(c => c.key === activeCategory.value)?.label ?? '提示词'
})

// 移动端分类下拉
const categoryOptions = computed(() =>
  categoryItems.value.map(item => ({
    label: `${item.label} (${item.count})`,
    value: item.key,
  })),
)

// 模型筛选下拉
const modelOptions = [
  { label: '全部模型', value: 'all' },
  { label: 'Midjourney', value: 'Midjourney' },
  { label: 'Flux.1', value: 'Flux' },
  { label: 'SDXL', value: 'SDXL' },
  { label: 'Claude / GPT-4o', value: 'Claude' },
]

// 排序下拉
const sortOptions = [
  { label: '默认推荐', value: 'default' },
  { label: '最多复制', value: 'copies-desc' },
  { label: '最新添加', value: 'latest' },
]

// 筛选与排序后的结果
const filteredPrompts = computed(() => {
  let list = getPromptsByCategory(prompts.value, activeCategory.value)

  // 关键词搜索（支持标题、描述、标签、提示词文本、作者）
  if (keyword.value) {
    list = list.filter((p) => {
      const searchTarget = [
        p.title,
        p.description,
        p.prompt,
        p.negativePrompt || '',
        p.author || '',
        ...(p.tags || []),
      ].join(' ').toLowerCase()
      return searchTarget.includes(keyword.value)
    })
  }

  // 模型过滤
  if (modelFilter.value !== 'all') {
    list = list.filter(p => p.model.toLowerCase().includes(modelFilter.value.toLowerCase()))
  }

  // 排序
  if (sort.value === 'copies-desc') {
    return [...list].sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0))
  }
  if (sort.value === 'latest') {
    return [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  }

  return list
})

function setCategory(key: string | number) {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      category: !key || key === 'all' ? undefined : String(key),
    },
  })
}

function setModel(value: unknown) {
  const next = String(value)
  router.replace({
    path: route.path,
    query: { ...route.query, model: next === 'all' ? undefined : next },
  })
}

function setSort(value: unknown) {
  const next = String(value)
  router.replace({
    path: route.path,
    query: { ...route.query, sort: next === 'default' ? undefined : next },
  })
}

// 模态框控制
const activePromptForVariables = ref<PromptItem | null>(null)
const isVariablesModalOpen = ref(false)

const activePromptForDetail = ref<PromptItem | null>(null)
const isDetailModalOpen = ref(false)

const isEditorModalOpen = ref(false)
const editingPrompt = ref<PromptItem | null>(null)


function openVariables(p: PromptItem) {
  activePromptForVariables.value = p
  isVariablesModalOpen.value = true
}

function openDetail(p: PromptItem) {
  activePromptForDetail.value = p
  isDetailModalOpen.value = true
}

function openCreate() {
  editingPrompt.value = null
  isEditorModalOpen.value = true
}

function handleSavePrompt(data: any) {
  savePrompt(data)
}

useHead({ title: '提示词 · Tool Kit' })
</script>

<template>
  <div class="page-container flex flex-1 gap-8 pb-10 pt-8">
    <!-- 左侧栏：分类（与工具市场一致的左侧栏体系） -->
    <aside class="w-52 shrink-0 max-md:hidden">
      <div class="sticky top-[7.25rem]">
        <CategoryMenu :items="categoryItems" :active-key="activeCategory" heading="提示词场景" />
      </div>
    </aside>

    <section class="min-w-0 flex-1">
      <!-- 移动端：分类改为下拉 -->
      <div class="mb-4 md:hidden">
        <a-select
          :value="activeCategory"
          :options="categoryOptions"
          class="w-full"
          aria-label="选择场景分类"
          @change="setCategory"
        />
      </div>

      <!-- 工具栏：分类标题 + 数量 + 模型筛选 + 排序 + 动作按钮 -->
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <h1 class="m-0 text-lg font-semibold tracking-tight">
            {{ activeCategoryLabel }}
          </h1>
          <span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {{ filteredPrompts.length }}
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-2 max-sm:w-full">
          <!-- 模型筛选 -->
          <a-select
            :value="modelFilter"
            :options="modelOptions"
            class="w-32 max-sm:flex-1"
            aria-label="模型筛选"
            @change="setModel"
          />

          <!-- 排序 -->
          <a-select
            :value="sort"
            :options="sortOptions"
            class="w-32 max-sm:flex-1"
            aria-label="排序方式"
            @change="setSort"
          />


          <!-- 新建提示词 -->
          <a-button
            type="primary"
            class="!flex items-center gap-1.5"
            @click="openCreate"
          >
            <Plus :size="14" />
            <span class="max-xs:hidden">新建</span>
          </a-button>
        </div>
      </div>

      <!-- 提示词卡片网格 -->
      <PromptGrid
        :prompts="filteredPrompts"
        @open-variables="openVariables"
        @open-detail="openDetail"
        @toggle-favorite="toggleFavorite"
        @copied="incrementCopyCount"
      />
    </section>

    <!-- 变量调节工坊模态框 -->
    <PromptVariableModal
      v-model:open="isVariablesModalOpen"
      :prompt="activePromptForVariables"
      @copied="incrementCopyCount"
    />

    <!-- 详情模态框 -->
    <PromptDetailModal
      v-model:open="isDetailModalOpen"
      :prompt="activePromptForDetail"
      @open-variables="openVariables"
      @toggle-favorite="toggleFavorite"
      @copied="incrementCopyCount"
    />

    <!-- 新建/编辑提示词模态框 -->
    <PromptEditorModal
      v-model:open="isEditorModalOpen"
      :prompt="editingPrompt"
      @save="handleSavePrompt"
    />
  </div>
</template>
