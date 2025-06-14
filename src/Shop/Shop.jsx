import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { IoCartOutline, IoClose } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import PageHeader from "../Component/PageHeader";
import PageNavigation from "../Component/PageNavigation";
import { Link } from "react-router-dom";
import { useStore } from "../Context/StoreContext";
import NewArrived from "../Home/NewArrived";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const categories = [
  "All",
  "Nuts",
  "Dry Fruits",
  "Dates",
  "Raisins",
  "Dried Fruits",
  "Ayurvedic",
  "Seeds",
];
const weights = ["All", "100g", "250g", "500g", "1000g"];
const ratings = [4, 3];
const tags = [
  "All",
  "New Arrivals",
  "Best Sellers",
  "Festive Picks",
  "Premium Quality",
  "Organic",
];
const productsPerPage = 9;

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWeight, setSelectedWeight] = useState("All");
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedTag, setSelectedTag] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [currentPage, setCurrentPage] = useState(1);

  const { addToFavorites, addToCart, favorites } = useStore();

  useEffect(() => {
    fetch("/DryFruitsProductData.json")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        const prices = data.flatMap((p) =>
          p?.prices && typeof p.prices === "object"
            ? Object.values(p.prices).filter((v) => typeof v === "number")
            : []
        );
        const max = prices.length ? Math.max(...prices) : 0;
        setPriceRange([0, max]);
      })
      .catch((err) =>
        console.error("Error loading DryFruitsProductData.json:", err)
      );
  }, []);

  const safePrices = products.flatMap((p) =>
    p?.prices && typeof p.prices === "object"
      ? Object.values(p.prices).filter((v) => typeof v === "number")
      : []
  );
  const maxPrice = safePrices.length ? Math.max(...safePrices) : 0;
  const [priceRange, setPriceRange] = useState([0, maxPrice]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) setShowFilters(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredProducts = products.filter((p) => {
    if (!p.prices || typeof p.prices !== "object") return false;
    const matchCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    const weightToUse =
      selectedWeight !== "All" ? selectedWeight : p.weights[0];
    const price = p.prices[weightToUse];
    if (typeof price !== "number") return false;
    const matchWeight =
      selectedWeight === "All" || p.weights.includes(selectedWeight);
    const matchRating = selectedRating === 0 || p.rating >= selectedRating;
    const matchTag =
      selectedTag === "All" ||
      (Array.isArray(p.tags) && p.tags.includes(selectedTag));
    const matchPrice = price >= priceRange[0] && price <= priceRange[1];
    return (
      matchCategory && matchWeight && matchRating && matchTag && matchPrice
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const onFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <section className="bg-green4">
      <PageHeader title="Shop" curpage="Shop" />

      <div className="text-center mt-6">
        <h2 className="text-2xl font-bold mb-4">
          Top Selling <span className="text-green-600">Products</span>
        </h2>
        <div className="w-[180px] h-[2px] border-b-2 border-dashed border-green1 mx-auto mb-4"></div>
      </div>

      <div className="bg-green4 px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {windowWidth < 768 && (
          <div className="flex justify-start">
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="text-xl p-2 border rounded-full hover:bg-green1 hover:text-white transition"
            >
              {showFilters ? <IoClose /> : <CiFilter />}
            </button>
          </div>
        )}

        {(showFilters || windowWidth >= 768) && (
          <aside className="bg-[#fffde7] h-fit rounded-xl p-4 shadow border border-green-200 md:sticky top-4">
            <h2 className="font-bold text-lg mb-4 text-green-700">
              Filter Options
            </h2>

            {/* Price Range */}
            <div className="mb-4">
              <h3 className="font-semibold border-b border-dashed border-green-400 pb-1 mb-2 text-green-700">
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
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full accent-green-600"
              />
            </div>

            {/* Dynamic Filters */}
            {[
              ["Category", categories, selectedCategory, setSelectedCategory],
              ["Weight", weights, selectedWeight, setSelectedWeight],
              [
                "Ratings",
                [
                  { label: "4★ & up", value: 4 },
                  { label: "3★ & up", value: 3 },
                  { label: "All Ratings", value: 0 },
                ],
                selectedRating,
                setSelectedRating,
              ],
              ["Tags", tags, selectedTag, setSelectedTag],
            ].map(([title, list, selected, setter], i) => (
              <div className="mb-4" key={i}>
                <h3 className="font-semibold border-b border-dashed border-green-400 pb-1 mb-2 text-green-700">
                  {title}
                </h3>
                {list.map((item) => {
                  const val = typeof item === "object" ? item.value : item;
                  const label = typeof item === "object" ? item.label : item;
                  return (
                    <label key={val} className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name={title}
                        value={val}
                        checked={selected === val}
                        onChange={() => onFilterChange(setter)(val)}
                        className="accent-green-600"
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            ))}

            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedWeight("All");
                setSelectedRating(0);
                setSelectedTag("All");
                setPriceRange([0, maxPrice]);
                setCurrentPage(1);
              }}
              className="mt-4 py-2 px-4 bg-gray-200 rounded hover:bg-green-700 hover:text-white text-sm"
            >
              Clear Filters
            </button>
          </aside>
        )}

        {/* Products Grid */}
        <main className="md:col-span-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">
                No products found.
              </p>
            ) : (
              paginatedProducts.map((product) => {
                const activeWeight =
                  selectedWeight !== "All"
                    ? selectedWeight
                    : product.weights[0];
                const price = product.prices[activeWeight];
                const offerPrice = Math.floor(price * 0.63);
                const mrp = Math.round(price);
                const avgRating = product.rating || 4.5;

                return (
                  <div
                    key={`${product.id}-${activeWeight}`}
                    className="group bg-white rounded-2xl p-4 shadow hover:ring-2 hover:ring-green1 transition relative"
                  >
                    {/* Product Image */}
                    <div className="relative h-60 flex items-center justify-center border-2 border-dashed border-primary rounded-md overflow-hidden">
                      <Link to={`/shop/${product.id}`}>
                        <img
                          src={
                            product.images && product.images.length > 0
                              ? product.images[0]
                              : ""
                          }
                          alt={product.name}
                          className="w-full h-full p-3 object-contain transition-transform duration-700 transform hover:rotate-y-180"
                        />
                      </Link>
                      <span className="absolute top-2 left-0 bg-primary text-white text-xs px-3 py-1 rounded-r-full shadow">
                        Bestseller
                      </span>
                      <button
                        onClick={() => {
                          addToFavorites({
                            ...product,
                            qty: 1,
                            selectedWeight: activeWeight,
                            price: offerPrice,
                            img: product.images[0],
                          });
                          toast.success("Product Added To Favorite");
                        }}
                        className={`absolute top-2 right-2 border p-2 rounded-full ${
                          favorites.some((f) => f.id === product.id)
                            ? "text-primary border-primary"
                            : "text-primary border-primary"
                        } group-hover:text-white group-hover:bg-primary`}
                      >
                        <FiHeart />
                      </button>
                    </div>

                    <Link
                      to={`/shop/${product.id}`}
                      className="font-semibold text-base sm:text-lg text-center block mb-2"
                    >
                      {product.name} ({activeWeight})
                    </Link>
                    <p className="text-center text-gray-600 text-sm mb-2">
                      MRP:{" "}
                      <span className="line-through text-gray-400">₹{mrp}</span>{" "}
                      ₹{offerPrice}
                    </p>
                    <div className="w-[90%] h-[1px] border-b border-dashed border-green1 mx-auto mb-3" />
                    <div className="flex justify-between items-center mt-auto px-1">
                      <button
                        onClick={() => {
                          addToCart({
                            ...product,
                            qty: 1,
                            selectedWeight: activeWeight,
                            price: offerPrice,
                            img: product.images[0],
                          });
                          toast.success("Product Added Successfully");
                        }}
                        className="bg-green1 text-white w-1/2 py-2 rounded-md text-xl flex justify-center items-center hover:bg-green2 transition"
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
              <PageNavigation
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </main>
      </div>

      <NewArrived />
    </section>
  );
};

export default Shop;
