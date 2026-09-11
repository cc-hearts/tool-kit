import type { ToolMeta } from './types'
import { toolCategories } from './categories'
import formatSvg from './format-svg'
import imageCrop from './image-crop'
import randomAvatar from './random-avatar'
import randomName from './random-name'
import secret from './secret'
import wordTranslation from './word-translation'
import yamlToDts from './yaml-to-dts'

/**
 * 全量工具注册表（物料清单）。
 * 新增工具：在 app/tools/<slug>/ 下创建 index.ts（defineTool 元信息）与视图组件，然后在这里追加一行。
 */
export const tools: ToolMeta[] = [
  yamlToDts,
  formatSvg,
  secret,
  wordTranslation,
  imageCrop,
  randomAvatar,
  randomName,
]

export { toolCategories }

export function getToolBySlug(slug: string): ToolMeta | undefined {
  return tools.find(tool => tool.slug === slug)
}

export function getToolsByCategory(category: string): ToolMeta[] {
  return category === 'all' ? tools : tools.filter(tool => tool.category === category)
}

export function countToolsByCategory(): Record<string, number> {
  return tools.reduce<Record<string, number>>((acc, tool) => {
    acc[tool.category] = (acc[tool.category] ?? 0) + 1
    return acc
  }, {})
}
