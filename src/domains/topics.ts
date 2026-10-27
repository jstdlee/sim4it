import { computed, reactive, watch } from "vue"
import type { DomainId } from "../../shared/types"
import { DOMAINS } from "./registry"

export type PersonaId = "J" | "S" | "T" | "D"
export type SubjectId = "options" | "director" | "comics" | "trading"
export type TopicKind =
  | "level"
  | "cards"
  | "case"
  | "lab"
  | "trading-chapter"
  | "trading-tool"
  | "custom"

export interface MicroTopic {
  id: string
  subject: SubjectId
  kind: TopicKind
  code: string
  title: string
  titleEn: string
  summary: string
  metrics: string
  tags: string[]
  href: string
  isExternalPath?: boolean
  domain?: DomainId
  levelNum?: number
  catId?: string
  isCustom?: boolean
}

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
  summary: string
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
  mascotPose: "study" | "director" | "think" | "thumbs" | "smile" | "cheer"
  defaultDomain: DomainId
  primarySubjects: SubjectId[]
  starterTopicIds: string[]
}

export const SUBJECT_COLLECTIONS: Record<SubjectId, SubjectCollection> = {
  options: {
    id: "options",
    code: "SUBJ-01 // OPTIONS",
    brand: "Sim4Options",
    titleZh: "期权与波动率博弈",
    titleEn: "Options & Volatility Convexity",
    sciFiDeck: "STOCHASTIC CONVEXITY LAB · 随机曲率与期权推演舱",
    accent: "#e85d2a",
    accentSoft: "#fff3e4",
    icon: "fa-chart-line",
    summary: "7 阶闯关（420 题）、8 大分类 130 张期权闪卡、100 个真实历史崩盘/财报时刻、Black-Scholes 与 Greeks 曲面仿真台。",
    primaryHref: "/journey?domain=options",
    domain: "options",
    quickLinks: [
      { label: "7 阶闯关 Journey", href: "/journey?domain=options", icon: "fa-route" },
      { label: "130 知识闪卡", href: "/cards?domain=options", icon: "fa-layer-group" },
      { label: "100 市场时刻", href: "/moments", icon: "fa-bolt" },
      { label: "BS 损益实验室", href: "/sim?domain=options", icon: "fa-sliders" },
      { label: "概念星图", href: "/map?domain=options", icon: "fa-diagram-project" },
    ],
  },
  director: {
    id: "director",
    code: "SUBJ-02 // DIRECTOR",
    brand: "Sim4Director",
    titleZh: "导演调度与视听场域",
    titleEn: "Cinema Staging & Optical Field",
    sciFiDeck: "HOLODECK MISE-EN-SCÈNE CORE · 全息片场与光学调度舱",
    accent: "#0f766e",
    accentSoft: "#e6f7f4",
    icon: "fa-clapperboard",
    summary: "8 阶导演主线（570 题）、16 大分类 341 张中英日三语影视卡、102 个虚拟片场案例、35mm 光学与 24fps 作画律表实验室。",
    primaryHref: "/journey?domain=director",
    domain: "director",
    quickLinks: [
      { label: "8 阶闯关 Journey", href: "/journey?domain=director", icon: "fa-route" },
      { label: "341 三语卡片", href: "/cards?domain=director", icon: "fa-layer-group" },
      { label: "102 虚拟片场", href: "/scenes?domain=director", icon: "fa-film" },
      { label: "光学与作画实验室", href: "/sim?domain=director", icon: "fa-sliders" },
      { label: "造型工坊 Gallery", href: "/gallery", icon: "fa-masks-theater" },
    ],
  },
  comics: {
    id: "comics",
    code: "SUBJ-03 // COMICS",
    brand: "Sim4Comics",
    titleZh: "漫画分镜与 JEV 决策工程",
    titleEn: "Sequential Art, Masters & JEV Engine",
    sciFiDeck: "CHRONO-PANEL & JEV NEURAL COMPILER · 分镜拓扑与神经编译舱",
    accent: "#6d28d9",
    accentSoft: "#f3e8ff",
    icon: "fa-book-open",
    summary: "7 阶分镜工程（420 题）、88 张三语分镜卡、五大漫画大师技法、JEV 14 维 5-Pass 自动切分引擎与 tldraw-manga 三层多边形工坊。",
    primaryHref: "/journey?domain=comics",
    domain: "comics",
    quickLinks: [
      { label: "7 阶闯关 Journey", href: "/journey?domain=comics", icon: "fa-route" },
      { label: "88 分镜闪卡", href: "/cards?domain=comics", icon: "fa-layer-group" },
      { label: "6 大分镜工程案例", href: "/scenes?domain=comics", icon: "fa-compass-drafting" },
      { label: "Koma & JEV 实验室", href: "/sim?domain=comics", icon: "fa-cubes" },
      { label: "分镜拓扑星图", href: "/map?domain=comics", icon: "fa-diagram-project" },
    ],
  },
  trading: {
    id: "trading",
    code: "SUBJ-04 // TRADING",
    brand: "Sim4Trading · 交易入道",
    titleZh: "交易入道与跨市场实战体系",
    titleEn: "Rudao Quantitative & Execution Systems",
    sciFiDeck: "ASTRAL EQUILIBRIUM & FIVE-LEG ENGINE · 星轨概率与五路分兵中枢",
    accent: "#b45309",
    accentSoft: "#fef3c7",
    icon: "fa-compass",
    summary: "遁一子《交易入道》全书 25 节核心课题（数理地基 13 讲、闲云九法 6 式、实操 SOP 2 讲、四大名家跨市场体系 4 讲）+ 五路分兵计算器与 103 篇原推汇编。",
    primaryHref: "/rudao",
    isExternalPath: true,
    quickLinks: [
      { label: "交易入道全书 MdBook", href: "/rudao", icon: "fa-book-bookmark", external: true },
      { label: "Part I · 数理地基 (13讲)", href: "/rudao?track=concepts", icon: "fa-square-root-variable", external: true },
      { label: "Part II · 闲云九法 (6式)", href: "/rudao?track=rudao", icon: "fa-water", external: true },
      { label: "Part III · 实操 SOP (2讲)", href: "/rudao?track=sop", icon: "fa-list-check", external: true },
      { label: "五路分兵与庙算计算器", href: "/rudao?tab=calculators", icon: "fa-calculator", external: true },
      { label: "103 条原推按专题汇编", href: "/rudao?tab=tweets", icon: "fa-feather-pointed", external: true },
    ],
  },
}

