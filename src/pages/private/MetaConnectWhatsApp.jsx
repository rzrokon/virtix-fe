import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Collapse,
  Divider,
  Input,
  List,
  Modal,
  Tag,
  Typography,
  message,
} from "antd";
import { MessageCircle, Phone, Plug, Trash2, Wifi } from "lucide-react";
import { useParams } from "react-router-dom";
import { getData, postData } from "../../scripts/api-service";

const MANUAL_CONNECT_API = "api/channels/meta/whatsapp/connect/";
const EMBEDDED_CONFIG_API = "api/channels/meta/whatsapp/embedded-config/";
const EMBEDDED_COMPLETE_API = "api/channels/meta/whatsapp/embedded-complete/";
const LIST_API = "api/channels/meta/integrations/";
const DISCONNECT_API = (id) => `api/channels/meta/integrations/${id}/disconnect/`;
const FB_SDK_ID = "facebook-jssdk";
const { Text } = Typography;

function prettyErr(obj) {
  if (!obj) return "Request failed";
  if (obj.detail === "already_connected") return obj.error;
  if (obj.detail === "wa_validate_failed") return obj.error;
  if (obj.detail === "code_exchange_failed") return obj.error;
  return obj.error || obj.detail || "Request failed";
}

function extractEmbeddedSignupSession(payload) {
  const candidates = [
    payload,
    payload?.data,
    payload?.data?.data,
    payload?.sessionInfo,
    payload?.sessionInfo?.data,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const waba_id =
      candidate?.waba_id ||
      candidate?.wabaId ||
      candidate?.whatsapp_business_account_id ||
      null;

    const phone_number_id =
      candidate?.phone_number_id ||
      candidate?.phoneNumberId ||
      candidate?.wa_phone_number_id ||
      candidate?.phone?.id ||
      candidate?.phone_number?.id ||
      candidate?.phone_numbers?.[0]?.id ||
      null;

    const business_id = candidate?.business_id || candidate?.businessId || null;

    if (waba_id || phone_number_id || business_id) {
      return { waba_id: waba_id || null, phone_number_id: phone_number_id || null, business_id: business_id || null };
    }
  }

  return { waba_id: null, phone_number_id: null, business_id: null };
}

function loadFacebookSdk(appId, version = "v20.0") {
  return new Promise((resolve, reject) => {
    const initFb = () => {
      try {
        window.FB.init({ appId, cookie: true, xfbml: true, version });
        resolve(window.FB);
      } catch (err) { reject(err); }
    };

    if (window.FB) { initFb(); return; }

    window.fbAsyncInit = function () { initFb(); };

    if (!document.getElementById(FB_SDK_ID)) {
      const script = document.createElement("script");
      script.id = FB_SDK_ID;
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error("FB SDK failed to load"));
      document.body.appendChild(script);
    }
  });
}

