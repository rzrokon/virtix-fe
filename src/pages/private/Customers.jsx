import React, { useState, useEffect } from 'react';
import { Table, Button, Input, DatePicker, InputNumber, Space, message, Spin } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined, DownloadOutlined, MessageOutlined } from '@ant-design/icons';
import { getData } from '../../scripts/api-service';
import { useContentApi } from '../../contexts/ContentApiContext';
import { useNavigate, useParams } from 'react-router-dom';

const { RangePicker } = DatePicker;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  });
  const { currentAgentName } = useContentApi();
  const navigate = useNavigate();
  const { id } = useParams();

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    date_from: '',
    date_to: '',
    min_messages: '',
    max_messages: '',
  });

  // Fetch customers data
  const fetchCustomers = async (page = 1, pageSize = 10, currentFilters = filters) => {
    setLoading(true);
    try {
      if (!currentAgentName) {
        message.warning('Agent name not loaded yet');
        setLoading(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.date_from) params.append('date_from', currentFilters.date_from);
      if (currentFilters.date_to) params.append('date_to', currentFilters.date_to);
      if (currentFilters.min_messages) params.append('min_messages', currentFilters.min_messages);
      if (currentFilters.max_messages) params.append('max_messages', currentFilters.max_messages);
      if (page) params.append('page', page);
      if (pageSize) params.append('page_size', pageSize);

      const queryString = params.toString();
      const base = `api/agent/${currentAgentName}/customers/`;
      const url = queryString ? `${base}?${queryString}` : base;
      
      const response = await getData(url);
      
      if (response) {
        setCustomers(response.results || []);
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize: pageSize,
          total: response.count || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      message.error('Failed to fetch customers data');
    } finally {
      setLoading(false);
    }
  };

  // Load data when agent name is available
  useEffect(() => {
    if (currentAgentName) {
      fetchCustomers(pagination.current, pagination.pageSize, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAgentName]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchCustomers(1, pagination.pageSize, filters);
  };

  // Reset filters
  const resetFilters = () => {
    const resetFilters = {
      search: '',
      date_from: '',
      date_to: '',
      min_messages: '',
      max_messages: '',
    };
    setFilters(resetFilters);
    fetchCustomers(1, pagination.pageSize, resetFilters);
  };

  // Handle pagination change
  const handleTableChange = (paginationInfo) => {
    fetchCustomers(paginationInfo.current, paginationInfo.pageSize, filters);
  };

  // Export to CSV
  const exportToCSV = async () => {
    try {
      if (!currentAgentName) {
        message.warning('Agent name not loaded yet');
        return;
      }

      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.min_messages) params.append('min_messages', filters.min_messages);
      if (filters.max_messages) params.append('max_messages', filters.max_messages);
      params.append('export', 'csv');

      const queryString = params.toString();
      const base = `api/agent/${currentAgentName}/customers/`;
      const url = `${base}?${queryString}`;
      
      const response = await getData(url);
      
      if (response && response.results) {
        // Create and download CSV file
        const csvContent = convertToCSV(response.results);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url_obj = URL.createObjectURL(blob);
        link.setAttribute('href', url_obj);
        link.setAttribute('download', 'customers.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success('Customers data exported successfully');
      }
    } catch (error) {
      console.error('Error exporting customers:', error);
      message.error('Failed to export customers data');
    }
  };

  // Convert data to CSV format
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = ['Customer ID', 'Email', 'Conversations', 'Messages', 'First Seen', 'Last Seen'];
    const csvRows = [headers.join(',')];
    
    data.forEach(customer => {
      const row = [
        customer.customer_id,
        customer.email,
        customer.conversations,
        customer.messages,
        new Date(customer.first_seen).toLocaleDateString(),
        new Date(customer.last_seen).toLocaleDateString()
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  };

  // Table columns matching the API response structure
  const columns = [
    {
      title: 'Customer ID',
      dataIndex: 'customer_id',
      key: 'customer_id',
      sorter: (a, b) => a.customer_id - b.customer_id,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <div>
          <div className="font-medium">{email}</div>
        </div>
      ),
    },
    {
      title: 'Conversations',
      dataIndex: 'conversations',
      key: 'conversations',
      sorter: (a, b) => a.conversations - b.conversations,
      render: (conversations) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {conversations}
        </span>
      ),
    },
    {
      title: 'Messages',
      dataIndex: 'messages',
      key: 'messages',
      sorter: (a, b) => a.messages - b.messages,
      render: (messages) => (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
          {messages}
        </span>
      ),
    },
    {
      title: 'First Seen',
      dataIndex: 'first_seen',
      key: 'first_seen',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.first_seen) - new Date(b.first_seen),
    },
    {
      title: 'Last Seen',
      dataIndex: 'last_seen',
      key: 'last_seen',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.last_seen) - new Date(b.last_seen),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Button
          shape="circle"
          icon={<MessageOutlined />}
          onClick={() => navigate(`/${id}/dashboard/chat-history/${record.customer_id}`)}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => fetchCustomers(pagination.current, pagination.pageSize)}
          >
            Refresh
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={exportToCSV}
          >
            Export CSV
          </Button>
        </Space>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <Input
              placeholder="Search by email..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <RangePicker
              className="w-full"
              onChange={(dates, dateStrings) => {
                handleFilterChange('date_from', dateStrings[0]);
                handleFilterChange('date_to', dateStrings[1]);
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Messages</label>
            <InputNumber
              className="w-full"
              placeholder="Min messages"
              min={0}
              value={filters.min_messages}
              onChange={(value) => handleFilterChange('min_messages', value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Messages</label>
            <InputNumber
              className="w-full"
              placeholder="Max messages"
              min={0}
              value={filters.max_messages}
              onChange={(value) => handleFilterChange('max_messages', value)}
            />
          </div>
          
          <div className="flex items-end">
            <Space>
              <Button 
                type="primary" 
                icon={<FilterOutlined />} 
                onClick={applyFilters}
              >
                Apply
              </Button>
              <Button onClick={resetFilters}>
                Reset
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={customers}
            rowKey="customer_id"
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
            className="min-h-[400px]"
          />
        </Spin>
      </div>
    </div>
  );
};

export default Customers;
