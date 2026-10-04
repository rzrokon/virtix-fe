import { useEffect } from 'react';
import { ASK_BUY_SHOPIFY_URL } from '../../constants/askBuy';

export default function ShopifyRedirect() {
  useEffect(() => {
    window.location.replace(ASK_BUY_SHOPIFY_URL);
  }, []);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#6200FF]">Shopify</p>
        <h1 className="mt-3 text-3xl font-bold text-[#0C0900]">Opening Ask &amp; Buy</h1>
        <p className="mt-3 text-[#0C0900]/65">Our Shopify-native AI sales assistant is available on the Shopify App Store.</p>
        <a
          href={ASK_BUY_SHOPIFY_URL}
          className="mt-6 inline-flex rounded-xl bg-[#6200FF] px-5 py-3 font-semibold text-white"
        >
          Install Ask &amp; Buy
        </a>
      </div>
    </main>
  );
}
