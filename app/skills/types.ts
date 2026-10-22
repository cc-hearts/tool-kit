export interface SkillCategoryMeta {
  key: string
  label: string
  description: string
}

export interface SkillItem {
  id: string
  name: string
  title: string
  description: string
  category: 'desktop-ui' | 'workflow' | 'automation' | 'quality'
  version: string
  source?: string
  author?: string
  tags: string[]
  doc: string
  tokensCss?: string
  tokensJson?: any
  hasLiveDemo?: boolean
  demoComponent?: string
  updatedAt?: string
}
