import { Button, Card, message, Modal, Select, Spin, Tag } from 'antd';
import Cookies from 'js-cookie';
import { ArrowUpDown, Ban, Check, Minus, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getData, postData } from '../../scripts/api-service';
import { CHANGE_SUBSCRIPTION, GET_BILLING_PLANS, GET_MY_SUBSCRIPTION } from '../../scripts/api';

const toBool = (v) => v === true || v === 'true' || v === 1;

const bytesToHuman = (bytes = 0) => {
  const b = Number(bytes || 0);
  if (b >= 1e12) return `${(b / 1e12).toFixed(1)} TB`;
  if (b >= 1e9)  return `${(b / 1e9).toFixed(1)} GB`;
  if (b >= 1e6)  return `${(b / 1e6).toFixed(1)} MB`;
  if (b >= 1e3)  return `${(b / 1e3).toFixed(1)} KB`;
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
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return iso; }
};

const planPriceLabel = (plan) => {
  if (!plan) return '—';
  if (plan.contact_sales_only) return 'Contact sales';
  const p = parseFloat(plan.price_usd);
  return (!p || p === 0) ? 'Free' : `$${p}/mo`;
};

const extractError = (res) => {
  if (!res?.errors) return 'Something went wrong. Please try again.';
  if (typeof res.errors === 'string') return res.errors;
  return Object.values(res.errors).flat().join(' ') || 'Something went wrong.';
};

