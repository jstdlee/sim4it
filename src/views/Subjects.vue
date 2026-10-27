<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useApp } from '../stores/app'
import {
  PERSONA_LIST,
  SUBJECT_LIST,
  usePersonaNexus,
  type PersonaId,
  type SubjectId,
} from '../domains/topics'
import FoxSticker from '../components/FoxSticker.vue'
import { usePageContext } from '../lib/context'

const app = useApp()
const nexus = usePersonaNexus()
const router = useRouter()

const currentPersona = computed(() => nexus.activePersona.value)
const selectedCount = computed(() => nexus.activeSubjectIds.value.length)

function switchRole(id: PersonaId) {
  nexus.setPersona(id)
  const p = nexus.getPersonaProfile(id)
  app.setDomain(p.defaultDomain)
}

function toggleGroup(sid: SubjectId) {
  nexus.toggleSubject(sid)
}

function selectAllFour() {
  nexus.setSubjectsForPersona(['options', 'director', 'comics', 'trading'])
}

function confirmAndEnterLanding() {
  if (nexus.activeSubjectIds.value.length === 0) {
    nexus.resetPersonaSubjects()
  }
  const firstDomainSubj = nexus.activeSubjects.value.find((s) => s.domain)
  if (firstDomainSubj?.domain) {
    app.setDomain(firstDomainSubj.domain)
  }
  router.push('/')
}

usePageContext(() => ({
  kind: 'page',
  label: `选择课题 · ${currentPersona.value.id} (${currentPersona.value.codename})`,
  text: `Group-level subject selection page for ${currentPersona.value.id}. Selected groups: ${nexus.activeSubjectIds.value.join(', ')}.`,
}))
</script>

<template>
  <div class="wrap subj-page">
    <header class="subj-head" :style="{ '--p-accent': currentPersona.accent }">
      <div class="subj-head-main">
        <div class="role-switch-row">
          <span class="role-tag" :style="{ background: currentPersona.accent }">
            当前角色：{{ currentPersona.id }} · {{ currentPersona.codename }}（{{ currentPersona.titleZh }}）
          </span>
          <div class="role-mini-tabs" role="tablist" aria-label="切换角色">
            <button
              v-for="p in PERSONA_LIST"
              :key="p.id"
              type="button"
              class="r-tab"
              :class="{ on: nexus.currentPersonaId.value === p.id }"
              :style="nexus.currentPersonaId.value === p.id ? { background: p.accent, color: '#fff' } : {}"
              @click="switchRole(p.id)"
            >
              {{ p.id }} · {{ p.titleZh }}
            </button>
          </div>
        </div>

        <h1>选择课题（四个课题清单）</h1>
        <p class="read muted">
          请为 <b>{{ currentPersona.id }} · {{ currentPersona.titleZh }}</b> 勾选需要加入专属主页的组级课题（共 4 个：<b>Sim4Options 期权</b>、<b>Sim4Director 导演</b>、<b>Sim4Comics 漫画</b>、<b>交易入道</b>）。
        </p>

        <div class="head-actions">
          <button type="button" class="btn primary" @click="confirmAndEnterLanding">
            <i class="fa-solid fa-check" aria-hidden="true" />
            确认选择（已选 {{ selectedCount }} / 4 个课题）→ 进入 {{ currentPersona.id }} 主页
          </button>
          <button type="button" class="btn" @click="selectAllFour">
            全选 4 个课题
          </button>
          <button type="button" class="btn" @click="nexus.resetPersonaSubjects()">
            恢复 {{ currentPersona.id }} 默认课题
          </button>
        </div>
      </div>

      <div class="subj-head-art">
        <FoxSticker
          :pose="currentPersona.mascotPose"
          :force-folder="currentPersona.mascotFolder"
          :size="104"
        />
      </div>
    </header>

    <!-- 4 GROUP-LEVEL SUBJECT CARDS -->
    <div class="four-grid">
      <article
        v-for="s in SUBJECT_LIST"
        :key="s.id"
        class="group-card"
        :class="{ checked: nexus.hasSubject(s.id) }"
        :style="{ '--s-accent': s.accent }"
        @click="toggleGroup(s.id)"
      >
        <div class="spread">
          <span class="group-pill" :style="{ background: s.accent }">
            <i :class="['fa-solid', s.icon]" aria-hidden="true" />
            {{ s.brand }}
          </span>

          <button
            type="button"
            class="check-pill"
            :class="{ on: nexus.hasSubject(s.id) }"
            @click.stop="toggleGroup(s.id)"
          >
            <i :class="['fa-solid', nexus.hasSubject(s.id) ? 'fa-square-check' : 'fa-regular fa-square']" aria-hidden="true" />
            {{ nexus.hasSubject(s.id) ? '已选入清单' : '点击勾选' }}
          </button>
        </div>

        <div class="group-body">
          <div class="group-text">
            <h2>{{ s.titleZh }}</h2>
            <p class="group-en">{{ s.titleEn }}</p>
            <p class="group-desc">{{ s.summary }}</p>
          </div>
          <div class="group-art">
            <FoxSticker :pose="s.mascotPose" :force-folder="s.mascotFolder" :size="76" />
          </div>
        </div>

        <div class="group-stats">
          <span v-for="st in s.stats" :key="st" class="chip">{{ st }}</span>
        </div>
      </article>
    </div>

    <div class="bottom-confirm">
      <span>已为 <b>{{ currentPersona.id }} · {{ currentPersona.titleZh }}</b> 勾选 <b>{{ selectedCount }}</b> 个组级课题</span>
      <button type="button" class="btn primary" @click="confirmAndEnterLanding">
        确认并进入 {{ currentPersona.id }} 专属 Landing Page
        <i class="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.subj-page {
  display: grid;
  gap: 1.2rem;
  padding-top: .8rem;
}

