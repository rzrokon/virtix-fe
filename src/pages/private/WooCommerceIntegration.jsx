import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Divider,
  Input,
  List,
  Modal,
  Switch,
  Tag,
  Typography,
  message,
  Space,
  InputNumber,
  Tooltip,
} from "antd";
import { getData, postData } from "../../scripts/api-service";
import { useContentApi } from "../../contexts/ContentApiContext";

const { Title, Text } = Typography;

const api = {
  source: (agentName) => `api/integrations/agents/${agentName}/woocommerce/source/`,
  connect: (agentName) => `api/integrations/agents/${agentName}/woocommerce/connect/`,
  sync: (agentName) => `api/integrations/agents/${agentName}/woocommerce/sync/`,
  products: (agentName) => `api/integrations/agents/${agentName}/woocommerce/products/`,
  toggle: (agentName, pk) => `api/integrations/agents/${agentName}/woocommerce/products/${pk}/toggle/`,
};

function prettyErr(e) {
  const data = e?.response?.data;
  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  return e?.message || "Request failed";
}

export default function WooCommerceIntegration() {
  // ✅ agent_name from context (PrivateLayout sets it after fetching agent by id)
  const { currentAgentName: agentName } = useContentApi();

  const [messageApi, contextHolder] = message.useMessage();

  // Connect form
  const [siteUrl, setSiteUrl] = useState("");
  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");

  // Sync controls
  const [perPage, setPerPage] = useState(100);
  const [maxPages, setMaxPages] = useState(50);
  const [markMissingInactive, setMarkMissingInactive] = useState(true);

  // Listing controls
  const [q, setQ] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);

  // Data
  const [products, setProducts] = useState([]);
  const [source, setSource] = useState(null);

  // UI states
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSource, setLoadingSource] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState(null);

  const isConnected = useMemo(() => source?.status === "ACTIVE", [source]);

  // ✅ NEW: Load saved Woo source on page open (so it shows connected after refresh)
  const loadSource = useCallback(async () => {
    if (!agentName) return;
    setLoadingSource(true);
    setError(null);

    try {
      const res = await getData(api.source(agentName));
      if (res?.connected && res?.source) {
        setSource(res.source);

        // nice UX: prefill site url if not typed yet
        if (!siteUrl?.trim() && res.source.site_url) {
          setSiteUrl(res.source.site_url);
        }
      } else {
        setSource(null);
      }
    } catch (e) {
      // don’t hard fail the page for source endpoint issues
      setSource(null);
    } finally {
      setLoadingSource(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentName]);

  const loadProducts = useCallback(async () => {
    if (!agentName) return;

    setLoadingList(true);
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
      setLoadingList(false);
    }
  }, [agentName, q, activeOnly]);

  // ✅ On agentName ready, load connection state
  useEffect(() => {
    if (!agentName) return;
    loadSource();
  }, [agentName, loadSource]);

  // ✅ When connected, load products
  useEffect(() => {
    if (!agentName) return;
    if (isConnected) loadProducts();
  }, [agentName, isConnected, loadProducts]);

  const connectWoo = async () => {
    if (!agentName) {
      messageApi.error("Agent is not loaded yet. Please refresh.");
      return;
    }

    setLoadingConnect(true);
    setError(null);

    try {
      const payload = {
        site_url: siteUrl.trim(),
        consumer_key: consumerKey.trim(),
        consumer_secret: consumerSecret.trim(),
      };

      const res = await postData(api.connect(agentName), payload);
      const data = res?.data ?? res;

      if (data?.detail === "connected") {
        messageApi.success("WooCommerce connected");
        setSource(data.source || null);
        await loadProducts();
      } else {
        const msg = data?.detail || "Connect failed";
        setError(msg);
        messageApi.error(msg);
      }
    } catch (e) {
      const msg = prettyErr(e);
      setError(msg);
      messageApi.error(msg);
    } finally {
      setLoadingConnect(false);
    }
  };

  const runSync = async () => {
    if (!agentName) return;

    setLoadingSync(true);
    setError(null);

    try {
      const payload = {
        per_page: perPage,
        max_pages: maxPages,
        mark_missing_inactive: markMissingInactive,
      };

      const res = await postData(api.sync(agentName), payload);
      const data = res?.data ?? res;

      if (data?.detail === "synced") {
        messageApi.success(
          `Sync done: ${data.total_upserted || 0} upserted (created ${data.created || 0}, updated ${data.updated || 0})`
        );
        await loadProducts();
      } else {
        const msg = data?.detail || "Sync failed";
        setError(msg);
        messageApi.error(msg);
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
      title: "Sync WooCommerce products now?",
      content: (
        <div>
          <div>
            We will fetch products via WooCommerce REST and update your indexed product catalog.
          </div>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              Tip: First sync may take time for big stores. You can sync again anytime.
            </Text>
          </div>
          <Divider />
          <div className="space-y-2">
            <div>
              <Text type="secondary">per_page:</Text> <Text code>{perPage}</Text>
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

  const toggleActive = async (item) => {
    if (!agentName) return;

    setTogglingId(item.id);
    setError(null);

    try {
      const res = await postData(api.toggle(agentName, item.id), {});
      const data = res?.data ?? res;

      if (data?.detail === "updated") {
        messageApi.success(`Updated: ${data.is_active ? "Active" : "Inactive"}`);
        await loadProducts();
      } else {
        const msg = data?.detail || "Update failed";
        setError(msg);
        messageApi.error(msg);
      }
    } catch (e) {
      const msg = prettyErr(e);
      setError(msg);
      messageApi.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const canConnect = siteUrl.trim() && consumerKey.trim() && consumerSecret.trim();

  // ✅ Guard: agent_name not ready yet
  if (!agentName || loadingSource) {
    return (
      <div className="p-6">
        <Alert
          type="info"
          showIcon
          message="Loading WooCommerce integration…"
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
          WooCommerce Integration
        </Title>
        <Text type="secondary">
          Agent: <Text code>{agentName}</Text>
        </Text>
      </div>

      {error ? <Alert type="error" showIcon message={error} /> : null}

      {/* CONNECT */}
      <Card
        title="Connect WooCommerce"
        extra={
          isConnected ? (
            <Tag color="green">ACTIVE</Tag>
          ) : (
            <Tag color="orange">NOT CONNECTED</Tag>
          )
        }
      >
        <div className="space-y-3" style={{ maxWidth: 820 }}>
          <Input
            placeholder="Store URL (example: https://example.com)"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Consumer Key (ck_...)"
              value={consumerKey}
              onChange={(e) => setConsumerKey(e.target.value)}
            />
            <Input.Password
              placeholder="Consumer Secret (cs_...)"
              value={consumerSecret}
              onChange={(e) => setConsumerSecret(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-10 flex-wrap">
            <Button type="primary" onClick={connectWoo} loading={loadingConnect} disabled={!canConnect}>
              Connect
            </Button>

            <Text type="secondary">
              Create keys in WooCommerce → <b>Settings → Advanced → REST API</b>
            </Text>
          </div>

          {source?.last_synced_at ? (
            <div style={{ marginTop: 6 }}>
              <Text type="secondary">Last synced:</Text>{" "}
              <Text>{source.last_synced_at}</Text>
            </div>
          ) : null}
        </div>
      </Card>

      {/* SYNC */}
      <Card title="Sync Products">
        <div className="space-y-3" style={{ maxWidth: 900 }}>
          <div className="flex flex-wrap items-center gap-4">
            <Space>
              <Text type="secondary">per_page</Text>
              <InputNumber min={1} max={100} value={perPage} onChange={(v) => setPerPage(v || 100)} />
            </Space>

            <Space>
              <Text type="secondary">max_pages</Text>
              <InputNumber min={1} max={200} value={maxPages} onChange={(v) => setMaxPages(v || 50)} />
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

          <Text type="secondary">
            Notes:
            <ul style={{ marginTop: 6, marginBottom: 0 }}>
              <li>Sync pulls <b>published products</b> from WooCommerce REST API.</li>
              <li>Variable products may have empty price until variations are synced (we can add variation sync next).</li>
              <li>After sync, products appear in the list below for search/indexing.</li>
            </ul>
          </Text>
        </div>
      </Card>

      {/* PRODUCTS */}
      <Card
        title="Indexed WooCommerce Products"
        extra={
          <Space>
            <Input
              allowClear
              placeholder="Search by name / SKU / ID"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onPressEnter={loadProducts}
              style={{ width: 260 }}
            />
            <Button onClick={loadProducts} loading={loadingList}>
              Search
            </Button>

            <Space>
              <Switch checked={activeOnly} onChange={setActiveOnly} />
              <Text>Active only</Text>
            </Space>

            <Button onClick={loadProducts} loading={loadingList}>
              Refresh
            </Button>
          </Space>
        }
      >
        {products?.length ? (
          <List
            dataSource={products}
            rowKey={(item) => item.id}
            loading={loadingList}
            renderItem={(item) => {
              const priceLabel = item.price
                ? `${item.price}${item.currency ? ` ${item.currency}` : ""}`
                : "-";
              const isActive = !!item.is_active;

              return (
                <List.Item
                  actions={[
                    <Tag key="type" color="purple">
                      {item.product_type || "product"}
                    </Tag>,
                    isActive ? (
                      <Tag key="active" color="green">
                        active
                      </Tag>
                    ) : (
                      <Tag key="inactive">inactive</Tag>
                    ),
                    <Tag key="price" color="blue">
                      {priceLabel}
                    </Tag>,
                    item.permalink ? (
                      <a key="open" href={item.permalink} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    ) : null,
                    <Button key="toggle" onClick={() => toggleActive(item)} loading={togglingId === item.id}>
                      {isActive ? "Disable" : "Enable"}
                    </Button>,
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    title={item.name || `Product ${item.wc_id}`}
                    description={
                      <div className="space-y-1">
                        <div>
                          <Text type="secondary">WC ID:</Text> <Text code>{item.wc_id}</Text>{" "}
                          <Text type="secondary">SKU:</Text> <Text code>{item.sku || "-"}</Text>
                        </div>

                        {item.permalink ? (
                          <div>
                            <Text type="secondary">URL:</Text>{" "}
                            <Tooltip title={item.permalink}>
                              <Text code style={{ cursor: "pointer" }}>
                                {item.permalink.length > 80 ? item.permalink.slice(0, 80) + "…" : item.permalink}
                              </Text>
                            </Tooltip>
                          </div>
                        ) : null}

                        <div className="flex flex-wrap gap-3">
                          <div>
                            <Text type="secondary">Stock:</Text>{" "}
                            <Text>{item.stock_status || "-"}</Text>
                          </div>
                          <div>
                            <Text type="secondary">Qty:</Text>{" "}
                            <Text>{item.stock_quantity ?? "-"}</Text>
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
              <>No products indexed yet. Click <b>Sync Now</b> to fetch WooCommerce products.</>
            ) : (
              <>Connect WooCommerce first.</>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
