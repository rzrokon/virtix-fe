import { Button, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { PASSWORD_RESET_CONFIRM } from '../../scripts/api';
import { postData } from '../../scripts/api-service';
import { handleApiError } from '../../scripts/helper';

const { Title, Text } = Typography;

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const uid = searchParams.get('uid');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await postData(PASSWORD_RESET_CONFIRM, {
        uid: uid || 'NA',
        token: token,
        new_password1: values.password,
        new_password2: values.confirmPassword
      }, true);
      
      if (res) {
        setIsSubmitted(true);
        message.success('Password reset successful! You can now sign in with your new password.');
      } else {
        message.error('Failed to reset password. Please try again.');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      message.error(errorMessage || 'Failed to reset password. Please try again.');
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 p-4">
        {/* Animated blob backgrounds */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>
          <div className="absolute bottom-20 left-40 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 w-xl bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Title level={2} className="!mb-2 !text-gray-900">
              Password Reset Successful
            </Title>
            <Text className="text-gray-500 text-sm">
              Your password has been successfully reset. You can now sign in with your new password.
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
              onClick={() => navigate('/signin')}
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 p-4">
      {/* Animated blob backgrounds */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      {/* Reset Password Form Card */}
      <div className="relative z-10 w-xl bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2 !text-gray-900">
            Reset Password
          </Title>
          <Text className="text-gray-500 text-sm">
            Enter your new password below.
          </Text>
        </div>

        {/* Form */}
        <Form
          name="resetPassword"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          {/* Password Field */}
          <Form.Item
            label={<span className="text-gray-700 font-medium">New Password</span>}
            name="password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
            className="mb-4"
          >
            <Input.Password
              placeholder="Enter your new password"
              size="large"
              className="rounded-lg bg-gray-50 border-gray-200 hover:border-purple-400 focus:border-purple-500"
            />
          </Form.Item>

          {/* Confirm Password Field */}
          <Form.Item
            label={<span className="text-gray-700 font-medium">Confirm New Password</span>}
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your new password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
            className="mb-6"
          >
            <Input.Password
              placeholder="Confirm your new password"
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
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Form.Item>
        </Form>

        {/* Back to Login */}
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
  );
}

export default ResetPassword;