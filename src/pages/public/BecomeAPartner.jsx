import { Link } from 'react-router-dom';
import { ArrowRight, BadgeDollarSign, Briefcase, HandshakeIcon, HeadphonesIcon, LayoutDashboard, Repeat2, Settings, ShieldCheck, Star, TrendingUp, Users } from 'lucide-react';
import CTA from '../../components/pages/home/CTA';

const revenueStreams = [
  {
    icon: Repeat2,
    color: 'text-[#6200FF]',
    bg: 'bg-[#6200FF]/8',
    title: 'Recurring Referral Revenue',
    description:
      'Refer your clients to Virtix AI and earn a recurring commission for every month they stay subscribed. Your revenue grows as your clients grow — no cap.',
    highlight: 'Ongoing monthly commission',
  },
  {
    icon: Settings,
    color: 'text-[#0ea5e9]',
    bg: 'bg-[#0ea5e9]/8',
    title: 'Platform Installation Fee',
    description:
      'Get paid to set up and configure Virtix AI for your clients. From onboarding agents to connecting channels and integrations, your implementation work is billable.',
    highlight: 'One-time setup revenue',
  },
  {
    icon: HeadphonesIcon,
    color: 'text-[#10b981]',
    bg: 'bg-[#10b981]/8',
    title: 'Ongoing Support Revenue',
    description:
      'Offer first-line support to your clients as their trusted service provider. Manage their workspace, handle day-to-day queries, and build a retainer relationship.',
    highlight: 'Monthly retainer potential',
  },
  {
    icon: ShieldCheck,
    color: 'text-[#f59e0b]',
    bg: 'bg-[#f59e0b]/8',
    title: 'Priority Support for Your Clients',
    description:
      'As a partner, your clients get elevated support priority from our team. Faster response times, a dedicated escalation path, and SLA-backed assistance.',
    highlight: 'White-glove client experience',
  },
];

const steps = [
  {
    step: '01',
    title: 'Apply to the Program',
    description:
      'Submit a short application so we can understand your business, the clients you serve, and how we can best support you.',
  },
  {
    step: '02',
    title: 'Get Onboarded & Certified',
    description:
      'We walk you through the platform, provide training resources, and equip you with everything you need to pitch and deploy Virtix AI for your clients.',
  },
  {
    step: '03',
    title: 'Refer, Deploy & Earn',
    description:
      'Start referring clients, installing the platform, and providing support. Your earnings accumulate automatically and are paid out on a regular schedule.',
  },
];

const partnerTypes = [
  {
    icon: Briefcase,
    title: 'Agency Partner',
    description:
      'Digital agencies and marketing firms that manage client tech stacks. Add Virtix AI to your service offering and resell setup, support, and subscriptions.',
  },
  {
    icon: LayoutDashboard,
    title: 'IT & Solutions Partner',
    description:
      'System integrators and IT service providers who deploy SaaS tools for SMEs. Install and configure Virtix AI as part of your managed services.',
  },
  {
    icon: Users,
    title: 'Consultant / Freelancer',
    description:
      'Independent consultants who advise clients on CX, operations, or ecommerce. Recommend Virtix AI and earn a commission every time a client subscribes.',
  },
];

const perks = [
  { icon: BadgeDollarSign, label: 'Competitive recurring commissions' },
  { icon: TrendingUp,       label: 'Earnings grow with your client base' },
  { icon: Star,             label: 'Co-marketing and referral materials' },
  { icon: ShieldCheck,      label: 'Priority escalation for client issues' },
  { icon: HandshakeIcon,    label: 'Dedicated partner success manager' },
  { icon: HeadphonesIcon,   label: 'Early access to new features' },
];

