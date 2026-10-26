<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import FoxSticker from '../components/FoxSticker.vue'
import { useDomainPack } from '../lib/content'
import { useApp } from '../stores/app'
import { usePageContext } from '../lib/context'

const app = useApp()
const pack = useDomainPack()
const scenes = computed(() => pack.value.scenes ?? [])
const genres = computed(() => Array.from(new Set(scenes.value.map((m) => m.genre))).sort())
const g = ref<string | null>(null)
const q = ref('')
watch(() => app.domain, () => { g.value = null; q.value = '' })

const list = computed(() => {
  const s = q.value.trim().toLowerCase()
  return scenes.value.filter((m) => {
    if (g.value && m.genre !== g.value) return false
    if (!s) return true
    return `${m.title} ${m.zh || ''} ${m.genre} ${m.setup} ${m.tags.join(' ')}`.toLowerCase().includes(s)
  })
})
const score = (id: string) => app.results[`scene:${id}`]
const passed = computed(() => scenes.value.filter((m) => { const r = score(m.id); return r && r.correct / r.total >= 2 / 3 }).length)
const depts = (ids: (string | undefined)[]) => Array.from(new Set(ids.filter((x): x is string => Boolean(x))))

usePageContext(() => ({
  kind: 'page',
  label: `${pack.value.brand} ${pack.value.casesLabel} · ${passed.value}/${scenes.value.length} passed`,
  text: `${pack.value.brand} ${pack.value.casesLabel} (${pack.value.casesZhLabel}). Passed ${passed.value} of ${scenes.value.length}. Showing ${list.value.length} cases.`,
}))
</script>

<template>
  <div class="wrap">
    <header class="phead">
      <div>
        <span class="chip on">{{ pack.brand }} · {{ scenes.length }} Interactive Cases</span>
        <h1>{{ pack.casesLabel }} <span class="tr" translate="no">· {{ pack.casesZhLabel }}</span></h1>
      </div>
      <FoxSticker :pose="pack.id === 'director' ? 'clap' : 'study'" :size="96" />
    </header>
    <p class="read muted">
      {{ pack.id === 'director'
        ? 'Each scene is a story situation on a virtual set. Make decisions department by department: story, camera, light, edit, sound, animation, and 3D.'
        : 'Each storyboard studio case walks you checkpoint by checkpoint through JEV 5-Pass polling, Scott McCloud transitions, manga master staging, and tldraw-manga production.' }}
    </p>
    <p><strong>{{ passed }} / {{ scenes.length }}</strong> passed</p>

    <input v-model="q" type="search" class="search" placeholder="Search cases by title, genre, or technique…" aria-label="Search cases" />

    <div class="row filters">
      <button class="chip" :class="{ on: !g }" @click="g = null">All {{ scenes.length }}</button>
      <button v-for="x in genres" :key="x" class="chip" :class="{ on: g === x }" @click="g = x">{{ x }}</button>
    </div>

    <div class="list">
      <RouterLink v-for="m in list" :key="m.id" :to="`/scenes/${m.id}`" class="scene">
        <div class="grow">
          <h2>
            {{ m.title }}
            <span v-if="m.zh" class="zh-sub">· {{ m.zh }}</span>
            <span class="genre">{{ m.genre }}</span>
          </h2>
          <p class="muted">{{ m.setup }}</p>
          <div class="row depts">
            <span v-for="d in depts(m.checkpoints.map((c) => c.dept))" :key="d" class="chip small">
              <span class="dot" :style="{ background: pack.catMap[d]?.color || 'var(--fox)' }" />
              {{ pack.catMap[d]?.name || d }}<template v-if="pack.catMap[d]?.zh"> · {{ pack.catMap[d]?.zh }}</template>
            </span>
          </div>
        </div>
        <span v-if="score(m.id)" class="chip" :class="{ on: score(m.id).correct / score(m.id).total >= 2 / 3 }">
          {{ score(m.id).correct }}/{{ score(m.id).total }}
        </span>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.tr { font-weight: 400; font-size: 1rem; color: var(--muted); }
.search { margin: .4rem 0 .6rem; max-width: 520px; }
.filters { margin: .3rem 0 1rem; }
.list { display: grid; gap: .65rem; }
.scene {
  display: flex; gap: 1rem; align-items: center; text-decoration: none; color: var(--paper);
  padding: 1rem 1.15rem; background: var(--panel); border: 2px solid var(--edge); border-radius: 16px;
  box-shadow: var(--shadow); transition: transform .08s ease, box-shadow .08s ease;
}
.scene:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 var(--edge); background: #fff6dc; }
.scene h2 { font-size: 1.12rem; margin: 0; display: flex; flex-wrap: wrap; align-items: baseline; gap: .35rem; }
.zh-sub { font-family: var(--ui); font-size: .95rem; font-weight: 700; color: var(--fox); }
.scene p { margin: .3rem 0 .5rem; }
.genre { font-size: .76rem; font-weight: 800; padding: .1rem .5rem; border: 1.5px solid var(--edge); border-radius: 99px; background: var(--pop); }
.depts { gap: .3rem; }
.small { font-size: .75rem; }
.dot { width: .5rem; height: .5rem; border-radius: 50%; display: inline-block; margin-right: .25rem; }
</style>
