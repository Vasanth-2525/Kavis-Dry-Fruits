import { useEffect, useState } from "react";
import {
  FaPhone,
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Real Firebase Auth State Checker
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // true if user exists
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="hidden md:block bg-primary text-white text-sm font-poppins">
      <div className="container mx-auto flex justify-between items-center py-2 px-4">
        {/* Contact Info */}
        <div className="flex items-center space-x-4">
          <a
            href="tel:+918798798345"
            className="flex items-center space-x-1 hover:text-green-200"
          >
            <FaPhone />
            <span>+91 8798798345</span>
          </a>
          <span className="text-green2">|</span>
          <a
            href="mailto:dryfruits@gmail.com"
            className="flex items-center space-x-1 hover:text-green-200"
          >
            <IoMdMail />
            <span>dryfruits@gmail.com</span>
          </a>
        </div>

        {/* Social + Auth Links */}
        <div className="flex items-center space-x-4">
          {/* Social Icons */}
          <div className="flex items-center space-x-2">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp size={20} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <FaFacebookF size={16} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <FaInstagram size={20} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <FaYoutube size={20} />
            </a>
          </div>

          {/* Auth Links */}
          <div className="flex items-center space-x-2">
            <span className="text-green2">|</span>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="hover:text-green-200"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="hover:text-green-200">
                  Login
                </Link>
                <span className="text-green2">|</span>
                <Link to="/register" className="hover:text-green-200">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
