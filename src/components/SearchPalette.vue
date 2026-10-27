<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { DOMAIN_LIST } from '../lib/content'
import { PERSONA_LIST, SUBJECT_LIST, usePersonaNexus } from '../domains/topics'
import { presets } from '../lib/presets'
import { plain } from '../lib/api'
import { useApp } from '../stores/app'
import type { DomainId } from '../../shared/types'

type Item = { group: string; icon: string; title: string; sub: string; hay: string; go: () => void }

const app = useApp()
const nexus = usePersonaNexus()
const router = useRouter()
const open = ref(false)
const q = ref('')
const sel = ref(0)
const input = ref<HTMLInputElement>()
const list = ref<HTMLElement>()
let returnTo: HTMLElement | null = null

const low = (s: string) => s.toLowerCase()

const PAGES: [string, string, string, DomainId?][] = [
  ['/', '角色主页 (Role Home)', 'fa-compass'],
  ['/subjects', '选择课题 (Select Subjects)', 'fa-list-check'],
  ['/journey', 'Domain Journey', 'fa-route'],
  ['/cards', 'Skill Cards', 'fa-layer-group'],
  ['/map', 'Term Map', 'fa-diagram-project'],
  ['/moments', 'Market Moments (Options)', 'fa-bolt', 'options'],
  ['/scenes', 'Scenes & Studio Cases', 'fa-clapperboard'],
  ['/sim', 'Interactive Lab / Simulator', 'fa-sliders'],
  ['/settings', 'Settings & AI Models', 'fa-gear'],
]

const index = computed<Item[]>(() => {
  const items: Item[] = [
    ...PAGES.map(([to, title, icon, dom]) => ({
      group: 'Pages',
      icon,
      title,
      sub: dom ? `Switch to ${dom}` : '',
      hay: low(title),
      go: () => {
        if (dom) app.setDomain(dom)
        router.push(to)
      },
    })),
  ]

  for (const p of PERSONA_LIST) {
    items.push({
      group: 'Personas & Subjects',
      icon: p.icon,
      title: `[角色 ${p.id}] ${p.codename} · ${p.titleZh}`,
      sub: p.tagline,
      hay: low(`persona ${p.id} ${p.codename} ${p.titleZh} ${p.titleEn} ${p.tagline}`),
      go: () => {
        nexus.setPersona(p.id)
        router.push({ path: '/', query: { persona: p.id } })
      },
    })
  }
  for (const s of SUBJECT_LIST) {
    items.push({
      group: 'Personas & Subjects',
      icon: s.icon,
      title: `[课题 ${s.brand}] ${s.titleZh}`,
      sub: `${s.titleEn} · ${s.stats.join(' · ')}`,
      hay: low(`subject ${s.id} ${s.brand} ${s.titleZh} ${s.titleEn} ${s.summary}`),
      go: () => {
        if (s.domain) {
          app.setDomain(s.domain)
          router.push(s.primaryHref)
        } else {
          window.location.href = s.primaryHref
        }
      },
    })
  }
  for (const pack of DOMAIN_LIST) {
    for (const t of pack.terms) {
      items.push({
        group: 'Terms',
        icon: 'fa-book',
        title: `${t.name}${t.zh ? ' · ' + t.zh : ''}`,
        sub: `[${pack.brand}] ${t.short}`,
        hay: low(`${pack.brand} ${t.name} ${t.zh || ''} ${t.ja || ''} ${t.id} ${t.tags.join(' ')} ${t.short}`),
        go: () => {
          app.setDomain(pack.id)
          app.openTerm = t.id
        },
      })
    }

    if (pack.moments) {
      for (const m of pack.moments) {
        items.push({
          group: 'Cases & Moments',
          icon: 'fa-bolt',
          title: `[${pack.brand}] ${m.ticker} · ${m.date}`,
          sub: m.tags.join(' · '),
          hay: low(`${pack.brand} ${m.ticker} ${m.title} ${m.date} ${m.summary} ${m.tags.join(' ')}`),
          go: () => {
            app.setDomain(pack.id)
            router.push(`/moments/${m.id}/0`)
          },
        })
      }
    }

    if (pack.scenes) {
      for (const sc of pack.scenes) {
        items.push({
          group: 'Cases & Moments',
          icon: 'fa-clapperboard',
          title: `[${pack.brand}] ${sc.title}${sc.zh ? ' · ' + sc.zh : ''}`,
          sub: `${sc.genre} · ${sc.setup}`,
          hay: low(`${pack.brand} ${sc.title} ${sc.zh || ''} ${sc.genre} ${sc.setup} ${sc.tags.join(' ')}`),
          go: () => {
            app.setDomain(pack.id)
            router.push(`/scenes/${sc.id}`)
          },
        })
      }
    }

    for (const l of pack.levels) {
      const qs = pack.bank[l.n] || []
      qs.forEach((qq, i) => {
        items.push({
          group: 'Questions',
          icon: 'fa-circle-question',
          title: `[${pack.brand}] ${qq.title}`,
          sub: `L${l.n} ${l.name} · ${plain(qq.scenario)}`,
          hay: low(`${pack.brand} ${qq.title} ${plain(qq.scenario)} ${qq.terms.join(' ')} ${qq.tags.join(' ')} level ${l.n} ${l.name}`),
          go: () => {
            app.setDomain(pack.id)
            router.push(`/quest/${l.n}/${i}`)
          },
        })
      })
    }
  }

  for (const [k, [name]] of Object.entries(presets)) {
    items.push({
      group: 'Labs',
      icon: 'fa-sliders',
      title: `[Sim4Options] ${name}`,
      sub: 'Open in BS Payoff Simulator',
      hay: low(`options ${name} ${k} simulator`),
      go: () => {
        app.setDomain('options')
        router.push(`/sim?preset=${k}`)
      },
    })
  }

  return items
})

