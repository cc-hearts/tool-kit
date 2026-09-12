// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-12',

  modules: ['@unocss/nuxt', '@antdv-next/nuxt'],

  antd: {
    icon: true,
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
      ],
    },
  },

  // 组件目录仅作分组，不追加目录前缀（components/market/ToolCard.vue 仍以 <ToolCard> 使用）
  components: [{ path: '~/components', pathPrefix: false }],

  nitro: {
    externals: {
      // lodash-es 为纯 ESM 且无 exports 映射，外置后无扩展名子路径在 Node ESM 下无法解析
      inline: ['lodash-es'],
    },
  },
})
