<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useApp } from '../stores/app'
import { DOMAINS, DOMAIN_LIST } from '../domains/registry'
import {
  PERSONA_LIST,
  SUBJECT_LIST,
  SUBJECT_COLLECTIONS,
  usePersonaNexus,
  type PersonaId,
  type SubjectId,
  type TopicKind,
  type MicroTopic,
} from '../domains/topics'
import type { DomainId, Question } from '../../shared/types'
import FoxSticker from '../components/FoxSticker.vue'
import TermText from '../components/TermText.vue'

const app = useApp()
const router = useRouter()
const nexus = usePersonaNexus()

// Checklist filters
const checklistSubjectFilter = ref<'all' | SubjectId>('all')
const checklistStatusFilter = ref<'all' | 'todo' | 'done'>('all')

// Micro-topic catalog filters
const catalogSubject = ref<'all' | SubjectId>('all')
const catalogKind = ref<'all' | TopicKind>('all')
const catalogQuery = ref('')

// Custom topic creation modal/panel state
const showCustomForm = ref(false)
const customForm = ref<{
  subject: SubjectId
  code: string
  title: string
  titleEn: string
  summary: string
  href: string
  tagsText: string
}>({
  subject: 'trading',
  code: '',
  title: '',
  titleEn: '',
  summary: '',
  href: '',
  tagsText: '',
})

// Persona profile customization panel state
const showPersonaEdit = ref(false)
const personaEditForm = ref({
  codename: '',
  titleZh: '',
  tagline: '',
})

function openPersonaEditor() {
  const cur = nexus.activePersona.value
  personaEditForm.value = {
    codename: cur.codename,
    titleZh: cur.titleZh,
    tagline: cur.tagline,
  }
  showPersonaEdit.value = !showPersonaEdit.value
}

function savePersonaEditor() {
  nexus.updatePersonaProfile(nexus.state.activePersona, {
    codename: personaEditForm.value.codename,
    titleZh: personaEditForm.value.titleZh,
    tagline: personaEditForm.value.tagline,
  })
  showPersonaEdit.value = false
}

function resetPersonaName() {
  nexus.resetPersonaProfile(nexus.state.activePersona)
  showPersonaEdit.value = false
}

function selectPersona(id: PersonaId) {
  nexus.setPersona(id)
  const profile = nexus.getPersonaProfile(id)
  app.setDomain(profile.defaultDomain)
  router.replace({ path: '/', query: { persona: id } })
}

// Compute whether a topic is completed (either manually checked or all quests in level finished)
function isTopicCompleted(topic: MicroTopic, pid: PersonaId = nexus.state.activePersona): boolean {
  if (nexus.isDone(topic.id, pid)) return true
  if (topic.kind === 'level' && topic.domain && topic.levelNum) {
    const prog = getTopicLiveProgress(topic)
    if (prog && prog.total > 0 && prog.done >= prog.total) return true
  }
  return false
}

function getTopicLiveProgress(topic: MicroTopic): { done: number; total: number; pct: number } | null {
  if (topic.kind === 'level' && topic.domain && topic.levelNum) {
    const qs = DOMAINS[topic.domain].bank[topic.levelNum] || []
    const total = qs.length
    const done = app.levelProgress(qs.map((q) => q.id))
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
  }
  return null
}

// Persona telemetry stats for the 4 gateway cards
const personaStats = computed(() => {
  const out: Record<PersonaId, { total: number; done: number; pct: number }> = {
    J: { total: 0, done: 0, pct: 0 },
    S: { total: 0, done: 0, pct: 0 },
    T: { total: 0, done: 0, pct: 0 },
    D: { total: 0, done: 0, pct: 0 },
  }
  for (const pid of ['J', 'S', 'T', 'D'] as PersonaId[]) {
    const ids = nexus.state.pinnedByPersona[pid] || []
    const topics = ids.map((id) => nexus.topicMap.value[id]).filter((t): t is MicroTopic => Boolean(t))
    const total = topics.length
    const done = topics.filter((t) => isTopicCompleted(t, pid)).length
    out[pid] = {
      total,
      done,
      pct: total ? Math.round((done / total) * 100) : 0,
    }
  }
  return out
})

// Filtered active persona checklist items
const filteredChecklist = computed(() => {
  return nexus.activeChecklistTopics.value.filter((t) => {
    if (checklistSubjectFilter.value !== 'all' && t.subject !== checklistSubjectFilter.value) {
      return false
    }
    const done = isTopicCompleted(t)
    if (checklistStatusFilter.value === 'todo' && done) return false
    if (checklistStatusFilter.value === 'done' && !done) return false
    return true
  })
})

const checklistCountBySubject = computed(() => {
  const counts: Record<SubjectId, number> = { options: 0, director: 0, comics: 0, trading: 0 }
  for (const t of nexus.activeChecklistTopics.value) {
    counts[t.subject] = (counts[t.subject] || 0) + 1
  }
  return counts
})

const catalogCountBySubject = computed(() => {
  const counts: Record<SubjectId, number> = { options: 0, director: 0, comics: 0, trading: 0 }
  for (const t of nexus.allTopics.value) {
    counts[t.subject] = (counts[t.subject] || 0) + 1
  }
  return counts
})

