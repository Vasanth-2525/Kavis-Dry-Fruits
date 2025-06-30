// Offers.jsx
import offerLeft from "/images/bg/offer-bg-left.png";
import offerRight from "/images/bg/offer-bg-right.png";
import PageHeader from "../Component/PageHeader";
import { useState, useEffect, useMemo } from "react";
import { IoCartOutline, IoClose } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import PageNavigation from "../Component/PageNavigation";
import { useStore } from "../Context/StoreContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

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
  const { allProducts, addToCart } = useStore();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWeight, setSelectedWeight] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) setShowFilters(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const offerProducts = useMemo(
    () => allProducts.filter((p) => p.offer && p.offer > 0),
    [allProducts]
  );

  const maxPrice = useMemo(() => {
    const prices = offerProducts.flatMap((p) =>
      Object.values(p.prices || {}).map(Number)
    );
    return prices.length ? Math.max(...prices) : 1000;
  }, [offerProducts]);

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const filteredProducts = offerProducts.filter((p) => {
    const weightMatch =
      selectedWeight === "All" ||
      (p.weights && p.weights.includes(selectedWeight));

    const categoryMatch =
      selectedCategory === "All" || p.category === selectedCategory;

    const priceKey = selectedWeight !== "All" ? selectedWeight : p.weights?.[0];
    const basePrice = p.prices?.[priceKey] || 0;
    const discount = p.offer;
    const discounted = Math.round(basePrice * ((100 - discount) / 100));

    const priceMatch =
      discounted >= priceRange[0] && discounted <= priceRange[1];

    return weightMatch && categoryMatch && priceMatch;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts
    .sort((a, b) => b.offer - a.offer)
    .slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  const onFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <section className="bg-green4 overflow-hidden">
      <PageHeader title="Offers" curpage="Offers" />

      <div className="flex justify-between bg-green3 relative">
        <img src={offerLeft} className="h-[150px] lg:h-[400px]" />
        <div className="top-5 text-center z-10 max-w-xl absolute lg:top-[35%] right-[3%] sm:right-[30%]">
          <h2 className="text-sm sm:text-2xl md:text-5xl font-bold text-green-700 mb-2">
            Limited Time Offers
          </h2>
          <p className="text-sm md:text-xl text-[#9d6e44] font-semibold mb-2">
            Ends in 2 days!
          </p>
          <button className="text-sm px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
            Shop Now
          </button>
        </div>
        <img
          src={offerRight}
          className="rotate-y-180 hidden sm:block lg:h-[400px] pt-5"
        />
      </div>

      <div className="text-center mt-6">
        <h2 className="text-2xl font-bold mb-4">
          Today <span className="text-green-600">Offer</span>
        </h2>
        <div className="w-[180px] h-[2px] border-b-2 border-dashed border-green1 mx-auto mb-4" />
      </div>

      <div className="bg-green4 px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <aside className="bg-[#fffde7] h-fit rounded-xl p-4 shadow border border-green-200 md:sticky top-4">
            <h2 className="font-bold text-lg mb-4 text-green-700">
              Filter Options
            </h2>
            <div className="mb-4">
              <h3 className="font-semibold text-green-700">Price Range</h3>
              <p className="text-green-600 text-sm mb-2">
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
              <h3 className="font-semibold text-green-700">Category</h3>
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-2 mb-2">
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
              <h3 className="font-semibold text-green-700">Weight</h3>
              {weights.map((w) => (
                <label key={w} className="flex items-center gap-2 mb-2">
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
              <p className="col-span-full text-center text-gray-500">
                No products found.
              </p>
            ) : (
              paginatedProducts.map((product) => {
                const activeWeight =
                  selectedWeight !== "All"
                    ? selectedWeight
                    : product.weights?.[0];
                const basePrice = product.prices?.[activeWeight] || 0;
                const discountedPrice = Math.round(
                  basePrice * ((100 - product.offer) / 100)
                );
                const outOfStock = product.stock <= 0;

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
                        src={product.images?.[0]}
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
                    {outOfStock?(
                      <>
                        <p className="text-center text-gray-600 text-sm mb-2">
                      MRP:{" "}
                      <span className="line-through text-gray-400">
                        ₹{basePrice}
                      </span>{" "}
                      ₹{discountedPrice}
                    </p>
                    <p className="text-center font-semibold text-red-500" >Out of Stock </p>
                    </>
                    ):(
                    <p className="text-center text-gray-600 text-sm mb-2">
                      MRP:{" "}
                      <span className="line-through text-gray-400">
                        ₹{basePrice}
                      </span>{" "}
                      ₹{discountedPrice}
                    </p>)
                    }
                    <div className="w-[90%] h-[1px] border-b border-dashed border-green1 mx-auto mb-3" />
                    <div className="flex justify-center gap-3 items-center px-1">
                      <button
                        onClick={() =>
                          navigate("/checkout", {
                            state: {
                              checkoutProduct: {
                                ...product,
                                quantity: 1,
                                selectedWeight: activeWeight,
                                price: discountedPrice,
                                img: product.images?.[0],
                              },
                            },
                          })
                        }
                        disabled={outOfStock}
                        className={`py-2 px-4 w-full text-sm rounded-md font-semibold ${
                          outOfStock
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-primary text-white hover:bg-green1"
                        }`}
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
