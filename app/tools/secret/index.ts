import { KeyRound } from 'lucide-vue-next'
import { defineTool } from '../types'

/** 凭据生成器：AES 密钥 / 强密码 / UUID / JWT Secret */
export default defineTool({
  slug: 'secret',
  name: 'Secret Generator',
  description: '基于 Web Crypto API 在本地生成 AES 密钥（CBC/GCM）、强密码、UUID v4 与 JWT Secret，数据不出浏览器。',
  category: 'security',
  icon: KeyRound,
  tags: ['aes', 'password', 'uuid', 'jwt'],
  accent: '#10b981',
  component: () => import('./SecretGenerator.vue'),
})
