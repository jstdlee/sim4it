<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApp } from '../stores/app'
import {
  PERSONA_LIST,
  SUBJECT_COLLECTIONS,
  SUBJECT_LIST,
  usePersonaNexus,
  type PersonaId,
  type SubjectId,
  type MicroTopic,
  type TopicKind,
} from '../domains/topics'
import FoxSticker from '../components/FoxSticker.vue'
import { usePageContext } from '../lib/context'

type FlowStep = 'role' | 'topics' | 'landing'

const app = useApp()
const nexus = usePersonaNexus()
const route = useRoute()
const router = useRouter()

// 3-step guided flow: 'role' (Step 1) -> 'topics' (Step 2) -> 'landing' (Step 3)
const initialStep = (): FlowStep => {
  const qStep = route.query.step
  if (qStep === 'role' || qStep === 'topics' || qStep === 'landing') return qStep
  return 'role'
}
const step = ref<FlowStep>(initialStep())

function goToStep(next: FlowStep) {
  step.value = next
  router.replace({ query: { ...route.query, step: next === 'role' ? undefined : next } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(
  () => route.query.step,
  (qStep) => {
    if (qStep === 'role' || qStep === 'topics' || qStep === 'landing') {
      step.value = qStep
    } else if (!qStep) {
      step.value = 'role'
    }
  }
)

const currentPersona = computed(() => nexus.activePersona.value)

// Role & subject mascot helpers (using valid .webp stickers)
function roleMascotFolder(id: PersonaId): 'fox' | 'hikari' {
  return id === 'S' || id === 'D' ? 'hikari' : 'fox'
}
function roleMascotPose(id: PersonaId): string {
  if (id === 'J') return 'study'
  if (id === 'S') return 'director'
  if (id === 'T') return 'think'
  return 'smile'
}
function subjectMascotFolder(sid: SubjectId): 'fox' | 'hikari' {
  return sid === 'director' ? 'hikari' : 'fox'
}
function subjectMascotPose(sid: SubjectId): string {
  if (sid === 'options') return 'study'
  if (sid === 'director') return 'director'
  if (sid === 'comics') return 'point'
  return 'think'
}

// Filters for Step 3 (Landing checklist) and Step 2 (Topic collection picker)
const checklistSubjectFilter = ref<SubjectId | 'all'>('all')
const checklistStatusFilter = ref<'all' | 'todo' | 'done'>('all')
const checklistSearch = ref('')

const catalogSubject = ref<SubjectId | 'all'>('all')
const catalogKind = ref<TopicKind | 'all'>('all')
const catalogSearch = ref('')

// Modals / Drawers for custom persona codename and custom topic creation
const showPersonaEditor = ref(false)
const editCodename = ref('')
const editTitleZh = ref('')
const editTagline = ref('')

function openPersonaEditModal() {
  const p = currentPersona.value
  editCodename.value = p.codename
  editTitleZh.value = p.titleZh
  editTagline.value = p.tagline
  showPersonaEditor.value = true
}

function savePersonaEditModal() {
  nexus.updatePersonaProfile(nexus.state.activePersona, {
    codename: editCodename.value.trim(),
    titleZh: editTitleZh.value.trim(),
    tagline: editTagline.value.trim(),
  })
  showPersonaEditor.value = false
}

function resetPersonaEditModal() {
  nexus.resetPersonaProfile(nexus.state.activePersona)
  showPersonaEditor.value = false
}

const showNewTopicModal = ref(false)
const newTopicSubject = ref<SubjectId>('options')
const newTopicCode = ref('CUSTOM-01')
const newTopicTitle = ref('')
const newTopicTitleEn = ref('')
const newTopicSummary = ref('')
const newTopicHref = ref('/journey')

function createNewCustomTopic() {
  if (!newTopicTitle.value.trim()) return
  nexus.addCustomTopic({
    subject: newTopicSubject.value,
    code: newTopicCode.value.trim() || 'CUSTOM',
    title: newTopicTitle.value.trim(),
    titleEn: newTopicTitleEn.value.trim() || 'Custom Study Topic',
    summary: newTopicSummary.value.trim() || '自定义添加的专属研究微课题。',
    href: newTopicHref.value.trim() || '/journey',
    pinToCurrentPersona: true,
  })
  newTopicTitle.value = ''
  newTopicTitleEn.value = ''
  newTopicSummary.value = ''
  showNewTopicModal.value = false
}

// Stats per persona
function personaStats(id: PersonaId) {
  const pinnedIds = nexus.state.pinnedByPersona[id] ?? []
  const doneSet = new Set(nexus.state.completedByPersona[id] ?? [])
  const bySubject: Record<SubjectId, number> = { options: 0, director: 0, comics: 0, trading: 0 }
  let doneCount = 0
  for (const tid of pinnedIds) {
    const t = nexus.topicMap.value[tid]
    if (t) {
      bySubject[t.subject] = (bySubject[t.subject] ?? 0) + 1
      if (doneSet.has(tid)) doneCount++
    }
  }
  return { total: pinnedIds.length, done: doneCount, bySubject }
}

const activeStats = computed(() => personaStats(nexus.state.activePersona))
const progressPct = computed(() =>
  activeStats.value.total > 0
    ? Math.round((activeStats.value.done / activeStats.value.total) * 100)
    : 0
)

// Subject collection stats for current role
function subjectSelectedCount(sid: SubjectId): number {
  return activeStats.value.bySubject[sid] ?? 0
}
function subjectTotalCount(sid: SubjectId): number {
  return nexus.allTopics.value.filter((t) => t.subject === sid).length
}
function subjectDoneCount(sid: SubjectId): number {
  return nexus.activeChecklistTopics.value.filter(
    (t) => t.subject === sid && nexus.isDone(t.id)
  ).length
}

// Selected Subject Collections for Step 3 (only subjects with >= 1 selected topic, or fallback to all if 0)
const selectedSubjects = computed(() => {
  const list = SUBJECT_LIST.filter((s) => subjectSelectedCount(s.id) > 0)
  return list.length > 0 ? list : SUBJECT_LIST
})

// Toggle entire Subject Collection in Step 2
function toggleSubjectCollection(sid: SubjectId) {
  const allInSubj = nexus.allTopics.value.filter((t) => t.subject === sid).map((t) => t.id)
  if (subjectSelectedCount(sid) > 0) {
    nexus.unpinBatch(allInSubj)
  } else {
    nexus.pinBatch(allInSubj.slice(0, 6))
  }
}

function addAllInSubject(sid: SubjectId) {
  const ids = nexus.allTopics.value.filter((t) => t.subject === sid).map((t) => t.id)
  nexus.pinBatch(ids)
}

// Step 1 action: select role and move to Step 2 (select topic collections)
function pickRoleAndConfigureTopics(id: PersonaId) {
  nexus.setPersona(id)
  const p = nexus.getPersonaProfile(id)
  app.setDomain(p.defaultDomain)
  goToStep('topics')
}

// Step 1 shortcut: select role and jump straight to Step 3 (personal landing page)
function pickRoleAndEnterLanding(id: PersonaId) {
  nexus.setPersona(id)
  const p = nexus.getPersonaProfile(id)
  app.setDomain(p.defaultDomain)
  goToStep('landing')
}

// Catalog filtering for Step 2 granular micro-topics
const filteredCatalog = computed(() => {
  const q = catalogSearch.value.trim().toLowerCase()
  return nexus.allTopics.value.filter((t) => {
    if (catalogSubject.value !== 'all' && t.subject !== catalogSubject.value) return false
    if (catalogKind.value !== 'all' && t.kind !== catalogKind.value) return false
    if (q) {
      const hay = `${t.code} ${t.title} ${t.titleEn} ${t.summary} ${t.tags.join(' ')}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
})

// Filtered checklist for Step 3
const filteredChecklist = computed(() => {
  const q = checklistSearch.value.trim().toLowerCase()
  return nexus.activeChecklistTopics.value.filter((topic) => {
    if (checklistSubjectFilter.value !== 'all' && topic.subject !== checklistSubjectFilter.value) {
      return false
    }
    const done = nexus.isDone(topic.id)
    if (checklistStatusFilter.value === 'todo' && done) return false
    if (checklistStatusFilter.value === 'done' && !done) return false
    if (q) {
      const hay = `${topic.code} ${topic.title} ${topic.titleEn} ${topic.summary} ${topic.tags.join(' ')}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
})

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

function launchTopic(t: MicroTopic) {
  navigateHref(t.href, t.domain)
}

const KIND_LABELS: Record<TopicKind, { label: string; icon: string }> = {
  level: { label: '闯关 Level', icon: 'fa-compass' },
  cards: { label: '卡片包', icon: 'fa-layer-group' },
  case: { label: '实战案例', icon: 'fa-film' },
  lab: { label: '互动沙盘', icon: 'fa-flask' },
  'trading-chapter': { label: '入道章节', icon: 'fa-book-open' },
  'trading-tool': { label: '交易工具', icon: 'fa-compass-drafting' },
  custom: { label: '自定义课题', icon: 'fa-wand-magic-sparkles' },
}

usePageContext(() => ({
  kind: 'page',
  label: `Sim4It · ${currentPersona.value.codename} (${step.value})`,
  text: `Sim4It 3-step guided learning hub. Active role: ${currentPersona.value.id} · ${currentPersona.value.codename}. Step: ${step.value}. Selected topics: ${activeStats.value.total}.`,
}))
</script>

<template>
  <div class="wrap landing-wrap">
    <!-- 3-STEP FLOW PROGRESS BAR -->
    <nav class="flow-stepper" aria-label="Onboarding and role landing steps">
      <button
        type="button"
        class="step-pill"
        :class="{ active: step === 'role', done: step !== 'role' }"
        @click="goToStep('role')"
      >
        <span class="step-num">1</span>
        <div class="step-txt">
          <strong>第一步：选择角色</strong>
          <small>当前：{{ currentPersona.id }} · {{ currentPersona.codename }}</small>
        </div>
      </button>

      <i class="fa-solid fa-chevron-right step-arrow" aria-hidden="true" />

      <button
        type="button"
        class="step-pill"
        :class="{ active: step === 'topics', done: step === 'landing' }"
        @click="goToStep('topics')"
      >
        <span class="step-num">2</span>
        <div class="step-txt">
          <strong>第二步：选择课题集合</strong>
          <small>已选 {{ activeStats.total }} 个微课题</small>
        </div>
      </button>

      <i class="fa-solid fa-chevron-right step-arrow" aria-hidden="true" />

      <button
        type="button"
        class="step-pill"
        :class="{ active: step === 'landing' }"
        @click="goToStep('landing')"
      >
        <span class="step-num">3</span>
        <div class="step-txt">
          <strong>第三步：专属角色 Landing Page</strong>
          <small>{{ currentPersona.titleZh }}</small>
        </div>
      </button>
    </nav>

    <!-- =====================================================================
         STEP 1: SELECT ROLE (提示选择角色)
         ===================================================================== -->
    <section v-if="step === 'role'" class="step-stage" aria-label="Step 1 Select Role">
      <header class="stage-banner" :style="{ '--p-accent': currentPersona.accent }">
        <div class="stage-banner-main">
          <div class="eyebrow-row">
            <span class="chip on">STEP 01 / 03 · 提示选择角色</span>
            <span class="chip">免登录即刻学习 · 本地持久化进度</span>
          </div>
          <h1>欢迎来到 Sim4It · 请先选择你的研究角色</h1>
          <p class="read muted">
            四位科研观测员（<b>J · S · T · D</b>）拥有各自独立的课题集合与学习清单。点击下方任意角色卡片即可进入<b>第二步：选择课题集合</b>，或直接进入该角色的专属 Landing Page。
          </p>
        </div>
        <div class="stage-banner-art">
          <FoxSticker
            :pose="roleMascotPose(nexus.state.activePersona)"
            :force-folder="roleMascotFolder(nexus.state.activePersona)"
            :size="108"
          />
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
                <div class="role-code-row">
                  <strong class="role-codename">{{ p.id }} · {{ nexus.getPersonaProfile(p.id).codename }}</strong>
                  <span v-if="nexus.state.activePersona === p.id" class="active-tag">当前选中</span>
                </div>
                <span class="role-zh-title">{{ nexus.getPersonaProfile(p.id).titleZh }} · {{ p.divisionZh }}</span>
              </div>
            </div>

            <div class="role-portrait-box">
              <FoxSticker :pose="roleMascotPose(p.id)" :force-folder="roleMascotFolder(p.id)" :size="76" />
            </div>
          </div>

          <p class="role-tagline">{{ nexus.getPersonaProfile(p.id).tagline }}</p>

          <div class="role-focus-chips">
            <span v-for="rf in p.researchFocus" :key="rf" class="chip">{{ rf }}</span>
          </div>

          <div class="role-subject-chips">
            <span
              v-for="s in SUBJECT_LIST"
              :key="s.id"
              class="subj-mini-pill"
              :class="{ on: personaStats(p.id).bySubject[s.id] > 0 }"
              :style="{ '--sc': s.accent }"
            >
              <i :class="['fa-solid', s.icon]" aria-hidden="true" />
              {{ s.brand.replace('Sim4', '') }}
              <b>{{ personaStats(p.id).bySubject[s.id] }}</b>
            </span>
          </div>

          <div class="role-card-foot">
            <span class="role-stat-text">
              <i class="fa-solid fa-list-check" aria-hidden="true" />
              已配置 <b>{{ personaStats(p.id).total }}</b> 个课题（已完成 {{ personaStats(p.id).done }}）
            </span>
            <div class="role-actions">
              <button
                type="button"
                class="btn"
                @click="pickRoleAndEnterLanding(p.id)"
              >
                直接进入主页
              </button>
              <button
                type="button"
                class="btn primary"
                @click="pickRoleAndConfigureTopics(p.id)"
              >
                选择 {{ p.id }} → 选择课题集合
                <i class="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- =====================================================================
         STEP 2: SELECT SUBJECT & TOPIC COLLECTIONS (提示选择课题集合)
         ===================================================================== -->
    <section v-else-if="step === 'topics'" class="step-stage" aria-label="Step 2 Select Topic Collections">
      <header class="stage-banner" :style="{ '--p-accent': currentPersona.accent }">
        <div class="stage-banner-main">
          <div class="eyebrow-row">
            <span class="chip on">STEP 02 / 03 · 提示选择课题集合</span>
            <span class="role-inline-badge" :style="{ background: currentPersona.accent }">
              当前角色：{{ currentPersona.id }} · {{ currentPersona.codename }}
            </span>
          </div>
          <h1>为 {{ currentPersona.id }} · {{ currentPersona.titleZh }} 选择课题集合</h1>
          <p class="read muted">
            请勾选你要加入当前角色学习计划的<b>四大课题集合</b>（Options 期权 / Director 导演 / Comics 漫画与 JEV / 交易入道），也可在下方展开 99 个微课题精细勾选。完成后点击「进入专属 Landing Page」。
          </p>
          <div class="banner-cta-row">
            <button type="button" class="btn" @click="goToStep('role')">
              <i class="fa-solid fa-arrow-left" aria-hidden="true" />
              返回重选角色
            </button>
            <button type="button" class="btn" @click="nexus.resetPersonaChecklist()">
              <i class="fa-solid fa-rotate-left" aria-hidden="true" />
              恢复 {{ currentPersona.id }} 默认推荐集合
            </button>
            <button type="button" class="btn primary" @click="goToStep('landing')">
              <i class="fa-solid fa-rocket" aria-hidden="true" />
              确认课题集合（已选 {{ activeStats.total }} 项）→ 进入 {{ currentPersona.id }} 专属 Landing Page
            </button>
          </div>
        </div>
        <div class="stage-banner-art">
          <FoxSticker
            :pose="roleMascotPose(nexus.state.activePersona)"
            :force-folder="roleMascotFolder(nexus.state.activePersona)"
            :size="108"
          />
        </div>
      </header>

      <!-- 4 SUBJECT COLLECTION CARDS -->
      <div class="sec-bar">
        <div>
          <h2>一、勾选课题大类集合（Four Subject Collections）</h2>
          <p class="muted small">点击「一键选入核心集合」或「全选该集合」快速配置当前角色的课题领域</p>
        </div>
      </div>

      <div class="collection-grid">
        <article
          v-for="s in SUBJECT_LIST"
          :key="s.id"
          class="collection-card"
          :class="{ selected: subjectSelectedCount(s.id) > 0 }"
          :style="{ '--s-accent': s.accent }"
        >
          <div class="collection-top">
            <div class="collection-title-wrap">
              <div class="collection-badges">
                <span class="subj-pill" :style="{ background: s.accent }">
                  <i :class="['fa-solid', s.icon]" aria-hidden="true" />
                  {{ s.brand }}
                </span>
                <span class="collection-state-pill" :class="{ on: subjectSelectedCount(s.id) > 0 }">
                  {{ subjectSelectedCount(s.id) > 0 ? `✓ 已选 ${subjectSelectedCount(s.id)} / ${subjectTotalCount(s.id)} 项` : '未选入当前角色' }}
                </span>
              </div>
              <h3>{{ s.titleZh }} · {{ s.titleEn }}</h3>
              <p class="collection-sub">{{ s.sciFiDeck }}</p>
            </div>
            <div class="collection-art">
              <FoxSticker :pose="subjectMascotPose(s.id)" :force-folder="subjectMascotFolder(s.id)" :size="72" />
            </div>
          </div>

          <p class="collection-desc">{{ s.summary }}</p>

          <div class="collection-actions">
            <button
              type="button"
              class="btn"
              :class="{ primary: subjectSelectedCount(s.id) === 0 }"
              @click="toggleSubjectCollection(s.id)"
            >
              <i :class="['fa-solid', subjectSelectedCount(s.id) > 0 ? 'fa-square-minus' : 'fa-square-check']" aria-hidden="true" />
              {{ subjectSelectedCount(s.id) > 0 ? '从清单移出该集合' : '+ 一键选入核心集合 (6项)' }}
            </button>
            <button
              v-if="subjectSelectedCount(s.id) < subjectTotalCount(s.id)"
              type="button"
              class="btn"
              @click="addAllInSubject(s.id)"
            >
              <i class="fa-solid fa-layer-group" aria-hidden="true" />
              全选该集合 ({{ subjectTotalCount(s.id) }})
            </button>
            <button
              type="button"
              class="btn"
              :class="{ 'filter-on': catalogSubject === s.id }"
              @click="catalogSubject = catalogSubject === s.id ? 'all' : s.id"
            >
              <i class="fa-solid fa-sliders" aria-hidden="true" />
              {{ catalogSubject === s.id ? '正在下方筛选微课题' : '在下方精细勾选微课题' }}
            </button>
          </div>
        </article>
      </div>

      <!-- GRANULAR MICRO-TOPIC PICKER -->
      <div class="sec-bar" style="margin-top: 1.5rem">
        <div>
          <h2>二、微课题颗粒度勾选（{{ filteredCatalog.length }} 个可选小课题）</h2>
          <p class="muted small">点击任意微课题卡片即可勾选加入或移出 {{ currentPersona.id }} · {{ currentPersona.codename }} 的学习清单</p>
        </div>
        <button type="button" class="btn" @click="showNewTopicModal = !showNewTopicModal">
          <i class="fa-solid fa-plus" aria-hidden="true" />
          新增自定义小课题
        </button>
      </div>

      <!-- Custom topic drawer -->
      <div v-if="showNewTopicModal" class="drawer-card">
        <div class="spread">
          <h3><i class="fa-solid fa-plus-circle" aria-hidden="true" /> 新增自定义微课题（自动加入 {{ currentPersona.id }} · {{ currentPersona.codename }}）</h3>
          <button type="button" class="icon-btn" aria-label="Close" @click="showNewTopicModal = false">
            <i class="fa-solid fa-xmark" />
          </button>
        </div>
        <div class="drawer-grid">
          <label>
            <span>所属主体</span>
            <select v-model="newTopicSubject">
              <option value="options">Options · 期权</option>
              <option value="director">Director · 导演</option>
              <option value="comics">Comics · 漫画与JEV</option>
              <option value="trading">Trading · 交易入道</option>
            </select>
          </label>
          <label>
            <span>课题编号</span>
            <input v-model="newTopicCode" type="text" placeholder="如 OPT-CUSTOM-1" />
          </label>
          <label>
            <span>中文名称 *</span>
            <input v-model="newTopicTitle" type="text" placeholder="输入自定义小课题标题" />
          </label>
          <label>
            <span>英文副标题</span>
            <input v-model="newTopicTitleEn" type="text" placeholder="English Subtitle" />
          </label>
          <label>
            <span>跳转路由</span>
            <input v-model="newTopicHref" type="text" placeholder="/journey 或 /cards 或 /rudao" />
          </label>
          <label class="full-col">
            <span>课题简介</span>
            <input v-model="newTopicSummary" type="text" placeholder="一句话描述该小课题要解决的核心问题…" />
          </label>
        </div>
        <div class="row" style="justify-content: flex-end; margin-top: .75rem">
          <button type="button" class="btn" @click="showNewTopicModal = false">取消</button>
          <button type="button" class="btn primary" @click="createNewCustomTopic">
            <i class="fa-solid fa-check" aria-hidden="true" />保存并加入清单
          </button>
        </div>
      </div>

      <!-- Filter controls -->
      <div class="filter-bar">
        <div class="pill-group" role="tablist" aria-label="Filter by subject">
          <button
            type="button"
            class="f-pill"
            :class="{ on: catalogSubject === 'all' }"
            @click="catalogSubject = 'all'"
          >
            全部主体 ({{ nexus.allTopics.value.length }})
          </button>
          <button
            v-for="s in SUBJECT_LIST"
            :key="s.id"
            type="button"
            class="f-pill"
            :class="{ on: catalogSubject === s.id }"
            :style="{ '--sc': s.accent }"
            @click="catalogSubject = s.id"
          >
            <i :class="['fa-solid', s.icon]" aria-hidden="true" />
            {{ s.brand.replace('Sim4', '') }} ({{ subjectSelectedCount(s.id) }}/{{ subjectTotalCount(s.id) }})
          </button>
        </div>

        <div class="pill-group" role="tablist" aria-label="Filter by topic kind">
          <button
            type="button"
            class="f-pill"
            :class="{ on: catalogKind === 'all' }"
            @click="catalogKind = 'all'"
          >
            全部类型
          </button>
          <button
            v-for="(meta, k) in KIND_LABELS"
            :key="k"
            type="button"
            class="f-pill"
            :class="{ on: catalogKind === k }"
            @click="catalogKind = k as TopicKind"
          >
            <i :class="['fa-solid', meta.icon]" aria-hidden="true" />
            {{ meta.label }}
          </button>
        </div>

        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            v-model="catalogSearch"
            type="search"
            placeholder="搜索微课题（如 Greeks、分镜、JEV、海龟、期望值…）"
          />
        </div>
      </div>

      <!-- Micro-topic grid -->
      <div class="micro-grid">
        <article
          v-for="t in filteredCatalog"
          :key="t.id"
          class="micro-card"
          :class="{ picked: nexus.isPinned(t.id) }"
          :style="{ '--sc': SUBJECT_COLLECTIONS[t.subject].accent }"
          @click="nexus.togglePin(t.id)"
        >
          <div class="spread">
            <div class="micro-badges">
              <span class="subj-tag" :style="{ background: SUBJECT_COLLECTIONS[t.subject].accent }">
                {{ SUBJECT_COLLECTIONS[t.subject].brand.replace('Sim4', '') }}
              </span>
              <span class="code-tag">{{ t.code }}</span>
              <span class="kind-tag">
                <i :class="['fa-solid', KIND_LABELS[t.kind].icon]" aria-hidden="true" />
                {{ KIND_LABELS[t.kind].label }}
              </span>
            </div>
            <span class="pick-indicator" :class="{ on: nexus.isPinned(t.id) }">
              <i :class="['fa-solid', nexus.isPinned(t.id) ? 'fa-circle-check' : 'fa-circle-plus']" aria-hidden="true" />
              {{ nexus.isPinned(t.id) ? '已选' : '勾选' }}
            </span>
          </div>

          <h4>{{ t.title }}</h4>
          <p class="micro-en">{{ t.titleEn }}</p>
          <p class="micro-desc">{{ t.summary }}</p>

          <div class="spread micro-foot">
            <span class="muted small">{{ t.metrics }}</span>
            <span class="diff-tag">{{ t.tags[0] || t.subject }}</span>
          </div>
        </article>
      </div>

      <!-- Sticky bottom confirmation bar for Step 2 -->
      <div class="step2-footer-bar">
        <div class="step2-footer-info">
          <span class="role-dot" :style="{ background: currentPersona.accent }">{{ currentPersona.id }}</span>
          <div>
            <strong>{{ currentPersona.id }} · {{ currentPersona.codename }}</strong>
            <span class="muted small"> · 已选 {{ activeStats.total }} 个微课题（Options {{ activeStats.bySubject.options }} / Director {{ activeStats.bySubject.director }} / Comics {{ activeStats.bySubject.comics }} / 交易 {{ activeStats.bySubject.trading }}）</span>
          </div>
        </div>
        <div class="row">
          <button type="button" class="btn" @click="goToStep('role')">← 重选角色</button>
          <button type="button" class="btn primary" @click="goToStep('landing')">
            确认课题集合 · 进入 {{ currentPersona.id }} 专属 Landing Page
            <i class="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>

    <!-- =====================================================================
         STEP 3: PERSONAL ROLE LANDING PAGE (进入自己角色 Landing Page)
         ===================================================================== -->
    <section v-else class="step-stage" aria-label="Step 3 Personal Role Landing Page">
      <!-- ROLE PERSONAL HERO CARD -->
      <header class="role-hero-card" :style="{ '--p-accent': currentPersona.accent }">
        <div class="role-hero-main">
          <div class="eyebrow-row">
            <span class="role-inline-badge" :style="{ background: currentPersona.accent }">
              ROLE {{ currentPersona.id }} · {{ currentPersona.codename }}
            </span>
            <span class="chip">{{ currentPersona.divisionZh }} · {{ currentPersona.sectorCode }}</span>
          </div>

          <h1>{{ currentPersona.id }} · {{ currentPersona.titleZh }} 专属 Landing Page</h1>
          <p class="read muted">{{ currentPersona.tagline }}</p>

          <!-- Progress bar -->
          <div class="hero-progress-box">
            <div class="spread">
              <strong>当前角色课题进度：已完成 {{ activeStats.done }} / {{ activeStats.total }} 项</strong>
              <span class="pct-pill">{{ progressPct }}%</span>
            </div>
            <div class="progress-rail">
              <div
                class="progress-fill"
                :style="{ width: `${progressPct}%`, background: currentPersona.accent }"
              />
            </div>
          </div>

          <!-- Action buttons to switch role or edit topic collections -->
          <div class="banner-cta-row">
            <button type="button" class="btn" @click="goToStep('role')">
              <i class="fa-solid fa-user-astronaut" aria-hidden="true" />
              切换角色 (当前: {{ currentPersona.id }})
            </button>
            <button type="button" class="btn primary" @click="goToStep('topics')">
              <i class="fa-solid fa-layer-group" aria-hidden="true" />
              管理 / 增删课题集合 ({{ activeStats.total }})
            </button>
            <button type="button" class="btn" @click="openPersonaEditModal">
              <i class="fa-solid fa-pen-to-square" aria-hidden="true" />
              自定义角色代号
            </button>
            <button type="button" class="btn" @click="showNewTopicModal = !showNewTopicModal">
              <i class="fa-solid fa-plus" aria-hidden="true" />
              + 新增自定义小课题
            </button>
          </div>
        </div>

        <div class="role-hero-art">
          <span class="bubble hero-say">{{ currentPersona.id }} 观测台就绪！</span>
          <FoxSticker
            :pose="roleMascotPose(nexus.state.activePersona)"
            :force-folder="roleMascotFolder(nexus.state.activePersona)"
            :size="118"
          />
        </div>
      </header>

      <!-- Optional Persona Edit Drawer -->
      <div v-if="showPersonaEditor" class="drawer-card">
        <div class="spread">
          <h3><i class="fa-solid fa-user-pen" aria-hidden="true" /> 自定义角色 {{ currentPersona.id }} 代号与头衔</h3>
          <button type="button" class="icon-btn" aria-label="Close" @click="showPersonaEditor = false">
            <i class="fa-solid fa-xmark" />
          </button>
        </div>
        <div class="drawer-grid">
          <label>
            <span>科幻代号 (Codename)</span>
            <input v-model="editCodename" type="text" />
          </label>
          <label>
            <span>研究头衔 (中文)</span>
            <input v-model="editTitleZh" type="text" />
          </label>
          <label class="full-col">
            <span>一句话标语 (Tagline)</span>
            <input v-model="editTagline" type="text" />
          </label>
        </div>
        <div class="row" style="justify-content: flex-end; margin-top: .75rem">
          <button type="button" class="btn" @click="resetPersonaEditModal">恢复默认代号</button>
          <button type="button" class="btn primary" @click="savePersonaEditModal">保存修改</button>
        </div>
      </div>

      <!-- Optional Custom Topic Drawer -->
      <div v-if="showNewTopicModal" class="drawer-card">
        <div class="spread">
          <h3><i class="fa-solid fa-plus-circle" aria-hidden="true" /> 新增自定义微课题</h3>
          <button type="button" class="icon-btn" aria-label="Close" @click="showNewTopicModal = false">
            <i class="fa-solid fa-xmark" />
          </button>
        </div>
        <div class="drawer-grid">
          <label>
            <span>所属主体</span>
            <select v-model="newTopicSubject">
              <option value="options">Options · 期权</option>
              <option value="director">Director · 导演</option>
              <option value="comics">Comics · 漫画与JEV</option>
              <option value="trading">Trading · 交易入道</option>
            </select>
          </label>
          <label>
            <span>课题编号</span>
            <input v-model="newTopicCode" type="text" placeholder="如 OPT-CUSTOM-1" />
          </label>
          <label>
            <span>中文名称 *</span>
            <input v-model="newTopicTitle" type="text" placeholder="输入自定义小课题标题" />
          </label>
          <label>
            <span>英文副标题</span>
            <input v-model="newTopicTitleEn" type="text" placeholder="English Subtitle" />
          </label>
          <label class="full-col">
            <span>课题简介</span>
            <input v-model="newTopicSummary" type="text" placeholder="一句话描述该小课题要解决的核心问题…" />
          </label>
        </div>
        <div class="row" style="justify-content: flex-end; margin-top: .75rem">
          <button type="button" class="btn" @click="showNewTopicModal = false">取消</button>
          <button type="button" class="btn primary" @click="createNewCustomTopic">保存并加入清单</button>
        </div>
      </div>

      <!-- MY SELECTED SUBJECT COLLECTIONS -->
      <div class="sec-bar">
        <div>
          <h2>{{ currentPersona.id }} 已选课题集合 · 领域工作台</h2>
          <p class="muted small">仅展示当前角色已选入的课题集合入口，点击「管理/增删课题集合」可随时调整</p>
        </div>
      </div>

      <div class="selected-subjects-grid">
        <article
          v-for="s in selectedSubjects"
          :key="s.id"
          class="subj-quick-card"
          :style="{ '--s-accent': s.accent }"
        >
          <div class="spread">
            <span class="subj-pill" :style="{ background: s.accent }">
              <i :class="['fa-solid', s.icon]" aria-hidden="true" />
              {{ s.brand }} · {{ s.titleZh }}
            </span>
            <span class="chip">
              已完成 {{ subjectDoneCount(s.id) }} / {{ subjectSelectedCount(s.id) }} 课题
            </span>
          </div>

          <div class="subj-quick-body">
            <div>
              <h3>{{ s.sciFiDeck }}</h3>
              <p class="muted small">{{ s.summary }}</p>
            </div>
            <div class="subj-quick-art">
              <FoxSticker
                :pose="subjectMascotPose(s.id)"
                :force-folder="subjectMascotFolder(s.id)"
                :size="68"
              />
            </div>
          </div>

          <div class="subj-quick-links">
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

      <!-- PERSONAL MICRO-TOPIC CHECKLIST -->
      <div class="sec-bar" style="margin-top: 1.5rem">
        <div>
          <h2>{{ currentPersona.id }} · {{ currentPersona.codename }} 专属课题执行清单（{{ filteredChecklist.length }} / {{ nexus.activeChecklistTopics.value.length }}）</h2>
          <p class="muted small">勾选完成状态、调整优先级顺序，或点击「进入学习」直达对应训练模块</p>
        </div>
        <button type="button" class="btn" @click="goToStep('topics')">
          <i class="fa-solid fa-sliders" aria-hidden="true" />
          + 增删更多课题
        </button>
      </div>

      <!-- Checklist filters -->
      <div class="filter-bar">
        <div class="pill-group" role="tablist" aria-label="Filter checklist by subject">
          <button
            type="button"
            class="f-pill"
            :class="{ on: checklistSubjectFilter === 'all' }"
            @click="checklistSubjectFilter = 'all'"
          >
            全部已选 ({{ nexus.activeChecklistTopics.value.length }})
          </button>
          <button
            v-for="s in selectedSubjects"
            :key="s.id"
            type="button"
            class="f-pill"
            :class="{ on: checklistSubjectFilter === s.id }"
            :style="{ '--sc': s.accent }"
            @click="checklistSubjectFilter = s.id"
          >
            <i :class="['fa-solid', s.icon]" aria-hidden="true" />
            {{ s.brand.replace('Sim4', '') }} ({{ subjectSelectedCount(s.id) }})
          </button>
        </div>

        <div class="pill-group" role="tablist" aria-label="Filter checklist by status">
          <button
            type="button"
            class="f-pill"
            :class="{ on: checklistStatusFilter === 'all' }"
            @click="checklistStatusFilter = 'all'"
          >
            全部状态
          </button>
          <button
            type="button"
            class="f-pill"
            :class="{ on: checklistStatusFilter === 'todo' }"
            @click="checklistStatusFilter = 'todo'"
          >
            待攻克 ({{ activeStats.total - activeStats.done }})
          </button>
          <button
            type="button"
            class="f-pill"
            :class="{ on: checklistStatusFilter === 'done' }"
            @click="checklistStatusFilter = 'done'"
          >
            已完成 ({{ activeStats.done }})
          </button>
        </div>

        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input v-model="checklistSearch" type="search" placeholder="在当前角色清单中搜索课题…" />
        </div>
      </div>

      <div v-if="filteredChecklist.length === 0" class="empty-card">
        <FoxSticker pose="oops" :size="96" />
        <div>
          <h3>当前筛选下暂无课题</h3>
          <p class="muted">你可以前往第二步勾选更多课题集合，或恢复 {{ currentPersona.id }} 的默认推荐课题清单。</p>
          <div class="row">
            <button type="button" class="btn primary" @click="goToStep('topics')">前往选择课题集合</button>
            <button type="button" class="btn" @click="nexus.resetPersonaChecklist()">
              恢复默认推荐清单
            </button>
          </div>
        </div>
      </div>

      <div v-else class="checklist-grid">
        <article
          v-for="topic in filteredChecklist"
          :key="topic.id"
          class="task-card"
          :class="{ done: nexus.isDone(topic.id) }"
          :style="{ '--sc': SUBJECT_COLLECTIONS[topic.subject].accent }"
        >
          <div class="spread">
            <div class="micro-badges">
              <button
                type="button"
                class="done-check"
                :class="{ checked: nexus.isDone(topic.id) }"
                :aria-label="nexus.isDone(topic.id) ? '标记为未完成' : '标记为已完成'"
                @click="nexus.toggleDone(topic.id)"
              >
                <i v-if="nexus.isDone(topic.id)" class="fa-solid fa-check" aria-hidden="true" />
              </button>
              <span class="subj-tag" :style="{ background: SUBJECT_COLLECTIONS[topic.subject].accent }">
                <i :class="['fa-solid', SUBJECT_COLLECTIONS[topic.subject].icon]" aria-hidden="true" />
                {{ SUBJECT_COLLECTIONS[topic.subject].brand.replace('Sim4', '') }}
              </span>
              <span class="code-tag">{{ topic.code }}</span>
              <span class="kind-tag">
                <i :class="['fa-solid', KIND_LABELS[topic.kind].icon]" aria-hidden="true" />
                {{ KIND_LABELS[topic.kind].label }}
              </span>
            </div>

            <div class="task-tools">
              <button
                type="button"
                class="icon-btn sm"
                title="上移优先级"
                aria-label="Move topic up"
                @click="nexus.movePin(topic.id, -1)"
              >
                <i class="fa-solid fa-arrow-up" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="icon-btn sm"
                title="下移优先级"
                aria-label="Move topic down"
                @click="nexus.movePin(topic.id, 1)"
              >
                <i class="fa-solid fa-arrow-down" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="icon-btn sm"
                title="从清单移除"
                aria-label="Remove topic"
                @click="nexus.unpinTopic(topic.id)"
              >
                <i class="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="task-body" @click="launchTopic(topic)">
            <h4>{{ topic.title }}</h4>
            <p class="micro-en">{{ topic.titleEn }}</p>
            <p class="micro-desc">{{ topic.summary }}</p>
          </div>

          <div class="spread task-foot">
            <div class="row" style="gap: .35rem">
              <span class="chip">{{ topic.metrics }}</span>
            </div>
            <button type="button" class="btn primary sm-btn" @click="launchTopic(topic)">
              进入学习 <i class="fa-solid fa-arrow-right" aria-hidden="true" />
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
  gap: 1.25rem;
  padding-top: .8rem;
}

/* 3-Step Flow Stepper */
.flow-stepper {
  display: flex;
  align-items: center;
  gap: .5rem;
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 16px;
  padding: .6rem .75rem;
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
}
.step-pill {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: .55rem .8rem;
  border-radius: 12px;
  border: 2px solid transparent;
  background: var(--ink);
  text-align: left;
  transition: background .15s, border-color .15s, box-shadow .15s;
}
.step-pill:hover {
  background: #fff6dc;
  border-color: var(--edge);
}
.step-pill.active {
  background: var(--pop);
  border-color: var(--edge);
  box-shadow: var(--shadow-sm);
}
.step-pill.done:not(.active) {
  background: var(--panel);
  border-color: var(--line);
}
.step-num {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid var(--edge);
  background: var(--panel);
  display: inline-grid;
  place-items: center;
  font-family: var(--display);
  font-size: .9rem;
  flex: none;
}
.step-pill.active .step-num {
  background: var(--edge);
  color: #fff;
}
.step-txt {
  display: grid;
  line-height: 1.25;
}
.step-txt strong {
  font-size: .9rem;
}
.step-txt small {
  font-size: .76rem;
  color: var(--muted);
}
.step-arrow {
  color: var(--muted);
  font-size: .85rem;
  flex: none;
}

/* Stage Container */
.step-stage {
  display: grid;
  gap: 1.15rem;
}

/* Stage Header Banner */
.stage-banner,
.role-hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.25rem;
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 18px;
  padding: 1.35rem 1.5rem;
  box-shadow: inset 0 6px 0 var(--p-accent, var(--fox)), var(--shadow);
}
.stage-banner-main,
.role-hero-main {
  flex: 1;
  display: grid;
  gap: .55rem;
}
.stage-banner h1,
.role-hero-card h1 {
  font-size: clamp(1.45rem, 3.2vw, 2.05rem);
  margin: 0;
}
.stage-banner p,
.role-hero-card p {
  margin: 0;
}
.stage-banner-art,
.role-hero-art {
  flex: none;
  position: relative;
  display: grid;
  place-items: center;
  background: var(--ink);
  border: 2px solid var(--edge);
  border-radius: 16px;
  padding: .65rem .85rem;
  box-shadow: var(--shadow-sm);
}
.hero-say {
  position: absolute;
  top: -14px;
  right: -6px;
  font-size: .76rem;
  padding: .25rem .6rem;
  white-space: nowrap;
  z-index: 2;
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
  gap: .35rem;
  padding: .2rem .7rem;
  border-radius: 99px;
  border: 1.5px solid var(--edge);
  color: #fff;
  font-size: .8rem;
  font-weight: 800;
}
.banner-cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: .55rem;
  margin-top: .35rem;
}

/* STEP 1: 4 Role Cards Grid */
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
.role-code-row {
  display: flex;
  align-items: center;
  gap: .45rem;
  flex-wrap: wrap;
}
.role-codename {
  font-family: var(--display);
  font-size: 1rem;
  letter-spacing: .02em;
}
.active-tag {
  font-size: .72rem;
  font-weight: 800;
  padding: .1rem .5rem;
  border-radius: 99px;
  background: var(--pop);
  border: 1.5px solid var(--edge);
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
  width: 84px;
  height: 84px;
  border-radius: 14px;
  border: 2px solid var(--edge);
  background: var(--ink);
  display: grid;
  place-items: center;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.role-tagline {
  margin: 0;
  font-size: .88rem;
  color: var(--paper);
  line-height: 1.55;
  flex: 1;
}
.role-focus-chips,
.role-subject-chips {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
}
.subj-mini-pill {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  padding: .2rem .55rem;
  border-radius: 99px;
  border: 1.5px solid var(--edge);
  background: var(--ink);
  font-size: .76rem;
  font-weight: 700;
  opacity: .65;
}
.subj-mini-pill.on {
  background: var(--panel);
  opacity: 1;
  box-shadow: inset 3px 0 0 var(--sc, var(--edge));
}
.subj-mini-pill i {
  color: var(--sc, var(--edge));
}
.role-card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .6rem;
  flex-wrap: wrap;
  padding-top: .65rem;
  border-top: 1.5px dashed var(--line);
}
.role-stat-text {
  font-size: .82rem;
  color: var(--muted);
}
.role-actions {
  display: flex;
  gap: .45rem;
  flex-wrap: wrap;
}

/* Section header bar */
.sec-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}
.sec-bar h2 {
  margin: 0 0 .15rem;
  font-size: 1.25rem;
}
.sec-bar p {
  margin: 0;
}
.small {
  font-size: .84rem;
}

/* STEP 2: 4 Subject Collection Cards */
.collection-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.collection-card {
  display: flex;
  flex-direction: column;
  gap: .65rem;
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 18px;
  padding: 1.15rem 1.25rem;
  box-shadow: inset 0 6px 0 var(--s-accent, var(--edge)), var(--shadow);
}
.collection-card.selected {
  background: #fffdf7;
}
.collection-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: .75rem;
}
.collection-title-wrap {
  display: grid;
  gap: .3rem;
}
.collection-badges {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
  align-items: center;
}
.subj-pill {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .2rem .65rem;
  border-radius: 99px;
  border: 1.5px solid var(--edge);
  color: #fff;
  font-size: .78rem;
  font-weight: 800;
}
.collection-state-pill {
  display: inline-flex;
  align-items: center;
  padding: .18rem .6rem;
  border-radius: 99px;
  border: 1.5px solid var(--edge);
  background: var(--ink);
  font-size: .76rem;
  font-weight: 800;
  color: var(--muted);
}
.collection-state-pill.on {
  background: var(--pop);
  color: var(--paper);
}
.collection-card h3 {
  margin: 0;
  font-size: 1.12rem;
}
.collection-sub {
  margin: 0;
  font-size: .8rem;
  font-weight: 800;
  color: var(--muted);
}
.collection-art {
  flex: none;
  width: 78px;
  height: 78px;
  border-radius: 14px;
  border: 2px solid var(--edge);
  background: var(--ink);
  display: grid;
  place-items: center;
  box-shadow: var(--shadow-sm);
}
.collection-desc {
  margin: 0;
  font-size: .88rem;
  color: var(--muted);
  line-height: 1.55;
  flex: 1;
}
.collection-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .45rem;
  padding-top: .5rem;
  border-top: 1.5px dashed var(--line);
}
.btn.filter-on {
  background: var(--pop);
}

