import { ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Divider,
  Form,
  Spin,
  Switch,
  Typography,
  message,
  Select,
  Alert,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getData, patchData } from '../../scripts/api-service';
import { useContentApi } from '../../contexts/ContentApiContext';

const { Title, Text } = Typography;
const { Option } = Select;

const BOOL_TO_API = (v) => (v ? 'true' : 'false');

export default function AgentFeatures() {
  const { id } = useParams();
  const { currentAgentName } = useContentApi();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [featureData, setFeatureData] = useState(null);
  const [fallbackAgentName, setFallbackAgentName] = useState(null);

  const agentSlug = useMemo(
    () => currentAgentName || fallbackAgentName,
    [currentAgentName, fallbackAgentName]
  );

  const featuresUrl = agentSlug ? `api/agent/${agentSlug}/features/` : null;

  // ---- Feature definitions ----
  const baseFeatures = [
    {
      key: 'lead_gen',
      title: 'Lead Generation',
      help: 'Capture leads via chat and forms.',
    },
    {
      key: 'booking',
      title: 'Bookings',
      help: 'Enable appointment scheduling.',
    },
    {
      key: 'complaints',
      title: 'Complaints',
      help: 'Accept and manage customer complaints.',
    },
    {
      key: 'products',
      title: 'Products',
      help: 'Enable product catalog knowledge.',
    },
    {
      key: 'products_orders',
      title: 'Orders',
      help: 'Allow customers to place orders via chat.',
    },
    {
      key: 'offers',
      title: 'Offers',
      help: 'Promotions, discounts, and campaigns.',
    },
  ];

  // ---- Fetch fallback agent ----
  const fetchAgentNameFallback = async () => {
    try {
      const agent = await getData(`api/agent/agents/${id}/`);
      if (agent?.agent_name) setFallbackAgentName(agent.agent_name);
    } catch {}
  };

  // ---- Fetch features ----
  const fetchFeatures = async () => {
    if (!featuresUrl) return;
    setLoading(true);
    try {
      const data = await getData(featuresUrl);
      setFeatureData(data);

      form.setFieldsValue({
        ...data,
        lead_gen: !!data.lead_gen,
        booking: !!data.booking,
        complaints: !!data.complaints,
        products: !!data.products,
        products_orders: !!data.products_orders,
        offers: !!data.offers,
        website_enabled: !!data.website_enabled,
        woocommerce_enabled: !!data.woocommerce_enabled,
        orders_provider: data.orders_provider || 'INTERNAL',
      });
    } catch {
      message.error('Failed to load agent features');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentAgentName && id) fetchAgentNameFallback();
  }, [id]);

  useEffect(() => {
    if (featuresUrl) fetchFeatures();
  }, [featuresUrl]);

  // ---- Save ----
  const onSave = async () => {
    const v = form.getFieldsValue();

    const payload = {
      lead_gen: BOOL_TO_API(v.lead_gen),
      booking: BOOL_TO_API(v.booking),
      complaints: BOOL_TO_API(v.complaints),
      products: BOOL_TO_API(v.products),
      products_orders: BOOL_TO_API(v.products_orders),
      offers: BOOL_TO_API(v.offers),

      website_enabled: BOOL_TO_API(v.website_enabled),
      woocommerce_enabled: BOOL_TO_API(v.woocommerce_enabled),
      orders_provider: v.orders_provider,
    };

    setSaving(true);
    try {
      const res = await patchData(featuresUrl, payload);
      setFeatureData(res?.data ?? res);
      message.success('Features updated');
    } catch {
      message.error('Failed to save features');
    } finally {
      setSaving(false);
    }
  };

  if (!agentSlug || loading) {
    return (
      <div className="p-6">
        <Card className="py-10 text-center">
          <Spin />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-start gap-3">
          <div>
            <Title level={3} className="!mb-1">Agent Features</Title>
            <Text type="secondary">Agent: <b>{agentSlug}</b></Text>
          </div>
          <div className="flex gap-2">
            <Button icon={<ReloadOutlined />} onClick={fetchFeatures}>Refresh</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={onSave}
              loading={saving}
              className="bg-[#6200FF] border-[#6200FF]"
            >
              Save
            </Button>
          </div>
        </div>
      </Card>

      {/* Core Features */}
      <Card title="Core Capabilities">
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {baseFeatures.map((f) => (
              <div key={f.key} className="border rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{f.title}</div>
                    <div className="text-sm text-gray-500">{f.help}</div>
                  </div>
                  <Form.Item name={f.key} valuePropName="checked" className="!mb-0">
                    <Switch />
                  </Form.Item>
                </div>
              </div>
            ))}
          </div>
        </Form>
      </Card>

      {/* Integrations */}
      <Card title="Integrations">
        <Form form={form} layout="vertical">
          <Form.Item
            label="Website (WordPress)"
            name="website_enabled"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="WooCommerce"
            name="woocommerce_enabled"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Alert
            type="info"
            showIcon
            message="WooCommerce allows product sync and direct order placement on your store."
          />
        </Form>
      </Card>

      {/* Orders routing */}
      <Card title="Order Routing">
        <Form form={form} layout="vertical">
          <Form.Item
            label="Order Provider"
            name="orders_provider"
            dependencies={['woocommerce_enabled']}
          >
            <Select>
              <Option value="INTERNAL">Internal (Virtix Orders)</Option>
              <Option value="WOOCOMMERCE">WooCommerce Store</Option>
            </Select>
          </Form.Item>

          <Text type="secondary">
            • Internal: Orders stay inside Virtix dashboard  
            <br />
            • WooCommerce: Orders are placed directly on your store
          </Text>
        </Form>
      </Card>

      {/* Footer */}
      <Card>
        <Button
          type="primary"
          onClick={onSave}
          loading={saving}
          className="bg-[#6200FF] border-[#6200FF]"
        >
          Save Changes
        </Button>
      </Card>
    </div>
  );
}