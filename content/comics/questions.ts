import type { Question, Step, Level } from '../../shared/types'

export const LEVELS: Level[] = [
  { n: 1, name: 'McCloud Poetics & Closure', zh: '麦克劳德诗学与格间闭合', ja: 'マクラウド詩学とクロージャー', blurb: 'Closure in the gutter, the 6 panel transitions, the Big Triangle, and 7 word-picture relationships.', cats: ['mccloud'] },
  { n: 2, name: 'Koma-wari & Eye Guidance', zh: '格割层级与视线诱导', ja: 'コマ割りと視線誘導', blurb: 'Lead/Key/Landing hierarchy, R-to-L Z-path, S-flow chains, bleeds, polygon slants, and page-turn hooks.', cats: ['komawari'] },
  { n: 3, name: 'Master Craft Techniques', zh: '漫画大师分镜技法', ja: '巨匠のネーム演出技法', blurb: 'Tezuka cinematic montage, Toriyama impact & S-flow, Inoue silent Ma, Otomo deep-focus perspective, Urasawa Hiki.', cats: ['masters'] },
  { n: 4, name: 'Camera, Optics & Tone', zh: '镜头光学、微演技与网点光影', ja: '光学レンズ・微細演技・トーン', blurb: '10-step shot scale, focal length FOV/DOF math, 7 angles, silent panels, subtext contrast, screentones, and SFX.', cats: ['camera_opt', 'acting_tone'] },
  { n: 5, name: 'JEV Two-Tier Architecture', zh: 'JEV 双层决策与五大算子', ja: 'JEV 二層構造と5大オペレータ', blurb: 'System 2 knowledge compiler + System 1 (/v1/systemone) runtime, Decompose/Horizon/Weight/Joint/Degrade, Shannon entropy.', cats: ['jev_arch'] },
  { n: 6, name: 'JEV 14 Factors & 5-Pass Polling', zh: 'JEV 14维切分因子与五轮漏斗', ja: 'JEV 14因子と5段階ポーリング', blurb: 'Orthogonal factors F01–F14, Micro-Factors MF38–MF52, and Pass 0→Pass 4 progressive tournament convergence.', cats: ['jev_factors'] },
  { n: 7, name: 'tldraw-manga Studio Engineering', zh: 'tldraw-manga 三层容器与工程流', ja: 'tldraw-manga 3階層コンテナと実装', blurb: 'Page→Strip→Polygon Panel containers, 5D geometry sliders, 6-axis layoutScore, Optical Lab, and 5-layer .ora export.', cats: ['tldraw_studio'] },
]

const s = (prompt: string, choices: [string, string][], answer: string, why: string): Step => ({
  prompt, choices: choices.map(([id, label]) => ({ id, label })), answer, why,
})

