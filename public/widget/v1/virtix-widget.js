(function () {
  if (window.__virtixShadowWidgetLoaded) return;
  window.__virtixShadowWidgetLoaded = true;

  const cfg = window.VirtixWidget || {};

  // ─── Config with full theme/content/quickReplies support ─────────────────
  const CONFIG = {
    baseUrl:   (cfg.baseUrl  || "").replace(/\/$/, ""),
    agent:     cfg.agent     || "",
    widgetKey: cfg.widgetKey || "",
    position:  (cfg.position || "right").toLowerCase(),
  };

  // Theme defaults (overridden by cfg.theme)
  const T = Object.assign({
    themeColor:      "#6C47FF",
    backgroundColor: "#0F0F1A",
    headerTextColor: "#FFFFFF",
    botBubbleColor:  "#1E1E32",
    botTextColor:    "#E2E2F0",
    userBubbleColor: "#6C47FF",
    userTextColor:   "#FFFFFF",
    inputBackground: "#1A1A2E",
    inputTextColor:  "#E2E2F0",
    fontFamily:      "Sora, DM Sans, system-ui, sans-serif",
    borderRadius:    16,
    bubbleSize:      56,
  }, cfg.theme || {});

  // Content defaults
  const CONTENT = Object.assign({
    headerTitle:    "Virtix AI",
    headerSubtitle: "Always here to help",
    welcomeMessage: "Hi there! 👋 How can I help you today?",
    showBranding:   true,
  }, cfg.content || {});

  // Quick replies
  const QUICK_REPLIES = Array.isArray(cfg.quickReplies) ? cfg.quickReplies : [];

  if (!CONFIG.baseUrl || !CONFIG.agent || !CONFIG.widgetKey) {
    console.warn("[VirtixWidget] Missing baseUrl/agent/widgetKey in window.VirtixWidget");
    return;
  }

  // ─── Font injection ───────────────────────────────────────────────────────
  const fontName = T.fontFamily.split(",")[0].trim().replace(/['"]/g, "");
  const fontId = "virtix-font-" + fontName.replace(/\s+/g, "-").toLowerCase();
  if (!document.getElementById(fontId)) {
    const link = document.createElement("link");
    link.id   = fontId;
    link.rel  = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }

  // ─── Derived helpers ──────────────────────────────────────────────────────
  const br = (n) => `${Math.round(T.borderRadius * (n ?? 1))}px`;
  const hex2rgba = (hex, a) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  };

  // ─── DOM Hosts ────────────────────────────────────────────────────────────
  const side = CONFIG.position === "left" ? "left" : "right";
  const offset = 20;

  const hostBubble = document.createElement("div");
  hostBubble.style.cssText = `position:fixed;bottom:${offset}px;${side}:${offset}px;z-index:2147483647;`;

  const hostPanel = document.createElement("div");
  hostPanel.style.cssText = `position:fixed;bottom:${T.bubbleSize + offset + 12}px;${side}:${offset}px;z-index:2147483646;`;

  document.body.appendChild(hostPanel);
  document.body.appendChild(hostBubble);

  const shadowBubble = hostBubble.attachShadow({ mode: "open" });
  const shadowPanel  = hostPanel.attachShadow({ mode: "open" });

  // ─── State ────────────────────────────────────────────────────────────────
  const state = {
    open: false,
    step: "email",   // email | otp | chat
    email: "",
    access: "",
    refresh: "",
    agentInfo: null,
    messages: [],
    loading: false,
    sending: false,
    quickRepliesUsed: false,
  };

  const sk = (k) => `virtix_${CONFIG.agent}_${k}`;

  function saveSession() {
    sessionStorage.setItem(sk("email"),   state.email   || "");
    sessionStorage.setItem(sk("access"),  state.access  || "");
    sessionStorage.setItem(sk("refresh"), state.refresh || "");
  }
  function loadSession() {
    state.email   = sessionStorage.getItem(sk("email"))   || "";
    state.access  = sessionStorage.getItem(sk("access"))  || "";
    state.refresh = sessionStorage.getItem(sk("refresh")) || "";
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) =>
      ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
  }

  // ─── API ──────────────────────────────────────────────────────────────────
  async function api(path, { method="GET", body=null, auth=false } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth && state.access) headers.Authorization = `Bearer ${state.access}`;
    const res = await fetch(`${CONFIG.baseUrl}${path}`, {
      method, headers, body: body ? JSON.stringify(body) : null,
    });
    if (res.status === 401 && auth && state.refresh) {
      if (await tryRefresh()) return api(path, { method, body, auth });
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);
    return data;
  }

  async function tryRefresh() {
    try {
      const res = await fetch(`${CONFIG.baseUrl}/api/user/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: state.refresh }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.access) return false;
      state.access = data.access;
      if (data.refresh) state.refresh = data.refresh;
      saveSession();
      return true;
    } catch { return false; }
  }

  async function loadAgentInfo() {
    state.agentInfo = await api(`/api/widget/agents/${CONFIG.agent}/`);
  }

  async function loadHistory() {
    const data = await api(`/api/widget/agents/${CONFIG.agent}/me/messages/`, { auth: true });
    const results = Array.isArray(data.results) ? data.results.slice().reverse() : [];
    state.messages = [];
    for (const r of results) {
      if (r.user_query) state.messages.push({ role: "user",      text: r.user_query, ts: r.date });
      if (r.response)   state.messages.push({ role: "assistant", text: r.response,   ts: r.date });
    }
  }

  async function startOtp(email) {
    await api(`/api/widget/auth/start/`, {
      method: "POST",
      body: { agent: CONFIG.agent, email, widget_key: CONFIG.widgetKey },
    });
  }

  async function verifyOtp(email, otp) {
    const data = await api(`/api/widget/auth/verify/`, {
      method: "POST",
      body: { agent: CONFIG.agent, email, otp, widget_key: CONFIG.widgetKey },
    });
    state.access  = data.access  || "";
    state.refresh = data.refresh || "";
    saveSession();
  }

  async function sendChat(text) {
    return await api(`/api/widget/agent-chat/`, {
      method: "POST",
      auth: true,
      body: [{ userInput: text, agent: CONFIG.agent }],
    });
  }

  // ─── Shared CSS vars ──────────────────────────────────────────────────────
  const CSS_VARS = `
    :host {
      --c-theme:     ${T.themeColor};
      --c-bg:        ${T.backgroundColor};
      --c-hdr-text:  ${T.headerTextColor};
      --c-bot-bg:    ${T.botBubbleColor};
      --c-bot-text:  ${T.botTextColor};
      --c-user-bg:   ${T.userBubbleColor};
      --c-user-text: ${T.userTextColor};
      --c-in-bg:     ${T.inputBackground};
      --c-in-text:   ${T.inputTextColor};
      --font:        ${T.fontFamily};
      --br:          ${T.borderRadius}px;
      --br-sm:       ${br(0.5)};
      --br-lg:       ${br(1.25)};
    }
  `;

  // ─── BUBBLE ───────────────────────────────────────────────────────────────
  function renderBubble() {
    const size = T.bubbleSize;
    shadowBubble.innerHTML = `
      <style>
        ${CSS_VARS}
        * { box-sizing:border-box; }
        .bubble {
          width:${size}px; height:${size}px;
          border-radius:999px; border:0; cursor:pointer;
          background:var(--c-theme);
          box-shadow: 0 4px 20px ${hex2rgba(T.themeColor, 0.5)}, 0 2px 8px rgba(0,0,0,.25);
          display:flex; align-items:center; justify-content:center;
          transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
          position:relative; overflow:hidden;
        }
        .bubble::before {
          content:''; position:absolute; inset:0; border-radius:999px;
          background:rgba(255,255,255,.12);
          transform:translateY(-100%);
          transition:transform .2s;
        }
        .bubble:hover { transform:scale(1.08); box-shadow:0 6px 28px ${hex2rgba(T.themeColor, 0.65)}, 0 2px 8px rgba(0,0,0,.3); }
        .bubble:hover::before { transform:translateY(0); }
        .bubble:active { transform:scale(.95); }
        .icon { width:24px; height:24px; transition:transform .3s cubic-bezier(.34,1.56,.64,1), opacity .2s; }
        .icon svg { fill:none; stroke:white; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
        .pulse {
          position:absolute; inset:-4px; border-radius:999px;
          background:var(--c-theme); opacity:.18;
          animation: pulse 2.4s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:.18} 50%{transform:scale(1.18);opacity:.06} }
      </style>
      <button class="bubble" id="b" aria-label="${state.open ? 'Close chat' : 'Open chat'}">
        ${!state.open ? '<div class="pulse"></div>' : ''}
        <span class="icon">
          ${state.open
            ? `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
            : `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
          }
        </span>
      </button>
    `;

    shadowBubble.getElementById("b").onclick = async () => {
      state.open = !state.open;

      if (state.open) {
        if (!state.agentInfo) {
          try { await loadAgentInfo(); }
          catch { state.agentInfo = { agent_heading: CONTENT.headerTitle, agent_description: CONTENT.headerSubtitle }; }
        }
        if (state.access) {
          state.step = "chat";
          try { await loadHistory(); } catch {}
        } else if (state.email) {
          state.step = "otp";
        } else {
          state.step = "email";
        }
      }

      renderPanel();
      renderBubble();
      if (state.open && state.step === "chat") scrollToBottom();
    };
  }

  // ─── PANEL ────────────────────────────────────────────────────────────────
  function panelCSS() {
    return `
      ${CSS_VARS}
      * { box-sizing:border-box; margin:0; padding:0; }

      @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap');

      .panel {
        width:360px; height:560px; max-height:80vh;
        border-radius:var(--br-lg); overflow:hidden;
        box-shadow:0 20px 60px rgba(0,0,0,.35), 0 4px 16px rgba(0,0,0,.2);
        background:var(--c-bg);
        display:flex; flex-direction:column;
        font-family:var(--font);
        animation: slideUp .28s cubic-bezier(.16,1,.3,1);
        border:1px solid ${hex2rgba(T.themeColor, 0.25)};
      }
      /* #body must fill all remaining height after the header */
      #body {
        flex:1; min-height:0;
        display:flex; flex-direction:column;
        overflow:hidden;
      }
      @keyframes slideUp {
        from { opacity:0; transform:translateY(16px) scale(.97); }
        to   { opacity:1; transform:translateY(0)   scale(1);   }
      }

      /* ── Header ── */
      .header {
        padding:14px 16px;
        background:var(--c-theme);
        display:flex; align-items:center; gap:10px;
        flex-shrink:0;
        position:relative; overflow:hidden;
      }
      .header::after {
        content:''; position:absolute; top:-40px; right:-30px;
        width:110px; height:110px; border-radius:50%;
        background:rgba(255,255,255,.07); pointer-events:none;
      }
      .hdr-avatar {
        width:38px; height:38px; border-radius:${br(0.6)};
        background:rgba(255,255,255,.2);
        display:flex; align-items:center; justify-content:center;
        flex-shrink:0; overflow:hidden;
      }
      .hdr-avatar img { width:100%; height:100%; object-fit:cover; }
      .hdr-avatar svg { fill:none; stroke:rgba(255,255,255,.9); stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
      .hdr-text { flex:1; min-width:0; }
      .hdr-title { font-weight:700; font-size:14px; color:var(--c-hdr-text); line-height:1.2; }
      .hdr-sub   { font-size:11.5px; color:var(--c-hdr-text); opacity:.75; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:1px; }
      .hdr-status {
        display:flex; align-items:center; gap:4px;
        font-size:11px; color:var(--c-hdr-text); opacity:.85;
        background:rgba(255,255,255,.15); padding:3px 8px; border-radius:999px;
        flex-shrink:0;
      }
      .dot-green {
        width:7px; height:7px; border-radius:50%; background:#4ade80;
        box-shadow:0 0 5px #4ade80;
      }

      /* ── Auth screens ── */
      .auth-body {
        flex:1; display:flex; flex-direction:column;
        justify-content:center; padding:28px 24px;
        overflow-y:auto;
      }
      .auth-icon {
        width:52px; height:52px; border-radius:${br(0.75)};
        background:${hex2rgba(T.themeColor, 0.15)};
        display:flex; align-items:center; justify-content:center;
        margin-bottom:16px;
      }
      .auth-icon svg { fill:none; stroke:var(--c-theme); stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
      .auth-title { font-weight:700; font-size:17px; color:var(--c-bot-text); margin-bottom:5px; }
      .auth-sub   { font-size:13px; color:var(--c-bot-text); opacity:.6; margin-bottom:20px; line-height:1.45; }
      .auth-sub b { color:var(--c-theme); font-weight:600; opacity:1; }
      .err { background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.3); color:#ef4444; font-size:12.5px; padding:8px 12px; border-radius:var(--br-sm); margin-bottom:12px; }

      input {
        width:100%; padding:11px 14px;
        border:1.5px solid ${hex2rgba(T.themeColor, 0.25)};
        border-radius:var(--br);
        font-size:14px; font-family:var(--font);
        background:${hex2rgba(T.themeColor, 0.07)};
        color:var(--c-bot-text);
        outline:none; transition:border-color .2s, box-shadow .2s;
      }
      input::placeholder { opacity:.4; }
      input:focus { border-color:var(--c-theme); box-shadow:0 0 0 3px ${hex2rgba(T.themeColor, 0.18)}; }

      .btn-primary {
        margin-top:12px; width:100%; padding:12px;
        border:0; border-radius:var(--br);
        background:var(--c-theme); color:#fff;
        font-weight:700; font-size:14px; font-family:var(--font);
        cursor:pointer; transition:opacity .15s, transform .15s;
        box-shadow:0 4px 16px ${hex2rgba(T.themeColor, 0.4)};
      }
      .btn-primary:hover { opacity:.9; }
      .btn-primary:active { transform:scale(.97); }
      .btn-primary:disabled { opacity:.5; cursor:not-allowed; }

      .btn-ghost {
        margin-top:10px; width:100%; padding:10px;
        border:1.5px solid ${hex2rgba(T.themeColor, 0.3)};
        border-radius:var(--br); background:transparent;
        color:var(--c-theme); font-weight:600; font-size:13px; font-family:var(--font);
        cursor:pointer; transition:background .15s;
      }
      .btn-ghost:hover { background:${hex2rgba(T.themeColor, 0.08)}; }

      /* ── Chat ── */
      .chat-wrap {
        flex:1; min-height:0;
        display:flex; flex-direction:column;
        overflow:hidden;
      }
      .chat-msgs {
        flex:1;
        /* height:0 + flex:1 is the reliable cross-browser trick for scrollable flex children */
        height:0;
        overflow-y:auto; overflow-x:hidden;
        padding:16px 14px;
        display:flex; flex-direction:column; gap:10px;
        scrollbar-width:thin; scrollbar-color:${hex2rgba(T.themeColor, 0.25)} transparent;
      }
      .chat-msgs::-webkit-scrollbar { width:4px; }
      .chat-msgs::-webkit-scrollbar-thumb { background:${hex2rgba(T.themeColor, 0.3)}; border-radius:4px; }

      /* Bubble rows */
      .row { display:flex; align-items:flex-end; gap:7px; animation:fadeIn .2s ease; }
      .row.user { flex-direction:row-reverse; }
      @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

      .avatar {
        width:26px; height:26px; border-radius:50%; flex-shrink:0;
        background:var(--c-theme);
        display:flex; align-items:center; justify-content:center;
      }
      .avatar svg { fill:none; stroke:rgba(255,255,255,.9); stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }

      .msg {
        max-width:78%; padding:10px 14px;
        font-size:13.5px; line-height:1.45;
        word-break:break-word; white-space:pre-wrap;
      }
      .msg.assistant {
        background:var(--c-bot-bg); color:var(--c-bot-text);
        border-radius:4px var(--br) var(--br) var(--br);
        border:1px solid ${hex2rgba(T.themeColor, 0.1)};
      }
      .msg.user {
        background:var(--c-user-bg); color:var(--c-user-text);
        border-radius:var(--br) 4px var(--br) var(--br);
      }

      /* Typing dots */
      .typing { display:flex; align-items:center; gap:4px; padding:12px 16px; }
      .typing span {
        width:7px; height:7px; border-radius:50%;
        background:var(--c-bot-text); opacity:.5;
        animation:typingBounce 1.2s ease-in-out infinite;
      }
      .typing span:nth-child(2) { animation-delay:.2s; }
      .typing span:nth-child(3) { animation-delay:.4s; }
      @keyframes typingBounce {
        0%,60%,100% { transform:translateY(0); opacity:.5; }
        30%          { transform:translateY(-5px); opacity:1; }
      }

      /* Quick replies */
      .quick-wrap { padding:0 14px 10px; display:flex; flex-direction:column; gap:6px; }
      .quick-btn {
        padding:9px 14px; border-radius:var(--br);
        border:1.5px solid var(--c-theme);
        background:${hex2rgba(T.themeColor, 0.08)};
        color:var(--c-theme); font-size:13px; font-weight:500; font-family:var(--font);
        cursor:pointer; text-align:left; transition:background .15s, transform .1s;
      }
      .quick-btn:hover { background:${hex2rgba(T.themeColor, 0.16)}; transform:translateX(2px); }
      .quick-btn:active { transform:scale(.97); }

      /* Composer */
      .composer {
        padding:10px 12px;
        border-top:1px solid ${hex2rgba(T.themeColor, 0.12)};
        display:flex; align-items:center; gap:8px;
        background:var(--c-bg);
      }
      .composer-input {
        flex:1; padding:10px 14px;
        border:1.5px solid ${hex2rgba(T.themeColor, 0.2)};
        border-radius:999px; font-size:13.5px;
        background:var(--c-in-bg); color:var(--c-in-text);
        font-family:var(--font); outline:none;
        transition:border-color .2s, box-shadow .2s;
      }
      .composer-input:focus { border-color:var(--c-theme); box-shadow:0 0 0 3px ${hex2rgba(T.themeColor, 0.15)}; }
      .send-btn {
        width:38px; height:38px; flex-shrink:0;
        border:0; border-radius:50%;
        background:var(--c-theme); color:#fff;
        display:flex; align-items:center; justify-content:center;
        cursor:pointer; transition:opacity .15s, transform .15s;
        box-shadow:0 2px 10px ${hex2rgba(T.themeColor, 0.4)};
      }
      .send-btn:hover { opacity:.9; }
      .send-btn:active { transform:scale(.92); }
      .send-btn:disabled { opacity:.4; cursor:not-allowed; }
      .send-btn svg { fill:none; stroke:#fff; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }

      /* Branding */
      .branding {
        text-align:center; padding:5px 0 8px;
        font-size:10.5px; color:var(--c-in-text); opacity:.3;
        display:flex; align-items:center; justify-content:center; gap:4px;
      }
      .branding svg { width:11px; height:11px; fill:currentColor; }

      /* OTP input special */
      input.otp { letter-spacing:.3em; text-align:center; font-size:20px; font-weight:700; }

      @media (max-width:420px) {
        .panel { width:calc(100vw - 40px); height:72vh; }
      }
    `;
  }

  function renderPanel() {
    if (!state.open) { shadowPanel.innerHTML = ""; return; }

    const title = state.agentInfo?.agent_heading    || CONTENT.headerTitle;
    const sub   = state.agentInfo?.agent_description || CONTENT.headerSubtitle;

    shadowPanel.innerHTML = `
      <style>${panelCSS()}</style>
      <div class="panel">
        <div class="header">
          <div class="hdr-avatar">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M12 8V4m0 0L9 7m3-3 3 3M6.343 6.343A8 8 0 1 0 17.657 17.657 8 8 0 0 0 6.343 6.343z"/>
            </svg>
          </div>
          <div class="hdr-text">
            <div class="hdr-title">${esc(title)}</div>
            <div class="hdr-sub">${esc(sub)}</div>
          </div>
          <div class="hdr-status">
            <span class="dot-green"></span>
            Online
          </div>
        </div>
        <div id="body" style="flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;">${renderBody()}</div>
      </div>
    `;

    bindActions();
    if (state.step === "chat") { renderChatMessages(); scrollToBottom(); }
  }

  function renderBody() {
    if (state.step === "email") return buildEmailScreen();
    if (state.step === "otp")   return buildOtpScreen();
    return buildChatScreen();
  }

  // ── Auth Screens ────────────────────────────────────────────────────────────
  function buildEmailScreen(err = "") {
    return `
      <div class="auth-body">
        <div class="auth-icon">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div class="auth-title">Start a conversation</div>
        <div class="auth-sub">Enter your email to get started. We'll send you a one-time code.</div>
        ${err ? `<div class="err">${esc(err)}</div>` : ""}
        <input id="email" type="email" placeholder="you@example.com" value="${esc(state.email)}" autocomplete="email" />
        <button class="btn-primary" id="sendOtp" ${state.loading ? "disabled" : ""}>
          ${state.loading ? "Sending code…" : "Send OTP →"}
        </button>
      </div>
    `;
  }

  function buildOtpScreen(err = "") {
    return `
      <div class="auth-body">
        <div class="auth-icon">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div class="auth-title">Check your inbox</div>
        <div class="auth-sub">We sent a 6-digit code to <b>${esc(state.email)}</b>. Enter it below to continue.</div>
        ${err ? `<div class="err">${esc(err)}</div>` : ""}
        <input id="otp" class="otp" inputmode="numeric" maxlength="6" placeholder="• • • • • •" autocomplete="one-time-code" />
        <button class="btn-primary" id="verify" ${state.loading ? "disabled" : ""}>
          ${state.loading ? "Verifying…" : "Verify & Continue →"}
        </button>
        <button class="btn-ghost" id="changeEmail">← Use a different email</button>
      </div>
    `;
  }

  function buildChatScreen() {
    return `
      <div class="chat-wrap">
        <div class="chat-msgs" id="chat"></div>
        ${QUICK_REPLIES.length > 0 && !state.quickRepliesUsed
          ? `<div class="quick-wrap" id="quick">${QUICK_REPLIES.map((q,i) =>
              `<button class="quick-btn" data-qi="${i}">${esc(q)}</button>`).join("")}
            </div>`
          : ""}
        <div class="composer">
          <input id="msg" class="composer-input" placeholder="Type a message…" autocomplete="off" />
          <button class="send-btn" id="send" aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        ${CONTENT.showBranding ? `
          <div class="branding">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Powered by Virtix AI
          </div>` : ""}
      </div>
    `;
  }

  // ── Bind Actions ────────────────────────────────────────────────────────────
  function bindActions() {
    const body = shadowPanel.getElementById("body");
    if (!body) return;

    const rerender = (html) => { body.innerHTML = html; bindActions(); };

    // Email
    const sendOtpBtn = shadowPanel.getElementById("sendOtp");
    if (sendOtpBtn) {
      sendOtpBtn.onclick = async () => {
        const email = (shadowPanel.getElementById("email")?.value || "").trim().toLowerCase();
        if (!email) return rerender(buildEmailScreen("Please enter a valid email address."));
        state.loading = true; renderPanel();
        try {
          state.email = email; saveSession();
          await startOtp(email);
          state.step = "otp"; state.loading = false; renderPanel();
        } catch (e) {
          state.loading = false; rerender(buildEmailScreen(e.message));
        }
      };
      const emailInput = shadowPanel.getElementById("email");
      if (emailInput) emailInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendOtpBtn.onclick(); });
    }

    // OTP
    const verifyBtn = shadowPanel.getElementById("verify");
    if (verifyBtn) {
      verifyBtn.onclick = async () => {
        const otp = (shadowPanel.getElementById("otp")?.value || "").trim();
        if (otp.length !== 6) return rerender(buildOtpScreen("Please enter the full 6-digit code."));
        state.loading = true; renderPanel();
        try {
          await verifyOtp(state.email, otp);
          state.step = "chat"; state.loading = false;
          await loadHistory().catch(() => {});
          renderPanel();
        } catch (e) {
          state.loading = false; rerender(buildOtpScreen(e.message));
        }
      };
      const otpInput = shadowPanel.getElementById("otp");
      if (otpInput) otpInput.addEventListener("keydown", (e) => { if (e.key === "Enter") verifyBtn.onclick(); });
    }

    const changeBtn = shadowPanel.getElementById("changeEmail");
    if (changeBtn) changeBtn.onclick = () => { state.step = "email"; renderPanel(); };

    // Chat
    const sendBtn  = shadowPanel.getElementById("send");
    const msgInput = shadowPanel.getElementById("msg");
    if (sendBtn && msgInput) {
      const doSend = async () => {
        const text = (msgInput.value || "").trim();
        if (!text || state.sending) return;
        msgInput.value = "";
        state.sending = true;
        state.quickRepliesUsed = true;
        state.messages.push({ role: "user", text });
        renderChatMessages(); scrollToBottom();
        // Hide quick replies after first message
        const qw = shadowPanel.getElementById("quick");
        if (qw) qw.style.display = "none";

        // Show typing indicator
        const chat = shadowPanel.getElementById("chat");
        if (chat) {
          const typingEl = document.createElement("div");
          typingEl.id = "typing-indicator";
          typingEl.className = "row assistant";
          typingEl.innerHTML = `
            <div class="avatar"><svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 8V4m0 0L9 7m3-3 3 3M6.343 6.343A8 8 0 1 0 17.657 17.657 8 8 0 0 0 6.343 6.343z"/></svg></div>
            <div class="msg assistant"><div class="typing"><span></span><span></span><span></span></div></div>
          `;
          chat.appendChild(typingEl);
          scrollToBottom();
        }

        try {
          const data = await sendChat(text);
          state.messages.push({ role: "assistant", text: data.response || data?.[0]?.response || "" });
        } catch (e) {
          state.messages.push({ role: "assistant", text: `Sorry, something went wrong. Please try again.` });
        } finally {
          state.sending = false;
          renderChatMessages(); scrollToBottom();
        }
      };

      sendBtn.onclick = doSend;
      msgInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doSend(); });
      renderChatMessages(); scrollToBottom();
    }

    // Quick reply buttons
    const quickBtns = shadowPanel.querySelectorAll(".quick-btn");
    quickBtns.forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.qi ?? "0", 10);
        const text = QUICK_REPLIES[idx] || "";
        if (!text) return;
        const msgInput = shadowPanel.getElementById("msg");
        if (msgInput) { msgInput.value = text; shadowPanel.getElementById("send")?.click(); }
      };
    });
  }

  // ── Chat messages renderer ──────────────────────────────────────────────────
  function renderChatMessages() {
    const chat = shadowPanel.getElementById("chat");
    if (!chat) return;

    // Remove typing indicator if present
    const prev = chat.querySelector("#typing-indicator");
    if (prev) prev.remove();

    const botIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4m0 0L9 7m3-3 3 3M6.343 6.343A8 8 0 1 0 17.657 17.657 8 8 0 0 0 6.343 6.343z"/></svg>`;

    let html = "";

    // Welcome message if no history
    if (state.messages.length === 0 && CONTENT.welcomeMessage) {
      html += `
        <div class="row assistant">
          <div class="avatar">${botIcon}</div>
          <div class="msg assistant">${esc(CONTENT.welcomeMessage)}</div>
        </div>
      `;
    }

    html += state.messages.map(m => {
      const role = m.role === "user" ? "user" : "assistant";
      return `
        <div class="row ${role}">
          ${role === "assistant" ? `<div class="avatar">${botIcon}</div>` : ""}
          <div class="msg ${role}">${esc(m.text)}</div>
        </div>
      `;
    }).join("");

    chat.innerHTML = html;
  }

  function scrollToBottom() {
    const chat = shadowPanel.getElementById("chat");
    if (!chat) return;
    requestAnimationFrame(() => { chat.scrollTop = chat.scrollHeight; });
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────
  loadSession();
  renderBubble();
  renderPanel();
})();