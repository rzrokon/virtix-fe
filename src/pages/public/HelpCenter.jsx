import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

const HelpCenter = () => {
  const [query, setQuery] = useState('');
  const sections = [
    {
      title: 'Getting Started',
      subtitle: 'Onboarding for new SME owners',
      items: [
        'What is Virtix AI?',
        'How Virtix AI Works (Agent + Knowledge + Actions)',
        'Creating Your First AI Agent',
        'Understanding Agent Dashboard',
        'How Conversations Work',
        'Understanding Human Handover',
        'Subscription Plans & Feature Limits',
      ],
    },
    {
      title: 'Building a High-Quality AI Agent',
      subtitle: 'Quality and reliability',
      items: [
        'How to Define Your Agent Personality',
        'Writing a Strong System Prompt',
        'How to Upload Knowledge Files (PDF, Docs)',
        'How Website Sync Works',
        'How Product Knowledge Improves Sales',
        'Using Prompt Shortcuts',
        'Understanding Agent Context & Memory',
        'How RAG (Retrieval) Works in Simple Language',
      ],
      note: 'Simple explanation: Your AI reads your website and products before answering.',
    },
    {
      title: 'E-commerce Integrations',
      subtitle: 'WooCommerce & Shopify guides',
      groups: [
        {
          label: 'WooCommerce Guide',
          items: [
            'How to Connect WooCommerce',
            'How to Generate Woo API Keys',
            'How Product Sync Works',
            'Understanding Variable Products & Variations',
            'How AI Places Orders in WooCommerce',
            'How Payment Links Work',
            'How Order Tracking Works',
            'Troubleshooting Woo Sync Errors',
          ],
        },
        {
          label: 'Shopify Guide (Future)',
          items: [
            'How to Connect Shopify',
            'How Shopify Variants Work',
            'Draft Orders & Payment Links',
            'Syncing Products',
            'Shopify Common Issues',
          ],
        },
      ],
    },
    {
      title: 'Business Operations',
      subtitle: 'Run the platform smoothly',
      items: [
        'Lead Management',
        'Booking Setup Guide',
        'Complaint Handling',
        'Product Catalog Management',
        'Offers & Promotions',
        'Managing Team Access',
        'Security & Access Control',
      ],
    },
    {
      title: 'AI Optimization & Growth',
      subtitle: 'Improve results and ROI',
      items: [
        'How to Improve AI Sales Conversion',
        'Training AI with Better Knowledge',
        'Using AI to Reduce Support Cost',
        'Understanding Agent Analytics',
        'Measuring AI ROI',
        'Best Conversation Design Practices',
        'AI Upselling & Cross-selling Strategies',
      ],
    },
  ];

  const filteredSections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return sections;

    return sections
      .map((section) => {
        const matchesSection =
          section.title.toLowerCase().includes(needle) ||
          section.subtitle.toLowerCase().includes(needle) ||
          (section.note?.toLowerCase().includes(needle) ?? false);

        const filteredItems = section.items?.filter((item) =>
          item.toLowerCase().includes(needle)
        );

        const filteredGroups = section.groups
          ? section.groups
              .map((group) => {
                const filteredGroupItems = group.items.filter((item) =>
                  item.toLowerCase().includes(needle)
                );
                const groupMatches =
                  group.label.toLowerCase().includes(needle) || filteredGroupItems.length > 0;
                return groupMatches
                  ? { ...group, items: filteredGroupItems.length ? filteredGroupItems : group.items }
                  : null;
              })
              .filter(Boolean)
          : null;

        if (matchesSection) return section;

        if ((filteredItems && filteredItems.length) || (filteredGroups && filteredGroups.length)) {
          return {
            ...section,
            items: filteredItems?.length ? filteredItems : section.items,
            groups: filteredGroups?.length ? filteredGroups : section.groups,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [query, sections]);

  return (
    <section className="py-20 bg-[#f8fafc]">
      <div className="container max-w-6xl space-y-10 text-[#0C0900]">
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 md:p-10 shadow-[0_16px_40px_rgba(15,23,42,0.08)] mt-15">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">Help center</p>
            <h1 className="text-4xl md:text-5xl leading-[120%] font-bold">Virtix AI Help Center</h1>
            <p className="text-base text-[#0C0900]/70">
              Guides and best practices for SME teams building reliable AI agents.
            </p>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#f9fafb] px-4 py-3">
              <Search size={18} className="text-[#6200ff]" />
              <input
                type="search"
                placeholder="Search help articles"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#0C0900] placeholder:text-[#0C0900]/40 focus:outline-none"
              />
            </div>
            <p className="mt-2 text-xs text-[#0C0900]/50">Start typing to explore topics and guides.</p>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredSections.length ? (
            filteredSections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{section.title}</h2>
                <p className="text-sm text-[#0C0900]/70">{section.subtitle}</p>
              </div>

              {section.items ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {section.items.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-[#E5E7EB] bg-[#f9fafb] px-4 py-3 text-sm font-semibold text-[#0C0900] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#6200ff]/30"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : null}

              {section.groups ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {section.groups.map((group) => (
                    <div
                      key={group.label}
                      className="rounded-xl border border-[#E5E7EB] bg-[#f9fafb] p-4"
                    >
                      <p className="text-sm font-bold">{group.label}</p>
                      <div className="mt-3 grid gap-2">
                        {group.items.map((item) => (
                          <div key={item} className="text-sm text-[#0C0900]/80">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {section.note ? (
                <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#0C0900]/80">
                  {section.note}
                </div>
              ) : null}
            </div>
            ))
          ) : (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center text-sm text-[#0C0900]/70">
              No results found. Try a different keyword.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HelpCenter;
