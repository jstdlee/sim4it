<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TermSheet from './components/TermSheet.vue'
import ChatFloat from './components/ChatFloat.vue'
import LangPicker from './components/LangPicker.vue'
import SearchPalette from './components/SearchPalette.vue'
import MapModal from './components/MapModal.vue'
import { useApp } from './stores/app'
import { useDomainPack } from './lib/content'
import { PERSONA_LIST, usePersonaNexus, type PersonaId } from './domains/topics'

const app = useApp()
const nexus = usePersonaNexus()
const pack = useDomainPack()
const route = useRoute()
const router = useRouter()

const links = computed<[string, string, string][]>(() => {
  const base: [string, string, string][] = [
    ['/', 'Nexus', 'fa-compass'],
    ['/journey', 'Journey', 'fa-route'],
    ['/cards', 'Cards', 'fa-layer-group'],
    ['/map', 'Term Map', 'fa-diagram-project'],
  ]
  if (app.domain === 'options') {
    base.push(['/moments', 'Moments', 'fa-bolt'])
  } else {
    base.push(['/scenes', pack.value.casesLabel, 'fa-clapperboard'])
  }
  base.push(['/sim', pack.value.labLabel, 'fa-sliders'])
  if (app.domain !== 'options') {
    base.push(['/sources', 'Sources', 'fa-book'])
  }
  return base
})

function selectPersonaTop(id: PersonaId) {
  nexus.setPersona(id)
  const p = nexus.getPersonaProfile(id)
  app.setDomain(p.defaultDomain)
  if (route.path !== '/') {
    router.push({ path: '/', query: { step: 'landing' } })
  } else if (!route.query.step || route.query.step === 'role') {
    router.replace({ path: '/', query: { step: 'topics' } })
  }
}

const top = ref<HTMLElement>(), brand = ref<{ $el: HTMLElement }>(), cluster = ref<HTMLElement>(), measure = ref<HTMLElement>()
const collapsed = ref(false)
function fit() {
  const b = brand.value?.$el
  if (!top.value || !b || !cluster.value || !measure.value) return
  const cs = getComputedStyle(top.value)
  const free = top.value.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - b.offsetWidth - cluster.value.offsetWidth - 2 * 16
  collapsed.value = measure.value.scrollWidth > free
}
let ro: ResizeObserver | null = null
onMounted(() => {
  let raf = 0
  ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit) })
  for (const el of [top.value, measure.value, cluster.value]) if (el) ro.observe(el)
  document.fonts?.ready.then(fit)
  fit()
})
onBeforeUnmount(() => ro?.disconnect())
watch([() => app.domain, () => nexus.state.activePersona], () => nextTick(fit))

const drawer = ref(false)
const menuBtn = ref<HTMLElement>(), panel = ref<HTMLElement>()
watch(drawer, async (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
  await nextTick()
  if (v) (panel.value?.querySelector('a') as HTMLElement | null)?.focus()
  else menuBtn.value?.focus()
})
watch(() => route.fullPath, () => (drawer.value = false))
watch(collapsed, (c) => { if (!c) drawer.value = false })
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && drawer.value) drawer.value = false }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <header ref="top" class="top">
    <RouterLink ref="brand" to="/" class="brand" translate="no">
      <img :src="`/${pack.mascot.dir}/favicon.png`" alt="" width="32" height="32" />
      <span>Sim4It</span>
    </RouterLink>

    <!-- J · S · T · D Sci-Fi Persona Switcher Pill -->
    <div class="persona-top-switch" role="tablist" aria-label="Explorer Persona (J/S/T/D)">
      <button
        v-for="p in PERSONA_LIST"
        :key="p.id"
        type="button"
        role="tab"
        :aria-selected="nexus.state.activePersona === p.id"
        :class="['persona-top-btn', { on: nexus.state.activePersona === p.id }]"
        :style="nexus.state.activePersona === p.id ? { background: p.accent, color: '#fff', borderColor: '#1a1712' } : {}"
        :title="`${p.id} · ${nexus.getPersonaProfile(p.id).codename} (${nexus.getPersonaProfile(p.id).titleZh})`"
        @click="selectPersonaTop(p.id)"
      >
        <b>{{ p.id }}</b>
      </button>
    </div>

    <nav v-if="!collapsed" class="links" aria-label="Main">
      <RouterLink v-for="[to, label] in links" :key="to" :to="to" class="nav">{{ label }}</RouterLink>
      <a href="/rudao" class="nav">交易入道</a>
    </nav>
    <span v-else class="spacer" />

    <div ref="measure" class="links measure" aria-hidden="true">
      <span v-for="[to, label] in links" :key="to" class="nav">{{ label }}</span>
      <span class="nav">交易入道</span>
    </div>

    <div ref="cluster" class="cluster" role="toolbar" aria-label="App">
      <SearchPalette />
      <LangPicker />
      <RouterLink to="/gallery" class="icon-btn" aria-label="Mascot Gallery" title="Mascot Gallery"><i class="fa-solid fa-palette" /></RouterLink>
      <RouterLink to="/settings" class="icon-btn" aria-label="Settings" title="Settings"><i class="fa-solid fa-gear" /></RouterLink>
      <button v-if="collapsed" ref="menuBtn" class="icon-btn" aria-label="Open menu" title="Menu"
        aria-controls="nav-drawer" :aria-expanded="drawer" @click="drawer = true"><i class="fa-solid fa-bars" /></button>
    </div>
  </header>

  <Transition name="drawer">
    <div v-if="drawer" class="scrim" @click.self="drawer = false">
      <aside id="nav-drawer" ref="panel" class="drawer" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="dhead">
          <img :src="`/${pack.mascot.dir}/wave.webp`" alt="" />
          <button class="icon-btn" aria-label="Close menu" title="Close (Esc)" @click="drawer = false"><i class="fa-solid fa-xmark" /></button>
        </div>
        <div class="drawer-domains">
          <button
            v-for="p in PERSONA_LIST"
            :key="p.id"
            class="chip"
            :class="{ on: nexus.state.activePersona === p.id }"
            @click="selectPersonaTop(p.id)"
          >
            <b>{{ p.id }}</b> · {{ nexus.getPersonaProfile(p.id).codename }}
          </button>
        </div>
        <nav aria-label="Main">
          <RouterLink v-for="[to, label, icon] in links" :key="to" :to="to" class="dlink"><i :class="['fa-solid', 'fa-fw', icon]" aria-hidden="true" />{{ label }}</RouterLink>
          <RouterLink to="/gallery" class="dlink"><i class="fa-solid fa-fw fa-palette" aria-hidden="true" />Mascot Gallery</RouterLink>
          <a href="/rudao" class="dlink"><i class="fa-solid fa-fw fa-book-open" aria-hidden="true" />交易入道 · 手册</a>
          <RouterLink to="/settings" class="dlink"><i class="fa-solid fa-fw fa-gear" aria-hidden="true" />Settings</RouterLink>
        </nav>
      </aside>
    </div>
  </Transition>

  <main><RouterView v-slot="{ Component, route: r }"><component :is="Component" :key="`${app.domain}:${r.path}`" /></RouterView></main>
  <MapModal />
  <TermSheet />
  <ChatFloat />
