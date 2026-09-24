import { FileImage } from 'lucide-vue-next'
import { defineTool } from '../types'

/** Base64 与 PNG 图片互转 */
export default defineTool({
  slug: 'base64-to-png',
  name: 'Base64 To PNG',
  description: 'Base64 与 PNG 图片互相转换：支持纯 Base64 / Data URL 解析并一键导出 PNG、尺寸与大小分析、透明棋盘格预览及剪贴板复制。',
  category: 'converter',
  icon: FileImage,
  tags: ['base64', 'png', 'image', 'converter'],
  accent: '#0284c7',
  component: () => import('./Base64ToPng.vue'),
})
