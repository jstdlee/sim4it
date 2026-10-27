import { computed, reactive, watch } from "vue"
import type { DomainId } from "../../shared/types"

export type PersonaId = "J" | "S" | "T" | "D"
export type SubjectId = "options" | "director" | "comics" | "trading"

export interface SubjectCollection {
  id: SubjectId
  code: string
  brand: string
  titleZh: string
  titleEn: string
  sciFiDeck: string
  accent: string
  accentSoft: string
  icon: string
  mascotFolder: "fox" | "hikari"
  mascotPose: "study" | "director" | "point" | "think" | "smile"
  summary: string
  stats: string[]
  primaryHref: string
  isExternalPath?: boolean
  domain?: DomainId
  quickLinks: { label: string; href: string; icon: string; external?: boolean }[]
}

export interface PersonaProfile {
  id: PersonaId
  code: string
  codename: string
  titleZh: string
  titleEn: string
  divisionZh: string
  sectorCode: string
  tagline: string
  researchFocus: string[]
  accent: string
  accentSoft: string
  icon: string
  mascotFolder: "fox" | "hikari"
  mascotPose: "study" | "director" | "think" | "smile"
  defaultDomain: DomainId
  defaultSubjects: SubjectId[]
}

export const SUBJECT_COLLECTIONS: Record<SubjectId, SubjectCollection> = {
  options: {
    id: "options",
    code: "SUBJ-01 // OPTIONS",
    brand: "Sim4Options",
    titleZh: "期权与波动率博弈",
    titleEn: "Options & Volatility Convexity",
    sciFiDeck: "STOCHASTIC CONVEXITY LAB · 期权定价与希腊字母实训",
    accent: "#e85d2a",
    accentSoft: "#fff3e4",
    icon: "fa-chart-line",
    mascotFolder: "fox",
    mascotPose: "study",
    summary: "7 阶闯关（420 题）、15 大分类 130 张中英日三语期权知识卡、100 个真实历史崩盘/财报时刻、Black-Scholes 与 Greeks 损益沙盘。",
    stats: ["7 阶闯关 · 420 题", "130 张三语知识卡", "100 个真实市场时刻", "BS 损益与希腊字母沙盘"],
    primaryHref: "/journey?domain=options",
    domain: "options",
    quickLinks: [
      { label: "7 阶闯关 Journey", href: "/journey?domain=options", icon: "fa-route" },
      { label: "130 知识闪卡", href: "/cards?domain=options", icon: "fa-layer-group" },
      { label: "100 市场时刻", href: "/moments", icon: "fa-bolt" },
      { label: "BS 损益实验室", href: "/sim?domain=options", icon: "fa-sliders" },
      { label: "概念拓扑图", href: "/map?domain=options", icon: "fa-diagram-project" },
    ],
  },
  director: {
    id: "director",
    code: "SUBJ-02 // DIRECTOR",
    brand: "Sim4Director",
    titleZh: "导演调度与视听场域",
    titleEn: "Cinema Staging & Optical Field",
    sciFiDeck: "HOLODECK MISE-EN-SCÈNE CORE · 镜头语言与片场调度实训",
    accent: "#0f766e",
    accentSoft: "#e6f7f4",
    icon: "fa-clapperboard",
    mascotFolder: "hikari",
    mascotPose: "director",
    summary: "8 阶导演主线（570 题）、16 大分类 341 张中英日三语影视卡、102 个经典电影与动画名场面拆解、35mm 光学焦段与 24fps 律表实验室。",
    stats: ["8 阶闯关 · 570 题", "341 张三语影视卡", "102 个经典名场面", "光学焦段与律表实验室"],
    primaryHref: "/journey?domain=director",
    domain: "director",
    quickLinks: [
      { label: "8 阶闯关 Journey", href: "/journey?domain=director", icon: "fa-route" },
      { label: "341 三语卡片", href: "/cards?domain=director", icon: "fa-layer-group" },
      { label: "102 经典名场面", href: "/scenes?domain=director", icon: "fa-film" },
      { label: "光学与律表实验室", href: "/sim?domain=director", icon: "fa-sliders" },
      { label: "概念拓扑图", href: "/map?domain=director", icon: "fa-diagram-project" },
    ],
  },
  comics: {
    id: "comics",
    code: "SUBJ-03 // COMICS",
    brand: "Sim4Comics",
    titleZh: "漫画分镜与 JEV 决策工程",
    titleEn: "Sequential Art, Masters & JEV Engine",
    sciFiDeck: "CHRONO-PANEL & JEV COMPILER · 漫画大师分镜与 JEV 14 因子引擎",
    accent: "#6d28d9",
    accentSoft: "#f3e8ff",
    icon: "fa-book-open-reader",
    mascotFolder: "fox",
    mascotPose: "point",
    summary: "7 阶漫画分镜主线、Scott McCloud 6 类转场、手塚/鸟山明/井上雄彦/大友克洋/浦泽直树大师技法、JEV 14 因子自动切分与 tldraw-manga 三层画布沙盘。",
    stats: ["7 阶漫画分镜闯关", "大师技法与转场闪卡", "经典漫画分镜案例", "JEV 14 因子切分沙盘"],
    primaryHref: "/journey?domain=comics",
    domain: "comics",
    quickLinks: [
      { label: "7 阶闯关 Journey", href: "/journey?domain=comics", icon: "fa-route" },
      { label: "漫画与 JEV 闪卡", href: "/cards?domain=comics", icon: "fa-layer-group" },
      { label: "大师分镜案例", href: "/scenes?domain=comics", icon: "fa-film" },
      { label: "JEV 分镜沙盘", href: "/sim?domain=comics", icon: "fa-sliders" },
      { label: "概念拓扑图", href: "/map?domain=comics", icon: "fa-diagram-project" },
    ],
  },
  trading: {
    id: "trading",
    code: "SUBJ-04 // TRADING",
    brand: "交易入道",
    titleZh: "交易入道 · 概念与实操手册",
    titleEn: "Trading Mastery & Fractal System",
    sciFiDeck: "QUANTUM EXECUTION & RUDAO CODEX · 25 章实战手册与五路分兵庙算台",
    accent: "#b45309",
    accentSoft: "#fef3c7",
    icon: "fa-compass-drafting",
    mascotFolder: "hikari",
    mascotPose: "think",
    summary: "25 章系统化交易入道全书（期望值、海龟法则、利弗莫尔关键点、威科夫量价、10 倍分形系统）、五路分兵庙算台、Jesse 交易圣经语录与百张实战卡片。",
    stats: ["25 章实战全书阅读器", "105 张实战知识卡片", "五路分兵仓位庙算台", "Jesse 交易圣经语录"],
    primaryHref: "/rudao",
    isExternalPath: true,
    quickLinks: [
      { label: "进入《交易入道》全书 (25章)", href: "/rudao", icon: "fa-book-open", external: true },
      { label: "期权与波动率沙盘", href: "/sim?domain=options", icon: "fa-chart-line" },
      { label: "100 历史市场时刻", href: "/moments", icon: "fa-bolt" },
    ],
  },
}