.subj-head {
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
.subj-head-main {
  flex: 1;
  display: grid;
  gap: .55rem;
}
.subj-head h1 {
  margin: 0;
  font-size: clamp(1.45rem, 3vw, 2rem);
}
.subj-head p {
  margin: 0;
}
.subj-head-art {
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

.role-switch-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .5rem;
}
.role-tag {
  display: inline-flex;
  align-items: center;
  padding: .2rem .7rem;
  border-radius: 99px;
  border: 1.5px solid var(--edge);
  color: #fff;
  font-size: .8rem;
  font-weight: 800;
}
.role-mini-tabs {
  display: inline-flex;
  flex-wrap: wrap;
  gap: .3rem;
}
.r-tab {
  padding: .18rem .6rem;
  border-radius: 99px;
  border: 1.5px solid var(--edge);
  background: var(--ink);
  font-size: .78rem;
  font-weight: 800;
}
.r-tab:hover {
  background: #fff6dc;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .55rem;
  margin-top: .25rem;
}

.four-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.group-card {
  display: flex;
  flex-direction: column;
  gap: .75rem;
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 18px;
  padding: 1.2rem 1.25rem;
  box-shadow: inset 0 6px 0 var(--s-accent, var(--edge)), var(--shadow);
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease, background .15s;
}
.group-card:hover {
  background: #fffdf7;
  transform: translate(-1px, -1px);
  box-shadow: inset 0 6px 0 var(--s-accent, var(--edge)), 5px 5px 0 var(--edge);
}
.group-card.checked {
  background: #fff9eb;
}

.group-pill {
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
.check-pill {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .24rem .75rem;
  border-radius: 99px;
  border: 2px solid var(--edge);
  background: var(--ink);
  font-size: .82rem;
  font-weight: 800;
}
.check-pill.on {
  background: var(--pop);
  box-shadow: var(--shadow-sm);
}

.group-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .85rem;
}
.group-text {
  flex: 1;
  display: grid;
  gap: .25rem;
}
.group-text h2 {
  margin: 0;
  font-size: 1.25rem;
}
.group-en {
  margin: 0;
  font-size: .82rem;
  font-weight: 700;
  color: var(--muted);
}
.group-desc {
  margin: .2rem 0 0;
  font-size: .9rem;
  color: var(--paper);
  line-height: 1.55;
}
.group-art {
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

.group-stats {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
  padding-top: .55rem;
  border-top: 1.5px dashed var(--line);
}

.bottom-confirm {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 16px;
  padding: .9rem 1.2rem;
  box-shadow: var(--shadow);
}

@media (max-width: 780px) {
  .four-grid {
    grid-template-columns: 1fr;
  }
  .subj-head {
    flex-direction: column;
    align-items: stretch;
  }
  .subj-head-art {
    align-self: center;
  }
}
</style>
