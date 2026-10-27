<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { DOMAINS, DOMAIN_LIST, UPCOMING_DOMAINS, type DomainPack } from '../domains/registry'
import { useApp } from '../stores/app'
import { usePageContext } from '../lib/context'
import { GLOBAL_TERM_MAP, useDomainPack } from '../lib/content'
import { plain } from '../lib/api'
import TermText from '../components/TermText.vue'
import type { DomainId, Question, Step, Term } from '../../shared/types'

const app = useApp()
const router = useRouter()
const pack = useDomainPack()

/* ---------- progress helpers (per domain, all reactive through app.results) ---------- */
const qsOf = (p: DomainPack, n: number): Question[] => p.bank[n] ?? []
const levelDone = (p: DomainPack, n: number) => app.levelProgress(qsOf(p, n).map((q) => q.id))
const levelTotal = (p: DomainPack, n: number) => qsOf(p, n).length
const levelComplete = (p: DomainPack, n: number) => levelTotal(p, n) > 0 && levelDone(p, n) >= levelTotal(p, n)
const firstOpen = (p: DomainPack, n: number) => Math.max(0, qsOf(p, n).findIndex((q) => !app.results[q.id]))
const domainTotal = (p: DomainPack) => p.totalQuestions
const domainDone = (p: DomainPack) => app.levelProgress(p.allQuestions.map((q) => q.id))
const casesCount = (p: DomainPack) => (p.moments?.length ?? 0) + (p.scenes?.length ?? 0)
const casesPath = (p: DomainPack) => (p.id === 'options' ? '/moments' : '/scenes')
const ratio = (done: number, total: number) => `${total > 0 ? Math.min(100, (done / total) * 100) : 0}%`
const termName = (p: DomainPack, id: string) => p.termMap[id]?.name ?? GLOBAL_TERM_MAP[id]?.name ?? id

const totalQuestions = computed(() => DOMAIN_LIST.reduce((s, p) => s + domainTotal(p), 0))
const totalDone = computed(() => DOMAIN_LIST.reduce((s, p) => s + domainDone(p), 0))
const totalTerms = computed(() => DOMAIN_LIST.reduce((s, p) => s + p.terms.length, 0))
const totalCases = computed(() => DOMAIN_LIST.reduce((s, p) => s + casesCount(p), 0))

