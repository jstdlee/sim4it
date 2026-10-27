<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApp } from '../stores/app'
import {
  PERSONA_LIST,
  SUBJECT_COLLECTIONS,
  usePersonaNexus,
  type PersonaId,
  type SubjectId,
} from '../domains/topics'
import FoxSticker from '../components/FoxSticker.vue'
import { usePageContext } from '../lib/context'

const app = useApp()
const nexus = usePersonaNexus()
const route = useRoute()
const router = useRouter()

// Show role picker if no role has been chosen yet or if ?selectRole=1
const showRolePicker = computed(
  () => nexus.state.activePersona === null || route.query.selectRole === '1'
)

const currentPersona = computed(() => nexus.activePersona.value)
const selectedSubjects = computed(() => {
  const list = nexus.activeSubjects.value
  return list.length > 0 ? list : [SUBJECT_COLLECTIONS[currentPersona.value.defaultDomain]]
})

function personaSubjects(id: PersonaId) {
  return (nexus.state.subjectsByPersona[id] ?? []).map((sid) => SUBJECT_COLLECTIONS[sid]).filter(Boolean)
}

function chooseRoleAndPickSubjects(id: PersonaId) {
  nexus.setPersona(id)
  const p = nexus.getPersonaProfile(id)
  app.setDomain(p.defaultDomain)
  router.push('/subjects')
}

function chooseRoleAndEnterHome(id: PersonaId) {
  nexus.setPersona(id)
  const p = nexus.getPersonaProfile(id)
  app.setDomain(p.defaultDomain)
  router.replace({ path: '/' })
}

function openRoleSelector() {
  router.replace({ path: '/', query: { selectRole: '1' } })
}

function navigateHref(href: string, domain?: 'options' | 'director' | 'comics') {
  if (domain) {
    app.setDomain(domain)
  }
  if (href.startsWith('/rudao') || href.startsWith('http://') || href.startsWith('https://')) {
    window.location.href = href
  } else {
    router.push(href)
  }
}

usePageContext(() => ({
  kind: 'page',
  label: showRolePicker.value
    ? 'Sim4It · 选择角色'
    : `Sim4It · ${currentPersona.value.id} (${currentPersona.value.codename})`,
  text: `Sim4It role landing page. Role: ${currentPersona.value.id} · ${currentPersona.value.titleZh}. Subjects: ${selectedSubjects.value.map((s) => s.brand).join(', ')}.`,
}))
</script>

