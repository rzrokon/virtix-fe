import { CopyOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
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
  Upload,
  message,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getData, patchData } from '../../scripts/api-service';

const { Title, Text } = Typography;
const { TextArea } = Input;

/** Prefer same base used by your api-service; fallback to api.virtixai.com */
const baseUrlForMedia = () => {
  const b =
    import.meta.env.VITE_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'https://api.virtixai.com/';
  return b.endsWith('/') ? b : `${b}/`;
};

/** Handles: null, relative (/media/..), absolute (https://...) */
const buildMediaUrl = (path) => {
  if (!path) return null;
  const s = String(path);
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  const base = baseUrlForMedia();
  const clean = s.startsWith('/') ? s.slice(1) : s;
  return `${base}${clean}`;
};

const PreviewBox = ({ label, url }) => {
  return (
    <div className="border border-gray-200 rounded-2xl p-4 bg-white">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-sm font-semibold text-gray-900">{label}</div>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#6200FF] hover:underline"
          >
            Open
          </a>
        ) : null}
      </div>

      {url ? (
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
            <img
              src={url}
              alt={label}
              className="max-h-14 max-w-14 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div className="text-xs text-gray-500 break-all leading-relaxed">{url}</div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Not set</div>
      )}
    </div>
  );
};

export default function AgentSettings() {
  const { id } = useParams();
  const [form] = Form.useForm();

  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const uploadProps = useMemo(
    () => ({
      beforeUpload: () => false,
      showUploadList: true,
      maxCount: 1,
    }),
    []
  );

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

  const logoLightUrl = buildMediaUrl(agent?.logo_light);
  const logoDarkUrl = buildMediaUrl(agent?.logo_dark);
  const thumbUrl = buildMediaUrl(agent?.thumb);
  const faviconUrl = buildMediaUrl(agent?.favicon);

  const widgetKey = agent?.widget_key || form.getFieldValue('widget_key') || '';
  const widgetEnabled = !!agent?.widget_enabled;

  const widgetSnippet = widgetKey
    ? `<script>
  window.VIRTIX_WIDGET_KEY = "${widgetKey}";
</script>
<script src="https://virtixai.com/widget.js" async></script>`
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
              Update agent identity, SEO meta, branding assets and widget security.
            </Text>
          </div>

          <Button icon={<ReloadOutlined />} onClick={fetchAgent}>
            Reload
          </Button>
        </div>
      </Card>

      {/* Assets preview */}
      <Card>
        <div className="mb-4">
          <div className="text-lg font-semibold text-gray-900">Current Assets</div>
          <div className="text-sm text-gray-500">Preview what’s currently saved for this agent.</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PreviewBox label="Logo (Light)" url={logoLightUrl} />
          <PreviewBox label="Logo (Dark)" url={logoDarkUrl} />
          <PreviewBox label="Thumbnail" url={thumbUrl} />
          <PreviewBox label="Favicon" url={faviconUrl} />
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
                help='Used in URLs and internal identification. Example: "norahs-beauty-glam"'
              >
                <Input placeholder="e.g., norahs-beauty-glam" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Agent Heading"
                name="agent_heading"
                help='Shown in UI header. Example: "Norah’s Beauty Glam"'
              >
                <Input placeholder="e.g., Norah’s Beauty Glam" />
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
          <Divider orientation="left">Website SEO Meta</Divider>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Site Title"
                name="site_title"
                help='Browser tab title + SEO title. Example: "Norah’s Beauty Glam — AI Support"'
              >
                <Input placeholder="e.g., Norah’s Beauty Glam — AI Support" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Site Keywords"
                name="site_keywords"
                help="Comma-separated keywords. Example: beauty, skincare, ai support, live chat"
              >
                <Input placeholder="beauty, skincare, ai support, live chat" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Site Description"
            name="site_description"
            help="SEO description (~140–160 chars). Keep it natural and clear."
          >
            <TextArea rows={3} placeholder="Write a short SEO description..." />
          </Form.Item>

          <br />
          <Divider orientation="left">Branding Assets</Divider>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Upload Logo (Light)"
                name="logo_light"
                help="PNG/SVG recommended. Used on light backgrounds."
              >
                <Upload {...uploadProps} listType="picture" accept="image/*">
                  <Button icon={<UploadOutlined />}>Upload Logo Light</Button>
                </Upload>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Upload Logo (Dark)"
                name="logo_dark"
                help="PNG/SVG recommended. Used on dark backgrounds."
              >
                <Upload {...uploadProps} listType="picture" accept="image/*">
                  <Button icon={<UploadOutlined />}>Upload Logo Dark</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Upload Thumbnail"
                name="thumb"
                help="Used in previews. Recommended square image."
              >
                <Upload {...uploadProps} listType="picture" accept="image/*">
                  <Button icon={<UploadOutlined />}>Upload Thumbnail</Button>
                </Upload>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Upload Favicon"
                name="favicon"
                help="Recommended: 32×32 PNG or .ico."
              >
                <Upload {...uploadProps} listType="picture" accept="image/*,.ico">
                  <Button icon={<UploadOutlined />}>Upload Favicon</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

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
                help="Used by websites to connect the widget to this agent. Usually generated by backend."
              >
                <Input
                  readOnly
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

          <div className="border border-gray-200 rounded-2xl p-4 bg-white">
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