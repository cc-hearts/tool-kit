import type { Component } from 'vue'
import { Sparkles, Wrench } from 'lucide-vue-next'

/**
 * 站点栏目清单 —— 顶部 tab 导航的唯一数据源。
 *
 * 站点不止「工具」一种内容：后续还会接入提示词、MCP 等，
 * 新增栏目只需在这里追加一项，并补上 `to` 指向的路由页面即可，
 * 顶部导航、栏目标题、搜索框文案都会自动跟随。
 */
export interface Section {
  /** 栏目标识 */
  key: string
  /** 导航展示名（保持简短，对齐 mcp.so 的 tab 命名习惯） */
  label: string
  /** 栏目首页路径 */
  to: string
  /**
   * 命中该栏目的路径前缀，用于导航高亮。
   * 注意 '/' 需精确匹配（它是所有路径的前缀），在 activeSection 中单独处理。
   */
  match: string[]
  /** 导航图标（lucide-vue-next 图标组件） */
  icon: Component
  /** 栏目一句话介绍 */
  description: string
  /** 是否已上线；未上线栏目仅作占位 */
  ready?: boolean
}

export const sections: Section[] = [
  {
    key: 'tools',
    label: '工具',
    to: '/',
    match: ['/', '/tools'],
    icon: Wrench,
    description: '在浏览器本地运行的小工具集合，覆盖格式转换、图片处理、趣味生成、开发辅助与安全加密。',
    ready: true,
  },
  {
    key: 'prompts',
    label: '提示词',
    to: '/prompts',
    match: ['/prompts'],
    icon: Sparkles,
    description: '可复用的提示词模板库，按场景整理，复制即用。',
  },
]

/** 根据当前路径解析所属栏目 */
export function activeSection(path: string): Section | undefined {
  return sections.find(section =>
    section.match.some(prefix => (prefix === '/' ? path === '/' : path.startsWith(prefix))),
  )
}
