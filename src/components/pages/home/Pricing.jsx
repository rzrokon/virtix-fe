import { Button, message } from 'antd';
import Cookies from 'js-cookie';
import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GET_BILLING_PLANS, START_SUBSCRIPTION } from '../../../scripts/api';
import { getData, postData } from '../../../scripts/api-service';

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(null);
  const navigate = useNavigate();

  // Fetch billing plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await getData(GET_BILLING_PLANS);
        setPlans(response.results || response);
      } catch (error) {
        console.error('Error fetching billing plans:', error);
        setError('Failed to load pricing plans');
        // Fallback to default plans if API fails
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Format price for display
  const formatPrice = (priceUsd) => {
    const price = parseFloat(priceUsd);
    return `$${price}`;
  };

  // Format number with commas
  const formatNumber = (num) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  // Format bytes to readable format
  const formatBytes = (bytes) => {
    if (bytes >= 1000000000000) return `${(bytes / 1000000000000).toFixed(1)}TB`;
    if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(1)}GB`;
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)}MB`;
    return `${(bytes / 1000).toFixed(0)}KB`;
  };

  // Get features list for each plan
  const getPlanFeatures = (plan) => {
    const features = [
      `Up to ${formatNumber(plan.max_agents)} agent${plan.max_agents > 1 ? 's' : ''}`,
      `${formatNumber(plan.max_files)} files`,
      `${formatNumber(plan.max_messages_per_month)} messages/month`,
      `${formatBytes(plan.max_storage_bytes)} storage`,
      `${formatBytes(plan.max_index_bytes)} index capacity`,
    ];

    // Add feature-based items
    const featureItems = [
      { key: 'lead_gen', label: 'Lead Generation' },
      { key: 'booking', label: 'Booking System' },
      { key: 'complaints', label: 'Complaints Management' },
      { key: 'products_orders', label: 'Products & Orders' },
      { key: 'offers', label: 'Special Offers' },
    ];

    featureItems.forEach(item => {
      features.push({
        text: item.label,
        included: plan[item.key]
      });
    });

    return features;
  };

  // Determine if plan is popular (Business plan)
  const isPopular = (plan) => plan.code === 'business';



  // Handle plan selection with authentication check
  const handlePlanSelection = async (plan) => {
    const token = Cookies.get('kotha_token');

    // Check if user is authenticated
    if (!token) {
      // Redirect to login page for unauthenticated users
      navigate('/signin');
      return;
    }

    // For contact sales plans, handle differently
    if (plan.contact_sales_only) {
      // You can add contact sales logic here
      message.info('Please contact our sales team for enterprise plans.');
      return;
    }

    // For paid plans, call the subscription API
    try {
      setSubscriptionLoading(plan.id);

      const response = await postData(START_SUBSCRIPTION, {
        plan_code: plan.code
      });

      if (response) {
        message.success(`Successfully subscribed to ${plan.name} plan!`);
        // You might want to redirect to dashboard or payment confirmation
        navigate('/');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      message.error('Failed to start subscription. Please try again.');
    } finally {
      setSubscriptionLoading(null);
    }
  };

  if (loading) {
    return (
      <section className="pricing py-20">
        <div className="container growth-content flex flex-col items-center justify-center gap-8">
          <div className="md:w-3xl space-y-4">
            <h2 className="text-6xl leading-[120%] text-[#0C0900] font-bold text-center">Predictable pricing scalable plans</h2>
            <p className="font-normal text-base leading-[140%] text-[#0C0900] text-center">
              Loading pricing plans...
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="rounded-[20px] p-6 bg-gray-200 animate-pulse">
                <div className="space-y-2">
                  <div className="h-6 bg-gray-300 rounded"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
                <div className="mt-6 space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pricing py-20">
        <div className="container growth-content flex flex-col items-center justify-center gap-8">
          <div className="md:w-3xl space-y-4">
            <h2 className="text-6xl leading-[120%] text-[#0C0900] font-bold text-center">Predictable pricing scalable plans</h2>
            <p className="font-normal text-base leading-[140%] text-red-600 text-center">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pricing py-20">
      <div className="container growth-content flex flex-col items-center justify-center gap-8">
        <div className="md:w-3xl space-y-4">
          <h2 className="text-6xl leading-[120%] text-[#0C0900] font-bold text-center">Predictable pricing scalable plans</h2>
          <p className="font-normal text-base leading-[140%] text-[#0C0900] text-center">
            Designed for every stage of your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {plans.map((plan, index) => (
            <div
              key={plan.id || index}
              className={`relative rounded-[20px] p-8 transition-all duration-300 hover:shadow-lg ${isPopular(plan)
                ? 'bg-[#F4EDFF] border-2 border-[#6200FF] transform scale-105'
                : 'bg-[linear-gradient(172.42deg,#FFFFFF_4.56%,#E7D7FF_50.03%,#FFFFFF_95.51%)] border border-[#ECECEC]'
                }`}
            >
              <div className="space-y-6">
                {/* Plan Header */}
                <div className="space-y-2">
                  <h3 className="text-2xl leading-[140%] text-[#0C0900] font-bold">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="text-4xl leading-[140%] text-[#0C0900] font-bold">
                      {formatPrice(plan.price_usd)}
                    </span>
                    <p className="text-lg text-gray-600 ml-1">/month</p>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  type={isPopular(plan) ? "primary" : ''}
                  size="large"
                  loading={subscriptionLoading === plan.id}
                  onClick={() => handlePlanSelection(plan)}
                  className={`w-full h-12 font-semibold ${isPopular(plan)
                    ? 'bg-[#6200FF] border-[#6200FF] hover:bg-[#5000CC]'
                    : ''
                    }`}
                >
                  {subscriptionLoading === plan.id ? 'Processing...' : 'Get started'}
                </Button>

                {/* Features List */}
                <div className="plan-features space-y-3">
                  <h4 className="font-semibold text-[#0C0900] text-lg mb-4">What's included:</h4>
                  {getPlanFeatures(plan).map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      {typeof feature === 'string' ? (
                        <>
                          <Check size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-[#0C0900] text-sm leading-relaxed">{feature}</span>
                        </>
                      ) : (
                        <>
                          {feature.included ? (
                            <Check size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <X size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={`text-sm leading-relaxed ${feature.included ? 'text-[#0C0900]' : 'text-gray-400'
                            }`}>
                            {feature.text}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;