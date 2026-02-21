import { Button, Divider, Form, Input, Typography, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { REGISTER_USER } from "../../scripts/api";
import { postData } from "../../scripts/api-service";
import { handleApiError, setAuthToken } from "../../scripts/helper";

const { Title, Text } = Typography;

// ✅ Your backend Google endpoint
const GOOGLE_LOGIN_API = "api/user/google/"; // adjust if your api-service needs full URL

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [form] = Form.useForm();
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

            // depending on your postData wrapper, tokens might be in res.data or res directly
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

      // Render the button
      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = ""; // prevent duplicate rendering
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          width: 380,
          text: "continue_with",
        });
      }
    };

    // GIS script loads async; wait for it
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer);
        initGoogle();
      }
    }, 200);

    return () => clearInterval(timer);
  }, [navigate]);

  // ---------- Email signup ----------
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const signupData = {
        email: values.email,
        password1: values.password,
        password2: values.confirmPassword,
      };

      const res = await postData(REGISTER_USER, signupData, true);

      if (res) {
        message.success("Account created successfully! Please check your email for verification.");
        form.resetFields();
        setTimeout(() => navigate("/signin"), 800);
      } else {
        message.error("Registration failed. Please try again.");
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      message.error(errorMessage || "Registration failed. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 p-4 py-12">
      {/* Animated blob backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "700ms" }}
        ></div>
        <div
          className="absolute bottom-20 left-40 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "1000ms" }}
        ></div>
      </div>

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 sm:p-10 mt-10">
        {/* Header */}
        <div className="text-center mb-6">
          <Title level={2} className="mb-2 text-gray-900">
            Create Your Account
          </Title>
          <Text className="text-gray-500 text-sm block">
            Start in seconds with Google or email.
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

        {/* Email Form */}
        <Form
          form={form}
          name="signup"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            label={<span className="text-gray-700 font-medium text-sm">Email Address</span>}
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
            className="mb-4"
          >
            <Input
              placeholder="Enter your email"
              size="large"
              className="rounded-lg bg-gray-50 border-gray-200"
              style={{ padding: "10px 12px" }}
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700 font-medium text-sm">Password</span>}
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
            className="mb-4"
          >
            <Input.Password
              placeholder="Create a password"
              size="large"
              className="rounded-lg bg-gray-50 border-gray-200"
              style={{ padding: "10px 12px" }}
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-700 font-medium text-sm">Confirm Password</span>}
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) return Promise.resolve();
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
            className="mb-5"
          >
            <Input.Password
              placeholder="Confirm your password"
              size="large"
              className="rounded-lg bg-gray-50 border-gray-200"
              style={{ padding: "10px 12px" }}
            />
          </Form.Item>

          <Form.Item className="mb-4">
            <Button type="primary" htmlType="submit" size="large" loading={loading} block>
              Create account
            </Button>
          </Form.Item>
        </Form>

        {/* Footer */}
        <div className="text-center">
          <Text className="text-gray-500 text-sm">
            Already have an account?{" "}
            <Link to="/signin" className="text-purple-600 hover:text-purple-700 font-semibold no-underline">
              Sign in
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}