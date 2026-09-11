import { Smile } from 'lucide-vue-next'
import { defineTool } from '../types'

/** Notion 风格简笔头像：纯 SVG 部件本地拼装，支持随机生成与 SVG/PNG 下载 */
export default defineTool({
  slug: 'random-avatar',
  name: 'Random Avatar',
  description: '生成 Notion 风格的简笔头像：随机拼装五官、发型与配色，支持单独重掷每个部件，可导出 SVG/PNG。',
  category: 'fun',
  icon: Smile,
  tags: ['avatar', 'notion', 'svg'],
  accent: '#ec4899',
  component: () => import('./RandomAvatar.vue'),
})
