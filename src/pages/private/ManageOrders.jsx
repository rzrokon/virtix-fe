import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
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
const { Text } = Typography;
const { TextArea } = Input;

const ORDER_STATUSES = [
  { value: 'new',        label: 'New',        color: 'gold' },
  { value: 'paid',       label: 'Paid',       color: 'green' },
  { value: 'processing', label: 'Processing', color: 'blue' },
  { value: 'shipped',    label: 'Shipped',    color: 'cyan' },
  { value: 'delivered',  label: 'Delivered',  color: 'green' },
  { value: 'canceled',   label: 'Canceled',   color: 'red' },
  { value: 'refunded',   label: 'Refunded',   color: 'purple' },
];

function StatusTag({ status }) {
  const s = ORDER_STATUSES.find(o => o.value === status);
  return <Tag color={s?.color || 'default'}>{s?.label || status}</Tag>;
}

function CustomerCell({ order }) {
  if (order.customer_name) {
    return (
      <div>
        <div className="font-medium">{order.customer_name}</div>
        {order.customer_email && <div className="text-xs text-gray-400">{order.customer_email}</div>}
        {order.customer_phone && <div className="text-xs text-gray-400">{order.customer_phone}</div>}
      </div>
    );
  }
  if (order.customer) {
    return <span className="text-gray-500">User #{order.customer}</span>;
  }
  return <span className="text-gray-400">—</span>;
}

function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  const itemCols = [
    {
      title: 'Product',
      key: 'product',
      render: (_, item) => (
        <div>
          <div>{item.product_name || '—'}</div>
          {item.sku && <code className="text-xs text-gray-400">{item.sku}</code>}
          {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(item.variant_attributes).map(([k, v]) => (
                <Tag key={k} style={{ fontSize: 11 }}>{k}: {v}</Tag>
              ))}
            </div>
          )}
        </div>
      ),
    },
    { title: 'Qty', dataIndex: 'qty', key: 'qty', width: 60 },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (v) => `${order.currency} ${Number(v).toFixed(2)}`,
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      width: 100,
      render: (_, item) => `${order.currency} ${(Number(item.price) * item.qty).toFixed(2)}`,
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span>Order Details</span>
          {order.order_number && <Tag color="blue">{order.order_number}</Tag>}
          <StatusTag status={order.status} />
        </div>
      }
      open={!!order}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Close</Button>}
      width={760}
    >
      <div className="space-y-4 mt-2">
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="Order #">{order.order_number || `#${order.id}`}</Descriptions.Item>
          <Descriptions.Item label="Status"><StatusTag status={order.status} /></Descriptions.Item>
          <Descriptions.Item label="Customer">{order.customer_name || '—'}</Descriptions.Item>
          <Descriptions.Item label="Email">{order.customer_email || '—'}</Descriptions.Item>
          <Descriptions.Item label="Phone">{order.customer_phone || '—'}</Descriptions.Item>
          <Descriptions.Item label="City">{order.city || '—'}</Descriptions.Item>
          <Descriptions.Item label="Country">{order.country || '—'}</Descriptions.Item>
          <Descriptions.Item label="Total">
            <Text strong>{order.currency} {Number(order.total_price).toFixed(2)}</Text>
          </Descriptions.Item>
          {order.shipping_address && (
            <Descriptions.Item label="Shipping Address" span={2}>
              {order.shipping_address}
            </Descriptions.Item>
          )}
          {order.notes && (
            <Descriptions.Item label="Notes" span={2}>{order.notes}</Descriptions.Item>
          )}
          <Descriptions.Item label="Created" span={2}>
            {order.created ? new Date(order.created).toLocaleString() : '—'}
          </Descriptions.Item>
        </Descriptions>

        {Array.isArray(order.items) && order.items.length > 0 && (
          <>
            <div className="font-semibold text-sm">Order Items</div>
            <Table
              dataSource={order.items}
              columns={itemCols}
              rowKey="id"
              size="small"
              pagination={false}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={3} align="right">
                    <Text strong>Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text strong>{order.currency} {Number(order.total_price).toFixed(2)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </>
        )}
      </div>
    </Modal>
  );
}

