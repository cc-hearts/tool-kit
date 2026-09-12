<script setup lang="ts">
import { countToolsByCategory, getToolsByCategory, toolCategories, tools } from '~/tools'

const route = useRoute()
const router = useRouter()

const counts = countToolsByCategory()

// 分类与关键词都保存在 URL query 中，便于分享与回退
const activeCategory = computed(() => (typeof route.query.category === 'string' ? route.query.category : 'all'))
const keyword = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim().toLowerCase() : ''))

const filteredTools = computed(() =>
  getToolsByCategory(activeCategory.value).filter((tool) => {
    if (!keyword.value)
      return true
    return [tool.name, tool.description, ...(tool.tags ?? [])]
      .some(text => text.toLowerCase().includes(keyword.value))
  }),
)

const categoryOptions = [
  { label: `全部工具 (${tools.length})`, value: 'all' },
  ...toolCategories.map(category => ({
    label: `${category.label} (${counts[category.key] ?? 0})`,
    value: category.key,
  })),
]

function setCategory(key: string | number) {
  router.replace({
    query: {
      ...route.query,
      category: !key || key === 'all' ? undefined : String(key),
    },
  })
}

useHead({ title: '工具市场 · Tool Kit' })
</script>

<template>
  <div class="page-container flex flex-1 gap-8 py-8">
    <aside class="w-52 shrink-0 max-md:hidden">
      <div class="sticky top-20">
        <div class="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          分类
        </div>
        <CategoryMenu />
      </div>
    </aside>

    <section class="min-w-0 flex-1">
      <div class="mb-6">
        <h1 class="m-0 text-2xl font-bold tracking-tight">
          工具市场
        </h1>
        <p class="mb-0 mt-1 text-sm text-muted-foreground">
          共 {{ filteredTools.length }} 个工具，覆盖数据转换、代码辅助、安全加密等场景。
        </p>
      </div>

      <div class="mb-6 md:hidden">
        <a-select
          :value="activeCategory"
          :options="categoryOptions"
          class="w-full"
          @change="setCategory"
        />
      </div>

      <ToolGrid :tools="filteredTools" />
    </section>
  </div>
</template>
