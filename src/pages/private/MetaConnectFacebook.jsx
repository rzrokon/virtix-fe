// src/pages/private/MetaConnectFacebook.jsx
import { useEffect, useMemo, useState } from "react";
import { Button, Card, List, Spin, Tag, message, Modal, Alert, Typography, Space, Input } from "antd";
import { useParams } from "react-router-dom";
import { getData, postData } from "../../scripts/api-service";

const { Text } = Typography;

const CONNECT_API = "api/channels/meta/facebook/connect/";
const LIST_API = "api/channels/meta/integrations/";
const DISCONNECT_API = (id) => `api/channels/meta/integrations/${id}/disconnect/`;

const FB_APP_ID = "910132044783628";
const FB_SDK_ID = "facebook-jssdk";
const FB_SDK_SRC = "https://connect.facebook.net/en_US/sdk.js";
const FB_VERSION = "v20.0";

// Scopes you actually need for Messenger page integration + listing.
// business_management is only useful if you need Business Portfolio listing.
const FB_SCOPE = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_metadata",
  "pages_messaging",
  "pages_utility_messaging",
  "business_management",
].join(",");

function injectFacebookSdk() {
  return new Promise((resolve, reject) => {
    if (document.getElementById(FB_SDK_ID)) return resolve(true);

    const s = document.createElement("script");
    s.id = FB_SDK_ID;
    s.src = FB_SDK_SRC;
    s.async = true;
    s.defer = true;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error("Facebook SDK blocked or failed to load (check AdBlock/Shields)"));

    document.head.appendChild(s);
  });
}

function ensureFbInit() {
  return new Promise(async (resolve, reject) => {
    if (window.FB && window.__FB_READY__) return resolve(window.FB);

    window.__FB_READY__ = window.__FB_READY__ || false;

    window.fbAsyncInit = function () {
      try {
        window.FB.init({
          appId: FB_APP_ID,
          cookie: true,
          xfbml: false,
          version: FB_VERSION,
        });
        window.__FB_READY__ = true;
        resolve(window.FB);
      } catch (e) {
        reject(e);
      }
    };

    try {
      await injectFacebookSdk();
    } catch (e) {
      return reject(e);
    }

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (window.FB && window.__FB_READY__) {
        clearInterval(timer);
        return resolve(window.FB);
      }
      if (attempts >= 30) {
        clearInterval(timer);
        return reject(new Error("Facebook SDK init timeout"));
      }
    }, 250);
  });
}

function prettyErr(obj) {
  if (!obj) return "Request failed";

  // common backend details
  if (obj.detail === "already_connected") return obj.error || "This Page is already connected to another agent.";
  if (obj.detail === "page_token_fetch_failed") return obj.error || "Failed to fetch Page access token.";
  if (obj.detail === "ig_not_linked") return obj.error || "No linked Instagram professional account found.";

  if (obj.detail === "subscribe_failed") {
    const ge = obj.graph_error || {};
    return ge.message || ge.error?.message || obj.error || "Subscribe failed";
  }

  return obj.error || obj.detail || "Request failed";
}

