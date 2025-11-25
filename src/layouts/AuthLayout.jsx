import Cookies from 'js-cookie'
import { Fragment, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import AuthHeader from '../components/common/authLayout/AuthHeader'

export default function AuthLayout() {
  const token = Cookies.get('kotha_token')

  useEffect(() => {
    if (token) {
      window.location = '/'
    }
  }, [token])

  return (
    <Fragment>
      <AuthHeader />
      <Outlet />
    </Fragment>
  )
}