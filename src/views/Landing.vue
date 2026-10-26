<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { DOMAIN_LIST, UPCOMING_DOMAINS, type DomainPack } from '../domains/registry'
import { useApp } from '../stores/app'
import { usePageContext } from '../lib/context'
import type { DomainId } from '../../shared/types'

const app = useApp()
const router = useRouter()

function domainQuestions(p: DomainPack) {
  return p.levels.reduce((sum, l) => sum + (p.bank[l.n]?.length ?? 0), 0)
}

function domainDone(p: DomainPack) {
  return p.levels.reduce((sum, l) => sum + app.levelProgress((p.bank[l.n] ?? []).map((q) => q.id)), 0)
}

const totalQuestions = computed(() => DOMAIN_LIST.reduce((s, p) => s + domainQuestions(p), 0))
const totalDone = computed(() => DOMAIN_LIST.reduce((s, p) => s + domainDone(p), 0))
const totalTerms = computed(() => DOMAIN_LIST.reduce((s, p) => s + p.terms.length, 0))
const totalCases = computed(() => DOMAIN_LIST.reduce((s, p) => s + (p.moments?.length ?? 0) + (p.scenes?.length ?? 0), 0))

function enterDomain(id: DomainId, path = '/journey') {
  app.setDomain(id)
  router.push(path)
}

usePageContext(() => ({
  kind: 'page',
  label: 'Sim4It Unified Knowledge Portal',
  text: `Sim4It Unified Interactive Knowledge Base Portal. Active tracks: Sim4Options (420 quests, 130 terms, 100 market moments), Sim4Director (570 quests, 341 terms, 102 virtual scenes), Sim4Comics (420 quests, 62 terms, 6 studio cases, tldraw-manga + JEV 14-Factor + Scott McCloud + Manga Masters). Total progress: ${totalDone.value}/${totalQuestions.value} quests.`,
}))

const RAYS = Array.from({ length: 36 }, (_, i) => {
  const a = (i / 36) * Math.PI * 2
  const r0 = 130 + ((i * 37) % 5) * 14
  const r1 = 580
  return { x1: 780 + Math.cos(a) * r0, y1: 210 + Math.sin(a) * r0, x2: 780 + Math.cos(a) * r1, y2: 210 + Math.sin(a) * r1, w: 1 + ((i * 13) % 3) }
})
</script>