export const SUBJECT_LIST: SubjectCollection[] = [
  SUBJECT_COLLECTIONS.options,
  SUBJECT_COLLECTIONS.director,
  SUBJECT_COLLECTIONS.comics,
  SUBJECT_COLLECTIONS.trading,
]

interface TradingCardMeta {
  id: string
  track: "concepts" | "rudao" | "sop" | "peers"
  code: string
  category: string
  termZh: string
  termEn: string
  level: string
  summary: string
  sources: number
}

const TRADING_CARDS_META: TradingCardMeta[] = [
  {
    id: "concept-pip-lot-leverage",
    track: "concepts",
    code: "TRD-1.1",
    category: "数理地基与风控术语",
    termZh: "点值（Pip）· 标准手（Lot）· 杠杆分蛋篮子",
    termEn: "Pip / Standard Lot / Leverage as Multi-Basket",
    level: "入门必学",
    summary: "外汇报价最小核心变动单位与仓位换算公式；打破『杠杆=放大赌注』的散户误区，将杠杆用作同时配置多品种正交策略的『分蛋篮子』。",
    sources: 2,
  },
  {
    id: "concept-expectancy-moon",
    track: "concepts",
    code: "TRD-1.2",
    category: "数理地基与风控术语",
    termZh: "数学期望收益（Expectancy）与拉斯维加斯之月",
    termEn: "Mathematical Expectancy & The Moon Over Las Vegas",
    level: "入门必学",
    summary: "《交易入道》第一阶『信解』的核心基石：用冷月般俯瞰全局的数理视角，计算每一次出手平均每 1 元风险能带回多少正收益。",
    sources: 3,
  },
  {
    id: "concept-profit-factor-roi",
    track: "concepts",
    code: "TRD-1.3",
    category: "数理地基与风控术语",
    termZh: "利润因子（Profit Factor）反推胜率与期望值",
    termEn: "Profit Factor (PF) to Expectancy Derivation",
    level: "核心进阶",
    summary: "当 MT4 / TradingView 回测报告只给出『利润因子 PF』和总交易次数时，如何用一元方程反推出真实胜率与数学期望收益。",
    sources: 1,
  },
  {
    id: "concept-rp-n-wr-triangle",
    track: "concepts",
    code: "TRD-1.4",
    category: "数理地基与风控术语",
    termZh: "交易系统不可能三角（RP - N - WR）与单笔风险 SL",
    termEn: "The RP-N-WR Impossible Triangle & SL Risk",
    level: "入门必学",
    summary: "决定任何交易系统最终回报率的四大核心要素：回报率（RP）、频次（N）、胜率（WR）构成相互制约的铁三角，而单笔止损风险（SL）区分普通与传奇回报。",
    sources: 3,
  },
  {
    id: "concept-kelly-5-money-mgmt",
    track: "concepts",
    code: "TRD-1.5",
    category: "数理地基与风控术语",
    termZh: "凯利公式（Kelly）与五大资金管理策略对比",
    termEn: "Kelly Criterion vs. Fixed Fractional / Martingale / Anti-Martingale",
    level: "核心进阶",
    summary: "基于遁一子开源项目对比固定比例、固定金额、凯利公式、马丁格尔与反马丁格尔五种仓位管理的真实生死线。",
    sources: 3,
  },
  {
    id: "concept-survivorship-lottery-bias",
    track: "concepts",
    code: "TRD-1.6",
    category: "数理地基与风控术语",
    termZh: "幸存者偏差（守株待兔）与彩票偏向（疑邻盗斧）",
    termEn: "Survivorship Bias & Lottery Bias (Illusion of Control)",
    level: "入门必学",
    summary: "揭开果地总结规律与『我执』不肯止损的心理病根，理解随机游走中的独立事件。",
    sources: 1,
  },
  {
    id: "concept-herding-anchoring-prospect",
    track: "concepts",
    code: "TRD-1.7",
    category: "数理地基与风控术语",
    termZh: "羊群效应 · 锚定偏差 · 前景理论（处置效应）",
    termEn: "Herding, Anchoring Bias & Prospect Theory",
    level: "入门必学",
    summary: "诺贝尔经济学奖卡尼曼《前景理论》与行为金融学三大散户心理陷阱：为何散户总是『赚点小钱就跑，亏了大钱死扛到底』？",
    sources: 3,
  },
  {
    id: "concept-reflexivity-soros",
    track: "concepts",
    code: "TRD-1.8",
    category: "数理地基与风控术语",
    termZh: "索罗斯反身性理论（Reflexivity）与繁荣-崩盘不对称性",
    termEn: "Soros Reflexivity & Boom-Bust Asymmetry",
    level: "核心进阶",
    summary: "市场价格不仅被动反映基本面，还会通过信贷、抵押品价值与市场情绪反过来改变基本面，形成『缓慢自我强化繁荣 → 急速去杠杆崩盘』。",
    sources: 2,
  },
  {
    id: "concept-four-seasons-market",
    track: "concepts",
    code: "TRD-1.9",
    category: "图表结构与四季原理",
    termZh: "市场四季原理（春·夏·秋·冬）与四大走势铁律",
    termEn: "Market Four Seasons & Four Trend Laws",
    level: "入门必学",
    summary: "遁一子《交易入道》判势核心：由两仪（阴阳）生三才（涨、跌、盘整），再结合『价格与指标是否背离』化为四象（春夏秋冬四季）。",
    sources: 2,
  },
  {
    id: "concept-supply-demand-ob",
    track: "concepts",
    code: "TRD-1.10",
    category: "图表结构与四季原理",
    termZh: "供需区（Supply & Demand Zone）与订单块（Order Block）",
    termEn: "Supply & Demand Zone / Institutional Order Block",
    level: "入门必学",
    summary: "高周期（200m）上机构大资金留下的未成交订单密集区：暴涨启动前的最后一根阴线（需求区）与暴跌启动前的最后一根阳线（供给区）。",
    sources: 3,
  },
  {
    id: "concept-premium-discount-fib50",
    track: "concepts",
    code: "TRD-1.11",
    category: "图表结构与四季原理",
    termZh: "溢价区与折价区（50% 斐波那契中轴法则 · 击归核心）",
    termEn: "Premium & Discount Zones (50% Fibonacci Equilibrium)",
    level: "入门必学",
    summary: "《交易入道》『击归』的量化尺子：将一段趋势波段从 0 到 100% 切开，50% 以下为折价区（只做多），50% 以上为溢价区（只做空）。",
    sources: 2,
  },
  {
    id: "concept-zigzag-nonrepaint-pivot",
    track: "concepts",
    code: "TRD-1.12",
    category: "图表结构与四季原理",
    termZh: "不重绘之字转向（Non-Repainting Zigzag）与枢轴高低点",
    termEn: "Non-Repainting Zigzag & Pivot High/Low Structure",
    level: "核心进阶",
    summary: "如何客观识别『更高高点（HH）、更高低点（HL）』而不再被传统 Zigzag 指标的事后『重绘（Repainting）』欺骗？",
    sources: 2,
  },
  {
    id: "concept-price-action-all-patterns",
    track: "concepts",
    code: "TRD-1.13",
    category: "图表结构与四季原理",
    termZh: "价格行为形态（Price Action Patterns）与 Stoch Candle 判势",
    termEn: "Chart Patterns & Stoch Candle Filtering",
    level: "核心进阶",
    summary: "结合 TradingView 官方『All Chart Patterns』自动形态识别与 Stoch Candle 颜色过滤，实现『激水之疾，其势漂石，涟漪过后，心湖如镜』。",
    sources: 3,
  },
  {
    id: "rudao-01-xinjie-guanju",
    track: "rudao",
    code: "TRD-2.1",
    category: "《交易入道》· 闲云九法",
    termZh: "第一式：信解（拉斯维加斯之月）与 观局（八大货币强弱矩阵）",
    termEn: "Stage 1: Mathematical Faith & Currency Strength Matrix",
    level: "核心战法",
    summary: "入道先立『正期望收益』之信；开盘先看 8 大货币 28 对联动强弱（Nine Currency Comparison / fxdiary.com），只挑『最强配最弱』的主战场。",
    sources: 4,
  },
  {
    id: "rudao-02-panshi-jigui",
    track: "rudao",
    code: "TRD-2.2",
    category: "《交易入道》· 闲云九法",
    termZh: "第二式：判势（200m 供需与四季）与 击归（20m 折价区黄金分割回撤）",
    termEn: "Stage 2: 200m Trend/Supply-Demand & 20m Fib Discount Pullback",
    level: "核心战法",
    summary: "大周期（200m）定四季多空与供需边界，中周期（20m）用开源神作 [JL] Supertrend Zone Pivot Point 等价格回到 50% 折价线以下『击其归途』。",
    sources: 4,
  },
  {
    id: "rudao-03-ruwei-yongqi",
    track: "rudao",
    code: "TRD-2.3",
    category: "《交易入道》· 闲云九法",
    termZh: "第三式：入微（2m 布林开口角度触发）与 用奇（200m/20m/2m 十倍分形）",
    termEn: "Stage 3: 2m Bollinger Angle Trigger & 200m/20m/2m 10x Fractal",
    level: "核心战法",
    summary: "打破传统『数字20陷阱』，采用 200m-20m-2m 严格 10 倍分形；当 20m 落入折价区后，切到 2m 周期捕捉布林带陡峭开口瞬间扣扳机。",
    sources: 4,
  },
  {
    id: "rudao-04-susheng-fenbing",
    track: "rudao",
    code: "TRD-2.4",
    category: "《交易入道》· 闲云九法",
    termZh: "第四式：速胜（满 20 点推保本）与 五路分兵（20/40/80/120/200 Pips）",
    termEn: "Stage 4: +20 Pips Breakeven & 5-Leg Split Exit Engine",
    level: "核心战法",
    summary: "把单笔总风险拆成 5 笔等额订单同时入场，止盈阶梯设为 20/40/80/120/200 点；只要顺向走满 20 点，剩余 4 笔立刻推保本，回撤 40 点全部落袋。",
    sources: 3,
  },
  {
    id: "rudao-05-miaosuan-buzhan",
    track: "rudao",
    code: "TRD-2.5",
    category: "《交易入道》· 闲云九法",
    termZh: "第五式：庙算（RP-N-WR 铁三角复利公式）与 不战（Prop Firm 矩阵）",
    termEn: "Stage 5: RP-N-WR Compounding Formula & Prop Firm Matrix",
    level: "核心战法",
    summary: "用剔除保本单后的『铁三角复利公式』做庙算；通过『满20点推保本』砍掉亏损幂次，再用稳健低回撤曲线去复制 FTMO / Darwinex 外部资金分店。",
    sources: 4,
  },
  {
    id: "rudao-06-ai-evolution",
    track: "rudao",
    code: "TRD-2.6",
    category: "《交易入道》· 2025-2026 AI 演进",
    termZh: "第六式：2025–2026 AI 交易演进（Claude 写 MT5 + 长短双框架 + Polymarket）",
    termEn: "Stage 6: AI-Assisted MT5 EA, Dual-Timeframe Crypto & Polymarket Bot",
    level: "前沿演进",
    summary: "用 Claude + NotebookLM 全面接管 MT5 策略编写，提炼出『长线波段锚定 + 短线 4H RSI 均值回归』双框架，并拓展至 Polymarket 自动化套利。",
    sources: 4,
  },
  {
    id: "sop-01-premarket-setup",
    track: "sop",
    code: "TRD-3.1",
    category: "从零到一实操 SOP 清单",
    termZh: "实操 SOP-1：盘前 10 分钟『观局选品』与 TradingView 三屏工作台配置",
    termEn: "SOP-1: 10-Min Pre-Market Currency Scan & TV 3-Pane Setup",
    level: "实操落地",
    summary: "每天坐到电脑前第 1 步干什么？手把手把遁一子的 3 个开源指标装进 TradingView 并在 10 分钟内选出当日最佳狙击货币对。",
    sources: 3,
  },
  {
    id: "sop-02-entry-execution-exit",
    track: "sop",
    code: "TRD-3.2",
    category: "从零到一实操 SOP 清单",
    termZh: "实操 SOP-2：盘中『判势→击归→入微』扣扳机与『五路分兵』风控执行表",
    termEn: "SOP-2: Intraday Entry Checklist & 5-Leg Order Execution",
    level: "实操落地",
    summary: "从看到信号到下出 5 笔分仓单、设好 20 点推保本与 40 点回撤止盈的完整闭环操作手册。",
    sources: 3,
  },
  {
    id: "peers-01-joely-us-stocks",
    track: "peers",
    code: "TRD-4.1",
    category: "跨市场四大名家体系",
    termZh: "@joely7758521（价值哥）：美股『5+3+1+1 仓位』+ 恐慌期 Sell Put + LEAPS Call",
    termEn: "@joely7758521: US Tech 5+3+1+1 Portfolio, Cash-Secured Put & LEAPS Call",
    level: "跨市场对照",
    summary: "专注美股科技巨头的『正股底仓 + 暴跌 Sell Put 造无限子弹 + 王子落难分批建仓 1~2 年期 LEAPS Call』体系。",
    sources: 4,
  },
  {
    id: "peers-02-0xcherry-ai-quant",
    track: "peers",
    code: "TRD-4.2",
    category: "跨市场四大名家体系",
    termZh: "@0xcherry（车厘子）：AI 交易 Agent『OpenAlice』与策略演化『Auto-Quant』",
    termEn: "@0xcherry: OpenAlice Trading Agent & Karpathy-Style Auto-Quant",
    level: "跨市场对照",
    summary: "解决『金融数据直接塞给 LLM 导致 Context 爆炸与数字幻觉』的工程化方案：OpenAlice 金融认知架构与单文件自动回测演化的 Auto-Quant。",
    sources: 3,
  },
  {
    id: "peers-03-onchain-btc-cycle",
    track: "peers",
    code: "TRD-4.3",
    category: "跨市场四大名家体系",
    termZh: "@0xCryptoChan & @Murphychen888：BTC 链上周期 MVRV / URPD 逃顶抄底库",
    termEn: "BTC On-Chain Cycle Indicators: MVRV, LTH-RP, STH Ratio & URPD",
    level: "跨市场对照",
    summary: "加密货币大周期『观局与判势』圣经：用链上真实换手成本（Realized Price）、MVRV 对数收敛通道、URPD 筹码分布峰谷精准定位牛熊顶底。",
    sources: 4,
  },
  {
    id: "peers-04-mstr-vol-arb",
    track: "peers",
    code: "TRD-4.4",
    category: "跨市场四大名家体系",
    termZh: "@mindaoyang & @bitfish & @taresky：MSTR 波动率分层套利与稳定币现金流",
    termEn: "MSTR Volatility Stripping Engine & Stablecoin Yield Arbitrage",
    level: "跨市场对照",
    summary: "看懂资本市场顶层的『金融炼金术』：微策略（MSTR）如何通过可转债与 ATM 增发将 BTC 波动率剥离并放大 2.5 倍分层销售，以及低风险稳定币套利体系。",
    sources: 4,
  },
]

