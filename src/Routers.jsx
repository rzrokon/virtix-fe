import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ScrollToTop from './components/common/ScrollToTop.jsx';
import UserProfile from './components/pages/profile/UserProfile.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import CreateAgentLayout from './layouts/CreateAgentLayout.jsx';
import PrivateLayout from './layouts/PrivateLayout.jsx';
import PublicLayout from './layouts/publicLayout.jsx';

import ForgetPassword from './pages/auth/ForgetPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import ChangePassword from './pages/private/ChangePassword.jsx';
import Signin from './pages/auth/Signin.jsx';
import Signup from './pages/auth/Signup.jsx';
import CheckEmail from './pages/auth/CheckEmail.jsx';
import VerifyEmail from './pages/auth/VerifyEmail.jsx';

import AgentReport from './pages/private/AgentReport.jsx';
import ChatWidget from './pages/private/ChatWidget.jsx';
import AgentInfo from './pages/private/AgentInfo.jsx';
import AgentFeatures from './pages/private/AgentFeatures';
import ChatHistory from './pages/private/ChatHistory.jsx';
import Dashboard from './pages/private/Dashboard.jsx';
import Customers from './pages/private/Customers.jsx';
import AgentDashboard from './pages/private/AgentDashboard.jsx';
import Knowledge from './pages/private/knowledge.jsx';
import ManageFiles from './pages/private/ManageFiles.jsx';
import ManagePrompts from './pages/private/ManagePrompts.jsx';
import MetaConnectFacebook from './pages/private/MetaConnectFacebook.jsx';
import MetaConnectInstagram from './pages/private/MetaConnectInstagram.jsx';
import MetaConnectWhatsApp from './pages/private/MetaConnectWhatsApp.jsx';
import WebsiteIntegration from './pages/private/WebsiteIntegration.jsx';
import WooCommerceIntegration from './pages/private/WooCommerceIntegration.jsx';
import ShopifyIntegration from './pages/private/ShopifyIntegration.jsx';

import ManageLeads from './pages/private/ManageLeads.jsx';
import ManageBookings from './pages/private/ManageBookings.jsx';
import ManageBookingWindows from './pages/private/ManageBookingWindows.jsx';
import ManageComplaints from './pages/private/ManageComplaints.jsx';

import ManageProducts from './pages/private/ManageProducts';
import ManageOffers from './pages/private/ManageOffers';
import ManageOrders from './pages/private/ManageOrders';

import ActivePlan from './pages/private/ActivePlan';
import ChoosePlan from './pages/public/ChoosePlan';

import RequireAuth from './components/common/RequireAuth';
import RequireActivePlan from './components/common/RequireActivePlan';

import Contact from './pages/public/Contact.jsx';
import Features from './pages/public/Features.jsx';
import Home from './pages/public/Home.jsx';
import About from './pages/public/About.jsx';
import Pricing from './pages/public/Pricing.jsx';
import BillingSuccess from './pages/public/BillingSuccess.jsx';
import PrivacyPolicy from './pages/public/PrivacyPolicy.jsx';
import RefundPolicy from './pages/public/RefundPolicy.jsx';
import Terms from './pages/public/Terms.jsx';
import HelpCenter from './pages/public/HelpCenter.jsx';

import SupportInboxPage from './pages/private/SupportInboxPage.jsx';

export default function Routers() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* PUBLIC WEBSITE */}
        <Route path='/' element={<PublicLayout />}>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/features' element={<Features />} />
          <Route path='/pricing' element={<Pricing />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/help-center' element={<HelpCenter />} />
          <Route path='/privacy-policy' element={<PrivacyPolicy />} />
          <Route path='/refund-policy' element={<RefundPolicy />} />
          <Route path='/terms' element={<Terms />} />
          <Route path='/billing/success' element={<BillingSuccess />} />
        </Route>

        {/* AUTH */}
        <Route path='/' element={<AuthLayout />}>
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/forget-password' element={<ForgetPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* PRIVATE ROOT AREA (logged-in pages) */}
        <Route path='/' element={<CreateAgentLayout />}>
          {/* choose plan needs only token (no plan yet) */}
          <Route
            path='/choose-plan'
            element={
              <RequireAuth>
                <ChoosePlan />
              </RequireAuth>
            }
          />

          {/* these require active plan */}
          <Route
            path='/dashboard'
            element={
              <RequireActivePlan>
                <Dashboard />
              </RequireActivePlan>
            }
          />
          <Route
            path='/profile'
            element={
                <UserProfile />
            }
          />
          <Route
            path='/active-plan'
            element={
              <RequireActivePlan>
                <ActivePlan />
              </RequireActivePlan>
            }
          />
          <Route
          path='/change-password'
          element={
              <ChangePassword />
          }
        />
        </Route>

        {/* AGENT DASHBOARD */}
        <Route path='/:id/agent-dashboard' element={<PrivateLayout />}>
          <Route index element={<AgentDashboard />} />
          <Route path='/:id/agent-dashboard/chat-history' element={<ChatHistory />} />
          <Route path='/:id/agent-dashboard/chat-history/:customerId' element={<ChatHistory />} />
          <Route path='/:id/agent-dashboard/manage-prompts' element={<ManagePrompts />} />
          <Route path='/:id/agent-dashboard/documents' element={<ManageFiles />} />
          <Route path='/:id/agent-dashboard/customers' element={<Customers />} />
          <Route path='/:id/agent-dashboard/chat-widget' element={<ChatWidget />} />
          <Route path='/:id/agent-dashboard/agent-info' element={<AgentInfo />} />
          <Route path="/:id/agent-dashboard/features" element={<AgentFeatures />} />
          <Route path='/:id/agent-dashboard/contents' element={<Knowledge />} />
          <Route path='/:id/agent-dashboard/report' element={<AgentReport />} />
          <Route path='/:id/agent-dashboard/leads' element={<ManageLeads />} />
          <Route path='/:id/agent-dashboard/bookings' element={<ManageBookings />} />
          <Route path='/:id/agent-dashboard/booking-windows' element={<ManageBookingWindows />} />
          <Route path='/:id/agent-dashboard/complaints' element={<ManageComplaints />} />
          <Route path='/:id/agent-dashboard/products' element={<ManageProducts />} />
          <Route path='/:id/agent-dashboard/offers' element={<ManageOffers />} />
          <Route path='/:id/agent-dashboard/orders' element={<ManageOrders />} />
          <Route path="/:id/agent-dashboard/facebook" element={<MetaConnectFacebook />} />
          <Route path="/:id/agent-dashboard/instagram" element={<MetaConnectInstagram />} />
          <Route path="/:id/agent-dashboard/whatsapp" element={<MetaConnectWhatsApp />} />
          <Route path="/:id/agent-dashboard/website" element={<WebsiteIntegration />} />
          <Route path="/:id/agent-dashboard/woocommerce" element={<WooCommerceIntegration />} />
          <Route path="/:id/agent-dashboard/shopify" element={<ShopifyIntegration />} />
          <Route path='/:id/agent-dashboard/support' element={<SupportInboxPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
