import { CameraOutlined, UserOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  Row,
  Select,
  Spin,
  Switch,
  Typography,
  Upload
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { GET_USER_PROFILE, UPDATE_PROFILE_PHOTO, UPDATE_USER_PROFILE } from '../../../scripts/api';
import { getData, putData } from '../../../scripts/api-service';
import { getAuthToken } from '../../../scripts/helper';

const { Title, Text } = Typography;
const { Option } = Select;

const UserProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Fetch user profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await getData(GET_USER_PROFILE);

      if (response) {
        const data = response;
        setProfileData(data);

        // Set form values
        form.setFieldsValue({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          organization: data.organization || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
          date_of_birth: data.date_of_birth ? dayjs(data.date_of_birth) : null,
          gender: data.gender || '',
          theme: data.theme || 'light',
          language: data.language || 'en',
          voice: data.voice || 'en',
          subscribe_to_notification: data.subscribe_to_notification === true || data.subscribe_to_notification === 'True'
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      message.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const handleUpdateProfile = async (values) => {
    try {
      setUpdating(true);

      // Format the data according to API requirements
      const updateData = {
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
        organization: values.organization,
        address: values.address,
        city: values.city,
        country: values.country,
        date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
        gender: values.gender,
        theme: values.theme,
        language: values.language,
        voice: values.voice,
        subscribe_to_notification: values.subscribe_to_notification ? 'True' : 'False'
      };

      const response = await putData(UPDATE_USER_PROFILE, updateData);

      if (response) {
        message.success('Profile updated successfully!');
        // Refresh profile data
        await fetchProfileData();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (file) => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }

    // Validate file size (max 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }

    try {
      setUploadingPhoto(true);

      const formData = new FormData();
      formData.append('photo', file);

      const token = getAuthToken();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.virtixai.com/';
      const url = `${baseUrl}${UPDATE_PROFILE_PHOTO}`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        message.success('Profile photo updated successfully!');
        // Refresh profile data to get the new photo URL
        await fetchProfileData();
      } else {
        throw new Error('Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      message.error('Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
    }

    // Return false to prevent default upload behavior
    return false;
  };

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (profileData?.photo) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.virtixai.com/';
      // Remove leading slash if present to avoid double slashes
      const photoPath = profileData.photo.startsWith('/') ? profileData.photo.slice(1) : profileData.photo;
      return `${baseUrl}${photoPath}`;
    }
    return null;
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              size={80}
              src={getProfileImageUrl()}
              icon={!getProfileImageUrl() ? <UserOutlined /> : null}
              style={{ marginBottom: '16px' }}
            />
            <Upload
              beforeUpload={handlePhotoUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button
                type="primary"
                shape="circle"
                size="small"
                icon={<CameraOutlined />}
                loading={uploadingPhoto}
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '-8px',
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              />
            </Upload>
          </div>
          <Title level={2} style={{ margin: 0 }}>
            {profileData?.first_name} {profileData?.last_name}
          </Title>
          <Text type="secondary">{profileData?.email}</Text>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          style={{ marginTop: '24px' }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="First Name"
                name="first_name"
                rules={[{ required: true, message: 'Please enter your first name' }]}
              >
                <Input placeholder="Enter your first name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Last Name"
                name="last_name"
                rules={[{ required: true, message: 'Please enter your last name' }]}
              >
                <Input placeholder="Enter your last name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
              >
                <Input disabled placeholder="Email address" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Phone Number"
                name="phone_number"
              >
                <Input placeholder="Enter your phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Date of Birth"
                name="date_of_birth"
              >
                <DatePicker style={{ width: '100%' }} placeholder="Select date of birth" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Gender"
                name="gender"
              >
                <Select placeholder="Select gender">
                  <Option value="MALE">Male</Option>
                  <Option value="FEMALE">Female</Option>
                  <Option value="OTHER">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Organization"
            name="organization"
          >
            <Input placeholder="Enter your organization" />
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
          >
            <Input.TextArea rows={3} placeholder="Enter your address" />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="City"
                name="city"
              >
                <Input placeholder="Enter your city" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Country"
                name="country"
              >
                <Input placeholder="Enter your country" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Preferences</Divider>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Theme"
                name="theme"
              >
                <Select>
                  <Option value="light">Light</Option>
                  <Option value="dark">Dark</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Language"
                name="language"
              >
                <Select>
                  <Option value="en">English</Option>
                  <Option value="es">Spanish</Option>
                  <Option value="fr">French</Option>
                  <Option value="de">German</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Voice"
                name="voice"
              >
                <Select>
                  <Option value="en">English</Option>
                  <Option value="es">Spanish</Option>
                  <Option value="fr">French</Option>
                  <Option value="de">German</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Subscribe to Notifications"
            name="subscribe_to_notification"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginTop: '32px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={updating}
              size="large"
              style={{ minWidth: '120px' }}
            >
              {updating ? 'Updating...' : 'Update Profile'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UserProfile;