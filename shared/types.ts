export type DomainId = 'options' | 'director' | 'comics'

export type OptType = 'call' | 'put' | 'stock'

export interface Leg {
  type: OptType
  side: 1 | -1        // 1 = long, -1 = short
  strike?: number     // ignored for stock
  premium?: number    // per share; for stock = entry price
  qty?: number        // contracts (default 1); stock in 100-share lots
}

export interface Choice { id: string; label: string }

/** Situation at a checkpoint: only facts known at that time. */
export interface Brief { label: string; date: string; facts: string[]; note?: string }

export interface Step {
  prompt: string          // may contain [[term]] or [[term|label]] links
  choices: Choice[]
  answer: string          // choice id
  why: string             // short static explanation (AI expands on demand)
  exp?: string            // optional alias for why
  hint?: string           // optional hint
  brief?: Brief
}

export interface Question {
  id: string
  level: number
  title: string
  scenario: string        // markdown-lite with [[term]] links
  terms: string[]
  tags: string[]
  steps: Step[]
  spot?: number
  legs?: Leg[]
  simPreset?: string
  generated?: boolean
}

export interface Category {
  id: string
  name: string
  zh: string
  ja: string
  color: string
  icon?: string
  blurb?: string
}

export interface Term {
  id: string
  name: string
  term?: string
  short: string
  body?: string
  formula?: string
  example?: string
  related: string[]
  tags: string[]
  cat: string
  zh?: string
  ja?: string
}

export interface Checkpoint {
  label: string
  date?: string
  dept?: string
  context: string
  step: Step
}

export type SceneCheckpoint = Checkpoint

export interface Moment {
  id: string
  ticker: string
  title: string
  date: string
  summary: string
  terms: string[]
  tags: string[]
  checkpoints: Checkpoint[]
  outcome: string
}

export interface Scene {
  id: string
  title: string
  zh?: string
  genre: string
  setup: string
  goal: string
  terms: string[]
  tags: string[]
  checkpoints: SceneCheckpoint[]
  outcome: string
  ref?: string
}

export interface Level {
  n: number
  name: string
  zh?: string
  ja?: string
  blurb: string
  cats?: string[]
}

export interface SourceLink {
  name?: string
  title?: string
  author?: string
  kind?: 'book' | 'video' | 'talk' | 'essay' | 'course' | 'tool'
  url: string
  note?: string
}

export interface SourceGroup {
  group: string
  links: { name: string; url: string; note?: string }[]
}
