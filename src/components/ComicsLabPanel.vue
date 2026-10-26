<script setup lang="ts">
import { computed, ref } from 'vue'
import FoxSticker from './FoxSticker.vue'
import { useApp } from '../stores/app'

const app = useApp()
const tab = ref<'koma' | 'jev'>('koma')

// ───────────────────────── Tab 1: tldraw-manga B4 Polygon Koma & 6-Axis Editor Score Lab
type PresetId = 'seizen' | 'std' | 'action' | 'tobira'
const preset = ref<PresetId>('std')
const slant = ref(8)        // 0..24 deg
const bleed = ref(1)        // 0..3 bleed panels
const subSplit = ref(5)     // 3..8 total panels
const bigWeight = ref(36)   // 22..55 % hero panel area
const lineWidth = ref(3.5)  // 1.5..6 px

function applyPreset(p: PresetId) {
  preset.value = p
  if (p === 'seizen') { slant.value = 0; bleed.value = 0; subSplit.value = 6; bigWeight.value = 22; lineWidth.value = 3 }
  else if (p === 'std') { slant.value = 5; bleed.value = 1; subSplit.value = 5; bigWeight.value = 36; lineWidth.value = 3.5 }
  else if (p === 'action') { slant.value = 18; bleed.value = 2; subSplit.value = 4; bigWeight.value = 46; lineWidth.value = 4.5 }
  else if (p === 'tobira') { slant.value = 4; bleed.value = 2; subSplit.value = 3; bigWeight.value = 52; lineWidth.value = 4 }
}

// Compute 6-Axis Editor Score (`layoutScore`)
const scores = computed(() => {
  // 1. Hierarchy (主次) — optimal bigWeight 34..48%
  const hierarchy = Math.round(Math.max(40, 100 - Math.abs(bigWeight.value - 40) * 2.2))
  // 2. Eye Flow (视流) — optimal subSplit 4..6 & moderate slant
  const flow = Math.round(Math.max(45, 100 - Math.abs(subSplit.value - 5) * 8 - Math.max(0, slant.value - 16) * 2))
  // 3. Pacing (节奏) — contrast between panel count and bleed
  const pacing = Math.round(Math.min(99, 68 + bleed.value * 8 + (bigWeight.value >= 34 ? 12 : 0) - Math.abs(subSplit.value - 5) * 4))
  // 4. Tension (张力) — driven by slant, bleed, lineWidth
  const tension = Math.round(Math.min(99, 50 + slant.value * 1.8 + bleed.value * 9 + lineWidth.value * 3))
  // 5. Space / Breathing (留白) — penalized when subSplit > 6
  const space = Math.round(Math.max(42, 100 - Math.max(0, subSplit.value - 4) * 11 + bleed.value * 5))
  // 6. Hiki / Cliffhanger (悬念) — bottom-left payoff readiness
  const hiki = Math.round(Math.min(98, 65 + (subSplit.value >= 4 && subSplit.value <= 6 ? 18 : 4) + (bigWeight.value >= 32 ? 10 : 0)))
  const total = Math.round((hierarchy + flow + pacing + tension + space + hiki) / 6)
  return { hierarchy, flow, pacing, tension, space, hiki, total }
})

const prescription = computed(() => {
  if (scores.value.hierarchy < 72) return { label: 'Amplify Misegoma (强化主格对比)', fix: () => { bigWeight.value = 40; bleed.value = Math.max(1, bleed.value) } }
  if (scores.value.space < 70) return { label: 'Decompress Crowd (减格留白)', fix: () => { subSplit.value = 5; bleed.value = Math.max(1, bleed.value) } }
  if (scores.value.tension < 72) return { label: 'Inject Diagonal Cut (注入斜切张力)', fix: () => { slant.value = 14; bleed.value = 2 } }
  return { label: 'Optimal Editorial Balance (黄金分镜配比)', fix: () => applyPreset('std') }
})

