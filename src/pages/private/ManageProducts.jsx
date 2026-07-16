import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  UploadOutlined,
  StarOutlined,
  StarFilled,
  InboxOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  Upload,
  Typography,
  Alert,
} from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  GET_PRODUCTS,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  PRODUCT_IMAGES,
  PRODUCT_VARIANTS,
  CSV_IMPORT,
} from '../../scripts/api';
import { getData, postData, patchData, deleteData } from '../../scripts/api-service';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'AED', 'CAD', 'AUD', 'SGD', 'MYR'];

const STATUS_COLOR = { active: 'green', inactive: 'red' };

function PriceDisplay({ price, regularPrice, salePrice, currency }) {
  const c = currency || 'USD';
  if (salePrice && regularPrice && Number(salePrice) < Number(regularPrice)) {
    return (
      <span>
        <Text delete type="secondary" style={{ fontSize: 12 }}>{c} {Number(regularPrice).toFixed(2)}</Text>
        {' '}
        <Text strong style={{ color: '#16a34a' }}>{c} {Number(salePrice).toFixed(2)}</Text>
      </span>
    );
  }
  const display = price || regularPrice || salePrice;
  return <span>{display ? `${c} ${Number(display).toFixed(2)}` : '—'}</span>;
}

// ── Images sub-panel ─────────────────────────────────────────────────────────
function ProductImagesPanel({ product, agentName }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetch = async () => {
    if (!product?.id) return;
    setLoading(true);
    try {
      const res = await getData(`${PRODUCT_IMAGES}?product=${product.id}`);
      setImages(res.results || res || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [product?.id]);

  const handleUpload = async ({ file }) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('product', product.id);
      fd.append('image', file);
      const res = await postData(PRODUCT_IMAGES, fd);
      if (res?.error) { message.error('Upload failed'); return; }
      message.success('Image uploaded');
      fetch();
    } finally {
      setUploading(false);
    }
  };

  const setPrimary = async (imgId) => {
    await postData(`${PRODUCT_IMAGES}${imgId}/set-primary/`, {});
    fetch();
  };

  const deleteImg = async (imgId) => {
    await deleteData(`${PRODUCT_IMAGES}${imgId}/`);
    message.success('Image deleted');
    fetch();
  };

  return (
    <Spin spinning={loading || uploading}>
      <Upload.Dragger
        accept="image/*"
        showUploadList={false}
        customRequest={handleUpload}
        multiple={false}
        style={{ marginBottom: 16 }}
      >
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">Click or drag image to upload</p>
        <p className="ant-upload-hint">PNG, JPG, WEBP — max 20 MB. Thumbnail auto-generated.</p>
      </Upload.Dragger>

      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            style={{
              position: 'relative',
              width: 100,
              border: img.is_primary ? '2px solid #2563eb' : '1px solid #e5e7eb',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <img
              src={img.thumbnail_url || img.image_url}
              alt={img.alt_text || 'product'}
              style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }}
            />
            <div
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex', justifyContent: 'space-around', padding: '4px 0',
              }}
            >
              <Button
                type="text"
                size="small"
                icon={img.is_primary ? <StarFilled style={{ color: '#facc15' }} /> : <StarOutlined style={{ color: '#fff' }} />}
                onClick={() => setPrimary(img.id)}
                title="Set as primary"
                style={{ padding: 0 }}
              />
              <Popconfirm title="Delete this image?" onConfirm={() => deleteImg(img.id)} okText="Yes" cancelText="No">
                <Button type="text" size="small" icon={<DeleteOutlined style={{ color: '#f87171' }} />} style={{ padding: 0 }} />
              </Popconfirm>
            </div>
            {img.is_primary && (
              <Tag
                color="blue"
                style={{ position: 'absolute', top: 4, left: 4, fontSize: 10, lineHeight: '16px', padding: '0 4px' }}
              >
                Primary
              </Tag>
            )}
          </div>
        ))}
        {!loading && images.length === 0 && (
          <Text type="secondary">No images yet. Upload one above.</Text>
        )}
      </div>
    </Spin>
  );
}