const LIMIT: Record<string, number> = { 'Personas & Subjects': 6, Pages: 4, Terms: 7, 'Cases & Moments': 6, Labs: 4, Questions: 8 }

const results = computed(() => {
  const words = low(q.value).split(/\s+/).filter(Boolean)
  if (!words.length) return [] as Item[]
  const scored = index.value
    .filter((it) => words.every((w) => it.hay.includes(w)))
    .map((it) => { const t = low(it.title); return { it, score: (t.startsWith(words[0]) ? 3 : 0) + (words.every((w) => t.includes(w)) ? 2 : 0) - t.length / 200 } })
    .sort((a, b) => b.score - a.score)
  const out: Item[] = []
  for (const g of Object.keys(LIMIT)) out.push(...scored.filter((x) => x.it.group === g).slice(0, LIMIT[g]).map((x) => x.it))
  return out
})

const counts = computed(() => {
  const words = low(q.value).split(/\s+/).filter(Boolean)
  const c: Record<string, number> = {}
  if (words.length) for (const it of index.value) if (words.every((w) => it.hay.includes(w))) c[it.group] = (c[it.group] ?? 0) + 1
  return c
})
watch(q, () => (sel.value = 0))

async function show() {
  returnTo = document.activeElement as HTMLElement | null
  open.value = true
  await nextTick()
  input.value?.focus()
  input.value?.select()
}
function hide() { open.value = false; returnTo?.focus?.() }
function run(it?: Item) { if (!it) return; open.value = false; q.value = ''; it.go() }
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); sel.value = Math.min(sel.value + 1, results.value.length - 1); scrollSel() }
  else if (e.key === 'ArrowUp') { e.preventDefault(); sel.value = Math.max(sel.value - 1, 0); scrollSel() }
  else if (e.key === 'Enter') { e.preventDefault(); run(results.value[sel.value]) }
  else if (e.key === 'Escape') { e.preventDefault(); hide() }
}
const scrollSel = () => nextTick(() => list.value?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }))
const onGlobal = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'p')) { e.preventDefault(); open.value ? hide() : show() }
}
onMounted(() => window.addEventListener('keydown', onGlobal))
onBeforeUnmount(() => window.removeEventListener('keydown', onGlobal))
defineExpose({ show })
</script>

<template>
  <button class="icon-btn" aria-label="Search everything (Ctrl+K)" title="Search everything (Ctrl+K)" @click="show"><i class="fa-solid fa-magnifying-glass" /></button>
  <Teleport to="body">
    <div v-if="open" class="scrim" @pointerdown.self="hide">
      <div class="palette" role="dialog" aria-modal="true" aria-label="Search" @keydown="onKey">
        <div class="field">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input id="site-search" ref="input" v-model="q" type="search" placeholder="Search J/S/T/D personas, Sim4Options, Sim4Director, Sim4Comics, 交易入道…" autocomplete="off" spellcheck="false"
            role="combobox" aria-expanded="true" aria-controls="search-results" :aria-activedescendant="results.length ? `sr-${sel}` : undefined" />
          <kbd>Esc</kbd>
        </div>
        <div id="search-results" ref="list" class="results" role="listbox" aria-label="Results">
          <template v-for="(it, i) in results" :key="i">
            <div v-if="i === 0 || results[i - 1].group !== it.group" class="group" role="presentation">
              {{ it.group }} <span>{{ counts[it.group] }}</span></div>
            <div :id="`sr-${i}`" class="item" role="option" :aria-selected="i === sel" @pointerenter="sel = i" @click="run(it)">
              <i :class="['fa-solid', 'fa-fw', it.icon]" aria-hidden="true" />
              <div class="txt"><b>{{ it.title }}</b><small v-if="it.sub">{{ it.sub }}</small></div>
            </div>
          </template>
          <p v-if="q && !results.length" class="empty">No results for “{{ q }}”. Try "theta", "Kuleshov", "McCloud", "JEV", or "Misegoma".</p>
          <p v-if="!q" class="empty">Search {{ index.length }} items across Sim4Options, Sim4Director, Sim4Comics, and 交易入道.</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.scrim { position: fixed; inset: 0; z-index: 70; background: rgb(26 23 18 / .3); display: flex; justify-content: center; align-items: flex-start; padding: calc(10vh + env(safe-area-inset-top, 0px)) 16px 16px; }
.palette { width: min(660px, 100%); max-height: min(560px, 78vh); display: flex; flex-direction: column; background: var(--panel); border: 2px solid var(--edge); border-radius: 18px; box-shadow: 5px 5px 0 var(--edge); overflow: hidden; }
.field { display: flex; align-items: center; gap: .6rem; padding: .7rem .9rem; border-bottom: 2px solid var(--edge); }
.field i { color: var(--muted); }
.field input { border: 0; padding: .2rem 0; font-size: 1.05rem; outline: none; background: transparent; }
kbd { font: 700 .72rem var(--ui); padding: .1rem .4rem; border: 1.5px solid var(--edge); border-radius: 6px; color: var(--muted); }
.results { overflow-y: auto; padding: .4rem; }
.group { display: flex; justify-content: space-between; padding: .55rem .6rem .25rem; font-size: .72rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--muted); }
.item { display: flex; gap: .7rem; align-items: flex-start; padding: .5rem .6rem; border-radius: 10px; cursor: pointer; }
.item i { margin-top: .2rem; color: var(--fox); }
.item[aria-selected='true'] { background: var(--pop); }
.txt { min-width: 0; display: grid; }
.txt b { font-weight: 800; }
.txt small { color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.empty { margin: .8rem .6rem; color: var(--muted); }
</style>
