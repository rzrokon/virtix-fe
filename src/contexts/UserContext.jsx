import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { GET_USER_PROFILE } from '../scripts/api';
import { getData } from '../scripts/api-service';

// Create the context
const UserContext = createContext();

// Custom hook to use the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Context provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to get profile image URL
  const getProfileImageUrl = (photoPath) => {
    if (photoPath) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.virtixai.com/';
      // Remove leading slash if present to avoid double slashes
      const cleanPhotoPath = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;
      return `${baseUrl}${cleanPhotoPath}`;
    }
    return null;
  };

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    const token = Cookies.get('kotha_token');
    
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await getData(GET_USER_PROFILE);
      if (response) {
        setUser({
          ...response,
          profileImageUrl: getProfileImageUrl(response.photo)
        });
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to fetch user profile');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to update user data
  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData,
      profileImageUrl: getProfileImageUrl(userData.photo || prevUser?.photo)
    }));
  };

  // Function to clear user data (for logout)
  const clearUser = () => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Check authentication status on mount and token changes
  useEffect(() => {
    const token = Cookies.get('kotha_token');
    if (token && !user) {
      fetchUserProfile();
    } else if (!token) {
      clearUser();
    }
  }, []);

  // Listen for token changes
  useEffect(() => {
    const checkToken = () => {
      const token = Cookies.get('kotha_token');
      if (!token && isAuthenticated) {
        clearUser();
      } else if (token && !isAuthenticated && !loading) {
        fetchUserProfile();
      }
    };

    // Check token every 5 seconds
    const interval = setInterval(checkToken, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, loading]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    fetchUserProfile,
    updateUser,
    clearUser,
    getProfileImageUrl
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;