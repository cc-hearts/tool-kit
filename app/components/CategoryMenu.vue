<script setup lang="ts">
import { countToolsByCategory, toolCategories, tools } from '~/tools'

const route = useRoute()
const router = useRouter()

const counts = countToolsByCategory()

const activeKey = computed(() => (typeof route.query.category === 'string' ? route.query.category : 'all'))

const menuItems = computed(() => [
  { key: 'all', label: `全部工具 (${tools.length})` },
  ...toolCategories.map(category => ({
    key: category.key,
    label: `${category.label} (${counts[category.key] ?? 0})`,
  })),
])

function onMenuClick({ key }: { key: string | number }) {
  router.replace({
    query: {
      ...route.query,
      category: key === 'all' ? undefined : String(key),
    },
  })
}
</script>

<template>
  <a-menu
    mode="inline"
    :items="menuItems"
    :selected-keys="[activeKey]"
    class="market-menu"
    @click="onMenuClick"
  />
</template>

<style scoped>
.market-menu {
  border-inline-end: 0 !important;
  background: transparent;
}
</style>
