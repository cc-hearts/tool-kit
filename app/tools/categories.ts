import type { ToolCategory } from './types'

/**
 * 市场分类清单。
 * 新增分类：在这里追加一项，然后给对应工具的 meta.category 填上 key。
 */
export const toolCategories: ToolCategory[] = [
  { key: 'converter', label: '格式转换' },
  { key: 'devtools', label: '开发辅助' },
  { key: 'security', label: '安全加密' },
]
