import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "/images/Kavi_logo.png";
import { FaHeart, FaUser, FaBars, FaTimes } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { useStore } from "../Context/StoreContext";
import { CgProfile } from "react-icons/cg";
import { FiLogIn, FiLogOut } from "react-icons/fi";
import { FaArrowUp } from "react-icons/fa";

const Navbar = () => {
  const { favorites, cartItems } = useStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [categoryProduct, setCategoryProduct] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    fetch("/DryFruitsProductData.json")
      .then((res) => res.json())
      .then((data) => setCategoryProduct(data))
      .catch((err) => console.error("Error loading ProductData.json", err));
  }, []);

  const uniqueCategories = [...new Set(categoryProduct.map((item) => item.category))];
  const filterCategory = uniqueCategories.filter((item) => item !== "Combo");
  filterCategory.sort((a, b) => a.length - b.length);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loggedUser = localStorage.getItem("username");
    setUser(loggedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("isAuthenticated");
    setUser(null);
    setUserDropdownOpen(false);
    window.location.reload();
  };

  const pagesItems = ["About Us", "Contact Us", "Blogs"];
  const userFirstLetter = user ? user.charAt(0).toUpperCase() : "";

  const isMobile = windowWidth < 1024; // For Tailwind lg breakpoint

  return (
    <header className="relative z-50">
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed z-50 right-6 bottom-6 p-3 bg-green1 hover:bg-primary text-white rounded-full shadow-lg"
        >
          <FaArrowUp size={20} />
        </button>
      )}

      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/">
          <img src={logo} alt="logo" className="w-20" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-6 text-base font-medium text-black">
          <Link to="/" className="hover:text-green-600">Home</Link>
          <Link to="/shop" className="hover:text-green-600">Shop</Link>

          {/* Category */}
          <div
            className="relative"
            onMouseEnter={() => !isMobile && setCategoryOpen(true)}
            onMouseLeave={() => !isMobile && setCategoryOpen(false)}
          >
            <button
              onClick={() => isMobile && setCategoryOpen(!categoryOpen)}
              className="hover:text-green-600"
            >
              Category
            </button>
            {categoryOpen && (
              <div className="absolute top-full left-0 w-30 py-3 bg-white shadow z-50">
                {filterCategory.map((item, idx) => (
                  <Link
                    key={idx}
                    to={`/category/${item.toLowerCase().replace(/\s+/g, "")}`}
                    className="block px-4 py-1 text-sm hover:text-green-600"
                    onClick={() => isMobile && setCategoryOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/combos" className="hover:text-green-600">Combos</Link>
          <Link to="/offers" className="hover:text-green-600">Offers</Link>

          {/* Pages */}
          <div
            className="relative"
            onMouseEnter={() => !isMobile && setPagesOpen(true)}
            onMouseLeave={() => !isMobile && setPagesOpen(false)}
          >
            <button
              onClick={() => isMobile && setPagesOpen(!pagesOpen)}
              className="hover:text-green-600"
            >
              Pages
            </button>
            {pagesOpen && (
              <div className="absolute top-full left-0 w-36 py-3 bg-white shadow z-50">
                {pagesItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to={`/${item.toLowerCase().replace(/\s+/g, "")}`}
                    className="block px-4 py-1 text-sm hover:text-green-600"
                    onClick={() => isMobile && setPagesOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right icons */}
        <div className="flex items-center space-x-4 relative">
          <div className="hidden lg:flex items-center border-2 border-green2 rounded-md overflow-hidden shadow-sm">
            <input
              type="search"
              placeholder="Search dry fruits..."
              className="px-4 py-2 w-64 outline-none text-sm"
            />
            <button className="px-3 text-green-600">
              <FiSearch size={18} />
            </button>
          </div>

          <Link to="/addtofav" className="relative border border-green1 rounded-full p-2 text-green-700 hover:bg-primary hover:text-white">
            <FaHeart size={18} />
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {favorites.length}
            </span>
          </Link>

          <Link to="/addtocart" className="relative border border-green1 rounded-full p-2 text-primary hover:bg-primary hover:text-white">
            <IoCartOutline size={18} />
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {cartItems.length}
            </span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="border border-green1 rounded-full p-2 text-primary hover:bg-primary hover:text-white w-8 h-8 flex items-center justify-center text-lg uppercase"
            >
              {user ? userFirstLetter : <FaUser size={18} />}
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-36 bg-white shadow rounded-md text-sm text-center py-2 z-50">
                {user ? (
                  <>
                    <Link to="/account" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-1 hover:text-green-600">
                      <CgProfile size={15} /> My Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-1 text-red-600"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setUserDropdownOpen(false)} className="flex items-center justify-center gap-2 px-4 py-1 hover:text-green-600">
                    <FiLogIn /> Login
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-green-600 text-xl ml-2">
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {menuOpen && (
        <div className="lg:hidden px-5 py-4 bg-white shadow text-sm space-y-4">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block">Home</Link>
          <Link to="/shop" onClick={() => setMenuOpen(false)} className="block">Shop</Link>

          {/* Category Mobile */}
          <div>
            <button onClick={() => setCategoryOpen(!categoryOpen)} className="w-full text-left">
              Category
            </button>
            {categoryOpen && (
              <div className="pl-4 space-y-1">
                {filterCategory.map((item, idx) => (
                  <Link
                    key={idx}
                    to={`/category/${item.toLowerCase().replace(/\s+/g, "")}`}
                    onClick={() => setMenuOpen(false)}
                    className="block"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/combos" onClick={() => setMenuOpen(false)} className="block">Combos</Link>
          <Link to="/offers" onClick={() => setMenuOpen(false)} className="block">Offers</Link>

          {/* Pages Mobile */}
          <div>
            <button onClick={() => setPagesOpen(!pagesOpen)} className="w-full text-left">
              Pages
            </button>
            {pagesOpen && (
              <div className="pl-4 space-y-1">
                {pagesItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to={`/${item.toLowerCase().replace(/\s+/g, "")}`}
                    onClick={() => setMenuOpen(false)}
                    className="block"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
