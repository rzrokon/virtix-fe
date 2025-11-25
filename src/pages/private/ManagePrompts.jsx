import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Switch,
  Table
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CREATE_PROMPT, DELETE_PROMPT, GET_PROMPTS, UPDATE_PROMPT } from '../../scripts/api';
import { deleteData, getData, postData, putData } from '../../scripts/api-service';

const { TextArea } = Input;
const { Option } = Select;

export default function ManagePrompts() {
  const { id: agentId } = useParams();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Fetch prompts on component mount
  useEffect(() => {
    fetchPrompts();
  }, [agentId]);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const response = await getData(`${GET_PROMPTS}?agent=${agentId}&ordering=order`);
      setPrompts(response.results || response);
    } catch (error) {
      message.error('Failed to fetch prompts');
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrompt = async (values) => {
    setSubmitting(true);
    try {
      const promptData = {
        ...values,
        agent: parseInt(agentId)
      };
      await postData(CREATE_PROMPT, promptData);
      message.success('Prompt created successfully');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchPrompts();
    } catch (error) {
      message.error('Failed to create prompt');
      console.error('Error creating prompt:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPrompt = async (values) => {
    setSubmitting(true);
    try {
      const promptData = {
        ...values,
        agent: parseInt(agentId)
      };
      await putData(`${UPDATE_PROMPT}${editingPrompt.id}/`, promptData);
      message.success('Prompt updated successfully');
      setEditModalVisible(false);
      editForm.resetFields();
      setEditingPrompt(null);
      fetchPrompts();
    } catch (error) {
      message.error('Failed to update prompt');
      console.error('Error updating prompt:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePrompt = async (promptId) => {
    try {
      await deleteData(`${DELETE_PROMPT}${promptId}/`);
      message.success('Prompt deleted successfully');
      fetchPrompts();
    } catch (error) {
      message.error('Failed to delete prompt');
      console.error('Error deleting prompt:', error);
    }
  };

  const openEditModal = (prompt) => {
    setEditingPrompt(prompt);
    editForm.setFieldsValue({
      query: prompt.query,
      prompt: prompt.prompt,
      shortcut: prompt.shortcut,
      order: prompt.order,
      status: prompt.status
    });
    setEditModalVisible(true);
  };

  const columns = [
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: 'Query',
      dataIndex: 'query',
      key: 'query',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Prompt',
      dataIndex: 'prompt',
      key: 'prompt',
      render: (text) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: 'Shortcut',
      dataIndex: 'shortcut',
      key: 'shortcut',
      width: 100,
      render: (shortcut) => (
        <span className={`px-2 py-1 rounded text-xs ${shortcut ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
          {shortcut ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <span className={`px-2 py-1 rounded text-xs ${status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            className="text-blue-600 hover:text-blue-800"
          />
          <Popconfirm
            title="Delete Prompt"
            description="Are you sure you want to delete this prompt?"
            onConfirm={() => handleDeletePrompt(record.id)}
            okText="Yes"
            cancelText="No"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:text-red-800"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Manage Prompts
          </h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Add Prompt
          </Button>
        </div>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={prompts}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} prompts`,
            }}
          />
        </Spin>
      </Card>

      {/* Create Prompt Modal */}
      <Modal
        title="Create New Prompt"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreatePrompt}
          className="mt-4"
        >
          <Form.Item
            name="query"
            label="Query"
            rules={[{ required: true, message: 'Please enter a query' }]}
          >
            <Input placeholder="Enter query text" />
          </Form.Item>

          <Form.Item
            name="prompt"
            label="Prompt"
            rules={[{ required: true, message: 'Please enter a prompt' }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter prompt text"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="order"
              label="Order"
              rules={[{ required: true, message: 'Please enter order' }]}
              initialValue={1}
            >
              <InputNumber
                min={1}
                placeholder="Order"
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
              initialValue="ACTIVE"
            >
              <Select placeholder="Select status">
                <Option value="ACTIVE">Active</Option>
                <Option value="INACTIVE">Inactive</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="shortcut"
            label="Shortcut"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setCreateModalVisible(false);
                createForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              Create Prompt
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Prompt Modal */}
      <Modal
        title="Edit Prompt"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setEditingPrompt(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditPrompt}
          className="mt-4"
        >
          <Form.Item
            name="query"
            label="Query"
            rules={[{ required: true, message: 'Please enter a query' }]}
          >
            <Input placeholder="Enter query text" />
          </Form.Item>

          <Form.Item
            name="prompt"
            label="Prompt"
            rules={[{ required: true, message: 'Please enter a prompt' }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter prompt text"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="order"
              label="Order"
              rules={[{ required: true, message: 'Please enter order' }]}
            >
              <InputNumber
                min={1}
                placeholder="Order"
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select placeholder="Select status">
                <Option value="ACTIVE">Active</Option>
                <Option value="INACTIVE">Inactive</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="shortcut"
            label="Shortcut"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setEditModalVisible(false);
                editForm.resetFields();
                setEditingPrompt(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              Update Prompt
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
