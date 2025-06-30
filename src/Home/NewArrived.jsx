import { FaStar, FaRegHeart } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

import { useStore } from "../Context/StoreContext";

const NewArrived = () => {
  const { allProducts, addToFav, addToCart } = useStore();

  const totalProduct =allProducts.filter((item) => item.category !== "Combo").slice(0, 4); // Latest 4 products

  return (
    <div className="bg-white py-10 px-5">
      <div className="max-w-6xl mx-auto mb-15 relative h-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            New <span className="text-green-600">Arrivals</span>
          </h2>
          <div className="md:w-[17%] w-[80%] h-[2px] border-b-2 border-dashed border-green1 mx-auto"></div>
        </div>
        <div className="absolute md:-top-2 md:right-0 top-14 right-[27%]">
          <Link to="/shop">
            <button className="bg-primary text-white font-semibold px-6 py-2 rounded-md hover:bg-green1 transition">
              View More
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto items-center">
        {totalProduct.map((product) => {
          const activeWeight = product.weights?.[0] || "100g"; // default if missing
          const price = product.prices?.[activeWeight] || 0;
          const mrp = Math.floor(price / 0.84);
          const avgRating = product.rating || 4.5;
          const isOutOfStock = product.stock <= 0;

          return (
            <div
              key={product.id}
              className="group bg-white rounded-2xl p-4 shadow-md hover:ring-2 hover:ring-green1 transition-all duration-300 relative"
            >
              <div className="relative h-60 flex items-center justify-center border-2 border-dashed border-primary rounded-md overflow-hidden">
                <Link to={`/shop/${product.id}`}>
                  <img
                    src={product.images?.[0] || "/images/placeholder.png"}
                    alt={product.name}
                    className="w-full h-full p-3 object-contain transition-transform duration-700 transform hover:rotate-y-180"
                  />
                </Link>
                <span className="absolute top-2 left-0 bg-primary text-white text-xs px-3 py-1 rounded-r-full shadow">
                  Bestseller
                </span>
                <button
                  onClick={() => {
                    addToFav({
                      id: product.id,
                      name: product.name,
                      image: product.images?.[0],
                      price,
                      selectedWeight: activeWeight,
                      weights: product.weights,
                      prices: product.prices,
                    });
                    toast.success("Added to Wishlist");
                  }}
                  className="absolute top-2 right-2 border p-2 rounded-full group-hover:text-white group-hover:bg-primary transition"
                >
                  <FaRegHeart />
                </button>
              </div>

              <h3 className="font-semibold text-base sm:text-lg text-center mb-2">
                {product.name}
              </h3>

              {/* Stock status or price */}
              {isOutOfStock ? (
                 <>
                  <p className="text-center text-gray-600 text-sm mb-3">
                    MRP:{" "}
                    <span className="line-through text-gray-400">₹{mrp}</span>{" "}
                    ₹{price}
                  </p>
                  <p className="text-center text-red-500 text-sm mb-3 font-medium">
                    Out of Stock
                  </p>
                  </>
              ) : (
                <p className="text-center text-gray-600 text-sm mb-2">
                  MRP: <span className="line-through text-gray-400">₹{mrp}</span> ₹{price}
                </p>
              )}

              <div className="w-[90%] h-[1px] border-b border-dashed border-green1 mx-auto mb-3" />

              <div className="flex justify-between items-center mt-auto px-1">
                <button
                  disabled={isOutOfStock}
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price,
                      image: product.images?.[0],
                      qty: 1,
                      selectedWeight: activeWeight,
                      weights: product.weights,
                      prices: product.prices,
                      category: product.category
                    });
                  }}
                  className={`${
                    isOutOfStock
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green1 hover:bg-green2"
                  } text-white w-1/2 py-2 rounded-md text-xl flex justify-center items-center transition`}
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
        })}
      </div>
    </div>
  );
};

export default NewArrived;
