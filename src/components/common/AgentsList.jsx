import React, { useEffect } from 'react';
import { Card, List, Spin, Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useContentApi } from '../../contexts/ContentApiContext';

const AgentsList = () => {
  const { 
    agents, 
    loading, 
    error, 
    fetchAgents, 
    refreshAgents 
  } = useContentApi();

  // Fetch agents when component mounts
  useEffect(() => {
    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Loading agents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={refreshAgents}>
            Try Again
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Agents List</h2>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={refreshAgents}
          loading={loading}
        >
          Refresh
        </Button>
      </div>
      
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={agents}
        renderItem={(agent) => (
          <List.Item>
            <Card
              title={agent.name || agent.agent_name}
              extra={<a href="#">More</a>}
              hoverable
            >
              <p>{agent.description || agent.agent_description}</p>
              <p><strong>ID:</strong> {agent.id}</p>
              {agent.status && <p><strong>Status:</strong> {agent.status}</p>}
            </Card>
          </List.Item>
        )}
      />
      
      {agents.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>No agents found.</p>
          <Button type="primary" onClick={refreshAgents}>
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
};

export default AgentsList;