function buildBuiltinTopics(): MicroTopic[] {
  const out: MicroTopic[] = []

  // 1. Options, Director, Comics levels + category card packs
  const domainMeta: Record<DomainId, { prefix: string; zhLabel: string }> = {
    options: { prefix: "OPT", zhLabel: "期权" },
    director: { prefix: "DIR", zhLabel: "导演" },
    comics: { prefix: "COM", zhLabel: "漫画" },
  }

  for (const domId of ["options", "director", "comics"] as DomainId[]) {
    const pack = DOMAINS[domId]
    const { prefix } = domainMeta[domId]

    // Levels as Micro-Topics
    for (const lv of pack.levels) {
      const qCount = (pack.bank[lv.n] || []).length
      const catNames = (lv.cats || [])
        .map((cid) => pack.cats.find((c) => c.id === cid))
        .filter(Boolean)
        .map((c) => c!.zh || c!.name)
      out.push({
        id: `${domId}-level-${lv.n}`,
        subject: domId,
        kind: "level",
        code: `${prefix}-L${lv.n}`,
        title: `Level ${lv.n} · ${lv.zh || lv.name}`,
        titleEn: lv.name,
        summary: lv.blurb,
        metrics: `${qCount} Quests · ${catNames.slice(0, 2).join(" / ")}`,
        tags: [pack.brand, `Level ${lv.n}`, ...catNames],
        href: `/quest/${lv.n}/0?domain=${domId}`,
        domain: domId,
        levelNum: lv.n,
      })
    }

    // Category Card Packs as Micro-Topics
    for (const cat of pack.cats) {
      const termCount = pack.terms.filter((t) => t.cat === cat.id).length
      out.push({
        id: `${domId}-cat-${cat.id}`,
        subject: domId,
        kind: "cards",
        code: `${prefix}-CARDS`,
        title: `${cat.zh || cat.name} · 知识卡组`,
        titleEn: `${cat.name} Card Pack`,
        summary: cat.blurb || `${cat.zh || cat.name} (${cat.name}) 核心知识闪卡合集`,
        metrics: `${termCount} Trilingual Cards`,
        tags: [pack.brand, "Skill Cards", cat.name, cat.zh || ""],
        href: `/cards?domain=${domId}&cat=${cat.id}`,
        domain: domId,
        catId: cat.id,
      })
    }
  }

  // 2. Options Specialized Labs & Case Collections
  out.push(
    {
      id: "options-lab-bs",
      subject: "options",
      kind: "lab",
      code: "OPT-LAB-01",
      title: "Black-Scholes 损益曲面与 Greeks 动态仿真台",
      titleEn: "BS Payoff & Greeks Surface Simulator",
      summary: "支持多腿期权组合（铁鹰、跨式、日历、比率价差）到期与 T+n 损益曲线、IV 冲击及 Delta/Gamma/Theta/Vega 实时灵敏度推演。",
      metrics: "Interactive Lab · 14 Presets",
      tags: ["Sim4Options", "Black-Scholes", "Greeks", "Simulator"],
      href: "/sim?domain=options",
      domain: "options",
    },
    {
      id: "options-cases-moments",
      subject: "options",
      kind: "case",
      code: "OPT-CASE-100",
      title: "100 个真实历史期权时刻（崩盘、逼空与财报 IV Crush）",
      titleEn: "100 Historical Market Moments & Volatility Shocks",
      summary: "复盘 GME 伽马逼空、NVDA 财报 IV Crush、2020 熔断、VIX 倒挂等 100 个真实市场切片的分步决策推演。",
      metrics: "100 Real Market Cases",
      tags: ["Sim4Options", "Market Moments", "IV Crush", "Gamma Squeeze"],
      href: "/moments",
      domain: "options",
    },
    {
      id: "options-map-topology",
      subject: "options",
      kind: "lab",
      code: "OPT-MAP-01",
      title: "期权概念拓扑星图（130 核心词条关联网络）",
      titleEn: "Options Concept Dependency Graph",
      summary: "可视化 8 大期权知识域、130 张卡片的前置依赖与交叉对冲链路。",
      metrics: "130 Nodes · 8 Clusters",
      tags: ["Sim4Options", "Knowledge Graph", "Topology"],
      href: "/map?domain=options",
      domain: "options",
    }
  )

  // 3. Director Specialized Labs, Cases & Studio
  out.push(
    {
      id: "director-lab-optics",
      subject: "director",
      kind: "lab",
      code: "DIR-LAB-01",
      title: "35mm 光学焦段景深 · 希区柯克变焦 · 24fps 作画律表实验室",
      titleEn: "35mm Optical FOV/DOF, Dolly Zoom & 24fps Sakuga X-Sheet Lab",
      summary: "实时推演 14mm–200mm 视场角与背景压缩、光圈景深、三点布光光比，以及一拍一/一拍二/一拍三（1s/2s/3s）动画律表。",
      metrics: "3-in-1 Director Lab",
      tags: ["Sim4Director", "Optics", "Dolly Zoom", "Sakuga Timing"],
      href: "/sim?domain=director",
      domain: "director",
    },
    {
      id: "director-cases-102",
      subject: "director",
      kind: "case",
      code: "DIR-CASE-102",
      title: "102 个虚拟片场调度实战（机位、轴线、光线与剪辑点）",
      titleEn: "102 Interactive Virtual Set Staging Cases",
      summary: "涵盖希区柯克悬念、黑泽明轴线调度、小津低机位、今敏匹配剪辑等 102 个片场多阶段决策复盘。",
      metrics: "102 Multi-Step Scenes",
      tags: ["Sim4Director", "Virtual Set", "Blocking", "Editing"],
      href: "/scenes?domain=director",
      domain: "director",
    },
    {
      id: "director-studio-gallery",
      subject: "director",
      kind: "lab",
      code: "DIR-STUDIO-01",
      title: "角色造型与情绪差分工坊（Mascot & Outfit Visual Studio）",
      titleEn: "Character Costume, Pose & Expression Studio",
      summary: "检视并切换导演、漫画与交易导师的多套服饰、分镜姿势与视线引导演出差分。",
      metrics: "Interactive Character Studio",
      tags: ["Sim4Director", "Character Design", "Gallery"],
      href: "/gallery",
      domain: "director",
    },
    {
      id: "director-sources-canon",
      subject: "director",
      kind: "cards",
      code: "DIR-CANON-01",
      title: "电影与动画大师经典文献与片单索引",
      titleEn: "Cinema & Animation Master Bibliography",
      summary: "Bazin、Tarkovsky、Kurosawa、Miyazaki、Oshii、Satoshi Kon 等导演理论原典与镜头拆解索引。",
      metrics: "Primary Sources & Filmography",
      tags: ["Sim4Director", "Film Theory", "Bibliography"],
      href: "/sources?domain=director",
      domain: "director",
    }
  )

  // 4. Comics Individual Storyboard Cases + 3 Specialized Lab Modules
  const comicsScenes = DOMAINS.comics.scenes || []
  comicsScenes.forEach((sc, idx) => {
    out.push({
      id: `comics-scene-${sc.id}`,
      subject: "comics",
      kind: "case",
      code: `COM-CASE-0${idx + 1}`,
      title: `分镜实战案例 0${idx + 1} · ${sc.zh || sc.title}`,
      titleEn: sc.title,
      summary: sc.setup,
      metrics: `${sc.checkpoints.length} Checkpoints · ${sc.genre}`,
      tags: ["Sim4Comics", "Storyboard Case", sc.genre, ...sc.tags],
      href: `/scenes/${sc.id}?domain=comics`,
      domain: "comics",
    })
  })

  out.push(
    {
      id: "comics-lab-tldraw",
      subject: "comics",
      kind: "lab",
      code: "COM-LAB-TLDRAW",
      title: "tldraw-manga 三层多边形容器与 6 轴 layoutScore 排版工坊",
      titleEn: "tldraw-manga 3-Tier Polygon & 6-Axis layoutScore Studio",
      summary: "交互调参 Page → Strip/Row → Polygon Panel 三层拓扑、斜切刀线角度、出血与框内无损取景重构，实时计算 6 轴编辑评分。",
      metrics: "3-Tier Canvas · 6-Axis Score",
      tags: ["Sim4Comics", "tldraw-manga", "Polygon Panel", "layoutScore"],
      href: "/sim?domain=comics",
      domain: "comics",
    },
    {
      id: "comics-lab-jev",
      subject: "comics",
      kind: "lab",
      code: "COM-LAB-JEV",
      title: "JEV 14 维分镜自动切分与 5-Pass 迭代轮询仿真器",
      titleEn: "JEV 14-Factor Auto-Segmentation & 5-Pass Polling Lab",
      summary: "调参 F01–F14 十四维主因子权重与 52 微因子冲突仲裁，实时仿真 System 2 规则编译与 System 1 快速分格切分。",
      metrics: "14 Factors · 52 Micro-Factors",
      tags: ["Sim4Comics", "JEV Decision", "System 2/1", "14-Factor Engine"],
      href: "/sim?domain=comics",
      domain: "comics",
    },
    {
      id: "comics-lab-optics",
      subject: "comics",
      kind: "lab",
      code: "COM-LAB-OPTICS",
      title: "漫画光学景别阶梯（12–200mm）与 7 种参数化矢量气泡实验台",
      titleEn: "Manga Optical Shot Ladder & Parametric Speech Bubble Lab",
      summary: "对比 10 级漫画景别（EWS–ECU）、7 种机位倾角透视畸变，以及 7 种参数化矢量对白框（普通、呐喊、心声、电子、冰结等）排版规则。",
      metrics: "10 Shot Sizes · 7 Bubble Types",
      tags: ["Sim4Comics", "Optical Framing", "Speech Bubbles", "RTL Reading"],
      href: "/sim?domain=comics",
      domain: "comics",
    }
  )

  // 5. Trading (交易入道) 4 Interactive Tools + All 25 Individual Chapters
  out.push(
    {
      id: "trading-tool-calculators",
      subject: "trading",
      kind: "trading-tool",
      code: "TRD-TOOL-5.1",
      title: "五路分兵仓位拆分器 & 庙算 RP-N-WR 铁三角复利计算器",
      titleEn: "5-Leg Position Splitter & RP-N-WR Compounding Calculator",
      summary: "输入账户本金、单笔风险比例与止损点数，自动生成 5 路分兵手数与 20/40/80/120/200 点止盈阶梯，并推演剔除保本单后的真实复利曲线。",
      metrics: "Interactive Trading Calculator",
      tags: ["Sim4Trading", "五路分兵", "庙算复利", "Calculator"],
      href: "/rudao?tab=calculators",
      isExternalPath: true,
    },
    {
      id: "trading-tool-tweets",
      subject: "trading",
      kind: "trading-tool",
      code: "TRD-TOOL-5.2",
      title: "@jesselaunz 103 条书签原推按专题汇编（支持全文检索与原帖直达）",
      titleEn: "103 Curated @jesselaunz Trading Bookmarks Compendium",
      summary: "按『信解与数学期望』『观局与判势』『入微与五路分兵』『AI 量化演进』『美股 LEAPS 与 BTC 链上周期』分类汇编全部 103 条书签原推。",
      metrics: "103 Original Tweets · Filterable",
      tags: ["Sim4Trading", "103 Tweets", "Primary Archive"],
      href: "/rudao?tab=tweets",
      isExternalPath: true,
    },
    {
      id: "trading-tool-allinone",
      subject: "trading",
      kind: "trading-tool",
      code: "TRD-TOOL-5.4",
      title: "《交易入道》全书 25 节单页连读视图（All-in-One Immersive Reader）",
      titleEn: "Rudao Complete 25-Chapter Single-Page Reader",
      summary: "将数理地基 13 讲、闲云九法 6 式、实操 SOP 2 讲与跨市场四大名家体系 4 讲展开为单页沉浸式长卷，支持一键批注与全书打印。",
      metrics: "25 Chapters · Single-Page Scroll",
      tags: ["Sim4Trading", "Full Book", "MdBook"],
      href: "/rudao?card=all-in-one#all-in-one",
      isExternalPath: true,
    },
    {
      id: "trading-tool-notes",
      subject: "trading",
      kind: "trading-tool",
      code: "TRD-TOOL-5.3",
      title: "交易读书批注与原文 URL 集中回溯索引（Notes & Source Hub）",
      titleEn: "Trading Annotations & Source URL Index",
      summary: "集中管理在各章节记录的实盘复盘批注、感悟与全部推文/博客/TradingView 指标源码链接。",
      metrics: "Cloud Synced Notes & URLs",
      tags: ["Sim4Trading", "Notes Hub", "TradingView Scripts"],
      href: "/rudao?tab=notes-hub",
      isExternalPath: true,
    }
  )

  for (const c of TRADING_CARDS_META) {
    out.push({
      id: `trading-card-${c.id}`,
      subject: "trading",
      kind: "trading-chapter",
      code: c.code,
      title: c.termZh,
      titleEn: c.termEn,
      summary: c.summary,
      metrics: `${c.level} · ${c.category} · ${c.sources} 原文引用`,
      tags: ["Sim4Trading", c.category, c.level, c.track],
      href: `/rudao?card=${c.id}#${c.id}`,
      isExternalPath: true,
    })
  }

  return out
}

