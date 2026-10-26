// Authoritative sources & tools for Sim4Comics (Comics Quest).
export const SOURCES: { group: string; links: { name: string; url: string; note?: string }[] }[] = [
  { group: "Scott McCloud Trilogy · 麦克劳德漫画三部曲", links: [
    { name: "Understanding Comics: The Invisible Art (1993) · 《理解漫画》", url: "https://scottmccloud.com/2-print/1-uc/" },
    { name: "Reinventing Comics (2000) · 《重塑漫画》", url: "https://scottmccloud.com/2-print/2-rc/" },
    { name: "Making Comics (2006) · 《制作漫画》", url: "https://scottmccloud.com/2-print/3-mc/" },
    { name: "JEV Docs 05 · Scott McCloud Trilogy & 9-Domain 52-Factor Integration", url: "https://github.com/jstdlee/jev-decision/blob/main/docs/05-scott-mccloud-trilogy-integration.md" },
  ] },
  { group: "Manga Master Craft · 漫画大师分镜与格割技法", links: [
    { name: "Osamu Tezuka – How to Draw Manga (手塚治虫 漫画の描き方)", url: "https://tezukaosamu.net/" },
    { name: "Akira Toriyama – Dr. Slump & Dragon Ball Hetappi Manga Kenkyujo (鳥山明のヘタッピマンガ研究所)", url: "https://en.wikipedia.org/wiki/Akira_Toriyama%27s_Hetappi_Manga_Kenky%C5%ABjo" },
    { name: "Takehiko Inoue – Vagabond / Slam Dunk Silent Pacing & Ma (井上雄彦の間と視線)", url: "https://itplanning.co.jp/" },
    { name: "Katsuhiro Otomo – AKIRA Storyboards & Architectural Perspective (大友克洋 アキラ絵コンテ)", url: "https://en.wikipedia.org/wiki/Akira_(1988_film)" },
    { name: "Naoki Urasawa – Manben Documentary on Manga Technique (浦沢直樹の漫勉)", url: "https://www.nhk.or.jp/manben/" },
    { name: "Hirohiko Araki – Manga in Theory and Practice (荒木飛呂彦の漫画術)", url: "https://en.wikipedia.org/wiki/Manga_in_Theory_and_Practice" },
  ] },
  { group: "JEV Decision Methodology · JEV 双层分镜自动切分架构", links: [
    { name: "jstdlee/jev-decision – Repository & Architecture Overview", url: "https://github.com/jstdlee/jev-decision" },
    { name: "JEV Docs 01 · System 2 Meta-Compiler + System 1 (/v1/systemone) Runtime", url: "https://github.com/jstdlee/jev-decision/blob/main/docs/01-jev-decision-methodology.md" },
    { name: "JEV Docs 02 · 14-Factor Storyboard Auto-Segmentation Specification (F01–F14)", url: "https://github.com/jstdlee/jev-decision/blob/main/docs/02-storyboard-14-factors.md" },
    { name: "JEV Docs 04 · 5-Pass Iterative Polling & Progressive Funnel Convergence", url: "https://github.com/jstdlee/jev-decision/blob/main/docs/04-iterative-polling-convergence.md" },
  ] },
  { group: "tldraw-manga Studio & Open Standards · 分镜工程与开源工具", links: [
    { name: "jstdlee/tldraw-manga – 5-Stage Progressive Manga Storyboard Studio", url: "https://github.com/jstdlee/tldraw-manga" },
    { name: "tldraw SDK – Infinite Canvas & Custom Shape Primitives", url: "https://tldraw.dev/" },
    { name: "OpenRaster (.ora) Specification – Multi-Layer Interchange for Krita / GIMP / Paint", url: "https://www.openraster.org/" },
    { name: "Clip Studio Paint – Koma-wari Frame Border & Screentone Reference", url: "https://www.clipstudio.net/en/" },
  ] },
]

// Advanced topics outside the main deck to ask the AI Tutor or explore next.
export const EXPLORE: string[] = [
  "Webtoon vertical scroll pacing vs B4 page-turn Mekuri (条漫纵向滚动留白 vs 页漫翻页悬念)",
  "MF40 Specular prop reflection angle (证物/镜面高光反射视线耦合角)",
  "MF41 Off-screen acoustic source vector (画外音源空间指向矢量)",
  "MF42 PiP sub-split reaction latency (画中画子格同步微反应时差)",
  "Kakeami (カケアミ) cross-hatching psychological density",
  "Beta flash (ベタフラッシュ) & Uni-flash (ウニフラ) emotional bursts",
  "Determinantal Point Process (DPP) diversity kernel in Pass 1 sieve",
  "Kendall-tau rank flip metric in Condition-Driven Polling",
  "Shapley ablation for Condition × Micro-Factor coupling matrix Θ",
  "Bande Dessinée clear line (Ligne claire · 丁丁清晰线派) vs Gekiga (劇画)",
  "Fujimoto Tatsuki cinematic fixed-camera deadpan repetition (藤本树固定机位冷面重复)",
  "Two-page spread (見開き Mihiraki) gutter safety zone & binding loss",
]
