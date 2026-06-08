import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  List,
  Tag,
  message,
  Modal,
  Alert,
  Input,
  Collapse,
  Divider,
  Typography,
} from "antd";
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

    const business_id =
      candidate?.business_id ||
      candidate?.businessId ||
      null;

    if (waba_id || phone_number_id || business_id) {
      return {
        waba_id: waba_id || null,
        phone_number_id: phone_number_id || null,
        business_id: business_id || null,
        raw: candidate,
      };
    }
  }

  return {
    waba_id: null,
    phone_number_id: null,
    business_id: null,
    raw: payload || null,
  };
}

function getMetaEventSummary(event) {
  if (!event) return null;

  const eventName =
    event.event ||
    event.type ||
    event.raw?.event ||
    event.raw?.type ||
    "unknown";

  let preview = "";

  try {
    if (typeof event.raw === "string") {
      preview = event.raw;
    } else if (event.raw) {
      preview = JSON.stringify(event.raw);
    } else {
      preview = JSON.stringify(event);
    }
  } catch {
    preview = String(event.raw || event);
  }

  return {
    eventName,
    preview: preview.slice(0, 300),
  };
}

// ─────────────────────────────────────────────
// Load Facebook SDK
// ─────────────────────────────────────────────
function loadFacebookSdk(appId, version = "v20.0") {
  return new Promise((resolve, reject) => {
    const initFb = () => {
      try {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: true,
          version,
        });
        resolve(window.FB);
      } catch (err) {
        reject(err);
      }
    };

    if (window.FB) {
      initFb();
      return;
    }

    window.fbAsyncInit = function () {
      initFb();
    };

    if (!document.getElementById(FB_SDK_ID)) {
      const script = document.createElement("script");
      script.id = FB_SDK_ID;
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error("FB SDK failed"));
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

  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [wabaId, setWabaId] = useState("");

  const embeddedSessionRef = useRef({});
  const embeddedAuthCodeRef = useRef(null);
  const embeddedCompletionStartedRef = useRef(false);
  const embeddedConfigRef = useRef(null);
  const [lastMetaEvent, setLastMetaEvent] = useState(null);
  const [lastMetaMessage, setLastMetaMessage] = useState(null);
  const [embeddedConfig, setEmbeddedConfig] = useState(null);
  const [lastError, setLastError] = useState(null);

  // ─────────────────────────────────────────────
  // Fetch integrations
  // ─────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getData(`${LIST_API}?agent=${agentId}&platform=WHATSAPP`);
      setConnected(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  // ─────────────────────────────────────────────
  // Listen Embedded Signup Session
  // ─────────────────────────────────────────────
  useEffect(() => {
    const listener = (event) => {
      if (!event.origin.includes("facebook.com")) return;

      try {
        console.log("[Meta WA] message event", {
          origin: event.origin,
          dataType: typeof event.data,
          data: event.data,
        });
        setLastMetaMessage({
          origin: event.origin,
          dataType: typeof event.data,
          data: event.data,
        });

        let data = event.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch {
            const params = new URLSearchParams(data);
            const entries = Object.fromEntries(params.entries());
            if (Object.keys(entries).length > 0) {
              setLastMetaEvent({
                type: "NON_JSON_FB_MESSAGE",
                event: entries.event || null,
                raw: data,
                parsed: entries,
              });
            }
            return;
          }
        }

        if (data && typeof data === "object") {
          setLastMetaEvent({
            type: data.type || "OBJECT_FB_MESSAGE",
            event: data.event || null,
            raw: data,
          });
        }

        if (data?.type === "WA_EMBEDDED_SIGNUP") {
          if (data.event === "FINISH") {
            const session = extractEmbeddedSignupSession(data);
            embeddedSessionRef.current = session;
            console.log("Embedded Session:", session);
            tryCompleteEmbeddedSignup();
            return;
          }

          if (data.event === "ERROR") {
            const msg = data?.data?.error_message || "WhatsApp signup failed in Meta";
            setLastError(msg);
            messageApi.error(msg);
            setConnecting(false);
            return;
          }

          if (data.event === "CANCEL") {
            setConnecting(false);
          }
        }
      } catch (err) {
        console.debug("Ignored non-JSON Facebook message event", err);
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────
  // Complete Embedded Signup once both code and session data exist
  // ─────────────────────────────────────────────
  const tryCompleteEmbeddedSignup = async () => {
    const code = embeddedAuthCodeRef.current;
    const session = embeddedSessionRef.current || {};
    const waba_id = session.waba_id;
    const phone_number_id = session.phone_number_id;

    if (!code || !waba_id || embeddedCompletionStartedRef.current) {
      return;
    }

    embeddedCompletionStartedRef.current = true;

    try {
      const res = await postData(EMBEDDED_COMPLETE_API, {
        agent: Number(agentId),
        code,
        waba_id,
        phone_number_id: phone_number_id || null,
      });

      if (res?.detail === "connected" || res?.data?.detail === "connected") {
        messageApi.success("WhatsApp connected");
        fetchData();
      } else {
        throw new Error(prettyErr(res));
      }
    } catch (e) {
      const msg = e.message || "Failed to connect";
      setLastError(msg);
      messageApi.error(msg);
    } finally {
      embeddedAuthCodeRef.current = null;
      embeddedSessionRef.current = {};
      embeddedCompletionStartedRef.current = false;
      setConnecting(false);
    }
  };

  // ─────────────────────────────────────────────
  // Embedded Signup Handler
  // ─────────────────────────────────────────────
  const handleEmbeddedSignupResponse = async (response) => {
    const code = response?.authResponse?.code;

    if (!code) {
      setConnecting(false);
      messageApi.warning("Signup cancelled");
      return;
    }

    embeddedAuthCodeRef.current = code;
    tryCompleteEmbeddedSignup();

    window.setTimeout(() => {
      const session = embeddedSessionRef.current || {};
      if (!embeddedCompletionStartedRef.current && !session.waba_id) {
        const rawCodeOnlyCallback =
          lastMetaEvent?.type === "NON_JSON_FB_MESSAGE" &&
          (lastMetaEvent?.parsed?.code || lastMetaEvent?.raw?.includes?.("code="));

        const msg = rawCodeOnlyCallback
          ? "Facebook returned an OAuth code, but Meta did not emit the WhatsApp Embedded Signup completion event. This points to a Meta app/configuration issue, not a parsing issue in this page."
          : "Meta did not send a usable WhatsApp completion payload. Try the Facebook flow again.";
        setLastError(msg);
        messageApi.error(msg);
        embeddedAuthCodeRef.current = null;
        setConnecting(false);
      }
    }, 15000);
  };

  // ─────────────────────────────────────────────
  // Start Embedded Signup
  // ─────────────────────────────────────────────
  const startEmbeddedSignup = async () => {
    setConnecting(true);
    setLastError(null);
    setLastMetaEvent(null);
    embeddedSessionRef.current = {};
    embeddedAuthCodeRef.current = null;
    embeddedCompletionStartedRef.current = false;

    try {
      const cfg = await getData(EMBEDDED_CONFIG_API);
      embeddedConfigRef.current = cfg;
      setEmbeddedConfig(cfg);

      await loadFacebookSdk(cfg.app_id, cfg.graph_version);

      window.FB.login(
        (response) => {
          handleEmbeddedSignupResponse(response);
        },
        {
          config_id: cfg.config_id,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            version: "v3",
            setup: {},
            features: [],
          },
        }
      );
    } catch {
      messageApi.error("Failed to start signup");
      setConnecting(false);
    }
  };

  // ─────────────────────────────────────────────
  // Manual Connect
  // ─────────────────────────────────────────────
  const manualConnect = async () => {
    setManualLoading(true);

    try {
      const res = await postData(MANUAL_CONNECT_API, {
        agent: Number(agentId),
        waba_id: wabaId,
        wa_phone_number_id: phoneNumberId,
        wa_access_token: accessToken,
      });

      if (res?.detail === "connected") {
        messageApi.success("Connected");
        fetchData();
      } else {
        throw new Error(prettyErr(res));
      }
    } catch (e) {
      messageApi.error(e.message);
    }

    setManualLoading(false);
  };

  // ─────────────────────────────────────────────
  // Disconnect
  // ─────────────────────────────────────────────
  const disconnect = (item) => {
    Modal.confirm({
      title: "Disconnect?",
      onOk: async () => {
        setDisconnectingId(item.id);
        await postData(DISCONNECT_API(item.id), {});
        fetchData();
        setDisconnectingId(null);
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {contextHolder}

      <Card>
        <h2>WhatsApp Integration</h2>

        {lastError && (
          <Alert
            type="error"
            message={lastError}
            description={
              (() => {
                const summary = getMetaEventSummary(lastMetaEvent);
                if (!summary) return null;
                return `Last Meta event: ${summary.eventName}. Payload: ${summary.preview}`;
              })()
            }
          />
        )}

        <Collapse
          className="mb-4"
          items={[
            {
              key: "debug",
              label: "Debug Info",
              children: (
                <div className="space-y-4">
                  <div>
                    <Text strong>Embedded Config</Text>
                    <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
                      {JSON.stringify(embeddedConfig, null, 2) || "Not loaded yet"}
                    </pre>
                  </div>
                  <div>
                    <Text strong>Last Meta Event</Text>
                    <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
                      {JSON.stringify(lastMetaEvent, null, 2) || "No event received"}
                    </pre>
                  </div>
                  <div>
                    <Text strong>Last Meta Message</Text>
                    <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
                      {JSON.stringify(lastMetaMessage, null, 2) || "No message received"}
                    </pre>
                  </div>
                  <div>
                    <Text strong>Parsed Embedded Session</Text>
                    <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
                      {JSON.stringify(embeddedSessionRef.current, null, 2) || "No session parsed"}
                    </pre>
                  </div>
                </div>
              ),
            },
          ]}
        />

        <Button
          type="primary"
          onClick={startEmbeddedSignup}
          loading={connecting}
        >
          Connect via Facebook (Recommended)
        </Button>

        <Divider />

        <Collapse
          items={[
            {
              key: "1",
              label: "Manual Setup",
              children: (
                <>
                  <Input
                    placeholder="WABA ID"
                    value={wabaId}
                    onChange={(e) => setWabaId(e.target.value)}
                  />
                  <Input
                    placeholder="Phone Number ID"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                  />
                  <Input.Password
                    placeholder="Access Token"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                  />
                  <Button
                    onClick={manualConnect}
                    loading={manualLoading}
                    disabled={!phoneNumberId || !accessToken}
                  >
                    Connect Manually
                  </Button>
                </>
              ),
            },
          ]}
        />
      </Card>

      <Card title="Connected Numbers">
        <List
          loading={loading}
          dataSource={connected}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Tag color="green">CONNECTED</Tag>,
                <Button
                  danger
                  loading={disconnectingId === item.id}
                  onClick={() => disconnect(item)}
                >
                  Disconnect
                </Button>,
              ]}
            >
              {item.wa_display_phone_number || item.wa_phone_number_id}
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
