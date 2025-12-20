import {
  AppstoreOutlined,
  CloseOutlined,
  EditOutlined,
  MoreOutlined,
  ReloadOutlined,
  RobotOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  UploadOutlined
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Form,
  Input,
  Modal,
  Progress,
  Radio,
  Row,
  Segmented,
  Space,
  Statistic,
  Tag,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [indexModalVisible, setIndexModalVisible] = useState(false);
  const [indexFresh, setIndexFresh] = useState(true);
  const [indexing, setIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(0);

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
      // Index agent
      setSelectedAgent(agent);
      setIndexFresh(true);
      setIndexProgress(0);
      setIndexModalVisible(true);
    }
  };

  const handleIndexAgent = async () => {
    if (!selectedAgent) return;

    setIndexing(true);
    setIndexProgress(12);
    const tick = setInterval(() => {
      setIndexProgress((prev) => (prev < 88 ? prev + 6 : prev));
    }, 300);

    try {
      const slug = selectedAgent?.agent_name || 'kotha';
      const res = await postData(`api/agent/${slug}/index/`, { fresh: indexFresh });
      const data = res?.data ?? res;

      const cleanError = (val) => {
        if (typeof val !== 'string') return 'Index request failed';
        const looksLikeHtml = /<[^>]+>/.test(val);
        return looksLikeHtml ? 'Index request failed' : val;
      };

      if (data?.ok || (res?.status && res.status >= 200 && res.status < 300)) {
        setIndexProgress(100);
        message.success('Agent indexing triggered successfully');
        setTimeout(() => setIndexModalVisible(false), 500);
      } else if (data?.error) {
        const errMsg = cleanError(data.errors || data.error);
        message.error(errMsg);
      } else {
        setIndexProgress(100);
        message.success('Index request sent');
        setTimeout(() => setIndexModalVisible(false), 500);
      }
    } catch (error) {
      console.error('Index agent error:', error);
      message.error('Failed to index agent');
    } finally {
      clearInterval(tick);
      setIndexing(false);
      setTimeout(() => setIndexProgress(0), 600);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAgents();
    } catch (error) {
      console.error('Error refreshing agents:', error);
      message.error('Unable to refresh agents right now.');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredAgents = (agents?.results || []).filter((agent) => {
    const haystack = `${agent.agent_name ?? ''} ${agent.agent_heading ?? ''} ${agent.agent_description ?? ''}`.toLowerCase();
    return haystack.includes(searchTerm.trim().toLowerCase());
  });

  const totalAgents = agents?.count ?? agents?.results?.length ?? 0;

  // Fetch agents when component mounts
  useEffect(() => {
    fetchAgents();
  }, []);

  const indexLabel = indexFresh ? 'Index with fresh=true' : 'Index without fresh';

  const scrollToList = () => {
    const target = document?.getElementById('agent-list');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openCreateAgentModal = () => {
    window.dispatchEvent(new CustomEvent('open-create-agent'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {showWelcome && (
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
            <div className="absolute inset-0 opacity-60 pointer-events-none">
              <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.08),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_25%)]" />
            </div>
            <div className="relative grid lg:grid-cols-2 gap-6 p-6 md:p-10">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  Agents overview
                </span>
                <Title level={2} className="!m-0 !text-slate-900">
                  Command center for every agent
                </Title>
                <Text className="text-slate-600 text-base">
                  Review welcome messages, jump into dashboards, and keep each agent healthy with quick edit, delete, and indexing controls.
                </Text>
                <div className="flex flex-col gap-3 mt-3">
                  <Button
                    type="primary"
                    size="large"
                    icon={<AppstoreOutlined />}
                    onClick={openCreateAgentModal}
                    className="bg-indigo-600 border-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                  >
                    Create Agent
                  </Button>
                  <div className="pt-1">
                    <Space wrap>
                      <Button
                        type="default"
                        icon={<ReloadOutlined />}
                        loading={refreshing}
                        onClick={handleRefresh}
                      >
                        Sync agents
                      </Button>
                      <Button type="default" onClick={scrollToList}>
                        Go to list
                      </Button>
                      <Button type="text" icon={<CloseOutlined />} onClick={() => setShowWelcome(false)}>
                        Hide banner
                      </Button>
                    </Space>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Card className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white" bodyStyle={{ padding: '16px' }}>
                  <Statistic title="Agents live" value={totalAgents} valueStyle={{ fontWeight: 700, color: '#312e81' }} />
                  <Text className="text-slate-500 text-sm">Each agent can be opened, edited, or indexed.</Text>
                </Card>
                <Card className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white" bodyStyle={{ padding: '16px' }}>
                  <Statistic title="Views" value={viewMode === 'grid' ? 'Grid' : 'List'} valueStyle={{ fontWeight: 700, color: '#0369a1' }} />
                  <Text className="text-slate-500 text-sm">Switch layouts to scan faster.</Text>
                </Card>
                <Card className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white" bodyStyle={{ padding: '16px' }}>
                  <Statistic title="Indexing" value="On demand" valueStyle={{ fontWeight: 700, color: '#0f172a' }} />
                  <Text className="text-slate-500 text-sm">Use Index Agent actions for fresh or incremental rebuilds.</Text>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="my-10" id="agent-list">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <Title level={2} className="!m-0 !text-slate-900">
              Agents library
            </Title>
            <Text className="text-slate-500 text-sm">
              Choose an agent to open its dashboard, tweak the welcome message, or rebuild the index.
            </Text>
          </div>
          <Space wrap>
            <Input
              allowClear
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search by name, heading, or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!w-[260px]"
            />
            <Segmented
              options={[
                { label: <Space size={6}><AppstoreOutlined /> Grid</Space>, value: 'grid' },
                { label: <Space size={6}><UnorderedListOutlined /> List</Space>, value: 'list' }
              ]}
              value={viewMode}
              onChange={setViewMode}
            />
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={refreshing}>
              Refresh
            </Button>
            <Tag color="default" className="!rounded-full !px-3 !py-1">
              {filteredAgents.length} / {totalAgents} showing
            </Tag>
          </Space>
        </div>

        {filteredAgents.length ? (
          viewMode === 'grid' ? (
            <Row gutter={[20, 20]}>
              {filteredAgents.map((agent) => (
                <Col key={agent.id} xs={24} sm={12} lg={8} xl={6}>
                  <Card
                    hoverable
                    className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm"
                    styles={{
                      body: {
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <Space align="center" size={12}>
                        <Avatar size={54} icon={<RobotOutlined />} className="bg-indigo-600 text-white" />
                        <div>
                          <Title level={4} className="!m-0 !text-slate-900">
                            {agent.agent_name}
                          </Title>
                          <Text className="text-slate-500 text-xs uppercase tracking-wide">
                            {agent.agent_heading || 'Welcome message'}
                          </Text>
                        </div>
                      </Space>
                      <Dropdown
                        menu={{
                          items: [
                            { key: '1', label: <Space><EditOutlined /> Edit Agent</Space> },
                            { key: '3', label: 'Index Agent' },
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
                          className="text-slate-400"
                        />
                      </Dropdown>
                    </div>

                    <div className="flex-1">
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 mb-3">
                        <Text className="text-slate-600 text-sm leading-relaxed">
                          {agent.agent_description || 'No description added yet. Keep this short and welcoming for visitors.'}
                        </Text>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-auto">
                      <Link to={`/${agent.id}/dashboard`} className="w-full">
                        <Button
                          type="primary"
                          className="w-full bg-indigo-600 border-indigo-600 rounded-lg font-medium hover:bg-indigo-700"
                        >
                          Open dashboard
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="space-y-4">
              {filteredAgents.map((agent) => (
                <Card
                  key={agent.id}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm"
                  bodyStyle={{ padding: '18px' }}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                    <Avatar size={60} icon={<RobotOutlined />} className="bg-indigo-600 text-white" />
                    <div className="flex-1 space-y-1">
                      <Space size={8}>
                        <Title level={4} className="!m-0 !text-slate-900">
                          {agent.agent_name}
                        </Title>
                      </Space>
                      <Text className="text-slate-500 text-sm block">
                        {agent.agent_heading || 'Welcome message'}
                      </Text>
                      <Text className="text-slate-600 text-sm">
                        {agent.agent_description || 'No description added yet. Keep this short and welcoming for visitors.'}
                      </Text>
                    </div>
                    <Space wrap>
                      <Link to={`/${agent.id}/dashboard`}>
                        <Button type="primary" className="bg-indigo-600 border-indigo-600 hover:bg-indigo-700">
                          Open dashboard
                        </Button>
                      </Link>
                      <Dropdown
                        menu={{
                          items: [
                            { key: '1', label: <Space><EditOutlined /> Edit Agent</Space> },
                            { key: '3', label: 'Index Agent' },
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
                          className="text-slate-500"
                        />
                      </Dropdown>
                    </Space>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Empty
            description={
              <div className="text-slate-600">
                <p className="font-medium mb-1">No agents yet</p>
                <p className="text-sm">Use the Create Agent button up top to start a new welcome experience.</p>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-10"
          />
        )}
      </div>

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

      <Modal
        title={
          <div className="flex items-center gap-2">
            <span>Index Agent</span>
            {selectedAgent?.agent_name ? <Tag>{selectedAgent.agent_name}</Tag> : null}
          </div>
        }
        open={indexModalVisible}
        onCancel={() => {
          setIndexModalVisible(false);
          setIndexProgress(0);
        }}
        onOk={handleIndexAgent}
        okText="Start indexing"
        confirmLoading={indexing}
      >
        <div className="space-y-4">
          <Text className="text-slate-600 block">
            Choose whether to rebuild from scratch (`fresh=true`) or reuse existing index data.
          </Text>
          <Radio.Group
            value={indexFresh}
            onChange={(e) => setIndexFresh(e.target.value)}
            disabled={indexing}
          >
            <Space direction="vertical">
              <Radio value={true}>fresh=true (full rebuild)</Radio>
              <Radio value={false}>fresh=false (incremental)</Radio>
            </Space>
          </Radio.Group>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <Text strong>Indexing progress</Text>
              <Text type="secondary" className="text-xs uppercase tracking-wide">{indexLabel}</Text>
            </div>
            <Progress percent={indexProgress} status={indexing ? 'active' : undefined} />
          </div>
        </div>
      </Modal>

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