<template>
  <div class="wrap landing-wrap">
    <!-- =====================================================================
         ROLE SELECTION VIEW (选择角色)
         ===================================================================== -->
    <section v-if="showRolePicker" class="stage" aria-label="选择角色">
      <header class="hero-card">
        <div class="hero-main">
          <h1>请选择你的角色（J / S / T / D）</h1>
          <p class="read muted">
            选择角色后，即可进入「选择课题」勾选你需要的四个组级课题清单（<b>Sim4Options 期权</b>、<b>Sim4Director 导演</b>、<b>Sim4Comics 漫画</b>、<b>交易入道</b>），进入属于你的角色主页。
          </p>
        </div>
        <div class="hero-art">
          <FoxSticker pose="study" force-folder="fox" :size="100" />
        </div>
      </header>

      <div class="role-grid">
        <article
          v-for="p in PERSONA_LIST"
          :key="p.id"
          class="role-card"
          :class="{ selected: nexus.state.activePersona === p.id }"
          :style="{ '--p-accent': p.accent }"
        >
          <div class="role-card-top">
            <div class="role-badge-group">
              <span class="role-letter" :style="{ background: p.accent }">{{ p.id }}</span>
              <div>
                <strong class="role-codename">{{ p.id }} · {{ p.codename }}</strong>
                <span class="role-zh-title">{{ p.titleZh }} · {{ p.divisionZh }}</span>
              </div>
            </div>

            <div class="role-portrait-box">
              <FoxSticker :pose="p.mascotPose" :force-folder="p.mascotFolder" :size="74" />
            </div>
          </div>

          <p class="role-tagline">{{ p.tagline }}</p>

          <div class="role-subject-chips">
            <span class="muted small">已关联课题：</span>
            <span
              v-for="s in personaSubjects(p.id)"
              :key="s.id"
              class="subj-mini-pill"
              :style="{ '--sc': s.accent }"
            >
              <i :class="['fa-solid', s.icon]" aria-hidden="true" />
              {{ s.brand }}
            </span>
          </div>

          <div class="role-card-foot">
            <button
              v-if="nexus.state.activePersona"
              type="button"
              class="btn"
              @click="chooseRoleAndEnterHome(p.id)"
            >
              直接进入 {{ p.id }} 主页
            </button>
            <button
              type="button"
              class="btn primary"
              @click="chooseRoleAndPickSubjects(p.id)"
            >
              选择 {{ p.id }} → 选择课题
              <i class="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- =====================================================================
         PERSONAL ROLE LANDING PAGE (角色专属主页 — 无上方步骤导航条)
         ===================================================================== -->
    <section v-else class="stage" aria-label="角色专属 Landing Page">
      <header class="hero-card" :style="{ '--p-accent': currentPersona.accent }">
        <div class="hero-main">
          <div class="eyebrow-row">
            <span class="role-inline-badge" :style="{ background: currentPersona.accent }">
              {{ currentPersona.id }} · {{ currentPersona.codename }}
            </span>
            <span class="chip">{{ currentPersona.divisionZh }}</span>
          </div>

          <h1>{{ currentPersona.id }} · {{ currentPersona.titleZh }}</h1>
          <p class="read muted">{{ currentPersona.tagline }}</p>

          <div class="hero-actions">
            <RouterLink to="/subjects" class="btn primary">
              <i class="fa-solid fa-list-check" aria-hidden="true" />
              选择课题（已选 {{ selectedSubjects.length }} / 4）
            </RouterLink>
            <button type="button" class="btn" @click="openRoleSelector">
              <i class="fa-solid fa-user-astronaut" aria-hidden="true" />
              切换角色
            </button>
          </div>
        </div>

        <div class="hero-art">
          <FoxSticker
            :pose="currentPersona.mascotPose"
            :force-folder="currentPersona.mascotFolder"
            :size="108"
          />
        </div>
      </header>

      <!-- SELECTED GROUP-LEVEL SUBJECTS -->
      <div class="subjects-grid">
        <article
          v-for="s in selectedSubjects"
          :key="s.id"
          class="subject-card"
          :style="{ '--s-accent': s.accent }"
        >
          <div class="spread">
            <span class="subj-pill" :style="{ background: s.accent }">
              <i :class="['fa-solid', s.icon]" aria-hidden="true" />
              {{ s.brand }}
            </span>
            <span class="chip">{{ s.code }}</span>
          </div>

          <div class="subj-body">
            <div class="subj-text">
              <h2>{{ s.titleZh }}</h2>
              <p class="subj-en">{{ s.titleEn }}</p>
              <p class="subj-desc">{{ s.summary }}</p>
            </div>
            <div class="subj-art">
              <FoxSticker :pose="s.mascotPose" :force-folder="s.mascotFolder" :size="76" />
            </div>
          </div>

          <div class="subj-stats">
            <span v-for="st in s.stats" :key="st" class="chip">{{ st }}</span>
          </div>

          <div class="subj-links">
            <button
              v-for="(ql, idx) in s.quickLinks"
              :key="ql.href"
              type="button"
              class="btn"
              :class="{ primary: idx === 0 }"
              @click="navigateHref(ql.href, s.domain)"
            >
              <i :class="['fa-solid', ql.icon]" aria-hidden="true" />
              {{ ql.label }}
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing-wrap {
  display: grid;
  gap: 1.2rem;
  padding-top: .8rem;
}

.stage {
  display: grid;
  gap: 1.15rem;
}

.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.25rem;
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 18px;
  padding: 1.3rem 1.45rem;
  box-shadow: inset 0 6px 0 var(--p-accent, var(--fox)), var(--shadow);
}
.hero-main {
  flex: 1;
  display: grid;
  gap: .5rem;
}
.hero-card h1 {
  font-size: clamp(1.45rem, 3vw, 2rem);
  margin: 0;
}
.hero-card p {
  margin: 0;
}
.hero-art {
  flex: none;
  width: 118px;
  height: 118px;
  border-radius: 16px;
  border: 2px solid var(--edge);
  background: var(--ink);
  display: grid;
  place-items: center;
  box-shadow: var(--shadow-sm);
}