// Filtered catalog topics
const filteredCatalogTopics = computed(() => {
  const q = catalogQuery.value.trim().toLowerCase()
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

function openTopic(topic: MicroTopic) {
  if (topic.domain) {
    app.setDomain(topic.domain)
  }
  if (topic.isExternalPath || topic.href.startsWith('/rudao') || topic.href.startsWith('http')) {
    window.location.href = topic.href
  } else {
    router.push(topic.href)
  }
}

function openCollectionLink(href: string, domain?: DomainId, external?: boolean) {
  if (domain) app.setDomain(domain)
  if (external || href.startsWith('/rudao') || href.startsWith('http')) {
    window.location.href = href
  } else {
    router.push(href)
  }
}

function submitCustomTopic() {
  if (!customForm.value.title.trim()) return
  const tags = customForm.value.tagsText
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  nexus.addCustomTopic({
    subject: customForm.value.subject,
    code: customForm.value.code,
    title: customForm.value.title,
    titleEn: customForm.value.titleEn,
    summary: customForm.value.summary,
    href: customForm.value.href,
    tags,
    pinToCurrentPersona: true,
  })
  customForm.value = {
    subject: customForm.value.subject,
    code: '',
    title: '',
    titleEn: '',
    summary: '',
    href: '',
    tagsText: '',
  }
  showCustomForm.value = false
}

function pinAllFiltered() {
  nexus.pinBatch(filteredCatalogTopics.value.map((t) => t.id))
}

function unpinAllFiltered() {
  nexus.unpinBatch(filteredCatalogTopics.value.map((t) => t.id))
}

function filterCatalogBySubject(subj: SubjectId) {
  catalogSubject.value = subj
  const el = document.getElementById('topic-library-section')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToLibrary() {
  const el = document.getElementById('topic-library-section')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const KIND_LABELS: Record<TopicKind, string> = {
  level: '阶梯闯关 Level',
  cards: '概念卡组 Cards',
  case: '实战推演 Case',
  lab: '交互实验室 Lab',
  'trading-chapter': '交易入道课题 Chapter',
  'trading-tool': '交易实战工具 Tool',
  custom: '自定义课题 Custom',
}

// Interactive sampler state for quick practice at the bottom of the portal
const samplerDomain = computed<DomainId>(() => app.domain)
const samplerPack = computed(() => DOMAINS[samplerDomain.value])
const sampleQuests = computed<{ level: number; idx: number; q: Question }[]>(() => {
  const pack = samplerPack.value
  const picks: { level: number; idx: number; q: Question }[] = []
  const lvs = [1, Math.ceil(pack.levels.length / 2), pack.levels.length]
  for (const lv of lvs) {
    const q = pack.bank[lv]?.[0]
    if (q) picks.push({ level: lv, idx: 0, q })
  }
  return picks
})
const activeSampleIdx = ref(0)
const samplePick = ref<string | null>(null)
const currentSample = computed(() => sampleQuests.value[activeSampleIdx.value] ?? sampleQuests.value[0])
</script>

<template>
  <div class="wrap landing-nexus">
    <!-- 1. SCI-FI COGNITIVE NEXUS HEADER & 4-PERSONA GATEWAY (J / S / T / D) -->
    <section class="surface gateway-hero">
      <div class="gateway-top">
        <div class="gateway-title-col">
          <div class="eyebrow-row">
            <span class="sci-badge">
              <i class="fa-solid fa-satellite" aria-hidden="true" />
              JSTD · COGNITIVE NEXUS // ORBITAL RESEARCH DECK
            </span>
            <span class="open-badge">
              <i class="fa-solid fa-unlock-keyhole" aria-hidden="true" />
              OPEN ACCESS · 免认证直接进入
            </span>
          </div>
          <h1>星际认知与高维推演研究基地 · J / S / T / D</h1>
          <p class="lead">
            选择你的<strong>研究舱人物代号（J · S · T · D）</strong>。当前基地汇聚
            <b>Options 期权</b>、<b>Director 导演</b>、<b>Comics 漫画</b>、<b>Trading 交易入道</b>
            四大主体资源集合，拆解为 <b>{{ nexus.allTopics.value.length }} 个可插拔微课题（Micro-Topics）</b>。
            勾选感兴趣的小课题，即可生成每个人物专属的 Landing Page 学习清单。
          </p>
        </div>

        <div class="gateway-Quick-stats">
          <div class="stat-orb">
            <small>ACTIVE EXPLORER</small>
            <b>{{ nexus.state.activePersona }} · {{ nexus.activePersona.value.codename }}</b>
            <span>{{ nexus.activePersona.value.titleZh }}</span>
          </div>
          <div class="stat-grid-mini">
            <div>
              <b>4</b>
              <small>主体资源集合</small>
            </div>
            <div>
              <b>{{ nexus.allTopics.value.length }}</b>
              <small>可选小课题</small>
            </div>
            <div>
              <b>{{ personaStats[nexus.state.activePersona].total }}</b>
              <small>当前人物清单</small>
            </div>
            <div>
              <b>{{ personaStats[nexus.state.activePersona].done }}</b>
              <small>已攻克课题</small>
            </div>
          </div>
        </div>
      </div>

      <!-- 4 PERSONA SELECTOR CARDS (J, S, T, D) -->
      <div class="persona-grid" role="radiogroup" aria-label="Select Research Persona (J, S, T, D)">
        <article
          v-for="p in PERSONA_LIST"
          :key="p.id"
          :class="['persona-card', { active: nexus.state.activePersona === p.id }]"
          :style="{ '--p-accent': p.accent, '--p-soft': p.accentSoft }"
          role="radio"
          :aria-checked="nexus.state.activePersona === p.id"
          tabindex="0"
          @click="selectPersona(p.id)"
          @keydown.enter.prevent="selectPersona(p.id)"
          @keydown.space.prevent="selectPersona(p.id)"
        >
          <div class="p-card-top">
            <div class="p-emblem">
              <span class="p-letter">{{ p.id }}</span>
              <i :class="['fa-solid', p.icon]" aria-hidden="true" />
            </div>
            <div class="p-meta">
              <span class="p-sector">{{ p.sectorCode }}</span>
              <h2>{{ nexus.getPersonaProfile(p.id).codename }}</h2>
              <p class="p-zh">{{ nexus.getPersonaProfile(p.id).titleZh }}</p>
            </div>
            <span v-if="nexus.state.activePersona === p.id" class="active-indicator">
              <i class="fa-solid fa-circle-check" aria-hidden="true" /> 当前舱位
            </span>
          </div>

          <p class="p-tagline">{{ nexus.getPersonaProfile(p.id).tagline }}</p>

          <div class="p-focus-tags">
            <span v-for="f in p.researchFocus" :key="f" class="focus-chip">{{ f }}</span>
          </div>

          <div class="p-subjects-row">
            <span class="subj-label">核心主体:</span>
            <span
              v-for="sid in p.primarySubjects"
              :key="sid"
              class="subj-mini-pill"
              :style="{ '--s-accent': SUBJECT_COLLECTIONS[sid].accent }"
            >
              <i :class="['fa-solid', SUBJECT_COLLECTIONS[sid].icon]" aria-hidden="true" />
              {{ SUBJECT_COLLECTIONS[sid].titleZh.split('·')[0] }}
            </span>
          </div>

          <div class="p-telemetry">
            <div class="p-tele-row">
              <span>
                <i class="fa-solid fa-list-check" aria-hidden="true" />
                专属清单: <b>{{ personaStats[p.id].total }}</b> 个小课题
              </span>
              <span>已完成 {{ personaStats[p.id].done }} ({{ personaStats[p.id].pct }}%)</span>
            </div>
            <div class="p-bar">
              <i :style="{ width: personaStats[p.id].pct + '%' }" />
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- 2. ACTIVE PERSONA'S CUSTOMIZED LANDING PAGE CHECKLIST -->
    <section class="surface checklist-deck" :style="{ '--deck-accent': nexus.activePersona.value.accent }">
      <header class="checklist-header">
        <div class="deck-identity">
          <FoxSticker :pose="nexus.activePersona.value.mascotPose" :size="68" />
          <div>
            <div class="deck-kicker">
              <span class="persona-badge-lg">{{ nexus.state.activePersona }}</span>
              <span class="deck-sector">{{ nexus.activePersona.value.sectorCode }}</span>
            </div>
            <h2>
              {{ nexus.activePersona.value.codename }} · 专属首页课题清单
              <small>（{{ nexus.activePersona.value.titleZh }}）</small>
            </h2>
            <p class="muted">
              当前清单共勾选 <b>{{ nexus.activeChecklistTopics.value.length }}</b> 个小课题，已完成
              <b>{{ personaStats[nexus.state.activePersona].done }}</b> 个。勾选左侧方框标记完成，点击「移出」或下方课题库随时增删。
            </p>
          </div>
        </div>

        <div class="deck-actions">
          <button class="btn primary" type="button" @click="scrollToLibrary">
            <i class="fa-solid fa-plus-minus" aria-hidden="true" /> 勾选 / 管理小课题 ({{ nexus.allTopics.value.length }})
          </button>
          <button class="btn" type="button" @click="showCustomForm = !showCustomForm">
            <i class="fa-solid fa-folder-plus" aria-hidden="true" /> 新增自定义课题
          </button>
          <button class="btn" type="button" @click="openPersonaEditor">
            <i class="fa-solid fa-pen-ruler" aria-hidden="true" /> 自定义舱位名
          </button>
          <button class="btn" type="button" title="恢复当前人物的推荐课题清单" @click="nexus.resetPersonaChecklist()">
            <i class="fa-solid fa-rotate-left" aria-hidden="true" /> 恢复推荐清单
          </button>
        </div>
      </header>

      <!-- INLINE PERSONA CODENAME EDITOR -->
      <div v-if="showPersonaEdit" class="inline-drawer">
        <div class="drawer-head">
          <b><i class="fa-solid fa-user-astronaut" aria-hidden="true" /> 自定义人物 [{{ nexus.state.activePersona }}] 的科幻研究代号与方向描述</b>
          <button class="btn-sm" type="button" @click="showPersonaEdit = false">关闭</button>
        </div>
        <div class="drawer-form-grid">
          <label>
            <span>科幻英文代号 (Sci-Fi Codename)</span>
            <input v-model="personaEditForm.codename" type="text" placeholder="e.g. JOVIAN OBSERVER" />
          </label>
          <label>
            <span>中文研究院名称 (Chinese Title)</span>
            <input v-model="personaEditForm.titleZh" type="text" placeholder="e.g. 木星观测者 · 概率与高维博弈研究院" />
          </label>
          <label class="full-span">
            <span>研究兴趣与课题简介 (Research Tagline)</span>
            <input v-model="personaEditForm.tagline" type="text" />
          </label>
        </div>
        <div class="drawer-foot">
          <button class="btn primary" type="button" @click="savePersonaEditor">保存代号设置</button>
          <button class="btn" type="button" @click="resetPersonaName">恢复默认科幻代号</button>
        </div>
      </div>

      <!-- INLINE CUSTOM MICRO-TOPIC CREATOR -->
      <div v-if="showCustomForm" class="inline-drawer">
        <div class="drawer-head">
          <b><i class="fa-solid fa-folder-plus" aria-hidden="true" /> 新增自定义小课题（自动加入当前人物 [{{ nexus.state.activePersona }}] 清单与总课题库）</b>
          <button class="btn-sm" type="button" @click="showCustomForm = false">关闭</button>
        </div>
        <div class="drawer-form-grid">
          <label>
            <span>所属主体集合 (Subject Collection)</span>
            <select v-model="customForm.subject">
              <option value="options">Options · 期权与波动率博弈</option>
              <option value="director">Director · 导演调度与视听场域</option>
              <option value="comics">Comics · 漫画分镜与 JEV 决策工程</option>
              <option value="trading">Trading · 交易入道与实战体系</option>
            </select>
          </label>
          <label>
            <span>课题编号 (Code, 可选)</span>
            <input v-model="customForm.code" type="text" placeholder="例如 TRD-CUSTOM-01 / COM-LAB-04" />
          </label>
          <label>
            <span>小课题名称 (Title, 必填)</span>
            <input v-model="customForm.title" type="text" placeholder="例如：0DTE 末日期权 Gamma Scalping 实战笔记" />
          </label>
          <label>
            <span>英文或副标题 (Subtitle, 可选)</span>
            <input v-model="customForm.titleEn" type="text" placeholder="0DTE Gamma Scalping Execution Notes" />
          </label>
          <label class="full-span">
            <span>课题核心内容描述 (Summary)</span>
            <input v-model="customForm.summary" type="text" placeholder="简述该课题要研究的核心问题、检验清单或参考资料..." />
          </label>
          <label>
            <span>跳转路径或外部链接 (Target URL / Path, 可选)</span>
            <input v-model="customForm.href" type="text" placeholder="/rudao 或 /sim?domain=options 或 https://..." />
          </label>
          <label>
            <span>标签 (Tags, 逗号分隔)</span>
            <input v-model="customForm.tagsText" type="text" placeholder="Gamma, 0DTE, 实盘SOP" />
          </label>
        </div>
        <div class="drawer-foot">
          <button class="btn primary" type="button" @click="submitCustomTopic">
            <i class="fa-solid fa-check" aria-hidden="true" /> 创建并加入 [{{ nexus.state.activePersona }}] 清单
          </button>
        </div>
      </div>

      <!-- CHECKLIST FILTER BAR -->
      <div class="checklist-toolbar">
        <div class="filter-pills" role="tablist" aria-label="Filter checklist by subject">
          <button
            type="button"
            :class="['f-pill', { active: checklistSubjectFilter === 'all' }]"
            @click="checklistSubjectFilter = 'all'"
          >
            全部主体 ({{ nexus.activeChecklistTopics.value.length }})
          </button>
          <button
            v-for="s in SUBJECT_LIST"
            :key="s.id"
            type="button"
            :class="['f-pill', { active: checklistSubjectFilter === s.id }]"
            :style="{ '--s-color': s.accent }"
            @click="checklistSubjectFilter = s.id"
          >
            <i :class="['fa-solid', s.icon]" aria-hidden="true" />
            {{ s.titleZh.split('·')[0] }} ({{ checklistCountBySubject[s.id] }})
          </button>
        </div>

        <div class="status-pills">
          <button
            type="button"
            :class="['s-pill', { active: checklistStatusFilter === 'all' }]"
            @click="checklistStatusFilter = 'all'"
          >
            全部
          </button>
          <button
            type="button"
            :class="['s-pill', { active: checklistStatusFilter === 'todo' }]"
            @click="checklistStatusFilter = 'todo'"
          >
            待攻克
          </button>
          <button
            type="button"
            :class="['s-pill', { active: checklistStatusFilter === 'done' }]"
            @click="checklistStatusFilter = 'done'"
          >
            已完成 ({{ personaStats[nexus.state.activePersona].done }})
          </button>
        </div>
      </div>

      <!-- CHECKLIST ITEMS GRID -->
      <div v-if="filteredChecklist.length" class="checklist-grid">
        <article
          v-for="(topic, idx) in filteredChecklist"
          :key="topic.id"
          :class="['check-card', { completed: isTopicCompleted(topic) }]"
          :style="{ '--subj-accent': SUBJECT_COLLECTIONS[topic.subject].accent, '--subj-soft': SUBJECT_COLLECTIONS[topic.subject].accentSoft }"
        >
          <div class="check-card-top">
            <button
              type="button"
              :class="['done-checkbox', { checked: isTopicCompleted(topic) }]"
              :title="isTopicCompleted(topic) ? '标记为未完成' : '勾选标记该课题已完成'"
              @click="nexus.toggleDone(topic.id)"
            >
              <i :class="['fa-solid', isTopicCompleted(topic) ? 'fa-square-check' : 'fa-square']" aria-hidden="true" />
              <span>{{ isTopicCompleted(topic) ? '已完成' : '待学习' }}</span>
            </button>

            <div class="check-badges">
              <span class="subj-tag">
                <i :class="['fa-solid', SUBJECT_COLLECTIONS[topic.subject].icon]" aria-hidden="true" />
                {{ SUBJECT_COLLECTIONS[topic.subject].brand }}
              </span>
              <span class="code-tag">{{ topic.code }}</span>
              <span class="kind-tag">{{ KIND_LABELS[topic.kind] }}</span>
            </div>

            <div class="check-item-ops">
              <button
                v-if="checklistSubjectFilter === 'all' && checklistStatusFilter === 'all' && idx > 0"
                type="button"
                class="op-icon"
                title="上移优先级"
                @click="nexus.movePin(topic.id, -1)"
              >
                <i class="fa-solid fa-arrow-up" aria-hidden="true" />
              </button>
              <button
                v-if="checklistSubjectFilter === 'all' && checklistStatusFilter === 'all' && idx < filteredChecklist.length - 1"
                type="button"
                class="op-icon"
                title="下移优先级"
                @click="nexus.movePin(topic.id, 1)"
              >
                <i class="fa-solid fa-arrow-down" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="op-remove"
                title="从当前人物首页清单中移出该课题"
                @click="nexus.unpinTopic(topic.id)"
              >
                <i class="fa-solid fa-xmark" aria-hidden="true" /> 移出
              </button>
            </div>
          </div>

          <div class="check-card-body" @click="openTopic(topic)">
            <h3>{{ topic.title }}</h3>
            <p class="en-sub">{{ topic.titleEn }}</p>
            <p class="summary-txt">{{ topic.summary }}</p>
          </div>

          <div class="check-card-foot">
            <div class="metric-info">
              <template v-if="getTopicLiveProgress(topic)">
                <span class="live-prog-pill">
                  <i class="fa-solid fa-bolt" aria-hidden="true" />
                  闯关进度: {{ getTopicLiveProgress(topic)!.done }}/{{ getTopicLiveProgress(topic)!.total }} ({{ getTopicLiveProgress(topic)!.pct }}%)
                </span>
              </template>
              <template v-else>
                <span class="metric-pill">{{ topic.metrics }}</span>
              </template>
            </div>

            <button type="button" class="launch-btn" @click="openTopic(topic)">
              <span>进入课题</span>
              <i class="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </article>
      </div>

      <div v-else class="empty-checklist">
        <FoxSticker pose="study" :size="64" />
        <div>
          <h3>当前筛选下暂无课题</h3>
          <p class="muted">
            你可以点击下方「全量知识小课题总库」勾选任意感兴趣的课题加入
            <b>{{ nexus.state.activePersona }} · {{ nexus.activePersona.value.codename }}</b>
            的专属清单，或一键恢复默认推荐清单。
          </p>
          <div class="empty-actions">
            <button class="btn primary" type="button" @click="scrollToLibrary">去课题库勾选添加</button>
            <button class="btn" type="button" @click="nexus.resetPersonaChecklist()">恢复默认推荐清单</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. FOUR CORE SUBJECT RESOURCE COLLECTIONS (OPTIONS / DIRECTOR / COMICS / TRADING) -->
    <section class="subjects-section">
      <div class="sec-head">
        <div>
          <span class="sec-kicker">FOUR CORE KNOWLEDGE COLLECTIONS · 四大主体学习资源集合</span>
          <h2>Options · Director · Comics · 交易（Trading）</h2>
        </div>
        <p class="muted">每个主体是一个独立完整的学习资源集合，既可直接进入主线，也可按小课题拆解勾选进人物清单</p>
      </div>

      <div class="subjects-grid">
        <article
          v-for="s in SUBJECT_LIST"
          :key="s.id"
          class="surface subject-card"
          :style="{ '--s-accent': s.accent, '--s-soft': s.accentSoft }"
        >
          <div class="subject-head">
            <div class="subject-icon">
              <i :class="['fa-solid', s.icon]" aria-hidden="true" />
            </div>
            <div class="subject-titles">
              <span class="subject-code">{{ s.sciFiDeck }}</span>
              <h3>{{ s.brand }} · {{ s.titleZh }}</h3>
              <small>{{ s.titleEn }}</small>
            </div>
          </div>

          <p class="subject-summary">{{ s.summary }}</p>

          <div class="subject-quick-links">
            <button
              v-for="ql in s.quickLinks"
              :key="ql.href"
              type="button"
              class="q-link-btn"
              @click="openCollectionLink(ql.href, s.domain, ql.external)"
            >
              <i :class="['fa-solid', ql.icon]" aria-hidden="true" />
              <span>{{ ql.label }}</span>
            </button>
          </div>

          <div class="subject-foot">
            <span class="pinned-stat">
              已选入 <b>{{ nexus.state.activePersona }}</b> 清单:
              <strong>{{ checklistCountBySubject[s.id] }} / {{ catalogCountBySubject[s.id] }}</strong> 个小课题
            </span>
            <button type="button" class="btn-filter-subj" @click="filterCatalogBySubject(s.id)">
              <i class="fa-solid fa-sliders" aria-hidden="true" /> 挑选题库 ({{ catalogCountBySubject[s.id] }})
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- 4. GRANULAR MICRO-TOPIC CATALOG & INTERACTIVE PICKER (ADD / REMOVE ANY TOPIC) -->
    <section id="topic-library-section" class="surface library-section">
      <header class="library-header">
        <div>
          <span class="sec-kicker">GRANULAR MICRO-TOPIC REPOSITORY · 全量小课题总库</span>
          <h2>勾选感兴趣的小课题 · 组装 [{{ nexus.state.activePersona }} · {{ nexus.activePersona.value.codename }}] 的专属清单</h2>
          <p class="muted">
            将四大主体的每一个等级（Level）、每一组概念闪卡（Card Pack）、每一个实战案例（Case）、每一个实验室（Lab）以及《交易入道》全部 25 讲拆解为独立微课题，支持自由勾选添加、移出或新增自定义扩展课题。
          </p>
        </div>

        <div class="library-batch-actions">
          <button class="btn primary" type="button" @click="pinAllFiltered">
            <i class="fa-solid fa-check-double" aria-hidden="true" /> 全选当前筛选 ({{ filteredCatalogTopics.length }})
          </button>
          <button class="btn" type="button" @click="unpinAllFiltered">
            <i class="fa-solid fa-eraser" aria-hidden="true" /> 移出当前筛选
          </button>
          <button class="btn" type="button" @click="showCustomForm = true">
            <i class="fa-solid fa-plus" aria-hidden="true" /> 新增小课题
          </button>
        </div>
      </header>

      <!-- SUBJECT TABS + KIND PILLS + SEARCH INPUT -->
      <div class="library-controls">
        <div class="lib-subj-tabs" role="tablist">
          <button
            type="button"
            :class="['lib-tab', { active: catalogSubject === 'all' }]"
            @click="catalogSubject = 'all'"
          >
            全部主体 ({{ nexus.allTopics.value.length }})
          </button>
          <button
            v-for="s in SUBJECT_LIST"
            :key="s.id"
            type="button"
            :class="['lib-tab', { active: catalogSubject === s.id }]"
            :style="{ '--s-accent': s.accent }"
            @click="catalogSubject = s.id"
          >
            <i :class="['fa-solid', s.icon]" aria-hidden="true" />
            {{ s.titleZh.split('·')[0] }} ({{ catalogCountBySubject[s.id] }})
          </button>
        </div>

        <div class="lib-kind-row">
          <div class="kind-pills">
            <button
              v-for="[k, label] in ([
                ['all', '全部类型 All'],
                ['level', '阶梯闯关 Levels'],
                ['cards', '概念卡组 Card Packs'],
                ['case', '实战案例 Cases'],
                ['lab', '交互实验室 Labs'],
                ['trading-chapter', '交易入道 25 讲'],
                ['trading-tool', '交易计算器与汇编'],
                ['custom', '自定义课题 Custom'],
              ] as const)"
              :key="k"
              type="button"
              :class="['k-pill', { active: catalogKind === k }]"
              @click="catalogKind = k"
            >
              {{ label }}
            </button>
          </div>

          <div class="lib-search">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              v-model="catalogQuery"
              type="search"
              placeholder="搜索小课题名称、编号（如 TRD-2.4、JEV、Greeks、五路分兵、鸟山明）..."
              aria-label="搜索小课题"
            />
          </div>
        </div>
      </div>

      <!-- CATALOG GRID -->
      <div class="catalog-grid">
        <article
          v-for="topic in filteredCatalogTopics"
          :key="topic.id"
          :class="['catalog-card', { pinned: nexus.isPinned(topic.id), done: isTopicCompleted(topic) }]"
          :style="{ '--subj-accent': SUBJECT_COLLECTIONS[topic.subject].accent, '--subj-soft': SUBJECT_COLLECTIONS[topic.subject].accentSoft }"
        >
          <div class="cat-card-head">
            <button
              type="button"
              :class="['pin-toggle-btn', { active: nexus.isPinned(topic.id) }]"
              @click="nexus.togglePin(topic.id)"
            >
              <i :class="['fa-solid', nexus.isPinned(topic.id) ? 'fa-square-check' : 'fa-square-plus']" aria-hidden="true" />
              <span>{{ nexus.isPinned(topic.id) ? `已在 [${nexus.state.activePersona}] 清单` : `+ 加入 [${nexus.state.activePersona}] 清单` }}</span>
            </button>

            <div class="cat-head-right">
              <span class="code-tag">{{ topic.code }}</span>
              <button
                v-if="topic.isCustom"
                type="button"
                class="del-custom-btn"
                title="永久删除该自定义课题"
                @click="nexus.deleteCustomTopic(topic.id)"
              >
                <i class="fa-solid fa-trash-can" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="cat-card-main" @click="nexus.togglePin(topic.id)">
            <div class="cat-meta-line">
              <span class="subj-inline">
                <i :class="['fa-solid', SUBJECT_COLLECTIONS[topic.subject].icon]" aria-hidden="true" />
                {{ SUBJECT_COLLECTIONS[topic.subject].titleZh.split('·')[0] }}
              </span>
              <span class="kind-inline">{{ KIND_LABELS[topic.kind] }}</span>
            </div>
            <h4>{{ topic.title }}</h4>
            <p class="cat-en">{{ topic.titleEn }}</p>
            <p class="cat-summary">{{ topic.summary }}</p>
          </div>

          <div class="cat-card-foot">
            <span class="cat-metrics">{{ topic.metrics }}</span>
            <div class="cat-foot-btns">
              <button
                type="button"
                :class="['mini-done-btn', { active: isTopicCompleted(topic) }]"
                @click.stop="nexus.toggleDone(topic.id)"
              >
                <i :class="['fa-solid', isTopicCompleted(topic) ? 'fa-check-circle' : 'fa-circle']" aria-hidden="true" />
                {{ isTopicCompleted(topic) ? '已掌握' : '标记已学' }}
              </button>
              <button type="button" class="mini-open-btn" @click.stop="openTopic(topic)">
                打开 <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- 5. QUICK LIVE DECISION SAMPLER (INSTANT PRACTICE WITHOUT LEAVING PORTAL) -->
    <section class="surface sampler-section">
      <div class="sampler-head">
        <div>
          <span class="sec-kicker">INSTANT SIMULATION DECK · 首页即时推演试炼台</span>
          <h2>免跳转即时体验：三大交互题库与三语闪卡抽屉</h2>
        </div>
        <div class="sampler-dom-pills">
          <button
            v-for="d in DOMAIN_LIST"
            :key="d.id"
            type="button"
            :class="['s-dom-btn', { active: app.domain === d.id }]"
            :style="{ '--d-accent': d.accent }"
            @click="app.setDomain(d.id); activeSampleIdx = 0; samplePick = null"
          >
            <i :class="['fa-solid', d.icon]" aria-hidden="true" />
            {{ d.brand }} ({{ d.zhTitle }})
          </button>
        </div>
      </div>

      <div v-if="currentSample" class="sampler-body">
        <div class="sampler-tabs">
          <button
            v-for="(item, idx) in sampleQuests"
            :key="item.q.id"
            type="button"
            :class="['sample-tab', { active: activeSampleIdx === idx }]"
            @click="activeSampleIdx = idx; samplePick = null"
          >
            Level {{ item.level }} · {{ item.q.title }}
          </button>
        </div>

        <div class="sample-card">
          <p class="sample-scenario"><TermText :text="currentSample.q.scenario" /></p>
          <p v-if="currentSample.q.steps[0]" class="sample-prompt"><b><TermText :text="currentSample.q.steps[0].prompt" /></b></p>

          <div v-if="currentSample.q.steps[0]" class="sample-choices">
            <button
              v-for="ch in currentSample.q.steps[0].choices"
              :key="ch.id"
              type="button"
              :class="[
                'sample-choice',
                {
                  picked: samplePick === ch.id,
                  correct: samplePick && ch.id === currentSample.q.steps[0].answer,
                  wrong: samplePick === ch.id && ch.id !== currentSample.q.steps[0].answer,
                },
              ]"
              @click="samplePick = ch.id"
            >
              <span class="ch-key">{{ ch.id.toUpperCase() }}</span>
              <span class="ch-txt"><TermText :text="ch.label" /></span>
            </button>
          </div>

          <div v-if="samplePick && currentSample.q.steps[0]" class="sample-feedback">
            <p class="verdict">
              <i :class="['fa-solid', samplePick === currentSample.q.steps[0].answer ? 'fa-circle-check' : 'fa-circle-info']" />
              {{ samplePick === currentSample.q.steps[0].answer ? '判断精准！' : `最优解为 ${currentSample.q.steps[0].answer.toUpperCase()}` }}
            </p>
            <p class="why-txt"><TermText :text="currentSample.q.steps[0].why || ''" /></p>
            <div class="sample-links">
              <RouterLink :to="`/quest/${currentSample.level}/${currentSample.idx}?domain=${app.domain}`" class="btn primary">
                进入完整关卡 Level {{ currentSample.level }} →
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing-nexus {
  display: grid;
  gap: 1.5rem;
  padding-top: 1.1rem;
  padding-bottom: 3rem;
}

/* 1. Gateway Hero & 4-Persona Cards */
.gateway-hero {
  display: grid;
  gap: 1.25rem;
  padding: 1.4rem;
  background: linear-gradient(155deg, #fffdf7 0%, #fff6e5 100%);
}

.gateway-top {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 1.2rem;
  align-items: start;
}

.eyebrow-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.sci-badge,
.open-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  font-family: var(--mono, monospace);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 0.22rem 0.65rem;
  border-radius: 999px;
  border: 1.5px solid var(--edge);
}

.sci-badge {
  background: #1a1712;
  color: #fde68a;
}

.open-badge {
  background: #dcfce7;
  color: #166534;
}

.gateway-title-col h1 {
  font-family: var(--display);
  font-size: clamp(1.55rem, 2.7vw, 2.25rem);
  line-height: 1.15;
  margin: 0 0 0.55rem;
}

.lead {
  margin: 0;
  font-size: 0.96rem;
  line-height: 1.6;
  color: #3f3a32;
}

.gateway-quick-stats {
  display: grid;
  gap: 0.65rem;
  padding: 0.95rem 1.05rem;
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 16px;
  box-shadow: 3px 3px 0 var(--edge);
}

.stat-orb {
  display: grid;
  gap: 0.15rem;
  padding-bottom: 0.55rem;
  border-bottom: 1.5px dashed var(--line);
}

.stat-orb small {
  font-family: var(--mono, monospace);
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--fox);
  letter-spacing: 0.06em;
}

