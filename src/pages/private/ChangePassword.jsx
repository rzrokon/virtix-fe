import { LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Form, Input, Row, Spin, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { CHANGE_PASSWORD } from '../../scripts/api';
import { postData } from '../../scripts/api-service';

const { Title, Text } = Typography;

const ChangePassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // mimic profile page load feel
    const t = setTimeout(() => setLoading(false), 120);
    return () => clearTimeout(t);
  }, []);

  const onFinish = async (values) => {
    setUpdating(true);

    const payload = {
      old_password: values.old_password,
      new_password1: values.new_password1,
      new_password2: values.new_password2,
    };

    try {
      console.log('[ChangePassword] submit payload:', { ...payload, old_password: '***' });

      const res = await postData(CHANGE_PASSWORD, payload);
      const data = res?.data ?? res;

      console.log('[ChangePassword] response:', data);

      if (data?.detail) {
        message.success(data.detail);
        form.resetFields();
        return;
      }

      if (res?.error) {
        const errs = res?.errors || {};
        const firstKey = Object.keys(errs)[0];
        const firstMsg = firstKey ? errs[firstKey] : null;
        message.error(Array.isArray(firstMsg) ? firstMsg[0] : (firstMsg || 'Failed to change password'));
        return;
      }

      message.error('Failed to change password');
    } catch (e) {
      console.error('[ChangePassword] exception:', e);
      message.error('Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(98,0,255,0.12), rgba(0,136,255,0.12))',
              marginBottom: 16,
            }}
          >
            <SafetyOutlined style={{ fontSize: 28, color: '#6200FF' }} />
          </div>

          <Title level={2} style={{ margin: 0 }}>
            Change Password
          </Title>
          <Text type="secondary">Update your password to keep your account secure.</Text>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: '24px' }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Current Password"
                name="old_password"
                rules={[{ required: true, message: 'Please enter your current password' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Enter current password" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <div className="bg-gray-50 rounded-xl p-4" style={{ height: '100%' }}>
                <div className="text-sm font-medium text-gray-800 mb-1">Password tips</div>
                <div className="text-sm text-gray-600">
                  Use at least 8 characters if possible. Combine letters, numbers, and symbols.
                </div>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="New Password"
                name="new_password1"
                rules={[
                  { required: true, message: 'Please enter a new password' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
                hasFeedback
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Confirm New Password"
                name="new_password2"
                dependencies={['new_password1']}
                hasFeedback
                rules={[
                  { required: true, message: 'Please confirm your new password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('new_password1') === value) return Promise.resolve();
                      return Promise.reject(new Error('New passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Action</Divider>

          <Form.Item style={{ marginTop: '8px' }}>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => form.resetFields()} size="large">
                Reset
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                loading={updating}
                size="large"
                style={{ minWidth: '180px', background: '#6200FF', borderColor: '#6200FF' }}
              >
                {updating ? 'Updating...' : 'Change Password'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;