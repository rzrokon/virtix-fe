import { Button, Typography } from "antd";
import { useLocation, Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function CheckEmail() {
  const location = useLocation();
  const email = location.state?.email || "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
        <Title level={2} className="!mb-2">Verify your email</Title>
        <Text className="text-gray-600 block mb-4">
          We sent a verification link to {email ? <b>{email}</b> : "your email"}.
          <br />
          Please open your inbox and click the button to confirm.
        </Text>

        <div className="flex gap-2">
          <Link to="/signin">
            <Button type="primary">Go to Sign in</Button>
          </Link>
          <Button onClick={() => window.location.reload()}>I didn’t get it</Button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Tip: Check Spam/Junk if you don’t see it.
        </div>
      </div>
    </div>
  );
}