.stat-orb b {
  font-size: 1.05rem;
  font-weight: 900;
}

.stat-orb span {
  font-size: 0.82rem;
  color: var(--muted);
}

.stat-grid-mini {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.45rem;
  text-align: center;
}

.stat-grid-mini > div {
  background: #fff9ec;
  border: 1.5px solid var(--edge);
  border-radius: 10px;
  padding: 0.4rem 0.25rem;
  display: grid;
}

.stat-grid-mini b {
  font-size: 1.05rem;
  font-weight: 900;
}

.stat-grid-mini small {
  font-size: 0.68rem;
  color: var(--muted);
  font-weight: 700;
}

/* 4-Persona Cards */
.persona-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
}

.persona-card {
  background: var(--panel);
  border: 2px solid var(--edge);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.7rem;
  cursor: pointer;
  box-shadow: 3px 3px 0 var(--edge);
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  position: relative;
}

.persona-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 var(--edge);
}

.persona-card.active {
  background: var(--p-soft, #fff6e0);
  border-width: 2.5px;
  box-shadow: 5px 5px 0 var(--p-accent, var(--edge));
}

.p-card-top {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
}

.p-emblem {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 2px solid var(--edge);
  background: var(--p-accent, var(--fox));
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 2px 2px 0 var(--edge);
}

.p-emblem .p-letter {
  font-family: var(--mono, monospace);
  font-size: 1.25rem;
  font-weight: 900;
  line-height: 1;
}

.p-emblem i {
  font-size: 0.68rem;
  margin-top: 2px;
  opacity: 0.9;
}

.p-meta {
  min-width: 0;
  flex: 1;
}

.p-sector {
  display: block;
  font-family: var(--mono, monospace);
  font-size: 0.62rem;
  font-weight: 800;
  color: var(--muted);
  letter-spacing: 0.04em;
}

.p-meta h2 {
  margin: 0.1rem 0 0;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0.02em;
}

.p-zh {
  margin: 0.1rem 0 0;
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--p-accent, var(--fox));
}

