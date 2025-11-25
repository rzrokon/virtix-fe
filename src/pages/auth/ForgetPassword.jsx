import { Button, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PASSWORD_RESET } from '../../scripts/api';
import { postData } from '../../scripts/api-service';
import { handleApiError } from '../../scripts/helper';

const { Title, Text } = Typography;

function ForgetPassword() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await postData(PASSWORD_RESET, {
        email: values.email
      }, true);
      
      if (res) {
        setEmail(values.email);
        setEmailSent(true);
        message.success('Password reset email sent successfully! Please check your email.');
      } else {
        message.error('Failed to send reset email. Please try again.');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      message.error(errorMessage || 'Failed to send reset email. Please try again.');
      console.error('Password reset error:', error);
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

      {/* Forget Password Form Card */}
      {!emailSent ? (
        <div className="relative z-10 w-xl bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Title level={2} className="!mb-2 !text-gray-900">
              Forgot Password?
            </Title>
            <Text className="text-gray-500 text-sm">
              To reset your password, please enter your email address.
            </Text>
          </div>

          {/* Form */}
          <Form
            name="forgetPassword"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            {/* Email Field */}
            <Form.Item
              label={<span className="text-gray-700 font-medium">Email Address</span>}
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
              className="mb-5"
            >
              <Input
                placeholder="Enter your email address"
                size="large"
                className="rounded-lg bg-gray-50 border-gray-200 hover:border-purple-400 focus:border-purple-500"
              />
            </Form.Item>

            {/* Submit Button */}
            <Form.Item className="mb-6">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0 rounded-lg text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </Button>
            </Form.Item>
          </Form>

          {/* Back to Login */}
          <div className="text-center">
            <Text className="text-gray-500 text-sm">
              Remember your password?{' '}
              <Link 
                to="/signin"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Back to Sign In
              </Link>
            </Text>
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-xl bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Title level={2} className="!mb-2 !text-gray-900">
              Check Your Email
            </Title>
            <Text className="text-gray-500 text-sm">
              We sent a password reset link to <strong>{email}</strong>. 
              Please check your email and follow the instructions to reset your password.
            </Text>
          </div>

          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              type="primary"
              size="large"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0 rounded-lg text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
            >
              Send Another Email
            </Button>
            
            <div className="text-center">
              <Text className="text-gray-500 text-sm">
                <Link 
                  to="/signin"
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Back to Sign In
                </Link>
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForgetPassword;