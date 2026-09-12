<script setup lang="ts">
/**
 * 方格纸底纹背景层（「纸墨朱砂」设计语言的「纸」）。
 *
 * 全站只挂一次（`layouts/default.vue`），铺在所有内容之下。
 * 之所以收成组件而不是写在 body 的全局样式里：
 * 线宽 / 单元尺寸 / 层级 / 是否跟随滚动都归到一处，页面里想局部换尺寸也只要传个 prop。
 *
 * 注意：**不要做「分区强弱」两档底纹**。强弱两档相邻时，交界处必然出现接缝。
 * 要么全站一档，要么只在局部出现。
 */
interface Props {
  /**
   * 网格单元边长（px）。默认 28 —— 与顶部栏 56px 高度成 2 倍关系，
   * 顶部栏的硬分隔线才能正好落在网格线上（否则横线会「切在格子中间」）。
   */
  size?: number
}

const props = withDefaults(defineProps<Props>(), { size: 28 })
</script>

<template>
  <!-- fixed 铺满视口：与原先 body 背景的观感一致（滚动时底纹钉在视口上，不随内容走） -->
  <div
    class="grid-backdrop"
    aria-hidden="true"
    :style="{ '--grid-cell': `${props.size}px` }"
  />
</template>

<style scoped>
/* 负 z-index 让底纹落在 body 底色之上、内容之下，
   因此不需要给页面内容加任何层级。 */
.grid-backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;

  /* 两道 1px linear-gradient 叠加成网格；线色只比底色深一档，
     所以读起来是「纸」而不是「表格」。 */
  background-image:
    linear-gradient(rgb(var(--grid-line)) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--grid-line)) 1px, transparent 1px);
  background-size: var(--grid-cell) var(--grid-cell);
}
</style>
