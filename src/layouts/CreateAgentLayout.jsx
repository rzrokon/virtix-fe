
import {
  UploadOutlined
} from '@ant-design/icons';
import { Button, Form, Input, Layout, message, Modal, theme, Typography, Upload } from 'antd';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import UserMenu from '../components/common/privateLayout/UserMenu';
import { useContentApi } from '../contexts/ContentApiContext';
import { CREATE_AGENT } from '../scripts/api';
import { postData } from '../scripts/api-service';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CreateAgentLayout() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { refreshAgents } = useContentApi();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const token = Cookies.get('kotha_token');


  const handleModalClose = () => {
    setOpen(false);
    setCurrentStep(1);
    form.resetFields();
  };

  const handleCreate = async (values) => {
    try {
      // Create FormData for multipart form data
      const formData = new FormData();
      // Append text fields
      formData.append('agent_name', values.agent_name);
      formData.append('agent_heading', values.agent_heading);
      formData.append('agent_description', values.agent_description);
      formData.append('site_title', values.site_title);
      formData.append('site_description', values.site_description);
      formData.append('site_keywords', values.site_keywords);

      // Handle file uploads
      if (values.logo_light) {
        formData.append('logo_light', values.logo_light.file);
      }

      if (values.logo_dark) {
        formData.append('logo_dark', values.logo_dark.file);
      }

      if (values.thumb) {
        formData.append('thumb', values.thumb.file);
      }

      if (values.favicon) {
        formData.append('favicon', values.favicon.file);
      }

      // Make API call using the CREATE_AGENT endpoint
      const response = await postData(CREATE_AGENT, formData);

      if (response) {
        if (response.error) {
          message.error('Agent created failed!');
          return;
        }
        message.success('Agent created successfully!');
        refreshAgents(); // Refresh agents list from context
        handleModalClose();
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      message.error('Failed to create agent. Please try again.');
    }
  };


  const uploadProps = {
    beforeUpload: (file) => {
      const isValidType = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg';
      if (!isValidType) {
        message.error('You can only upload PNG, JPG, or JPEG files!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
      }
      return false; // Prevent automatic upload
    },
    multiple: true,
  };


  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]);

  useEffect(() => {
    const handleOpenModal = () => setOpen(true);
    window.addEventListener('open-create-agent', handleOpenModal);
    return () => window.removeEventListener('open-create-agent', handleOpenModal);
  }, []);

  return (
    <div>
      <Header style={{ display: 'flex', alignItems: 'center', background: colorBgContainer }} className='!pl-4, private-header' >
        <Link to="/" className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              src="/assets/logo/Logo.svg"
              alt="VIRTIS AI"
              className="h-8 w-auto"
            />
          </div>
        </Link>

        <div className='ml-auto space-x-4'>
          <Button type="primary" onClick={() => { setOpen(true) }}>Create Agent</Button>
          <UserMenu />
        </div>
      </Header>
      <Outlet />

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>Create agent</span>
          </div>
        }
        open={open}
        footer={null}
        onCancel={handleModalClose}
        width={600}
        styles={{
          body: { padding: '24px' }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          size="large"
          onFinish={handleCreate}
        >
          <Form.Item
            label="Agent name"
            name="agent_name"
            rules={[
              { required: true, message: 'Please enter agent name!' },
              {
                pattern: /^[a-zA-Z0-9_-]+$/,
                message: 'Enter a valid "slug" consisting of letters, numbers, underscores or hyphens.'
              }
            ]}
          >
              <Input placeholder="Write" /> 
          </Form.Item>

          <Form.Item
            label="Agent Heading"
            name="agent_heading"
            rules={[{ required: true, message: 'Please enter agent heading!' }]}
          >
            <Input placeholder="Write" />
          </Form.Item>

          <Form.Item
            label="Agent Description"
            name="agent_description"
            rules={[{ required: true, message: 'Please enter agent description!' }]}
          >
            <TextArea rows={4} placeholder="Write" />
          </Form.Item>

          <Form.Item
            label="Site Title"
            name="site_title"
            rules={[{ required: true, message: 'Please enter site title!' }]}
          >
            <Input placeholder="Write" />
          </Form.Item>

          <Form.Item
            label="Site Description"
            name="site_description"
            rules={[{ required: true, message: 'Please enter site description!' }]}
          >
            <TextArea rows={3} placeholder="Write" />
          </Form.Item>

          <Form.Item
            label="Site Keywords"
            name="site_keywords"
            rules={[{ required: true, message: 'Please enter site keywords!' }]}
          >
            <Input placeholder="Write" />
          </Form.Item>

          <Form.Item
            label="Logo Light"
            name="logo_light"
          >
            <Upload {...uploadProps} listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload Logo Light</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Logo Dark"
            name="logo_dark"
          >
            <Upload {...uploadProps} listType="picture" maxCount={1} accept='image/png, image/jpeg, image/jpg'>
              <Button icon={<UploadOutlined />}>Upload Logo Dark</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Thumbnail"
            name="thumb"
          >
            <Upload {...uploadProps} listType="picture" maxCount={1} accept='image/png, image/jpeg, image/jpg'>
              <Button icon={<UploadOutlined />}>Upload Thumbnail</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Favicon"
            name="favicon"
          >
            <Upload {...uploadProps} listType="picture" maxCount={1} accept='image/png, image/jpeg, image/jpg'>
              <Button icon={<UploadOutlined />}>Upload Favicon</Button>
            </Upload>
          </Form.Item>


          <Form.Item label={null}>
            <Button type="primary" htmlType="submit" className='w-full'>
              Submit
            </Button>
          </Form.Item>

        </Form>
      </Modal>
    </div>
  )
}