/* Filter Bar */
.filter-bar {
  display: grid;
  gap: .55rem;
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 16px;
  padding: .85rem 1rem;
  box-shadow: var(--shadow-sm);
}
.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: .38rem;
}
.f-pill {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .28rem .7rem;
  border-radius: 99px;
  border: 1.5px solid var(--edge);
  background: var(--ink);
  font-size: .8rem;
  font-weight: 700;
}
.f-pill i {
  color: var(--sc, var(--edge));
}
.f-pill:hover {
  background: #fff6dc;
}
.f-pill.on {
  background: var(--pop);
  box-shadow: var(--shadow-sm);
}
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}
.search-box i {
  position: absolute;
  left: .75rem;
  color: var(--muted);
}
.search-box input {
  padding-left: 2.15rem;
}

/* Micro-topic Grid (Step 2) */
.micro-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: .85rem;
}
.micro-card {
  display: flex;
  flex-direction: column;
  gap: .4rem;
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 16px;
  padding: .95rem 1.05rem;
  box-shadow: inset 0 5px 0 var(--sc, var(--edge)), var(--shadow-sm);
  cursor: pointer;
  transition: transform .1s ease, box-shadow .1s ease, background .15s;
}
.micro-card:hover {
  background: #fff9ec;
  transform: translate(-1px, -1px);
  box-shadow: inset 0 5px 0 var(--sc, var(--edge)), 4px 4px 0 var(--edge);
}
.micro-card.picked {
  background: #fff9eb;
}
.micro-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .35rem;
}
.subj-tag {
  display: inline-flex;
  align-items: center;
  gap: .28rem;
  padding: .12rem .5rem;
  border-radius: 99px;
  border: 1.5px solid var(--edge);
  color: #fff;
  font-size: .72rem;
  font-weight: 800;
}
.code-tag {
  font-size: .72rem;
  font-weight: 800;
  padding: .1rem .45rem;
  border-radius: 6px;
  background: var(--ink);
  border: 1px solid var(--edge);
}
.kind-tag {
  font-size: .74rem;
  font-weight: 700;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: .25rem;
}
.pick-indicator {
  display: inline-flex;
  align-items: center;
  gap: .25rem;
  font-size: .76rem;
  font-weight: 800;
  padding: .12rem .5rem;
  border-radius: 99px;
  border: 1.5px solid var(--edge);
  background: var(--ink);
}
.pick-indicator.on {
  background: var(--pop);
}
.micro-card h4,
.task-card h4 {
  margin: .1rem 0 0;
  font-size: 1rem;
  line-height: 1.3;
}
.micro-en {
  margin: 0;
  font-size: .78rem;
  font-weight: 700;
  color: var(--muted);
}
.micro-desc {
  margin: 0;
  font-size: .85rem;
  color: var(--paper);
  line-height: 1.48;
  flex: 1;
}
.micro-foot {
  padding-top: .45rem;
  border-top: 1px dashed var(--line);
}
.diff-tag {
  font-size: .72rem;
  font-weight: 800;
  padding: .08rem .45rem;
  border-radius: 6px;
  background: var(--ink);
  border: 1px solid var(--edge);
}

