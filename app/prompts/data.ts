import type { PromptItem } from './types'

const EDITORIAL_SPLIT_PROMPT = `Create a high-end independent editorial art poster in a strict 3:4 vertical composition, divided horizontally into two exactly equal sections (50% / 50%).

**TOP HALF — ORIGINAL PHOTOGRAPH (50%)**

Use the provided reference photograph as the exact photographic source.

Preserve the original scene, composition, subject placement, perspective, atmosphere, natural lighting, and photographic details.

Do not replace, redesign, or invent any elements in the photograph.

Authentic editorial photography, natural atmospheric lighting, subtle cinematic color grading, realistic textures, refined and timeless visual storytelling.

**BOTTOM HALF — MINIMALIST HAND-DRAWN INTERPRETATION (50%)**

Create a minimalist hand-drawn illustration that directly interprets the exact same scene shown in the photograph above.

CRITICAL REFERENCE CONSISTENCY:
- Extract visual elements ONLY from the reference photograph.
- Reinterpret the original landscape, objects, vegetation, architecture, water, mountains, sky, and natural elements.
- Every illustrated object must have a corresponding visual reference in the original photograph.
- Do NOT introduce cats, dogs, birds, people, fictional characters, additional buildings, or any unrelated objects unless they are clearly visible in the reference photograph.
- Do NOT invent a new story or alter the original scene.
- Maintain recognizable visual continuity between the top and bottom sections.

**ILLUSTRATION STYLE**

Render on warm off-white textured archival paper with subtle natural fibers and a handmade book-cover aesthetic.

Use delicate imperfect hand-drawn lines, minimalist shapes, bold but restrained flat acrylic color blocks, handmade brush marks, and subtle organic textures.

Limit the palette to 4 harmonious colors extracted from the original photograph.

The illustration should occupy only 15–25% of the bottom section, surrounded by generous negative space.

**TYPOGRAPHY**

Place a small, elegant, letter-spaced editorial title near the upper center of the bottom section.

Use the title: "{typography}"

Typography should be understated, refined, and harmonious with the artwork.

**ART DIRECTION**

Quiet, poetic, contemplative, sophisticated, minimalist, contemporary independent art-book publication.

Strong visual hierarchy, balanced composition, delicate paper texture, museum-quality editorial design.

**STRICT CONSTRAINTS**

No extra characters or animals.
No unrelated decorative elements.
No random objects.
No additional scenery.
No changes to the original photographic scene.
No photorealistic elements in the illustration section.
No excessive text or slogans.

The final result must feel like a carefully designed collectible art-book cover, with the photograph and illustration telling exactly the same visual story.`

export const INITIAL_PROMPTS: PromptItem[] = [
  {
    id: 'prompt-editorial-split',
    title: '3:4 独立艺术刊物双拼海报 (摄影与极简手绘诗)',
    description: '以提供的参考照片为唯一视觉来源：上半区 50% 保留原图真实摄影与自然光感，下半区 50% 将同一场景重绘为暖白纸张极简手绘，4 色克制、大量留白。',
    category: 'commercial',
    model: 'Claude / GPT-4o',
    prompt: EDITORIAL_SPLIT_PROMPT,
    negativePrompt: 'extra people, cats, dogs, birds, invented objects, unrelated scenery, photorealistic illustration, glossy rendering, busy composition, excessive text, slogans, uneven split, collage',
    parameters: {
      aspectRatio: '3:4',
    },
    variables: [
      {
        key: 'typography',
        label: '极简刊物排版字样',
        defaultValue: 'Quiet Days',
        options: [
          'Quiet Days',
          'SOLITUDE / ISSUE 04',
          'THE CRAFTSMAN · 2025',
          'SILENT LANDSCAPE',
          'EPISODE I · AUTUMN',
        ],
        description: '下半区留白区上方点缀的小号字距刊物标题',
      },
    ],
    previewImages: [
      '/img/prompts/editorial-split.webp',
    ],
    tags: ['独立出版', '双拼海报', '极简手绘', '参考图生图', '3:4画幅', '留白艺术'],
    author: 'EditorialPress',
    isFavorite: true,
    copyCount: 2680,
    createdAt: '2025-02-28',
    updatedAt: '2026-11-01',
  },
]
