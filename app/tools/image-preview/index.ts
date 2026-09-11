import { Images } from 'lucide-vue-next'
import { defineTool } from '../types'

/** 图片预览：单图与多图数组预览，支持链接 / 上传 / 拖拽 / 粘贴，图片不出浏览器 */
export default defineTool({
  slug: 'image-preview',
  name: 'Image Preview',
  description: '单图预览与多图数组浏览：输入链接、上传、拖拽或粘贴即可查看，多图支持缩略图墙与左右切换大图，图片不出浏览器。',
  category: 'image',
  icon: Images,
  tags: ['preview', 'gallery', 'viewer'],
  accent: '#8b5cf6',
  component: () => import('./ImagePreview.vue'),
})