export const SUBJECT_LIST: SubjectCollection[] = [
  SUBJECT_COLLECTIONS.options,
  SUBJECT_COLLECTIONS.director,
  SUBJECT_COLLECTIONS.comics,
  SUBJECT_COLLECTIONS.trading,
]

export const PERSONAS: Record<PersonaId, PersonaProfile> = {
  J: {
    id: "J",
    code: "PERSONA // J",
    codename: "JOVIAN OBSERVER",
    titleZh: "木星观测者",
    titleEn: "Probability & Convexity Strategist",
    divisionZh: "概率曲率与实战博弈研习所",
    sectorCode: "SECTOR-J01",
    tagline: "聚焦非线性赔率、期权希腊字母曲面与 10 倍分形交易系统。",
    researchFocus: ["期权波动率与 Greeks", "概率期望值与凯利公式", "10 倍分形交易体系"],
    accent: "#e85d2a",
    accentSoft: "#fff3e4",
    icon: "fa-satellite-dish",
    mascotFolder: "fox",
    mascotPose: "study",
    defaultDomain: "options",
    defaultSubjects: ["options", "trading"],
  },
  S: {
    id: "S",
    code: "PERSONA // S",
    codename: "SOLARIS ARCHITECT",
    titleZh: "索拉里斯架构师",
    titleEn: "Mise-en-Scène & Optical Field Director",
    divisionZh: "视听场域与时空叙事工坊",
    sectorCode: "SECTOR-S02",
    tagline: "聚焦 35mm 光学焦段、场面调度、180° 轴线法则与漫画大师视觉叙事。",
    researchFocus: ["35mm 焦段与景深几何", "场面调度与轴线法则", "大师蒙太奇与分镜语言"],
    accent: "#0f766e",
    accentSoft: "#e6f7f4",
    icon: "fa-film",
    mascotFolder: "hikari",
    mascotPose: "director",
    defaultDomain: "director",
    defaultSubjects: ["director", "comics"],
  },
  T: {
    id: "T",
    code: "PERSONA // T",
    codename: "TACHYON CHRONO-SCRIBE",
    titleZh: "快子时序书记官",
    titleEn: "Sequential Rhythm & JEV Decision Engineer",
    divisionZh: "分镜拓扑与 JEV 决策编译中心",
    sectorCode: "SECTOR-T03",
    tagline: "聚焦漫画格间留白（Closure）、视线引力流与 JEV 14 因子分镜自动切分。",
    researchFocus: ["McCloud 6 类格间转场", "JEV 14 因子脚本切分", "tldraw-manga 三层画布"],
    accent: "#6d28d9",
    accentSoft: "#f3e8ff",
    icon: "fa-wand-magic-sparkles",
    mascotFolder: "fox",
    mascotPose: "think",
    defaultDomain: "comics",
    defaultSubjects: ["comics", "director"],
  },
  D: {
    id: "D",
    code: "PERSONA // D",
    codename: "DYSON NAVIGATOR",
    titleZh: "戴森全域领航员",
    titleEn: "Cross-Domain Polymath & System Integrator",
    divisionZh: "全域交叉模型与第一性原理中枢",
    sectorCode: "SECTOR-D04",
    tagline: "打通期权博弈、交易入道、导演调度与漫画分镜四大课题的跨学科特种领航员。",
    researchFocus: ["跨学科第一性原理", "不确定性博弈与叙事张力", "四大课题全栈融通"],
    accent: "#b45309",
    accentSoft: "#fef3c7",
    icon: "fa-compass",
    mascotFolder: "hikari",
    mascotPose: "smile",
    defaultDomain: "options",
    defaultSubjects: ["options", "director", "comics", "trading"],
  },
}

