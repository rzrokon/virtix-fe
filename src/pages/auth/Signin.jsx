import { Button, Checkbox, Divider, Form, Input, Typography, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LOGIN_USER } from "../../scripts/api";
import { postData } from "../../scripts/api-service";
import { handleApiError, setAuthToken } from "../../scripts/helper";

const { Title, Text } = Typography;

const GOOGLE_LOGIN_API = "api/user/google/"; // your backend endpoint

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const googleBtnRef = useRef(null);

  // ---------- Google Sign-In init ----------
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID missing in .env");
      return;
    }

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp) => {
          const credential = resp?.credential;
          if (!credential) {
            message.error("Google credential missing");
            return;
          }

          setGoogleLoading(true);
          try {
            const res = await postData(GOOGLE_LOGIN_API, { credential }, true);

            const access = res?.data?.access || res?.access;
            const refresh = res?.data?.refresh || res?.refresh;

            if (access && refresh) {
              setAuthToken(access, refresh);
              message.success("Signed in with Google!");
              navigate("/home", { replace: true });
            } else {
              message.error("Invalid token response from server");
            }
          } catch (e) {
            message.error(handleApiError(e) || "Google sign-in failed");
            console.error(e);
          } finally {
            setGoogleLoading(false);
          }
        },
      });

      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          width: 380,
          text: "continue_with",
        });
      }
    };

    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer);
        initGoogle();
      }
    }, 200);

    return () => clearInterval(timer);
  }, [navigate]);

  // ---------- Email/password login ----------
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await postData(
        LOGIN_USER,
        {
          email: values.email,
          password: values.password,
        },
        true
      );

      const access = res?.data?.access || res?.access;
      const refresh = res?.data?.refresh || res?.refresh;

      if (access) {
        setAuthToken(access, refresh);
        message.success("Login successful!");
        navigate("/home", { replace: true });
      } else {
        message.error("Invalid response from server");
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      message.error(errorMessage || "Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-xl bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
        <div className="text-center mb-6">
          <Title level={2} className="!mb-2 !text-gray-900">
            Welcome Back! Please log in
          </Title>
          <Text className="text-gray-500 text-sm">
            Use Google or your email & password.
          </Text>
        </div>

        {/* ✅ Google Button */}
        <div className="flex justify-center mb-3">
          <div ref={googleBtnRef} />
        </div>
        {googleLoading && (
          <div className="text-center text-sm text-gray-500 mb-2">Signing in with Google…</div>
        )}

        <Divider plain className="!my-4">or</Divider>

        <Form name="login" layout="vertical" onFinish={onFinish} autoComplete="off" requiredMark={false}>
          <Form.Item
            label={<span className="text-gray-700 font-medium">Email</span>}
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Enter your email" className="h-12 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500" />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700 font-medium">Password</span>}
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password placeholder="Enter your password" className="h-12 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500" />
          </Form.Item>

          <div className="flex items-center justify-between mb-6">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="text-gray-600">Remember me</Checkbox>
            </Form.Item>
            <Link to="/forget-password" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Forgot password?
            </Link>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 text-base font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-6">
          <Text className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-semibold">
              Sign up
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}
