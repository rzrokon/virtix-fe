import { Button, Typography, message } from "antd";
import { useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { postData } from "../../scripts/api-service";
import { RESEND_VERIFY_EMAIL } from "../../scripts/api";
import { handleApiError } from "../../scripts/helper";

const { Title, Text } = Typography;

export default function CheckEmail() {
  const location = useLocation();
  const email = location.state?.email || "";
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    if (!email) {
      message.error("Email not found. Please sign up again.");
      return;
    }
    setLoading(true);
    try {
      await postData(RESEND_VERIFY_EMAIL, { email }, true);
      message.success("Verification email sent again. Please check your inbox.");
    } catch (e) {
      message.error(handleApiError(e) || "Failed to resend email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
        <Title level={2} className="!mb-2">Verify your email</Title>
        <Text className="text-gray-600 block mb-4">
          We sent a verification link to {email ? <b>{email}</b> : "your email"}.
          <br />Open your inbox and click the button to confirm.
        </Text>

        <div className="flex gap-2 flex-wrap">
          <Button type="primary" loading={loading} onClick={resend}>
            Resend verification email
          </Button>

          <Link to="/signin">
            <Button>Go to Sign in</Button>
          </Link>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Tip: Check Spam/Junk. Email delivery can take a minute.
        </div>
      </div>
    </div>
  );
}