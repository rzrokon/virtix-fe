import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Divider,
  Input,
  Space,
  Tag,
  Typography,
  message,
  Modal,
} from "antd";
import { useContentApi } from "../../contexts/ContentApiContext";
import { getData, postData } from "../../scripts/api-service";

const { Title, Text } = Typography;

const api = {
  install: (agentName, shop) =>
    `api/integrations/agents/${agentName}/shopify/install/?shop=${encodeURIComponent(shop)}`,
  source: (agentName) => `api/integrations/agents/${agentName}/shopify/source/`,
  disconnect: (agentName) => `api/integrations/agents/${agentName}/shopify/disconnect/`,
};

function prettyErr(e) {
  if (!e) return "Request failed";

  if (typeof e === "string") return e;

  if (e?.error && e?.errors) {
    if (typeof e.errors === "string") return e.errors;
    if (e.errors?.detail) return e.errors.detail;
    return JSON.stringify(e.errors);
  }

  const data = e?.response?.data;
  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;

  return e?.message || "Request failed";
}

function normalizeShopDomain(value) {
  let v = (value || "").trim().toLowerCase();

  v = v.replace(/^https?:\/\//, "");
  v = v.replace(/\/.*$/, "");

  if (!v) return "";

  if (!v.endsWith(".myshopify.com")) {
    v = `${v}.myshopify.com`;
  }

  return v;
}

export default function ShopifyIntegration() {
  const { currentAgentName: agentName } = useContentApi();
  const [messageApi, contextHolder] = message.useMessage();

  const [shopDomain, setShopDomain] = useState("");
  const [source, setSource] = useState(null);
  const [error, setError] = useState(null);

  const [loadingSource, setLoadingSource] = useState(false);
  const [loadingInstall, setLoadingInstall] = useState(false);
  const [loadingDisconnect, setLoadingDisconnect] = useState(false);

  const isConnected = useMemo(() => source?.status === "ACTIVE", [source]);

  const loadSource = useCallback(async () => {
    if (!agentName) return;

    setLoadingSource(true);
    setError(null);

    try {
      const res = await getData(api.source(agentName));

      if (res?.connected && res?.source) {
        setSource(res.source);
        if (res.source.shop_domain) {
          setShopDomain(res.source.shop_domain);
        }
      } else {
        setSource(null);
      }
    } catch (e) {
      setSource(null);
      setError(prettyErr(e));
    } finally {
      setLoadingSource(false);
    }
  }, [agentName]);

  useEffect(() => {
    if (!agentName) return;
    loadSource();
  }, [agentName, loadSource]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");

    if (status === "connected") {
      messageApi.success("Shopify connected successfully");
      loadSource();

      const url = new URL(window.location.href);
      url.searchParams.delete("status");
      window.history.replaceState({}, "", url.toString());
    }

    if (status === "error") {
      messageApi.error("Shopify connection failed");
      const url = new URL(window.location.href);
      url.searchParams.delete("status");
      window.history.replaceState({}, "", url.toString());
    }
  }, [loadSource, messageApi]);

  const canInstall = useMemo(() => {
    return !!normalizeShopDomain(shopDomain) && !!agentName;
  }, [shopDomain, agentName]);

  const startInstall = async () => {
    if (!agentName) {
      messageApi.error("Agent is not loaded yet. Please refresh.");
      return;
    }

    const normalizedShop = normalizeShopDomain(shopDomain);
    if (!normalizedShop) {
      messageApi.warning("Please enter a valid Shopify shop domain.");
      return;
    }

    setLoadingInstall(true);
    setError(null);

    try {
      const res = await getData(api.install(agentName, normalizedShop));
      const installUrl = res?.install_url;

      if (!installUrl) {
        throw new Error("Install URL not returned by server.");
      }

      window.location.href = installUrl;
    } catch (e) {
      const msg = prettyErr(e);
      setError(msg);
      messageApi.error(msg);
      setLoadingInstall(false);
    }
  };

  const disconnectShopify = async () => {
    if (!agentName) return;

    Modal.confirm({
      title: "Disconnect Shopify store?",
      content:
        "This will remove the connected Shopify source from this agent. You can reconnect later.",
      okText: "Disconnect",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        setLoadingDisconnect(true);
        setError(null);

        try {
          const res = await postData(api.disconnect(agentName), {});
          const data = res?.data ?? res;

          if (data?.detail === "disconnected") {
            messageApi.success("Shopify disconnected");
            setSource(null);
          } else {
            throw new Error(data?.detail || "Disconnect failed");
          }
        } catch (e) {
          const msg = prettyErr(e);
          setError(msg);
          messageApi.error(msg);
        } finally {
          setLoadingDisconnect(false);
        }
      },
    });
  };

  if (!agentName) {
    return (
      <div className="p-6">
        {contextHolder}
        <Alert
          type="info"
          showIcon
          message="Loading Shopify integration..."
          description="Please wait a moment."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {contextHolder}

      <div>
        <Title level={2} style={{ marginBottom: 0 }}>
          Shopify Integration
        </Title>
        <Text type="secondary">
          Agent: <Text code>{agentName}</Text>
        </Text>
      </div>

      {error ? <Alert type="error" showIcon message={error} /> : null}

      <Card
        loading={loadingSource}
        title="Connect Shopify Store"
        extra={
          isConnected ? (
            <Tag color="green">ACTIVE</Tag>
          ) : (
            <Tag color="orange">NOT CONNECTED</Tag>
          )
        }
      >
        <div className="space-y-4" style={{ maxWidth: 820 }}>
          <Input
            placeholder="Shop domain (example: mystore.myshopify.com or mystore)"
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
            disabled={isConnected}
          />

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              type="primary"
              onClick={startInstall}
              loading={loadingInstall}
              disabled={!canInstall || isConnected}
            >
              Connect Shopify
            </Button>

            <Button onClick={loadSource} disabled={!agentName}>
              Refresh Connection
            </Button>

            {isConnected ? (
              <Button
                danger
                onClick={disconnectShopify}
                loading={loadingDisconnect}
              >
                Disconnect
              </Button>
            ) : null}
          </div>

          <Divider style={{ margin: "12px 0" }} />

          <div className="text-gray-500">
            <ul className="list-disc ml-5 space-y-1">
              <li>Enter your Shopify store domain, for example <b>mystore.myshopify.com</b>.</li>
              <li>You will be redirected to Shopify to approve the connection.</li>
              <li>After approval, you will be returned to <b>https://virtixai.com</b>.</li>
              <li>We recommend using an offline token for background sync and webhooks.</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="Connected Shopify Store">
        {source ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Tag color="blue">{source.shop_domain || "-"}</Tag>
              <Tag color="purple">{source.shop_name || "Shopify Store"}</Tag>
              <Tag color="green">{source.status || "ACTIVE"}</Tag>
            </div>

            <div className="space-y-1">
              <div>
                <Text type="secondary">Shop Domain:</Text>{" "}
                <Text code>{source.shop_domain || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Shop Name:</Text>{" "}
                <Text>{source.shop_name || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Currency:</Text>{" "}
                <Text>{source.currency || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Last Synced:</Text>{" "}
                <Text>{source.last_synced_at || "-"}</Text>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">
            No Shopify store connected yet.
          </div>
        )}
      </Card>
    </div>
  );
}
