// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-12',

  modules: ['@unocss/nuxt', '@antdv-next/nuxt'],

  // 站点图标统一使用 lucide-vue-next，无需注册 @antdv-next/icons（默认 false，关闭全量图标注册）
  antd: {
    icon: false,
  },

  css: ['@unocss/reset/tailwind.css', '~/assets/css/main.css'],

  devtools: { enabled: true },

  typescript: {
    strict: true,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: 'Tool Kit · 工具市场',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '集成常用开发工具的工具市场，覆盖数据转换、代码辅助、安全加密等场景。' },
        // 移动端浏览器 UI 跟随亮暗主题
        { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#09090b', media: '(prefers-color-scheme: dark)' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Tool Kit' },
        { name: 'twitter:card', content: 'summary' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  // 组件目录仅作分组，不追加目录前缀（components/market/ToolCard.vue 仍以 <ToolCard> 使用）
  components: [{ path: '~/components', pathPrefix: false }],
})
