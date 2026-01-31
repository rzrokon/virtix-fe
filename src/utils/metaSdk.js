const FB_SDK_ID = "facebook-jssdk";
const FB_SDK_SRC = "https://connect.facebook.net/en_US/sdk.js";
const FB_VERSION = "v20.0";

export function ensureFbSdk(appId) {
  return new Promise(async (resolve, reject) => {
    // already ready
    if (window.FB && window.__FB_READY__) return resolve(window.FB);

    window.__FB_READY__ = window.__FB_READY__ || false;

    // fbAsyncInit must exist before sdk loads
    window.fbAsyncInit = function () {
      try {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: FB_VERSION,
        });
        window.__FB_READY__ = true;
        resolve(window.FB);
      } catch (e) {
        reject(e);
      }
    };

    // inject script once
    if (!document.getElementById(FB_SDK_ID)) {
      const s = document.createElement("script");
      s.id = FB_SDK_ID;
      s.src = FB_SDK_SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => {}; // fbAsyncInit will fire
      s.onerror = () => reject(new Error("Facebook SDK blocked or failed to load"));
      document.head.appendChild(s);
    }

    // wait init
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (window.FB && window.__FB_READY__) {
        clearInterval(timer);
        return resolve(window.FB);
      }
      if (attempts >= 40) {
        clearInterval(timer);
        return reject(new Error("Facebook SDK init timeout"));
      }
    }, 250);
  });
}

export async function fbLogin(appId, scope) {
  const FB = await ensureFbSdk(appId);
  return new Promise((resolve, reject) => {
    FB.login(
      (resp) => {
        const token = resp?.authResponse?.accessToken;
        if (!token) return reject(new Error("Facebook login cancelled"));
        resolve(token);
      },
      {
        scope,
        auth_type: "rerequest",
        return_scopes: true,
      }
    );
  });
}