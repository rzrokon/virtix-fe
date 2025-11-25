import { Fragment } from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../components/common/privateLayout/Footer'
import Header from '../components/common/privateLayout/Header'

export default function PublicLayout() {
  return (
    <Fragment>
      <Header />
      <div className='bg-gradient-to-br from-[#f3e7ff] via-[#e7f0ff] to-[#e7ffe7]'>
        <Outlet />
      </div>
      <Footer />
    </Fragment>
  )
}