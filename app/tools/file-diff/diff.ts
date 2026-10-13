/**
 * 文本差异引擎：Myers 最短编辑脚本（行级）+ 词级行内高亮。
 * 纯函数、无 Vue / DOM 依赖，页面与测试脚本共用同一份实现。
 */

/** 行内高亮片段：changed 为 true 时表示该片段在另一侧不存在 */
export interface InlineSegment {
  text: string
  changed: boolean
}

/** 差异视图中的一侧单元格 */
export interface DiffCell {
  /** 该行在本次对比中的状态：原文件侧只出现 equal / removed，新文件侧只出现 equal / added */
  state: 'equal' | 'added' | 'removed'
  /** 所在侧文件中的行号（1 起始） */
  line: number
  text: string
  /** 同一行的词级差异；整行新增 / 删除（无对侧行）时为 null */
  segments: InlineSegment[] | null
}

export interface DiffRow {
  /** 该行两侧内容是否一致 */
  changed: boolean
  /** 原文件一侧；该侧无对应行时为 null */
  left: DiffCell | null
  /** 新文件一侧；该侧无对应行时为 null */
  right: DiffCell | null
}

export interface DiffStats {
  added: number
  removed: number
  unchanged: number
}

export interface DiffResult {
  rows: DiffRow[]
  stats: DiffStats
  /**
   * 是否退化为「去掉公共前后缀 + 整块替换」的粗略对比。
   * 两侧总行数超过 DIFF_LINE_LIMIT 时为 true，用于提示用户结果不如精细模式准确。
   */
  coarse: boolean
}

/** 行数上限：超过后改用粗略对比，避免 Myers 的 O(D²) 回溯内存把标签页拖死 */
export const DIFF_LINE_LIMIT = 4000

/** 行内词级对比的字符数上限：超长单行（压缩代码 / min.js）退化为整行高亮 */
const INLINE_CHAR_LIMIT = 2000

type OpKind = 'equal' | 'insert' | 'delete'

interface Op {
  kind: OpKind
  text: string
}

/** 按行切分：归一化 CRLF/CR，并丢掉文件末尾换行符带来的空行 */
function splitLines(text: string): string[] {
  if (!text)
    return []
  const normalized = text.replace(/\r\n?/g, '\n')
  const body = normalized.endsWith('\n') ? normalized.slice(0, -1) : normalized
  return body.split('\n')
}

/**
 * Myers 差分核心：返回最短编辑脚本。
 * trace[d] 保存第 d 轮迭代开始前的 V 快照（只保留 V 的有效区间 offset-d-1 .. offset+d+1），
 * 因此回溯内存为 O(D²) 而非 O(D·(N+M))。
 */
function shortestEditScript(a: string[], b: string[]): Op[] {
  const n = a.length
  const m = b.length
  const max = n + m
  const offset = max
  const size = 2 * max + 1
  const v = new Int32Array(size)
  const trace: Int32Array[] = []

  let reached = false
  for (let d = 0; d <= max; d++) {
    const start = Math.max(0, offset - d - 1)
    trace.push(v.slice(start, Math.min(size, offset + d + 2)))
    for (let k = -d; k <= d; k += 2) {
      let x = (k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1]))
        ? v[offset + k + 1]
        : v[offset + k - 1] + 1
      let y = x - k
      while (x < n && y < m && a[x] === b[y]) {
        x++
        y++
      }
      v[offset + k] = x
      if (x >= n && y >= m) {
        reached = true
        break
      }
    }
    if (reached)
      break
  }

  const ops: Op[] = []
  let x = n
  let y = m

  for (let d = trace.length - 1; d > 0; d--) {
    const prev = trace[d]
    // 与保留区间起点保持一致：全局下标 offset+k 对应局部下标 base+k
    const base = offset - Math.max(0, offset - d - 1)
    const k = x - y
    const goDown = k === -d || (k !== d && prev[base + k - 1] < prev[base + k + 1])
    const prevX = prev[base + (goDown ? k + 1 : k - 1)]
    const prevY = prevX - (goDown ? k + 1 : k - 1)

    while (x > prevX && y > prevY) {
      x--
      y--
      ops.push({ kind: 'equal', text: a[x] })
    }
    if (x > prevX) {
      x--
      ops.push({ kind: 'delete', text: a[x] })
    }
    else if (y > prevY) {
      y--
      ops.push({ kind: 'insert', text: b[y] })
    }
  }

  // d = 0 段全部是对角线（相等行）
  while (x > 0 && y > 0) {
    x--
    y--
    ops.push({ kind: 'equal', text: a[x] })
  }
  while (x > 0) {
    x--
    ops.push({ kind: 'delete', text: a[x] })
  }
  while (y > 0) {
    y--
    ops.push({ kind: 'insert', text: b[y] })
  }

  return ops.reverse()
}

