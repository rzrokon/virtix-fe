
import React, { useEffect, useMemo, useState } from 'react';
import { Table, Button, Input, DatePicker, Select, Space, message, Spin } from 'antd';
import { ReloadOutlined, SearchOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { getData } from '../../scripts/api-service';
import { useContentApi } from '../../contexts/ContentApiContext';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function AgentReport() {
  const { id } = useParams();
  const { currentAgentName } = useContentApi();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({
    date_from: null,
    date_to: null,
    customer_id: '',
    conversation: '',
    search: '',
    page: 1,
    page_size: 10,
  });

  const columns = useMemo(() => {
    return [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
      { title: 'Customer', dataIndex: 'customer_id', key: 'customer_id', width: 110 },
      { title: 'Conversation', dataIndex: 'conversation', key: 'conversation', width: 180 },
      { title: 'Email', dataIndex: 'email', key: 'email', width: 220 },
      { title: 'Query', dataIndex: 'user_query', key: 'user_query', ellipsis: true },
      { title: 'Prompt', dataIndex: 'prompt', key: 'prompt', ellipsis: true },
      { title: 'Response', dataIndex: 'response', key: 'response', ellipsis: true },
      { title: 'Date', dataIndex: 'date', key: 'date' },
    ];
  }, []);

  const buildQuery = (page = pagination.current, pageSize = pagination.pageSize) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.customer_id) params.append('customer_id', filters.customer_id);
    if (filters.conversation) params.append('conversation', filters.conversation);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    params.append('page', String(page));
    params.append('page_size', String(pageSize));
    return params.toString();
  };

  const fetchReport = async (page = 1, pageSize = 10) => {
    if (!currentAgentName) {
      message.warning('Agent name not loaded yet');
      return;
    }

    try {
      setLoading(true);
      const qs = buildQuery(page, pageSize);
      const base = `api/agent/${currentAgentName}/report/`;
      const url = qs ? `${base}?${qs}` : base;
      const res = await getData(url);

      const results = res?.results || res?.data?.results || [];
      const total = res?.count || res?.data?.count || results.length;

      setData(results);
      setPagination({ current: page, pageSize, total });
    } catch (err) {
      console.error('Error fetching report:', err);
      message.error('Failed to fetch agent report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentAgentName) {
      fetchReport(pagination.current, pagination.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAgentName]);

  const handleTableChange = (pag) => {
    fetchReport(pag.current, pag.pageSize);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const onDateChange = (dates) => {
    if (!dates || dates.length === 0) {
      setFilters(prev => ({ ...prev, date_from: null, date_to: null }));
      return;
    }
    setFilters(prev => ({
      ...prev,
      date_from: dates[0]?.format('YYYY-MM-DD') || null,
      date_to: dates[1]?.format('YYYY-MM-DD') || null,
    }));
  };

  const convertToCSV = (items) => {
    if (!items || items.length === 0) return '';
    const headers = ['id','customer_id','conversation','email','user_query','prompt','response','date'];
    const lines = [headers.join(',')];
    for (const item of items) {
      const row = headers.map(h => {
        const val = item[h];
        const safe = typeof val === 'string' ? '"' + val.replace(/"/g, '""') + '"' : (val ?? '');
        return safe;
      });
      lines.push(row.join(','));
    }
    return lines.join('\n');
  };

  const exportCSV = async () => {
    try {
      if (!currentAgentName) {
        message.warning('Agent name not loaded yet');
        return;
      }

      const params = new URLSearchParams(buildQuery().toString());
      params.set('export', 'csv');
      const base = `api/agent/${currentAgentName}/report/`;
      const url = `${base}?${params.toString()}`;
      const res = await getData(url);
      const results = res?.results || res?.data?.results || [];
      const csv = convertToCSV(results);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const downloadUrl = URL.createObjectURL(blob);
      link.setAttribute('href', downloadUrl);
      link.setAttribute('download', 'agent_report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('Report exported successfully');
    } catch (err) {
      console.error('Error exporting report:', err);
      message.error('Failed to export report');
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Agent Report</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchReport(pagination.current, pagination.pageSize)}>
            Reload
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={exportCSV}>
            Export CSV
          </Button>
        </Space>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <Space wrap>
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
          <RangePicker onChange={onDateChange} />
          <Input
            placeholder="Customer ID"
            value={filters.customer_id}
            onChange={(e) => handleFilterChange('customer_id', e.target.value)}
            style={{ width: 160 }}
          />
          <Input
            placeholder="Conversation"
            value={filters.conversation}
            onChange={(e) => handleFilterChange('conversation', e.target.value)}
            style={{ width: 180 }}
          />
          <Select
            placeholder="Page size"
            value={pagination.pageSize}
            onChange={(val) => {
              setPagination(prev => ({ ...prev, pageSize: val }));
              fetchReport(pagination.current, val);
            }}
            style={{ width: 140 }}
          >
            <Option value={10}>10</Option>
            <Option value={20}>20</Option>
            <Option value={50}>50</Option>
          </Select>
          <Button icon={<FilterOutlined />} type="default" onClick={() => fetchReport(1, pagination.pageSize)}>
            Apply Filters
          </Button>
        </Space>
      </div>

      {loading ? (
        <div className="text-center py-10"><Spin size="large" /></div>
      ) : (
        <Table
          rowKey={(record) => record.id || `${record.customer_id}-${record.conversation}-${record.date}`}
          columns={columns}
          dataSource={data}
          pagination={pagination}
          onChange={handleTableChange}
        />
      )}
    </div>
  );
}
