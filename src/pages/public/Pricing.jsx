import { useEffect, useState } from "react";
import CTA from "../../components/pages/home/CTA";
import HomePricing from "../../components/pages/home/Pricing";
import ComparePlans from "../../components/pages/pricing/ComparePlans";
import { GET_BILLING_PLANS } from "../../scripts/api";
import { getData } from "../../scripts/api-service";

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const res = await getData(GET_BILLING_PLANS, true);
        const list = Array.isArray(res) ? res : (res?.results || []);
        const publicPlans = list.filter(p => p.is_public);
        publicPlans.sort((a, b) => (a.id || 0) - (b.id || 0));
        setPlans(publicPlans);
      } catch (error) {
        console.error("[PricingPage] Failed to load plans", error);
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <section className="hero-section py-20">
      <HomePricing />
      <ComparePlans plans={plans} loading={plansLoading} />
      <CTA />
    </section>
  );
}
