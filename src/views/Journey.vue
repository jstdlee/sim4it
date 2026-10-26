<script setup lang="ts">
import { computed } from 'vue'
import { useDomainPack } from '../lib/content'
import { useApp } from '../stores/app'
import FoxSticker from '../components/FoxSticker.vue'
import { usePageContext } from '../lib/context'

const app = useApp()
const pack = useDomainPack()

const done = (n: number) => app.levelProgress((pack.value.bank[n] ?? []).map((q) => q.id))
const totalInLevel = (n: number) => (pack.value.bank[n] ?? []).length
const firstOpen = (n: number) => Math.max(0, (pack.value.bank[n] ?? []).findIndex((q) => !app.results[q.id]))
const complete = (n: number) => totalInLevel(n) > 0 && done(n) >= totalInLevel(n)
const next = computed(() => pack.value.levels.find((l) => !complete(l.n)) ?? pack.value.levels[0])
const started = computed(() => pack.value.levels.some((l) => done(l.n) > 0))

usePageContext(() => ({
  kind: 'page',
  label: `${pack.value.brand} Journey · next: L${next.value.n}`,
  text: `${pack.value.brand} (${pack.value.zhTitle}) Journey page. Progress: ${pack.value.levels.map((l) => `L${l.n} ${l.name} ${done(l.n)}/${totalInLevel(l.n)}`).join('; ')}. Next level: ${next.value.n} ${next.value.name}.`,
}))

const RAYS = Array.from({ length: 36 }, (_, i) => {
  const a = (i / 36) * Math.PI * 2
  const r0 = 120 + ((i * 37) % 5) * 14
  const r1 = 560
  return { x1: 760 + Math.cos(a) * r0, y1: 210 + Math.sin(a) * r0, x2: 760 + Math.cos(a) * r1, y2: 210 + Math.sin(a) * r1, w: 1 + ((i * 13) % 3) }
})
</script>

<template>
  <div class="wrap">
    <nav class="crumbs muted" aria-label="Breadcrumb">
      <RouterLink to="/">Sim4It Portal</RouterLink> / <strong>{{ pack.brand }} · {{ pack.zhTitle }}</strong>
    </nav>

    <section class="hero">
      <svg class="rays" viewBox="0 0 1000 420" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
        <line v-for="(r, k) in RAYS" :key="k" :x1="r.x1" :y1="r.y1" :x2="r.x2" :y2="r.y2" :stroke-width="r.w" />
      </svg>
      <div class="dots" aria-hidden="true" />
      <div class="copy">
        <span class="chip on">{{ pack.badge }}</span>
        <h1>{{ pack.title }} <span class="mark">{{ pack.zhTitle }}</span></h1>
        <p class="read">{{ pack.description }}</p>
        <p class="muted small">{{ pack.zhSubtitle }}</p>
        <div class="row">
          <RouterLink class="btn primary cta" :to="`/quest/${next.n}/${firstOpen(next.n)}`">
            {{ started ? 'Continue' : 'Start' }} Level {{ next.n }} · {{ next.name }}
          </RouterLink>
          <RouterLink class="btn" :to="pack.id === 'options' ? '/moments' : '/scenes'">
            <i class="fa-solid fa-clapperboard" aria-hidden="true" />{{ pack.casesLabel }} · {{ pack.casesZhLabel }}
          </RouterLink>
          <RouterLink class="btn" to="/sim">
            <i class="fa-solid fa-sliders" aria-hidden="true" />{{ pack.labLabel }}
          </RouterLink>
        </div>
      </div>
      <div class="kon">
        <FoxSticker :pose="pack.id === 'director' ? 'director' : pack.id === 'comics' ? 'study' : 'wave'" :size="205" bob :alt="pack.mascot.name" />
        <span class="bubble say">{{ started ? `Welcome back to ${pack.brand}!` : `Hi, I’m ${pack.mascot.name} (${pack.mascot.zh})!` }}</span>
      </div>
    </section>

    <ol class="ladder">
      <li v-for="l in pack.levels" :key="l.n" class="rung" :class="{ done: complete(l.n), now: l.n === next.n }">
        <span class="n">{{ l.n }}</span>
        <div class="grow">
          <h2>
            {{ l.name }}
            <span v-if="l.zh" class="tr muted" translate="no"> · {{ l.zh }}<template v-if="l.ja"> / {{ l.ja }}</template></span>
          </h2>
          <p class="muted">{{ l.blurb }}</p>
          <div v-if="l.cats?.length" class="row cats">
            <span v-for="cid in l.cats" :key="cid" class="chip small">
              <span class="dot" :style="{ background: pack.catMap[cid]?.color || 'var(--fox)' }" />
              {{ pack.catMap[cid]?.name || cid }}{{ pack.catMap[cid]?.zh ? ' · ' + pack.catMap[cid]?.zh : '' }}
            </span>
          </div>
          <div class="meter" :aria-label="`${done(l.n)} of ${totalInLevel(l.n)} done`">
            <span :style="{ width: (done(l.n) / Math.max(totalInLevel(l.n), 1)) * 100 + '%' }" />
          </div>
        </div>
        <RouterLink class="btn" :class="{ primary: l.n === next.n }" :to="`/quest/${l.n}/${firstOpen(l.n)}`">
          {{ done(l.n) === 0 ? 'Start' : complete(l.n) ? 'Review' : 'Continue' }} · {{ done(l.n) }}/{{ totalInLevel(l.n) }}
        </RouterLink>
        <FoxSticker v-if="complete(l.n)" class="stamp" pose="thumbs" :size="64" alt="Level complete" />
      </li>

      <li v-if="pack.id === 'options'" class="rung final">
        <span class="n"><i class="fa-solid fa-star" aria-hidden="true" /></span>
        <div class="grow">
          <h2>Final test: 100 Market Moments · 历史实战高光时刻</h2>
          <p class="muted">Trade through real historical events checkpoint by checkpoint.</p>
        </div>
        <RouterLink class="btn" to="/moments">Open</RouterLink>
        <FoxSticker class="stamp" pose="surprised" :size="64" />
      </li>

      <li v-if="pack.id === 'options'" class="rung final">
        <span class="n"><i class="fa-solid fa-book-open" aria-hidden="true" /></span>
        <div class="grow">
          <h2>《交易入道》· 概念术语与实操手册</h2>
          <p class="muted">Jesse Lau (@jesselaunz) 闲云九法、103条书签原推汇编、实操 SOP 与读书批注索引。</p>
        </div>
        <a class="btn" href="/rudao">Open</a>
      </li>

      <li v-if="pack.id !== 'options'" class="rung final">
        <span class="n"><i class="fa-solid fa-clapperboard" aria-hidden="true" /></span>
        <div class="grow">
          <h2>{{ pack.casesLabel }} · {{ pack.casesZhLabel }}</h2>
          <p class="muted">
            {{ pack.id === 'director'
              ? '102 interactive virtual sets: make choices department by department (Story, Camera, Light, Sound, Edit, Sakuga).'
              : 'Interactive Manga & JEV Storyboard Cases: Rainy Interrogation 5-Pass Polling, Seagulls & Fries Comedy, Toriyama × Inoue Rooftop Slash, Otomo Deep Focus, Urasawa Hiki, and tldraw-manga 5-Stage Production.' }}
          </p>
        </div>
        <RouterLink class="btn primary" to="/scenes">Open Cases</RouterLink>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.crumbs { font-size: .88rem; margin: .4rem 0 .6rem; }
