import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
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
  Table,
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  GET_BOOKING_WINDOWS,
  CREATE_BOOKING_WINDOW,
  UPDATE_BOOKING_WINDOW,
  DELETE_BOOKING_WINDOW,
} from '../../scripts/api';
import { getData, postData, patchData, deleteData } from '../../scripts/api-service';

const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

function formatWeekday(value) {
  const found = WEEKDAY_OPTIONS.find((w) => w.value === value);
  return found ? found.label : 'Ad-hoc';
}

export default function ManageBookingWindows() {
  const { id: agentId } = useParams();

  const [windows, setWindows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const [editingWindow, setEditingWindow] = useState(null);

  useEffect(() => {
    if (!agentId) return;
    fetchWindows();
  }, [agentId]);

  const fetchWindows = async () => {
    setLoading(true);
    try {
      const response = await getData(
        `${GET_BOOKING_WINDOWS}?agent=${agentId}&ordering=weekday,start_time`
      );
      setWindows(response.results || response);
    } catch (error) {
      console.error('Error fetching booking windows:', error);
      message.error('Failed to fetch booking windows');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  const openEditModal = (windowObj) => {
    setEditingWindow(windowObj);
    editForm.setFieldsValue({
      weekday: windowObj.weekday,
      start_time: windowObj.start_time, // assuming "HH:MM:SS"
      end_time: windowObj.end_time,
      capacity: windowObj.capacity,
    });
    setEditModalVisible(true);
  };

  const handleCreateWindow = async (values) => {
    setSubmitting(true);
    try {
      // Backend expects: agent, weekday, start_time, end_time, capacity
      await postData(CREATE_BOOKING_WINDOW, {
        agent: agentId,
        weekday: values.weekday,
        start_time: values.start_time,
        end_time: values.end_time,
        capacity: values.capacity,
      });
      message.success('Booking window created successfully');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchWindows();
    } catch (error) {
      console.error('Error creating booking window:', error);
      message.error('Failed to create booking window');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditWindow = async (values) => {
    if (!editingWindow) return;
    setSubmitting(true);
    try {
      await patchData(`${UPDATE_BOOKING_WINDOW}${editingWindow.id}/`, {
        weekday: values.weekday,
        start_time: values.start_time,
        end_time: values.end_time,
        capacity: values.capacity,
      });
      message.success('Booking window updated successfully');
      setEditModalVisible(false);
      editForm.resetFields();
      setEditingWindow(null);
      fetchWindows();
    } catch (error) {
      console.error('Error updating booking window:', error);
      message.error('Failed to update booking window');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWindow = async (id) => {
    try {
      await deleteData(`${DELETE_BOOKING_WINDOW}${id}/`);
      message.success('Booking window deleted successfully');
      fetchWindows();
    } catch (error) {
      console.error('Error deleting booking window:', error);
      message.error('Failed to delete booking window');
    }
  };

  const columns = [
    {
      title: 'Weekday',
      dataIndex: 'weekday',
      key: 'weekday',
      render: (value) => formatWeekday(value),
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
    },
    {
      title: 'End Time',
      dataIndex: 'end_time',
      key: 'end_time',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Booking Window"
            description="Are you sure you want to delete this booking window?"
            onConfirm={() => handleDeleteWindow(record.id)}
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
            Booking Windows
          </h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Add Window
          </Button>
        </div>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={windows}
            rowKey="id"
            pagination={false}
          />
        </Spin>
      </Card>

      {/* ➕ Create Window Modal */}
      <Modal
        title="Add Booking Window"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateWindow}
          className="mt-4"
        >
          <Form.Item
            name="weekday"
            label="Weekday"
            rules={[{ required: true, message: 'Please select a weekday' }]}
          >
            <Select
              placeholder="Select weekday"
              options={WEEKDAY_OPTIONS}
            />
          </Form.Item>

          <Form.Item
            name="start_time"
            label="Start Time"
            rules={[{ required: true, message: 'Please enter start time (HH:MM or HH:MM:SS)' }]}
          >
            <Input placeholder="e.g. 09:00 or 09:00:00" />
          </Form.Item>

          <Form.Item
            name="end_time"
            label="End Time"
            rules={[{ required: true, message: 'Please enter end time (HH:MM or HH:MM:SS)' }]}
          >
            <Input placeholder="e.g. 17:00 or 17:00:00" />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Capacity per slot"
            rules={[{ required: true, message: 'Please enter capacity' }]}
            initialValue={1}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
            />
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
              Create
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ✏️ Edit Window Modal */}
      <Modal
        title="Edit Booking Window"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setEditingWindow(null);
        }}
        footer={null}
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditWindow}
          className="mt-4"
        >
          <Form.Item
            name="weekday"
            label="Weekday"
            rules={[{ required: true, message: 'Please select a weekday' }]}
          >
            <Select
              placeholder="Select weekday"
              options={WEEKDAY_OPTIONS}
            />
          </Form.Item>

          <Form.Item
            name="start_time"
            label="Start Time"
            rules={[{ required: true, message: 'Please enter start time (HH:MM or HH:MM:SS)' }]}
          >
            <Input placeholder="e.g. 09:00 or 09:00:00" />
          </Form.Item>

          <Form.Item
            name="end_time"
            label="End Time"
            rules={[{ required: true, message: 'Please enter end time (HH:MM or HH:MM:SS)' }]}
          >
            <Input placeholder="e.g. 17:00 or 17:00:00" />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Capacity per slot"
            rules={[{ required: true, message: 'Please enter capacity' }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setEditModalVisible(false);
                editForm.resetFields();
                setEditingWindow(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              Update
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

