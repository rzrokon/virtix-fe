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
  Select,
  InputNumber,
} from "antd";
import { useParams } from "react-router-dom";
import { getData, postData, getAgentById } from "../../scripts/api-service";

const { Title, Text } = Typography;

const api = {
  source: (agentName) => `api/integrations/agents/${agentName}/website/source/`,
  connect: (agentName) => `api/integrations/agents/${agentName}/website/connect/`,
  sync: (agentName) => `api/integrations/agents/${agentName}/website/sync/`,
  contents: (agentName) => `api/integrations/agents/${agentName}/website/contents/`,
};

function prettyErr(e) {
  const data = e?.response?.data;
  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  return e?.message || "Request failed";
}

export default function WebsiteIntegration() {
  const { id: agentId } = useParams();
  const [messageApi, contextHolder] = message.useMessage();

  const [agentName, setAgentName] = useState(null);

  // connection form
  const [siteUrl, setSiteUrl] = useState("");
  const [sourceType, setSourceType] = useState("WORDPRESS");
  const [basicUser, setBasicUser] = useState("");
  const [basicPass, setBasicPass] = useState("");
  const [maxPages, setMaxPages] = useState(100);

  // sync options
  const [includePosts, setIncludePosts] = useState(true);

  // backend data
  const [source, setSource] = useState(null);
  const [contents, setContents] = useState([]);

  // ui states
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [loadingSource, setLoadingSource] = useState(false);
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [loadingContents, setLoadingContents] = useState(false);
  const [error, setError] = useState(null);

  const isConnected = useMemo(() => source?.status === "ACTIVE", [source]);
  const isWordPress = sourceType === "WORDPRESS";
  const isGeneric = sourceType === "GENERIC";

  const loadAgent = useCallback(async () => {
    if (!agentId) return;
    setLoadingAgent(true);
    setError(null);

    try {
      const agent = await getAgentById(agentId);
      const name = agent?.agent_name;
      if (!name) throw new Error("Agent name not found for this agent ID.");
      setAgentName(name);
    } catch (e) {
      setError(prettyErr(e));
    } finally {
      setLoadingAgent(false);
    }
  }, [agentId]);

  const loadSource = useCallback(async () => {
    if (!agentName) return;
    setLoadingSource(true);
    setError(null);

    try {
      const res = await getData(api.source(agentName));

      if (res?.connected && res?.source) {
        const src = res.source;
        setSource(src);

        setSiteUrl(src.site_url || "");
        setSourceType(src.source_type || "WORDPRESS");
        setBasicUser(src.basic_user || "");
        setBasicPass(src.basic_pass || "");
        setMaxPages(src.max_pages || 100);
      } else {
        setSource(null);
      }
    } catch (e) {
      setError(prettyErr(e));
    } finally {
      setLoadingSource(false);
    }
  }, [agentName]);

  const loadContents = useCallback(async () => {
    if (!agentName) return;
    setLoadingContents(true);
    setError(null);

    try {
      const res = await getData(api.contents(agentName));
      setContents(Array.isArray(res?.results) ? res.results : []);
    } catch (e) {
      setError(prettyErr(e));
    } finally {
      setLoadingContents(false);
    }
  }, [agentName]);

  useEffect(() => {
    loadAgent();
  }, [loadAgent]);

  useEffect(() => {
    if (!agentName) return;
    loadSource();
    loadContents();
  }, [agentName, loadSource, loadContents]);

  const connectWebsite = async () => {
    if (!agentName) {
      messageApi.warning("Agent name not loaded yet.");
      return;
    }

    setLoadingConnect(true);
    setError(null);

    try {
      const payload = {
        site_url: siteUrl.trim(),
        source_type: sourceType,
        basic_user: basicUser.trim(),
        basic_pass: basicPass.trim(),
        max_pages: maxPages || 100,
      };

      const res = await postData(api.connect(agentName), payload);
      const data = res?.data ?? res;

      if (data?.detail === "connected") {
        messageApi.success("Website source connected successfully");
        setSource(data.source || null);
        await loadSource();
        await loadContents();
      } else {
        throw new Error(data?.detail || "Connect failed");
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
        include_posts: includePosts,
      };

      const res = await postData(api.sync(agentName), payload);
      const data = res?.data ?? res;

      if (data?.detail === "synced") {
        if ((source?.source_type || sourceType) === "WORDPRESS") {
          messageApi.success(`Sync completed — Pages: ${data.pages || 0}, Posts: ${data.posts || 0}`);
        } else {
          messageApi.success(`Sync completed — Pages: ${data.pages || data.synced || 0}`);
        }

        await loadSource();
        await loadContents();
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
    const currentType = source?.source_type || sourceType;

    Modal.confirm({
      title: "Sync website content now?",
      content: (
        <div className="space-y-2">
          {currentType === "WORDPRESS" ? (
            <>
              <div>
                We will fetch WordPress pages{includePosts ? " and posts" : ""} and update your agent knowledge.
              </div>
              <Text type="secondary">
                Initial sync may take a few minutes for large sites.
              </Text>
            </>
          ) : (
            <>
              <div>
                We will crawl and scrape the website pages and update your agent knowledge.
              </div>
              <Text type="secondary">
                Max crawl pages: <Text code>{maxPages}</Text>
              </Text>
            </>
          )}
        </div>
      ),
      okText: "Start Sync",
      cancelText: "Cancel",
      onOk: runSync,
    });
  };

  const pageLoading = loadingAgent || (!agentName && !!agentId);

  return (
    <div className="p-6 space-y-6">
      {contextHolder}

      <div>
        <Title level={2} style={{ marginBottom: 0 }}>
          Website Data Source Integration
        </Title>
        <Text type="secondary">
          Agent ID: <Text code>{agentId}</Text>
          {agentName ? (
            <>
              {" "}
              • Agent: <Text code>{agentName}</Text>
            </>
          ) : null}
        </Text>
      </div>

      {error && <Alert type="error" showIcon message={error} />}

      <Card
        loading={pageLoading || loadingSource}
        title="Connect Website Source"
        extra={isConnected ? <Tag color="green">ACTIVE</Tag> : <Tag color="orange">NOT CONNECTED</Tag>}
      >
        {!agentName ? (
          <Alert
            type="warning"
            showIcon
            message="Loading agent information..."
            description="We need agent_name to call the website integration API."
          />
        ) : (
          <div className="space-y-3" style={{ maxWidth: 760 }}>
            <Input
              placeholder="Website URL (https://example.com)"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Text className="block mb-1">Website Type</Text>
                <Select
                  value={sourceType}
                  onChange={setSourceType}
                  className="w-full"
                  options={[
                    { value: "WORDPRESS", label: "WordPress" },
                    { value: "GENERIC", label: "Generic Website" },
                  ]}
                />
              </div>

              <div>
                <Text className="block mb-1">Max Pages</Text>
                <InputNumber
                  min={1}
                  max={1000}
                  value={maxPages}
                  onChange={(value) => setMaxPages(value || 100)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Basic Auth Username (optional)"
                value={basicUser}
                onChange={(e) => setBasicUser(e.target.value)}
              />
              <Input.Password
                placeholder="Basic Auth Password (optional)"
                value={basicPass}
                onChange={(e) => setBasicPass(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-8 flex-wrap">
              <Button
                type="primary"
                onClick={connectWebsite}
                loading={loadingConnect}
                disabled={!siteUrl.trim() || !agentName}
              >
                {isConnected ? "Reconnect" : "Connect"}
              </Button>

              {isWordPress ? (
                <div className="flex items-center gap-2">
                  <Switch checked={includePosts} onChange={setIncludePosts} />
                  <Text>Include Posts</Text>
                </div>
              ) : null}

              <Button onClick={confirmSync} loading={loadingSync} disabled={!isConnected}>
                Sync Now
              </Button>
            </div>

            {source?.last_synced_at && (
              <Text type="secondary">
                Last synced at: <Text code>{new Date(source.last_synced_at).toLocaleString()}</Text>
              </Text>
            )}

            <Divider />

            <Text type="secondary">
              <ul className="list-disc ml-5">
                <li>WordPress uses the WordPress REST API to fetch pages and posts.</li>
                <li>Generic Website uses crawler + scraper to collect page content.</li>
                <li>Use Basic Auth only if the website is protected.</li>
                <li>For large websites, start with a lower Max Pages value.</li>
                <li>After sync, the content becomes available for indexing and RAG chat.</li>
              </ul>
            </Text>
          </div>
        )}
      </Card>

      <Card
        title="Indexed Website Content"
        extra={
          <Button onClick={loadContents} loading={loadingContents} disabled={!agentName}>
            Refresh
          </Button>
        }
      >
        {contents.length ? (
          <List
            dataSource={contents}
            rowKey="id"
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Tag key="kind" color={item.kind === "post" ? "blue" : "purple"}>
                    {item.kind}
                  </Tag>,
                  item.is_active ? (
                    <Tag key="active" color="green">
                      active
                    </Tag>
                  ) : (
                    <Tag key="inactive">inactive</Tag>
                  ),
                  <a key="open" href={item.url} target="_blank" rel="noreferrer">
                    Open
                  </a>,
                ]}
              >
                <List.Item.Meta
                  title={item.title || item.url}
                  description={
                    <div className="space-y-1">
                      <div>
                        <Text type="secondary">URL:</Text> <Text code>{item.url}</Text>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <Text type="secondary">Updated:</Text> {item.updated_at_source || "-"}
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
            )}
          />
        ) : (
          <div className="text-gray-500">
            No content indexed yet. Click <b>Sync Now</b> to fetch website contents.
          </div>
        )}
      </Card>
    </div>
  );
}