import { BrowserRouter, Route, Routes } from 'react-router-dom';
import UserProfile from './components/pages/profile/UserProfile.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import CreateAgentLayout from './layouts/CreateAgentLayout.jsx';
import PrivateLayout from './layouts/PrivateLayout.jsx';
import PublicLayout from './layouts/publicLayout.jsx';
import ForgetPassword from './pages/auth/ForgetPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import Signin from './pages/auth/Signin.jsx';
import Signup from './pages/auth/Signup.jsx';
import AgentReport from './pages/private/AgentReport.jsx';
import AgentSettings from './pages/private/AgentSettings.jsx';
import ChatHistory from './pages/private/ChatHistory.jsx';
import CreateAgent from './pages/private/CreateAgent.jsx';
import Customers from './pages/private/Customers.jsx';
import Dashboard from './pages/private/Dashboard.jsx';
import Knowledge from './pages/private/knowledge.jsx';
import ManageFiles from './pages/private/ManageFiles.jsx';
import ManagePrompts from './pages/private/ManagePrompts.jsx';
import ManageLeads from './pages/private/ManageLeads.jsx';
import ManageBookings from './pages/private/ManageBookings.jsx';
import ManageBookingWindows from './pages/private/ManageBookingWindows.jsx';
import ManageComplaints from './pages/private/ManageComplaints.jsx';
import ManageProducts from './pages/private/ManageProducts';
import ManageOffers from './pages/private/ManageOffers';
import ManageOrders from './pages/private/ManageOrders';
import Contact from './pages/public/Contact.jsx';
import Features from './pages/public/Features.jsx';
import Home from './pages/public/Home.jsx';
import Pricing from './pages/public/Pricing.jsx';

export default function Routers() {
  return (

    <BrowserRouter>
      <Routes>
        <Route path='/' element={<PublicLayout />}>
          <Route path='/' element={<Home />} />
          <Route path='/features' element={<Features />} />
          <Route path='/pricing' element={<Pricing />} />
          <Route path='/contact' element={<Contact />} />
        </Route>
        <Route path='/' element={<AuthLayout />}>
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/forget-password' element={<ForgetPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
        </Route>
        <Route path='/' element={<CreateAgentLayout />}>
          <Route path='/home' element={<CreateAgent />} />
          <Route path='/profile' element={<UserProfile />} />
        </Route>
        <Route path='/:id/dashboard' element={<PrivateLayout />}>
          <Route path='/:id/dashboard' element={<Dashboard />} />
          <Route path='/:id/dashboard/chat-history/:customerId' element={<ChatHistory />} />
          <Route path='/:id/dashboard/manage-prompts' element={<ManagePrompts />} />
          <Route path='/:id/dashboard/manage-files' element={<ManageFiles />} />
          <Route path='/:id/dashboard/customers' element={<Customers />} />
          <Route path='/:id/dashboard/agent-settings' element={<AgentSettings />} />
          <Route path='/:id/dashboard/knowledge' element={<Knowledge />} />
          <Route path='/:id/dashboard/report' element={<AgentReport />} />
          <Route path="/:id/dashboard/leads" element={<ManageLeads />} />
          <Route path="/:id/dashboard/bookings" element={<ManageBookings />} />
          <Route path="/:id/dashboard/booking-windows" element={<ManageBookingWindows />} />
          <Route path="/:id/dashboard/complaints" element={<ManageComplaints />} />
          <Route path="/:id/dashboard/products" element={<ManageProducts />} />
          <Route path="/:id/dashboard/offers" element={<ManageOffers />} />
          <Route path="/:id/dashboard/orders" element={<ManageOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}