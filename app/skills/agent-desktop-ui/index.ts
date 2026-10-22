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
  description: '面向 Agent 桌面工作台与开发者工具的 macOS 原生设计系统规范。涵盖纯色优先背景、悬浮卡片架构、受光边缘微光影、跨平台窗口控制及可拖拽无遮罩设置浮层。',
  version: '1.2.0',
  source: 'CarlOpenLab/term-fleet & macOS HIG',
  tags: [
    'macOS Native HIG',
    'Solid Background First',
    'Floating Cards',
    'Borderless Elevation',
    'Cross-Platform Chrome',
    'Inset Grouped Settings',
    'Oklab Washes',
  ],
  doc: skillDoc,
  tokensCss,
  tokensJson: tokensData,
}

export const allSkills: SkillMeta[] = [
  agentDesktopUiSkill,
]
