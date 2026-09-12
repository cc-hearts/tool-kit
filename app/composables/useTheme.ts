import { theme as antdTheme } from 'antdv-next'

type ThemeMode = 'light' | 'dark'

/**
 * 与 main.css 的 shadcn 语义令牌保持同值（纸墨朱砂 · warm paper）。
 * antdv-next 会把 Design Token 编译成 CSS 变量（--ant-color-primary 等）输出，
 * 但 seed 色需要在 JS 侧参与派生算法（hover / active / 状态色），
 * 因此这里维护具体色值，而不是直接引用 CSS 变量。
 *
 * 改这里的值时必须同步改 main.css，否则 antd 组件会与 UnoCSS 类脱节。
 */
const palette = {
  light: {
    // 主按钮用墨色；朱砂只留给聚焦环与强调
    primary: '#2b2620',
    primaryFg: '#f6f2ea',
    background: '#f6f2ea',
    card: '#fffdf8',
    muted: '#efe9dd',
    border: '#e0d8c8',
    text: '#2b2620',
    textSecondary: 'rgba(43, 38, 32, 0.62)',
    hoverBg: 'rgba(43, 38, 32, 0.06)',
    // 朱砂淡底（对应 main.css 的 --accent / --accent-foreground），
    // 列表项选中态用它，而不是让 antd 从墨色主色去派生；
    // accentHover 是「已选中项又被悬停」时的一档加深
    accent: '#f7e5e2',
    accentHover: '#f0d5d0',
    accentFg: '#a12f22',
    cinnabar: '#c0392b',
    focusShadow: 'rgba(192, 57, 43, 0.15)',
  },
  dark: {
    primary: '#ece7de',
    primaryFg: '#211d18',
    background: '#211d18',
    card: '#2a2620',
    muted: '#282218',
    border: '#3b352c',
    text: '#ece7de',
    textSecondary: 'rgba(236, 231, 222, 0.62)',
    hoverBg: 'rgba(236, 231, 222, 0.08)',
    accent: '#3a2720',
    accentFg: '#ea8069',
    cinnabar: '#e06a52',
    focusShadow: 'rgba(224, 106, 82, 0.2)',
  },
} as const

/** 组件级 token（antdv-next 命名：Layout 用 headerBg/bodyBg，Menu 用 itemBg/itemColor 系列） */
function components(mode: ThemeMode) {
  const c = palette[mode]
  return {
    Layout: {
      headerBg: 'transparent',
      bodyBg: 'transparent',
      triggerBg: 'transparent',
    },
    Menu: {
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
      itemColor: c.textSecondary,
      itemHoverColor: c.text,
      itemHoverBg: c.hoverBg,
      // 选中项反色：墨底 + 纸字（对齐原设计里分类 chip 的选中态）
      itemSelectedBg: c.primary,
      itemSelectedColor: c.primaryFg,
      horizontalItemSelectedBg: 'transparent',
      menuSubMenuBg: 'transparent',
      activeBarHeight: 0,
      borderRadius: 8,
    },
    Button: {
      // 主按钮为墨色（暗色为暖白），圆角与边框弱化
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
      colorBgContainer: c.card,
      activeShadow: `0 0 0 2px ${c.focusShadow}`,
      borderRadius: 8,
    },
    Card: {
      colorBgContainer: c.card,
      colorBorderSecondary: c.border,
    },
    Select: {
      // 选中项必须显式给色：antd 的 optionSelectedBg 默认从主色派生，
      // 而主色是墨色 #2b2620，派生出来是一块中灰（实测 #5e5d59），
      // 配上同样是深墨的文字几乎读不出来 —— 亮色模式下最刺眼的就是这里。
      optionSelectedBg: c.accent,
      optionSelectedColor: c.accentFg,
      optionSelectedFontWeight: 600,
      optionActiveBg: c.hoverBg,
      selectorBg: c.card,
      borderRadius: 8,
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
        // 浮层（下拉 / 气泡卡片 / 弹窗）用暖纸卡片色。
        // 不给的话 antd 默认是纯白 #ffffff，压在暖纸底上会冷一档。
        colorBgElevated: c.card,
        colorBorder: c.border,
        colorBorderSecondary: c.border,
        colorText: c.text,
        colorTextSecondary: c.textSecondary,
        colorLink: c.text,
        // 列表项 hover / 选中 / 「选中项再悬停」。
        // antd 默认分别是中性黑 rgba(0,0,0,.04) 与主色派生色（墨色主色派生出来是中灰 #5e5d59），
        // 都不在暖纸色系里，统一拉回墨色淡底 + 朱砂淡底。
        // 注意第三个：选中项同时带 -active 时，背景走的是它，漏掉就会退回中灰。
        controlItemBgHover: c.hoverBg,
        controlItemBgActive: c.accent,
        controlItemBgActiveHover: c.accentHover,
        borderRadius: 8,
        fontFamily: 'inherit',
      },
      components: components(mode.value),
    }
  })

  return { isDark, toggle, themeConfig }
}
