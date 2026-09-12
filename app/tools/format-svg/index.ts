import { PenTool } from 'lucide-vue-next'
import { defineTool } from '../types'

/** SVG 格式化：美化输出、填充色统一为 currentColor、剔除 title 节点 */
export default defineTool({
  slug: 'format-svg',
  name: 'SVG Format',
  description: '格式化 SVG 源码，并将 fill/stroke 颜色统一替换为 currentColor，便于作为图标组件使用。',
  category: 'converter',
  icon: PenTool,
  tags: ['svg', 'icon'],
  accent: '#f59e0b',
  component: () => import('./FormatSvg.vue'),
})
