<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ArrowLeft,
  Boxes,
  Check,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Layers,
  Search,
  Sparkles,
  Tag,
} from 'lucide-vue-next'
import {
  countSkillsByCategory,
  getSkillById,
  getSkillsByCategory,
  skillCategories,
  skills,
  type SkillItem,
} from '~/skills'
import AgentDesktopDemo from '~/components/skills/AgentDesktopDemo.vue'

const route = useRoute()
const router = useRouter()

// 搜索与分类
const keyword = ref('')
const activeCategory = ref('all')

// 统计各分类数量
const categoryCounts = computed(() => countSkillsByCategory(skills))

const categoryItems = computed(() => {
  const items = [{ key: 'all', label: '全部技能', count: categoryCounts.value.all ?? 0 }]
  for (const cat of skillCategories) {
    const count = categoryCounts.value[cat.key] ?? 0
    if (count > 0) {
      items.push({
        key: cat.key,
        label: cat.label,
        count,
      })
    }
  }
  return items
})

// 过滤后的技能列表
const filteredSkills = computed(() => {
  const list = getSkillsByCategory(activeCategory.value)
  const q = keyword.value.trim().toLowerCase()
  if (!q)
    return list
  return list.filter((s) => {
    return [s.title, s.name, s.description, ...s.tags].some(t => t.toLowerCase().includes(q))
  })
})

// 当前选中的技能 ID（从 URL query 读写，默认 null 即展示全部技能网格）
const selectedSkillId = ref<string | null>(
  typeof route.query.id === 'string' ? route.query.id : null,
)

// 当前选中的技能对象
const currentSkill = computed<SkillItem | null>(() => {
  if (!selectedSkillId.value)
    return null
  return getSkillById(selectedSkillId.value) ?? null
})

// 监听 URL 参数变化
watch(
  () => route.query.id,
  (newId) => {
    selectedSkillId.value = typeof newId === 'string' ? newId : null
  },
)

// 选择技能
function selectSkill(skill: SkillItem) {
  selectedSkillId.value = skill.id
  router.push({
    query: {
      ...route.query,
      id: skill.id,
    },
  })
}

// 返回技能库总览
function backToList() {
  selectedSkillId.value = null
  const q = { ...route.query }
  delete q.id
  router.push({ query: q })
}

// 技能详情内的 Tab 切换：demo | spec | tokens
const activeSkillTab = ref<'demo' | 'spec' | 'tokens'>('demo')

// 当切换技能时，如果该技能没有 Live Demo，则自动回退到 spec 规范文档 tab
watch(currentSkill, (skill) => {
  if (skill) {
    if (skill.hasLiveDemo) {
      activeSkillTab.value = 'demo'
    }
    else {
      activeSkillTab.value = 'spec'
    }
  }
})

// 复制提示反馈
const copiedKey = ref<string | null>(null)
function copyCode(text: string, key: string) {
  navigator.clipboard.writeText(text)
  copiedKey.value = key
  setTimeout(() => {
    if (copiedKey.value === key)
      copiedKey.value = null
  }, 2000)
}

// Token Tab 格式切换 (CSS / JSON)
const activeTokenFormat = ref<'css' | 'json'>('css')

const currentTokenContent = computed(() => {
  if (!currentSkill.value)
    return ''
  if (activeTokenFormat.value === 'css')
    return currentSkill.value.tokensCss ?? ''
  return JSON.stringify(currentSkill.value.tokensJson ?? {}, null, 2)
})

// 动态 Page Title
useHead(() => ({
  title: currentSkill.value
    ? `${currentSkill.value.title} · 技能库 · Tool Kit`
    : '技能库 · Skills Hub · Tool Kit',
}))
</script>

