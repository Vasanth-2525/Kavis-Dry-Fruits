import React from 'react'
import PageHeader from '../Component/PageHeader'
import Contact from '../Home/Contact'
import Services from '../Home/Services'

const Contac_Us = () => {
  return (
    <div>
        <PageHeader title={"Contact Us"} curpage={"Contact Us"}/>
        <Contact/>  
        <Services/>
    </div>
  )
}

export default Contac_Us