.active-indicator {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: #1a1712;
  color: #fff;
  white-space: nowrap;
}

.p-tagline {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.45;
  color: #3f3a32;
}

.p-focus-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.focus-chip {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.12rem 0.45rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--edge);
}

.p-subjects-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3rem;
  font-size: 0.72rem;
}

.subj-label {
  font-weight: 800;
  color: var(--muted);
}

.subj-mini-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1rem 0.42rem;
  border-radius: 999px;
  border: 1.5px solid var(--edge);
  background: #fff;
  font-weight: 800;
  color: var(--s-accent, var(--ink));
}

.p-telemetry {
  display: grid;
  gap: 0.28rem;
  padding-top: 0.45rem;
  border-top: 1.5px dashed var(--line);
  font-size: 0.74rem;
}

.p-tele-row {
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
}

.p-bar {
  height: 7px;
  background: #ebe3d5;
  border-radius: 999px;
  border: 1px solid var(--edge);
  overflow: hidden;
}

.p-bar i {
  display: block;
  height: 100%;
  background: var(--p-accent, var(--fox));
}

/* 2. Active Persona Checklist Deck */
.checklist-deck {
  padding: 1.35rem;
  display: grid;
  gap: 1rem;
  border-width: 2.5px;
}

.checklist-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.deck-identity {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.deck-kicker {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.2rem;
}

.persona-badge-lg {
  display: inline-grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: var(--deck-accent, var(--fox));
  color: #fff;
  font-family: var(--mono, monospace);
  font-weight: 900;
  font-size: 0.9rem;
  border: 1.5px solid var(--edge);
}

.deck-sector {
  font-family: var(--mono, monospace);
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--muted);
}

