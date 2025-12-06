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
import {
  GET_COMPLAINTS,
  UPDATE_COMPLAINT,
  DELETE_COMPLAINT,
} from '../../scripts/api';
import { getData, patchData, deleteData } from '../../scripts/api-service';

const { TextArea } = Input;

const COMPLAINT_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

function getComplaintStatusTag(status) {
  switch (status) {
    case 'open':
      return <Tag color="gold">Open</Tag>;
    case 'in_progress':
      return <Tag color="blue">In Progress</Tag>;
    case 'resolved':
      return <Tag color="green">Resolved</Tag>;
    case 'closed':
      return <Tag color="red">Closed</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
}

// Safely render customer field whether it's id or object
function renderCustomer(customer) {
  if (!customer) return '-';
  if (typeof customer === 'number') return `#${customer}`;
  if (typeof customer === 'string') return customer;

  // if nested object with common fields
  return (
    customer.name ||
    customer.full_name ||
    customer.email ||
    customer.username ||
    '-'
  );
}

export default function ManageComplaints() {
  const { id: agentId } = useParams();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const [editingComplaint, setEditingComplaint] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Fetch complaints when agentId changes
  useEffect(() => {
    if (!agentId) return;
    fetchComplaints();
  }, [agentId]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await getData(
        `${GET_COMPLAINTS}?agent=${agentId}&ordering=-created`
      );
      setComplaints(response.results || response);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      message.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  // Details modal
  const openDetailsModal = (complaint) => {
    setSelectedComplaint(complaint);
    setDetailsModalVisible(true);
  };

  // Edit modal
  const openEditModal = (complaint) => {
    setEditingComplaint(complaint);
    editForm.setFieldsValue({
      subject: complaint.subject,
      message: complaint.message,
      status: complaint.status,
    });
    setEditModalVisible(true);
  };

  const handleEditComplaint = async (values) => {
    if (!editingComplaint) return;
    setSubmitting(true);
    try {
      // We can allow updating subject, message, status
      await patchData(`${UPDATE_COMPLAINT}${editingComplaint.id}/`, values);
      message.success('Complaint updated successfully');
      setEditModalVisible(false);
      editForm.resetFields();
      setEditingComplaint(null);
      fetchComplaints();
    } catch (error) {
      console.error(
        'Error updating complaint:',
        error.response?.data || error
      );
      message.error('Failed to update complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    try {
      await deleteData(`${DELETE_COMPLAINT}${complaintId}/`);
      message.success('Complaint deleted successfully');
      fetchComplaints();
    } catch (error) {
      console.error('Error deleting complaint:', error);
      message.error('Failed to delete complaint');
    }
  };

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (text) => (
        <span className="font-medium">
          {text}
        </span>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: renderCustomer,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getComplaintStatusTag(status),
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
            className="text-indigo-500 hover:text-indigo-700"
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

          {/* Delete Button (optional – keep if you want to allow deletion) */}
          <Popconfirm
            title="Delete Complaint"
            description="Are you sure you want to delete this complaint?"
            onConfirm={() => handleDeleteComplaint(record.id)}
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
            Manage Complaints
          </h1>
        </div>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={complaints}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} complaints`,
            }}
          />
        </Spin>
      </Card>

      {/* ✏️ Edit Complaint Modal */}
      <Modal
        title="Edit Complaint"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setEditingComplaint(null);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditComplaint}
          className="mt-4"
        >
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please enter complaint subject' }]}
          >
            <Input placeholder="Complaint subject" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter complaint message' }]}
          >
            <TextArea
              rows={4}
              placeholder="Customer complaint message"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select
              placeholder="Select status"
              options={COMPLAINT_STATUS_OPTIONS}
            />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setEditModalVisible(false);
                editForm.resetFields();
                setEditingComplaint(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              Update Complaint
            </Button>
          </div>
        </Form>
      </Modal>

      {/* 📋 Details Modal */}
      <Modal
        title="Complaint Details"
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedComplaint(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailsModalVisible(false);
              setSelectedComplaint(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedComplaint && (
          <div className="space-y-3 mt-2">
            <p>
              <strong>Subject:</strong> {selectedComplaint.subject}
            </p>
            <p>
              <strong>Status:</strong> {getComplaintStatusTag(selectedComplaint.status)}
            </p>
            <p>
              <strong>Customer:</strong>{' '}
              {renderCustomer(selectedComplaint.customer)}
            </p>
            <p>
              <strong>Message:</strong>
            </p>
            <p className="p-2 rounded bg-gray-50 border border-gray-200 whitespace-pre-line">
              {selectedComplaint.message}
            </p>
            <p>
              <strong>Created:</strong>{' '}
              {selectedComplaint.created
                ? new Date(selectedComplaint.created).toLocaleString()
                : '-'}
            </p>
            <p>
              <strong>Updated:</strong>{' '}
              {selectedComplaint.updated
                ? new Date(selectedComplaint.updated).toLocaleString()
                : '-'}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
