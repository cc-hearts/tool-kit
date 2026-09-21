import { Crop } from 'lucide-vue-next'
import { defineTool } from '../types'

/** 图片裁剪：基于 @antdv-next/vue-easy-crop 的本地裁剪与导出 */
export default defineTool({
  slug: 'image-crop',
  name: 'Image Crop',
  description: '本地图片裁剪工具，支持原图不裁剪导出、拖拽缩放旋转、圆形/方形裁剪、多种比例与 PNG/JPEG/WebP 导出，图片不出浏览器。',
  category: 'image',
  icon: Crop,
  tags: ['crop', 'avatar', 'canvas'],
  accent: '#14b8a6',
  component: () => import('./ImageCrop.vue'),
})
