import comboLeft from "/images/bg/combo-bg-left.png";
import comboRight from "/images/bg/combo-bg-right.png";
import PageHeader from "../Component/PageHeader";
import { useState, useEffect } from "react";
import { FiHeart } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import PageNavigation from "../Component/PageNavigation";
import { Link } from "react-router-dom";
import { useStore } from "../Context/StoreContext";

const weights = ["All", 500, 1000];
const productsPerPage = 9;

const Combos = () => {
  const { addToFavorites } = useStore();
  const [selectedWeight, setSelectedWeight] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedRating, setSelectedRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/DryFruitsProductData.json")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error loading ProductData.json", err));
  }, []);

  const comboProducts = products.filter((p) => p.category === "Combo");

  const types = [
    "All",
    ...new Set(comboProducts.map((p) => p.type).filter(Boolean)),
  ];

  const getLowestPrice = (product) => {
    const priceValues = Object.values(product.prices || {});
    return priceValues.length ? Math.min(...priceValues) : Infinity;
  };

  useEffect(() => {
    const max = Math.max(...comboProducts.map(getLowestPrice), 0);
    setMaxPrice(max);
    setPriceRange([0, max]);
  }, [products]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) setShowFilters(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredProducts = comboProducts.filter((p) => {
    const parsedWeights =
      p.weights?.[0]?.split(",").map((w) => parseInt(w.trim())) || [];

    const matchWeight =
      selectedWeight === "All" ||
      parsedWeights.includes(Number(selectedWeight));
    const matchType = selectedType === "All" || p.type === selectedType;

    const lowestPrice = getLowestPrice(p);
    const matchPrice =
      lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];

    const matchRating =
      !p.rating || selectedRating === 0 || p.rating >= selectedRating;

    return matchWeight && matchType && matchPrice && matchRating;
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
      <PageHeader title="Combo Packs" curpage="Combos" />

      {/* Hero Section */}
      <div className="relative bg-green3 h-[60vh] py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden rounded-2xl">
        {/* Left Side Image */}
        <img
          src={comboLeft}
          alt="Combo Left"
          className="w-32 sm:w-44 md:w-52 lg:w-100 h-auto object-contain absolute top-0 left-0 rotate-y-180 z-0"
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-md sm:max-w-lg md:max-w-xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-700 mb-4">
            Combo Packs for Gifting <br className="hidden sm:block" /> & Health
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#9c6b4d] mb-6">
            Curated packs for gifting, festivals, and family wellness.
          </p>
          <Link to="/shop">
            <button className="bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow hover:bg-green-700 transition duration-300">
              Shop Now
            </button>
          </Link>
        </div>

        {/* Right Side Image */}
        <img
          src={comboRight}
          alt="Combo Right"
          className="w-36 sm:w-52 md:w-64 lg:w-100 h-auto object-contain absolute bottom-0 right-0  z-0"
        />
      </div>

      {/* Offers */}
      <div className="text-center mt-6">
        <h2 className="text-2xl font-bold mb-4">
          Today's <span className="text-green-600">Offers</span>
        </h2>
        <div className="w-[180px] h-[2px] border-b-2 border-dashed border-green1 mx-auto mb-4"></div>
      </div>

      {/* Filters & Products */}
      <div className="bg-green4 px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6 sticky top-0">
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
  
        {(showFilters || windowWidth >= 768) && (
          <aside className="bg-[#fffde7] h-fit rounded-xl p-4 shadow border border-green-200 sticky top-4">
            <h2 className="font-bold text-lg mb-4 text-green-700">
              Filter Options
            </h2>

            {/* Price Filter */}
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
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full accent-green-600"
              />
            </div>

            {/* Type Filter */}
            <div className="mb-4">
              <h3 className="font-semibold text-green-700 border-b border-dashed border-green-400 pb-1 mb-2">
                Combo Type
              </h3>
              {types.map((t) => (
                <label key={t} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={selectedType === t}
                    onChange={() => onFilterChange(setSelectedType)(t)}
                    className="accent-green-600"
                  />
                  {t}
                </label>
              ))}
            </div>

            {/* Rating Filter */}
            <div className="mb-4">
              <h3 className="font-semibold text-green-700 border-b border-dashed border-green-400 pb-1 mb-2">
                Minimum Rating
              </h3>
              {[0, 1, 2, 3, 4, 5].map((r) => (
                <label key={r} className="flex items-center gap-2 mb-1 text-sm">
                  <input
                    type="radio"
                    name="rating"
                    value={r}
                    checked={selectedRating === r}
                    onChange={() => onFilterChange(setSelectedRating)(r)}
                    className="accent-green-600"
                  />
                  {r === 0 ? "All" : `${r} stars & up`}
                </label>
              ))}
            </div>

            {/* Clear Button */}
            <button
              onClick={() => {
                setSelectedType("All");
                setSelectedWeight("All");
                setPriceRange([0, maxPrice]);
                setSelectedRating(0);
                setCurrentPage(1);
              }}
              className="mt-4 py-2 px-4 bg-gray-200 rounded hover:bg-green-700 hover:text-white text-sm"
            >
              Clear Filters
            </button>
          </aside>
        )}

        {/* Product List */}
        <main className="md:col-span-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">
                No combos found.
              </p>
            ) : (
              paginatedProducts.map((product) => {
                const parsedWeights =
                  product.weights?.[0]
                    ?.split(",")
                    .map((w) => parseInt(w.trim())) || [];
                const activeWeight =
                  selectedWeight !== "All"
                    ? selectedWeight
                    : parsedWeights[0] || 500;
                const priceKey = `${activeWeight}g`;
                const mrp = product.prices?.[priceKey] || 0;
                const offerPrice = Math.floor(mrp - mrp / 10);
                const combos = product.combos || [];

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center hover:shadow-lg transition"
                  >
                    <div className="group relative w-full">
                      <div className="absolute top-3 right-3">
                        <div
                          onClick={() =>{
                            addToFavorites({
                              ...product,
                              qty: 1,
                              selectedWeight: activeWeight,
                              price: offerPrice,
                              img: product.images?.[0],
                            });
                            toast.success("Product Added To Favorite")
                          }}
                          className="text-green-600 border border-green-600 p-2 rounded-full hover:bg-green-600 hover:text-white cursor-pointer transition"
                        >
                          <FiHeart />
                        </div>
                      </div>
                      <div className="border-2 border-dotted border-green1 rounded-2xl">
                        <img
                          src={product.images?.[0]}
                          alt={product.name}
                          className="w-full h-56 object-contain p-4 mb-4"
                        />
                      </div>
                    </div>

                    <div className="mt-4 w-full text-center">
                      <h3 className="text-lg font-bold mb-1">{product.name}</h3>

                      {/* Ratings */}
                      <div className="flex justify-center gap-1 text-yellow-500 text-sm mt-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < (product.rating || 0) ? "★" : "☆"}
                          </span>
                        ))}
                      </div>

                      <p className="text-sm text-gray-600 font-sembold mt-1">
                        {combos.map((item, i) => (
                          <span key={i}>
                            {item}
                            {i < combos.length - 1 && (
                              <span className="mx-1">|</span>
                            )}
                          </span>
                        ))}
                      </p>

                      <div className="flex items-center justify-center gap-4 mt-2 text-sm font-medium">
                        <span className="line-through text-gray-400">
                          ₹{mrp}
                        </span>
                        <span className="text-black">| ₹{offerPrice}</span>
                      </div>

                      <Link
                        to={`/combos/${product.id}`}
                        className="mt-4 inline-block w-full text-center bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        View Combo
                      </Link>
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

export default Combos;
