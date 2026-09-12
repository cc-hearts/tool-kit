<script setup lang="ts">
import { message } from 'antdv-next'
import { Download, RefreshCw } from 'lucide-vue-next'
import {
  bgColors,
  blushParts,
  browParts,
  beardParts,
  clothesParts,
  eyeParts,
  glassesParts,
  hairBackParts,
  hairColors,
  hairParts,
  headSvg,
  mouthParts,
  noseParts,
  skinColors,
  type AvatarColors,
  type AvatarPart,
} from './parts'

/** 可选部件的选择状态（键与部件库一一对应） */
type PartKey = 'hair' | 'hairBack' | 'brows' | 'eyes' | 'nose' | 'mouth' | 'beard' | 'glasses' | 'blush' | 'clothes'
type ColorKey = 'bg' | 'skin' | 'hairColor'

const sel = reactive<Record<PartKey, number>>({
  hair: 1,
  hairBack: 0,
  brows: 0,
  eyes: 0,
  nose: 0,
  mouth: 0,
  beard: 0,
  glasses: 0,
  blush: 0,
  clothes: 0,
})

const colorSel = reactive<Record<ColorKey, number>>({
  bg: 0,
  skin: 0,
  hairColor: 0,
})

const faceRows: Array<{ key: PartKey, label: string, parts: AvatarPart[] }> = [
  { key: 'brows', label: '眉毛', parts: browParts },
  { key: 'eyes', label: '眼睛', parts: eyeParts },
  { key: 'nose', label: '鼻子', parts: noseParts },
  { key: 'mouth', label: '嘴巴', parts: mouthParts },
  { key: 'beard', label: '胡须', parts: beardParts },
  { key: 'glasses', label: '眼镜', parts: glassesParts },
  { key: 'blush', label: '腮红', parts: blushParts },
]

const styleRows: Array<{ key: PartKey, label: string, parts: AvatarPart[] }> = [
  { key: 'hair', label: '发型', parts: hairParts },
  { key: 'hairBack', label: '脑后', parts: hairBackParts },
  { key: 'clothes', label: '衣服', parts: clothesParts },
]

const partRows = [...faceRows, ...styleRows]

const colorRows: Array<{ key: ColorKey, label: string, colors: string[] }> = [
  { key: 'bg', label: '背景', colors: bgColors },
  { key: 'skin', label: '肤色', colors: skinColors },
  { key: 'hairColor', label: '发色', colors: hairColors },
]

function selectOptions(parts: AvatarPart[]) {
  return parts.map((part, index) => ({ label: part.name, value: index }))
}

/** 用 Web Crypto 取随机下标（生成娱乐用途，忽略模偏差） */
function randomIndex(length: number) {
  return window.crypto.getRandomValues(new Uint32Array(1))[0]! % length
}

function shufflePart(key: PartKey, parts: AvatarPart[]) {
  sel[key] = randomIndex(parts.length)
}

function randomizeAll() {
  for (const row of partRows)
    shufflePart(row.key, row.parts)
  for (const row of colorRows)
    colorSel[row.key] = randomIndex(row.colors.length)
}

/* ---------- SVG 组装 ---------- */

/** 图层顺序：背景 → 脑后发型 → 衣服 → 头 → 腮红 → 胡须 → 发型 → 五官 → 眼镜 */
const avatarSvg = computed(() => {
  const colors: AvatarColors = {
    bg: bgColors[colorSel.bg]!,
    skin: skinColors[colorSel.skin]!,
    hair: hairColors[colorSel.hairColor]!,
  }
  const layer = (parts: AvatarPart[], index: number) => parts[index]?.svg(colors) ?? ''
  const body = [
    `<rect width="240" height="240" fill="${colors.bg}"/>`,
    layer(hairBackParts, sel.hairBack),
    layer(clothesParts, sel.clothes),
    headSvg(colors),
    layer(blushParts, sel.blush),
    layer(beardParts, sel.beard),
    layer(hairParts, sel.hair),
    layer(browParts, sel.brows),
    layer(eyeParts, sel.eyes),
    layer(noseParts, sel.nose),
    layer(mouthParts, sel.mouth),
    layer(glassesParts, sel.glasses),
  ].join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">${body}</svg>`
})

onMounted(randomizeAll)

/* ---------- 下载 ---------- */

const pngSize = ref(512)

function triggerDownload(blob: Blob, name: string) {
  const anchor = document.createElement('a')
  anchor.href = URL.createObjectURL(blob)
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(anchor.href)
}

