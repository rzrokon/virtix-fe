import { Button, Form, Input, Layout, message, Modal, theme } from 'antd';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import UserMenu from '../components/common/privateLayout/UserMenu';
import { useContentApi } from '../contexts/ContentApiContext';
import { CREATE_AGENT } from '../scripts/api';
import { postData } from '../scripts/api-service';

const { Header } = Layout;
const { TextArea } = Input;

export default function CreateAgentLayout() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { refreshAgents } = useContentApi();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const token = Cookies.get('kotha_token');


  const handleModalClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleCreate = async (values) => {
    try {
      const formData = new FormData();
      formData.append('agent_name', values.agent_name);
      formData.append('agent_heading', values.agent_heading);
      formData.append('agent_description', values.agent_description);

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
      <Header style={{ display: 'flex', alignItems: 'center', background: colorBgContainer }} className='!pl-4 private-header' >
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
            label="Agent Name (slug-safe)"
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