const FEATURE_SECTIONS = [
  {
    label: 'Channels',
    items: [
      { key: 'website_widget',  label: 'Website Widget' },
      { key: 'messenger',       label: 'Facebook Messenger' },
      { key: 'instagram',       label: 'Instagram' },
      { key: 'whatsapp',        label: 'WhatsApp' },
    ],
  },
  {
    label: 'Workflows',
    items: [
      { key: 'booking',    label: 'Booking System' },
      { key: 'complaints', label: 'Complaints Management' },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { key: 'website_data',   label: 'Website Data' },
      { key: 'wordpress_data', label: 'WordPress Data' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { key: 'internal_commerce',       label: 'Internal Commerce' },
      { key: 'woocommerce',             label: 'WooCommerce' },
      { key: 'shopify',                 label: 'Shopify' },
      { key: 'product_recommendations', label: 'Product Recommendations' },
      { key: 'order_processing',        label: 'Order Processing' },
      { key: 'order_tracking',          label: 'Order Tracking' },
    ],
  },
  {
    label: 'Reporting',
    items: [
      { key: 'analytics', label: 'Analytics' },
    ],
  },
];

export default function ActivePlan() {
  const navigate = useNavigate();

  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [subData, setSubData] = useState(null);
  const [plans, setPlans] = useState([]);

  const [changeOpen, setChangeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState(null);

  const currentPlan = subData?.subscription?.plan;
  const currentPlanCode = currentPlan?.code;
  const usage = subData?.usage || {};
  const limits = subData?.limits || {};

  const publicPlans = useMemo(() => {
    return (Array.isArray(plans) ? plans : [])
      .filter(p => p.is_public)
      .sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [plans]);

  const starterPlan = useMemo(() => (
    publicPlans.find(p => p.code === 'starter') ||
    publicPlans.find(p => parseFloat(p.price_usd) === 0)
  ), [publicPlans]);

  const planOptions = useMemo(() => (
    publicPlans
      .filter(p => !p.contact_sales_only)
      .map(p => ({
        value: p.code,
        label: `${p.name} — ${planPriceLabel(p)}`,
      }))
  ), [publicPlans]);

  const refreshAll = async () => {
    setPageLoading(true);
    setPageError(null);
    try {
      const [sub, pl] = await Promise.all([
        getData(GET_MY_SUBSCRIPTION),
        getData(GET_BILLING_PLANS, true),
      ]);
      setSubData(sub);
      setPlans(Array.isArray(pl) ? pl : (pl?.results || []));
    } catch {
      setPageError('Failed to load subscription data. Please try again.');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    const token = Cookies.get('kotha_token');
    if (!token) { navigate('/signin', { replace: true }); return; }
    refreshAll();
  }, [navigate]);

  const submitChange = async () => {
    if (!selectedPlanCode) { message.warning('Please select a plan'); return; }
    if (selectedPlanCode === currentPlanCode) {
      message.info('You are already on this plan');
      setChangeOpen(false);
      return;
    }

    setActionLoading(true);
    try {
      const res = await postData(CHANGE_SUBSCRIPTION, { plan_code: selectedPlanCode });
      const data = res?.data ?? res;

      if (res?.error) { message.error(extractError(res)); return; }

      if (data?.detail === 'checkout_created' && data?.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      if (data?.detail === 'ok' || data?.mode === 'internal') {
        message.success('Plan updated successfully');
        setChangeOpen(false);
        await refreshAll();
        return;
      }

      message.error('Unexpected response. Please try again.');
    } catch {
      message.error('Failed to change plan. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const submitCancelToFree = async () => {
    if (!starterPlan?.code) { message.error('Free plan not found'); return; }

    setActionLoading(true);
    try {
      const res = await postData(CHANGE_SUBSCRIPTION, { plan_code: starterPlan.code });
      const data = res?.data ?? res;

      if (res?.error) { message.error(extractError(res)); return; }

      if (data?.detail === 'checkout_created' && data?.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      if (data?.detail === 'ok' || data?.mode === 'internal') {
        message.success('Switched to Free plan successfully.');
        setCancelOpen(false);
        await refreshAll();
        return;
      }

      message.error('Unexpected response. Please try again.');
    } catch {
      message.error('Failed to cancel subscription. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const usageCards = [
    { title: 'Messages',     used: usage?.messages ?? 0,      limit: limits?.max_messages_per_month ?? 0, format: numToHuman },
    { title: 'Index',        used: usage?.index_bytes ?? 0,   limit: limits?.max_index_bytes ?? 0,        format: bytesToHuman },
    { title: 'Storage',      used: usage?.storage_bytes ?? 0, limit: limits?.max_storage_bytes ?? 0,      format: bytesToHuman },
  ];

  if (pageLoading) {
    return (
      <div className="p-6">
        <Card>
          <div className="flex justify-center py-10"><Spin /></div>
        </Card>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="p-6">
        <Card>
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="text-red-500">{pageError}</p>
            <Button onClick={refreshAll}>Try again</Button>
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
            <p className="text-gray-500 mt-1 text-sm">
              View your current plan, usage, and manage upgrades or cancellations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button icon={<RefreshCw size={15} />} onClick={refreshAll} loading={pageLoading}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<ArrowUpDown size={15} />}
              onClick={() => { setSelectedPlanCode(currentPlanCode || null); setChangeOpen(true); }}
            >
              Change plan
            </Button>
            <Button
              danger
              icon={<Ban size={15} />}
              onClick={() => setCancelOpen(true)}
              disabled={currentPlanCode === starterPlan?.code}
            >
              Cancel & switch to Free
            </Button>
          </div>
        </div>
      </Card>

      {/* Plan info + Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Current plan */}
        <Card className="lg:col-span-2 space-y-6">

          {/* Name + status */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">Current plan</div>
              <div className="text-2xl font-bold text-[#0C0900]">
                {currentPlan?.name || '—'}
                <span className="text-base font-normal text-gray-500 ml-2">
                  {planPriceLabel(currentPlan)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Tag color={subData?.subscription?.status === 'active' ? 'green' : 'orange'}>
                  {subData?.subscription?.status || 'unknown'}
                </Tag>
                {subData?.subscription?.cancel_at_period_end
                  ? <Tag color="volcano">Cancels at period end</Tag>
                  : <Tag color="blue">Auto-renews</Tag>
                }
              </div>
              <div className="mt-3 text-sm text-gray-500 space-y-0.5">
                <div>Period: <span className="text-gray-700">{formatDate(subData?.subscription?.current_period_start)} — {formatDate(subData?.subscription?.current_period_end)}</span></div>
              </div>
            </div>

            {/* Limits summary */}
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Plan limits</div>
              <div className="space-y-1 text-sm">
                <div><span className="font-semibold">{limits?.max_agents ?? '—'}</span> agents</div>
                <div><span className="font-semibold">{limits?.max_files ?? '—'}</span> files</div>
                <div><span className="font-semibold">{numToHuman(limits?.max_messages_per_month ?? 0)}</span> messages/month</div>
                <div><span className="font-semibold">{bytesToHuman(limits?.max_storage_bytes ?? 0)}</span> storage</div>
                <div><span className="font-semibold">{bytesToHuman(limits?.max_index_bytes ?? 0)}</span> index</div>
                <div><span className="font-semibold">{limits?.max_team_members ?? '—'}</span> team members</div>
              </div>
            </div>
          </div>

          {/* Included features */}
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-4">Included features</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {FEATURE_SECTIONS.map((section) => (
                <div key={section.label}>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {section.label}
                  </div>
                  <div className="space-y-1.5">
                    {section.items.map((f) => {
                      const included = toBool(currentPlan?.[f.key]);
                      return (
                        <div key={f.key} className="flex items-center gap-2">
                          {included
                            ? <Check size={14} className="text-[#6200FF] flex-shrink-0" />
                            : <Minus size={14} className="text-gray-300 flex-shrink-0" />
                          }
                          <span className={`text-sm ${included ? 'text-gray-800' : 'text-gray-400'}`}>
                            {f.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Usage */}
        <Card>
          <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">Usage</div>
          <div className="text-sm text-gray-500 mb-5">
            {formatDate(usage?.period_start)} — {formatDate(usage?.period_end)}
          </div>
          <div className="space-y-5">
            {usageCards.map((u) => {
              const used = Number(u.used || 0);
              const limit = Number(u.limit || 0);
              const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
              const isHigh = pct >= 90;
              const isMid = pct >= 70 && pct < 90;

              return (
                <div key={u.title}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-700 font-medium">{u.title}</span>
                    <span className={`font-medium ${isHigh ? 'text-red-500' : isMid ? 'text-amber-500' : 'text-gray-500'}`}>
                      {u.format(used)} / {u.format(limit)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isHigh ? 'bg-red-500' : isMid ? 'bg-amber-400' : 'bg-[#6200FF]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-400 mt-1">{pct}%</div>
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
        <div className="space-y-4 py-2">
          <div className="text-sm text-gray-500">
            Current plan: <span className="font-semibold text-gray-800">{currentPlan?.name || '—'}</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1.5">Select a new plan</div>
            <Select
              style={{ width: '100%' }}
              value={selectedPlanCode}
              onChange={setSelectedPlanCode}
              options={planOptions}
              placeholder="Choose a plan"
            />
          </div>
          <p className="text-xs text-gray-400">
            Changes take effect immediately. Billing adjustments follow your subscription provider's rules.
          </p>
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
        <div className="space-y-2 py-2">
          <p className="text-gray-700">
            Your plan will be switched to <span className="font-semibold">{starterPlan?.name || 'Starter'}</span> (Free).
          </p>
          <p className="text-sm text-gray-400">
            Features not included in the Free plan will be disabled immediately.
          </p>
        </div>
      </Modal>

    </div>
  );
}
