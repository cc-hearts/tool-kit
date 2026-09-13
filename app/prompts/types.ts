export type PromptCategory =
  | 'all'
  | 'commercial'   // 商业海报 / 独立出版
  | 'realistic'    // 真实摄影 / 纪实胶片
  | 'anime'        // 二次元 / 唯美日漫
  | 'cyberpunk'    // 赛博朋克 / 未来概念
  | '3d'           // 3D潮玩 / 粘土盲盒
  | 'architecture' // 空间建筑 / 侘寂室内
  | 'ui'           // UI界面 / 拟态图标
  | 'character'    // 角色原画 / 史诗奇幻
  | 'text'         // 商业文案 / 营销策划

export type ModelType =
  | 'Midjourney v6.1'
  | 'Flux.1 Schnell'
  | 'Flux.1 Dev'
  | 'SDXL 1.0'
  | 'DALL-E 3'
  | 'Stable Diffusion 3.5'
  | 'Claude / GPT-4o'

export interface PromptVariable {
  /** 变量标识，对应 Prompt 中的 {key} 占位符 */
  key: string
  /** 变量中文名称，如 "上半部摄影主体" */
  label: string
  /** 默认填充值 */
  defaultValue: string
  /** 常用备选项快捷点选 */
  options?: string[]
  /** 变量用途说明 */
  description?: string
}

export interface PromptParameters {
  /** 画幅宽高比，如 "3:4", "16:9", "1:1" */
  aspectRatio?: string
  /** 模型版本标识，如 "--v 6.1" */
  model?: string
  /** 风格化自由度，如 "180", "250" */
  stylize?: string
  /** 混乱度/随机度 */
  chaos?: string
  /** 随机种子 */
  seed?: string
  /** 采样器算法，如 "Euler a", "DPM++ 2M Karras" */
  sampler?: string
  /** 采样迭代步数 */
  steps?: number
  /** 提示词相关性权重 CFG Scale */
  cfgScale?: number
  /** 负向提示词 */
  negativePrompt?: string
}

export interface PromptItem {
  id: string
  /** 标题 */
  title: string
  /** 一句话描述与效果建议 */
  description: string
  /** 分类标识 */
  category: PromptCategory
  /** 适用或调优的主力 AI 模型 */
  model: ModelType
  /** 核心正面提示词（支持 {variable} 动态变量插槽） */
  prompt: string
  /** 负向/反向提示词（可选） */
  negativePrompt?: string
  /** 结构化生图参数 */
  parameters: PromptParameters
  /** 变量定义清单 */
  variables: PromptVariable[]
  /** 效果样例图 URL 数组 */
  previewImages: string[]
  /** 标签列表 */
  tags: string[]
  /** 作者或出处标识 */
  author?: string
  /** 是否收藏 */
  isFavorite: boolean
  /** 复制使用次数 */
  copyCount: number
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

export interface PromptCategoryMeta {
  key: PromptCategory
  label: string
  description?: string
}
