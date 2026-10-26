import type { Scene, Step } from '../../shared/types'

const s = (prompt: string, choices: [string, string][], answer: string, why: string): Step => ({
  prompt,
  choices: choices.map(([id, label]) => ({ id, label })),
  answer,
  why,
})

export const SCENES: Scene[] = [
  {
    id: 'rainy-interrogation-watch',
    title: 'Rainy Night Interrogation: The Cracked Pocket Watch',
    zh: '雨夜审讯室：碎裂怀表与五轮轮询推演',
    genre: 'Seinen Noir · JEV 5-Pass',
    setup: '02:15 AM, neo-noir police precinct. Rain streaks cast Venetian-blind shadows across a bare steel table. Detective Lin (screen-right, standing) slides a cracked silver pocket watch across the desk toward former partner Kurosawa (screen-left, seated).',
    goal: 'Convert a 5-beat script into a locked 5-panel B4 page via the JEV 14-Factor & 5-Pass Polling Funnel (|K₀|=12 → |K₄|=1) with zero duospecific redundancy.',
    terms: ['jev_five_pass_funnel', 'insert_clue_shot', 'subtext_contrast', 'silent_panel', 'hiki_cliffhanger', 'adversarial_audit'],
    tags: ['JEV 5-Pass', 'Noir Thriller', 'Subtext Mask', 'Clue Insert'],
    checkpoints: [
      {
        label: 'Pass 0 & Beat 1 · Establishing',
        dept: 'layout',
        context: 'Panel 1 (Top-Right entry) must establish the interrogation room geography, mood, and R-to-L eye entry.',
        step: s(
          'How should Panel 1 (Top-Right) establish the room and reading flow?',
          [
            ['a', 'WS (24mm, f/8, high angle +25°), Noir Chiaroscuro (65% Beta ink), Venetian-blind shadow lines leading top-right to bottom-left'],
            ['b', 'ECU (135mm) of Kurosawa’s nose with a pure white background'],
            ['c', 'Four equal-sized talking-head squares at 50mm eye-level'],
          ],
          'a',
          'Establishes spatial geography ([[ews_shot|WS]]), oppressive mood ([[rembrandt_noir]]), and R-to-L eye entry ([[z_path_rtl]]).'
        ),
      },
      {
        label: 'Beat 2 & Pass 2 · Clue Insert',
        dept: 'camera',
        context: 'Lin slides the cracked pocket watch forward, stopped at 11:42 PM.',
        step: s(
          'Which F03/F08 combination wins the Pass 2 Swiss pairwise tournament?',
          [
            ['a', 'F03 = INSERT (105mm macro, f/2.0, 80% bokeh), 8° polygon slant, specular reflection of Kurosawa’s eye in the watch glass (MF40)'],
            ['b', 'EWS (14mm) from outside the building showing the window'],
            ['c', 'MS (50mm) where Lin says: "Look at this silver pocket watch cracked at 11:42 PM!"'],
          ],
          'a',
          'Activates [[insert_clue_shot]] at 105mm macro and uses [[latent_factor_discovery|MF40]] specular reflection without falling into the [[wp_duospecific]] trap.'
        ),
      },
      {
        label: 'Beat 3 & Pass 3 · Subtext Acting',
        dept: 'acting',
        context: 'Kurosawa calmly replies: "I haven’t carried a watch in ten years."',
        step: s(
          'How do F04 and MF38/MF49 stage his lie?',
          [
            ['a', 'MCU with Rembrandt half-shadow (subtext_contrast = true): calm smile on his lips, plus a Sub-split inset (MF42) of his fingernail drawing blood under the table'],
            ['b', 'Jagged shout balloon: "I AM LYING AND MY HAND IS SHAKING!"'],
            ['c', 'Cut away to a random exterior street lamp with no characters'],
          ],
          'a',
          'Pass 3 Contrapuntal Refinement rewards calm spoken words paired with visual betrayal via [[subtext_contrast]], [[pip_inset_panel]], and [[wp_interdependent]].'
        ),
      },
      {
        label: 'Beats 4–5 & Pass 4 · Adversarial Audit',
        dept: 'editing',
        context: 'The watch chimes midnight; Kurosawa whispers "Check the inside of the lid."',
        step: s(
          'How do Panels 4 and 5 pass the Pass 4 Adversarial Audit and lock the page?',
          [
            ['a', 'Panel 4: Silent wide panel (silent_panel = true, 7.5mm gutter, T5 Aspect freeze) → Panel 5 (Bottom-Left Hiki): Dutch tilt (-15°) ECU of Lin’s pupil reflecting a photo inside the lid'],
            ['b', 'Pack 80 words of backstory into Panel 4 and end Panel 5 with a calm wide shot of the hallway'],
            ['c', 'Repeat the exact 50mm eye-level shot from Panel 3'],
          ],
          'a',
          'Clears [[adversarial_audit]] (`adv_02_dialogue_bloating_in_aftermath`) with a [[silent_panel]] Ma beat, then plants an irresistible [[hiki_cliffhanger]] in the bottom-left slot.'
        ),
      },
    ],
    outcome: 'A master thriller page pairs macro layout contrast (Setup → Macro [[insert_clue_shot|Insert]] → [[pip_inset_panel|Sub-split]] Acting → [[silent_panel|Silent Ma]] → Bottom-Left [[hiki_cliffhanger|Hiki]]) with contrapuntal word-picture synergy.',
    ref: 'Naoki Urasawa’s Monster (1994) & JEV 5-Pass Benchmark #1',
  },

  {
    id: 'seagull-fries-philosophy',
    title: 'Two Seagulls & French Fries: Contrapuntal Comedy',
    zh: '两只海鸥与薯条：麦克劳德平行反差与冷面幽默',
    genre: 'Deadpan Comedy · McCloud D9',
    setup: 'A sun-drenched pier. Two seagulls stand on a wooden bollard. Seagull A delivers a solemn lecture on Schopenhauer and the void; Seagull B stares at a tourist’s paper bag.',
    goal: 'Maximize MF49 (Word-Picture Interdependence), MF50 (Iconic Amplification Contrast), and T6 Non-Sequitur / T5 Aspect timing across a 4-panel strip.',
    terms: ['wp_parallel', 'wp_interdependent', 't6_non_sequitur', 'mf49_wp_interdependence', 'mf50_iconic_contrast', 'silent_panel'],
    tags: ['McCloud Poetics', 'T6 Non-Sequitur', 'Parallel WP', 'Iconic Contrast'],
    checkpoints: [
      {
        label: 'Panel 1 · Parallel Setup',
        dept: 'mccloud',
        context: 'Gull A pontificates: "Existence is a pendulum swinging between craving and boredom."',
        step: s(
          'How should the art and text interact in Panel 1?',
          [
            ['a', 'Parallel combination (wp_parallel): hyper-detailed realistic pier woodgrain (MF50), while Gull B’s deadpan dot-eyes track a tourist’s fry bag below'],
            ['b', 'Duospecific (wp_duospecific): Gull A holds a chalkboard that says "Craving & Boredom"'],
            ['c', 'Text-only panel with no drawing'],
          ],
          'a',
          'High academic prose colliding with a laser-focused avian stare on fast food creates instant [[wp_parallel]] comedy and [[mf50_iconic_contrast]].'
        ),
      },
      {
        label: 'Panel 2 · The Non-Sequitur Leap',
        dept: 'mccloud',
        context: 'Gull A asks: "What anchors your soul to this fleeting mortal shore?"',
        step: s(
          'What should Panel 2 cut to?',
          [
            ['a', 'T6 Non-Sequitur + Silent Insert: a glorious 105mm macro close-up of a single crispy french fry radiating radial focus lines (集中線) and screentone sparkles'],
            ['b', 'Gull B saying: "I really like eating french fries because I am hungry."'],
            ['c', 'Another identical medium shot of the pier'],
          ],
          'a',
          'Cutting from high metaphysics to a silent, reverent macro portrait of a french fry detonates [[t6_non_sequitur]] and [[mf49_wp_interdependence]].'
        ),
      },
      {
        label: 'Panels 3–4 · Silent Beat & Dive',
        dept: 'rhythm',
        context: 'A single fry drops onto the planks between them.',
        step: s(
          'How do you time the comedic pause before both gulls dive-bomb the fry?',
          [
            ['a', 'Panel 3: Silent T5 Aspect panel (シーン… Shīn, 6mm wide gutter, wind ruffling feathers) → Panel 4: 18° diagonal bleed panel of BOTH gulls screeching "MINE!!" in full foreshortened dive'],
            ['b', 'Skip the pause and end with both gulls nodding politely'],
            ['c', 'Add a 60-word narrator box explaining why seagulls like salt'],
          ],
          'a',
          'A [[silent_panel]] (`T5 Aspect`) lets the absurdity sink in before Panel 4 exposes Gull A’s philosophical hypocrisy in kinetic [[t2_action]].'
        ),
      },
    ],
    outcome: 'Great comic timing relies on McCloud’s [[wp_parallel]] / [[wp_interdependent]] collision, a fearless [[t6_non_sequitur]] visual cut, and a [[silent_panel]] pause before the kinetic payoff.',
    ref: 'Scott McCloud’s Understanding Comics (Ch. 3 & Ch. 6) & JEV Seagull Benchmark',
  },

  {
    id: 'shonen-rooftop-slash',
    title: 'Rooftop Thunder Slash: Toriyama Impact × Inoue Ma',
    zh: '天台雷鸣斩：鸟山明剪影冲击 × 井上雄彦无声「间」',
    genre: 'Shōnen Action · Masters',
    setup: 'Climax of a blade duel on a rain-slicked shrine roof. Two swordmasters face off in pouring rain with 5 panels on the B4 page.',
    goal: 'Combine Akira Toriyama’s silhouette clarity & S-flow eye guidance with Takehiko Inoue’s silent decompression (Ma) and McCloud Gutter Closure.',
    terms: ['toriyama_impact', 'inoue_ma', 's_flow_eye_track', 'key_panel_misegoma', 'closure', 'bleed_timeless'],
    tags: ['Toriyama S-Flow', 'Inoue Ma', 'Misegoma Bleed', 'Closure [0.45, 0.82]'],
    checkpoints: [
      {
        label: 'Panels 1–2 · Anticipation & S-Flow',
        dept: 'flow',
        context: 'Both fighters crouch before their blades leave the scabbards.',
        step: s(
          'How do you build kinetic coil across Panels 1 and 2?',
          [
            ['a', 'Panel 1 (Top-Right): 135mm ECU of thumb clicking the tsuba guard → Panel 2 (Top-Left): 12° slanted low-angle crouch chaining into an S-curve toward the center strip'],
            ['b', 'Two identical 50mm waist-up shots with 40 words of inner monologue each'],
            ['c', 'A distant map of the city'],
          ],
          'a',
          'Pairs an acoustic/tactile micro-gesture (`F02=anticipation`) with Toriyama’s [[s_flow_eye_track]].'
        ),
      },
      {
        label: 'Panels 3–4 · Gutter Strike & Misegoma',
        dept: 'climax',
        context: 'The lethal cross-slash happens in 0.05 seconds.',
        step: s(
          'How do you use McCloud Closure and Key Panel dominance for the slash itself?',
          [
            ['a', 'Panel 3: Narrow vertical flash splitting a raindrop → Gutter (reader closes the cut, C=0.68) → Panel 4: 46%-area full-bleed Misegoma in stark black silhouette & white void as both land back-to-back in dead silence'],
            ['b', 'Draw 8 small equal panels showing every 5cm of the sword swing with a narrator explaining the technique name'],
            ['c', 'Hide the fighters behind a giant speech bubble'],
          ],
          'a',
          'The reader’s mind executes the cut via [[closure]] in the [[gutter]], while the massive silent [[key_panel_misegoma]] delivers [[toriyama_impact]] + [[inoue_ma]].'
        ),
      },
    ],
    outcome: 'Let [[closure]] in the gutter perform the fastest part of the strike, then lock the eye on a high-contrast, zero-dialogue [[key_panel_misegoma]] with [[toriyama_impact]] silhouette clarity.',
    ref: 'Akira Toriyama’s Dragon Ball & Takehiko Inoue’s Vagabond / Slam Dunk',
  },

  {
    id: 'neo-tokyo-viaduct-drift',
    title: 'Neo-Tokyo Viaduct: Otomo Deep Focus & Optical Lab',
    zh: '新东京高架桥：大友克洋三点透视与光学景深实验',
    genre: 'Cyberpunk Sci-Fi · Optics',
    setup: 'A courier bike skids across a collapsing megastructure highway 400 meters above a neon abyss.',
    goal: 'Configure Stage 4 Optical Lab and JEV Factors F01, F03, F05, F07, and F08 so the architectural scale feels physically crushing.',
    terms: ['otomo_perspective', 'optical_dof_fov', 'tldraw_optical_lab', 'ews_shot', 'kontorasuto', 'camera_angles_manga'],
    tags: ['Otomo Perspective', '3-Point Grid', '14mm f/16 Deep Focus', 'Scale Contrast'],
    checkpoints: [
      {
        label: 'Optical Solver · Deep Focus',
        dept: 'optics',
        context: 'Both the skidding tire in the foreground and the 200-story reactor towers 2km away must be razor-sharp.',
        step: s(
          'Which optical setting do you lock in Stage 4 Optical Lab?',
          [
            ['a', 'Focal length 14mm (EWS), Aperture f/16 (dof_blur_pct = 4%), 3-point perspective convergence lines (architectural_converge)'],
            ['b', 'Focal length 135mm at f/1.4 (dof_blur_pct = 92%)'],
            ['c', 'Focal length 50mm at f/2.0 with flat 1-point wall background'],
          ],
          'a',
          '[[otomo_perspective]] relies on wide-angle deep focus ([[optical_dof_fov]], `f/11–f/16`) so megastructure geometry remains sharp from foreground debris to horizon.'
        ),
      },
      {
        label: 'Koma-wari · Scale Contrast',
        dept: 'layout',
        context: 'A shockwave cracks the highway span.',
        step: s(
          'How do you make the shockwave feel colossal on the page?',
          [
            ['a', 'Preceded by 3 tight cockpit/gauge slivers, unleash a top-and-side bleeding Bird’s-Eye (+75°) Misegoma where the bike is a tiny 2% speck against the 3-point highway chasm'],
            ['b', 'Keep the camera at eye-level Medium Shot for all panels'],
            ['c', 'Use 6 identical square panels'],
          ],
          'a',
          'Extreme [[kontorasuto]] between tight mechanical inserts and a deep-focus panoramic [[ews_shot]] makes the reader feel the altitude.'
        ),
      },
    ],
    outcome: '[[otomo_perspective]] pairs wide-angle deep focus (14–24mm, f/11–f/16) in [[tldraw_optical_lab]] with 3-point architectural convergence and extreme human-vs-megastructure [[kontorasuto]].',
    ref: 'Katsuhiro Otomo’s AKIRA (1982–1990)',
  },

  {
    id: 'corridor-door-mekuri',
    title: 'The Peephole at 3 AM: Urasawa Hiki & Mekuri Engineering',
    zh: '凌晨三点的猫眼：浦泽直树翻页悬念（引き·めくり）工程',
    genre: 'Psychological Thriller · Koma-wari',
    setup: 'The hallway sensor light clicks on outside Apartment 404 at 3 AM. Nobody rang the bell. Your protagonist approaches the peephole on an odd-numbered left-hand page (Page 19).',
    goal: 'Stretch psychological time with T1 Moment-to-Moment slivers and engineer an irresistible Bottom-Left Hiki cliffhanger before the page turn to Page 20.',
    terms: ['hiki_cliffhanger', 'urasawa_cliffhanger', 't1_moment', 'silent_panel', 'f07_distortion', 'ecu_shot'],
    tags: ['Urasawa Suspense', 'T1 Moment-to-Moment', 'Bottom-Left Hiki', 'Fisheye Warp'],
    checkpoints: [
      {
        label: 'Strips 1–2 · Stretching Time',
        dept: 'rhythm',
        context: 'A 4-step walk down the dark corridor toward the door.',
        step: s(
          'How do you make a 4-step walk feel agonizingly slow?',
          [
            ['a', 'Use T1 Moment-to-Moment slivers with zero dialogue (silent_panel = true), alternating bare feet on cold floorboards with the orange glow under the door crack'],
            ['b', 'One single panel where the character sprints to the door and opens it immediately'],
            ['c', 'Add a comedic thought bubble about breakfast'],
          ],
          'a',
          '[[t1_moment]] + [[silent_panel]] decelerates psychological time so every footstep echoes in the reader’s head.'
        ),
      },
      {
        label: 'Bottom-Left Panel · The Hiki Slot',
        dept: 'cliffhanger',
        context: 'Final bottom-left panel of Page 19, right before the physical page turn (Mekuri).',
        step: s(
          'What do you put in the bottom-left Hiki slot?',
          [
            ['a', 'An ECU of the protagonist’s eye pressed to the brass peephole—and reflected in the cornea is a warped fisheye silhouette standing 2 inches from the lens, whispering their childhood nickname'],
            ['b', 'Show the visitor in full daylight explaining why they came over'],
            ['c', 'Cut to a calm exterior shot of the apartment building'],
          ],
          'a',
          'Maximizes [[hiki_cliffhanger]] and [[urasawa_cliffhanger]]: withholds the full face until the reader turns the page (`Mekuri`) to Page 20’s reveal.'
        ),
      },
    ],
    outcome: 'Never waste the bottom-left panel of an odd page: compress time with [[t1_moment]] [[silent_panel]] slivers, plant an unresolved hook in the [[hiki_cliffhanger]] slot, and cash the reveal on the Mekuri turn.',
    ref: 'Naoki Urasawa’s 20th Century Boys & Pluto',
  },

  {
    id: 'tldraw-5stage-production',
    title: 'tldraw-manga 5-Stage Production & OpenRaster Handoff',
    zh: 'tldraw-manga 五阶段工业流与 .ora 分层交付实战',
    genre: 'Studio Pipeline · tldraw-manga',
    setup: 'You are lead storyboard director using jstdlee/tldraw-manga on a B4 canvas (740 × 1046 px), taking a chapter opener from Stage 1 Setup Cards to Stage 5 Export.',
    goal: 'Optimize the 6-axis Editor Score (layoutScore) above 90/100, apply R-to-L dual-balloon truncation, and export a 5-layer OpenRaster (.ora) package.',
    terms: ['tldraw_3tier', 'tldraw_5stage', 'tldraw_5d_geometry', 'tldraw_layout_score', 'tldraw_stage3_script', 'tldraw_ora_export'],
    tags: ['tldraw-manga', '5-Stage Pipeline', 'layoutScore', '5-Layer .ora'],
    checkpoints: [
      {
        label: 'Stage 2 · Layout Desk & 36-Seed Search',
        dept: 'layout',
        context: 'Your initial std 4-strip grid scores 61/100 because Hierarchy is 40 and Tension is 44.',
        step: s(
          'How do you boost the 6-axis Editor Score above 90/100?',
          [
            ['a', 'Run the 36-Seed Smart Search or click the Editor Prescription (applyFix) to boost Big Weight (大格权重 → 2), Slant (10°), and Bleed (1) on Strip 3'],
            ['b', 'Set all strips to equal height and 0° slant'],
            ['c', 'Delete Strip 3 completely'],
          ],
          'a',
          '[[tldraw_layout_score]] diagnoses weak axes and adjusts [[tldraw_5d_geometry]] on the [[tldraw_3tier]] polygon container.'
        ),
      },
      {
        label: 'Stage 3 · Script & Dual-Balloon Truncation',
        dept: 'script',
        context: 'You paste a 6-line script and select the tension emotional strategy. Panel 2 has a 44-character line.',
        step: s(
          'How does Stage 3 format Panel 2’s 44-character line and the final panel?',
          [
            ['a', 'Splits the 44-char line at the clause boundary into a top-right Lead Balloon + bottom-left Follow Balloon, and sets the final panel to silent_panel = true (none balloon)'],
            ['b', 'Dumps all 6 lines into a single center rectangle covering the character’s face'],
            ['c', 'Deletes all text from the entire page'],
          ],
          'a',
          '[[tldraw_stage3_script]] and [[balloon_anchor_order]] enforce R-to-L eye-guidance truncation and preserve a silent final Hiki beat.'
        ),
      },
      {
        label: 'Stage 5 · 5-Layer .ora & 4-Mode HTML Export',
        dept: 'export',
        context: 'The storyboard is locked for the inking assistant (Krita/CSP) and editorial review.',
        step: s(
          'Which export package do you generate in Stage 5?',
          [
            ['a', '5-Layer OpenRaster (.ora) archive (Balloons, Borders, Sketches, Gutter Mask, Paper) + 4-Mode Interactive HTML (Clean, Table, Overview, Full)'],
            ['b', 'A single flattened 72dpi GIF'],
            ['c', 'Plain text only'],
          ],
          'a',
          '[[tldraw_ora_export]] provides true industrial layer separation (`stack.xml` + 5 PNG layers) alongside the 4-mode HTML spec sheet.'
        ),
      },
    ],
    outcome: '[[tldraw_5stage]] bridges artistic intuition and industrial precision: [[tldraw_3tier]] polygon containers, [[tldraw_layout_score]] prescriptions, dual-balloon R-to-L truncation, optical camera math, and [[tldraw_ora_export]] 5-layer delivery.',
    ref: 'jstdlee/tldraw-manga (B4 Manga Storyboard Studio)',
  },
]