export const PERSONA_LIST: PersonaProfile[] = [PERSONAS.J, PERSONAS.S, PERSONAS.T, PERSONAS.D]

const STORAGE_KEY = "sim4it.nexus.v3"

interface NexusState {
  activePersona: PersonaId | null
  subjectsByPersona: Record<PersonaId, SubjectId[]>
}

function loadInitialState(): NexusState {
  const fallback: NexusState = {
    activePersona: null,
    subjectsByPersona: {
      J: [...PERSONAS.J.defaultSubjects],
      S: [...PERSONAS.S.defaultSubjects],
      T: [...PERSONAS.T.defaultSubjects],
      D: [...PERSONAS.D.defaultSubjects],
    },
  }
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    const validIds: PersonaId[] = ["J", "S", "T", "D"]
    const validSubjs: SubjectId[] = ["options", "director", "comics", "trading"]
    const active = validIds.includes(parsed?.activePersona) ? (parsed.activePersona as PersonaId) : null
    const map: Record<PersonaId, SubjectId[]> = { ...fallback.subjectsByPersona }
    for (const pid of validIds) {
      if (Array.isArray(parsed?.subjectsByPersona?.[pid])) {
        const filtered = parsed.subjectsByPersona[pid].filter((x: any) => validSubjs.includes(x))
        map[pid] = filtered
      }
    }
    return { activePersona: active, subjectsByPersona: map }
  } catch {
    return fallback
  }
}

const state = reactive<NexusState>(loadInitialState())

watch(
  state,
  (val) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      } catch {
        // ignore storage quota errors
      }
    }
  },
  { deep: true }
)

export function usePersonaNexus() {
  const currentPersonaId = computed<PersonaId>(() => state.activePersona ?? "J")
  const activePersona = computed<PersonaProfile>(() => PERSONAS[currentPersonaId.value])

  const activeSubjectIds = computed<SubjectId[]>(() => state.subjectsByPersona[currentPersonaId.value] ?? [])
  const activeSubjects = computed<SubjectCollection[]>(() =>
    SUBJECT_LIST.filter((s) => activeSubjectIds.value.includes(s.id))
  )

  function getPersonaProfile(pid: PersonaId): PersonaProfile {
    return PERSONAS[pid]
  }

  function setPersona(pid: PersonaId) {
    state.activePersona = pid
  }

  function clearActivePersona() {
    state.activePersona = null
  }

  function hasSubject(sid: SubjectId, pid: PersonaId = currentPersonaId.value): boolean {
    return (state.subjectsByPersona[pid] ?? []).includes(sid)
  }

  function toggleSubject(sid: SubjectId, pid: PersonaId = currentPersonaId.value) {
    const list = [...(state.subjectsByPersona[pid] ?? [])]
    const idx = list.indexOf(sid)
    if (idx >= 0) {
      list.splice(idx, 1)
    } else {
      list.push(sid)
    }
    state.subjectsByPersona[pid] = list
  }

  function setSubjectsForPersona(sids: SubjectId[], pid: PersonaId = currentPersonaId.value) {
    state.subjectsByPersona[pid] = [...sids]
  }

  function resetPersonaSubjects(pid: PersonaId = currentPersonaId.value) {
    state.subjectsByPersona[pid] = [...PERSONAS[pid].defaultSubjects]
  }

  return {
    state,
    currentPersonaId,
    activePersona,
    activeSubjectIds,
    activeSubjects,
    getPersonaProfile,
    setPersona,
    clearActivePersona,
    hasSubject,
    toggleSubject,
    setSubjectsForPersona,
    resetPersonaSubjects,
  }
}
