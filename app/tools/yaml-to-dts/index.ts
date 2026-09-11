import { Braces } from 'lucide-vue-next'
import { defineTool } from '../types'

/** YAML → TypeScript 类型声明 */
export default defineTool({
  slug: 'yaml-to-dts',
  name: 'YAML To DTS',
  description: '将 YAML 配置内容转换为对应的 TypeScript 类型声明（.d.ts）。',
  category: 'converter',
  icon: Braces,
  tags: ['yaml', 'typescript'],
  accent: '#8b5cf6',
  component: () => import('./YamlToDts.vue'),
})
