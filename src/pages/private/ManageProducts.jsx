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
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Select,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  GET_PRODUCTS,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
} from '../../scripts/api';
import { getData, postData, patchData, deleteData } from '../../scripts/api-service';

const { TextArea } = Input;
const { Option } = Select;

export default function ManageProducts() {
  const { id: agentId } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive

  useEffect(() => {
    if (!agentId) return;
    fetchProducts();
  }, [agentId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getData(
        `${GET_PRODUCTS}?agent=${agentId}&ordering=-created`
      );
      setProducts(response.results || response);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    createForm.resetFields();
    createForm.setFieldsValue({
      currency: 'USD',
      stock: 0,
      is_active: true,
    });
    setCreateModalVisible(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    editForm.setFieldsValue({
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      currency: product.currency,
      stock: product.stock,
      is_active: product.is_active,
    });
    setEditModalVisible(true);
  };

  const handleCreateProduct = async (values) => {
    setSubmitting(true);
    try {
      await postData(CREATE_PRODUCT, {
        agent: agentId,
        ...values,
      });
      message.success('Product created successfully');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error.response?.data || error);
      message.error('Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = async (values) => {
    if (!editingProduct) return;
    setSubmitting(true);
    try {
      await patchData(`${UPDATE_PRODUCT}${editingProduct.id}/`, values);
      message.success('Product updated successfully');
      setEditModalVisible(false);
      editForm.resetFields();
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error.response?.data || error);
      message.error('Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteData(`${DELETE_PRODUCT}${id}/`);
      message.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Failed to delete product');
    }
  };

  // ---- Derived data: filtered list + stats ----
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // status filter
      if (statusFilter === 'active' && !p.is_active) return false;
      if (statusFilter === 'inactive' && p.is_active) return false;

      // search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const name = (p.name || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        if (!name.includes(q) && !sku.includes(q)) return false;
      }

      return true;
    });
  }, [products, statusFilter, searchTerm]);

  const totalCount = products.length;
  const activeCount = products.filter((p) => p.is_active).length;
  const lowStockCount = products.filter((p) => p.stock >= 0 && p.stock <= 5).length;

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (text) => <span className="font-mono">{text}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (_, record) =>
        `${record.price} ${record.currency || ''}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (value) =>
        value === -1 ? (
          <Tag color="blue">Unlimited</Tag>
        ) : value <= 5 ? (
          <Tag color="red">{value}</Tag>
        ) : (
          value
        ),
    },
    {
      title: 'Status',
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
            title="Delete Product"
            description="Are you sure you want to delete this product?"
            onConfirm={() => handleDeleteProduct(record.id)}
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
      {/* Top bar */}
      <Card>
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-bold">
            Manage Products
          </h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Add Product
          </Button>
        </div>
      </Card>

      {/* Summary cards */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Products"
              value={totalCount}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Products"
              value={activeCount}
              valueStyle={{ color: '#16a34a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Low / Critical Stock (≤5)"
              value={lowStockCount}
              valueStyle={{ color: '#dc2626' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <Input
            placeholder="Search by name or SKU"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 320 }}
            allowClear
          />
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">Status:</span>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 160 }}
            >
              <Option value="all">All</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} products`,
            }}
          />
        </Spin>
      </Card>

      {/* Modals same as before (create + edit) */}
      {/* ➕ Create Product Modal */}
      <Modal
        title="Add Product"
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
          onFinish={handleCreateProduct}
          className="mt-4"
        >
          <Form.Item
            name="sku"
            label="SKU"
            rules={[{ required: true, message: 'Please enter product SKU' }]}
          >
            <Input placeholder="Unique product SKU" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Product name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={3}
              placeholder="Product description"
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true, message: 'Please enter currency code' }]}
            initialValue="USD"
          >
            <Input placeholder="e.g. USD, BDT" />
          </Form.Item>

          <Form.Item
            name="stock"
            label="Stock"
            tooltip="Set -1 for unlimited"
            rules={[{ required: true, message: 'Please enter stock' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
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

      {/* ✏️ Edit Product Modal */}
      <Modal
        title="Edit Product"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setEditingProduct(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditProduct}
          className="mt-4"
        >
          <Form.Item
            name="sku"
            label="SKU"
            rules={[{ required: true, message: 'Please enter product SKU' }]}
          >
            <Input placeholder="Unique product SKU" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Product name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={3}
              placeholder="Product description"
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true, message: 'Please enter currency code' }]}
          >
            <Input placeholder="e.g. USD, BDT" />
          </Form.Item>

          <Form.Item
            name="stock"
            label="Stock"
            tooltip="Set -1 for unlimited"
            rules={[{ required: true, message: 'Please enter stock' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
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
                setEditingProduct(null);
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