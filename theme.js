// ==UserScript==
// @name         Luogu Problem Glass Theme v0.8 (Final Fix)
// @namespace    https://www.luogu.com.cn/
// @version      0.8
// @description  毛玻璃动漫风v3，精准难度颜色，极致紧凑布局，彻底去除条纹
// @match        https://www.luogu.com.cn/problem/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const WALLPAPER_KEY = 'lg_glass_wallpaper_dataurl_v1';
  const PANEL_ID = 'lg-glass-panel';
  const STYLE_ID = 'lg-glass-style';

  // 难度颜色映射表 (根据用户要求精准RGB)
  const DIFFICULTY_COLOR_MAP = {
    "入门": "rgb(254, 76, 97)",
    "普及-": "rgb(243, 156, 17)",
    "普及": "rgb(255, 193, 22)",
    "普及+/提高−": "rgb(82, 196, 26)",
    "提高": "rgb(19, 194, 194)",
    "提高+/省选−": "rgb(52, 152, 219)",
    "省选/NOI−": "rgb(157, 61, 207)",
    "NOI/NOI+/CTS": "rgb(14, 29, 105)"
  };

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }
  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }
  function getPageRoot() {
    return qs('.theme-page.theme-frosted') || qs('.theme-page') || document.body;
  }

  // 装饰侧边第一张卡片
  function decorateFirstInfoCard() {
    const firstCard = qs('.sidebar-container.reverse.layout .side > .l-card:first-of-type');
    if (!firstCard) return;

    // 获取所有直接子元素中的信息行和链接
    const children = Array.from(firstCard.children).filter(el =>
      el.matches('.l-flex-info-row, a')
    );

    children.forEach((el, idx) => {
      if (el.classList.contains('lg-decorated')) return;
      el.classList.add('lg-decorated');

      // 前4个是信息统计卡片 (2x2布局)
      if (idx < 4 && el.matches('.l-flex-info-row')) {
        el.classList.add('lg-info-stat');
        el.classList.add(`lg-stat-${idx}`);

        const label = el.querySelector('span:first-child');
        const value = el.querySelector('span:last-child, a');

        if (label) label.classList.add('label');
        if (value) value.classList.add('value');

        // 特殊处理难度颜色 (idx=2)
        if (idx === 2) {
          applyDifficultyColor(value);
        }
      }
      // 后3个是功能按钮 (并排布局)
      else if (el.matches('a')) {
        const linkIndex = idx - 4;
        el.classList.add('lg-info-link');
        el.classList.add(`lg-link-${linkIndex}`);

        const svg = el.querySelector('svg');
        if (svg) svg.classList.add('lg-link-icon');
      }
    });
  }

  // 精准应用难度颜色
  function applyDifficultyColor(valueEl) {
    if (!valueEl) return;

    // 获取难度文本，去除空白
    const text = valueEl.textContent.trim();

    // 在映射表中查找颜色
    let targetColor = null;
    for (const [key, color] of Object.entries(DIFFICULTY_COLOR_MAP)) {
      if (text.includes(key)) {
        targetColor = color;
        break;
      }
    }

    if (targetColor) {
      // 强制设置颜色，包括子元素
      valueEl.style.setProperty('color', targetColor, 'important');
      valueEl.querySelectorAll('*').forEach(node => {
        node.style.setProperty('color', targetColor, 'important');
      });
    }
  }

  function hideTargetCards() {
    const cards = qsa('.sidebar-container.reverse.layout .side > .l-card');
    for (const card of cards) {
      const title = qs('h3, .lfe-h3', card);
      const text = (title?.textContent || '').trim();
      if (/相关讨论|推荐题目/.test(text)) {
        card.classList.add('lg-hide-card');
      }
    }
  }

  function hideAds() {
    qsa('svg.fa-rectangle-ad').forEach(svg => {
      const block = svg.closest('div');
      if (block) block.classList.add('lg-hide-card');
    });

    qsa('a[href*="class.luogu.com.cn/course"], a[href*="luogu.com.cn/course"]').forEach(a => {
      const block = a.closest('div');
      if (block) block.classList.add('lg-hide-card');
    });

    qsa('span, div').forEach(el => {
      const text = (el.textContent || '').trim();
      if (text === '洛谷推荐') {
        const block = el.closest('div');
        if (block) block.classList.add('lg-hide-card');
      }
    });
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* 全局背景与基础设置 */
      html, body {
        background: #f7f8ff !important;
      }
      .theme-page.theme-frosted {
        position: relative !important;
        min-height: 100vh !important;
        background-image:
          linear-gradient(135deg, rgba(253, 249, 255, 0.72), rgba(244, 251, 255, 0.68), rgba(255, 248, 251, 0.70)),
          var(--lg-wallpaper-layer, none) !important;
        background-size: cover, cover !important;
        background-position: center center, center center !important;
        background-repeat: no-repeat, no-repeat !important;
        background-attachment: fixed, fixed !important;
      }
      .theme-page.theme-frosted::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background:
          radial-gradient(circle at 16% 18%, rgba(255, 187, 231, 0.22), transparent 0 16%),
          radial-gradient(circle at 82% 14%, rgba(166, 213, 255, 0.18), transparent 0 15%),
          radial-gradient(circle at 78% 82%, rgba(193, 255, 220, 0.12), transparent 0 16%);
      }
      .theme-page.theme-frosted > * {
        position: relative;
        z-index: 1;
      }

      /* 毛玻璃通用大卡片 */
      .header-card,
      .sidebar-container.reverse.layout .side > .l-card,
      .main-content .problem {
        position: relative !important;
        overflow: hidden !important;
        border-radius: 22px !important;
        background: rgba(255, 255, 255, 0.08) !important;
        border: 1px solid rgba(255, 255, 255, 0.30) !important;
        box-shadow:
          0 10px 28px rgba(113, 94, 156, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.22) !important;
        backdrop-filter: blur(20px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
        isolation: isolate;
      }
      .header-card::before,
      .sidebar-container.reverse.layout .side > .l-card::before,
      .main-content .problem::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background:
          linear-gradient(135deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.04)),
          radial-gradient(circle at top left, rgba(255, 178, 221, 0.14), transparent 36%),
          radial-gradient(circle at top right, rgba(165, 214, 255, 0.12), transparent 32%);
      }
      .header-card > *,
      .sidebar-container.reverse.layout .side > .l-card > *,
      .main-content .problem > * {
        position: relative;
        z-index: 1;
      }

      /* --- 顶部横幅美化 --- */
      .header-card .top-row {
        padding: 12px 16px 8px !important;
        align-items: center !important;
        gap: 12px !important;
      }
      .header-card .left {
        min-width: 0;
      }
      .header-card .title.lfe-h2 {
        margin: 0 !important;
        font-family: "MiSans", "HarmonyOS Sans SC", "Source Han Sans SC", "PingFang SC", sans-serif !important;
        font-weight: 800 !important;
        font-size: clamp(21px, 1.5vw, 30px) !important;
        letter-spacing: 0.2px !important;
        line-height: 1.15 !important;
        background: linear-gradient(90deg, #2f3150 0%, #5f5a91 45%, #a36abf 100%) !important;
        -webkit-background-clip: text !important;
        background-clip: text !important;
        color: transparent !important;
        text-shadow: 0 1px 0 rgba(255, 255, 255, 0.22) !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* 头部右侧统计数据 */
      .header-card .right .stat.stacked {
        display: flex !important;
        flex-wrap: nowrap !important;
        gap: 8px !important;
        align-items: stretch !important;
      }
      .header-card .right .stat.stacked .field {
        flex: 1 1 0 !important;
        min-width: 72px !important;
        padding: 7px 10px !important;
        border-radius: 14px !important;
        border: 1px solid rgba(255, 255, 255, 0.42) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.52), 0 6px 16px rgba(0, 0, 0, 0.04) !important;
        backdrop-filter: blur(10px) saturate(160%) !important;
        -webkit-backdrop-filter: blur(10px) saturate(160%) !important;
        transition: transform 0.18s ease, box-shadow 0.18s ease;
      }
      /* 统计卡片配色 */
      .header-card .right .stat.stacked .field:nth-child(1) { background: linear-gradient(180deg, rgba(255, 242, 249, 0.74), rgba(255, 230, 243, 0.46)) !important; }
      .header-card .right .stat.stacked .field:nth-child(2) { background: linear-gradient(180deg, rgba(241, 248, 255, 0.74), rgba(226, 240, 255, 0.46)) !important; }
      .header-card .right .stat.stacked .field:nth-child(3) { background: linear-gradient(180deg, rgba(242, 255, 246, 0.74), rgba(226, 248, 233, 0.46)) !important; }
      .header-card .right .stat.stacked .field:nth-child(4) { background: linear-gradient(180deg, rgba(248, 243, 255, 0.74), rgba(236, 229, 255, 0.46)) !important; }

      .header-card .right .stat.stacked .field:hover {
        transform: translateY(-1px);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.62), 0 8px 20px rgba(0, 0, 0, 0.07) !important;
      }
      .header-card .right .stat.stacked .field .name {
        display: block;
        margin-bottom: 2px;
        font-size: 11px !important;
        font-weight: 700 !important;
        color: rgba(67, 72, 94, 0.80) !important;
        line-height: 1.1;
      }
      .header-card .right .stat.stacked .field .value {
        display: block;
        font-size: 14px !important;
        font-weight: 800 !important;
        color: #2d3150 !important;
        line-height: 1.15 !important;
      }

      /* --- 顶部 Tabs 去条纹美化 --- */
      .header-card .bottom-row {
        padding: 0 16px 12px !important;
        margin-top: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px !important;
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        border-bottom: none !important;
      }
      /* 彻底清除菜单容器的任何背景或边框 */
      .header-card .bottom-row .menu {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
      }
      .header-card .bottom-row .menu .items {
        display: flex !important;
        gap: 8px !important;
        padding: 0 !important;
        margin: 0 !important;
        list-style: none !important;
        background: transparent !important;
      }
      .header-card .bottom-row .menu li {
        margin: 0 !important;
        background: transparent !important;
      }
      /* 按钮样式：无条纹，纯毛玻璃 */
      .header-card .bottom-row .menu .entry {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 34px !important;
        padding: 7px 14px !important;
        border-radius: 999px !important;
        background: rgba(255, 255, 255, 0.24) !important;
        border: 1px solid rgba(255, 255, 255, 0.35) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 6px 14px rgba(0, 0, 0, 0.04) !important;
        color: #3a3d5a !important;
        font-weight: 700 !important;
        font-size: 13px !important;
        transition: all 0.18s ease;
        cursor: pointer;
        user-select: none;
        /* 关键：移除任何可能的条纹背景图 */
        background-image: none !important;
      }
      .header-card .bottom-row .menu .entry:hover {
        transform: translateY(-1px);
        background: rgba(255, 255, 255, 0.38) !important;
      }
      .header-card .bottom-row .menu .entry.selected {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.72), rgba(241, 232, 255, 0.66)) !important;
        color: #2d3152 !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65), 0 8px 20px rgba(88, 74, 132, 0.10) !important;
        background-image: none !important;
      }

      .header-card .bottom-row .btn-actions {
        gap: 8px !important;
      }
      .header-card .bottom-row .btn-actions button {
        border-radius: 999px !important;
        padding: 7px 14px !important;
        background: rgba(255, 255, 255, 0.34) !important;
        border: 1px solid rgba(255, 255, 255, 0.40) !important;
        backdrop-filter: blur(10px) saturate(160%) !important;
        -webkit-backdrop-filter: blur(10px) saturate(160%) !important;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04) !important;
        cursor: pointer;
        font-weight: 700;
        font-size: 14px;
        background-image: none !important;
      }
      .header-card .bottom-row .btn-actions button:hover {
        background: rgba(255, 255, 255, 0.54) !important;
      }

      /* --- 侧边栏 2x2 信息卡极致紧凑布局 --- */
      .sidebar-container.reverse.layout .side > .l-card:first-of-type {
        display: grid !important;
        grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
        grid-auto-rows: minmax(60px, auto) !important; /* 减小最小高度 */
        gap: 6px !important;
        padding: 10px !important; /* 减小内边距 */
      }
      .sidebar-container.reverse.layout .side > .l-card:first-of-type > * {
        min-width: 0 !important;
        margin: 0 !important;
      }

      /* 信息卡样式 */
      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-info-stat {
        grid-column: span 3 !important;
        position: relative !important;
        overflow: hidden !important;
        min-height: 60px !important;
        padding: 6px 8px !important; /* 极致压缩 padding */
        border-radius: 16px !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: flex-start !important;
        gap: 0 !important; /* 消除 gap */
        border: 1px solid rgba(255, 255, 255, 0.42) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 6px 14px rgba(0, 0, 0, 0.04) !important;
        backdrop-filter: blur(10px) saturate(165%) !important;
        -webkit-backdrop-filter: blur(10px) saturate(165%) !important;
      }

      /* 标签文字 */
      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-info-stat .label {
        display: block;
        font-size: 11px !important; /* 稍小字体 */
        font-weight: 800 !important;
        color: rgba(58, 61, 90, 0.78) !important;
        line-height: 1.0 !important; /* 极致紧凑行高 */
        margin-bottom: 2px !important; /* 极小间距 */
        letter-spacing: 0.2px !important;
      }

      /* 数值文字 */
      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-info-stat .value {
        display: block;
        font-size: 14px !important;
        font-weight: 900 !important;
        color: #2d3152 !important;
        line-height: 1.0 !important; /* 极致紧凑行高 */
        margin-top: 0 !important;
      }

      /* 4个卡片配色 */
      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-stat-0 {
        background: linear-gradient(135deg, rgba(255, 241, 247, 0.88), rgba(255, 226, 239, 0.56)) !important;
      }
      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-stat-1 {
        background: linear-gradient(135deg, rgba(241, 248, 255, 0.88), rgba(226, 240, 255, 0.56)) !important;
      }
      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-stat-2 {
        background: linear-gradient(135deg, rgba(242, 255, 246, 0.88), rgba(226, 248, 233, 0.56)) !important;
      }
      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-stat-3 {
        background: linear-gradient(135deg, rgba(248, 243, 255, 0.88), rgba(236, 229, 255, 0.56)) !important;
      }

      /* --- 底部3个按钮无间隙并排 --- */
      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-info-link {
        grid-column: span 2 !important; /* 严格三等分 */
        position: relative !important;
        overflow: hidden !important;
        min-height: 50px !important;
        padding: 8px 4px !important;
        border-radius: 14px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 4px !important; /* 极小间隙，若需完全贴合可改为0 */
        text-decoration: none !important;
        border: 1px solid rgba(255, 255, 255, 0.42) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 6px 14px rgba(0, 0, 0, 0.04) !important;
        backdrop-filter: blur(10px) saturate(165%) !important;
        -webkit-backdrop-filter: blur(10px) saturate(165%) !important;
        font-size: 13px !important;
        font-weight: 800 !important;
        color: #2f3150 !important;
        cursor: pointer;
        user-select: none;
      }
      /* 确保按钮位置正确 */
      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-info-link:nth-child(5) { grid-column-start: 1 !important; }
      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-info-link:nth-child(6) { grid-column-start: 3 !important; }
      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-info-link:nth-child(7) { grid-column-start: 5 !important; }

      /* 按钮配色 */
      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-link-0 {
        background: linear-gradient(135deg, rgba(249, 244, 255, 0.90), rgba(228, 234, 255, 0.58)) !important;
      }
      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-link-1 {
        background: linear-gradient(135deg, rgba(245, 252, 255, 0.90), rgba(228, 245, 255, 0.58)) !important;
      }
      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-link-2 {
        background: linear-gradient(135deg, rgba(249, 245, 255, 0.90), rgba(255, 235, 246, 0.58)) !important;
      }

      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-info-link:hover {
        transform: translateY(-1px);
      }
      .sidebar-container.reverse.layout .side > .l-card:first-of-type .lg-info-link svg {
        color: currentColor !important;
        width: 1.2em !important;
        height: 1.2em !important;
      }

      /* 其他卡片统一风格 */
      .sidebar-container.reverse.layout .side > .l-card,
      .main-content .problem {
        background: rgba(255, 255, 255, 0.08) !important;
      }
      .sidebar-container.reverse.layout .side > .l-card h3,
      .main-content .problem h2,
      .main-content .problem .lfe-h2 {
        font-family: "MiSans", "HarmonyOS Sans SC", "Source Han Sans SC", "PingFang SC", sans-serif !important;
        color: #343654 !important;
        font-weight: 800 !important;
        letter-spacing: 0.2px !important;
      }

      /* 隐藏无关内容 */
      .lg-hide-card {
        display: none !important;
      }

      /* 配置面板样式 (保持不变) */
      #${PANEL_ID} {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 99999;
        width: 280px;
        padding: 12px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.50);
        box-shadow: 0 16px 40px rgba(40, 40, 80, 0.18);
        backdrop-filter: blur(18px) saturate(170%);
        -webkit-backdrop-filter: blur(18px) saturate(170%);
        font-family: "MiSans", "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
        color: #2d3152;
      }
      #${PANEL_ID} .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 10px;
      }
      #${PANEL_ID} .title {
        font-size: 14px;
        font-weight: 800;
      }
      #${PANEL_ID} .btn {
        appearance: none;
        border: 1px solid rgba(120, 120, 160, 0.18);
        background: rgba(255, 255, 255, 0.68);
        color: #2d3152;
        border-radius: 10px;
        padding: 6px 10px;
        font-size: 12px;
        cursor: pointer;
      }
      #${PANEL_ID} .btn:hover {
        background: rgba(255, 255, 255, 0.88);
      }
      #${PANEL_ID} .hint {
        font-size: 12px;
        opacity: 0.82;
        line-height: 1.45;
        margin-bottom: 10px;
      }
      #${PANEL_ID} label {
        display: block;
        font-size: 12px;
        margin: 8px 0 6px;
      }
      #${PANEL_ID} input[type="file"] {
        width: 100%;
        font-size: 12px;
      }
      #${PANEL_ID} .small {
        font-size: 11px;
        opacity: 0.7;
        margin-top: 8px;
      }
      #lg-glass-panel-toggle {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 100000;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.45);
        background: rgba(255, 255, 255, 0.70);
        box-shadow: 0 10px 26px rgba(40, 40, 80, 0.20);
        backdrop-filter: blur(14px) saturate(170%);
        -webkit-backdrop-filter: blur(14px) saturate(170%);
        cursor: pointer;
        font-size: 18px;
      }
    `;
    document.head.appendChild(style);
  }

  function applyWallpaper(dataUrl) {
    const root = getPageRoot();
    if (dataUrl) {
      root.style.setProperty('--lg-wallpaper-layer', `url("${dataUrl}")`);
      localStorage.setItem(WALLPAPER_KEY, dataUrl);
    } else {
      root.style.removeProperty('--lg-wallpaper-layer');
      localStorage.removeItem(WALLPAPER_KEY);
    }
  }

  function tuneExistingCards() {
    const root = getPageRoot();

    const saved = localStorage.getItem(WALLPAPER_KEY);
    if (saved) {
      root.style.setProperty('--lg-wallpaper-layer', `url("${saved}")`);
    }

    // 强制应用毛玻璃样式到关键容器
    const header = qs('.header-card');
    if (header) {
      header.style.setProperty('--theme-card-background', 'rgba(255, 255, 255, 0.08)', 'important');
      header.style.setProperty('--theme-card-backdrop-filter', 'blur(20px)', 'important');
      header.style.setProperty('background', 'rgba(255, 255, 255, 0.08)', 'important');
      header.style.setProperty('backdrop-filter', 'blur(20px) saturate(180%)', 'important');
      header.style.setProperty('-webkit-backdrop-filter', 'blur(20px) saturate(180%)', 'important');
    }

    const problemCard = qs('.main-content .problem');
    if (problemCard) {
      problemCard.style.setProperty('background', 'rgba(255, 255, 255, 0.08)', 'important');
      problemCard.style.setProperty('backdrop-filter', 'blur(20px) saturate(180%)', 'important');
      problemCard.style.setProperty('-webkit-backdrop-filter', 'blur(20px) saturate(180%)', 'important');
    }

    qsa('.sidebar-container.reverse.layout .side > .l-card').forEach(card => {
      card.style.setProperty('background', 'rgba(255, 255, 255, 0.08)', 'important');
      card.style.setProperty('backdrop-filter', 'blur(20px) saturate(180%)', 'important');
      card.style.setProperty('-webkit-backdrop-filter', 'blur(20px) saturate(180%)', 'important');
    });

    decorateFirstInfoCard();
    hideTargetCards();
    hideAds();
  }

  function createPanel() {
    if (document.getElementById(PANEL_ID)) return;

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <div class="row">
        <div class="title">Luogu 美化设置</div>
        <button class="btn" id="lg-panel-close">收起</button>
      </div>
      <div class="hint">
        这里可以选择你的本地壁纸，脚本会自动保存。
      </div>
      <label for="lg-wallpaper-input">选择本地壁纸</label>
      <input id="lg-wallpaper-input" type="file" accept="image/*" />
      <div class="row" style="margin-top:10px;">
        <button class="btn" id="lg-wallpaper-clear">清除壁纸（无效请刷新页面）</button>
        <button class="btn" id="lg-wallpaper-apply">重新应用</button>
      </div>
      <div class="small">已保存：本地壁纸会存到浏览器本地存储里。</div>
    `;
    document.body.appendChild(panel);

    const toggle = document.createElement('button');
    toggle.id = 'lg-glass-panel-toggle';
    toggle.textContent = '⚙';
    toggle.title = '打开设置';
    toggle.style.display = 'none';
    document.body.appendChild(toggle);

    const closeBtn = qs('#lg-panel-close', panel);
    const input = qs('#lg-wallpaper-input', panel);
    const clearBtn = qs('#lg-wallpaper-clear', panel);
    const applyBtn = qs('#lg-wallpaper-apply', panel);

    function openPanel() {
      panel.style.display = 'block';
      toggle.style.display = 'none';
    }
    function closePanel() {
      panel.style.display = 'none';
      toggle.style.display = 'block';
    }
    closeBtn.addEventListener('click', closePanel);
    toggle.addEventListener('click', openPanel);

    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        applyWallpaper(String(reader.result || ''));
        tuneExistingCards();
      };
      reader.readAsDataURL(file);
    });
    clearBtn.addEventListener('click', () => {
      applyWallpaper('');
      tuneExistingCards();
    });
    applyBtn.addEventListener('click', () => {
      tuneExistingCards();
    });

    openPanel();
  }

  function run() {
    injectStyle();
    createPanel();
    tuneExistingCards();

    // SPA 局部刷新监听
    const observer = new MutationObserver(() => {
      tuneExistingCards();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  run();
})();
