import AiDrives from '../../components/pages/home/AiDrives';
import AIGrowth from '../../components/pages/home/AIGrowth';
import BuildAgent from '../../components/pages/home/BuildAgent';
import CTA from '../../components/pages/home/CTA';
import CustomerInteractions from '../../components/pages/home/CustomerInteractions';
import ExploreAgents from '../../components/pages/home/ExploreAgents';
import ExplorePublic from '../../components/pages/home/ExplorePublic';
import Hero from '../../components/pages/home/Hero';
import Pricing from '../../components/pages/home/Pricing';

function Home() {
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
      <ExploreAgents />
      <ExplorePublic />
      <BuildAgent />
      <CustomerInteractions data={Interaction} />
      <AiDrives />
      <AIGrowth />
      <Pricing />
      <CTA />
    </>
  );
}

export default Home;