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
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  GET_OFFERS,
  CREATE_OFFER,
  UPDATE_OFFER,
  DELETE_OFFER,
  GET_PRODUCTS,
} from '../../scripts/api';
import { getData, postData, patchData, deleteData } from '../../scripts/api-service';

const { TextArea } = Input;
const { Option } = Select;

export default function ManageOffers() {
  const { id: agentId } = useParams();

  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const [editingOffer, setEditingOffer] = useState(null);

  // filter
  const [activeFilter, setActiveFilter] = useState('all'); // all | active | inactive

  useEffect(() => {
    if (!agentId) return;
    fetchData();
  }, [agentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [offersRes, productsRes] = await Promise.all([
        getData(`${GET_OFFERS}?agent=${agentId}&ordering=-created`),
        getData(`${GET_PRODUCTS}?agent=${agentId}&ordering=name`),
      ]);
      setOffers(offersRes.results || offersRes);
      setProducts(productsRes.results || productsRes);
    } catch (error) {
      console.error('Error fetching offers/products:', error);
      message.error('Failed to fetch offers or products');
    } finally {
      setLoading(false);
    }
  };

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.sku})`,
  }));

  const openCreateModal = () => {
    createForm.resetFields();
    createForm.setFieldsValue({
      is_active: true,
    });
    setCreateModalVisible(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    editForm.setFieldsValue({
      title: offer.title,
      description: offer.description,
      starts_at: offer.starts_at,
      ends_at: offer.ends_at,
      products: offer.products || [],
      is_active: offer.is_active,
    });
    setEditModalVisible(true);
  };

  const handleCreateOffer = async (values) => {
    setSubmitting(true);
    try {
      await postData(CREATE_OFFER, {
        agent: agentId,
        ...values,
      });
      message.success('Offer created successfully');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchData();
    } catch (error) {
      console.error('Error creating offer:', error.response?.data || error);
      message.error('Failed to create offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOffer = async (values) => {
    if (!editingOffer) return;
    setSubmitting(true);
    try {
      await patchData(`${UPDATE_OFFER}${editingOffer.id}/`, values);
      message.success('Offer updated successfully');
      setEditModalVisible(false);
      editForm.resetFields();
      setEditingOffer(null);
      fetchData();
    } catch (error) {
      console.error('Error updating offer:', error.response?.data || error);
      message.error('Failed to update offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOffer = async (id) => {
    try {
      await deleteData(`${DELETE_OFFER}${id}/`);
      message.success('Offer deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting offer:', error);
      message.error('Failed to delete offer');
    }
  };

  // Derived data
  const now = new Date();

  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      if (activeFilter === 'active' && !o.is_active) return false;
      if (activeFilter === 'inactive' && o.is_active) return false;
      return true;
    });
  }, [offers, activeFilter]);

  const totalOffers = offers.length;
  const activeOffers = offers.filter((o) => o.is_active).length;
  const runningOffers = offers.filter((o) => {
    if (!o.starts_at || !o.ends_at || !o.is_active) return false;
    const start = new Date(o.starts_at);
    const end = new Date(o.ends_at);
    return start <= now && now <= end;
  }).length;

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (is_active) =>
        is_active ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },
    {
      title: 'Starts At',
      dataIndex: 'starts_at',
      key: 'starts_at',
      render: (value) =>
        value ? new Date(value).toLocaleString() : '-',
    },
    {
      title: 'Ends At',
      dataIndex: 'ends_at',
      key: 'ends_at',
      render: (value) =>
        value ? new Date(value).toLocaleString() : '-',
    },
    {
      title: 'Scope',
      key: 'scope',
      render: (_, record) =>
        record.products && record.products.length > 0 ? (
          <span>{record.products.length} product(s)</span>
        ) : (
          <span>All products</span>
        ),
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
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Offer"
            description="Are you sure you want to delete this offer?"
            onConfirm={() => handleDeleteOffer(record.id)}
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
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-bold">
            Manage Offers
          </h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Add Offer
          </Button>
        </div>
      </Card>

      {/* Summary cards */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Offers"
              value={totalOffers}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Offers"
              value={activeOffers}
              valueStyle={{ color: '#16a34a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Running Now"
              value={runningOffers}
              valueStyle={{ color: '#2563eb' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3 items-center justify-end">
          <span className="text-sm text-gray-500">Active:</span>
          <Select
            value={activeFilter}
            onChange={setActiveFilter}
            style={{ width: 180 }}
          >
            <Option value="all">All</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </div>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredOffers}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} offers`,
            }}
          />
        </Spin>
      </Card>

      {/* Create + Edit Modals (same as before) */}
      {/* ➕ Create Offer Modal */}
      <Modal
        title="Add Offer"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateOffer}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter offer title' }]}
          >
            <Input placeholder="Offer title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={3}
              placeholder="Offer description / terms"
            />
          </Form.Item>

          <Form.Item
            name="starts_at"
            label="Starts At"
            rules={[{ required: true, message: 'Please enter start datetime (ISO format)' }]}
          >
            <Input placeholder="e.g. 2025-12-04T10:00:00Z" />
          </Form.Item>

          <Form.Item
            name="ends_at"
            label="Ends At"
            rules={[{ required: true, message: 'Please enter end datetime (ISO format)' }]}
          >
            <Input placeholder="e.g. 2025-12-10T23:59:59Z" />
          </Form.Item>

          <Form.Item
            name="products"
            label="Products (optional)"
            tooltip="Leave empty to apply to all products"
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Select products or leave empty for all"
              options={productOptions}
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
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
              Create
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ✏️ Edit Offer Modal */}
      <Modal
        title="Edit Offer"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setEditingOffer(null);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditOffer}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter offer title' }]}
          >
            <Input placeholder="Offer title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={3}
              placeholder="Offer description / terms"
            />
          </Form.Item>

          <Form.Item
            name="starts_at"
            label="Starts At"
            rules={[{ required: true, message: 'Please enter start datetime (ISO format)' }]}
          >
            <Input placeholder="e.g. 2025-12-04T10:00:00Z" />
          </Form.Item>

          <Form.Item
            name="ends_at"
            label="Ends At"
            rules={[{ required: true, message: 'Please enter end datetime (ISO format)' }]}
          >
            <Input placeholder="e.g. 2025-12-10T23:59:59Z" />
          </Form.Item>

          <Form.Item
            name="products"
            label="Products (optional)"
            tooltip="Leave empty to apply to all products"
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Select products or leave empty for all"
              options={productOptions}
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setEditModalVisible(false);
                editForm.resetFields();
                setEditingOffer(null);
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