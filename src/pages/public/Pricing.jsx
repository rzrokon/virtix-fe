import { useEffect, useState } from "react";
import CTA from "../../components/pages/home/CTA";
import CustomerInteractions from "../../components/pages/home/CustomerInteractions";
import ComparePlans from "../../components/pages/pricing/ComparePlans";
import Hero from "../../components/pages/pricing/Hero";

import { getData } from "../../scripts/api-service";
import { GET_BILLING_PLANS } from "../../scripts/api";

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const Interaction = {
    title: 'AI-powered customer interactions 24/7 — free to start',
    description: 'Instantly boost agent productivity, ensure accurate and consistent answers, automate routine daily tasks, and empower your team to focus on what matters most.',
    image: '/assets/images/Home/image-4.png',
    features: [
      "24/7 Instant replies and actions with zero wait.",
      "Accurate answers powered by your indexed data.",
      "Seamless escalation with full chat transcripts.",
      "Scales instantly to handle traffic spikes and launches."
    ]
  };

  useEffect(() => {
    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        // ✅ public endpoint → no_token = true
        const res = await getData(GET_BILLING_PLANS, true);
        const list = Array.isArray(res) ? res : (res?.results || []);

        const publicPlans = list.filter(p => p.is_public);
        publicPlans.sort((a, b) => (a.id || 0) - (b.id || 0));

        setPlans(publicPlans);
      } catch (e) {
        console.error("[PricingPage] Failed to load plans", e);
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <>
      <Hero plans={plans} loading={plansLoading} />
      <ComparePlans plans={plans} loading={plansLoading} />
      <CustomerInteractions data={Interaction} />
      <CTA />
    </>
  );
}