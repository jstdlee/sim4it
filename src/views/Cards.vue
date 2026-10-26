<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDomainPack } from '../lib/content'
import { useApp } from '../stores/app'
import FoxSticker from '../components/FoxSticker.vue'
import { usePageContext } from '../lib/context'

const app = useApp()
const pack = useDomainPack()
const route = useRoute()
const router = useRouter()

const q = ref('')
const cat = computed({
  get: () => (typeof route.query.cat === 'string' && pack.value.catMap[route.query.cat] ? route.query.cat : 'all'),
  set: (v: string) => router.replace({ query: { ...route.query, cat: v === 'all' ? undefined : v } }),
})

const counts = computed(() => {
  const m: Record<string, number> = { all: pack.value.terms.length }
  for (const c of pack.value.cats) m[c.id] = 0
  for (const t of pack.value.terms) m[t.cat] = (m[t.cat] ?? 0) + 1
  return m
})

const activeCat = computed(() => (cat.value === 'all' ? null : pack.value.catMap[cat.value] ?? null))

const list = computed(() => {
  const s = q.value.trim().toLowerCase()
  return pack.value.terms.filter((t) => {
    if (cat.value !== 'all' && t.cat !== cat.value) return false
    if (!s) return true
    return (
      t.name.toLowerCase().includes(s) ||
      (t.zh && t.zh.toLowerCase().includes(s)) ||
      (t.ja && t.ja.toLowerCase().includes(s)) ||
      t.short.toLowerCase().includes(s) ||
      t.tags.some((x) => x.includes(s))
    )
  })
})

const grouped = computed(() => {
  if (cat.value !== 'all' || q.value.trim()) return null
  return pack.value.cats.map((c) => ({ cat: c, items: pack.value.terms.filter((t) => t.cat === c.id) })).filter((g) => g.items.length > 0)
})

watch(() => app.domain, () => {
  q.value = ''
})

usePageContext(() => ({
  kind: 'cards',
  label: `${pack.value.brand} Cards · ${activeCat.value ? activeCat.value.name : 'All'} (${list.value.length})`,
  text: `${pack.value.brand} Skill Cards page (${pack.value.terms.length} total terms across ${pack.value.cats.length} categories). Filter: category=${cat.value}, query="${q.value}", showing ${list.value.length} cards.`,
}))
</script>

<template>
  <div class="wrap">
    <header class="head">
      <div class="title">
        <div>
          <span class="chip on">{{ pack.brand }} · {{ pack.terms.length }} Terms</span>
          <h1>Skill Cards · 知识卡片</h1>
          <p class="muted">{{ pack.terms.length }} bite-size trilingual cards across {{ pack.cats.length }} categories. Tap any card for the full read, formula, and related quests.</p>
        </div>
        <div class="head-right">
          <RouterLink class="btn" to="/map"><i class="fa-solid fa-diagram-project" aria-hidden="true" />Term Map</RouterLink>
          <FoxSticker class="mascot" :pose="pack.id === 'director' ? 'director' : 'study'" :size="96" />
        </div>
      </div>

      <input v-model="q" type="search" :placeholder="`Search ${pack.brand} terms (EN / 中文 / 日本語, formula, tag…)`" aria-label="Search terms" />

      <div class="cats" role="tablist" aria-label="Categories">
        <button class="cat-pill" :class="{ on: cat === 'all' }" role="tab" :aria-selected="cat === 'all'" @click="cat = 'all'">
          <span class="dot" style="background: var(--edge)" />
          <span>All</span>
          <b>{{ counts.all }}</b>
        </button>
        <button
          v-for="c in pack.cats" :key="c.id" class="cat-pill" :class="{ on: cat === c.id }"
          :style="{ '--c': c.color }" role="tab" :aria-selected="cat === c.id" @click="cat = c.id">
          <i :class="['fa-solid', c.icon]" aria-hidden="true" />
          <span>{{ c.name }}<template v-if="c.zh"> · {{ c.zh }}</template></span>
          <b>{{ counts[c.id] }}</b>
        </button>
      </div>

      <div v-if="activeCat" class="cat-banner" :style="{ '--c': activeCat.color }">
        <i :class="['fa-solid', activeCat.icon]" aria-hidden="true" />
        <div>
          <strong>{{ activeCat.name }}<template v-if="activeCat.zh"> · {{ activeCat.zh }}</template><template v-if="activeCat.ja"> · {{ activeCat.ja }}</template></strong>
          <span class="muted"> — {{ activeCat.blurb }}</span>
        </div>
        <RouterLink class="btn small-btn" :to="`/map?cat=${activeCat.id}`"><i class="fa-solid fa-diagram-project" aria-hidden="true" />View in Map</RouterLink>
      </div>
    </header>

    <template v-if="grouped">
      <section v-for="g in grouped" :key="g.cat.id" class="group" :style="{ '--c': g.cat.color }">
        <div class="group-head">
          <div class="row">
            <span class="badge"><i :class="['fa-solid', g.cat.icon]" aria-hidden="true" /></span>
            <div>
              <h2>{{ g.cat.name }} <span v-if="g.cat.zh" class="tr muted">· {{ g.cat.zh }}<template v-if="g.cat.ja"> / {{ g.cat.ja }}</template></span> <span class="count">{{ g.items.length }}</span></h2>
              <p class="muted">{{ g.cat.blurb }}</p>
            </div>
          </div>
          <div class="row">
            <button class="btn" @click="cat = g.cat.id">Filter</button>
            <RouterLink class="btn" :to="`/map?cat=${g.cat.id}`"><i class="fa-solid fa-diagram-project" aria-hidden="true" />Map</RouterLink>
          </div>
        </div>
        <div class="grid">
          <button v-for="t in g.items" :key="t.id" class="card tcard" @click="app.openTerm = t.id">
            <div class="spread">
              <span class="cat-dot" :style="{ background: g.cat.color }" />
              <span v-if="t.formula" class="chip mono">{{ t.formula }}</span>
            </div>
            <h3>{{ t.name }}</h3>
            <p v-if="t.zh || t.ja" class="tr-sub" translate="no">
              <span v-if="t.zh">{{ t.zh }}</span>
              <span v-if="t.zh && t.ja"> · </span>
              <span v-if="t.ja">{{ t.ja }}</span>
            </p>
            <p class="muted">{{ t.short }}</p>
            <div class="row tags"><span v-for="x in t.tags" :key="x" class="chip">{{ x }}</span></div>
          </button>
        </div>
      </section>
    </template>

    <div v-else class="grid">
      <button v-for="t in list" :key="t.id" class="card tcard" :style="{ '--c': pack.catMap[t.cat]?.color }" @click="app.openTerm = t.id">
        <div class="spread">
          <span class="cat-tag" :style="{ background: pack.catMap[t.cat]?.color }">
            <i v-if="pack.catMap[t.cat]" :class="['fa-solid', pack.catMap[t.cat].icon]" aria-hidden="true" />{{ pack.catMap[t.cat]?.name ?? t.cat }}
          </span>
          <span v-if="t.formula" class="chip mono">{{ t.formula }}</span>
        </div>
        <h3>{{ t.name }}</h3>
        <p v-if="t.zh || t.ja" class="tr-sub" translate="no">
          <span v-if="t.zh">{{ t.zh }}</span>
          <span v-if="t.zh && t.ja"> · </span>
          <span v-if="t.ja">{{ t.ja }}</span>
        </p>
        <p class="muted">{{ t.short }}</p>
        <div class="row tags"><span v-for="x in t.tags" :key="x" class="chip">{{ x }}</span></div>
      </button>
    </div>

    <p v-if="!list.length" class="empty muted">No cards match “{{ q }}”.</p>
  </div>
