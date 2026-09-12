import { markRaw } from 'vue'

/** 工具分类元信息 */
export interface ToolCategory {
  /** 分类标识，写入 URL query（/​?category=xxx） */
  key: string
  /** 分类展示名 */
  label: string
}

/** 工具元信息：市场卡片、分类过滤、详情页均由它驱动 */
export interface ToolMeta {
  /** URL 标识，对应路由 /tools/<slug>，需全局唯一 */
  slug: string
  /** 展示名称 */
  name: string
  /** 一句话描述 */
  description: string
  /** 分类 key，见 categories.ts */
  category: string
  /** 卡片图标（lucide-vue-next 图标组件） */
  icon: Component
  /** 卡片标签 */
  tags?: string[]
  /** 工具个性色（十六进制），用于卡片/详情页图标底座，缺省时保持主题色 */
  accent?: string
  /** 工具视图组件（懒加载，仅进入详情页时下载） */
  component: () => Promise<{ default: Component }>
}

/** 声明式注册一个工具 */
export function defineTool(meta: ToolMeta): ToolMeta {
  // 图标是组件对象，避免被响应式系统代理
  meta.icon = markRaw(meta.icon)
  return meta
}

export type { Component }