/** 粗略对比（超大输入兜底）：裁掉公共前后缀，中间整块视为删除 + 新增 */
function coarseEditScript(a: string[], b: string[]): Op[] {
  let prefix = 0
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix])
    prefix++

  let suffix = 0
  while (
    suffix < a.length - prefix
    && suffix < b.length - prefix
    && a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
  )
    suffix++

  const ops: Op[] = []
  for (let i = 0; i < prefix; i++)
    ops.push({ kind: 'equal', text: a[i] })
  for (let i = prefix; i < a.length - suffix; i++)
    ops.push({ kind: 'delete', text: a[i] })
  for (let i = prefix; i < b.length - suffix; i++)
    ops.push({ kind: 'insert', text: b[i] })
  for (let i = a.length - suffix; i < a.length; i++)
    ops.push({ kind: 'equal', text: a[i] })
  return ops
}

/** 合并相邻且标记相同的片段，避免渲染出大量碎 span */
function pushSegment(list: InlineSegment[], text: string, changed: boolean) {
  const last = list[list.length - 1]
  if (last && last.changed === changed)
    last.text += text
  else
    list.push({ text, changed })
}

interface InlineDiff {
  left: InlineSegment[]
  right: InlineSegment[]
}

/** 单行词级差异；无差异或超长时返回 null（调用方按整行处理） */
function diffInline(left: string, right: string): InlineDiff | null {
  if (left === right || left.length + right.length > INLINE_CHAR_LIMIT)
    return null

  // 词级切分：连续标识符 / 空白 / 单个符号各成一段，保证行内高亮不会糊成一团
  const tokenize = (value: string) => value.match(/[A-Za-z0-9_]+|\s+|[^\sA-Za-z0-9_]/g) ?? []
  const ops = shortestEditScript(tokenize(left), tokenize(right))
  const result: InlineDiff = { left: [], right: [] }
  for (const op of ops) {
    if (op.kind === 'equal') {
      pushSegment(result.left, op.text, false)
      pushSegment(result.right, op.text, false)
    }
    else if (op.kind === 'delete') {
      pushSegment(result.left, op.text, true)
    }
    else {
      pushSegment(result.right, op.text, true)
    }
  }
  return result
}

/**
 * 把编辑脚本整理成「渲染行」：相邻的删除块与新增块按序配对，
 * 配对上的行做词级高亮，未配对的按整行新增 / 删除处理。
 */
function buildRows(ops: Op[]): DiffRow[] {
  const rows: DiffRow[] = []
  let oldLine = 1
  let newLine = 1
  let index = 0

  while (index < ops.length) {
    const op = ops[index]
    if (op.kind === 'equal') {
      rows.push({
        changed: false,
        left: { state: 'equal', line: oldLine++, text: op.text, segments: null },
        right: { state: 'equal', line: newLine++, text: op.text, segments: null },
      })
      index++
      continue
    }

    const deletes: string[] = []
    const inserts: string[] = []
    while (index < ops.length && ops[index].kind !== 'equal') {
      if (ops[index].kind === 'delete')
        deletes.push(ops[index].text)
      else
        inserts.push(ops[index].text)
      index++
    }

    const paired = Math.min(deletes.length, inserts.length)
    for (let i = 0; i < deletes.length; i++) {
      const right = i < paired ? inserts[i] : null
      const inline = right === null ? null : diffInline(deletes[i], right)
      rows.push({
        changed: true,
        left: { state: 'removed', line: oldLine++, text: deletes[i], segments: inline?.left ?? null },
        right: right === null ? null : { state: 'added', line: newLine++, text: right, segments: inline?.right ?? null },
      })
    }
    for (let i = paired; i < inserts.length; i++) {
      rows.push({
        changed: true,
        left: null,
        right: { state: 'added', line: newLine++, text: inserts[i], segments: null },
      })
    }
  }

  return rows
}

/** 对比两段文本，返回渲染行与统计信息 */
export function diffTexts(oldText: string, newText: string): DiffResult {
  const a = splitLines(oldText)
  const b = splitLines(newText)

  const coarse = a.length + b.length > DIFF_LINE_LIMIT
  const ops = coarse ? coarseEditScript(a, b) : shortestEditScript(a, b)

  let added = 0
  let removed = 0
  let unchanged = 0
  for (const op of ops) {
    if (op.kind === 'insert')
      added++
    else if (op.kind === 'delete')
      removed++
    else
      unchanged++
  }

  return { rows: buildRows(ops), stats: { added, removed, unchanged }, coarse }
}
