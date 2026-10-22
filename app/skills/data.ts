import type { SkillItem } from './types'
import { agentDesktopUiSkill } from './agent-desktop-ui'

export const skills: SkillItem[] = [
  {
    ...agentDesktopUiSkill,
    category: 'desktop-ui',
    hasLiveDemo: true,
    demoComponent: 'AgentDesktopDemo',
    updatedAt: '2026-10-22',
  },
]
