import { defineConfig, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [presetWind3()],
  theme: {
    colors: {
      // shadcn 语义令牌：RGB 三元组形式，支持 /50 透明度修饰符，与 main.css 中变量一一对应
      background: 'rgb(var(--background) / <alpha-value>)',
      foreground: 'rgb(var(--foreground) / <alpha-value>)',
      card: 'rgb(var(--card) / <alpha-value>)',
      'card-foreground': 'rgb(var(--card-foreground) / <alpha-value>)',
      muted: 'rgb(var(--muted) / <alpha-value>)',
      'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
      border: 'rgb(var(--border) / <alpha-value>)',
      input: 'rgb(var(--input) / <alpha-value>)',
      primary: 'rgb(var(--primary) / <alpha-value>)',
      'primary-foreground': 'rgb(var(--primary-foreground) / <alpha-value>)',
      accent: 'rgb(var(--accent) / <alpha-value>)',
      'accent-foreground': 'rgb(var(--accent-foreground) / <alpha-value>)',
      ring: 'rgb(var(--ring) / <alpha-value>)',
    },
  },
  shortcuts: {
    // 页面通用容器
    'page-container': 'mx-auto w-full max-w-1200px px-4 sm:px-6',
    // shadcn Card 风格表面
    'tool-surface': 'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
    // shadcn 风格图标底座：muted 底 + foreground 图标
    'icon-box': 'flex items-center justify-center rounded-md border border-border bg-muted text-foreground',
    // 细边框分隔（头部/侧栏）
    'border-hairline': 'border-border',
  },
})
