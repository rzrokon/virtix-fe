import CTA from "../../components/pages/home/CTA";
import CustomerInteractions from "../../components/pages/home/CustomerInteractions";
import ComparePlans from "../../components/pages/pricing/ComparePlans";
import Hero from "../../components/pages/pricing/Hero";

export default function Pricing() {
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
  }

  return (
    <>
      <Hero />
      <ComparePlans />
      <CustomerInteractions data={Interaction} />
      <CTA />
    </>
  )
}
