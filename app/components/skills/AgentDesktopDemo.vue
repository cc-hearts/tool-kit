<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronDown,
  ChevronsUpDown,
  Circle,
  Folder,
  Layers,
  Maximize2,
  Minimize2,
  Paintbrush,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Terminal,
  Volume2,
  X,
} from 'lucide-vue-next'

// --- 状态控制 ---
const themeMode = ref<'light' | 'dark'>('light')
const backgroundType = ref<'plain' | 'rex' | 'mist' | 'meadow' | 'dusk'>('plain')
const platformOs = ref<'macos' | 'windows'>('macos')

// 弹窗状态
const isSettingsOpen = ref(false)
const isConfirmModalOpen = ref(false)
const isPaletteOpen = ref(false)

// 演示窗口内部状态
const activeSession = ref<'session-1' | 'session-2' | 'session-3'>('session-1')
const focusedPane = ref<'pane-left' | 'pane-right'>('pane-left')

// 设置表单状态
const settingNewDir = ref<'current' | 'project' | 'home'>('current')
const settingConfirmClose = ref(true)
const settingRestore = ref(true)
const settingVibrancy = ref(true)
const settingFontSize = ref(13)
const settingLineHeight = ref(1.22)
const isHoldingSlider = ref(false)
const settingFont = ref('JetBrains Mono Nerd Font')
const isFontMenuOpen = ref(false)
const settingSearchQuery = ref('')

// Windows 模拟最大化状态
const isWindowsMaximized = ref(false)

// 调色板搜索
const paletteQuery = ref('')

// --- 洗色渐变数据 ---
const washGradients = {
  plain: {
    light: '#eceef4',
    dark: '#141418',
    glowLight: 'transparent',
    glowDark: 'transparent',
  },
  rex: {
    light: 'linear-gradient(180deg, #ebe0f3 0%, #f3e7f1 33%, #f7eee4 66%, #f6efcf 100%)',
    dark: 'linear-gradient(180deg, #17141f 0%, #191620 50%, #1b1916 100%)',
    glowLight: 'linear-gradient(225deg, rgba(247, 220, 241, 0.75) 0%, rgba(247, 220, 241, 0) 50%)',
    glowDark: 'linear-gradient(225deg, rgba(120, 70, 120, 0.22) 0%, rgba(120, 70, 120, 0) 50%)',
  },
  mist: {
    light: 'linear-gradient(180deg, #e3e9f4 0%, #ebeff6 33%, #f1f2f3 66%, #f2f1ec 100%)',
    dark: 'linear-gradient(180deg, #12151b 0%, #14171d 50%, #17181b 100%)',
    glowLight: 'linear-gradient(225deg, rgba(210, 225, 248, 0.75) 0%, rgba(210, 225, 248, 0) 50%)',
    glowDark: 'linear-gradient(225deg, rgba(70, 100, 150, 0.22) 0%, rgba(70, 100, 150, 0) 50%)',
  },
  meadow: {
    light: 'linear-gradient(180deg, #e2eee5 0%, #ebf2e7 33%, #f3f2e2 66%, #f5f0d6 100%)',
    dark: 'linear-gradient(180deg, #111814 0%, #141a16 50%, #181a14 100%)',
    glowLight: 'linear-gradient(225deg, rgba(214, 240, 222, 0.75) 0%, rgba(214, 240, 222, 0) 50%)',
    glowDark: 'linear-gradient(225deg, rgba(70, 130, 95, 0.2) 0%, rgba(70, 130, 95, 0) 50%)',
  },
  dusk: {
    light: 'linear-gradient(180deg, #e4dbf3 0%, #efdeee 33%, #f6e3dc 66%, #f7e6cf 100%)',
    dark: 'linear-gradient(180deg, #191321 0%, #1e161e 50%, #221a17 100%)',
    glowLight: 'linear-gradient(225deg, rgba(246, 206, 222, 0.8) 0%, rgba(246, 206, 222, 0) 50%)',
    glowDark: 'linear-gradient(225deg, rgba(150, 80, 110, 0.25) 0%, rgba(150, 80, 110, 0) 50%)',
  },
}

const currentBgStyle = computed(() => {
  const g = washGradients[backgroundType.value]
  const isDark = themeMode.value === 'dark'
  const base = isDark ? g.dark : g.light
  return {
    background: base,
  }
})

const currentGlowStyle = computed(() => {
  const g = washGradients[backgroundType.value]
  const isDark = themeMode.value === 'dark'
  const glow = isDark ? g.glowDark : g.glowLight
  return {
    background: glow,
  }
})

