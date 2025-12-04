import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GET_LEADS, UPDATE_LEAD, DELETE_LEAD } from '../../scripts/api';
import { getData, patchData, deleteData } from '../../scripts/api-service';

const { TextArea } = Input;

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

function getStatusTag(status) {
  switch (status) {
    case 'new':
      return <Tag color="gold">New</Tag>;
    case 'qualified':
      return <Tag color="geekblue">Qualified</Tag>;
    case 'won':
      return <Tag color="green">Won</Tag>;
    case 'lost':
      return <Tag color="red">Lost</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
}

export default function ManageLeads() {
  const { id: agentId } = useParams();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const [editingLead, setEditingLead] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null); // for Details

  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 🔄 Fetch leads on load
  useEffect(() => {
    if (!agentId) return;
    fetchLeads();
  }, [agentId]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      // You can adjust ordering if needed
      const response = await getData(
        `${GET_LEADS}?agent=${agentId}&ordering=-created`
      );
      setLeads(response.results || response);
    } catch (error) {
      console.error('Error fetching leads:', error);
      message.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Details modal
  const openDetailsModal = (lead) => {
    setSelectedLead(lead);
    setDetailsModalVisible(true);
  };

  // ✏️ Edit modal
  const openEditModal = (lead) => {
    setEditingLead(lead);
    editForm.setFieldsValue({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      message: lead.message,
      status: lead.status,
    });
    setEditModalVisible(true);
  };

  const handleEditLead = async (values) => {
    if (!editingLead) return;
    setSubmitting(true);
    try {
      // Send fields to update
      await patchData(`${UPDATE_LEAD}${editingLead.id}/`, values);
      message.success('Lead updated successfully');
      setEditModalVisible(false);
      editForm.resetFields();
      setEditingLead(null);
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      message.error('Failed to update lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async (leadId) => {
    try {
      await deleteData(`${DELETE_LEAD}${leadId}/`);
      message.success('Lead deleted successfully');
      fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
      message.error('Failed to delete lead');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span className="font-medium">{text}</span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 260,
      render: (_, record) => (
        <Space size="small">
          {/* Details Button */}
          <Button
            type="text"
            icon={<InfoCircleOutlined />}
            onClick={() => openDetailsModal(record)}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Details
          </Button>

          {/* Edit Button */}
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </Button>

          {/* Delete Button */}
          <Popconfirm
            title="Delete Lead"
            description="Are you sure you want to delete this lead?"
            onConfirm={() => handleDeleteLead(record.id)}
            okText="Yes"
            cancelText="No"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </Button>
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
            Manage Leads
          </h1>
        </div>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={leads}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} leads`,
            }}
          />
        </Spin>
      </Card>

      {/* 📝 Edit Lead Modal */}
      <Modal
        title="Edit Lead"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setEditingLead(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditLead}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter lead name' }]}
          >
            <Input placeholder="Lead name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input placeholder="Lead email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input placeholder="Lead phone number" />
          </Form.Item>

          <Form.Item
            name="company"
            label="Company"
          >
            <Input placeholder="Company name" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select
              placeholder="Select status"
              options={STATUS_OPTIONS}
            />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message / Notes"
          >
            <TextArea
              rows={3}
              placeholder="Lead message or notes"
            />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setEditModalVisible(false);
                editForm.resetFields();
                setEditingLead(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              Update Lead
            </Button>
          </div>
        </Form>
      </Modal>

      {/* 📋 Details Modal */}
      <Modal
        title="Lead Details"
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedLead(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailsModalVisible(false);
            setSelectedLead(null);
          }}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedLead && (
          <div className="space-y-3 mt-2">
            <p><strong>Name:</strong> {selectedLead.name}</p>
            <p><strong>Email:</strong> {selectedLead.email}</p>
            <p><strong>Phone:</strong> {selectedLead.phone || '-'}</p>
            <p><strong>Company:</strong> {selectedLead.company || '-'}</p>
            <p><strong>Status:</strong> {getStatusTag(selectedLead.status)}</p>
            <p><strong>Message:</strong></p>
            <p className="p-2 rounded bg-gray-50 border border-gray-200">
              {selectedLead.message || '—'}
            </p>
            <p>
              <strong>Created:</strong>{' '}
              {selectedLead.created
                ? new Date(selectedLead.created).toLocaleString()
                : '-'}
            </p>
            <p>
              <strong>Updated:</strong>{' '}
              {selectedLead.updated
                ? new Date(selectedLead.updated).toLocaleString()
                : '-'}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}