import { useEffect, useState } from "react";
import { Typography, Spin, Result, Button } from "antd";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { postData } from "../../scripts/api-service";
import { handleApiError } from "../../scripts/helper";

const { Title, Text } = Typography;

// Make sure this points to /api/user/confirm-email/
const CONFIRM_EMAIL = "api/user/confirm-email/";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const key = params.get("key");
  const navigate = useNavigate();

  const [state, setState] = useState({ loading: true, ok: false, error: "" });

  useEffect(() => {
    const run = async () => {
      if (!key) {
        setState({ loading: false, ok: false, error: "Missing verification key." });
        return;
      }

      try {
        // IMPORTANT: your backend expects { key: "..." }
        await postData(CONFIRM_EMAIL, { key }, true);
        setState({ loading: false, ok: true, error: "" });

        // redirect to signin after 2 seconds
        setTimeout(() => navigate("/signin", { replace: true }), 2000);
      } catch (e) {
        const msg = handleApiError(e) || "Verification failed.";
        setState({ loading: false, ok: false, error: msg });
      }
    };

    run();
  }, [key, navigate]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 text-center">
          <Spin size="large" />
          <Title level={3} className="!mt-4">Verifying your email…</Title>
          <Text className="text-gray-600">Please wait a moment.</Text>
        </div>
      </div>
    );
  }

  if (state.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 p-4">
        <Result
          status="success"
          title="Email verified!"
          subTitle="Redirecting you to sign in…"
          extra={[
            <Button type="primary" key="signin" onClick={() => navigate("/signin", { replace: true })}>
              Go to Sign in
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 p-4">
      <Result
        status="error"
        title="Verification failed"
        subTitle={state.error}
        extra={[
          <Link to="/signup" key="signup"><Button>Try signup again</Button></Link>,
          <Link to="/signin" key="signin"><Button type="primary">Go to Sign in</Button></Link>,
        ]}
      />
    </div>
  );
}