import { ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
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
const toBool = (v) => v === true || v === 'true' || v === 1;

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

  const baseFeatures = [
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

  const fetchAgentNameFallback = async () => {
    try {
      const agent = await getData(`api/agent/agents/${id}/`);
      if (agent?.agent_name) setFallbackAgentName(agent.agent_name);
    } catch {}
  };

  const fetchFeatures = async () => {
    if (!featuresUrl) return;
    setLoading(true);
    try {
      const data = await getData(featuresUrl);
      setFeatureData(data);

      form.setFieldsValue({
        ...data,
        booking: toBool(data.booking),
        complaints: toBool(data.complaints),
        products: toBool(data.products),
        products_orders: toBool(data.products_orders),
        offers: toBool(data.offers),
        website_enabled: toBool(data.website_enabled),
        woocommerce_enabled: toBool(data.woocommerce_enabled),
        shopify_enabled: toBool(data.shopify_enabled),
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
  }, [id, currentAgentName]);

  useEffect(() => {
    if (featuresUrl) fetchFeatures();
  }, [featuresUrl]);

  const onSave = async () => {
    const v = form.getFieldsValue();

    const payload = {
      booking: BOOL_TO_API(v.booking),
      complaints: BOOL_TO_API(v.complaints),
      products: BOOL_TO_API(v.products),
      products_orders: BOOL_TO_API(v.products_orders),
      offers: BOOL_TO_API(v.offers),

      website_enabled: BOOL_TO_API(v.website_enabled),
      woocommerce_enabled: BOOL_TO_API(v.woocommerce_enabled),
      shopify_enabled: BOOL_TO_API(v.shopify_enabled),
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

  const woocommerceEnabled = Form.useWatch('woocommerce_enabled', form);
  const shopifyEnabled = Form.useWatch('shopify_enabled', form);

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
      <Card>
        <div className="flex justify-between items-start gap-3">
          <div>
            <Title level={3} className="!mb-1">Agent Features</Title>
            <Text type="secondary">Agent: <b>{agentSlug}</b></Text>
          </div>
          <div className="flex gap-2">
            <Button icon={<ReloadOutlined />} onClick={fetchFeatures}>
              Refresh
            </Button>
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

      <Form form={form} layout="vertical">
        <Card title="Core Capabilities">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {baseFeatures.map((f) => (
              <div key={f.key} className="border rounded-xl p-4">
                <div className="flex justify-between items-center gap-4">
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
        </Card>

        <Card title="Integrations" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-xl p-4">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <div className="font-semibold">Website Data Source</div>
                  <div className="text-sm text-gray-500">
                    Generic website or WordPress website content.
                  </div>
                </div>
                <Form.Item name="website_enabled" valuePropName="checked" className="!mb-0">
                  <Switch />
                </Form.Item>
              </div>
            </div>

            <div className="border rounded-xl p-4">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <div className="font-semibold">WooCommerce Data Source</div>
                  <div className="text-sm text-gray-500">
                    Sync WooCommerce products and use WooCommerce for orders.
                  </div>
                </div>
                <Form.Item name="woocommerce_enabled" valuePropName="checked" className="!mb-0">
                  <Switch />
                </Form.Item>
              </div>
            </div>

            <div className="border rounded-xl p-4">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <div className="font-semibold">Shopify Data Source</div>
                  <div className="text-sm text-gray-500">
                    Sync Shopify products and generate Shopify checkout links.
                  </div>
                </div>
                <Form.Item name="shopify_enabled" valuePropName="checked" className="!mb-0">
                  <Switch />
                </Form.Item>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Alert
              type="info"
              showIcon
              message="Commerce integrations"
              description="WooCommerce and Shopify can both act as product data sources. Your selected order provider controls where checkout/order flow happens."
            />
          </div>
        </Card>

        <Card title="Order Routing" className="mt-6">
          <Form.Item label="Order Provider" name="orders_provider">
            <Select>
              <Option value="INTERNAL">Internal (Virtix Orders)</Option>
              <Option value="WOOCOMMERCE" disabled={!woocommerceEnabled}>
                WooCommerce Store
              </Option>
              <Option value="SHOPIFY" disabled={!shopifyEnabled}>
                Shopify Store
              </Option>
            </Select>
          </Form.Item>

          <Text type="secondary">
            • Internal: Orders stay inside Virtix dashboard
            <br />
            • WooCommerce: Orders are placed directly on your WooCommerce store
            <br />
            • Shopify: Checkout links are generated through Shopify
          </Text>

          {!woocommerceEnabled && !shopifyEnabled ? (
            <div className="mt-4">
              <Alert
                type="warning"
                showIcon
                message="No commerce provider enabled"
                description="If you want store-based checkout, enable WooCommerce or Shopify first."
              />
            </div>
          ) : null}
        </Card>

        <Card title="Current Configuration Summary" className="mt-6">
          <div className="space-y-2 text-sm">
            <div>
              <Text strong>Website:</Text>{' '}
              <Text>{form.getFieldValue('website_enabled') ? 'Enabled' : 'Disabled'}</Text>
            </div>
            <div>
              <Text strong>WooCommerce:</Text>{' '}
              <Text>{form.getFieldValue('woocommerce_enabled') ? 'Enabled' : 'Disabled'}</Text>
            </div>
            <div>
              <Text strong>Shopify:</Text>{' '}
              <Text>{form.getFieldValue('shopify_enabled') ? 'Enabled' : 'Disabled'}</Text>
            </div>
            <div>
              <Text strong>Order Provider:</Text>{' '}
              <Text>{form.getFieldValue('orders_provider') || 'INTERNAL'}</Text>
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <Button
            type="primary"
            onClick={onSave}
            loading={saving}
            className="bg-[#6200FF] border-[#6200FF]"
          >
            Save Changes
          </Button>
        </Card>
      </Form>
    </div>
  );
}