// ── Variants sub-panel ────────────────────────────────────────────────────────
function ProductVariantsPanel({ product }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetch = async () => {
    if (!product?.id) return;
    setLoading(true);
    try {
      const res = await getData(`${PRODUCT_VARIANTS}?product=${product.id}`);
      setVariants(res.results || res || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [product?.id]);

  const openAdd = () => {
    form.resetFields();
    form.setFieldsValue({ is_active: true, stock: 0 });
    setEditingVariant(null);
    setAddOpen(true);
  };

  const openEdit = (v) => {
    setEditingVariant(v);
    form.setFieldsValue({
      sku: v.sku,
      title: v.title,
      price: v.price ? Number(v.price) : null,
      regular_price: v.regular_price ? Number(v.regular_price) : null,
      sale_price: v.sale_price ? Number(v.sale_price) : null,
      stock: v.stock,
      is_active: v.is_active,
      attributes_raw: v.attributes ? JSON.stringify(v.attributes, null, 2) : '{}',
    });
    setAddOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      let attrs = {};
      try { attrs = JSON.parse(values.attributes_raw || '{}'); } catch { attrs = {}; }

      const payload = {
        product: product.id,
        sku: values.sku,
        title: values.title || '',
        attributes: attrs,
        price: values.price ?? null,
        regular_price: values.regular_price ?? null,
        sale_price: values.sale_price ?? null,
        stock: values.stock ?? 0,
        is_active: values.is_active,
      };

      const res = editingVariant
        ? await patchData(`${PRODUCT_VARIANTS}${editingVariant.id}/`, payload)
        : await postData(PRODUCT_VARIANTS, payload);

      if (res?.error) {
        const msg = Object.values(res.errors || {}).flat().join(' ') || 'Failed';
        message.error(msg);
        return;
      }
      message.success(editingVariant ? 'Variant updated' : 'Variant added');
      setAddOpen(false);
      fetch();
    } finally {
      setSubmitting(false);
    }
  };

  const deleteVariant = async (id) => {
    await deleteData(`${PRODUCT_VARIANTS}${id}/`);
    message.success('Variant deleted');
    fetch();
  };

  const cols = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku', render: v => <code>{v}</code> },
    { title: 'Title', dataIndex: 'title', key: 'title', render: v => v || '—' },
    {
      title: 'Attributes', dataIndex: 'attributes', key: 'attrs',
      render: (attrs) => Object.entries(attrs || {}).map(([k, v]) => (
        <Tag key={k}>{k}: {v}</Tag>
      )),
    },
    {
      title: 'Price', key: 'price',
      render: (_, r) => {
        if (r.sale_price) return <><Text delete type="secondary" style={{ fontSize: 12 }}>{r.regular_price}</Text>{' '}<Text strong style={{ color: '#16a34a' }}>{r.sale_price}</Text></>;
        return r.price || r.regular_price || '—';
      },
    },
    { title: 'Stock', dataIndex: 'stock', key: 'stock', render: v => v <= 5 ? <Tag color="red">{v}</Tag> : v },
    { title: 'Active', dataIndex: 'is_active', key: 'is_active', render: v => <Tag color={v ? 'green' : 'default'}>{v ? 'Yes' : 'No'}</Tag> },
    {
      title: '', key: 'actions', width: 100,
      render: (_, r) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Delete variant?" onConfirm={() => deleteVariant(r.id)} okText="Yes" cancelText="No">
            <Button type="text" size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div className="flex justify-end mb-3">
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openAdd}>Add Variant</Button>
      </div>
      <Table dataSource={variants} columns={cols} rowKey="id" size="small" pagination={false} />

      <Modal
        title={editingVariant ? 'Edit Variant' : 'Add Variant'}
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        footer={null}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-3">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
                <Input placeholder="SHOE-001-W-L" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="title" label="Title">
                <Input placeholder="White / L" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="attributes_raw" label='Attributes JSON (e.g. {"Size":"L","Color":"White"})'>
            <TextArea rows={2} placeholder='{"Size":"L","Color":"White"}' />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="price" label="Price">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="regular_price" label="Regular Price">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sale_price" label="Sale Price">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="stock" label="Stock">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_active" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {editingVariant ? 'Update' : 'Add'}
            </Button>
          </div>
        </Form>
      </Modal>
    </Spin>
  );
}

