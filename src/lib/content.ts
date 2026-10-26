import { computed } from 'vue'
import { DOMAINS, DOMAIN_LIST } from '../domains/registry'
import { useApp } from '../stores/app'
import type { Term } from '../../shared/types'

/** Global merged lookup across all domains (for TermSheet / Search / Graph fallback) */
export const GLOBAL_TERM_MAP: Record<string, Term> = Object.assign(
  {},
  DOMAINS.options.termMap,
  DOMAINS.director.termMap,
  DOMAINS.comics.termMap,
)

export function useDomainPack() {
  const app = useApp()
  return computed(() => DOMAINS[app.domain] || DOMAINS.options)
}

// Default exports for backward compatibility with options-first modules
export const BANK = DOMAINS.options.bank
export const TOTAL = DOMAINS.options.totalQuestions
export const LEVELS = DOMAINS.options.levels
export const TERMS = DOMAINS.options.terms
export const TERM_MAP = GLOBAL_TERM_MAP
export const MOMENTS = DOMAINS.options.moments!
export const ALL_TAGS = DOMAINS.options.allTags
export const TERM_WEIGHT = DOMAINS.options.termWeight
export { DOMAINS, DOMAIN_LIST }