// 字体候选项
const fontOptions = [
  'JetBrains Mono Nerd Font',
  'SF Mono',
  'Menlo',
  'Fira Code',
  'Cascadia Code',
]
</script>

<template>
  <div class="agent-demo-wrapper select-none">
    <!-- 顶部游乐场控制条 -->
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50/80 p-3.5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60">
      <div class="flex flex-wrap items-center gap-3">
        <!-- 主题切换 -->
        <div class="flex items-center gap-1.5 text-xs text-neutral-500">
          <span>外观:</span>
          <div class="inline-flex rounded-lg border border-neutral-200/80 bg-neutral-200/50 p-0.5 dark:border-neutral-700 dark:bg-neutral-800">
            <button
              class="rounded-md px-2.5 py-1 text-xs font-medium transition"
              :class="themeMode === 'light' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'"
              @click="themeMode = 'light'"
            >
              浅色 (Light)
            </button>
            <button
              class="rounded-md px-2.5 py-1 text-xs font-medium transition"
              :class="themeMode === 'dark' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'"
              @click="themeMode = 'dark'"
            >
              深色 (Dark)
            </button>
          </div>
        </div>

        <!-- 窗口底色 (纯色优先) -->
        <div class="flex items-center gap-1.5 text-xs text-neutral-500">
          <span>底色:</span>
          <div class="inline-flex rounded-lg border border-neutral-200/80 bg-neutral-200/50 p-0.5 dark:border-neutral-700 dark:bg-neutral-800">
            <button
              v-for="b in ['plain', 'rex', 'mist', 'meadow', 'dusk'] as const"
              :key="b"
              class="rounded-md px-2 py-1 text-xs font-medium capitalize transition"
              :class="backgroundType === b ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'"
              @click="backgroundType = b"
            >
              {{ b === 'plain' ? '纯色(首选)' : b }}
            </button>
          </div>
        </div>

        <!-- 操作系统框架 -->
        <div class="flex items-center gap-1.5 text-xs text-neutral-500">
          <span>平台框架:</span>
          <div class="inline-flex rounded-lg border border-neutral-200/80 bg-neutral-200/50 p-0.5 dark:border-neutral-700 dark:bg-neutral-800">
            <button
              class="rounded-md px-2.5 py-1 text-xs font-medium transition"
              :class="platformOs === 'macos' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'"
              @click="platformOs = 'macos'"
            >
              macOS (原生交通灯)
            </button>
            <button
              class="rounded-md px-2.5 py-1 text-xs font-medium transition"
              :class="platformOs === 'windows' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'"
              @click="platformOs = 'windows'"
            >
              Windows 11 (28×26)
            </button>
          </div>
        </div>
      </div>

      <!-- 快速触发动作 -->
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          @click="isSettingsOpen = !isSettingsOpen"
        >
          <SettingsIcon class="h-3.5 w-3.5" />
          {{ isSettingsOpen ? '关闭设置浮层' : '打开设置浮层' }}
        </button>
        <button
          class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          @click="isConfirmModalOpen = true"
        >
          <AlertTriangle class="h-3.5 w-3.5 text-amber-500" />
          确认模态
        </button>
        <button
          class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          @click="isPaletteOpen = true"
        >
          <Search class="h-3.5 w-3.5" />
          命令面板 (⌘K)
        </button>
      </div>
    </div>

    <!-- 真实模拟器外壳 (Desktop Simulator Window) -->
    <div
      class="desktop-sim-window relative h-[680px] w-full overflow-hidden rounded-2xl shadow-2xl transition-all duration-300"
      :class="themeMode === 'dark' ? 'sim-theme-dark' : 'sim-theme-light'"
      :style="currentBgStyle"
    >
      <!-- 225度右上角发光层 (Glow Overlay) -->
      <div
        class="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        :style="currentGlowStyle"
      />

      <!-- 窗口顶层结构 (Flex Row, 填充全高) -->
      <div class="relative z-10 flex h-full w-full">
        <!-- 左侧侧边栏 (Sidebar: 212px) -->
        <div class="sim-sidebar flex w-[220px] shrink-0 flex-col pt-3">
          <!-- 侧边栏头部: macOS 下留出红绿灯位置, Windows 下展示应用图标 -->
          <div class="relative flex h-[38px] shrink-0 items-center px-4">
            <!-- macOS 交通灯 -->
            <div v-if="platformOs === 'macos'" class="flex items-center gap-2">
              <span class="h-3 w-3 rounded-full bg-[#ff5f57] border border-[#e0443e] cursor-pointer" />
              <span class="h-3 w-3 rounded-full bg-[#febc2e] border border-[#d89e24] cursor-pointer" />
              <span class="h-3 w-3 rounded-full bg-[#28c840] border border-[#1aab29] cursor-pointer" />
            </div>

            <!-- Windows 平台下左侧为应用品牌 -->
            <div v-else class="flex items-center gap-2 text-xs font-semibold">
              <Terminal class="h-4 w-4 text-blue-500" />
              <span>Term Fleet</span>
            </div>
          </div>

          <!-- 侧边栏搜索条 -->
          <div class="px-3 py-2">
            <div class="sim-field flex h-[26px] items-center gap-2 rounded-lg px-2.5">
              <Search class="h-3 w-3 text-neutral-400" />
              <input
                type="text"
                placeholder="搜索会话 (⌘F)..."
                class="w-full bg-transparent text-[12px] outline-none placeholder:text-neutral-400"
              >
            </div>
          </div>

          <!-- 会话树分组 -->
          <div class="flex-1 space-y-4 overflow-y-auto px-2 py-1 text-xs">
            <!-- Group 1 -->
            <div>
              <div class="mb-1 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                <span>term-fleet (Local)</span>
                <span class="tabular-nums">2</span>
              </div>
              <div class="space-y-0.5">
                <!-- Session 1: Waiting for you (Amber Attention Pulse) -->
                <div
                  class="sim-row flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 transition"
                  :class="activeSession === 'session-1' ? 'sim-row-selected' : ''"
                  @click="activeSession = 'session-1'"
                >
                  <!-- 琥珀色介入微光晕指示灯 -->
                  <span class="relative flex h-2 w-2">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span class="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-[13px] font-medium leading-none">
                      claude-auth
                    </div>
                    <div class="mt-1 truncate text-[11px] text-neutral-400">
                      Approval needed · 2m
                    </div>
                  </div>
                </div>

                <!-- Session 2: Working (Progress spinner) -->
                <div
                  class="sim-row flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 transition"
                  :class="activeSession === 'session-2' ? 'sim-row-selected' : ''"
                  @click="activeSession = 'session-2'"
                >
                  <span class="h-2 w-2 animate-spin rounded-full border border-blue-500 border-t-transparent" />
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-[13px] font-medium leading-none">
                      test-runner
                    </div>
                    <div class="mt-1 truncate text-[11px] text-neutral-400">
                      bun test · 42s
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Group 2 -->
            <div>
              <div class="mb-1 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                <span>dev-relay (Remote)</span>
                <span class="tabular-nums">1</span>
              </div>
              <div class="space-y-0.5">
                <!-- Session 3: Done -->
                <div
                  class="sim-row flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 transition"
                  :class="activeSession === 'session-3' ? 'sim-row-selected' : ''"
                  @click="activeSession = 'session-3'"
                >
                  <span class="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-neutral-800 text-[9px] text-white dark:bg-neutral-200 dark:text-neutral-900">
                    <Check class="h-2.5 w-2.5" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-[13px] font-medium leading-none">
                      deploy-api
                    </div>
                    <div class="mt-1 truncate text-[11px] text-neutral-400">
                      Exited 0 · 1h
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 侧边栏底部 Footer (Chips & Settings Trigger) -->
          <div class="flex h-[42px] shrink-0 items-center justify-between border-t border-black/[0.04] px-3 dark:border-white/[0.04]">
            <div class="flex items-center gap-1.5 text-[11px] text-neutral-400">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Daemon 8124</span>
            </div>
            <button
              class="sim-icon-btn flex h-6 w-6 items-center justify-center rounded-md"
              title="设置"
              @click="isSettingsOpen = true"
            >
              <SettingsIcon class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <!-- 右侧主工作区卡片 (8px gap perimeter, 14px radius, raised elevation) -->
        <div class="relative flex flex-1 flex-col p-2 pl-0">
          <!-- Windows 11 自定义窗口控件条 (右上角 28×26) -->
          <div
            v-if="platformOs === 'windows'"
            class="absolute right-4 top-3 z-30 flex items-center gap-0.5"
          >
            <!-- 最小化 -->
            <button
              class="win-btn flex h-[26px] w-[28px] items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10"
              title="最小化"
            >
              <span class="h-[1px] w-3 bg-neutral-600 dark:bg-neutral-300" />
            </button>
            <!-- 最大化/还原 (带 Win11 Snap Layouts 特性) -->
            <button
              class="win-btn flex h-[26px] w-[28px] items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10"
              title="最大化 (支持 Snap Layouts)"
              @click="isWindowsMaximized = !isWindowsMaximized"
            >
              <span v-if="!isWindowsMaximized" class="h-3 w-3 rounded-[2px] border border-neutral-600 dark:border-neutral-300" />
              <div v-else class="relative h-3 w-3">
                <span class="absolute right-0 top-0 h-2.5 w-2.5 rounded-[1.5px] border border-neutral-600 dark:border-neutral-300" />
                <span class="absolute bottom-0 left-0 h-2.5 w-2.5 rounded-[1.5px] border border-neutral-600 bg-white dark:border-neutral-300 dark:bg-neutral-800" />
              </div>
            </button>
            <!-- 关闭 (Dangerous Action: Hover/Pressed 变红) -->
            <button
              class="win-btn-close flex h-[26px] w-[28px] items-center justify-center rounded text-neutral-500 transition hover:bg-[#d93a35] hover:text-white dark:hover:bg-[#ff6961] dark:hover:text-white"
              title="关闭窗口"
            >
              <X class="h-3.5 w-3.5" />
            </button>
          </div>

          <!-- 单一窗格主体 (Single Terminal Card - 14px Radius, Raised Elevation) -->
          <div class="flex flex-1 overflow-hidden">
            <!-- 单一完整终端卡片 (Single Full Pane) -->
            <div class="sim-pane-card relative flex flex-1 flex-col overflow-hidden rounded-[14px] transition">
              <!-- Pane 顶部卡片 Header (44px) -->
              <div class="sim-card-header flex h-[44px] shrink-0 items-center justify-between px-4">
                <div class="flex items-center gap-2.5">
                  <span class="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  <span class="text-[13px] font-semibold tracking-tight">claude-auth · zsh</span>
                  <span class="rounded bg-black/[0.05] px-1.5 py-0.5 text-[10px] font-mono text-neutral-500 dark:bg-white/[0.08]">
                    PID 41920
                  </span>
                  <span class="text-[11px] text-neutral-400 font-mono">~/dev/fleet</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span class="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10.5px] font-medium text-blue-600 dark:text-blue-400">
                    Agent Active
                  </span>
                  <span class="text-[11px] text-neutral-400 font-mono">UTF-8</span>
                </div>
              </div>

              <!-- 终端代码主体 (Terminal Surface with Apple 加深 16 色) -->
              <div class="sim-terminal-body flex-1 overflow-y-auto p-4 font-mono text-[12.5px] leading-relaxed">
                <div class="text-neutral-400">
                  Last login: Wed Oct 22 17:10:04 on ttys002
                </div>
                <div class="mt-2 text-emerald-600 dark:text-emerald-400">
                  ➜  ~/dev/fleet git:(main)
                </div>
                <div class="text-neutral-800 dark:text-neutral-100">
                  $ claude code
                </div>
                <div class="mt-2 text-neutral-400">
                  ╭── Claude Code ───────────────────────────────────────────────╮
                  │ Running agent daemon with persistent session state           │
                  ╰──────────────────────────────────────────────────────────────╯
                </div>
                <div class="mt-2 text-amber-600 dark:text-amber-400 font-medium">
                  [Claude] Action requires confirmation: Proceed with database migration?
                </div>
                <div class="mt-1 text-neutral-500">
                  → Target database: postgres://localhost:5432/fleet_dev
                </div>
                <div class="mt-1 text-neutral-500">
                  → Changes: 3 migrations to apply (001_init, 002_sessions, 003_auth)
                </div>
                <div class="mt-2 text-blue-500 font-semibold">
                  ❯ [Y] Approve and apply / [n] Cancel / [d] Show diff
                </div>
                <div class="mt-3 inline-block h-4 w-2 animate-pulse bg-neutral-800 dark:bg-neutral-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================
           弹窗 1: 浮动无遮罩设置窗口 (Floating Settings Dialog)
           特点: 背景完全透明无遮罩! 底层终端实时可见! 带 12px 边缘防出界抓手
           ======================================================== -->
      <transition name="pop-fade">
        <div
          v-if="isSettingsOpen"
          class="absolute inset-4 z-40 flex items-center justify-center"
        >
          <!-- 悬浮独立设置卡片 (820 × 580 限制) -->
          <div
            class="sim-settings-dialog flex h-[540px] w-[760px] flex-col overflow-hidden rounded-[14px] shadow-2xl"
            :style="currentBgStyle"
          >
            <!-- 标题栏拖拽抓手 (Header: 44px) -->
            <div class="flex h-[44px] shrink-0 cursor-grab items-center justify-between border-b border-black/[0.06] px-4 dark:border-white/[0.08]">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold tracking-tight">设置 (Settings)</span>
                <span class="rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  ● 无遮罩实时透视
                </span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  class="sim-btn-secondary px-2.5 py-1 text-xs"
                  @click="settingNewDir = 'current'"
                >
                  恢复默认
                </button>
                <button
                  class="sim-btn-primary px-3 py-1 text-xs"
                  @click="isSettingsOpen = false"
                >
                  完成
                </button>
                <button
                  class="sim-icon-btn ml-1 flex h-7 w-7 items-center justify-center rounded-lg"
                  title="关闭设置"
                  @click="isSettingsOpen = false"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- 设置窗口主体 (双栏 Inset Grouped) -->
            <div class="flex flex-1 overflow-hidden">
              <!-- 左侧分类导航 (180px) -->
              <div class="w-[190px] shrink-0 space-y-1 overflow-y-auto border-r border-black/[0.05] p-3 text-xs dark:border-white/[0.06]">
                <div class="sim-nav-item active flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium">
                  <SettingsIcon class="h-3.5 w-3.5 text-blue-500" />
                  <span>通用 (General)</span>
                </div>
                <div class="sim-nav-item flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                  <Paintbrush class="h-3.5 w-3.5" />
                  <span>外观 (Appearance)</span>
                </div>
                <div class="sim-nav-item flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                  <Terminal class="h-3.5 w-3.5" />
                  <span>终端 (Terminal)</span>
                </div>
                <div class="sim-nav-item flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                  <Bell class="h-3.5 w-3.5" />
                  <span>通知 (Notifications)</span>
                </div>
              </div>

              <!-- 右侧设置分组卡片 (Inset Grouped Panels) -->
              <div class="flex-1 overflow-y-auto p-4 space-y-4">
                <!-- Group 1: 会话启动 -->
                <div>
                  <div class="mb-1.5 px-1 text-[11.5px] font-semibold text-neutral-400 uppercase tracking-wider">
                    会话与启动 (Sessions)
                  </div>
                  <div class="sim-group-panel rounded-[12px] px-3.5 py-1">
                    <!-- Row 1: Segmented Control -->
                    <div class="sim-setting-row flex items-center justify-between py-2.5">
                      <div>
                        <div class="text-[13px] font-medium">新建会话起始目录</div>
                        <div class="text-[11.5px] text-neutral-400">选择打开新终端时的默认工作目录</div>
                      </div>
                      <!-- 物理分段器 Segmented -->
                      <div class="sim-segmented flex h-6 items-center rounded-[7px] p-0.5">
                        <button
                          class="sim-segment-btn rounded-[5px] px-2.5 text-[11.5px] transition"
                          :class="settingNewDir === 'current' ? 'active shadow-sm font-medium' : ''"
                          @click="settingNewDir = 'current'"
                        >
                          当前项目
                        </button>
                        <button
                          class="sim-segment-btn rounded-[5px] px-2.5 text-[11.5px] transition"
                          :class="settingNewDir === 'project' ? 'active shadow-sm font-medium' : ''"
                          @click="settingNewDir = 'project'"
                        >
                          工作区根
                        </button>
                        <button
                          class="sim-segment-btn rounded-[5px] px-2.5 text-[11.5px] transition"
                          :class="settingNewDir === 'home' ? 'active shadow-sm font-medium' : ''"
                          @click="settingNewDir = 'home'"
                        >
                          用户主目录
                        </button>
                      </div>
                    </div>

                    <div class="sim-row-divider" />

                    <!-- Row 2: Toggle Switch -->
                    <div class="sim-setting-row flex items-center justify-between py-2.5">
                      <div>
                        <div class="text-[13px] font-medium">关闭运行中的 Pane 前二次确认</div>
                        <div class="text-[11.5px] text-neutral-400">防止误触杀掉长时间运行的 Agent 任务</div>
                      </div>
                      <!-- 物理弹簧 Toggle (38 × 22) -->
                      <button
                        class="sim-toggle-track relative h-[22px] w-[38px] shrink-0 rounded-[11px] p-[2px] transition-colors"
                        :class="settingConfirmClose ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-700'"
                        @click="settingConfirmClose = !settingConfirmClose"
                      >
                        <span
                          class="sim-toggle-thumb block h-[18px] w-[18px] rounded-full bg-white shadow-md transition-transform duration-260"
                          :style="{ transform: settingConfirmClose ? 'translateX(16px)' : 'translateX(0px)' }"
                        />
                      </button>
                    </div>

                    <div class="sim-row-divider" />

                    <!-- Row 3: Pop-up Menu Dropdown -->
                    <div class="sim-setting-row relative flex items-center justify-between py-2.5">
                      <div>
                        <div class="text-[13px] font-medium">终端等宽字体</div>
                        <div class="text-[11.5px] text-neutral-400">代码高亮与 Nerd Font 图标字体族</div>
                      </div>
                      <!-- Pop-up 覆叠按钮 (28px) -->
                      <div class="relative">
                        <button
                          class="sim-popup-trigger flex h-7 items-center gap-1.5 rounded-full px-3 text-xs"
                          @click="isFontMenuOpen = !isFontMenuOpen"
                        >
                          <span>{{ settingFont }}</span>
                          <span class="flex h-4 w-4 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
                            <ChevronsUpDown class="h-2.5 w-2.5 text-neutral-500" />
                          </span>
                        </button>

                        <!-- 下拉菜单 (覆盖式弹出) -->
                        <div
                          v-if="isFontMenuOpen"
                          class="sim-popup-menu absolute right-0 top-0 z-50 w-56 rounded-xl p-1 shadow-2xl backdrop-blur-xl"
                        >
                          <div
                            v-for="f in fontOptions"
                            :key="f"
                            class="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition"
                            :class="settingFont === f ? 'bg-blue-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'"
                            @click="settingFont = f; isFontMenuOpen = false"
                          >
                            <span>{{ f }}</span>
                            <Check v-if="settingFont === f" class="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="sim-row-divider" />

                    <!-- Row 4: Lens Slider (放大镜透镜滑块) -->
                    <div class="sim-setting-row flex items-center justify-between py-2.5">
                      <div>
                        <div class="text-[13px] font-medium">终端行高倍率 (Line Height)</div>
                        <div class="text-[11.5px] text-neutral-400">按住拖拽时滑块将呈现放大 35% 透镜效果</div>
                      </div>
                      <div class="flex items-center gap-3">
                        <div class="relative flex h-6 w-36 items-center">
                          <!-- 轨道 -->
                          <div class="h-1 w-full rounded-full bg-neutral-200 dark:bg-neutral-700" />
                          <div
                            class="absolute left-0 h-1 rounded-full bg-blue-500"
                            :style="{ width: `${((settingLineHeight - 1.0) / 1.0) * 100}%` }"
                          />
                          <!-- 滑块 -->
                          <div
                            class="sim-slider-thumb absolute top-1/2 -translate-y-1/2 cursor-pointer transition-all duration-150"
                            :class="isHoldingSlider ? 'scale-135 bg-white/40 shadow-xl backdrop-blur-sm' : 'bg-white shadow-md'"
                            :style="{ left: `calc(${((settingLineHeight - 1.0) / 1.0) * 100}% - 10px)` }"
                            @mousedown="isHoldingSlider = true"
                            @mouseup="isHoldingSlider = false"
                            @mouseleave="isHoldingSlider = false"
                          >
                            <input
                              v-model.number="settingLineHeight"
                              type="range"
                              min="1.0"
                              max="2.0"
                              step="0.02"
                              class="absolute inset-0 opacity-0 cursor-pointer"
                            >
                          </div>
                        </div>
                        <span class="w-12 text-right font-mono text-xs font-semibold text-neutral-500">
                          {{ settingLineHeight.toFixed(2) }}×
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- ========================================================
           弹窗 2: 操作确认模态框 (Confirm Modal with Scrim Overlay)
           ======================================================== -->
      <transition name="pop-fade">
        <div
          v-if="isConfirmModalOpen"
          class="absolute inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs"
        >
          <div class="sim-modal-panel w-[400px] rounded-[14px] p-5 shadow-2xl">
            <div class="flex items-start gap-3">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                <AlertTriangle class="h-5 w-5" />
              </div>
              <div>
                <h3 class="m-0 text-sm font-semibold text-neutral-900 dark:text-white">
                  重启后台守护进程？
                </h3>
                <p class="mt-1 text-xs leading-relaxed text-neutral-500">
                  后台连接与会话将短暂断开并自动续接。未提交的代码和进程将保留在缓冲区中。
                </p>
              </div>
            </div>
            <div class="mt-5 flex justify-end gap-2">
              <button
                class="sim-btn-secondary px-3 py-1.5 text-xs"
                @click="isConfirmModalOpen = false"
              >
                取消 (Esc)
              </button>
              <button
                class="rounded-lg bg-[#d93a35] px-3.5 py-1.5 text-xs font-medium text-white shadow-sm hover:opacity-90 dark:bg-[#ff6961]"
                @click="isConfirmModalOpen = false"
              >
                确认重启 (Enter)
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- ========================================================
           弹窗 3: 命令面板 (Command Palette - 顶部下沉 84px)
           ======================================================== -->
      <transition name="pop-fade">
        <div
          v-if="isPaletteOpen"
          class="absolute inset-0 z-50 flex justify-center bg-black/20 pt-[60px]"
          @click.self="isPaletteOpen = false"
        >
          <div class="sim-palette-panel h-[360px] w-[540px] overflow-hidden rounded-[14px] shadow-2xl">
            <!-- 50px 搜索条 -->
            <div class="flex h-[48px] items-center gap-3 border-b border-black/[0.06] px-4 dark:border-white/[0.08]">
              <Search class="h-4 w-4 text-neutral-400" />
              <input
                v-model="paletteQuery"
                type="text"
                placeholder="键入以搜索会话、命令与设置..."
                class="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                autofocus
              >
              <span class="rounded bg-black/[0.05] px-1.5 py-0.5 text-[10px] text-neutral-400 dark:bg-white/[0.08]">ESC</span>
            </div>

            <!-- 列表项 -->
            <div class="p-2 space-y-1 text-xs">
              <div class="flex cursor-pointer items-center justify-between rounded-lg bg-blue-600 px-3 py-2 text-white">
                <div class="flex items-center gap-2">
                  <Terminal class="h-3.5 w-3.5" />
                  <span class="font-medium">跳至 claude-auth (需要介入)</span>
                </div>
                <span class="text-[10px] opacity-80">⌘J</span>
              </div>
              <div class="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-neutral-600 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10">
                <div class="flex items-center gap-2">
                  <SettingsIcon class="h-3.5 w-3.5 text-neutral-400" />
                  <span>打开系统设置</span>
                </div>
                <span class="text-[10px] text-neutral-400">⌘,</span>
              </div>
              <div class="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-neutral-600 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10">
                <div class="flex items-center gap-2">
                  <Layers class="h-3.5 w-3.5 text-neutral-400" />
                  <span>水平切分窗格 (Split Down)</span>
                </div>
                <span class="text-[10px] text-neutral-400">⌘D</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* ========================================================
   Agent Desktop UI - 精确 Token 与光影层级还原
   ======================================================== */

