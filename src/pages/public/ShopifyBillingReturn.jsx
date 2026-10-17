import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Compatibility for approval URLs previously issued on the frontend origin.
export default function ShopifyBillingReturn() {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const apiBase = import.meta.env.VITE_BASE_URL;
    if (!apiBase) { setFailed(true); return; }
    const target = new URL('api/integrations/shopify/billing/callback/', `${apiBase.replace(/\/$/, '')}/`);
    if (target.origin === window.location.origin) { setFailed(true); return; }
    const params = new URLSearchParams(window.location.search);
    for (const key of ['state', 'shop', 'charge_id', 'plan_handle']) {
      if (params.has(key)) target.searchParams.set(key, params.get(key));
    }
    window.location.replace(target.toString());
  }, []);
  return <div className="p-8">
    <p>{failed ? 'Unable to complete the billing return. Open your Shopify settings in Virtix to verify your plan.' : 'Returning to Virtix after Shopify approval…'}</p>
    {failed ? <Link to="/dashboard">Open dashboard</Link> : null}
  </div>;
}
