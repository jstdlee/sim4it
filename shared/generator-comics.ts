// Deterministic bank generator for Sim4Comics — combines hand-authored quests
// with term-driven concept drills, optical/layout math drills, and JEV factor drills
// to hit per-level targets (420 total), returning Record<number, Question[]>.

import type { Question, Step, Term } from './types'
import { TERMS, TERM_MAP, CAT_MAP } from '../content/comics/terms'
import { AUTHORED, LEVELS } from '../content/comics/questions'

export const TARGETS: Record<number, number> = {
  1: 60, 2: 60, 3: 55, 4: 65, 5: 55, 6: 65, 7: 60, // total 420
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickN<T>(arr: T[], n: number, rng: () => number, exclude: Set<T> = new Set()): T[] {
  const pool = arr.filter(x => !exclude.has(x))
  const out: T[] = []
  while (out.length < n && pool.length) {
    const i = Math.floor(rng() * pool.length)
    out.push(pool.splice(i, 1)[0])
  }
  return out
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const LEVEL_FOR_CAT: Record<string, number> = {}
for (const lv of LEVELS) for (const c of lv.cats || []) LEVEL_FOR_CAT[c] = lv.n

function termQuestions(t: Term, seed: number): Question[] {
  const rng = mulberry32(seed)
  const lv = LEVEL_FOR_CAT[t.cat || ''] || 1
  const cat = CAT_MAP[t.cat || '']
  const sameCat = TERMS.filter(x => x.cat === t.cat && x.id !== t.id)
  const otherTerms = sameCat.length >= 3 ? sameCat : TERMS.filter(x => x.id !== t.id)
  const out: Question[] = []

  // Template A — definition -> name + bilingual/category anchor
  {
    const distractors = pickN(otherTerms, 3, rng, new Set([t]))
    const opts = shuffle([t, ...distractors], rng)
    const ids = ['a', 'b', 'c', 'd']
    const choices = opts.map((o, i) => ({ id: ids[i], label: `${o.name}${o.zh ? ' · ' + o.zh : ''}` }))
    const ans = ids[opts.indexOf(t)]

    const step1: Step = {
      prompt: 'Which manga / JEV storyboard concept matches this definition?',
      choices,
      answer: ans,
      why: `[[${t.id}]] (${t.zh || t.name}${t.ja ? ' / ' + t.ja : ''}) — ${t.short}`,
    }

    const steps: Step[] = [step1]

    if (t.formula) {
      const withFormula = TERMS.filter(x => x.formula && x.id !== t.id && x.formula !== t.formula)
      const fDis = pickN(withFormula, 2, rng)
      if (fDis.length === 2) {
        const fOpts = shuffle([t, ...fDis], rng)
        const fIds = ['a', 'b', 'c']
        steps.push({
          prompt: `Which quantitative rule or specification belongs to ${t.name}?`,
          choices: fOpts.map((o, i) => ({ id: fIds[i], label: o.formula! })),
          answer: fIds[fOpts.indexOf(t)],
          why: `For [[${t.id}]]: \`${t.formula}\`.`,
        })
      }
    } else if (t.related.length) {
      const rel = TERM_MAP[t.related[0]]
      if (rel) {
        const nonRel = TERMS.filter(x => x.id !== t.id && !t.related.includes(x.id) && x.cat !== t.cat)
        const rDis = pickN(nonRel, 2, rng)
        const rOpts = shuffle([rel, ...rDis], rng)
        const rIds = ['a', 'b', 'c']
        steps.push({
          prompt: `Which concept is most directly coupled with ${t.name} in storyboard design?`,
          choices: rOpts.map((o, i) => ({ id: rIds[i], label: `${o.name}${o.zh ? ' · ' + o.zh : ''}` })),
          answer: rIds[rOpts.indexOf(rel)],
          why: `[[${t.id}]] pairs directly with [[${rel.id}]]: ${rel.short}`,
        })
      }
    }

    out.push({
      id: `ct-${t.id}-a`,
      level: lv,
      title: `${t.name}${t.zh ? ' · ' + t.zh : ''}`,
      scenario: `“${t.short}”${t.example ? ' — ' + t.example : ''}`,
      terms: [t.id, ...t.related.slice(0, 2).filter(r => TERM_MAP[r])],
      tags: t.cat ? [t.cat] : [],
      steps,
      generated: true,
    })
  }

  // Template B — reverse: given term name (EN/ZH/JA), pick its core function
  {
    const distractors = pickN(otherTerms, 2, rng, new Set([t]))
    const opts = shuffle([t, ...distractors], rng)
    const ids = ['a', 'b', 'c']
    const choices = opts.map((o, i) => ({ id: ids[i], label: o.short }))
    const ans = ids[opts.indexOf(t)]

    const steps: Step[] = [{
      prompt: `What is the primary role of ${t.name} (${t.zh || ''})?`,
      choices,
      answer: ans,
      why: `[[${t.id}]]: ${t.short}${t.formula ? ' (' + t.formula + ')' : ''}`,
    }]

    if (cat) {
      const otherCats = Object.values(CAT_MAP).filter(c => c.id !== cat.id)
      const cDis = pickN(otherCats, 2, rng)
      const cOpts = shuffle([cat, ...cDis], rng)
      const cIds = ['a', 'b', 'c']
      steps.push({
        prompt: `Which pillar of Sim4Comics houses ${t.name}?`,
        choices: cOpts.map((c, i) => ({ id: cIds[i], label: `${c.name} · ${c.zh}` })),
        answer: cIds[cOpts.indexOf(cat)],
        why: `[[${t.id}]] belongs to **${cat.name}** (${cat.zh} / ${cat.ja}).`,
      })
    }

    out.push({
      id: `ct-${t.id}-b`,
      level: lv,
      title: `Identify: ${t.zh || t.name}`,
      scenario: `In a manga storyboard review, Sensei Sumi highlights **${t.name}** (${t.zh} · ${t.ja || ''}).`,
      terms: [t.id],
      tags: t.cat ? [t.cat] : [],
      steps,
      generated: true,
    })
  }

  // Template C — Applied studio diagnosis & counterparty choice
  {
    const distractors = pickN(otherTerms, 2, rng, new Set([t]))
    const opts = shuffle([t, ...distractors], rng)
    const ids = ['a', 'b', 'c']
    const ans = ids[opts.indexOf(t)]

    out.push({
      id: `ct-${t.id}-c`,
      level: lv,
      title: `Studio Audit: ${t.name}`,
      scenario: t.example
        ? `Case note: ${t.example}`
        : `During a JEV + tldraw-manga storyboard pass under **${cat?.name || 'Manga Craft'}**, you need to optimize for: ${t.short}`,
      terms: [t.id, ...t.related.slice(0, 1).filter(r => TERM_MAP[r])],
      tags: t.cat ? [t.cat] : [],
      steps: [{
        prompt: 'Which parameter, factor, or technique directly governs this decision?',
        choices: opts.map((o, i) => ({ id: ids[i], label: `${o.name} (${o.zh || ''})` })),
        answer: ans,
        why: `[[${t.id}]] (${t.zh}) directly addresses this beat: ${t.short}`,
      }],
      generated: true,
    })
  }

  return out
}

function mathPool(seed: number): Question[] {
  const rng = mulberry32(seed)
  const out: Question[] = []

  // L1 — Closure Index & Transition distribution drills
  const closureCases: [number, string, string, string][] = [
    [0.15, 'Over-explained (spoon-feeding every micro-frame)', 'Drop redundant intermediate frames so the reader completes the strike in the gutter', '0.15 is below 0.25—too little work left for the reader’s imagination.'],
    [0.62, 'Inside the McCloud Sweet Spot [0.45, 0.82]', 'Lock the panel pair—the reader’s imagination bridges the action cleanly', '0.62 sits squarely inside the [0.45, 0.82] closure sweet spot.'],
    [0.74, 'High-engagement psychological closure [0.45, 0.82]', 'Keep the off-screen sound effect and reaction cut', '0.74 invites strong reader complicity without losing narrative causality.'],
    [0.94, 'Incoherent leap (> 0.90 causal breakdown)', 'Insert a bridging Subject-to-Subject or Clue Insert panel', 'Above 0.90, readers cannot reconstruct what happened between panels.'],
  ]
  closureCases.forEach(([idx, diag, fix, why], i) => {
    out.push({
      id: `cm-1-closure-${i}`,
      level: 1,
      title: `Closure Index audit: C = ${idx.toFixed(2)}`,
      scenario: `JEV Micro-Factor [[mf48_closure_load|MF48]] evaluates the gutter transition between Panel ${i + 1} and Panel ${i + 2} at **Closure Index = ${idx.toFixed(2)}**.`,
      terms: ['closure', 'gutter', 'mf48_closure_load'],
      tags: ['mccloud'],
      generated: true,
      steps: [
        {
          prompt: `How do you diagnose a Closure Index of ${idx.toFixed(2)}?`,
          choices: [
            { id: 'a', label: diag },
            { id: 'b', label: idx < 0.3 ? 'Incoherent leap (> 0.90)' : 'Over-explained (< 0.20)' },
            { id: 'c', label: 'Closure Index has no effect on reading flow' },
          ],
          answer: 'a',
          why: `[[mf48_closure_load]]: ${why}`,
        },
        {
          prompt: 'What editorial action should you take?',
          choices: [
            { id: 'a', label: fix },
            { id: 'b', label: 'Duplicate the exact dialogue in both panels' },
            { id: 'c', label: 'Remove all panel borders on the page' },
          ],
          answer: 'a',
          why: `Target the McCloud [[closure]] sweet spot \`[0.45, 0.82]\`.`,
        },
      ],
    })
  })

  // L1 — Perceived duration from panel width & bleed
  for (let i = 0; i < 16; i++) {
    const widthPct = [18, 25, 35, 50, 75, 100][i % 6]
    const bleed = i % 2 === 0
    const words = [0, 8, 18, 28][i % 4]
    const baseSec = +(widthPct * 0.04 * (bleed ? 1.4 : 1.0) + words * 0.12).toFixed(1)
    const role = widthPct >= 75 && words === 0
      ? 'Silent atmospheric freeze / Ma climax (long perceived duration)'
      : widthPct <= 25 && words <= 8
        ? 'Rapid staccato action beat (sub-second pulse)'
        : 'Balanced narrative dialogue beat'
    const rawOpts = [
      role,
      widthPct >= 75 ? 'Rapid 0.1-second jab' : '10-second timeless chapter splash',
      'Panel width never affects perceived time',
    ]
    const shuffled = shuffle(rawOpts, rng)
    const ids = ['a', 'b', 'c']
    out.push({
      id: `cm-1-time-${i}`,
      level: 1,
      title: `Time-as-Space: ${widthPct}% width ${bleed ? '+ Bleed' : ''}`,
      scenario: `A panel occupies **${widthPct}%** of strip width, **${bleed ? 'bleeds off the margin (Tachikiri)' : 'is enclosed by a 2.5px border'}**, and carries **${words} characters** of dialogue (estimated duration ≈ **${baseSec}s**).`,
      terms: ['time_as_space', 'bleed_timeless', 'mf51_time_space_width'],
      tags: ['mccloud'],
      generated: true,
      steps: [{
        prompt: 'What temporal pacing role does this panel geometry encode?',
        choices: shuffled.map((label, idx) => ({ id: ids[idx], label })),
        answer: ids[shuffled.indexOf(role)],
        why: `By [[time_as_space]] and [[mf51_time_space_width]], spatial width (${widthPct}%) and bleed (${bleed}) map directly to psychological duration (~${baseSec}s).`,
      }],
    })
  }

  // L2 — Koma area hierarchy & Slant angle drills
  for (let i = 0; i < 24; i++) {
    const keyArea = [16, 22, 42, 48, 68][i % 5]
    const slant = [0, 4, 12, 18, 22][i % 5]
    const diag = keyArea < 25
      ? 'Flat hierarchy (no Misegoma reaches 35–50% area)'
      : keyArea <= 52
        ? 'Healthy Koma Hierarchy (Misegoma sits in the 35–50% sweet spot)'
        : 'Over-dominant splash (crowds out setup & reaction strips)'
    out.push({
      id: `cm-2-koma-${i}`,
      level: 2,
      title: `Koma Audit: Max panel ${keyArea}% · Slant ${slant}°`,
      scenario: `On a 5-panel B4 page, the largest panel occupies **${keyArea}%** of total area and uses a **${slant}°** polygon knife slant.`,
      terms: ['koma_hierarchy', 'key_panel_misegoma', 'polygon_slant'],
      tags: ['komawari'],
      generated: true,
      steps: [
        {
          prompt: `How do you evaluate the ${keyArea}% largest panel?`,
          choices: [
            { id: 'a', label: diag },
            { id: 'b', label: keyArea < 25 ? 'Over-dominant splash' : 'Flat equal-grid monotony' },
            { id: 'c', label: 'Panel area does not affect page hierarchy' },
          ],
          answer: 'a',
          why: `[[koma_hierarchy]] targets a dominant [[key_panel_misegoma]] around 35–50% of page area.`,
        },
        {
          prompt: `What kinetic mood does the ${slant}° polygon slant convey?`,
          choices: [
            { id: 'a', label: slant === 0 ? 'Orderly Seizen stability / quiet tension (0°)' : slant <= 8 ? 'Subtle directional push (4°–8°)' : 'High-velocity action / psychological collision (12°–22°)' },
            { id: 'b', label: slant === 0 ? 'Extreme chaotic explosion' : 'Static 4-koma newspaper strip' },
            { id: 'c', label: 'Slant angles only change font size' },
          ],
          answer: 'a',
          why: `[[polygon_slant]] maps 0° to calm order and 12°–22° to kinetic impact.`,
        },
      ],
    })
  }

  // L3 — Master style attribution & staging drills
  const masterDrills: [string, string, string, string][] = [
    ['Osamu Tezuka (手塚治虫)', 'tezuka_montage', 'Breaking a single action into multi-angle cinema cuts with characters bursting through panel borders', 'Tezuka pioneered cinematic montage and dynamic frame breaking.'],
    ['Akira Toriyama (鸟山明)', 'toriyama_impact', 'Razor-clear black pose silhouette, foreshortened fist, white void impact frame, and S-curve eye flow', 'Toriyama maximizes silhouette readability and S-curve kinetic flow.'],
    ['Takehiko Inoue (井上雄彦)', 'inoue_ma', 'Zero-dialogue pages alternating 135mm ECU eyes with full-body negative-space jump shots', 'Inoue stretches sub-second climaxes using silent Ma and scale contrast.'],
    ['Katsuhiro Otomo (大友克洋)', 'otomo_perspective', '18mm 3-point bird’s-eye architectural grid at f/16 deep focus showing tiny humans against megastructures', 'Otomo grounds sci-fi scale in deep-focus 3-point architectural perspective.'],
    ['Naoki Urasawa (浦泽直树)', 'urasawa_cliffhanger', 'Polite eye-level dialogue with a Subtext Mask twitch, an 85mm prop insert, and a chilling bottom-left Hiki hook', 'Urasawa builds psychological dread via contrapuntal acting and page-turn hooks.'],
  ]
  for (let i = 0; i < 36; i++) {
    const [master, termId, desc, why] = masterDrills[i % masterDrills.length]
    const others = masterDrills.filter(m => m[0] !== master)
    out.push({
      id: `cm-3-master-${i}`,
      level: 3,
      title: `Master Signature #${i + 1}: ${master.split(' ')[1]}`,
      scenario: `Storyboard specification #${i + 1}: **${desc}**.`,
      terms: [termId],
      tags: ['masters'],
      generated: true,
      steps: [{
        prompt: 'Which manga master’s signature grammar does this specification embody?',
        choices: [
          { id: 'a', label: master },
          { id: 'b', label: others[0][0] },
          { id: 'c', label: others[1][0] },
        ],
        answer: 'a',
        why: `[[${termId}]]: ${why}`,
      }],
    })
  }

  // L4 — Optical FOV, Shot Scale, and DOF math drills
  const opticalSetups: [number, number, number, string, number, number][] = [
    [14, 11, 12.0, 'EWS (Extreme Wide Shot)', 104, 5],
    [24, 8, 6.0, 'WS (Wide Shot)', 74, 12],
    [35, 5.6, 3.5, 'FS (Full Shot)', 54, 22],
    [50, 2.8, 2.0, 'MS (Medium Shot)', 40, 45],
    [85, 1.8, 1.1, 'CU (Close-Up)', 24, 78],
    [135, 1.4, 0.7, 'ECU (Extreme Close-Up)', 15, 92],
  ]
  for (let i = 0; i < 24; i++) {
    const [focal, fstop, dist, shotName, fov, blur] = opticalSetups[i % opticalSetups.length]
    out.push({
      id: `cm-4-opt-${i}`,
      level: 4,
      title: `Optical Solve: ${focal}mm · f/${fstop} · ${dist}m`,
      scenario: `In Stage 4 Optical Lab, you set Focal Length = **${focal}mm**, Aperture = **f/${fstop}**, and Subject Distance = **${dist}m** on a 36×24mm sensor.`,
      terms: ['optical_dof_fov', 'shot_scale_10', 'tldraw_optical_lab'],
      tags: ['camera_opt'],
      generated: true,
      steps: [
        {
          prompt: `What Shot Scale and approximate horizontal FOV result from ${focal}mm at ${dist}m?`,
          choices: [
            { id: 'a', label: `${shotName} · FOV ≈ ${fov}°` },
            { id: 'b', label: focal < 40 ? 'ECU (Extreme Close-Up) · FOV ≈ 12°' : 'EWS (Extreme Wide Shot) · FOV ≈ 104°' },
            { id: 'c', label: 'Focal length does not change FOV' },
          ],
          answer: 'a',
          why: `By \`FOV = 2·arctan(18/${focal})\`, **${focal}mm** yields **~${fov}°** FOV and maps to **${shotName}** at ${dist}m ([[optical_dof_fov]]).`,
        },
        {
          prompt: `At f/${fstop} and ${dist}m, what happens to the background depth-of-field blur (\`dof_blur_pct\`)?`,
          choices: [
            { id: 'a', label: blur >= 70 ? `Shallow DOF (~${blur}% bokeh blur) isolating the face/clue` : blur <= 25 ? `Deep focus (~${blur}% blur) keeping architectural grids sharp` : `Balanced midground separation (~${blur}% blur)` },
            { id: 'b', label: blur >= 70 ? '100% razor-sharp background buildings' : 'Total whiteout bokeh' },
            { id: 'c', label: 'Aperture only changes panel border thickness' },
          ],
          answer: 'a',
          why: `f/${fstop} at ${dist}m produces ~${blur}% background blur in [[tldraw_optical_lab]].`,
        },
      ],
    })
  }

  // L5 — JEV System 1 probability & Shannon entropy drills
  for (let i = 0; i < 36; i++) {
    const pYes = +(0.15 + ((i * 17) % 80) / 100).toFixed(2)
    const w = +(0.5 + ((i * 13) % 50) / 100).toFixed(2)
    const contrib = +(w * pYes).toFixed(3)
    const gateActive = pYes >= 0.5
    out.push({
      id: `cm-5-jev-${i}`,
      level: 5,
      title: `/v1/systemone Gate: P(yes)=${pYes} · w=${w}`,
      scenario: `A \`noul\` question with \`"alone": true\` returns \`p0.yes = ${pYes}\` under scene weight \`w = ${w}\`.`,
      terms: ['jev_systemone_api', 'op_weight_joint_degrade', 'shannon_entropy_gate'],
      tags: ['jev_arch'],
      generated: true,
      steps: [
        {
          prompt: `Does this binary condition gate activate (threshold P(yes) ≥ 0.50), and what is its weighted utility contribution w · P(yes)?`,
          choices: [
            { id: 'a', label: `${gateActive ? 'Activates (TRUE)' : 'Stays inactive (FALSE)'} · weighted contribution = ${contrib}` },
            { id: 'b', label: `${!gateActive ? 'Activates (TRUE)' : 'Stays inactive (FALSE)'} · weighted contribution = ${(w + pYes).toFixed(2)}` },
            { id: 'c', label: 'noul questions do not return probabilities' },
          ],
          answer: 'a',
          why: `In [[jev_systemone_api]], \`P(yes) = ${pYes}\` is ${gateActive ? '≥ 0.50 (active)' : '< 0.50 (inactive)'} and contributes \`${w} × ${pYes} = ${contrib}\` via [[op_weight_joint_degrade]].`,
        },
      ],
    })
  }

  // L6 — JEV 14-Factor & 5-Pass Funnel drills
  const factorPairs: [string, string, string][] = [
    ['F01 camera_angle', 'f01_camera_angle', 'Selects pitch/roll camera angle (eye_level, low_angle, dutch_tilt)'],
    ['F02 character_details', 'f02_character_details', 'Tracks action_phase (anticipation/apex_impact) and prop_interaction'],
    ['F03 shot_type', 'f03_shot_type', 'Maps 10-step shot scale (EWS..ECU/INSERT) and focal length'],
    ['F04 facial_expression', 'f04_facial_expression', 'Encodes emotion intensity (0–4) and the subtext_contrast gate'],
    ['F05 environment', 'f05_environment', 'Controls foreground occlusion, background density, and DOF blur %'],
    ['F06 lighting_shadow', 'f06_lighting_shadow', 'Selects Rembrandt, Noir chiaroscuro, or Rim silhouette lighting'],
    ['F08 background_grid', 'f08_background_grid', 'Governs polygon slant (0°–22°), bleed edges, and panel area weight'],
    ['F09 auxiliary_text', 'f09_auxiliary_text', 'Controls silent_panel gate, 7 balloon styles, and dual truncation'],
    ['F11 gaze_vector', 'f11_gaze_vector', 'Models 2D gaze vector [dx, dy] for R-to-L eye-tracking'],
    ['F14 temporal_progression', 'f14_temporal_progression', 'Enforces McCloud transition T1–T6, Hiki role, and ≤35-char budget'],
  ]
  for (let i = 0; i < 24; i++) {
    const [fName, fId, fDesc] = factorPairs[i % factorPairs.length]
    const others = factorPairs.filter(f => f[0] !== fName)
    out.push({
      id: `cm-6-factor-${i}`,
      level: 6,
      title: `14-Factor Spec #${i + 1}: ${fName}`,
      scenario: `In the JEV 14-Factor Storyboard Engine, you need to configure: **${fDesc}**.`,
      terms: [fId, 'jev_five_pass_funnel'],
      tags: ['jev_factors'],
      generated: true,
      steps: [{
        prompt: 'Which orthogonal JEV factor owns this parameter space?',
        choices: [
          { id: 'a', label: fName },
          { id: 'b', label: others[i % others.length][0] },
          { id: 'c', label: others[(i + 3) % others.length][0] },
        ],
        answer: 'a',
        why: `[[${fId}]] (${fName}): ${fDesc}.`,
      }],
    })
  }

  // L7 — tldraw-manga 6-Axis layoutScore & 5D slider prescription drills
  for (let i = 0; i < 36; i++) {
    const flow = 75 + (i % 15)
    const hier = i % 2 === 0 ? 38 : 84
    const tension = i % 3 === 0 ? 40 : 82
    const breath = 72 + (i % 18)
    const rhythm = 70 + (i % 20)
    const variety = 68 + (i % 22)
    const avg = Math.round((flow + hier + tension + breath + rhythm + variety) / 6)
    const fix = hier < 50
      ? 'Increase Big Weight (大格权重 → 2–3) so the climax panel reaches 40%+ area'
      : tension < 50
        ? 'Enable Bleed (出血破框 → 1–2) and Slant (斜切角度 → 12°) on the peak action panel'
        : 'Layout is balanced (score ≥ 75)—lock Stage 2 and advance to Stage 3 Script & Balloons'
    out.push({
      id: `cm-7-score-${i}`,
      level: 7,
      title: `6-Axis layoutScore: ${avg}/100 (#${i + 1})`,
      scenario: `Stage 2 Editor Score reports: **Flow ${flow} · Hierarchy ${hier} · Rhythm ${rhythm} · Breath ${breath} · Tension ${tension} · Variety ${variety}** (Overall = **${avg}/100**).`,
      terms: ['tldraw_layout_score', 'tldraw_5d_geometry', 'tldraw_5stage'],
      tags: ['tldraw_studio'],
      generated: true,
      steps: [{
        prompt: 'Which 1-click prescription (`applyFix`) best improves this page layout?',
        choices: [
          { id: 'a', label: fix },
          { id: 'b', label: hier < 50 ? 'Make all panels equal 16% squares' : 'Delete all speech balloons' },
          { id: 'c', label: 'Reduce canvas resolution to 100×100px' },
        ],
        answer: 'a',
        why: `In [[tldraw_layout_score]], ${fix}.`,
      }],
    })
  }

  return out
}

export function buildBank(): Record<number, Question[]> {
  const byLevel: Record<number, Question[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }

  for (const q of AUTHORED) byLevel[q.level].push(q)

  let seed = 20261026
  for (const t of TERMS) {
    for (const q of termQuestions(t, seed++)) {
      byLevel[q.level].push(q)
    }
  }

  for (const q of mathPool(9090)) {
    byLevel[q.level].push(q)
  }

  const out: Record<number, Question[]> = {}
  for (const lv of LEVELS) {
    const target = TARGETS[lv.n]
    const list = byLevel[lv.n]
    let variantIdx = 1
    while (list.length < target) {
      const base = list[(variantIdx - 1) % list.length]
      list.push({
        ...base,
        id: `${base.id}-v${variantIdx}`,
        title: `${base.title} (Drill #${variantIdx})`,
        generated: true,
      })
      variantIdx++
    }
    out[lv.n] = list.slice(0, target)
  }
  return out
}
