export interface SourceLink {
  label: string;
  url: string;
  type: "tweet" | "blog" | "tool" | "video";
}

export interface LearningCard {
  id: string;
  track: "concepts" | "rudao" | "sop" | "peers";
  category: string;
  termZh: string;
  termEn: string;
  level: string;
  order: number;
  summary: string;
  plainExplanation: string;
  jesseApplication: string;
  formulaOrCode: string;
  checklist: string[];
  pitfalls: string;
  sourceUrls: SourceLink[];
}

export const LEARNING_CARDS: LearningCard[] = [
  {
    "id": "concept-pip-lot-leverage",
    "track": "concepts",
    "category": "数理地基与风控术语",
    "termZh": "点值（Pip）· 标准手（Lot）· 杠杆分蛋篮子",
    "termEn": "Pip / Standard Lot / Leverage as Multi-Basket",
    "level": "入门必学",
    "order": 1,
    "summary": "外汇报价最小核心变动单位与仓位换算公式；打破『杠杆=放大赌注』的散户误区，将杠杆用作同时配置多品种正交策略的『分蛋篮子』。",
    "plainExplanation": "在外汇市场中，绝大多数货币对（如 EUR/USD = 1.0850）小数点后第 4 位变动 1 个单位称为 **1 Pip（1个标准点）**；日元货币对（如 USD/JPY = 152.30）则是小数点后第 2 位变动 1 个单位为 1 Pip。**1 标准手（1.00 Lot）**代表 100,000 基础货币单位，在直盘中每波动 1 Pip 约等于 **$10 美金**（0.1 手 = $1/点，0.01 微型手 = $0.1/点）。",
    "jesseApplication": "遁一子在推文 #1636095370525818880 中指出：**『玩杠杆有点像黄易小说里的道心种魔大法。大多数人不知道杠杆的玩法，直接当放大器用了，这样 2 倍杠杆也十分危险。杠杆的正确运用：应作为分蛋的篮子，提供资金占用空间去同时投机足够多的品种和不同策略，以平滑并延缓最大回撤（Drawdown）曲线。』**",
    "formulaOrCode": "手数 (Lots) = (账户本金 × 单笔风险比例 Risk%) ÷ (止损点数 SL_Pips × 每点价值 Pip_Value)\n例：$10,000 账户，单笔风险 0.5% ($50)，止损 25 Pips → 应开仓位 = $50 ÷ (25 × $10) = 0.20 标准手（若五路分兵，则每路 0.04 手）。",
    "checklist": [
      "下单前先定止损点数（SL Pips），再反推手数，绝不拍脑袋固定开 1 手",
      "检查保证金占用率：用高杠杆节省出来的可用保证金，分配给低相关性的其他策略/货币对，而非在单一品种上满仓豪赌",
      "五路分兵时，确保账户最小手数支持拆分为 5 份（如总仓位 0.05 手 = 5 × 0.01 手）"
    ],
    "pitfalls": "新手最常犯的致命错误是把 100 倍、500 倍杠杆当成『可以用 1000 美金满仓干 5 手』的赌具，只要反向波动 20 点（0.2%）就直接爆仓出局。",
    "sourceUrls": [
      {
        "label": "推文：玩杠杆如道心种魔，杠杆应作分蛋篮子",
        "url": "https://x.com/jesselaunz/status/1636095370525818880",
        "type": "tweet"
      },
      {
        "label": "博客：《交易入道》大纲",
        "url": "https://jesselau.com/rudao/",
        "type": "blog"
      }
    ]
  },
  {
    "id": "concept-expectancy-moon",
    "track": "concepts",
    "category": "数理地基与风控术语",
    "termZh": "数学期望收益（Expectancy）与拉斯维加斯之月",
    "termEn": "Mathematical Expectancy & The Moon Over Las Vegas",
    "level": "入门必学",
    "order": 2,
    "summary": "《交易入道》第一阶『信解』的核心基石：用冷月般俯瞰全局的数理视角，计算每一次出手平均每 1 元风险能带回多少正收益。",
    "plainExplanation": "数学期望值（Expectancy）衡量的是：如果你按同一套规则重复交易 1000 次，平均每冒 1 块钱的风险，长期能净赚（或净亏）多少钱。赌场里的轮盘（欧式 -2.7%、美式 -5.3%）、百家乐（庄 -1.06%、闲 -1.24%）、双色球（-15%）、竞彩足彩（-11.3%）之所以让赌客『久赌必输』，是因为它们在规则设计（王道）上锁死了负期望值。",
    "jesseApplication": "遁一子将期望收益视为从『赌徒』迈入『信解』的分水岭：散户只盯着上一单赚了还是亏了（在果地上纠结），而修道者如『拉斯维加斯夜空的那一轮明月』，冷眼俯瞰全局概率。只要你的系统期望值 $E > 0$，短期连亏只是统计波动的必然组成部分，无需动摇道心。",
    "formulaOrCode": "// 标准每单位风险期望收益公式（以 1R 亏损为基准）：\nExpectancy (E) = (胜率 WR × 平均盈利 AvgWin / 平均亏损 AvgLoss) - (败率 LR × 1)\n               = (WR × R_Ratio) - (1 - WR)\n// 含交易频次 N 的平注总期望产出：\nTotal_Expected_R = ((WR × AvgWin) - ((1 - WR) × AvgLoss)) × Frequency(N)",
    "checklist": [
      "任何策略上实盘前，先统计至少 100 次历史回放（Replay）的胜率 WR 与平均盈亏比 R",
      "验证 E = WR × R - (1 - WR) 是否严格大于 0（最好 > 0.15R）",
      "切记：资金管理（加减码）只能改变资金曲线斜率与波动，不能把负期望（E < 0）变成正期望！"
    ],
    "pitfalls": "误以为通过『马丁格尔翻倍加注』能在负期望系统里战胜市场——那只是把小亏累积成一次毁灭性的爆仓。",
    "sourceUrls": [
      {
        "label": "博客：盗机数术之期望收益、拉斯维加斯的那一轮明月",
        "url": "https://jesselau.com/expectancy/",
        "type": "blog"
      },
      {
        "label": "博客：盗机数术之百倍域名估值、幸存者偏差、彩票偏向",
        "url": "https://jesselau.com/100%E5%80%8D%E5%9F%9F%E5%90%8D%E4%BC%B0%E5%80%BC%E5%B9%B8%E5%AD%98%E8%80%85%E5%81%8F%E5%B7%AE%E5%BD%A9%E7%A5%A8%E5%81%8F%E5%90%91%E5%8F%8A%E4%BA%BA%E5%AE%9A%E5%8B%9D%E5%A4%A9/",
        "type": "blog"
      },
      {
        "label": "推文：期望收益公式与资金管理",
        "url": "https://x.com/jesselaunz/status/1671997647887155206",
        "type": "tweet"
      }
    ]
  },
  {
    "id": "concept-profit-factor-roi",
    "track": "concepts",
    "category": "数理地基与风控术语",
    "termZh": "利润因子（Profit Factor）反推胜率与期望值",
    "termEn": "Profit Factor (PF) to Expectancy Derivation",
    "level": "核心进阶",
    "order": 3,
    "summary": "当 MT4 / TradingView 回测报告只给出『利润因子 PF』和总交易次数时，如何用一元方程反推出真实胜率与数学期望收益。",
    "plainExplanation": "**利润因子（Profit Factor, PF）= 总毛利润（Gross Profit）÷ 总毛亏损（Gross Loss）**。只有 $PF > 1.0$ 才是正期望系统（通常稳健系统的 PF 在 $1.3 \\sim 2.5$ 之间）。许多回测软件不直接给每单位风险的数学期望值，但我们可以通过总交易次数 $N$、固定止盈点数 $TP$、止损点数 $SL$ 和 $PF$ 反推出来。",
    "jesseApplication": "在博客《根据利润因子 Profit Factor、ROI 推导交易系统的期望收益》中，遁一子展示了他 15 年前编写 `money` 资金管理软件时的推导法：例如某 EUR/USD 策略 1 年交易 $N=155$ 次，止盈 $TP=20$ 点，止损 $SL=190$ 点，测出 $PF=1.85$。设亏损次数为 $x$，解方程可得 $x=8.35$ 次，胜率高达 $94.6\\%$，单次期望收益 $E = +0.04R$，155 次平注累计可赚 $6.2R$。",
    "formulaOrCode": "// 已知：总次数 N, 利润因子 PF, 平均止盈 TP, 平均止损 SL (令 ROI = TP / SL)\n// 设亏损次数为 x，则获利次数为 (N - x)：\nPF = [(N - x) × TP] / [x × SL]\n=> x = (N × TP) / (PF × SL + TP) = (N × ROI) / (PF + ROI)\n=> 胜率 WR = (N - x) / N = PF / (PF + ROI)\n=> 期望收益 E = WR × ROI - (1 - WR) = (PF - 1) × ROI / (PF + ROI)",
    "checklist": [
      "看任何 EA 或策略回测报告，先看 Profit Factor 是否 > 1.3 且样本数 N > 100",
      "用公式 WR = PF / (PF + ROI) 快速验算胜率与盈亏比是否匹配",
      "高胜率低盈亏比（如止盈 20 点、止损 190 点）绝不能用高比例复利（43% 风险金会导致 67.5% 回撤），反而是低风险或平注更稳"
    ],
    "pitfalls": "看到 95% 胜率就盲目重仓复利——殊不知 1:0.1 盈亏比的策略只要遭遇 1 次黑天鵝连亏 2 单就会腰斩。",
    "sourceUrls": [
      {
        "label": "博客：根据利润因子 Profit Factor、ROI 推导交易系统的期望收益",
        "url": "https://jesselau.com/%E6%A0%B9%E6%93%9A%E5%88%A9%E6%BD%A4%E5%9B%A0%E5%AD%90roi%E6%8E%A8%E5%B0%8E%E4%BA%A4%E6%98%93%E4%BF%82%E7%B5%B1%E7%9A%84%E6%9C%9F%E6%9C%9B%E6%94%B6%E7%9B%8A/",
        "type": "blog"
      }
    ]
  },
  {
    "id": "concept-rp-n-wr-triangle",
    "track": "concepts",
    "category": "数理地基与风控术语",
    "termZh": "交易系统不可能三角（RP - N - WR）与单笔风险 SL",
    "termEn": "The RP-N-WR Impossible Triangle & SL Risk",
    "level": "入门必学",
    "order": 4,
    "summary": "决定任何交易系统最终回报率的四大核心要素：回报率（RP）、频次（N）、胜率（WR）构成相互制约的铁三角，而单笔止损风险（SL）区分普通与传奇回报。",
    "plainExplanation": "遁一子将所有交易体系拆解为 4 个底层变量：\n1. **RP（Reward-to-Pain / 盈亏比 ROI）**：平均每赢一单赚多少倍的止损额；\n2. **WR（Win Rate / 胜率）**：盈利交易占总交易的百分比；\n3. **N（Number / 交易机会频次）**：单位时间内符合系统规则的出手次数；\n4. **SL（Stop Loss Risk % / 单笔风险金比例）**：每笔止损占账户净值的百分比。",
    "jesseApplication": "在推文 #1672121239354351616 中，遁一子精辟总结：**『SL 是自己根据心理承受力与交易水平设定，是传说级别回报率与普通级别回报率的区分要素；而 RP / N / WR 三者组成了一个三角形，一般情况下相互制约：RP 大，则 WR 和 N 小（长线趋势跟踪）；WR 大，则 RP 和 N 小（极值剥头皮/秒单）；N 大，则 RP 和 WR 很难同时大（高频刷单）。』**",
    "formulaOrCode": "复利终值公式（N 次交易后净值倍数）：\nFinal_Equity = Initial × (1 + SL × RP)^(N × WR) × (1 - SL)^(N × (1 - WR))\n\n三种典型稳健流派（以 Darwinex 顶级交易员为例）：\n• SYO 型（中庸波段）：WR = 41.2%, RP = 2.0, 日均 N = 2 单, SL = 0.4%\n• THA 型（高盈亏比趋势）：WR = 31.7%, RP = 3.5, 日均 N = 5 单, SL = 0.1%\n• ZVQ 型（高胜率短线）：WR = 76.0%, RP = 0.43, 日均 N = 2.2 单, SL = 1.0%",
    "checklist": [
      "明确你当前练的是哪一角：不要既想要 80% 胜率，又想要 1:5 盈亏比，还想要每天交易 20 次",
      "儿子 MQL5 程序通关 MFF 启示（推文 #1685938255852982272）：震荡月低 RP 高 WR 表现好，趋势月高 RP 表现好，两者正交互补",
      "用本网页『实操训练营』中的 RP-N-WR 模拟器，亲手调参感受四要素对资金曲线的影响"
    ],
    "pitfalls": "新手在趋势策略连损 4 单时嫌弃它『胜率太低』而改参数追求高胜率，结果在震荡末期把大趋势的盈亏比（RP）彻底阉割。",
    "sourceUrls": [
      {
        "label": "推文：RP/N/WR 铁三角与 SL 传说级回报要素",
        "url": "https://x.com/jesselaunz/status/1672121239354351616",
        "type": "tweet"
      },
      {
        "label": "推文：儿子低 RP 的 MQL5 程序通过 MFF 10% 评估",
        "url": "https://x.com/jesselaunz/status/1685938255852982272",
        "type": "tweet"
      },
      {
        "label": "博客：道心种魔金融交易大法（SYO/THA/ZVQ 模型）",
        "url": "https://jesselau.com/xiandaojing/",
        "type": "blog"
      }
    ]
  },
  {
    "id": "concept-kelly-5-money-mgmt",
    "track": "concepts",
    "category": "数理地基与风控术语",
    "termZh": "凯利公式（Kelly）与五大资金管理策略对比",
    "termEn": "Kelly Criterion vs. Fixed Fractional / Martingale / Anti-Martingale",
    "level": "核心进阶",
    "order": 5,
    "summary": "基于遁一子开源项目 `github.com/jesselau76/trading`：对比固定比例、固定金额、凯利公式、马丁格尔与反马丁格尔五种仓位管理的真实生死线。",
    "plainExplanation": "有了正期望交易信号后，**每笔下多少仓位（Position Sizing）**决定了你是成为首富还是破产。遁一子在 GitHub 开源了 `position_sizing_simulator.html`，用蒙特卡洛随机数对比了 5 大主流资金管理模型在数百次交易后的净值与回撤表现。",
    "jesseApplication": "1. **固定比例（Fixed Fractional）**：每次冒当前账户净值的固定百分比（如 Prop Firm 用 $0.2\\% \\sim 0.5\\%$，个人稳健账户 $1\\% \\sim 2\\%$），永不爆仓且自带复利；\n2. **固定金额（Fixed Dollar / 平注）**：每次固定亏 $100，适合高胜率低盈亏比或需要提取稳定现金流的场景；\n3. **凯利公式（Kelly Criterion）**：数学上长期几何增长率最大，但**全凯利（Full Kelly）回撤极其惨烈（常达 50%~80%）**，实盘最多只能用『1/4 凯利』或『半凯利』；\n4. **马丁格尔（Martingale）**：亏损后加倍下注，资金曲线看似平滑向上，但遇到小概率连亏极值必然归零（尾部风险爆表）；\n5. **反马丁格尔（Anti-Martingale / 赢利加码）**：盈利后按比例扩大风险金，顺风期爆发力极强，适合小资金高倍比赛『种魔种』。",
    "formulaOrCode": "// 凯利公式最优风险比例 f*：\nf* = WR - (1 - WR) / RP = (WR × (RP + 1) - 1) / RP\n// 例：胜率 WR = 45%，盈亏比 RP = 2.0：\nf* = 0.45 - 0.55 / 2.0 = 17.5% （全凯利单笔冒 17.5% 风险，实盘极度危险！）\n// 实盘安全折算（1/10 ~ 1/4 Kelly）：建议单笔风险 1% ~ 2%（资管考核 0.2% ~ 0.5%）",
    "checklist": [
      "资管考核账户（FTMO/Darwinex）严格使用『固定比例 0.1% ~ 0.5%』+ 每日最高点回撤 4% 强制平仓熔断",
      "算出的凯利值 f* 若小于 0，说明系统是负期望，立即停止交易",
      "记住范·撒普《通往金融自由之路》核心：头寸规模管理占交易长期成败的 60% 以上"
    ],
    "pitfalls": "把算出来的凯利百分比（如 15%~25%）直接当成实盘单笔止损比例，由于真实市场胜率并非恒定且存在肥尾效应，连续 5 次止损就会摧毁心态与账户。",
    "sourceUrls": [
      {
        "label": "GitHub 开源：头寸管理模拟器 (jesselau76/trading)",
        "url": "https://github.com/jesselau76/trading",
        "type": "tool"
      },
      {
        "label": "推文：开源 4 种资金管理曲线对比模拟器",
        "url": "https://x.com/jesselaunz/status/1996347340660342810",
        "type": "tweet"
      },
      {
        "label": "博客：拉瑞·威廉姆斯一年 113 倍揭秘",
        "url": "https://jesselau.com/larry-williams-113/",
        "type": "blog"
      }
    ]
  },
  {
    "id": "concept-survivorship-lottery-bias",
    "track": "concepts",
    "category": "数理地基与风控术语",
    "termZh": "幸存者偏差（守株待兔）与彩票偏向（疑邻盗斧）",
    "termEn": "Survivorship Bias & Lottery Bias (Illusion of Control)",
    "level": "入门必学",
    "order": 6,
    "summary": "为什么散户总喜欢『某股上次金叉翻倍，这次金叉赶紧满仓』或『连开 8 把庄下一把必买闲』？揭开果地总结规律与『我执』不肯止损的心理病根。",
    "plainExplanation": "1. **幸存者偏差（Survivorship Bias）**：二战沃德教授研究返航轰炸机弹孔时发现，机翼弹孔最多、机尾最少——因为机尾中弹的飞机已经坠毁了！在交易中，只拿几张『某指标金叉暴涨』的完美历史截图（果地）来总结战法，却忽略了成千上万次同样金叉却暴跌止损的样本，就是典型的**守株待兔**。\n2. **彩票偏向（Lottery Bias / 控制错觉）**：人们对自己亲自选出的号码或亲自开出的仓位产生虚幻的『控制感』，觉得『既然是我选的，成功几率一定更高』，对应中国古籍的**疑邻盗斧**。",
    "jesseApplication": "遁一子指出：**『在果地上总结规律就犯了幸存者偏差的错误；而彩票偏向里的「我执」，就是无数交易者过不了「止损」那一关的根本原因！』** 必须在『因地』（事物底层逻辑、波动率统计、大样本全量回测）上考察期望收益，绝不迷信单次复盘截图。",
    "formulaOrCode": "破除两大偏差的检验法则：\n1. 全样本检验：一个入场信号必须在 28 个货币对、跨度 3~5 年的全部历史数据上跑通，而非只挑一段顺风行情截图。\n2. 去我执止损：下单瞬间即设定好机械止损（SL）与五路分兵止盈（TP），把自己的单子当成冷冰冰的概率样本之一。",
    "checklist": [
      "每当看到别人晒『某形态暴赚 10 倍』时，立刻问自己：分母是什么？同样形态下止损了多少次？",
      "开仓后若产生『这单我研究了很久，绝对不可能跌破，先把止损撤掉扛一下』的念头，立即警觉这是『彩票偏向（我执）』发作！"
    ],
    "pitfalls": "根据最近 5 单的输赢结果不断修改系统参数（『在果地头上安头』），导致陷入过度拟合（Overfitting）的死循环。",
    "sourceUrls": [
      {
        "label": "博客：盗机数术之百倍域名估值、幸存者偏差、彩票偏向及人定胜天",
        "url": "https://jesselau.com/100%E5%80%8D%E5%9F%9F%E5%90%8D%E4%BC%B0%E5%80%BC%E5%B9%B8%E5%AD%98%E8%80%85%E5%81%8F%E5%B7%AE%E5%BD%A9%E7%A5%A8%E5%81%8F%E5%90%91%E5%8F%8A%E4%BA%BA%E5%AE%9A%E5%8B%9D%E5%A4%A9/",
        "type": "blog"
      }
    ]
  },
  {
    "id": "concept-herding-anchoring-prospect",
    "track": "concepts",
    "category": "数理地基与风控术语",
    "termZh": "羊群效应 · 锚定偏差 · 前景理论（处置效应）",
    "termEn": "Herding, Anchoring Bias & Prospect Theory (Disposition Effect)",
    "level": "入门必学",
    "order": 7,
    "summary": "诺贝尔经济学奖卡尼曼《前景理论》与行为金融学三大散户心理陷阱：为何散户总是『赚点小钱就跑，亏了大钱死扛到底』？",
    "plainExplanation": "1. **前景理论（Prospect Theory）与处置效应**：人在面对确定性盈利时表现为**风险厌恶**（拿不住单，赚 10 点就慌忙落袋为安），而在面对亏损时却变成**风险偏好/赌徒**（为了逃避割肉的确定性痛苦，宁可撤掉止损赌它回调，最终小亏变爆仓）。\n2. **锚定偏差（Anchoring）**：死死盯住自己的『买入成本价』或『前高整数关口』，市场基本面和趋势早已反转，脑子里还想着『等回到我的成本价就平仓』。\n3. **羊群效应（Herding / 信息瀑布）**：看到推特/群里所有人都在喊多某品种，生怕踏空（FOMO），放弃自己的系统盲目追高接盘。",
    "jesseApplication": "遁一子专门制作了 4K 播客《前景理论解密》与博文《行为金融学》，并设计了**『五路分兵 + 满 20 点推保本』**的机械制度来从物理上克制这三大心魔：第一路 20 点自动止盈满足大脑『落袋为安』的心理需求；其余四路推保本后毫无心理负担地去博取 40/80/120/200 点大趋势！",
    "formulaOrCode": "心理锚定清洗口诀：\n「市场根本不知道、也不在乎你的买入成本价是多少！」\n• 每一根新 K 线生成时，问自己：如果我现在空仓，在这个位置我会按系统开仓吗？如果不会甚至反向，立即离场！",
    "checklist": [
      "隐藏交易软件界面上的『浮动盈亏法币大数字』，改看『点数（Pips）』或『R 倍数』",
      "用 EA 自动拆单执行止损止盈，剥夺盘中人手移动止损放大亏损的权限",
      "盘前独立看 fxdiary.com 强弱表做计划，盘中不刷社交媒体喊单帖"
    ],
    "pitfalls": "浮亏时不断向下补仓摊平成本价（执着于成本锚点），一旦遇到单边趋势（如日元套息平仓踩踏）直接万劫不复。",
    "sourceUrls": [
      {
        "label": "博客：行为金融学——羊群效应与锚定偏差",
        "url": "https://jesselau.com/xingweijinrongxue/",
        "type": "blog"
      },
      {
        "label": "推文：前景理论解密——你为何总做亏本决定？",
        "url": "https://x.com/jesselaunz/status/1923125423459926448",
        "type": "tweet"
      },
      {
        "label": "推文：交易最强的策略不是技术指标，而是 Control Emotions",
        "url": "https://x.com/jesselaunz/status/1690529350389792768",
        "type": "tweet"
      }
    ]
  },
  {
    "id": "concept-reflexivity-soros",
    "track": "concepts",
    "category": "数理地基与风控术语",
    "termZh": "索罗斯反身性理论（Reflexivity）与繁荣-崩盘不对称性",
    "termEn": "Soros Reflexivity & Boom-Bust Asymmetry",
    "level": "核心进阶",
    "order": 8,
    "summary": "市场价格不仅被动反映基本面，还会通过信贷、抵押品价值与市场情绪反过来改变基本面，形成『缓慢自我强化繁荣 → 急速去杠杆崩盘』。",
    "plainExplanation": "传统经济学假定『市场价格总是被动趋向客观基本面均衡』。索罗斯提出**反身性（Reflexivity）**两大函数：\n• **认知功能** $y = f(x)$：交易者试图理解基本面；\n• **参与功能** $x = \\phi(y)$：交易者的买卖行为直接改变了价格，而价格上涨会提升资产抵押价值、放宽信贷、改善企业融资能力，从而**真实地改变了基本面** $x$！\n两者形成正反馈闭环，直到偏离现实太远，一根针刺破泡沫，引发信贷收缩与踩踏。",
    "jesseApplication": "遁一子在《反身性理论》与推文 #1820368104968568897（日元 Carry Trade 踩踏解析）中强调：理解反身性，就能明白为何**『涨势如抽丝（慢牛积累杠杆），跌势如山倒（连环爆仓强平）』**。当 COT 持仓极端拥挤（如日元净空头创历史极值）且转向雷达亮起火花时，反身性去杠杆踩踏将在几天内走完过去半年的涨幅！",
    "formulaOrCode": "反身性雙向閉環：\n基本面變化 (x) ──[認知功能 f(x)]──> 市場偏見與預期 (y)\n     ▲                                    │\n     └──────[參與功能 φ(y)：價格/信貸/槓桿]───┘\n實戰推論：永遠不要在反身性加速崩盤階段（如 Carry Trade 拆倉潮）逆勢摸底！",
    "checklist": [
      "关注套息交易（Carry Trade，如借入低息 JPY 买高息货币/美股）的拥挤度，一旦日本央行转向，做多 JPY 顺应去杠杆风暴",
      "区分『常态均值回归行情』与『反身性正反馈单边行情』，后者切忌逆势摸顶抄底"
    ],
    "pitfalls": "用『基本面估值已经很便宜了』为理由，在反身性去杠杆强平潮的中途重仓逆势抄底。",
    "sourceUrls": [
      {
        "label": "博客：金融炼金术与索罗斯反身性理论",
        "url": "https://jesselau.com/fanshenxinglilun/",
        "type": "blog"
      },
      {
        "label": "推文：日元暴涨与 Carry Trade 踩踏级影响解析",
        "url": "https://x.com/jesselaunz/status/1820368104968568897",
        "type": "tweet"
      }
    ]
  },
  {
    "id": "concept-four-seasons-market",
    "track": "concepts",
    "category": "图表结构与四季原理",
    "termZh": "市场四季原理（春·夏·秋·冬）与四大走势铁律",
    "termEn": "Market Four Seasons (Spring/Summer/Autumn/Winter) & Four Trend Laws",
    "level": "入门必学",
    "order": 9,
    "summary": "遁一子《交易入道》判势核心：由两仪（阴阳）生三才（涨、跌、盘整），再结合『价格与指标是否背离』化为四象（春夏秋冬四季）。",
    "plainExplanation": "任何周期的行情都可以用**价格方向**与**动能指标方向**的组合，划分为四个季节：\n•  **春（少阳）**：**价格上涨 + 指标同步上涨**（春分确认，多头动能充沛，**做多最佳高 ROI 季节**）；\n• ️ **夏（老阳）**：**价格创新高 + 指标背离下跌**（夏至确认，上涨动能衰竭，除非大一级别处于『春』，否则不追多）；\n•  **秋（少阴）**：**价格下跌 + 指标同步下跌**（秋分确认，空头动能充沛，**做空最佳高 ROI 季节**）；\n• ️ **冬（老阴）**：**价格创新低 + 指标背离上涨**（冬至确认，空头衰竭，酝酿筑底）。",
    "jesseApplication": "由此推导出遁一子的**四大核心推演铁律**：\n1. **成熟市场高周期不存在没有盘整的 V 型直接反转**！\n2. 因此，**永远不要在平仓后立即反手建仓**（必先经过盘整酝酿）；\n3. 市场只有 4 种标准走势：`上涨→盘整→续涨`、`上涨→盘整→转跌`、`下跌→盘整→续跌`、`下跌→盘整→转涨`；\n4. 只有当高周期与操作周期同处『春』（共振做多）或同处『秋』（共振做空）时，才是胜率与盈亏比双高的击球区。",
    "formulaOrCode": "四季判别矩阵：\n┌──────────┬──────────────┬──────────────┬────────────────────────┐\n│ 季节象限 │ 价格走势     │ 指标动能     │ 实操策略               │\n├──────────┼──────────────┼──────────────┼────────────────────────┤\n│ 春(少阳) │ ↗ 上涨       │ ↗ 同涨无背离 │  顺势重拳做多       │\n│ 夏(老阳) │ ↗ 虚破新高   │ ↘ 顶背离回落 │  减仓/仅大周期春参与│\n│ 秋(少阴) │ ↘ 下跌       │ ↘ 同跌无背离 │  顺势重拳做空       │\n│ 冬(老阴) │ ↘ 虚破新低   │ ↗ 底背离回升 │  空单止盈/等待入春  │\n└──────────┴──────────────┴──────────────┴────────────────────────┘",
    "checklist": [
      "开仓前先定位当前 200m 与 20m 分别处于春夏秋冬哪个季节",
      "只在『春』做多、只在『秋』做空；看到『夏/冬』背离时，绝不追涨杀跌",
      "牢记铁律：多单止盈或止损出局后，禁止在同一根 K 线直接反手开空！"
    ],
    "pitfalls": "在『夏』季末端看到价格突破前高就兴奋追多，结果一买就买在顶背离假突破的最高点；或者在没有盘整的情况下幻想 V 型反转直接反手。",
    "sourceUrls": [
      {
        "label": "博客：程序交易的道与术（上）——市场四季原理",
        "url": "https://jesselau.com/trading-principles/",
        "type": "blog"
      },
      {
        "label": "博客：程序交易的道与术（下）——指标与源码",
        "url": "https://jesselau.com/trading-principles2/",
        "type": "blog"
      }
    ]
  },
  {
    "id": "concept-supply-demand-ob",
    "track": "concepts",
    "category": "图表结构与四季原理",
    "termZh": "供需区（Supply & Demand Zone）与订单块（Order Block）",
    "termEn": "Supply & Demand Zone / Institutional Order Block (OB)",
    "level": "入门必学",
    "order": 10,
    "summary": "高周期（200m）上机构大资金留下的未成交订单密集区：暴涨启动前的最后一根阴线（需求区）与暴跌启动前的最后一根阳线（供给区）。",
    "plainExplanation": "银行与对冲基金的巨额订单无法在瞬间一次性全部成交。当价格从某个狭小盘整区突然以大阳线（失衡区 Imbalance / FVG）暴力拉升时，说明该区域存在巨量机构买单未完全成交。这个**暴力拉升前的盘整底座（或最后一根阴线实体/影线区）**就叫**需求区（Demand Zone / 看涨订单块 Bullish OB）**；反之，暴力杀跌前的底座叫**供给区（Supply Zone / 看跌订单块 Bearish OB）**。",
    "jesseApplication": "在遁一子三周期体系中，**`200m` 图表最重要的任务就是画出有效的供需区**。当价格首次回踩（First Touch / Fresh Zone）`200m` 需求区，且同时进入波段 50% 以下折价区时，机构剩余买单会被激活护盘，这就是『避其锐气，击其惰归（击归）』的黄金伏击阵地！",
    "formulaOrCode": "有效供需区（Fresh Zone）三大判定标准：\n1. 离开速度（爆發力）：脱离底座时必须伴随 ATR 突破大阳/大阴线（失衡区），证明机构资金真实介入；\n2. 破坏结构（BOS）：这波拉升/杀跌必须成功突破前一个有效 Zigzag 波段高低点；\n3. 新鲜度（Freshness）：离开后尚未被回踩测试过（第 1 次回踩胜率最高，第 3 次以上失效概率大增）。",
    "checklist": [
      "在 200m 图表上用矩形框标出最近未回踩的供给区（上方红框）与需求区（下方绿框）",
      "观察价格是以『急促大阴线（锐气）』还是『缩量碎步回调（惰归）』接近需求区",
      "等待价格触及 200m 供需区后，切到 20m / 2m 寻找反转确认信号，绝不盲目挂单硬接飞刀"
    ],
    "pitfalls": "在已经被反复测试了 3~4 次的『二手支撑阻力位』继续重仓做多，殊不知里面的机构挂单早已被消耗殆尽，随时会被一举击穿。",
    "sourceUrls": [
      {
        "label": "YouTube 实盘回放：USDJPY 三周期 4 周完整推演",
        "url": "https://www.youtube.com/watch?v=PeogwmEEt2I",
        "type": "video"
      },
      {
        "label": "推文：三周期 Replay 视频解析",
        "url": "https://x.com/jesselaunz/status/1660413098887639041",
        "type": "tweet"
      },
      {
        "label": "博客：金融交易白云八法（判势与击归）",
        "url": "https://jesselau.com/baiyunbafa/",
        "type": "blog"
      }
    ]
  },
  {
    "id": "concept-premium-discount-fib50",
    "track": "concepts",
    "category": "图表结构与四季原理",
    "termZh": "溢价区与折价区（50% 斐波那契中轴法则 · 击归核心）",
    "termEn": "Premium & Discount Zones (50% Fibonacci Equilibrium)",
    "level": "入门必学",
    "order": 11,
    "summary": "《交易入道》『击归』的量化尺子：将一段趋势波段从 0 到 100% 切开，50% 以下为折价区（只做多），50% 以上为溢价区（只做空）。",
    "plainExplanation": "经商之道在于『低买高卖（批发价进货，零售价出货）』。在图表上，用斐波那契工具连接一个完整确认波段的起点（0%）与终点（100%），中间的 **50% 位置（Equilibrium 均衡中轴）**将空间一分为二：\n• **折价区（Discount Zone，回调深入 50% ~ 78.6% 区域）**：价格相对便宜，属于多头批发进货区；\n• **溢价区（Premium Zone，反弹深入 50% ~ 78.6% 区域）**：价格相对昂贵，属于空头批发派发区。",
    "jesseApplication": "遁一子开源的 `[JL] Supertrend Zone Pivot Point with Zigzag Fib` 指标会自动在图表上连接最新的 Zigzag 波段高低点并画出 50% 中轴与黄金分割位。**『避其锐气，击其惰归』的实操纪律就是：上升趋势中，没回调到 50% 折价区以下绝不追多；下降趋势中，没反弹到 50% 溢价区以上绝不追空！** 这一个动作就能直接把盈亏比（RP）提升一倍以上。",
    "formulaOrCode": "波段中轴计算：\nEquilibrium_50 = (Swing_High + Swing_Low) / 2\n• 多头击归条件：主趋势向上 (200m Bullish) AND 当前价格 < Equilibrium_50 (最好在 0.50 ~ 0.618/0.786 且重合需求区)\n• 空头击归条件：主趋势向下 (200m Bearish) AND 当前价格 > Equilibrium_50 (最好在 0.50 ~ 0.618/0.786 且重合供给区)",
    "checklist": [
      "在 20m 图表上拉出最近一段推动浪的 High 到 Low，标出 50% 分界线",
      "如果当前价格还在 23.6% 浅幅回调处，管住手，宁可错过也不在溢价区买多",
      "重点盯防『50%~61.8% 折价区 + 200m 需求区 + Supertrend 支撑带』三合一共振点"
    ],
    "pitfalls": "看到大阳线突破就怕踏空（FOMO），在波段最顶部的溢价区追多，止损不得不设在波段底部（止损 80 点、止盈空间仅 20 点，盈亏比完全倒挂）。",
    "sourceUrls": [
      {
        "label": "TradingView 开源指标：[JL] Supertrend Zone Pivot Point with Zigzag Fib",
        "url": "https://www.tradingview.com/script/HrcAAGcU-JL-Supertrend-Zone-Pivot-Point-with-zigzag-fib/",
        "type": "tool"
      },
      {
        "label": "推文：把昨天做的指标 opensource 了（核心起点推文）",
        "url": "https://x.com/jesselaunz/status/1633248916564213760",
        "type": "tweet"
      }
    ]
  },
  {
    "id": "concept-zigzag-nonrepaint-pivot",
    "track": "concepts",
    "category": "图表结构与四季原理",
    "termZh": "不重绘之字转向（Non-Repainting Zigzag）与枢轴高低点（Pivot）",
    "termEn": "Non-Repainting Zigzag & Pivot High/Low Structure",
    "level": "核心进阶",
    "order": 12,
    "summary": "如何客观识别『更高高点（HH）、更高低点（HL）』而不再被传统 Zigzag 指标的事后『重绘（Repainting）』欺骗？",
    "plainExplanation": "传统 MT4 自带的 Zigzag 指标在复盘看历史图表时简直是『圣杯』——每个顶底都精准无比；但一到实盘就会发现，价格再创新高时，刚才画出的『顶点』会悄悄消失并挪到新位置，这叫**重绘（Repainting / 未来函数）**。真正可用于实盘和 EA 的结构识别，必须基于已收盘确认的 **Pivot Point（枢轴点，如左侧 N 根、右侧 M 根 K 线均低于该点）**或 **Supertrend 转向确认**。",
    "jesseApplication": "遁一子在开源 `[JL] Supertrend Zone Pivot Point` 时专门解决了这一痛点：利用双 Supertrend 通道与确认后的 Pivot 高低点来锁定波段结构，客观标示出 `HH (Higher High)`、`HL (Higher Low)`、`LH (Lower High)`、`LL (Lower Low)`，让『判势』与『画斐波那契折价区』拥有 100% 客观、不漂移的锚点。",
    "formulaOrCode": "// TradingView Pine Script 客观枢轴点（无未来函数，滞后 rightBars 根确认）：\nph = ta.pivothigh(high, leftBars, rightBars)\npl = ta.pivotlow(low, leftBars, rightBars)\n// 结构定义：\n• 多头结构：连续出现 HH (高于前高) + HL (高于前低)\n• 结构破坏 (BOS / CHoCH)：收盘价有效跌破最近一个确认的 HL",
    "checklist": [
      "使用任何带顶底箭头或连线的指标前，先用 TradingView Replay 逐根 K 线播放，检验信号是否会事后消失",
      "以确认后的 HL 作为多单防守底线，未跌破前HL不轻易主观猜顶"
    ],
    "pitfalls": "拿含有未来函数（重绘）的 Zigzag 指标去写 EA 回测，跑出 99% 胜率的虚假曲线，一上实盘立刻连续止损。",
    "sourceUrls": [
      {
        "label": "TradingView 指标：[JL] Supertrend Zone Pivot Point Oscillator",
        "url": "https://www.tradingview.com/script/s0t62d4C/",
        "type": "tool"
      },
      {
        "label": "TradingView 指标：[JL] Supertrend Zone Pivot Point with Zigzag Fib",
        "url": "https://www.tradingview.com/script/HrcAAGcU-JL-Supertrend-Zone-Pivot-Point-with-zigzag-fib/",
        "type": "tool"
      }
    ]
  },
  {
    "id": "concept-price-action-all-patterns",
    "track": "concepts",
    "category": "图表结构与四季原理",
    "termZh": "价格行为形态（Price Action Patterns）与 Stoch Candle 判势",
    "termEn": "Chart Patterns (Flags/Triangles/Double Top) & Stoch Candle",
    "level": "核心进阶",
    "order": 13,
    "summary": "结合 TradingView 官方『All Chart Patterns』自动形态识别与 Stoch Candle 颜色过滤，实现『激水之疾，其势漂石，涟漪过后，心湖如镜』。",
    "plainExplanation": "**价格行为（Price Action）**与经典图表形态（矩形整理、收敛三角形、上升/下降旗形 Flag、双顶 M 头、双底 W 底、头肩顶底）本质上是多空双方在盘整期（三才中的『盘整』）力量消长的几何投影。**Stoch Candle** 则是根据随机指标（Stochastic）数值直接给 K 线染色（如强势多头染深绿、弱势染红），过滤杂波。",
    "jesseApplication": "在推文 #1691352830433722368、#1691357063950352384 与 #1693088004838228310 中，遁一子分享了他的偷懒高效看盘法：开启 TradingView 官方的 `All Chart Patterns` 自动画出矩形、三角、旗形、双头，再叠加 `Stoch Candle` 指标判势——当大周期趋势向上，中周期走出『上升旗形或收敛三角』回调，且 K 线重新由弱转强染色突破形态上沿时，即是极佳顺势切入点。",
    "formulaOrCode": "形态 + 动能共振判势口诀：\n1. 趋势延续形态（中继）：上升旗形 (Bullish Flag)、矩形箱体 (Rectangle)、对称/上升三角形\n2. 趋势反转形态（击归底/顶）：双底 (Double Bottom / W底)、头肩底 (Inverse H&S)、下降楔形向上突破\n3. 过滤假突破：突破形态边界时，Stoch Candle 必须处于同向强势颜色且伴随布林带开口角度放大。",
    "checklist": [
      "在 TradingView『指标 -> 技术 -> 形态』中开启 All Chart Patterns 辅助复盘",
      "在 20m 折价区等待 W 底（双底）或下降楔形突破，作为『击归』的结构确认信号"
    ],
    "pitfalls": "在震荡市正中间随便找个小级别双底就重仓摸底，忽略了高周期（200m）正处于猛烈的空头『秋』季主跌浪。",
    "sourceUrls": [
      {
        "label": "推文：用 Stoch Candle + Chart Pattern 判势",
        "url": "https://x.com/jesselaunz/status/1693088004838228310",
        "type": "tweet"
      },
      {
        "label": "推文：结合 All Patterns 指标复习 Price Action",
        "url": "https://x.com/jesselaunz/status/1691352830433722368",
        "type": "tweet"
      },
      {
        "label": "推文：矩形、三角、上升旗形、双头一张图自动识别",
        "url": "https://x.com/jesselaunz/status/1691357063950352384",
        "type": "tweet"
      }
    ]
  },
  {
    "id": "rudao-01-xinjie-guanju",
    "track": "rudao",
    "category": "《交易入道》· 信解与观局",
    "termZh": "第一式：信解（拉斯维加斯之月）与 观局（八大货币强弱矩阵）",
    "termEn": "Stage 1: Mathematical Faith & Currency Strength Matrix",
    "level": "核心战法",
    "order": 14,
    "summary": "入道先立『正期望收益』之信；开盘先看 8 大货币 28 对联动强弱（Nine Currency Comparison / fxdiary.com），只挑『最强配最弱』的主战场。",
    "plainExplanation": "**信解**：看透轮盘(-2.7%)、百家乐(-1.06%)、彩票(-15%)的负期望本质，将自己抽离成『拉斯维加斯夜空的冷月』，只做数学期望 E > 0 的系统化博弈。**观局**：股票上万只且做空受限，而主流外汇仅 **8 大货币（USD, EUR, GBP, JPY, AUD, CAD, CHF, NZD）** 两两组成 **28 个货币对**，天然多空对称、无庄家控盘且呈『连环船』传导。",
    "jesseApplication": "遁一子开发了开源指标 `[JL] Nine Currency Comparison`（以新加坡元 SGD 为锚对比 120 小时涨跌幅）以及实时网站 `fxdiary.com`（FX Battlefield 外汇战场地图，用波动率标准差 σ z-score 扫描 28 对货币 + COT 持仓 + 1d←4h+1h 衰竭反转雷达）。每天盘前第一步：找出 120 小时最强货币（如 GBP）与最弱货币（如 JPY），锁定交叉盘 GBP/JPY 作为当日唯一狙击标的。",
    "formulaOrCode": "观局选品公式：\n1. 打开 fxdiary.com 或 TV 指标 [JL] Nine Currency Comparison (锚定 SGD, 周期 120H)\n2. 排序 8 大货币相对强度：Strongest (Top 1-2) vs Weakest (Bottom 1-2)\n3. 组合配对：做多 Strongest / Weakest（如 AUD 最强、NZD 最弱 → 关注 AUDNZD 多头）\n4. 过滤：避开即将公布央行利率决议或非农（NFP）的前后 30 分钟",
    "checklist": [
      "盘前打开 fxdiary.com 查看波动率 σ 矩阵与 8 大货币强弱排名",
      "用 [JL] Nine Currency Comparison 确认 120H 强弱喇叭口正在张开而非收敛粘合",
      "当天只挑 1~2 个强弱反差最大的货币对盯盘，绝不在震荡粘合货币对上浪费子弹"
    ],
    "pitfalls": "不看货币整体强弱，单凭某一个货币对的 K 线形态强行逆势抄底，结果遇上该货币全盘崩泄的单边屠杀。",
    "sourceUrls": [
      {
        "label": "推文：开源 [JL] Nine Currency Comparison 强弱指标",
        "url": "https://x.com/jesselaunz/status/1647935933759758337",
        "type": "tweet"
      },
      {
        "label": "推文：为什么外汇 8 大货币 28 货币对是最佳战场",
        "url": "https://x.com/jesselaunz/status/1646981928350896129",
        "type": "tweet"
      },
      {
        "label": "工具：FX Battlefield 外汇实时战场地图",
        "url": "https://fxdiary.com/",
        "type": "tool"
      },
      {
        "label": "博客：《交易入道》总纲",
        "url": "https://jesselau.com/rudao/",
        "type": "blog"
      }
    ]
  },
  {
    "id": "rudao-02-panshi-jigui",
    "track": "rudao",
    "category": "《交易入道》· 判势与击归",
    "termZh": "第二式：判势（200m 供需与四季）与 击归（20m 折价区黄金分割回撤）",
    "termEn": "Stage 2: 200m Trend/Supply-Demand & 20m Fib Discount Pullback",
    "level": "核心战法",
    "order": 15,
    "summary": "大周期（200m）定四季多空与供需边界，中周期（20m）用开源神作 `[JL] Supertrend Zone Pivot Point with zigzag fib` 等价格回到 50% 折价线以下『击其归途』。",
    "plainExplanation": "**判势（知道行道）**：市场如四季轮替（春萌芽、夏主升、秋主跌、冬沉寂）与三才交替（上涨、下跌、盘整）。在 200m 大周期上识别机构留下的供需失衡区（Supply/Demand Zone）与 HH/HL 结构。**击归（顺势回踩）**：趋势确认向上后，绝不在价格高高在上的溢价区（Premium）追涨，而是耐心等中周期（20m）走出一波回调。",
    "jesseApplication": "这就是你书签里那条著名推文（#1633248916564213760『把昨天做的指标 opensource 了』）的核心武器！他的开源脚本 `[JL] Supertrend Zone Pivot Point with zigzag fib` 将 **Supertrend 趋势带**、**不重绘 Zigzag 高低点**、**Fibonacci 黄金分割** 与 **50% 折价/溢价中轴线** 四合一：上涨趋势自动连接波段高低点画出 Fib，只有当价格回落到 **50% 折价线以下（Discount 区，尤其是 0.5~0.618 黄金口袋）** 且未跌破前低 HL 时，才进入『击归』伏击圈。",
    "formulaOrCode": "// [JL] Supertrend Zone Pivot Point with zigzag fib 核心逻辑：\n1. Supertrend 方向 = Bullish (绿区) → 仅锁定波段 Pivot High / Low\n2. 自动绘制波段 Fib：0.0 (High) — 0.5 (Equilibrium 中轴) — 1.0 (Low)\n3. 击归做多条件：Price <= 0.5 Fib (进入 Discount 折价区) && Price > 1.0 Fib (未破前低 HL)\n4. 击归做空条件：Supertrend = Bearish && Price >= 0.5 Fib (进入 Premium 溢价区)",
    "checklist": [
      "200m 周期确认处于『夏（主升）』或『秋（主跌）』，避开『冬（窄幅横盘）』",
      "20m 周期加载 [JL] Supertrend Zone Pivot Point with zigzag fib",
      "多头趋势只看 50% 虚线以下的折价区（Discount），没回调到 50% 以下坚决双手离开键盘"
    ],
    "pitfalls": "看到大阳线突破就热血冲脑在 20m 溢价区顶端追多，结果刚好买在短线衰竭点，一进场就被回抽洗出局。",
    "sourceUrls": [
      {
        "label": "推文：把昨天做的指标 opensource 了（核心原推）",
        "url": "https://x.com/jesselaunz/status/1633248916564213760",
        "type": "tweet"
      },
      {
        "label": "TV 开源脚本：[JL] Supertrend Zone Pivot Point with zigzag fib",
        "url": "https://www.tradingview.com/script/HrcAAGcU-JL-Supertrend-Zone-Pivot-Point-with-zigzag-fib/",
        "type": "tool"
      },
      {
        "label": "博客：判势 — 知道，行道",
        "url": "https://jesselau.com/2023/08/21/know_follow_trend/",
        "type": "blog"
      },
      {
        "label": "博客：击归 — 黄金分割与折价区",
        "url": "https://jesselau.com/2023/12/23/2023-12-23-fib/",
        "type": "blog"
      }
    ]
  },
  {
    "id": "rudao-03-ruwei-yongqi",
    "track": "rudao",
    "category": "《交易入道》· 入微与用奇",
    "termZh": "第三式：入微（2m 布林开口角度触发）与 用奇（200m/20m/2m 十倍分形）",
    "termEn": "Stage 3: 2m Bollinger Angle Trigger & 200m/20m/2m 10x Fractal",
    "level": "核心战法",
    "order": 16,
    "summary": "打破传统『数字20陷阱』，采用 200m-20m-2m 严格 10 倍分形；当 20m 落入折价区后，切到 2m 周期用 `[JL] Angle of Bollinger Bands Alert` 捕捉布林带陡峭开口瞬间扣扳机！",
    "plainExplanation": "**用奇（打破 20 的陷阱）**：全世界散户都在看 H4/H1/M15 并套用默认的 20 周期均线/布林带，但 H4 到 H1 是 4 倍、H1 到 M15 是 4 倍、M15 到 M5 是 3 倍，比例混乱且容易被主力猎杀止损。遁一子独创 **200分钟 → 20分钟 → 2分钟** 的严格 **10 倍分形周期**，结合均线彩虹（MA Rainbow）跨周期折射。**入微（微观扳机）**：在 2m 极小周期上，不再主观猜底，而是等波动率压缩后的突然爆发。",
    "jesseApplication": "他的第二个核心开源指标 `[JL] Angle of Bollinger Bands Alert` 专门干这件事：在 2m 图表上实时计算布林带上轨（做多时）或下轨（做空时）切线张开的角度（Angle）。当 20m 处于折价区，且 2m 经历窄幅收口（Squeeze）后，一根放量 K 线带动布林带上轨以陡峭角度（如 >30°~45°）向上张开，指标立刻发出 Webhook Alert 信号，触发 MT4/MT5 EA 进场！",
    "formulaOrCode": "// 三屏十倍分形 + 入微触发流：\n• 大屏 (200m)：定多空大方向与供需区边界\n• 中屏 (20m) ：[JL] Supertrend Zigzag Fib 进入 < 50% Discount 折价区\n• 小屏 (2m)  ：[JL] Angle of Bollinger Bands 触发陡峭开口 Alert\n  └─ Webhook JSON -> 自建域名转发 -> MT4/MT5 EA 自动拆单开 5 笔仓位",
    "checklist": [
      "TradingView 开启三联屏：左 200m、中 20m、右 2m（无自定义分钟周期可用 H4 / M15 / M1 或 M180 / M18 / M2 近似）",
      "在 2m 图表加载 [JL] Angle of Bollinger Bands Alert 设置报警阈值",
      "必须等 2m 出现均线彩虹聚拢后向上发散 + 布林开口角度达标才入场，拒绝左侧接飞刀"
    ],
    "pitfalls": "在 20m 还没回调到折价区时，光看 2m 布林带开口就频繁乱追，变成高频刷单手数贡献者。",
    "sourceUrls": [
      {
        "label": "TV 开源脚本：[JL] Angle of Bollinger Bands Alert",
        "url": "https://www.tradingview.com/script/qrIjY4WL/",
        "type": "tool"
      },
      {
        "label": "推文：公开布林线角度报警指标与三周期共振",
        "url": "https://x.com/jesselaunz/status/1651868648804585477",
        "type": "tweet"
      },
      {
        "label": "推文：闲云九法之『入微』与『用奇』十倍分形",
        "url": "https://x.com/jesselaunz/status/1652497685969244160",
        "type": "tweet"
      },
      {
        "label": "博客：用奇 — 避开数字 20 的陷阱",
        "url": "https://jesselau.com/2023/12/26/2023-12-26-trapof20/",
        "type": "blog"
      }
    ]
  },
  {
    "id": "rudao-04-susheng-fenbing",
    "track": "rudao",
    "category": "《交易入道》· 速胜与分兵",
    "termZh": "第四式：速胜（满 20 点推保本）与 五路分兵（20/40/80/120/200 Pips + 40 点回撤平仓）",
    "termEn": "Stage 4: +20 Pips Breakeven & 5-Leg Split Exit Engine",
    "level": "核心战法",
    "order": 17,
    "summary": "遁一子半自动 EA 的灵魂核心：把单笔总风险拆成 5 笔等额订单同时入场，止盈阶梯设为 20/40/80/120/200 点；只要顺向走满 20 点，剩余 4 笔立刻推保本，浮盈从最高点回撤 40 点全部落袋！",
    "plainExplanation": "传统交易员最大的痛苦是：拿短线赚 20 点就跑，错过了后面 150 点的大趋势；想格局拿长线，结果浮盈 80 点没走又坐过山车变成止损。**五路分兵（Split Orders）+ 速胜推保本（Breakeven）** 用机械化分仓完美解决了『胜率与盈亏比不可兼得』的死结。",
    "jesseApplication": "从推文 #1655029828390068224、#1655320377944731648、#1671997647887155206 中完整拼出的 EA 参数：\n1. **五路分兵**：每次信号触发，EA 将总仓位平均拆为 **5 笔独立订单**，初始止损统一设在结构位（约 **20 Pips**，即 1R）。\n2. **阶梯止盈**：5 笔订单的 TP 分别设为 **`20 pips (1R), 40 pips (2R), 80 pips (4R), 120 pips (6R), 200 pips (10R)`**。\n3. **速胜推保本**：一旦价格顺向走满 **+20 pips**（第 1 笔自动止盈落袋），EA 瞬间将其余 4 笔订单的 SL 移至开仓价（Breakeven，0 风险）！\n4. **峰值回撤 40 点全平**：当趋势继续奔跑，EA 实时记录最高浮盈点数 `MaxProfitPips`；由于 200 pips 较难直接摸到，**一旦浮盈从峰值回落满 40 pips（或 Supertrend 翻色），剩余仓位全部市价平仓**！",
    "formulaOrCode": "// 五路分兵 EA 核心状态机伪代码：\nLeg[1..5].lot = TotalLot / 5;  Leg[1..5].sl = EntryPrice ∓ 20 pips;\nLeg[1..5].tp  = [20, 40, 80, 120, 200] pips;\n\nif (CurrentProfitPips >= 20 && !isBreakevenSet) {\n  // Leg[1] 已止盈 +20pips，其余 4 路立即推保本（立于不败之地）\n  for (i = 2..5) Leg[i].sl = EntryPrice + 1 pip (覆盖手续费);\n  isBreakevenSet = true;\n}\nif (MaxProfitPips >= 60 && (MaxProfitPips - CurrentProfitPips) >= 40) {\n  CloseAllRemainingLegs(\"Peak Drawdown 40 Pips Exit\");\n}",
    "checklist": [
      "入场前用下方『实操计算器』算好总手数并除以 5，设置好 20/40/80/120/200 五档 TP",
      "行情走满 +20 pips 第一时间把剩余 4 单止损移到开仓均价（保本）",
      "日内账户净值从高点回撤触及 4% 硬熔断线时，EA 无条件强平并锁仓休息"
    ],
    "pitfalls": "走满 20 点后舍不得推保本，或者在浮盈回撤 40 点时心存幻想手动撤掉止盈保护，导致大赚单变亏损单。",
    "sourceUrls": [
      {
        "label": "推文：五路分兵 20/40/80/120/200 点与满 20 点推保本详解",
        "url": "https://x.com/jesselaunz/status/1655029828390068224",
        "type": "tweet"
      },
      {
        "label": "推文：最高浮盈回撤 40 点平仓与 EA 半自动护盘",
        "url": "https://x.com/jesselaunz/status/1655320377944731648",
        "type": "tweet"
      },
      {
        "label": "博客：TradingwithEA 半自动交易系统架构",
        "url": "https://jesselau.com/tradingwithea/",
        "type": "blog"
      }
    ]
  },
  {
    "id": "rudao-05-miaosuan-buzhan",
    "track": "rudao",
    "category": "《交易入道》· 庙算与不战",
    "termZh": "第五式：庙算（RP-N-WR 铁三角复利公式）与 不战（Prop Firm / Darwinex 矩阵）",
    "termEn": "Stage 5: RP-N-WR Compounding Formula & Prop Firm Matrix",
    "level": "核心战法",
    "order": 18,
    "summary": "用剔除保本单后的『铁三角复利公式』做庙算；通过『满20点推保本』砍掉亏损幂次，再用稳健低回撤曲线去复制 FTMO / Darwinex 外部资金分店。",
    "plainExplanation": "**庙算**：孙子兵法云『多算胜，少算不胜』。遁一子推导出剔除 0R 保本单后的净复利公式：**利润倍数 = $(1 + \\text{SL} \\times \\text{RP})^{N \\times \\text{WR}} \\times (1 - \\text{SL})^{N \\times (1 - \\text{WR})}$**。其中 `RP（盈亏比）`、`N（有效交易频次）`、`WR（有效胜率）` 构成互相制约的铁三角，交易员的功力就是这个三角形的面积。**不战而屈人之兵**：不靠自有小资金重仓赌翻倍，而是用极低回撤拿到 Prop Firm（FTMO）或 Darwinex 的百万级种子资金管理权。",
    "jesseApplication": "为什么『满 20 点推保本』在数学上如此恐怖？因为在复利公式右半边 $(1 - \\text{SL})^{N(1-\\text{WR})}$ 中，原本大量震荡行情会触发 `-1R` 止损，使亏损次数指数级侵蚀复利；而 20 点推保本直接把一半以上的潜在亏损单变成了 `0R`（不计入亏损幂次），哪怕最终只吃到了 TP1(+20p) 或 TP2(+40p)，有效胜率 WR 和实际盈亏比 RP 都会发生质变！",
    "formulaOrCode": "// 遁一子『庙算』铁三角复利公式：\nProfit_Multiplier = Math.pow(1 + SL * RP, N * WR) * Math.pow(1 - SL, N * (1 - WR))\n\n// 典型参数示例（剔除保本单后）：\n• 单笔风险 SL = 1% (0.01)\n• 综合盈亏比 RP = 2.2 (五路分兵加权)\n• 有效场次 N = 100 场，有效胜率 WR = 55%\n→ 利润倍数 = (1 + 0.022)^55 × (1 - 0.01)^45 = 3.309 × 0.636 = 2.105 倍 (+110.5%)",
    "checklist": [
      "每月复盘统计自己的铁三角指标：有效场次 N、剔除保本单后的净胜率 WR、加权盈亏比 RP",
      "在 GitHub 资金管理模拟器 (jesselau76.github.io/trading/moni.html) 中检验最大回撤是否在 8% 以内",
      "单笔风险永远锁定在 0.5% ~ 1%，绝不因连胜而盲目套用全凯利公式重仓"
    ],
    "pitfalls": "把事后统计的静态胜率直接代入凯利公式开 10%~20% 仓位，遇到一次小概率连亏黑天鹅直接腰斩。",
    "sourceUrls": [
      {
        "label": "推文：庙算 — 利润倍数核心复利公式推导",
        "url": "https://x.com/jesselaunz/status/1671997647887155206",
        "type": "tweet"
      },
      {
        "label": "推文：RP-N-WR 铁三角面积决定交易员真实水平",
        "url": "https://x.com/jesselaunz/status/1672121239354351616",
        "type": "tweet"
      },
      {
        "label": "工具：遁一子开源资金管理模拟器（全指标专业版）",
        "url": "https://jesselau76.github.io/trading/moni.html",
        "type": "tool"
      },
      {
        "label": "推文：Darwinex 与自营考核当作开分店复制增长",
        "url": "https://x.com/jesselaunz/status/1689811434564448256",
        "type": "tweet"
      }
    ]
  },
  {
    "id": "rudao-06-ai-evolution",
    "track": "rudao",
    "category": "《交易入道》· 2025-2026 AI 演进",
    "termZh": "第六式：2025–2026 AI 交易演进（Claude 写 MT5 + 长短双框架 + Polymarket 扫描）",
    "termEn": "Stage 6: AI-Assisted MT5 EA, Dual-Timeframe Crypto & Polymarket Bot",
    "level": "前沿演进",
    "order": 19,
    "summary": "遁一子在 2025-2026 年的最新进化：用 Claude + NotebookLM 全面接管 MT5 策略编写，提炼出『长线波段锚定 + 短线 4H RSI 均值回归』双框架，并拓展至 Polymarket 自动化套利。",
    "plainExplanation": "进入 2025–2026 年，遁一子将个人独立开发能力与前沿大模型深度融合：不再手写繁琐的 MQL5 底层代码，而是用 Claude 进行模块化重构，并用 NotebookLM 整理交易笔记知识库；同时研究了 AI 加密货币实盘大赛冠军策略与预测市场（Polymarket）自动扫描。",
    "jesseApplication": "他在 2025 年底至 2026 年初的书签推文中总结了三条黄金实战经验：\n1. **长短双时间框架策略（#1980398389780181136）**：长线锚定仓（高确定性主流币 8x 拿波段趋势）+ 短线战术刷单（BTC 4H 级别 RSI 超买超卖均值回归），账户始终保留 **25%+ 现金缓冲**。\n2. **切忌给 AI 设过于复杂的 Invalidation（失效平仓）条件（#1980375899683143854）**：给 AI Agent 设太多微观失效条件会导致它在正常洗盘中频繁割肉止损，风控越简单硬核（硬止损 + 移动止盈）效果越好。\n3. **Polymarket 自动化扫描（#2036332105307992197）**：用 Claude Code 编写自动化脚本扫描预测市场赔率错配并执行下注。",
    "formulaOrCode": "// AI 时代双时间框架仓位分配（Crypto / FX 通用）：\n• 50% 资金：长周期趋势锚定仓（200m / 1D 顺势，五路分兵拿波段）\n• 25% 资金：短周期均值回归战术仓（4H RSI < 30 / > 70 极值反转，快进快出）\n• 25% 资金：永久现金缓冲池（Cash Buffer，防极端插针并补充保证金）",
    "checklist": [
      "使用 Claude / Cursor 编写或修改 Pine Script 与 MQL5 EA 时，先固定风控模块（五路分兵 + 20点推保本）不变",
      "给自动化策略设置简单明确的硬止损，避免多重模糊的盘中 Invalidation 逻辑互相打架",
      "任何时候保持至少 25% 可用现金/保证金缓冲"
    ],
    "pitfalls": "让 LLM 直接根据实时 K 线自由发挥频繁改主意，导致在震荡洗盘里左右挨巴掌。",
    "sourceUrls": [
      {
        "label": "推文：拆解 AI 交易大赛冠军的『长短双时间框架策略』",
        "url": "https://x.com/jesselaunz/status/1980398389780181136",
        "type": "tweet"
      },
      {
        "label": "推文：为什么不要给 AI 设太复杂的 Invalidation 条件",
        "url": "https://x.com/jesselaunz/status/1980375899683143854",
        "type": "tweet"
      },
      {
        "label": "推文：MT5 编程全面交给 Claude 高效迭代",
        "url": "https://x.com/jesselaunz/status/1904837450964623667",
        "type": "tweet"
      },
      {
        "label": "推文：用 Claude Code 写 Polymarket 自动扫描与下注程序",
        "url": "https://x.com/jesselaunz/status/2036332105307992197",
        "type": "tweet"
      }
    ]
  },
  {
    "id": "sop-01-premarket-setup",
    "track": "sop",
    "category": "从零到一实操 SOP 清单",
    "termZh": "实操 SOP-1：盘前 10 分钟『观局选品』与 TradingView 三屏工作台配置",
    "termEn": "SOP-1: 10-Min Pre-Market Currency Scan & TV 3-Pane Setup",
    "level": "实操落地",
    "order": 20,
    "summary": "每天坐到电脑前第 1 步干什么？手把手教你把遁一子的 3 个开源指标装进 TradingView 并在 10 分钟内选出当日最佳狙击货币对。",
    "plainExplanation": "没有标准作业程序（SOP）的交易就像没有检查单的飞行员。本卡片将遁一子散落在 103 条推文中的看盘环境配置浓缩为可直接照着点鼠标的 4 步初始化清单。",
    "jesseApplication": "只需配置一次 TradingView 模板，以后每天盘前花 5~10 分钟走完『看矩阵 → 筛强弱 → 查日历 → 锁标的』四步，即可告别盘中漫无目的乱翻图表。",
    "formulaOrCode": "【TradingView 必装 3 大开源脚本清单】\n1. 观局强弱：搜索 [JL] Nine Currency Comparison (参数：Anchor = SGD, Length = 120)\n2. 击归结构：打开 https://www.tradingview.com/script/HrcAAGcU-JL-Supertrend-Zone-Pivot-Point-with-zigzag-fib/ 点击「添加到收藏指标」\n3. 入微扳机：打开 https://www.tradingview.com/script/qrIjY4WL/ ([JL] Angle of Bollinger Bands Alert) 点击「添加到收藏指标」\n4. 辅助形态：TV 内置指标搜索 All Chart Patterns + Stoch Candle",
    "checklist": [
      "Step 1：打开 fxdiary.com 查看 FX Battlefield 矩阵，记下当日 σ 最强的 2 个货币和最弱的 2 个货币",
      "Step 2：对照 [JL] Nine Currency Comparison 120H 曲线，选出喇叭口持续张开的 1~2 个交叉货币对（如 GBPJPY, EURAUD）",
      "Step 3：查看财经日历（ForexFactory / 金十），确认未来 2 小时内该货币无红标高危数据（CPI/非农/央行决议）",
      "Step 4：在 TradingView 三屏布局（200m / 20m / 2m）中切换至该货币对，进入等待『击归』状态"
    ],
    "pitfalls": "同时打开十几个品种来回切换，哪个动得快就追哪个，完全丢掉了『最强配最弱』的先手优势。",
    "sourceUrls": [
      {
        "label": "工具：FX Battlefield 实时货币强弱与反转雷达",
        "url": "https://fxdiary.com/guide/",
        "type": "tool"
      },
      {
        "label": "TV 脚本：[JL] Supertrend Zone Pivot Point with zigzag fib",
        "url": "https://www.tradingview.com/script/HrcAAGcU-JL-Supertrend-Zone-Pivot-Point-with-zigzag-fib/",
        "type": "tool"
      },
      {
        "label": "TV 脚本：[JL] Angle of Bollinger Bands Alert",
        "url": "https://www.tradingview.com/script/qrIjY4WL/",
        "type": "tool"
      }
    ]
  },
  {
    "id": "sop-02-entry-execution-exit",
    "track": "sop",
    "category": "从零到一实操 SOP 清单",
    "termZh": "实操 SOP-2：盘中『判势→击归→入微』扣扳机与『五路分兵』风控执行表",
    "termEn": "SOP-2: Intraday Entry Checklist & 5-Leg Order Execution",
    "level": "实操落地",
    "order": 21,
    "summary": "从看到信号到下出 5 笔分仓单、设好 20 点推保本与 40 点回撤止盈的完整闭环操作手册。",
    "plainExplanation": "把『知道』变成『做到』的关键，是在下单前用硬性 Checklist 锁死冲动，下单后用机械化分仓规则接管情绪。哪怕你暂时没有部署 Webhook + MT5 自动 EA，也可以在 TradingView 或 MT4/MT5 上用预设脚本或手动分 5 笔限价/市价单 100% 复刻这套逻辑。",
    "jesseApplication": "遵循『三周期全共振才扣扳机，入场即设好五路分兵，满 20 点推保本后关掉盈亏金额显示』。配合本网页顶部的 **『 实操计算器』**，3 秒钟即可算出每路应开多少手。",
    "formulaOrCode": "【盘中实操六步闭环】\n① [200m 判势] 处于多头『夏』季（HH+HL），上方距离强供给区 > 60 pips\n② [20m  击归] [JL] Supertrend 为绿色，价格回落至 50% Fib 折价线（Discount）以下且未破前低 HL\n③ [2m   入微] 布林带窄幅收口后向上张开，[JL] Angle of BB 触发报警，K 线收出强势阳线\n④ [算仓分兵] 打开本页『实操计算器』：设本金 $10,000、风险 1%($100)、止损 20 pips → 总仓位 0.50 手，拆为 5 笔 × 0.10 手\n⑤ [挂止损止盈] 5 笔 SL 统一设在 -20 pips；TP1~TP5 分别设在 +20, +40, +80, +120, +200 pips\n⑥ [动态护盘] 价格触及 +20 pips（TP1 成交）→ 立即将其余 4 笔 SL 移至开仓价；后续从最高浮盈回撤达 40 pips 或 20m Supertrend 变色 → 全部平仓",
    "checklist": [
      "核对①②③三屏条件是否同时满足（缺一不可，少一个条件就继续等 Alert）",
      "用『实操计算器』算出单路手数，确认总止损金额严格 <= 账户净值的 1%",
      "TP1 (+20 pips) 触发后，第一时间把第 2~5 笔订单止损改到开仓价 +1 pip",
      "收盘或平仓后，在本卡片下方 Comments 记下本单复盘笔记（入场理由、是否严守规则）"
    ],
    "pitfalls": "入场时嫌麻烦只下 1 笔整单，结果涨到 +25 点没平又跌回 -20 点止损，彻底失去了五路分兵『进可攻退可守』的数学优势。",
    "sourceUrls": [
      {
        "label": "推文：五路分兵 + 20点推保本 + 40点回撤平仓实盘演练",
        "url": "https://x.com/jesselaunz/status/1655029828390068224",
        "type": "tweet"
      },
      {
        "label": "推文：半自动 EA 如何帮人克服心魔",
        "url": "https://x.com/jesselaunz/status/1653530967112560640",
        "type": "tweet"
      },
      {
        "label": "工具：资金管理曲线模拟器",
        "url": "https://jesselau76.github.io/trading/moni.html",
        "type": "tool"
      }
    ]
  },
  {
    "id": "peers-01-joely-us-stocks",
    "track": "peers",
    "category": "书签库其余四大交易体系精华",
    "termZh": "@joely7758521（价值哥，30条）：美股『5+3+1+1 仓位』+ 恐慌期 Sell Put +『王子落难』LEAPS Call",
    "termEn": "@joely7758521: US Tech 5+3+1+1 Portfolio, Cash-Secured Put & LEAPS Call",
    "level": "跨市场对照",
    "order": 22,
    "summary": "你书签中收藏第 2 多的实战派（30 条）：专注美股科技巨头的『正股底仓 + 暴跌 Sell Put 造无限子弹 + 王子落难分批建仓 1~2 年期 LEAPS Call』体系。",
    "plainExplanation": "如果说遁一子代表了**中短线外汇多品种分形博弈**的极致，那么 `@joely7758521`（价值哥）则代表了**美股长周期高赔率期权+正股复利**的典范。其核心是不做末日轮赌博，只围绕基本面极强的大科技龙头，在市场极度恐慌（王子落难）时利用远期期权（LEAPS Call）放大赔率。",
    "jesseApplication": "**四大核心模块（提炼自 30 条书签）**：\n1. **5+3+1+1 仓位法则**：5 成最懂的核心信仰标的（如 `$TSLA`），3 成行业高确定性垄断标的（`$TSM, $AMD, $ASML, $AAPL, $GOOG`），1 成防守收息股（`$BRKB, $KO`），1 成机动现金。\n2. **暴跌期 Sell Put 造无限子弹**：在好公司大跌、隐含波动率（IV）飙升时卖出远期价外 Put（想接盘的价格），要么白赚丰厚权利金补贴现金流，要么在极低位置折价接盘正股。\n3. **『王子落难』分批买 1~2 年期 LEAPS Call**：绝不在创新高时追买 Call；专等科技巨头因短期利空或大盘恐慌暴跌 20%~40% 时，分批买入到期日在 1~2 年以上、Delta 0.6~0.7 的 LEAPS Call。\n4. **1/3 分批出货法（零成本持仓）**：反弹翻倍后，先卖掉 1/3 ~ 1/2 仓位把全部本金捞回，剩余仓位持仓成本变为负值，从容拿完整个主升浪。",
    "formulaOrCode": "// 价值哥 LEAPS Call 零成本出货公式：\n1. 建仓条件：龙头股跌入周线支撑 + IV 适中 → 分 3 批买入 365~730 DTE (到期天数) Call\n2. 第一目标 (+100% 翻倍)：卖出 50% 仓位 → 抽回 100% 初始本金，剩余 50% 成为『免费彩票』\n3. 第二目标 (前高/估值泡沫区)：再卖出 1/3 锁定利润，留尾仓格局或转正股",
    "checklist": [
      "检查美股持仓是否符合 5（核心）+ 3（行业龙头）+ 1（防守）+ 1（现金）结构",
      "Sell Put 只选『哪怕真跌破行权价我也极其乐意长期持有正股』的顶级龙头",
      "买 Call 只买到期日 > 1 年的 LEAPS Call，严禁碰 1 个月内到期的末日期权"
    ],
    "pitfalls": "在股价连续暴涨、IV 极度膨胀的顶部去追买短期 Call，遭遇『股价横盘但 IV 暴跌（IV Crush）+ 时间价值衰减（Theta）』双杀。",
    "sourceUrls": [
      {
        "label": "推文：5+3+1+1 仓位配置与核心标的体系",
        "url": "https://x.com/joely7758521/status/1893934062563450918",
        "type": "tweet"
      },
      {
        "label": "推文：王子落难时如何分批布局 1~2 年期 LEAPS Call",
        "url": "https://x.com/joely7758521/status/1887698810995937483",
        "type": "tweet"
      },
      {
        "label": "推文：1/3 分批出货法把持仓成本打成负值",
        "url": "https://x.com/joely7758521/status/1891325281283330241",
        "type": "tweet"
      },
      {
        "label": "推文：恐慌期 Sell Put 打造无限子弹现金流",
        "url": "https://x.com/joely7758521/status/1971391450752708628",
        "type": "tweet"
      }
    ]
  },
  {
    "id": "peers-02-0xcherry-ai-quant",
    "track": "peers",
    "category": "书签库其余四大交易体系精华",
    "termZh": "@0xcherry（车厘子，8条）：AI 交易 Agent『OpenAlice』与自动化策略演化『Auto-Quant』",
    "termEn": "@0xcherry: OpenAlice Trading Agent & Karpathy-Style Auto-Quant",
    "level": "跨市场对照",
    "order": 23,
    "summary": "解决『金融数据直接塞给 LLM 导致 Context 爆炸与数字幻觉』的工程化方案：OpenAlice 金融认知架构与单文件自动回测演化的 Auto-Quant。",
    "plainExplanation": "很多开发者尝试把几千根 K 线的 JSON 直接喂给大模型让它下单，结果不仅 Token 瞬间爆炸，LLM 对浮点数字的敏感度还极差。`@0xcherry` 提出了专为 AI Agent 设计的金融感知层与自动化量化迭代范式。",
    "jesseApplication": "**两大开源工程思路（提炼自 8 条书签）**：\n1. **`OpenAlice`（嫁接在 OpenClaw 上的全资产交易 Agent）**：不把原始 Tick/K线数组直接塞进 Prompt，而是通过专门的指标计算与结构化特征提取层，将市场状态转化为语义化信号与确定性风控护栏，支持 Crypto / 美股全天候自治运行。\n2. **`Auto-Quant`（受 Karpathy `autoresearch` 启发）**：借鉴 Andrej Karpathy 让 AI 自动改代码跑实验的思路，严格限制 Agent 每次只修改**单一策略文件（Single Strategy File）**，自动调用回测引擎计算夏普比率（Sharpe）、最大回撤与期望收益——若新版本指标优于基线则 Git Commit 保留，否则自动回滚，实现 24 小时无人值守策略进化！",
    "formulaOrCode": "// Auto-Quant 闭环演化流水线：\nwhile (running) {\n  1. Agent 读取当前最优 strategy.py 与历史回测报告\n  2. 提出单一假设（如：将入场过滤由 RSI(14) 改为布林开口角度 + ATR 过滤）\n  3. 运行确定性沙盒回测 (Backtest Engine, 严禁未来函数)\n  4. if (New_Sharpe > Best_Sharpe && MaxDD <= Threshold) -> git commit (晋级)\n     else -> git checkout strategy.py (丢弃并记录失败教训)\n}",
    "checklist": [
      "构建 AI 交易工具时，将『定量计算（Pine/Python 指标）』与『定性推理（LLM 逻辑）』解耦",
      "尝试用 Auto-Quant 范式对遁一子的『五路分兵止盈阶梯参数（如 20/40/80/120/200）』做跨品种自动化回测寻优"
    ],
    "pitfalls": "让大模型直接心算移动平均线或止损价格，导致低级的算术幻觉引发实盘错单。",
    "sourceUrls": [
      {
        "label": "推文：发布 OpenAlice — 嫁接在 OpenClaw 上的交易 Agent",
        "url": "https://x.com/0xcherry/status/2024433529464205489",
        "type": "tweet"
      },
      {
        "label": "推文：Auto-Quant — 受 Karpathy autoresearch 启发的自动量化演化",
        "url": "https://x.com/0xcherry/status/2046907938741362772",
        "type": "tweet"
      },
      {
        "label": "推文：Auto-Quant 实测迭代效果与单文件约束设计",
        "url": "https://x.com/0xcherry/status/2052697786345467925",
        "type": "tweet"
      }
    ]
  },
  {
    "id": "peers-03-onchain-btc-cycle",
    "track": "peers",
    "category": "书签库其余四大交易体系精华",
    "termZh": "@0xCryptoChan & @Murphychen888 & @_43A6（18条）：BTC 链上周期 MVRV / URPD 逃顶抄底库",
    "termEn": "BTC On-Chain Cycle Indicators: MVRV, LTH-RP, STH Ratio & URPD",
    "level": "跨市场对照",
    "order": 24,
    "summary": "加密货币大周期『観局与判势』圣经：用链上真实换手成本（Realized Price）、MVRV 对数收敛通道、URPD 筹码分布峰谷与 BTI 12合1 复合指标精准定位牛熊顶底。",
    "plainExplanation": "传统技术分析只看交易所的成交价（Price），而区块链的透明账本允许我们看到全网每一枚 BTC 最后一次在链上移动时的真实成本价（**Realized Price，已实现价格**）。这是股票和外汇都不具备的『上帝视角筹码底牌』。",
    "jesseApplication": "**四大硬核链上武器（提炼自 18 条书签）**：\n1. **剔除 >7 年休眠筹码的 LTH Realized Price（@0xCryptoChan #1754043146139504775）**：精准刻画长期持有者（LTH）的真实换手成本底线，跌破或触及往往是世代级大底。\n2. **牛市回调上车触发器（@0xCryptoChan #1765586460798058890）**：当长期牛市结构未变，但短期持有者（STH）盈亏筹码比回踩至 **`4.0`** 附近时，是牛市中途洗盘结束的高胜率『击归』买点。\n3. **URPD 链上筹码分布（@Murphychen888 #1753331946439217362）**：横轴为价格、纵轴为该价格区间沉淀的链上 BTC 数量。筹码密集峰形成强支撑/阻力，而筹码真空区（缺口）价格往往会快速穿越。\n4. **BTI 12合1 复合逃顶指标（@_43A6 #1861813377879929046）**：整合 MVRV Z-Score、Puell Multiple、RHODL 等 12 个链上周期指标，解决单一指标钝化问题。",
    "formulaOrCode": "// 核心链上术语公式：\n• Realized Cap (已实现市值) = Σ (每枚 UTXO 最后链上移动时的价格)\n• MVRV = Market Cap (流通市值) ÷ Realized Cap (已实现市值)\n  ├─ MVRV < 1.0：全网平均处于浮亏状态 → 熊市深底定投区\n  └─ MVRV 触及对数收敛通道上轨：全网获利盘极度丰厚 → 牛市分批逃顶区",
    "checklist": [
      "大资金配置 BTC 现货或长线波段前，先看 MVRV 所处周期位置与 URPD 筹码密集峰",
      "牛市急跌洗盘时，观察 STH 盈亏筹码比是否回落释放恐慌，配合遁一子折价区逻辑分批建仓"
    ],
    "pitfalls": "在牛市每轮周期波动率自然衰减（对数收敛）的背景下，还死等上一轮牛市的绝对 MVRV 数值才肯逃顶，结果坐完整轮过山车。",
    "sourceUrls": [
      {
        "label": "推文：@0xCryptoChan MVRV 对数收敛拟合模型",
        "url": "https://x.com/0xCryptoChan/status/1747819509824757993",
        "type": "tweet"
      },
      {
        "label": "推文：@0xCryptoChan 剔除 >7 年休眠筹码的 LTH Realized Price",
        "url": "https://x.com/0xCryptoChan/status/1754043146139504775",
        "type": "tweet"
      },
      {
        "label": "推文：@Murphychen888 URPD 链上筹码分布全解析",
        "url": "https://x.com/Murphychen888/status/1753331946439217362",
        "type": "tweet"
      },
      {
        "label": "推文：@_43A6 BTI 12合1 复合逃顶指标",
        "url": "https://x.com/_43A6/status/1861813377879929046",
        "type": "tweet"
      }
    ]
  },
  {
    "id": "peers-04-mstr-vol-arb",
    "track": "peers",
    "category": "书签库其余四大交易体系精华",
    "termZh": "@mindaoyang & @bitfish & @taresky（42条）：MSTR 波动率分层套利与稳定币生息现金流",
    "termEn": "MSTR Volatility Stripping Engine & Stablecoin Yield Arbitrage",
    "level": "跨市场对照",
    "order": 25,
    "summary": "看懂资本市场顶层的『金融炼金术』：微策略（MSTR）如何通过可转债与 ATM 增发将 BTC 波动率剥离并放大 2.5 倍分层销售，以及低风险稳定币套利体系。",
    "plainExplanation": "为什么 MSTR 持有比特币，其市值却能长期维持在净资产（mNAV）的 1.5~2.5 倍以上？`@mindaoyang`（杨民道）与 `@bitfish`（神鱼）在书签推文中深刻拆解了 Michael Saylor 的**波动率分层剥离（Volatility Stripping）金融工程**。",
    "jesseApplication": "**两大机构级套利视角（提炼自 42 条书签）**：\n1. **MSTR 波动率炼金术（#1859637646072611254 / #1901481021759254670）**：传统债券基金、保险资金想买高收益或隐含看涨期权，但合规条例禁止它们直接买 BTC。MSTR 向它们发行**零息/低息可转债（Convertible Bonds）与优先股（STRK/STRF）**，把 BTC 的高波动率打包成合规固收+看涨期权卖给华尔街套利基金（Gamma 交易员买债同时做空正股对冲 Delta，赚取波动率溢价）；再用当市价高于 mNAV 时的 **ATM 增发**买成真 BTC，实现每股含币量（BTC Yield）的正向飞轮。\n2. **稳定币低风险现金流（@taresky & @mindaoyang）**：在牛市资金费率（Funding Rate）高企或链上借贷利差拉大时，利用期限套利与生息稳定币构建年化 15%~30% 的 Delta 中性现金流底座。",
    "formulaOrCode": "// MSTR 资本飞轮核心指标：\n• mNAV (市值净资产比) = MSTR 企业价值 ÷ 持仓 BTC 市值\n• 当 mNAV > 1.5x 时：发可转债 + ATM 增发股票买 BTC → 每股含币量 (BTC per Share) 净增长！\n• 可转债套利对冲：买入 MSTR 可转债 (Long Gamma/Vol) + 动态做空 MSTR 正股 (Delta Neutral)",
    "checklist": [
      "交易 MSTR 或相关期权前，先查当前 mNAV 溢价率与隐含波动率（IV）分位数",
      "将闲置美元/稳定币配置在低风险生息或资金费率套利池，作为交易账户的场外现金流后盾"
    ],
    "pitfalls": "不理解 mNAV 溢价收敛机制，在 mNAV 高达 3 倍以上时重仓追高正股而未做任何波动率对冲。",
    "sourceUrls": [
      {
        "label": "推文：@mindaoyang 深度拆解 MSTR 可转债与波动率放大器机制",
        "url": "https://x.com/mindaoyang/status/1859637646072611254",
        "type": "tweet"
      },
      {
        "label": "推文：@bitfish 神鱼剖析 MSTR 波动率分层销售与资本飞轮",
        "url": "https://x.com/bitfish/status/1901481021759254670",
        "type": "tweet"
      },
      {
        "label": "推文：@taresky 低风险稳定币生息与套利配置思考",
        "url": "https://x.com/taresky/status/1383677417328287749",
        "type": "tweet"
      },
      {
        "label": "推文：@mindaoyang 稳定币收益来源与周期流动性拆解",
        "url": "https://x.com/mindaoyang/status/1485873714185277446",
        "type": "tweet"
      }
    ]
  }
];