.deck-identity h2 {
  margin: 0;
  font-size: 1.3rem;
}

.deck-identity h2 small {
  font-size: 0.88rem;
  color: var(--muted);
  font-weight: 700;
}

.deck-identity p {
  margin: 0.2rem 0 0;
  font-size: 0.88rem;
}

.deck-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

/* Inline Drawer for Custom Topic & Persona Rename */
.inline-drawer {
  background: #fff9ec;
  border: 2px solid var(--edge);
  border-radius: 14px;
  padding: 1rem;
  display: grid;
  gap: 0.75rem;
  box-shadow: 3px 3px 0 var(--edge);
}

.drawer-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.drawer-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.drawer-form-grid label {
  display: grid;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 800;
}

.drawer-form-grid label.full-span {
  grid-column: 1 / -1;
}

.drawer-form-grid input,
.drawer-form-grid select {
  padding: 0.45rem 0.65rem;
  border: 1.5px solid var(--edge);
  border-radius: 8px;
  background: #fff;
  font-size: 0.88rem;
}

.drawer-foot {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  border: 1.5px solid var(--edge);
  background: #fff;
  border-radius: 8px;
  padding: 0.2rem 0.55rem;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
}

/* Checklist Toolbar */
.checklist-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-bottom: 0.6rem;
  border-bottom: 2px dashed var(--line);
}

