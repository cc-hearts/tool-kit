/**
 * Cookie 文本解析：把「复制来的 cookie」归一成可直接 JSON 化的结构。
 *
 * 实际粘贴进来的内容不止一种形态，这里按优先级自动识别：
 * 1. `json`        —— DevTools / Cookie 管理扩展导出的对象或数组，原样格式化；
 * 2. `set-cookie`  —— 响应头，除 name/value 外还带 Path、HttpOnly 等属性；
 * 3. `cookie`      —— `document.cookie` 或请求头，只有 `name=value` 序列。
 *
 * 纯函数，不触碰 DOM，便于单测与复用。
 */

/** 输入被识别成的形态 */
export type CookieKind = 'cookie' | 'set-cookie' | 'json'

export type CookieParseOutcome =
  | { ok: true, kind: CookieKind, data: unknown, count: number }
  | { ok: false, error: string }

/** Set-Cookie 的已知属性名（小写），用于把响应头从请求 Cookie 中区分出来 */
const SET_COOKIE_ATTRIBUTES = new Set([
  'path',
  'domain',
  'expires',
  'max-age',
  'samesite',
  'httponly',
  'secure',
  'partitioned',
  'priority',
])

/**
 * 「决定性」属性：这些名字几乎不会作为普通 cookie 的键出现，
 * 命中任意一个就足以判定为 Set-Cookie。
 * 其余属性（path / domain / priority）单独出现时存在误判风险，需累计两个才判定。
 */
const DECISIVE_ATTRIBUTES = new Set(['expires', 'max-age', 'samesite', 'httponly', 'secure', 'partitioned'])

/** 无值属性：出现即代表 true */
const FLAG_ATTRIBUTES = new Set(['httponly', 'secure', 'partitioned'])

/** Set-Cookie 属性名的输出写法（对齐常见的结构化命名） */
const ATTRIBUTE_ALIASES: Record<string, string> = {
  httponly: 'httpOnly',
  'max-age': 'maxAge',
  samesite: 'sameSite',
}

/** 去掉可能被一起复制的 `Cookie:` / `Set-Cookie:` 头部名 */
function stripHeaderLabel(line: string): string {
  return line.replace(/^\s*(?:set-)?cookie\s*:\s*/i, '').trim()
}

/** 分号分隔出的单个片段 */
interface Segment {
  name: string
  value: string
  /** 片段中是否存在 `=`；没有 `=` 的片段只可能是 Set-Cookie 的标志位 */
  hasEquals: boolean
}

/**
 * 拆出 `name=value` 片段。
 * 值里可能再出现 `=`（base64、JWT 填充等），因此只按第一个 `=` 切分。
 */
function splitSegments(line: string): Segment[] {
  return line
    .split(';')
    .map(segment => segment.trim())
    .filter(Boolean)
    .map((segment): Segment => {
      const index = segment.indexOf('=')
      if (index < 0)
        return { name: segment, value: '', hasEquals: false }
      return { name: segment.slice(0, index).trim(), value: segment.slice(index + 1).trim(), hasEquals: true }
    })
    .filter(segment => Boolean(segment.name))
}

/** 仅在确有百分号编码时才尝试解码；解码失败保留原值（cookie 值不保证是合法编码） */
function safeDecode(value: string): string {
  if (!value.includes('%'))
    return value
  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}

/** 只在首字符是 `{` / `[` 时尝试 JSON.parse，避免把普通 cookie 文本误判成 JSON */
function tryParseJson(text: string): { hit: true, data: unknown } | { hit: false } {
  if (text[0] !== '{' && text[0] !== '[')
    return { hit: false }
  try {
    return { hit: true, data: JSON.parse(text) }
  }
  catch {
    return { hit: false }
  }
}

function countTopLevel(data: unknown): number {
  if (Array.isArray(data))
    return data.length
  if (data !== null && typeof data === 'object')
    return Object.keys(data).length
  return 1
}

/** 单条 Set-Cookie → 结构化对象；未知属性原样保留，避免丢信息 */
function toSetCookieRecord(segments: Segment[], decode: boolean): Record<string, unknown> {
  const [first, ...attributes] = segments
  const record: Record<string, unknown> = {
    name: first?.name ?? '',
    value: decode ? safeDecode(first?.value ?? '') : (first?.value ?? ''),
  }

  for (const { name, value, hasEquals } of attributes) {
    const lower = name.toLowerCase()
    const outputKey = ATTRIBUTE_ALIASES[lower] ?? lower

    // 标志位（HttpOnly 等）与无值属性统一记作 true
    if (FLAG_ATTRIBUTES.has(lower) || !hasEquals)
      record[outputKey] = true
    else if (lower === 'max-age')
      record[outputKey] = Number.isFinite(Number(value)) ? Number(value) : value
    else
      record[outputKey] = value
  }

  return record
}

export function parseCookieInput(raw: string, decodeUrl = true): CookieParseOutcome {
  const text = raw.trim()
  if (!text)
    return { ok: false, error: '' }

  const asJson = tryParseJson(text)
  if (asJson.hit)
    return { ok: true, kind: 'json', data: asJson.data, count: countTopLevel(asJson.data) }

  // 显式写了 `Set-Cookie:` 头部名，无需再猜
  const labeledSetCookie = /^\s*set-cookie\s*:/i.test(text)

  // 一行一条记录：请求头通常只有一行，Set-Cookie 可能多行
  const records = text
    .split(/\r?\n/)
    .map(stripHeaderLabel)
    .filter(Boolean)
    .map(splitSegments)
    .filter(segments => segments.length > 0)

  if (!records.length)
    return { ok: false, error: '未识别到合法的 cookie 键值对' }

  // 只统计首段之后的片段：首段是 cookie 名，不参与属性判定
  const attributes = new Set<string>()
  for (const segments of records) {
    for (const { name } of segments.slice(1))
      attributes.add(name.toLowerCase())
  }
  const knownAttributes = [...attributes].filter(name => SET_COOKIE_ATTRIBUTES.has(name))
  const isSetCookie
    = labeledSetCookie
      || knownAttributes.some(name => DECISIVE_ATTRIBUTES.has(name))
      || knownAttributes.length >= 2

  if (isSetCookie) {
    const list = records.map(segments => toSetCookieRecord(segments, decodeUrl))
    return { ok: true, kind: 'set-cookie', data: list.length === 1 ? list[0] : list, count: list.length }
  }

  // 请求 Cookie：合并成扁平对象；同名保留首次出现（与浏览器读取顺序一致）。
  // 无 `=` 的片段在这里属非法（请求 Cookie 不存在标志位），直接跳过。
  const data: Record<string, string> = {}
  for (const segments of records) {
    for (const { name, value, hasEquals } of segments) {
      if (!hasEquals || name in data)
        continue
      data[name] = decodeUrl ? safeDecode(value) : value
    }
  }

  const names = Object.keys(data)
  if (!names.length)
    return { ok: false, error: '未识别到合法的 cookie 键值对' }

  return { ok: true, kind: 'cookie', data, count: names.length }
}
