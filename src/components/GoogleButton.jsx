import { useEffect } from "react";
import { message } from "antd";
import { postData } from "../../scripts/api-service";
import { setAuthToken } from "../../scripts/helper";

const GOOGLE_AUTH = "api/auth/google/"; // or your constant

export default function GoogleButton({ onSuccess }) {
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const init = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp) => {
          try {
            const res = await postData(GOOGLE_AUTH, { credential: resp.credential }, true);

            // depending on your postData wrapper:
            const access = res?.data?.access || res?.access;
            const refresh = res?.data?.refresh || res?.refresh;

            if (access && refresh) {
              setAuthToken(access, refresh);
              message.success("Signed in with Google!");
              onSuccess?.();
            } else {
              message.error("Invalid auth response");
            }
          } catch (e) {
            message.error("Google sign-in failed");
            console.error(e);
          }
        },
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: "outline", size: "large", width: 320 }
      );
    };

    // GIS script loads async
    const t = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(t);
        init();
      }
    }, 200);

    return () => clearInterval(t);
  }, [onSuccess]);

  return <div id="google-btn" />;
}