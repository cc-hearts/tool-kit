import { Cookie } from 'lucide-vue-next'
import { defineTool } from '../types'

/** Cookie 字符串 → JSON */
export default defineTool({
  slug: 'cookie-parser',
  name: 'Cookie Parser',
  description: '把复制来的 Cookie 字符串解析成 JSON，自动识别请求 Cookie、Set-Cookie 响应头与 DevTools 导出的 JSON。',
  category: 'devtools',
  icon: Cookie,
  tags: ['cookie', 'json'],
  accent: '#0ea5e9',
  component: () => import('./CookieParser.vue'),
})