.filter-pills,
.status-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.f-pill,
.s-pill {
  border: 1.5px solid var(--edge);
  background: var(--panel);
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.f-pill.active,
.s-pill.active {
  background: #1a1712;
  color: #fff;
}

/* Checklist Cards Grid */
.checklist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 0.85rem;
}

.check-card {
  background: var(--panel);
  border: 2px solid var(--edge);
  border-left: 6px solid var(--subj-accent, var(--fox));
  border-radius: 14px;
  padding: 0.85rem 0.95rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.6rem;
  box-shadow: 3px 3px 0 var(--edge);
  transition: transform 0.12s ease;
}

.check-card:hover {
  transform: translateY(-2px);
}

.check-card.completed {
  background: #f6fbf7;
  opacity: 0.92;
}

.check-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.done-checkbox {
  border: 1.5px solid var(--edge);
  background: #fff;
  border-radius: 8px;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.done-checkbox.checked {
  background: #dcfce7;
  color: #166534;
  border-color: #166534;
}

.check-badges {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.subj-tag {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.1rem 0.42rem;
  border-radius: 6px;
  background: var(--subj-soft, #fff3e4);
  color: var(--subj-accent, var(--ink));
  border: 1px solid var(--edge);
}

.code-tag {
  font-family: var(--mono, monospace);
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.1rem 0.38rem;
  border-radius: 5px;
  background: #1a1712;
  color: #fff;
}

.kind-tag {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--muted);
}

.check-item-ops {
  display: flex;
  align-items: center;
  gap: 0.22rem;
}

.op-icon,
.op-remove {
  border: 1px solid var(--edge);
  background: #fff;
  border-radius: 6px;
  padding: 0.14rem 0.38rem;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
}

.op-remove:hover {
  background: #fee2e2;
  color: #991b1b;
}

.check-card-body {
  cursor: pointer;
}

.check-card-body h3 {
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.35;
}

.en-sub {
  margin: 0.12rem 0 0.3rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--muted);
}

.summary-txt {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.48;
  color: #3f3a32;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.check-card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.45rem;
  border-top: 1px dashed var(--line);
}

.live-prog-pill,
.metric-pill {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--muted);
}

