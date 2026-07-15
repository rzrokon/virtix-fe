const PrivacyPolicy = () => {
  const lastUpdated = "July 15, 2026";

  return (
    <section className="bg-[#f8fafc] py-20">
      <div className="container max-w-5xl space-y-10 text-[#0C0900]">
        <div className="mt-15 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6200ff]">
              Privacy policy
            </p>

            <h1 className="text-4xl font-bold leading-[120%] md:text-5xl">
              Privacy Policy
            </h1>

            <p className="text-sm text-[#0C0900]/70">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </div>

        <div className="space-y-6 text-base leading-[165%]">
          <PolicySection title="1. Introduction">
            <p>
              Virtix AI (&quot;Virtix AI&quot;, &quot;we&quot;,
              &quot;our&quot;, or &quot;us&quot;) provides AI-powered
              conversational automation, customer-support, product
              recommendation, shopping-assistance, and order-status services
              for businesses.
            </p>

            <p>
              This Privacy Policy explains how we collect, use, disclose,
              retain, and protect personal information when merchants,
              authorized users, website visitors, and merchants&apos; customers
              use the Virtix AI website, application, storefront chat widget,
              APIs, and integrations, including our Shopify application.
            </p>

            <p>
              When a business uses Virtix AI to communicate with its customers,
              that business generally determines why customer information is
              processed. In that context, the business is generally the data
              controller or business, and Virtix AI acts as its service provider
              or data processor, subject to applicable law and our agreement
              with the business.
            </p>

            <p>
              By using Virtix AI, you acknowledge the practices described in
              this Privacy Policy. Where consent is required by law, we process
              information on the basis of that consent.
            </p>
          </PolicySection>

          <PolicySection title="2. Scope of This Policy">
            <p>This Privacy Policy applies to information processed through:</p>

            <ul className="list-disc space-y-1 pl-6">
              <li>The Virtix AI website and account dashboard</li>
              <li>Virtix AI conversational agents and chat widgets</li>
              <li>Shopify, WooCommerce, and website integrations</li>
              <li>Product recommendation and shopping-assistance features</li>
              <li>Cart, checkout-link, and order-status assistance</li>
              <li>Customer support and business communications</li>
            </ul>

            <p>
              This policy does not replace the privacy policy of a merchant
              using Virtix AI. Customers should also review the privacy policy
              of the merchant with whom they are interacting.
            </p>
          </PolicySection>

          <PolicySection title="3. Information We Collect">
            <p>
              We collect and process information that is necessary to operate,
              secure, and improve Virtix AI.
            </p>

            <div className="space-y-5">
              <PolicySubsection title="A. Merchant and Account Information">
                <p>
                  When a merchant or authorized user creates or manages an
                  account, we may collect:
                </p>

                <ul className="list-disc space-y-1 pl-6">
                  <li>Name</li>
                  <li>Business email address</li>
                  <li>Company or store name</li>
                  <li>Account identifiers</li>
                  <li>Authentication and login information</li>
                  <li>Subscription and billing-plan information</li>
                  <li>Support communications</li>
                  <li>Team roles and account permissions</li>
                </ul>

                <p>
                  Payment information may be processed by Shopify or another
                  authorized payment provider. Virtix AI does not directly
                  collect or store full payment-card numbers.
                </p>
              </PolicySubsection>

              <PolicySubsection title="B. Business and Knowledge Data">
                <p>
                  Merchants may provide or synchronize information such as:
                </p>

                <ul className="list-disc space-y-1 pl-6">
                  <li>Uploaded documents and files</li>
                  <li>FAQs and knowledge-base content</li>
                  <li>Website content</li>
                  <li>Business policies and support information</li>
                  <li>Product catalogs and product descriptions</li>
                  <li>Product images, variants, prices, and availability</li>
                  <li>Store configuration and integration settings</li>
                </ul>
              </PolicySubsection>

              <PolicySubsection title="C. Shopify Merchant and Store Data">
                <p>
                  When a merchant installs or connects the Virtix AI Shopify
                  app, we may receive and process:
                </p>

                <ul className="list-disc space-y-1 pl-6">
                  <li>Shop domain and Shopify store identifiers</li>
                  <li>Shopify installation and authorization information</li>
                  <li>App access credentials and access-token metadata</li>
                  <li>Products, variants, prices, images, and collections</li>
                  <li>Inventory and product-availability information</li>
                  <li>App installation, disconnection, and uninstall events</li>
                  <li>Synchronization status and integration error records</li>
                </ul>

                <p>
                  We request only the Shopify API permissions reasonably
                  necessary to provide the enabled Virtix AI functionality.
                </p>
              </PolicySubsection>

              <PolicySubsection title="D. Shopify Order and Customer Information">
                <p>
                  When a merchant enables order-status assistance, Virtix AI may
                  process limited Shopify order and customer information,
                  including:
                </p>

                <ul className="list-disc space-y-1 pl-6">
                  <li>Order number or order identifier</li>
                  <li>
                    Customer email address used for order-ownership verification
                  </li>
                  <li>Order creation date</li>
                  <li>Order, payment, and fulfillment status</li>
                  <li>Shipping or tracking status and tracking links</li>
                  <li>Identifiers needed to associate the order with the store</li>
                </ul>

                <p>
                  Virtix AI uses the customer-provided order number together
                  with the checkout email address to verify ownership before
                  displaying limited order-status information. We do not use
                  order information to advertise to customers, sell customer
                  data, make credit decisions, or modify, cancel, refund, or
                  fulfill orders.
                </p>

                <p>
                  We do not intentionally display full billing addresses,
                  shipping addresses, payment-card details, internal merchant
                  notes, or unrelated customer orders through the chat
                  assistant.
                </p>
              </PolicySubsection>

              <PolicySubsection title="E. Conversation and Customer Input Data">
                <p>
                  When a customer or user communicates through a Virtix AI
                  assistant, we may process:
                </p>

                <ul className="list-disc space-y-1 pl-6">
                  <li>Messages and questions</li>
                  <li>Chat transcripts</li>
                  <li>Product preferences and shopping requests</li>
                  <li>Order verification information voluntarily provided</li>
                  <li>Conversation timestamps and session identifiers</li>
                  <li>Agent responses and interaction outcomes</li>
                </ul>

                <p>
                  Customers should not submit sensitive personal information,
                  passwords, full payment-card details, government identifiers,
                  health information, or other information that is unnecessary
                  for the requested service.
                </p>
              </PolicySubsection>

              <PolicySubsection title="F. Technical, Device, and Usage Data">
                <p>We may automatically collect:</p>

                <ul className="list-disc space-y-1 pl-6">
                  <li>IP address</li>
                  <li>Browser and device type</li>
                  <li>Operating system</li>
                  <li>Approximate location derived from IP address</li>
                  <li>Pages and features used</li>
                  <li>Request timestamps and diagnostic information</li>
                  <li>Error, performance, and security logs</li>
                  <li>Cookie and session information</li>
                </ul>
              </PolicySubsection>
            </div>
          </PolicySection>

          <PolicySection title="4. How We Receive Information">
            <p>We may receive information:</p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Directly from merchants and authorized users</li>
              <li>From customers interacting with a merchant&apos;s AI agent</li>
              <li>
                From Shopify, WooCommerce, or another service connected by the
                merchant
              </li>
              <li>
                Automatically through cookies, server logs, APIs, and similar
                technologies
              </li>
              <li>
                From service providers that help us operate and secure the
                platform
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="5. How We Use Information">
            <p>We use information to:</p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Create, authenticate, and manage Virtix AI accounts</li>
              <li>Provide conversational customer-support services</li>
              <li>Generate store-specific AI responses</li>
              <li>Synchronize products, variants, prices, and inventory</li>
              <li>Provide relevant product recommendations</li>
              <li>Create Shopify cart and checkout links when requested</li>
              <li>
                Verify order ownership and provide limited order-status
                information
              </li>
              <li>Manage integrations and app installation lifecycle events</li>
              <li>Enforce plan limits and provide subscription services</li>
              <li>Respond to support requests</li>
              <li>Detect fraud, abuse, security threats, and service errors</li>
              <li>Monitor reliability and improve platform functionality</li>
              <li>Comply with legal and privacy obligations</li>
              <li>Establish, exercise, or defend legal claims</li>
            </ul>

            <p>
              We do not sell personal information. We do not use Shopify
              merchant or customer data for independent advertising or for
              training publicly available general-purpose AI models.
            </p>
          </PolicySection>

          <PolicySection title="6. Legal Bases for Processing">
            <p>
              Where applicable data-protection law requires a legal basis, we
              process personal information based on one or more of the
              following:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>
                Performance of a contract, such as providing the Virtix AI
                service
              </li>
              <li>
                Legitimate interests, such as maintaining security, preventing
                abuse, and improving reliability
              </li>
              <li>Compliance with legal obligations</li>
              <li>Consent, where consent is required</li>
              <li>
                Instructions from a merchant acting as the relevant data
                controller or business
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="7. AI Processing">
            <p>
              Virtix AI may send relevant portions of prompts, business
              knowledge, product information, and conversation context to AI
              service providers to generate requested responses.
            </p>

            <p>AI processing may be used to:</p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Answer customer questions</li>
              <li>Recommend relevant products</li>
              <li>Interpret shopping intent</li>
              <li>Summarize or retrieve business information</li>
              <li>Assist with customer-service workflows</li>
            </ul>

            <p>
              We seek to minimize the information sent for each request. Order
              and customer information is not intentionally included in an AI
              prompt unless it is necessary to complete a customer-requested
              support action.
            </p>

            <p>
              Virtix AI does not use private merchant data or protected Shopify
              customer data to train publicly available general-purpose AI
              models.
            </p>

            <p>
              AI-generated responses may be inaccurate. Merchants are
              responsible for configuring their agents and reviewing material
              business information provided through the service.
            </p>
          </PolicySection>

          <PolicySection title="8. Shopify-Specific Data Practices">
            <PolicySubsection title="A. Product Recommendations">
              <p>
                We process synchronized product, variant, pricing, image, and
                inventory information to answer product questions and recommend
                products available from the connected merchant.
              </p>
            </PolicySubsection>

            <PolicySubsection title="B. Cart and Checkout Assistance">
              <p>
                When a customer chooses a product, Virtix AI may use Shopify
                storefront services to create a cart and generate a Shopify
                checkout URL. Payment and checkout are completed through
                Shopify or the merchant&apos;s authorized checkout environment.
                Virtix AI does not collect full payment-card information.
              </p>
            </PolicySubsection>

            <PolicySubsection title="C. Order-Status Assistance">
              <p>
                Virtix AI uses read-only order access to locate an order after a
                customer submits an order number. Before disclosing status
                information, Virtix AI requires the customer to provide the
                corresponding checkout email address.
              </p>

              <p>
                When verification succeeds, Virtix AI returns only limited
                order, payment, fulfillment, and tracking information. If
                verification fails, Virtix AI does not disclose whether the
                supplied order or email address is valid.
              </p>
            </PolicySubsection>

            <PolicySubsection title="D. Installation and Uninstallation">
              <p>
                We process the shop domain, installation status, access token,
                and related integration configuration while the Shopify app is
                installed or connected.
              </p>

              <p>
                When the app is disconnected or Shopify notifies us that it has
                been uninstalled, we deactivate the integration, stop future
                synchronization and order lookups, and remove or invalidate the
                Shopify access credential from active use.
              </p>
            </PolicySubsection>

            <PolicySubsection title="E. Shopify Privacy Requests">
              <p>
                We respond to Shopify&apos;s mandatory privacy requests,
                including customer data-access requests, customer redaction
                requests, and shop redaction requests.
              </p>

              <p>
                Following a valid request, we locate, export, delete, or
                anonymize applicable personal information as required by
                Shopify&apos;s instructions, applicable law, and any legally
                permitted retention obligation.
              </p>
            </PolicySubsection>
          </PolicySection>

          <PolicySection title="9. How We Share Information">
            <p>
              We may share information only as reasonably necessary with:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>
                The merchant or organization that configured the relevant
                Virtix AI agent
              </li>
              <li>
                Shopify, WooCommerce, or another connected platform as needed to
                perform a merchant-requested integration
              </li>
              <li>
                Cloud hosting, database, storage, monitoring, and security
                providers
              </li>
              <li>
                AI and machine-learning service providers used to generate
                requested responses
              </li>
              <li>
                Email, customer-support, analytics, and billing providers
              </li>
              <li>
                Professional advisers, auditors, insurers, or legal authorities
                where legally required
              </li>
              <li>
                A successor entity in connection with a merger, acquisition,
                financing, restructuring, or sale of business assets
              </li>
            </ul>

            <p>
              Service providers may process information only for the services
              they provide to us and are subject to applicable contractual and
              confidentiality obligations.
            </p>

            <p>
              We do not sell personal information or permit service providers to
              use Shopify customer data for their own advertising purposes.
            </p>
          </PolicySection>

          <PolicySection title="10. Data Ownership and Merchant Responsibilities">
            <p>
              As between Virtix AI and the merchant, the merchant retains its
              rights in:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Business content</li>
              <li>Uploaded documents</li>
              <li>Product and store data</li>
              <li>Customer and conversation data</li>
              <li>Agent configuration and knowledge-base content</li>
            </ul>

            <p>
              Virtix AI processes this information to provide the service,
              comply with merchant instructions, secure the platform, and meet
              legal obligations.
            </p>

            <p>
              Merchants are responsible for providing appropriate notices to
              their customers, identifying Virtix AI or AI-assisted chat where
              required, obtaining any required consent, and ensuring that their
              configuration and use of Virtix AI complies with applicable law.
            </p>
          </PolicySection>

          <PolicySection title="11. Data Retention">
            <p>
              We retain personal information only for as long as reasonably
              necessary for the purpose for which it was collected, to provide
              the service, to meet contractual requirements, or to comply with
              legal obligations.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="px-3 py-3 font-semibold">Data category</th>
                    <th className="px-3 py-3 font-semibold">
                      General retention approach
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <RetentionRow
                    category="Shopify access credentials"
                    retention="Retained while the integration is active. Removed from active use after disconnection or uninstall and deleted or anonymized in accordance with applicable Shopify privacy requests."
                  />

                  <RetentionRow
                    category="Order lookup responses"
                    retention="Processed temporarily to complete the customer-requested lookup. Full Shopify order responses are not intentionally retained as permanent customer profiles."
                  />

                  <RetentionRow
                    category="Order verification input"
                    retention="Used to complete the requested verification and retained only where necessary for security, troubleshooting, or an applicable merchant-configured conversation-retention period."
                  />

                  <RetentionRow
                    category="Conversation data"
                    retention="Retained while needed to provide the service and according to the merchant's account settings, plan, instructions, and applicable legal obligations."
                  />

                  <RetentionRow
                    category="Synced Shopify product data"
                    retention="Retained while the Shopify integration is active and removed or anonymized after uninstall, account deletion, or a valid shop-redaction request, subject to lawful exceptions."
                  />

                  <RetentionRow
                    category="Account and subscription records"
                    retention="Retained while the account is active and for a limited period afterward where necessary for billing, fraud prevention, taxation, dispute handling, or legal compliance."
                  />

                  <RetentionRow
                    category="Security and diagnostic logs"
                    retention="Retained for a limited period necessary to detect abuse, investigate incidents, maintain reliability, and comply with legal requirements."
                  />

                  <RetentionRow
                    category="Privacy request records"
                    retention="Minimal records may be retained to demonstrate that a request was received and completed, without retaining unnecessary customer payloads."
                  />
                </tbody>
              </table>
            </div>

            <p>
              Information may be deleted, anonymized, or aggregated when it is
              no longer required. Backup copies may remain for a limited
              recovery period and are removed according to our backup lifecycle,
              unless longer retention is legally required.
            </p>
          </PolicySection>

          <PolicySection title="12. Data Security">
            <p>
              We use administrative, technical, and organizational safeguards
              designed to protect information against unauthorized access,
              alteration, loss, disclosure, or destruction. These safeguards
              include, where applicable:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>HTTPS/TLS encryption for data in transit</li>
              <li>Restricted production and administrative access</li>
              <li>Role-based permissions</li>
              <li>Authentication and password controls</li>
              <li>Environment and secret-management controls</li>
              <li>Protected storage of integration credentials</li>
              <li>Encrypted infrastructure backups where supported</li>
              <li>Security, access, and diagnostic logging</li>
              <li>Monitoring, vulnerability remediation, and incident response</li>
              <li>Separation of development and production environments</li>
              <li>Data minimization and scheduled deletion practices</li>
            </ul>

            <p>
              Access to merchant and customer data is limited to authorized
              personnel and service providers who require it for legitimate
              operational purposes.
            </p>

            <p>
              No method of transmission or storage is completely secure.
              Accordingly, we cannot guarantee absolute security.
            </p>
          </PolicySection>

          <PolicySection title="13. International Data Transfers">
            <p>
              Virtix AI and its service providers may process information in
              countries other than the country in which the merchant or
              customer is located.
            </p>

            <p>
              Where required, we use appropriate safeguards for international
              transfers, such as contractual commitments, data-processing
              agreements, or other legally recognized transfer mechanisms.
            </p>
          </PolicySection>

          <PolicySection title="14. Cookies and Similar Technologies">
            <p>We may use cookies and similar technologies to:</p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Maintain login and authenticated sessions</li>
              <li>Protect accounts and prevent fraudulent activity</li>
              <li>Remember preferences</li>
              <li>Measure application performance</li>
              <li>Understand use of the website and platform</li>
              <li>Diagnose errors and improve reliability</li>
            </ul>

            <p>
              Users may manage cookies through their browser settings. Disabling
              essential cookies may prevent certain account or application
              functions from working correctly.
            </p>
          </PolicySection>

          <PolicySection title="15. Privacy Rights and Requests">
            <p>
              Depending on applicable law and your relationship with Virtix AI,
              you may have rights to:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Request access to personal information</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion or anonymization</li>
              <li>Request a portable copy of certain information</li>
              <li>Object to or restrict certain processing</li>
              <li>Withdraw consent where processing is based on consent</li>
              <li>Submit a complaint to a relevant supervisory authority</li>
            </ul>

            <p>
              A customer of a merchant should generally submit a request
              directly to that merchant. The merchant may then instruct Virtix
              AI to assist with the request. Shopify customers may also exercise
              applicable rights through the relevant Shopify merchant.
            </p>

            <p>
              Merchants and direct Virtix AI users may submit privacy requests
              to{" "}
              <a
                className="font-semibold text-[#6200ff] underline underline-offset-4"
                href="mailto:privacy@virtixai.com"
              >
                privacy@virtixai.com
              </a>
              . We may need to verify the requester&apos;s identity and
              authority before completing a request.
            </p>
          </PolicySection>

          <PolicySection title="16. Account Deletion and Shopify Uninstall">
            <p>
              Merchants may request account deletion or disconnect an
              integration through available account controls or by contacting
              us.
            </p>

            <p>
              Following Shopify app uninstall or disconnection, Virtix AI will:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Deactivate the Shopify integration</li>
              <li>Stop future product synchronization and order lookups</li>
              <li>Remove the access credential from active use</li>
              <li>
                Delete or anonymize applicable Shopify customer and store data
                in response to valid privacy requests
              </li>
              <li>
                Retain only information that is necessary for security,
                compliance, dispute resolution, or other lawful purposes
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="17. Children&apos;s Privacy">
            <p>
              Virtix AI is designed for businesses and is not directed to
              children under 13. We do not knowingly collect personal
              information directly from children under 13.
            </p>

            <p>
              Merchants are responsible for ensuring that their use of Virtix
              AI and their storefront is appropriate for their intended
              customers and complies with applicable age-related privacy
              requirements.
            </p>
          </PolicySection>

          <PolicySection title="18. Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy to reflect changes to the
              service, integrations, legal requirements, or data practices.
            </p>

            <p>
              We will post the revised policy on this page and update the
              &quot;Last Updated&quot; date. Where required, we will provide
              additional notice of material changes.
            </p>
          </PolicySection>

          <PolicySection title="19. Contact Us">
            <p>
              For questions, privacy requests, or complaints concerning this
              Privacy Policy, contact:
            </p>

            <div className="space-y-1">
              <p>
                <span className="font-semibold">Company:</span> Virtix AI LLC.
              </p>

              <p>
                <span className="font-semibold">Email:</span>{" "}
                  info@virtixai.com
              </p>


              <p>
                <span className="font-semibold">Phone:</span>{" "}
                  +1 (505) 528-2615
              </p>


              <p>
                <span className="font-semibold">Address:</span>{" "}
                  1209 MOUNTAIN ROAD PL NE, STE R, ALBUQUERQUE, New Mexico 87110, USA
              </p>

              <p>
                <span className="font-semibold">Website:</span>{" "}
                  virtixai.com
              </p>
            </div>

          </PolicySection>
        </div>
      </div>
    </section>
  );
};

const PolicySection = ({ title, children }) => {
  return (
    <section className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:p-8">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
};

const PolicySubsection = ({ title, children }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
};

const RetentionRow = ({ category, retention }) => {
  return (
    <tr className="border-b border-[#E5E7EB] align-top last:border-b-0">
      <td className="px-3 py-4 font-semibold">{category}</td>
      <td className="px-3 py-4">{retention}</td>
    </tr>
  );
};

export default PrivacyPolicy;