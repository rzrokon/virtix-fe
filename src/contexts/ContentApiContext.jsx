import React, { createContext, useContext, useState, useEffect } from 'react';
import { GET_AGENT } from '../scripts/api';
import { getData } from '../scripts/api-service';

// Create the context
const ContentApiContext = createContext();

// Custom hook to use the context
export const useContentApi = () => {
  const context = useContext(ContentApiContext);
  if (!context) {
    throw new Error('useContentApi must be used within a ContentApiProvider');
  }
  return context;
};

// Context provider component
export const ContentApiProvider = ({ children }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentAgentName, setCurrentAgentName] = useState(null);

  // Function to fetch agents using GET_AGENT endpoint
  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getData(GET_AGENT);
      if (response) {
        setAgents(response);
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  // Function to get a specific agent by ID
  const getAgentById = async (agentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getData(`${GET_AGENT}${agentId}/`);
      if (response) {
        return response;
      }
    } catch (err) {
      console.error('Error fetching agent:', err);
      setError('Failed to fetch agent');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh agents data
  const refreshAgents = () => {
    fetchAgents();
  };

  // Context value
  const contextValue = {
    agents,
    loading,
    error,
    fetchAgents,
    getAgentById,
    refreshAgents,
    setError,
    currentAgentName,
    setCurrentAgentName,
  };

  return (
    <ContentApiContext.Provider value={contextValue}>
      {children}
    </ContentApiContext.Provider>
  );
};

export default ContentApiContext;