import type { DomainId, Question, Term, Category, Level, Moment, Scene, SourceGroup } from '../../shared/types'
import * as optionsPack from '../../content/options'
import * as directorPack from '../../content/director'
import * as comicsPack from '../../content/comics'

export interface DomainPack {
  id: DomainId
  slug: string
  brand: string
  icon: string
  badge: string
  title: string
  zhTitle: string
  jaTitle: string
  subtitle: string
  zhSubtitle: string
  description: string
  accent: string
  secondaryAccent: string
  mascot: {
    name: string
    zh: string
    ja: string
    role: string
    dir: 'fox' | 'hikari'
    avatar: string
  }
  labLabel: string
  labZhLabel: string
  casesLabel: string
  casesZhLabel: string
  levels: Level[]
  bank: Record<number, Question[]>
  allQuestions: Question[]
  totalQuestions: number
  terms: Term[]
  termMap: Record<string, Term>
  cats: Category[]
  catMap: Record<string, Category>
  allTags: string[]
  termWeight: Record<string, number>
  moments?: Moment[]
  scenes?: Scene[]
  sources?: SourceGroup[]
  explore?: string[]
  highlights: string[]
}

function normalizeBank(rawBank: Record<number, Question[]> | Question[], levels: Level[]): {
  bank: Record<number, Question[]>
  allQuestions: Question[]
} {
  if (Array.isArray(rawBank)) {
    const grouped: Record<number, Question[]> = {}
    for (const lv of levels) grouped[lv.n] = []
    for (const q of rawBank) {
      if (!grouped[q.level]) grouped[q.level] = []
      grouped[q.level].push(q)
    }
    return { bank: grouped, allQuestions: rawBank }
  }
  const allQuestions = Object.values(rawBank).flat()
  return { bank: rawBank, allQuestions }
}

function computeWeights(allQuestions: Question[], terms: Term[], moments?: Moment[], scenes?: Scene[]): Record<string, number> {
  const w: Record<string, number> = {}
  for (const q of allQuestions) for (const t of q.terms) w[t] = (w[t] ?? 0) + 1
  if (moments) for (const m of moments) for (const t of m.terms) w[t] = (w[t] ?? 0) + 2
  if (scenes) for (const s of scenes) for (const t of s.terms) w[t] = (w[t] ?? 0) + 2
  for (const t of terms) for (const r of t.related) w[r] = (w[r] ?? 0) + 0.5
  return w
}

const optNorm = normalizeBank(optionsPack.buildBank(), optionsPack.LEVELS)
const dirNorm = normalizeBank(directorPack.buildBank(), directorPack.LEVELS)
const comNorm = normalizeBank(comicsPack.buildBank(), comicsPack.LEVELS)

