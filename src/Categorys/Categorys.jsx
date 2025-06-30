import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useStore } from "../Context/StoreContext";
import PageHeader from "../Component/PageHeader";
import { FaStar } from "react-icons/fa";
import { IoCartOutline, IoClose } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import { FiHeart } from "react-icons/fi";
import PageNavigation from "../Component/PageNavigation";
import OfferBanner from "../Home/OfferBanner";
import FestiveGiftPack from "../Home/FestiveGiftPack";
import Services from "../Home/Services";
import { toast } from "react-hot-toast";

const categories = ["All","Nuts", "DryFruits", "Dates", "Raisins", "DriedFruits", "Ayurvedic", "Seeds"];
const weights = ["All", "100g", "250g", "500g", "1000g"];
const productsPerPage = 6;

const Category = () => {
  const { categoryName } = useParams();
  const { addToFav, addToCart, allProducts } = useStore();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("All");
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedTag, setSelectedTag] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const capitalized = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();
    setSelectedCategory(capitalized);
  }, [categoryName]);

  useEffect(() => {
    const prices = allProducts.flatMap((p) =>
      typeof p.prices === "object"
        ? Object.values(p.prices).filter((v) => typeof v === "number")
        : []
    );
    const max = prices.length ? Math.max(...prices) : 1000;
    setMaxPrice(max);
    setPriceRange([0, max]);
  }, [allProducts]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) setShowFilters(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredProducts = allProducts.filter((p) => {
    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    const weightToUse = selectedWeight !== "All" ? selectedWeight : p.weights?.[0];
    const price = p.prices?.[weightToUse];
    const matchWeight = selectedWeight === "All" || p.weights?.includes(selectedWeight);
    const matchPrice = typeof price === "number" && price >= priceRange[0] && price <= priceRange[1];
    const matchRating = selectedRating === 0 || (p.rating || 0) >= selectedRating;
    const matchTag = selectedTag === "All" || p.tags?.includes(selectedTag);
    return matchCategory && matchWeight && matchPrice && matchRating && matchTag;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  const onFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <section className="bg-white">
      <PageHeader title="Category" curpage={selectedCategory} />

      <div className="text-center mt-6">
        <h2 className="text-2xl font-bold mb-4 text-green-600">
          {selectedCategory.toUpperCase()}
        </h2>
        <div className="w-[180px] h-[2px] border-b-2 border-dashed border-green1 mx-auto mb-4" />
      </div>

      <div className="bg-white px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {windowWidth < 768 && (
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="text-xl p-2 border rounded-full hover:bg-green1 hover:text-white transition"
          >
            {showFilters ? <IoClose /> : <CiFilter />}
          </button>
        )}

        {(showFilters || windowWidth >= 768) && (
          <aside className="bg-[#fffde7] h-fit rounded-xl p-4 shadow border border-green-200 md:sticky top-4">
            <h2 className="font-bold text-lg mb-4 text-green-700">Filter Options</h2>
            <div className="mb-4">
              <h3 className="font-semibold text-green-700 border-b border-dashed border-green-400 pb-1 mb-2">
                Price Range
              </h3>
              <p className="text-sm text-green-600 mb-2">
                ₹{priceRange[0]} - ₹{priceRange[1]}
              </p>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, +e.target.value])}
                className="w-full accent-green-600"
              />
            </div>

            <div className="mb-4">
              <h3 className="font-semibold border-b border-dashed border-green-400 pb-1 mb-2 text-green-700">
                Category
              </h3>
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-2 mb-2 text-sm">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => onFilterChange(setSelectedCategory)(cat)}
                    className="accent-green-600"
                  />
                  {cat}
                </label>
              ))}
            </div>

            <div className="mb-4">
              <h3 className="font-semibold border-b border-dashed border-green-400 pb-1 mb-2 text-green-700">
                Weight / Quantity
              </h3>
              {weights.map((w) => (
                <label key={w} className="flex items-center gap-2 mb-2 text-sm">
                  <input
                    type="radio"
                    name="weight"
                    checked={selectedWeight === w}
                    onChange={() => onFilterChange(setSelectedWeight)(w)}
                    className="accent-green-600"
                  />
                  {w}
                </label>
              ))}
            </div>

            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedWeight("All");
                setPriceRange([0, maxPrice]);
                setSelectedRating(0);
                setSelectedTag("All");
                setCurrentPage(1);
              }}
              className="mt-4 py-2 px-4 bg-gray-200 rounded hover:bg-green-700 hover:text-white text-sm"
            >
              Clear Filters
            </button>
          </aside>
        )}

        <main className="md:col-span-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">No products found.</p>
            ) : (
              paginatedProducts.map((product) => {
                const activeWeight = selectedWeight !== "All" ? selectedWeight : product.weights?.[0];
                const basePrice = product.prices?.[activeWeight] || 0;
                const offerPrice = Math.floor(basePrice * 0.63);
                const avgRating = product.rating || 4.5;
                const isOutOfStock = product.stock <= 0;

                return (
                  <div key={product.id} className="group bg-white rounded-2xl p-4 shadow hover:ring-2 hover:ring-green1 transition relative">
                    <div className="relative h-60 flex items-center justify-center border-2 border-dashed border-primary rounded-md overflow-hidden">
                      <Link to={`/shop/${product.id}`}>
                        <img
                          src={product.images?.[0] || ""}
                          alt={product.name}
                          className="w-full h-full p-3 object-contain transition-transform duration-700"
                        />
                      </Link>
                      <span className="absolute top-2 left-0 bg-primary text-white text-xs px-3 py-1 rounded-r-full shadow">
                        Bestseller
                      </span>
                      <button
                        onClick={() => {
                          addToFav({ ...product, qty: 1, selectedWeight: activeWeight, price: offerPrice, img: product.images?.[0] || "" });
                          toast.success("Added to Favorites");
                        }}
                        className="absolute top-2 right-2 border p-2 rounded-full hover:bg-primary hover:text-white"
                      >
                        <FiHeart />
                      </button>
                    </div>

                    <Link to={`/shop/${product.id}`} className="font-semibold text-base sm:text-lg text-center block mt-2">
                      {product.name} ({activeWeight})
                    </Link>

                    <p className="text-center text-gray-600 text-sm mb-1">
                      MRP: <span className="line-through text-gray-400">₹{basePrice}</span> ₹{offerPrice}
                    </p>

                    {isOutOfStock && (
                      <p className="text-center text-red-600 font-semibold text-sm mb-2">
                        Out of Stock
                      </p>
                    )}

                    <div className="w-[90%] h-[1px] border-b border-dashed border-green1 mx-auto mb-3" />

                    <div className="flex justify-between items-center mt-auto px-1">
                      <button
                        onClick={() => {
                          if (isOutOfStock) return toast.error("Product is out of stock");
                          addToCart({ ...product, qty: 1, selectedWeight: activeWeight, price: offerPrice, img: product.images?.[0] || "" });
                          toast.success("Added to Cart");
                        }}
                        disabled={isOutOfStock}
                        className={`w-1/2 py-2 rounded-md text-xl flex justify-center items-center transition ${
                          isOutOfStock ? "bg-gray-400 text-white cursor-not-allowed" : "bg-green1 text-white hover:bg-green2"
                        }`}
                      >
                        <IoCartOutline />
                      </button>
                      <div className="bg-green1 text-white px-3 py-1 rounded-md flex items-center gap-1 text-sm">
                        <FaStar className="text-yellow-400" />
                        {avgRating}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-10">
              <PageNavigation currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </main>
      </div>

      <OfferBanner />
      {allProducts.length > 0 && <FestiveGiftPack />}
      <Services />
    </section>
  );
};

export default Category;