.live-prog-pill {
  color: var(--subj-accent, var(--fox));
}

.launch-btn {
  border: 1.5px solid var(--edge);
  background: var(--pop);
  padding: 0.25rem 0.65rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.launch-btn:hover {
  background: var(--subj-accent, var(--fox));
  color: #fff;
}

.empty-checklist {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px dashed var(--line);
  border-radius: 14px;
}

.empty-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
}

/* 3. Four Subject Resource Collections */
.subjects-section {
  display: grid;
  gap: 0.85rem;
}

.sec-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.sec-kicker {
  font-family: var(--mono, monospace);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--fox);
  text-transform: uppercase;
}

.sec-head h2 {
  margin: 0.15rem 0 0;
  font-size: 1.35rem;
}

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.subject-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 1.15rem;
  border-top: 5px solid var(--s-accent, var(--fox));
}

.subject-head {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.subject-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--s-soft, #fff3e4);
  color: var(--s-accent, var(--fox));
  border: 2px solid var(--edge);
  display: grid;
  place-items: center;
  font-size: 1.15rem;
  flex-shrink: 0;
}

.subject-code {
  display: block;
  font-family: var(--mono, monospace);
  font-size: 0.66rem;
  font-weight: 800;
  color: var(--s-accent, var(--fox));
}

