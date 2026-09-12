// 在浏览器中使用 Web Crypto API 实现与 Node.js 代码类似的功能

// 生成指定长度的随机字节
export async function generatorRandomBytes(count: number) {
  const randomValues = new Uint8Array(count)
  window.crypto.getRandomValues(randomValues)
  return randomValues
}

// 将随机字节转换为十六进制字符串
export function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

// 将随机字节转换为 Base64 字符串
export function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  bytes.forEach(byte => (binary += String.fromCharCode(byte)))
  return window.btoa(binary)
}

/** 随机字节 → 指定编码输出 */
export async function randomEncoded(count: number, encoding: 'hex' | 'base64' = 'hex') {
  const bytes = await generatorRandomBytes(count)
  return encoding === 'hex' ? bytesToHex(bytes) : bytesToBase64(bytes)
}

// 生成 AES 签名（CBC 形态：32 字节密钥 + 16 字节 IV）
export async function generatorAesSign() {
  const key = await randomEncoded(32)
  const iv = await randomEncoded(16)
  return { key, iv }
}

const CHARSET = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?',
} as const

export type PasswordCharsetKey = keyof typeof CHARSET

/** 易混淆字符（用户可排除）：I l 1 O 0 o */
const AMBIGUOUS = /[Il1O0o]/g

export interface PasswordOptions {
  length: number
  charsets: PasswordCharsetKey[]
  /** 排除易混淆字符 I l 1 O 0 o */
  excludeAmbiguous: boolean
}

/** 生成强密码：从每个已选字符集至少取一个，其余随机填充后整体洗牌 */
export async function generatePassword(options: PasswordOptions) {
  const groups = options.charsets.map((key) => {
    let set: string = CHARSET[key]
    if (options.excludeAmbiguous)
      set = set.replace(AMBIGUOUS, '')
    return set
  }).filter(Boolean)

  if (!groups.length)
    return ''

  const chars: string[] = groups.map(set => set.charAt(Math.floor(Math.random() * set.length)))
  const pool = groups.join('')
  while (chars.length < options.length)
    chars.push(pool.charAt(Math.floor(Math.random() * pool.length)))

  // Fisher–Yates 洗牌，避免「每组必有一个」造成的位置规律
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const current = chars[i]!
    chars[i] = chars[j]!
    chars[j] = current
  }
  return chars.join('')
}

/** UUID v4（crypto.randomUUID 不可用时回退到随机字节拼接） */
export function generateUUID() {
  if (typeof window.crypto.randomUUID === 'function')
    return window.crypto.randomUUID()

  const bytes = window.crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = bytesToHex(bytes)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
