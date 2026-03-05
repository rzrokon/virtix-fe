(function () {
  if (window.__virtixShadowWidgetLoaded) return;
  window.__virtixShadowWidgetLoaded = true;

  const cfg = window.VirtixWidget || {};
  const CONFIG = {
    baseUrl: (cfg.baseUrl || "").replace(/\/$/, ""),
    agent: cfg.agent || "",
    widgetKey: cfg.widgetKey || "",
    position: (cfg.position || "right").toLowerCase(), // right|left
  };

  if (!CONFIG.baseUrl || !CONFIG.agent || !CONFIG.widgetKey) {
    console.warn("[VirtixWidget] Missing baseUrl/agent/widgetKey in window.VirtixWidget");
    return;
  }

  const sideProp = CONFIG.position === "left" ? "left" : "right";
  const bubbleOffset = 20;
  const panelOffsetBottom = 90;

  // Create TWO fixed-position hosts so bubble never shifts.
  const hostBubble = document.createElement("div");
  hostBubble.id = "virtix-widget-bubble-host";
  hostBubble.style.cssText = `position:fixed;bottom:${bubbleOffset}px;${sideProp}:${bubbleOffset}px;z-index:2147483647;`;

  const hostPanel = document.createElement("div");
  hostPanel.id = "virtix-widget-panel-host";
  hostPanel.style.cssText = `position:fixed;bottom:${panelOffsetBottom}px;${sideProp}:${bubbleOffset}px;z-index:2147483647;`;

  document.body.appendChild(hostPanel);
  document.body.appendChild(hostBubble);

  const shadowBubble = hostBubble.attachShadow({ mode: "open" });
  const shadowPanel = hostPanel.attachShadow({ mode: "open" });

  const state = {
    open: false,
    step: "email", // email | otp | chat
    email: "",
    access: "",
    refresh: "",
    agentInfo: null,
    messages: [],
    loading: false,
  };

  const storageKey = (k) => `virtix_${CONFIG.agent}_${k}`;

  function saveSession() {
    sessionStorage.setItem(storageKey("email"), state.email || "");
    sessionStorage.setItem(storageKey("access"), state.access || "");
    sessionStorage.setItem(storageKey("refresh"), state.refresh || "");
  }

  function loadSession() {
    state.email = sessionStorage.getItem(storageKey("email")) || "";
    state.access = sessionStorage.getItem(storageKey("access")) || "";
    state.refresh = sessionStorage.getItem(storageKey("refresh")) || "";
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
  }

  // ---------------- API ----------------
  async function api(path, { method = "GET", body = null, auth = false } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth && state.access) headers.Authorization = `Bearer ${state.access}`;

    const res = await fetch(`${CONFIG.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (res.status === 401 && auth && state.refresh) {
      const ok = await tryRefresh();
      if (ok) return api(path, { method, body, auth });
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

      // Your refresh endpoint returns BOTH access + refresh (rotating refresh)
      state.access = data.access;
      if (data.refresh) state.refresh = data.refresh;
      saveSession();
      return true;
    } catch {
      return false;
    }
  }

  async function loadAgentInfo() {
    state.agentInfo = await api(`/api/widget/agents/${CONFIG.agent}/`);
  }

  async function loadHistory() {
    const data = await api(`/api/widget/agents/${CONFIG.agent}/me/messages/`, { auth: true });

    const results = Array.isArray(data.results) ? data.results.slice() : [];
    results.reverse(); // oldest first

    const msgs = [];
    for (const r of results) {
      if (r.user_query) msgs.push({ role: "user", text: r.user_query, ts: r.date });
      if (r.response) msgs.push({ role: "assistant", text: r.response, ts: r.date });
    }
    state.messages = msgs;
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
    state.access = data.access || "";
    state.refresh = data.refresh || "";
    saveSession();
  }

  async function sendChat(text) {
    // Your API expects array payload
    return await api(`/api/widget/agent-chat/`, {
      method: "POST",
      auth: true,
      body: [{ userInput: text, agent: CONFIG.agent }],
    });
  }

  // ---------------- UI ----------------
  function renderBubble() {
    shadowBubble.innerHTML = `
      <style>
        * { box-sizing:border-box; font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial; }
        .bubble {
          width:56px;height:56px;border-radius:999px;border:0;cursor:pointer;
          box-shadow:0 8px 24px rgba(0,0,0,.18);
          background:#111;color:#fff;font-size:22px;line-height:56px;
        }
      </style>
      <button class="bubble" id="b">${state.open ? "✕" : "💬"}</button>
    `;

    shadowBubble.getElementById("b").onclick = async () => {
      state.open = !state.open;

      if (state.open) {
        if (!state.agentInfo) {
          try { await loadAgentInfo(); }
          catch { state.agentInfo = { agent_heading: "Virtix AI", agent_description: "" }; }
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

  function renderPanel() {
    if (!state.open) {
      shadowPanel.innerHTML = "";
      return;
    }

    shadowPanel.innerHTML = `
      <style>
        * { box-sizing:border-box; font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial; }
        .panel {
          width:360px;height:560px;max-height:75vh;
          border-radius:14px;overflow:hidden;
          box-shadow:0 12px 30px rgba(0,0,0,.24);
          background:#fff;
          display:flex;flex-direction:column;
        }
        .header {
          padding:12px 14px;border-bottom:1px solid #eee;background:#fff;
        }
        .title { font-weight:900;font-size:14px; }
        .desc { opacity:.65;font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .body { flex:1; min-height:0; display:flex; flex-direction:column; }
        .content { padding:16px; flex:1; }
        .err { color:#b00020; font-size:13px; margin-bottom:10px; }
        input {
          width:100%; padding:12px; border:1px solid #ddd; border-radius:10px;
          font-size:14px; outline:none;
        }
        .btn {
          margin-top:12px; width:100%; padding:12px; border:0; border-radius:10px;
          background:#111; color:#fff; font-weight:900; cursor:pointer;
        }
        .btn2 {
          margin-top:10px; width:100%; padding:10px; border:1px solid #ddd;
          border-radius:10px; background:#fff; cursor:pointer;
        }

        .chatWrap { flex:1; min-height:0; display:flex; flex-direction:column; }
        .chat { flex:1; min-height:0; overflow:auto; padding:14px; background:#fafafa; }
        .composer { padding:10px; border-top:1px solid #eee; display:flex; gap:8px; background:#fff; }
        .send { padding:12px 14px; border:0; border-radius:10px; background:#111; color:#fff; font-weight:900; cursor:pointer; }

        .row { display:flex; margin:8px 0; }
        .row.user { justify-content:flex-end; }
        .row.assistant { justify-content:flex-start; }
        .msg { max-width:82%; padding:10px 12px; border-radius:12px; font-size:13.5px; line-height:1.35; }
        .msg.user { background:#111; color:#fff; }
        .msg.assistant { background:#fff; color:#111; border:1px solid #e5e5e5; }

        @media (max-width: 420px) {
          .panel { width: calc(100vw - 40px); height: 70vh; }
        }
      </style>

      <div class="panel">
        ${renderHeader()}
        <div class="body" id="body">${renderBody()}</div>
      </div>
    `;

    bindPanelActions();
    if (state.step === "chat") {
      renderChatMessages();
      scrollToBottom();
    }
  }

  function renderHeader() {
    const title = state.agentInfo?.agent_heading || "Virtix AI";
    const desc = state.agentInfo?.agent_description || "";
    return `
      <div class="header">
        <div class="title">${esc(title)}</div>
        <div class="desc">${esc(desc)}</div>
      </div>
    `;
  }

  function renderBody() {
    if (state.step === "email") return renderEmailScreen();
    if (state.step === "otp") return renderOtpScreen();
    return renderChatScreen();
  }

  function renderEmailScreen(err = "") {
    return `
      <div class="content">
        <div style="font-weight:900;font-size:16px;margin-bottom:6px;">Start chat</div>
        <div style="opacity:.7;font-size:13px;margin-bottom:14px;">Enter your email to continue.</div>
        ${err ? `<div class="err">${esc(err)}</div>` : ""}
        <input id="email" type="email" placeholder="you@example.com" value="${esc(state.email)}" />
        <button class="btn" id="sendOtp">${state.loading ? "Sending..." : "Send OTP"}</button>
      </div>
    `;
  }

  function renderOtpScreen(err = "") {
    return `
      <div class="content">
        <div style="font-weight:900;font-size:16px;margin-bottom:6px;">Verify OTP</div>
        <div style="opacity:.7;font-size:13px;margin-bottom:14px;">We sent a 6-digit code to <b>${esc(state.email)}</b>.</div>
        ${err ? `<div class="err">${esc(err)}</div>` : ""}
        <input id="otp" inputmode="numeric" maxlength="6" placeholder="123456" style="letter-spacing:4px;" />
        <button class="btn" id="verify">${state.loading ? "Verifying..." : "Verify & Continue"}</button>
        <button class="btn2" id="changeEmail">Change email</button>
      </div>
    `;
  }

  function renderChatScreen() {
    return `
      <div class="chatWrap">
        <div class="chat" id="chat"></div>
        <div class="composer">
          <input id="msg" placeholder="Type a message..." />
          <button class="send" id="send">Send</button>
        </div>
      </div>
    `;
  }

  function bindPanelActions() {
    const body = shadowPanel.getElementById("body");
    if (!body) return;

    const rerender = (html) => {
      body.innerHTML = html;
      bindPanelActions();
    };

    const sendOtpBtn = shadowPanel.getElementById("sendOtp");
    if (sendOtpBtn) {
      sendOtpBtn.onclick = async () => {
        const email = (shadowPanel.getElementById("email")?.value || "").trim().toLowerCase();
        if (!email) return rerender(renderEmailScreen("Email is required"));

        state.loading = true; renderPanel();

        try {
          state.email = email;
          saveSession();
          await startOtp(email);
          state.step = "otp";
          state.loading = false;
          renderPanel();
        } catch (e) {
          state.loading = false;
          rerender(renderEmailScreen(e.message));
        }
      };
    }

    const verifyBtn = shadowPanel.getElementById("verify");
    if (verifyBtn) {
      verifyBtn.onclick = async () => {
        const otp = (shadowPanel.getElementById("otp")?.value || "").trim();
        if (otp.length !== 6) return rerender(renderOtpScreen("Enter the 6-digit OTP"));

        state.loading = true; renderPanel();

        try {
          await verifyOtp(state.email, otp);
          state.step = "chat";
          state.loading = false;

          await loadHistory().catch(() => {});
          renderPanel();
        } catch (e) {
          state.loading = false;
          rerender(renderOtpScreen(e.message));
        }
      };
    }

    const changeEmailBtn = shadowPanel.getElementById("changeEmail");
    if (changeEmailBtn) {
      changeEmailBtn.onclick = () => { state.step = "email"; renderPanel(); };
    }

    const sendBtn = shadowPanel.getElementById("send");
    const msgInput = shadowPanel.getElementById("msg");
    if (sendBtn && msgInput) {
      const send = async () => {
        const text = (msgInput.value || "").trim();
        if (!text) return;

        msgInput.value = "";
        state.messages.push({ role: "user", text });
        renderChatMessages(); scrollToBottom();

        try {
          const data = await sendChat(text);
          state.messages.push({ role: "assistant", text: data.response || "" });
          renderChatMessages(); scrollToBottom();
        } catch (e) {
          state.messages.push({ role: "assistant", text: `Sorry, failed: ${e.message}` });
          renderChatMessages(); scrollToBottom();
        }
      };

      sendBtn.onclick = send;
      msgInput.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });

      renderChatMessages();
      scrollToBottom();
    }
  }

  function renderChatMessages() {
    const chat = shadowPanel.getElementById("chat");
    if (!chat) return;

    chat.innerHTML = state.messages.map(m => {
      const role = m.role === "user" ? "user" : "assistant";
      return `<div class="row ${role}"><div class="msg ${role}">${esc(m.text)}</div></div>`;
    }).join("");
  }

  function scrollToBottom() {
    const chat = shadowPanel.getElementById("chat");
    if (!chat) return;
    requestAnimationFrame(() => { chat.scrollTop = chat.scrollHeight; });
  }

  // ---------- Boot ----------
  loadSession();
  renderBubble();     // bubble only
  renderPanel();      // panel empty until open
})();