function EditOrderModal({ order, onClose, onSaved }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!order) return;
    form.setFieldsValue({
      status: order.status,
      notes: order.notes || '',
      shipping_address: order.shipping_address || '',
      city: order.city || '',
      country: order.country || '',
    });
  }, [order]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const res = await patchData(`${UPDATE_ORDER}${order.id}/`, values);
      if (res?.error) {
        message.error('Failed to update order');
        return;
      }
      message.success('Order updated');
      onSaved();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`Edit Order ${order?.order_number || `#${order?.id}`}`}
      open={!!order}
      onCancel={onClose}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-3">
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select options={ORDER_STATUSES.map(s => ({ value: s.value, label: s.label }))} />
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="city" label="City">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="country" label="Country">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="shipping_address" label="Shipping Address">
          <TextArea rows={2} />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <TextArea rows={2} />
        </Form.Item>
        <div className="flex justify-end gap-2 mt-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={submitting}>Update</Button>
        </div>
      </Form>
    </Modal>
  );
}

export default function ManageOrders() {
  const { id: agentId } = useParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!agentId) return;
    fetchOrders();
  }, [agentId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getData(`${GET_ORDERS}?agent=${agentId}&ordering=-created`);
      setOrders(res.results || res || []);
    } catch {
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteData(`${DELETE_ORDER}${id}/`);
      message.success('Order deleted');
      fetchOrders();
    } catch {
      message.error('Failed to delete order');
    }
  };

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match = [o.order_number, o.customer_name, o.customer_email, o.customer_phone]
          .some(v => v?.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchTerm]);

  const totalOrders = orders.length;
  const newOrders = orders.filter(o => o.status === 'new').length;
  const paidOrders = orders.filter(o => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status)).length;
  const totalRevenue = orders
    .filter(o => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status))
    .reduce((sum, o) => sum + Number(o.total_price || 0), 0);

  const columns = [
    {
      title: 'Order #',
      key: 'order_number',
      render: (_, r) => (
        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setDetailOrder(r)}>
          {r.order_number || `#${r.id}`}
        </Button>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, r) => <CustomerCell order={r} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: s => <StatusTag status={s} />,
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, r) => <Text strong>{r.currency} {Number(r.total_price).toFixed(2)}</Text>,
    },
    {
      title: 'Items',
      key: 'items',
      render: (_, r) => Array.isArray(r.items) ? r.items.length : '—',
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      render: v => v ? new Date(v).toLocaleDateString() : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, r) => (
        <Space size={0}>
          <Button type="text" icon={<EyeOutlined />} onClick={() => setDetailOrder(r)} title="Details" />
          <Button type="text" icon={<EditOutlined />} onClick={() => setEditOrder(r)} title="Edit" />
          <Popconfirm
            title="Delete this order?"
            onConfirm={() => handleDelete(r.id)}
            okText="Yes"
            cancelText="No"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Button type="text" icon={<DeleteOutlined />} danger title="Delete" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-2xl font-bold">Orders</h1>
      </Card>

      <Row gutter={16}>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Total Orders" value={totalOrders} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="New" value={newOrders} valueStyle={{ color: '#f59e0b' }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Paid / Active" value={paidOrders} valueStyle={{ color: '#16a34a' }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={totalRevenue.toFixed(2)}
              prefix={orders[0]?.currency || ''}
              valueStyle={{ color: '#2563eb' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search order #, name, email…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ maxWidth: 280 }}
            allowClear
          />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }}>
            <Option value="all">All Statuses</Option>
            {ORDER_STATUSES.map(s => <Option key={s.value} value={s.value}>{s.label}</Option>)}
          </Select>
        </div>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              showTotal: (t, r) => `${r[0]}-${r[1]} of ${t}`,
            }}
            size="middle"
          />
        </Spin>
      </Card>

      <OrderDetailsModal order={detailOrder} onClose={() => setDetailOrder(null)} />
      <EditOrderModal order={editOrder} onClose={() => setEditOrder(null)} onSaved={fetchOrders} />
    </div>
  );
}
