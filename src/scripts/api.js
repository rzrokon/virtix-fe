// Authentication API endpoints
export const LOGIN_USER = 'api/user/token/'
export const REFRESH_TOKEN = 'api/user/token/refresh/'
export const REGISTER_USER = 'api/user/register/'
export const LOGOUT_USER = 'api/user/logout/'
export const PASSWORD_RESET = 'api/user/password/reset/'
export const PASSWORD_RESET_CONFIRM = 'api/user/password/reset/confirm/'
export const PASSWORD_CHANGE = 'api/user/password/change/'

// User Profile API endpoints
export const GET_USER_PROFILE = 'api/user/profile/'
export const UPDATE_USER_PROFILE = 'api/user/profile/'
export const UPDATE_PROFILE_PHOTO = 'api/user/profile-photo/'

// Agent API endpoints
export const CREATE_AGENT = 'api/agent/agents/'
export const GET_AGENT = 'api/agent/agents/'
export const GET_AGENT_BY_ID = 'api/agent/agents/' // For getting specific agent by ID
export const GET_AGENTS = 'api/agent/agents/'
export const UPDATE_AGENT = 'api/agent/agents/'
export const DELETE_AGENT = 'api/agent/agents/'

// Prompts API endpoints
export const GET_PROMPTS = 'api/agent/prompts/'
export const CREATE_PROMPT = 'api/agent/prompts/'
export const UPDATE_PROMPT = 'api/agent/prompts/'
export const DELETE_PROMPT = 'api/agent/prompts/'

// Files API endpoints
export const GET_FILES = 'api/agent/files/'
export const CREATE_FILE = 'api/agent/files/'
export const UPDATE_FILE = 'api/agent/files/'
export const DELETE_FILE = 'api/agent/files/'

// Billing API endpoints
export const GET_BILLING_PLANS = 'api/billing/plans/'
export const START_SUBSCRIPTION = 'api/billing/me/subscription/start/'

// Leads
export const GET_LEADS = 'api/ops/leads/';
export const UPDATE_LEAD = 'api/ops/leads/';
export const DELETE_LEAD = 'api/ops/leads/';

// Bookings
export const GET_BOOKINGS = 'api/ops/bookings/';
export const UPDATE_BOOKING = 'api/ops/bookings/';
export const DELETE_BOOKING = 'api/ops/bookings/';

// Booking Windows
export const GET_BOOKING_WINDOWS = 'api/ops/booking-windows/';
export const CREATE_BOOKING_WINDOW = 'api/ops/booking-windows/';
export const UPDATE_BOOKING_WINDOW = 'api/ops/booking-windows/';
export const DELETE_BOOKING_WINDOW = 'api/ops/booking-windows/';

// Complaints
export const GET_COMPLAINTS = 'api/ops/complaints/';
export const UPDATE_COMPLAINT = 'api/ops/complaints/';
export const DELETE_COMPLAINT = 'api/ops/complaints/';

// Products
export const GET_PRODUCTS = 'api/ops/products/';
export const CREATE_PRODUCT = 'api/ops/products/';
export const UPDATE_PRODUCT = 'api/ops/products/';
export const DELETE_PRODUCT = 'api/ops/products/';

// Orders
export const GET_ORDERS = 'api/ops/orders/';
export const UPDATE_ORDER = 'api/ops/orders/';
export const DELETE_ORDER = 'api/ops/orders/';

// Offers
export const GET_OFFERS = 'api/ops/offers/';
export const CREATE_OFFER = 'api/ops/offers/';
export const UPDATE_OFFER = 'api/ops/offers/';
export const DELETE_OFFER = 'api/ops/offers/';
