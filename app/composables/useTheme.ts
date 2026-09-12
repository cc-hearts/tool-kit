import { theme as antdTheme } from 'antdv-next'

type ThemeMode = 'light' | 'dark'

/** 与 main.css 的 shadcn 语义令牌保持同值（antdv token 内联为具体色值，不能直接引用 CSS 变量） */
const palette = {
  light: {
    primary: '#18181b',
    primaryFg: '#fafafa',
    background: '#ffffff',
    card: '#ffffff',
    muted: '#f4f4f5',
    border: '#e4e4e7',
    text: '#09090b',
    textSecondary: 'rgba(9, 9, 11, 0.6)',
    hoverBg: 'rgba(9, 9, 11, 0.05)',
  },
  dark: {
    primary: '#fafafa',
    primaryFg: '#18181b',
    background: '#09090b',
    card: '#101012',
    muted: '#27272a',
    border: '#27272a',
    text: '#fafafa',
    textSecondary: 'rgba(250, 250, 250, 0.6)',
    hoverBg: 'rgba(250, 250, 250, 0.08)',
  },
} as const

/** 组件级 token，antdv4 命名（Layout 用 colorBgHeader/colorBgBody，Menu 用 colorItemBg 系列） */
function components(mode: ThemeMode) {
  const c = palette[mode]
  return {
    Layout: {
      colorBgHeader: 'transparent',
      colorBgBody: c.background,
      colorBgTrigger: 'transparent',
    },
    Menu: {
      colorItemBg: 'transparent',
      colorSubItemBg: 'transparent',
      colorItemText: c.textSecondary,
      colorItemTextHover: c.text,
      colorItemBgHover: c.hoverBg,
      colorItemBgSelected: c.hoverBg,
      colorItemTextSelected: c.text,
      colorItemBgSelectedHorizontal: 'transparent',
      menuSubMenuBg: 'transparent',
      colorActiveBarHeight: 0,
    },
    Button: {
      // shadcn primary 按钮为近黑（暗色近白），圆角与边框弱化
      colorPrimary: c.primary,
      colorPrimaryHover: c.primary,
      colorTextLightSolid: c.primaryFg,
      borderRadius: 8,
    },
    Tag: {
      // shadcn secondary badge：muted 底 + 前景文字
      colorBgContainer: c.muted,
      colorText: c.textSecondary,
      borderRadiusSM: 6,
    },
    Input: {
      colorBorder: c.border,
      colorBgContainer: c.background,
      activeShadow: '0 0 0 2px rgba(9, 9, 11, 0.08)',
      borderRadius: 8,
    },
    Card: {
      colorBgContainer: c.card,
      colorBorderSecondary: c.border,
    },
  }
}

/** 全局主题状态：供根节点 ConfigProvider 与头部切换按钮共用 */
export function useTheme() {
  // 偏好写入 cookie（而非 localStorage），保证 SSR 与客户端渲染一致，避免水合不匹配
  const mode = useCookie<ThemeMode>('toolkit-theme', { default: () => 'light' })

  const isDark = computed({
    get: () => mode.value === 'dark',
    set: (value: boolean) => {
      mode.value = value ? 'dark' : 'light'
    },
  })

  function toggle() {
    isDark.value = !isDark.value
  }

  const themeConfig = computed(() => {
    const c = palette[mode.value]
    return {
      algorithm: isDark.value ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: c.primary,
        colorBgLayout: c.background,
        colorBgContainer: c.card,
        colorBorder: c.border,
        colorBorderSecondary: c.border,
        colorText: c.text,
        colorTextSecondary: c.textSecondary,
        colorLink: c.text,
        borderRadius: 8,
        fontFamily: 'inherit',
      },
      components: components(mode.value),
    }
  })

  return { isDark, toggle, themeConfig }
}