<template>
  <div class="wrap">
    <!-- Unified Hero Banner -->
    <section class="hero">
      <svg class="rays" viewBox="0 0 1000 420" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
        <line v-for="(r, k) in RAYS" :key="k" :x1="r.x1" :y1="r.y1" :x2="r.x2" :y2="r.y2" :stroke-width="r.w" />
      </svg>
      <div class="dots" aria-hidden="true" />
      <div class="copy">
        <div class="row">
          <span class="chip on">Sim4It · Interactive Decision & Mastery Portal</span>
          <span class="chip">{{ totalQuestions }} Quests · {{ totalTerms }} Trilingual Cards · {{ totalCases }} Cases</span>
        </div>
        <h1>Simulate the Craft. <span class="mark">实战推演知识库</span></h1>
        <p class="read">
          One unified interactive learning engine across high-stakes decision domains:
          <strong>Options Trading (Sim4Options)</strong>, <strong>Film & Animation Directing (Sim4Director)</strong>, and
          <strong>Manga Storyboarding & JEV Decision Architecture (Sim4Comics)</strong>.
          Every track shares the same warm paper-and-ink aesthetic, multi-step decision quests, trilingual concept graph, and live interactive studio labs.
        </p>
        <div class="global-meter">
          <div class="spread small-meta">
            <span>Global Mastery across all tracks</span>
            <strong>{{ totalDone }} / {{ totalQuestions }} quests completed</strong>
          </div>
          <div class="meter">
            <span :style="{ width: (totalDone / Math.max(totalQuestions, 1)) * 100 + '%' }" />
          </div>
        </div>
      </div>
      <div class="mascots">
        <img src="/fox/wave.webp" alt="Kon" class="m-kon" />
        <img src="/hikari/director.webp" alt="Hikari" class="m-hikari" />
      </div>
    </section>

    <!-- Primary Domain Tracks -->
    <section class="tracks-section" aria-label="Knowledge Domains">
      <div class="spread section-head">
        <div>
          <h2>Active Knowledge Tracks · 核心实战专栏</h2>
          <p class="muted">Select any track to enter its Level Ladder, Skill Cards, Concept Graph, Cases, and Interactive Lab.</p>
        </div>
      </div>

      <div class="tracks-grid">
        <article
          v-for="p in DOMAIN_LIST"
          :key="p.id"
          class="card track-card"
          :class="{ current: app.domain === p.id }"
          :style="{ '--accent': p.accent }"
        >
          <div class="spread">
            <span class="track-badge" :style="{ background: p.accent }">
              <i :class="['fa-solid', p.icon]" aria-hidden="true" /> {{ p.brand }}
            </span>
            <span class="chip">{{ p.levels.length }} Levels · {{ domainQuestions(p) }} Quests</span>
          </div>

          <div class="track-title-row">
            <div>
              <h3>{{ p.zhTitle }}</h3>
              <p class="sub">{{ p.subtitle }}</p>
            </div>
            <img :src="`/${p.mascot.dir}/${p.id === 'director' ? 'director' : p.id === 'comics' ? 'study' : 'wave'}.webp`" :alt="p.mascot.name" class="mini-mascot" />
          </div>

          <p class="muted desc">{{ p.description }}</p>

          <!-- Key Pillars / Categories Preview -->
          <div class="row cat-preview">
            <span v-for="c in p.cats.slice(0, 6)" :key="c.id" class="chip mini-chip">
              <span class="dot" :style="{ background: c.color }" />
              {{ c.zh || c.name }}
            </span>
            <span v-if="p.cats.length > 6" class="chip mini-chip">+{{ p.cats.length - 6 }} more</span>
          </div>

          <!-- Track Stats & Progress -->
          <div class="track-stats">
            <div><b>{{ p.terms.length }}</b><small>Skill Cards</small></div>
            <div><b>{{ domainQuestions(p) }}</b><small>Decision Quests</small></div>
            <div><b>{{ (p.moments?.length ?? 0) + (p.scenes?.length ?? 0) }}</b><small>{{ p.casesZhLabel }}</small></div>
          </div>

          <div class="meter-row">
            <div class="spread small-meta">
              <span>Track Progress</span>
              <b>{{ domainDone(p) }} / {{ domainQuestions(p) }}</b>
            </div>
            <div class="meter">
              <span :style="{ width: (domainDone(p) / Math.max(domainQuestions(p), 1)) * 100 + '%', background: p.accent }" />
            </div>
          </div>

          <!-- Quick Launch Actions -->
          <div class="track-actions">
            <button class="btn primary" @click="enterDomain(p.id, '/journey')">
              Enter {{ p.brand }} →
            </button>
            <button class="btn" @click="enterDomain(p.id, '/cards')">
              <i class="fa-solid fa-layer-group" aria-hidden="true" />Cards
            </button>
            <button class="btn" @click="enterDomain(p.id, p.id === 'options' ? '/moments' : '/scenes')">
              <i class="fa-solid fa-clapperboard" aria-hidden="true" />{{ p.casesZhLabel }}
            </button>
            <button class="btn" @click="enterDomain(p.id, '/sim')">
              <i class="fa-solid fa-sliders" aria-hidden="true" />Lab
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- Sim4Comics Deep-Dive Highlight Banner -->
    <section class="card comics-spotlight">
      <div class="spread">
        <div class="row">
          <span class="chip on">NEW TRACK · 新增专栏</span>
          <span class="chip">tldraw-manga × JEV Decision × 漫画大师技法</span>
        </div>
        <button class="btn primary" @click="enterDomain('comics', '/journey')">
          Explore Sim4Comics · 开启漫画分镜学习 →
        </button>
      </div>

      <div class="spotlight-grid">
        <div class="sp-col">
          <h4><i class="fa-solid fa-book-open" aria-hidden="true" /> Scott McCloud & 漫画大师技法</h4>
          <p class="muted small">
            6大格间转换 (`T1–T6`)、沟槽完形脑补指数 (`Closure [0.45, 0.82]`)、字画7种交织、大三角理论；融合<strong>手塚治虫</strong>电影蒙太奇、<strong>鸟山明</strong>Z/S型视线诱导与剪影张力、<strong>井上雄彦</strong>「間」(Ma) 情绪慢镜、<strong>大友克洋</strong>三点透视机械景深、<strong>浦泽直树</strong>声画对位与左下角翻页悬念 (`引き Hiki`)。
          </p>
        </div>
        <div class="sp-col">
          <h4><i class="fa-solid fa-microchip" aria-hidden="true" /> JEV 二阶分镜决策模型 (14F / 52MF)</h4>
          <p class="muted small">
            基于 <code>jstdlee/jev-decision</code>：<strong>System 2 元编译器</strong>（五元通用算子：拆解 Decompose、视界 Horizon、赋权 Weight、排序联合 Sort & Joint、降级 Degrade）+ <strong>System 1 `/v1/systemone`</strong> 毫秒级连续切分运行时；5-Pass 条件轮询漏斗、14维分镜主因子 (`F01–F14`) 与 9域52微因子 (`D1–D9`)。
          </p>
        </div>
        <div class="sp-col">
          <h4><i class="fa-solid fa-table-columns" aria-hidden="true" /> tldraw-manga 三层多边形工作流</h4>
          <p class="muted small">
            基于 <code>jstdlee/tldraw-manga</code>：<code>Page → Strip/Row → Polygon Panel</code> 拓扑切分、五阶递进工作台（设定卡→版式台→分镜台词→镜头构图→模型节点）、4大版式预设、5维几何滑块、36种子 × 6维主编评分 (`layoutScore`) 与一键处方、7种矢量对白框、5层 `.ora` OpenRaster 与 4模式 HTML 导出。
          </p>
        </div>
      </div>
    </section>

    <!-- Companion Handbook & Extensible Registry Architecture -->
    <section class="ext-section">
      <div class="spread section-head">
        <div>
          <h2>Companion Handbooks & Extensible Track Registry · 扩展知识矩阵</h2>
          <p class="muted">Sim4It uses a modular <code>DomainPack</code> architecture (`src/domains/registry.ts`). Adding a new `sim4*` domain requires only registering its `terms`, `questions`, `scenes`, and `lab` component.</p>
        </div>
      </div>

      <div class="ext-grid">
        <a href="/rudao" class="card ext-card handbook">
          <div class="spread">
            <span class="chip on"><i class="fa-solid fa-book-bookmark" aria-hidden="true" /> Companion Handbook</span>
            <span class="chip">Sim4Options 配套手册</span>
          </div>
          <h3>《交易入道》· 概念术语与实操手册</h3>
          <p class="muted small">Jesse Lau (@jesselaunz) 闲云九法、103条书签原推汇编、期权卖方/对冲实操 SOP 与读书批注完整索引。</p>
          <span class="ext-link">Open Handbook (/rudao) →</span>
        </a>

        <div v-for="u in UPCOMING_DOMAINS" :key="u.id" class="card ext-card upcoming">
          <div class="spread">
            <span class="chip"><i :class="['fa-solid', u.icon]" aria-hidden="true" /> {{ u.brand }}</span>
            <span class="chip">{{ u.badge }}</span>
          </div>
          <h3>{{ u.zhTitle }} · {{ u.subtitle }}</h3>
          <p class="muted small">{{ u.blurb }}</p>
          <span class="muted small">Modular `DomainPack` slot ready in `src/domains/registry.ts`</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  position: relative; overflow: hidden; margin: .8rem 0 1.8rem; padding: 1.9rem clamp(1.1rem, 4vw, 2.4rem);
  display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(0, .75fr); align-items: center; gap: 1.2rem;
  background: var(--panel); border: 2px solid var(--edge); border-radius: 20px; box-shadow: 4px 4px 0 var(--edge);
}
.rays { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.rays line { stroke: var(--edge); opacity: .07; stroke-linecap: round; }
.dots { position: absolute; left: -40px; bottom: -40px; width: 260px; height: 200px; background: radial-gradient(var(--pop) 2.2px, transparent 2.6px) 0 0 / 12px 12px; -webkit-mask: radial-gradient(circle at 0 100%, #000 30%, transparent 72%); mask: radial-gradient(circle at 0 100%, #000 30%, transparent 72%); pointer-events: none; }
.copy { position: relative; display: grid; gap: .55rem; justify-items: start; }
.copy h1 { margin: .1rem 0 0; }
.copy .read { margin: .15rem 0; color: var(--paper); max-width: 68ch; }
.global-meter { width: 100%; max-width: 34rem; display: grid; gap: .3rem; margin-top: .3rem; }
.small-meta { font-size: .8rem; color: var(--muted); }
.meter { height: 10px; border: 1.5px solid var(--edge); background: var(--ink); border-radius: 99px; overflow: hidden; }
.meter span { display: block; height: 100%; background: var(--call); background-image: repeating-linear-gradient(-45deg, transparent 0 5px, rgb(255 255 255 / .3) 5px 9px); }

.mascots { position: relative; display: flex; justify-content: center; align-items: flex-end; gap: .2rem; min-height: 200px; }
.m-kon, .m-hikari { height: 175px; width: auto; object-fit: contain; filter: drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(2px 4px 0 rgb(26 23 18 / .22)); }

.section-head { margin-bottom: .9rem; }
.section-head h2 { margin: 0; font-size: 1.45rem; }
.section-head p { margin: .15rem 0 0; font-size: .92rem; }

.tracks-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 1rem; margin-bottom: 1.6rem; }
.track-card {
  display: flex; flex-direction: column; gap: .75rem;
  border-top: 6px solid var(--accent, var(--fox));
  transition: transform .1s ease, box-shadow .1s ease;
}
.track-card:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 var(--edge); }
.track-card.current { background: #fffdf6; }
.track-badge {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .24rem .7rem; border-radius: 99px; border: 1.5px solid var(--edge);
  color: #fff; font-weight: 800; font-size: .82rem; box-shadow: 2px 2px 0 var(--edge);
}
.track-title-row { display: flex; justify-content: space-between; align-items: center; gap: .6rem; }
.track-title-row h3 { font-size: 1.35rem; margin: 0; }
.sub { margin: .15rem 0 0; font-size: .86rem; font-weight: 700; color: var(--fox); }
.mini-mascot { height: 72px; width: auto; flex: none; filter: drop-shadow(1px 2px 0 rgb(26 23 18 / .18)); }
.desc { margin: 0; font-size: .9rem; line-height: 1.5; flex: 1; }
.cat-preview { gap: .3rem; }
.mini-chip { font-size: .72rem; padding: .12rem .48rem; }
.dot { width: .48rem; height: .48rem; border-radius: 50%; display: inline-block; margin-right: .22rem; }

.track-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem;
  padding: .55rem .7rem; background: var(--ink); border: 1.5px solid var(--edge); border-radius: 12px; text-align: center;
}
.track-stats b { display: block; font-family: var(--display); font-size: 1.2rem; }
.track-stats small { font-size: .72rem; color: var(--muted); font-weight: 700; }
.meter-row { display: grid; gap: .25rem; }
.track-actions { display: flex; flex-wrap: wrap; gap: .45rem; margin-top: .15rem; }

.comics-spotlight {
  margin-bottom: 1.8rem;
  background: linear-gradient(180deg, #fff9e8 0%, var(--panel) 100%);
  border: 2px solid var(--edge);
  display: grid; gap: 1rem;
}
.spotlight-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: .9rem; }
.sp-col { padding: .85rem 1rem; background: var(--panel); border: 1.5px solid var(--edge); border-radius: 12px; box-shadow: var(--shadow-sm); }
.sp-col h4 { margin: 0 0 .4rem; font-size: 1rem; display: flex; align-items: center; gap: .4rem; }
.sp-col h4 i { color: var(--fox); }
.small { font-size: .86rem; margin: 0; line-height: 1.55; }

.ext-section { margin-bottom: 1.5rem; }
.ext-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: .9rem; }
.ext-card { display: flex; flex-direction: column; gap: .55rem; text-decoration: none; color: var(--paper); }
.ext-card h3 { font-size: 1.15rem; margin: 0; }
.handbook:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 var(--edge); background: #fff6dc; }
.ext-link { font-weight: 800; color: var(--fox); font-size: .88rem; margin-top: auto; }
.upcoming { border-style: dashed; opacity: .92; }

@media (max-width: 760px) {
  .hero { grid-template-columns: 1fr; }
  .mascots { min-height: 130px; justify-content: flex-end; }
  .m-kon, .m-hikari { height: 130px; }
}
</style>
