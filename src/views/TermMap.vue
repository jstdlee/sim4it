<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDomainPack } from '../lib/content'
import { useApp } from '../stores/app'
import TermGraph from '../components/TermGraph.vue'
import FoxSticker from '../components/FoxSticker.vue'
import { usePageContext } from '../lib/context'

const app = useApp()
const pack = useDomainPack()
const route = useRoute()
const router = useRouter()

const cat = computed({
  get: () => (typeof route.query.cat === 'string' && pack.value.catMap[route.query.cat] ? route.query.cat : 'all'),
  set: (v: string) => router.replace({ query: { ...route.query, cat: v === 'all' ? undefined : v } }),
})
const q = ref('')
const focused = ref<string | null>(typeof route.query.focus === 'string' ? route.query.focus : null)
watch(focused, (id) => router.replace({ query: { ...route.query, focus: id || undefined } }))
watch(() => app.domain, () => {
  focused.value = null
  q.value = ''
})

const counts = computed(() => {
  const m: Record<string, number> = { all: pack.value.terms.length }
  for (const c of pack.value.cats) m[c.id] = 0
  for (const t of pack.value.terms) m[t.cat] = (m[t.cat] ?? 0) + 1
  return m
})

const focusTerm = computed(() => (focused.value ? pack.value.termMap[focused.value] ?? null : null))
const focusNeighbors = computed(() => {
  if (!focused.value) return []
  const set = new Set<string>(pack.value.termMap[focused.value]?.related ?? [])
  for (const t of pack.value.terms) if (t.related.includes(focused.value)) set.add(t.id)
  return [...set].map((id) => pack.value.termMap[id]).filter(Boolean)
})

const totalEdges = computed(() => {
  const seen = new Set<string>()
  for (const t of pack.value.terms) {
    for (const r of t.related) {
      if (!pack.value.termMap[r]) continue
      const k = t.id < r ? `${t.id}|${r}` : `${r}|${t.id}`
      seen.add(k)
    }
  }
  return seen.size
})

function onSelect(id: string) {
  if (focused.value === id) app.openTerm = id
  else focused.value = id
}

usePageContext(() => ({
  kind: 'map',
  label: `${pack.value.brand} Term Map · ${focusTerm.value ? focusTerm.value.name : cat.value === 'all' ? 'All' : pack.value.catMap[cat.value]?.name}`,
  text: `${pack.value.brand} interactive concept graph (${pack.value.terms.length} terms, ${totalEdges.value} edges across ${pack.value.cats.length} clusters). Category=${cat.value}${focusTerm.value ? `, focused=${focusTerm.value.name} (${focusNeighbors.value.length} neighbors)` : ''}.`,
}))
</script>