/* --- 浅色模式规范 (Borderless Elevation) --- */
.sim-theme-light {
  --sim-sidebar-bg: #eceef4;
  --sim-card-bg: #ffffff;
  --sim-popover-bg: #ffffff;
  --sim-text: #1d1d1f;
  --sim-text-muted: #6e6e78;
  --sim-chip: rgba(0, 0, 0, 0.045);
  --sim-control: #ffffff;
  --sim-row-selected: #ffffff;
  --sim-row-hover: rgba(0, 0, 0, 0.04);
  --sim-divider: rgba(0, 0, 0, 0.07);
  --sim-veil: rgba(250, 248, 252, 0.28);
  --sim-shadow-raised: 0 1px 2px 0 rgba(0, 0, 0, 0.07), 0 1px 6px 0 rgba(0, 0, 0, 0.035);
  --sim-shadow-chosen: 0 0 0 0.5px rgba(0, 0, 0, 0.06), 0 0.5px 2px 0 rgba(0, 0, 0, 0.05);
  --sim-shadow-floating: 0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 16px 40px 0 rgba(20, 20, 40, 0.14);
  color: var(--sim-text);
}

/* --- 深色模式规范 (Lit Edge + Dark Shadow) --- */
.sim-theme-dark {
  --sim-sidebar-bg: #141418;
  --sim-card-bg: #232328;
  --sim-popover-bg: #232327;
  --sim-text: #ececf0;
  --sim-text-muted: #a9a9b4;
  --sim-chip: rgba(255, 255, 255, 0.07);
  --sim-control: #404047;
  --sim-row-selected: rgba(255, 255, 255, 0.10);
  --sim-row-hover: rgba(255, 255, 255, 0.05);
  --sim-divider: rgba(255, 255, 255, 0.07);
  --sim-veil: rgba(14, 13, 18, 0.42);
  --sim-shadow-raised: 0 1px 1px 0 rgba(0, 0, 0, 0.2), 0 2px 2px -1px rgba(0, 0, 0, 0.2), 0 4px 6px -3px rgba(0, 0, 0, 0.24);
  --sim-shadow-chosen: var(--sim-shadow-raised);
  --sim-shadow-floating: 0 1px 1px 0 rgba(0, 0, 0, 0.2), 0 2px 2px -1px rgba(0, 0, 0, 0.2), 0 4px 6px -3px rgba(0, 0, 0, 0.24), 0 16px 40px 0 rgba(0, 0, 0, 0.45);
  color: var(--sim-text);
}

