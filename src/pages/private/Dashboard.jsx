import { Line } from '@ant-design/plots';
import { Card, Col, Radio, Row, Spin, Table, message } from 'antd';
import { useEffect, useState } from 'react';
import { getData } from '../../scripts/api-service';
import { useContentApi } from '../../contexts/ContentApiContext';

// Removed demo data source as per requirement

const columns = [
  {
    title: 'Question',
    dataIndex: 'prompt',
    key: 'prompt',
  },
  {
    title: 'Times',
    dataIndex: 'count',
    key: 'count',
    width: 150,
  },
];

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const { currentAgentName } = useContentApi();

  useEffect(() => {
    if (currentAgentName) {
      fetchDashboardData();
    }
  }, [days, currentAgentName]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (!currentAgentName) {
        setDashboardData(null);
        return;
      }
      const data = await getData(`api/agent/${currentAgentName}/dashboard/?days=${days}&top=5`);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Error loading dashboard');
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (e) => {
    const value = e.target.value;
    let daysValue = 7;
    if (value === 'Weekly') daysValue = 7;
    else if (value === 'Monthly') daysValue = 30;
    else if (value === 'Daily') daysValue = 1;

    setDays(daysValue);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }
  return (
    <div className='space-y-6'>
      <h1 className="text-2xl font-bold">
        Dashboard
      </h1>

      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col className="gutter-row" span={6}>
          <Card  >
            <div className='flex  items-center flex-row gap-4'>
              <div>
                <img src="/assets/images/Frame191.png" alt="icon" />
              </div>
              <div>
                <h2 className='text-2xl font-bold'>{dashboardData?.totals?.conversations ?? 0}</h2>
                <p className='text-gray-500'>Total Conversations</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col className="gutter-row" span={6}>
          <Card  >
            <div className='flex  items-center flex-row gap-4'>
              <div>
                <img src="/assets/images/Frame191.png" alt="icon" />
              </div>
              <div>
                <h2 className='text-2xl font-bold'>{dashboardData?.totals?.messages ?? 0}</h2>
                <p className='text-gray-500'>Total Messages</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col className="gutter-row" span={6}>
          <Card  >
            <div className='flex  items-center flex-row gap-4'>
              <div>
                <img src="/assets/images/Frame191.png" alt="icon" />
              </div>
              <div>
                <h2 className='text-2xl font-bold'>{dashboardData?.totals?.customers ?? 0}</h2>
                <p className='text-gray-500'>Total Customers</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col className="gutter-row" span={6}>
          <Card  >
            <div className='flex  items-center flex-row gap-4'>
              <div>
                <img src="/assets/images/Frame191.png" alt="icon" />
              </div>
              <div>
                <h2 className='text-2xl font-bold'>{dashboardData?.agent_name || 'N/A'}</h2>
                <p className='text-gray-500'>Agent Name</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <Col className="gutter-row" span={14}>
          <Card>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold mb-4'>Chat Volume Graph</h2>
              <div>
                <Radio.Group
                  options={[
                    { label: 'Daily', value: 'Daily', className: 'label-1' },
                    { label: 'Weekly', value: 'Weekly', className: 'label-2' },
                    { label: 'Monthly', value: 'Monthly', className: 'label-3' },
                  ]}
                  onChange={handleTimeRangeChange}
                  value={days === 1 ? 'Daily' : days === 7 ? 'Weekly' : 'Monthly'}
                  optionType="button"
                  buttonStyle="solid"
                />
              </div>
            </div>
            <DemoLine data={dashboardData?.last_7d || []} />
          </Card>
        </Col>

        <Col className="gutter-row" span={10}>
          <Card>
            <h2 className='text-xl font-bold mb-4'>Sentiments</h2>

          </Card>
        </Col>
      </Row>
      <Card>
        <h2 className='text-xl font-bold mb-4'>Top FAQs Asked </h2>
        <Table
          dataSource={dashboardData?.top_topics || []}
          columns={columns}
          pagination={false}
        />
      </Card>
    </div>
  )
}

const DemoLine = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500">Not found data</div>;
  }

  const transformedData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: item.count
  }));

  const config = {
    data: transformedData,
    xField: 'date',
    yField: 'count',
    point: {
      shapeField: 'square',
      sizeField: 4,
    },
    interaction: {
      tooltip: {
        marker: false,
      },
    },
    style: {
      lineWidth: 2,
    },
  };
  return <Line {...config} />;
};
