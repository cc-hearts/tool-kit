import { Eraser } from 'lucide-vue-next'
import { defineTool } from '../types'

/** 背景移除：浏览器端 ONNX 推理（u2netp）本地抠图，支持画笔微调，图片不出浏览器 */
export default defineTool({
  slug: 'background-remover',
  name: 'Background Remover',
  description: '本地 AI 抠图：上传图片后在浏览器端运行分割模型去除背景，棋盘格预览透明效果，支持画笔恢复/擦除微调，导出透明 PNG，图片不上传服务器。',
  category: 'image',
  icon: Eraser,
  tags: ['background', 'matting', 'segmentation', 'ai'],
  accent: '#0ea5e9',
  component: () => import('./BackgroundRemover.vue'),
})
