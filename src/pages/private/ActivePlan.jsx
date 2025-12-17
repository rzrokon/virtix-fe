import { useEffect, useMemo, useState } from 'react';
import { Button, Card, message, Modal, Select, Spin, Tag } from 'antd';
import Cookies from 'js-cookie';
import { Check, X, RefreshCw, ArrowUpDown, Ban } from 'lucide-react';

import { getData, postData } from '../../scripts/api-service';
import { GET_BILLING_PLANS, GET_MY_SUBSCRIPTION, CHANGE_SUBSCRIPTION } from '../../scripts/api';

const bytesToHuman = (bytes = 0) => {
  const b = Number(bytes || 0);
  if (b >= 1e12) return `${(b / 1e12).toFixed(1)} TB`;
  if (b >= 1e9) return `${(b / 1e9).toFixed(1)} GB`;
  if (b >= 1e6) return `${(b / 1e6).toFixed(1)} MB`;
  if (b >= 1e3) return `${(b / 1e3).toFixed(1)} KB`;
  return `${b} B`;
};

const numToHuman = (n = 0) => {
  const v = Number(n || 0);
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return `${v}`;
};

const formatDate = (iso) => {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const planPriceLabel = (plan) => {
  if (!plan) return '-';
  if (plan.contact_sales_only) return 'Contact sales';
  const p = parseFloat(plan.price_usd);
  if (!p || p === 0) return 'Free';
  return `$${p}`;
};

export default function ActivePlan() {
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [subData, setSubData] = useState(null);
  const [plans, setPlans] = useState([]);

  const [changeOpen, setChangeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState(null);

  // ✅ auth guard
  useEffect(() => {
    const token = Cookies.get('kotha_token');
    if (!token) {
      window.location.href = '/signin';
    }
  }, []);

  const currentPlan = subData?.subscription?.plan;
  const currentPlanCode = currentPlan?.code;

  const publicPlans = useMemo(() => {
    const list = Array.isArray(plans) ? plans : [];
    return list
      .filter(p => p.is_public)
      .sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [plans]);

  const starterPlan = useMemo(() => {
    return publicPlans.find(p => p.code === 'starter')
      || publicPlans.find(p => parseFloat(p.price_usd) === 0);
  }, [publicPlans]);

  const planOptions = useMemo(() => {
    return publicPlans
      .filter(p => !p.contact_sales_only) // hide sales-only from dropdown (optional)
      .map(p => ({
        value: p.code,
        label: `${p.name} — ${planPriceLabel(p)}${parseFloat(p.price_usd) > 0 ? '/mo' : ''}`,
      }));
  }, [publicPlans]);

  const usage = subData?.usage || {};
  const limits = subData?.limits || {};
  const includedFeatures = limits?.features || {};

  const featureList = [
    { key: 'lead_gen', label: 'Lead generation' },
    { key: 'booking', label: 'Booking system' },
    { key: 'complaints', label: 'Complaints management' },
    { key: 'products_orders', label: 'Products & orders' },
    { key: 'offers', label: 'Offers & promotions' },
  ];

  const refreshAll = async () => {
    setPageLoading(true);
    try {
      // subscription endpoint requires auth token (getData includes token by default)
      const sub = await getData(GET_MY_SUBSCRIPTION);

      // plans endpoint is public
      const pl = await getData(GET_BILLING_PLANS, true);
      const list = Array.isArray(pl) ? pl : (pl?.results || []);

      setSubData(sub);
      setPlans(list);
    } catch (e) {
      console.error('[ActivePlan] refresh error', e);
      message.error('Failed to load subscription data');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openChange = () => {
    setSelectedPlanCode(currentPlanCode || null);
    setChangeOpen(true);
  };

    const submitChange = async () => {
    if (!selectedPlanCode) {
        message.warning('Please select a plan');
        return;
    }

    if (selectedPlanCode === currentPlanCode) {
        message.info('You are already on this plan');
        setChangeOpen(false);
        return;
    }

    setActionLoading(true);
    try {
        const payload = { plan_code: selectedPlanCode };
        console.log('[ChangeSubscription] payload', payload);

        const res = await postData(CHANGE_SUBSCRIPTION, payload);
        const data = res?.data ?? res;

        console.log('[ChangeSubscription] response', data);

        if (data?.detail === 'checkout_created' && data?.mode === 'lemon_checkout' && data?.checkout_url) {
        window.location.href = data.checkout_url;
        return;
        }

        if (data?.detail === 'ok' || data?.mode === 'internal') {
        message.success('Plan updated successfully');
        setChangeOpen(false);
        await refreshAll();
        return;
        }

        if (res?.error) {
        console.error('[ChangeSubscription] errors', res.errors);
        message.error('Failed to change plan');
        return;
        }

        message.error('Unexpected response from server');
    } catch (e) {
        console.error('[ChangeSubscription] exception', e);
        message.error('Failed to change plan');
    } finally {
        setActionLoading(false);
    }
    };

  const openCancel = () => setCancelOpen(true);

    const submitCancelToFree = async () => {
    if (!starterPlan?.code) {
        message.error('Starter (Free) plan not found');
        return;
    }

    setActionLoading(true);
    try {
        const payload = { plan_code: starterPlan.code };
        console.log('[CancelToFree] payload', payload);

        const res = await postData(CHANGE_SUBSCRIPTION, payload);
        const data = res?.data ?? res;

        console.log('[CancelToFree] response', data);

        if (data?.detail === 'checkout_created' && data?.checkout_url) {
        window.location.href = data.checkout_url;
        return;
        }

        if (data?.detail === 'ok' || data?.mode === 'internal') {
        message.success('Subscription canceled. You are now on the Free plan.');
        setCancelOpen(false);
        await refreshAll();
        return;
        }

        if (res?.error) {
        console.error('[CancelToFree] errors', res.errors);
        message.error('Failed to cancel subscription');
        return;
        }

        message.error('Unexpected response from server');
    } catch (e) {
        console.error('[CancelToFree] exception', e);
        message.error('Failed to cancel subscription');
    } finally {
        setActionLoading(false);
    }
    };

  const usageCards = [
    {
      title: 'Messages used',
      used: usage?.messages ?? 0,
      limit: limits?.max_messages_per_month ?? 0,
      format: numToHuman,
    },
    {
      title: 'Index used',
      used: usage?.index_bytes ?? 0,
      limit: limits?.max_index_bytes ?? 0,
      format: bytesToHuman,
    },
    {
      title: 'Storage used',
      used: usage?.storage_bytes ?? 0,
      limit: limits?.max_storage_bytes ?? 0,
      format: bytesToHuman,
    },
  ];

  if (pageLoading) {
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
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Active Plan</h1>
            <p className="text-gray-600 mt-1">
              View your current plan, usage and manage upgrades/downgrades.
            </p>
          </div>

          <div className="flex gap-2">
            <Button icon={<RefreshCw size={16} />} onClick={refreshAll}>
              Refresh
            </Button>

            <Button
              type="primary"
              icon={<ArrowUpDown size={16} />}
              onClick={openChange}
              loading={actionLoading}
            >
              Change plan
            </Button>

            <Button
              danger
              icon={<Ban size={16} />}
              onClick={openCancel}
              loading={actionLoading}
              disabled={currentPlanCode === starterPlan?.code}
            >
              Cancel & switch to Free
            </Button>
          </div>
        </div>
      </Card>

      {/* Current Plan + Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current plan */}
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm text-gray-500">Current plan</div>
              <div className="text-2xl font-bold">
                {currentPlan?.name || '—'}{' '}
                <span className="text-base font-semibold text-gray-700">
                  ({planPriceLabel(currentPlan)}{parseFloat(currentPlan?.price_usd || 0) > 0 ? '/mo' : ''})
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <Tag color={subData?.subscription?.status === 'active' ? 'green' : 'orange'}>
                  {subData?.subscription?.status || 'unknown'}
                </Tag>
                {subData?.subscription?.cancel_at_period_end ? (
                  <Tag color="volcano">Cancel at period end</Tag>
                ) : (
                  <Tag color="blue">Auto-renew</Tag>
                )}
              </div>

              <div className="mt-4 text-sm text-gray-700 space-y-1">
                <div>
                  <span className="text-gray-500">Period start:</span>{' '}
                  {formatDate(subData?.subscription?.current_period_start)}
                </div>
                <div>
                  <span className="text-gray-500">Period end:</span>{' '}
                  {formatDate(subData?.subscription?.current_period_end)}
                </div>
              </div>
            </div>

            <div className="min-w-[220px]">
              <div className="text-sm text-gray-500 mb-2">Plan limits</div>
              <div className="space-y-1 text-sm">
                <div><b>{limits?.max_agents ?? '-'}</b> agents</div>
                <div><b>{limits?.max_files ?? '-'}</b> files</div>
                <div><b>{numToHuman(limits?.max_messages_per_month ?? 0)}</b> msgs/month</div>
                <div><b>{bytesToHuman(limits?.max_storage_bytes ?? 0)}</b> storage</div>
                <div><b>{bytesToHuman(limits?.max_index_bytes ?? 0)}</b> index</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6">
            <div className="font-semibold text-lg mb-3">Included features</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {featureList.map((f) => {
                const included = !!includedFeatures?.[f.key];
                return (
                  <div key={f.key} className="flex items-center gap-2">
                    {included ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <X size={18} className="text-gray-400" />
                    )}
                    <span className={included ? 'text-gray-900' : 'text-gray-400'}>
                      {f.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Usage */}
        <Card>
          <div className="text-lg font-semibold mb-3">Usage</div>
          <div className="text-sm text-gray-500 mb-4">
            Current period: {formatDate(usage?.period_start)} → {formatDate(usage?.period_end)}
          </div>

          <div className="space-y-4">
            {usageCards.map((u) => {
              const used = Number(u.used || 0);
              const limit = Number(u.limit || 0);
              const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

              return (
                <div key={u.title}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{u.title}</span>
                    <span className="text-gray-600">
                      {u.format(used)} / {u.format(limit)}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#6200FF] h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Change Plan Modal */}
      <Modal
        title="Change subscription plan"
        open={changeOpen}
        onOk={submitChange}
        onCancel={() => setChangeOpen(false)}
        okText="Confirm change"
        confirmLoading={actionLoading}
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Current plan: <b>{currentPlan?.name || '—'}</b>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Select a plan</div>
            <Select
              style={{ width: '100%' }}
              value={selectedPlanCode}
              onChange={setSelectedPlanCode}
              options={planOptions}
              placeholder="Choose a plan"
            />
          </div>

          <div className="text-xs text-gray-500">
            Your billing system will apply changes based on subscription rules.
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title="Cancel subscription"
        open={cancelOpen}
        onOk={submitCancelToFree}
        onCancel={() => setCancelOpen(false)}
        okText="Cancel & switch to Free"
        okButtonProps={{ danger: true }}
        confirmLoading={actionLoading}
      >
        <p className="text-gray-700">
          This will switch your plan to <b>{starterPlan?.name || 'Starter'}</b> (Free).
        </p>
        <p className="text-gray-500 mt-2 text-sm">
          Some features may be disabled based on the Free plan limits.
        </p>
      </Modal>
    </div>
  );
}