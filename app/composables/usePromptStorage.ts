import { computed, onMounted, ref, watch } from 'vue'
import { INITIAL_PROMPTS } from '~/prompts/data'
import type { PromptItem } from '~/prompts/types'

const STORAGE_KEY = 'cc_toolkit_prompts_v2'
const OLD_STORAGE_KEY = 'cc_toolkit_prompts_v1'

// 全局单例响应式引用，避免多处调用 usePromptStorage 时数据不一致
const promptsState = ref<PromptItem[]>([...INITIAL_PROMPTS])
const isLoaded = ref(false)

export function usePromptStorage() {
  function persist() {
    if (!import.meta.client)
      return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(promptsState.value))
    }
    catch (e) {
      console.error('Failed to persist prompts to localStorage:', e)
    }
  }

  onMounted(() => {
    if (isLoaded.value)
      return
    try {
      // 检查当前版本缓存
      let stored = localStorage.getItem(STORAGE_KEY)
      // 若无 v2 缓存，尝试从 v1 迁移（但只保留用户自创的 custom prompt，坚决丢弃旧版废弃的 demo）
      if (!stored && localStorage.getItem(OLD_STORAGE_KEY)) {
        try {
          const oldData = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY) || '[]')
          if (Array.isArray(oldData)) {
            const userCustomOnly = oldData.filter((p: PromptItem) => p.id.startsWith('custom-') || p.author === '自定义')
            promptsState.value = [...INITIAL_PROMPTS, ...userCustomOnly]
            persist()
            localStorage.removeItem(OLD_STORAGE_KEY)
            isLoaded.value = true
            return
          }
        }
        catch {
          // ignore
        }
      }

      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 保留当前合法的 INITIAL_PROMPTS 以及用户自定义 prompt，过滤掉老旧的已删除 demo
          const initialIds = new Set(INITIAL_PROMPTS.map(p => p.id))
          const validInitial = INITIAL_PROMPTS
          const userCustom = parsed.filter((p: PromptItem) => !initialIds.has(p.id) && (p.id.startsWith('custom-') || p.author === '自定义'))
          promptsState.value = [...validInitial, ...userCustom]
        }
      }
    }
    catch (e) {
      console.warn('Failed to load stored prompts, using default presets:', e)
    }
    finally {
      isLoaded.value = true
    }
  })

  // 数据变动自动持久化
  watch(
    promptsState,
    () => {
      if (isLoaded.value) {
        persist()
      }
    },
    { deep: true },
  )

  function toggleFavorite(id: string) {
    const item = promptsState.value.find(p => p.id === id)
    if (item) {
      item.isFavorite = !item.isFavorite
      item.updatedAt = new Date().toISOString().slice(0, 10)
    }
  }

  function incrementCopyCount(id: string) {
    const item = promptsState.value.find(p => p.id === id)
    if (item) {
      item.copyCount = (item.copyCount || 0) + 1
    }
  }

  function savePrompt(promptData: Partial<PromptItem> & { title: string; prompt: string }): PromptItem {
    const now = new Date().toISOString().slice(0, 10)
    const existingIndex = promptsState.value.findIndex(p => p.id === promptData.id)

    if (existingIndex >= 0) {
      const existing = promptsState.value[existingIndex]!
      const updated: PromptItem = {
        ...existing,
        ...promptData,
        updatedAt: now,
      } as PromptItem
      promptsState.value[existingIndex] = updated
      return updated
    }
    else {
      const newItem: PromptItem = {
        id: promptData.id || `custom-${Date.now()}`,
        title: promptData.title,
        description: promptData.description || '',
        category: promptData.category || 'commercial',
        model: promptData.model || 'Midjourney v6.1',
        prompt: promptData.prompt,
        negativePrompt: promptData.negativePrompt || '',
        parameters: promptData.parameters || { aspectRatio: '16:9' },
        variables: promptData.variables || [],
        previewImages: promptData.previewImages || [],
        tags: promptData.tags || [],
        author: promptData.author || '自定义',
        isFavorite: promptData.isFavorite ?? false,
        copyCount: 0,
        createdAt: now,
        updatedAt: now,
      }
      promptsState.value.unshift(newItem)
      return newItem
    }
  }

  function deletePrompt(id: string) {
    const index = promptsState.value.findIndex(p => p.id === id)
    if (index >= 0) {
      promptsState.value.splice(index, 1)
    }
  }

  function getPromptById(id: string) {
    return computed(() => promptsState.value.find(p => p.id === id))
  }

  return {
    prompts: promptsState,
    isLoaded,
    toggleFavorite,
    incrementCopyCount,
    savePrompt,
    deletePrompt,
    getPromptById,
  }
}