// ── CSV Import modal ──────────────────────────────────────────────────────────
function CSVImportModal({ open, onClose, agentName, onDone }) {
  const [fileList, setFileList] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const reset = () => { setFileList([]); setResult(null); };

  const handleImport = async () => {
    if (!fileList.length) { message.error('Select a CSV file first'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', fileList[0].originFileObj);
      const res = await postData(CSV_IMPORT(agentName), fd);
      if (res?.error) {
        message.error('Import failed');
        return;
      }
      setResult(res?.data ?? res);
      message.success('Import complete');
      onDone();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Import Products from CSV"
      open={open}
      onCancel={() => { reset(); onClose(); }}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div className="space-y-4 mt-2">
        <Alert
          type="info"
          showIcon
          message="Download sample CSV to see the expected format"
          action={
            <a href="/sample_import.csv" download="sample_import.csv">
              Sample CSV
            </a>
          }
        />

        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 font-mono leading-5">
          Required: <strong>sku</strong>, <strong>name</strong><br />
          Optional: description, category, brand, price, regular_price, sale_price, currency, stock, is_active, image_url, tags, attributes<br />
          Variants: variant_sku, variant_attributes, variant_price, variant_stock
        </div>

        <Upload.Dragger
          accept=".csv"
          beforeUpload={() => false}
          fileList={fileList}
          onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
          maxCount={1}
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">Click or drag CSV file here</p>
        </Upload.Dragger>

        {result && (
          <div className="rounded-lg border border-gray-200 p-3 space-y-2">
            <Row gutter={12}>
              <Col span={8}><Statistic title="Created" value={result.created} valueStyle={{ color: '#16a34a' }} /></Col>
              <Col span={8}><Statistic title="Updated" value={result.updated} valueStyle={{ color: '#2563eb' }} /></Col>
              <Col span={8}><Statistic title="Skipped" value={result.skipped} valueStyle={{ color: '#dc2626' }} /></Col>
            </Row>
            {result.errors?.length > 0 && (
              <div className="text-xs text-red-500 max-h-32 overflow-auto">
                {result.errors.map((e, i) => (
                  <div key={i}>Row {e.row}: {e.error}</div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button onClick={() => { reset(); onClose(); }}>Close</Button>
          <Button type="primary" loading={loading} onClick={handleImport} icon={<UploadOutlined />}>
            Import
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Product form (create + edit with tabs) ────────────────────────────────────
function ProductFormModal({ open, onClose, product, agentId, agentName, onSaved }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const isEdit = !!product;

  useEffect(() => {
    if (!open) return;
    setActiveTab('basic');
    if (isEdit) {
      form.setFieldsValue({
        sku: product.sku,
        name: product.name,
        description: product.description,
        category: product.category,
        brand: product.brand,
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '',
        product_type: product.product_type || 'simple',
        currency: product.currency || 'USD',
        stock: product.stock,
        is_active: product.is_active,
        price: product.price ? Number(product.price) : null,
        regular_price: product.regular_price ? Number(product.regular_price) : null,
        sale_price: product.sale_price ? Number(product.sale_price) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ currency: 'USD', stock: 0, is_active: true, product_type: 'simple' });
    }
  }, [open, product]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const tagsArr = (values.tags || '').split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        ...values,
        agent: agentId,
        tags: tagsArr,
        price: values.price ?? null,
        regular_price: values.regular_price ?? null,
        sale_price: values.sale_price ?? null,
      };
      delete payload.tags_raw;

      const res = isEdit
        ? await patchData(`${UPDATE_PRODUCT}${product.id}/`, payload)
        : await postData(CREATE_PRODUCT, payload);

      const data = res?.data ?? res;
      if (data?.error) {
        const msg = Object.values(data.errors || {}).flat().join(' ') || 'Failed';
        message.error(msg);
        return;
      }
      message.success(isEdit ? 'Product updated' : 'Product created');
      onSaved(data);
      if (!isEdit) onClose();
      else setActiveTab('basic');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    {
      key: 'basic',
      label: 'Basic Info',
      children: (
        <div className="space-y-0">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
                <Input placeholder="BOT-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="product_type" label="Type" rules={[{ required: true }]}>
                <Select>
                  <Option value="simple">Simple</Option>
                  <Option value="variable">Variable</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Product name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Product description" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="category" label="Category">
                <Input placeholder="Bottle, Shoes…" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="brand" label="Brand">
                <Input placeholder="Nike, Virtix…" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="tags" label="Tags" tooltip="Comma-separated">
            <Input placeholder="gym, sport, eco" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="stock" label="Stock" tooltip="-1 for unlimited">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="currency" label="Currency">
                <Select showSearch>
                  {CURRENCIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="is_active" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'pricing',
      label: 'Pricing',
      children: (
        <div className="space-y-0">
          <Alert
            type="info"
            showIcon
            message="Set 'Sale Price' lower than 'Regular Price' to show a strikethrough discount."
            className="mb-4"
          />
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="price" label="Base Price">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="regular_price" label="Regular Price">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sale_price" label="Sale Price">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0.00" />
              </Form.Item>
            </Col>
          </Row>
        </div>
      ),
    },
    ...(isEdit
      ? [
          {
            key: 'images',
            label: 'Images',
            children: <ProductImagesPanel product={product} agentName={agentName} />,
          },
          {
            key: 'variants',
            label: 'Variants',
            disabled: false,
            children: <ProductVariantsPanel product={product} />,
          },
        ]
      : []),
  ];

  return (
    <Modal
      title={isEdit ? `Edit: ${product.name}` : 'Add Product'}
      open={open}
      onCancel={onClose}
      footer={
        activeTab === 'basic' || activeTab === 'pricing' ? (
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" loading={submitting} onClick={() => form.submit()}>
              {isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        ) : null
      }
      width={700}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-2">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />
      </Form>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ManageProducts() {
  const { id: agentId } = useParams();
  const [agentName, setAgentName] = useState('');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [csvOpen, setCsvOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (!agentId) return;
    // Fetch agent name for CSV import URL
    getData(`api/agent/agents/${agentId}/`).then(d => setAgentName(d?.agent_name || '')).catch(() => {});
    fetchProducts();
  }, [agentId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let all = [];
      let url = `${GET_PRODUCTS}?agent=${agentId}&ordering=-created&page_size=100`;
      while (url) {
        const res = await getData(url);
        if (Array.isArray(res)) { all = res; break; }
        all = all.concat(res.results || []);
        // res.next is a full absolute URL; extract just path+query for getData
        if (res.next) {
          const parsed = new URL(res.next);
          url = (parsed.pathname + parsed.search).replace(/^\//, '');
        } else {
          url = null;
        }
      }
      setProducts(all);
    } catch {
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditingProduct(null); setFormOpen(true); };
  const openEdit = (p) => { setEditingProduct(p); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditingProduct(null); };

  const handleSaved = (savedProduct) => {
    fetchProducts();
    if (!editingProduct) return;
    // Update editing product reference so image/variant tabs see latest
    setEditingProduct(savedProduct);
  };

  const handleDelete = async (id) => {
    try {
      await deleteData(`${DELETE_PRODUCT}${id}/`);
      message.success('Product deleted');
      fetchProducts();
    } catch {
      message.error('Failed to delete product');
    }
  };

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (statusFilter === 'active' && !p.is_active) return false;
      if (statusFilter === 'inactive' && p.is_active) return false;
      if (typeFilter !== 'all' && p.product_type !== typeFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        if (!p.name?.toLowerCase().includes(q) && !p.sku?.toLowerCase().includes(q) && !p.category?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [products, statusFilter, typeFilter, searchTerm]);

  const totalCount = products.length;
  const activeCount = products.filter(p => p.is_active).length;
  const lowStockCount = products.filter(p => p.stock >= 0 && p.stock <= 5).length;

  const columns = [
    {
      title: 'Image',
      dataIndex: 'primary_image_url',
      key: 'img',
      width: 64,
      render: (url) => url
        ? <img src={url} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0' }} />
        : <div style={{ width: 44, height: 44, borderRadius: 6, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 18 }}>—</div>,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: v => <code className="text-xs">{v}</code>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, r) => (
        <div>
          <div className="font-medium">{name}</div>
          {r.category && <div className="text-xs text-gray-400">{r.brand ? `${r.brand} · ` : ''}{r.category}</div>}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'product_type',
      key: 'product_type',
      render: t => <Tag color={t === 'variable' ? 'purple' : 'default'}>{t}</Tag>,
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, r) => <PriceDisplay price={r.price} regularPrice={r.regular_price} salePrice={r.sale_price} currency={r.currency} />,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: v => v === -1 ? <Tag color="blue">∞</Tag> : v <= 5 ? <Tag color="red">{v}</Tag> : v,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: v => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, r) => (
        <Space size={0}>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm
            title="Delete this product?"
            onConfirm={() => handleDelete(r.id)}
            okText="Yes"
            cancelText="No"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-bold">Products</h1>
          <Space>
            <Button icon={<UploadOutlined />} onClick={() => setCsvOpen(true)}>
              Import CSV
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Add Product
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total Products" value={totalCount} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Active" value={activeCount} valueStyle={{ color: '#16a34a' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Low Stock (≤5)" value={lowStockCount} valueStyle={{ color: '#dc2626' }} /></Card>
        </Col>
      </Row>

      <Card>
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search name, SKU, category…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ maxWidth: 280 }}
            allowClear
          />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 130 }}>
            <Option value="all">All Status</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
          <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 140 }}>
            <Option value="all">All Types</Option>
            <Option value="simple">Simple</Option>
            <Option value="variable">Variable</Option>
          </Select>
        </div>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t, r) => `${r[0]}-${r[1]} of ${t}` }}
            size="middle"
          />
        </Spin>
      </Card>

      <ProductFormModal
        open={formOpen}
        onClose={closeForm}
        product={editingProduct}
        agentId={agentId}
        agentName={agentName}
        onSaved={handleSaved}
      />

      <CSVImportModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        agentName={agentName}
        onDone={fetchProducts}
      />
    </div>
  );
}
