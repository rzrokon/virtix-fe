const PrivacyPolicy = () => {
  return (
    <section className="py-20 bg-[#f8fafc]">
      <div className="container max-w-5xl space-y-10 text-[#0C0900]">

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)] mt-15">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[#6200ff] font-semibold">Privacy policy</p>
            <h1 className="text-4xl md:text-5xl leading-[120%] font-bold">Privacy Policy</h1>
            <p className="text-sm text-[#0C0900]/70">Last Updated: Feb 19, 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-base leading-[165%]">
          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-bold">1. Introduction</h2>
            <p>
              Virtix AI ("we", "our", "us") provides AI-powered conversational automation services for businesses.
              This Privacy Policy explains how we collect, use, store, and protect information when you use our website
              and platform.
            </p>
            <p>By using Virtix AI, you agree to this Privacy Policy.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-bold">2. Information We Collect</h2>
            <p>We collect the following types of information:</p>

            <div className="space-y-4">
              <div>
                <p className="font-semibold">A. Account Information</p>
                <p>When you register for an account:</p>
                <ul className="list-disc pl-6">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Company name</li>
                  <li>Billing information</li>
                  <li>Login credentials</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold">B. Business Data</p>
                <p>When you use the platform:</p>
                <ul className="list-disc pl-6">
                  <li>Uploaded documents</li>
                  <li>Product catalogs</li>
                  <li>FAQs and knowledge base content</li>
                  <li>Store data (if connected to WooCommerce or Shopify)</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold">C. Conversation Data</p>
                <p>We process conversations between your business and your customers, including:</p>
                <ul className="list-disc pl-6">
                  <li>Messages</li>
                  <li>Customer inputs</li>
                  <li>Interaction metadata</li>
                  <li>Chat transcripts</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold">D. Technical Data</p>
                <ul className="list-disc pl-6">
                  <li>IP address</li>
                  <li>Browser type</li>
                  <li>Device information</li>
                  <li>Usage analytics</li>
                  <li>Cookies</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-bold">3. How We Use Information</h2>
            <p>We use information to:</p>
            <ul className="list-disc pl-6">
              <li>Provide and improve our services</li>
              <li>Enable AI-powered responses</li>
              <li>Sync store data (WooCommerce / Shopify integrations)</li>
              <li>Monitor performance and usage</li>
              <li>Ensure platform security</li>
              <li>Provide customer support</li>
              <li>Process billing</li>
            </ul>
            <p>We do not sell your data.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-bold">4. Data Ownership</h2>
            <p>You retain ownership of:</p>
            <ul className="list-disc pl-6">
              <li>Your business content</li>
              <li>Uploaded documents</li>
              <li>Conversation data</li>
              <li>Store data</li>
            </ul>
            <p>Virtix AI processes this data solely to provide the service.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-bold">5. AI Processing</h2>
            <p>Your data may be processed by AI models to:</p>
            <ul className="list-disc pl-6">
              <li>Generate responses</li>
              <li>Improve conversational accuracy</li>
              <li>Analyze interaction patterns</li>
            </ul>
            <p>We do not use your private business data to train public AI models.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-bold">6. Data Storage &amp; Security</h2>
            <p>We implement reasonable administrative, technical, and physical safeguards to protect your data, including:</p>
            <ul className="list-disc pl-6">
              <li>Encrypted transmission (HTTPS)</li>
              <li>Access controls</li>
              <li>Role-based permissions</li>
              <li>Audit logging (Enterprise tier)</li>
            </ul>
            <p>However, no system is 100% secure.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-bold">7. Third-Party Integrations</h2>
            <p>If you connect third-party services (such as WooCommerce or Shopify):</p>
            <ul className="list-disc pl-6">
              <li>We access only necessary data to provide functionality.</li>
              <li>We do not store unnecessary credentials.</li>
              <li>Data is processed according to this Privacy Policy.</li>
            </ul>
            <p>Each third-party service has its own privacy policies.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-bold">8. Data Retention</h2>
            <p>We retain data:</p>
            <ul className="list-disc pl-6">
              <li>For as long as your account is active</li>
              <li>As required for legal and operational purposes</li>
              <li>Until you request deletion</li>
            </ul>
            <p>You may request deletion of your data at any time.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-bold">9. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6">
              <li>Access your data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion</li>
              <li>Withdraw consent</li>
              <li>Request data export</li>
            </ul>
            <p>Contact us at: info@virtixai.com</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-bold">10. Cookies</h2>
            <p>We use cookies to:</p>
            <ul className="list-disc pl-6">
              <li>Maintain login sessions</li>
              <li>Improve performance</li>
              <li>Analyze usage</li>
            </ul>
            <p>You may disable cookies in your browser settings.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-bold">11. Children's Privacy</h2>
            <p>Virtix AI is not intended for children under 13.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-bold">12. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Changes will be posted on this page with a revised date.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-bold">13. Contact Us</h2>
            <p>If you have questions about this Privacy Policy:</p>
            <p>Email: info@virtixai.com</p>
            <p>Company: Virtix AI</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