// Dynamic B4 Page SVG Polygons (340 x 480)
const panelsSvg = computed(() => {
  const W = 340, H = 480
  const m = 22
  const gY = 10, gX = 12
  const dy = Math.tan((slant.value * Math.PI) / 180) * 140
  const h1 = Math.round(H * (bigWeight.value / 100))
  const h2 = Math.round((H - h1) * 0.52)
  const y1 = h1
  const y2 = h1 + h2

  const polys: { id: string; pts: string; role: string; tag: string; isHero?: boolean; isHiki?: boolean }[] = []

  // Row 1 (Top: R -> L)
  const r1Left = bleed.value >= 1 ? 0 : m
  const r1Top = bleed.value >= 1 ? 0 : m
  const r1Right = W - m
  if (subSplit.value <= 3) {
    polys.push({
      id: 'P1',
      pts: `${r1Left},${r1Top} ${r1Right},${r1Top} ${r1Right},${y1 - dy * 0.3} ${r1Left},${y1 + dy * 0.3}`,
      role: 'Misegoma (主格 / 大格)',
      tag: `${bigWeight.value}% Area${bleed.value >= 1 ? ' · Bleed' : ''}`,
      isHero: true,
    })
  } else {
    const midX = Math.round(W * 0.62)
    polys.push({
      id: 'P1 (Right Entry)',
      pts: `${midX + gX / 2},${m} ${r1Right},${m} ${r1Right},${y1 - dy * 0.3} ${midX + gX / 2 - dy * 0.15},${y1}`,
      role: 'Lead-in Koma (引导格)',
      tag: 'Top-Right Entry',
    })
    polys.push({
      id: 'P2 (Hero)',
      pts: `${r1Left},${r1Top} ${midX - gX / 2},${r1Top} ${midX - gX / 2 - dy * 0.15},${y1} ${r1Left},${y1 + dy * 0.3}`,
      role: 'Misegoma (主格 / 冲击格)',
      tag: `${bigWeight.value}% Hero${bleed.value >= 1 ? ' · Tachikiri' : ''}`,
      isHero: true,
    })
  }

  // Row 2 (Middle)
  const r2Right = bleed.value >= 2 ? W : W - m
  const mid2 = Math.round(W * 0.48)
  polys.push({
    id: subSplit.value <= 3 ? 'P2' : 'P3',
    pts: `${mid2 + gX / 2},${y1 + gY} ${r2Right},${y1 - dy * 0.3 + gY} ${r2Right},${y2 + dy * 0.25} ${mid2 + gX / 2},${y2}`,
    role: 'Reaction / Action Cut',
    tag: 'S-Flow Turn',
  })
  polys.push({
    id: subSplit.value <= 3 ? 'P3' : 'P4',
    pts: `${m},${y1 + dy * 0.3 + gY} ${mid2 - gX / 2},${y1 + gY} ${mid2 - gX / 2},${y2} ${m},${y2 - dy * 0.25}`,
    role: 'Compression Beat',
    tag: slant.value > 10 ? `Slant ${slant.value}°` : 'Orthogonal',
  })

  // Row 3 (Bottom-left Hiki)
  const bBot = bleed.value >= 3 ? H : H - m
  if (subSplit.value >= 6) {
    const t1 = Math.round(W * 0.68), t2 = Math.round(W * 0.36)
    polys.push({
      id: 'P5',
      pts: `${t1 + gX / 2},${y2 + dy * 0.2 + gY} ${W - m},${y2 + dy * 0.25 + gY} ${W - m},${bBot} ${t1 + gX / 2},${bBot}`,
      role: 'Micro-Beat 1',
      tag: 'Setup',
    })
    polys.push({
      id: 'P6',
      pts: `${t2 + gX / 2},${y2 + gY} ${t1 - gX / 2},${y2 + dy * 0.2 + gY} ${t1 - gX / 2},${bBot} ${t2 + gX / 2},${bBot}`,
      role: 'Silence ("Ma" 間)',
      tag: 'Inoue Beat',
    })
    polys.push({
      id: 'P7 (Hiki)',
      pts: `${m},${y2 - dy * 0.25 + gY} ${t2 - gX / 2},${y2 + gY} ${t2 - gX / 2},${bBot} ${m},${bBot}`,
      role: 'Hiki / Mekuri (翻页悬念格)',
      tag: 'Bottom-Left Cliffhanger',
      isHiki: true,
    })
  } else {
    const bMid = Math.round(W * 0.44)
    polys.push({
      id: 'P5',
      pts: `${bMid + gX / 2},${y2 + gY} ${W - m},${y2 + dy * 0.25 + gY} ${W - m},${bBot} ${bMid + gX / 2},${bBot}`,
      role: 'Pre-Climax Beat',
      tag: 'Silence / Pause',
    })
    polys.push({
      id: 'P6 (Hiki)',
      pts: `${m},${y2 - dy * 0.25 + gY} ${bMid - gX / 2},${y2 + gY} ${bMid - gX / 2},${bBot} ${m},${bBot}`,
      role: 'Hiki / Mekuri (左下角翻页钩子)',
      tag: 'Page-Turn Cliffhanger',
      isHiki: true,
    })
  }

  return polys
})