/* 侧边栏 */
.sim-sidebar {
  color: var(--sim-text);
}

.sim-row:hover {
  background: var(--sim-row-hover);
}

.sim-row-selected {
  background: var(--sim-row-selected) !important;
  box-shadow: var(--sim-shadow-chosen);
}

/* 浮动终端卡片 */
.sim-pane-card {
  background: var(--sim-card-bg);
  box-shadow: var(--sim-shadow-raised);
}

.sim-theme-dark .sim-pane-card {
  border: 1px solid rgba(236, 236, 240, 0.12);
  border-image: linear-gradient(180deg, rgba(236, 236, 240, 0.18), rgba(236, 236, 240, 0.06)) 1;
}

.sim-pane-dim {
  opacity: 0.92;
}

.sim-veil {
  background: var(--sim-veil);
}

.sim-card-header {
  border-bottom: 1px solid var(--sim-divider);
}

.sim-terminal-body {
  background: var(--sim-card-bg);
}

/* 输入框 */
.sim-field {
  background: var(--sim-control);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
}

.sim-theme-dark .sim-field {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.sim-field:focus-within {
  box-shadow: 0 0 0 3px rgba(59, 108, 246, 0.3), inset 0 0 0 1px rgba(59, 108, 246, 0.8) !important;
}

/* 设置浮层面板 */
.sim-settings-dialog {
  box-shadow: var(--sim-shadow-floating);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.sim-theme-dark .sim-settings-dialog {
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.sim-group-panel {
  background: var(--sim-chip);
}

.sim-row-divider {
  height: 1px;
  background: var(--sim-divider);
}

/* 弹窗与控制面板 */
.sim-modal-panel,
.sim-palette-panel {
  background: var(--sim-popover-bg);
  box-shadow: var(--sim-shadow-floating);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.sim-theme-dark .sim-modal-panel,
.sim-theme-dark .sim-palette-panel {
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* 按钮体系 */
.sim-btn-primary {
  background: #3b6cf6;
  color: #ffffff;
  border-radius: 7px;
  font-weight: 500;
  transition: opacity 0.15s ease;
}

.sim-btn-primary:hover {
  opacity: 0.92;
}

.sim-btn-secondary {
  background: var(--sim-control);
  color: var(--sim-text);
  border-radius: 7px;
  box-shadow: 0 0.5px 1.5px 0 rgba(0, 0, 0, 0.13), 0 0 0 0.5px rgba(0, 0, 0, 0.05);
}

.sim-theme-dark .sim-btn-secondary {
  box-shadow: var(--sim-shadow-raised);
}

.sim-icon-btn {
  color: var(--sim-text-muted);
}

.sim-icon-btn:hover {
  background: var(--sim-row-hover);
  color: var(--sim-text);
}

/* 分段器 Segmented */
.sim-segmented {
  background: rgba(0, 0, 0, 0.06);
}

.sim-theme-dark .sim-segmented {
  background: rgba(255, 255, 255, 0.07);
}

.sim-segment-btn {
  color: var(--sim-text-muted);
}

.sim-segment-btn.active {
  background: #ffffff;
  color: #1d1d1f;
}

.sim-theme-dark .sim-segment-btn.active {
  background: rgba(255, 255, 255, 0.2);
  color: #ececf0;
}

/* Pop-up 按钮 */
.sim-popup-trigger {
  background: var(--sim-control);
  box-shadow: 0 0.5px 1.5px 0 rgba(0, 0, 0, 0.1), 0 0 0 0.5px rgba(0, 0, 0, 0.05);
}

.sim-popup-menu {
  background: var(--sim-popover-bg);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.sim-theme-dark .sim-popup-menu {
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* 透镜滑块 Thumb */
.sim-slider-thumb {
  width: 20px;
  height: 16px;
  border-radius: 8px;
}

/* 弹窗过渡 */
.pop-fade-enter-active,
.pop-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.pop-fade-enter-from,
.pop-fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
