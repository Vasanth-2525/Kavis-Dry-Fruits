import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const RelatedProducts = ({ relatedProducts }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="my-10 px-4 sm:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Explore <span className="text-primary">Related Products</span>
          </h2>
          <div className="w-[80%] sm:w-[40%] md:w-[17%] h-[2px] border-b-2 border-dashed border-green1 mx-auto"></div>
        </div>
        <div className="w-full flex justify-center md:justify-end mb-4">
          <Link
            to="/shop"
            className="bg-primary text-white font-semibold px-6 py-2 rounded-md hover:bg-green1 transition"
          >
            View More
          </Link>
        </div>

        <Slider {...settings}>
          {relatedProducts.map((p) => {
            const relWeight = p.weights[0];
            const relPrice = p.prices[relWeight];
            const relMrp = Math.floor(relPrice / 0.84);
            const relRating = p.rating.toFixed(1);

            return (
              <div key={p.id} className="px-2 text-center">
                <div className="group bg-white rounded-2xl p-4 shadow-md transition-all duration-300 relative h-full flex flex-col">
                  <div className="absolute top-7 left-4 bg-green1 text-white text-xs px-3 py-1 rounded-r-full">
                    Bestseller
                  </div>
                  <div className="absolute top-6 right-6 text-green1 border border-green1 p-2 rounded-full text-xl hover:bg-green1 hover:text-white transition">
                    <FiHeart />
                  </div>
                  <div className="border-2 border-dotted border-green1 rounded-2xl">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-56 object-contain p-4 mb-4 group-hover:rotate-y-180 transition-all duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg text-center mb-2">
                    {p.name} ({relWeight})
                  </h3>
                  <p className="text-center text-gray-600 text-sm mb-2">
                    MRP:{" "}
                    <span className="line-through text-gray-400">
                      ₹{relMrp}
                    </span>{" "}
                    ₹{relPrice}
                  </p>
                  <div className="w-[90%] h-[1px] border-b border-dashed border-green1 mx-auto mb-3" />
                  <div className="flex justify-center mt-auto">
                    <Link
                      to={`/shop/${p.id}`}
                      className="bg-green1 text-white px-6 py-2 rounded-md text-md hover:bg-green2 transition"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </section>
  );
};

export default RelatedProducts;
