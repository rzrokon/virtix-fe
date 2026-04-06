import { ArrowUpRight, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const HELP_SECTIONS = [
  {
    id: 'accounts',
    title: 'Account & Access',
    description: 'Sign up, sign in, recover access, and manage your profile.',
    articles: [
      {
        id: 'create-account',
        title: 'Create your Virtix account',
        summary: 'Use the sign-up page to create your workspace with Google or email and password.',
        keywords: ['signup', 'register', 'create account', 'google sign in', 'password'],
        overview:
          'The Create Your Account screen is your entry point into Virtix. It supports Google sign-in and manual email registration. After account creation, you can create agents, choose a plan, and start configuring your workspace.',
        steps: [
          'Open the Sign up page from the website header or the Sign up link on the login screen.',
          'Choose Continue with Google if you want the fastest setup, or enter your email, password, and confirm password.',
          'Use a strong password that you can remember. Matching passwords are required before submission.',
          'Click Create account to finish registration.',
          'After registration, continue to agent creation or plan selection depending on your account state.',
        ],
        details: [
          'Google sign-in is useful for faster onboarding and fewer password resets.',
          'Email sign-up is better if your team uses shared operational mailboxes.',
          'If the form does not submit, review empty fields and password mismatch first.',
        ],
        troubleshooting: [
          'If you already have an account, use the Sign in link instead of creating a second profile.',
          'If Google sign-in fails, retry with email sign-up to confirm whether the issue is provider-specific.',
          'If the button appears inactive, check that all required fields are filled.',
        ],
        related: ['sign-in', 'forgot-password'],
      },
      {
        id: 'sign-in',
        title: 'Sign in to your account',
        summary: 'Use the login screen to access your Virtix workspace by Google or email.',
        keywords: ['login', 'signin', 'remember me', 'access account'],
        overview:
          'The Welcome Back login screen lets you access Virtix with Google or your email and password. It also includes Remember me and a direct link to password recovery.',
        steps: [
          'Open the Sign in page.',
          'Choose Continue with Google, or enter your email and password manually.',
          'Optionally enable Remember me if you are using a trusted device.',
          'Click Sign In to enter your workspace.',
          'If you cannot remember your password, use Forgot password before retrying too many times.',
        ],
        details: [
          'Remember me helps reduce repeated logins on personal devices.',
          'The Forgot password link is built into the sign-in screen for recovery without support intervention.',
        ],
        troubleshooting: [
          'If credentials are rejected, confirm whether you originally registered with Google instead of email/password.',
          'If you are redirected unexpectedly, clear old session data by signing out and signing back in.',
          'If you still cannot access the account, reset the password from the recovery flow.',
        ],
        related: ['create-account', 'forgot-password'],
      },
      {
        id: 'forgot-password',
        title: 'Reset a forgotten password',
        summary: 'Use the Forgot Password page to send a reset email to your registered address.',
        keywords: ['forgot password', 'reset email', 'recover account'],
        overview:
          'The Forgot Password screen is used when you cannot sign in with your existing password. Virtix sends a reset link to the email address attached to your account.',
        steps: [
          'Open the Forgot Password page from the login screen.',
          'Enter the email address you used to create the account.',
          'Click Send Reset Email.',
          'Open the reset email in your inbox and follow the link.',
          'Set a new password, then return to Sign in.',
        ],
        details: [
          'Use the exact email tied to your Virtix account.',
          'This flow is only needed for email/password accounts, not pure Google login accounts.',
        ],
        troubleshooting: [
          'If no email arrives, check spam, promotions, and the mailbox used for registration.',
          'If the reset link expires, request a new email and use the most recent one.',
          'If you used Google to register, try Google sign-in first before resetting a password.',
        ],
        related: ['sign-in', 'change-password'],
      },
      {
        id: 'change-password',
        title: 'Change your password from inside the app',
        summary: 'Use the Change Password page to update an existing password while logged in.',
        keywords: ['change password', 'current password', 'security'],
        overview:
          'The Change Password screen is for proactive security updates when you are already signed in. It requires your current password, your new password, and confirmation.',
        steps: [
          'Open Change Password from your account area.',
          'Enter your current password.',
          'Enter your new password and confirm it in the second field.',
          'Review the password tips shown on the page and make sure the new password is strong.',
          'Click Change Password to save the update.',
        ],
        details: [
          'Reset clears the form without changing anything.',
          'Use a password with letters, numbers, and symbols where possible.',
        ],
        troubleshooting: [
          'If the update fails, check whether the current password is correct.',
          'If the confirmation field does not match, the new password will not be accepted.',
          'If you forgot the current password, use the Forgot Password flow instead.',
        ],
        related: ['forgot-password', 'update-profile'],
      },
      {
        id: 'update-profile',
        title: 'Update your profile and preferences',
        summary: 'Manage name, phone, address, language, theme, voice, and notification preferences.',
        keywords: ['profile', 'preferences', 'language', 'voice', 'notifications'],
        overview:
          'The profile page stores your personal and workspace-related contact details. It also includes preference fields such as theme, language, voice, and notification subscription.',
        steps: [
          'Open your profile page from the user menu.',
          'Update personal information such as first name, last name, phone number, date of birth, and organization.',
          'Update address, city, and country if you want account records to stay current.',
          'Review preferences for theme, language, and voice.',
          'Toggle notification subscription on or off as needed.',
          'Click Update Profile to save your changes.',
        ],
        details: [
          'Profile information is useful for account ownership and support verification.',
          'Language and voice preferences help align the workspace with your operating style.',
        ],
        troubleshooting: [
          'If a field does not save, check that required profile fields are still valid.',
          'If profile images or account visuals are managed elsewhere, update them from the relevant page instead of this screen.',
        ],
        related: ['change-password', 'active-plan'],
      },
    ],
  },
  {
    id: 'workspace',
    title: 'Workspace Setup',
    description: 'Create agents, configure branding, features, and plan limits.',
    articles: [
      {
        id: 'create-agent',
        title: 'Create a new agent',
        summary: 'Set up a new agent with identity, SEO fields, and branding assets.',
        keywords: ['agent', 'create agent', 'branding', 'site title', 'favicon'],
        overview:
          'The Create Agent modal lets you launch a new AI agent with a name, heading, description, SEO metadata, and branding files. This is the first step before configuring knowledge, channels, and business actions.',
        steps: [
          'Click Create Agent from the main workspace screen.',
          'Enter Agent name and Agent Heading. These appear in your workspace and customer-facing surfaces.',
          'Write a short Agent Description that explains what the agent does.',
          'Complete Site Title, Site Description, and Site Keywords for branded pages and metadata.',
          'Upload branding assets such as Logo Light, Logo Dark, Thumbnail, and Favicon if available.',
          'Click Submit to create the agent.',
        ],
        details: [
          'Use a clear agent name because it is reused across integrations and widgets.',
          'Your heading should be customer-friendly and easier to read than the internal name.',
          'Branding uploads improve the public-facing presentation of the agent.',
        ],
        troubleshooting: [
          'If creation fails, review missing required fields first.',
          'If branding files are not ready yet, create the agent first and add assets later from Agent Settings.',
        ],
        related: ['agent-settings', 'feature-config', 'dashboard-overview'],
      },
      {
        id: 'agent-settings',
        title: 'Configure agent settings and widget security',
        summary: 'Manage agent identity, SEO metadata, branding files, widget keys, and allowed domains.',
        keywords: ['agent settings', 'widget key', 'allowed domains', 'logo', 'seo'],
        overview:
          'The Agent Settings page controls identity, metadata, branding, and widget security. It is the main administrative page for how the agent is named, displayed, and embedded.',
        steps: [
          'Open Agent Info or Agent Settings from the dashboard sidebar.',
          'Review the Current Assets section to see which images are already uploaded.',
          'Update Agent Name, Agent Heading, and Agent Description.',
          'Fill in Site Title, Site Description, and Site Keywords for public-facing metadata.',
          'Upload or replace Logo Light, Logo Dark, Thumbnail, and Favicon as needed.',
          'Use the Widget Security section to enable or disable the widget, review the widget key, and restrict Allowed Domains.',
          'Copy the widget embed snippet when you are ready to place the agent on your website.',
          'Click Save Changes.',
        ],
        details: [
          'Allowed domains help prevent unauthorized widget usage on random sites.',
          'The widget key connects the website widget to the correct agent.',
          'Use separate light and dark logos if your brand requires different contrast handling.',
        ],
        troubleshooting: [
          'If the widget does not load on your site, verify the widget key and allowed domain list first.',
          'If branding assets do not appear, refresh the page after upload to confirm the latest files are loaded.',
          'If you need to disable public widget usage temporarily, turn off Widget Enabled.',
        ],
        related: ['widget-configuration', 'feature-config', 'create-agent'],
      },
      {
        id: 'feature-config',
        title: 'Enable agent features and choose order routing',
        summary: 'Turn business capabilities on or off and define whether orders stay internal or go to WooCommerce.',
        keywords: ['feature config', 'lead generation', 'bookings', 'orders provider', 'woocommerce'],
        overview:
          'Agent Features is where you decide what the agent can do. You can enable lead generation, bookings, complaints, products, orders, offers, and also toggle website and WooCommerce integrations.',
        steps: [
          'Open Feature Config from the Agent section in the sidebar.',
          'Enable or disable the core capabilities that match your use case.',
          'Turn on Website (WordPress) if the agent should use indexed site content.',
          'Turn on WooCommerce if the agent should use product sync and direct store orders.',
          'Choose the Order Provider.',
          'Select Internal if you want orders stored inside Virtix only.',
          'Select WooCommerce Store if customer orders should be placed directly on your WooCommerce store.',
          'Click Save or Save Changes.',
        ],
        details: [
          'Products gives the agent product catalog awareness.',
          'Orders allows the agent to support product ordering workflows.',
          'Offers is meant for promotions, discount campaigns, and special sales messages.',
        ],
        troubleshooting: [
          'If a module does not appear elsewhere in the dashboard, confirm it is enabled here.',
          'If WooCommerce order placement is expected but not working, verify both WooCommerce is enabled and the Order Provider is set to WooCommerce Store.',
        ],
        related: ['woocommerce-store', 'knowledge-overview', 'manage-orders'],
      },
      {
        id: 'active-plan',
        title: 'Read your active plan and usage limits',
        summary: 'Check plan status, billing cycle, included features, and usage against limits.',
        keywords: ['billing', 'plan', 'usage', 'agents', 'storage', 'messages'],
        overview:
          'The Active Plan page shows your current subscription, renewal state, billing period, feature availability, and usage metrics such as messages, storage, and index size.',
        steps: [
          'Open Active Plan from your account area.',
          'Review the current plan name, price, and status badges such as active or auto-renew.',
          'Check the billing period start and end dates.',
          'Review Plan limits to understand caps for agents, files, monthly messages, storage, and index size.',
          'Review the Usage panel to see how much of each allowance you have already consumed.',
          'Use Change plan to upgrade or downgrade if needed.',
          'Use Cancel & switch to Free only if you intend to reduce features and capacity.',
        ],
        details: [
          'Included features tell you which modules should be available in your workspace.',
          'Usage bars help diagnose why uploads, indexing, or message volume may be reaching capacity.',
        ],
        troubleshooting: [
          'If a feature is missing, compare it against the included features on your current plan.',
          'If indexing or uploads stop working, check file, storage, and index usage before debugging anything else.',
        ],
        related: ['create-agent', 'manage-files', 'dashboard-overview'],
      },
      {
        id: 'dashboard-overview',
        title: 'Use the dashboard to monitor activity',
        summary: 'Track conversations, messages, customers, conversation trends, sentiment, and top questions.',
        keywords: ['dashboard', 'analytics', 'conversation volume', 'sentiment', 'top questions'],
        overview:
          'The dashboard is your summary view for agent performance. It shows overall counts, conversation trends, sentiment distribution, and the most frequently asked questions from customers.',
        steps: [
          'Open the dashboard for a specific agent.',
          'Review the top summary cards for agent, conversations, messages, and customers.',
          'Use the trend panel to view conversation volume across daily, weekly, or monthly intervals.',
          'Review Sentiment Breakdown to see whether conversations are positive, neutral, or negative.',
          'Read Top Asked Question to identify repeated customer needs.',
          'Use these observations to improve prompts, knowledge, offers, and operational workflows.',
        ],
        details: [
          'Repeated questions often indicate missing knowledge articles or shortcut prompts.',
          'Negative conversations can signal knowledge gaps, support issues, or unclear product information.',
        ],
        troubleshooting: [
          'If counts seem low, confirm the selected agent is receiving conversations on a connected channel.',
          'If top questions are too generic, improve your knowledge content and prompt structure so the agent can give more specific answers.',
        ],
        related: ['manage-prompts', 'knowledge-overview', 'agent-report'],
      },
    ],
  },
  {
    id: 'knowledge',
    title: 'Knowledge & Prompting',
    description: 'Build the content foundation your agent uses to answer accurately.',
    articles: [
      {
        id: 'knowledge-overview',
        title: 'Manage knowledge articles',
        summary: 'Create, search, edit, order, and remove knowledge entries used by the agent.',
        keywords: ['knowledge', 'content', 'articles', 'tags', 'indexing'],
        overview:
          'The Knowledge page is used for structured content that the agent can retrieve during conversations. Each item has a title, status, tags, updated time, and actions like edit or delete.',
        steps: [
          'Open Knowledge > Contents from the sidebar.',
          'Use Search to find content by title or text.',
          'Use Ordering to sort items such as newest updated first.',
          'Click New to create a new knowledge article.',
          'Write a clear title and content body that answers a real customer question.',
          'Add useful tags so related content is easier to manage.',
          'Save the article and keep status active if it should be used immediately.',
          'Use Edit and Delete actions to maintain content quality over time.',
        ],
        details: [
          'Knowledge works best when each article covers one clear topic.',
          'Titles should match how customers naturally ask questions.',
          'Tags are helpful for grouping by product line, topic, or language.',
        ],
        troubleshooting: [
          'If the agent gives vague answers, replace short placeholder content with complete answers and examples.',
          'If customers ask the same question repeatedly, create a dedicated article instead of hiding the answer inside a long mixed article.',
        ],
        related: ['manage-files', 'manage-prompts', 'website-wordpress'],
      },
      {
        id: 'manage-files',
        title: 'Upload and manage files',
        summary: 'Use files as indexed source material for your agent knowledge base.',
        keywords: ['files', 'documents', 'upload', 'index', 'pdf', 'docs'],
        overview:
          'The Manage Files page is for uploaded documents that support your agent knowledge base. It lists file names and provides actions for maintenance.',
        steps: [
          'Open Knowledge > Documents.',
          'Click Upload Files to add new source documents.',
          'Use descriptive filenames so your team can identify materials later.',
          'Review the file list to confirm uploads were accepted.',
          'Use row actions to edit, reprocess, or remove documents based on your workflow.',
          'Keep only current and relevant files to avoid noisy retrieval results.',
        ],
        details: [
          'Product overviews, SOPs, policies, and service descriptions are good file candidates.',
          'Files should contain finalized information, not brainstorming notes.',
        ],
        troubleshooting: [
          'If the agent cites outdated information, remove or replace the older file version.',
          'If uploads are blocked, check storage and file limits on the Active Plan page.',
        ],
        related: ['knowledge-overview', 'website-wordpress', 'woocommerce-store'],
      },
      {
        id: 'manage-prompts',
        title: 'Create and organize prompt shortcuts',
        summary: 'Use prompts to inject controlled instructions, reusable replies, or priority behaviors.',
        keywords: ['prompts', 'shortcuts', 'query', 'order', 'status'],
        overview:
          'The Manage Prompts page stores structured prompts that can influence how your agent handles specific queries. Each prompt includes order, query trigger, prompt text, shortcut status, and active state.',
        steps: [
          'Open Knowledge > Prompts.',
          'Click Add Prompt to create a new entry.',
          'Set the Order to control priority when multiple prompts could apply.',
          'Write the Query phrase or trigger condition.',
          'Write the Prompt text that should guide the agent when that query is matched.',
          'Enable Shortcut if the prompt should be treated as a direct reusable trigger.',
          'Keep Status active for prompts that should currently run.',
          'Use Edit or Delete actions to maintain prompt quality.',
        ],
        details: [
          'Prompts are useful for frequently repeated business rules such as opening hours, service boundaries, or routing instructions.',
          'Keep prompt text precise so it improves behavior instead of making responses inconsistent.',
        ],
        troubleshooting: [
          'If the agent starts sounding repetitive or rigid, review prompts for over-constrained language.',
          'If a prompt does not seem to apply, verify its query wording and status.',
        ],
        related: ['knowledge-overview', 'dashboard-overview', 'support-inbox'],
      },
      {
        id: 'website-wordpress',
        title: 'Connect and sync a WordPress website',
        summary: 'Index pages and optionally posts from your WordPress site into the agent knowledge base.',
        keywords: ['wordpress', 'website integration', 'sync now', 'posts', 'rest api'],
        overview:
          'The Website (WordPress) Integration page connects a site and pulls indexed content into Virtix. It supports website URL, optional basic auth, an Include Posts toggle, and manual refresh or sync actions.',
        steps: [
          'Open Knowledge > Website (WordPress).',
          'Enter the Website URL.',
          'If your site is protected, fill in the optional Basic Auth Username and Password.',
          'Decide whether Include Posts should be enabled in addition to pages.',
          'Click Connect.',
          'After a successful connection, click Sync Now to fetch and index content.',
          'Review Indexed Website Content to confirm pages or posts were pulled in.',
          'Use Refresh whenever you want to confirm current connection state or indexed results.',
        ],
        details: [
          'WordPress REST API should be available for standard syncing.',
          'Content is re-indexed on each sync, so re-run it after important website updates.',
        ],
        troubleshooting: [
          'If nothing is indexed, verify the URL, site accessibility, and whether basic auth is required.',
          'If pages are indexing but posts are missing, confirm Include Posts is enabled.',
          'If content looks stale, run Sync Now again after website edits.',
        ],
        related: ['knowledge-overview', 'widget-configuration', 'dashboard-overview'],
      },
      {
        id: 'woocommerce-store',
        title: 'Connect WooCommerce and sync products',
        summary: 'Link your store, fetch products, and make the catalog available for search and sales workflows.',
        keywords: ['woocommerce', 'consumer key', 'consumer secret', 'product sync', 'rest api'],
        overview:
          'The WooCommerce Integration page connects your store using the store URL, Consumer Key, and Consumer Secret. It supports product syncing, inactive marking for missing products, search, filters, and indexed product review.',
        steps: [
          'Open Knowledge > WooCommerce Store.',
          'Enter the Store URL for your WooCommerce site.',
          'Paste the Consumer Key and Consumer Secret generated from WooCommerce REST API settings.',
          'Click Connect WooCommerce.',
          'Review the connection status badge to confirm the store is linked.',
          'Set sync options such as per_page, max_pages, and whether missing products should be marked inactive.',
          'Click Sync Now to fetch published products from WooCommerce.',
          'Review Indexed WooCommerce Products and use search or Active only filtering to validate the imported catalog.',
        ],
        details: [
          'This integration feeds the agent with product data for sales answers and product discovery.',
          'WooCommerce can also support direct store order placement when configured in Feature Config.',
        ],
        troubleshooting: [
          'If connection fails, verify the store URL and whether the API keys were created with the correct permissions.',
          'If products are missing, confirm they are published in WooCommerce and within the sync page limits.',
          'If old products should no longer appear, enable the option to mark missing products inactive and run sync again.',
        ],
        related: ['feature-config', 'manage-products', 'manage-orders'],
      },
    ],
  },
  {
    id: 'channels',
    title: 'Channels & Widget',
    description: 'Connect customer-facing channels and deploy your agent where people already talk.',
    articles: [
      {
        id: 'widget-configuration',
        title: 'Customize and embed the website widget',
        summary: 'Control widget appearance, preview the experience, and copy the embed snippet.',
        keywords: ['widget', 'appearance', 'embed snippet', 'colors', 'launcher'],
        overview:
          'The Widget Configuration screen lets you customize the chat widget visually before placing it on your website. It includes preset themes, custom colors, typography, shape controls, live preview, and the generated embed snippet.',
        steps: [
          'Open Integrations > Website Widget.',
          'Choose a Quick Preset such as Cosmic, Ocean, Forest, Flame, Light, or Rose.',
          'Adjust colors for accents, panel background, header text, bubbles, input background, and input text.',
          'Set typography and shape options such as font family, border radius, and launcher size.',
          'Upload a logo or avatar if you want branded chat visuals.',
          'Review the live preview panel to confirm the customer-facing look.',
          'Copy the embed snippet from the right panel.',
          'Paste the snippet into your website before the closing body tag and publish your site.',
        ],
        details: [
          'The preview helps you catch contrast issues before going live.',
          'Appearance settings should match the branding and tone configured in Agent Settings.',
        ],
        troubleshooting: [
          'If the widget does not appear on your site, verify that the snippet was pasted correctly and that the domain is allowed in Agent Settings.',
          'If colors are hard to read, increase contrast between panel and text colors before deployment.',
        ],
        related: ['agent-settings', 'website-wordpress', 'support-inbox'],
      },
      {
        id: 'facebook-messenger',
        title: 'Connect Facebook Messenger',
        summary: 'Attach a Facebook Page so the agent can reply to Messenger conversations.',
        keywords: ['facebook', 'messenger', 'pages', 'connect load pages'],
        overview:
          'The Facebook Messenger integration connects your agent to a Facebook Page. The screen shows requested scopes, an optional test Page ID field, connected pages, and candidate pages you can connect.',
        steps: [
          'Open Integrations > Facebook.',
          'Review the requested permissions to understand what the connection needs.',
          'Optionally paste a Page ID if your page does not appear automatically.',
          'Click Connect / Load Pages.',
          'Select the Facebook Page you want to connect.',
          'Confirm the page appears in Connected Pages with a connected status.',
          'Use Refresh when you need to pull the latest integration state.',
        ],
        details: [
          'Connected Pages lists the exact Facebook asset currently attached to the agent.',
          'The disconnect action is useful when switching pages or moving the channel to another agent.',
        ],
        troubleshooting: [
          'If your page does not appear, verify that the Facebook account used during connection has admin access to the page.',
          'If the wrong page is connected, disconnect it first and reconnect the correct one.',
        ],
        related: ['instagram-dm', 'customers', 'chat-history'],
      },
      {
        id: 'instagram-dm',
        title: 'Connect Instagram direct messages',
        summary: 'Load Instagram professional accounts linked to your Meta pages and attach one to the agent.',
        keywords: ['instagram', 'dm', 'professional account', 'meta'],
        overview:
          'The Instagram DM page is used to connect an Instagram professional account that is linked to your Meta business assets. It shows connected accounts and lets you discover accounts available for connection.',
        steps: [
          'Open Integrations > Instagram.',
          'Click Connect / Load IG Accounts.',
          'Review the detected Instagram accounts and identify the one that belongs to this agent.',
          'Connect the account and confirm it appears under Connected Instagram Accounts.',
          'Use Refresh to verify the connection state after setup changes.',
        ],
        details: [
          'Only eligible Instagram professional accounts linked to your Meta setup will appear.',
          'The page displays the Instagram account and linked page reference so you can verify the mapping.',
        ],
        troubleshooting: [
          'If no account is listed, confirm the Instagram account is a professional account and linked to the correct Facebook Page.',
          'If messages do not reach the agent, refresh the integration and verify the correct account remains connected.',
        ],
        related: ['facebook-messenger', 'customers', 'chat-history'],
      },
      {
        id: 'whatsapp-cloud-api',
        title: 'Connect WhatsApp Cloud API',
        summary: 'Use WhatsApp credentials to connect a business number to the agent.',
        keywords: ['whatsapp', 'cloud api', 'phone number id', 'access token', 'waba'],
        overview:
          'The WhatsApp Cloud API page connects a WhatsApp Business number to your agent. It requires a Phone Number ID and Access Token, and optionally accepts a WABA ID.',
        steps: [
          'Open Integrations > WhatsApp.',
          'Enter the WABA ID if you use it in your Meta setup.',
          'Enter the Phone Number ID.',
          'Paste the WhatsApp Access Token.',
          'Click Connect WhatsApp.',
          'Review Connected WhatsApp Numbers to confirm the number is now attached.',
          'Use Refresh after any credential update or Meta-side change.',
        ],
        details: [
          'Phone Number ID is the core identifier used by the WhatsApp Cloud API connection.',
          'The connected numbers panel helps you confirm whether the agent is already attached to a number.',
        ],
        troubleshooting: [
          'If connection fails, re-check copied credentials for missing or expired tokens.',
          'If the expected number does not appear after connection, refresh and confirm you used the right business asset credentials.',
        ],
        related: ['customers', 'chat-history', 'support-inbox'],
      },
    ],
  },
  {
    id: 'operations',
    title: 'Customers & Operations',
    description: 'Run daily lead, booking, complaint, customer, and support workflows.',
    articles: [
      {
        id: 'customers',
        title: 'Review customers and filter engagement history',
        summary: 'Use customer-level search and message filters to understand who is interacting with the agent.',
        keywords: ['customers', 'customer id', 'messages', 'first seen', 'last seen'],
        overview:
          'The Customers page lists people who have interacted with your agent. It includes customer ID, email, conversation count, message count, first seen, and last seen, plus export and filtering tools.',
        steps: [
          'Open Customers from the sidebar.',
          'Search by email if you need to locate a specific contact.',
          'Use date range, minimum messages, and maximum messages to narrow the list.',
          'Click Apply to run filters or Reset to clear them.',
          'Review each customer row for conversation activity and recency.',
          'Use Export CSV if you need an offline customer activity report.',
        ],
        details: [
          'This page is useful for identifying highly active contacts, new contacts, and quiet segments.',
          'Conversation count and message count help distinguish one-off users from frequent customers.',
        ],
        troubleshooting: [
          'If expected customers do not appear, widen the date range and clear message count filters.',
          'If you need conversation details, move from Customers into Chat History for that contact.',
        ],
        related: ['chat-history', 'manage-leads', 'agent-report'],
      },
      {
        id: 'chat-history',
        title: 'Inspect chat history and export conversation data',
        summary: 'Review message timelines for each customer conversation and filter by date or text.',
        keywords: ['chat history', 'conversation', 'messages', 'export', 'filters'],
        overview:
          'Chat History shows past conversations in a split layout. The left side lists conversations, while the right side shows the message thread for the selected conversation with filters and export controls.',
        steps: [
          'Open Chat History.',
          'Choose a conversation from the left sidebar list.',
          'Use the search field to find text inside the selected conversation.',
          'Optionally set a date range to narrow the visible messages.',
          'Click Apply to run the filter or Reset to clear it.',
          'Use Refresh to load the latest history and Export when you need a downloadable record.',
        ],
        details: [
          'The customer ID and timestamps help support teams reconstruct context quickly.',
          'This page is especially useful for auditing agent answers and preparing manual follow-up.',
        ],
        troubleshooting: [
          'If no messages appear, confirm a conversation is selected.',
          'If you are looking for a customer instead of a message, start from Customers or use the conversation list first.',
        ],
        related: ['customers', 'support-inbox', 'agent-report'],
      },
      {
        id: 'support-inbox',
        title: 'Handle human handover conversations',
        summary: 'Manage conversations that require a human instead of automated handling.',
        keywords: ['support inbox', 'handover', 'human support', 'requested'],
        overview:
          'The Human Handover Inbox is for conversations that need manual intervention. It separates automated traffic from cases that should be handled by a real person.',
        steps: [
          'Open Support Inbox.',
          'Use the status filter to choose which handover state to view, such as Requested.',
          'Select a conversation from the left panel when one is available.',
          'Review the conversation details on the right side.',
          'Respond or continue handling the case according to your team process.',
          'Refresh the inbox to load newly requested handovers.',
        ],
        details: [
          'A zero-state inbox means no conversations currently require human attention.',
          'Human handover is useful for billing exceptions, sensitive complaints, or complex cases the agent should not finalize alone.',
        ],
        troubleshooting: [
          'If you expect handovers but see none, confirm the agent or widget is configured to request human support when needed.',
          'If the list is empty, change the status filter before assuming there are no cases.',
        ],
        related: ['chat-history', 'manage-complaints', 'customers'],
      },
      {
        id: 'manage-leads',
        title: 'Track and qualify leads',
        summary: 'Manage captured leads, inspect contact details, and follow status progression.',
        keywords: ['leads', 'qualified', 'new', 'email', 'phone'],
        overview:
          'The Manage Leads page shows leads collected by the agent. Each row contains the lead name, email, phone number, status, and actions for details, edit, or delete.',
        steps: [
          'Open Leads from the sidebar.',
          'Review the lead list for new or qualified entries.',
          'Use Details to inspect the captured information.',
          'Use Edit to update lead status or correct contact data.',
          'Delete only when the record is invalid or duplicated.',
          'Build a routine for following up qualified leads quickly after capture.',
        ],
        details: [
          'Lead status helps separate fresh inquiries from sales-ready prospects.',
          'This module works best when Lead Generation is enabled in Feature Config.',
        ],
        troubleshooting: [
          'If no leads are appearing, confirm lead generation is enabled and the agent has channels where customers can interact.',
          'If contact details are incomplete, improve the agent flow or prompt strategy so it asks for missing information more clearly.',
        ],
        related: ['feature-config', 'customers', 'dashboard-overview'],
      },
      {
        id: 'manage-bookings',
        title: 'Manage bookings and appointment records',
        summary: 'Review booking titles, times, status, and details for appointment-driven workflows.',
        keywords: ['bookings', 'appointment', 'pending', 'details'],
        overview:
          'The Manage Bookings page lists appointment records created through the agent. It shows title, start time, end time, status, and actions such as details, edit, and delete.',
        steps: [
          'Open Bookings > Manage Bookings.',
          'Review each booking entry for title, time range, and current status.',
          'Use Details to inspect the booking more closely.',
          'Use Edit to correct time, title, or status where your workflow allows it.',
          'Delete only if the booking was created in error.',
        ],
        details: [
          'Pending is a common status when a booking still needs manual confirmation.',
          'This module depends on Bookings being enabled in Feature Config.',
        ],
        troubleshooting: [
          'If bookings are missing, confirm the agent offers appointment scheduling and has valid booking windows configured.',
          'If double-booking risks appear, audit the booking windows and capacity settings next.',
        ],
        related: ['booking-windows', 'feature-config', 'support-inbox'],
      },
      {
        id: 'booking-windows',
        title: 'Set booking windows and capacity',
        summary: 'Control which days and times are available for appointment scheduling.',
        keywords: ['booking windows', 'weekday', 'capacity', 'start time', 'end time'],
        overview:
          'Booking Windows defines your available appointment slots. Each row contains weekday, start time, end time, capacity, and actions to edit or delete the window.',
        steps: [
          'Open Bookings > Booking Windows.',
          'Click Add Window to create availability for a day.',
          'Choose the weekday and define start and end time.',
          'Set capacity to limit how many bookings can be accepted in that window.',
          'Save the window and repeat for other days.',
          'Use Edit to adjust availability and Delete to remove an obsolete time block.',
        ],
        details: [
          'Capacity is important when multiple appointments can occur within the same window.',
          'Consistent window setup improves booking reliability and reduces manual fixes.',
        ],
        troubleshooting: [
          'If customers cannot book times you expect to be open, review whether the correct weekday and time range were saved.',
          'If too many appointments are getting accepted, lower capacity or break large windows into smaller controlled blocks.',
        ],
        related: ['manage-bookings', 'feature-config'],
      },
      {
        id: 'manage-complaints',
        title: 'Track and resolve customer complaints',
        summary: 'Use complaint records to follow customer issues from open to resolution.',
        keywords: ['complaints', 'open', 'in progress', 'customer issues'],
        overview:
          'The Manage Complaints page stores customer complaints with subject, customer reference, status, and action controls. It is useful for follow-up workflows beyond live chat.',
        steps: [
          'Open Complaints from the sidebar.',
          'Review the complaint subject and associated customer number.',
          'Use Details to inspect the issue.',
          'Update the complaint with Edit as work progresses.',
          'Move the status through your workflow, such as Open to In Progress and then resolution.',
          'Delete only invalid or accidental records.',
        ],
        details: [
          'This page is best for issue tracking rather than live back-and-forth messaging.',
          'Complaint records help your team avoid losing track of unresolved customer problems.',
        ],
        troubleshooting: [
          'If a complaint should have become a human support case, coordinate it with Support Inbox instead of leaving it isolated.',
          'If duplicate complaints appear, consolidate your intake logic and prompt wording.',
        ],
        related: ['support-inbox', 'chat-history', 'customers'],
      },
    ],
  },
  {
    id: 'commerce',
    title: 'Commerce & Reporting',
    description: 'Maintain products, offers, orders, and performance reports.',
    articles: [
      {
        id: 'manage-products',
        title: 'Manage products and stock visibility',
        summary: 'Review product names, SKU, price, stock, status, and low-stock risks.',
        keywords: ['products', 'sku', 'stock', 'price', 'active', 'low stock'],
        overview:
          'Manage Products is the internal product catalog screen. It includes product totals, active product counts, low or critical stock counts, search, status filtering, and row actions.',
        steps: [
          'Open Commerce > Products.',
          'Review the summary cards for total products, active products, and low or critical stock.',
          'Use search by name or SKU to find a specific item.',
          'Apply the status filter when you only want active or inactive products.',
          'Use Edit to update product information and Delete to remove obsolete products.',
          'Monitor stock counts regularly so the agent does not promote unavailable products.',
        ],
        details: [
          'Low stock indicators help both your team and your agent stay aligned with inventory reality.',
          'Products can be maintained internally or sourced from WooCommerce depending on your setup.',
        ],
        troubleshooting: [
          'If product data is missing and you use WooCommerce, run a fresh sync from the WooCommerce integration page.',
          'If the agent still recommends unavailable products, check whether the product was marked inactive or whether sync is outdated.',
        ],
        related: ['woocommerce-store', 'manage-offers', 'manage-orders'],
      },
      {
        id: 'manage-orders',
        title: 'Review and manage orders',
        summary: 'Track order status, totals, and customer records for internal or store-routed orders.',
        keywords: ['orders', 'new order', 'paid orders', 'details', 'status'],
        overview:
          'The Manage Orders page lists orders with ID, customer reference, status, total amount, creation time, and action controls. It also surfaces total, new, and paid order counts.',
        steps: [
          'Open Commerce > Orders.',
          'Review the top summary cards to understand current volume.',
          'Use the status filter to narrow the list.',
          'Open Details to inspect a specific order.',
          'Use Edit to update order-related information based on your operating process.',
          'Delete only invalid or duplicated orders.',
        ],
        details: [
          'Internal and WooCommerce-routed orders may behave differently depending on Feature Config.',
          'The summary cards are useful for spotting backlog growth or payment delays.',
        ],
        troubleshooting: [
          'If orders are not appearing, confirm Orders is enabled in Feature Config and that the order provider is set correctly.',
          'If you expected paid orders but only see new ones, verify payment completion on the connected store or internal workflow.',
        ],
        related: ['feature-config', 'manage-products', 'agent-report'],
      },
      {
        id: 'manage-offers',
        title: 'Create and monitor promotional offers',
        summary: 'Run time-bound offers with scope, activation status, and lifecycle control.',
        keywords: ['offers', 'promotion', 'scope', 'starts at', 'ends at'],
        overview:
          'The Manage Offers page stores promotions that your team wants the agent to reference. It shows total offers, active offers, offers running now, and the main list with title, timing, scope, and actions.',
        steps: [
          'Open Commerce > Offers.',
          'Click Add Offer to create a new campaign.',
          'Set the offer title, activation state, start time, end time, and scope.',
          'Save the offer and confirm it appears in the list.',
          'Use the Active filter to focus on active or inactive campaigns.',
          'Edit offers when campaign timing or scope changes, and delete expired records you no longer need.',
        ],
        details: [
          'Scope shows how many products are included in the offer.',
          'Running Now is useful for operational awareness during live promotions.',
        ],
        troubleshooting: [
          'If an offer is not influencing conversations, confirm it is active and the date window includes the current time.',
          'If products are missing from an offer scope, review the product list or sync state before blaming the campaign.',
        ],
        related: ['manage-products', 'manage-orders', 'dashboard-overview'],
      },
      {
        id: 'agent-report',
        title: 'Use agent reports for conversation analysis',
        summary: 'Filter and export detailed conversation records, prompts, responses, and dates.',
        keywords: ['reports', 'export csv', 'conversation id', 'query', 'prompt', 'response'],
        overview:
          'The Agent Report page provides a report-style table of conversation records. It includes search, date range, customer ID, conversation filters, pagination, reload, and CSV export.',
        steps: [
          'Open Reports from the sidebar.',
          'Use search to find a specific query or message.',
          'Set start and end dates if you need a limited time range.',
          'Filter by customer ID or conversation when necessary.',
          'Click Apply Filters to update the table.',
          'Use Reload if you want the latest data from the server.',
          'Click Export CSV to download the current report view.',
        ],
        details: [
          'The table includes query, prompt, response, and timestamp so you can audit how the agent answered.',
          'This report is useful for QA, compliance checks, and prompt tuning.',
        ],
        troubleshooting: [
          'If the export looks incomplete, review active filters before downloading again.',
          'If you need more context than the report table gives, inspect the same customer in Chat History.',
        ],
        related: ['chat-history', 'dashboard-overview', 'customers'],
      },
    ],
  },
];

const flattenArticles = (sections) =>
  sections.flatMap((section) =>
    section.articles.map((article) => ({
      ...article,
      sectionId: section.id,
      sectionTitle: section.title,
      sectionDescription: section.description,
    }))
  );

const HelpCenter = () => {
  const [query, setQuery] = useState('');
  const allArticles = useMemo(() => flattenArticles(HELP_SECTIONS), []);
  const [selectedArticleId, setSelectedArticleId] = useState(allArticles[0]?.id ?? '');

  const filteredSections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return HELP_SECTIONS;

    return HELP_SECTIONS.map((section) => {
      const sectionMatches =
        section.title.toLowerCase().includes(needle) ||
        section.description.toLowerCase().includes(needle);

      const articles = section.articles.filter((article) => {
        const haystack = [
          article.title,
          article.summary,
          article.overview,
          ...(article.keywords || []),
          ...(article.steps || []),
          ...(article.details || []),
          ...(article.troubleshooting || []),
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(needle);
      });

      if (sectionMatches) {
        return section;
      }

      if (articles.length) {
        return { ...section, articles };
      }

      return null;
    }).filter(Boolean);
  }, [query]);

  const filteredArticles = useMemo(() => flattenArticles(filteredSections), [filteredSections]);

  useEffect(() => {
    if (!filteredArticles.length) return;

    const selectedStillVisible = filteredArticles.some((article) => article.id === selectedArticleId);
    if (!selectedStillVisible) {
      setSelectedArticleId(filteredArticles[0].id);
    }
  }, [filteredArticles, selectedArticleId]);

  const selectedArticle =
    filteredArticles.find((article) => article.id === selectedArticleId) ?? filteredArticles[0] ?? null;

  const selectedSection = useMemo(() => {
    if (!selectedArticle) return filteredSections[0] ?? null;
    return filteredSections.find((section) => section.id === selectedArticle.sectionId) ?? filteredSections[0] ?? null;
  }, [filteredSections, selectedArticle]);

  const getRelatedArticles = (article) =>
    (article?.related || [])
      .map((relatedId) => allArticles.find((item) => item.id === relatedId))
      .filter(Boolean);

  return (
    <section className="bg-[#f8fafc] py-20">
      <div className="container mt-15 max-w-6xl space-y-6 text-[#0C0900]">
        <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold leading-tight">Help Center</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#0C0900]/68">
                Find a guide, open the topic, and follow the steps.
              </p>
            </div>

            <a
              href="/"
              className="inline-flex items-center gap-2 self-start rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#0C0900] transition hover:border-[#6200ff]/30 hover:text-[#6200ff]"
            >
              Go to Virtix
              <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#f9fafb] px-4 py-3">
            <Search size={18} className="text-[#6200ff]" />
            <input
              type="search"
              placeholder="Search guides"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm text-[#0C0900] placeholder:text-[#0C0900]/40 focus:outline-none"
            />
          </div>

          {filteredSections.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {filteredSections.map((section) => {
                const isSelected = section.id === selectedSection?.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setSelectedArticleId(section.articles[0]?.id ?? '')}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      isSelected
                        ? 'border-[#6200ff]/20 bg-[#f5efff] text-[#6200ff]'
                        : 'border-[#E5E7EB] bg-white text-[#0C0900]/75 hover:border-[#6200ff]/20 hover:text-[#6200ff]'
                    }`}
                  >
                    {section.title}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {filteredArticles.length ? (
          <div className="grid gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">
            <aside className="rounded-[28px] border border-[#E5E7EB] bg-white p-4 lg:sticky lg:top-24 lg:h-fit">
              <div className="border-b border-[#EFEFF4] pb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6200ff]">
                  {selectedSection?.title || 'Collection'}
                </p>
                <h3 className="mt-2 text-xl font-bold">
                  {selectedSection?.articles.length || 0} guide{(selectedSection?.articles.length || 0) > 1 ? 's' : ''}
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#0C0900]/60">{selectedSection?.description}</p>
              </div>

              <div className="mt-4 space-y-2">
                {(selectedSection?.articles || []).map((article) => {
                  const isActive = article.id === selectedArticle?.id;

                  return (
                    <button
                      key={article.id}
                      type="button"
                      onClick={() => setSelectedArticleId(article.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-[#6200ff]/18 bg-[#f7f2ff]'
                          : 'border-[#ECECF2] bg-white hover:border-[#6200ff]/16 hover:bg-[#faf7ff]'
                      }`}
                    >
                      <p className={`text-sm font-semibold ${isActive ? 'text-[#6200ff]' : 'text-[#0C0900]'}`}>
                        {article.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#0C0900]/58">{article.summary}</p>
                    </button>
                  );
                })}
              </div>
            </aside>

            <article className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 md:p-8">
              {selectedArticle ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f5efff] px-3 py-1 text-xs font-semibold text-[#6200ff]">
                      {selectedArticle.sectionTitle}
                    </span>
                    <span className="rounded-full border border-[#E5E7EB] px-3 py-1 text-xs text-[#0C0900]/60">
                      {selectedArticle.keywords.length} keywords
                    </span>
                  </div>

                  <h2 className="mt-4 text-3xl font-bold leading-tight">{selectedArticle.title}</h2>
                  <p className="mt-3 text-base leading-7 text-[#0C0900]/70">{selectedArticle.summary}</p>

                  <div className="mt-6 rounded-[24px] border border-[#EEF0F4] bg-[#fafbfd] px-5 py-5 text-sm leading-7 text-[#0C0900]/78">
                    {selectedArticle.overview}
                  </div>

                  <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#0C0900]/55">Steps</h3>
                      <ol className="mt-4 space-y-3">
                        {selectedArticle.steps.map((step, index) => (
                          <li key={step} className="flex gap-3 text-sm leading-7 text-[#0C0900]/76">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6200ff] text-xs font-bold text-white">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#0C0900]/55">Details</h3>
                        <div className="mt-3 space-y-2">
                          {selectedArticle.details.map((detail) => (
                            <div
                              key={detail}
                              className="rounded-2xl border border-[#ECECF2] bg-[#fcfcfe] px-4 py-3 text-sm leading-6 text-[#0C0900]/72"
                            >
                              {detail}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#A11A1A]/70">
                          Troubleshooting
                        </h3>
                        <div className="mt-3 space-y-2">
                          {selectedArticle.troubleshooting.map((item) => (
                            <div
                              key={item}
                              className="rounded-2xl border border-[#FFD9D9] bg-[#fff8f8] px-4 py-3 text-sm leading-6 text-[#7A2E2E]"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {getRelatedArticles(selectedArticle).length ? (
                    <div className="mt-8">
                      <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#0C0900]/55">
                        Related guides
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {getRelatedArticles(selectedArticle).map((relatedArticle) => (
                          <button
                            key={relatedArticle.id}
                            type="button"
                            onClick={() => setSelectedArticleId(relatedArticle.id)}
                            className="rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#0C0900]/75 transition hover:border-[#6200ff]/30 hover:text-[#6200ff]"
                          >
                            {relatedArticle.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}
            </article>
          </div>
        ) : (
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold">No matching articles</h2>
            <p className="mt-2 text-sm text-[#0C0900]/65">
              Try a broader keyword like bookings, Facebook, WooCommerce, profile, or reports.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default HelpCenter;
