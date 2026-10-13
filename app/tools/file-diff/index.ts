import { FileDiff } from 'lucide-vue-next'
import { defineTool } from '../types'

/** 文件 / 文本差异对比 */
export default defineTool({
  slug: 'file-diff',
  name: 'File Diff',
  description: '对比两段文本或两个本地文件的差异，支持并排与统一视图、词级行内高亮，数据不出浏览器。',
  category: 'devtools',
  icon: FileDiff,
  tags: ['diff', 'compare', 'text'],
  accent: '#84cc16',
  component: () => import('./FileDiff.vue'),
})
