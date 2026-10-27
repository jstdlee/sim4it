import { neon } from "@neondatabase/serverless";
import type { Env } from "../env";
import { isAuthed, login as loginSim4Options } from "../auth";
import { LEARNING_CARDS } from "./cards-data";
import { JESSE_TWEETS } from "./tweets-data";

const DEFAULT_PWD = "rudao2026";

function getCookie(req: Request, name: string): string | null {
  const cookie = req.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

async function isRudaoAuthenticated(req: Request, env: Env): Promise<boolean> {
  const pwd = env.RUDAO_PASSWORD || DEFAULT_PWD;
  const url = new URL(req.url);
  if (url.searchParams.get("pwd") === pwd) return true;
  if (req.headers.get("x-access-password") === pwd) return true;
  if (getCookie(req, "rudao_auth") === pwd) return true;
  if (await isAuthed(req, env)) return true;
  return false;
}

function jsonResp(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

export async function handleRudaoRequest(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const pwd = env.RUDAO_PASSWORD || DEFAULT_PWD;

  if (url.pathname === "/rudao/api/login" && req.method === "POST") {
    const body = (await req.json().catch(() => ({}))) as { password?: string };
    const submitted = (body.password || "").trim();
    if (submitted === pwd) {
      return jsonResp(
        { ok: true },
        200,
        { "Set-Cookie": `rudao_auth=${encodeURIComponent(pwd)}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax` }
      );
    }
    const oqCookie = await loginSim4Options(submitted, env);
    if (oqCookie) {
      return jsonResp({ ok: true }, 200, { "Set-Cookie": oqCookie });
    }
    return jsonResp({ ok: false, error: "密码错误" }, 401);
  }

  if (url.pathname === "/rudao/api/logout") {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/rudao",
        "Set-Cookie": "rudao_auth=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
      },
    });
  }

  const authed = await isRudaoAuthenticated(req, env);

  if (url.pathname.startsWith("/rudao/api/")) {
    // Public access enabled for Rudao knowledge hub
    if (!env.DATABASE_URL) {
      return jsonResp({ error: "DATABASE_URL not configured" }, 500);
    }
    const sql = neon(env.DATABASE_URL);

    if (url.pathname === "/rudao/api/state" && req.method === "GET") {
      const [comments, progress] = await Promise.all([
        sql`SELECT id, card_id, card_title, card_category, card_url, source_urls, author, content, note_type, pinned, created_at FROM rudao_card_comments ORDER BY pinned DESC, created_at DESC`,
        sql`SELECT card_id, status, starred, updated_at FROM rudao_card_progress`,
      ]);
      return jsonResp({ comments, progress });
    }

    if (url.pathname === "/rudao/api/comments" && req.method === "POST") {
      const body = (await req.json()) as {
        card_id: string;
        card_title: string;
        card_category: string;
        card_url: string;
        source_urls?: unknown[];
        content: string;
        note_type?: string;
        pinned?: boolean;
      };
      if (!body.card_id || !body.content?.trim()) {
        return jsonResp({ error: "card_id and content required" }, 400);
      }
      const rows = await sql`
        INSERT INTO rudao_card_comments (card_id, card_title, card_category, card_url, source_urls, author, content, note_type, pinned)
        VALUES (
          ${body.card_id},
          ${body.card_title || body.card_id},
          ${body.card_category || "未分类"},
          ${body.card_url || ""},
          ${JSON.stringify(body.source_urls || [])}::jsonb,
          'Me',
          ${body.content.trim()},
          ${body.note_type || "批注"},
          ${Boolean(body.pinned)}
        )
        RETURNING id, card_id, card_title, card_category, card_url, source_urls, author, content, note_type, pinned, created_at
      `;
      return jsonResp({ ok: true, comment: rows[0] });
    }

    if (url.pathname === "/rudao/api/comments" && req.method === "DELETE") {
      const id = Number(url.searchParams.get("id"));
      if (!id) return jsonResp({ error: "id required" }, 400);
      await sql`DELETE FROM rudao_card_comments WHERE id = ${id}`;
      return jsonResp({ ok: true });
    }

    if (url.pathname === "/rudao/api/progress" && req.method === "POST") {
      const body = (await req.json()) as { card_id: string; status?: string; starred?: boolean };
      if (!body.card_id) return jsonResp({ error: "card_id required" }, 400);
      const rows = await sql`
        INSERT INTO rudao_card_progress (card_id, status, starred, updated_at)
        VALUES (${body.card_id}, ${body.status || "未学"}, ${Boolean(body.starred)}, NOW())
        ON CONFLICT (card_id) DO UPDATE SET
          status = COALESCE(EXCLUDED.status, rudao_card_progress.status),
          starred = COALESCE(EXCLUDED.starred, rudao_card_progress.starred),
          updated_at = NOW()
        RETURNING card_id, status, starred, updated_at
      `;
      return jsonResp({ ok: true, progress: rows[0] });
    }

    return jsonResp({ error: "Not found" }, 404);
  }

  // Render Rudao MdBook directly without login wall

  const respHeaders: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
  };
  if (url.searchParams.get("pwd") === pwd) {
    respHeaders["Set-Cookie"] = `rudao_auth=${encodeURIComponent(pwd)}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`;
  }

  return new Response(renderMdBookHtml(), {
    status: 200,
    headers: respHeaders,
  });
}

