import { useState } from 'react';
import { Button, Checkbox, Form, Input, Select, message } from 'antd';
import { ShoppingBag, Zap, Shield, HeadphonesIcon, BarChart3, MessageSquare } from 'lucide-react';
import { postData } from '../../scripts/api-service';
import { SHOPIFY_EARLY_ACCESS } from '../../scripts/api';

const { TextArea } = Input;

const MONTHLY_ORDER_OPTIONS = [
  { value: 'under_100', label: 'Under 100 orders/month' },
  { value: '100_500', label: '100 – 500 orders/month' },
  { value: '500_2000', label: '500 – 2,000 orders/month' },
  { value: '2000_plus', label: '2,000+ orders/month' },
];

const FEATURES = [
  { value: 'product_qa', label: 'Product Q&A' },
  { value: 'order_tracking', label: 'Order Tracking' },
  { value: 'abandoned_cart', label: 'Abandoned Cart Recovery' },
  { value: 'returns_refunds', label: 'Returns & Refunds' },
  { value: 'upsell', label: 'Upsell & Cross-sell' },
  { value: 'multilingual', label: 'Multilingual Support' },
];

const BENEFITS = [
  { icon: Zap, title: 'Instant AI Responses', desc: 'Answer product questions, order status, and FAQs 24/7 without human intervention.' },
  { icon: ShoppingBag, title: 'Shopify-Native', desc: 'Deep integration with your products, variants, orders, and customer data.' },
  { icon: BarChart3, title: 'Recover Lost Sales', desc: 'Re-engage abandoned carts and convert browsers into buyers automatically.' },
  { icon: HeadphonesIcon, title: 'Reduce Support Load', desc: 'Deflect repetitive tickets so your team focuses on complex issues only.' },
  { icon: Shield, title: 'Priority Onboarding', desc: 'Early access members get hands-on setup support and dedicated onboarding.' },
  { icon: MessageSquare, title: 'Shape the Product', desc: 'Influence our roadmap and get early access to every new feature.' },
];

export default function ShopifyEarlyAccess() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        full_name: values.full_name,
        email: values.email,
        store_name: values.store_name,
        store_url: values.store_url,
        monthly_orders: values.monthly_orders || '',
        current_support_tool: values.current_support_tool || '',
        main_problem: values.main_problem || '',
        interested_features: values.interested_features || [],
        phone: values.phone || '',
        consent: values.consent || false,
      };

      const res = await postData(SHOPIFY_EARLY_ACCESS, payload, true);

      if (res?.status >= 200 && res?.status < 300) {
        setSubmitted(true);
      } else if (res?.error) {
        const errors = res?.errors;
        if (errors) {
          const msgs = Object.entries(errors).map(([k, v]) =>
            `${k}: ${Array.isArray(v) ? v.join(', ') : v}`
          );
          message.error(msgs.join(' | '));
        } else {
          message.error('Submission failed. Please try again.');
        }
      } else {
        message.error('Submission failed. Please try again.');
      }
    } catch {
      message.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="hero-section pt-32 pb-20 md:pt-40">
        <div className="container">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#6200FF]/10">
              <ShoppingBag className="h-10 w-10 text-[#6200FF]" />
            </div>
            <h1 className="text-3xl font-semibold text-[#0C0900] md:text-4xl">
              You&apos;re on the list!
            </h1>
            <p className="mt-4 text-base leading-7 text-[#0C0900]/65 md:text-lg">
              Thanks for joining the Shopify Early Access waitlist. We&apos;ll reach out shortly with next steps and onboarding details.
            </p>
            <p className="mt-2 text-sm text-[#0C0900]/50">
              Keep an eye on your inbox — we&apos;ll be in touch soon.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="hero-section pt-32 pb-16 md:pt-40">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full border border-[#6200FF]/20 bg-[#6200FF]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#6200FF]">
              Shopify Early Access
            </span>
            <h1 className="mt-4 text-4xl font-semibold leading-[120%] text-[#0C0900] md:text-5xl">
              AI Sales & Support Agent Built for Shopify
            </h1>
            <p className="mt-5 text-base leading-7 text-[#0C0900]/65 md:text-lg">
              Join the waitlist and be among the first Shopify merchants to automate customer support, recover abandoned carts, and boost sales — all with a single AI agent.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="pb-16">
        <div className="container">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-[#e5e7eb] bg-[#faf8ff] p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#6200FF]/10">
                  <Icon className="h-5 w-5 text-[#6200FF]" />
                </div>
                <h3 className="text-sm font-semibold text-[#0C0900]">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#0C0900]/60">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="pb-24">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-[24px] border border-[#e5e7eb] bg-[#faf8ff] p-6 md:p-10">
              <h2 className="text-xl font-semibold text-[#0C0900] md:text-2xl">
                Request Early Access
              </h2>
              <p className="mt-2 text-sm text-[#0C0900]/60">
                Fill in the details below and we&apos;ll get back to you within 1–2 business days.
              </p>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="mt-7"
                requiredMark={false}
              >
                <div className="grid gap-x-5 sm:grid-cols-2">
                  <Form.Item
                    label="Full Name"
                    name="full_name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input placeholder="Jane Smith" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Enter a valid email' },
                    ]}
                  >
                    <Input placeholder="jane@mystore.com" size="large" />
                  </Form.Item>
                </div>

                <div className="grid gap-x-5 sm:grid-cols-2">
                  <Form.Item
                    label="Store Name"
                    name="store_name"
                    rules={[{ required: true, message: 'Please enter your store name' }]}
                  >
                    <Input placeholder="My Awesome Store" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Shopify Store URL"
                    name="store_url"
                    rules={[{ required: true, message: 'Please enter your store URL' }]}
                  >
                    <Input placeholder="mystore.myshopify.com" size="large" />
                  </Form.Item>
                </div>

                <div className="grid gap-x-5 sm:grid-cols-2">
                  <Form.Item label="Monthly Orders" name="monthly_orders">
                    <Select placeholder="Select range" size="large" options={MONTHLY_ORDER_OPTIONS} allowClear />
                  </Form.Item>

                  <Form.Item label="Phone (optional)" name="phone">
                    <Input placeholder="+1 555 000 0000" size="large" />
                  </Form.Item>
                </div>

                <Form.Item label="Current Support Tool" name="current_support_tool">
                  <Input placeholder="e.g. Gorgias, Freshdesk, email only..." size="large" />
                </Form.Item>

                <Form.Item label="What's your biggest customer support challenge?" name="main_problem">
                  <TextArea
                    placeholder="e.g. We get hundreds of 'where is my order?' questions every day..."
                    rows={3}
                    size="large"
                  />
                </Form.Item>

                <Form.Item label="Features you're most interested in" name="interested_features">
                  <Checkbox.Group className="grid grid-cols-2 gap-y-2">
                    {FEATURES.map(({ value, label }) => (
                      <Checkbox key={value} value={value} className="text-sm text-[#0C0900]/70">
                        {label}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                </Form.Item>

                <Form.Item
                  name="consent"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject('You must agree to be contacted'),
                    },
                  ]}
                >
                  <Checkbox className="text-sm text-[#0C0900]/70">
                    I agree to be contacted by the Virtix AI team about this early access request.
                  </Checkbox>
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  size="large"
                  className="w-full !rounded-full !bg-[#6200FF] !font-semibold hover:!bg-[#5000d6]"
                >
                  Join the Early Access Waitlist
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