export const DOMAINS: Record<DomainId, DomainPack> = {
  options: {
    id: 'options',
    slug: 'options',
    brand: 'Sim4Options',
    icon: 'fa-chart-line',
    badge: 'OPTIONS · VOLATILITY · GREEKS',
    title: 'Options Decision Craft',
    zhTitle: '期权决策实战',
    jaTitle: 'オプション意思決定実践',
    subtitle: '420 decision quests · 130 terms · 100 market moments · Black-Scholes Lab',
    zhSubtitle: '7阶闯关 · 420道实战推演 · 130个核心概念 · 100个历史高光时刻 · BS定价与Greeks实验室',
    description: 'Master payoffs, implied volatility, Greeks, multi-leg spreads, income wheels, and tail-risk hedging through interactive manga-style decision quests.',
    accent: '#ff5a1f',
    secondaryAccent: '#0e8c83',
    mascot: {
      name: 'Kon',
      zh: '小狐狸 Kon',
      ja: 'コン',
      role: 'Options Desk Mentor',
      dir: 'fox',
      avatar: '/fox/head.webp',
    },
    labLabel: 'BS Simulator',
    labZhLabel: '期权模拟器',
    casesLabel: '100 Moments',
    casesZhLabel: '100 实战时刻',
    levels: optionsPack.LEVELS,
    bank: optNorm.bank,
    allQuestions: optNorm.allQuestions,
    totalQuestions: optNorm.allQuestions.length,
    terms: optionsPack.TERMS,
    termMap: optionsPack.TERM_MAP,
    cats: optionsPack.CATS,
    catMap: optionsPack.CAT_MAP,
    allTags: Array.from(new Set(optionsPack.TERMS.flatMap((t) => t.tags))).sort(),
    termWeight: computeWeights(optNorm.allQuestions, optionsPack.TERMS, optionsPack.MOMENTS),
    moments: optionsPack.MOMENTS,
    highlights: [
      '7 Progressive Levels (Payoffs → Volatility → Greeks → Spreads → Tail Risk)',
      '100 Famous Market Moments & Crashes (1987 Black Monday to 0DTE Gamma Squeezes)',
      'Interactive Black-Scholes Payoff & Greeks Surface Simulator + 《交易入道》 Handbook',
    ],
  },

  director: {
    id: 'director',
    slug: 'director',
    brand: 'Sim4Director',
    icon: 'fa-video',
    badge: 'CINEMA · STAGING · ANIMATION · UE5',
    title: 'Director & Visual Staging',
    zhTitle: '导演调度与视听语言',
    jaTitle: '映像演出・カメラ・アニメーション',
    subtitle: '570 decision quests · 341 trilingual terms · 102 virtual scenes · Optical & Timing Lab',
    zhSubtitle: '8阶导演课 · 570道视听推演 · 341个中英日术语 · 102个虚拟片场 · 光学与动画节奏实验室',
    description: 'From 35mm optical focal math, 3-point lighting, and 180° blocking to Sakuga timing charts, Kuleshov montage, and Unreal Engine 5 Sequencer.',
    accent: '#0e8c83',
    secondaryAccent: '#f2840f',
    mascot: {
      name: 'Hikari',
      zh: '星野光 Hikari',
      ja: '星野ヒカリ',
      role: 'Animation & Film Director',
      dir: 'hikari',
      avatar: '/hikari/head.webp',
    },
    labLabel: 'Optics & Timing Lab',
    labZhLabel: '镜头与律表实验室',
    casesLabel: '102 Scenes',
    casesZhLabel: '102 虚拟片场',
    levels: directorPack.LEVELS,
    bank: dirNorm.bank,
    allQuestions: dirNorm.allQuestions,
    totalQuestions: dirNorm.allQuestions.length,
    terms: directorPack.TERMS,
    termMap: directorPack.TERM_MAP,
    cats: directorPack.CATS,
    catMap: directorPack.CAT_MAP,
    allTags: Array.from(new Set(directorPack.TERMS.flatMap((t) => t.tags))).sort(),
    termWeight: computeWeights(dirNorm.allQuestions, directorPack.TERMS, undefined, directorPack.SCENES),
    scenes: directorPack.SCENES,
    sources: directorPack.SOURCES,
    explore: directorPack.EXPLORE,
    highlights: [
      '8 Levels across 16 Pillars (Camera, Lenses, Lighting, Blocking, Editing, 12 Principles, Anime Sakuga, UE5)',
      '102 Interactive Virtual Set Scenes with Multi-Checkpoint Director Verdicts',
      'Live 35mm Optical FOV/DOF Calculator + 24fps Sakuga Bouncing-Ball Timesheet Lab',
    ],
  },

  comics: {
    id: 'comics',
    slug: 'comics',
    brand: 'Sim4Comics',
    icon: 'fa-pen-nib',
    badge: 'MANGA · MCCLOUD · JEV 14-FACTOR · TLDRAW-MANGA',
    title: 'Manga Storyboard & JEV Decision Craft',
    zhTitle: '漫画分镜与 JEV 决策工程',
    jaTitle: 'マンガ分鏡・巨匠技法・JEV意思決定',
    subtitle: '420 decision quests · 88 trilingual terms · 6 studio cases · Koma & JEV Polling Lab',
    zhSubtitle: '7阶分镜课 · 420道分镜推演 · 麦克劳德诗学 · 五大巨匠技法 · JEV 14维切分与 tldraw-manga 实验室',
    description: 'Synthesizing Scott McCloud’s comic poetics, Tezuka/Toriyama/Inoue/Otomo/Urasawa master techniques, the JEV 14-Factor 5-Pass Polling Engine, and tldraw-manga’s 3-tier polygon studio.',
    accent: '#c84b31',
    secondaryAccent: '#5b8def',
    mascot: {
      name: 'Sensei Sumi',
      zh: '墨老师 Sumi',
      ja: '墨先生（スミ）',
      role: 'Manga Storyboard & JEV Architect',
      dir: 'fox',
      avatar: '/fox/study.webp',
    },
    labLabel: 'Koma & JEV Lab',
    labZhLabel: '分镜与JEV实验室',
    casesLabel: 'Studio Cases',
    casesZhLabel: '分镜实战工坊',
    levels: comicsPack.LEVELS,
    bank: comNorm.bank,
    allQuestions: comNorm.allQuestions,
    totalQuestions: comNorm.allQuestions.length,
    terms: comicsPack.TERMS,
    termMap: comicsPack.TERM_MAP,
    cats: comicsPack.CATS,
    catMap: comicsPack.CAT_MAP,
    allTags: Array.from(new Set(comicsPack.TERMS.flatMap((t) => t.tags))).sort(),
    termWeight: computeWeights(comNorm.allQuestions, comicsPack.TERMS, undefined, comicsPack.SCENES),
    scenes: comicsPack.SCENES,
    sources: comicsPack.SOURCES,
    explore: comicsPack.EXPLORE,
    highlights: [
      'Scott McCloud Poetics (Closure [0.45, 0.82], 6 Transitions, Big Triangle, 7 Word-Picture Modes)',
      'Master Manga Craft (Tezuka Montage, Toriyama S-Flow, Inoue Silent Ma, Otomo 3-Point Deep Focus, Urasawa Hiki)',
      'JEV Two-Tier 14-Factor & 5-Pass Polling Funnel + tldraw-manga 3-Tier Polygon & 6-Axis layoutScore Studio',
    ],
  },
}

