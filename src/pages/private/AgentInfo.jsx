import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Switch,
  Typography,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getData, patchData } from '../../scripts/api-service';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function AgentSettings() {
  const { id } = useParams();
  const [form] = Form.useForm();
  const watchedWidgetKey = Form.useWatch('widget_key', form);

  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchAgent = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await getData(`api/agent/agents/${id}/`);
      setAgent(data);

      form.setFieldsValue({
        // identity
        agent_name: data?.agent_name || '',
        agent_heading: data?.agent_heading || '',
        agent_description: data?.agent_description || '',
        status: data?.status || 'ACTIVE',

        // seo
        site_title: data?.site_title || '',
        site_description: data?.site_description || '',
        site_keywords: data?.site_keywords || '',

        // widget security
        widget_enabled: !!data?.widget_enabled,
        widget_key: data?.widget_key || '',
        allowed_domains: Array.isArray(data?.allowed_domains) ? data.allowed_domains : [],
      });
    } catch (e) {
      console.error('[AgentSettings] fetch error', e);
      message.error('Failed to load agent settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const pickFile = (uploadVal) => uploadVal?.fileList?.[0]?.originFileObj;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Copied');
    } catch {
      message.error('Copy failed');
    }
  };

  const onFinish = async (values) => {
    if (!id) return;

    setUpdating(true);
    try {
      const formData = new FormData();

      const appendIfDefined = (key, val) => {
        if (val !== undefined && val !== null) formData.append(key, val);
      };

      // ---------- text fields ----------
      appendIfDefined('agent_name', values.agent_name);
      appendIfDefined('agent_heading', values.agent_heading);
      appendIfDefined('agent_description', values.agent_description);

      appendIfDefined('site_title', values.site_title);
      appendIfDefined('site_description', values.site_description);
      appendIfDefined('site_keywords', values.site_keywords);

      if (values.status) appendIfDefined('status', values.status);

      // ---------- widget fields ----------
      appendIfDefined('widget_enabled', values.widget_enabled ? 'true' : 'false');

      // widget_key: typically backend generates; but if backend allows manual update, keep it.
      // If you don't want users to edit it, leave it read-only in UI.
      if (values.widget_key !== undefined) appendIfDefined('widget_key', values.widget_key);

      // allowed_domains JSONField -> send as JSON string
      const domains = Array.isArray(values.allowed_domains)
        ? values.allowed_domains
            .map((d) => String(d || '').trim())
            .filter(Boolean)
            .map((d) => d.toLowerCase())
        : [];
      appendIfDefined('allowed_domains', JSON.stringify(domains));

      // ---------- files ----------
      const logoLight = pickFile(values.logo_light);
      const logoDark = pickFile(values.logo_dark);
      const thumb = pickFile(values.thumb);
      const favicon = pickFile(values.favicon);

      if (logoLight) formData.append('logo_light', logoLight);
      if (logoDark) formData.append('logo_dark', logoDark);
      if (thumb) formData.append('thumb', thumb);
      if (favicon) formData.append('favicon', favicon);

      // Debug logs (VERY helpful if you get auto logout)
      console.log('[AgentSettings] PATCH url:', `api/agent/agents/${id}/`);
      console.log('[AgentSettings] payload summary:', {
        agent_name: values.agent_name,
        status: values.status,
        widget_enabled: values.widget_enabled,
        widget_key: values.widget_key ? '***present***' : '(empty)',
        allowed_domains: domains,
        has_logo_light: !!logoLight,
        has_logo_dark: !!logoDark,
        has_thumb: !!thumb,
        has_favicon: !!favicon,
      });

      const res = await patchData(`api/agent/agents/${id}/`, formData);
      const data = res?.data ?? res;

      console.log('[AgentSettings] response:', data);

      if (res?.error) {
        console.error('[AgentSettings] errors:', res.errors);
        message.error('Failed to update agent settings');
        return;
      }

      message.success('Agent settings updated!');
      await fetchAgent();
    } catch (e) {
      console.error('[AgentSettings] update error', e);
      message.error('Failed to update agent settings');
    } finally {
      setUpdating(false);
    }
  };

  const widgetKey = watchedWidgetKey || agent?.widget_key || '';
  const widgetEnabled = !!agent?.widget_enabled;
  const agentName = agent?.agent_name || form.getFieldValue('agent_name') || 'kotha';

  const widgetSnippet = widgetKey
    ? `<!--Start of Virtix AI Script-->
<script>
  window.VirtixWidget = {
    baseUrl: "https://api.virtixai.com",
    agent: "${agentName}",
    widgetKey: "${widgetKey}",
    position: "right" // right|left
  };
</script>
<script async src="https://virtixai.com/widget/v1/virtix-widget.js"></script>
<!--End of Virtix AI Script-->`
    : '// widget_key not available yet';

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div>
            <Title level={3} className="!mb-1">
              Agent Settings
            </Title>
            <Text className="text-gray-500">
              Update agent identity and widget security.
            </Text>
          </div>

          <Button icon={<ReloadOutlined />} onClick={fetchAgent}>
            Reload
          </Button>
        </div>
      </Card>

      {/* Settings form */}
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Divider orientation="left">Agent Identity</Divider>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Agent Name (slug-safe)"
                name="agent_name"
                rules={[
                  { required: true, message: 'Agent name is required' },
                  { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Use letters, numbers, underscore or hyphen only' },
                ]}
                help="Used in URLs and internal identification. This value is locked."
              >
                <Input placeholder="e.g., my-ai-agent" readOnly />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Agent Heading"
                name="agent_heading"
                help='Shown in UI header. Example: "My AI Agent"'
              >
                <Input placeholder="e.g., My AI Agent" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Agent Description"
            name="agent_description"
            help="Shown in listing cards and dashboards. Keep it short (1–2 lines)."
          >
            <TextArea rows={4} placeholder="Describe what this agent does..." />
          </Form.Item>

          <br />
          <Divider orientation="left">Widget Security</Divider>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Widget Enabled"
                name="widget_enabled"
                valuePropName="checked"
                help="Turn ON to allow loading the widget on websites."
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} md={16}>
              <Form.Item
                label="Widget Key"
                name="widget_key"
                help="Used by websites to connect the widget to this agent."
              >
                <Input
                  addonAfter={
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => widgetKey && copyToClipboard(widgetKey)}
                      disabled={!widgetKey}
                    />
                  }
                  placeholder="(not generated yet)"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Allowed Domains"
            name="allowed_domains"
            help='Only allow widget on these domains. Example: "example.com", "app.example.com". Leave empty to allow all (if backend is designed that way).'
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              tokenSeparators={[',', ' ']}
              placeholder="Type domains and press Enter"
            />
          </Form.Item>

          <div className="border border-gray-200 rounded-2xl p-4 bg-white mt-8">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="text-sm font-semibold text-gray-900">Widget Embed Snippet</div>
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(widgetSnippet)}
                disabled={!widgetKey}
              >
                Copy
              </Button>
            </div>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
              {widgetSnippet}
            </pre>
            <div className="text-xs text-gray-500 mt-2">
              Status: <b>{widgetEnabled ? 'Enabled' : 'Disabled'}</b>
            </div>
          </div>

          <Divider />

          <div className="flex gap-3">
            <Button onClick={() => form.resetFields()}>Reset</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updating}
              className="bg-[#6200FF] border-[#6200FF]"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
