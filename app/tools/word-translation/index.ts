import { CaseSensitive } from 'lucide-vue-next'
import { defineTool } from '../types'

/** 单词 / 短语命名格式批量转换 */
export default defineTool({
  slug: 'word-translation',
  name: 'Word Case Convert',
  description: '将单词或短语批量转换为 camelCase、kebab-case、snake_case、PascalCase 等常见命名格式。',
  category: 'devtools',
  icon: CaseSensitive,
  tags: ['naming', 'case'],
  accent: '#3b82f6',
  component: () => import('./WordCaseConvert.vue'),
})
