<script setup lang="ts">
import { activeSection, sections } from '~/sections'

const route = useRoute()
const currentKey = computed(() => activeSection(route.path)?.key)
</script>

<template>
  <!-- 顶部栏目 tab：选中态用朱砂下划线压在头部底边上 -->
  <nav class="-mb-px flex items-stretch gap-5 overflow-x-auto" aria-label="站点栏目">
    <NuxtLink
      v-for="section in sections"
      :key="section.key"
      :to="section.to"
      class="section-tab"
      :class="{ 'section-tab--active': currentKey === section.key }"
      :aria-current="currentKey === section.key ? 'page' : undefined"
    >
      <component :is="section.icon" :size="15" />
      <span>{{ section.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.section-tab {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.4rem;
  height: 2.75rem;
  font-size: 0.875rem;
  color: rgb(var(--muted-foreground));
  transition: color 0.15s ease;
}

.section-tab:hover {
  color: rgb(var(--foreground));
}

.section-tab--active {
  color: rgb(var(--foreground));
  font-weight: 600;
}

.section-tab--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: rgb(var(--cinnabar));
}
</style>