.crumbs a { color: var(--muted); }
.hero {
  position: relative; overflow: hidden; margin: .6rem 0 1.6rem; padding: 1.8rem clamp(1rem, 4vw, 2.3rem);
  display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, .85fr); align-items: center; gap: 1rem;
  background: var(--panel); border: 2px solid var(--edge); border-radius: 20px; box-shadow: 4px 4px 0 var(--edge);
}
.rays { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.rays line { stroke: var(--edge); opacity: .08; stroke-linecap: round; }
.dots { position: absolute; left: -40px; bottom: -40px; width: 260px; height: 200px; background: radial-gradient(var(--pop) 2.2px, transparent 2.6px) 0 0 / 12px 12px; -webkit-mask: radial-gradient(circle at 0 100%, #000 30%, transparent 72%); mask: radial-gradient(circle at 0 100%, #000 30%, transparent 72%); pointer-events: none; }
.copy { position: relative; display: grid; gap: .45rem; justify-items: start; }
.copy h1 { margin: .1rem 0 0; }
.copy .read { margin: .2rem 0; color: var(--paper); }
.small { font-size: .88rem; margin: 0 0 .5rem; }
.cta { font-size: 1rem; padding: .6rem 1.15rem; }
.kon { position: relative; display: flex; justify-content: center; align-items: flex-end; min-height: 220px; }
.say { position: absolute; top: 0; right: 0; transform: rotate(2deg); }

.ladder { list-style: none; padding: 0; margin: 0; display: grid; gap: .8rem; }
.rung { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) 10.5rem; gap: 1rem; align-items: center; padding: 1rem 1.1rem; border: 2px solid var(--edge); border-radius: 16px; background: var(--panel); box-shadow: var(--shadow); }
.rung > .btn { justify-content: center; }
.rung.now { background: #fff6dc; }
.rung h2 { font-size: 1.15rem; margin: 0; }
.tr { font-family: var(--ui); font-size: .92rem; font-weight: 600; }
.rung p { margin: .15rem 0 .45rem; }
.cats { margin-bottom: .5rem; gap: .3rem; }
.cats .small { font-size: .74rem; margin: 0; }
.dot { width: .5rem; height: .5rem; border-radius: 50%; display: inline-block; margin-right: .25rem; }
.n { display: grid; place-items: center; flex: none; width: 2.6rem; height: 2.6rem; border-radius: 50%; border: 2px solid var(--edge); background: var(--pop); font-family: var(--display); font-size: 1.3rem; }
.done .n { background: var(--call); color: #fff; }
.meter { height: 10px; border: 1.5px solid var(--edge); background: var(--ink); border-radius: 99px; overflow: hidden; max-width: 24rem; }
.meter span { display: block; height: 100%; background: var(--call); background-image: repeating-linear-gradient(-45deg, transparent 0 5px, rgb(255 255 255 / .3) 5px 9px); }
.final { border-style: dashed; }
.stamp { position: absolute; right: -10px; top: -26px; transform: rotate(8deg); pointer-events: none; }

@media (max-width: 720px) {
  .hero { grid-template-columns: 1fr; padding-bottom: .8rem; }
  .kon { min-height: 0; justify-content: flex-end; margin-top: -.5rem; }
  .kon :deep(img) { height: 145px !important; }
  .say { top: 10%; right: auto; left: 0; }
  .rung { grid-template-columns: auto minmax(0, 1fr); }
  .rung > .btn { grid-column: 1 / -1; }
}
</style>
