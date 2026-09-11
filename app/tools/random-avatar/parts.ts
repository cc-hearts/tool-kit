/**
 * Notion 风格简笔头像部件库。
 * 所有部件绘制在 240×240 viewBox 内：头部椭圆 (120,118) rx60 ry68，
 * 五官锚点：眼 y≈115 (x 97/143)、眉 y≈98、鼻 x≈120、嘴 y≈150。
 * 统一使用 #1f2020 粗描边 + 平涂色块，还原简笔手绘感。
 */

/** 描边公共属性 */
const S = 'stroke="#1f2020" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"'

export interface AvatarColors {
  bg: string
  skin: string
  hair: string
}

export interface AvatarPart {
  /** 变体展示名 */
  name: string
  /** 输出该部件的 SVG 片段 */
  svg: (colors: AvatarColors) => string
}

/* ---------- 背景与配色 ---------- */

export const bgColors = [
  '#fde68a', '#fca5a5', '#f9a8d4', '#d8b4fe', '#a5b4fc',
  '#93c5fd', '#7dd3fc', '#6ee7b7', '#bef264', '#fdba74',
]

export const skinColors = ['#f5d3b4', '#f1c27d', '#e0ac69', '#c68642', '#8d5524']

export const hairColors = ['#1f2020', '#5c3a21', '#a8683c', '#d6b25e', '#9ca3af']

/* ---------- 头部（固定部件） ---------- */

export function headSvg(colors: AvatarColors) {
  return [
    `<circle cx="62" cy="124" r="11" fill="${colors.skin}" ${S}/>`,
    `<circle cx="178" cy="124" r="11" fill="${colors.skin}" ${S}/>`,
    `<ellipse cx="120" cy="118" rx="60" ry="68" fill="${colors.skin}" ${S}/>`,
  ].join('')
}

/* ---------- 发型（前景，绘制在头部之上） ---------- */

export const hairParts: AvatarPart[] = [
  { name: '光头', svg: () => '' },
  {
    name: '短碎发',
    svg: c => `<path d="M62 118 C58 64 88 44 120 44 C152 44 182 64 178 118 C170 96 158 82 120 82 C82 82 70 96 62 118 Z" fill="${c.hair}" ${S}/>`,
  },
  {
    name: '齐刘海',
    svg: c => `<path d="M58 132 C52 60 90 40 120 40 C150 40 188 60 182 132 L166 132 C168 96 152 80 120 80 C88 80 72 96 74 132 Z" fill="${c.hair}" ${S}/>`,
  },
  {
    name: '自然卷',
    svg: c => [
      `<circle cx="84" cy="66" r="17" fill="${c.hair}" ${S}/>`,
      `<circle cx="120" cy="54" r="18" fill="${c.hair}" ${S}/>`,
      `<circle cx="156" cy="66" r="17" fill="${c.hair}" ${S}/>`,
      `<path d="M64 108 C60 84 70 72 84 70 C90 58 108 52 120 58 C134 50 152 58 156 70 C170 74 178 88 176 108 C170 94 150 86 120 86 C90 86 70 94 64 108 Z" fill="${c.hair}" ${S}/>`,
    ].join(''),
  },
  {
    name: '侧分刘海',
    svg: c => `<path d="M62 116 C60 62 92 44 120 44 C154 44 180 66 178 116 C172 98 162 86 142 82 C120 88 96 92 78 104 C70 109 65 112 62 116 Z" fill="${c.hair}" ${S}/>`,
  },
  {
    name: '丸子头',
    svg: c => [
      `<circle cx="120" cy="36" r="17" fill="${c.hair}" ${S}/>`,
      `<path d="M62 112 C60 62 90 46 120 46 C150 46 180 62 178 112 C170 92 156 78 120 78 C84 78 70 92 62 112 Z" fill="${c.hair}" ${S}/>`,
    ].join(''),
  },
  {
    name: '双丸子',
    svg: c => [
      `<circle cx="70" cy="48" r="15" fill="${c.hair}" ${S}/>`,
      `<circle cx="170" cy="48" r="15" fill="${c.hair}" ${S}/>`,
      `<path d="M62 108 C60 60 90 46 120 46 C150 46 180 60 178 108 C170 90 156 78 120 78 C84 78 70 90 62 108 Z" fill="${c.hair}" ${S}/>`,
    ].join(''),
  },
  {
    name: '冲天辫',
    svg: c => [
      `<path d="M78 62 L86 34 L100 50 L112 24 L126 44 L140 26 L152 48 L164 38 L166 64 C150 48 90 48 78 62 Z" fill="${c.hair}" ${S}/>`,
      `<path d="M62 112 C60 62 90 46 120 46 C150 46 180 62 178 112 C170 92 156 78 120 78 C84 78 70 92 62 112 Z" fill="${c.hair}" ${S}/>`,
    ].join(''),
  },
  {
    name: '中分',
    svg: c => `<path d="M62 118 C58 62 90 44 120 44 C150 44 182 62 178 118 C170 96 160 84 148 80 C140 92 130 86 120 86 C110 86 100 92 92 80 C80 84 70 96 62 118 Z" fill="${c.hair}" ${S}/>`,
  },
]

