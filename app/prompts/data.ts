import type { PromptItem } from './types'

export const INITIAL_PROMPTS: PromptItem[] = [
  {
    id: 'prompt-editorial-split',
    title: '3:4 独立艺术刊物双拼海报 (摄影与极简手绘诗)',
    description: '严格 3:4 竖构图双拼排版：上半区 50% 保留真实胶片杂志摄影，下半区 50% 提炼为粗糙纸张极简手绘插画与微小主体留白。',
    category: 'commercial',
    model: 'Midjourney v6.1',
    prompt: 'An independent high-end editorial poster in strict 3:4 vertical composition, horizontally divided into two exactly equal 1:1 sections:\n\nTOP HALF (50%): An authentic editorial magazine photograph of {photoSubject}. Natural atmospheric lighting, realistic photographic textures, subtle editorial color grading, cinematic and authentic.\n\nBOTTOM HALF (50%): A minimalist hand-drawn paper illustration interpreting the photograph above. Centered around {illustratedElement}, occupying only 10-20% of the space with vast empty negative space. Rendered on rough warm off-white book-cover paper with delicate imperfect lines, bold flat acrylic color blocks limited to 4 harmonious shades ({palette}), handmade brush marks, and subtle editorial typography reading "{typography}".\n\nQuiet, poetic, refined, minimal, contemporary art book publication cover --ar 3:4 --v 6.1 --style raw --stylize 180',
    negativePrompt: 'colored-pencil, crayon textures, bleeding watercolor, pure line-art, complex realistic illustration, heavy oil-painting, smooth 3d rendering, glossy plastic, commercial cartoon, cute character design, e-commerce ads, busy composition, excessive typography, uneven split, collage',
    parameters: {
      aspectRatio: '3:4',
      model: '--v 6.1',
      stylize: '180',
      sampler: 'Euler a',
    },
    variables: [
      {
        key: 'photoSubject',
        label: '上半部摄影主体',
        defaultValue: 'a solitary traveler in an oversized wool trench coat looking out over a foggy coastal cliff with autumn pines',
        options: [
          'a solitary traveler in an oversized wool trench coat looking out over a foggy coastal cliff with autumn pines',
          'an elderly potter shaping a terracotta vase with morning sunbeams cutting through kiln dust',
          'a young woman with a vintage bicycle resting beside a field of blooming wild lavender in dusk',
          'a minimalist architectural staircase casting sharp geometric shadows under high noon sunlight',
        ],
        description: '上半部真实写实摄影的人物、场景与构图细节',
      },
      {
        key: 'illustratedElement',
        label: '下半部提炼极简手绘主体',
        defaultValue: 'the tiny simplified silhouette of the traveler and a solitary wind-swept pine tree',
        options: [
          'the tiny simplified silhouette of the traveler and a solitary wind-swept pine tree',
          'the minimal outline of the potter hands cradling the terracotta vessel',
          'a tiny abstract silhouette of the bicycle and three lavender stems',
          'a single clean geometric step with a small silhouette of a black cat',
        ],
        description: '下半部粗糙手绘纸上仅占10-20%比例的核心极简物象',
      },
      {
        key: 'palette',
        label: '提取主色调 (≤4色)',
        defaultValue: 'terracotta rust, forest sage green, warm off-white, and charcoal noir',
        options: [
          'terracotta rust, forest sage green, warm off-white, and charcoal noir',
          'deep indigo blue, ochre yellow, natural linen white, and stone grey',
          'muted coral pink, olive green, warm cream paper, and slate black',
          'raw umber, Aegean teal, parchment ivory, and deep espresso',
        ],
        description: '从摄影提取的至多4种克制主色调',
      },
      {
        key: 'typography',
        label: '极简刊物排版字样',
        defaultValue: 'SOLITUDE / ISSUE 04',
        options: [
          'SOLITUDE / ISSUE 04',
          'THE CRAFTSMAN · 2025',
          'SILENT LANDSCAPE',
          'EPISODE I · AUTUMN',
        ],
        description: '下半部留白区点缀的极简刊物或地点短语',
      },
    ],
    previewImages: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    ],
    tags: ['独立出版', '双拼海报', '极简手绘', '3:4画幅', '杂志封面', '留白艺术'],
    author: 'EditorialPress',
    isFavorite: true,
    copyCount: 2680,
    createdAt: '2025-02-28',
    updatedAt: '2025-02-28',
  },
]
