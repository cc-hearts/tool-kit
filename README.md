<p align="center">
  <a href="https://github.com/cc-hearts/tool-kit">
    <img src="./public/logo.svg" width="96" height="96" alt="Tool Kit Logo" />
  </a>
</p>

<h1 align="center">Tool Kit · Developer Utility Marketplace</h1>

<p align="center">
  An open-source developer toolkit marketplace covering common scenarios including data transformation, code generation, cryptography, and image processing.
  <br />
  <strong>100% Client-Side Execution · Privacy First · Modern Full-Stack SSR</strong>
</p>

<p align="center">
  <a href="https://github.com/cc-hearts/tool-kit"><img src="https://img.shields.io/badge/Nuxt-4.x-00DC82?style=flat-square&logo=nuxtdotjs&logoColor=white" alt="Nuxt 4" /></a>
  <a href="https://github.com/cc-hearts/tool-kit"><img src="https://img.shields.io/badge/Vue-3.5+-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue 3.5+" /></a>
  <a href="https://github.com/cc-hearts/tool-kit"><img src="https://img.shields.io/badge/Antdv_Next-1.5+-1677FF?style=flat-square&logo=antdesign&logoColor=white" alt="Antdv Next" /></a>
  <a href="https://github.com/cc-hearts/tool-kit"><img src="https://img.shields.io/badge/UnoCSS-preset--wind3-333333?style=flat-square&logo=unocss&logoColor=white" alt="UnoCSS" /></a>
  <a href="https://github.com/cc-hearts/tool-kit"><img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" /></a>
  <a href="https://github.com/cc-hearts/tool-kit/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
</p>

<p align="center">
  <b>English</b> · <a href="./README.zh-CN.md">简体中文</a>
</p>


---

## 🌟 Highlights & Tech Stack

- **Modern Full-stack Framework**: Built with **Nuxt 4** + **Vue 3.5+**, featuring full-site SSR (Server-Side Rendering) and high-performance client hydration.
- **Next-Gen Component Library**: Powered by **antdv-next** and the official **`@antdv-next/nuxt`** module, providing SSR CSS-in-JS style extraction and automatic component registration.
- **Atomic Styling**: **UnoCSS** (preset-wind3) paired with Shadcn / Zinc semantic design tokens for a clean, consistent design system.
- **Dark Mode Support**: Seamless light/dark theme switching with Cookie persistence to eliminate FOUC and hydration mismatches.
- **Registry-Driven Architecture**: Modular tools organized with lazy-loaded dynamic `import()`, synchronized with browser URL parameters (`?category=`, `?q=`).
- **Client-Side Privacy**: Most utilities run entirely in the browser using native APIs (Web Crypto API, Canvas, etc.), keeping your data private and secure.

---

## 🛠️ Included Tools

Currently includes **9 developer utilities** across 5 categories:

| Tool | Category | Description |
|---|---|---|
| **Base64 To PNG** | Conversion | Bidirectional conversion between Base64 and PNG: parse raw Base64/Data URLs into PNG, analyze dimensions & size, preview on transparent chessboard, and copy or download with one click |
| **YAML To DTS** | Conversion | Convert YAML configurations into TypeScript type declarations (`.d.ts`), supporting nested objects and array inference |
| **SVG Format** | Conversion | Format SVG source code, normalizing `fill` / `stroke` colors to `currentColor` for easy icon component authoring |
| **Secret Generator** | Security | Generate AES keys (CBC/GCM), strong random passwords, UUID v4, and JWT secrets locally using the Web Crypto API |
| **Word Case Convert** | Conversion | Batch convert words or phrases between camelCase, kebab-case, snake_case, PascalCase, and other naming conventions |
| **Image Crop** | Image | Client-side image cropping tool supporting zoom/pan, rotation, circular/rectangular clipping, and PNG/JPEG/WebP export |
| **Image Preview** | Image | Single and multi-image preview gallery: view images via URL, local file upload, drag-and-drop, or clipboard paste |
| **Random Avatar** | Fun | Generate Notion-style doodle avatars by randomly mixing facial features, hairstyles, and color palettes; export to SVG/PNG |
| **Funny Nickname** | Fun | Nickname generator: batch produce humorous Chinese and English nicknames across foodie, slacker, tech meme, and honorific themes |

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 11.0.0

### Installation & Development

```bash
# 1. Clone the repository
git clone https://github.com/cc-hearts/tool-kit.git
cd tool-kit

# 2. Install dependencies
pnpm install

# 3. Start development server (defaults to port 3000)
pnpm dev

# 4. Build for production
pnpm build

# 5. Preview production build
pnpm preview
```

> **Dependency Note**: The repository includes supply-chain policies in `pnpm-workspace.yaml` and allows execution scripts for essential build dependencies.

---

## 📂 Project Structure