/* ---------- navigation ---------- */
/** Set the active track, then navigate. */
function enterDomain(id: DomainId, path = '/journey') {
  app.setDomain(id)
  router.push(path)
}
/** Switch the active track in place without leaving the landing page. */
function previewDomain(id: DomainId) {
  app.setDomain(id)
}
function previewBelow(id: DomainId) {
  app.setDomain(id)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById('workbench')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

/* ---------- mentor stage ---------- */
const MENTOR_POSE: Record<DomainId, string> = { options: 'wave', director: 'director', comics: 'study' }
const mentorSrc = (p: DomainPack, pose?: string) => `/${p.mascot.dir}/${pose ?? MENTOR_POSE[p.id]}.webp`

/* ---------- quick resume: next incomplete level and quest in the active track ---------- */
const resume = computed(() => {
  const p = pack.value
  const lvl = p.levels.find((l) => levelTotal(p, l.n) > 0 && !levelComplete(p, l.n)) ?? p.levels.find((l) => levelTotal(p, l.n) > 0)
  if (!lvl) return null
  const idx = firstOpen(p, lvl.n)
  return {
    level: lvl,
    idx,
    q: qsOf(p, lvl.n)[idx],
    total: levelTotal(p, lvl.n),
    cleared: domainDone(p) >= domainTotal(p),
  }
})

const stageLine = computed(() => {
  const p = pack.value
  const r = resume.value
  if (!r) return ''
  if (r.cleared) return `${p.mascot.name}: Track cleared. Run the Cases and the Lab next.`
  const done = domainDone(p)
  if (done === 0) return `${p.mascot.name}: Start with L${r.level.n} ${r.level.name}. One quest at a time.`
  return `${p.mascot.name}: ${done} of ${domainTotal(p)} done. Next up, L${r.level.n} ${r.level.name}.`
})

/* ---------- workbench tabs ---------- */
type Tab = 'ladder' | 'sampler' | 'cards'
const TABS: { id: Tab; label: string; zh: string; icon: string }[] = [
  { id: 'ladder', label: 'Level Ladder', zh: '闯关路线图', icon: 'fa-route' },
  { id: 'sampler', label: 'Live Decision Sampler', zh: '实战推演试炼', icon: 'fa-bolt' },
  { id: 'cards', label: 'Featured Trilingual Cards', zh: '核心三语闪卡', icon: 'fa-layer-group' },
]
const tab = ref<Tab>('ladder')

function startLabel(n: number) {
  const p = pack.value
  if (levelComplete(p, n)) return `Review L${n}`
  return levelDone(p, n) === 0 ? `Start L${n}` : `Continue L${n}`
}

/* ---------- live decision sampler ---------- */
interface Sample { level: number; idx: number; q: Question }

const samples = computed<Sample[]>(() => {
  const p = pack.value
  const withQs = p.levels.filter((l) => levelTotal(p, l.n) > 0)
  if (withQs.length === 0) return []
  // Early, middle and late level, so the visitor sees the track's range.
  const picks = [withQs[0], withQs[Math.floor((withQs.length - 1) / 2)], withQs[withQs.length - 1]]
  const levels = [...new Set(picks.map((l) => l.n))]
  return levels.map((n) => {
    const list = qsOf(p, n)
    const idx = Math.floor(list.length / 2)
    return { level: n, idx, q: list[idx] }
  })
})

const sampleAt = ref(0)
const stepAt = ref<Record<string, number>>({})
const picks = ref<Record<string, string>>({})

const sample = computed(() => samples.value[sampleAt.value] ?? null)
const qKey = computed(() => (sample.value ? `${app.domain}:${sample.value.q.id}` : ''))
const stepIdx = computed(() => (qKey.value ? stepAt.value[qKey.value] ?? 0 : 0))
const step = computed<Step | null>(() => sample.value?.q.steps[stepIdx.value] ?? null)
const pickKey = computed(() => (qKey.value ? `${qKey.value}:${stepIdx.value}` : ''))
const pickedId = computed(() => (pickKey.value ? picks.value[pickKey.value] : undefined))
const verdictOk = computed(() => !!step.value && pickedId.value === step.value.answer)
const answerLabel = computed(() => step.value?.choices.find((c) => c.id === step.value?.answer)?.label ?? '')
const letter = (i: number) => String.fromCharCode(65 + i)

function choose(id: string) {
  if (pickedId.value || !pickKey.value) return
  picks.value = { ...picks.value, [pickKey.value]: id }
}
function choiceState(id: string) {
  if (!pickedId.value || !step.value) return ''
  if (id === step.value.answer) return 'right'
  if (id === pickedId.value) return 'wrong'
  return 'dim'
}
function nextStep() {
  const s = sample.value
  if (!s || !qKey.value) return
  if (stepIdx.value < s.q.steps.length - 1) stepAt.value = { ...stepAt.value, [qKey.value]: stepIdx.value + 1 }
}
function askTutor() {
  const s = sample.value
  const st = step.value
  if (!s || !st) return
  const mine = st.choices.find((c) => c.id === pickedId.value)?.label
  app.askTutor({
    label: `${pack.value.brand} · ${s.q.title}`,
    prompt: mine
      ? `I answered "${mine}" on "${s.q.title}". Walk me through why the correct choice holds.`
      : `Help me think through "${s.q.title}" before I choose. Give hints, not the answer.`,
    context: `${plain(s.q.scenario)} Step ${stepIdx.value + 1} of ${s.q.steps.length}: ${plain(st.prompt)} Choices: ${st.choices.map((c) => c.label).join(' | ')}`,
  })
}
// Each domain has its own sample set, so start from the first sample when the track changes.
watch(() => app.domain, () => { sampleAt.value = 0 })

/* ---------- featured trilingual cards ---------- */
const featured = computed<Term[]>(() => {
  const p = pack.value
  return [...p.terms].sort((a, b) => (p.termWeight[b.id] ?? 0) - (p.termWeight[a.id] ?? 0)).slice(0, 6)
})

/* ---------- Sim4Comics deep-dive matrix ---------- */
const COMICS = DOMAINS.comics
const COMICS_PILLARS = [
  {
    no: '01',
    icon: 'fa-book-open',
    accent: 'var(--fox)',
    title: 'Scott McCloud & 5 Manga Masters',
    blurb: 'Closure in the gutter, six panel transitions, the Big Triangle and seven word-picture modes, read with Tezuka montage, Toriyama impact flow, Inoue silent Ma, Otomo deep focus and Urasawa Hiki hooks.',
    terms: ['closure', 'big_triangle', 'tezuka_montage', 'inoue_ma', 'urasawa_cliffhanger'],
    levels: [1, 3],
  },
  {
    no: '02',
    icon: 'fa-microchip',
    accent: 'var(--teal)',
    title: 'JEV System 2/1 · 14-Factor & 52-Micro-Factor Engine',
    blurb: 'A System 2 compiler defines five operators (Decompose, Horizon, Weight, Joint, Degrade). System 1 (/v1/systemone) runs them in milliseconds. A 5-pass polling funnel scores 14 orthogonal factors (F01–F14) and 52 micro-factors across nine domains.',
    terms: ['jev_two_tier', 'jev_five_operators', 'jev_five_pass_funnel', 'shannon_entropy_gate'],
    levels: [5, 6],
  },
  {
    no: '03',
    icon: 'fa-table-columns',
    accent: 'var(--call)',
    title: 'tldraw-manga 3-Tier Polygon & 6-Axis layoutScore',
    blurb: 'Page → Strip → Polygon Panel topology, a five-stage workbench, five geometry sliders, and 36 seeded layouts graded on six editor axes (layoutScore) with one-click prescriptions. Exports to a five-layer .ora and HTML.',
    terms: ['tldraw_3tier', 'tldraw_5stage', 'tldraw_5d_geometry', 'tldraw_layout_score'],
    levels: [7],
  },
]

/* ---------- masthead decoration (static) ---------- */
const RAYS = Array.from({ length: 36 }, (_, i) => {
  const a = (i / 36) * Math.PI * 2
  const r0 = 130 + ((i * 37) % 5) * 14
  const r1 = 580
  return { x1: 780 + Math.cos(a) * r0, y1: 210 + Math.sin(a) * r0, x2: 780 + Math.cos(a) * r1, y2: 210 + Math.sin(a) * r1, w: 1 + ((i * 13) % 3) }
})

usePageContext(() => ({
  kind: 'page',
  label: 'Sim4It Unified Knowledge Portal',
  text: `Sim4It landing page. ${DOMAIN_LIST.map((p) => `${p.brand}: ${domainDone(p)}/${domainTotal(p)} quests done, ${p.terms.length} terms, ${casesCount(p)} cases`).join('; ')}. Previewing ${pack.value.brand}.`,
}))
</script>

<template>
  <div class="wrap landing">
    <!-- 1. Masthead: live totals, global mastery, mentor stage -->
    <section class="card hero" aria-labelledby="hero-title">
      <svg class="rays" viewBox="0 0 1000 420" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
        <line v-for="(r, k) in RAYS" :key="k" :x1="r.x1" :y1="r.y1" :x2="r.x2" :y2="r.y2" :stroke-width="r.w" />
      </svg>
      <div class="dots" aria-hidden="true" />

      <div class="copy">
        <span class="chip on">Sim4It · Interactive Decision &amp; Mastery Portal</span>
        <h1 id="hero-title">Simulate the Craft. <span class="mark">实战推演知识库</span></h1>
        <p class="read">
          One interactive engine for three high-stakes decision tracks:
          <strong>Options Trading (Sim4Options)</strong>, <strong>Film &amp; Animation Directing (Sim4Director)</strong>, and
          <strong>Manga Storyboarding &amp; JEV Decision Architecture (Sim4Comics)</strong>.
          Each track shares one trilingual concept graph, multi-step decision quests, and a live lab.
        </p>

        <dl class="totals">
          <div><dt>Decision quests</dt><dd>{{ totalQuestions }}</dd></div>
          <div><dt>Trilingual cards</dt><dd>{{ totalTerms }}</dd></div>
          <div><dt>Cases</dt><dd>{{ totalCases }}</dd></div>
          <div><dt>Interactive labs</dt><dd>{{ DOMAIN_LIST.length }}</dd></div>
        </dl>

        <div class="global-meter">
          <div class="spread small-meta">
            <span>Global mastery across all tracks</span>
            <strong>{{ totalDone }} / {{ totalQuestions }} quests</strong>
          </div>
          <div class="meter"><span :style="{ width: ratio(totalDone, totalQuestions) }" /></div>
        </div>

        <ul class="dpills" aria-label="Progress by track">
          <li v-for="p in DOMAIN_LIST" :key="p.id" class="dpill">
            <i :class="['fa-solid', p.icon]" aria-hidden="true" />
            <span>{{ p.brand }}</span>
            <b>{{ domainDone(p) }}/{{ domainTotal(p) }}</b>
            <span class="meter mini"><span :style="{ width: ratio(domainDone(p), domainTotal(p)), background: p.accent }" /></span>
          </li>
        </ul>
      </div>

      <aside class="stage" aria-label="Active mentor">
        <div class="bubble stage-bubble" aria-live="polite">{{ stageLine }}</div>
        <img :src="mentorSrc(pack, resume?.cleared ? 'cheer' : undefined)" :alt="pack.mascot.name" class="stage-img" />
        <p class="stage-name"><b>{{ pack.mascot.name }}</b> <span class="muted">· {{ pack.mascot.role }}</span></p>
        <div class="switcher" role="group" aria-label="Switch track">
          <button
            v-for="p in DOMAIN_LIST"
            :key="p.id"
            class="switch"
            :class="{ on: app.domain === p.id }"
            :aria-pressed="app.domain === p.id"
            @click="previewDomain(p.id)"
          >
            <i :class="['fa-solid', p.icon]" aria-hidden="true" />
            <span class="grow">{{ p.brand }}</span>
            <small>{{ p.mascot.name }}</small>
          </button>
        </div>
      </aside>
    </section>

    <!-- 2. Quick resume bar for the active track -->
    <section v-if="resume" class="card resume" aria-label="Quick resume">
      <div class="resume-main">
        <span class="eyebrow"><i class="fa-solid fa-forward-step" aria-hidden="true" /> {{ resume.cleared ? 'Track cleared' : 'Next up' }} · {{ pack.brand }}</span>
        <strong class="resume-title">
          L{{ resume.level.n }} · {{ resume.level.name }}
          <span class="muted">Q{{ resume.idx + 1 }} of {{ resume.total }}</span>
        </strong>
        <span class="muted small">{{ resume.q?.title }}</span>
      </div>
      <button class="btn primary" @click="enterDomain(pack.id, `/quest/${resume.level.n}/${resume.idx}`)">
        Resume quest <i class="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
      <div class="quick" aria-label="Quick links">
        <button class="btn" @click="enterDomain(pack.id, '/cards')"><i class="fa-solid fa-layer-group" aria-hidden="true" />Cards</button>
        <button class="btn" @click="enterDomain(pack.id, '/map')"><i class="fa-solid fa-diagram-project" aria-hidden="true" />Term Map</button>
        <button class="btn" @click="enterDomain(pack.id, casesPath(pack))"><i class="fa-solid fa-clapperboard" aria-hidden="true" />Cases</button>
        <button class="btn" @click="enterDomain(pack.id, '/sim')"><i class="fa-solid fa-sliders" aria-hidden="true" />Lab</button>
        <a class="btn" href="/rudao"><i class="fa-solid fa-book-open" aria-hidden="true" />《交易入道》</a>
      </div>
    </section>

    <!-- 3. Primary knowledge tracks -->
    <section class="section" aria-labelledby="tracks-title">
      <div class="section-head">
        <h2 id="tracks-title">Active Knowledge Tracks · 核心实战专栏</h2>
        <p class="muted">Each track has its own level ladder, skill cards, concept graph, cases, and lab.</p>
      </div>

      <div class="tracks-grid">
        <article
          v-for="p in DOMAIN_LIST"
          :key="p.id"
          class="card track"
          :class="{ current: app.domain === p.id }"
          :style="{ '--accent': p.accent }"
        >
          <header class="spread">
            <span class="track-badge"><i :class="['fa-solid', p.icon]" aria-hidden="true" /> {{ p.brand }}</span>
            <span class="chip">{{ p.levels.length }} Levels · {{ domainTotal(p) }} Quests</span>
          </header>

          <div class="track-title">
            <div class="track-names">
              <h3>{{ p.zhTitle }}</h3>
              <p class="sub">{{ p.title }}</p>
              <p class="ja muted">{{ p.jaTitle }}</p>
            </div>
            <img :src="mentorSrc(p)" :alt="p.mascot.name" :title="p.mascot.name" class="sticker" />
          </div>

          <p class="muted desc">{{ p.description }}</p>

          <ul class="hl">
            <li v-for="h in p.highlights" :key="h"><i class="fa-solid fa-check" aria-hidden="true" />{{ h }}</li>
          </ul>

          <div class="row cats" aria-label="Categories">
            <button
              v-for="c in p.cats.slice(0, 6)"
              :key="c.id"
              class="chip mini-chip"
              :title="`Open ${c.name} cards`"
              @click="enterDomain(p.id, `/cards?cat=${c.id}`)"
            >
              <span class="dot" :style="{ background: c.color }" />{{ c.zh || c.name }}
            </button>
            <span v-if="p.cats.length > 6" class="chip mini-chip">+{{ p.cats.length - 6 }} more</span>
          </div>

          <div class="track-stats">
            <div><b>{{ p.terms.length }}</b><small>Skill Cards</small></div>
            <div><b>{{ domainTotal(p) }}</b><small>Decision Quests</small></div>
            <div><b>{{ casesCount(p) }}</b><small>Cases</small></div>
          </div>

          <div class="meter-row">
            <div class="spread small-meta">
              <span>Track progress</span>
              <b>{{ domainDone(p) }} / {{ domainTotal(p) }}</b>
            </div>
            <div class="meter"><span :style="{ width: ratio(domainDone(p), domainTotal(p)), background: p.accent }" /></div>
          </div>

          <div class="track-actions">
            <button class="btn primary" @click="enterDomain(p.id, '/journey')">Enter Journey <i class="fa-solid fa-arrow-right" aria-hidden="true" /></button>
            <button class="btn" @click="previewBelow(p.id)"><i class="fa-solid fa-eye" aria-hidden="true" />Preview Below</button>
            <button class="btn" @click="enterDomain(p.id, '/cards')"><i class="fa-solid fa-layer-group" aria-hidden="true" />Cards</button>
            <button class="btn" @click="enterDomain(p.id, casesPath(p))"><i class="fa-solid fa-clapperboard" aria-hidden="true" />Cases</button>
            <button class="btn" @click="enterDomain(p.id, '/sim')"><i class="fa-solid fa-sliders" aria-hidden="true" />Lab</button>
            <a v-if="p.id === 'options'" class="btn" href="/rudao"><i class="fa-solid fa-book-open" aria-hidden="true" />交易入道</a>
          </div>
        </article>
      </div>
    </section>

    <!-- 4. Interactive domain workbench -->
    <section id="workbench" class="card workbench" aria-labelledby="wb-title">
      <div class="spread">
        <div>
          <p class="eyebrow">Interactive workbench · {{ pack.brand }}</p>
          <h2 id="wb-title">{{ pack.zhTitle }} · {{ pack.title }}</h2>
        </div>
        <div class="seg" role="group" aria-label="Choose workbench track">
          <button v-for="p in DOMAIN_LIST" :key="p.id" :class="{ on: app.domain === p.id }" :aria-pressed="app.domain === p.id" @click="previewDomain(p.id)">
            {{ p.brand }}
          </button>
        </div>
      </div>

      <div class="tabs" role="group" aria-label="Workbench views">
        <button
          v-for="t in TABS"
          :key="t.id"
          :class="{ on: tab === t.id }"
          :aria-pressed="tab === t.id"
          @click="tab = t.id"
        >
          <i :class="['fa-solid', t.icon]" aria-hidden="true" /> {{ t.label }} · {{ t.zh }}
        </button>
      </div>

      <!-- (a) Level ladder -->
      <ol v-if="tab === 'ladder'" class="ladder">
        <li v-for="l in pack.levels" :key="l.n" class="rung" :class="{ done: levelComplete(pack, l.n), now: resume?.level.n === l.n }">
          <div class="rung-num" aria-hidden="true"><span>L</span>{{ l.n }}</div>
          <div class="rung-body">
            <div class="spread rung-title">
              <h3>{{ l.name }}</h3>
              <span class="muted small">{{ l.zh }}<template v-if="l.ja"> · {{ l.ja }}</template></span>
            </div>
            <p class="muted small">{{ l.blurb }}</p>
            <div class="row tags">
              <span v-for="cid in l.cats ?? []" :key="cid" class="chip mini-chip">
                <span class="dot" :style="{ background: pack.catMap[cid]?.color }" />{{ pack.catMap[cid]?.name ?? cid }}
              </span>
            </div>
            <div class="meter-row">
              <div class="spread small-meta">
                <span>{{ levelDone(pack, l.n) }} / {{ levelTotal(pack, l.n) }} quests</span>
                <span v-if="levelComplete(pack, l.n)"><i class="fa-solid fa-circle-check" aria-hidden="true" /> Complete</span>
              </div>
              <div class="meter"><span :style="{ width: ratio(levelDone(pack, l.n), levelTotal(pack, l.n)), background: pack.accent }" /></div>
            </div>
          </div>
          <button
            class="btn"
            :class="{ primary: !levelComplete(pack, l.n) }"
            :disabled="levelTotal(pack, l.n) === 0"
            @click="enterDomain(pack.id, `/quest/${l.n}/${firstOpen(pack, l.n)}`)"
          >
            {{ startLabel(l.n) }} <i class="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </li>
      </ol>

      <!-- (b) Live decision sampler -->
      <div v-else-if="tab === 'sampler'" class="sampler">
        <div class="sampler-pick" role="group" aria-label="Sample questions">
          <button
            v-for="(s, i) in samples"
            :key="s.q.id"
            :class="{ on: i === sampleAt }"
            :aria-pressed="i === sampleAt"
            @click="sampleAt = i"
          >
            <span class="mono">L{{ s.level }} · Q{{ s.idx + 1 }}</span>
            <span>{{ s.q.title }}</span>
          </button>
        </div>

        <article v-if="sample && step" class="scene">
          <p class="scenario"><TermText :text="sample.q.scenario" /></p>
          <p class="step-meta muted">Step {{ stepIdx + 1 }} of {{ sample.q.steps.length }}</p>
          <h3 class="step-prompt"><TermText :text="step.prompt" /></h3>

          <div class="choices">
            <button
              v-for="(c, i) in step.choices"
              :key="c.id"
              class="choice"
              :class="choiceState(c.id)"
              :disabled="!!pickedId"
              @click="choose(c.id)"
            >
              <span class="letter">{{ letter(i) }}</span>
              <span>{{ c.label }}</span>
            </button>
          </div>

          <div v-if="pickedId" class="verdict" :class="verdictOk ? 'ok' : 'no'" role="status">
            <strong>
              <i :class="['fa-solid', verdictOk ? 'fa-circle-check' : 'fa-circle-xmark']" aria-hidden="true" />
              {{ verdictOk ? 'Correct' : 'Incorrect' }}
            </strong>
            <p v-if="!verdictOk" class="small muted">The answer is {{ answerLabel }}.</p>
            <p class="why"><TermText :text="step.why" /></p>
          </div>

          <div class="scene-actions">
            <button v-if="pickedId && stepIdx < sample.q.steps.length - 1" class="btn" @click="nextStep">
              Next step <i class="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
            <button class="btn primary" @click="enterDomain(pack.id, `/quest/${sample.level}/${sample.idx}`)">
              Open Full Quest <i class="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
            <button class="btn" @click="askTutor">
              <i class="fa-solid fa-comments" aria-hidden="true" />Ask AI Tutor
            </button>
          </div>
        </article>
        <p v-else class="muted">No sample questions in this track yet.</p>
      </div>

      <!-- (c) Featured trilingual cards -->
      <div v-else class="tcards">
        <article v-for="t in featured" :key="t.id" class="tcard" :style="{ '--c': pack.catMap[t.cat]?.color ?? 'var(--edge)' }">
          <button class="tcard-open" :aria-label="`Open card: ${t.name}`" @click="app.openTerm = t.id">
            <span class="cat-tag" :style="{ background: pack.catMap[t.cat]?.color }">
              <i v-if="pack.catMap[t.cat]" :class="['fa-solid', pack.catMap[t.cat].icon ?? 'fa-circle']" aria-hidden="true" />
              {{ pack.catMap[t.cat]?.name ?? t.cat }}
            </span>
            <span class="tname">{{ t.name }}</span>
            <span class="tzj muted small">{{ t.zh }}<template v-if="t.ja"> · {{ t.ja }}</template></span>
            <span class="tshort">{{ plain(t.short) }}</span>
            <code v-if="t.formula" class="formula">{{ t.formula }}</code>
          </button>
          <div class="row related">
            <button v-for="r in t.related.slice(0, 3)" :key="r" class="chip" @click="app.openTerm = r">{{ termName(pack, r) }}</button>
          </div>
        </article>
      </div>
    </section>

    <!-- 5. Sim4Comics deep-dive architecture matrix -->
    <section class="section" aria-labelledby="comics-title">
      <div class="spread section-head">
        <div>
          <p class="eyebrow">Sim4Comics · new track</p>
          <h2 id="comics-title">Three pillars of manga decision craft · 漫画分镜三大支柱</h2>
          <p class="muted">Theory, decision engine and studio tooling, with direct links into the matching levels.</p>
        </div>
        <div class="row">
          <button class="btn primary" @click="enterDomain('comics', '/journey')">Explore Sim4Comics <i class="fa-solid fa-arrow-right" aria-hidden="true" /></button>
          <button class="btn" @click="enterDomain('comics', '/sim?domain=comics')"><i class="fa-solid fa-sliders" aria-hidden="true" />Koma &amp; JEV Lab</button>
        </div>
      </div>

      <div class="matrix">
        <article v-for="pl in COMICS_PILLARS" :key="pl.no" class="card pillar" :style="{ '--c': pl.accent }">
          <div class="spread">
            <span class="pillar-no">{{ pl.no }}</span>
            <i :class="['fa-solid', pl.icon, 'pillar-ico']" aria-hidden="true" />
          </div>
          <h3>{{ pl.title }}</h3>
          <p class="muted">{{ pl.blurb }}</p>

          <div class="row chips">
            <button v-for="id in pl.terms" :key="id" class="chip" @click="app.openTerm = id">{{ termName(COMICS, id) }}</button>
          </div>

          <div class="row acts">
            <button
              v-for="n in pl.levels"
              :key="n"
              class="btn"
              :disabled="COMICS.bank[n]?.length === 0"
              @click="enterDomain('comics', `/quest/${n}/${firstOpen(COMICS, n)}`)"
            >
              L{{ n }} · {{ COMICS.levels.find((l) => l.n === n)?.name }}
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- 6. Companion handbooks and extensible registry -->
    <section class="section" aria-labelledby="ext-title">
      <div class="section-head">
        <h2 id="ext-title">Companion Handbooks &amp; Extensible Track Registry · 扩展知识矩阵</h2>
        <p class="muted">
          Tracks are <code>DomainPack</code> entries in <code>src/domains/registry.ts</code>. A new <code>sim4*</code> track
          registers its terms, questions, cases, and lab component, and then appears on this page automatically.
        </p>
      </div>

      <div class="ext-grid">
        <a href="/rudao" class="card ext">
          <span class="chip on"><i class="fa-solid fa-book-bookmark" aria-hidden="true" /> Companion handbook</span>
          <h3>《交易入道》· 概念术语与实操手册</h3>
          <p class="muted small">Jesse Lau (@jesselaunz) 闲云九法, a 103-item tweet compendium, option seller and hedging SOPs, and a full reading index.</p>
          <span class="ext-link">Open handbook (/rudao) <i class="fa-solid fa-arrow-right" aria-hidden="true" /></span>
        </a>

        <RouterLink to="/gallery" class="card ext">
          <span class="chip on"><i class="fa-solid fa-palette" aria-hidden="true" /> Mascot &amp; outfit studio</span>
          <h3>Mascot &amp; Outfit Studio · 角色与服装工坊</h3>
          <p class="muted small">Browse Kon, Hikari, and Sensei Sumi in every pose, and pick an outfit that carries across all tracks.</p>
          <span class="ext-link">Open studio (/gallery) <i class="fa-solid fa-arrow-right" aria-hidden="true" /></span>
        </RouterLink>

        <div v-for="u in UPCOMING_DOMAINS" :key="u.id" class="card ext upcoming">
          <span class="chip"><i :class="['fa-solid', u.icon]" aria-hidden="true" /> {{ u.brand }} · {{ u.badge }}</span>
          <h3>{{ u.zhTitle }} · {{ u.subtitle }}</h3>
          <p class="muted small">{{ u.blurb }}</p>
          <div class="row chips">
            <span v-for="pl in u.pillars" :key="pl" class="chip mini-chip">{{ pl }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Base card: the app's .surface pattern, defined here because style.css has no .card. */
.card { background: var(--panel); border: 2px solid var(--edge); border-radius: 16px; padding: 1.15rem; box-shadow: var(--shadow); }

.spread { display: flex; justify-content: space-between; align-items: center; gap: .6rem; flex-wrap: wrap; }
.eyebrow { margin: 0 0 .3rem; font-size: .74rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.small { font-size: .86rem; margin: 0; line-height: 1.55; }
.small-meta { font-size: .8rem; color: var(--muted); }
.mono { font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace; font-size: .8rem; }
.section { margin-bottom: 1.8rem; }
.section-head { margin-bottom: .9rem; }
.section-head h2 { margin: 0; font-size: 1.4rem; }
.section-head p { margin: .2rem 0 0; font-size: .92rem; }
.landing :deep(code) { font-size: .85em; background: var(--ink); border: 1px solid var(--line); border-radius: 6px; padding: 0 .3rem; }

/* 1. Masthead */
.hero {
  position: relative; overflow: hidden; margin: .8rem 0 1.2rem; padding: 1.9rem clamp(1.1rem, 4vw, 2.4rem);
  display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(0, .8fr); align-items: center; gap: 1.4rem;
  border-radius: 20px; box-shadow: 4px 4px 0 var(--edge);
}
.rays { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.rays line { stroke: var(--edge); opacity: .07; stroke-linecap: round; }
.dots {
  position: absolute; left: -40px; bottom: -40px; width: 260px; height: 200px; pointer-events: none;
  background: radial-gradient(var(--pop) 2.2px, transparent 2.6px) 0 0 / 12px 12px;
  -webkit-mask: radial-gradient(circle at 0 100%, #000 30%, transparent 72%); mask: radial-gradient(circle at 0 100%, #000 30%, transparent 72%);
}
.copy { position: relative; display: grid; gap: .6rem; justify-items: start; min-width: 0; }
.copy h1 { margin: 0; }
.copy .read { margin: 0; color: var(--paper); }
.totals { margin: .2rem 0 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .5rem; width: 100%; }
.totals div { padding: .5rem .6rem; background: var(--ink); border: 1.5px solid var(--edge); border-radius: 12px; }
.totals dt { font-size: .72rem; font-weight: 700; color: var(--muted); }
.totals dd { margin: 0; font-family: var(--display); font-size: 1.35rem; line-height: 1.1; }
.global-meter { width: 100%; display: grid; gap: .3rem; }
.dpills { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: .4rem; }
.dpill {
  display: inline-flex; align-items: center; gap: .4rem; padding: .2rem .6rem; font-size: .8rem; font-weight: 700;
  background: var(--panel); border: 1.5px solid var(--edge); border-radius: 999px;
}
.dpill b { font-weight: 800; }
.meter.mini { width: 56px; height: 8px; border-width: 1px; }

.meter { height: 10px; border: 1.5px solid var(--edge); background: var(--ink); border-radius: 99px; overflow: hidden; }
.meter span { display: block; height: 100%; background: var(--call); background-image: repeating-linear-gradient(-45deg, transparent 0 5px, rgb(255 255 255 / .3) 5px 9px); transition: width .3s ease; }

.stage { position: relative; display: grid; justify-items: center; gap: .55rem; min-width: 0; }
.stage-bubble { margin-bottom: .6rem; max-width: 100%; font-size: .9rem; line-height: 1.45; font-weight: 700; text-align: left; }
/* Tail points down, toward the mentor. */
.stage-bubble::before { top: auto; bottom: -14px; left: 34px; transform: none; border-width: 13px 9px 0 9px; border-style: solid; border-color: var(--edge) transparent transparent transparent; }
.stage-bubble::after { top: auto; bottom: -11px; left: 36px; transform: none; border-width: 10px 7px 0 7px; border-style: solid; border-color: var(--panel) transparent transparent transparent; }
.stage-img {
  height: 185px; width: auto; object-fit: contain;
  filter: drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(2px 4px 0 rgb(26 23 18 / .22));
}
.stage-name { margin: 0; font-size: .86rem; text-align: center; }
.switcher { width: 100%; display: grid; gap: .4rem; }
.switch {
  display: flex; align-items: center; gap: .5rem; width: 100%; padding: .45rem .7rem; text-align: left;
  background: var(--panel); border: 2px solid var(--edge); border-radius: 12px; box-shadow: var(--shadow-sm); font-weight: 800;
}
.switch small { font-size: .74rem; color: var(--muted); font-weight: 700; }
.switch.on { background: var(--pop); }
.switch:active { transform: translate(2px, 2px); box-shadow: none; }

/* 2. Quick resume */
.resume {
  display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: .8rem 1rem; align-items: center;
  padding: .9rem 1.1rem; margin-bottom: 1.6rem;
}
.resume-main { display: grid; gap: .1rem; min-width: 0; }
.resume-title { font-size: 1.05rem; }
.resume-main .small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.quick { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: .4rem; padding-top: .7rem; border-top: 1.5px dashed var(--line); }
.quick .btn { padding: .4rem .75rem; font-size: .9rem; }

/* 3. Tracks */
.tracks-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.track {
  display: flex; flex-direction: column; gap: .75rem; min-width: 0;
  border-top: 6px solid var(--accent, var(--fox)); transition: transform .1s ease, box-shadow .1s ease;
}
.track:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 var(--edge); }
.track.current { background: var(--ink); }
.track-badge {
  display: inline-flex; align-items: center; gap: .4rem; padding: .24rem .7rem; border-radius: 99px; border: 1.5px solid var(--edge);
  background: var(--accent); color: #fff; font-weight: 800; font-size: .82rem; box-shadow: var(--shadow-sm);
}
.track-title { display: flex; justify-content: space-between; align-items: center; gap: .6rem; }
.track-names { min-width: 0; }
.track-names h3 { font-size: 1.35rem; margin: 0; }
.sub { margin: .15rem 0 0; font-size: .86rem; font-weight: 700; color: var(--paper); }
.ja { margin: 0; font-size: .78rem; }
.sticker {
  width: 72px; height: 72px; flex: none; object-fit: contain; padding: 4px; background: var(--ink);
  border: 2px solid var(--edge); border-radius: 14px; box-shadow: var(--shadow-sm); transform: rotate(-3deg);
}
.desc { margin: 0; font-size: .9rem; line-height: 1.5; }
.hl { list-style: none; margin: 0; padding: 0; display: grid; gap: .3rem; font-size: .84rem; line-height: 1.45; }
.hl li { display: flex; gap: .45rem; align-items: flex-start; }
.hl i { color: var(--call); margin-top: .2rem; font-size: .75rem; }
.cats { gap: .3rem; }
.mini-chip { font-size: .72rem; padding: .12rem .48rem; }
button.mini-chip:hover { background: color-mix(in srgb, var(--pop) 35%, var(--panel)); }
.dot { width: .48rem; height: .48rem; border-radius: 50%; display: inline-block; margin-right: .22rem; }

.track-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem;
  padding: .55rem .7rem; background: var(--ink); border: 1.5px solid var(--edge); border-radius: 12px; text-align: center;
}
.track-stats b { display: block; font-family: var(--display); font-weight: 400; font-size: 1.2rem; }
.track-stats small { font-size: .72rem; color: var(--muted); font-weight: 700; }
.meter-row { display: grid; gap: .25rem; }
.track-actions { display: flex; flex-wrap: wrap; gap: .45rem; margin-top: auto; }
.track-actions .btn { font-size: .88rem; padding: .42rem .7rem; }

/* 4. Workbench */
.workbench { display: grid; gap: .9rem; margin-bottom: 1.8rem; }
.workbench h2 { margin: 0; font-size: 1.3rem; }
.seg { display: inline-flex; border: 2px solid var(--edge); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-sm); }
.seg button { padding: .4rem .75rem; background: var(--panel); border: 0; border-right: 2px solid var(--edge); font-weight: 800; font-size: .86rem; }
.seg button:last-child { border-right: 0; }
.seg button.on { background: var(--pop); }
.tabs { display: flex; flex-wrap: wrap; gap: .4rem; padding-bottom: .7rem; border-bottom: 2px solid var(--edge); }
.tabs button {
  padding: .4rem .8rem; border: 2px solid var(--edge); border-radius: 999px; background: var(--panel);
  font-weight: 800; font-size: .86rem; box-shadow: var(--shadow-sm);
}
.tabs button.on { background: var(--edge); color: var(--ink); }
.tabs button:active { transform: translate(1px, 1px); box-shadow: none; }

/* (a) Level ladder */
.ladder { list-style: none; margin: 0; padding: 0; display: grid; gap: .65rem; }
.rung {
  display: grid; grid-template-columns: 64px minmax(0, 1fr) auto; gap: .9rem; align-items: center;
  padding: .8rem .9rem; background: var(--ink); border: 2px solid var(--edge); border-radius: 14px;
}
.rung.now { background: color-mix(in srgb, var(--pop) 30%, var(--panel)); box-shadow: var(--shadow-sm); }
.rung-num {
  display: grid; place-items: center; align-content: center; width: 64px; height: 64px;
  background: var(--panel); border: 2px solid var(--edge); border-radius: 14px; box-shadow: var(--shadow-sm);
  font-family: var(--display); font-size: 1.6rem; line-height: 1;
}
.rung-num span { font-size: .72rem; margin-right: 1px; align-self: start; }
.rung.done .rung-num { background: var(--call); color: #fff; }
.rung-body { min-width: 0; display: grid; gap: .35rem; }
.rung-title { align-items: baseline; }
.rung-title h3 { margin: 0; }
.rung-body .tags { gap: .3rem; }
.rung-body .meter-row { gap: .2rem; }
.rung .btn { white-space: nowrap; }
.rung .btn:disabled { opacity: .45; }

/* (b) Sampler */
.sampler { display: grid; gap: .8rem; }
.sampler-pick { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; }
.sampler-pick button {
  display: grid; gap: .15rem; text-align: left; padding: .55rem .7rem; font-size: .88rem; font-weight: 700; line-height: 1.3;
  background: var(--panel); border: 2px solid var(--edge); border-radius: 12px;
}
.sampler-pick button.on { background: var(--pop); box-shadow: var(--shadow-sm); }
.scene { display: grid; gap: .7rem; padding: 1rem 1.1rem; background: var(--ink); border: 2px solid var(--edge); border-radius: 14px; }
.scene .scenario { margin: 0; font-size: 1rem; line-height: 1.7; }
.step-meta { margin: 0; font-size: .8rem; }
.step-prompt { margin: 0; font-size: 1.12rem; }
.choices { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
.choice {
  display: flex; gap: .6rem; align-items: flex-start; text-align: left; padding: .6rem .75rem;
  background: var(--panel); border: 2px solid var(--edge); border-radius: 12px; box-shadow: var(--shadow-sm);
  font-weight: 700; line-height: 1.4; transition: transform .08s ease, opacity .15s;
}
.choice:hover:not(:disabled) { background: color-mix(in srgb, var(--pop) 30%, var(--panel)); }
.choice:active:not(:disabled) { transform: translate(2px, 2px); box-shadow: none; }
.choice:disabled { cursor: default; }
.choice .letter {
  flex: none; display: inline-grid; place-items: center; width: 1.6rem; height: 1.6rem;
  background: var(--ink); border: 2px solid var(--edge); border-radius: 8px; font-family: var(--display); font-size: .8rem;
}
.choice.right { background: color-mix(in srgb, var(--call) 18%, var(--panel)); }
.choice.right .letter { background: var(--call); color: #fff; }
.choice.wrong { background: color-mix(in srgb, var(--put) 14%, var(--panel)); }
.choice.wrong .letter { background: var(--put); color: #fff; }
.choice.dim { opacity: .55; }
.verdict { display: grid; gap: .35rem; padding: .7rem .85rem; background: var(--panel); border: 2px solid var(--edge); border-radius: 12px; }
.verdict.ok { border-left: 8px solid var(--call); }
.verdict.no { border-left: 8px solid var(--put); }
.verdict strong { display: flex; align-items: center; gap: .4rem; }
.verdict.ok strong i { color: var(--call); }
.verdict.no strong i { color: var(--put); }
.verdict p { margin: 0; }
.why { font-size: .94rem; line-height: 1.6; }
.scene-actions { display: flex; flex-wrap: wrap; gap: .45rem; }

/* (c) Featured trilingual cards */
.tcards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .8rem; }
.tcard {
  display: grid; gap: .5rem; align-content: start; padding: .9rem; min-width: 0;
  background: var(--panel); border: 2px solid var(--edge); border-radius: 14px; box-shadow: var(--shadow-sm);
  border-top: 6px solid var(--c);
}
.tcard-open {
  display: grid; gap: .3rem; width: 100%; padding: 0; text-align: left; background: none; border: 0; color: inherit;
}
.tcard-open:hover .tname { text-decoration: underline; text-underline-offset: 3px; }
.tcard-open:focus-visible { outline-offset: 4px; border-radius: 8px; }
.cat-tag {
  justify-self: start; display: inline-flex; align-items: center; gap: .3rem; padding: .1rem .5rem;
  border: 1.5px solid var(--edge); border-radius: 999px; color: #fff; font-size: .72rem; font-weight: 800;
}
.tname { font-size: 1.02rem; font-weight: 800; line-height: 1.3; }
.tzj { line-height: 1.4; }
.tshort { font-size: .88rem; line-height: 1.5; }
.formula {
  justify-self: start; max-width: 100%; overflow-wrap: anywhere; padding: .2rem .45rem; font-size: .8rem;
  background: var(--ink); border: 1.5px solid var(--edge); border-radius: 8px;
}
.related { gap: .3rem; }
.related .chip { font-size: .74rem; padding: .05rem .5rem; }

/* 5. Sim4Comics matrix */
.matrix { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .9rem; }
.pillar { display: grid; gap: .6rem; align-content: start; border-top: 6px solid var(--c); min-width: 0; }
.pillar-no { font-family: var(--display); font-size: 1.5rem; line-height: 1; color: var(--muted); }
.pillar-ico { color: var(--c); font-size: 1.2rem; }
.pillar h3 { margin: 0; font-size: 1.04rem; }
.pillar p { margin: 0; font-size: .9rem; line-height: 1.6; }
.pillar .chips { gap: .3rem; }
.pillar .chip { font-size: .74rem; padding: .08rem .5rem; }
.pillar .acts { gap: .4rem; margin-top: auto; }
.pillar .acts .btn { font-size: .84rem; padding: .38rem .65rem; }
.pillar .acts .btn:disabled { opacity: .45; }

/* 6. Handbooks and registry */
.ext-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .9rem; }
.ext { display: grid; gap: .55rem; align-content: start; color: var(--paper); text-decoration: none; min-width: 0; transition: transform .1s ease, box-shadow .1s ease; }
.ext h3 { font-size: 1.12rem; margin: 0; }
a.ext:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 var(--edge); }
.ext-link { font-weight: 800; color: var(--fox); font-size: .88rem; margin-top: auto; }
.upcoming { border-style: dashed; box-shadow: none; }
.ext .chips { gap: .3rem; }
.ext .mini-chip { font-size: .72rem; }

.chips { gap: .35rem; }

@media (max-width: 880px) {
  .hero { grid-template-columns: 1fr; }
  .stage { grid-template-columns: auto 1fr; justify-items: start; align-items: end; column-gap: .8rem; }
  .stage-bubble { grid-column: 2; grid-row: 1; margin: 0 0 .6rem; }
  .stage-img { grid-column: 1; grid-row: 1 / span 3; height: 130px; }
  .stage-name { grid-column: 2; grid-row: 2; text-align: left; }
  .switcher { grid-column: 1 / -1; grid-row: 3; }
  .tracks-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tcards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .matrix { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .tracks-grid, .tcards, .ext-grid, .choices, .sampler-pick { grid-template-columns: 1fr; }
  .totals { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .resume { grid-template-columns: 1fr; }
  .resume .btn { justify-self: start; }
  .rung { grid-template-columns: 52px minmax(0, 1fr); }
  .rung-num { width: 52px; height: 52px; font-size: 1.3rem; }
  .rung .btn { grid-column: 1 / -1; justify-self: start; }
  .stage { grid-template-columns: 1fr; justify-items: center; }
  .stage-bubble, .stage-name, .switcher { grid-column: auto; grid-row: auto; text-align: left; }
  .stage-img { grid-column: auto; grid-row: auto; height: 150px; }
}
</style>
