import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Divider,
  Input,
  List,
  Modal,
  Space,
  Switch,
  Tag,
  Typography,
  message,
  InputNumber,
  Tooltip,
} from "antd";
import { getData, postData } from "../../scripts/api-service";
import { useContentApi } from "../../contexts/ContentApiContext";

const { Title, Text } = Typography;

const api = {
  install: (agentName, shop) =>
    `api/integrations/agents/${agentName}/shopify/install/?shop=${encodeURIComponent(shop)}`,
  source: (agentName) => `api/integrations/agents/${agentName}/shopify/source/`,
  disconnect: (agentName) => `api/integrations/agents/${agentName}/shopify/disconnect/`,
  sync: (agentName) => `api/integrations/agents/${agentName}/shopify/sync/`,
  products: (agentName) => `api/integrations/agents/${agentName}/shopify/products/`,
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

  const [products, setProducts] = useState([]);

  const [loadingSource, setLoadingSource] = useState(false);
  const [loadingInstall, setLoadingInstall] = useState(false);
  const [loadingDisconnect, setLoadingDisconnect] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [first, setFirst] = useState(50);
  const [maxPages, setMaxPages] = useState(20);
  const [markMissingInactive, setMarkMissingInactive] = useState(true);

  const [q, setQ] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);

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

  const loadProducts = useCallback(async () => {
    if (!agentName || !isConnected) return;

    setLoadingProducts(true);
    setError(null);

    try {
      const qs = new URLSearchParams();
      if ((q || "").trim()) qs.set("q", q.trim());
      qs.set("active_only", activeOnly ? "true" : "false");

      const res = await getData(`${api.products(agentName)}?${qs.toString()}`);
      setProducts(Array.isArray(res?.results) ? res.results : []);
    } catch (e) {
      setError(prettyErr(e));
    } finally {
      setLoadingProducts(false);
    }
  }, [agentName, isConnected, q, activeOnly]);

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

  useEffect(() => {
    if (!agentName || !isConnected) return;
    loadProducts();
  }, [agentName, isConnected, loadProducts]);

  const canInstall = useMemo(() => {
    return !!normalizeShopDomain(shopDomain) && !!agentName && !isConnected;
  }, [shopDomain, agentName, isConnected]);

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
            setProducts([]);
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

  const runSync = async () => {
    if (!agentName || !isConnected) return;

    setLoadingSync(true);
    setError(null);

    try {
      const res = await postData(api.sync(agentName), {
        first,
        max_pages: maxPages,
        mark_missing_inactive: markMissingInactive,
      });

      const data = res?.data ?? res;

      if (data?.detail === "synced") {
        messageApi.success(
          `Sync done: ${data.fetched_products || 0} products, created ${data.created_products || 0}, updated ${data.updated_products || 0}`
        );
        await loadSource();
        await loadProducts();
      } else {
        throw new Error(data?.detail || "Sync failed");
      }
    } catch (e) {
      const msg = prettyErr(e);
      setError(msg);
      messageApi.error(msg);
    } finally {
      setLoadingSync(false);
    }
  };

  const confirmSync = () => {
    Modal.confirm({
      title: "Sync Shopify products now?",
      content: (
        <div>
          <div>We will fetch products and variants from Shopify and update your catalog.</div>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              First sync may take time for large stores.
            </Text>
          </div>
          <Divider />
          <div className="space-y-2">
            <div>
              <Text type="secondary">first:</Text> <Text code>{first}</Text>
            </div>
            <div>
              <Text type="secondary">max_pages:</Text> <Text code>{maxPages}</Text>
            </div>
            <div>
              <Text type="secondary">mark_missing_inactive:</Text>{" "}
              <Text code>{markMissingInactive ? "true" : "false"}</Text>
            </div>
          </div>
        </div>
      ),
      okText: "Start Sync",
      cancelText: "Cancel",
      onOk: runSync,
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
              disabled={!canInstall}
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
              <li>After approval, you will be returned to your dashboard.</li>
              <li>We recommend using an offline token for background sync and webhooks.</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="Sync Products">
        <div className="space-y-3" style={{ maxWidth: 900 }}>
          <div className="flex flex-wrap items-center gap-4">
            <Space>
              <Text type="secondary">first</Text>
              <InputNumber min={1} max={100} value={first} onChange={(v) => setFirst(v || 50)} />
            </Space>

            <Space>
              <Text type="secondary">max_pages</Text>
              <InputNumber min={1} max={200} value={maxPages} onChange={(v) => setMaxPages(v || 20)} />
            </Space>

            <Space>
              <Switch checked={markMissingInactive} onChange={setMarkMissingInactive} />
              <Text>Mark missing products inactive</Text>
            </Space>

            <Button onClick={confirmSync} loading={loadingSync} disabled={!isConnected}>
              Sync Now
            </Button>

            <Button onClick={loadSource} disabled={!agentName}>
              Refresh Connection
            </Button>
          </div>

          <Divider style={{ margin: "12px 0" }} />

          <div className="text-gray-500">
            <ul className="list-disc ml-5 space-y-1">
              <li>Sync pulls products and variants from Shopify Admin GraphQL.</li>
              <li>Products are stored in your local catalog for search and later RAG indexing.</li>
              <li>After sync, products appear in the list below.</li>
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
                <Text type="secondary">Timezone:</Text>{" "}
                <Text>{source.timezone || "-"}</Text>
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

      <Card
        title="Indexed Shopify Products"
        extra={
          <Space>
            <Input
              allowClear
              placeholder="Search by title / handle / SKU / ID"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onPressEnter={loadProducts}
              style={{ width: 280 }}
            />
            <Button onClick={loadProducts} loading={loadingProducts}>
              Search
            </Button>

            <Space>
              <Switch checked={activeOnly} onChange={setActiveOnly} />
              <Text>Active only</Text>
            </Space>

            <Button onClick={loadProducts} loading={loadingProducts}>
              Refresh
            </Button>
          </Space>
        }
      >
        {products?.length ? (
          <List
            dataSource={products}
            rowKey={(item) => item.id}
            loading={loadingProducts}
            renderItem={(item) => {
              const priceLabel =
                item.min_price && item.max_price
                  ? item.min_price === item.max_price
                    ? `${item.min_price}${item.currency ? ` ${item.currency}` : ""}`
                    : `${item.min_price} - ${item.max_price}${item.currency ? ` ${item.currency}` : ""}`
                  : "-";

              return (
                <List.Item
                  actions={[
                    <Tag key="status" color="purple">
                      {item.status || "active"}
                    </Tag>,
                    item.is_active ? (
                      <Tag key="active" color="green">active</Tag>
                    ) : (
                      <Tag key="inactive">inactive</Tag>
                    ),
                    <Tag key="price" color="blue">{priceLabel}</Tag>,
                    item.online_store_url ? (
                      <a key="open" href={item.online_store_url} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    ) : null,
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    title={item.title || `Product ${item.shopify_numeric_id}`}
                    description={
                      <div className="space-y-1">
                        <div>
                          <Text type="secondary">Product ID:</Text>{" "}
                          <Text code>{item.shopify_numeric_id || "-"}</Text>{" "}
                          <Text type="secondary">Handle:</Text>{" "}
                          <Text code>{item.handle || "-"}</Text>
                        </div>

                        <div>
                          <Text type="secondary">Vendor:</Text>{" "}
                          <Text>{item.vendor || "-"}</Text>{" "}
                          <Text type="secondary" style={{ marginLeft: 12 }}>Type:</Text>{" "}
                          <Text>{item.product_type || "-"}</Text>
                        </div>

                        {item.online_store_url ? (
                          <div>
                            <Text type="secondary">URL:</Text>{" "}
                            <Tooltip title={item.online_store_url}>
                              <Text code style={{ cursor: "pointer" }}>
                                {item.online_store_url.length > 90
                                  ? `${item.online_store_url.slice(0, 90)}…`
                                  : item.online_store_url}
                              </Text>
                            </Tooltip>
                          </div>
                        ) : null}

                        <div className="flex flex-wrap gap-3">
                          <div>
                            <Text type="secondary">Variants:</Text>{" "}
                            <Text>{item.variants?.length || 0}</Text>
                          </div>
                          <div>
                            <Text type="secondary">Updated:</Text>{" "}
                            <Text>{item.updated_at_source || "-"}</Text>
                          </div>
                          <div>
                            <Text type="secondary">Checksum:</Text>{" "}
                            <Text code>{(item.checksum || "").slice(0, 12) || "-"}</Text>
                          </div>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <div className="text-gray-500">
            {isConnected ? (
              <>No products indexed yet. Click <b>Sync Now</b> to fetch Shopify products.</>
            ) : (
              <>Connect Shopify first.</>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}