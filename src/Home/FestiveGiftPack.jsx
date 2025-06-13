import { FaStar, FaRegHeart } from "react-icons/fa";
import { useState, useEffect } from "react";
import { IoCartOutline } from "react-icons/io5";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import rightBg from "/images/offer-side-bg2.png";

const FestiveGiftPack = () => {
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
            alt=""
            className="hidden md:block absolute left-0 top-0 w-28"
          />
        </div>
        <div className="absolute md:top-0 md:right-0 top-14 right-[27%]">
          <button className="bg-green1 text-white font-semibold px-6 py-2 rounded-md hover:bg-green-700 transition">
            View More
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <Slider {...settings}>
          {productData.map((product) => {
            const activeWeight = product.weights?.[0] ?? "";
            const price = product.prices?.[activeWeight] ?? 0;
            const mrp = price ? Math.floor(price / 0.84) : 0;
            const avgRating = product.rating || 4.5;

            return (
              <div key={product.id} className="px-3">
                <div className="group bg-white rounded-2xl p-4 shadow-md relative transition-all duration-300">
                  <div className="absolute top-7 left-4 bg-green1 text-white text-xs px-3 py-1 rounded-r-full">
                    Bestseller
                  </div>
                  <div className="absolute top-6 right-6 text-green1 border border-green1 p-2 rounded-full text-xl hover:bg-green1 hover:text-white transition">
                    <FaRegHeart />
                  </div>
                  <div className="border-2 border-dotted border-green1 rounded-2xl">
                    <img
                      src={product.images?.[0] ?? "fallback-image.png"}
                      alt={product.name}
                      className="w-full h-56 object-contain p-4 mb-4 group-hover:rotate-y-180 transition-all duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-base sm:text-md text-center mb-2">
                    {product.name} 
                  </h3>
                  <p className="text-center text-gray-600 text-sm mb-2">
                    MRP: <span className="line-through text-gray-400">₹{mrp}</span> ₹{price}
                  </p>
                  <div className="w-[90%] h-[1px] border-b border-dashed border-green1 mx-auto mb-3" />
                  <div className="flex justify-between items-center mt-auto px-1">
                    <button className="bg-green1 text-white w-1/2 py-2 rounded-md text-xl flex justify-center items-center hover:bg-green2 transition">
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