export const AUTHORED: Question[] = [
  // ───────── LEVEL 1: McCloud Poetics & Closure
  { id: 'c1-01', level: 1, title: 'Blood in the gutter', terms: ['closure', 'gutter', 'mf48_closure_load'], tags: ['mccloud'],
    scenario: 'Panel 1 shows a killer raising an axe above a victim. Panel 2 cuts to the night skyline of the city with a scream "AAHH!".',
    steps: [
      s('Where does the actual strike happen?', [['a', 'Inside the gutter via the reader’s closure'], ['b', 'In Panel 1'], ['c', 'Nowhere—the scene is incomplete']], 'a', 'As Scott McCloud explains, the artist draws two moments; [[closure]] in the [[gutter]] makes the reader an equal accomplice.'),
      s('In JEV’s [[mf48_closure_load|MF48 Gutter Closure Load]], what is the golden sweet spot for Closure Index?', [['a', '[0.45, 0.82]'], ['b', '< 0.20 (show every frame)'], ['c', '> 0.95 (random jump)']], 'a', 'Below 0.25 spoon-feeds the reader; above 0.90 breaks comprehension. [0.45, 0.82] maximizes reader participation.'),
    ] },
  { id: 'c1-02', level: 1, title: 'Six panel-to-panel transitions', terms: ['t1_moment', 't2_action', 't3_subject', 't5_aspect'], tags: ['mccloud'],
    scenario: 'You are adapting a tense kendo duel into a manga page and need to control psychological time.',
    steps: [
      s('To show a single fighter swinging from stance to strike with maximum narrative efficiency, which transition is used?', [['a', 'T2: Action-to-Action'], ['b', 'T5: Aspect-to-Aspect'], ['c', 'T6: Non-Sequitur']], 'a', '[[t2_action]] advances one subject through distinct physical action phases.'),
      s('Before the strike, you cut across 3 silent panels: rain dripping off the dojo roof, a cicada on bark, and dust in a sunbeam. Which transition is this?', [['a', 'T5: Aspect-to-Aspect'], ['b', 'T1: Moment-to-Moment'], ['c', 'T4: Scene-to-Scene']], 'a', '[[t5_aspect]] freezes time while a wandering eye samples the mood of a space—accounting for 12–18% of Japanese manga.'),
      s('You then show 3 panels of the fighter’s pupil slowly dilating over 0.3 seconds. Which transition is this?', [['a', 'T1: Moment-to-Moment'], ['b', 'T3: Subject-to-Subject'], ['c', 'T4: Scene-to-Scene']], 'a', '[[t1_moment]] slices one subject into sub-second increments to stretch suspense.'),
    ] },
  { id: 'c1-03', level: 1, title: 'East vs West transition priors', terms: ['t2_action', 't5_aspect', 'mf46_transition_harmony'], tags: ['mccloud'],
    scenario: 'In *Understanding Comics*, Scott McCloud compared panel transition histograms between mainstream American comics and Japanese manga.',
    steps: [
      s('Which transition is nearly absent (~0%) in traditional Western action comics but prominent (12–18%) in Japanese manga?', [['a', 'T5: Aspect-to-Aspect (wandering eye / Ma)'], ['b', 'T2: Action-to-Action'], ['c', 'T3: Subject-to-Subject']], 'a', 'Western comics prioritize goal-oriented [[t2_action]] (~65%), whereas manga invests heavily in [[t5_aspect]] to establish atmospheric presence.'),
      s('In JEV’s [[mf46_transition_harmony|MF46]], what happens when a lyrical slice-of-life beat uses 100% T2 Action-to-Action transitions?', [['a', 'It gets penalized for violating the genre’s transition prior'], ['b', 'It gets maximum bonus'], ['c', 'Transition types are ignored']], 'a', '[[mf46_transition_harmony]] aligns the transition distribution with the scene’s emotional and genre prior.'),
    ] },
  { id: 'c1-04', level: 1, title: 'The Big Triangle & iconic amplification', terms: ['big_triangle', 'iconic_amplification', 'mf50_iconic_contrast'], tags: ['mccloud'],
    scenario: 'You design a cyberpunk noir manga: the city alleys are drawn with intricate 3-point perspective and wet pipes, while the protagonist’s face uses clean, minimal iconic lines.',
    steps: [
      s('Why does pairing a simplified face with a hyper-detailed background work so powerfully?', [['a', 'The reader projects themselves into the iconic face while feeling physically grounded in the realistic world'], ['b', 'It saves ink on the background'], ['c', 'It hides bad perspective']], 'a', 'McCloud calls this [[iconic_amplification]] across the [[big_triangle]]: cartoon faces invite universal identification while realistic sets command sensory belief.'),
      s('Which JEV micro-factor quantifies this exact synergy?', [['a', 'MF50: Iconic Amplification Contrast'], ['b', 'MF12: Aperture Bokeh'], ['c', 'MF36: Balloon Truncation']], 'a', '[[mf50_iconic_contrast]] multiplies environmental realism weight by facial iconic clarity.'),
    ] },
  { id: 'c1-05', level: 1, title: 'Kill the Duospecific trap', terms: ['wp_duospecific', 'wp_interdependent', 'wp_parallel', 'mf38_contrapuntal_delta'], tags: ['mccloud'],
    scenario: 'A suspect sits in an interrogation room. His hand is visibly trembling as he spills coffee on his cuff.',
    steps: [
      s('Draft A gives him the line: "My hand is trembling and I just spilled my coffee!" What word-picture flaw is this?', [['a', 'Duospecific (redundant repetition of what the drawing already shows)'], ['b', 'Interdependent'], ['c', 'Montage']], 'a', '[[wp_duospecific]] treats words and pictures as echoes of each other, wasting narrative bandwidth.'),
      s('Draft B gives him a calm smile and the line: "I haven’t seen Captain Sato in five years." while the close-up shows his trembling cuff. What combination is this?', [['a', 'Interdependent / Contrapuntal (image exposes the lie under the calm words)'], ['b', 'Word-specific'], ['c', 'Duospecific']], 'a', '[[wp_interdependent]] and [[mf38_contrapuntal_delta]] reward high-tension counterpoint where image and text create a third meaning together.'),
    ] },
  { id: 'c1-06', level: 1, title: 'Seagulls & French Fries: Parallel & Non-Sequitur', terms: ['wp_parallel', 't6_non_sequitur', 'mf49_wp_interdependence'], tags: ['mccloud'],
    scenario: 'Two seagulls perch on a pier. Gull A delivers a solemn speech about cosmic determinism and the void. Gull B stares blankly—and the next panel cuts to a steaming basket of golden french fries.',
    steps: [
      s('Cutting from a cosmic philosophy speech to a hallucinated basket of french fries uses which transition?', [['a', 'T6: Non-Sequitur (surreal mental leap)'], ['b', 'T1: Moment-to-Moment'], ['c', 'T2: Action-to-Action']], 'a', '[[t6_non_sequitur]] juxtaposes logically unrelated images to detonate deadpan comedic or psychological contrast.'),
      s('While Gull A speaks of eternal truth, the visual track follows a dropped fry on the boardwalk. Which word-picture mode is this?', [['a', 'Parallel combination'], ['b', 'Duospecific'], ['c', 'Word-specific']], 'a', 'In [[wp_parallel]], words and pictures travel along separate tracks whose collision creates irony.'),
    ] },
  { id: 'c1-07', level: 1, title: 'Time equals space on the page', terms: ['time_as_space', 'bleed_timeless', 'mf51_time_space_width'], tags: ['mccloud'],
    scenario: 'You want Panel 3 (a character realizing they are alone in the snow) to feel like 6 seconds of heavy silence, while Panels 1–2 feel like rapid 0.5-second heartbeats.',
    steps: [
      s('How do you encode 6 seconds of duration into Panel 3 without adding text?', [['a', 'Make Panel 3 a wide horizontal panel with full border bleed and generous negative space'], ['b', 'Make Panel 3 a tiny narrow square'], ['c', 'Add 5 exclamation marks']], 'a', 'By [[time_as_space]], horizontal width and [[bleed_timeless]] expand perceived duration (`perceived_duration_sec`).'),
      s('How should Panels 1–2 be shaped to feel like rapid heartbeats?', [['a', 'Narrow vertical slivers with tight 2mm gutters'], ['b', 'Two full-page splashes'], ['c', 'Wide panoramas with 10mm gutters']], 'a', 'Narrow panels with tight gutters compress reading time and accelerate pulse.'),
    ] },
  { id: 'c1-08', level: 1, title: 'McCloud’s Five Choices', terms: ['five_choices', 'jev_five_pass_funnel', 'mf52_five_choices'], tags: ['mccloud'],
    scenario: 'In *Making Comics*, Scott McCloud distills all comic creation into Five Choices: Moment, Frame, Image, Word, and Flow.',
    steps: [
      s('Deciding *which* keyframe of a punch to show and *which* part to hide in the gutter is which choice?', [['a', 'Choice of Moment'], ['b', 'Choice of Word'], ['c', 'Choice of Lettering']], 'a', 'Choice of Moment determines the causal beats and gutter closure load (Pass 0 in [[jev_five_pass_funnel]]).'),
      s('Deciding camera distance, angle, polygon crop, and border bleed is which choice?', [['a', 'Choice of Frame'], ['b', 'Choice of Word'], ['c', 'Choice of Moment']], 'a', 'Choice of Frame governs spatial staging and optical framing (Pass 2 in [[jev_five_pass_funnel]]).'),
    ] },

  // ───────── LEVEL 2: Koma-wari & Eye Guidance
  { id: 'c2-01', level: 2, title: 'Koma hierarchy on a B4 page', terms: ['koma_hierarchy', 'key_panel_misegoma', 'kontorasuto'], tags: ['komawari'],
    scenario: 'A beginner divides a 6-panel manga page into 6 identical rectangles (each 16.6% of the page). The page feels flat and exhausting to read.',
    steps: [
      s('Why does an equal-area 6-grid fail in dramatic storytelling?', [['a', 'Without a dominant Misegoma (Key Panel), every beat shouts at the same volume and the eye has no focal climax'], ['b', '6 panels is too few'], ['c', 'Rectangles cannot hold speech balloons']], 'a', '[[koma_hierarchy]] requires one dominant [[key_panel_misegoma]] (35–50% of page area) contrasted with smaller setup/reaction panels.'),
      s('Pairing a dense 3-panel setup strip with a massive 45%-area silent key panel is an example of…', [['a', 'Kontorasuto (density & area contrast)'], ['b', 'Duospecificity'], ['c', '180° violation']], 'a', '[[kontorasuto]] creates rhythmic compression and release across strips.'),
    ] },
  { id: 'c2-02', level: 2, title: 'Right-to-Left Z-path & balloon anchors', terms: ['z_path_rtl', 'balloon_anchor_order', 'f11_gaze_vector'], tags: ['komawari'],
    scenario: 'In a traditional Japanese manga page (Right-to-Left), Panel 1 is at the top-right. Two characters exchange a question and an answer inside Panel 1.',
    steps: [
      s('Where must the first speaker’s Lead Balloon be placed inside Panel 1?', [['a', 'Upper-right corner of the panel'], ['b', 'Lower-left corner of the panel'], ['c', 'Dead center over both faces']], 'a', 'In [[z_path_rtl]], the reader’s eye enters at top-right, reads the upper-right Lead Balloon first, sweeps across the faces, and exits through the lower-left Follow Balloon.'),
      s('Which 2D character gaze vector `[dx, dy]` naturally propels the reader’s eye toward the next panel on the left/below?', [['a', '[-0.8, +0.4] (looking down and left)'], ['b', '[+0.9, -0.5] (looking up and right off-page)'], ['c', '[0, -1.0] (staring straight up)']], 'a', 'In [[f11_gaze_vector]], a bottom-left gaze `[-0.8, +0.4]` aligns with the R-to-L reading vector.'),
    ] },
  { id: 'c2-03', level: 2, title: 'Toriyama S-flow eye guidance', terms: ['s_flow_eye_track', 'z_path_rtl', 'f12_leading_lines'], tags: ['komawari'],
    scenario: 'A fighter dodges a laser in Strip 1 (top), lands on a cliff in Strip 2 (middle), and launches a counter-kick in Strip 3 (bottom).',
    steps: [
      s('How do you connect the motion across all 3 strips so the eye never stalls or zigzags backward?', [['a', 'Arrange the laser vector, landing dust arc, and kick trajectory into a continuous S-curve from top-right to bottom-left'], ['b', 'Have the fighter face right in every panel'], ['c', 'Put all speech balloons on the left edge only']], 'a', '[[s_flow_eye_track]] chains action vectors and balloons into a smooth S-shaped slalom down the page.'),
    ] },
  { id: 'c2-04', level: 2, title: 'Page-turn cliffhanger: Hiki & Mekuri', terms: ['hiki_cliffhanger', 'urasawa_cliffhanger', 'f14_temporal_progression'], tags: ['komawari'],
    scenario: 'In a print manga magazine, Page 15 (left-hand page in R-to-L layout) requires the reader to physically turn the leaf to see Page 16.',
    steps: [
      s('Which panel position on Page 15 is the Hiki (pull) slot where you plant the cliffhanger?', [['a', 'The bottom-left final panel of the page-turn page'], ['b', 'The top-right first panel'], ['c', 'The middle-right panel']], 'a', 'In R-to-L reading, the bottom-left panel is read last before the page turn—making it the [[hiki_cliffhanger]] slot.'),
      s('What should appear in that bottom-left Hiki panel for maximum page-turn pull?', [['a', 'The detective’s shocked face staring off-frame with a half-revealed shadow—saving the full monster reveal for Page 16’s splash'], ['b', 'The full monster reveal plus a 40-word explanation'], ['c', 'A calm establishing shot of the next day']], 'a', 'Plant the question/reaction in the Hiki panel (MF21/MF22) and detonate the full reveal on the Mekuri turn (MF23).'),
    ] },
  { id: 'c2-05', level: 2, title: 'Polygon knife slant & action trapezoids', terms: ['polygon_slant', 'f08_background_grid', 'tldraw_5d_geometry'], tags: ['komawari'],
    scenario: 'A calm courtroom testimony suddenly erupts when the witness draws a concealed blade.',
    steps: [
      s('How should your panel divider geometry shift at the moment the blade is drawn?', [['a', 'Shift from 0° orthogonal Seizen rectangles to a 14°–18° diagonal trapezoid slash with border bleed'], ['b', 'Keep 0° equal squares for the whole page'], ['c', 'Widen the gutter to 12mm']], 'a', '[[polygon_slant]] (`slant_deg: 14°–18°`) breaks visual equilibrium and injects kinetic shock.'),
    ] },
  { id: 'c2-06', level: 2, title: 'Inset sub-split reaction panel', terms: ['pip_inset_panel', 'f10_surrounding_chars', 'tldraw_5d_geometry'], tags: ['komawari'],
    scenario: 'During a high-speed sword clash (occupying 50% of the page), you also need to show the mentor’s eyes widening in recognition at the exact same instant.',
    steps: [
      s('What is the cleanest Koma-wari device to show both simultaneously without shrinking the main clash?', [['a', 'Overlay a compact Sub-split / Inset PiP panel of the mentor’s eyes across the corner of the main action panel'], ['b', 'Cut the main clash in half'], ['c', 'Add a footnote at the bottom of the page']], 'a', 'A [[pip_inset_panel]] (`pip_reaction_inset` in [[f10_surrounding_chars]]) preserves key-panel dominance while capturing synchronous reaction.'),
    ] },

  // ───────── LEVEL 3: Master Craft Techniques
  { id: 'c3-01', level: 3, title: 'Osamu Tezuka: Cinematic liberation', terms: ['tezuka_montage', 'bleed_timeless', 'wp_montage'], tags: ['masters'],
    scenario: 'Before 1947 (*New Treasure Island*), most Japanese comics were drawn like a fixed theater camera watching full-body actors from the front row.',
    steps: [
      s('How did Osamu Tezuka revolutionize manga staging in the opening car chase of *New Treasure Island*?', [['a', 'He broke a 3-second drive into cinematic close-ups of spinning wheels, POV road rush, and speed lines across multiple panels'], ['b', 'He wrote 500 words of prose underneath a single drawing'], ['c', 'He removed all panel borders']], 'a', '[[tezuka_montage]] imported cinema camera grammar, decompression, and dynamic frame-breaking into manga.'),
    ] },
  { id: 'c3-02', level: 3, title: 'Akira Toriyama: Silhouette & impact physics', terms: ['toriyama_impact', 's_flow_eye_track', 'f07_distortion', 'speed_lines'], tags: ['masters'],
    scenario: 'You are boarding a martial-arts climax inspired by Akira Toriyama (*Dragon Ball*). The hero delivers a decisive gut punch.',
    steps: [
      s('If you fill the character silhouettes completely with black ink (Silhouette Test), what must be true in a Toriyama-grade panel?', [['a', 'The line of action, limb extension, and impact vector remain 100% readable from the black silhouette alone'], ['b', 'Both fighters overlap into a single round blob'], ['c', 'Only the background buildings are visible']], 'a', '[[toriyama_impact]] relies on unmistakable pose silhouettes (`MF01`) and clear negative space around the point of contact.'),
      s('What background treatment does Toriyama use at the exact millisecond of apex impact (`apex_impact`)?', [['a', 'Drop the architectural background into a stark white void with radial focus bursts so 100% of contrast hits the impact point'], ['b', 'Draw every brick of the tournament wall behind the fist'], ['c', 'Fill the panel with 40% grey screentone']], 'a', 'Dropping background clutter (`speed_focus_void`) concentrates all visual energy on the strike.'),
    ] },
  { id: 'c3-03', level: 3, title: 'Takehiko Inoue: Silent Ma & decompression', terms: ['inoue_ma', 'silent_panel', 't1_moment', 'ecu_shot'], tags: ['masters'],
    scenario: 'Last 2 seconds of a championship basketball game (*Slam Dunk*, Sannoh match). Sakuragi releases a jump shot.',
    steps: [
      s('How does Takehiko Inoue stage the final 1.5 seconds of the ball’s flight?', [['a', 'Zero dialogue balloons across an entire sequence of pages—cutting between ECU eyes, full-body posture tension, and the ball entering the net'], ['b', 'Four commentators explaining the score in long text boxes'], ['c', 'A single small panel at the bottom of the page']], 'a', '[[inoue_ma]] strips away all sound (`silent_panel = true`) so the reader hears their own heartbeat in the gutter.'),
      s('Why does alternating an Extreme Close-Up (ECU) of sweating eyes with a Full Shot (FS) of the player’s arc work so well?', [['a', 'ECU locks onto internal resolve while FS releases physical kinetic grace in negative space'], ['b', 'It avoids drawing hands'], ['c', 'It keeps focal length constant']], 'a', 'Extreme scale contrast between [[ecu_shot]] (`135mm`) and Full Shot (`35mm`) creates emotional breathing room.'),
    ] },
  { id: 'c3-04', level: 3, title: 'Katsuhiro Otomo: Architectural deep focus', terms: ['otomo_perspective', 'f05_environment', 'optical_dof_fov', 'camera_angles_manga'], tags: ['masters'],
    scenario: 'In *AKIRA*, a psychic shockwave cracks a Neo-Tokyo highway viaduct while tiny figures scramble below.',
    steps: [
      s('Which optical and perspective combination captures Katsuhiro Otomo’s signature spatial gravity?', [['a', '3-point bird’s-eye / worm’s-eye architectural perspective with deep focus (f/11–f/16) so every concrete rebar and distant tower is razor-sharp'], ['b', '85mm portrait lens at f/1.4 with a blank white background'], ['c', 'Flat 1-point eye-level medium shot']], 'a', '[[otomo_perspective]] combines wide-angle 3-point perspective with deep focus (`dof_blur_pct < 10%`) to make the environment an overwhelming physical character.'),
    ] },
  { id: 'c3-05', level: 3, title: 'Naoki Urasawa: Subtext & conversational thriller', terms: ['urasawa_cliffhanger', 'subtext_contrast', 'hiki_cliffhanger', 't3_subject'], tags: ['masters'],
    scenario: 'In a *Monster*-style thriller, two polite doctors drink tea. One of them poisoned the sugar bowl 3 minutes ago.',
    steps: [
      s('How would Naoki Urasawa pace this conversation across the page?', [['a', 'Use restrained eye-level T3 Subject-to-Subject cuts, an 85mm INSERT of the sugar spoon, a subtle Subtext Mask smirk, and a bottom-left Hiki line that freezes the blood'], ['b', 'Use 22° diagonal action panels and jagged shout balloons on every line'], ['c', 'Put all dialogue in a single wide panel']], 'a', '[[urasawa_cliffhanger]] builds dread through calm geometric discipline punctuated by micro-acting (`subtext_contrast`) and a lethal [[hiki_cliffhanger]].'),
    ] },

  // ───────── LEVEL 4: Camera, Optics & Tone
  { id: 'c4-01', level: 4, title: '10-step shot scale & optical focal length', terms: ['shot_scale_10', 'optical_dof_fov', 'f03_shot_type', 'tldraw_optical_lab'], tags: ['camera_opt'],
    scenario: 'In `tldraw-manga` Stage 4 (Optical Camera Lab), you set a 35mm full-frame virtual camera (`36×24mm` sensor) to `f = 18mm`, `f/11`, distance `15m`.',
    steps: [
      s('What horizontal Field of View (FOV) and Shot Scale does `f = 18mm` at `15m` produce?', [['a', 'FOV ≈ 90° · Extreme Wide Shot (EWS) with deep focus'], ['b', 'FOV ≈ 12° · Extreme Close-Up (ECU) with heavy bokeh'], ['c', 'FOV ≈ 40° · Medium Close-Up (MCU)']], 'a', 'By `FOV = 2·arctan(18/18) = 90°`, an 18mm lens at 15m yields an [[ews_shot]] with full architectural depth.'),
      s('You now switch to `f = 105mm`, `f/1.4`, distance `0.9m` on the detective’s face. What changes?', [['a', 'FOV narrows to ~19° (Close-Up CU) and background blur rises to ~80%'], ['b', 'FOV widens to 110°'], ['c', 'Background becomes sharper']], 'a', 'Long focal length + wide `f/1.4` aperture isolates the face in a [[ecu_shot|CU]] with shallow depth of field.'),
    ] },
  { id: 'c4-02', level: 4, title: 'Seven camera angles & Dutch tilt', terms: ['camera_angles_manga', 'f01_camera_angle', 'f07_distortion'], tags: ['camera_opt'],
    scenario: 'A detective realizes the chief of police is the mastermind. The room suddenly feels unstable.',
    steps: [
      s('Which F01 camera angle best externalizes this sudden psychological vertigo?', [['a', 'dutch_tilt (roll tilt ±15° combined with a slight low angle on the chief)'], ['b', 'eye_level (0° pitch, 0° roll)'], ['c', 'overhead_flat (90° top-down)']], 'a', 'In [[camera_angles_manga]], `dutch_tilt` tilts the horizon (`roll_tilt_deg: ±15°`) to signal mental disorientation or betrayal.'),
    ] },
  { id: 'c4-03', level: 4, title: '180° axis & deliberate line crossing', terms: ['axis_180_manga', 'f13_alignment_comp', 't3_subject'], tags: ['camera_opt'],
    scenario: 'Detective Lin stands on the right (`screen-right`, looking left); Suspect Kurosawa sits on the left (`screen-left`, looking right). For 5 panels, you obey the 180° line.',
    steps: [
      s('On Panel 6, Kurosawa turns the tables and traps Lin with an alibi. When is `axis_180_override = true` justified?', [['a', 'Right at the power reversal beat—crossing the 180° axis flips their left/right screen positions to visually jolt the reader'], ['b', 'Randomly on every panel'], ['c', 'Never under any circumstance']], 'a', '[[axis_180_manga]] keeps the axis stable during normal dialogue, then uses a controlled line cross at the exact beat of power inversion.'),
    ] },
  { id: 'c4-04', level: 4, title: 'Screentones, Beta ink & lighting styles', terms: ['screentone_beta', 'rembrandt_noir', 'f06_lighting_shadow'], tags: ['acting_tone'],
    scenario: 'You are lighting a rain-soaked interrogation room in JEV Factor `F06 (lighting_shadow)`.',
    steps: [
      s('To show a morally split character—half of his face illuminated, the other half submerged in shadow with a single triangle of light on the cheek—which F06 mode do you select?', [['a', 'rembrandt_side (45–65% screentone/shadow weight)'], ['b', 'high_key_clean (10% tone)'], ['c', 'under_lighting_eerie']], 'a', '[[rembrandt_noir]] uses `rembrandt_side` or `noir_chiaroscuro` (solid black Beta + Kakeami hatching) to externalize moral duality.'),
    ] },
  { id: 'c4-05', level: 4, title: 'Balloons, dual truncation & SFX', terms: ['balloon_anchor_order', 'sfx_onomatopoeia', 'f09_auxiliary_text'], tags: ['acting_tone'],
    scenario: 'A character has a 52-character speech in a single medium close-up panel.',
    steps: [
      s('Why does JEV Factor `F14` enforce `info_release_budget ≤ 35 chars` and `F09` split long lines into `lead_balloon` + `follow_balloon`?', [['a', 'A single giant wall-of-text balloon crushes the artwork and stalls eye flow; splitting into top-right Lead and bottom-left Follow guides the eye across the character’s face'], ['b', 'Manga printers cannot print more than 35 characters'], ['c', 'Thought balloons only hold 10 characters']], 'a', '[[balloon_anchor_order]] sandwiches the character’s expression between the top-right Lead Balloon and bottom-left Follow Balloon.'),
      s('When a panel is completely silent (`silent_panel = true`), how can Japanese manga still "draw" the sound of dead silence?', [['a', 'Using a Gitaigo psychological SFX like 「シーン…」 (Shīn) or leaving pure negative space'], ['b', 'Adding a loud jagged shout balloon'], ['c', 'Adding an electronic polyline box']], 'a', '[[sfx_onomatopoeia]] includes Gitaigo (擬態語) that visualize silence, tension (`ゴゴゴ`), or a cold stare (`ジーッ`).'),
    ] },

  // ───────── LEVEL 5: JEV Two-Tier Architecture
  { id: 'c5-01', level: 5, title: 'Why System 2 + System 1 hybrid?', terms: ['jev_two_tier', 'jev_systemone_api', 'jev_five_pass_funnel'], tags: ['jev_arch'],
    scenario: 'A developer asks: "Why not just call `/v1/systemone` (Clef) directly on the raw script without a high-knowledge LLM compiler?"',
    steps: [
      s('What is the core limitation of the lightweight System 1 (`/v1/systemone`) endpoint on its own?', [['a', 'It is an ultra-fast probabilistic discriminator over atomic JSON primitives, not an encyclopedic art theorist—it needs System 2 to compile McCloud/manga theory into explicit micro-factors and weights first'], ['b', 'It takes 10 minutes per call'], ['c', 'It can only output PNG images']], 'a', 'In [[jev_two_tier]], System 2 (high-knowledge LLM) compiles theory and candidates, while System 1 (`/v1/systemone`) executes millisecond multi-round tournament ranking.'),
      s('Conversely, why not let a giant LLM do one-shot greedy generation without JEV System 1 polling?', [['a', 'One-shot LLM generation suffers from factor omission, cross-panel drift, and uncalibrated probabilities across 10^20 combinations'], ['b', 'LLMs cannot read Chinese'], ['c', 'LLMs cannot output JSON']], 'a', 'The [[jev_five_pass_funnel]] guarantees monotonic utility ascent `U(S^(0)) ≤ ... ≤ U(S*)` and zero cross-panel defects.'),
    ] },
  { id: 'c5-02', level: 5, title: 'The three `/v1/systemone` primitives', terms: ['jev_systemone_api', 'op_decompose_horizon'], tags: ['jev_arch'],
    scenario: 'You are compiling JEV Factor `F08 (background_grid)` and `F09 (auxiliary_text)` into `/v1/systemone` questions.',
    steps: [
      s('Which primitive type do you use to decide whether a panel should be a Silent Panel (`silent_panel`) or trigger a border bleed (`bleed_trigger`)?', [['a', 'type: "noul" (binary gate returning P(yes) ∈ [0,1])'], ['b', 'type: "choice" with 20 options'], ['c', 'type: "free_text"']], 'a', 'In [[jev_systemone_api]], `noul` is the binary probability gate (`P(yes) >= 0.5`).'),
      s('Why must every `/v1/systemone` question include `"alone": true`?', [['a', 'To isolate each micro-decision from cross-question contamination so every factor is scored orthogonally against the state'], ['b', 'To run on a single CPU core'], ['c', 'To disable caching']], 'a', '[[op_decompose_horizon]] enforces `"alone": true` so `p0.*` probabilities remain independent and composable.'),
    ] },
  { id: 'c5-03', level: 5, title: 'The Five Universal Operators', terms: ['jev_five_operators', 'op_decompose_horizon', 'op_weight_joint_degrade'], tags: ['jev_arch'],
    scenario: 'Trace how a raw story beat passes through the 5 Universal JEV Operators (`Decompose`, `Horizon`, `Weight`, `Sort & Joint`, `Degrade`).',
    steps: [
      s('Which operator injects `[Immediate Micro-History: p_{i-2}, p_{i-1}]` and `[Page Arc Position: Panel 5/6]` into the `state` string?', [['a', 'Operator 2: Horizon (External Temporal Horizon)'], ['b', 'Operator 1: Decompose'], ['c', 'Operator 5: Degrade']], 'a', '[[op_decompose_horizon]] prevents stateless myopia (like repeating the same close-up 3 times in a row).'),
      s('In an Action Climax beat, F08 (Slant/Bleed) and F07 (Distortion) weights jump to `0.95`, while in a Suspense Dialogue beat, F04 (Subtext) and F11 (Gaze) jump to `0.95`. Which operator is this?', [['a', 'Operator 3: Weight (Scene-Adaptive Dynamic Weighting)'], ['b', 'Operator 4: Sort & Joint'], ['c', 'Operator 1: Decompose']], 'a', '[[op_weight_joint_degrade]] shifts the 14-factor weight vector `w(C)` dynamically based on the active scene archetype.'),
    ] },
  { id: 'c5-04', level: 5, title: 'Shannon entropy & rank flips', terms: ['shannon_entropy_gate', 'kendall_tau_flip', 'latent_factor_discovery'], tags: ['jev_arch'],
    scenario: 'During a 5-pass polling run on "Rainy Night Interrogation", Pass 0 starts with Shannon entropy `H_0 = 2.48` across 12 candidates.',
    steps: [
      s('What should happen to Shannon entropy `H_t` as the funnel progresses from Pass 0 (`|K|=12`) to Pass 4 (`|K|=1`)?', [['a', 'It should decrease monotonically (e.g. 2.48 → 1.71 → 1.24 → 0.58 → 0.24) as inferior candidates are pruned'], ['b', 'It should increase toward infinity'], ['c', 'It stays constant at 2.48']], 'a', '[[shannon_entropy_gate]] tracks uncertainty reduction; an entropy plateau signals missing conditions or latent factors.'),
      s('When activating `cond_clue_insert_magnification` flips Candidate #7 from rank 8 in Pass 0 to rank 1 in Pass 2, which metric measures this reorder power?', [['a', 'Kendall-τ rank flip distance (δ_c)'], ['b', 'Aperture f-stop'], ['c', 'Gutter width']], 'a', '[[kendall_tau_flip]] quantifies how strongly a Condition Guard reshapes the decision landscape.'),
    ] },

  // ───────── LEVEL 6: JEV 14 Factors & 5-Pass Polling
  { id: 'c6-01', level: 6, title: 'Mapping the 14 Storyboard Factors (F01–F14)', terms: ['f01_camera_angle', 'f02_character_details', 'f04_facial_expression', 'f08_background_grid'], tags: ['jev_factors'],
    scenario: 'A storyboard beat reads: "Detective Lin notices the cracked pocket watch on the table; his eyes narrow in cold suspicion while his posture stays still."',
    steps: [
      s('Which JEV factor encodes `action_phase = micro_gesture`, `posture_tension = 2`, and `prop_interaction = cracked pocket watch`?', [['a', 'F02: Character & Task Details (character_details)'], ['b', 'F06: Lighting & Screentone'], ['c', 'F12: Visual Leading Lines']], 'a', '[[f02_character_details]] tracks physical action phase, posture tension, and key task props.'),
      s('Which JEV factor encodes `expression_archetype = suspicion_narrowed` and `subtext_contrast = true`?', [['a', 'F04: Facial Expression (facial_expression)'], ['b', 'F01: Camera Angle'], ['c', 'F08: Background Grid']], 'a', '[[f04_facial_expression]] models primary emotion, brow/pupil detail, and the subtext mask gate.'),
    ] },
  { id: 'c6-02', level: 6, title: 'Inside the 5-Pass Polling Funnel', terms: ['jev_five_pass_funnel', 'adversarial_audit', 'mf38_contrapuntal_delta'], tags: ['jev_factors'],
    scenario: 'You run the 5-Pass Condition-Driven Polling Engine (`|K_0|=12 → |K_1|=6 → |K_2|=4 → |K_3|=2 → |K_4|=1`).',
    steps: [
      s('In Pass 1 (`|K_0|=12 → |K_1|=6`), why does the engine use a Determinantal Point Process (DPP) macro sieve on D4 (Koma-wari) and D8 (Ma)?', [['a', 'To quickly eliminate half the candidates with bad pacing/layout while preserving structural diversity among the 6 survivors'], ['b', 'To render final PNGs for all 12 candidates'], ['c', 'To delete all silent panels']], 'a', 'Pass 1 in [[jev_five_pass_funnel]] prunes macro rhythm flaws while keeping diverse spatial skeletons alive for Pass 2.'),
      s('What happens in Pass 3 (`|K_2|=4 → |K_3|=2`)?', [['a', 'Contrapuntal & Eyeline Refinement: tests D1 micro-acting, F11 gaze chains, and MF38/MF49 word-picture non-redundancy'], ['b', 'Exporting to .ora'], ['c', 'Generating 12 new candidates']], 'a', 'Pass 3 locks in [[mf38_contrapuntal_delta]] so text never duplicates the image.'),
    ] },
  { id: 'c6-03', level: 6, title: 'Pass 4 Adversarial Audit & Coordinate Ascent', terms: ['adversarial_audit', 'shot_scale_10', 'hiki_cliffhanger', 'silent_panel'], tags: ['jev_factors'],
    scenario: 'In Pass 4, the Global Adversary scans all 5 panels of the page before final lock.',
    steps: [
      s('Panels 1, 2, and 3 all resolved to `MS (50mm)` at `eye_level (0°)`. Which adversarial defect triggers?', [['a', 'adv_01_shot_monotony_risk (consecutive identical shot scale & angle)'], ['b', 'adv_02_dialogue_bloating_in_aftermath'], ['c', 'adv_03_weak_page_turn_hook']], 'a', '[[adversarial_audit]] flags `adv_01_shot_monotony_risk` whenever adjacent panels repeat the same optical setup.'),
      s('Beat 4 is marked as a silent aftermath beat (`cond_ma_silent_void`), but the candidate still carries a 28-character speech bubble. Which defect triggers?', [['a', 'adv_02_dialogue_bloating_in_aftermath (forces silent_panel = true and widens gutter to 7.5mm)'], ['b', 'adv_01_shot_monotony_risk'], ['c', 'None']], 'a', 'The adversary strips the redundant text so the [[silent_panel]] Ma beat can breathe.'),
    ] },
  { id: 'c6-04', level: 6, title: 'Latent Micro-Factor Discovery (MF40–MF42)', terms: ['latent_factor_discovery', 'pip_inset_panel', 'sfx_onomatopoeia'], tags: ['jev_factors'],
    scenario: 'During polling research on "Rainy Night Interrogation", two candidates tie on MF01–MF39, yet one wins decisively in Swiss pairwise tournaments.',
    steps: [
      s('What three latent micro-factors (`MF40–MF42`) did the JEV research loop discover from that residual?', [['a', 'MF40 Specular prop reflection angle, MF41 Off-screen acoustic source vector, and MF42 PiP sub-split reaction latency'], ['b', 'RGB color gamut, frame rate, and audio bitrate'], ['c', 'Strike price, delta, and theta']], 'a', '[[latent_factor_discovery]] extracts new orthogonal micro-factors when tournament winners outperform their existing 39-factor projection.'),
    ] },

  // ───────── LEVEL 7: tldraw-manga Studio Engineering
  { id: 'c7-01', level: 7, title: '3-tier polygon container architecture', terms: ['tldraw_3tier', 'tldraw_5d_geometry', 'f08_background_grid'], tags: ['tldraw_studio'],
    scenario: 'You inspect the canvas state of `jstdlee/tldraw-manga` on a standard B4 page (`740 × 1046 px`).',
    steps: [
      s('How does `tldraw-manga` represent a manga page’s geometry so diagonal cuts never leave ugly crooked gaps?', [['a', 'A 3-tier hierarchy: Page Frame (740×1046) → Horizontal Strips (Rows) → 4-vertex Polygon Panels [tl, tr, br, bl] with per-edge bleed flags {bT, bB, bL, bR}'], ['b', 'Independent rotated rectangles that overlap randomly'], ['c', 'A flat bitmap JPEG']], 'a', '[[tldraw_3tier]] computes shared diagonal knife-cut vertices across adjacent panels in a Strip so gutters stay uniform.'),
    ] },
  { id: 'c7-02', level: 7, title: '5-Stage progressive storyboard workflow', terms: ['tldraw_5stage', 'tldraw_presets', 'tldraw_stage3_script', 'tldraw_optical_lab'], tags: ['tldraw_studio'],
    scenario: 'In `tldraw-manga`, the top progress bar guides the creator through 5 progressive stages (`1. 设定卡 → 2. 版式台 → 3. 分镜台词 → 4. 镜头构图 → 5. 模型节点`).',
    steps: [
      s('Why does `tldraw-manga` separate Stage 2 (Layout Desk / 版式台) from Stage 4 (Camera & Framing / 镜头构图)?', [['a', 'To solve macro page rhythm (Strip weights, Slant, Bleed, Big Weight) first before dialing in micro optical parameters (focal length, aperture, 3-layer depth) inside each panel'], ['b', 'Because Stage 2 only works on mobile'], ['c', 'Because Stage 4 deletes all panels']], 'a', '[[tldraw_5stage]] mirrors professional editorial practice and JEV’s Pass 1 (macro layout) → Pass 2/3 (optical & acting) hierarchy.'),
    ] },
  { id: 'c7-03', level: 7, title: '6-Axis Editor Score (`layoutScore`) & prescriptions', terms: ['tldraw_layout_score', 'tldraw_5d_geometry', 'kontorasuto'], tags: ['tldraw_studio'],
    scenario: 'In Stage 2 of `tldraw-manga`, the live Editor Score (`layoutScore`) shows: Flow 88, Hierarchy 42, Rhythm 50, Breath 78, Tension 45, Variety 55.',
    steps: [
      s('Which two axes are dragging the page down, and which 1-click prescription fixes them?', [['a', 'Hierarchy (42) and Tension (45) are too low—boost Big Weight (大格权重 → 2) and enable Bleed (出血破框 → 1–2) on the climax panel'], ['b', 'Flow is too high—make all panels equal squares'], ['c', 'Delete all gutters']], 'a', '[[tldraw_layout_score]] diagnoses flat hierarchy and low tension, offering 1-click executable prescriptions (`applyFix`) that adjust [[tldraw_5d_geometry]].'),
      s('How does the "Smart Search Best Layout" (`智能搜索最优分镜`) button find the top layout?', [['a', 'It evaluates 36 seed combinations across the 4 presets and 5D geometry space, ranking them by the 6-axis layoutScore'], ['b', 'It picks a random number'], ['c', 'It asks the user to draw by hand']], 'a', 'The 36-seed search in [[tldraw_layout_score]] scans the preset × parameter space and locks the highest-scoring geometry.'),
    ] },
  { id: 'c7-04', level: 7, title: '5-Layer OpenRaster (`.ora`) & 4-Mode HTML Export', terms: ['tldraw_ora_export', 'tldraw_3tier', 'tldraw_5stage'], tags: ['tldraw_studio'],
    scenario: 'Your storyboard in `tldraw-manga` is locked and ready to hand off to an inking assistant using Krita / Clip Studio Paint and an editorial director reviewing in a browser.',
    steps: [
      s('What does the OpenRaster (`.ora`) export generate?', [['a', 'A non-destructive 5-layer ZIP archive: 01 Text & Balloons, 02 Panel Borders, 03 Sketches, 04 Gutter Mask, and 05 Paper Base (`stack.xml` + PNG layers)'], ['b', 'A single flattened 72dpi GIF'], ['c', 'An audio MP3 file']], 'a', '[[tldraw_ora_export]] packs a standard 5-layer OpenRaster archive so inkers can toggle balloons, borders, and gutter masks independently.'),
      s('What are the 4 modes included in the interactive HTML export?', [['a', 'Clean Page (纯净画面), Storyboard Table (分镜表), Overview Sheet (总览单), and Full Spec (完整版)'], ['b', 'Only raw JSON'], ['c', 'Video MP4 only']], 'a', 'The 4-mode HTML export serves readers, directors, editors, and downstream AI pipelines from one self-contained file.'),
    ] },
]
