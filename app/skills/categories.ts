import type { SkillCategoryMeta } from './types'

export const skillCategories: SkillCategoryMeta[] = [
  {
    key: 'desktop-ui',
    label: '桌面设计体系',
    description: 'macOS / Windows 桌面工作台、无描边悬浮卡片、纯色底色与表单控件体系',
  },
  {
    key: 'workflow',
    label: 'Agent 协同工作流',
    description: '自治循环、任务分发、Git 提交规范与会话上下文状态维护',
  },
  {
    key: 'automation',
    label: '自动化与工具',
    description: '系统调用、命令行驱动、自动化脚本与环境探针集成',
  },
  {
    key: 'quality',
    label: '质量与代码审查',
    description: '代码走查、内存安全、无障碍 a11y 审计与缺陷拦截规范',
  },
]