/* ---------- 脑后发型（绘制在头部之后） ---------- */

export const hairBackParts: AvatarPart[] = [
  { name: '无', svg: () => '' },
  {
    name: '长直发',
    svg: c => `<path d="M54 196 C36 120 58 46 120 46 C182 46 204 120 186 196 C178 204 162 204 156 194 C162 150 158 108 120 108 C82 108 78 150 84 194 C78 204 62 204 54 196 Z" fill="${c.hair}" ${S}/>`,
  },
  {
    name: '马尾',
    svg: c => `<path d="M166 66 C206 74 220 120 200 164 C196 172 184 170 184 160 C194 130 188 100 158 90 Z" fill="${c.hair}" ${S}/>`,
  },
  {
    name: '短后层',
    svg: c => `<path d="M56 160 C44 90 76 46 120 46 C164 46 196 90 184 160 C178 168 168 168 164 158 C170 120 160 96 120 96 C80 96 70 120 76 158 C72 168 62 168 56 160 Z" fill="${c.hair}" ${S}/>`,
  },
]

/* ---------- 眉毛 ---------- */

export const browParts: AvatarPart[] = [
  { name: '平眉', svg: () => `<path d="M87 100 H107" fill="none" ${S}/><path d="M133 100 H153" fill="none" ${S}/>` },
  { name: '弯眉', svg: () => `<path d="M87 101 Q97 94 107 101" fill="none" ${S}/><path d="M133 101 Q143 94 153 101" fill="none" ${S}/>` },
  { name: '剑眉', svg: () => `<path d="M88 103 L107 97" fill="none" ${S}/><path d="M133 97 L152 103" fill="none" ${S}/>` },
  { name: '粗眉', svg: () => `<path d="M88 99 Q97 95 106 99" fill="none" stroke="#1f2020" stroke-width="7" stroke-linecap="round"/><path d="M134 99 Q143 95 152 99" fill="none" stroke="#1f2020" stroke-width="7" stroke-linecap="round"/>` },
]

/* ---------- 眼睛 ---------- */

export const eyeParts: AvatarPart[] = [
  { name: '圆点眼', svg: () => `<circle cx="97" cy="115" r="5" fill="#1f2020"/><circle cx="143" cy="115" r="5" fill="#1f2020"/>` },
  { name: '眯眯眼', svg: () => `<path d="M88 117 Q97 109 106 117" fill="none" ${S}/><path d="M134 117 Q143 109 152 117" fill="none" ${S}/>` },
  { name: '大眼睛', svg: () => `<circle cx="97" cy="115" r="9" fill="#ffffff" ${S}/><circle cx="143" cy="115" r="9" fill="#ffffff" ${S}/><circle cx="97" cy="115" r="3.5" fill="#1f2020"/><circle cx="143" cy="115" r="3.5" fill="#1f2020"/>` },
  { name: '眨眼', svg: () => `<circle cx="97" cy="115" r="5" fill="#1f2020"/><path d="M134 116 Q143 110 152 116" fill="none" ${S}/>` },
  { name: '直线眼', svg: () => `<path d="M89 115 H105" fill="none" ${S}/><path d="M135 115 H151" fill="none" ${S}/>` },
]

/* ---------- 鼻子 ---------- */

export const noseParts: AvatarPart[] = [
  { name: '小弯鼻', svg: () => `<path d="M118 120 Q124 130 116 134" fill="none" ${S}/>` },
  { name: '短横鼻', svg: () => `<path d="M117 131 H124" fill="none" ${S}/>` },
  { name: '圆鼻头', svg: () => `<path d="M114 128 Q120 136 126 128" fill="none" ${S}/>` },
  { name: '高挺鼻', svg: () => `<path d="M121 118 Q124 130 115 133" fill="none" ${S}/>` },
]

/* ---------- 嘴巴 ---------- */

export const mouthParts: AvatarPart[] = [
  { name: '微笑', svg: () => `<path d="M105 148 Q120 160 135 148" fill="none" ${S}/>` },
  { name: '开心笑', svg: () => `<path d="M102 147 Q120 168 138 147 Q120 156 102 147 Z" fill="#1f2020" stroke="#1f2020" stroke-width="3" stroke-linejoin="round"/>` },
  { name: '平静', svg: () => `<path d="M109 152 H131" fill="none" ${S}/>` },
  { name: '惊讶', svg: () => `<circle cx="120" cy="152" r="6" fill="#1f2020"/>` },
  { name: '咧嘴笑', svg: () => `<path d="M99 146 Q120 171 141 146 Q120 158 99 146 Z" fill="#1f2020" stroke="#1f2020" stroke-width="3" stroke-linejoin="round"/>` },
  { name: '嘟嘴', svg: () => `<path d="M112 153 Q120 148 128 153" fill="none" ${S}/>` },
]

/* ---------- 胡须（绘制在嘴巴之下） ---------- */

