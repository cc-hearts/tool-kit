import { Dices } from 'lucide-vue-next'
import { defineTool } from '../types'

/** 沙雕网名生成：中文沙雕系列 + 英文搞笑梗，模板拼装、批量生成一键复制 */
export default defineTool({
  slug: 'random-name',
  name: 'Funny Nickname',
  description: '注册取名困难症救星：批量生成沙雕中文网名与搞笑英文网名，吃货系/摆烂系/技术梗/头衔梗随你挑，点击即复制。',
  category: 'fun',
  icon: Dices,
  tags: ['nickname', 'funny', 'meme'],
  accent: '#6366f1',
  component: () => import('./RandomName.vue'),
})
