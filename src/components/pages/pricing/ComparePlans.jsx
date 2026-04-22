import { Spin } from 'antd';
import { Check, Minus } from 'lucide-react';

const toBool = (v) => v === true || v === 'true' || v === 1;

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toString();
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 KB';
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(0)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
};

const SECTIONS = [
  {
    label: 'Limits',
    rows: [
      { label: 'Agents',            render: (p) => p.max_agents },
      { label: 'Messages / month',  render: (p) => formatNumber(p.max_messages_per_month) },
      { label: 'Files',             render: (p) => p.max_files },
      { label: 'Storage',           render: (p) => formatBytes(p.max_storage_bytes) },
      { label: 'Index capacity',    render: (p) => formatBytes(p.max_index_bytes) },
      { label: 'Team members',      render: (p) => p.max_team_members },
    ],
  },
  {
    label: 'Channels',
    rows: [
      { label: 'Website Widget',     render: (p) => toBool(p.website_widget) },
      { label: 'Facebook Messenger', render: (p) => toBool(p.messenger) },
      { label: 'Instagram',          render: (p) => toBool(p.instagram) },
      { label: 'WhatsApp',           render: (p) => toBool(p.whatsapp) },
    ],
  },
  {
    label: 'Workflows',
    rows: [
      { label: 'Booking System',        render: (p) => toBool(p.booking) },
      { label: 'Complaints Management', render: (p) => toBool(p.complaints) },
    ],
  },
  {
    label: 'Knowledge',
    rows: [
      { label: 'Website Data',   render: (p) => toBool(p.website_data) },
      { label: 'WordPress Data', render: (p) => toBool(p.wordpress_data) },
    ],
  },
  {
    label: 'Commerce',
    rows: [
      { label: 'Internal Commerce',       render: (p) => toBool(p.internal_commerce) },
      { label: 'WooCommerce',             render: (p) => toBool(p.woocommerce) },
      { label: 'Shopify',                 render: (p) => toBool(p.shopify) },
      { label: 'Product Recommendations', render: (p) => toBool(p.product_recommendations) },
      { label: 'Order Processing',        render: (p) => toBool(p.order_processing) },
      { label: 'Order Tracking',          render: (p) => toBool(p.order_tracking) },
    ],
  },
  {
    label: 'Reporting',
    rows: [
      { label: 'Analytics', render: (p) => toBool(p.analytics) },
    ],
  },
];

const CellValue = ({ value }) => {
  if (typeof value === 'boolean') {
    return value
      ? <Check size={17} className="text-[#6200FF] mx-auto" />
      : <Minus size={17} className="text-gray-300 mx-auto" />;
  }
  return <span className="text-sm font-medium text-[#0C0900]">{value}</span>;
};

export default function ComparePlans({ plans = [], loading = false }) {
  if (loading) {
    return (
      <section className="py-16">
        <div className="container flex justify-center py-10"><Spin /></div>
      </section>
    );
  }

  if (!plans.length) return null;

  const priceLabel = (plan) => {
    if (plan.contact_sales_only) return 'Contact sales';
    const p = parseFloat(plan.price_usd);
    if (!p) return 'Free';
    return `$${p}/mo`;
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="container overflow-hidden">

        <div className="mx-auto max-w-2xl text-center mb-12 px-2 space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl leading-[120%] text-[#0C0900] font-bold">
            Compare plans
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            See exactly what each plan includes before you decide.
          </p>
        </div>

        <div className="w-full overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full min-w-[520px] border-collapse">

            {/* Header */}
            <thead>
              <tr className="border-b border-gray-200">
                <th className="w-52 px-6 py-5 text-left text-xs uppercase tracking-widest text-gray-400 font-semibold bg-white" />
                {plans.map((plan) => {
                  const popular = plan.code === 'growth';
                  return (
                    <th key={plan.code} className="px-4 py-5 text-center bg-white">
                      {popular && (
                        <div className="mb-1">
                          <span className="rounded-full bg-[#6200FF]/10 text-[#6200FF] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                            Popular
                          </span>
                        </div>
                      )}
                      <div className={`text-base font-bold ${popular ? 'text-[#6200FF]' : 'text-[#0C0900]'}`}>
                        {plan.name}
                      </div>
                      <div className="text-sm text-gray-400 mt-0.5">{priceLabel(plan)}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {SECTIONS.map((section, si) => (
                <>
                  {/* Section label */}
                  <tr key={`s-${si}`} className="border-t border-gray-200">
                    <td
                      colSpan={plans.length + 1}
                      className="px-6 py-2.5 text-[10px] uppercase tracking-widest font-semibold text-gray-400 bg-gray-50"
                    >
                      {section.label}
                    </td>
                  </tr>

                  {/* Feature rows */}
                  {section.rows.map((row, ri) => (
                    <tr
                      key={`${si}-${ri}`}
                      className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3.5 text-sm text-gray-700">{row.label}</td>
                      {plans.map((plan) => (
                        <td key={plan.code} className="px-4 py-3.5 text-center">
                          <CellValue value={row.render(plan)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>

          </table>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Need something custom?{' '}
          <a href="/contact" className="text-[#6200FF] hover:underline font-medium">
            Talk to us
          </a>.
        </p>
      </div>
    </section>
  );
}
