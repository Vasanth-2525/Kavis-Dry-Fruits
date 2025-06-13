import React from 'react'
import PageHeader from '../Component/PageHeader'
import About from '../Home/about'
import ClientsAbout from '../Home/ClientsAbout'
import Services from '../Home/Services'

const About_Us = () => {
  return (
    <div>
        <PageHeader title={"About US"} curpage={"About Us"}/>
        <About/>
        <ClientsAbout/>
        <Services/>
    </div>
  )
}

export default About_Us