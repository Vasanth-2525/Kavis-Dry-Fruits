import { FaStar, FaRegHeart } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import rightBg from "/images/offer-side-bg2.png";
import { toast } from "react-hot-toast";

import { Link } from "react-router-dom";
import { useStore } from "../Context/StoreContext";

const FestiveGiftPack = () => {
  const { allProducts, addToFav, addToCart } = useStore();

  const filteredProduct = allProducts.filter(
    (item) => item.category !== "Combo"
  );

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="py-10 px-4 bg-[#f4faf6]">
      <div className="max-w-6xl mx-auto mb-10 relative">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Festive <span className="text-green1">Gifting Packs</span>
          </h2>
          <div className="md:w-[17%] w-[80%] h-[2px] border-b-2 border-dashed border-green1 mx-auto"></div>
          <img
            src={rightBg}
            alt="Decoration"
            className="hidden md:block absolute left-0 top-0 w-28"
          />
        </div>
        <div className="absolute md:top-0 md:right-0 top-14 right-[27%]">
          <Link to="/shop">
            <button className="bg-primary text-white  font-semibold px-6 py-2 rounded-md hover:bg-green1 transition">
              View More
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <Slider {...settings}>
          {filteredProduct.map((product) => {
            const activeWeight = product.weights?.[0] || "";
            const price = product.prices?.[activeWeight] || 0;
            const mrp = price ? Math.floor(price / 0.84) : 0;
            const avgRating = product.rating || 4.5;
            const isOutOfStock = product.stock <= 0;

            return (
              <div key={product.id} className="px-3">
                <div className="group bg-white rounded-2xl p-4 shadow-md relative transition-all duration-300">
                  <div className="relative h-60 flex items-center justify-center border-2 border-dashed border-primary rounded-md overflow-hidden">
                    <Link to={`/shop/${product.id}`}>
                      <img
                        src={product.images?.[0] || ""}
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
                          price: price,
                        });
                      }}
                      className="absolute top-2 right-2 border p-2 rounded-full group-hover:text-white group-hover:bg-primary transition"
                    >
                      <FaRegHeart />
                    </button>
                  </div>

                  <h3 className="font-semibold text-base sm:text-md text-center mb-2">
                    {product.name}
                  </h3>

                  {/* Stock/Price display */}
                  {isOutOfStock ? (
                    <>
                      <p className="text-center text-gray-600 text-sm mb-3">
                        MRP:{" "}
                        <span className="line-through text-gray-400">
                          ₹{mrp}
                        </span>{" "}
                        ₹{price}
                      </p>
                      <p className="text-center text-red-500 text-sm mb-3 font-medium">
                        Out of Stock
                      </p>
                    </>
                  ) : (
                    <p className="text-center text-gray-600 text-sm mb-2">
                      MRP:{" "}
                      <span className="line-through text-gray-400">₹{mrp}</span>{" "}
                      ₹{price}
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
                          category: product.category,
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
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
};

export default FestiveGiftPack;