.eyebrow-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .45rem;
}
.role-inline-badge {
  display: inline-flex;
  align-items: center;
  padding: .2rem .7rem;
  border-radius: 99px;
  border: 1.5px solid var(--edge);
  color: #fff;
  font-size: .8rem;
  font-weight: 800;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .55rem;
  margin-top: .25rem;
}

/* Role Cards */
.role-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.role-card {
  display: flex;
  flex-direction: column;
  gap: .65rem;
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 18px;
  padding: 1.2rem 1.25rem;
  box-shadow: inset 0 6px 0 var(--p-accent, var(--edge)), var(--shadow);
  transition: transform .12s ease, box-shadow .12s ease, background .15s ease;
}
.role-card:hover {
  background: #fffdf7;
  transform: translate(-1px, -1px);
  box-shadow: inset 0 6px 0 var(--p-accent, var(--edge)), 5px 5px 0 var(--edge);
}
.role-card.selected {
  background: #fff9eb;
}
.role-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: .75rem;
}
.role-badge-group {
  display: flex;
  align-items: center;
  gap: .75rem;
}
.role-letter {
  width: 48px;
  height: 48px;
  border-radius: 13px;
  border: 2px solid var(--edge);
  color: #fff;
  font-family: var(--display);
  font-size: 1.55rem;
  display: inline-grid;
  place-items: center;
  box-shadow: var(--shadow-sm);
  flex: none;
}
.role-codename {
  font-family: var(--display);
  font-size: 1rem;
  display: block;
}
.role-zh-title {
  display: block;
  font-size: .86rem;
  font-weight: 700;
  color: var(--muted);
  margin-top: .15rem;
}
.role-portrait-box {
  flex: none;
  width: 82px;
  height: 82px;
  border-radius: 14px;
  border: 2px solid var(--edge);
  background: var(--ink);
  display: grid;
  place-items: center;
  box-shadow: var(--shadow-sm);
}
.role-tagline {
  margin: 0;
  font-size: .9rem;
  color: var(--paper);
  line-height: 1.55;
  flex: 1;
}
.role-subject-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .4rem;
}
.subj-mini-pill {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  padding: .2rem .6rem;
  border-radius: 99px;
  border: 1.5px solid var(--edge);
  background: var(--panel);
  font-size: .76rem;
  font-weight: 800;
  box-shadow: inset 3px 0 0 var(--sc, var(--edge));
}
.subj-mini-pill i {
  color: var(--sc, var(--edge));
}
.role-card-foot {
  display: flex;
  justify-content: flex-end;
  gap: .5rem;
  flex-wrap: wrap;
  padding-top: .65rem;
  border-top: 1.5px dashed var(--line);
}

/* Selected Group-Level Subject Cards on Role Landing Page */
.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 1rem;
}
.subject-card {
  display: flex;
  flex-direction: column;
  gap: .75rem;
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 18px;
  padding: 1.2rem 1.25rem;
  box-shadow: inset 0 6px 0 var(--s-accent, var(--edge)), var(--shadow);
}
.subj-pill {
  display: inline-flex;
  align-items: center;
  gap: .38rem;
  padding: .24rem .75rem;
  border-radius: 99px;
  border: 1.5px solid var(--edge);
  color: #fff;
  font-size: .82rem;
  font-weight: 800;
}
.subj-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .85rem;
}
.subj-text {
  flex: 1;
  display: grid;
  gap: .25rem;
}
.subj-text h2 {
  margin: 0;
  font-size: 1.25rem;
}
.subj-en {
  margin: 0;
  font-size: .82rem;
  font-weight: 700;
  color: var(--muted);
}
.subj-desc {
  margin: .2rem 0 0;
  font-size: .9rem;
  color: var(--paper);
  line-height: 1.55;
}
.subj-art {
  flex: none;
  width: 84px;
  height: 84px;
  border-radius: 14px;
  border: 2px solid var(--edge);
  background: var(--ink);
  display: grid;
  place-items: center;
  box-shadow: var(--shadow-sm);
}
.subj-stats {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
}
.subj-links {
  display: flex;
  flex-wrap: wrap;
  gap: .45rem;
  padding-top: .55rem;
  border-top: 1.5px dashed var(--line);
}

.small {
  font-size: .82rem;
}

@media (max-width: 780px) {
  .role-grid,
  .subjects-grid {
    grid-template-columns: 1fr;
  }
  .hero-card {
    flex-direction: column;
    align-items: stretch;
  }
  .hero-art {
    align-self: center;
  }
}
</style>
