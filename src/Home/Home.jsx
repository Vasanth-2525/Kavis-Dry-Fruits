import React from 'react'
import Hero from './Hero'
import Category from './Category'
import PopularProduct from './PopularProduct'
import About from './about'
import NewArrived from './NewArrived'
import ClientsAbout from './ClientsAbout'
import Services from './Services'
import OfferBanner from './OfferBanner'
import FestiveGiftPack from './FestiveGiftPack'
import RelatedBlog from './RelatedBlog'
import Contact from './Contact'
import Subscribe from './Subscribe'


const Home = () => {
  return (
    <div>
        <Hero/>
        <Category/>
        <PopularProduct/>
        <About/>
        <NewArrived/>
        <ClientsAbout/>
        <Services/>
        <OfferBanner/>
        <FestiveGiftPack/>
        <RelatedBlog/>
        <Contact/>
        <Subscribe/>
    </div>
  )
}

export default Home