// ───────────────────────── Tab 2: JEV 14-Factor & 5-Pass Auto-Segmentation Simulator
const f01Beat = ref(0.82)       // Narrative Beat Delta
const f03Emotion = ref(0.75)    // Emotional Valence Shift
const f05Action = ref(0.68)     // Action Velocity Peak
const f07Words = ref(28)        // Dialogue Token Budget
const f09Silence = ref(0.60)    // Silence / Ma Demand
const f10Cliff = ref(0.78)      // Cliffhanger / Hiki Gravity
const f13Closure = ref(0.66)    // Gutter Closure Index [0.45, 0.82]

const jevResult = computed(() => {
  // Weighted log-odds compilation
  const z =
    -1.65 +
    1.35 * f01Beat.value +
    1.15 * f03Emotion.value +
    1.05 * f05Action.value +
    0.85 * Math.min(1, f07Words.value / 35) +
    0.95 * f09Silence.value +
    1.10 * f10Cliff.value
  const pSplit = 1 / (1 + Math.exp(-z))

  // Determine recommended McCloud Transition
  let transition = ['T2: Action-to-Action (动作到动作)', 't2_action_to_action']
  if (f09Silence.value > 0.75 && f05Action.value < 0.45) {
    transition = ['T5: Aspect-to-Aspect (侧面到侧面 · 情绪游走)', 't5_aspect_to_aspect']
  } else if (f03Emotion.value > 0.8 && f05Action.value < 0.5) {
    transition = ['T1: Moment-to-Moment (瞬间到瞬间 · 慢镜拉伸)', 't1_moment_to_moment']
  } else if (f01Beat.value > 0.78 && f03Emotion.value > 0.65) {
    transition = ['T3: Subject-to-Subject (主体到主体 · 视线交锋)', 't3_subject_to_subject']
  }

  // Closure status
  const cStatus =
    f13Closure.value < 0.45
      ? 'Redundant (< 0.45 · Too literal)'
      : f13Closure.value > 0.82
        ? 'Incoherent (> 0.82 · Cognitive disconnect)'
        : 'Optimal Sweet Spot [0.45, 0.82]'

  // Dual-split dialogue check
  const bubbleSplit = f07Words.value > 32 ? 'Auto Dual-Split: Setup Bubble (Top-Right) → Punchline Bubble (Bottom-Left)' : 'Single Primary Speech Bubble (Fits <= 32 tokens)'

  return { pSplit, transition, cStatus, bubbleSplit }
})

function askTutor() {
  app.askTutor({
    label: tab.value === 'koma' ? 'Comics Koma & 6-Axis Lab' : 'JEV 14-Factor Storyboard Lab',
    prompt: 'Analyze my current manga storyboard layout / JEV segmentation parameters and suggest improvements.',
    context: tab.value === 'koma'
      ? `tldraw-manga B4 Lab: Preset=${preset.value}, Slant=${slant.value}°, Bleed=${bleed.value}, Sub-split=${subSplit.value}, BigWeight=${bigWeight.value}%, LineWidth=${lineWidth.value}px. 6-Axis Score=${scores.value.total}/100 (Hierarchy ${scores.value.hierarchy}, Flow ${scores.value.flow}, Pacing ${scores.value.pacing}, Tension ${scores.value.tension}, Space ${scores.value.space}, Hiki ${scores.value.hiki}).`
      : `JEV 14-Factor Lab: F01 Beat=${f01Beat.value}, F03 Emotion=${f03Emotion.value}, F05 Action=${f05Action.value}, F07 Words=${f07Words.value}, F09 Silence=${f09Silence.value}, F10 Hiki=${f10Cliff.value}, F13 Closure=${f13Closure.value}. P(split)=${(jevResult.value.pSplit * 100).toFixed(1)}%, Transition=${jevResult.value.transition[0]}.`,
  })
}
</script>

