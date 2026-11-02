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
  Globe,
  Layers,
  Maximize2,
  Minimize2,
  Monitor,
  Moon,
  Paintbrush,
  RotateCcw,
  Search,
  Settings as SettingsIcon,
  Sliders,
  Sparkles,
  Sun,
  Terminal,
  Volume2,
  X,
  Zap,
} from 'lucide-vue-next'

// --- 状态控制 (减法设计: 亚克力为主核心主题，纯色为专注对比) ---
const themeMode = ref<'light' | 'dark'>('light')
const backgroundType = ref<'acrylic' | 'plain'>('acrylic')
const platformOs = ref<'macos' | 'windows'>('macos')

// 亚克力与透明度控制 (对齐 term-fleet 0.7.12)
const acrylicBlur = ref<'none' | 'subtle' | 'medium' | 'deep'>('deep')
const backgroundOpacity = ref(0.78)
const showWallpaper = ref(true)

// 弹窗状态 (对齐 term-fleet 浮层规范)
const isSettingsOpen = ref(false)
const isConfirmModalOpen = ref(false)
const isPaletteOpen = ref(false)
const isPopoverOpen = ref(false)

// 设置窗口内部标签页与脏状态
const settingsTab = ref<'appearance' | 'general' | 'terminal' | 'sidebar' | 'diagnostics'>('appearance')
const isSettingsDirty = ref(false)
const settingsStatus = ref('● 已连接至本地守护进程 (PID 41920)')

// 演示窗口内部状态
const activeSession = ref<'session-1' | 'session-2' | 'session-3'>('session-1')

// 设置表单状态
const settingNewDir = ref<'current' | 'project' | 'home'>('current')
const settingConfirmClose = ref(true)
const settingLiveCwd = ref(true)
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

// 标记设置修改脏状态
function markDirty() {
  isSettingsDirty.value = true
}

// 恢复默认设置
function restoreDefaults() {
  themeMode.value = 'light'
  backgroundType.value = 'acrylic'
  acrylicBlur.value = 'deep'
  backgroundOpacity.value = 0.78
  settingNewDir.value = 'current'
  settingConfirmClose.value = true
  settingLiveCwd.value = true
  settingLineHeight.value = 1.22
  settingFont.value = 'JetBrains Mono Nerd Font'
  isSettingsDirty.value = false
  settingsStatus.value = '● 已恢复默认亚克力外观与系统偏好'
}

// 应用设置更改
function applySettings() {
  isSettingsDirty.value = false
  settingsStatus.value = '● 亚克力外观与环境配置已持久化至 config.json'
}

// --- 亚克力模糊映射 (对齐 term-fleet Vibrancy) ---
const blurPxMap = {
  none: '0px',
  subtle: '14px',
  medium: '24px',
  deep: '36px',
}

// --- 背景与亚克力毛玻璃样式 ---
const currentBgStyle = computed(() => {
  const isDark = themeMode.value === 'dark'
  if (backgroundType.value === 'acrylic') {
    const alpha = backgroundOpacity.value
    const bgRgba = isDark ? `rgba(20, 20, 24, ${alpha})` : `rgba(236, 238, 244, ${alpha})`
    const blur = blurPxMap[acrylicBlur.value]
    return {
      background: bgRgba,
      backdropFilter: blur !== '0px' ? `blur(${blur}) saturate(185%)` : 'none',
      WebkitBackdropFilter: blur !== '0px' ? `blur(${blur}) saturate(185%)` : 'none',
    }
  }

  // 纯色专注模式
  return {
    background: isDark ? '#141418' : '#eceef4',
  }
})

