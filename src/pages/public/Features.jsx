import CustomerInteractionsRevarce from "../../components/pages/feature/CustomerInteractionsRevarse";
import Hero from "../../components/pages/feature/Hero";
import CTA from "../../components/pages/home/CTA";
import CustomerInteractions from "../../components/pages/home/CustomerInteractions";

export default function Features() {
  const Interaction = {
    title: 'Product guidance made effortless — built for sales',
    description: 'Understand customer needs, compare options instantly, recommend the right SKUs, and add to cart — all in one flow.',
    image: '/assets/images/Home/image-6.png',
    features: [
      "Personalized recommendations for every user",
      "Smart comparison of product specs and prices",
      "Seamless escalation with full chat transcripts.",
    ]
  }

  const Interaction2 = {
    title: 'Support & Sales Automation — built for conversion',
    description: 'Instantly guide buyers with smart pricing, bundles, and ethical upsells — all while keeping the chat flow natural and helpful.',
    image: '/assets/images/Home/image-7.png',
    features: [
      "Explain complex tiers and offers clearly",
      "Compute bundles and apply coupons in real time",
      "Suggest upgrades that feel personal, not pushy",
    ]
  }

  const Interaction3 = {
    title: 'Marketing & Promotions — drive engagement effortlessly',
    description: 'Launch campaigns, verify eligibility, and spark urgency — all within a seamless conversational flow.',
    image: '/assets/images/Home/image-8.png',
    features: [
      "Announce offers and limited-time deals instantly",
      "Check customer eligibility in real time",
      "Encourage action with dynamic, personalized prompts",
    ]
  }

  const Interaction4 = {
    title: 'Appointments & Complaints streamlined from start to resolution',
    description: 'Automate scheduling, reminders, and issue handling — so customers get faster service and your team stays focused.',
    image: '/assets/images/Home/image-9.png',
    features: [
      "Check availability and confirm bookings instantly",
      "Send reminders and handle reschedules with ease",
      "Collect complaint details, attachments, and issue SLAs automatically",
    ]
  }

  const Interaction5 = {
    title: 'Knowledge, Insights & Security — built for trust and clarity',
    description: 'Empower every interaction with verified knowledge, actionable analytics, and enterprise-grade security.',
    image: '/assets/images/Home/image-10.png',
    features: [
      "Provide accurate answers from your indexed documentation",
      "Track CSAT, drop-offs, and revenue impact in real time",
      "Stay compliant with RBAC, audit logs, and data residency options",
    ]
  }


  return (
    <>
      <Hero />
      <CustomerInteractions data={Interaction} />
      <CustomerInteractionsRevarce data={Interaction2} />
      <CustomerInteractions data={Interaction3} />
      <CustomerInteractionsRevarce data={Interaction4} />
      <CustomerInteractions data={Interaction5} />
      {/* <Pricing /> */}
      <CTA />
    </>
  )
}