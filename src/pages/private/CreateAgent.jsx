
import {
  AppstoreOutlined,
  CloseOutlined,
  MoreOutlined,
  RobotOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Typography,
  Upload,
  message
} from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContentApi } from '../../contexts/ContentApiContext';
import { DELETE_AGENT, UPDATE_AGENT } from '../../scripts/api';
import { deleteData, patchData, postData } from '../../scripts/api-service';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CreateAgent() {
  const { agents, fetchAgents, refreshAgents } = useContentApi();
  const [viewMode, setViewMode] = useState('grid');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Edit modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [updating, setUpdating] = useState(false);

  // Upload configuration for edit modal
  const uploadProps = {
    beforeUpload: () => false, // Prevent auto upload
    showUploadList: true,
  };

  const handleEditAgent = async (values) => {
    if (!selectedAgent) return;

    setUpdating(true);
    try {
      const formData = new FormData();

      // Add text fields
      formData.append('agent_name', values.agent_name);
      formData.append('agent_heading', values.agent_heading);
      formData.append('agent_description', values.agent_description);

      // Add file uploads if they exist
      if (values.logo_light && values.logo_light.fileList && values.logo_light.fileList[0]) {
        formData.append('logo_light', values.logo_light.fileList[0].originFileObj);
      }
      if (values.logo_dark && values.logo_dark.fileList && values.logo_dark.fileList[0]) {
        formData.append('logo_dark', values.logo_dark.fileList[0].originFileObj);
      }

      const response = await patchData(`${UPDATE_AGENT}${selectedAgent.id}/`, formData);

      if (response) {
        message.success('Agent updated successfully!');
        setEditModalVisible(false);
        editForm.resetFields();
        refreshAgents(); // Refresh the agent list
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      message.error('Failed to update agent. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;

    setDeleting(true);
    try {
      const response = await deleteData(`${DELETE_AGENT}${selectedAgent.id}/`);
      if (response) {
        message.success('Agent deleted successfully');
        refreshAgents(); // Refresh the agents list
        setDeleteModalVisible(false);
        setSelectedAgent(null);
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      message.error('Failed to delete agent');
    } finally {
      setDeleting(false);
    }
  };

  const handleMenuClick = (e, agent) => {
    if (e.key === '1') {
      // Edit agent
      setSelectedAgent(agent);
      editForm.setFieldsValue({
        agent_name: agent.agent_name,
        agent_heading: agent.agent_heading,
        agent_description: agent.agent_description,
      });
      setEditModalVisible(true);
    } else if (e.key === '2') {
      // Delete agent
      setSelectedAgent(agent);
      setDeleteModalVisible(true);
    } else if (e.key === '3') {
      // Build agent index
      setSelectedAgent(agent);
      Modal.confirm({
        title: 'Build Agent',
        content: 'Trigger rebuilding the agent index with fresh=true?',
        okText: 'Build',
        cancelText: 'Cancel',
        onOk: async () => {
          const hide = message.loading('Building agent...', 0);
          try {
            const slug = agent?.agent_name || 'kotha';
            const res = await postData(`api/agent/${slug}/index/`, { fresh: true });
            const data = res?.data ?? res;

            if (data?.ok || (res?.status && res.status >= 200 && res.status < 300)) {
              message.success('Agent build triggered successfully');
            } else if (data?.error) {
              const errMsg = typeof data?.errors === 'string' ? data.errors : 'Build request failed';
              message.error(errMsg);
            } else {
              message.success('Build request sent');
            }
          } catch (error) {
            console.error('Build agent error:', error);
            message.error('Failed to build agent');
          } finally {
            hide();
          }
        }
      });
    }
  };

  // Fetch agents when component mounts
  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      {/* Welcome Banner */}
      {showWelcome && (
        <Alert
          message={
            <div className="text-center">
              <Title level={2} className="!m-0 !mb-3 !text-gray-800">
                Welcome to VIRTIX AI!
              </Title>
              <Text className="text-gray-500 text-base">
                Your AI agent journey starts here — create, train, and launch
                intelligent agents for your website in minutes.
              </Text>
            </div>
          }
          type="info"
          closable
          closeIcon={<CloseOutlined />}
          onClose={() => setShowWelcome(false)}
          className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300 rounded-2xl mb-8 p-6"
        />
      )}

      {/* All Agents Section */}
      <div className="my-10 ">
        <div className="flex items-center justify-between mb-6">
          <Title level={2} className="!m-0 !text-gray-800">
            All Agents
          </Title>
          <Space>
            <Button
              type={viewMode === 'list' ? 'primary' : 'default'}
              icon={<UnorderedListOutlined />}
              onClick={() => setViewMode('list')}
            />
            <Button
              type={viewMode === 'grid' ? 'primary' : 'default'}
              icon={<AppstoreOutlined />}
              onClick={() => setViewMode('grid')}
            />
          </Space>
        </div>

        {/* Agents Grid */}
        {
          agents?.results?.length ? <Row gutter={[24, 24]}>
            {agents.results.map((agent) => (
              <Col
                key={agent.id}
                xs={24}
                sm={12}
                lg={8}
                xl={6}
              >
                <Card
                  hoverable
                  className="rounded-2xl border border-gray-200 h-full"
                  styles={{
                    body: {
                      padding: '24px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }
                  }}
                >
                  {/* Agent Avatar */}
                  <div className="mb-4">
                    <Avatar
                      size={64}
                      icon={<RobotOutlined />}
                      className="bg-purple-600 text-gray-400"
                    />
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1 mb-6">
                    <Title level={4} className="!m-0 !mb-2 !text-gray-800">
                      {agent.agent_name}
                    </Title>
                    <Text className="text-gray-500 text-sm leading-relaxed">
                      {agent.agent_description}
                    </Text>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex items-center justify-between gap-4' >
                    <Link to={`/${agent.id}/dashboard`} className='w-full '>
                      <Button
                        type="primary"
                        className='w-full  bg-purple-600 border-purple-600 rounded-lg font-medium hover:bg-purple-700'
                      >
                        Try Now
                      </Button>
                    </Link>

                    <Dropdown
                      menu={{
                        items: [
                          { key: '1', label: 'Edit Agent' },
                          { key: '3', label: 'Build Agent' },
                          { key: '2', label: 'Delete Agent' }
                        ],
                        onClick: (e) => handleMenuClick(e, agent),
                      }}
                      trigger={['click']}
                    >
                      <Button
                        color="default"
                        variant="filled"
                        type="text"
                        icon={<MoreOutlined />}
                        className="text-gray-400"
                      />
                    </Dropdown>
                  </div>
                </Card>
              </Col>
            ))}
          </Row> : null
        }
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Agent"
        open={deleteModalVisible}
        onOk={handleDeleteAgent}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedAgent(null);
        }}
        confirmLoading={deleting}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
        }}
      >
        <p>
          Are you sure you want to delete the agent "{selectedAgent?.agent_name}"?
          This action cannot be undone.
        </p>
      </Modal>

      {/* Edit Agent Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <span>Edit Agent</span>
          </div>
        }
        open={editModalVisible}
        footer={null}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
        }}
        width={600}
        styles={{
          body: { padding: '24px' }
        }}
      >
        <Form
          form={editForm}
          layout="vertical"
          size="large"
          onFinish={handleEditAgent}
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

          <Form.Item label={null}>
            <Button
              type="primary"
              htmlType="submit"
              className='w-full'
              loading={updating}
            >
              Update Agent
            </Button>
          </Form.Item>

        </Form>
      </Modal>
    </div>
  );
}