.subject-titles h3 {
  margin: 0.1rem 0;
  font-size: 1.1rem;
}

.subject-titles small {
  color: var(--muted);
  font-weight: 700;
}

.subject-summary {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.5;
  color: #3f3a32;
}

.subject-quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.q-link-btn {
  border: 1.5px solid var(--edge);
  background: #fff;
  border-radius: 9px;
  padding: 0.3rem 0.6rem;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
}

.q-link-btn:hover {
  background: var(--s-soft, var(--pop));
}

.subject-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.55rem;
  border-top: 1.5px dashed var(--line);
  font-size: 0.8rem;
}

.btn-filter-subj {
  border: 1.5px solid var(--edge);
  background: var(--s-accent, var(--fox));
  color: #fff;
  border-radius: 8px;
  padding: 0.28rem 0.68rem;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
}

/* 4. Micro-Topic Library & Picker */
.library-section {
  padding: 1.35rem;
  display: grid;
  gap: 1rem;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.library-header h2 {
  margin: 0.15rem 0 0.25rem;
  font-size: 1.28rem;
}

.library-batch-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.library-controls {
  display: grid;
  gap: 0.65rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px dashed var(--line);
}

.lib-subj-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.lib-tab {
  border: 2px solid var(--edge);
  background: var(--panel);
  padding: 0.38rem 0.85rem;
  border-radius: 10px;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.lib-tab.active {
  background: var(--s-accent, #1a1712);
  color: #fff;
  box-shadow: 2px 2px 0 var(--edge);
}

.lib-kind-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.kind-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.k-pill {
  border: 1.5px solid var(--edge);
  background: #fff;
  padding: 0.24rem 0.58rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
}

.k-pill.active {
  background: var(--pop);
}

.lib-search {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: #fff;
  border: 2px solid var(--edge);
  border-radius: 10px;
  padding: 0.3rem 0.65rem;
  min-width: min(360px, 100%);
  flex: 1;
  max-width: 440px;
}

.lib-search input {
  border: 0;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 0.85rem;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.75rem;
  max-height: 760px;
  overflow-y: auto;
  padding: 0.2rem;
}

.catalog-card {
  background: #fff;
  border: 2px solid var(--edge);
  border-radius: 12px;
  padding: 0.75rem 0.85rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.5rem;
  transition: background 0.12s;
}

.catalog-card.pinned {
  background: var(--subj-soft, #fff8eb);
  border-color: var(--subj-accent, var(--edge));
  box-shadow: 2px 2px 0 var(--edge);
}

.cat-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.4rem;
}

.pin-toggle-btn {
  border: 1.5px solid var(--edge);
  background: #fff;
  border-radius: 8px;
  padding: 0.22rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.pin-toggle-btn.active {
  background: var(--subj-accent, var(--fox));
  color: #fff;
}

.cat-head-right {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.del-custom-btn {
  border: 1px solid #dc2626;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 6px;
  padding: 0.15rem 0.38rem;
  font-size: 0.72rem;
  cursor: pointer;
}

.cat-card-main {
  cursor: pointer;
}

.cat-meta-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--muted);
  margin-bottom: 0.2rem;
}

.subj-inline {
  color: var(--subj-accent, var(--fox));
}

.cat-card-main h4 {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.35;
}

.cat-en {
  margin: 0.1rem 0 0.25rem;
  font-size: 0.72rem;
  color: var(--muted);
  font-weight: 700;
}

.cat-summary {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.42;
  color: #4b453c;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cat-card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.4rem;
  padding-top: 0.4rem;
  border-top: 1px dashed var(--line);
  font-size: 0.7rem;
}

.cat-metrics {
  color: var(--muted);
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat-foot-btns {
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
}

.mini-done-btn,
.mini-open-btn {
  border: 1px solid var(--edge);
  background: #fff;
  border-radius: 6px;
  padding: 0.16rem 0.45rem;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
}

.mini-done-btn.active {
  background: #dcfce7;
  color: #166534;
}

.mini-open-btn:hover {
  background: var(--pop);
}

/* 5. Sampler Section */
.sampler-section {
  padding: 1.25rem;
  display: grid;
  gap: 0.9rem;
}

.sampler-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.sampler-head h2 {
  margin: 0.15rem 0 0;
  font-size: 1.2rem;
}

.sampler-dom-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.s-dom-btn {
  border: 2px solid var(--edge);
  background: var(--panel);
  padding: 0.32rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.s-dom-btn.active {
  background: var(--d-accent, var(--fox));
  color: #fff;
}

.sampler-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.65rem;
}

.sample-tab {
  border: 1.5px solid var(--edge);
  background: #fff;
  padding: 0.28rem 0.65rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
}

.sample-tab.active {
  background: var(--pop);
}

.sample-card {
  background: #fffdf8;
  border: 2px solid var(--edge);
  border-radius: 12px;
  padding: 1rem;
  display: grid;
  gap: 0.65rem;
}

.sample-scenario,
.sample-prompt {
  margin: 0;
  line-height: 1.55;
}

.sample-choices {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.sample-choice {
  border: 2px solid var(--edge);
  background: #fff;
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  text-align: left;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 700;
}

.sample-choice.correct {
  background: #dcfce7;
  border-color: #166534;
}

.sample-choice.wrong {
  background: #fee2e2;
  border-color: #991b1b;
}

.ch-key {
  font-family: var(--mono, monospace);
  font-weight: 900;
  background: var(--pop);
  border: 1.5px solid var(--edge);
  border-radius: 6px;
  padding: 0.05rem 0.38rem;
}

.sample-feedback {
  background: #fff8e6;
  border: 1.5px solid var(--edge);
  border-radius: 10px;
  padding: 0.75rem;
  display: grid;
  gap: 0.4rem;
}

.verdict {
  margin: 0;
  font-weight: 900;
}

.why-txt {
  margin: 0;
  font-size: 0.86rem;
}

@media (max-width: 1060px) {
  .gateway-top {
    grid-template-columns: 1fr;
  }
  .persona-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .subjects-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .persona-grid,
  .drawer-form-grid,
  .sample-choices {
    grid-template-columns: 1fr;
  }
}
</style>