// 亚克力右上角高光微渐变 (Subtle Luminance)
const currentGlowStyle = computed(() => {
  const isDark = themeMode.value === 'dark'
  if (backgroundType.value === 'acrylic') {
    return {
      background: isDark
        ? 'linear-gradient(225deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 50%)'
        : 'linear-gradient(225deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 50%)',
    }
  }
  return { background: 'transparent' }
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
    <!-- 顶部游乐场控制条 (减法设计：专注亚克力与平台切换) -->
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50/90 p-3.5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
      <div class="flex flex-wrap items-center gap-3">
        <!-- 主题切换 (浅色 / 深色) -->
        <div class="flex items-center gap-1.5 text-xs text-neutral-500">
          <span>外观:</span>
          <div class="inline-flex items-center rounded-lg border border-neutral-200/80 bg-neutral-200/50 p-0.5 dark:border-neutral-700 dark:bg-neutral-800">
            <button
              class="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition"
              :class="themeMode === 'light' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'"
              @click="themeMode = 'light'"
            >
              <Sun class="h-3 w-3" />
              <span>浅色</span>
            </button>
            <button
              class="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition"
              :class="themeMode === 'dark' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'"
              @click="themeMode = 'dark'"
            >
              <Moon class="h-3 w-3" />
              <span>深色</span>
            </button>
          </div>
        </div>

        <!-- 材质底色切换 (做减法: 核心亚克力磨砂 vs 纯色专注) -->
        <div class="flex items-center gap-1.5 text-xs text-neutral-500">
          <span>材质:</span>
          <div class="inline-flex items-center rounded-lg border border-neutral-200/80 bg-neutral-200/50 p-0.5 dark:border-neutral-700 dark:bg-neutral-800">
            <button
              class="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition"
              :class="backgroundType === 'acrylic' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'"
              @click="backgroundType = 'acrylic'; markDirty()"
            >
              <Sparkles class="h-3 w-3 text-blue-500" />
              <span>✨ 亚克力主色</span>
            </button>
            <button
              class="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition"
              :class="backgroundType === 'plain' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'"
              @click="backgroundType = 'plain'; markDirty()"
            >
              <span>纯色模式</span>
            </button>
          </div>
        </div>

        <!-- 平台框架切换 (macOS vs Windows 11) -->
        <div class="flex items-center gap-1.5 text-xs text-neutral-500">
          <span>平台框架:</span>
          <div class="inline-flex items-center rounded-lg border border-neutral-200/80 bg-neutral-200/50 p-0.5 dark:border-neutral-700 dark:bg-neutral-800">
            <button
              class="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition"
              :class="platformOs === 'macos' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'"
              @click="platformOs = 'macos'"
            >
              <span>macOS 原生</span>
            </button>
            <button
              class="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition"
              :class="platformOs === 'windows' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'"
              @click="platformOs = 'windows'"
            >
              <span>Windows 11 避让</span>
            </button>
          </div>
        </div>

        <!-- 桌面壁纸透视开关 (直观检验亚克力透射) -->
        <div class="flex items-center gap-1.5 text-xs text-neutral-500">
          <button
            class="inline-flex items-center gap-1 rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            :class="showWallpaper ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900' : 'bg-white dark:bg-neutral-800'"
            @click="showWallpaper = !showWallpaper"
          >
            <Monitor class="h-3 w-3" />
            <span>{{ showWallpaper ? '壁纸透光: 开' : '壁纸透光: 关' }}</span>
          </button>
        </div>
      </div>

      <!-- term-fleet 浮层交互触发器 -->
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          @click="isSettingsOpen = !isSettingsOpen"
        >
          <SettingsIcon class="h-3.5 w-3.5 text-blue-500" />
          {{ isSettingsOpen ? '关闭设置浮层' : '设置浮层 (无遮罩)' }}
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
        <button
          class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          @click="isPopoverOpen = !isPopoverOpen"
        >
          <Zap class="h-3.5 w-3.5 text-indigo-500" />
          气泡浮层
        </button>
      </div>
    </div>

    <!-- 真实模拟器外壳 (配备桌面壁纸底板，透射亚克力磨砂质感) -->
    <div
      class="relative overflow-hidden rounded-2xl p-4 transition-all duration-300"
      :class="showWallpaper ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-inner' : 'bg-neutral-200/70 dark:bg-neutral-900/70'"
    >
      <!-- 桌面壁纸纹理图形 -->
      <div
        v-if="showWallpaper"
        class="pointer-events-none absolute inset-0 opacity-80"
        style="background-image: radial-gradient(at 10% 20%, rgb(99, 102, 241) 0px, transparent 50%), radial-gradient(at 90% 0%, rgb(236, 72, 153) 0px, transparent 50%), radial-gradient(at 50% 80%, rgb(59, 130, 246) 0px, transparent 50%);"
      />

      <!-- 桌面端窗口主体 (Desktop Simulator Window) -->
      <div
        class="desktop-sim-window relative h-[680px] w-full overflow-hidden shadow-2xl transition-all duration-300"
        :class="[
          themeMode === 'dark' ? 'sim-theme-dark' : 'sim-theme-light',
          isWindowsMaximized && platformOs === 'windows'
            ? 'rounded-none shadow-none !border-0'
            : (platformOs === 'windows' ? 'rounded-[10px]' : 'rounded-2xl'),
        ]"
        :style="currentBgStyle"
      >
        <!-- 225度亚克力微光层 -->
        <div
          class="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          :style="currentGlowStyle"
        />

        <!-- 窗口顶层结构 (Flex Row, 填充全高) -->
        <div class="relative z-10 flex h-full w-full">
          <!-- 左侧侧边栏 (Sidebar: 216px) -->
          <div class="sim-sidebar flex w-[216px] shrink-0 flex-col pt-3">
            <!-- 侧边栏头部: macOS 下留出系统交通灯; Windows 下对齐 term-fleet 采用 12px 留白和 App 图标 -->
            <div class="relative flex h-[38px] shrink-0 items-center px-4">
              <!-- macOS 原生 AppKit 交通灯 -->
              <div v-if="platformOs === 'macos'" class="flex items-center gap-2">
                <span class="h-3 w-3 rounded-full bg-[#ff5f57] border border-[#e0443e] cursor-pointer" />
                <span class="h-3 w-3 rounded-full bg-[#febc2e] border border-[#d89e24] cursor-pointer" />
                <span class="h-3 w-3 rounded-full bg-[#28c840] border border-[#1aab29] cursor-pointer" />
              </div>

              <!-- Windows 11 侧边栏头部: 无仿冒交通灯，以 items-center 紧凑对齐呈现 Term Fleet 品牌 -->
              <div v-else class="flex items-center gap-2 pl-0 text-xs font-semibold">
                <span class="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white shadow-xs">
                  <Terminal class="h-3 w-3" />
                </span>
                <span class="tracking-tight font-medium text-neutral-800 dark:text-neutral-200">Term Fleet</span>
              </div>
            </div>

            <!-- 侧边栏搜索条 (28px height, 7px radius) -->
            <div class="px-3 py-2">
              <div class="sim-field flex h-[28px] items-center gap-2 rounded-lg px-2.5">
                <Search class="h-3 w-3 text-neutral-400" />
                <input
                  type="text"
                  placeholder="搜索会话 (⌘F)..."
                  class="w-full bg-transparent text-[12px] outline-none placeholder:text-neutral-400"
                >
              </div>
            </div>

            <!-- 会话树分组 (Session Tree with Brackets) -->
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
                    <span class="relative flex h-2 w-2 items-center justify-center">
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

            <!-- 侧边栏底部 Footer -->
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
            <!-- 终端悬浮卡片主体 (Single Terminal Card - 14px Radius on macOS, 8px on Windows, Raised Elevation) -->
            <div class="relative flex flex-1 overflow-hidden">
              <div
                class="sim-pane-card relative flex flex-1 flex-col overflow-hidden transition"
                :class="[
                  platformOs === 'windows' ? 'rounded-[8px]' : 'rounded-[14px]',
                  backgroundType === 'acrylic' ? 'agent-acrylic-card' : '',
                ]"
              >
                <!-- Pane 顶部卡片 Header (44px) -->
                <!-- Windows 下严格应用 106px 右侧避让，保证状态徽标和工具按钮与右上角三键完全错开 -->
                <div
                  class="sim-card-header relative flex h-[44px] shrink-0 items-center justify-between px-4 transition-all"
                  :class="platformOs === 'windows' ? 'pr-[106px]' : 'pr-4'"
                >
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
                    <span v-if="platformOs === 'windows'" class="rounded bg-black/[0.04] px-1.5 py-0.5 text-[10px] text-neutral-400 dark:bg-white/[0.06]">
                      右侧已避让 106px
                    </span>
                  </div>

                  <!-- ========================================================
                       Windows 11 自定义窗口控件条 (严格对齐 term-fleet 实现)
                       特征：
                       - 绝对定位与卡片 Header 纵向水平 items-center 完全对齐
                       - 按钮尺寸：28px 宽 × 26px 高，间距 2px，圆角 4px (radiusSmall)
                       - 关闭图标：对齐 term-fleet Lucide 16×16 笔刷十字
                       - 悬停关闭：变为 #d93a35 危险红底，十字变纯白 #ffffff
                       ======================================================== -->
                  <div
                    v-if="platformOs === 'windows'"
                    class="absolute right-2.5 top-0 bottom-0 my-auto flex h-[26px] items-center gap-[2px] z-30"
                  >
                    <!-- 最小化 (Minimize) -->
                    <button
                      class="win-btn flex h-[26px] w-[28px] items-center justify-center rounded-[4px] text-neutral-500 transition hover:bg-black/5 dark:text-neutral-400 dark:hover:bg-white/10"
                      title="最小化"
                    >
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14" />
                      </svg>
                    </button>

                    <!-- 最大化 / 还原 (Maximize / Restore - 支持 Snap Layouts) -->
                    <button
                      class="win-btn flex h-[26px] w-[28px] items-center justify-center rounded-[4px] text-neutral-500 transition hover:bg-black/5 dark:text-neutral-400 dark:hover:bg-white/10"
                      title="最大化 (支持 Snap Layouts 贴靠布局)"
                      @click="isWindowsMaximized = !isWindowsMaximized"
                    >
                      <!-- 最大化状态：双重矩形重叠 (Restore) -->
                      <svg
                        v-if="isWindowsMaximized"
                        class="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <rect width="10" height="10" x="9" y="9" rx="1.5" />
                        <path d="M6 15H5.5A1.5 1.5 0 0 1 4 13.5v-8A1.5 1.5 0 0 1 5.5 4h8A1.5 1.5 0 0 1 15 5.5V6" />
                      </svg>
                      <!-- 正常状态：单一矩形 (Maximize) -->
                      <svg
                        v-else
                        class="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <rect width="14" height="14" x="5" y="5" rx="2" />
                      </svg>
                    </button>

                    <!-- 关闭 (Close - 对齐 term-fleet: 16×16 图标，悬停即变危险红底并图标纯白) -->
                    <button
                      class="win-btn-close flex h-[26px] w-[28px] items-center justify-center rounded-[4px] text-neutral-500 transition-colors duration-75 hover:bg-[#d93a35] hover:text-white dark:text-neutral-400 dark:hover:bg-[#ff6961] dark:hover:text-white"
                      title="关闭窗口"
                    >
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- 终端代码主体 (Terminal Surface with Apple 加深 16 色) -->
                <div class="sim-terminal-body flex-1 overflow-y-auto p-4 font-mono text-[12.5px] leading-relaxed">
                  <div class="text-neutral-400">
                    Last login: Fri Oct 30 16:50:02 on ttys002
                  </div>
                  <div class="mt-2 text-emerald-600 dark:text-emerald-400">
                    ➜  ~/dev/fleet git:(main)
                  </div>
                  <div class="text-neutral-800 dark:text-neutral-100">
                    $ beacon fleet --acrylic
                  </div>
                  <div class="mt-2 text-neutral-400">
                    ╭── Term Fleet ────────────────────────────────────────────────╮
                    │ Primary Acrylic Theme · 4-tier vibrancy material active      │
                    ╰──────────────────────────────────────────────────────────────╯
                  </div>
                  <div class="mt-2 text-amber-600 dark:text-amber-400 font-medium">
                    [Agent] Action requires confirmation: Deploy updated acrylic tokens?
                  </div>
                  <div class="mt-1 text-neutral-500">
                    → Subtraction applied: Redundant wash gradients removed
                  </div>
                  <div class="mt-1 text-neutral-500">
                    → Windows 11 Chrome: 16×16 close icon strictly centered
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
             浮层 1: term-fleet 独立设置浮层 (Floating Settings Dialog)
             特点:
             1. 背景完全透明无遮罩 (backdrop.Background(ui.Transparent))!
             2. 抓手标题栏: 44px 高，带 "● 未保存更改" 脏状态标记、恢复默认、应用提交
             3. 内部双栏: 左侧 184px 导航栏 (含搜索框) + 右侧独立 elevated 浮动卡片
             4. 底部状态栏: 34px 高，指示已连接守护进程
             ======================================================== -->
        <transition name="pop-fade">
          <div
            v-if="isSettingsOpen"
            class="absolute inset-4 z-40 flex items-center justify-center bg-transparent"
          >
            <!-- 悬浮独立设置卡片 (780 × 550) -->
            <div
              class="sim-settings-dialog flex h-[550px] w-[780px] flex-col overflow-hidden rounded-[14px] shadow-2xl backdrop-blur-xl"
              :class="backgroundType === 'acrylic' ? 'agent-acrylic-dialog' : ''"
              :style="currentBgStyle"
            >
              <!-- 抓手标题栏 (Header: 44px, Cursor Grab, items-center 对齐) -->
              <div class="flex h-[44px] shrink-0 cursor-grab items-center justify-between border-b border-black/[0.06] px-3.5 dark:border-white/[0.08]">
                <div class="flex items-center gap-2.5">
                  <span class="text-sm font-semibold tracking-tight">设置 (Settings)</span>
                  <!-- 脏状态指示符 (对齐 term-fleet s.dirty()) -->
                  <span
                    v-if="isSettingsDirty"
                    class="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400"
                  >
                    ● 未保存更改
                  </span>
                  <span
                    v-else
                    class="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    ● 透视无遮罩
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    class="sim-btn-secondary px-2.5 py-1 text-xs"
                    @click="restoreDefaults"
                  >
                    恢复默认
                  </button>
                  <button
                    class="sim-btn-primary px-3 py-1 text-xs"
                    :class="isSettingsDirty ? 'bg-blue-600 opacity-100' : 'opacity-80'"
                    @click="applySettings"
                  >
                    应用
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

              <!-- 设置窗口主体 (双栏架构: 左 184px + 右独立 Floating Card) -->
              <div class="flex flex-1 overflow-hidden">
                <!-- 左侧分类导航 (184px - Term-Fleet 标准) -->
                <div class="w-[184px] shrink-0 space-y-1 overflow-y-auto p-2 text-xs">
                  <!-- 搜索框 (Height: 28px, Radius: 7px, Background: Chip) -->
                  <div class="sim-settings-search mb-2 flex h-7 items-center gap-2 rounded-[7px] px-2.5">
                    <Search class="h-3 w-3 text-neutral-400" />
                    <input
                      v-model="settingSearchQuery"
                      type="text"
                      placeholder="搜索设置..."
                      class="w-full bg-transparent text-[11.5px] outline-none placeholder:text-neutral-400"
                    >
                  </div>

                  <!-- 导航项列表 (全 items-center 垂直居中) -->
                  <div
                    class="sim-nav-item flex cursor-pointer items-center gap-2 rounded-[7px] px-2.5 py-1.5 transition"
                    :class="settingsTab === 'appearance' ? 'sim-nav-active' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'"
                    @click="settingsTab = 'appearance'"
                  >
                    <Paintbrush class="h-3.5 w-3.5" />
                    <span>外观 (Appearance)</span>
                  </div>
                  <div
                    class="sim-nav-item flex cursor-pointer items-center gap-2 rounded-[7px] px-2.5 py-1.5 transition"
                    :class="settingsTab === 'general' ? 'sim-nav-active' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'"
                    @click="settingsTab = 'general'"
                  >
                    <SettingsIcon class="h-3.5 w-3.5" />
                    <span>通用 (General)</span>
                  </div>
                  <div
                    class="sim-nav-item flex cursor-pointer items-center gap-2 rounded-[7px] px-2.5 py-1.5 transition"
                    :class="settingsTab === 'terminal' ? 'sim-nav-active' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'"
                    @click="settingsTab = 'terminal'"
                  >
                    <Terminal class="h-3.5 w-3.5" />
                    <span>终端 (Terminal)</span>
                  </div>
                  <div
                    class="sim-nav-item flex cursor-pointer items-center gap-2 rounded-[7px] px-2.5 py-1.5 transition"
                    :class="settingsTab === 'sidebar' ? 'sim-nav-active' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'"
                    @click="settingsTab = 'sidebar'"
                  >
                    <Layers class="h-3.5 w-3.5" />
                    <span>侧边栏 (Sidebar)</span>
                  </div>
                  <div
                    class="sim-nav-item flex cursor-pointer items-center gap-2 rounded-[7px] px-2.5 py-1.5 transition"
                    :class="settingsTab === 'diagnostics' ? 'sim-nav-active' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'"
                    @click="settingsTab = 'diagnostics'"
                  >
                    <Zap class="h-3.5 w-3.5" />
                    <span>诊断 (Diagnostics)</span>
                  </div>
                </div>

                <!-- 右侧内容区: 嵌入式独立悬浮卡片 (Term-Fleet Aligned Embedded Floating Card) -->
                <div class="flex flex-1 flex-col overflow-hidden p-2">
                  <div class="sim-settings-inner-card flex flex-1 flex-col overflow-hidden rounded-[14px]">
                    <!-- 内嵌卡片头部 (44px) -->
                    <div class="flex h-[44px] shrink-0 items-center justify-between border-b border-black/[0.05] px-4 dark:border-white/[0.06]">
                      <span class="text-[14.5px] font-semibold tracking-tight">
                        {{
                          settingsTab === 'appearance' ? '外观偏好设置 (Appearance)'
                          : settingsTab === 'general' ? '通用设置 (General)'
                          : settingsTab === 'terminal' ? '终端与 Shell (Terminal)'
                          : settingsTab === 'sidebar' ? '侧边栏机器管理 (Sidebar)'
                          : '系统诊断与日志 (Diagnostics)'
                        }}
                      </span>
                      <span class="text-xs text-neutral-400 font-mono">
                        term-fleet v0.7.13
                      </span>
                    </div>

                    <!-- 滚动内容区 -->
                    <div class="flex-1 overflow-y-auto p-4 space-y-4">
                      <!-- 标签页 A: 外观设置 (减法设计: 核心亚克力磨砂体系) -->
                      <div v-if="settingsTab === 'appearance'" class="space-y-4">
                        <div>
                          <div class="mb-1.5 px-1 text-[11.5px] font-semibold text-neutral-400 uppercase tracking-wider">
                            材质与色彩 (Material & Palette)
                          </div>
                          <div class="sim-group-panel rounded-[12px] px-3.5 py-1">
                            <!-- Row 1: 显示模式 -->
                            <div class="sim-setting-row flex items-center justify-between py-2.5">
                              <div>
                                <div class="text-[13px] font-medium">显示模式</div>
                                <div class="text-[11.5px] text-neutral-400">选择跟随系统、浅色或深色外观</div>
                              </div>
                              <div class="sim-segmented flex h-6 items-center rounded-[7px] p-0.5">
                                <button
                                  class="sim-segment-btn rounded-[5px] px-2.5 text-[11.5px] transition"
                                  :class="themeMode === 'light' ? 'active shadow-sm font-medium' : ''"
                                  @click="themeMode = 'light'; markDirty()"
                                >
                                  浅色
                                </button>
                                <button
                                  class="sim-segment-btn rounded-[5px] px-2.5 text-[11.5px] transition"
                                  :class="themeMode === 'dark' ? 'active shadow-sm font-medium' : ''"
                                  @click="themeMode = 'dark'; markDirty()"
                                >
                                  深色
                                </button>
                              </div>
                            </div>

                            <div class="sim-row-divider" />

                            <!-- Row 2: 材质主题 (减法: 亚克力磨砂作为主色) -->
                            <div class="sim-setting-row flex items-center justify-between py-2.5">
                              <div>
                                <div class="text-[13px] font-medium">窗口底层材质</div>
                                <div class="text-[11.5px] text-neutral-400">选择灵动透光的亚克力材质或纯色专注底色</div>
                              </div>
                              <div class="sim-segmented flex h-6 items-center rounded-[7px] p-0.5">
                                <button
                                  class="sim-segment-btn rounded-[5px] px-3 text-[11.5px] transition"
                                  :class="backgroundType === 'acrylic' ? 'active shadow-sm font-medium' : ''"
                                  @click="backgroundType = 'acrylic'; markDirty()"
                                >
                                  ✨ 亚克力磨砂 (推荐)
                                </button>
                                <button
                                  class="sim-segment-btn rounded-[5px] px-3 text-[11.5px] transition"
                                  :class="backgroundType === 'plain' ? 'active shadow-sm font-medium' : ''"
                                  @click="backgroundType = 'plain'; markDirty()"
                                >
                                  纯色底板
                                </button>
                              </div>
                            </div>

                            <div class="sim-row-divider" />

                            <!-- Row 3: 背景透明度无级调节 (对齐 term-fleet settings_bg_opacity: 30% ~ 100%) -->
                            <div class="sim-setting-row flex items-center justify-between py-2.5">
                              <div>
                                <div class="text-[13px] font-medium">背景透明度 (Background Opacity)</div>
                                <div class="text-[11.5px] text-neutral-400">无级实时调节底色透光度 (30% ~ 100%)</div>
                              </div>
                              <div class="flex items-center gap-3">
                                <input
                                  v-model.number="backgroundOpacity"
                                  type="range"
                                  min="0.30"
                                  max="1.0"
                                  step="0.05"
                                  class="h-1.5 w-32 cursor-pointer accent-blue-600"
                                  @input="markDirty"
                                >
                                <span class="w-10 text-right font-mono text-xs font-semibold text-neutral-500">
                                  {{ Math.round(backgroundOpacity * 100) }}%
                                </span>
                              </div>
                            </div>

                            <div class="sim-row-divider" />

                            <!-- Row 4: 亚克力模糊四档切换 (None / Subtle / Medium / Deep) -->
                            <div class="sim-setting-row flex items-center justify-between py-2.5">
                              <div>
                                <div class="text-[13px] font-medium">亚克力模糊 (Acrylic Blur)</div>
                                <div class="text-[11.5px] text-neutral-400">系统级磨砂材质强度 (macOS Vibrancy / Win11 Acrylic)</div>
                              </div>
                              <div class="sim-segmented flex h-6 items-center rounded-[7px] p-0.5">
                                <button
                                  v-for="b in [
                                    { id: 'none', label: '无模糊' },
                                    { id: 'subtle', label: '柔和' },
                                    { id: 'medium', label: '标准' },
                                    { id: 'deep', label: '强力' },
                                  ] as const"
                                  :key="b.id"
                                  class="sim-segment-btn rounded-[5px] px-2 text-[11px] transition"
                                  :class="acrylicBlur === b.id ? 'active shadow-sm font-medium' : ''"
                                  @click="acrylicBlur = b.id; markDirty()"
                                >
                                  {{ b.label }}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- 亚克力单层通透性原则说明卡片 -->
                        <div class="rounded-[10px] border border-blue-500/20 bg-blue-500/5 p-3 text-xs leading-relaxed text-blue-900 dark:text-blue-200">
                          <div class="flex items-center gap-1.5 font-semibold">
                            <Sparkles class="h-3.5 w-3.5 text-blue-500" />
                            <span>单层通透性设计原则 (Single-Layer Translucency)</span>
                          </div>
                          <p class="mt-1 text-[11.5px] text-neutral-500 dark:text-neutral-400">
                            摒弃多余复杂的装饰性渐变，纯粹以亚克力材质呈现壁纸与下层窗口的漫反射质感。终端卡片以纯净单层半透明透光，彻底消除多层叠加遮挡。
                          </p>
                        </div>
                      </div>

                      <!-- 标签页 B: 通用与终端 -->
                      <div v-else class="space-y-4">
                        <div>
                          <div class="mb-1.5 px-1 text-[11.5px] font-semibold text-neutral-400 uppercase tracking-wider">
                            会话与进程 (Sessions & Lifecycle)
                          </div>
                          <div class="sim-group-panel rounded-[12px] px-3.5 py-1">
                            <!-- 起始目录 -->
                            <div class="sim-setting-row flex items-center justify-between py-2.5">
                              <div>
                                <div class="text-[13px] font-medium">新建会话起始目录</div>
                                <div class="text-[11.5px] text-neutral-400">选择打开新终端时的初始工作区</div>
                              </div>
                              <div class="sim-segmented flex h-6 items-center rounded-[7px] p-0.5">
                                <button
                                  class="sim-segment-btn rounded-[5px] px-2 text-[11px] transition"
                                  :class="settingNewDir === 'current' ? 'active shadow-sm font-medium' : ''"
                                  @click="settingNewDir = 'current'; markDirty()"
                                >
                                  当前项目
                                </button>
                                <button
                                  class="sim-segment-btn rounded-[5px] px-2 text-[11px] transition"
                                  :class="settingNewDir === 'project' ? 'active shadow-sm font-medium' : ''"
                                  @click="settingNewDir = 'project'; markDirty()"
                                >
                                  根目录
                                </button>
                                <button
                                  class="sim-segment-btn rounded-[5px] px-2 text-[11px] transition"
                                  :class="settingNewDir === 'home' ? 'active shadow-sm font-medium' : ''"
                                  @click="settingNewDir = 'home'; markDirty()"
                                >
                                  主目录
                                </button>
                              </div>
                            </div>

                            <div class="sim-row-divider" />

                            <!-- 二次确认 Toggle -->
                            <div class="sim-setting-row flex items-center justify-between py-2.5">
                              <div>
                                <div class="text-[13px] font-medium">关闭 Pane 前二次确认</div>
                                <div class="text-[11.5px] text-neutral-400">防止误触杀掉长时间运行的 Agent 任务</div>
                              </div>
                              <button
                                class="sim-toggle-track relative h-[22px] w-[38px] shrink-0 rounded-[11px] p-[2px] transition-colors"
                                :class="settingConfirmClose ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-700'"
                                @click="settingConfirmClose = !settingConfirmClose; markDirty()"
                              >
                                <span
                                  class="sim-toggle-thumb block h-[18px] w-[18px] rounded-full bg-white shadow-md transition-transform duration-260"
                                  :style="{ transform: settingConfirmClose ? 'translateX(16px)' : 'translateX(0px)' }"
                                />
                              </button>
                            </div>

                            <div class="sim-row-divider" />

                            <!-- 实时 CWD 跟踪 Toggle -->
                            <div class="sim-setting-row flex items-center justify-between py-2.5">
                              <div>
                                <div class="text-[13px] font-medium">实时内核 CWD 跟踪</div>
                                <div class="text-[11.5px] text-neutral-400">直接通过 proc_info 读取 Shell 目录变化并同步顶栏</div>
                              </div>
                              <button
                                class="sim-toggle-track relative h-[22px] w-[38px] shrink-0 rounded-[11px] p-[2px] transition-colors"
                                :class="settingLiveCwd ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-700'"
                                @click="settingLiveCwd = !settingLiveCwd; markDirty()"
                              >
                                <span
                                  class="sim-toggle-thumb block h-[18px] w-[18px] rounded-full bg-white shadow-md transition-transform duration-260"
                                  :style="{ transform: settingLiveCwd ? 'translateX(16px)' : 'translateX(0px)' }"
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 底部状态栏 (34px - Term-Fleet 规范, items-center 垂直居中) -->
              <div class="flex h-[34px] shrink-0 items-center justify-between border-t border-black/[0.05] px-4 text-[11.5px] text-neutral-400 dark:border-white/[0.06]">
                <div class="flex items-center gap-2">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{{ settingsStatus }}</span>
                </div>
                <div class="font-mono text-[10.5px]">
                  ESC 关闭
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- ========================================================
             浮层 2: 二次确认模态框 (reachDialog 风格)
             特点: 430px 紧凑宽度、Overlay 遮罩、键盘 Enter/Esc 映射
             ======================================================== -->
        <transition name="pop-fade">
          <div
            v-if="isConfirmModalOpen"
            class="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs"
            @click.self="isConfirmModalOpen = false"
          >
            <div class="sim-modal-panel w-[430px] rounded-[14px] p-5 shadow-2xl">
              <div class="flex items-start gap-3">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                  <AlertTriangle class="h-5 w-5" />
                </div>
                <div>
                  <h3 class="m-0 text-sm font-semibold text-neutral-900 dark:text-white">
                    重启后台守护进程？
                  </h3>
                  <p class="mt-1 text-xs leading-relaxed text-neutral-500">
                    后台连接与会话将短暂断开并自动续接。未提交的代码和进程将保留在 Ring Buffer 缓冲区中。
                  </p>
                </div>
              </div>
              <div class="mt-5 flex items-center justify-end gap-2">
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
             浮层 3: 命令面板 (Command Palette - 顶部下沉 84px, 600px 宽)
             ======================================================== -->
        <transition name="pop-fade">
          <div
            v-if="isPaletteOpen"
            class="absolute inset-0 z-50 flex justify-center bg-black/20 pt-[84px]"
            @click.self="isPaletteOpen = false"
          >
            <div class="sim-palette-panel h-[360px] w-[600px] overflow-hidden rounded-[14px] shadow-2xl">
              <!-- 50px 搜索条 (items-center 居中) -->
              <div class="flex h-[50px] items-center gap-3 border-b border-black/[0.06] px-4 dark:border-white/[0.08]">
                <Search class="h-4 w-4 text-neutral-400" />
                <input
                  v-model="paletteQuery"
                  type="text"
                  placeholder="键入以搜索会话、机器或命令..."
                  class="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                  autofocus
                >
                <span class="rounded bg-black/[0.05] px-1.5 py-0.5 text-[10px] text-neutral-400 dark:bg-white/[0.08]">ESC</span>
              </div>

              <!-- 交互列表项 -->
              <div class="p-2 space-y-1 text-xs">
                <div class="flex cursor-pointer items-center justify-between rounded-lg bg-blue-600 px-3 py-2 text-white">
                  <div class="flex items-center gap-2">
                    <Terminal class="h-3.5 w-3.5" />
                    <span class="font-medium">跳至 claude-auth (需要确认操作)</span>
                  </div>
                  <span class="text-[10px] opacity-80">⌘J</span>
                </div>
                <div class="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-neutral-600 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10">
                  <div class="flex items-center gap-2">
                    <SettingsIcon class="h-3.5 w-3.5 text-neutral-400" />
                    <span>打开系统外观与设置</span>
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

        <!-- ========================================================
             浮层 4: 气泡卡片浮层 (leasePopover / 宠物选择器风格 - 320px)
             ======================================================== -->
        <transition name="pop-fade">
          <div
            v-if="isPopoverOpen"
            class="absolute right-12 top-16 z-50 w-[320px] rounded-[14px] p-4 shadow-2xl backdrop-blur-xl sim-popover-panel"
            @click.stop
          >
            <div class="flex items-center justify-between border-b border-black/[0.06] pb-2.5 dark:border-white/[0.08]">
              <div class="flex items-center gap-2">
                <span class="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Zap class="h-3 w-3" />
                </span>
                <span class="text-xs font-semibold">会话控制权 (Session Lease)</span>
              </div>
              <button class="sim-icon-btn flex h-5 w-5 items-center justify-center rounded" @click="isPopoverOpen = false">
                <X class="h-3.5 w-3.5" />
              </button>
            </div>
            <div class="mt-3 space-y-2 text-xs">
              <div class="text-neutral-500 text-[11.5px] leading-relaxed">
                当前终端会话由 <code class="font-mono text-neutral-800 dark:text-neutral-200">local-daemon</code> 独占驱动，支持跨机器无缝热接管。
              </div>
              <div class="rounded-lg bg-black/[0.03] p-2 dark:bg-white/[0.05]">
                <div class="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>租约持有者:</span>
                  <span class="font-mono text-neutral-700 dark:text-neutral-300">alice@workstation</span>
                </div>
                <div class="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>心跳响应:</span>
                  <span class="text-emerald-500 font-mono">1.2ms (活跃)</span>
                </div>
              </div>
              <button
                class="mt-2 w-full rounded-lg bg-blue-600 py-1.5 text-center text-xs font-medium text-white transition hover:bg-blue-700"
                @click="isPopoverOpen = false"
              >
                收回本地驱动权限
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========================================================
   Agent Desktop UI - 减法精简 Token 与受光层级
   ======================================================== */

