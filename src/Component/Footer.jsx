import Logo from '/images/Kavi_logo.png';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaWhatsapp, FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { IoMail } from 'react-icons/io5';
import { MdLocationPin } from 'react-icons/md';
import { MdKeyboardArrowRight } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="bg-primary text-white  pt-10 pb-6 px-6 md:px-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

        {/* Logo & Description */}
        <div>
          <img src={Logo} alt="Kavi Logo" className="w-28 mb-4" />
          <p className="text-sm text-justify leading-[25px]">
            Your source for 100% Natural, premium quality dry fruits — straight from the farm to your home.
          </p>
        </div>

        {/* Quick Links */}
        <div className="px-0 md:px-15">
          <h2 className="font-semibold text-lg mb-4 ">Quick Links</h2>
          <ul className="space-y-2  text-sm">
            <li className=' flex items-center gap-2 transition-all duration-300 hover:translate-x-3'><MdKeyboardArrowRight size={20} /><Link to="/" className="">Home</Link></li>
            <li className=' flex items-center gap-2 transition-all duration-300 hover:translate-x-3'><MdKeyboardArrowRight size={20} /><Link to="/shop" className="">Shop</Link></li>
            <li className=' flex items-center gap-2 transition-all duration-300 hover:translate-x-3'><MdKeyboardArrowRight size={20} /><Link to="/about" className="">About Us</Link></li>
            <li className=' flex items-center gap-2 transition-all duration-300 hover:translate-x-3'><MdKeyboardArrowRight size={20} /><Link to="/blog" className="">Blog</Link></li>
            <li className=' flex items-center gap-2 transition-all duration-300 hover:translate-x-3'><MdKeyboardArrowRight size={20} /><Link to="/contact" className="">Contact Us</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h2 className="font-semibold text-lg mb-4">Customer Care</h2>
          <ul className="space-y-2 text-sm">
            <li><Link to="/faq" className="">FAQ</Link></li>
            <li><Link to="/shipping" className="">Shipping & Delivery</Link></li>
            <li><Link to="/returns" className="">Return Policy</Link></li>
            <li><Link to="/track-order" className="">Track Order</Link></li>
            <li><Link to="/bulk-orders" className="">Bulk / Wholesale Order</Link></li>
          </ul>
        </div>

        {/* Contact & Social Media */}
        <div>
          <h2 className="font-semibold text-lg mb-4">Contact Us</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <MdLocationPin className="mt-1 text-2xl " />
              <span className="">121/ New Street, Tirupattur, 635653</span>
            </li>
            <li className="flex items-center gap-2">
              <FaPhoneAlt className="text-xl"/>
              <span>+91 8788999010</span>
            </li>
            <li className="flex items-center gap-2">
              <IoMail className="text-xl"/>
              <span>dryfruits@gmail.com</span>
            </li>
          </ul>

          <div className="flex items-center gap-4 mt-4 text-xl text-white">
            <Link className="text-2xl bg-white rounded-full text-green-600 p-1.5 hover:-translate-y-2 transition-all duration-300"><FaWhatsapp /></Link>
            <Link className="text-2xl bg-white rounded-full text-blue-600 p-1.5 hover:-translate-y-2 transition-all duration-300"><FaFacebook /></Link>
            <Link className="text-2xl bg-white rounded-full text-pink-700 p-1.5 hover:-translate-y-2 transition-all duration-300"><FaInstagram /></Link>
            <Link className="text-2xl bg-white rounded-full text-red-600 p-1.5 hover:-translate-y-2 transition-all duration-300"><FaYoutube /></Link>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-white pt-4 text-center text-md text-white flex items-center justify-between flex-wrap md:flex-nowrap">
        <p>© 2025 Dry Fruits. All Rights Reserved.</p>
        <p className="mt-1">
         Privacy Policy | Terms of Service
          
        </p>
      </div>
    </footer>
  );
};

export default Footer;