</template>

<style scoped>
.top { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 20; display: flex; gap: 10px; align-items: center; padding: .5rem 1.1rem; background: var(--panel); border-bottom: 2px solid var(--edge); }
.brand { display: inline-flex; align-items: center; gap: .45rem; flex: none; font-family: var(--display); color: var(--paper); text-decoration: none; font-size: 1.08rem; white-space: nowrap; }
.brand img { width: 32px; height: 32px; transition: transform .2s; }
.brand:hover img { transform: rotate(-10deg) scale(1.08); }

.persona-top-switch {
  display: inline-flex; align-items: center; gap: 2px;
  padding: 2px; border: 2px solid var(--edge); border-radius: 999px;
  background: var(--ink); flex: none;
}
.persona-top-btn {
  width: 26px; height: 26px; border-radius: 999px; border: 1.5px solid transparent;
  background: transparent; color: var(--paper); font-family: var(--mono);
  font-size: .75rem; font-weight: 900; display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; transition: transform .12s;
}
.persona-top-btn:hover { transform: translateY(-1px); background: #fff6dc; }

.links { display: flex; gap: .25rem; flex: 1; min-width: 0; padding: 3px 3px 5px; }
.spacer { flex: 1; }
.measure { position: fixed; top: 0; left: 0; transform: translateY(-200%); visibility: hidden; pointer-events: none; flex: none; white-space: nowrap; }
.nav { text-decoration: none; padding: .24rem .68rem; border-radius: 999px; color: var(--paper); font-weight: 700; font-size: .92rem; white-space: nowrap; border: 2px solid transparent; }
.nav:hover { border-color: var(--edge); }
.nav.router-link-exact-active { background: var(--pop); border-color: var(--edge); box-shadow: var(--shadow-sm); }
.cluster { display: flex; align-items: center; gap: 4px; flex: none; }
@media (max-width: 640px) { .brand span { display: none; } }

.scrim { position: fixed; inset: 0; z-index: 60; background: rgb(26 23 18 / .3); }
.drawer { position: absolute; top: 0; right: 0; bottom: 0; width: min(310px, 86vw); display: flex; flex-direction: column; gap: .55rem; padding: calc(.8rem + env(safe-area-inset-top, 0px)) .9rem calc(1rem + env(safe-area-inset-bottom, 0px)); background: var(--panel); border-left: 2px solid var(--edge); box-shadow: -4px 0 0 var(--edge); overflow-y: auto; }
.dhead { display: flex; align-items: flex-end; justify-content: space-between; }
.dhead img { height: 84px; filter: drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff); }
.drawer-domains { display: flex; flex-wrap: wrap; gap: .35rem; padding-bottom: .35rem; border-bottom: 1.5px dashed var(--edge); }
.drawer nav { display: grid; gap: .45rem; }
.dlink { display: flex; align-items: center; gap: .75rem; min-height: 48px; padding: .55rem .9rem; border: 2px solid var(--edge); border-radius: 14px; background: var(--panel); color: var(--paper); font-weight: 800; text-decoration: none; box-shadow: var(--shadow-sm); }
.dlink i { color: var(--fox); }
.dlink:hover { background: #fff6dc; }
.dlink.router-link-exact-active { background: var(--pop); }
.drawer-enter-active, .drawer-leave-active { transition: opacity .24s cubic-bezier(.32, .72, 0, 1); }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform .24s cubic-bezier(.32, .72, 0, 1); }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer, .drawer-leave-to .drawer { transform: translateX(100%); }
@media (prefers-reduced-motion: reduce) { .drawer-enter-from .drawer, .drawer-leave-to .drawer { transform: none; } }
</style>
