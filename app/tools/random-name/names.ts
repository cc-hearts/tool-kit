/** 沙雕网名词库与生成逻辑：模板拼装保证语法通顺，槽位随机保证组合量，全部纯本地随机 */

export function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]!
}

/* ---------- 中文沙雕网名 ---------- */

export type ChineseSeries = 'random' | 'food' | 'lazy' | 'animal' | 'absurd'

export const chineseSeriesOptions: Array<{ label: string, value: ChineseSeries }> = [
  { label: '随机', value: 'random' },
  { label: '吃货系', value: 'food' },
  { label: '摆烂系', value: 'lazy' },
  { label: '动物系', value: 'animal' },
  { label: '无厘头', value: 'absurd' },
]

const FOODS = ['奶茶', '火锅', '烧烤', '螺蛳粉', '麻辣烫', '小饼干', '薯片', '炸鸡', '辣条', '冰可乐', '小蛋糕', '关东煮']
const FOOD_TITLES = ['狂魔', '特种兵', '鉴定大师', '战略研究员', '头号粉丝', '守门员', '代言人', '品控总监']
const HATED_FOODS = ['香菜', '芹菜', '胡萝卜', '苦瓜', '折耳根']

const LAZY_VERBS = ['摸鱼', '躺平', '摆烂', '划水', '熬夜', '赖床', '发呆', '装忙', '咕咕', '磨洋工']
const DEBATE_OBJECTS = ['退堂鼓', '抬杠', '甩锅', '装傻', '起哄', '打岔']
const PERFORMER_TITLES = ['一级演奏家', '一级运动员', '表演艺术家', '非遗传承人', '十级学者']
const PAID_ACTIVITIES = ['思考人生', '发呆', '神游', '喝水', '巡视工位']

const ANIMALS = ['小海豹', '卡皮巴拉', '仓鼠', '咸鱼', '土拨鼠', '企鹅', '柴犬', '熊猫', '水獭', '橘猫']
const ANIMAL_ADJS = ['社恐的', '快乐的', '疲惫的', '圆圆的', '很闲的', '偷偷干饭的', '不想上班的', '刚睡醒的']
const ANIMAL_TITLES = ['保护协会会长', '形象大使', '首席观察员', '资深饲养员', '在编选手']
/** 用于「X本X」叠字梗的两字动物，末字须可重复 */
const REPEATABLE_ANIMALS = ['咸鱼', '猫猫', '鸭鸭', '兔兔', '柴犬', '仓鼠', '企鹅', '水豚']

const ABSURD_ADJS = ['不会飞的', '会魔法的', '失眠的', '秃头的', '迷路的', '充话费送的', '隔壁的', '从童话书里跑出来的']
const ABSURD_NOUNS = ['超人', '魔法师', '外星人', '气球', '仙人掌', '枕头', 'WiFi', '奥特曼', '皮卡丘']
const ESCAPED_ROLES = ['公主', '王子', '奥特曼', '美少女', '打工人', '保安', '巡逻队长']
const WEIGHTS = ['三', '八', '十八', '两百', '五百']
const HEAVY_THINGS = ['橘猫', '仓鼠', '外卖', '作业', '行李箱', '被窝']

const foodTemplates: Array<() => string> = [
  () => `${pick(FOODS)}${pick(FOOD_TITLES)}`,
  () => `深夜${pick(FOODS)}押运员`,
  () => `一口一个${pick(FOODS)}`,
  () => `打死不吃${pick(HATED_FOODS)}`,
  () => `${pick(FOODS)}世界冠军`,
]

const lazyTemplates: Array<() => string> = [
  () => `资深${pick(LAZY_VERBS)}员`,
  () => `${pick(LAZY_VERBS)}十级选手`,
  () => `${pick(LAZY_VERBS)}冠军`,
  () => `今天也在${pick(LAZY_VERBS)}`,
  () => `${pick(DEBATE_OBJECTS)}${pick(PERFORMER_TITLES)}`,
  () => `带薪${pick(PAID_ACTIVITIES)}`,
]

const animalTemplates: Array<() => string> = [
  () => `一只${pick(ANIMAL_ADJS)}${pick(ANIMALS)}`,
  () => {
    const animal = pick(REPEATABLE_ANIMALS)
    return `${animal}本${animal[animal.length - 1]}`
  },
  () => `${pick(ANIMALS)}${pick(ANIMAL_TITLES)}`,
]

const absurdTemplates: Array<() => string> = [
  () => `${pick(ABSURD_ADJS)}${pick(ABSURD_NOUNS)}`,
  () => `在逃${pick(ESCAPED_ROLES)}`,
  () => `${pick(WEIGHTS)}斤的${pick(HEAVY_THINGS)}`,
  () => `全网最${pick(['靓', '闲', '菜', '能睡'])}${pick(['的崽', '的人'])}`,
]