export const beardParts: AvatarPart[] = [
  { name: '无', svg: () => '' },
  { name: '山羊胡', svg: c => `<path d="M110 158 Q120 152 130 158 Q132 178 120 182 Q108 178 110 158 Z" fill="${c.hair}" ${S}/>` },
  { name: '八字胡', svg: c => `<path d="M99 142 Q109 133 120 141 Q131 133 141 142 Q131 150 120 144 Q109 150 99 142 Z" fill="${c.hair}" ${S}/>` },
  { name: '络腮胡', svg: c => `<path d="M66 120 C66 166 90 190 120 190 C150 190 174 166 174 120 C174 120 168 152 120 152 C72 152 66 120 66 120 Z" fill="${c.hair}" ${S}/>` },
]

/* ---------- 眼镜 ---------- */

export const glassesParts: AvatarPart[] = [
  { name: '无', svg: () => '' },
  {
    name: '圆框眼镜',
    svg: () => [
      `<circle cx="97" cy="115" r="16" fill="none" stroke="#1f2020" stroke-width="4"/>`,
      `<circle cx="143" cy="115" r="16" fill="none" stroke="#1f2020" stroke-width="4"/>`,
      `<path d="M113 115 H127" stroke="#1f2020" stroke-width="4" stroke-linecap="round"/>`,
      `<path d="M81 112 L62 108" stroke="#1f2020" stroke-width="4" stroke-linecap="round"/>`,
      `<path d="M159 112 L178 108" stroke="#1f2020" stroke-width="4" stroke-linecap="round"/>`,
    ].join(''),
  },
  {
    name: '方框眼镜',
    svg: () => [
      `<rect x="81" y="102" width="32" height="26" rx="6" fill="none" stroke="#1f2020" stroke-width="4"/>`,
      `<rect x="127" y="102" width="32" height="26" rx="6" fill="none" stroke="#1f2020" stroke-width="4"/>`,
      `<path d="M113 113 H127" stroke="#1f2020" stroke-width="4" stroke-linecap="round"/>`,
      `<path d="M81 112 L62 108" stroke="#1f2020" stroke-width="4" stroke-linecap="round"/>`,
      `<path d="M159 112 L178 108" stroke="#1f2020" stroke-width="4" stroke-linecap="round"/>`,
    ].join(''),
  },
  {
    name: '墨镜',
    svg: () => [
      `<rect x="81" y="103" width="32" height="24" rx="6" fill="#1f2020"/>`,
      `<rect x="127" y="103" width="32" height="24" rx="6" fill="#1f2020"/>`,
      `<path d="M113 112 H127" stroke="#1f2020" stroke-width="4" stroke-linecap="round"/>`,
      `<path d="M81 112 L62 108" stroke="#1f2020" stroke-width="4" stroke-linecap="round"/>`,
      `<path d="M159 112 L178 108" stroke="#1f2020" stroke-width="4" stroke-linecap="round"/>`,
    ].join(''),
  },
]

/* ---------- 腮红 ---------- */

export const blushParts: AvatarPart[] = [
  { name: '无', svg: () => '' },
  {
    name: '有',
    svg: () => `<ellipse cx="80" cy="136" rx="11" ry="7" fill="#fb7185" opacity="0.5"/><ellipse cx="160" cy="136" rx="11" ry="7" fill="#fb7185" opacity="0.5"/>`,
  },
]

/* ---------- 衣服（绘制在头部之后，领口被下巴遮住） ---------- */

const teePath = 'M56 240 C56 206 84 190 120 190 C156 190 184 206 184 240 Z'

export const clothesParts: AvatarPart[] = [
  { name: '白 T 恤', svg: () => `<path d="${teePath}" fill="#fafafa" ${S}/>` },
  { name: '蓝 T 恤', svg: () => `<path d="${teePath}" fill="#bfdbfe" ${S}/>` },
  { name: '黄 T 恤', svg: () => `<path d="${teePath}" fill="#fde68a" ${S}/>` },
  {
    name: '衬衫',
    svg: () => [
      `<path d="${teePath}" fill="#e4e4e7" ${S}/>`,
      `<path d="M104 194 L120 212 L136 194" fill="#fafafa" ${S}/>`,
    ].join(''),
  },
  {
    name: '连帽衫',
    svg: () => [
      `<path d="${teePath}" fill="#ddd6fe" ${S}/>`,
      `<path d="M96 192 C96 178 144 178 144 192 C144 200 132 206 120 206 C108 206 96 200 96 192 Z" fill="#c4b5fd" ${S}/>`,
      `<path d="M112 208 V222" fill="none" stroke="#1f2020" stroke-width="4" stroke-linecap="round"/>`,
      `<path d="M128 208 V222" fill="none" stroke="#1f2020" stroke-width="4" stroke-linecap="round"/>`,
    ].join(''),
  },
  {
    name: '高领毛衣',
    svg: () => [
      `<path d="${teePath}" fill="#bbf7d0" ${S}/>`,
      `<path d="M102 190 H138 V204 C138 208 102 208 102 204 Z" fill="#86efac" ${S}/>`,
    ].join(''),
  },
]
