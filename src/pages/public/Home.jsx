import AiDrives from '../../components/pages/home/AiDrives';
import AIGrowth from '../../components/pages/home/AIGrowth';
import BuildAgent from '../../components/pages/home/BuildAgent';
import CTA from '../../components/pages/home/CTA';
import CustomerInteractions from '../../components/pages/home/CustomerInteractions';
import ExploreAgents from '../../components/pages/home/ExploreAgents';
import ExplorePublic from '../../components/pages/home/ExplorePublic';
import ActionBlocks from '../../components/pages/home/ActionBlocks';
import Differentiation from '../../components/pages/home/Differentiation';
import Hero from '../../components/pages/home/Hero';
import ProblemSolution from '../../components/pages/home/ProblemSolution';
import Pricing from '../../components/pages/home/Pricing';

function Home() {
  const Interaction = {
    title: 'AI-powered customer interactions — 24/7',
    description:
      'Virtix AI helps your business respond instantly, take action automatically, and scale conversations without increasing support headcount.',
    image: '/assets/images/Home/customer-interaction.png',
    features: [
      '24/7 instant replies that never miss a customer.',
      'Accurate answers grounded in your own business data.',
      'Automatic lead capture, bookings, and complaint logging.',
      'Seamless human escalation with full conversation context.',
      'Handles traffic spikes, campaigns, and launches effortlessly.'
    ]
  };

  return (
    <>
      <Hero />
      <ProblemSolution />
      <ExploreAgents />
      <ActionBlocks />
      <Differentiation />
      <ExplorePublic />
      {/* <BuildAgent /> */}
      {/* <CustomerInteractions data={Interaction} /> */}
      {/* <AiDrives /> */}
      {/* <AIGrowth /> */}
      <Pricing />
      <CTA />
    </>
  );
}

export default Home;