export const ALL_BUILTIN_TOPICS: MicroTopic[] = buildBuiltinTopics()

export const PERSONAS: Record<PersonaId, PersonaProfile> = {
  J: {
    id: "J",
    code: "J",
    codename: "JOVIAN OBSERVER",
    titleZh: "木星观测者 · 概率与高维博弈研究院",
    titleEn: "Jovian Observer · Stochastic & Macro-Matrix Lab",
    divisionZh: "非线性损益曲面 · 交易入道闲云九法 · 尾部奇点防御",
    sectorCode: "ORBITAL DECK J-01 // STOCHASTIC & RUDAO MATRIX",
    tagline: "聚焦概率分布、期权凸性（Convexity）、拉斯维加斯之月数学期望与 200m/20m/2m 十倍分形交易系统的定量推演。",
    researchFocus: ["概率期望与凯利边界", "期权波动率曲面与 Greeks", "200m/20m/2m 十倍分形", "五路分兵与跨市场套利"],
    accent: "#d97706",
    accentSoft: "#fef3c7",
    icon: "fa-satellite-dish",
    mascotPose: "think",
    defaultDomain: "options",
    primarySubjects: ["trading", "options", "comics"],
    starterTopicIds: [
      "trading-card-concept-expectancy-moon",
      "trading-card-concept-rp-n-wr-triangle",
      "trading-card-rudao-01-xinjie-guanju",
      "trading-card-rudao-02-panshi-jigui",
      "trading-card-rudao-03-ruwei-yongqi",
      "trading-card-rudao-04-susheng-fenbing",
      "trading-tool-calculators",
      "options-level-1",
      "options-level-2",
      "options-level-3",
      "options-lab-bs",
      "options-cases-moments",
      "trading-card-peers-01-joely-us-stocks",
      "trading-card-peers-04-mstr-vol-arb",
    ],
  },
  S: {
    id: "S",
    code: "S",
    codename: "SOLARIS ARCHITECT",
    titleZh: "索拉里斯架构师 · 视听场域与时空叙事工坊",
    titleEn: "Solaris Architect · Spatio-Temporal Staging Core",
    divisionZh: "35mm 光学场域 · 场面调度轴线 · 24fps 作画律表与蒙太奇",
    sectorCode: "ORBITAL DECK S-02 // OPTICAL FIELD & MISE-EN-SCÈNE",
    tagline: "探索镜头焦段透视、三点布光张力、角色走位（Blocking）、原画时间律表（X-Sheet）与跨媒介视觉叙事。",
    researchFocus: ["35mm 焦段与景深几何", "180° 轴线与深度调度", "日本作画 1s/2s/3s 律表", "大师级蒙太奇与跨媒介分镜"],
    accent: "#0f766e",
    accentSoft: "#e6f7f4",
    icon: "fa-shuttle-space",
    mascotPose: "director",
    defaultDomain: "director",
    primarySubjects: ["director", "comics"],
    starterTopicIds: [
      "director-level-1",
      "director-level-2",
      "director-level-3",
      "director-level-5",
      "director-level-6",
      "director-lab-optics",
      "director-cases-102",
      "director-cat-sakuga",
      "director-cat-masters",
      "comics-level-3",
      "comics-level-4",
      "comics-lab-optics",
    ],
  },
  T: {
    id: "T",
    code: "T",
    codename: "TACHYON CHRONO-SCRIBE",
    titleZh: "快子纪元记录官 · 分镜拓扑与神经编译实验室",
    titleEn: "Tachyon Chrono-Scribe · Sequential Topology & JEV Lab",
    divisionZh: "McCloud 格间闭合 · 五大漫画大师语法 · JEV 14维自动切分 · tldraw-manga",
    sectorCode: "ORBITAL DECK T-03 // KOMA TOPOLOGY & JEV-14 COMPILER",
    tagline: "研究纸面时间压缩与拉伸、RTL 逆 Z 视线流体力学、JEV System 2/1 十四维分镜编译器与三层多边形容器工程。",
    researchFocus: ["McCloud 六大转换与留白", "手塚/鸟山/井上/大友/浦泽技法", "JEV 14维主因子与 52 微因子", "tldraw-manga 三层多边形管线"],
    accent: "#6d28d9",
    accentSoft: "#f3e8ff",
    icon: "fa-atom",
    mascotPose: "study",
    defaultDomain: "comics",
    primarySubjects: ["comics", "director"],
    starterTopicIds: [
      "comics-level-1",
      "comics-level-2",
      "comics-level-3",
      "comics-level-5",
      "comics-level-6",
      "comics-level-7",
      "comics-lab-tldraw",
      "comics-lab-jev",
      "comics-scene-sc-jev-14factor-breakdown",
      "comics-scene-sc-tldraw-3tier-reflow",
      "comics-scene-sc-inoue-silent-climax",
      "comics-scene-sc-otomo-isometric-destruction",
    ],
  },
  D: {
    id: "D",
    code: "D",
    codename: "DYSON NAVIGATOR",
    titleZh: "戴森球领航员 · 全频谱跨域认知合成舱",
    titleEn: "Dyson Navigator · Omni-Spectrum Synthesis Deck",
    divisionZh: "期权波动率 · 交易入道 SOP · 导演光学调度 · JEV 分镜决策全栈融通",
    sectorCode: "ORBITAL DECK D-04 // OMNI-SPECTRUM COGNITIVE NEXUS",
    tagline: "打通金融博弈（Options & Trading）与视觉叙事工程（Director & Comics）的底层同构性：概率期望、节奏密度、注意力引导与系统编译。",
    researchFocus: ["期权尾部对冲与波动率套利", "实盘 10 分钟观局与五路分兵 SOP", "JEV 双层决策与多边形排版", "片场光学调度与跨学科模型"],
    accent: "#e85d2a",
    accentSoft: "#fff3e4",
    icon: "fa-compass-drafting",
    mascotPose: "thumbs",
    defaultDomain: "options",
    primarySubjects: ["options", "trading", "comics", "director"],
    starterTopicIds: [
      "options-level-1",
      "options-level-5",
      "options-lab-bs",
      "trading-card-sop-01-premarket-setup",
      "trading-card-sop-02-entry-execution-exit",
      "trading-card-rudao-06-ai-evolution",
      "trading-card-peers-02-0xcherry-ai-quant",
      "comics-level-5",
      "comics-level-7",
      "comics-lab-jev",
      "director-level-1",
      "director-lab-optics",
    ],
  },
}