function downloadSvg() {
  const blob = new Blob([avatarSvg.value], { type: 'image/svg+xml;charset=utf-8' })
  triggerDownload(blob, `avatar-${Date.now()}.svg`)
}

function loadSvgImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', () => reject(new Error('栅格化失败')))
    img.src = url
  })
}

async function downloadPng() {
  try {
    const blob = new Blob([avatarSvg.value], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = await loadSvgImage(url)
    URL.revokeObjectURL(url)

    const canvas = document.createElement('canvas')
    canvas.width = pngSize.value
    canvas.height = pngSize.value
    const ctx = canvas.getContext('2d')
    if (!ctx)
      throw new Error('canvas 不可用')
    ctx.drawImage(img, 0, 0, pngSize.value, pngSize.value)

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result)
          resolve(result)
        else
          reject(new Error('导出失败'))
      }, 'image/png')
    })
    triggerDownload(pngBlob, `avatar-${Date.now()}-${pngSize.value}.png`)
  }
  catch {
    message.error('导出 PNG 失败，请重试')
  }
}
</script>

<template>
  <div class="grid items-start gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
    <!-- 左：预览与操作 -->
    <div class="flex flex-col items-center gap-4 md:sticky md:top-6">
      <div
        class="h-240px w-240px overflow-hidden rounded-2xl border border-border [&>svg]:h-full [&>svg]:w-full"
        v-html="avatarSvg"
      />

      <a-button type="primary" block @click="randomizeAll">
        <template #icon>
          <RefreshCw :size="14" />
        </template>
        随机一下
      </a-button>

      <a-space class="w-full" :size="8">
        <a-button class="flex-1" @click="downloadSvg">
          <template #icon>
            <Download :size="14" />
          </template>
          SVG
        </a-button>
        <a-button class="flex-1" @click="downloadPng">
          <template #icon>
            <Download :size="14" />
          </template>
          PNG
        </a-button>
        <a-select v-model:value="pngSize" class="w-72px" :options="[256, 512, 1024].map(size => ({ label: `${size}`, value: size }))" />
      </a-space>

      <p class="mb-0 text-center text-xs text-muted-foreground">
        纯本地 SVG 拼装，商用前请自行确认风格合规
      </p>
    </div>

    <!-- 右：部件选择 -->
    <div class="flex flex-col gap-5">
      <div>
        <h3 class="mb-3 mt-0 text-sm font-semibold">
          五官
        </h3>
        <div class="flex flex-col gap-2">
          <div v-for="row in faceRows" :key="row.key" class="flex items-center gap-2">
            <span class="w-10 shrink-0 text-sm text-muted-foreground">{{ row.label }}</span>
            <a-select
              v-model:value="sel[row.key]"
              class="min-w-0 flex-1"
              size="small"
              :options="selectOptions(row.parts)"
            />
            <a-button size="small" :title="`随机${row.label}`" @click="shufflePart(row.key, row.parts)">
              <template #icon>
                <RefreshCw :size="12" />
              </template>
            </a-button>
          </div>
        </div>
      </div>

      <div>
        <h3 class="mb-3 mt-0 text-sm font-semibold">
          造型
        </h3>
        <div class="flex flex-col gap-2">
          <div v-for="row in styleRows" :key="row.key" class="flex items-center gap-2">
            <span class="w-10 shrink-0 text-sm text-muted-foreground">{{ row.label }}</span>
            <a-select
              v-model:value="sel[row.key]"
              class="min-w-0 flex-1"
              size="small"
              :options="selectOptions(row.parts)"
            />
            <a-button size="small" :title="`随机${row.label}`" @click="shufflePart(row.key, row.parts)">
              <template #icon>
                <RefreshCw :size="12" />
              </template>
            </a-button>
          </div>
        </div>
      </div>

      <div>
        <h3 class="mb-3 mt-0 text-sm font-semibold">
          配色
        </h3>
        <div class="flex flex-col gap-2">
          <div v-for="row in colorRows" :key="row.key" class="flex items-center gap-2">
            <span class="w-10 shrink-0 text-sm text-muted-foreground">{{ row.label }}</span>
            <div class="flex flex-1 flex-wrap gap-1.5">
              <button
                v-for="(color, index) in row.colors"
                :key="color"
                type="button"
                class="size-7 rounded-md border border-border transition-transform hover:scale-110"
                :class="colorSel[row.key] === index ? 'ring-2 ring-ring ring-offset-2 ring-offset-card' : ''"
                :style="{ backgroundColor: color }"
                :aria-label="`${row.label} ${color}`"
                :aria-pressed="colorSel[row.key] === index"
                @click="colorSel[row.key] = index"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