export default function MetaConnectFacebook() {
  const { id: agentId } = useParams();
  const [messageApi, contextHolder] = message.useMessage();

  const [pagesLoading, setPagesLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const [pages, setPages] = useState([]);
  const [connected, setConnected] = useState([]);

  const [connectingPageId, setConnectingPageId] = useState(null);
  const [disconnectingId, setDisconnectingId] = useState(null);
  const [lastError, setLastError] = useState(null);

  const [userAccessToken, setUserAccessToken] = useState(null);

  // Optional: manually test a page id (if it doesn't appear in lists)
  const [testPageId, setTestPageId] = useState("");

  const fbApi = async (path, params = {}) => {
    const FB = await ensureFbInit();
    return await new Promise((resolve) => FB.api(path, params, (resp) => resolve(resp)));
  };

  const fetchConnected = async () => {
    setListLoading(true);
    try {
      const data = await getData(`${LIST_API}?agent=${agentId}&platform=FACEBOOK`);
      setConnected(Array.isArray(data) ? data : []);
    } catch (e) {
      // swallow (UI still usable)
      // eslint-disable-next-line no-console
      console.error("[FB] fetchConnected error", e);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const connectedMap = useMemo(() => {
    const m = new Map();
    connected.forEach((x) => m.set(String(x.page_id), x));
    return m;
  }, [connected]);

  const loginPopupAndGetToken = async () => {
    const FB = await ensureFbInit();
    return new Promise((resolve, reject) => {
      FB.login(
        (resp) => {
          const token = resp?.authResponse?.accessToken;
          if (!token) return reject(new Error("Facebook login cancelled / no token returned"));
          resolve(token);
        },
        {
          scope: FB_SCOPE,
          auth_type: "rerequest",
          return_scopes: true,
          enable_profile_selector: true,
          response_type: "token",
        }
      );
    });
  };

  const uniqMergePages = (lists) => {
    const map = new Map();
    for (const arr of lists) {
      for (const p of arr || []) {
        if (!p?.id) continue;
        const id = String(p.id);
        const prev = map.get(id) || {};
        map.set(id, {
          id,
          name: p.name || prev.name || "",
          tasks: p.tasks || prev.tasks || [],
          source: prev.source ? `${prev.source}+${p.source || "?"}` : p.source || "?",
        });
      }
    }
    return Array.from(map.values());
  };

  const loadPages = async () => {
    setPagesLoading(true);
    setLastError(null);
    setPages([]);

    try {
      const token = await loginPopupAndGetToken();
      setUserAccessToken(token);

      // 1) Pages from profile access
      const meAccounts = await fbApi("/me/accounts", {
        access_token: token,
        fields: "id,name,tasks",
        limit: 200,
      });

      if (meAccounts?.error) {
        const msg = meAccounts.error?.message || "Failed to fetch pages from Facebook.";
        setLastError(msg);
        messageApi.error(msg);
        setPagesLoading(false);
        return;
      }

      const pagesFromMe = (meAccounts?.data || []).map((p) => ({ ...p, source: "me/accounts" }));

      // 2) Business portfolio pages (optional, depends on business_management working)
      const businesses = await fbApi("/me/businesses", {
        access_token: token,
        fields: "id,name",
        limit: 200,
      });

      const bizList = businesses?.data || [];
      const bizOwnedPagesAll = [];
      const bizClientPagesAll = [];

      for (const b of bizList) {
        const bid = b?.id;
        if (!bid) continue;

        // eslint-disable-next-line no-await-in-loop
        const owned = await fbApi(`/${bid}/owned_pages`, {
          access_token: token,
          fields: "id,name,tasks",
          limit: 200,
        });

        if (Array.isArray(owned?.data)) {
          owned.data.forEach((p) => bizOwnedPagesAll.push({ ...p, source: `biz:${bid}:owned_pages` }));
        }

        // eslint-disable-next-line no-await-in-loop
        const client = await fbApi(`/${bid}/client_pages`, {
          access_token: token,
          fields: "id,name,tasks",
          limit: 200,
        });

        if (Array.isArray(client?.data)) {
          client.data.forEach((p) => bizClientPagesAll.push({ ...p, source: `biz:${bid}:client_pages` }));
        }
      }

      // 3) Optional: test a specific Page ID for visibility (no debug window, but helps to include it if it exists)
      let testedPage = null;
      if (testPageId?.trim()) {
        const pid = testPageId.trim();
        // eslint-disable-next-line no-await-in-loop
        const pageInfo = await fbApi(`/${pid}`, { access_token: token, fields: "id,name" });
        if (pageInfo?.id) testedPage = { id: pageInfo.id, name: pageInfo.name, tasks: [], source: "manual:testPageId" };
      }

      const merged = uniqMergePages([
        pagesFromMe,
        bizOwnedPagesAll,
        bizClientPagesAll,
        testedPage ? [testedPage] : [],
      ]);

      if (!merged.length) {
        const msg =
          "Facebook returned 0 pages for this account.\n\n" +
          "Checklist:\n" +
          "1) Ensure this FB user has Full control on the Page (Page settings → Page access)\n" +
          "2) Ensure you granted permissions in the popup (pages_show_list + pages_read_engagement)\n" +
          "3) If app is in Dev mode, add this FB user in Meta App → Roles\n" +
          "4) Make sure popup logged into the correct FB profile\n";
        setLastError(msg);
        messageApi.warning("0 pages returned — check Page access + FB profile used in the popup.");
        setPagesLoading(false);
        return;
      }

      merged.sort((a, b) => (b.tasks?.length || 0) - (a.tasks?.length || 0));
      setPages(merged);
      messageApi.success(`Loaded ${merged.length} pages`);
    } catch (err) {
      const msg = err?.message || "Facebook SDK error (check AdBlock/Shields).";
      setLastError(msg);
      messageApi.error(msg);
    } finally {
      setPagesLoading(false);
    }
  };

  const connectPage = async (page) => {
    if (!userAccessToken) {
      messageApi.warning("Please click 'Connect / Load Pages' first.");
      return;
    }

    setConnectingPageId(page.id);
    setLastError(null);

    try {
      const payload = {
        agent: Number(agentId),
        page_id: String(page.id),
        page_name: page.name,
        user_access_token: userAccessToken,
      };

      const res = await postData(CONNECT_API, payload);
      const data = res?.data ?? res;

      if (data?.detail === "connected") {
        messageApi.success("Facebook Page connected successfully");
        await fetchConnected();
      } else {
        const msg = prettyErr(data);
        setLastError(msg);
        messageApi.error(msg);
        await fetchConnected();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[FB] connect error", e);
      const msg = e?.response?.data ? prettyErr(e.response.data) : e?.message || "Failed to connect";
      setLastError(msg);
      messageApi.error(msg);
    } finally {
      setConnectingPageId(null);
    }
  };

  const disconnectIntegration = async (integration) => {
    Modal.confirm({
      title: "Disconnect this Facebook Page?",
      content: "This will delete the integration and stop replies. You can reconnect anytime.",
      okText: "Disconnect",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        setDisconnectingId(integration.id);
        setLastError(null);

        try {
          const res = await postData(DISCONNECT_API(integration.id), {});
          const data = res?.data ?? res;

          if (data?.detail === "deleted") {
            messageApi.success("Page disconnected");
            await fetchConnected();
          } else {
            const msg = prettyErr(data);
            setLastError(msg);
            messageApi.error(msg);
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("[FB] disconnect error", e);
          const msg = e?.response?.data ? prettyErr(e.response.data) : "Failed to disconnect";
          setLastError(msg);
          messageApi.error(msg);
        } finally {
          setDisconnectingId(null);
        }
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {contextHolder}

      <Card>
        <div className="flex justify-between items-start gap-3">
          <div>
            <h1 className="text-2xl font-bold">Facebook Messenger</h1>
            <p className="text-gray-600">
              Connect a Facebook Page so your agent can reply to Messenger chats.
            </p>

            <div className="mt-2">
              <Text type="secondary">Requested scope:</Text> <Text code>{FB_SCOPE}</Text>
            </div>

            <div className="mt-3">
              <Text type="secondary">Optional test Page ID (if missing from list):</Text>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Input
                  placeholder="Paste Page ID here (optional)"
                  value={testPageId}
                  onChange={(e) => setTestPageId(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Space>
            <Button type="primary" onClick={loadPages} loading={pagesLoading}>
              Connect / Load Pages
            </Button>
          </Space>
        </div>

        {lastError ? (
          <div className="mt-4">
            <Alert type="error" showIcon message={lastError} />
          </div>
        ) : null}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Connected Pages</div>
          <Button onClick={fetchConnected} loading={listLoading}>
            Refresh
          </Button>
        </div>

        {connected.length ? (
          <List
            dataSource={connected}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Tag key="status" color="green">
                    {item.status || "CONNECTED"}
                  </Tag>,
                  <Button
                    key="disconnect"
                    danger
                    onClick={() => disconnectIntegration(item)}
                    loading={disconnectingId === item.id}
                  >
                    Disconnect
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={item.page_name || "Unnamed Page"}
                  description={`Page ID: ${item.page_id}`}
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="text-gray-500">No pages connected yet.</div>
        )}
      </Card>

      <Card>
        <div className="font-semibold mb-3">Pages you can connect</div>

        {pagesLoading ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : pages.length ? (
          <List
            dataSource={pages}
            renderItem={(p) => {
              const existing = connectedMap.get(String(p.id));
              return (
                <List.Item
                  actions={[
                    existing ? (
                      <div key="connected-actions" className="flex items-center gap-2">
                        <Tag color="green">Connected</Tag>
                        <Button
                          danger
                          onClick={() => disconnectIntegration(existing)}
                          loading={disconnectingId === existing.id}
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        key="connect"
                        type="primary"
                        onClick={() => connectPage(p)}
                        loading={connectingPageId === p.id}
                      >
                        Connect
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    title={p.name || "(no name)"}
                    description={
                      <>
                        <div>Page ID: {p.id}</div>
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary">Tasks:</Text>{" "}
                          <Text code>{Array.isArray(p.tasks) ? p.tasks.join(", ") : "-"}</Text>
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary">Source:</Text>{" "}
                          <Text code>{p.source || "-"}</Text>
                        </div>
                      </>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <div className="text-gray-500">
            Click <b>Connect / Load Pages</b> to list your Pages.
          </div>
        )}
      </Card>
    </div>
  );
}