<script setup lang="ts">
interface CategoryItem {
  key: string
  label: string
  count: number
}

const props = withDefaults(defineProps<{
  items: CategoryItem[]
  activeKey: string
  /** 分组标题，传空字符串则不渲染 */
  heading?: string
}>(), { heading: '分类' })

const route = useRoute()
const router = useRouter()

function select(key: string) {
  router.replace({
    path: route.path,
    query: { ...route.query, category: key === 'all' ? undefined : key },
  })
}
</script>

<template>
  <div>
    <div v-if="props.heading" class="mb-2 px-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {{ props.heading }}
    </div>

    <nav class="flex flex-col gap-0.5" :aria-label="props.heading || '分类'">
      <button
        v-for="item in props.items"
        :key="item.key"
        type="button"
        class="category-item"
        :class="{ 'category-item--active': item.key === props.activeKey }"
        @click="select(item.key)"
      >
        <span class="min-w-0 flex-1 truncate text-left">{{ item.label }}</span>
        <span class="category-count">{{ item.count }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.category-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: rgb(var(--muted-foreground));
  transition: background-color 0.15s ease, color 0.15s ease;
}

.category-item:hover {
  background: rgb(var(--muted));
  color: rgb(var(--foreground));
}

.category-item--active {
  background: rgb(var(--accent));
  color: rgb(var(--accent-foreground));
  font-weight: 600;
}

.category-count {
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  opacity: 0.65;
}
</style>
