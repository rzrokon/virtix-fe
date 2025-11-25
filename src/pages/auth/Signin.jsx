import { Button, Checkbox, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LOGIN_USER } from '../../scripts/api';
import { postData } from '../../scripts/api-service';
import { handleApiError, setAuthToken } from '../../scripts/helper';

const { Title, Text } = Typography;

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await postData(LOGIN_USER, {
        email: values.email,
        password: values.password
      }, true);

      console.log("res", res);

      if (res && res.data?.access) {
        // Store tokens
        setAuthToken(res.data.access, res.data.refresh);

        // Show success message
        message.success('Login successful!');

        // Redirect to chat page
        navigate('/');
      } else {
        message.error('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      message.error(errorMessage || 'Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 p-4">
      {/* Animated blob backgrounds */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      {/* Login Form Card */}
      <div className="relative z-10 w-xl bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2 !text-gray-900">
            Welcome Back! Please log in
          </Title>
          <Text className="text-gray-500 text-sm">
            Please tell us a little bit about your company and use case,
            <br />
            and we'll be in touch soon.
          </Text>
        </div>

        {/* Form */}
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          {/* Email Field */}
          <Form.Item
            label={<span className="text-gray-700 font-medium">Email</span>}
            name="email"
            rules={[
              {
                required: true,
                message: 'Please input your email!',
              },
              {
                type: 'email',
                message: 'Please enter a valid email!',
              },
            ]}
          >
            <Input
              placeholder="Enter your email"
              className="h-12 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
            />
          </Form.Item>

          {/* Password Field */}
          <Form.Item
            label={<span className="text-gray-700 font-medium">Password</span>}
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              },
              {
                min: 6,
                message: 'Password must be at least 6 characters!',
              },
            ]}
          >
            <Input.Password
              placeholder="Enter your password"
              className="h-12 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500"
            />
          </Form.Item>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mb-6">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="text-gray-600">Remember me</Checkbox>
            </Form.Item>
            <Link
              to="/forget-password"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 text-base font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <Text className="text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Sign up
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}