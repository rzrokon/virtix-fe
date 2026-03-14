(function () {
  if (window.__virtixShadowWidgetLoaded) return;
  window.__virtixShadowWidgetLoaded = true;

  const cfg = window.VirtixWidget || {};

  const CONFIG = {
    baseUrl:           (cfg.baseUrl || "").replace(/\/$/, ""),
    agent:             cfg.agent || "",
    widgetKey:         cfg.widgetKey || "",
    position:          (cfg.position || "right").toLowerCase(),
    // ── New: set to false in snippet to hide the "Talk to a human" button
    showHumanHandover: cfg.showHumanHandover !== false, // default true
  };

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

  const CONTENT = Object.assign({
    headerTitle:    "Virtix AI",
    headerSubtitle: "Always here to help",
    welcomeMessage: "Hi there! 👋 How can I help you today?",
    showBranding:   true,
  }, cfg.content || {});

  const QUICK_REPLIES = Array.isArray(cfg.quickReplies) ? cfg.quickReplies : [];

  if (!CONFIG.baseUrl || !CONFIG.agent || !CONFIG.widgetKey) {
    console.warn("[VirtixWidget] Missing baseUrl/agent/widgetKey in window.VirtixWidget");
    return;
  }

  // ── Font injection ────────────────────────────────────────────────────────
  const fontName = T.fontFamily.split(",")[0].trim().replace(/['"]/g, "");
  const fontId = "virtix-font-" + fontName.replace(/\s+/g, "-").toLowerCase();
  if (!document.getElementById(fontId)) {
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }

  const br = (n) => `${Math.round(T.borderRadius * (n ?? 1))}px`;
  const hex2rgba = (hex, a) => {
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

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

  const state = {
    open: false,
    step: "email", // email | otp | chat
    email: "",
    access: "",
    refresh: "",
    agentInfo: null,
    messages: [],
    loading: false,
    sending: false,
    quickRepliesUsed: false,
    conversationId: "",
    handoverStatus: "BOT",
    lastMessageId: null,
    syncTimer: null,
  };

  // ── Session persistence ───────────────────────────────────────────────────
  const sk = (k) => `virtix_${CONFIG.agent}_${k}`;

  function saveSession() {
    sessionStorage.setItem(sk("email"),          state.email          || "");
    sessionStorage.setItem(sk("access"),         state.access         || "");
    sessionStorage.setItem(sk("refresh"),        state.refresh        || "");
    sessionStorage.setItem(sk("conversationId"), state.conversationId || "");
    sessionStorage.setItem(sk("handoverStatus"), state.handoverStatus || "BOT");
    sessionStorage.setItem(sk("lastMessageId"),  String(state.lastMessageId || ""));
  }

  function loadSession() {
    state.email          = sessionStorage.getItem(sk("email"))          || "";
    state.access         = sessionStorage.getItem(sk("access"))         || "";
    state.refresh        = sessionStorage.getItem(sk("refresh"))        || "";
    state.conversationId = sessionStorage.getItem(sk("conversationId")) || "";
    state.handoverStatus = sessionStorage.getItem(sk("handoverStatus")) || "BOT";
    const lm = sessionStorage.getItem(sk("lastMessageId"));
    state.lastMessageId  = lm ? parseInt(lm, 10) || null : null;
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
    );
  }

  // ── API helpers ───────────────────────────────────────────────────────────
  async function api(path, { method = "GET", body = null, auth = false } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth && state.access) headers.Authorization = `Bearer ${state.access}`;
    const res = await fetch(`${CONFIG.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
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
      if (r.user_query) state.messages.push({ id: `hist-u-${r.id || Math.random()}`, role: "user",      sender_type: "CUSTOMER", text: r.user_query, ts: r.date });
      if (r.response)   state.messages.push({ id: `hist-a-${r.id || Math.random()}`, role: "assistant", sender_type: "BOT",      text: r.response,   ts: r.date });
      if (r.id) state.lastMessageId = r.id;
    }
    saveSession();
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
      body: [{ userInput: text, agent: CONFIG.agent, conversationId: state.conversationId || undefined }],
    });
  }

  async function requestHuman(reason) {
    return await api(`/api/widget/${CONFIG.agent}/handover/request/`, {
      method: "POST",
      auth: true,
      body: { reason: reason || "Customer requested human support", conversationId: state.conversationId || undefined },
    });
  }

  async function syncConversation() {
    if (!state.access) return null;
    return await api(`/api/widget/${CONFIG.agent}/sync/`, {
      method: "POST",
      auth: true,
      body: { conversationId: state.conversationId || undefined, lastMessageId: state.lastMessageId || undefined },
    });
  }

  function startSyncLoop() {
    stopSyncLoop();
    if (!["REQUESTED", "ACTIVE"].includes(state.handoverStatus)) return;
    state.syncTimer = setInterval(async () => {
      try {
        const data = await syncConversation();
        if (!data) return;
        if (data.conversationId)  state.conversationId  = data.conversationId;
        if (data.handover_status) state.handoverStatus  = data.handover_status;
        const incoming = Array.isArray(data.messages) ? data.messages : [];
        if (incoming.length) { mergeIncomingMessages(incoming); renderChatMessages(); scrollToBottom(); }
        saveSession();
      } catch (e) { console.warn("[VirtixWidget] sync failed:", e.message); }
    }, 3000);
  }

  function stopSyncLoop() {
    if (state.syncTimer) { clearInterval(state.syncTimer); state.syncTimer = null; }
  }

  function mergeIncomingMessages(rows) {
    const existingIds = new Set(state.messages.map((m) => String(m.id)));
    for (const r of rows) {
      const rowId = String(r.id || `m-${Math.random()}`);
      if (existingIds.has(rowId)) continue;
      if (r.sender_type === "CUSTOMER" && r.user_query) {
        state.messages.push({ id: rowId, role: "user",      sender_type: "CUSTOMER", text: r.user_query, ts: r.date });
      } else if (["BOT", "HUMAN", "SYSTEM"].includes(r.sender_type) && r.response) {
        state.messages.push({ id: rowId, role: "assistant", sender_type: r.sender_type, text: r.response, ts: r.date, human_agent_email: r.human_agent_email || "" });
      }
      if (r.id) state.lastMessageId = r.id;
    }
  }

  function getMessageLabel(m) {
    if (m.sender_type === "HUMAN")  return m.human_agent_email ? `Human · ${m.human_agent_email}` : "Human Agent";
    if (m.sender_type === "SYSTEM") return "System";
    return "";
  }

  function getBubbleType(m) {
    if (m.role === "user")          return "user";
    if (m.sender_type === "HUMAN")  return "human";
    if (m.sender_type === "SYSTEM") return "system";
    return "assistant";
  }

  // ── CSS variables ─────────────────────────────────────────────────────────
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

  // ── Bubble button ─────────────────────────────────────────────────────────
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
          background:rgba(255,255,255,.12); transform:translateY(-100%); transition:transform .2s;
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
          ${!state.open
            ? `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
            : `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
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
          if (["REQUESTED", "ACTIVE"].includes(state.handoverStatus)) startSyncLoop();
        } else if (state.email) {
          state.step = "otp";
        } else {
          state.step = "email";
        }
      } else {
        stopSyncLoop();
      }
      renderPanel();
      renderBubble();
      if (state.open && state.step === "chat") scrollToBottom();
    };
  }

  // ── Panel CSS ─────────────────────────────────────────────────────────────
  function panelCSS() {
    return `
      ${CSS_VARS}
      * { box-sizing:border-box; margin:0; padding:0; }

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
      @keyframes slideUp {
        from { opacity:0; transform:translateY(16px) scale(.97); }
        to   { opacity:1; transform:translateY(0) scale(1); }
      }

      /* ── Header ── */
      .header {
        padding:14px 16px;
        background:var(--c-theme);
        display:flex; align-items:center; gap:10px;
        flex-shrink:0; position:relative; overflow:hidden;
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
      .hdr-sub   { font-size:11.5px; color:var(--c-hdr-text); opacity:.75; margin-top:1px; }
      .hdr-status {
        display:flex; align-items:center; gap:4px;
        font-size:11px; color:var(--c-hdr-text); opacity:.85;
        background:rgba(255,255,255,.15); padding:3px 8px; border-radius:999px; flex-shrink:0;
      }
      .dot-green { width:7px; height:7px; border-radius:50%; background:#4ade80; box-shadow:0 0 5px #4ade80; }

      /* ── Auth screens ── */
      .auth-body {
        flex:1; display:flex; flex-direction:column;
        justify-content:center; padding:28px 24px; overflow-y:auto;
      }
      .auth-icon {
        width:52px; height:52px; border-radius:${br(0.75)};
        background:${hex2rgba(T.themeColor, 0.15)};
        display:flex; align-items:center; justify-content:center; margin-bottom:16px;
      }
      .auth-icon svg { fill:none; stroke:var(--c-theme); stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
      .auth-title { font-weight:700; font-size:17px; color:var(--c-bot-text); margin-bottom:5px; }
      .auth-sub   { font-size:13px; color:var(--c-bot-text); opacity:.6; margin-bottom:20px; line-height:1.45; }
      .auth-sub b { color:var(--c-theme); font-weight:600; opacity:1; }
      .err { background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.3); color:#ef4444; font-size:12.5px; padding:8px 12px; border-radius:var(--br-sm); margin-bottom:12px; }

      input {
        width:100%; padding:11px 14px;
        border:1.5px solid ${hex2rgba(T.themeColor, 0.25)};
        border-radius:var(--br); font-size:14px; font-family:var(--font);
        background:${hex2rgba(T.themeColor, 0.07)};
        color:var(--c-bot-text); outline:none;
        transition:border-color .2s, box-shadow .2s;
      }
      input::placeholder { opacity:.4; }
      input:focus { border-color:var(--c-theme); box-shadow:0 0 0 3px ${hex2rgba(T.themeColor, 0.18)}; }
      input.otp { letter-spacing:.3em; text-align:center; font-size:20px; font-weight:700; }

      .btn-primary {
        margin-top:12px; width:100%; padding:12px; border:0; border-radius:var(--br);
        background:var(--c-theme); color:#fff;
        font-weight:700; font-size:14px; font-family:var(--font);
        cursor:pointer; transition:opacity .15s, transform .15s;
        box-shadow:0 4px 16px ${hex2rgba(T.themeColor, 0.4)};
      }
      .btn-primary:hover   { opacity:.9; }
      .btn-primary:active  { transform:scale(.97); }
      .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
      .btn-ghost {
        margin-top:10px; width:100%; padding:10px;
        border:1.5px solid ${hex2rgba(T.themeColor, 0.3)};
        border-radius:var(--br); background:transparent;
        color:var(--c-theme); font-weight:600; font-size:13px; font-family:var(--font);
        cursor:pointer; transition:background .15s;
      }
      .btn-ghost:hover { background:${hex2rgba(T.themeColor, 0.08)}; }

      /* ── Chat layout ── */
      .chat-wrap {
        flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden;
      }

      /* ── Handover banner ── */
      .handover-banner {
        margin:10px 14px 0; padding:10px 12px;
        border-radius:${br(0.75)};
        background:${hex2rgba(T.themeColor, 0.12)};
        border:1px solid ${hex2rgba(T.themeColor, 0.25)};
        color:var(--c-bot-text); font-size:12px;
        display:flex; align-items:center; justify-content:space-between; gap:10px;
      }
      .handover-badge {
        padding:3px 8px; border-radius:999px;
        background:${hex2rgba(T.themeColor, 0.2)};
        color:var(--c-theme); font-size:11px; font-weight:700;
      }

      /* ── Message list ── */
      .chat-msgs {
        flex:1; height:0;
        overflow-y:auto; overflow-x:hidden;
        padding:12px 12px 6px;
        display:flex; flex-direction:column;
        scrollbar-width:thin; scrollbar-color:${hex2rgba(T.themeColor, 0.2)} transparent;
      }
      .chat-msgs::-webkit-scrollbar { width:3px; }
      .chat-msgs::-webkit-scrollbar-thumb { background:${hex2rgba(T.themeColor, 0.25)}; border-radius:4px; }

      /* ── Message rows ── */
      .row {
        display:flex; align-items:flex-end; gap:6px;
        animation:fadeIn .18s ease;
        margin-top:5px;
      }
      /* bot rows: left-aligned, small gap above when bot follows bot */
      .row.assistant { justify-content:flex-start; }
      /* user rows: right-aligned, NO avatar, just push bubble right */
      .row.user { justify-content:flex-end; }
      /* bigger gap when sender changes */
      .row.user + .row.assistant,
      .row.assistant + .row.user { margin-top:10px; }

      @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }

      /* ── Avatars — bot/human side only ── */
      .avatar {
        width:22px; height:22px; border-radius:50%; flex-shrink:0;
        background:${hex2rgba(T.themeColor, 0.2)};
        border:1px solid ${hex2rgba(T.themeColor, 0.3)};
        display:flex; align-items:center; justify-content:center;
        align-self:flex-end; margin-bottom:1px;
      }
      .avatar.human-av  { background:#1d4ed8; border-color:#3b82f6; }
      .avatar svg { fill:none; stroke:rgba(255,255,255,.9); stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
      .avatar.hidden { visibility:hidden; }

      /* ── Bubble shapes ── */
      .msg {
        max-width:72%; padding:10px 10px;
        font-size:13px; line-height:1.45;
        word-break:break-word; 
      }
      /* user bubbles have no avatar so can be slightly wider */
      .row.user .msg { max-width:78%; }

      /* Bot / assistant */
      .msg.assistant {
        background:var(--c-bot-bg);
        color:var(--c-bot-text);
        border-radius:4px var(--br) var(--br) var(--br);
        border:1px solid ${hex2rgba(T.themeColor, 0.08)};
        box-shadow:0 1px 3px rgba(0,0,0,.12);
      }
      .msg.assistant.first-in-group { border-radius:var(--br) var(--br) var(--br) 4px; }
      .msg.assistant.last-in-group  { border-radius:4px var(--br) var(--br) var(--br); }
      .msg.assistant.only-in-group  { border-radius:4px var(--br) var(--br) var(--br); }

      /* Human agent */
      .msg.human {
        background:#1e3a8a;
        color:#e0eaff;
        border-radius:4px var(--br) var(--br) var(--br);
        border:1px solid #3b82f620;
        box-shadow:0 1px 3px rgba(0,0,0,.2);
      }

      /* System notice — slim pill */
      .msg.system {
        background:${hex2rgba("#f59e0b", 0.1)};
        color:#d97706;
        border-radius:999px;
        border:1px solid ${hex2rgba("#f59e0b", 0.2)};
        font-size:11px;
        padding:4px 12px;
        align-self:center;
        max-width:92%;
        text-align:center;
      }

      /* User */
      .msg.user {
        background:var(--c-user-bg);
        color:var(--c-user-text);
        border-radius:var(--br) 4px var(--br) var(--br);
        box-shadow:0 2px 6px ${hex2rgba(T.themeColor, 0.2)};
      }
      .msg.user.first-in-group { border-radius:var(--br) var(--br) 4px var(--br); }
      .msg.user.last-in-group  { border-radius:var(--br) 4px var(--br) var(--br); }
      .msg.user.only-in-group  { border-radius:var(--br) 4px var(--br) var(--br); }

      /* Sender label — only on first bubble of human group, truncated */
      .msg-label {
        font-size:9.5px; font-weight:700;
        opacity:.5; margin-bottom:3px;
        text-transform:uppercase; letter-spacing:.05em;
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        max-width:160px;
      }

      /* Timestamp — trailing inline, not a block row */
      .msg-time {
        font-size:9.5px; opacity:.3;
        display:inline; margin-left:6px;
        white-space:nowrap; float:right; clear:both;
        padding-top:3px; line-height:1;
      }

      /* ── Typing indicator ── */
      .typing-row {
        display:flex; align-items:flex-end; gap:6px;
        animation:fadeIn .18s ease; margin-top:10px;
      }
      .typing-bubble {
        background:var(--c-bot-bg);
        border:1px solid ${hex2rgba(T.themeColor, 0.08)};
        border-radius:4px var(--br) var(--br) var(--br);
        padding:10px 14px;
        display:flex; align-items:center; gap:4px;
        box-shadow:0 1px 3px rgba(0,0,0,.12);
      }
      .typing-bubble span {
        width:6px; height:6px; border-radius:50%;
        background:var(--c-bot-text); opacity:.4;
        animation:typingBounce 1.2s ease-in-out infinite;
        display:inline-block;
      }
      .typing-bubble span:nth-child(2) { animation-delay:.18s; }
      .typing-bubble span:nth-child(3) { animation-delay:.36s; }
      @keyframes typingBounce {
        0%,60%,100% { transform:translateY(0); opacity:.4; }
        30%          { transform:translateY(-4px); opacity:.9; }
      }

      /* ── Quick replies ── */
      .quick-wrap { padding:8px 14px 4px; display:flex; flex-direction:column; gap:6px; }
      .quick-btn {
        padding:9px 14px; border-radius:var(--br);
        border:1.5px solid ${hex2rgba(T.themeColor, 0.4)};
        background:${hex2rgba(T.themeColor, 0.07)};
        color:var(--c-theme); font-size:13px; font-weight:500; font-family:var(--font);
        cursor:pointer; text-align:left; transition:background .15s, transform .1s;
        display:flex; align-items:center; gap:8px;
      }
      .quick-btn::before { content:"→"; opacity:.5; font-size:12px; }
      .quick-btn:hover { background:${hex2rgba(T.themeColor, 0.14)}; transform:translateX(2px); }
      .quick-btn:active { transform:scale(.97); }

      /* ── Human handover button ── */
      .secondary-row { padding:4px 12px 8px; }
      .human-btn {
        width:100%; padding:10px 14px; border-radius:999px;
        border:1px solid ${hex2rgba(T.themeColor, 0.3)};
        background:transparent;
        color:var(--c-theme); font-weight:600; font-size:12.5px;
        font-family:var(--font); cursor:pointer;
        display:flex; align-items:center; justify-content:center; gap:7px;
        transition:background .15s;
      }
      .human-btn:hover { background:${hex2rgba(T.themeColor, 0.08)}; }
      .human-btn svg { fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; opacity:.7; }

      /* ── Composer ── */
      .composer {
        padding:10px 12px; border-top:1px solid ${hex2rgba(T.themeColor, 0.1)};
        display:flex; align-items:center; gap:8px;
        background:var(--c-bg);
      }
      .composer-input {
        flex:1; padding:10px 14px; border-radius:999px; font-size:13.5px;
        border:1.5px solid ${hex2rgba(T.themeColor, 0.18)};
        background:var(--c-in-bg); color:var(--c-in-text);
        font-family:var(--font); outline:none;
        transition:border-color .2s, box-shadow .2s;
      }
      .composer-input::placeholder { opacity:.35; }
      .composer-input:focus { border-color:var(--c-theme); box-shadow:0 0 0 3px ${hex2rgba(T.themeColor, 0.15)}; }
      .send-btn {
        width:36px; height:36px; flex-shrink:0; border:0; border-radius:50%;
        background:var(--c-theme); color:#fff;
        display:flex; align-items:center; justify-content:center;
        cursor:pointer; transition:opacity .15s, transform .15s;
        box-shadow:0 2px 10px ${hex2rgba(T.themeColor, 0.4)};
      }
      .send-btn:hover   { opacity:.9; }
      .send-btn:active  { transform:scale(.92); }
      .send-btn:disabled { opacity:.35; cursor:not-allowed; }
      .send-btn svg { fill:none; stroke:#fff; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }

      /* ── Branding ── */
      .branding {
        text-align:center; padding:4px 0 7px;
        font-size:10.5px; color:var(--c-in-text); opacity:.3;
        display:flex; align-items:center; justify-content:center; gap:4px;
      }
      .branding svg { width:11px; height:11px; fill:currentColor; }

      @media (max-width:420px) {
        .panel { width:calc(100vw - 40px); height:72vh; }
      }
    `;
  }

  // ── Panel render ──────────────────────────────────────────────────────────
  function renderPanel() {
    if (!state.open) { shadowPanel.innerHTML = ""; return; }

    const title = state.agentInfo?.agent_heading || CONTENT.headerTitle;
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
          <div class="hdr-status"><span class="dot-green"></span>Online</div>
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
    const showHandoverBanner = ["REQUESTED", "ACTIVE"].includes(state.handoverStatus);

    // ── Quick replies: only show when there is no prior message history
    const showQuickReplies = QUICK_REPLIES.length > 0
      && !state.quickRepliesUsed
      && state.messages.length === 0;

    // ── Human handover button: controlled by CONFIG + hide during active handover
    const showHumanBtn = CONFIG.showHumanHandover && !showHandoverBanner;

    return `
      <div class="chat-wrap">
        ${showHandoverBanner ? `
          <div class="handover-banner">
            <span>A human agent is handling your conversation.</span>
            <span class="handover-badge">${esc(state.handoverStatus)}</span>
          </div>
        ` : ""}

        <div class="chat-msgs" id="chat"></div>

        ${showQuickReplies ? `
          <div class="quick-wrap" id="quick">
            ${QUICK_REPLIES.map((q, i) => `<button class="quick-btn" data-qi="${i}">${esc(q)}</button>`).join("")}
          </div>
        ` : ""}

        ${showHumanBtn ? `
          <div class="secondary-row">
            <button class="human-btn" id="humanBtn">
              <svg width="13" height="13" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Talk to a human agent
            </button>
          </div>
        ` : ""}

        <div class="composer">
          <input id="msg" class="composer-input" placeholder="Type a message…" autocomplete="off" />
          <button class="send-btn" id="send" aria-label="Send">
            <svg width="15" height="15" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
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

  // ── Event binding ─────────────────────────────────────────────────────────
  function bindActions() {
    const body = shadowPanel.getElementById("body");
    if (!body) return;

    const rerender = (html) => { body.innerHTML = html; bindActions(); };

    // Email screen
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
        } catch (e) { state.loading = false; rerender(buildEmailScreen(e.message)); }
      };
      const emailInput = shadowPanel.getElementById("email");
      if (emailInput) emailInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendOtpBtn.onclick(); });
    }

    // OTP screen
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
          if (["REQUESTED", "ACTIVE"].includes(state.handoverStatus)) startSyncLoop();
        } catch (e) { state.loading = false; rerender(buildOtpScreen(e.message)); }
      };
      const otpInput = shadowPanel.getElementById("otp");
      if (otpInput) otpInput.addEventListener("keydown", (e) => { if (e.key === "Enter") verifyBtn.onclick(); });
    }

    const changeBtn = shadowPanel.getElementById("changeEmail");
    if (changeBtn) changeBtn.onclick = () => { state.step = "email"; renderPanel(); };

    // Human handover button
    const humanBtn = shadowPanel.getElementById("humanBtn");
    if (humanBtn) {
      humanBtn.onclick = async () => {
        try {
          const data = await requestHuman("Customer requested human support");
          if (data.conversationId)  state.conversationId  = data.conversationId;
          if (data.handover_status) state.handoverStatus  = data.handover_status;
          if (data.messageId)       state.lastMessageId   = data.messageId;
          state.quickRepliesUsed = true;
          state.messages.push({
            id: `local-system-${Date.now()}`, role: "assistant", sender_type: "SYSTEM",
            text: "Human support requested. A human agent will reply soon.", ts: new Date().toISOString(),
          });
          saveSession(); renderPanel(); renderChatMessages(); scrollToBottom(); startSyncLoop();
        } catch {
          state.messages.push({
            id: `local-system-${Date.now()}`, role: "assistant", sender_type: "SYSTEM",
            text: "Sorry, I could not request human support right now.", ts: new Date().toISOString(),
          });
          renderChatMessages(); scrollToBottom();
        }
      };
    }

    // Send message
    const sendBtn  = shadowPanel.getElementById("send");
    const msgInput = shadowPanel.getElementById("msg");
    if (sendBtn && msgInput) {
      const doSend = async () => {
        const text = (msgInput.value || "").trim();
        if (!text || state.sending) return;

        msgInput.value = "";
        state.sending = true;
        state.quickRepliesUsed = true;

        state.messages.push({
          id: `local-user-${Date.now()}`, role: "user", sender_type: "CUSTOMER",
          text, ts: new Date().toISOString(),
        });
        renderChatMessages(); scrollToBottom();

        const qw = shadowPanel.getElementById("quick");
        if (qw) qw.style.display = "none";

        // Typing indicator
        const chat = shadowPanel.getElementById("chat");
        if (chat) {
          const typingEl = document.createElement("div");
          typingEl.id = "typing-indicator";
          typingEl.className = "typing-row";
          typingEl.innerHTML = `
            <div class="avatar">
              <svg width="12" height="12" viewBox="0 0 24 24">
                <path d="M12 8V4m0 0L9 7m3-3 3 3M6.343 6.343A8 8 0 1 0 17.657 17.657 8 8 0 0 0 6.343 6.343z"/>
              </svg>
            </div>
            <div class="typing-bubble"><span></span><span></span><span></span></div>
          `;
          chat.appendChild(typingEl);
          scrollToBottom();
        }

        try {
          const data = await sendChat(text);
          if (data.conversationId)  state.conversationId  = data.conversationId;
          if (data.handover_status) state.handoverStatus  = data.handover_status;
          if (data.message_id)      state.lastMessageId   = data.message_id;
          state.messages.push({
            id: data.message_id || `local-assistant-${Date.now()}`,
            role: "assistant",
            sender_type: data?.handover_status && data.handover_status !== "BOT" ? "SYSTEM" : "BOT",
            text: data.response || "", ts: new Date().toISOString(),
          });
          saveSession();
          if (["REQUESTED", "ACTIVE"].includes(state.handoverStatus)) startSyncLoop();
        } catch {
          state.messages.push({
            id: `local-error-${Date.now()}`, role: "assistant", sender_type: "SYSTEM",
            text: "Sorry, something went wrong. Please try again.", ts: new Date().toISOString(),
          });
        } finally {
          state.sending = false;
          renderPanel(); renderChatMessages(); scrollToBottom();
        }
      };

      sendBtn.onclick = doSend;
      msgInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doSend(); });
      renderChatMessages(); scrollToBottom();
    }

    // Quick reply buttons
    shadowPanel.querySelectorAll(".quick-btn").forEach((btn) => {
      btn.onclick = () => {
        const text = QUICK_REPLIES[parseInt(btn.dataset.qi ?? "0", 10)] || "";
        if (!text) return;
        const msgInput = shadowPanel.getElementById("msg");
        if (msgInput) { msgInput.value = text; shadowPanel.getElementById("send")?.click(); }
      };
    });
  }

  // ── Render messages with grouping ─────────────────────────────────────────
  function renderChatMessages() {
    const chat = shadowPanel.getElementById("chat");
    if (!chat) return;

    const prev = chat.querySelector("#typing-indicator");
    if (prev) prev.remove();

    const botIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4m0 0L9 7m3-3 3 3M6.343 6.343A8 8 0 1 0 17.657 17.657 8 8 0 0 0 6.343 6.343z"/></svg>`;
    const humanIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    const userIcon  = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

    const all = state.messages.length === 0 && CONTENT.welcomeMessage
      ? [{ id: "__welcome__", role: "assistant", sender_type: "BOT", text: CONTENT.welcomeMessage, ts: null }]
      : state.messages;

    let html = "";

    all.forEach((m, i) => {
      const bubbleType = getBubbleType(m);
      const rowClass   = m.role === "user" ? "user" : "assistant";
      const label      = getMessageLabel(m);
      const isSystem   = m.sender_type === "SYSTEM";

      // Grouping: same role as previous / next
      const prev = all[i - 1];
      const next = all[i + 1];
      const samePrev = prev && prev.role === m.role && prev.sender_type === m.sender_type && !isSystem;
      const sameNext = next && next.role === m.role && next.sender_type === m.sender_type && !isSystem;

      let groupClass = "only-in-group";
      if (!samePrev && sameNext)       groupClass = "first-in-group";
      else if (samePrev && sameNext)   groupClass = "mid-in-group";
      else if (samePrev && !sameNext)  groupClass = "last-in-group";

      // Hide avatar on consecutive messages (show only on last of group)
      const showAvatar = !samePrev;
      const avatarHiddenClass = (samePrev && !isSystem) ? "hidden" : "";

      // System messages: centered, no avatar
      if (isSystem) {
        html += `
          <div class="row ${rowClass}" style="justify-content:center;">
            <div class="msg system">${esc(m.text)}</div>
          </div>
        `;
        return;
      }

      const avatarIcon   = m.role === "user" ? userIcon : (m.sender_type === "HUMAN" ? humanIcon : botIcon);
      const avatarClass  = m.sender_type === "HUMAN" ? "avatar human-av" : (m.role === "user" ? "avatar user-av" : "avatar");

      // Format time if available
      const timeStr = m.ts ? new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

      // Label: only on first of a human group; truncate long emails
      const showLabel = label && (groupClass === "first-in-group" || groupClass === "only-in-group");
      const shortLabel = label.length > 28 ? label.slice(0, 26) + "…" : label;

      // Time: only on last bubble of a group
      const showTime = timeStr && (groupClass === "last-in-group" || groupClass === "only-in-group");

      // User bubbles: no avatar, just the bubble right-aligned
      // Bot/human bubbles: avatar on left
      const avatarHtml = m.role !== "user"
        ? `<div class="${avatarClass} ${avatarHiddenClass}">${avatarIcon}</div>`
        : "";

      html += `
        <div class="row ${rowClass}">
          ${avatarHtml}
          <div class="msg ${bubbleType} ${groupClass}">
            ${showLabel ? `<div class="msg-label">${esc(shortLabel)}</div>` : ""}
            ${esc(m.text)}${showTime ? `<span class="msg-time">${timeStr}</span>` : ""}
          </div>
        </div>
      `;
    });

    chat.innerHTML = html;
  }

  function scrollToBottom() {
    const chat = shadowPanel.getElementById("chat");
    if (!chat) return;
    requestAnimationFrame(() => { chat.scrollTop = chat.scrollHeight; });
  }

  // ── Boot ──────────────────────────────────────────────────────────────────
  loadSession();
  renderBubble();
  renderPanel();

  if (state.access && ["REQUESTED", "ACTIVE"].includes(state.handoverStatus)) {
    startSyncLoop();
  }
})();