/* --- 浅色模式规范 --- */
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

/* 桌面模拟器外壳 */
.desktop-sim-window {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.sim-theme-dark.desktop-sim-window {
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 20px 50px rgba(0, 0, 0, 0.5);
}

/* 浮动终端卡片 (Term-Fleet 双层卡片架构) */
.sim-pane-card {
  background: var(--sim-card-bg);
  box-shadow: var(--sim-shadow-raised);
}

/* 深色模式 Lit Edge: 使用 border + inset box-shadow 绘制上边缘高光，严格保持 14px/8px 圆角与硬件裁剪 */
.sim-theme-dark .sim-pane-card {
  border: 1px solid rgba(236, 236, 240, 0.10);
  box-shadow: inset 0 1px 0 0 rgba(236, 236, 240, 0.18), var(--sim-shadow-raised);
}

/* 亚克力卡片效果 */
.agent-acrylic-card {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
}

.sim-theme-dark .agent-acrylic-card {
  background: rgba(35, 35, 40, 0.82) !important;
}

.agent-acrylic-dialog {
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
}

.sim-card-header {
  border-bottom: 1px solid var(--sim-divider);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}

.sim-terminal-body {
  background: transparent;
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}

/* 输入框 */
.sim-field,
.sim-settings-search {
  background: var(--sim-control);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
}

.sim-theme-dark .sim-field,
.sim-theme-dark .sim-settings-search {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.sim-field:focus-within,
.sim-settings-search:focus-within {
  box-shadow: 0 0 0 3px rgba(59, 108, 246, 0.3), inset 0 0 0 1px rgba(59, 108, 246, 0.8) !important;
}

/* 设置浮层面板 (Term-Fleet 规范) */
.sim-settings-dialog {
  box-shadow: var(--sim-shadow-floating);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.sim-theme-dark .sim-settings-dialog {
  border: 1px solid rgba(236, 236, 240, 0.14);
  box-shadow: inset 0 1px 0 0 rgba(236, 236, 240, 0.18), var(--sim-shadow-floating);
}

.sim-nav-item {
  color: var(--sim-text-muted);
}

.sim-nav-active {
  background: var(--sim-card-bg) !important;
  color: var(--sim-text) !important;
  font-weight: 550;
  box-shadow: var(--sim-shadow-chosen);
}

.sim-settings-inner-card {
  background: var(--sim-card-bg);
  box-shadow: var(--sim-shadow-raised);
}

.sim-theme-dark .sim-settings-inner-card {
  border: 1px solid rgba(236, 236, 240, 0.10);
  box-shadow: inset 0 1px 0 0 rgba(236, 236, 240, 0.16), var(--sim-shadow-raised);
}

.sim-group-panel {
  background: var(--sim-chip);
}

.sim-theme-dark .sim-group-panel {
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* 弹窗与控制面板 */
.sim-modal-panel,
.sim-palette-panel,
.sim-popover-panel {
  background: var(--sim-popover-bg);
  box-shadow: var(--sim-shadow-floating);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.sim-theme-dark .sim-modal-panel,
.sim-theme-dark .sim-palette-panel,
.sim-theme-dark .sim-popover-panel {
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.15), var(--sim-shadow-floating);
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
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.12), var(--sim-shadow-raised);
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

/* 弹窗过渡动画 */
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