export default function BecomeAPartner() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="container max-w-6xl space-y-10 text-[#0C0900]">
          <div className="mt-15 rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="space-y-5">
                <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">Partner Program</p>
                <h1 className="text-4xl md:text-5xl leading-[115%] font-bold">
                  Grow your business by partnering with Virtix AI
                </h1>
                <p className="max-w-xl text-base leading-8 text-[#0C0900]/70">
                  Service providers, agencies, and consultants who recommend, deploy, and support Virtix AI earn
                  recurring revenue, installation fees, and retainer income — while giving their clients a world-class
                  AI platform backed by our priority support.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-[#6200FF] text-white text-sm font-semibold hover:bg-[#5000CC] transition-colors"
                  >
                    Apply to become a partner <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center h-11 px-6 rounded-lg border border-[#E5E7EB] text-sm font-semibold hover:border-[#6200FF]/40 transition-colors"
                  >
                    Talk to our team
                  </Link>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#E5E7EB] bg-[linear-gradient(135deg,#faf7ff_0%,#f7fbff_100%)] p-6 space-y-3">
                <p className="text-sm font-semibold text-[#6200ff] mb-4">What partners earn</p>
                {[
                  'Recurring monthly commission on every referral',
                  'One-time fee for platform installation & setup',
                  'Retainer revenue for ongoing client support',
                  'Priority support from Virtix AI for your clients',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white bg-white px-4 py-3 text-sm leading-6 text-[#0C0900]/76 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#6200FF] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue streams */}
          <div>
            <div className="text-center mb-8 space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">Revenue streams</p>
              <h2 className="text-3xl md:text-4xl font-bold">Four ways to earn as a partner</h2>
              <p className="text-base text-[#0C0900]/60 max-w-xl mx-auto leading-7">
                Whether you refer, deploy, or support — every touchpoint in the client journey is a revenue opportunity for you.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {revenueStreams.map((stream) => (
                <div
                  key={stream.title}
                  className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] flex flex-col gap-4"
                >
                  <div className={`w-10 h-10 rounded-2xl ${stream.bg} flex items-center justify-center`}>
                    <stream.icon size={20} className={stream.color} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{stream.title}</h3>
                    <p className="text-sm leading-7 text-[#0C0900]/70">{stream.description}</p>
                  </div>
                  <div className="mt-auto">
                    <span className="inline-block rounded-full bg-[#f4f0ff] text-[#6200FF] text-xs font-semibold px-3 py-1">
                      {stream.highlight}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Partner types */}
          <div className="grid gap-6 md:grid-cols-3">
            {partnerTypes.map((type) => (
              <div
                key={type.title}
                className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#6200FF]/8 flex items-center justify-center mb-4">
                  <type.icon size={20} className="text-[#6200FF]" />
                </div>
                <h3 className="text-xl font-bold mb-3">{type.title}</h3>
                <p className="text-sm leading-7 text-[#0C0900]/70">{type.description}</p>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] md:p-10">
            <div className="text-center mb-10 space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">How it works</p>
              <h2 className="text-3xl font-bold">Start earning in three steps</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.step} className="relative flex flex-col gap-4">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-5 left-[calc(100%+8px)] w-[calc(100%-16px)] h-px bg-[#E5E7EB]" />
                  )}
                  <div className="w-10 h-10 rounded-2xl bg-[#6200FF] text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-sm leading-7 text-[#0C0900]/70">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Perks grid */}
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] md:p-8 flex flex-col justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#6200ff] font-semibold">Partner benefits</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight">Everything you need to succeed with your clients</h2>
                <p className="mt-4 text-base leading-8 text-[#0C0900]/70">
                  We invest in your success because your clients' success is our success. Partners get dedicated
                  support, co-marketing assets, and a revenue structure designed for long-term growth.
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#6200FF] hover:underline"
              >
                Apply now <ArrowRight size={15} />
              </Link>
            </div>

            <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {perks.map((perk) => (
                  <div key={perk.label} className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-[#fafbff] px-4 py-3">
                    <div className="w-7 h-7 rounded-xl bg-[#6200FF]/8 flex items-center justify-center shrink-0 mt-0.5">
                      <perk.icon size={14} className="text-[#6200FF]" />
                    </div>
                    <span className="text-sm leading-6 text-[#0C0900]/80">{perk.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Final CTA banner */}
          <div className="relative overflow-hidden rounded-[32px] bg-[#000b41] px-6 py-12 md:px-12 md:py-14 text-white text-center">
            <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-[#6200FF]/40 blur-3xl" />
            <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-[#00d4ff]/30 blur-3xl" />
            <div className="relative space-y-5 max-w-2xl mx-auto">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60 font-semibold">Ready to get started?</p>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                Join the Virtix AI Partner Program today
              </h2>
              <p className="text-base text-white/75 leading-7">
                Fill in our short partner application and a member of our team will reach out within 2 business days
                to walk you through the next steps.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-lg bg-white text-[#0C0900] text-sm font-semibold hover:bg-white/90 transition-colors"
                >
                  Apply to become a partner <ArrowRight size={15} />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center h-11 px-7 rounded-lg border border-white/30 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Ask us a question
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      <CTA />
    </>
  );
}
