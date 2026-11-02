import skillDoc from './SKILL.md?raw'
import tokensCss from './tokens.css?raw'
import tokensData from './tokens.json'

export interface SkillMeta {
  id: string
  name: string
  title: string
  description: string
  version: string
  source: string
  tags: string[]
  doc: string
  tokensCss: string
  tokensJson: typeof tokensData
}

export const agentDesktopUiSkill: SkillMeta = {
  id: 'agent-desktop-ui',
  name: 'agent-desktop-ui',
  title: 'Agent Desktop UI 设计体系',
  description: '面向 Agent 桌面工作台与开发者工具的跨平台设计系统规范。以 Acrylic 亚克力毛玻璃磨砂为主色材质，去冗余渐变聚焦高对比度终端卡片；对齐 term-fleet 的 Windows 11 自绘按钮、精准关闭 Icon 与居中避让布局，以及无遮罩可拖拽浮层体系。',
  version: '1.3.1',
  source: 'CarlOpenLab/term-fleet & macOS HIG / Win11 Fluent',
  tags: [
    'Acrylic Primary Vibrancy',
    'Windows 11 Precision Chrome',
    'Centered Windows Close Icon',
    'Term-Fleet Overlays',
    'Solid Plain Contrast',
    'Floating Cards',
    'Borderless Elevation',
    'Inset Grouped Settings',
  ],
  doc: skillDoc,
  tokensCss,
  tokensJson: tokensData,
}

export const allSkills: SkillMeta[] = [
  agentDesktopUiSkill,
]
