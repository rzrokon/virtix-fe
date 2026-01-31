import { useEffect, useState } from "react";
import { Button, Card, List, Tag, message, Modal, Alert, Input } from "antd";
import { useParams } from "react-router-dom";
import { getData, postData } from "../../scripts/api-service";

const CONNECT_API = "api/channels/meta/whatsapp/connect/";
const LIST_API = "api/channels/meta/integrations/";
const DISCONNECT_API = (id) => `api/channels/meta/integrations/${id}/disconnect/`;

function prettyErr(obj) {
  if (!obj) return "Request failed";
  if (obj.detail === "already_connected") return obj.error || "Already connected to another agent";
  if (obj.detail === "wa_validate_failed") return obj?.graph_error?.message || obj?.graph_error?.error?.message || "Token/ID validation failed";
  return obj.error || obj.detail || "Request failed";
}

export default function MetaConnectWhatsApp() {
  const { id: agentId } = useParams();
  const [messageApi, contextHolder] = message.useMessage();

  const [listLoading, setListLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState(null);

  const [connected, setConnected] = useState([]);
  const [lastError, setLastError] = useState(null);

  const [wabaId, setWabaId] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const fetchConnected = async () => {
    setListLoading(true);
    try {
      const data = await getData(`${LIST_API}?agent=${agentId}&platform=WHATSAPP`);
      setConnected(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("[WA] fetchConnected error", e);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const connect = async () => {
    setConnecting(true);
    setLastError(null);

    try {
      const payload = {
        agent: Number(agentId),
        waba_id: wabaId || null,
        wa_phone_number_id: phoneNumberId.trim(),
        wa_access_token: accessToken.trim(),
      };

      const res = await postData(CONNECT_API, payload);
      const data = res?.data ?? res;

      if (data?.detail === "connected") {
        messageApi.success("WhatsApp connected");
        setWabaId("");
        setPhoneNumberId("");
        setAccessToken("");
        await fetchConnected();
      } else {
        const msg = prettyErr(data);
        setLastError(msg);
        messageApi.error(msg);
      }
    } catch (e) {
      console.error("[WA] connect error", e);
      const msg = e?.response?.data ? prettyErr(e.response.data) : e?.message || "Failed to connect";
      setLastError(msg);
      messageApi.error(msg);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectIntegration = async (integration) => {
    Modal.confirm({
      title: "Disconnect this WhatsApp number?",
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
            messageApi.success("WhatsApp disconnected");
            await fetchConnected();
          } else {
            const msg = prettyErr(data);
            setLastError(msg);
            messageApi.error(msg);
          }
        } catch (e) {
          console.error("[WA] disconnect error", e);
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
        <h1 className="text-2xl font-bold">WhatsApp Cloud API</h1>
        <p className="text-gray-600">
          Connect a WhatsApp Business number using <b>Phone Number ID</b> and an <b>Access Token</b>.
        </p>

        {lastError ? (
          <div className="mt-4">
            <Alert type="error" showIcon message={lastError} />
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          <Input
            placeholder="WABA ID (optional)"
            value={wabaId}
            onChange={(e) => setWabaId(e.target.value)}
          />
          <Input
            placeholder="Phone Number ID (required)"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
          />
          <Input.Password
            placeholder="WhatsApp Access Token (required)"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
          />

          <Button type="primary" onClick={connect} loading={connecting} disabled={!phoneNumberId || !accessToken}>
            Connect WhatsApp
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Connected WhatsApp Numbers</div>
          <Button onClick={fetchConnected} loading={listLoading}>Refresh</Button>
        </div>

        {connected.length ? (
          <List
            dataSource={connected}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Tag key="status" color="green">CONNECTED</Tag>,
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
                  title={item.wa_display_phone_number || item.wa_phone_number_id}
                  description={`Phone Number ID: ${item.wa_phone_number_id} • Verified: ${item.wa_verified_name || "-"}`}
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="text-gray-500">No WhatsApp numbers connected yet.</div>
        )}
      </Card>
    </div>
  );
}
