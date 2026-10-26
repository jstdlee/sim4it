<script setup lang="ts">
import FoxSticker from '../components/FoxSticker.vue'
import { useDomainPack } from '../lib/content'
import { useApp } from '../stores/app'

const app = useApp()
const pack = useDomainPack()
</script>

<template>
  <div class="wrap">
    <header class="phead">
      <div>
        <span class="chip on">{{ pack.brand }} Library</span>
        <h1>Sources & Further Study <span class="tr" translate="no">· 学习资源与参考文献</span></h1>
      </div>
      <FoxSticker :pose="pack.id === 'director' ? 'smile' : 'study'" :size="96" />
    </header>
    <p class="read muted">The cards give the core mental models and formulas. These books, open-source repositories, and primary references go deeper.</p>

    <div v-if="pack.sources?.length" class="cols">
      <section v-for="g in pack.sources" :key="g.group" class="surface">
        <h2>{{ g.group }}</h2>
        <ul>
          <li v-for="l in g.links" :key="l.url">
            <a :href="l.url" target="_blank" rel="noopener">{{ l.name }}</a>
          </li>
        </ul>
      </section>
    </div>

    <template v-if="pack.explore?.length">
      <h2 class="next">Explore with {{ pack.mascot.name }} ({{ pack.mascot.zh }})</h2>
      <div class="row">
        <button
          v-for="x in pack.explore"
          :key="x"
          class="chip"
          @click="app.askTutor({ label: x, prompt: `Explain in depth: ${x}` })"
        >
          {{ x }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tr { font-weight: 400; font-size: 1rem; color: var(--muted); }
.cols { display: grid; gap: .8rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
ul { margin: 0; padding-left: 1.1rem; }
li { margin: .3rem 0; }
.next { margin-top: 2rem; }
</style>
