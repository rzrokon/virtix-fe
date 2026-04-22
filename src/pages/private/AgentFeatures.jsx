import { ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Form,
  Radio,
  Spin,
  Switch,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getData, patchData } from '../../scripts/api-service';
import { useContentApi } from '../../contexts/ContentApiContext';
import { GET_MY_SUBSCRIPTION } from '../../scripts/api';

const { Title, Text } = Typography;
const toBool = (v) => v === true || v === 'true' || v === 1;

const UpgradeTooltip = ({ allowed, children }) =>
  allowed ? children : (
    <Tooltip title="Not available on your plan. Upgrade to enable.">
      <span className="cursor-not-allowed">{children}</span>
    </Tooltip>
  );

export default function AgentFeatures() {
  const { id } = useParams();
  const { currentAgentName } = useContentApi();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fallbackAgentName, setFallbackAgentName] = useState(null);
  const [planCaps, setPlanCaps] = useState(null);
  const lastGoodValues = useRef(null);

  const agentSlug = useMemo(
    () => currentAgentName || fallbackAgentName,
    [currentAgentName, fallbackAgentName]
  );

  const featuresUrl = agentSlug ? `api/agent/${agentSlug}/features/` : null;

  const fetchAgentNameFallback = async () => {
    try {
      const agent = await getData(`api/agent/agents/${id}/`);
      if (agent?.agent_name) setFallbackAgentName(agent.agent_name);
    } catch {}
  };

  const fetchFeatures = async (silent = false) => {
    if (!featuresUrl) return;
    if (!silent) setLoading(true);
    try {
      const data = await getData(featuresUrl);
      const values = {
        booking: toBool(data.booking),
        complaints: toBool(data.complaints),
        website_source_type: data.website_source_type || 'NONE',
        ecommerce_mode: data.ecommerce_mode || 'NONE',
      };
      form.setFieldsValue(values);
      lastGoodValues.current = values;
    } catch {
      message.error('Failed to load agent features');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchPlanCaps = async () => {
    try {
      const sub = await getData(GET_MY_SUBSCRIPTION);
      const plan = sub?.subscription?.plan;
      if (plan) setPlanCaps(plan);
    } catch {}
  };

  useEffect(() => {
    if (!currentAgentName && id) fetchAgentNameFallback();
  }, [id, currentAgentName]);

  useEffect(() => {
    if (featuresUrl) {
      fetchPlanCaps();
      fetchFeatures();
    }
  }, [featuresUrl]);

  const onSave = async () => {
    const v = form.getFieldsValue();

    const payload = {
      booking: !!v.booking,
      complaints: !!v.complaints,
      website_source_type: v.website_source_type || 'NONE',
      ecommerce_mode: v.ecommerce_mode || 'NONE',
    };

    setSaving(true);
    try {
      const res = await patchData(featuresUrl, payload);

      if (res?.error) {
        const errMsg = typeof res.errors === 'string'
          ? res.errors
          : Object.values(res.errors || {}).flat().join(' ') || 'Failed to save features';
        message.error(errMsg);
        if (lastGoodValues.current) form.setFieldsValue(lastGoodValues.current);
        return;
      }

      message.success('Features updated');
      fetchFeatures(true);
    } catch {
      message.error('Failed to save features');
    } finally {
      setSaving(false);
    }
  };

  const websiteSourceType = Form.useWatch('website_source_type', form);
  const ecommerceMode = Form.useWatch('ecommerce_mode', form);

  if (!agentSlug || loading) {
    return (
      <div className="p-6">
        <Card className="py-10 text-center">
          <Spin />
        </Card>
      </div>
    );
  }

  const summaryWebsite =
    websiteSourceType === 'GENERIC'
      ? 'Generic Website'
      : websiteSourceType === 'WORDPRESS'
        ? 'WordPress'
        : 'Disabled';

  const summaryCommerce =
    ecommerceMode === 'INTERNAL'
      ? 'Internal Commerce'
      : ecommerceMode === 'WOOCOMMERCE'
        ? 'WooCommerce'
        : ecommerceMode === 'SHOPIFY'
          ? 'Shopify'
          : 'Disabled';

  return (
    <div className="p-6 space-y-6">
      <Card>
        <div className="flex justify-between items-start gap-3">
          <div>
            <Title level={3} className="!mb-1">Agent Features</Title>
            <Text type="secondary">Agent: <b>{agentSlug}</b></Text>
          </div>

          <div className="flex gap-2">
            <Button icon={<ReloadOutlined />} onClick={() => fetchFeatures(false)}>
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
        <Card title="Service Workflows">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-4">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <div className="font-semibold">Bookings</div>
                  <div className="text-sm text-gray-500">
                    Enable appointment scheduling for this agent.
                  </div>
                </div>
                <UpgradeTooltip allowed={!planCaps || toBool(planCaps.booking)}>
                  <Form.Item name="booking" valuePropName="checked" className="!mb-0">
                    <Switch disabled={planCaps ? !toBool(planCaps.booking) : false} />
                  </Form.Item>
                </UpgradeTooltip>
              </div>
            </div>

            <div className="border rounded-xl p-4">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <div className="font-semibold">Complaints</div>
                  <div className="text-sm text-gray-500">
                    Allow this agent to accept and manage complaints.
                  </div>
                </div>
                <UpgradeTooltip allowed={!planCaps || toBool(planCaps.complaints)}>
                  <Form.Item name="complaints" valuePropName="checked" className="!mb-0">
                    <Switch disabled={planCaps ? !toBool(planCaps.complaints) : false} />
                  </Form.Item>
                </UpgradeTooltip>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Website Knowledge Source" className="mt-6">
          <Form.Item name="website_source_type" className="!mb-0">
            <Radio.Group className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="border rounded-xl p-4 cursor-pointer block">
                  <Radio value="NONE">
                    <div className="font-semibold">Disabled</div>
                  </Radio>
                  <div className="text-sm text-gray-500 mt-2">
                    Do not use website content as a knowledge source.
                  </div>
                </label>

                <UpgradeTooltip allowed={!planCaps || toBool(planCaps.website_data)}>
                  <label className={`border rounded-xl p-4 block ${planCaps && !toBool(planCaps.website_data) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    <Radio value="GENERIC" disabled={planCaps ? !toBool(planCaps.website_data) : false}>
                      <div className="font-semibold">Generic Website</div>
                    </Radio>
                    <div className="text-sm text-gray-500 mt-2">
                      Use general website pages as knowledge source.
                    </div>
                  </label>
                </UpgradeTooltip>

                <UpgradeTooltip allowed={!planCaps || toBool(planCaps.wordpress_data)}>
                  <label className={`border rounded-xl p-4 block ${planCaps && !toBool(planCaps.wordpress_data) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    <Radio value="WORDPRESS" disabled={planCaps ? !toBool(planCaps.wordpress_data) : false}>
                      <div className="font-semibold">WordPress</div>
                    </Radio>
                    <div className="text-sm text-gray-500 mt-2">
                      Use WordPress pages and posts as knowledge source.
                    </div>
                  </label>
                </UpgradeTooltip>
              </div>
            </Radio.Group>
          </Form.Item>

          <div className="mt-4">
            <Alert
              type="info"
              showIcon
              message="One website source at a time"
              description="This agent can use only one website knowledge source mode: Generic Website or WordPress."
            />
          </div>
        </Card>

        <Card title="Commerce Flow" className="mt-6">
          <Form.Item name="ecommerce_mode" className="!mb-0">
            <Radio.Group className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <label className="border rounded-xl p-4 cursor-pointer block">
                  <Radio value="NONE">
                    <div className="font-semibold">Disabled</div>
                  </Radio>
                  <div className="text-sm text-gray-500 mt-2">
                    No commerce flow for this agent.
                  </div>
                </label>

                <UpgradeTooltip allowed={!planCaps || toBool(planCaps.internal_commerce)}>
                  <label className={`border rounded-xl p-4 block ${planCaps && !toBool(planCaps.internal_commerce) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    <Radio value="INTERNAL" disabled={planCaps ? !toBool(planCaps.internal_commerce) : false}>
                      <div className="font-semibold">Internal</div>
                    </Radio>
                    <div className="text-sm text-gray-500 mt-2">
                      Use Virtix internal products, orders, and offers.
                    </div>
                  </label>
                </UpgradeTooltip>

                <UpgradeTooltip allowed={!planCaps || toBool(planCaps.woocommerce)}>
                  <label className={`border rounded-xl p-4 block ${planCaps && !toBool(planCaps.woocommerce) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    <Radio value="WOOCOMMERCE" disabled={planCaps ? !toBool(planCaps.woocommerce) : false}>
                      <div className="font-semibold">WooCommerce</div>
                    </Radio>
                    <div className="text-sm text-gray-500 mt-2">
                      Use WooCommerce products and WooCommerce order flow.
                    </div>
                  </label>
                </UpgradeTooltip>

                <UpgradeTooltip allowed={!planCaps || toBool(planCaps.shopify)}>
                  <label className={`border rounded-xl p-4 block ${planCaps && !toBool(planCaps.shopify) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    <Radio value="SHOPIFY" disabled={planCaps ? !toBool(planCaps.shopify) : false}>
                      <div className="font-semibold">Shopify</div>
                    </Radio>
                    <div className="text-sm text-gray-500 mt-2">
                      Use Shopify products and Shopify checkout flow.
                    </div>
                  </label>
                </UpgradeTooltip>
              </div>
            </Radio.Group>
          </Form.Item>

          <div className="mt-4">
            <Alert
              type="info"
              showIcon
              message="One commerce flow at a time"
              description="This agent can use only one commerce mode: Internal, WooCommerce, or Shopify."
            />
          </div>
        </Card>

        <Card title="Current Configuration Summary" className="mt-6">
          <div className="space-y-2 text-sm">
            <div>
              <Text strong>Bookings:</Text>{' '}
              <Text>{form.getFieldValue('booking') ? 'Enabled' : 'Disabled'}</Text>
            </div>

            <div>
              <Text strong>Complaints:</Text>{' '}
              <Text>{form.getFieldValue('complaints') ? 'Enabled' : 'Disabled'}</Text>
            </div>

            <div>
              <Text strong>Website Source:</Text>{' '}
              <Text>{summaryWebsite}</Text>
            </div>

            <div>
              <Text strong>Commerce Flow:</Text>{' '}
              <Text>{summaryCommerce}</Text>
            </div>

            <div>
              <Text strong>Offers:</Text>{' '}
              <Text>{ecommerceMode === 'INTERNAL' ? 'Enabled through Internal Commerce' : 'Not available'}</Text>
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