/* Step 2 Sticky Footer Confirmation Bar */
.step2-footer-bar {
  position: sticky;
  bottom: .75rem;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 16px;
  padding: .8rem 1.1rem;
  box-shadow: 4px 4px 0 var(--edge);
}
.step2-footer-info {
  display: flex;
  align-items: center;
  gap: .65rem;
}
.role-dot {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 2px solid var(--edge);
  color: #fff;
  font-family: var(--display);
  display: inline-grid;
  place-items: center;
  flex: none;
}

/* STEP 3: Role Hero Progress & Selected Subject Cards */
.hero-progress-box {
  display: grid;
  gap: .35rem;
  background: var(--ink);
  border: 1.5px solid var(--edge);
  border-radius: 12px;
  padding: .6rem .85rem;
}
.pct-pill {
  font-family: var(--display);
  font-size: .88rem;
  padding: .08rem .5rem;
  border-radius: 99px;
  background: var(--pop);
  border: 1.5px solid var(--edge);
}
.progress-rail {
  height: 10px;
  border-radius: 99px;
  background: var(--panel);
  border: 1.5px solid var(--edge);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  transition: width .25s ease;
}

.selected-subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: .95rem;
}
.subj-quick-card {
  display: flex;
  flex-direction: column;
  gap: .65rem;
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 18px;
  padding: 1.1rem 1.2rem;
  box-shadow: inset 0 6px 0 var(--s-accent, var(--edge)), var(--shadow-sm);
}
.subj-quick-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .75rem;
}
.subj-quick-body h3 {
  margin: 0 0 .25rem;
  font-size: .95rem;
}
.subj-quick-body p {
  margin: 0;
}
.subj-quick-art {
  flex: none;
  width: 74px;
  height: 74px;
  border-radius: 14px;
  border: 2px solid var(--edge);
  background: var(--ink);
  display: grid;
  place-items: center;
  box-shadow: var(--shadow-sm);
}
.subj-quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: .45rem;
  padding-top: .45rem;
  border-top: 1.5px dashed var(--line);
}

