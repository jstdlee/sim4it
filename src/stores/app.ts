import { defineStore } from 'pinia'
import { load, save } from '../lib/storage'
import type { DomainId } from '../../shared/types'

export interface ByokCfg { provider: 'workers-ai' | 'openai' | 'anthropic' | 'google-ai-studio' | 'openai-compatible'; model: string; key: string; baseUrl?: string; thinking?: 'off' | 'low' | 'high' }
export interface SearchCfg { mode: 'auto' | 'always' | 'off'; cfProvider: '' | 'ceramic' | 'exa' | 'linkup'; exaKey: string; numResults: number; exaType: 'auto' | 'fast' | 'neural' | 'keyword' }
export const SEARCH_DEFAULTS: SearchCfg = { mode: 'auto', cfProvider: '', exaKey: '', numResults: 5, exaType: 'auto' }
type Result = { correct: number; total: number; at: number }

export interface ScreenContext {
  kind: 'question' | 'quest' | 'term' | 'moment' | 'scene' | 'simulator' | 'lab' | 'cards' | 'map' | 'page'
  label: string
  text: string
  answered?: boolean
}

export type TutorAskInput = string | { label: string; prompt: string; context?: string }

export const useApp = defineStore('app', {
  state: () => ({
    uid: load<string>('oq.uid', '') || (() => { const id = crypto.randomUUID(); save('oq.uid', id); return id })(),
    domain: load<DomainId>('sim4it.domain', 'options'),
    results: load<Record<string, Result>>('oq.results', {}),
    termStats: load<Record<string, { seen: number; correct: number }>>('oq.terms', {}),
    scenesDone: load<Record<string, boolean>>('sim4it.scenes', {}),
    byok: load<ByokCfg>('oq.byok', { provider: 'workers-ai', model: '', key: '', thinking: 'off' }),
    search: { ...SEARCH_DEFAULTS, ...load<Partial<SearchCfg>>('oq.search', {}) } as SearchCfg,
    openTerm: null as string | null,
    mapTerm: null as string | null,
    chatOpen: false,
    chatDraft: '',
    outfit: load<string | null>('sim4it.outfit', null),
    lang: 'en',
    pageContext: null as ScreenContext | null,
    pinnedContext: null as ScreenContext | null,
    authed: true as boolean | null,
  }),
  getters: {
    levelProgress: (s) => (ids: string[]) => ids.filter((id) => s.results[id]).length,
    mastery: (s) => (term: string) => { const t = s.termStats[term]; return t ? t.correct / Math.max(t.seen, 1) : null },
    byokPayload: (s) => (s.byok.provider === 'openai-compatible' ? (s.byok.baseUrl && s.byok.model ? { ...s.byok } : null)
      : s.byok.key || (s.byok.provider === 'workers-ai' && (s.byok.model || (s.byok.thinking ?? 'off') !== 'off')) ? { ...s.byok } : null),
    searchPayload: (s) => ({ mode: s.search.mode, cfProvider: s.search.cfProvider || undefined, exaKey: s.search.exaKey || undefined, numResults: s.search.numResults, exaType: s.search.exaType }),
  },
  actions: {
    setDomain(d: DomainId) {
      if (this.domain !== d) {
        this.domain = d
        this.openTerm = null
        this.mapTerm = null
        save('sim4it.domain', d)
      }
    },
    askTutor(input: TutorAskInput, ctx?: ScreenContext) {
      if (typeof input === 'string') {
        if (ctx) this.pinnedContext = ctx
        this.chatDraft = input
      } else {
        if (input.context) {
          this.pinnedContext = { kind: 'page', label: input.label, text: input.context }
        } else if (ctx) {
          this.pinnedContext = ctx
        }
        this.chatDraft = input.prompt
      }
      this.chatOpen = true
    },
    setOutfit(id: string | null) {
      this.outfit = id
      save('sim4it.outfit', id)
    },
    record(qid: string, correct: number, total: number, terms: string[]) {
      this.results[qid] = { correct, total, at: Date.now() }
      for (const t of terms) {
        const cur = this.termStats[t] ?? { seen: 0, correct: 0 }
        this.termStats[t] = { seen: cur.seen + 1, correct: cur.correct + (correct === total ? 1 : 0) }
      }
      save('oq.results', this.results); save('oq.terms', this.termStats)
    },
    markSceneDone(id: string) {
      this.scenesDone[id] = true
      save('sim4it.scenes', this.scenesDone)
    },
    setByok(cfg: ByokCfg) { this.byok = cfg; save('oq.byok', cfg) },
    setSearch(cfg: SearchCfg) { this.search = cfg; save('oq.search', cfg) },
    reset() {
      this.results = {}
      this.termStats = {}
      this.scenesDone = {}
      save('oq.results', {})
      save('oq.terms', {})
      save('sim4it.scenes', {})
    },
  },
})
