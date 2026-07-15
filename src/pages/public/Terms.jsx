const Terms = () => {
  const lastUpdated = "July 15, 2026";

  return (
    <section className="bg-[#f8fafc] py-20">
      <div className="container max-w-5xl space-y-10 text-[#0C0900]">
        <div className="mt-15 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6200ff]">
              Terms &amp; conditions
            </p>

            <h1 className="text-4xl font-bold leading-[120%] md:text-5xl">
              Terms &amp; Conditions
            </h1>

            <p className="text-sm text-[#0C0900]/70">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </div>

        <div className="space-y-6 text-base leading-[165%]">
          <TermsSection title="1. Acceptance of Terms">
            <p>
              These Terms and Conditions (&quot;Terms&quot;) govern access to and
              use of the Virtix AI website, applications, APIs, integrations,
              chat widgets, AI agents, and related services
              (&quot;Services&quot;).
            </p>

            <p>
              By creating an account, installing the Virtix AI Shopify app,
              connecting a store, accessing the Services, or using the Services
              on behalf of a business, you agree to these Terms and confirm that
              you have authority to bind that business.
            </p>

            <p>
              If you do not agree to these Terms, you must not access or use the
              Services.
            </p>
          </TermsSection>

          <TermsSection title="2. Eligibility and Authority">
            <p>
              You must be legally capable of entering into a binding agreement
              and authorized to act for the business or organization associated
              with the account.
            </p>

            <p>
              If you use Virtix AI for a Shopify store, you represent that you
              are the store owner, an authorized staff member, or another person
              with permission to install and manage applications for that store.
            </p>
          </TermsSection>

          <TermsSection title="3. Description of the Services">
            <p>
              Virtix AI provides AI-powered conversational automation and
              commerce-assistance tools, including:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Automated customer-support conversations</li>
              <li>Store-specific AI agents</li>
              <li>Product search and recommendations</li>
              <li>Product, price, variant, and inventory synchronization</li>
              <li>Cart creation and checkout-link assistance</li>
              <li>Order-status assistance</li>
              <li>Knowledge-base and document-assisted responses</li>
              <li>Lead capture, booking, complaints, and related workflows</li>
              <li>Website, WooCommerce, and Shopify integrations</li>
              <li>Usage reporting and account-management features</li>
            </ul>

            <p>
              Available features may depend on your plan, integration,
              configuration, region, third-party platform, or account status.
            </p>

            <p>
              We may add, modify, limit, suspend, or discontinue features where
              reasonably necessary, subject to applicable law and any material
              contractual commitments.
            </p>
          </TermsSection>

          <TermsSection title="4. Accounts and Security">
            <p>You agree to:</p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Provide accurate and current account information</li>
              <li>Keep login credentials confidential</li>
              <li>Use strong passwords and available security controls</li>
              <li>Restrict access to authorized personnel</li>
              <li>
                Notify us promptly of suspected unauthorized access or security
                incidents
              </li>
              <li>
                Accept responsibility for activity performed through your
                account
              </li>
            </ul>

            <p>
              You must not share individual user credentials among multiple
              people where separate accounts or roles are available.
            </p>

            <p>
              We may temporarily restrict access where we reasonably believe an
              account is compromised or poses a security risk.
            </p>
          </TermsSection>

          <TermsSection title="5. Merchant Responsibilities">
            <p>
              Merchants are responsible for how they configure and use Virtix
              AI, including:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Providing accurate product and business information</li>
              <li>Reviewing important AI-generated content</li>
              <li>Maintaining appropriate customer-facing policies</li>
              <li>
                Informing customers about AI-assisted interactions where
                required
              </li>
              <li>Obtaining any legally required permissions or consent</li>
              <li>
                Ensuring uploaded and synchronized content may lawfully be used
              </li>
              <li>
                Complying with consumer-protection, privacy, marketing, and
                ecommerce laws
              </li>
              <li>
                Configuring product, pricing, inventory, shipping, refund, and
                fulfillment information accurately
              </li>
              <li>
                Ensuring staff members have only the access they require
              </li>
            </ul>

            <p>
              Virtix AI does not replace the merchant&apos;s responsibility to
              provide accurate product, pricing, order, delivery, return, and
              customer-service information.
            </p>
          </TermsSection>

          <TermsSection title="6. Shopify Integration">
            <p>
              If you install or use the Virtix AI Shopify app, you authorize
              Virtix AI to access and process the Shopify resources permitted by
              the scopes approved during installation.
            </p>

            <p>
              Depending on enabled features, this may include read-only access
              to:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Products and variants</li>
              <li>Prices and product images</li>
              <li>Inventory and availability</li>
              <li>Collections and product metadata</li>
              <li>Orders and limited order-status information</li>
              <li>
                Customer email addresses used for order-ownership verification
              </li>
            </ul>

            <p>
              You authorize us to synchronize and process this information only
              as necessary to provide the configured Services.
            </p>

            <p>
              Virtix AI does not use Shopify access to create, edit, cancel,
              fulfill, or refund orders unless a future feature explicitly
              requests and receives the required permissions and you enable that
              feature.
            </p>

            <p>
              Shopify is a third-party platform. Your use of Shopify remains
              subject to Shopify&apos;s own terms, policies, merchant agreements,
              and technical limitations.
            </p>
          </TermsSection>

          <TermsSection title="7. Product Recommendations">
            <p>
              Product recommendations are generated using available merchant
              product data, business knowledge, customer questions, and
              configured AI behavior.
            </p>

            <p>
              Recommendations may not always reflect the customer&apos;s complete
              needs, current availability, market-specific pricing, shipping
              eligibility, or other information not available to Virtix AI.
            </p>

            <p>
              Merchants are responsible for ensuring product data is accurate
              and for reviewing any rules, exclusions, or claims applied to
              recommendations.
            </p>
          </TermsSection>

          <TermsSection title="8. Cart and Checkout Assistance">
            <p>
              Virtix AI may help customers select products, create a Shopify
              cart, and generate a Shopify checkout URL.
            </p>

            <p>
              The final purchase, pricing confirmation, taxes, discounts,
              shipping charges, payment authorization, and order creation occur
              through Shopify or the merchant&apos;s authorized checkout
              environment.
            </p>

            <p>
              Virtix AI does not collect or process full payment-card numbers.
            </p>

            <p>
              A generated cart or checkout link does not guarantee:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Product availability</li>
              <li>Price availability</li>
              <li>Discount eligibility</li>
              <li>Shipping availability</li>
              <li>Successful payment</li>
              <li>Completion or fulfillment of an order</li>
            </ul>

            <p>
              The information displayed at Shopify checkout controls if it
              differs from information previously shown in a conversation.
            </p>
          </TermsSection>

          <TermsSection title="9. Order-Status Assistance">
            <p>
              Virtix AI may provide limited order-status assistance using
              read-only Shopify order access.
            </p>

            <p>
              A customer may be required to provide both:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>An order number or order identifier</li>
              <li>The corresponding checkout email address</li>
            </ul>

            <p>
              Virtix AI uses this information to verify order ownership before
              returning limited order, payment, fulfillment, or tracking status.
            </p>

            <p>
              Merchants must not configure the Services to disclose order
              information without appropriate identity verification.
            </p>

            <p>
              Virtix AI does not guarantee that order or tracking information is
              complete, current, or error-free because the information depends
              on Shopify, the merchant, fulfillment providers, and carriers.
            </p>
          </TermsSection>

          <TermsSection title="10. Customer Data and Privacy">
            <p>
              As between Virtix AI and the merchant, the merchant retains its
              rights in business content, store data, customer data, uploaded
              documents, and conversation data.
            </p>

            <p>
              The merchant authorizes Virtix AI to process that data as
              necessary to:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Provide the Services</li>
              <li>Operate integrations</li>
              <li>Generate requested AI responses</li>
              <li>Secure and troubleshoot the platform</li>
              <li>Comply with legal and privacy obligations</li>
            </ul>

            <p>
              Merchants are responsible for determining whether they have a
              valid legal basis to provide customer data to Virtix AI and for
              giving customers any required privacy notices.
            </p>

            <p>
              Our processing of personal information is further described in
              our Privacy Policy.
            </p>
          </TermsSection>

          <TermsSection title="11. Protected Customer Data">
            <p>
              Certain Shopify order and customer information may be considered
              protected customer data.
            </p>

            <p>
              Virtix AI will seek to process only the minimum data required for
              the enabled functionality. For order-status assistance, this may
              include the order identifier and checkout email address used for
              verification.
            </p>

            <p>
              You must not use Virtix AI to access, collect, expose, or process
              customer data for purposes unrelated to the functionality
              described in your account configuration and our App Store
              listing.
            </p>

            <p>
              You must not use Virtix AI to sell customer data, create unlawful
              profiles, discriminate against customers, or make decisions that
              produce legal or similarly significant effects without an
              appropriate lawful process.
            </p>
          </TermsSection>

          <TermsSection title="12. AI Processing and Generated Content">
            <p>
              Virtix AI uses automated systems and third-party AI providers to
              generate or assist with responses.
            </p>

            <p>
              AI-generated content may be inaccurate, incomplete, outdated,
              inappropriate, or inconsistent with merchant policy.
            </p>

            <p>
              You are responsible for:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Reviewing important AI-generated outputs</li>
              <li>Providing accurate source information</li>
              <li>Configuring appropriate agent instructions</li>
              <li>
                Avoiding use of AI output as professional legal, medical,
                financial, safety, or other regulated advice
              </li>
              <li>
                Providing human assistance where reasonably necessary
              </li>
            </ul>

            <p>
              Virtix AI does not guarantee that AI-generated answers will be
              correct or suitable for every customer or situation.
            </p>
          </TermsSection>

          <TermsSection title="13. Acceptable Use">
            <p>You must not use the Services to:</p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Break applicable laws or regulations</li>
              <li>Violate privacy, publicity, or intellectual-property rights</li>
              <li>Upload malware, malicious code, or harmful content</li>
              <li>Attempt unauthorized access to systems or accounts</li>
              <li>Probe, scan, or test vulnerabilities without permission</li>
              <li>Interfere with platform security or availability</li>
              <li>Bypass usage limits, billing, or access controls</li>
              <li>Reverse engineer the Services except where legally permitted</li>
              <li>Send unlawful spam or deceptive communications</li>
              <li>Impersonate a person or organization</li>
              <li>
                Collect payment-card details, passwords, government identifiers,
                or unnecessary sensitive personal information through chat
              </li>
              <li>
                Expose another customer&apos;s order or personal information
              </li>
              <li>Use the Services for fraud or harmful automated decisions</li>
              <li>
                Use the Services to develop or train a competing model or
                service through systematic extraction of outputs
              </li>
            </ul>

            <p>
              We may investigate suspected violations and suspend or terminate
              access where reasonably necessary.
            </p>
          </TermsSection>

          <TermsSection title="14. Merchant Content">
            <p>
              You retain ownership of content you upload, synchronize, or
              submit to the Services.
            </p>

            <p>
              You grant Virtix AI a limited, non-exclusive license to host,
              copy, process, transmit, index, and display that content solely as
              necessary to provide, secure, and support the Services.
            </p>

            <p>
              You represent that you have all rights and permissions required
              to provide the content and authorize its processing.
            </p>
          </TermsSection>

          <TermsSection title="15. Virtix AI Intellectual Property">
            <p>
              Virtix AI and its licensors retain all rights in the Services,
              software, interface, branding, documentation, models,
              configurations, and related technology, excluding merchant-owned
              content.
            </p>

            <p>
              These Terms do not transfer ownership of Virtix AI technology or
              trademarks to you.
            </p>
          </TermsSection>

          <TermsSection title="16. Third-Party Services">
            <p>
              The Services may depend on third-party providers, including:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Shopify</li>
              <li>WooCommerce and WordPress</li>
              <li>Cloud hosting and storage providers</li>
              <li>AI model providers</li>
              <li>Email and monitoring providers</li>
              <li>Payment and billing providers</li>
              <li>Shipping and fulfillment providers</li>
            </ul>

            <p>
              Virtix AI is not responsible for third-party service outages,
              changes, API limits, data inaccuracies, policy decisions, account
              restrictions, or discontinuation.
            </p>

            <p>
              Your use of a third-party service remains subject to that
              provider&apos;s terms and policies.
            </p>
          </TermsSection>

          <TermsSection title="17. Plans, Usage Limits, and Billing">
            <p>
              Virtix AI may offer free, paid, usage-based, trial, or custom
              plans.
            </p>

            <p>
              Plan features, limits, billing periods, and prices are described
              in the relevant pricing interface or order form.
            </p>

            <p>
              For merchants acquiring Virtix AI through the Shopify App Store,
              applicable app charges will be processed using a Shopify-provided
              billing solution unless Shopify expressly approves another
              arrangement.
            </p>

            <p>
              Shopify may present, approve, invoice, prorate, cancel, or manage
              app charges according to its billing systems and merchant terms.
              Shopify App Store apps are required to use Shopify-provided
              billing for applicable app charges. See{" "}
              <a
                href="https://shopify.dev/docs/apps/launch/billing"
                target="_blank"
                rel="noreferrer"
              >
                Shopify billing documentation
              </a>.
            </p>

            <p>
              For non-Shopify customers, charges may be processed through an
              authorized external billing provider.
            </p>

            <p>
              You authorize the applicable billing provider to charge approved
              fees and taxes. Failure to pay may result in limitation,
              suspension, or termination of paid functionality.
            </p>
          </TermsSection>

          <TermsSection title="18. Free Plans and Trials">
            <p>
              Free plans and trials may have usage, message, storage, agent,
              product, feature, or integration limits.
            </p>

            <p>
              We may modify free-plan limits or discontinue a trial offering,
              provided that we do not impose a paid charge without the required
              approval or billing authorization.
            </p>

            <p>
              Creating multiple accounts to avoid free-plan or trial limits is
              prohibited.
            </p>
          </TermsSection>

          <TermsSection title="19. Taxes">
            <p>
              Fees may exclude applicable taxes. You are responsible for taxes,
              duties, or government charges associated with your purchase,
              except taxes imposed on Virtix AI&apos;s income.
            </p>

            <p>
              Shopify or another billing provider may calculate and collect
              applicable taxes where required.
            </p>
          </TermsSection>

          <TermsSection title="20. Refunds">
            <p>
              Fees are generally non-refundable except where:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Required by applicable law</li>
              <li>Required by Shopify&apos;s billing rules</li>
              <li>Expressly stated in a written offer or agreement</li>
              <li>Approved by Virtix AI at its discretion</li>
            </ul>

            <p>
              Shopify merchants may need to contact Virtix AI regarding an app
              charge, while the actual billing adjustment may be processed
              through Shopify.
            </p>
          </TermsSection>

          <TermsSection title="21. Suspension and Termination">
            <p>
              We may suspend or terminate access if:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>You materially violate these Terms</li>
              <li>Your use creates security, legal, or operational risk</li>
              <li>You fail to pay applicable fees</li>
              <li>You misuse protected customer data</li>
              <li>You interfere with Shopify or another integration</li>
              <li>We are required to act by law or a platform provider</li>
              <li>The account is inactive or appears fraudulent</li>
            </ul>

            <p>
              Where reasonable, we may provide notice and an opportunity to
              correct the issue before termination.
            </p>

            <p>
              You may stop using Virtix AI, cancel your account, disconnect a
              store, or uninstall the Shopify app at any time.
            </p>
          </TermsSection>

          <TermsSection title="22. Effect of Shopify Uninstall">
            <p>
              When the Virtix AI Shopify app is uninstalled:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>The Shopify integration may be deactivated</li>
              <li>Product synchronization will stop</li>
              <li>Order-status lookups will stop</li>
              <li>The Shopify access token will no longer be used</li>
              <li>
                Store and customer data will be handled according to our Privacy
                Policy, retention practices, and applicable Shopify privacy
                requests
              </li>
              <li>
                Outstanding app charges may remain subject to Shopify&apos;s
                billing rules
              </li>
            </ul>

            <p>
              Uninstalling the Shopify app does not automatically delete a
              separate Virtix AI account unless the merchant also requests
              account deletion.
            </p>
          </TermsSection>

          <TermsSection title="23. Service Availability and Support">
            <p>
              We aim to provide a reliable service but do not guarantee
              uninterrupted, error-free, or continuous operation.
            </p>

            <p>Service may be affected by:</p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Maintenance</li>
              <li>Third-party platform outages</li>
              <li>AI provider availability</li>
              <li>Internet or hosting failures</li>
              <li>API limits or permission changes</li>
              <li>Security incidents</li>
              <li>Events outside our reasonable control</li>
            </ul>

            <p>
              Support is provided through the channels and response targets
              stated for the relevant plan.
            </p>
          </TermsSection>

          <TermsSection title="24. Disclaimer of Warranties">
            <p>
              To the maximum extent permitted by law, the Services are provided
              &quot;as is&quot; and &quot;as available.&quot;
            </p>

            <p>
              Virtix AI disclaims implied warranties of merchantability,
              fitness for a particular purpose, non-infringement, accuracy,
              availability, and uninterrupted operation.
            </p>

            <p>
              We do not warrant that:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>AI responses will always be accurate</li>
              <li>Recommendations will result in sales</li>
              <li>Cart or checkout links will always complete successfully</li>
              <li>Order-status information will always be current</li>
              <li>The Services will meet every business requirement</li>
              <li>Every error or interruption will be corrected</li>
            </ul>
          </TermsSection>

          <TermsSection title="25. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, Virtix AI and its
              directors, officers, employees, contractors, affiliates, and
              service providers will not be liable for indirect, incidental,
              special, punitive, exemplary, or consequential damages.
            </p>

            <p>
              This includes loss of profits, revenue, business, customers,
              goodwill, data, or anticipated savings arising from:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Use of or inability to use the Services</li>
              <li>AI-generated inaccuracies</li>
              <li>Third-party platform failures</li>
              <li>Unauthorized account access</li>
              <li>Merchant configuration or customer misuse</li>
              <li>Product, inventory, pricing, checkout, or order errors</li>
            </ul>

            <p>
              To the maximum extent permitted by law, Virtix AI&apos;s aggregate
              liability relating to the Services will not exceed the greater
              of:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>
                The fees paid by you to Virtix AI for the affected Services
                during the six months before the event giving rise to the claim
              </li>
              <li>USD $100</li>
            </ul>

            <p>
              This limitation does not apply where liability cannot legally be
              excluded or limited.
            </p>
          </TermsSection>

          <TermsSection title="26. Indemnification">
            <p>
              To the extent permitted by law, you agree to defend, indemnify,
              and hold harmless Virtix AI from third-party claims, damages,
              liabilities, costs, and expenses arising from:
            </p>

            <ul className="list-disc space-y-1 pl-6">
              <li>Your misuse of the Services</li>
              <li>Your violation of these Terms</li>
              <li>Your merchant content</li>
              <li>Your violation of law or third-party rights</li>
              <li>Your customer notices, consents, or data practices</li>
              <li>Your products, services, policies, or customer disputes</li>
            </ul>
          </TermsSection>

          <TermsSection title="27. Confidentiality">
            <p>
              Each party may receive non-public information from the other.
              Confidential information must be protected using reasonable care
              and used only for purposes related to the Services.
            </p>

            <p>
              Confidential information does not include information that is
              publicly available without breach, independently developed,
              lawfully received from another source, or required to be
              disclosed by law.
            </p>
          </TermsSection>

          <TermsSection title="28. Feedback">
            <p>
              If you provide suggestions, ideas, or feedback regarding Virtix
              AI, you grant us the right to use that feedback without
              restriction or payment, provided that we do not publicly identify
              you without permission.
            </p>
          </TermsSection>

          <TermsSection title="29. Changes to These Terms">
            <p>
              We may update these Terms to reflect changes in law, platform
              requirements, billing, security, features, or business
              operations.
            </p>

            <p>
              We will update the &quot;Last Updated&quot; date and provide
              additional notice where required.
            </p>

            <p>
              Continued use after updated Terms take effect constitutes
              acceptance of the revised Terms, except where applicable law
              requires another form of consent.
            </p>
          </TermsSection>

          <TermsSection title="30. Governing Law and Disputes">
            <p>
              These Terms are governed by the laws of the jurisdiction in which
              the Virtix AI contracting entity is legally established, without
              regard to conflict-of-law principles.
            </p>

            <p>
              Before publishing, replace this section with the exact legal
              entity and governing jurisdiction applicable to your business.
            </p>

            <p>
              For example, if Virtix AI LLC is registered in New Mexico and is
              the contracting entity, this section may state:
            </p>

            <blockquote className="border-l-4 border-[#6200ff] pl-4 text-[#0C0900]/80">
              These Terms are governed by the laws of the State of New Mexico,
              United States, without regard to its conflict-of-law rules. The
              state and federal courts located in New Mexico will have exclusive
              jurisdiction over disputes arising from these Terms, except where
              applicable consumer law requires otherwise.
            </blockquote>
          </TermsSection>

          <TermsSection title="31. General Terms">
            <ul className="list-disc space-y-2 pl-6">
              <li>
                These Terms, the Privacy Policy, and any applicable order form
                constitute the agreement governing the Services.
              </li>

              <li>
                If any provision is unenforceable, the remaining provisions
                remain effective.
              </li>

              <li>
                Failure to enforce a provision is not a waiver of that
                provision.
              </li>

              <li>
                You may not assign these Terms without our written consent.
                Virtix AI may assign them in connection with a merger,
                reorganization, acquisition, or sale of assets.
              </li>

              <li>
                Section headings are for convenience and do not affect
                interpretation.
              </li>

              <li>
                Neither party is liable for delay caused by events outside its
                reasonable control.
              </li>
            </ul>
          </TermsSection>

          <TermsSection title="32. Contact Information">
            <p>
              For support, billing questions, legal notices, or questions about
              these Terms, contact:
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
          </TermsSection>
        </div>
      </div>
    </section>
  );
};

const TermsSection = ({ title, children }) => {
  return (
    <section className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:p-8">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
};

export default Terms;