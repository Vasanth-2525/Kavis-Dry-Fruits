import { useState, useEffect } from "react";
import { FaStar, FaRegHeart } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

const PopularProduct = () => {
  const [productData, setProductData] = useState([]);
      useEffect(() => {
        fetch("/DryFruitsProductData.json")
          .then((res) => res.json())
          .then((data) => {
            setProductData(data);
          })
          .catch((err) => {
            console.error("Error loading ProductData.json", err);
          });
      }, []);
  return (
    <div className="bg-green4 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="text-center md:text-left w-full md:w-auto">
            <h2 className="text-2xl font-bold">
              Top Selling <span className="text-green-600">Products</span>
            </h2>
            <div className="h-[2px] w-40 border-b-2 border-dashed border-green1 mx-auto md:mx-0 mt-2" />
          </div>
          <div>
            <Link to="/shop">
              <button className="bg-primary text-white font-semibold px-6 py-2 rounded-md hover:bg-green1 transition">
                View More
              </button>
            </Link>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {productData.slice(0, 8).map((product) => {
            const activeWeight = product.weights[0];
            const price = product.prices[activeWeight];
            const mrp = Math.floor(price / 0.84);
            const avgRating = product.rating || 4.5;

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl p-4 shadow-md hover:ring-2 hover:ring-green1 transition-all duration-300 relative"
              >
                {/* Badge & Wishlist */}
                <div className="absolute top-4 left-4 bg-green1 text-white text-xs px-3 py-1 rounded-r-full">
                  Bestseller
                </div>
                <div className="absolute top-4 right-4 text-green1 border border-green1 p-2 rounded-full text-xl hover:bg-green1 hover:text-white transition cursor-pointer">
                  <FaRegHeart />
                </div>

                {/* Image */}
                <div className="border-2 border-dotted border-green1 rounded-2xl mb-4">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-56 object-contain p-4 group-hover:rotate-y-180 transition-all duration-300"
                  />
                </div>

                {/* Name */}
                <Link
                  to={`/shop/${product.id}`}
                  className="block font-semibold text-center text-base sm:text-lg mb-2"
                >
                  {product.name} ({activeWeight})
                </Link>

                {/* Price */}
                <p className="text-center text-gray-600 text-sm mb-3">
                  MRP:{" "}
                  <span className="line-through text-gray-400">₹{mrp}</span>{" "}
                  ₹{price}
                </p>

                {/* Divider */}
                <div className="w-[90%] h-[1px] border-b border-dashed border-green1 mx-auto mb-3" />

                {/* Action Row */}
                <div className="flex justify-between items-center px-1">
                  <button className="bg-green1 text-white w-1/2 py-2 rounded-md text-xl flex justify-center items-center hover:bg-green2 transition">
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
    </div>
  );
};

export default PopularProduct;
