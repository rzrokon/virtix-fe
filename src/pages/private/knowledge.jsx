
import React, { useEffect, useMemo, useState } from 'react';
import { Table, Button, Input, Select, Form, Modal, Space, Tag, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { getData, postData, patchData, deleteData } from '../../scripts/api-service';
import { useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

export default function knowledge() {
  const { id } = useParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  });

  const [filters, setFilters] = useState({
    search: '',
    ordering: '-updated_at',
  });

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [currentRecord, setCurrentRecord] = useState(null);

  const baseListUrl = useMemo(() => `api/agent/agent-knowledge/`, []);

  // Fetch knowledge items
  const fetchKnowledge = async (page = 1, pageSize = 10, currentFilters = filters) => {
    if (!id) {
      message.warning('Agent ID missing in URL');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('agent', id);
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.ordering) params.append('ordering', currentFilters.ordering);
      params.append('page', page);
      params.append('page_size', pageSize);

      const url = `${baseListUrl}?${params.toString()}`;
      const response = await getData(url);
      if (response) {
        setItems(response.results || []);
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize,
          total: response.count || (response.results ? response.results.length : 0),
        }));
      }
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      message.error('Failed to load knowledge data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge(pagination.current, pagination.pageSize, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleTableChange = (paginationInfo) => {
    fetchKnowledge(paginationInfo.current, paginationInfo.pageSize, filters);
  };

  const applyFilters = () => {
    fetchKnowledge(1, pagination.pageSize, filters);
  };

  const resetFilters = () => {
    const reset = { search: '', ordering: '-updated_at' };
    setFilters(reset);
    fetchKnowledge(1, pagination.pageSize, reset);
  };

  // Create
  const openCreateModal = () => {
    createForm.resetFields();
    setCreating(true);
  };

  const submitCreate = async () => {
    try {
      const values = await createForm.validateFields();
      const payload = {
        agent: Number(id),
        title: values.title,
        content: values.content,
        tags: values.tags || '',
        status: values.status || 'ACTIVE',
      };
      const res = await postData(baseListUrl, payload);
      if (res && (res.status === 201 || res.data)) {
        message.success('Knowledge created successfully');
        setCreating(false);
        fetchKnowledge(pagination.current, pagination.pageSize, filters);
      } else {
        message.error('Failed to create knowledge');
      }
    } catch (err) {
      if (err?.error) {
        message.error('Validation failed');
      } else if (err?.message) {
        message.error(err.message);
      } else {
        // Form validation error is handled by antd; do nothing
      }
    }
  };

  // Edit
  const openEditModal = (record) => {
    setCurrentRecord(record);
    editForm.setFieldsValue({
      title: record.title,
      content: record.content,
      tags: Array.isArray(record.tags) ? record.tags.join(',') : (record.tags || ''),
      status: record.status || 'ACTIVE',
    });
    setEditing(true);
  };

  const submitEdit = async () => {
    try {
      const values = await editForm.validateFields();
      const updatePayload = {
        // Use PATCH with only changed fields
        title: values.title,
        content: values.content,
        tags: values.tags,
        status: values.status,
      };
      const url = `${baseListUrl}${currentRecord.id}/`;
      const res = await patchData(url, updatePayload);
      if (res && (res.status === 200 || res.data)) {
        message.success('Knowledge updated successfully');
        setEditing(false);
        setCurrentRecord(null);
        fetchKnowledge(pagination.current, pagination.pageSize, filters);
      } else {
        message.error('Failed to update knowledge');
      }
    } catch (err) {
      if (err?.error) {
        message.error('Validation failed');
      } else if (err?.message) {
        message.error(err.message);
      }
    }
  };

  // Delete
  const confirmDelete = (record) => {
    setCurrentRecord(record);
    setDeleting(true);
  };

  const submitDelete = async () => {
    try {
      const url = `${baseListUrl}${currentRecord.id}/`;
      const res = await deleteData(url);
      if (res && res.status === 204) {
        message.success('Knowledge deleted');
        setDeleting(false);
        setCurrentRecord(null);
        // If last item on page was deleted, move back a page if needed
        const nextPage = items.length === 1 && pagination.current > 1 ? pagination.current - 1 : pagination.current;
        fetchKnowledge(nextPage, pagination.pageSize, filters);
      } else {
        message.error('Failed to delete knowledge');
      }
    } catch (err) {
      message.error('Error deleting knowledge');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <Text type="secondary" className="text-xs">ID: {record.id}</Text>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'volcano'}>{status || 'UNKNOWN'}</Tag>
      ),
      filters: [
        { text: 'ACTIVE', value: 'ACTIVE' },
        { text: 'INACTIVE', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => (record.status || '').toUpperCase() === value,
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => {
        const list = Array.isArray(tags) ? tags : (tags ? String(tags).split(',') : []);
        return (
          <Space wrap>
            {list.map((t, idx) => <Tag key={idx}>{t.trim()}</Tag>)}
          </Space>
        );
      }
    },
    {
      title: 'Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => date ? new Date(date).toLocaleString() : '-',
      sorter: (a, b) => new Date(a.updated_at) - new Date(b.updated_at),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>Edit</Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => confirmDelete(record)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="!mb-0">Knowledge</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchKnowledge(pagination.current, pagination.pageSize, filters)}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>New</Button>
        </Space>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <Input
              placeholder="Search by title or content..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              allowClear
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordering</label>
            <Select
              value={filters.ordering}
              onChange={(val) => setFilters(prev => ({ ...prev, ordering: val }))}
              style={{ width: '100%' }}
            >
              <Option value="-updated_at">Newest updated</Option>
              <Option value="updated_at">Oldest updated</Option>
              <Option value="-id">Highest ID</Option>
              <Option value="id">Lowest ID</Option>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="primary" onClick={applyFilters}>Apply</Button>
            <Button onClick={resetFilters}>Reset</Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={items}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      {/* Create Modal */}
      <Modal
        title="Create Knowledge"
        open={creating}
        onOk={submitCreate}
        onCancel={() => setCreating(false)}
        okText="Create"
      >
        <Form layout="vertical" form={createForm}>
          <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please enter a title' }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="Content" name="content" rules={[{ required: true, message: 'Please enter content' }]}> 
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item label="Tags (comma-separated)" name="tags"> 
            <Input placeholder="e.g., policy, refund" />
          </Form.Item>
          <Form.Item label="Status" name="status" initialValue="ACTIVE"> 
            <Select>
              <Option value="ACTIVE">ACTIVE</Option>
              <Option value="INACTIVE">INACTIVE</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Knowledge"
        open={editing}
        onOk={submitEdit}
        onCancel={() => { setEditing(false); setCurrentRecord(null); }}
        okText="Save"
      >
        <Form layout="vertical" form={editForm}>
          <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please enter a title' }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="Content" name="content" rules={[{ required: true, message: 'Please enter content' }]}> 
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item label="Tags (comma-separated)" name="tags"> 
            <Input placeholder="e.g., policy, refund" />
          </Form.Item>
          <Form.Item label="Status" name="status"> 
            <Select>
              <Option value="ACTIVE">ACTIVE</Option>
              <Option value="INACTIVE">INACTIVE</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        title="Delete Knowledge"
        open={deleting}
        onOk={submitDelete}
        onCancel={() => { setDeleting(false); setCurrentRecord(null); }}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete <strong>{currentRecord?.title}</strong>?</p>
      </Modal>
    </div>
  );
}
