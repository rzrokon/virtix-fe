import { ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Form, Spin, Switch, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getData, patchData } from '../../scripts/api-service';
import { useContentApi } from '../../contexts/ContentApiContext';

const { Title, Text } = Typography;

const BOOL_TO_API = (v) => (v ? 'true' : 'false'); // your backend accepts "true"/"false"

export default function AgentFeatures() {
  const { id } = useParams();
  const { currentAgentName } = useContentApi(); // must exist in your context
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [featureData, setFeatureData] = useState(null);

  // If currentAgentName isn't in context for some reason, we can fallback to fetching it
  const [fallbackAgentName, setFallbackAgentName] = useState(null);

  const agentSlug = useMemo(() => {
    return currentAgentName || fallbackAgentName;
  }, [currentAgentName, fallbackAgentName]);

  const featuresUrl = useMemo(() => {
    if (!agentSlug) return null;
    return `api/agent/${agentSlug}/features/`;
  }, [agentSlug]);

  const featureFields = [
    {
      key: 'lead_gen',
      title: 'Lead Generation',
      help: 'Enable lead capture (lead forms, lead list, lead routing).',
    },
    {
      key: 'booking',
      title: 'Booking',
      help: 'Enable booking windows and appointment booking.',
    },
    {
      key: 'complaints',
      title: 'Complaints',
      help: 'Enable complaints intake and complaint management.',
    },
    {
      key: 'products',
      title: 'Products',
      help: 'Enable product catalog features for the agent.',
    },
    {
      key: 'products_orders',
      title: 'Orders',
      help: 'Enable order tracking and order management.',
    },
    {
      key: 'offers',
      title: 'Offers',
      help: 'Enable offers/promotions module.',
    },
  ];

  const fetchAgentNameFallback = async () => {
    // Only used if context isn't set
    try {
      const agent = await getData(`api/agent/agents/${id}/`);
      if (agent?.agent_name) setFallbackAgentName(agent.agent_name);
    } catch (e) {
      console.error('[AgentFeatures] fallback agent fetch failed', e);
    }
  };

  const fetchFeatures = async () => {
    if (!featuresUrl) return;
    setLoading(true);
    try {
      const data = await getData(featuresUrl);
      setFeatureData(data);

      // set initial form values
      const init = {};
      featureFields.forEach((f) => {
        init[f.key] = !!data?.[f.key];
      });
      form.setFieldsValue(init);
    } catch (e) {
      console.error('[AgentFeatures] fetch error', e);
      message.error('Failed to load feature configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ensure agentSlug exists
    if (!currentAgentName && id) fetchAgentNameFallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (featuresUrl) fetchFeatures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuresUrl]);

  const onSave = async () => {
    if (!featuresUrl) {
      message.error('Agent name missing. Could not build feature API URL.');
      return;
    }

    const values = form.getFieldsValue();

    // Convert to your API format "true"/"false"
    const payload = {};
    featureFields.forEach((f) => {
      payload[f.key] = BOOL_TO_API(!!values[f.key]);
    });

    setSaving(true);
    try {
      // Debug logs before redirect happens
      console.log('[AgentFeatures] PATCH url:', featuresUrl);
      console.log('[AgentFeatures] PATCH payload:', payload);

      const res = await patchData(featuresUrl, payload);
      const data = res?.data ?? res;

      console.log('[AgentFeatures] response:', data);

      if (res?.error) {
        console.error('[AgentFeatures] errors:', res.errors);
        message.error('Failed to update features');
        return;
      }

      message.success('Features updated successfully');
      setFeatureData(data);
    } catch (e) {
      console.error('[AgentFeatures] save exception:', e);
      message.error('Failed to update features');
    } finally {
      setSaving(false);
    }
  };

  if (!agentSlug) {
    return (
      <div className="p-6">
        <Card>
          <div className="py-8 text-center">
            <Spin />
            <div className="mt-3 text-gray-500 text-sm">Loading agent...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <div className="py-10 flex justify-center">
            <Spin />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Title level={3} className="!mb-1">
              Feature Configuration
            </Title>
            <Text className="text-gray-500">
              Turn modules on/off for this agent. Agent: <b>{agentSlug}</b>
            </Text>
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

      <Card>
        <div className="mb-2">
          <div className="text-lg font-semibold text-gray-900">Modules</div>
          <div className="text-sm text-gray-500">
            Disable modules you don’t need to keep your dashboard clean.
          </div>
        </div>

        <Divider />

        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featureFields.map((f) => (
              <div key={f.key} className="border border-gray-200 rounded-2xl p-4 bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-gray-900">{f.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{f.help}</div>
                  </div>

                  <Form.Item name={f.key} valuePropName="checked" className="!mb-0">
                    <Switch />
                  </Form.Item>
                </div>
              </div>
            ))}
          </div>

          <Divider />

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-gray-500">
              Last updated:{' '}
              <b>{featureData?.updated ? new Date(featureData.updated).toLocaleString() : '-'}</b>
            </div>

            <Button
              type="primary"
              onClick={onSave}
              loading={saving}
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