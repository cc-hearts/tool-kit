<script setup lang="ts">
import { countToolsByCategory, getToolsByCategory, toolCategories, tools } from '~/tools'

const route = useRoute()
const router = useRouter()

const counts = countToolsByCategory()

// 分类、关键词、排序都保存在 URL query 中，便于分享与回退
const activeCategory = computed(() => (typeof route.query.category === 'string' ? route.query.category : 'all'))
const keyword = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim().toLowerCase() : ''))
const sort = computed(() => (typeof route.query.sort === 'string' ? route.query.sort : 'default'))

/** 侧栏分类项：全部工具 + 各分类（带数量） */
const categoryItems = computed(() => [
  { key: 'all', label: '全部工具', count: tools.length },
  ...toolCategories.map(category => ({
    key: category.key,
    label: category.label,
    count: counts[category.key] ?? 0,
  })),
])

const activeCategoryLabel = computed(
  () => categoryItems.value.find(item => item.key === activeCategory.value)?.label ?? '全部工具',
)

/** 移动端分类下拉（桌面端走左侧栏） */
const categoryOptions = categoryItems.value.map(item => ({
  label: `${item.label} (${item.count})`,
  value: item.key,
}))

const sortOptions = [
  { label: '默认排序', value: 'default' },
  { label: '名称 A → Z', value: 'name-asc' },
  { label: '名称 Z → A', value: 'name-desc' },
]

const filteredTools = computed(() => {
  const list = getToolsByCategory(activeCategory.value).filter((tool) => {
    if (!keyword.value)
      return true
    return [tool.name, tool.description, ...(tool.tags ?? [])]
      .some(text => text.toLowerCase().includes(keyword.value))
  })

  if (sort.value === 'name-asc')
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  if (sort.value === 'name-desc')
    return [...list].sort((a, b) => b.name.localeCompare(a.name))
  return list
})

function setCategory(key: string | number) {
  router.replace({
    query: {
      ...route.query,
      category: !key || key === 'all' ? undefined : String(key),
    },
  })
}

function setSort(value: unknown) {
  const next = String(value)
  router.replace({
    query: { ...route.query, sort: next === 'default' ? undefined : next },
  })
}

useHead({ title: '工具市场 · Tool Kit' })
</script>

<template>
  <div class="page-container flex flex-1 gap-8 pb-10 pt-8">
    <!-- 左侧栏：分类（对齐 mcp.so 的 sidebar 方式，后续可继续加「筛选」分组） -->
    <aside class="w-52 shrink-0 max-md:hidden">
      <div class="sticky top-[7.25rem]">
        <CategoryMenu :items="categoryItems" :active-key="activeCategory" />
      </div>
    </aside>

    <section class="min-w-0 flex-1">
      <!-- 移动端：分类改为下拉 -->
      <div class="mb-4 md:hidden">
        <a-select
          :value="activeCategory"
          :options="categoryOptions"
          class="w-full"
          aria-label="选择分类"
          @change="setCategory"
        />
      </div>

      <!-- 工具栏：当前分类 + 数量 + 排序 -->
      <div class="mb-5 flex items-center gap-3">
        <h1 class="m-0 text-lg font-semibold tracking-tight">
          {{ activeCategoryLabel }}
        </h1>
        <span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
          {{ filteredTools.length }}
        </span>

        <a-select
          :value="sort"
          :options="sortOptions"
          class="ml-auto w-32"
          aria-label="排序方式"
          @change="setSort"
        />
      </div>

      <ToolGrid :tools="filteredTools" />
    </section>
  </div>
</template>
