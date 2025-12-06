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
  GET_BOOKINGS,
  UPDATE_BOOKING,
  DELETE_BOOKING,
} from '../../scripts/api';
import { getData, patchData, deleteData } from '../../scripts/api-service';

const { TextArea } = Input;

const BOOKING_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'completed', label: 'Completed' },
];

function getBookingStatusTag(status) {
  switch (status) {
    case 'pending':
      return <Tag color="gold">Pending</Tag>;
    case 'confirmed':
      return <Tag color="blue">Confirmed</Tag>;
    case 'canceled':
      return <Tag color="red">Canceled</Tag>;
    case 'completed':
      return <Tag color="green">Completed</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
}

export default function ManageBookings() {
  const { id: agentId } = useParams();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!agentId) return;
    fetchBookings();
  }, [agentId]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await getData(
        `${GET_BOOKINGS}?agent=${agentId}&ordering=-start`
      );
      setBookings(response.results || response);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      message.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setDetailsModalVisible(true);
  };

  const openEditModal = (booking) => {
    setEditingBooking(booking);
    editForm.setFieldsValue({
      title: booking.title,
      status: booking.status,
      notes: booking.notes,
    });
    setEditModalVisible(true);
  };

  const handleEditBooking = async (values) => {
    if (!editingBooking) return;
    setSubmitting(true);
    try {
      await patchData(`${UPDATE_BOOKING}${editingBooking.id}/`, values);
      message.success('Booking updated successfully');
      setEditModalVisible(false);
      editForm.resetFields();
      setEditingBooking(null);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      message.error('Failed to update booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      await deleteData(`${DELETE_BOOKING}${bookingId}/`);
      message.success('Booking deleted successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      message.error('Failed to delete booking');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <span className="font-medium">
          {text || '(No title)'}
        </span>
      ),
    },
    {
      title: 'Start',
      dataIndex: 'start',
      key: 'start',
      render: (value) =>
        value ? new Date(value).toLocaleString() : '-',
    },
    {
      title: 'End',
      dataIndex: 'end',
      key: 'end',
      render: (value) =>
        value ? new Date(value).toLocaleString() : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getBookingStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 260,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<InfoCircleOutlined />}
            onClick={() => openDetailsModal(record)}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Details
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Booking"
            description="Are you sure you want to delete this booking?"
            onConfirm={() => handleDeleteBooking(record.id)}
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
            Manage Bookings
          </h1>
        </div>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={bookings}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} bookings`,
            }}
          />
        </Spin>
      </Card>

      {/* ✏️ Edit Booking Modal */}
      <Modal
        title="Edit Booking"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setEditingBooking(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditBooking}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Title"
          >
            <Input placeholder="Booking title (optional)" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select
              placeholder="Select status"
              options={BOOKING_STATUS_OPTIONS}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea
              rows={3}
              placeholder="Internal notes about this booking"
            />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setEditModalVisible(false);
                editForm.resetFields();
                setEditingBooking(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              Update Booking
            </Button>
          </div>
        </Form>
      </Modal>

      {/* 📋 Details Modal */}
      <Modal
        title="Booking Details"
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedBooking(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailsModalVisible(false);
              setSelectedBooking(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedBooking && (
          <div className="space-y-3 mt-2">
            <p>
              <strong>Title:</strong>{' '}
              {selectedBooking.title || '(No title)'}
            </p>
            <p>
              <strong>Status:</strong>{' '}
              {getBookingStatusTag(selectedBooking.status)}
            </p>
            <p>
              <strong>Start:</strong>{' '}
              {selectedBooking.start
                ? new Date(selectedBooking.start).toLocaleString()
                : '-'}
            </p>
            <p>
              <strong>End:</strong>{' '}
              {selectedBooking.end
                ? new Date(selectedBooking.end).toLocaleString()
                : '-'}
            </p>
            <p>
              <strong>Notes:</strong>
            </p>
            <p className="p-2 rounded bg-gray-50 border border-gray-200">
              {selectedBooking.notes || '—'}
            </p>
            <p>
              <strong>Created:</strong>{' '}
              {selectedBooking.created
                ? new Date(selectedBooking.created).toLocaleString()
                : '-'}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

