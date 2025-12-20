import axios from 'axios'
import Cookies from 'js-cookie'
import { checkRes } from './helper'

// axios.defaults.headers.post["Accept"] = "application/json";
const base_url = import.meta.env.VITE_BASE_URL

/* query ---> api url to query with
   no_token ---> acts as a flag for no need to use token */
export const getData = async (query, no_token) => {
  const token = Cookies.get('kotha_token')

  try {
    let data = await axios.get(`${base_url}${query}`, {
      headers: no_token
        ? {}
        : {
          Authorization: token ? `Bearer ${token}` : null,
          // "lang": i18n?.language || 'en',
          // "responseType": "arraybuffer"
        },
    })

    // if (checkRes(data.status)) {
    return data?.data
    // }
  } catch (error) {
    // checkRes(error?.response?.status);
    // error.response?.data?.messages &&
    // typeof error.response?.data?.messages === "object"
    // ? error.response.data.messages.map((err) => {
    //     alertPop(error_status, err);
    //     })
    // : errorHandle(error);
    // return false;
  }
}

/* query ---> api url to query with
     data ---> data to be posted
     no_token ---> acts as a flag for no need to use token */

export const postData = async (
  query,
  data,
  no_token,
  showError,
  notShowAlert,
  suppressAuthRedirect = false
) => {
  const token = Cookies.get('kotha_token')

  try {
    let res = await axios({
      method: 'post',
      url: `${base_url}${query}`,
      headers: no_token
        ? {}
        : {
          Authorization: token ? `Bearer ${token}` : null,
          // "lang": i18n?.language || 'en',
          // "responseType": "arraybuffer"
        },
      data: data,
    })
    return res
  } catch (error) {
    console.log('error?.response?.data', error?.response)
    if (!suppressAuthRedirect) {
      checkRes(error?.response?.status)
    }
    if (error?.response?.data && Object.keys(error.response.data).length) {
      return {
        error: true,
        errors: error?.response?.data,
      }
    }
    return error.response.data
  }
}

export const deleteData = async (query, no_token) => {
  const token = Cookies.get('kotha_token')

  try {
    let data = await axios.delete(`${base_url}${query}`, {
      headers: no_token
        ? {}
        : {
          Authorization: `Bearer ${token}`,
        },
    })
    return data
    // if (checkRes(data.status)) {
    //     // setUserProfile();
    //     return data;
    // } else {
    //     toast.error(msg_undefined);
    // }
  } catch (error) {
    // checkRes(error?.response?.status);
    // error.response?.data?.messages &&
    // typeof error.response?.data?.messages === "object"
    // ? error.response.data.messages.map((err) => {
    //     alertPop(error_status, err);
    //     })
    // : errorHandle(error);
    // return false;
  }
}

export const putData = async (query, data, no_token, showError) => {
  const token = Cookies.get('kotha_token')

  try {
    let res = await axios({
      method: 'put',
      url: `${base_url}${query}`,
      headers: no_token
        ? {}
        : {
          Authorization: `Bearer ${token}`,
        },
      data: data,
    })
    return res
  } catch (error) {
    console.log('error?.response?.data', error?.response)

    if (error?.response?.data && Object.keys(error.response.data).length) {
      return {
        error: true,
        errors: error?.response?.data,
      }
    }
    return error.response
  }
}

export const patchData = async (query, data, no_token, showError) => {
  const token = Cookies.get('kotha_token')

  try {
    let res = await axios({
      method: 'patch',
      url: `${base_url}${query}`,
      headers: no_token
        ? {}
        : {
          Authorization: `Bearer ${token}`,
        },
      data: data,
    })
    return res
  } catch (error) {
    console.log('error?.response?.data', error?.response)

    if (error?.response?.data && Object.keys(error.response.data).length) {
      return {
        error: true,
        errors: error?.response?.data,
      }
    }
    return error.response
  }
}

// Logout function
export const logoutUser = async () => {
  const token = Cookies.get('kotha_token');
  const refreshToken = Cookies.get('kotha_refresh_token');

  try {
    // Call logout API if tokens exist
    if (token && refreshToken) {
      await postData('api/user/logout/', {
        refresh: refreshToken
      }, false);
    }
  } catch (error) {
    console.error('Logout API error:', error);
    // Continue with local logout even if API fails
  } finally {
    // Always clear local storage and cookies
    Cookies.remove('kotha_token');
    Cookies.remove('kotha_refresh_token');
    localStorage.removeItem('kotha_token');
    localStorage.removeItem('kotha_refresh_token');

    // Redirect to signin page
    window.location.href = '/signin';
  }
};

// Token refresh function
export const refreshToken = async () => {
  const refresh = Cookies.get('kotha_refresh_token');

  if (!refresh) {
    throw new Error('No refresh token available');
  }

  try {
    const res = await postData('api/user/token/refresh/', { refresh }, true);
    const data = res?.data ?? res;

    if (data?.access) {
      Cookies.set('kotha_token', data.access, { expires: 1 });
      localStorage.setItem('kotha_token', data.access);

      if (data?.refresh) {
        Cookies.set('kotha_refresh_token', data.refresh, { expires: 7 });
        localStorage.setItem('kotha_refresh_token', data.refresh);
      }

      return data.access;
    }

    throw new Error('Invalid refresh response');
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear tokens and redirect to login
    Cookies.remove('kotha_token');
    Cookies.remove('kotha_refresh_token');
    localStorage.removeItem('kotha_token');
    localStorage.removeItem('kotha_refresh_token');
    window.location.href = '/signin';
    throw error;
  }
};

export const refreshTokenWithValue = async (refresh) => {
  try {
    const res = await postData('api/user/token/refresh/', { refresh }, true);
    const data = res?.data ?? res;
    if (data?.access) {
      Cookies.set('kotha_token', data.access, { expires: 1 });
      localStorage.setItem('kotha_token', data.access);
      if (data?.refresh) {
        Cookies.set('kotha_refresh_token', data.refresh, { expires: 7 });
        localStorage.setItem('kotha_refresh_token', data.refresh);
      }
      return data;
    }
    throw new Error('Invalid refresh response');
  } catch (error) {
    console.error('Token refresh failed:', error);
    return {
      error: true,
      errors: error?.response?.data || 'Token refresh failed',
    };
  }
};

// Enhanced postData with automatic token refresh
export const postDataWithRefresh = async (query, data, no_token, showError, notShowAlert) => {
  try {
    return await postData(query, data, no_token, showError, notShowAlert);
  } catch (error) {
    // If we get a 401 error and have a refresh token, try to refresh
    if (error?.response?.status === 401 && !no_token && Cookies.get('kotha_refresh_token')) {
      try {
        await refreshToken();
        // Retry the original request with the new token
        return await postData(query, data, no_token, showError, notShowAlert);
      } catch (refreshError) {
        console.error('Token refresh failed, redirecting to login');
        throw refreshError;
      }
    }
    throw error;
  }
};

// Agent-specific API methods
export const getAgentById = async (agentId) => {
  try {
    const response = await getData(`api/agent/agents/${agentId}/`);
    return response;
  } catch (error) {
    console.error('Error fetching agent by ID:', error);
    throw error;
  }
};