export default function MetaConnectWhatsApp() {
  const { id: agentId } = useParams();
  const [messageApi, contextHolder] = message.useMessage();

  const [connected, setConnected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState(null);
  const [error, setError] = useState(null);

  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [wabaId, setWabaId] = useState("");

  const embeddedSessionRef = useRef({});
  const embeddedAuthCodeRef = useRef(null);
  const embeddedCompletionStartedRef = useRef(false);
  const embeddedConfigRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getData(`${LIST_API}?agent=${agentId}&platform=WHATSAPP`);
      setConnected(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  useEffect(() => {
    const listener = (event) => {
      if (!event.origin.includes("facebook.com")) return;

      try {
        let data = event.data;
        if (typeof data === "string") {
          try { data = JSON.parse(data); } catch { return; }
        }

        if (data?.type === "WA_EMBEDDED_SIGNUP") {
          if (data.event === "FINISH") {
            embeddedSessionRef.current = extractEmbeddedSignupSession(data);
            tryCompleteEmbeddedSignup();
          } else if (data.event === "ERROR") {
            const msg = data?.data?.error_message || "WhatsApp signup failed";
            setError(msg);
            messageApi.error(msg);
            setConnecting(false);
          } else if (data.event === "CANCEL") {
            setConnecting(false);
          }
        }
      } catch { /* ignore */ }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryCompleteEmbeddedSignup = async () => {
    const code = embeddedAuthCodeRef.current;
    const session = embeddedSessionRef.current || {};
    const { waba_id, phone_number_id } = session;

    if (!code || !waba_id || !phone_number_id || embeddedCompletionStartedRef.current) return;

    embeddedCompletionStartedRef.current = true;

    try {
      const res = await postData(EMBEDDED_COMPLETE_API, {
        agent: Number(agentId),
        code,
        waba_id,
        phone_number_id,
      });

      if (res?.detail === "connected" || res?.data?.detail === "connected") {
        messageApi.success("WhatsApp number connected successfully!");
        setError(null);
        fetchData();
      } else {
        throw new Error(prettyErr(res?.data ?? res));
      }
    } catch (e) {
      const msg = e.message || "Failed to connect WhatsApp";
      setError(msg);
      messageApi.error(msg);
    } finally {
      embeddedAuthCodeRef.current = null;
      embeddedSessionRef.current = {};
      embeddedCompletionStartedRef.current = false;
      setConnecting(false);
    }
  };

  const handleEmbeddedSignupResponse = (response) => {
    const code = response?.authResponse?.code;

    if (!code) {
      setConnecting(false);
      messageApi.warning("Signup cancelled or no authorisation returned");
      return;
    }

    embeddedAuthCodeRef.current = code;
    tryCompleteEmbeddedSignup();

    window.setTimeout(() => {
      if (!embeddedCompletionStartedRef.current) {
        setError("Meta did not send the WhatsApp account data. Please try again or use Manual Setup below.");
        messageApi.error("Connection timed out");
        embeddedAuthCodeRef.current = null;
        setConnecting(false);
      }
    }, 15000);
  };

  const startEmbeddedSignup = async () => {
    setConnecting(true);
    setError(null);
    embeddedSessionRef.current = {};
    embeddedAuthCodeRef.current = null;
    embeddedCompletionStartedRef.current = false;

    try {
      const cfg = await getData(EMBEDDED_CONFIG_API);
      embeddedConfigRef.current = cfg;

      await loadFacebookSdk(cfg.app_id, cfg.graph_version);

      window.FB.login(handleEmbeddedSignupResponse, {
        config_id: cfg.config_id,
        response_type: "code",
        override_default_response_type: true,
        extras: { version: "v3", setup: {}, features: [] },
      });
    } catch {
      messageApi.error("Failed to start WhatsApp signup. Please try again.");
      setConnecting(false);
    }
  };

  const manualConnect = async () => {
    if (!phoneNumberId || !accessToken) {
      messageApi.warning("Phone Number ID and Access Token are required");
      return;
    }

    setManualLoading(true);
    try {
      const res = await postData(MANUAL_CONNECT_API, {
        agent: Number(agentId),
        waba_id: wabaId || undefined,
        wa_phone_number_id: phoneNumberId,
        wa_access_token: accessToken,
      });

      const data = res?.data ?? res;
      if (data?.detail === "connected") {
        messageApi.success("WhatsApp number connected!");
        setError(null);
        setPhoneNumberId("");
        setAccessToken("");
        setWabaId("");
        fetchData();
      } else {
        throw new Error(prettyErr(data));
      }
    } catch (e) {
      messageApi.error(e.message || "Connection failed");
    } finally {
      setManualLoading(false);
    }
  };

  const disconnect = (item) => {
    Modal.confirm({
      title: "Disconnect WhatsApp number?",
      content: `${item.wa_display_phone_number || item.wa_phone_number_id} will stop receiving AI replies.`,
      okText: "Disconnect",
      okButtonProps: { danger: true },
      onOk: async () => {
        setDisconnectingId(item.id);
        await postData(DISCONNECT_API(item.id), {});
        await fetchData();
        setDisconnectingId(null);
      },
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {contextHolder}

      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle size={20} className="text-[#25D366]" />
          WhatsApp Integration
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Connect your WhatsApp Business number so your AI agent can reply to customers automatically.
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} closable onClose={() => setError(null)} />
      )}

      <Card
        title={
          <span className="flex items-center gap-2 font-semibold">
            <Plug size={16} className="text-[#25D366]" />
            Connect WhatsApp Business
          </span>
        }
      >
        <p className="text-sm text-gray-600 mb-4">
          Sign in with your Facebook Business account to connect your WhatsApp Business number.
          You&apos;ll be guided through the setup by Meta.
        </p>

        <Button
          type="primary"
          size="large"
          icon={<Wifi size={15} />}
          onClick={startEmbeddedSignup}
          loading={connecting}
          style={{ background: "#25D366", borderColor: "#25D366" }}
        >
          {connecting ? "Connecting…" : "Connect via Facebook"}
        </Button>

        <Divider plain>
          <Text className="text-xs text-gray-400">or set up manually</Text>
        </Divider>

        <Collapse
          ghost
          items={[{
            key: "manual",
            label: <Text className="text-sm text-gray-500">Manual Setup (advanced)</Text>,
            children: (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">
                  Use this if you have a System User token from Meta Business Manager.
                </p>
                <Input
                  placeholder="WABA ID (optional)"
                  value={wabaId}
                  onChange={(e) => setWabaId(e.target.value)}
                />
                <Input
                  placeholder="Phone Number ID *"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                />
                <Input.Password
                  placeholder="Access Token *"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
                <Button
                  type="primary"
                  onClick={manualConnect}
                  loading={manualLoading}
                  disabled={!phoneNumberId || !accessToken}
                >
                  Connect
                </Button>
              </div>
            ),
          }]}
        />
      </Card>

      <Card
        title={
          <span className="flex items-center gap-2 font-semibold">
            <Phone size={16} className="text-gray-600" />
            Connected Numbers
          </span>
        }
      >
        <List
          loading={loading}
          locale={{ emptyText: "No WhatsApp numbers connected yet." }}
          dataSource={connected}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Tag color="green" key="status">Active</Tag>,
                <Button
                  key="disconnect"
                  danger
                  size="small"
                  icon={<Trash2 size={13} />}
                  loading={disconnectingId === item.id}
                  onClick={() => disconnect(item)}
                >
                  Disconnect
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<MessageCircle size={20} className="text-[#25D366] mt-1" />}
                title={
                  <span className="font-medium">
                    {item.wa_display_phone_number || item.wa_phone_number_id}
                  </span>
                }
                description={
                  item.wa_verified_name
                    ? <Text className="text-xs text-gray-400">{item.wa_verified_name}</Text>
                    : null
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Card title="How it works">
        <ol className="list-decimal pl-4 space-y-2 text-sm text-gray-600">
          <li>Click <strong>Connect via Facebook</strong> and log in with your Facebook Business account.</li>
          <li>Select the WhatsApp Business Account and phone number you want to connect.</li>
          <li>Your AI agent will automatically reply to incoming WhatsApp messages 24/7.</li>
          <li>WhatsApp message charges from Meta apply — you are billed per conversation.</li>
        </ol>
      </Card>
    </div>
  );
}