export const PERSONA_LIST: PersonaProfile[] = [PERSONAS.J, PERSONAS.S, PERSONAS.T, PERSONAS.D]

interface PersistedPersonaState {
  activePersona: PersonaId
  pinnedByPersona: Record<PersonaId, string[]>
  completedByPersona: Record<PersonaId, string[]>
  profileOverrides: Partial<Record<PersonaId, { codename?: string; titleZh?: string; tagline?: string }>>
  customTopics: MicroTopic[]
}

const STORAGE_KEY = "sim4it.persona.nexus.v1"

function loadInitialState(): PersistedPersonaState {
  const fallback: PersistedPersonaState = {
    activePersona: "J",
    pinnedByPersona: {
      J: [...PERSONAS.J.starterTopicIds],
      S: [...PERSONAS.S.starterTopicIds],
      T: [...PERSONAS.T.starterTopicIds],
      D: [...PERSONAS.D.starterTopicIds],
    },
    completedByPersona: {
      J: [],
      S: [],
      T: [],
      D: [],
    },
    profileOverrides: {},
    customTopics: [],
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<PersistedPersonaState>
    return {
      activePersona:
        parsed.activePersona && ["J", "S", "T", "D"].includes(parsed.activePersona)
          ? parsed.activePersona
          : fallback.activePersona,
      pinnedByPersona: {
        J: Array.isArray(parsed.pinnedByPersona?.J) ? parsed.pinnedByPersona!.J : fallback.pinnedByPersona.J,
        S: Array.isArray(parsed.pinnedByPersona?.S) ? parsed.pinnedByPersona!.S : fallback.pinnedByPersona.S,
        T: Array.isArray(parsed.pinnedByPersona?.T) ? parsed.pinnedByPersona!.T : fallback.pinnedByPersona.T,
        D: Array.isArray(parsed.pinnedByPersona?.D) ? parsed.pinnedByPersona!.D : fallback.pinnedByPersona.D,
      },
      completedByPersona: {
        J: Array.isArray(parsed.completedByPersona?.J) ? parsed.completedByPersona!.J : [],
        S: Array.isArray(parsed.completedByPersona?.S) ? parsed.completedByPersona!.S : [],
        T: Array.isArray(parsed.completedByPersona?.T) ? parsed.completedByPersona!.T : [],
        D: Array.isArray(parsed.completedByPersona?.D) ? parsed.completedByPersona!.D : [],
      },
      profileOverrides: parsed.profileOverrides || {},
      customTopics: Array.isArray(parsed.customTopics) ? parsed.customTopics : [],
    }
  } catch {
    return fallback
  }
}

