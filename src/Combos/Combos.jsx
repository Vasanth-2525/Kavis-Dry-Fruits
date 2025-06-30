import comboLeft from "/images/bg/combo-bg-left.png";
import comboRight from "/images/bg/combo-bg-right.png";
import PageHeader from "../Component/PageHeader";
import { useState, useEffect, useMemo } from "react";
import { FiHeart } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import PageNavigation from "../Component/PageNavigation";
import { Link } from "react-router-dom";
import { useStore } from "../Context/StoreContext";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "react-hot-toast";

const weights = ["All", 500, 1000];
const productsPerPage = 6;

const Combos = () => {
  const { addToFav } = useStore();
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
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const comboProducts = useMemo(() => {
    return products.filter((p) => p.category === "Combo");
  }, [products]);

  const types = useMemo(() => [
    "All",
    ...new Set(comboProducts.map((p) => p.type).filter(Boolean)),
  ], [comboProducts]);

  const getLowestPrice = (product) => {
    const priceValues = Object.values(product.prices || {});
    return priceValues.length ? Math.min(...priceValues) : Infinity;
  };

  useEffect(() => {
    const max = Math.max(...comboProducts.map(getLowestPrice), 0);
    if (max !== maxPrice) {
      setMaxPrice(max);
      setPriceRange([0, max]);
    }
  }, [comboProducts]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) setShowFilters(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredProducts = comboProducts.filter((p) => {
    const parsedWeights = p.weights?.[0]?.split(",").map((w) => parseInt(w.trim())) || [];
    const matchWeight = selectedWeight === "All" || parsedWeights.includes(Number(selectedWeight));
    const matchType = selectedType === "All" || p.type === selectedType;
    const lowestPrice = getLowestPrice(p);
    const matchPrice = lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];
    const matchRating = !p.rating || selectedRating === 0 || p.rating >= selectedRating;
    return matchWeight && matchType && matchPrice && matchRating;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const onFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <section className="bg-green4">
      <PageHeader title="Combo Packs" curpage="Combos" />

      <div className="relative bg-green3 h-[60vh] flex items-center justify-center overflow-hidden rounded-2xl px-4 sm:px-6 lg:px-8">
        <img src={comboLeft} alt="Combo Left" className="absolute top-0 left-0 w-32 sm:w-44 md:w-52 lg:w-100 object-contain rotate-y-180" />
        <div className="relative z-10 text-center max-w-xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-700 mb-4">Combo Packs for Gifting &amp; Health</h2>
          <p className="text-sm sm:text-base md:text-lg text-[#9c6b4d] mb-6">Curated packs for gifting, festivals, and family wellness.</p>
          <Link to="/shop">
            <button className="bg-green-600 text-white py-2 px-4 sm:px-6 sm:py-3 rounded-lg shadow hover:bg-green-700 transition">Shop Now</button>
          </Link>
        </div>
        <img src={comboRight} alt="Combo Right" className="absolute bottom-0 right-0 w-36 sm:w-52 md:w-64 lg:w-100 object-contain" />
      </div>

      <div className="text-center mt-6">
        <h2 className="text-2xl font-bold mb-4">Today's <span className="text-green-600">Offers</span></h2>
        <div className="mx-auto mb-4 w-[180px] border-b-2 border-dashed border-green1 h-[2px]" />
      </div>

      <div className="bg-green4 px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {windowWidth < 768 && (
          <button onClick={() => setShowFilters(!showFilters)} className="text-xl p-2 border rounded-full hover:bg-green1 hover:text-white transition">
            {showFilters ? <IoClose /> : <CiFilter />}
          </button>
        )}

        {(showFilters || windowWidth >= 768) && (
          <aside className="bg-[#fffde7] p-4 rounded-xl shadow border border-green-200 sticky top-4">
            <h2 className="text-lg font-bold mb-4 text-green-700">Filter Options</h2>
            <div className="mb-4">
              <h3 className="font-semibold text-green-700 border-b border-dashed border-green-400 pb-1 mb-2">Price Range</h3>
              <p className="text-green-600 text-sm mb-2">₹{priceRange[0]} - ₹{priceRange[1]}</p>
              <input type="range" min="0" max={maxPrice} value={priceRange[1]} onChange={(e) => setPriceRange([0, +e.target.value])} className="w-full accent-green-600" />
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-green-700 border-b border-dashed border-green-400 pb-1 mb-2">Combo Type</h3>
              {types.map((t) => (
                <label key={t} className="flex items-center gap-2 mb-2">
                  <input type="radio" name="type" value={t} onChange={() => onFilterChange(setSelectedType)(t)} checked={selectedType === t} className="accent-green-600" />
                  {t}
                </label>
              ))}
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-green-700 border-b border-dashed border-green-400 pb-1 mb-2">Minimum Rating</h3>
              {[0, 1, 2, 3, 4, 5].map((r) => (
                <label key={r} className="flex items-center gap-2 mb-1 text-sm">
                  <input type="radio" name="rating" value={r} onChange={() => onFilterChange(setSelectedRating)(r)} checked={selectedRating === r} className="accent-green-600" />
                  {r === 0 ? "All" : `${r} stars & up`}
                </label>
              ))}
            </div>

            <button onClick={() => {setSelectedType("All");setSelectedWeight("All");setPriceRange([0, maxPrice]);setSelectedRating(0);setCurrentPage(1);}} className="mt-4 px-4 py-2 bg-gray-200 hover:bg-green-700 hover:text-white rounded transition text-sm">Clear Filters</button>
          </aside>
        )}

        <main className="md:col-span-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">No combos found.</p>
            ) : (
              paginatedProducts.map((p) => {
                const parsedWeights = p.weights?.[0]?.split(",").map(Number) || [];
                const weight = selectedWeight !== "All" ? +selectedWeight : parsedWeights[0] || 500;
                const priceKey = `${weight}g`;
                const mrp = p.prices?.[priceKey] || 0;
                const offerPrice = Math.floor(mrp - mrp / 10);
                const isOutOfStock = p.stock <= 0;

                return (
                  <div key={p.id} className="bg-white p-4 rounded-2xl shadow-md flex flex-col items-center hover:shadow-lg transition">
                    <div className="relative w-full">
                      <div
                        className="absolute top-3 right-3 text-green-600 p-2 border border-green-600 rounded-full hover:bg-green-600 hover:text-white transition cursor-pointer"
                        onClick={() => {
                          addToFav({ ...p, qty: 1, selectedWeight: weight, price: offerPrice, img: p.images?.[0] });
                          toast.success("Added to favorites!");
                        }}
                      >
                        <FiHeart />
                      </div>
                      <Link to={`/combos/${p.id}`}>
                      <img src={p.images?.[0]} alt={p.name} className="w-full h-56 object-contain p-4 mb-4" />
                      </Link>
                    </div>

                    <div className="w-full text-center">
                      <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                      <div className="text-yellow-500 text-sm">{[...Array(5)].map((_, i) => (i < (p.rating || 0) ? "★" : "☆"))}</div>
                      <p className="text-sm text-gray-600 mt-1">{p.combos?.join(" | ")}</p>
                      <div className="mt-2 text-sm font-medium flex justify-center gap-2">
                        <span className="line-through text-gray-400">₹{mrp}</span>
                        <span>₹{offerPrice}</span>
                      </div>
                      {isOutOfStock ? (
                        <p className="text-red-500 text-sm font-semibold mt-2">Out of Stock</p>
                      ) : (
                        <Link to={`/combos/${p.id}`} className="mt-4 inline-block w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition">
                          View Combo
                        </Link>
                      )}
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
    </section>
  );
};

export default Combos;