const chineseSeriesTemplates: Record<Exclude<ChineseSeries, 'random'>, Array<() => string>> = {
  food: foodTemplates,
  lazy: lazyTemplates,
  animal: animalTemplates,
  absurd: absurdTemplates,
}

export function generateFunnyChineseName(series: ChineseSeries) {
  if (series === 'random')
    return pick(Object.values(chineseSeriesTemplates).flat())()
  return pick(chineseSeriesTemplates[series])()
}

/* ---------- 英文搞笑网名 ---------- */

export type EnglishSeries = 'random' | 'tech' | 'title' | 'self'

export const englishSeriesOptions: Array<{ label: string, value: EnglishSeries }> = [
  { label: '随机', value: 'random' },
  { label: '技术梗', value: 'tech' },
  { label: '头衔梗', value: 'title' },
  { label: '自嘲梗', value: 'self' },
]

/** 英文网名导出格式 */
export type EnglishFormat = 'camel' | 'snake'

const TECH_PUNS = [
  'CtrlAltDefeat', 'Error404NameNotFound', 'SudoMakeMeSandwich', 'CacheMeOutside',
  'WifiAndChill', 'PingMeMaybe', 'GlitchGoblin', 'DebuggingDuck',
]

const techTemplates: Array<() => string> = [
  () => pick(TECH_PUNS),
  () => `${pick(['Wifi', 'Coffee', 'Code', 'Ramen', 'Meme'])}AndChill`,
  () => `404${pick(['Motivation', 'Vibes', 'Name', 'Sleep'])}NotFound`,
]

const titleTemplates: Array<() => string> = [
  () => `Chief${pick(['Nap', 'Snack', 'Chaos', 'Vibes', 'Meme', 'Coffee'])}Officer`,
  () => `PartTime${pick(['Potato', 'Ninja', 'Wizard', 'Dinosaur', 'Astronaut', 'Detective', 'Mermaid'])}`,
  () => `Certified${pick(['Overthinker', 'Snacker', 'Yapper', 'NightOwl', 'CouchPotato'])}`,
  () => `Professional${pick(['Cat', 'Cloud', 'Ceiling', 'Drama', 'Fridge'])}Watcher`,
  () => `${pick(['Snack', 'Nap', 'Blanket', 'Sock', 'Meme'])}Overlord`,
  () => `${pick(['Adult', 'Wizard', 'Ninja', 'Hero', 'Chef'])}InTraining`,
  () => `Deputy${pick(['Vibes', 'Snacks', 'Chaos'])}Manager`,
]

const SELF_PUNS = [
  'Procrastin8or', 'BarelyFunctioning', 'SleepIsForTheWeak', 'NoThoughtsHeadEmpty',
  'JustVibing', 'MentallyAtHome', 'GymTomorrow', 'SnoozeButtonChampion',
  'DramaLlama', 'WorldsOkayestGamer',
]

const selfTemplates: Array<() => string> = [
  () => pick(SELF_PUNS),
  () => `Sir${pick(['Lags', 'Naps', 'Snacks', 'Chats', 'Slouches'])}ALot`,
  () => `PoweredBy${pick(['Caffeine', 'Snacks', 'Spite', 'Naps'])}`,
  () => `RunningOn${pick(['Caffeine', 'Vibes', 'Snacks', 'Empty'])}`,
]

const englishSeriesTemplates: Record<Exclude<EnglishSeries, 'random'>, Array<() => string>> = {
  tech: techTemplates,
  title: titleTemplates,
  self: selfTemplates,
}

export function generateFunnyEnglishName(series: EnglishSeries) {
  if (series === 'random')
    return pick(Object.values(englishSeriesTemplates).flat())()
  return pick(englishSeriesTemplates[series])()
}

/** 大驼峰转 snake_case：Error404NameNotFound → error_404_name_not_found */
export function toSnakeCase(name: string) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .toLowerCase()
    .replace(/[\s']+/g, '_')
}

export interface FunnyNameOptions {
  digits: boolean
}

function withDigits(name: string, options: FunnyNameOptions) {
  if (!options.digits)
    return name
  return `${name}${Math.floor(Math.random() * 90) + 10}`
}

export function generateFunnyName(
  language: 'chinese' | 'english',
  series: ChineseSeries | EnglishSeries,
  options: FunnyNameOptions,
  format: EnglishFormat,
) {
  if (language === 'chinese')
    return generateFunnyChineseName(series as ChineseSeries)

  const name = generateFunnyEnglishName(series as EnglishSeries)
  return withDigits(format === 'snake' ? toSnakeCase(name) : name, options)
}

/** 批量生成并去重（模板组合足够多，兜底允许重复） */
export function generateBatch(count: number, generate: () => string) {
  const results = new Set<string>()
  let attempts = count * 10
  while (results.size < count && attempts-- > 0)
    results.add(generate())
  return [...results]
}