/* STEP 3: Checklist Task Cards */
.checklist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: .85rem;
}
.task-card {
  display: flex;
  flex-direction: column;
  gap: .45rem;
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 16px;
  padding: 1rem 1.05rem;
  box-shadow: inset 5px 0 0 var(--sc, var(--edge)), var(--shadow-sm);
  transition: transform .1s ease, box-shadow .1s ease, background .15s;
}
.task-card:hover {
  background: #fff9ec;
  transform: translate(-1px, -1px);
  box-shadow: inset 5px 0 0 var(--sc, var(--edge)), 4px 4px 0 var(--edge);
}
.task-card.done {
  opacity: .78;
  background: var(--ink);
}
.task-card.done h4 {
  text-decoration: line-through;
}
.done-check {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  border: 2px solid var(--edge);
  background: var(--panel);
  display: inline-grid;
  place-items: center;
  font-size: .78rem;
  color: #fff;
}
.done-check.checked {
  background: var(--call);
}
.task-tools {
  display: flex;
  gap: .15rem;
}
.task-body {
  cursor: pointer;
  display: grid;
  gap: .25rem;
  flex: 1;
}
.task-foot {
  padding-top: .5rem;
  border-top: 1.5px dashed var(--line);
}
.sm-btn {
  padding: .35rem .75rem;
  font-size: .84rem;
}

/* Drawer / Empty Card */
.drawer-card,
.empty-card {
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 16px;
  padding: 1.1rem 1.25rem;
  box-shadow: var(--shadow);
}
.empty-card {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
.drawer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: .75rem;
  margin-top: .65rem;
}
.drawer-grid label {
  display: grid;
  gap: .25rem;
  font-size: .82rem;
  font-weight: 700;
}
.drawer-grid .full-col {
  grid-column: 1 / -1;
}

@media (max-width: 780px) {
  .role-grid,
  .collection-grid {
    grid-template-columns: 1fr;
  }
  .stage-banner,
  .role-hero-card {
    flex-direction: column;
    align-items: stretch;
  }
  .stage-banner-art,
  .role-hero-art {
    align-self: center;
  }
}
</style>
