# Tool Kit

集成常用开发工具的「工具市场」，采用 **Nuxt 4 + Ant Design Vue 4 + UnoCSS** 技术栈，布局参考物料市场：左侧分类导航 + 工具卡片网格 + 工具详情页，支持亮/暗主题与 SSR。

## 快速开始

```bash
pnpm install
pnpm dev        # 开发（http://localhost:3000）
pnpm build      # 生产构建
pnpm preview    # 预览生产构建
```

> 依赖安装说明：`pnpm-workspace.yaml` 中将 `minimumReleaseAge` 调整为 720 分钟（12 小时），避免 pnpm 默认供应链策略拦截刚发布的补丁版本；`onlyBuiltDependencies` 放行 esbuild / core-js 的安装脚本。

## 目录结构

```text
app/
├── app.vue                    # 根组件：ConfigProvider（主题/国际化）+ 布局出口
├── error.vue                  # 全局错误页（404 / 500）
├── layouts/
│   └── default.vue            # a-layout 骨架：Header + Content + Footer
├── pages/
│   ├── index.vue              # 工具市场：分类 Sider + 工具网格（分类/关键词写入 URL query）
│   └── tools/
│       └── [slug].vue         # 工具详情页：按 slug 查注册表，动态加载工具视图
├── components/                # 通用组件（自动导入，pathPrefix 关闭）
│   ├── AppHeader.vue          # 顶栏：Logo / 全局搜索 / 主题切换
│   ├── AppFooter.vue
│   ├── CategoryMenu.vue       # 分类菜单（桌面侧栏 / 移动端下拉）
│   ├── ToolCard.vue           # 工具卡片
│   ├── ToolGrid.vue           # 卡片网格 + 空态
│   └── ToolPageShell.vue      # 工具页统一外壳（返回 + 标题区 + 内容容器）
├── tools/                     # ★ 工具注册表与工具实现
│   ├── types.ts               # ToolMeta 类型 + defineTool()
│   ├── categories.ts          # 分类清单
│   ├── index.ts               # 汇总注册表 + getToolBySlug 等查询函数
│   └── <slug>/                # 每个工具一个目录
│       ├── index.ts           # defineTool({...}) 工具元信息
│       └── XxxTool.vue        # 工具视图（懒加载）
├── composables/
│   └── useTheme.ts            # 主题状态（cookie 持久化 + antd algorithm/component token）
├── utils/                     # 纯函数工具（Nuxt 自动导入）
└── assets/css/main.css        # 全局样式修正
server/
└── api/track.post.ts          # 服务端路由示例（行为埋点上报）
```

## 如何新增一个工具

1. **创建工具目录** `app/tools/<slug>/`，编写视图组件（纯客户端逻辑可直接用 antd 组件）：

   ```vue
   <!-- app/tools/my-tool/MyTool.vue -->
   <script setup lang="ts">
   const input = ref('')
   </script>

   <template>
     <a-textarea v-model:value="input" :rows="12" />
   </template>
   ```

2. **注册工具元信息** `app/tools/my-tool/index.ts`：

   ```ts
   import { FlaskConical } from 'lucide-vue-next'
   import { defineTool } from '../types'

   export default defineTool({
     slug: 'my-tool',              // 路由 /tools/my-tool，需唯一
     name: 'My Tool',
     description: '一句话描述工具用途。',
     category: 'devtools',          // 见 categories.ts
     icon: FlaskConical,            // lucide-vue-next 图标
     tags: ['demo'],
     component: () => import('./MyTool.vue'),  // 懒加载，仅在访问详情页时下载
   })
   ```

3. **加入注册表**：在 `app/tools/index.ts` 的 `tools` 数组中追加一行。

完成。市场首页卡片、分类过滤、全局搜索、详情页路由均由注册表自动驱动，无需改任何页面代码。新增分类则先在 `app/tools/categories.ts` 中登记。

## 架构说明

- **注册表驱动（物料清单模式）**：`app/tools` 是唯一的工具清单来源，市场卡片、分类计数、搜索、详情页动态加载全部从注册表派生；工具实现通过动态 `import()` 按需分包。
- **URL 即状态**：分类（`?category=`）与搜索关键词（`?q=`）保存在 URL query 中，刷新/分享/回退均可用。
- **主题系统**：`useTheme` 基于 cookie 持久化（SSR 与客户端渲染一致，避免水合不匹配），通过 `ConfigProvider` 切换 antd `darkAlgorithm` 并注入组件级 token；暗色设计基准为 `#050505` 页面底 + `#111111` 头部/面板 + Menu 透明底半透明蓝选中态。UnoCSS 侧通过 `html.dark` class 与 `dark:` 变体联动。
- **antd 按需引入**：通过 `unplugin-vue-components` + `AntDesignVueResolver` 自动按需导入（v4 为 cssinjs，无需样式文件）。

## License

[MIT](./LICENSE)