function renderLoginHtml(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>交易入道 · 概念与实操手册</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      background: #f5f5f7;
      color: #1d1d1f;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    .box {
      background: #ffffff;
      border: 1px solid #d2d2d7;
      border-radius: 8px;
      padding: 32px;
      width: 100%;
      max-width: 360px;
    }
    h1 {
      font-size: 20px;
      margin: 0 0 8px 0;
      font-weight: 600;
      color: #1d1d1f;
    }
    p {
      font-size: 13px;
      color: #6e6e73;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }
    input {
      width: 100%;
      box-sizing: border-box;
      padding: 8px 10px;
      font-size: 14px;
      border: 1px solid #d2d2d7;
      border-radius: 6px;
      margin-bottom: 12px;
      color: #1d1d1f;
    }
    input:focus {
      outline: none;
      border-color: #0066cc;
    }
    button {
      width: 100%;
      padding: 8px 12px;
      background: #0066cc;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
    button:hover { background: #0055b3; }
    .err { color: #d70015; font-size: 12px; margin-bottom: 10px; display: none; }
    .back { display: block; margin-top: 14px; text-align: center; font-size: 12px; color: #0066cc; text-decoration: none; }
    .back:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="box">
    <h1>交易入道 · 概念与实操手册</h1>
    <p>Jesse Lau (@jesselaunz) 交易体系整理与批注手册。请输入访问密码或 Options Quest Token。</p>
    <form id="loginForm">
      <input id="pwdInput" type="password" placeholder="Access Password" required autofocus />
      <div id="errMsg" class="err">密码错误</div>
      <button type="submit">进入手册</button>
    </form>
    <a class="back" href="/">← 返回 Options Quest</a>
  </div>
  <script>
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      var password = document.getElementById('pwdInput').value.trim();
      var res = await fetch('/rudao/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password })
      });
      if (res.ok) location.reload();
      else document.getElementById('errMsg').style.display = 'block';
    });
  </script>
</body>
</html>`;
}

function renderMdBookHtml(): string {
  const safeCardsJson = JSON.stringify(LEARNING_CARDS).replace(/</g, "\\u003c");
  const safeTweetsJson = JSON.stringify(JESSE_TWEETS).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>交易入道：概念术语与实操手册 (@jesselaunz)</title>
  <style>
    :root, html[data-theme="light"] {
      --bg: #fbfbfd;
      --fg: #1d1d1f;
      --secondary: #515154;
      --muted: #86868b;
      --sidebar-bg: #f5f5f7;
      --sidebar-fg: #1d1d1f;
      --sidebar-active-bg: rgba(0, 102, 204, 0.08);
      --sidebar-active-fg: #0066cc;
      --border: #d2d2d7;
      --border-subtle: #e5e5ea;
      --code-bg: #f5f5f7;
      --quote-bg: #f5f5f7;
      --quote-border: #0066cc;
      --link: #0066cc;
      --table-alt: #f5f5f7;
      --btn-bg: #ffffff;
      --btn-hover: #f5f5f7;
    }
    html[data-theme="coal"] {
      --bg: #1d1d1f;
      --fg: #f5f5f7;
      --secondary: #a1a1a6;
      --muted: #86868b;
      --sidebar-bg: #161617;
      --sidebar-fg: #d2d2d7;
      --sidebar-active-bg: rgba(41, 151, 255, 0.14);
      --sidebar-active-fg: #2997ff;
      --border: #38383a;
      --border-subtle: #2c2c2e;
      --code-bg: #161617;
      --quote-bg: #161617;
      --quote-border: #2997ff;
      --link: #2997ff;
      --table-alt: #161617;
      --btn-bg: #2c2c2e;
      --btn-hover: #3a3a3c;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      background: var(--bg);
      color: var(--fg);
      font-size: 16px;
      line-height: 1.72;
      letter-spacing: -0.011em;
      display: flex;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--link); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* Left Navigation Sidebar (280px fixed width per Apple HIG / mdBook) */
    #sidebar {
      width: 280px;
      flex-shrink: 0;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border);
      height: 100vh;
      position: sticky;
      top: 0;
      overflow-y: auto;
      padding: 18px 14px 36px 14px;
      font-size: 13px;
      line-height: 1.5;
    }
    body.sidebar-hidden #sidebar { display: none; }
    .book-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--fg);
      margin: 0 0 4px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }
    .book-meta {
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 10px;
    }
    .sidebar-search {
      width: 100%;
      padding: 6px 10px;
      font-size: 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg);
      color: var(--fg);
      margin-bottom: 12px;
    }
    .sidebar-search:focus { outline: none; border-color: var(--link); }
    .toc-part {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--muted);
      margin: 16px 0 6px 0;
      padding-top: 8px;
      border-top: 1px solid var(--border);
    }
    .toc-part:first-of-type { border-top: none; margin-top: 4px; }
    .toc-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .toc-item a {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 5px 8px;
      color: var(--sidebar-fg);
      text-decoration: none;
      border-radius: 5px;
    }
    .toc-item a:hover { background: var(--btn-hover); }
    .toc-item.active a {
      font-weight: 600;
      color: var(--sidebar-active-fg);
      background: var(--sidebar-active-bg);
    }
    .toc-status {
      font-size: 11px;
      color: var(--muted);
      margin-left: 6px;
      white-space: nowrap;
    }

    /* Main Content Wrapper */
    #page-wrapper {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    #menu-bar {
      height: 48px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      background: var(--bg);
      position: sticky;
      top: 0;
      z-index: 10;
      font-size: 13px;
    }
    .menu-left, .menu-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .menu-btn {
      background: var(--btn-bg);
      color: var(--fg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 12px;
      cursor: pointer;
      line-height: 1.4;
      text-decoration: none;
    }
    .menu-btn:hover { background: var(--btn-hover); text-decoration: none; }

    /* Centered Single-Column Reading Pane (760px max-width) */
    main#content {
      max-width: 760px;
      width: 100%;
      margin: 0 auto;
      padding: 32px 36px 72px 36px;
    }
    h1 {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 6px 0;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-subtle);
      line-height: 1.3;
      color: var(--fg);
    }
    .sub-en {
      font-family: "SF Mono", ui-monospace, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 12px;
    }
    .meta-bar {
      font-size: 12px;
      color: var(--muted);
      padding: 8px 0 14px 0;
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 22px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    h2 {
      font-size: 21px;
      font-weight: 600;
      margin: 1.8em 0 0.6em 0;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--fg);
    }
    h3 {
      font-size: 17px;
      font-weight: 600;
      margin: 1.5em 0 0.5em 0;
      color: var(--fg);
    }
    p { margin: 0 0 14px 0; color: var(--fg); }
    blockquote {
      margin: 0 0 18px 0;
      padding: 12px 16px;
      background: var(--quote-bg);
      border-left: 3px solid var(--quote-border);
      border-radius: 0 6px 6px 0;
      color: var(--fg);
    }
    pre {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 14px 16px;
      overflow-x: auto;
      font-family: "SF Mono", ui-monospace, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      line-height: 1.6;
      margin: 0 0 18px 0;
      white-space: pre-wrap;
    }
    code {
      font-family: "SF Mono", ui-monospace, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      background: var(--code-bg);
      padding: 2px 5px;
      border-radius: 4px;
    }
    pre code { background: none; padding: 0; border-radius: 0; }
    ul, ol { margin: 0 0 18px 0; padding-left: 22px; }
    li { margin-bottom: 6px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 20px 0;
      font-size: 13px;
    }
    th, td {
      border: 1px solid var(--border);
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }
    th { background: var(--code-bg); font-weight: 600; }
    tr:nth-child(even) td { background: var(--table-alt); }

    /* Footnote / Section Comments Area */
    .notes-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }
    .note-item {
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--quote-bg);
      padding: 10px 14px;
      margin-bottom: 10px;
      font-size: 13px;
    }
    .note-header {
      display: flex;
      justify-content: space-between;
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 4px;
    }
    .note-form {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      flex-wrap: wrap;
    }
    .note-form select, .note-form input, .calc-input, .status-select {
      padding: 6px 10px;
      font-size: 13px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg);
      color: var(--fg);
    }
    .note-form input { flex: 1; min-width: 220px; }
    .note-form input:focus, .calc-input:focus { outline: none; border-color: var(--link); }

    /* Prev / Next Chapter Nav */
    .chapter-nav {
      margin-top: 40px;
      padding-top: 18px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-size: 13px;
    }
    .chapter-nav a {
      padding: 7px 14px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--btn-bg);
      color: var(--fg);
      text-decoration: none;
    }
    .chapter-nav a:hover { background: var(--btn-hover); }

    .chapter-divider {
      margin: 48px 0;
      border: none;
      border-top: 1px solid var(--border);
    }

    @media (max-width: 820px) {
      #sidebar {
        position: fixed;
        z-index: 20;
        left: 0;
        top: 48px;
        height: calc(100vh - 48px);
      }
      body.mobile-closed #sidebar { display: none; }
      main#content { padding: 20px 18px 56px 18px; }
    }
  </style>
</head>
<body class="mobile-closed">
  <!-- Left Sidebar: SUMMARY.md -->
  <nav id="sidebar">
    <div class="book-title">交易入道 (@jesselaunz)</div>
    <div class="book-meta">
      进度: <span id="statMastered">0</span>/25 节 · 批注: <span id="statComments">0</span> 条
    </div>
    <input id="sidebarSearch" class="sidebar-search" type="text" placeholder="检索章节、术语或推文..." />
    <div id="tocContainer"></div>
  </nav>

  <!-- Main Book Column -->
  <div id="page-wrapper">
    <header id="menu-bar">
      <div class="menu-left">
        <a class="menu-btn" href="/" title="Back to JSTD Cognitive Nexus">← JSTD Nexus</a>
        <button class="menu-btn" data-action="toggle-sidebar" title="显示或隐藏目录">目录 (TOC)</button>
        <button class="menu-btn" data-action="select-chapter" data-id="notes-index">笔记与URL索引 (<span id="topNotesCount">0</span>)</button>
        <button class="menu-btn" data-action="select-chapter" data-id="all-in-one">全文连读</button>
      </div>
      <div class="menu-right">
        <select class="menu-btn" id="themeSelect" title="切换阅读主题">
          <option value="light">Light (Paper)</option>
          <option value="coal">Dark (Coal)</option>
        </select>
        <a class="menu-btn" href="https://jesselau.com/rudao/" target="_blank" rel="noopener">jesselau.com</a>
        <a class="menu-btn" href="https://fxdiary.com/" target="_blank" rel="noopener">fxdiary.com</a>
      </div>
    </header>

    <main id="content"></main>
  </div>

  <script>
    const LEARNING_CARDS = ${safeCardsJson};
    const JESSE_TWEETS = ${safeTweetsJson};

    const BOOK_CHAPTERS = [];
    let cIdx = 1, rIdx = 1, sIdx = 1, pIdx = 1;
    for (const c of LEARNING_CARDS) {
      let chNum = '';
      let part = '';
      if (c.track === 'concepts') { chNum = '1.' + (cIdx++); part = 'Part I · 核心概念与术语地基'; }
      else if (c.track === 'rudao') { chNum = '2.' + (rIdx++); part = 'Part II · 《交易入道》闲云九法'; }
      else if (c.track === 'sop') { chNum = '3.' + (sIdx++); part = 'Part III · 从零到一实操 SOP'; }
      else { chNum = '4.' + (pIdx++); part = 'Part IV · 书签其余四大交易体系'; }
      BOOK_CHAPTERS.push({
        id: c.id,
        num: chNum,
        part: part,
        title: chNum + ' ' + c.termZh,
        shortTitle: c.termZh,
        type: 'card',
        card: c
      });
    }

    BOOK_CHAPTERS.push({
      id: 'appendix-calculators',
      num: '5.1',
      part: 'Part V · 附录与批注索引',
      title: '5.1 五路分兵仓位与庙算复利计算器',
      shortTitle: '五路分兵与庙算计算器',
      type: 'calculators'
    });
    BOOK_CHAPTERS.push({
      id: 'appendix-tweets',
      num: '5.2',
      part: 'Part V · 附录与批注索引',
      title: '5.2 @jesselaunz 103条书签原推按专题汇编',
      shortTitle: '103条书签原推汇编',
      type: 'tweets'
    });
    BOOK_CHAPTERS.push({
      id: 'notes-index',
      num: '5.3',
      part: 'Part V · 附录与批注索引',
      title: '5.3 笔记与页面 URL 集中回溯索引 (Comments & URLs)',
      shortTitle: '笔记与页面URL集中索引',
      type: 'notes-index'
    });
    BOOK_CHAPTERS.push({
      id: 'all-in-one',
      num: '5.4',
      part: 'Part V · 附录与批注索引',
      title: '5.4 全书 25 节单页连读视图 (All-in-One)',
      shortTitle: '全书单页连读模式',
      type: 'all-in-one'
    });

    let currentChapterId = BOOK_CHAPTERS[0].id;
    let allComments = [];
    let commentsByCard = {};
    let progressByCard = {};
    let tweetCategoryFilter = 'ALL';

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function formatMdInline(str) {
      return escapeHtml(str)
        .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
        .replace(/\\n/g, '<br/>');
    }

    function getDirectUrl(id) {
      return window.location.origin + '/rudao?card=' + encodeURIComponent(id) + '#' + encodeURIComponent(id);
    }

    function copyUrl(id, btnEl) {
      const url = getDirectUrl(id);
      navigator.clipboard.writeText(url);
      if (btnEl) {
        const old = btnEl.textContent;
        btnEl.textContent = '已复制链接';
        setTimeout(() => { btnEl.textContent = old; }, 1400);
      }
    }

    function toggleSidebar() {
      if (window.innerWidth <= 820) {
        document.body.classList.toggle('mobile-closed');
      } else {
        document.body.classList.toggle('sidebar-hidden');
      }
    }

    function setTheme(theme) {
      const valid = theme === 'coal' ? 'coal' : 'light';
      document.documentElement.setAttribute('data-theme', valid);
      localStorage.setItem('rudao_mdbook_theme', valid);
      const sel = document.getElementById('themeSelect');
      if (sel) sel.value = valid;
    }

    async function loadState() {
      try {
        const res = await fetch('/rudao/api/state');
        if (!res.ok) return;
        const data = await res.json();
        allComments = data.comments || [];
        commentsByCard = {};
        for (const c of allComments) {
          if (!commentsByCard[c.card_id]) commentsByCard[c.card_id] = [];
          commentsByCard[c.card_id].push(c);
        }
        progressByCard = {};
        for (const p of (data.progress || [])) {
          progressByCard[p.card_id] = p;
        }
        updateStats();
        renderToc();
        renderMain();
      } catch (e) {
        console.error(e);
      }
    }

    function updateStats() {
      const done = Object.values(progressByCard).filter(p => p.status === '已掌握' || p.status === '实操中').length;
      document.getElementById('statMastered').textContent = done;
      document.getElementById('statComments').textContent = allComments.length;
      document.getElementById('topNotesCount').textContent = allComments.length;
    }

    function renderToc() {
      const q = (document.getElementById('sidebarSearch')?.value || '').trim().toLowerCase();
      const container = document.getElementById('tocContainer');
      let html = '';
      let lastPart = '';

      for (const ch of BOOK_CHAPTERS) {
        if (q) {
          const c = ch.card;
          const hay = c
            ? [ch.title, c.termEn, c.summary, c.plainExplanation, c.jesseApplication].join(' ').toLowerCase()
            : ch.title.toLowerCase();
          if (!hay.includes(q)) continue;
        }
        if (ch.part !== lastPart) {
          if (lastPart !== '') html += '</ul>';
          html += '<div class="toc-part">' + escapeHtml(ch.part) + '</div><ul class="toc-list">';
          lastPart = ch.part;
        }
        const isActive = ch.id === currentChapterId;
        const st = progressByCard[ch.id]?.status || '';
        const cCount = (commentsByCard[ch.id] || []).length;
        let suffix = '';
        if (cCount > 0) suffix += '[' + cCount + '注] ';
        if (st && st !== '未学') suffix += st;

        html += '<li class="toc-item ' + (isActive ? 'active' : '') + '">' +
          '<a href="/rudao?card=' + encodeURIComponent(ch.id) + '#' + encodeURIComponent(ch.id) + '" data-action="select-chapter" data-id="' + escapeHtml(ch.id) + '">' +
            '<span>' + escapeHtml(ch.num + ' ' + ch.shortTitle) + '</span>' +
            (suffix ? '<span class="toc-status">' + escapeHtml(suffix) + '</span>' : '') +
          '</a>' +
        '</li>';
      }
      if (lastPart !== '') html += '</ul>';
      container.innerHTML = html;
    }

    function selectChapter(id) {
      currentChapterId = id;
      history.replaceState(null, '', '/rudao?card=' + encodeURIComponent(id) + '#' + encodeURIComponent(id));
      if (window.innerWidth <= 820) document.body.classList.add('mobile-closed');
      renderToc();
      renderMain();
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    function renderCardChapterHtml(ch, includeCommentsForm) {
      const card = ch.card;
      const st = progressByCard[card.id]?.status || '未学';
      const directUrl = getDirectUrl(card.id);
      const srcLinks = (card.sourceUrls || []).map((s, i) =>
        '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">[' + (i + 1) + '] ' + escapeHtml(s.label) + '</a>'
      ).join(' &nbsp;·&nbsp; ');

      const checklistItems = (card.checklist || []).map(item =>
        '<li>' + formatMdInline(item) + '</li>'
      ).join('');

      let html = '<article id="' + escapeHtml(card.id) + '">' +
        '<h1>' + escapeHtml(ch.title) + '</h1>' +
        '<div class="sub-en">' + escapeHtml(card.termEn) + ' &nbsp;|&nbsp; 分类: ' + escapeHtml(card.category) + ' &nbsp;|&nbsp; 阶段: ' + escapeHtml(card.level) + '</div>' +
        '<div class="meta-bar">' +
          '<div>' +
            '学习状态: ' +
            '<select class="status-select" data-action="update-status" data-id="' + escapeHtml(card.id) + '" style="font-size:12px;padding:2px 6px;">' +
              '<option value="未学" ' + (st === '未学' ? 'selected' : '') + '>未学</option>' +
              '<option value="学习中" ' + (st === '学习中' ? 'selected' : '') + '>学习中</option>' +
              '<option value="实操中" ' + (st === '实操中' ? 'selected' : '') + '>实操中</option>' +
              '<option value="已掌握" ' + (st === '已掌握' ? 'selected' : '') + '>已掌握</option>' +
            '</select>' +
          '</div>' +
          '<div>' +
            '本节直达 URL: <code>' + escapeHtml(directUrl) + '</code> ' +
            '<button class="menu-btn" data-action="copy-url" data-id="' + escapeHtml(card.id) + '">复制链接</button>' +
          '</div>' +
        '</div>' +

        '<blockquote><strong>核心定义：</strong>' + formatMdInline(card.summary) + '</blockquote>' +

        '<h2>1. 概念与术语详解</h2>' +
        '<p>' + formatMdInline(card.plainExplanation) + '</p>' +

        '<h2>2. 遁一子 (@jesselaunz) 实战应用</h2>' +
        '<p>' + formatMdInline(card.jesseApplication) + '</p>' +

        '<h2>3. 量化公式、参数与脚本逻辑</h2>' +
        '<pre><code>' + escapeHtml(card.formulaOrCode) + '</code></pre>' +

        '<h2>4. 实操核对清单 (Checklist)</h2>' +
        '<ul>' + checklistItems + '</ul>' +

        '<h2>5. 常见误区与避坑边界</h2>' +
        '<blockquote>' + formatMdInline(card.pitfalls) + '</blockquote>' +

        '<h2>6. 原始出处与参考链接</h2>' +
        '<p style="font-size:13px;">' + (srcLinks || '无') + '</p>';

      if (includeCommentsForm) {
        html += renderCommentsBlock(card.id);
      }
      html += '</article>';
      return html;
    }

    function renderCommentsBlock(cardId) {
      const list = commentsByCard[cardId] || [];
      const itemsHtml = list.map(c =>
        '<div class="note-item">' +
          '<div class="note-header">' +
            '<span><strong>[' + escapeHtml(c.note_type || '批注') + ']</strong> · ' + new Date(c.created_at).toLocaleString('zh-CN') + '</span>' +
            '<a href="javascript:void(0)" data-action="delete-comment" data-comment-id="' + c.id + '" style="color:var(--muted);">删除</a>' +
          '</div>' +
          '<div style="white-space:pre-wrap;">' + escapeHtml(c.content) + '</div>' +
        '</div>'
      ).join('');

      return '<section class="notes-section">' +
        '<h3>本节读书批注与实操笔记 (' + list.length + ' 条) — <a href="javascript:void(0)" data-action="select-chapter" data-id="notes-index">查看全书批注与URL汇总表</a></h3>' +
        (itemsHtml || '<p style="font-size:13px;color:var(--muted);">暂无批注。在下方记录你的理解或复盘体会，将自动同步至 Neon 数据库与全书索引。</p>') +
        '<div class="note-form">' +
          '<select id="ntype-' + escapeHtml(cardId) + '">' +
            '<option value="心得体会">心得体会</option>' +
            '<option value="实盘复盘">实盘复盘</option>' +
            '<option value="关键参数">关键参数</option>' +
            '<option value="疑问待查">疑问待查</option>' +
          '</select>' +
          '<input id="ninput-' + escapeHtml(cardId) + '" data-submit-card="' + escapeHtml(cardId) + '" type="text" placeholder="添加本节批注 (回车提交)..." />' +
          '<button class="menu-btn" data-action="submit-comment" data-id="' + escapeHtml(cardId) + '">保存批注</button>' +
        '</div>' +
      '</section>';
    }

    function renderNotesIndexHtml() {
      const rows = allComments.map(c => {
        const directUrl = getDirectUrl(c.card_id);
        let srcList = [];
        try {
          srcList = Array.isArray(c.source_urls) ? c.source_urls : JSON.parse(c.source_urls || '[]');
        } catch (e) {}
        const srcHtml = srcList.map(s => {
          const u = typeof s === 'string' ? s : s.url;
          const l = typeof s === 'string' ? u : (s.label || u);
          return '<div><a href="' + escapeHtml(u) + '" target="_blank" rel="noopener">' + escapeHtml(l) + '</a></div>';
        }).join('');

        return '<tr>' +
          '<td>' +
            '<strong><a href="javascript:void(0)" data-action="jump-item" data-id="' + escapeHtml(c.card_id) + '">' + escapeHtml(c.card_title) + '</a></strong>' +
            '<div style="font-size:11px;color:var(--muted);margin-top:2px;">' + escapeHtml(c.card_category) + ' · ' + escapeHtml(c.note_type || '批注') + '</div>' +
          '</td>' +
          '<td style="white-space:pre-wrap;">' + escapeHtml(c.content) + '</td>' +
          '<td style="font-size:12px;word-break:break-all;">' +
            '<div><strong>页面直达:</strong> <a href="' + escapeHtml(directUrl) + '" data-action="jump-item" data-id="' + escapeHtml(c.card_id) + '">' + escapeHtml(directUrl) + '</a></div>' +
            (srcHtml ? '<div style="margin-top:4px;"><strong>原文参考:</strong>' + srcHtml + '</div>' : '') +
          '</td>' +
          '<td style="font-size:12px;white-space:nowrap;">' +
            new Date(c.created_at).toLocaleString('zh-CN') + '<br/>' +
            '<a href="javascript:void(0)" data-action="delete-comment" data-comment-id="' + c.id + '" style="color:var(--muted);">删除</a>' +
          '</td>' +
        '</tr>';
      }).join('');

      const optionsHtml = BOOK_CHAPTERS.filter(ch => ch.type === 'card').map(ch =>
        '<option value="' + escapeHtml(ch.id) + '">' + escapeHtml(ch.title) + '</option>'
      ).join('');

      return '<article>' +
        '<h1>5.3 笔记与页面 URL 集中回溯索引 (Comments & URLs)</h1>' +
        '<p style="color:var(--muted);font-size:13px;">集中汇总全书各章节与 103 条推文下的所有批注、章节页面直达 URL 及原始出处 URL。</p>' +
        '<div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
          '<span>共 <strong>' + allComments.length + '</strong> 条批注记录（云端持久化于 Neon Postgres）</span>' +
          '<button class="menu-btn" data-action="export-markdown">导出全部笔记与URL (Markdown)</button>' +
        '</div>' +

        '<table>' +
          '<thead><tr><th style="width:22%;">所属章节 / 卡片</th><th style="width:38%;">批注与笔记内容</th><th style="width:28%;">页面直达 URL & 原文链接</th><th style="width:12%;">时间 / 操作</th></tr></thead>' +
          '<tbody>' + (rows || '<tr><td colspan="4">暂无批注记录</td></tr>') + '</tbody>' +
        '</table>' +

        '<h2>快速新增批注</h2>' +
        '<div class="note-form">' +
          '<select id="hubCardSel">' + optionsHtml + '</select>' +
          '<select id="hubTypeSel">' +
            '<option value="心得体会">心得体会</option>' +
            '<option value="实盘复盘">实盘复盘</option>' +
            '<option value="关键参数">关键参数</option>' +
            '<option value="疑问待查">疑问待查</option>' +
          '</select>' +
          '<input id="hubNoteInput" data-submit-hub="1" type="text" placeholder="输入笔记内容 (回车保存)..." />' +
          '<button class="menu-btn" data-action="submit-hub-comment">添加至索引</button>' +
        '</div>' +
      '</article>';
    }

    function renderCalculatorsHtml() {
      return '<article>' +
        '<h1>5.1 五路分兵仓位与庙算复利计算器</h1>' +
        '<p>根据《交易入道》第四式「速胜与分兵」与第五式「庙算」设计的实操参数计算表。</p>' +

        '<h2>一、五路分兵仓位与 +20 Pips 推保本计算表</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:16px;">' +
          '<label style="font-size:12px;">账户本金 (USD)<br/><input id="cBal" class="calc-input" style="width:100%" type="number" value="10000" /></label>' +
          '<label style="font-size:12px;">单笔风险比例 (%)<br/><input id="cRisk" class="calc-input" style="width:100%" type="number" step="0.1" value="1.0" /></label>' +
          '<label style="font-size:12px;">初始止损点数 (Pips)<br/><input id="cSl" class="calc-input" style="width:100%" type="number" value="20" /></label>' +
          '<label style="font-size:12px;">每标准手点值 ($)<br/><input id="cPip" class="calc-input" style="width:100%" type="number" value="10" /></label>' +
        '</div>' +
        '<div id="splitTableOut"></div>' +

        '<h2>二、庙算 RP-N-WR 铁三角复利计算表</h2>' +
        '<p style="font-size:13px;">公式：<code>利润倍数 = (1 + SL × RP)^(N × WR) × (1 - SL)^(N × (1 - WR))</code>（剔除 0R 保本单后的净有效场次）</p>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:16px;">' +
          '<label style="font-size:12px;">单笔风险 SL (%)<br/><input id="mSl" class="calc-input" style="width:100%" type="number" step="0.1" value="1.0" /></label>' +
          '<label style="font-size:12px;">平均盈亏比 RP<br/><input id="mRp" class="calc-input" style="width:100%" type="number" step="0.1" value="2.2" /></label>' +
          '<label style="font-size:12px;">有效胜率 WR (%)<br/><input id="mWr" class="calc-input" style="width:100%" type="number" step="1" value="55" /></label>' +
          '<label style="font-size:12px;">有效场次 N<br/><input id="mN" class="calc-input" style="width:100%" type="number" value="100" /></label>' +
        '</div>' +
        '<div id="miaosuanOut"></div>' +
      '</article>';
    }

    function updateCalcs() {
      const bal = parseFloat(document.getElementById('cBal')?.value || '10000');
      const riskPct = parseFloat(document.getElementById('cRisk')?.value || '1.0');
      const slPips = parseFloat(document.getElementById('cSl')?.value || '20');
      const pipVal = parseFloat(document.getElementById('cPip')?.value || '10');

      const riskUsd = bal * (riskPct / 100);
      const rawTotalLots = riskUsd / (slPips * pipVal);
      const legLot = Math.max(0.01, Math.round((rawTotalLots / 5) * 100) / 100);
      const totalLots = legLot * 5;
      const tps = [20, 40, 80, 120, 200];

      const rows = tps.map((tp, i) => {
        const profit = (tp * pipVal * legLot).toFixed(2);
        const r = (tp / slPips).toFixed(1);
        const rule = i === 0
          ? '触及 +20 pips 止盈；其余 4 路止损立即移至开仓价 (Breakeven)'
          : i === 4
          ? '极值目标；若浮盈从最高点回撤满 40 pips 则全部平仓'
          : '阶梯止盈落袋';
        return '<tr><td>第 ' + (i + 1) + ' 路</td><td><code>' + legLot.toFixed(2) + '</code> 手</td><td>+' + tp + ' pips (' + r + 'R)</td><td>+$' + profit + '</td><td>' + rule + '</td></tr>';
      }).join('');

      const splitEl = document.getElementById('splitTableOut');
      if (splitEl) {
        splitEl.innerHTML =
          '<p>单笔风险额: <strong>$' + riskUsd.toFixed(2) + '</strong> &nbsp;|&nbsp; 应开总手数: <strong>' + totalLots.toFixed(2) + ' 手</strong> (拆分为 5 笔 × <code>' + legLot.toFixed(2) + '</code> 手) &nbsp;|&nbsp; 日内 4% 硬熔断线: <strong>-$' + (bal * 0.04).toFixed(2) + '</strong></p>' +
          '<table><thead><tr><th>分兵路数</th><th>单路手数</th><th>止盈目标 (TP)</th><th>单路预计收益</th><th>EA 执行规则</th></tr></thead><tbody>' + rows + '</tbody></table>';
      }

      const mSl = parseFloat(document.getElementById('mSl')?.value || '1.0') / 100;
      const mRp = parseFloat(document.getElementById('mRp')?.value || '2.2');
      const mWr = parseFloat(document.getElementById('mWr')?.value || '55') / 100;
      const mN = parseFloat(document.getElementById('mN')?.value || '100');

      const wins = mN * mWr;
      const losses = mN * (1 - mWr);
      const winFactor = Math.pow(1 + mSl * mRp, wins);
      const lossFactor = Math.pow(1 - mSl, losses);
      const mult = winFactor * lossFactor;
      const expR = mWr * mRp - (1 - mWr);
      const kelly = ((mWr * mRp - (1 - mWr)) / mRp) * 100;

      const msEl = document.getElementById('miaosuanOut');
      if (msEl) {
        msEl.innerHTML =
          '<table><thead><tr><th>期末净值倍数</th><th>单笔数学期望 (E)</th><th>盈利幂次项</th><th>亏损幂次项</th><th>理论凯利上限</th></tr></thead>' +
          '<tbody><tr>' +
            '<td><strong>' + mult.toFixed(2) + 'x</strong> (' + ((mult - 1) * 100).toFixed(1) + '%)</td>' +
            '<td>' + (expR > 0 ? '+' : '') + expR.toFixed(2) + ' R</td>' +
            '<td><code>' + winFactor.toFixed(2) + 'x</code> (' + wins.toFixed(0) + ' 胜)</td>' +
            '<td><code>' + lossFactor.toFixed(2) + 'x</code> (' + losses.toFixed(0) + ' 负)</td>' +
            '<td>' + Math.max(0, kelly).toFixed(1) + '%</td>' +
          '</tr></tbody></table>';
      }
    }

    function renderTweetsChapterHtml() {
      const cats = ['ALL', ...Array.from(new Set(JESSE_TWEETS.map(t => t.subCategory)))];
      const catBtns = cats.map(c =>
        '<button class="menu-btn" data-action="filter-tweet-cat" data-cat="' + escapeHtml(c) + '" style="' + (tweetCategoryFilter === c ? 'font-weight:600;border-color:var(--link);color:var(--link);' : '') + '">' +
          escapeHtml(c === 'ALL' ? '全部 (' + JESSE_TWEETS.length + ')' : c) +
        '</button>'
      ).join(' ');

      const list = JESSE_TWEETS.filter(t => tweetCategoryFilter === 'ALL' || t.subCategory === tweetCategoryFilter);

      const itemsHtml = list.map((t, idx) => {
        const tComments = commentsByCard[t.id] || [];
        const ext = (t.externalUrls || []).map(u => '<a href="' + escapeHtml(u) + '" target="_blank" rel="noopener">' + escapeHtml(u) + '</a>').join(' · ');
        const cHtml = tComments.map(c =>
          '<div class="note-item"><div class="note-header"><span>[' + escapeHtml(c.note_type || '批注') + '] ' + new Date(c.created_at).toLocaleString('zh-CN') + '</span><a href="javascript:void(0)" data-action="delete-comment" data-comment-id="' + c.id + '">删除</a></div><div>' + escapeHtml(c.content) + '</div></div>'
        ).join('');

        return '<section id="' + escapeHtml(t.id) + '" style="padding:14px 0;border-bottom:1px solid var(--border-subtle);">' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:6px;flex-wrap:wrap;gap:6px;">' +
            '<span><strong>#' + (idx + 1) + '</strong> · 分类: ' + escapeHtml(t.subCategory) + ' · 日期: ' + escapeHtml(t.date) + '</span>' +
            '<span>' +
              '<a href="' + escapeHtml(t.tweetUrl) + '" target="_blank" rel="noopener">X 原推链接</a> &nbsp;|&nbsp; ' +
              '<a href="javascript:void(0)" data-action="copy-url" data-id="' + escapeHtml(t.id) + '">复制本条直达URL</a>' +
            '</span>' +
          '</div>' +
          '<p style="white-space:pre-wrap;margin-bottom:8px;">' + escapeHtml(t.fullText) + '</p>' +
          (ext ? '<div style="font-size:12px;margin-bottom:8px;">关联外部链接: ' + ext + '</div>' : '') +
          cHtml +
          '<div class="note-form" style="margin-top:6px;">' +
            '<input id="ninput-' + escapeHtml(t.id) + '" data-submit-tweet="' + escapeHtml(t.id) + '" type="text" placeholder="添加此条推文批注 (回车保存)..." />' +
            '<button class="menu-btn" data-action="submit-tweet-comment" data-id="' + escapeHtml(t.id) + '">添加批注</button>' +
          '</div>' +
        '</section>';
      }).join('');

      return '<article>' +
        '<h1>5.2 @jesselaunz 103条书签原推按专题汇编</h1>' +
        '<p style="font-size:13px;color:var(--muted);">从 Neon 书签库完整提取的 103 条推文原文及解析后的短链。任意推文下添加的批注均自动收录至「5.3 笔记与页面 URL 集中回溯索引」。</p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">' + catBtns + '</div>' +
        itemsHtml +
      '</article>';
    }

    function renderMain() {
      const container = document.getElementById('content');
      const idx = BOOK_CHAPTERS.findIndex(c => c.id === currentChapterId);
      const ch = idx >= 0 ? BOOK_CHAPTERS[idx] : BOOK_CHAPTERS[0];

      let bodyHtml = '';
      if (ch.type === 'card') {
        bodyHtml = renderCardChapterHtml(ch, true);
      } else if (ch.type === 'calculators') {
        bodyHtml = renderCalculatorsHtml();
      } else if (ch.type === 'tweets') {
        bodyHtml = renderTweetsChapterHtml();
      } else if (ch.type === 'notes-index') {
        bodyHtml = renderNotesIndexHtml();
      } else if (ch.type === 'all-in-one') {
        bodyHtml = '<h1>5.4 全书 25 节单页连读视图</h1><p style="color:var(--muted);font-size:13px;">本页将全部 25 节概念、闲云九法、实操 SOP 与跨市场体系按顺序拼接，方便全文检索或打印阅读。</p><hr class="chapter-divider"/>' +
          BOOK_CHAPTERS.filter(x => x.type === 'card').map(x => renderCardChapterHtml(x, true)).join('<hr class="chapter-divider"/>');
      }

      const prevCh = idx > 0 ? BOOK_CHAPTERS[idx - 1] : null;
      const nextCh = idx >= 0 && idx < BOOK_CHAPTERS.length - 1 ? BOOK_CHAPTERS[idx + 1] : null;

      bodyHtml += '<nav class="chapter-nav">' +
        (prevCh
          ? '<a href="/rudao?card=' + encodeURIComponent(prevCh.id) + '" data-action="select-chapter" data-id="' + escapeHtml(prevCh.id) + '">‹ 上一节: ' + escapeHtml(prevCh.num + ' ' + prevCh.shortTitle) + '</a>'
          : '<span></span>') +
        (nextCh
          ? '<a href="/rudao?card=' + encodeURIComponent(nextCh.id) + '" data-action="select-chapter" data-id="' + escapeHtml(nextCh.id) + '">下一节: ' + escapeHtml(nextCh.num + ' ' + nextCh.shortTitle) + ' ›</a>'
          : '<span></span>') +
      '</nav>';

      container.innerHTML = bodyHtml;
      if (ch.type === 'calculators') updateCalcs();
    }

    function jumpToItem(cardId) {
      if (cardId.startsWith('tw-')) {
        tweetCategoryFilter = 'ALL';
        currentChapterId = 'appendix-tweets';
        renderToc();
        renderMain();
        setTimeout(() => {
          const el = document.getElementById(cardId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 60);
      } else {
        selectChapter(cardId);
      }
    }

    async function submitComment(cardId) {
      const ch = BOOK_CHAPTERS.find(c => c.id === cardId);
      if (!ch || !ch.card) return;
      const input = document.getElementById('ninput-' + cardId);
      const typeSel = document.getElementById('ntype-' + cardId);
      const content = (input?.value || '').trim();
      if (!content) return;

      const res = await fetch('/rudao/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: cardId,
          card_title: ch.title,
          card_category: ch.card.category,
          card_url: getDirectUrl(cardId),
          source_urls: ch.card.sourceUrls || [],
          content: content,
          note_type: typeSel?.value || '心得体会'
        })
      });
      if (res.ok) {
        input.value = '';
        await loadState();
      }
    }

    async function submitTweetComment(tweetId) {
      const tw = JESSE_TWEETS.find(t => t.id === tweetId);
      if (!tw) return;
      const input = document.getElementById('ninput-' + tweetId);
      const content = (input?.value || '').trim();
      if (!content) return;

      const srcUrls = [{ label: 'X 原推', url: tw.tweetUrl, type: 'tweet' }]
        .concat((tw.externalUrls || []).map(u => ({ label: '外部链接', url: u, type: 'tool' })));

      const res = await fetch('/rudao/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: tw.id,
          card_title: '[推文 ' + tw.date + '] ' + tw.title,
          card_category: '原推汇编 · ' + tw.subCategory,
          card_url: getDirectUrl(tw.id),
          source_urls: srcUrls,
          content: content,
          note_type: '心得体会'
        })
      });
      if (res.ok) {
        input.value = '';
        await loadState();
      }
    }

    async function submitHubComment() {
      const cardId = document.getElementById('hubCardSel')?.value;
      const noteType = document.getElementById('hubTypeSel')?.value || '心得体会';
      const input = document.getElementById('hubNoteInput');
      const content = (input?.value || '').trim();
      const ch = BOOK_CHAPTERS.find(c => c.id === cardId);
      if (!ch || !ch.card || !content) return;

      const res = await fetch('/rudao/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: ch.id,
          card_title: ch.title,
          card_category: ch.card.category,
          card_url: getDirectUrl(ch.id),
          source_urls: ch.card.sourceUrls || [],
          content: content,
          note_type: noteType
        })
      });
      if (res.ok) {
        input.value = '';
        await loadState();
      }
    }

    async function deleteComment(id) {
      const res = await fetch('/rudao/api/comments?id=' + id, { method: 'DELETE' });
      if (res.ok) await loadState();
    }

    async function updateStatus(cardId, status) {
      const res = await fetch('/rudao/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId, status: status })
      });
      if (res.ok) await loadState();
    }

    function exportMarkdown() {
      let md = '# 《交易入道》(@jesselaunz) 读书批注与 URL 索引\\n\\n';
      md += '导出时间: ' + new Date().toLocaleString('zh-CN') + '\\n\\n';
      for (const c of allComments) {
        const directUrl = getDirectUrl(c.card_id);
        md += '## ' + c.card_title + ' [' + (c.note_type || '批注') + ']\\n';
        md += '- 分类: ' + c.card_category + '\\n';
        md += '- 时间: ' + new Date(c.created_at).toLocaleString('zh-CN') + '\\n';
        md += '- 页面直达 URL: ' + directUrl + '\\n';
        try {
          const srcs = Array.isArray(c.source_urls) ? c.source_urls : JSON.parse(c.source_urls || '[]');
          for (const s of srcs) {
            md += '- 原文链接: [' + (s.label || s.url) + '](' + s.url + ')\\n';
          }
        } catch (e) {}
        md += '\\n> ' + (c.content || '').replace(/\\n/g, '\\n> ') + '\\n\\n---\\n\\n';
      }
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'jesse-rudao-mdbook-notes.md';
      a.click();
    }

    // Delegated Event Listeners (per apple-design-ui section 4)
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const action = target.getAttribute('data-action');
      if (action === 'toggle-sidebar') {
        e.preventDefault();
        toggleSidebar();
      } else if (action === 'select-chapter') {
        e.preventDefault();
        const id = target.getAttribute('data-id');
        if (id) selectChapter(id);
      } else if (action === 'copy-url') {
        e.preventDefault();
        const id = target.getAttribute('data-id');
        if (id) copyUrl(id, target);
      } else if (action === 'submit-comment') {
        e.preventDefault();
        const id = target.getAttribute('data-id');
        if (id) submitComment(id);
      } else if (action === 'submit-tweet-comment') {
        e.preventDefault();
        const id = target.getAttribute('data-id');
        if (id) submitTweetComment(id);
      } else if (action === 'submit-hub-comment') {
        e.preventDefault();
        submitHubComment();
      } else if (action === 'delete-comment') {
        e.preventDefault();
        const cid = target.getAttribute('data-comment-id');
        if (cid) deleteComment(cid);
      } else if (action === 'jump-item') {
        e.preventDefault();
        const id = target.getAttribute('data-id');
        if (id) jumpToItem(id);
      } else if (action === 'filter-tweet-cat') {
        e.preventDefault();
        tweetCategoryFilter = target.getAttribute('data-cat') || 'ALL';
        renderMain();
      } else if (action === 'export-markdown') {
        e.preventDefault();
        exportMarkdown();
      }
    });

    document.addEventListener('change', (e) => {
      const target = e.target;
      if (target.id === 'themeSelect') {
        setTheme(target.value);
      } else if (target.getAttribute('data-action') === 'update-status') {
        const id = target.getAttribute('data-id');
        if (id) updateStatus(id, target.value);
      }
    });

    document.addEventListener('input', (e) => {
      const target = e.target;
      if (target.id === 'sidebarSearch') {
        renderToc();
      } else if (target.classList.contains('calc-input')) {
        updateCalcs();
      }
    });

    document.addEventListener('keydown', (e) => {
      const target = e.target;
      if (e.key === 'Enter') {
        const cardId = target.getAttribute?.('data-submit-card');
        if (cardId) {
          e.preventDefault();
          submitComment(cardId);
          return;
        }
        const tweetId = target.getAttribute?.('data-submit-tweet');
        if (tweetId) {
          e.preventDefault();
          submitTweetComment(tweetId);
          return;
        }
        if (target.getAttribute?.('data-submit-hub')) {
          e.preventDefault();
          submitHubComment();
          return;
        }
      }
      const tag = (target.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const idx = BOOK_CHAPTERS.findIndex(c => c.id === currentChapterId);
        if (idx < 0) return;
        if (e.key === 'ArrowLeft' && idx > 0) {
          selectChapter(BOOK_CHAPTERS[idx - 1].id);
        } else if (e.key === 'ArrowRight' && idx < BOOK_CHAPTERS.length - 1) {
          selectChapter(BOOK_CHAPTERS[idx + 1].id);
        }
      }
    });

    window.addEventListener('DOMContentLoaded', async () => {
      const savedTheme = localStorage.getItem('rudao_mdbook_theme') || 'light';
      setTheme(savedTheme);

      const params = new URLSearchParams(window.location.search);
      const cardParam = params.get('card') || (window.location.hash ? window.location.hash.slice(1) : '');
      const tabParam = params.get('tab');
      const trackParam = params.get('track');
      if (tabParam === 'notes-hub') {
        currentChapterId = 'notes-index';
      } else if (tabParam === 'calculators') {
        currentChapterId = 'appendix-calculators';
      } else if (tabParam === 'tweets') {
        currentChapterId = 'appendix-tweets';
      } else if (trackParam) {
        const firstInTrack = LEARNING_CARDS.find(c => c.track === trackParam);
        if (firstInTrack) currentChapterId = firstInTrack.id;
      } else if (cardParam) {
        if (cardParam.startsWith('tw-')) {
          currentChapterId = 'appendix-tweets';
        } else if (BOOK_CHAPTERS.some(c => c.id === cardParam)) {
          currentChapterId = cardParam;
        }
      }

      renderToc();
      renderMain();
      await loadState();

      if (cardParam && cardParam.startsWith('tw-')) {
        setTimeout(() => {
          const el = document.getElementById(cardParam);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    });
  </script>
</body>
</html>`;
}
