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
  // your router has :id
  const { id: agentId } = useParams();
  const [messageApi, contextHolder] = message.useMessage();

  // derived agent_name from backend
  const [agentName, setAgentName] = useState(null);

  // connection form
  const [siteUrl, setSiteUrl] = useState("");
  const [basicUser, setBasicUser] = useState("");
  const [basicPass, setBasicPass] = useState("");

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

  // 1) fetch agent_name using agentId
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

  // 2) load connected source
  const loadSource = useCallback(async () => {
    if (!agentName) return;
    setLoadingSource(true);
    setError(null);
    try {
      const res = await getData(api.source(agentName));
      if (res?.connected && res?.source) {
        setSource(res.source);
        setSiteUrl(res.source.site_url || "");
      } else {
        setSource(null);
      }
    } catch (e) {
      setError(prettyErr(e));
    } finally {
      setLoadingSource(false);
    }
  }, [agentName]);

  // 3) load contents
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
        basic_user: basicUser.trim(),
        basic_pass: basicPass.trim(),
      };

      const res = await postData(api.connect(agentName), payload);
      const data = res?.data ?? res;

      if (data?.detail === "connected") {
        messageApi.success("Website connected successfully");
        setSource(data.source);
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
      const res = await postData(api.sync(agentName), { include_posts: includePosts });
      const data = res?.data ?? res;

      if (data?.detail === "synced") {
        messageApi.success(`Sync completed — Pages: ${data.pages}, Posts: ${data.posts}`);
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
    Modal.confirm({
      title: "Sync website content now?",
      content: (
        <div className="space-y-2">
          <div>We will fetch WordPress pages{includePosts ? " and posts" : ""} and update your agent knowledge.</div>
          <Text type="secondary">Initial sync may take a few minutes for large sites.</Text>
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
          Website (WordPress) Integration
        </Title>
        <Text type="secondary">
          Agent ID: <Text code>{agentId}</Text>{" "}
          {agentName ? (
            <>
              • Agent: <Text code>{agentName}</Text>
            </>
          ) : null}
        </Text>
      </div>

      {error && <Alert type="error" showIcon message={error} />}

      <Card
        loading={pageLoading || loadingSource}
        title="Connect Website"
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
          <div className="space-y-3" style={{ maxWidth: 720 }}>
            <Input
              placeholder="Website URL (https://example.com)"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
            />

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

              <div className="flex items-center gap-2">
                <Switch checked={includePosts} onChange={setIncludePosts} />
                <Text>Include Posts</Text>
              </div>

              <Button onClick={confirmSync} loading={loadingSync} disabled={!isConnected}>
                Sync Now
              </Button>
            </div>

            {source?.last_synced_at && (
              <Text type="secondary">
                Last synced at:{" "}
                <Text code>{new Date(source.last_synced_at).toLocaleString()}</Text>
              </Text>
            )}

            <Divider />

            <Text type="secondary">
              <ul className="list-disc ml-5">
                <li>WordPress REST API must be enabled (default).</li>
                <li>Use Basic Auth only if REST is protected.</li>
                <li>Content is re-indexed on every sync.</li>
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
            No content indexed yet. Click <b>Sync Now</b> to fetch pages/posts.
          </div>
        )}
      </Card>
    </div>
  );
}
