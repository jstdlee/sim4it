// Multi-domain content integrity check. Run: npx -y tsx scripts/check-content.ts
import * as options from '../content/options/index'
import * as director from '../content/director/index'
import * as comics from '../content/comics/index'
import type { Step, Term, Level, Question, Moment, Scene } from '../shared/types'

const errs: string[] = []
const LINK = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
const links = (s: string) => [...s.matchAll(LINK)].map((m) => m[1].trim())

function checkDomain(
  name: string,
  terms: Term[],
  termMap: Record<string, Term>,
  levels: Level[],
  bank: Record<number, Question[]>,
  targets: Record<number, number>,
  moments?: Moment[],
  scenes?: Scene[],
) {
  const termOk = (id: string, where: string) => {
    if (!termMap[id]) errs.push(`[${name}] ${where}: unknown term "${id}"`)
  }
  const checkStep = (st: Step, where: string) => {
    const rawChoices = st.choices.map((c, i) => typeof c === 'string' ? { id: String.fromCharCode(97 + i), label: c } : c)
    const ids = rawChoices.map((c) => c.id)
    const ans = typeof st.answer === 'number' ? rawChoices[st.answer]?.id : String(st.answer)
    if (new Set(ids).size !== ids.length) errs.push(`[${name}] ${where}: duplicate choice ids`)
    if (new Set(rawChoices.map((c) => c.label)).size !== ids.length) errs.push(`[${name}] ${where}: duplicate choice labels`)
    if (!ans || !ids.includes(ans)) errs.push(`[${name}] ${where}: answer "${st.answer}" not in choices`)
    if (rawChoices.length < 2) errs.push(`[${name}] ${where}: fewer than 2 choices`)
    const whyText = st.why ?? st.exp ?? ''
    for (const t of [...links(st.prompt), ...links(whyText)]) termOk(t, where)
  }

  const tids = terms.map((t) => t.id)
  for (const id of tids.filter((id, i) => tids.indexOf(id) !== i)) errs.push(`[${name}] duplicate term id "${id}"`)
  for (const t of terms) {
    for (const r of t.related) termOk(r, `term ${t.id}.related`)
    if (t.related.includes(t.id)) errs.push(`[${name}] term ${t.id} relates to itself`)
    if (!t.tags.length) errs.push(`[${name}] term ${t.id} has no tags`)
  }

  const qids = new Set<string>()
  for (const { n } of levels) {
    for (const q of bank[n] ?? []) {
      if (qids.has(q.id)) errs.push(`[${name}] duplicate question id ${q.id}`)
      qids.add(q.id)
      if (q.level !== n) errs.push(`[${name}] ${q.id}: level ${q.level} filed under ${n}`)
      for (const t of q.terms) termOk(t, `${q.id}.terms`)
      for (const t of links(q.scenario)) termOk(t, `${q.id}.scenario`)
      q.steps.forEach((st, i) => checkStep(st, `${q.id} step ${i + 1}`))
    }
  }

  if (moments) {
    const mids = new Set<string>()
    for (const m of moments) {
      if (mids.has(m.id)) errs.push(`[${name}] duplicate moment id ${m.id}`)
      mids.add(m.id)
      for (const t of m.terms) termOk(t, `${m.id}.terms`)
      for (const t of links(m.outcome)) termOk(t, `${m.id}.outcome`)
      if (m.checkpoints.length < 2) errs.push(`[${name}] ${m.id}: fewer than 2 checkpoints`)
      m.checkpoints.forEach((c, i) => checkStep(c.step, `${m.id} checkpoint ${i + 1}`))
    }
  }

  if (scenes) {
    const sids = new Set<string>()
    for (const s of scenes) {
      if (sids.has(s.id)) errs.push(`[${name}] duplicate scene id ${s.id}`)
      sids.add(s.id)
      for (const t of s.terms) termOk(t, `${s.id}.terms`)
      for (const t of links(s.outcome)) termOk(t, `${s.id}.outcome`)
      if (s.checkpoints.length < 2) errs.push(`[${name}] ${s.id}: fewer than 2 checkpoints`)
      s.checkpoints.forEach((c, i) => checkStep(c.step, `${s.id} checkpoint ${i + 1}`))
    }
  }

  const authored = Object.values(bank).flat().filter((q) => !q.generated).length
  console.log(`[${name}] terms ${terms.length} · questions ${qids.size} (authored ${authored}, targets ${Object.values(targets).reduce((a, b) => a + b, 0)}) · cases ${(moments?.length ?? 0) + (scenes?.length ?? 0)}`)
}

checkDomain('Sim4Options', options.TERMS, options.TERM_MAP, options.LEVELS, options.buildBank(), options.TARGETS, options.MOMENTS)
checkDomain('Sim4Director', director.TERMS, director.TERM_MAP, director.LEVELS, director.buildBank(), director.TARGETS, undefined, director.SCENES)
checkDomain('Sim4Comics', comics.TERMS, comics.TERM_MAP, comics.LEVELS, comics.buildBank(), comics.TARGETS, undefined, comics.SCENES)

if (errs.length) {
  console.log(`${errs.length} problem(s):\n- ` + errs.slice(0, 80).join('\n- '))
  process.exit(1)
}
console.log('ALL 3 DOMAINS CONTENT OK')
