import type { SkillCategoryMeta, SkillItem } from './types'
import { skillCategories } from './categories'
import { skills } from './data'

export * from './types'
export * from './categories'
export * from './data'

/** 获取全部技能列表 */
export function getAllSkills(): SkillItem[] {
  return skills
}

/** 根据分类获取技能 */
export function getSkillsByCategory(categoryKey: string): SkillItem[] {
  if (!categoryKey || categoryKey === 'all')
    return skills
  return skills.filter(s => s.category === categoryKey)
}

/** 根据 ID 查询技能 */
export function getSkillById(id: string): SkillItem | undefined {
  return skills.find(s => s.id === id || s.name === id)
}

/** 统计各分类技能数量 */
export function countSkillsByCategory(list: SkillItem[] = skills): Record<string, number> {
  const counts: Record<string, number> = { all: list.length }
  for (const cat of skillCategories) {
    counts[cat.key] = 0
  }
  for (const item of list) {
    if (counts[item.category] !== undefined)
      counts[item.category]++
  }
  return counts
}
