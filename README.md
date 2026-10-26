# Sim4It · 交互式专业决策与知识图谱训练场

**Sim4It** 是将 `sim4options`（期权决策实战）、`sim4director`（导演调度与视听语言）、以及全新构建的 `sim4comics`（漫画分镜、大师技法、JEV 14维切分与 `tldraw-manga` 工程架构）统一整合后的多学科交互式训练平台。

## 架构设计：可扩展多领域知识注册表 (`src/domains/registry.ts`)

首页 (`/`) 采用统一的 **Sim4It Landing Page** 门户设计，所有学科领域共享同一套温暖纸墨视觉规范（Paper & Ink Editorial Aesthetic：`--ink: #fffbf2`, `--edge: #1a1712`, `--fox: #ff5a1f`, `--teal: #0e8c83`）与五大核心学习引擎：

1. **闯关路径 (`/journey` & `/quest/:level/:i`)**：按难度分级的多步情景推演题库，支持即时解析、术语内联高亮与进度追踪。
2. **知识卡片 (`/cards`)**：多语言（中 / EN / 日）分类闪卡，涵盖核心定义、为什么重要（Why）、实战案例（Example）、易错盲区（Pitfall）与延伸阅读。
3. **术语星图 (`/map`)**：按模块聚类展示核心概念及前后置关联（Related Concepts）。
4. **实战案例库 (`/cases`, `/moments`, `/scenes`)**：真实市场时刻（Market Moments）、电影分镜阻塞案例（Virtual Scenes）与漫画工作室分镜重构工程（Storyboard Cases）。
5. **交互实验室 (`/lab`)**：
   - **Sim4Options**：Black-Scholes 期权定价与 Greeks / 损益曲线仿真器
   - **Sim4Director**：虚拟片场镜头光学、构图网格、三点布光与希区柯克变焦推演台
   - **Sim4Comics**：`tldraw-manga` 三层容器分镜布局台 + 6轴编辑评分 + 光学景深与对白气泡实验台 + `JEV Decision` 14维自动切分与5-Pass漏斗模拟器

---

## 三大已上线领域 (Active Domains)

| 领域 ID | 名称 | 导师 | 等级数 | 交互题库 | 专业卡片 | 实战案例 | 核心内容来源 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `options` | **Sim4Options · 期权与波动率交易** | Kiko (狐狸交易员) | 7 级 | 420 题 | 130 张 | 100 个真实市场时刻 + 《交易入道》手册 (`/rudao`) | Black-Scholes、Greeks、偏度与曲面、波动率套利、0DTE 实战 |
| `director` | **Sim4Director · 导演调度与视听语言** | Hikari (星野光) | 8 级 | 570 题 | 341 张 | 102 个片场分镜场景 + 18 套造型工坊 (`/gallery`) | 焦段光学、180°轴线、场面调度、蒙太奇、三点布光、AI 视频/3D 管线 |
| `comics` | **Sim4Comics · 漫画分镜与大师技法** | Sensei Sumi (墨老师) | 7 级 | 420 题 | 62 张 | 6 个多阶段分镜工程案例 | Scott McCloud 理论、漫画大师技法（手塚/鸟山明/井上雄彦/大友克洋/浦泽直树）、`jev-decision` 14维自动切分与52微因子、`tldraw-manga` 三层多边形容器与 `.ora` 工程工作流 |

---

## 如何新增下一个 `Sim4*` 知识库？

只需两步即可接入新的学科领域（如 `Sim4Sound`、`Sim4GameDesign`、`Sim4Macro`）：
1. 在 `content/<domain>/` 下创建标准知识包（`questions.ts`, `terms.ts`, `scenes.ts`, `sources.ts`, `character.ts`）并在 `shared/generator-<domain>.ts` 中配置练习变体生成器。
2. 在 `src/domains/registry.ts` 的 `DOMAINS` 注册表中登记该领域的元信息与数据引用，Landing Page、顶部领域切换器、闯关地图、闪卡、星图与 AI 导师将自动完成适配。

---

## 本地开发与构建

```bash
# 校验三大领域的题库、术语卡片与案例完整性
npm run check:content

# 类型检查与生产构建
npm run typecheck
npm run build

# 启动本地开发服务器
npm run dev
```
