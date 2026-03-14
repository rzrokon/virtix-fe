import axios from 'axios'
import Cookies from 'js-cookie'

const base_url = import.meta.env.VITE_BASE_URL

let refreshRequest = null

const clearAuthState = () => {
  Cookies.remove('kotha_token')
  Cookies.remove('kotha_refresh_token')
  localStorage.removeItem('kotha_token')
  localStorage.removeItem('kotha_refresh_token')
}

const redirectToSignin = () => {
  if (window.location.pathname !== '/signin') {
    window.location.href = '/signin'
  }
}

const forceLogout = () => {
  clearAuthState()
  redirectToSignin()
}

const refreshAccessToken = async () => {
  const refresh = Cookies.get('kotha_refresh_token')

  if (!refresh) {
    throw new Error('No refresh token available')
  }

  if (!refreshRequest) {
    refreshRequest = axios
      .post(`${base_url}api/user/token/refresh/`, { refresh })
      .then((res) => {
        const data = res?.data

        if (!data?.access) {
          throw new Error('Invalid refresh response')
        }

        Cookies.set('kotha_token', data.access, { expires: 1 })
        localStorage.setItem('kotha_token', data.access)

        if (data?.refresh) {
          Cookies.set('kotha_refresh_token', data.refresh, { expires: 7 })
          localStorage.setItem('kotha_refresh_token', data.refresh)
        }

        return data.access
      })
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

const requestWithAuth = async (config, options = {}) => {
  const { no_token = false, suppressAuthRedirect = false, retryOn401 = true } = options
  const token = Cookies.get('kotha_token')

  try {
    return await axios({
      ...config,
      url: `${base_url}${config.url}`,
      headers: {
        ...(config.headers || {}),
        ...(no_token ? {} : { Authorization: token ? `Bearer ${token}` : null }),
      },
    })
  } catch (error) {
    const status = error?.response?.status

    if (status === 401 && !no_token && retryOn401) {
      try {
        await refreshAccessToken()
        return await requestWithAuth(config, {
          ...options,
          retryOn401: false,
        })
      } catch (refreshError) {
        if (!suppressAuthRedirect) {
          forceLogout()
        }
        throw refreshError
      }
    }

    if ((status === 401 || status === 403) && !no_token && !suppressAuthRedirect) {
      forceLogout()
    }

    throw error
  }
}

/* query ---> api url to query with
   no_token ---> acts as a flag for no need to use token */
export const getData = async (query, no_token) => {
  const response = await requestWithAuth(
    {
      method: 'get',
      url: query,
    },
    { no_token }
  )

  return response?.data
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
  try {
    return await requestWithAuth(
      {
        method: 'post',
        url: query,
        data,
      },
      { no_token, suppressAuthRedirect }
    )
  } catch (error) {
    console.log('error?.response?.data', error?.response)

    if (error?.response?.data && Object.keys(error.response.data).length) {
      return {
        error: true,
        errors: error?.response?.data,
      }
    }

    return error?.response?.data || error
  }
}

export const deleteData = async (query, no_token) => {
  try {
    return await requestWithAuth(
      {
        method: 'delete',
        url: query,
      },
      { no_token }
    )
  } catch (error) {
    return error
  }
}

export const putData = async (query, data, no_token, showError) => {
  try {
    return await requestWithAuth(
      {
        method: 'put',
        url: query,
        data,
      },
      { no_token }
    )
  } catch (error) {
    console.log('error?.response?.data', error?.response)

    if (error?.response?.data && Object.keys(error.response.data).length) {
      return {
        error: true,
        errors: error?.response?.data,
      }
    }

    return error?.response || error
  }
}

export const patchData = async (query, data, no_token, showError) => {
  try {
    return await requestWithAuth(
      {
        method: 'patch',
        url: query,
        data,
      },
      { no_token }
    )
  } catch (error) {
    console.log('error?.response?.data', error?.response)

    if (error?.response?.data && Object.keys(error.response.data).length) {
      return {
        error: true,
        errors: error?.response?.data,
      }
    }

    return error?.response || error
  }
}

export const logoutUser = async () => {
  const token = Cookies.get('kotha_token')
  const refreshToken = Cookies.get('kotha_refresh_token')

  try {
    if (token && refreshToken) {
      await postData(
        'api/user/logout/',
        { refresh: refreshToken },
        false,
        undefined,
        undefined,
        true
      )
    }
  } catch (error) {
    console.error('Logout API error:', error)
  } finally {
    forceLogout()
  }
}

export const refreshToken = async () => {
  try {
    return await refreshAccessToken()
  } catch (error) {
    console.error('Token refresh failed:', error)
    forceLogout()
    throw error
  }
}

export const refreshTokenWithValue = async (refresh) => {
  try {
    const res = await axios.post(`${base_url}api/user/token/refresh/`, { refresh })
    const data = res?.data

    if (!data?.access) {
      throw new Error('Invalid refresh response')
    }

    Cookies.set('kotha_token', data.access, { expires: 1 })
    localStorage.setItem('kotha_token', data.access)

    if (data?.refresh) {
      Cookies.set('kotha_refresh_token', data.refresh, { expires: 7 })
      localStorage.setItem('kotha_refresh_token', data.refresh)
    }

    return data
  } catch (error) {
    console.error('Token refresh failed:', error)
    return {
      error: true,
      errors: error?.response?.data || 'Token refresh failed',
    }
  }
}

export const postDataWithRefresh = async (query, data, no_token, showError, notShowAlert) => {
  return postData(query, data, no_token, showError, notShowAlert)
}

export const getAgentById = async (agentId) => {
  try {
    return await getData(`api/agent/agents/${agentId}/`)
  } catch (error) {
    console.error('Error fetching agent by ID:', error)
    throw error
  }
}