<template>
  <div class="page-container pb-16 pt-8">
    <!-- ========================================================
         视图 A: 单一技能深度详情与交互演示视图 (当 selectedSkillId 存在)
         ======================================================== -->
    <div v-if="currentSkill">
      <!-- 顶部返回导航与面包屑 -->
      <div class="mb-4 flex items-center justify-between">
        <button
          class="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          @click="backToList"
        >
          <ArrowLeft class="h-3.5 w-3.5" />
          <span>返回全部技能库</span>
        </button>

        <!-- 快速切换其他技能下拉 (多技能时呈现) -->
        <div v-if="skills.length > 1" class="flex items-center gap-2 text-xs text-neutral-400">
          <span>切换技能:</span>
          <select
            :value="currentSkill.id"
            class="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
            @change="(e) => selectSkill(getSkillById((e.target as HTMLSelectElement).value)!)"
          >
            <option v-for="s in skills" :key="s.id" :value="s.id">
              {{ s.title }} (v{{ s.version }})
            </option>
          </select>
        </div>
      </div>

      <!-- 技能详情 Header (Hero) -->
      <div class="mb-6 rounded-2xl border border-neutral-200/80 bg-gradient-to-b from-neutral-50/80 to-white/40 p-6 shadow-sm dark:border-neutral-800 dark:from-neutral-900/60 dark:to-neutral-950/20">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div class="flex items-center gap-2.5">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Boxes class="h-5 w-5" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="m-0 text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    {{ currentSkill.title }}
                  </h1>
                  <span class="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    v{{ currentSkill.version }}
                  </span>
                  <span v-if="currentSkill.hasLiveDemo" class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    带交互式 Demo
                  </span>
                </div>
                <p class="m-0 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  标识符: <code class="font-mono">{{ currentSkill.name }}</code> · {{ currentSkill.source ?? 'CarlOpenLab' }}
                </p>
              </div>
            </div>

            <p class="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {{ currentSkill.description }}
            </p>

            <!-- 标签一览 -->
            <div class="mt-4 flex flex-wrap gap-1.5">
              <span
                v-for="tag in currentSkill.tags"
                :key="tag"
                class="rounded-md border border-neutral-200 bg-white px-2.5 py-0.5 text-xs font-medium text-neutral-600 shadow-2xs dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:text-neutral-300"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 快捷操作区 -->
          <div class="flex shrink-0 items-center gap-2">
            <button
              v-if="currentSkill.tokensCss"
              class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              @click="copyCode(currentSkill.tokensCss, 'header-css')"
            >
              <Copy class="h-3.5 w-3.5" />
              <span>{{ copiedKey === 'header-css' ? '已复制 CSS' : '复制 CSS Tokens' }}</span>
            </button>
            <button
              class="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
              @click="copyCode(currentSkill.doc, 'header-doc')"
            >
              <FileText class="h-3.5 w-3.5" />
              <span>{{ copiedKey === 'header-doc' ? '已复制规范' : '复制 SKILL.md' }}</span>
            </button>
          </div>
        </div>

        <!-- Tab 切换按钮组 -->
        <div class="mt-6 flex border-b border-neutral-200/80 pt-2 dark:border-neutral-800">
          <button
            v-if="currentSkill.hasLiveDemo"
            class="relative inline-flex items-center gap-2 pb-3 text-sm font-medium transition"
            :class="activeSkillTab === 'demo' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'"
            @click="activeSkillTab = 'demo'"
          >
            <Eye class="h-4 w-4" />
            <span>🎯 交互演示 (Live Demo)</span>
            <span
              v-if="activeSkillTab === 'demo'"
              class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400"
            />
          </button>

          <button
            class="relative inline-flex items-center gap-2 pb-3 text-sm font-medium transition"
            :class="[
              activeSkillTab === 'spec' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
              currentSkill.hasLiveDemo ? 'ml-6' : '',
            ]"
            @click="activeSkillTab = 'spec'"
          >
            <FileText class="h-4 w-4" />
            <span>📖 完整规范文档 (SKILL.md)</span>
            <span
              v-if="activeSkillTab === 'spec'"
              class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400"
            />
          </button>

          <button
            v-if="currentSkill.tokensCss || currentSkill.tokensJson"
            class="relative ml-6 inline-flex items-center gap-2 pb-3 text-sm font-medium transition"
            :class="activeSkillTab === 'tokens' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'"
            @click="activeSkillTab = 'tokens'"
          >
            <Code2 class="h-4 w-4" />
            <span>🗄️ 设计变量 (Design Tokens)</span>
            <span
              v-if="activeSkillTab === 'tokens'"
              class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400"
            />
          </button>
        </div>
      </div>

      <!-- Tab 1: 实时交互 Demo (单终端视窗模拟器) -->
      <div v-if="currentSkill.hasLiveDemo && activeSkillTab === 'demo'">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="m-0 text-base font-semibold text-neutral-900 dark:text-white">
              {{ currentSkill.title }} · 单终端视窗模拟器
            </h2>
            <p class="m-0 mt-0.5 text-xs text-neutral-500">
              单终端沉浸式工作台，优先纯色底板，支持深浅模式、跨平台窗口框架（macOS/Win11）以及可拖拽无遮罩设置浮层。
            </p>
          </div>
        </div>
        <AgentDesktopDemo />
      </div>

      <!-- Tab 2: 规范文档 (Markdown View) -->
      <div v-show="activeSkillTab === 'spec'" class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div class="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
          <div class="flex items-center gap-2 text-xs text-neutral-500">
            <FileText class="h-4 w-4" />
            <span>{{ currentSkill.name }}/SKILL.md 原生规范文档</span>
          </div>
          <button
            class="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            @click="copyCode(currentSkill.doc, 'tab-doc')"
          >
            <Copy class="h-3 w-3" />
            <span>{{ copiedKey === 'tab-doc' ? '已复制' : '复制代码' }}</span>
          </button>
        </div>
        <pre class="max-h-[700px] overflow-auto rounded-lg bg-neutral-50 p-4 font-mono text-xs leading-relaxed text-neutral-800 dark:bg-neutral-950 dark:text-neutral-200">{{ currentSkill.doc }}</pre>
      </div>

      <!-- Tab 3: Design Tokens 视图 (CSS / JSON) -->
      <div v-show="activeSkillTab === 'tokens'" class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div class="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
          <div class="inline-flex rounded-lg border border-neutral-200/80 bg-neutral-100/80 p-0.5 text-xs dark:border-neutral-700 dark:bg-neutral-800">
            <button
              class="rounded-md px-3 py-1 font-medium transition"
              :class="activeTokenFormat === 'css' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'"
              @click="activeTokenFormat = 'css'"
            >
              CSS Tokens (tokens.css)
            </button>
            <button
              class="rounded-md px-3 py-1 font-medium transition"
              :class="activeTokenFormat === 'json' ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'"
              @click="activeTokenFormat = 'json'"
            >
              JSON Dictionary (tokens.json)
            </button>
          </div>

          <button
            class="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            @click="copyCode(currentTokenContent, 'tab-token')"
          >
            <Copy class="h-3 w-3" />
            <span>{{ copiedKey === 'tab-token' ? '已复制' : '复制代码' }}</span>
          </button>
        </div>

        <pre class="max-h-[650px] overflow-auto rounded-lg bg-neutral-50 p-4 font-mono text-xs leading-relaxed text-neutral-800 dark:bg-neutral-950 dark:text-neutral-200">{{ currentTokenContent }}</pre>
      </div>
    </div>

    <!-- ========================================================
         视图 B: 技能库全量网格总览视图 (支持分类筛选 + 搜索)
         ======================================================== -->
    <div v-else>
      <!-- Hero Header -->
      <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-neutral-200/80 pb-6 dark:border-neutral-800">
        <div>
          <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Boxes class="h-4 w-4" />
            <span>Skills Hub · 技能中心</span>
          </div>
          <h1 class="m-0 mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            AI 智能体技能与设计规范库
          </h1>
          <p class="m-0 mt-1.5 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
            面向 AI 编码智能体与桌面终端的工程规范中心。包含跨平台桌面 UI 体系、自治工作流规范、代码审查标准与可交互 Live Demo。
          </p>
        </div>

        <!-- 搜索条 -->
        <div class="relative w-full md:w-72 shrink-0">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索技能名称或标签..."
            class="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
          >
        </div>
      </div>

      <!-- 分类筛选栏 -->
      <div class="mb-6 flex flex-wrap items-center gap-2 border-b border-neutral-100 pb-4 dark:border-neutral-800/80">
        <button
          v-for="cat in categoryItems"
          :key="cat.key"
          class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition"
          :class="activeCategory === cat.key
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:bg-neutral-800'"
          @click="activeCategory = cat.key"
        >
          <span>{{ cat.label }}</span>
          <span
            class="rounded-full px-1.5 py-0.2 text-[10px] tabular-nums"
            :class="activeCategory === cat.key ? 'bg-white/20 text-white dark:bg-black/20 dark:text-neutral-900' : 'bg-black/5 dark:bg-white/10 text-neutral-400'"
          >
            {{ cat.count }}
          </span>
        </button>
      </div>

      <!-- 技能卡片列表网格 -->
      <div v-if="filteredSkills.length > 0" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="skill in filteredSkills"
          :key="skill.id"
          class="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/90"
          @click="selectSkill(skill)"
        >
          <div>
            <div class="flex items-center justify-between">
              <span class="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                v{{ skill.version }}
              </span>
              <span
                v-if="skill.hasLiveDemo"
                class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
              >
                <Eye class="h-3 w-3" />
                Live Demo
              </span>
            </div>

            <h3 class="m-0 mt-3 text-base font-semibold text-neutral-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              {{ skill.title }}
            </h3>
            <p class="m-0 mt-1 text-xs font-mono text-neutral-400">
              {{ skill.name }}
            </p>

            <p class="mt-2.5 line-clamp-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
              {{ skill.description }}
            </p>
          </div>

          <div class="mt-5 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <!-- 标签 -->
            <div class="flex flex-wrap gap-1">
              <span
                v-for="t in skill.tags.slice(0, 3)"
                :key="t"
                class="rounded bg-neutral-100 px-1.5 py-0.5 text-[10.5px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
              >
                {{ t }}
              </span>
              <span v-if="skill.tags.length > 3" class="text-[10px] text-neutral-400">
                +{{ skill.tags.length - 3 }}
              </span>
            </div>

            <div class="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
              <span>{{ skill.source ?? 'CarlOpenLab' }}</span>
              <span class="font-medium text-blue-600 group-hover:underline dark:text-blue-400">
                查看详情 & 规范 →
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空搜索结果 -->
      <div v-else class="rounded-xl border border-dashed border-neutral-300 p-12 text-center text-xs text-neutral-400 dark:border-neutral-800">
        没有找到匹配的技能，请更换关键词或分类重试。
      </div>
    </div>
  </div>
</template>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
