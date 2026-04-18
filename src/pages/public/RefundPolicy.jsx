const RefundPolicy = () => {
  return (
    <section className="bg-[#f8fafc] py-20">
      <div className="container max-w-5xl space-y-10 text-[#0C0900]">
        <div className="mt-15 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6200ff]">Refund policy</p>
            <h1 className="text-4xl font-bold leading-[120%] md:text-5xl">Refund Policy</h1>
            <p className="text-sm text-[#0C0900]/70">Last Updated: Apr 18, 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-base leading-[165%]">
          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:p-8">
            <h2 className="text-2xl font-bold">1. Overview</h2>
            <p>
              This Refund Policy explains how refunds, cancellations, and billing adjustments are handled for Virtix AI
              subscriptions and related services.
            </p>
            <p>By purchasing a paid plan, you agree to this Refund Policy.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:p-8">
            <h2 className="text-2xl font-bold">2. Subscription Charges</h2>
            <p>Virtix AI offers recurring subscription plans billed on a monthly or annual basis.</p>
            <ul className="list-disc pl-6">
              <li>Charges are billed in advance for the selected billing period.</li>
              <li>Your plan renews automatically unless canceled before the next billing date.</li>
              <li>You are responsible for reviewing your selected plan before purchase.</li>
            </ul>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:p-8">
            <h2 className="text-2xl font-bold">3. Refund Eligibility</h2>
            <p>Refunds are considered only in limited circumstances.</p>
            <ul className="list-disc pl-6">
              <li>Duplicate charges caused by billing error.</li>
              <li>Incorrect plan charges due to a verifiable system issue.</li>
              <li>Failure to deliver paid service caused solely by Virtix AI platform malfunction.</li>
            </ul>
            <p>Refund requests for change of mind, partial usage, or unused time in an active billing cycle are generally not eligible.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:p-8">
            <h2 className="text-2xl font-bold">4. Non-Refundable Items</h2>
            <ul className="list-disc pl-6">
              <li>Completed subscription periods already delivered.</li>
              <li>Partial months or partial annual terms after service access has been provided.</li>
              <li>Custom onboarding, implementation, consulting, or setup work unless otherwise agreed in writing.</li>
              <li>Fees related to third-party services, integrations, payment processors, or taxes.</li>
            </ul>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:p-8">
            <h2 className="text-2xl font-bold">5. Cancellation Policy</h2>
            <p>You may cancel your subscription at any time before your next renewal date.</p>
            <ul className="list-disc pl-6">
              <li>Your cancellation stops future renewals.</li>
              <li>Your access may continue until the end of the current paid billing period.</li>
              <li>Canceling a subscription does not automatically create a refund.</li>
            </ul>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:p-8">
            <h2 className="text-2xl font-bold">6. How to Request a Refund</h2>
            <p>To request a refund, contact our support team with the following information:</p>
            <ul className="list-disc pl-6">
              <li>Your account email address</li>
              <li>Invoice or payment reference</li>
              <li>A short explanation of the issue</li>
            </ul>
            <p>Email refund requests to: info@virtixai.com</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:p-8">
            <h2 className="text-2xl font-bold">7. Review Timeline</h2>
            <p>We aim to review eligible refund requests within 7 business days of receiving complete details.</p>
            <p>If approved, refunds are processed back to the original payment method, subject to payment provider timelines.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:p-8">
            <h2 className="text-2xl font-bold">8. Chargebacks</h2>
            <p>
              If you believe a charge is incorrect, please contact us before initiating a chargeback so we can review
              and try to resolve the issue directly.
            </p>
            <p>Improper or fraudulent chargebacks may result in account suspension or termination.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:p-8">
            <h2 className="text-2xl font-bold">9. Policy Updates</h2>
            <p>We may update this Refund Policy from time to time. Updates will be posted on this page with a revised date.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:p-8">
            <h2 className="text-2xl font-bold">10. Contact Information</h2>
            <p>If you have questions about billing or refunds, contact us at:</p>
            <p>Email: info@virtixai.com</p>
            <p>Company: Virtix AI</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RefundPolicy;