</template>

<style scoped>
.head { margin: 1rem 0 1.2rem; display: grid; gap: .75rem; }
.title { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; }
.title p { margin: .25rem 0 0; }
.head-right { display: flex; align-items: center; gap: .6rem; }
.mascot { flex: none; margin: -.4rem 0; }

.cats { display: flex; flex-wrap: wrap; gap: .4rem; }
.cat-pill {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .32rem .68rem; border-radius: 99px; border: 1.5px solid var(--edge);
  background: var(--panel); font-size: .8rem; font-weight: 700;
  transition: transform .08s, box-shadow .08s;
}
.cat-pill i { color: var(--c, var(--edge)); }
.cat-pill b { font-size: .72rem; padding: .04rem .38rem; border-radius: 99px; background: var(--ink); border: 1px solid var(--edge); }
.cat-pill.on { background: var(--c, var(--edge)); color: #fff; box-shadow: 2px 2px 0 var(--edge); }
.cat-pill.on i { color: #fff; }
.cat-pill.on b { background: rgb(0 0 0 / .22); color: #fff; border-color: transparent; }
.dot { width: .55rem; height: .55rem; border-radius: 50%; }

.cat-banner {
  display: flex; align-items: center; gap: .7rem; flex-wrap: wrap;
  padding: .65rem .9rem; border: 2px solid var(--edge); border-left: 6px solid var(--c);
  border-radius: 12px; background: var(--panel);
}
.cat-banner > i { font-size: 1.1rem; color: var(--c); }
.cat-banner > div { flex: 1; min-width: 12rem; }
.small-btn { padding: .35rem .7rem; font-size: .8rem; }

.group { margin: 1.6rem 0 2rem; }
.group-head {
  display: flex; justify-content: space-between; align-items: center; gap: .8rem; flex-wrap: wrap;
  margin-bottom: .75rem; padding-bottom: .55rem; border-bottom: 2px solid var(--edge);
}
.group-head h2 { font-size: 1.25rem; display: flex; align-items: center; gap: .45rem; flex-wrap: wrap; }
.group-head p { margin: .1rem 0 0; font-size: .9rem; }
.tr { font-family: var(--ui); font-size: .9rem; font-weight: 600; }
.badge {
  width: 2.2rem; height: 2.2rem; border-radius: 10px; border: 2px solid var(--edge);
  background: var(--c); color: #fff; display: grid; place-items: center; box-shadow: 2px 2px 0 var(--edge); flex: none;
}
.count {
  font-family: var(--ui); font-size: .75rem; font-weight: 800;
  padding: .1rem .48rem; border-radius: 99px; border: 1.5px solid var(--edge); background: var(--pop);
}

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: .8rem; }
.tcard { text-align: left; display: flex; flex-direction: column; gap: .42rem; transition: transform .08s; border-top: 4px solid var(--c, var(--edge)); }
.tcard:hover { transform: translate(-1px, -1px); }
.tcard h3 { font-size: 1.12rem; margin: 0; }
.tr-sub { margin: -.15rem 0 0; font-size: .82rem; font-weight: 700; color: var(--fox); }
.tcard p.muted { flex: 1; margin: 0; font-size: .9rem; }
.tags { margin-top: .2rem; }
.cat-dot { width: .65rem; height: .65rem; border-radius: 50%; border: 1.5px solid var(--edge); }
.cat-tag {
  display: inline-flex; align-items: center; gap: .32rem;
  padding: .15rem .55rem; border-radius: 99px; color: #fff; font-size: .72rem; font-weight: 800;
  border: 1.5px solid var(--edge);
}
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .72rem; max-width: 13rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty { text-align: center; padding: 2rem; }
@media (max-width: 640px) { .mascot { display: none; } }
</style>
