import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
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
  install: (agentName, shop) => `api/integrations/agents/${agentName}/shopify/install/?shop=${encodeURIComponent(shop)}`,
  source: (agentName) => `api/integrations/agents/${agentName}/shopify/source/`,
  refresh: (agentName) => `api/integrations/agents/${agentName}/shopify/source/refresh/`,
  health: (agentName) => `api/integrations/agents/${agentName}/shopify/health/`,
  reconcile: (agentName) => `api/integrations/agents/${agentName}/shopify/reconcile/`,
  webhookHealth: (agentName) => `api/integrations/agents/${agentName}/shopify/webhook-health/`,
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
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();

  const [shopDomain, setShopDomain] = useState("");
  const [source, setSource] = useState(null);
  const [health, setHealth] = useState(null);
  const [webhookHealth, setWebhookHealth] = useState(null);
  const [error, setError] = useState(null);

  const [products, setProducts] = useState([]);

  const [loadingSource, setLoadingSource] = useState(false);
  const [loadingInstall, setLoadingInstall] = useState(false);
  const [loadingDisconnect, setLoadingDisconnect] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [loadingReconcile, setLoadingReconcile] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [first, setFirst] = useState(50);
  const [maxPages, setMaxPages] = useState(20);
  const [markMissingInactive, setMarkMissingInactive] = useState(true);

  const [q, setQ] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const isConnected = useMemo(() => source?.connected === true, [source]);
  const hasStorefrontToken = useMemo(() => !!source?.has_storefront_token, [source]);
  const needsReconnect = useMemo(
    () => source?.next_action === "shopify_reconnect" && !isConnected,
    [source, isConnected]
  );
  const hasHistoricalConnection = useMemo(
    () => !!source?.shop_domain || !!source?.shop_name,
    [source]
  );
  const needsVerification = useMemo(
    () => !!(source?.requires_reconciliation || health?.requires_reconciliation),
    [source, health]
  );
  const hasConfigWarning = useMemo(
    () => ["missing", "error"].includes(source?.webhook_registration_status || health?.webhook_registration_status),
    [source, health]
  );
  const healthDegraded = useMemo(
    () =>
      ["degraded", "error"].includes(source?.webhook_health || webhookHealth?.webhook_health || "") ||
      source?.connection_status === "error",
    [source, webhookHealth]
  );

  const loadSource = useCallback(async () => {
    if (!agentName) return;

    setLoadingSource(true);
    setError(null);

    try {
      const [sourceRes, healthRes, webhookRes] = await Promise.all([
        getData(api.source(agentName)),
        getData(api.health(agentName)),
        getData(api.webhookHealth(agentName)),
      ]);
      const merged = { ...(sourceRes || {}), ...(healthRes || {}), ...(webhookRes || {}) };
      setSource(merged || null);
      setHealth(healthRes || null);
      setWebhookHealth(webhookRes || null);
      if (merged?.shop_domain) setShopDomain(merged.shop_domain);
    } catch (e) {
      setSource(null);
      setHealth(null);
      setWebhookHealth(null);
      setError(prettyErr(e));
    } finally {
      setLoadingSource(false);
    }
  }, [agentName]);

  const refreshConnection = async () => {
    if (!agentName) return;
    setLoadingSource(true);
    setError(null);
    try {
      const res = await postData(api.refresh(agentName), {});
      const data = res?.data ?? res;
      if (data?.detail && !data?.connection_status && !data?.connected) {
        throw new Error(data.detail);
      }
      await loadSource();
    } catch (e) {
      const msg = prettyErr(e);
      setError(msg);
      messageApi.error(msg);
    } finally {
      setLoadingSource(false);
    }
  };

  const reconcileBilling = async () => {
    if (!agentName) return;
    setLoadingReconcile(true);
    setError(null);
    try {
      const res = await postData(api.reconcile(agentName), {});
      const data = res?.data ?? res;
      setSource((prev) => ({ ...(prev || {}), ...(data || {}) }));
      await loadSource();
      messageApi.success("Shopify billing reconciled");
    } catch (e) {
      const msg = prettyErr(e);
      setError(msg);
      messageApi.error(msg);
    } finally {
      setLoadingReconcile(false);
    }
  };

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
    const params = new URLSearchParams(location.search);
    const shopFromQuery = normalizeShopDomain(params.get("shop") || "");
    if (shopFromQuery) {
      setShopDomain((current) => current || shopFromQuery);
    }
  }, [location.search]);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");
  const checkout = params.get("checkout");

  if (status === "connected") {
    if (checkout === "not_ready") {
      messageApi.warning(
        "Shopify connected, but storefront checkout is not ready yet. Update Storefront API scopes, then reconnect."
      );
    } else if (params.get("config") === "warning") {
      messageApi.warning("Shopify connected, but webhook configuration still needs verification.");
    } else {
      messageApi.success("Shopify connected successfully");
    }

    loadSource();

    const url = new URL(window.location.href);
    url.searchParams.delete("status");
    url.searchParams.delete("checkout");
    url.searchParams.delete("config");
    window.history.replaceState({}, "", url.toString());
  }

  if (status === "error") {
    messageApi.error("Shopify connection failed");
    const url = new URL(window.location.href);
    url.searchParams.delete("status");
    url.searchParams.delete("checkout");
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
    const normalizedShop = normalizeShopDomain(shopDomain);
    if (!normalizedShop) {
      messageApi.warning("Please enter a valid Shopify shop domain.");
      return;
    }

    setLoadingInstall(true);
    setError(null);
    try {
      const data = await getData(api.install(agentName, normalizedShop));
      if (!data?.install_url) {
        throw new Error("Install URL was not returned.");
      }
      window.location.assign(data.install_url);
    } catch (e) {
      const msg = prettyErr(e);
      setError(msg);
      messageApi.error(msg);
    } finally {
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
            setSource(data);
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
        setSource(data);
        await loadProducts();
        if (data?.changed) {
          window.dispatchEvent(new CustomEvent("virtix-agent-knowledge-changed"));
        }
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
          Shopify Data Settings
        </Title>
        <Text type="secondary">
          Agent: <Text code>{agentName}</Text>
        </Text>
      </div>

      {error ? <Alert type="error" showIcon message={error} /> : null}

      {needsReconnect && hasHistoricalConnection ? (
        <Alert
          type="warning"
          showIcon
          message="Shopify connection requires reconnection"
          description="This agent still uses Shopify mode, but the previous Shopify connection is inactive. Connect Shopify again to resume sync and product access."
        />
      ) : null}

      {source?.requires_reconciliation ? (
        <Alert
          type="warning"
          showIcon
          message="Verification Recommended"
          description="Virtix detected Shopify lifecycle changes that should be verified before you rely on billing or product state."
        />
      ) : null}

      {hasConfigWarning ? (
        <Alert
          type="warning"
          showIcon
          message="Configuration Warning"
          description="Required Shopify webhooks are missing or need to be reverified. Refresh the connection to recheck the app configuration."
        />
      ) : null}

      {healthDegraded ? (
        <Alert
          type="warning"
          showIcon
          message="Reconnect"
          description="Shopify health checks found a connection issue. Refresh the connection first. If the warning remains, reconnect Shopify and verify billing."
        />
      ) : null}

      {!hasStorefrontToken && isConnected ? (
        <Alert
          type="warning"
          showIcon
          message="Storefront checkout is not configured"
          description="This Shopify store is connected, but checkout link generation is not ready yet. Update Storefront API scopes, then reconnect Shopify."
        />
      ) : null}

      <Card
        loading={loadingSource}
        title={isConnected ? "Connected Shopify Store" : "Connect Your Shopify Store"}
        extra={
          isConnected ? (
            <Tag color="green">ACTIVE</Tag>
          ) : needsReconnect ? (
            <Tag color="gold">RECONNECT REQUIRED</Tag>
          ) : (
            <Tag color="orange">NOT CONNECTED</Tag>
          )
        }
      >
        <div className="space-y-4" style={{ maxWidth: 820 }}>
          {!isConnected ? (
            <Input
              placeholder="Store URL (example: mystore.myshopify.com or mystore)"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
            />
          ) : null}

          <div className="flex items-center gap-3 flex-wrap">
            {!isConnected ? (
              <Button
                type="primary"
                onClick={startInstall}
                loading={loadingInstall}
                disabled={!canInstall}
              >
                {needsReconnect ? "Connect Shopify Again" : "Connect Shopify"}
              </Button>
            ) : null}

            <Button onClick={isConnected ? refreshConnection : loadSource} disabled={!agentName}>
              Refresh Connection
            </Button>

            <Button onClick={reconcileBilling} loading={loadingReconcile} disabled={!agentName || !source?.shop_domain}>
              Verify Billing
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
              <li>Sign in to Shopify and approve the Virtix app installation.</li>
              <li>After approval, you will return here with the store connected.</li>
              <li>Shopify-connected accounts are billed through Shopify.</li>
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

            <Button onClick={confirmSync} loading={loadingSync} disabled={!isConnected || loadingSync}>
              Sync Products
            </Button>

            <Button onClick={refreshConnection} disabled={!agentName}>
              Refresh Connection
            </Button>
          </div>

          <Divider style={{ margin: "12px 0" }} />

          <div className="text-gray-500">
            <ul className="list-disc ml-5 space-y-1">
              <li>Sync pulls products and variants from Shopify Admin GraphQL.</li>
              <li>Inventory, pricing, images, status, and collections are refreshed together.</li>
              <li>Products are stored in your local catalog for search and later RAG indexing.</li>
              <li>After sync, products appear in the list below.</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="Store Details">
        {source ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Tag color="blue">{source.shop_domain || "-"}</Tag>
              <Tag color="purple">{source.shop_name || "Shopify Store"}</Tag>
              <Tag color="green">{source.status || "ACTIVE"}</Tag>
              <Tag color={hasStorefrontToken ? "green" : "orange"}>
                {hasStorefrontToken ? "Checkout Ready" : "Checkout Not Ready"}
              </Tag>
            </div>

            <div className="space-y-1">
              <div>
                <Text type="secondary">Store Name:</Text>{" "}
                <Text>{source.shop_name || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Shopify Domain:</Text>{" "}
                <Text code>{source.shop_domain || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Connection Status:</Text>{" "}
                <Text>{source.connection_status || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Lifecycle Status:</Text>{" "}
                <Text>{source.lifecycle_status || health?.lifecycle_status || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Webhook Health:</Text>{" "}
                <Text>{source.webhook_health || webhookHealth?.webhook_health || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Webhook Registration:</Text>{" "}
                <Text>{source.webhook_registration_status || health?.webhook_registration_status || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Missing Webhooks:</Text>{" "}
                <Text>{(source.missing_webhook_topics || health?.missing_webhook_topics || []).join(", ") || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Connected Since:</Text>{" "}
                <Text>{source.connected_at || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Last Webhook:</Text>{" "}
                <Text>{source.last_webhook_at || webhookHealth?.last_webhook_at || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Last Verified:</Text>{" "}
                <Text>{source.last_verified_at || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Last Billing Reconciliation:</Text>{" "}
                <Text>{source.last_reconciled_at || health?.last_reconciled_at || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Requires Reconciliation:</Text>{" "}
                <Text>{source.requires_reconciliation ? "Yes" : "No"}</Text>
              </div>
              <div>
                <Text type="secondary">Next Action:</Text>{" "}
                <Text>{source.next_action || health?.next_action || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Currency:</Text>{" "}
                <Text>{source.currency || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Country:</Text>{" "}
                <Text>{source.country_code || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Products Synced:</Text>{" "}
                <Text>{source.synced_product_count ?? 0}</Text>
              </div>
              <div>
                <Text type="secondary">Last Product Sync:</Text>{" "}
                <Text>{source.last_product_sync_at || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Last Inventory Sync:</Text>{" "}
                <Text>{source.last_inventory_sync_at || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Sync Status:</Text>{" "}
                <Text>{source.last_sync_status || "-"}</Text>
              </div>
              <div>
                <Text type="secondary">Storefront Checkout:</Text>{" "}
                <Text>{hasStorefrontToken ? "Configured" : "Not configured"}</Text>
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