<template>
  <div class="wrap">
    <header class="head">
      <div class="title">
        <div>
          <span class="chip on">{{ pack.brand }} Concept Graph</span>
          <h1>Term Map · 概念拓扑图</h1>
          <p class="muted">{{ pack.terms.length }} terms and {{ totalEdges }} links across {{ pack.cats.length }} clusters. Click a node to spotlight its neighborhood; click again (or Open card) for the full read.</p>
        </div>
        <div class="head-right">
          <RouterLink class="btn" to="/cards"><i class="fa-solid fa-table-cells-large" aria-hidden="true" />Card Grid</RouterLink>
          <FoxSticker class="mascot" :pose="pack.id === 'director' ? 'director' : 'think'" :size="92" />
        </div>
      </div>

      <div class="bar">
        <input v-model="q" type="search" :placeholder="`Highlight ${pack.brand} terms (EN / 中文 / 日本語)…`" aria-label="Highlight terms" />
        <button v-if="focused || cat !== 'all' || q" class="btn" @click="focused = null; cat = 'all'; q = ''">Reset view</button>
      </div>

      <div class="cats" role="tablist" aria-label="Categories">
        <button class="cat-pill" :class="{ on: cat === 'all' }" @click="cat = 'all'">
          <span class="dot" style="background: var(--edge)" />All <b>{{ counts.all }}</b>
        </button>
        <button
          v-for="c in pack.cats" :key="c.id" class="cat-pill" :class="{ on: cat === c.id }"
          :style="{ '--c': c.color }" @click="cat = c.id">
          <i :class="['fa-solid', c.icon]" aria-hidden="true" />{{ c.name }}<template v-if="c.zh"> · {{ c.zh }}</template> <b>{{ counts[c.id] }}</b>
        </button>
      </div>
    </header>

    <div class="stage">
      <TermGraph :category="cat" :query="q" :focus-id="focused" :height="600" @select="onSelect" />

      <aside v-if="focusTerm" class="inspector card" :style="{ '--c': pack.catMap[focusTerm.cat]?.color }">
        <div class="spread">
          <span class="cat-tag" :style="{ background: pack.catMap[focusTerm.cat]?.color }">
            <i v-if="pack.catMap[focusTerm.cat]" :class="['fa-solid', pack.catMap[focusTerm.cat].icon]" aria-hidden="true" />{{ pack.catMap[focusTerm.cat]?.name }}
          </span>
          <button class="icon-btn" aria-label="Clear focus" @click="focused = null"><i class="fa-solid fa-xmark" /></button>
        </div>
        <h2>{{ focusTerm.name }}</h2>
        <p v-if="focusTerm.zh || focusTerm.ja" class="tr-sub" translate="no">
          <span v-if="focusTerm.zh">{{ focusTerm.zh }}</span>
          <span v-if="focusTerm.zh && focusTerm.ja"> · </span>
          <span v-if="focusTerm.ja">{{ focusTerm.ja }}</span>
        </p>
        <p class="muted">{{ focusTerm.short }}</p>
        <pre v-if="focusTerm.formula" class="formula">{{ focusTerm.formula }}</pre>
        <div class="row">
          <button class="btn primary" @click="app.openTerm = focusTerm.id"><i class="fa-solid fa-book-open" aria-hidden="true" />Open full card</button>
          <button class="btn" @click="app.askTutor({ label: focusTerm.name, prompt: `Explain ${focusTerm.name} and how it connects to ${focusNeighbors.map(n => n.name).join(', ')}.`, context: `${focusTerm.name}: ${focusTerm.short}\n\n${focusTerm.body}` })">
            <i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />Ask {{ pack.mascot.name }}
          </button>
        </div>
        <div v-if="focusNeighbors.length" class="neighbors">
          <small class="muted">Connected ({{ focusNeighbors.length }})</small>
          <div class="row">
            <button v-for="n in focusNeighbors" :key="n.id" class="chip link" :style="{ borderColor: pack.catMap[n.cat]?.color }" @click="focused = n.id">
              <span class="mini-dot" :style="{ background: pack.catMap[n.cat]?.color }" />{{ n.name }}<template v-if="n.zh"> · {{ n.zh }}</template>
            </button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.head { margin: 1rem 0 1rem; display: grid; gap: .7rem; }
.title { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; }
.title p { margin: .25rem 0 0; }
.head-right { display: flex; align-items: center; gap: .6rem; }
.mascot { flex: none; margin: -.4rem 0; }
.bar { display: flex; gap: .5rem; }
.bar input { flex: 1; }

.cats { display: flex; flex-wrap: wrap; gap: .38rem; }
.cat-pill {
  display: inline-flex; align-items: center; gap: .38rem;
  padding: .3rem .65rem; border-radius: 99px; border: 1.5px solid var(--edge);
  background: var(--panel); font-size: .78rem; font-weight: 700;
}
.cat-pill i { color: var(--c, var(--edge)); }
.cat-pill b { font-size: .7rem; padding: .03rem .36rem; border-radius: 99px; background: var(--ink); border: 1px solid var(--edge); }
.cat-pill.on { background: var(--c, var(--edge)); color: #fff; box-shadow: 2px 2px 0 var(--edge); }
.cat-pill.on i { color: #fff; }
.cat-pill.on b { background: rgb(0 0 0 / .22); color: #fff; border-color: transparent; }
.dot { width: .5rem; height: .5rem; border-radius: 50%; }

.stage { position: relative; display: grid; gap: .9rem; }
.inspector {
  border-top: 5px solid var(--c, var(--edge));
  display: grid; gap: .55rem;
}
.inspector h2 { font-size: 1.35rem; margin: 0; }
.tr-sub { margin: -.25rem 0 0; font-size: .86rem; font-weight: 700; color: var(--fox); }
.inspector p { margin: 0; }
.cat-tag {
  display: inline-flex; align-items: center; gap: .35rem;
  padding: .18rem .6rem; border-radius: 99px; color: #fff; font-size: .74rem; font-weight: 800;
  border: 1.5px solid var(--edge);
}
.formula { padding: .5rem .75rem; background: var(--ink); border: 1.5px solid var(--edge); border-radius: 10px; font-size: .84rem; margin: 0; overflow-x: auto; }
.neighbors { display: grid; gap: .35rem; padding-top: .3rem; border-top: 1.5px dashed var(--edge); }
.link { cursor: pointer; background: var(--panel); }
.link:hover { background: var(--pop); }
.mini-dot { width: .48rem; height: .48rem; border-radius: 50%; margin-right: .3rem; display: inline-block; }
@media (max-width: 640px) { .mascot { display: none; } }
</style>