const state = reactive<PersistedPersonaState>(loadInitialState())

watch(
  state,
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch {
      // Ignore storage quota errors
    }
  },
  { deep: true }
)

export function usePersonaNexus() {
  const allTopics = computed<MicroTopic[]>(() => [...state.customTopics, ...ALL_BUILTIN_TOPICS])

  const topicMap = computed<Record<string, MicroTopic>>(() => {
    const map: Record<string, MicroTopic> = {}
    for (const t of allTopics.value) map[t.id] = t
    return map
  })

  function getPersonaProfile(id: PersonaId = state.activePersona): PersonaProfile {
    const base = PERSONAS[id]
    const over = state.profileOverrides[id]
    if (!over) return base
    return {
      ...base,
      codename: over.codename?.trim() || base.codename,
      titleZh: over.titleZh?.trim() || base.titleZh,
      tagline: over.tagline?.trim() || base.tagline,
    }
  }

  const activePersona = computed<PersonaProfile>(() => getPersonaProfile(state.activePersona))

  const activePinnedIds = computed<string[]>(() => state.pinnedByPersona[state.activePersona] || [])
  const activeCompletedIds = computed<string[]>(() => state.completedByPersona[state.activePersona] || [])

  const activeChecklistTopics = computed<MicroTopic[]>(() =>
    activePinnedIds.value.map((id) => topicMap.value[id]).filter((t): t is MicroTopic => Boolean(t))
  )

  function setPersona(id: PersonaId) {
    if (["J", "S", "T", "D"].includes(id)) {
      state.activePersona = id
    }
  }

  function isPinned(topicId: string, pid: PersonaId = state.activePersona): boolean {
    return (state.pinnedByPersona[pid] || []).includes(topicId)
  }

  function togglePin(topicId: string, pid: PersonaId = state.activePersona) {
    const list = state.pinnedByPersona[pid] || []
    const idx = list.indexOf(topicId)
    if (idx >= 0) {
      list.splice(idx, 1)
    } else {
      list.push(topicId)
    }
    state.pinnedByPersona[pid] = [...list]
  }

  function pinTopic(topicId: string, pid: PersonaId = state.activePersona) {
    if (!isPinned(topicId, pid)) {
      state.pinnedByPersona[pid] = [...(state.pinnedByPersona[pid] || []), topicId]
    }
  }

  function unpinTopic(topicId: string, pid: PersonaId = state.activePersona) {
    state.pinnedByPersona[pid] = (state.pinnedByPersona[pid] || []).filter((id) => id !== topicId)
  }

  function pinBatch(topicIds: string[], pid: PersonaId = state.activePersona) {
    const set = new Set(state.pinnedByPersona[pid] || [])
    for (const id of topicIds) set.add(id)
    state.pinnedByPersona[pid] = [...set]
  }

  function unpinBatch(topicIds: string[], pid: PersonaId = state.activePersona) {
    const removeSet = new Set(topicIds)
    state.pinnedByPersona[pid] = (state.pinnedByPersona[pid] || []).filter((id) => !removeSet.has(id))
  }

  function movePin(topicId: string, delta: -1 | 1, pid: PersonaId = state.activePersona) {
    const list = [...(state.pinnedByPersona[pid] || [])]
    const idx = list.indexOf(topicId)
    if (idx < 0) return
    const target = idx + delta
    if (target < 0 || target >= list.length) return
    const [item] = list.splice(idx, 1)
    list.splice(target, 0, item)
    state.pinnedByPersona[pid] = list
  }

  function isDone(topicId: string, pid: PersonaId = state.activePersona): boolean {
    return (state.completedByPersona[pid] || []).includes(topicId)
  }

  function toggleDone(topicId: string, pid: PersonaId = state.activePersona) {
    const list = state.completedByPersona[pid] || []
    const idx = list.indexOf(topicId)
    if (idx >= 0) {
      list.splice(idx, 1)
    } else {
      list.push(topicId)
    }
    state.completedByPersona[pid] = [...list]
  }

  function resetPersonaChecklist(pid: PersonaId = state.activePersona) {
    state.pinnedByPersona[pid] = [...PERSONAS[pid].starterTopicIds]
  }

  function clearPersonaChecklist(pid: PersonaId = state.activePersona) {
    state.pinnedByPersona[pid] = []
  }

  function updatePersonaProfile(
    pid: PersonaId,
    patch: { codename?: string; titleZh?: string; tagline?: string }
  ) {
    state.profileOverrides[pid] = {
      ...(state.profileOverrides[pid] || {}),
      ...patch,
    }
  }

  function resetPersonaProfile(pid: PersonaId) {
    delete state.profileOverrides[pid]
  }

  function addCustomTopic(input: {
    subject: SubjectId
    code?: string
    title: string
    titleEn?: string
    summary: string
    href?: string
    tags?: string[]
    pinToCurrentPersona?: boolean
  }): MicroTopic {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const subj = SUBJECT_COLLECTIONS[input.subject]
    const rawHref = (input.href || "").trim() || subj.primaryHref
    const isExt = rawHref.startsWith("/rudao") || rawHref.startsWith("http://") || rawHref.startsWith("https://")
    const topic: MicroTopic = {
      id,
      subject: input.subject,
      kind: "custom",
      code: (input.code || "").trim() || `CUSTOM-${state.customTopics.length + 1}`,
      title: input.title.trim(),
      titleEn: (input.titleEn || "").trim() || "Custom Research Micro-Topic",
      summary: input.summary.trim() || "用户自定义扩展课题 · User-defined custom research topic.",
      metrics: "Custom Micro-Topic",
      tags: input.tags?.length ? input.tags : [subj.brand, "Custom"],
      href: rawHref,
      isExternalPath: isExt,
      domain: subj.domain,
      isCustom: true,
    }
    state.customTopics = [topic, ...state.customTopics]
    if (input.pinToCurrentPersona !== false) {
      pinTopic(topic.id, state.activePersona)
    }
    return topic
  }

  function deleteCustomTopic(topicId: string) {
    state.customTopics = state.customTopics.filter((t) => t.id !== topicId)
    for (const pid of ["J", "S", "T", "D"] as PersonaId[]) {
      state.pinnedByPersona[pid] = (state.pinnedByPersona[pid] || []).filter((id) => id !== topicId)
      state.completedByPersona[pid] = (state.completedByPersona[pid] || []).filter((id) => id !== topicId)
    }
  }

  return {
    state,
    allTopics,
    topicMap,
    activePersona,
    activePinnedIds,
    activeCompletedIds,
    activeChecklistTopics,
    getPersonaProfile,
    setPersona,
    isPinned,
    togglePin,
    pinTopic,
    unpinTopic,
    pinBatch,
    unpinBatch,
    movePin,
    isDone,
    toggleDone,
    resetPersonaChecklist,
    clearPersonaChecklist,
    updatePersonaProfile,
    resetPersonaProfile,
    addCustomTopic,
    deleteCustomTopic,
  }
}