<template>
  <div class="wrap">
    <header class="phead">
      <div>
        <span class="chip on">Sim4Comics · tldraw-manga × JEV Studio Lab</span>
        <h1>Comics Storyboard Lab <span class="tr" translate="no">· 漫画分镜多边形工作台与 JEV 切分引擎</span></h1>
      </div>
      <FoxSticker pose="study" :size="96" />
    </header>

    <div class="row seg">
      <button class="chip" :class="{ on: tab === 'koma' }" @click="tab = 'koma'">
        <i class="fa-solid fa-table-columns" aria-hidden="true" /> B4 Polygon Koma & 6-Axis Score · 多边形分格台
      </button>
      <button class="chip" :class="{ on: tab === 'jev' }" @click="tab = 'jev'">
        <i class="fa-solid fa-microchip" aria-hidden="true" /> JEV 14-Factor & 5-Pass Engine · 自动分镜决策器
      </button>
      <span class="grow" />
      <button class="btn" @click="askTutor">
        <i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />Ask Sensei Sumi
      </button>
    </div>

    <!-- TAB 1: tldraw-manga B4 Polygon Koma Studio -->
    <section v-if="tab === 'koma'" class="lab">
      <div class="surface controls">
        <div>
          <small class="muted">1. Layout Presets · <button class="term-link" @click="app.openTerm = 'tldraw_4_presets'">四大版式预设</button></small>
          <div class="row preset-row">
            <button class="chip" :class="{ on: preset === 'seizen' }" @click="applyPreset('seizen')">Seizen 整然</button>
            <button class="chip" :class="{ on: preset === 'std' }" @click="applyPreset('std')">Std 黄金</button>
            <button class="chip" :class="{ on: preset === 'action' }" @click="applyPreset('action')">Action 跃动</button>
            <button class="chip" :class="{ on: preset === 'tobira' }" @click="applyPreset('tobira')">Tobira 扉页</button>
          </div>
        </div>

        <label>
          Slant (斜率) · <button class="term-link" @click="app.openTerm = 'diagonal_panel_cut'">斜切分格</button>
          <b>{{ slant }}°</b>
          <input v-model.number="slant" type="range" min="0" max="24" step="1" />
        </label>
        <label>
          Bleed (出血格数) · <button class="term-link" @click="app.openTerm = 'tachikiri_bleed'">断ち切り</button>
          <b>{{ bleed }} panels</b>
          <input v-model.number="bleed" type="range" min="0" max="3" step="1" />
        </label>
        <label>
          Sub-split (格密度) · <button class="term-link" @click="app.openTerm = 'tldraw_5d_sliders'">细分格数</button>
          <b>{{ subSplit }} panels</b>
          <input v-model.number="subSplit" type="range" min="3" max="7" step="1" />
        </label>
        <label>
          Big Weight (主格占比) · <button class="term-link" @click="app.openTerm = 'misegoma'">見せゴマ</button>
          <b>{{ bigWeight }}%</b>
          <input v-model.number="bigWeight" type="range" min="20" max="55" step="1" />
        </label>
        <label>
          Line Width (框线粗细)
          <b>{{ lineWidth }} px</b>
          <input v-model.number="lineWidth" type="range" min="1.5" max="6" step="0.5" />
        </label>

        <div class="rx-box">
          <small class="muted"><button class="term-link" @click="app.openTerm = 'tldraw_editor_score'">Editor Prescription · 一键处方</button></small>
          <button class="btn primary" style="width:100%;justify-content:center" @click="prescription.fix()">
            <i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />{{ prescription.label }}
          </button>
        </div>
      </div>

      <div class="out">
        <div class="koma-stage">
          <!-- B4 Manga Page SVG -->
          <svg viewBox="0 0 340 480" class="b4-svg" role="img" aria-label="B4 Manga Page Preview">
            <rect width="340" height="480" fill="#fffdf8" />
            <!-- Tachikiri & Naibu Trim Guides -->
            <rect x="22" y="22" width="296" height="436" fill="none" stroke="#0e8c83" stroke-width="1" stroke-dasharray="4 3" opacity="0.55" />
            <!-- Polygon Panels -->
            <g v-for="p in panelsSvg" :key="p.id">
              <polygon
                :points="p.pts"
                :fill="p.isHero ? '#fff3d6' : p.isHiki ? '#ffe8e0' : '#ffffff'"
                stroke="#1a1712"
                :stroke-width="lineWidth"
                stroke-linejoin="round"
              />
            </g>
            <!-- S-Flow Eye Tracking Arrow (R -> L) -->
            <path d="M 290 65 C 150 75, 110 110, 95 140 C 160 220, 250 240, 255 290 C 190 340, 120 385, 85 430"
              fill="none" stroke="#ff5a1f" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.75" />
            <circle cx="290" cy="65" r="5" fill="#ff5a1f" />
            <polygon points="80,435 93,432 87,421" fill="#ff5a1f" />
          </svg>

          <!-- 6-Axis Editor Score Breakdown -->
          <div class="surface score-panel">
            <div class="spread">
              <strong>6-Axis Editor Score (`layoutScore`)</strong>
              <span class="chip on">{{ scores.total }} / 100</span>
            </div>
            <div class="bars">
              <div v-for="[k, lbl, val] in [
                ['h', '主次 Hierarchy', scores.hierarchy],
                ['f', '视流 Eye Flow (R→L)', scores.flow],
                ['p', '节奏 Pacing', scores.pacing],
                ['t', '张力 Tension', scores.tension],
                ['s', '留白 Breathing', scores.space],
                ['hk', '悬念 Hiki Hook', scores.hiki],
              ]" :key="k" class="bar-row">
                <span>{{ lbl }}</span>
                <div class="meter"><span :style="{ width: val + '%' }" /></div>
                <b>{{ val }}</b>
              </div>
            </div>
            <p class="muted small">
              Dashed teal rect = <button class="term-link" @click="app.openTerm = 'b4_manuscript_geometry'">Naibu Safe Frame (内枠)</button>.
              Orange dashed curve = <button class="term-link" @click="app.openTerm = 'toriyama_s_flow'">R-to-L S-Flow Eye Path</button> ending at the bottom-left <button class="term-link" @click="app.openTerm = 'hiki_cliffhanger'">Hiki</button>.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 2: JEV 14-Factor & 5-Pass Simulator -->
    <section v-else class="lab">
      <div class="surface controls">
        <label>
          <button class="term-link" @click="app.openTerm = 'jev_f01_beat_delta'">F01 Narrative Beat Delta (叙事节拍跃迁)</button>
          <b>{{ f01Beat.toFixed(2) }}</b>
          <input v-model.number="f01Beat" type="range" min="0" max="1" step="0.02" />
        </label>
        <label>
          <button class="term-link" @click="app.openTerm = 'jev_f03_emotion_shift'">F03 Emotional Shift (情绪极性突变)</button>
          <b>{{ f03Emotion.toFixed(2) }}</b>
          <input v-model.number="f03Emotion" type="range" min="0" max="1" step="0.02" />
        </label>
        <label>
          <button class="term-link" @click="app.openTerm = 'jev_f05_action_peak'">F05 Action Velocity Peak (动作峰值)</button>
          <b>{{ f05Action.toFixed(2) }}</b>
          <input v-model.number="f05Action" type="range" min="0" max="1" step="0.02" />
        </label>
        <label>
          <button class="term-link" @click="app.openTerm = 'jev_f07_dialogue_load'">F07 Dialogue Token Budget (对白字数)</button>
          <b>{{ f07Words }} tokens</b>
          <input v-model.number="f07Words" type="range" min="4" max="60" step="2" />
        </label>
        <label>
          <button class="term-link" @click="app.openTerm = 'jev_f09_silence_ma'">F09 Silence / Ma Demand (留白「間」需求)</button>
          <b>{{ f09Silence.toFixed(2) }}</b>
          <input v-model.number="f09Silence" type="range" min="0" max="1" step="0.02" />
        </label>
        <label>
          <button class="term-link" @click="app.openTerm = 'jev_f10_cliffhanger'">F10 Hiki Cliffhanger Gravity (翻页悬念引力)</button>
          <b>{{ f10Cliff.toFixed(2) }}</b>
          <input v-model.number="f10Cliff" type="range" min="0" max="1" step="0.02" />
        </label>
        <label>
          <button class="term-link" @click="app.openTerm = 'jev_f13_closure_index'">F13 Gutter Closure Index (脑补指数)</button>
          <b>{{ f13Closure.toFixed(2) }}</b>
          <input v-model.number="f13Closure" type="range" min="0.2" max="0.95" step="0.02" />
        </label>
      </div>

      <div class="out">
        <div class="surface jev-card">
          <div class="spread">
            <h3>System 1 `/v1/systemone` Auto-Cut Decision</h3>
            <span class="chip" :class="{ on: jevResult.pSplit >= 0.65 }">
              P(split) = {{ (jevResult.pSplit * 100).toFixed(1) }}% · {{ jevResult.pSplit >= 0.65 ? 'CUT NEW PANEL' : 'MERGE IN PANEL' }}
            </span>
          </div>

          <dl class="stats">
            <div>
              <dt>Recommended McCloud Transition</dt>
              <dd><button class="term-link" @click="app.openTerm = jevResult.transition[1]">{{ jevResult.transition[0] }}</button></dd>
            </div>
            <div>
              <dt>Closure Sweet Spot [0.45, 0.82]</dt>
              <dd>{{ jevResult.cStatus }}</dd>
            </div>
            <div>
              <dt><button class="term-link" @click="app.openTerm = 'tldraw_dual_split_dialogue'">Dialogue Truncation & Split</button></dt>
              <dd>{{ jevResult.bubbleSplit }}</dd>
            </div>
            <div>
              <dt><button class="term-link" @click="app.openTerm = 'jev_5pass_polling'">5-Pass Polling Funnel Status</button></dt>
              <dd>Pass 0 Anchor → Pass 1 Cut → Pass 2 Area ({{ Math.round(20 + f01Beat * 22 + f05Action * 12) }}%) → Pass 3 Shot → Pass 4 Degrade ✓</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.tr { font-weight: 400; font-size: 1rem; color: var(--muted); }
