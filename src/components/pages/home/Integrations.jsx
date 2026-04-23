import { Facebook, Globe, Instagram, MessageCircle, Phone, ShoppingBag, ShoppingCart } from 'lucide-react';

const Integrations = () => {
  const integrations = [
    {
      name: 'Shopify',
      Icon: ShoppingBag,
      color: 'text-[#95BF47]',
      bg: 'bg-[#95BF47]/10',
    },
    {
      name: 'WooCommerce',
      Icon: ShoppingCart,
      color: 'text-[#7F54B3]',
      bg: 'bg-[#7F54B3]/10',
    },
    {
      name: 'Website Widget',
      Icon: Globe,
      color: 'text-[#6200ff]',
      bg: 'bg-[#6200ff]/10',
    },
    {
      name: 'Facebook Messenger',
      Icon: Facebook,
      color: 'text-[#1877F2]',
      bg: 'bg-[#1877F2]/10',
    },
    {
      name: 'Instagram',
      Icon: Instagram,
      color: 'text-[#E1306C]',
      bg: 'bg-[#E1306C]/10',
    },
    {
      name: 'WhatsApp',
      Icon: Phone,
      color: 'text-[#25D366]',
      bg: 'bg-[#25D366]/10',
    },
  ];

  return (
    <section className="py-20">
      <div className="container flex flex-col gap-10">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6200ff]">Integrations</p>
          <h2 className="text-4xl font-bold leading-[120%] text-[#0C0900] md:text-5xl">
            Works with your store and your channels
          </h2>
          <p className="text-base leading-[160%] text-[#0C0900]/70">
            Meet customers where they already ask questions.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-[#6200ff]/25 hover:shadow-[0_16px_32px_rgba(98,0,255,0.12)]"
            >
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${integration.bg} ${integration.color}`}>
                <integration.Icon size={22} />
              </span>
              <span className="text-base font-bold leading-[140%] text-[#0C0900]">{integration.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Integrations;
