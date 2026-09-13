import type { PromptCategory, PromptItem } from './types'
import { INITIAL_PROMPTS } from './data'
import { promptCategories } from './categories'

export * from './types'
export * from './categories'
export * from './data'

/**
 * 根据分类过滤提示词列表
 */
export function getPromptsByCategory(
  list: PromptItem[],
  category: string,
): PromptItem[] {
  if (!category || category === 'all')
    return list
  if (category === 'favorite')
    return list.filter(item => item.isFavorite)
  return list.filter(item => item.category === category)
}

/**
 * 统计各分类下的提示词数量
 */
export function countPromptsByCategory(list: PromptItem[]): Record<string, number> {
  const counts: Record<string, number> = {
    all: list.length,
    favorite: list.filter(item => item.isFavorite).length,
  }

  for (const cat of promptCategories) {
    counts[cat.key] = 0
  }

  for (const item of list) {
    if (counts[item.category] !== undefined) {
      counts[item.category]++
    }
  }

  return counts
}

/**
 * 替换提示词中的 {variable} 变量插槽
 */
export function replaceVariables(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{([^{}]+)\}/g, (match, key) => {
    const trimmed = key.trim()
    return values[trimmed] !== undefined && values[trimmed] !== '' ? values[trimmed] : match
  })
}

/**
 * 从提示词文本中提取所有变量名
 */
export function extractVariableKeys(template: string): string[] {
  const matches = template.match(/\{([^{}]+)\}/g)
  if (!matches)
    return []
  const set = new Set<string>()
  for (const m of matches) {
    set.add(m.slice(1, -1).trim())
  }
  return Array.from(set)
}

/**
 * 组装 Midjourney / 标准生图命令行
 */
export function formatCliCommand(
  promptItem: PromptItem,
  customPromptText?: string,
): string {
  const baseText = customPromptText || promptItem.prompt
  const p = promptItem.parameters
  const flags: string[] = []

  if (p.aspectRatio && !baseText.includes('--ar'))
    flags.push(`--ar ${p.aspectRatio}`)
  if (p.model && !baseText.includes('--v') && !baseText.includes('--niji'))
    flags.push(p.model.startsWith('--') ? p.model : `--v ${p.model}`)
  if (p.stylize && !baseText.includes('--stylize') && !baseText.includes('--s '))
    flags.push(`--stylize ${p.stylize}`)
  if (p.chaos && !baseText.includes('--c'))
    flags.push(`--c ${p.chaos}`)
  if (p.seed && !baseText.includes('--seed'))
    flags.push(`--seed ${p.seed}`)

  const flagStr = flags.length > 0 ? ` ${flags.join(' ')}` : ''
  return `/imagine prompt: ${baseText.trim()}${flagStr}`
}
