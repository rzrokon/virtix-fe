import ActionBlocks from '../../components/pages/home/ActionBlocks';
import CTA from '../../components/pages/home/CTA';
import ExploreAgents from '../../components/pages/home/ExploreAgents';
import ExplorePublic from '../../components/pages/home/ExplorePublic';
import Hero from '../../components/pages/home/Hero';
import HowItWorks from '../../components/pages/home/HowItWorks';
import Integrations from '../../components/pages/home/Integrations';
import Pricing from '../../components/pages/home/Pricing';
import ProblemSolution from '../../components/pages/home/ProblemSolution';

function Home() {
  return (
    <>
      <Hero />
      <ProblemSolution />
      <ExploreAgents />
      <ActionBlocks />
      <HowItWorks />
      <Integrations />
      <ExplorePublic />
      <Pricing />
      <CTA />
    </>
  );
}

export default Home;
