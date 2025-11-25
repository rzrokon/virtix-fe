import { Button, Form, Input, Typography, message, Select, DatePicker } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { REGISTER_USER } from '../../scripts/api';
import { postData } from '../../scripts/api-service';
import { handleApiError } from '../../scripts/helper';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Format the data according to API requirements
      const signupData = {
        email: values.email,
        password1: values.password,
        password2: values.confirmPassword,
        first_name: values.firstName,
        last_name: values.lastName,
        date_of_birth: values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : '',
        gender: values.gender || 'MALE',
        phone_number: values.phone,
        organization: values.organization || '',
        address: values.address || '',
        city: values.city || '',
        country: values.country || '',
        theme: 'light',
        language: 'en',
        voice: 'en',
        subscribe_to_notification: 'False'
      };

      const res = await postData(REGISTER_USER, signupData, true);
      
      if (res) {
        message.success('Account created successfully! Please check your email for verification.');
        form.resetFields();
        // Redirect to signin page after successful registration
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        message.error('Registration failed. Please try again.');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      message.error(errorMessage || 'Registration failed. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 p-4 py-12">
      {/* Animated blob backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '700ms' }}></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>

      {/* Signup Card */}
      <div className="relative z-10 w-full md:w-xl bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="mb-2 text-gray-900">
            Create Your Account
          </Title>
          <Text className="text-gray-500 text-sm block">
            Please tell us a little bit about your company and use case, and we’ll be in touch soon.
          </Text>
        </div>

        {/* Form */}
        <Form
          form={form}
          name="signup"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          {/* First Name Field */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Form.Item
              label={<span className="text-gray-700 font-medium text-sm">First Name</span>}
              name="firstName"
              rules={[
                { required: true, message: 'Please input your first name!' },
                { min: 2, message: 'First name must be at least 2 characters!' }
              ]}
            >
              <Input
                placeholder="Enter your first name"
                size="large"
                className="rounded-lg bg-gray-50 border-gray-200"
                style={{ padding: '10px 12px' }}
              />
            </Form.Item>

            {/* Last Name Field */}
            <Form.Item
              label={<span className="text-gray-700 font-medium text-sm">Last Name</span>}
              name="lastName"
              rules={[
                { required: true, message: 'Please input your last name!' },
                { min: 2, message: 'Last name must be at least 2 characters!' }
              ]}
            >
              <Input
                placeholder="Enter your last name"
                size="large"
                className="rounded-lg bg-gray-50 border-gray-200"
                style={{ padding: '10px 12px' }}
              />
            </Form.Item>
          </div>

          {/* Email Field */}
          <Form.Item
            label={<span className="text-gray-700 font-medium text-sm">Email Address</span>}
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
            className="mb-4"
          >
            <Input
              placeholder="Enter your email"
              size="large"
              className="rounded-lg bg-gray-50 border-gray-200"
              style={{ padding: '10px 12px' }}
            />
          </Form.Item>

          {/* Phone Field */}
          <Form.Item
            label={<span className="text-gray-700 font-medium text-sm">Phone Number</span>}
            name="phone"
            rules={[
              { required: true, message: 'Please input your phone number!' },
              { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid phone number!' }
            ]}
            className="mb-4"
          >
            <Input
              placeholder="Enter your phone number"
              size="large"
              className="rounded-lg bg-gray-50 border-gray-200"
              style={{ padding: '10px 12px' }}
            />
          </Form.Item>

          {/* Date of Birth and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Form.Item
              label={<span className="text-gray-700 font-medium text-sm">Date of Birth</span>}
              name="dateOfBirth"
              rules={[
                { required: true, message: 'Please select your date of birth!' }
              ]}
            >
              <DatePicker
                placeholder="Select date of birth"
                size="large"
                className="w-full rounded-lg bg-gray-50 border-gray-200"
                style={{ padding: '10px 12px' }}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium text-sm">Gender</span>}
              name="gender"
              rules={[
                { required: true, message: 'Please select your gender!' }
              ]}
            >
              <Select
                placeholder="Select gender"
                size="large"
                className="rounded-lg"
              >
                <Option value="MALE">Male</Option>
                <Option value="FEMALE">Female</Option>
                <Option value="OTHER">Other</Option>
              </Select>
            </Form.Item>
          </div>

          {/* Organization Field */}
          <Form.Item
            label={<span className="text-gray-700 font-medium text-sm">Organization</span>}
            name="organization"
            className="mb-4"
          >
            <Input
              placeholder="Enter your organization (optional)"
              size="large"
              className="rounded-lg bg-gray-50 border-gray-200"
              style={{ padding: '10px 12px' }}
            />
          </Form.Item>

          {/* Address Field */}
          <Form.Item
            label={<span className="text-gray-700 font-medium text-sm">Address</span>}
            name="address"
            className="mb-4"
          >
            <Input
              placeholder="Enter your address (optional)"
              size="large"
              className="rounded-lg bg-gray-50 border-gray-200"
              style={{ padding: '10px 12px' }}
            />
          </Form.Item>

          {/* City and Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Form.Item
              label={<span className="text-gray-700 font-medium text-sm">City</span>}
              name="city"
            >
              <Input
                placeholder="Enter your city (optional)"
                size="large"
                className="rounded-lg bg-gray-50 border-gray-200"
                style={{ padding: '10px 12px' }}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium text-sm">Country</span>}
              name="country"
            >
              <Input
                placeholder="Enter your country (optional)"
                size="large"
                className="rounded-lg bg-gray-50 border-gray-200"
                style={{ padding: '10px 12px' }}
              />
            </Form.Item>
          </div>

          {/* Password Field */}
          <Form.Item
            label={<span className="text-gray-700 font-medium text-sm">Password</span>}
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
            className="mb-4"
          >
            <Input.Password
              placeholder="Create a password"
              size="large"
              className="rounded-lg bg-gray-50 border-gray-200"
              style={{ padding: '10px 12px' }}
            />
          </Form.Item>

          {/* Confirm Password Field */}
          <Form.Item
            label={<span className="text-gray-700 font-medium text-sm">Confirm Password</span>}
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
            className="mb-5"
          >
            <Input.Password
              placeholder="Confirm your password"
              size="large"
              className="rounded-lg bg-gray-50 border-gray-200"
              style={{ padding: '10px 12px' }}
            />
          </Form.Item>

          {/* Terms & Conditions */}
          {/* <Form.Item
            name="terms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('Please accept the terms and conditions!')),
              },
            ]}
            className="mb-6"
          >
            <Checkbox className="text-gray-600">
              <span className="text-sm">
                I agree to the{' '}
                <a href="#" className="text-purple-600 hover:text-purple-700 font-medium no-underline">
                  Terms and Conditions
                </a>
              </span>
            </Checkbox>
          </Form.Item> */}

          {/* Submit Button */}
          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              Create account
            </Button>
          </Form.Item>
        </Form>

        {/* Footer */}
        <div className="text-center">
          <Text className="text-gray-500 text-sm">
            Already have an account?{' '}
            <Link 
              to="/signin"
              className="text-purple-600 hover:text-purple-700 font-semibold no-underline"
            >
              Sign in
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}