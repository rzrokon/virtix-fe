// src/pages/private/MetaConnectInstagram.jsx
import { useEffect, useMemo, useState } from "react";
import { Button, Card, List, Spin, Tag, message, Modal, Alert, Typography } from "antd";
import { useParams } from "react-router-dom";
import { getData, postData } from "../../scripts/api-service";
import { fbLogin, ensureFbSdk } from "../../utils/metaSdk";

const { Text } = Typography;

const CONNECT_API = "api/channels/meta/instagram/connect/";
const LIST_API = "api/channels/meta/integrations/";
const DISCONNECT_API = (id) => `api/channels/meta/integrations/${id}/disconnect/`;

const FB_APP_ID = "910132044783628";

const IG_SCOPE =
  "pages_show_list,pages_read_engagement,pages_manage_metadata,pages_messaging,instagram_basic,instagram_manage_messages";

function prettyErr(obj) {
  if (!obj) return "Request failed";
  if (obj.detail === "already_connected") return obj.error || "Already connected to another agent";
  if (obj.detail === "ig_not_linked") return obj.error || "IG not linked to the selected Page";
  if (obj.detail === "page_token_fetch_failed") return obj.error || "Failed to fetch Page access token";
  if (obj.detail === "subscribe_failed") return obj?.graph_error?.message || obj?.graph_error?.error?.message || "Subscribe failed";
  return obj.error || obj.detail || "Request failed";
}

export default function MetaConnectInstagram() {
  const { id: agentId } = useParams();
  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const [candidates, setCandidates] = useState([]);
  const [connected, setConnected] = useState([]);

  const [connectingId, setConnectingId] = useState(null);
  const [disconnectingId, setDisconnectingId] = useState(null);
  const [lastError, setLastError] = useState(null);

  const [userAccessToken, setUserAccessToken] = useState(null);

  const fetchConnected = async () => {
    setListLoading(true);
    try {
      const data = await getData(`${LIST_API}?agent=${agentId}&platform=INSTAGRAM`);
      setConnected(Array.isArray(data) ? data : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[IG] fetchConnected error", e);
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
    connected.forEach((x) => m.set(String(x.ig_business_id), x));
    return m;
  }, [connected]);

  const loadCandidates = async () => {
    setLoading(true);
    setLastError(null);
    setCandidates([]);

    try {
      const token = await fbLogin(FB_APP_ID, IG_SCOPE);
      setUserAccessToken(token);

      const FB = await ensureFbSdk(FB_APP_ID);

      // ✅ Request fields explicitly to avoid "empty/incomplete" page lists
      const pageResp = await new Promise((resolve) =>
        FB.api(
          "/me/accounts",
          { access_token: token, fields: "id,name,tasks", limit: 200 },
          resolve
        )
      );

      if (!pageResp || pageResp.error) {
        const msg =
          pageResp?.error?.message ||
          "Failed to fetch Pages. Make sure you granted permissions and you have Page access.";
        throw new Error(msg);
      }

      const managedPages = pageResp.data || [];
      const out = [];

      // ✅ Sequential is safer; you can optimize later if needed
      for (const p of managedPages) {
        // eslint-disable-next-line no-await-in-loop
        const info = await new Promise((resolve) =>
          FB.api(
            `/${p.id}`,
            {
              fields: "instagram_business_account{username},connected_instagram_account{username}",
              access_token: token,
            },
            resolve
          )
        );

        if (info?.error) {
          // ignore individual page errors
          // eslint-disable-next-line no-console
          console.warn("[IG] page check error", p?.id, info?.error);
          continue;
        }

        const iba = info?.instagram_business_account;
        const cia = info?.connected_instagram_account;
        const ig = iba?.id ? iba : cia?.id ? cia : null;

        if (ig?.id) {
          out.push({
            page_id: String(p.id),
            page_name: p.name,
            ig_business_id: String(ig.id),
            ig_username: ig.username || "",
          });
        }
      }

      setCandidates(out);

      if (!out.length) {
        messageApi.info(
          "No linked IG Professional account found. Make sure IG is Professional (Creator/Business) and linked to the Facebook Page."
        );
      } else {
        messageApi.success(`Found ${out.length} IG account(s) linked to your Pages`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[IG] loadCandidates error:", err);
      const msg = err?.message || "Facebook SDK couldn't load. Disable AdBlock/Brave Shields.";
      setLastError(msg);
      messageApi.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const connect = async (row) => {
    if (!userAccessToken) {
      messageApi.warning("Please click 'Connect / Load IG Accounts' first.");
      return;
    }

    setConnectingId(row.ig_business_id);
    setLastError(null);

    try {
      const payload = {
        agent: Number(agentId),
        page_id: String(row.page_id),
        user_access_token: userAccessToken,
      };

      const res = await postData(CONNECT_API, payload);
      const data = res?.data ?? res;

      if (data?.detail === "connected") {
        messageApi.success(`Instagram @${data.ig_username || row.ig_username || "connected"} connected`);
        await fetchConnected();
      } else {
        const msg = prettyErr(data);
        setLastError(msg);
        messageApi.error(msg);
        await fetchConnected();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[IG] connect error", e);
      const msg = e?.response?.data ? prettyErr(e.response.data) : e?.message || "Failed to connect";
      setLastError(msg);
      messageApi.error(msg);
    } finally {
      setConnectingId(null);
    }
  };

  const disconnectIntegration = async (integration) => {
    Modal.confirm({
      title: "Disconnect this Instagram account?",
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
            messageApi.success("Instagram disconnected");
            await fetchConnected();
          } else {
            const msg = prettyErr(data);
            setLastError(msg);
            messageApi.error(msg);
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("[IG] disconnect error", e);
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
        <div className="flex justify-between items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Instagram DM</h1>
            <p className="text-gray-600">
              Detects Instagram Professional accounts linked to your Pages and lets you connect them.
            </p>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Scopes:</Text> <Text code>{IG_SCOPE}</Text>
            </div>
          </div>

          <Button type="primary" onClick={loadCandidates} loading={loading}>
            Connect / Load IG Accounts
          </Button>
        </div>

        {lastError ? (
          <div className="mt-4">
            <Alert type="error" showIcon message={lastError} />
          </div>
        ) : null}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Connected Instagram Accounts</div>
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
                  <Tag key="status" color="green">{item.status || "CONNECTED"}</Tag>,
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
                  title={`@${item.ig_username || "unknown"}`}
                  description={`IG ID: ${item.ig_business_id} • Page: ${item.page_name || item.page_id}`}
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="text-gray-500">No IG connected yet.</div>
        )}
      </Card>

      <Card>
        <div className="font-semibold mb-3">IG Accounts You Can Connect</div>

        {loading ? (
          <div className="flex justify-center py-10"><Spin /></div>
        ) : candidates.length ? (
          <List
            dataSource={candidates}
            renderItem={(p) => {
              const existing = connectedMap.get(String(p.ig_business_id));
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
                      <Button type="primary" onClick={() => connect(p)} loading={connectingId === p.ig_business_id}>
                        Connect
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    title={`@${p.ig_username || "unknown"}`}
                    description={`Linked Page: ${p.page_name} (${p.page_id})`}
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <div className="text-gray-500">
            Click <b>Connect / Load IG Accounts</b> to detect linked IG accounts.
          </div>
        )}
      </Card>
    </div>
  );
}