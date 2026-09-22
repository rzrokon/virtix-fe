import { ArrowRight, Database, Facebook, Globe, Instagram, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const stores = [
  {
    name: 'WooCommerce',
    description: 'Connect your WooCommerce store and sync your products. Help shoppers compare options, find the right items, and get order updates.',
    Icon: ShoppingCart,
    color: 'text-[#7F54B3]',
    bg: 'bg-[#7F54B3]/10',
  },
  {
    name: 'Custom Commerce',
    description: 'Use Virtix AI with your own storefront. Add products manually or import a CSV, manage your catalog, and embed the assistant on your website.',
    Icon: Database,
    color: 'text-[#6200ff]',
    bg: 'bg-[#6200ff]/10',
  },
];

const Integrations = () => (
  <section className="py-20" id="supported-stores">
    <div className="container flex flex-col gap-10">
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6200ff]">Available now</p>
        <h2 className="text-4xl font-bold leading-[120%] text-[#0C0900] md:text-5xl">
          Two ways to bring AI to your store
        </h2>
        <p className="text-base leading-[160%] text-[#0C0900]/70">
          Connect WooCommerce or bring your own catalog. Start with the setup that fits your business.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {stores.map((store) => (
          <div key={store.name} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${store.bg} ${store.color}`}>
                <store.Icon size={22} />
              </span>
              <h3 className="text-xl font-bold text-[#0C0900]">{store.name}</h3>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Available now</span>
            </div>
            <p className="mt-5 text-base leading-relaxed text-[#0C0900]/70">{store.description}</p>
            <Link to="/signup" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#6200ff] hover:underline">
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <p className="text-sm font-medium text-[#0C0900]/70">Support shoppers across your channels</p>
        {[
          { name: 'Website Widget', Icon: Globe },
          { name: 'Facebook Messenger', Icon: Facebook },
          { name: 'Instagram', Icon: Instagram },
        ].map((channel) => (
          <span key={channel.name} className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#0C0900]">
            <channel.Icon size={16} className="text-[#6200ff]" />{channel.name}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShoppingBag size={22} className="mt-1 shrink-0 text-[#70952E]" />
          <div>
            <p className="font-semibold text-[#0C0900]">Shopify is coming soon</p>
            <p className="mt-1 text-sm leading-relaxed text-[#0C0900]/70">Join the early access list to hear when Shopify becomes available.</p>
          </div>
        </div>
        <Link to="/shopify" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#6200ff] hover:underline">
          Join Shopify early access <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  </section>
);

export default Integrations;