export const DOMAIN_LIST: DomainPack[] = [DOMAINS.options, DOMAINS.director, DOMAINS.comics]

/** Blueprint registry for upcoming Sim4* knowledge bases so future tracks slot in cleanly */
export interface UpcomingDomainSpec {
  id: string
  brand: string
  icon: string
  title: string
  zhTitle: string
  subtitle: string
  badge: string
  blurb: string
  zhBlurb: string
  pillars: string[]
}

export const UPCOMING_DOMAINS: UpcomingDomainSpec[] = [
  {
    id: 'audio',
    brand: 'Sim4Sound',
    icon: 'fa-wave-square',
    title: 'Acoustic Design & Game Audio',
    zhTitle: '声音设计与交互混音',
    subtitle: 'Foley, Psychoacoustics & Dynamic Mixing',
    badge: 'EXTENSIBLE SLOT · AUDIO',
    blurb: 'Foley layering, psychoacoustics, leitmotif orchestration, and Wwise/FMOD dynamic stems.',
    zhBlurb: '拟音叙事、心理声学、主导动机配器与动态交互混音状态机。',
    pillars: ['Foley & Impulse', 'Dynamic Mixing', 'Spatial HRTF', 'Leitmotif Harmony'],
  },
  {
    id: 'gamedesign',
    brand: 'Sim4Systems',
    icon: 'fa-gamepad',
    title: 'Game Economy & Combat Systems',
    zhTitle: '系统策划与数值战斗',
    subtitle: 'Frame Data, Machinations & JEV Utility AI',
    badge: 'EXTENSIBLE SLOT · SYSTEMS',
    blurb: 'Hitlag frame data, Monte Carlo loot sinks, Elo matchmaking, and JEV utility AI.',
    zhBlurb: '帧数打击感（卡肉/输入缓冲）、蒙特卡洛经济水龙头与 JEV 效用决策树。',
    pillars: ['Frame Data & Hitstop', 'Machinations Sinks', 'Pacing Curves', 'Utility AI'],
  },
]
