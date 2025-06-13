import offerLeft from "/images/bg/offer-bg-left.png";
import offerRight from "/images/bg/offer-bg-right.png";
import PageHeader from "../Component/PageHeader";
import { useState, useEffect, useMemo } from "react";
import { IoCartOutline, IoClose } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import PageNavigation from "../Component/PageNavigation";
import { Link } from "react-router-dom";
import { useStore } from "../Context/StoreContext";
import { useNavigate } from "react-router-dom";

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
const productsPerPage = 9;

const Offers = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWeight, setSelectedWeight] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/DryFruitsProductData.json")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error("Error loading ProductData.json", err);
      });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) setShowFilters(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const offerProducts = useMemo(() => {
    return products.filter((p) => p.offer && p.offer > 0);
  }, [products]);

  const maxPrice = useMemo(() => {
    const allPrices = offerProducts.flatMap((p) =>
      p.prices ? Object.values(p.prices) : []
    );
    return allPrices.length > 0 ? Math.max(...allPrices) : 1000;
  }, [offerProducts]);

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const filteredProducts = offerProducts.filter((p) => {
    const matchCategory =
      selectedCategory === "All" || p.category === selectedCategory;

    const matchWeight =
      selectedWeight === "All" ||
      (p.weights && p.weights.includes(selectedWeight));

    const basePrice =
      selectedWeight !== "All" && p.prices?.[selectedWeight]
        ? p.prices[selectedWeight]
        : Math.min(...Object.values(p.prices || { 100: 1000 }));

    const discountedPrice = Math.round(basePrice * ((100 - p.offer) / 100));

    const matchPrice =
      discountedPrice >= priceRange[0] && discountedPrice <= priceRange[1];

    return matchCategory && matchWeight && matchPrice;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const SortProduct = filteredProducts.sort((a, b) => b.offer - a.offer);

  const paginatedProducts = SortProduct.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const onFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <section className="bg-green4">
      <PageHeader title="Offers" curpage="Offers" />

      {/* Offer Banner */}
      <div className="flex justify-between bg-green3 relative">
        <div>
          <img
            src={offerLeft}
            className="h-[150px] lg:h-[400px] w-auto  md:h-[350px] sm:h-[280px]"
          />
        </div>

        <div className="top-5 text-center z-10 max-w-xl absolute lg:top-[35%] lg:right-[32%] md:right-[25%] sm:top-[20%] sm:right-[34%] right-[3%] ">
          <h2 className="text-sm sm:text-2xl md:text-5xl font-bold text-green-700 md:mb-4 w-full">
            Limited Time Offers
          </h2>
          <p className="text-sm md:text-xl text-[#9d6e44] font-semibold sm:mb-6 ms:mt-5 mt-1 mb-1 ">
            Ends in 2 days!
          </p>
          <button className="text-sm px-2 py-1 bg-green-600 hover:bg-green-700 text-white md:text-lg font-semibold sm:py-2 sm:px-6 rounded-md transition-all ">
            Shop Now
          </button>
        </div>

        <div className="rotate-y-180">
          <img
            src={offerRight}
            className="hidden sm:block lg:h-[400px] w-full md:h-[350px] pt-5"
          />
        </div>
      </div>

      {/* Section Title */}
      <div className="text-center mt-6">
        <h2 className="text-2xl font-bold mb-4">
          Today <span className="text-green-600">Offer</span>
        </h2>
        <div className="w-[180px] h-[2px] border-b-2 border-dashed border-green1 mx-auto mb-4"></div>
      </div>

      <div className="bg-green4 px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Mobile Filter Toggle */}
        {windowWidth < 768 && (
          <div className="flex justify-start">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-xl p-2 border rounded-full hover:bg-green1 hover:text-white transition"
            >
              {showFilters ? <IoClose /> : <CiFilter />}
            </button>
          </div>
        )}

        {/* Sidebar Filters */}
        {(showFilters || windowWidth >= 768) && (
          <aside className="bg-[#fffde7] h-fit rounded-xl p-4 shadow border border-green-200 sticky top-4">
            <h2 className="font-bold text-lg mb-4 text-green-700">
              Filter Options
            </h2>

            {/* Price */}
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

            {/* Category */}
            <div className="mb-4">
              <h3 className="font-semibold border-b border-dashed border-green-400 pb-1 mb-2 text-green-700">
                Category
              </h3>
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={selectedCategory === cat}
                    onChange={() => onFilterChange(setSelectedCategory)(cat)}
                    className="accent-green-600"
                  />
                  {cat}
                </label>
              ))}
            </div>

            {/* Weight */}
            <div className="mb-4">
              <h3 className="font-semibold border-b border-dashed border-green-400 pb-1 mb-2 text-green-700">
                Weight
              </h3>
              {weights.map((w) => (
                <label key={w} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="weight"
                    value={w}
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
                setCurrentPage(1);
              }}
              className="mt-4 py-2 px-4 bg-gray-200 rounded hover:bg-green-700 hover:text-white text-sm"
            >
              Clear Filters
            </button>
          </aside>
        )}

        {/* Product Grid */}
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
                    : product.weights?.[0];

                const basePrice = product.prices?.[activeWeight] || 1000;
                const mrp = Math.round(basePrice);
                const offerPrice = Math.floor(basePrice * 0.63);
                const discount = product.offer;
                const discountedPrice = Math.round(
                  offerPrice * ((100 - discount) / 100)
                );

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl p-4 shadow hover:ring-2 hover:ring-green1 transition relative"
                  >
                    <div className="absolute top-7 left-4 bg-green1 text-white text-xs px-3 py-1 rounded-r-full">
                      Bestseller
                    </div>
                    <div className="relative border-2 border-dotted border-green1 rounded-2xl">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-56 object-contain p-4 mb-4 group-hover:scale-110 transition-transform duration-300"
                      />
                      <span className="absolute top-2 right-2 bg-red-700 text-white text-sm py-2 px-3 rounded-lg">
                        {product.offer}%<br />
                        OFF
                      </span>
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
                      <span className="line-through text-gray-400">
                        ₹{offerPrice}
                      </span>{" "}
                      ₹{discountedPrice}
                    </p>
                    <div className="w-[90%] h-[1px] border-b border-dashed border-green1 mx-auto mb-3" />
                    <div className="flex justify-center items-center px-1">
                      <button
                        onClick={() => {
                          const checkoutProduct = {
                            ...product,
                            qty: 1,
                            selectedWeight: activeWeight,
                            price: discountedPrice,
                            img: product.images[0],
                          };
                          navigate("/checkout", { state: { checkoutProduct } }); 
                        }}
                        className="bg-primary text-white w-1/2 py-2 rounded-md text-md flex justify-center items-center hover:bg-green1 transition"
                      >
                        Buy Now
                      </button>
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
    </section>
  );
};

export default Offers;