.seg { margin: .6rem 0 1rem; }
.lab { display: grid; gap: 1rem; grid-template-columns: minmax(260px, 350px) 1fr; align-items: start; }
@media (max-width: 820px) { .lab { grid-template-columns: 1fr; } }
.controls { display: grid; gap: .75rem; }
.controls label { display: grid; gap: .25rem; font-size: .9rem; }
.controls input[type=range] { padding: 0; }
.preset-row { margin-top: .35rem; gap: .35rem; }
.rx-box { display: grid; gap: .35rem; padding-top: .4rem; border-top: 1.5px dashed var(--edge); }

.koma-stage { display: grid; grid-template-columns: minmax(220px, 310px) 1fr; gap: 1rem; align-items: start; }
@media (max-width: 680px) { .koma-stage { grid-template-columns: 1fr; } }
.b4-svg { width: 100%; height: auto; border: 2px solid var(--edge); border-radius: 14px; box-shadow: var(--shadow); background: #fffdf8; }
.score-panel { display: grid; gap: .75rem; }
.bars { display: grid; gap: .5rem; }
.bar-row { display: grid; grid-template-columns: 8.8rem 1fr 2.2rem; align-items: center; gap: .5rem; font-size: .84rem; font-weight: 700; }
.meter { height: 10px; border: 1.5px solid var(--edge); background: var(--ink); border-radius: 99px; overflow: hidden; }
.meter span { display: block; height: 100%; background: var(--fox); }
.jev-card { display: grid; gap: .9rem; }
.stats { display: grid; gap: .75rem; margin: .4rem 0; }
.stats dt { color: var(--muted); font-size: .82rem; }
.stats dd { margin: .15rem 0 0; font-weight: 700; }
.small { font-size: .84rem; margin: 0; }
</style>
