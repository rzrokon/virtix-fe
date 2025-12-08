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
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  GET_ORDERS,
  UPDATE_ORDER,
  DELETE_ORDER,
} from '../../scripts/api';
import { getData, patchData, deleteData } from '../../scripts/api-service';

const { Option } = Select;

const ORDER_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'refunded', label: 'Refunded' },
];

function getOrderStatusTag(status) {
  switch (status) {
    case 'new':
      return <Tag color="gold">New</Tag>;
    case 'paid':
      return <Tag color="green">Paid</Tag>;
    case 'shipped':
      return <Tag color="blue">Shipped</Tag>;
    case 'canceled':
      return <Tag color="red">Canceled</Tag>;
    case 'refunded':
      return <Tag color="purple">Refunded</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
}

function renderCustomer(customer) {
  if (!customer) return '-';
  if (typeof customer === 'number') return `#${customer}`;
  if (typeof customer === 'string') return customer;
  return (
    customer.name ||
    customer.full_name ||
    customer.email ||
    customer.username ||
    '-'
  );
}

export default function ManageOrders() {
  const { id: agentId } = useParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState('all'); // all or specific status

  useEffect(() => {
    if (!agentId) return;
    fetchOrders();
  }, [agentId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getData(
        `${GET_ORDERS}?agent=${agentId}&ordering=-created`
      );
      setOrders(response.results || response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setDetailsModalVisible(true);
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    editForm.setFieldsValue({
      status: order.status,
    });
    setEditModalVisible(true);
  };

  const handleEditOrder = async (values) => {
    if (!editingOrder) return;
    setSubmitting(true);
    try {
      await patchData(`${UPDATE_ORDER}${editingOrder.id}/`, values);
      message.success('Order updated successfully');
      setEditModalVisible(false);
      editForm.resetFields();
      setEditingOrder(null);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error.response?.data || error);
      message.error('Failed to update order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await deleteData(`${DELETE_ORDER}${id}/`);
      message.success('Order deleted successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      message.error('Failed to delete order');
    }
  };

  // Derived data
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      return true;
    });
  }, [orders, statusFilter]);

  const totalOrders = orders.length;
  const newOrders = orders.filter((o) => o.status === 'new').length;
  const paidOrders = orders.filter((o) => o.status === 'paid').length;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span className="font-mono">#{id}</span>,
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
      render: getOrderStatusTag,
    },
    {
      title: 'Total',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (_, record) =>
        `${record.total_price} ${record.currency || ''}`,
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      render: (value) =>
        value ? new Date(value).toLocaleString() : '-',
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
            title="Delete Order"
            description="Are you sure you want to delete this order?"
            onConfirm={() => handleDeleteOrder(record.id)}
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
        <h1 className="text-2xl font-bold">
          Manage Orders
        </h1>
      </Card>

      {/* Summary cards */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Orders"
              value={totalOrders}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="New Orders"
              value={newOrders}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Paid Orders"
              value={paidOrders}
              valueStyle={{ color: '#16a34a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3 items-center justify-end">
          <span className="text-sm text-gray-500">Status:</span>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
          >
            <Option value="all">All</Option>
            {ORDER_STATUS_OPTIONS.map((s) => (
              <Option key={s.value} value={s.value}>
                {s.label}
              </Option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} orders`,
            }}
          />
        </Spin>
      </Card>

      {/* ✏️ Edit Order Modal */}
      <Modal
        title="Edit Order"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setEditingOrder(null);
        }}
        footer={null}
        width={400}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditOrder}
          className="mt-4"
        >
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select
              placeholder="Select status"
              options={ORDER_STATUS_OPTIONS}
            />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setEditModalVisible(false);
                editForm.resetFields();
                setEditingOrder(null);
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

      {/* 📋 Details Modal */}
      <Modal
        title="Order Details"
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedOrder(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailsModalVisible(false);
              setSelectedOrder(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedOrder && (
          <div className="space-y-3 mt-2">
            <p>
              <strong>Order ID:</strong> #{selectedOrder.id}
            </p>
            <p>
              <strong>Status:</strong>{' '}
              {getOrderStatusTag(selectedOrder.status)}
            </p>
            <p>
              <strong>Customer:</strong>{' '}
              {renderCustomer(selectedOrder.customer)}
            </p>
            <p>
              <strong>Total:</strong>{' '}
              {selectedOrder.total_price} {selectedOrder.currency}
            </p>
            <p>
              <strong>Created:</strong>{' '}
              {selectedOrder.created
                ? new Date(selectedOrder.created).toLocaleString()
                : '-'}
            </p>

            {Array.isArray(selectedOrder.items) && (
              <>
                <p>
                  <strong>Items:</strong>
                </p>
                <Table
                  size="small"
                  pagination={false}
                  dataSource={selectedOrder.items}
                  rowKey="id"
                  columns={[
                    {
                      title: 'Product',
                      dataIndex: ['product', 'name'],
                      key: 'product_name',
                      render: (_, item) =>
                        item.product?.name ||
                        item.product_name ||
                        '-',
                    },
                    {
                      title: 'Qty',
                      dataIndex: 'qty',
                      key: 'qty',
                    },
                    {
                      title: 'Price',
                      dataIndex: 'price',
                      key: 'price',
                    },
                  ]}
                />
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
