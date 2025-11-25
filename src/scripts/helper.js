import Cookies from 'js-cookie'

export const checkRes = (param) => {
  if (param === 200 || param === 201 || param === 212) {
    return true
  } else if (param === 401) {
    Cookies.remove('kotha_token')
    localStorage.removeItem('kotha_token')
    window.location = '/signin'
  } else if (param === 403) {
    Cookies.remove('kotha_token')
    localStorage.removeItem('kotha_token')
    window.location = '/signin'
  } else {
    return false
  }
}

// Token management helpers
export const setAuthToken = (token, refreshToken) => {
  Cookies.set('kotha_token', token, { expires: 1 }) // 1 day
  if (refreshToken) {
    Cookies.set('kotha_refresh_token', refreshToken, { expires: 7 }) // 7 days
  }
}

export const getAuthToken = () => {
  return Cookies.get('kotha_token')
}

export const getRefreshToken = () => {
  return Cookies.get('kotha_refresh_token')
}

export const removeAuthTokens = () => {
  Cookies.remove('kotha_token')
  Cookies.remove('kotha_refresh_token')
  localStorage.removeItem('kotha_token')
  localStorage.removeItem('kotha_refresh_token')
}

// Form validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  return password && password.length >= 6
}

// Error handling helper
export const handleApiError = (error) => {
  if (error?.response?.data) {
    const errorData = error.response.data
    if (typeof errorData === 'object') {
      // Handle field-specific errors
      const errorMessages = []
      Object.keys(errorData).forEach(key => {
        if (Array.isArray(errorData[key])) {
          errorMessages.push(...errorData[key])
        } else {
          errorMessages.push(errorData[key])
        }
      })
      return errorMessages.join(', ')
    }
    return errorData.message || errorData.detail || 'An error occurred'
  }
  return error?.message || 'Network error occurred'
}