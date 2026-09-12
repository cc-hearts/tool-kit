<script setup lang="ts">
type CaseType = 'camel' | 'kebab' | 'snake' | 'pascal' | 'upper' | 'lower' | 'enum'

const caseTypes: Array<{ type: CaseType, label: string }> = [
  { type: 'camel', label: 'camelCase' },
  { type: 'kebab', label: 'kebab-case' },
  { type: 'snake', label: 'snake_case' },
  { type: 'pascal', label: 'PascalCase' },
  { type: 'upper', label: 'UPPER CASE' },
  { type: 'lower', label: 'lower case' },
  { type: 'enum', label: 'ENUM_CASE' },
]

const word = ref('')

/**
 * 任意命名风格 → 规范词元。
 * 先在驼峰边界与「大写序列接小写」处插入空格，再按非字母数字切分，
 * 使 camelCase / PascalCase / kebab-case / snake_case / 空格短语 均可正确拆词。
 */
function tokenize(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function convert(type: CaseType, tokens: string[]): string {
  if (!tokens.length)
    return ''
  switch (type) {
    case 'camel':
      return tokens.map((target, index) => (index > 0 ? capitalize(target.toLowerCase()) : target.toLowerCase())).join('')
    case 'kebab':
      return tokens.map(target => target.toLowerCase()).join('-')
    case 'snake':
      return tokens.map(target => target.toLowerCase()).join('_')
    case 'pascal':
      return tokens.map(target => capitalize(target.toLowerCase())).join('')
    case 'upper':
      return tokens.join(' ').toUpperCase()
    case 'lower':
      return tokens.join(' ').toLowerCase()
    case 'enum':
      return tokens.map(target => target.toUpperCase()).join('_')
  }
}

const tokens = computed(() => tokenize(word.value.trim()))

/** Typography copyable 复制回调：记录行为埋点（服务端路由示例，见 server/api/track.post.ts） */
function onCopy(type: CaseType) {
  $fetch('/api/track', { method: 'POST', body: { type } }).catch(() => {})
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <a-input v-model:value="word" size="large" placeholder="输入任意命名：hello world / helloWorld / hello-world / HELLO_WORLD 均可" />

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <a-card v-for="item in caseTypes" :key="item.type" size="small" :title="item.label">
        <a-typography-text
          :copyable="{ text: convert(item.type, tokens), onCopy: () => onCopy(item.type) }"
          code
          class="min-w-0 truncate text-sm"
        >
          {{ convert(item.type, tokens) || '-' }}
        </a-typography-text>
      </a-card>
    </div>
  </div>
</template>