```text
tool-kit/
├── app/
│   ├── app.vue                    # Root component: AConfigProvider (theme & locale) + layout outlet
│   ├── error.vue                  # Global error page (404 / 500)
│   ├── layouts/
│   │   └── default.vue            # Base layout: Header + page container + Footer
│   ├── pages/
│   │   ├── index.vue              # Marketplace homepage: Category sidebar + tool card grid
│   │   └── tools/
│   │       └── [slug].vue         # Dynamic tool detail route: lazily loads tool component by slug
│   ├── components/                # Shared UI components (Auto-imported by Nuxt, pathPrefix: false)
│   │   ├── AppHeader.vue          # Top header: Logo / Global search / Theme toggle
│   │   ├── AppFooter.vue          # Bottom footer
│   │   ├── CategoryMenu.vue       # Category filter menu (Responsive: desktop sidebar + mobile drawer)
│   │   ├── ToolCard.vue           # Marketplace tool card
│   │   ├── ToolGrid.vue           # Card grid layout with empty search states
│   │   └── ToolPageShell.vue      # Common shell for tool pages (Back button + title + content slot)
│   ├── tools/                     # ★ Tool registry and implementations
│   │   ├── types.ts               # ToolMeta interface definition & defineTool() helper
│   │   ├── categories.ts          # Category metadata list
│   │   ├── index.ts               # Master registry and getToolBySlug() query functions
│   │   └── <slug>/                # Individual tool directories
│   │       ├── index.ts           # Tool metadata definition via defineTool({...})
│   │       └── XxxTool.vue        # Tool view component (lazily loaded via dynamic import())
│   ├── composables/
│   │   └── useTheme.ts            # Theme state management (Cookie persistence + antd tokens)
│   ├── utils/                     # Utility helper functions (Auto-imported by Nuxt)
│   └── assets/css/main.css        # Global design tokens and style overrides
├── server/
│   └── api/track.post.ts          # Server route example (telemetry event logging)
├── nuxt.config.ts                 # Nuxt core configuration (modules, SEO meta, etc.)
├── uno.config.ts                  # UnoCSS configuration and shortcuts
└── package.json                   # Dependencies and scripts
```

---

## 🧩 Adding a New Tool

The architecture follows a **BOM (Bill of Materials) / Registry-driven Pattern**. Adding a new tool is fully modular and takes three simple steps:

### Step 1: Create tool directory and view component

Create a new directory `app/tools/<slug>/` and implement your component (e.g. `app/tools/my-tool/MyTool.vue`):

```vue
<!-- app/tools/my-tool/MyTool.vue -->
<script setup lang="ts">
import { message } from 'antdv-next'

const text = ref('')
function handleAction() {
  message.success('Processed successfully!')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <a-textarea v-model:value="text" :rows="8" placeholder="Enter content..." />
    <div class="flex justify-end">
      <a-button type="primary" @click="handleAction">Process</a-button>
    </div>
  </div>
</template>
```

### Step 2: Define tool metadata

In `app/tools/my-tool/index.ts`, use `defineTool` to declare tool metadata:

```ts
// app/tools/my-tool/index.ts
import { Wrench } from 'lucide-vue-next'
import { defineTool } from '../types'

export default defineTool({
  slug: 'my-tool',                            // URL path: /tools/my-tool (must be unique)
  name: 'My Utility Tool',                    // Display name
  description: 'A concise summary of what this tool does.',
  category: 'devtools',                       // Category ID (see categories.ts)
  icon: Wrench,                               // Lucide icon component
  tags: ['utility', 'demo'],                  // Search tags
  component: () => import('./MyTool.vue'),    // Code-split: loaded only when visiting the tool page
})
```

### Step 3: Register in the master list

Add the tool import to the `tools` array in `app/tools/index.ts`:

```ts
// app/tools/index.ts
import myTool from './my-tool'

export const tools: ToolMeta[] = [
  // ... existing tools
  myTool,
]
```

**That's it!** Marketplace card rendering, category counts, global search indexing, and detail page routing are all automatically handled without changing any page or layout files.

---

## 🏗️ Architecture Highlights

- **Registry-Driven (BOM Pattern)**: `app/tools` serves as the single source of truth. Each tool is automatically code-split into independent chunks via dynamic `import()`, preventing initial bundle bloat.
- **URL as State**: Category selection (`?category=`) and global search queries (`?q=`) are synchronized with URL query parameters for seamless history navigation and link sharing.
- **SSR-Safe Styling**:
  - `@antdv-next/nuxt` extracts CSS-in-JS styles on the server, preventing flash of unstyled content (FOUC);
  - Theme state is stored in Cookies rather than localStorage alone, guaranteeing consistent rendering between server and client;
  - UnoCSS and `main.css` align with Shadcn Zinc color tokens for smooth dark/light mode transitions.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
