import { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import almonds from "/images/Category/c1.png";
import cashews from "/images/Category/c2.png";
import dates from "/images/Category/c3.png";
import raisins from "/images/Category/c4.png";
import pistachios from "/images/Category/c5.png";
import mixed from "/images/Category/c6.png";
import bg from "/images/offer-side-bg1.png";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const PrevArrow = (props) => {
  const { className, onClick, style } = props;
  return (
    <div
      className={`${className} flex items-center justify-center bg-green3 rounded-full w-10 h-10 z-10 absolute left-[35%] -top-15 -translate-y-1/2`}
      onClick={onClick}
      style={{ ...style }}
    >
      <FaChevronLeft className="text-black text-xl" />
    </div>
  );
};

const NextArrow = (props) => {
  const { className, onClick, style } = props;
  return (
    <div
      className={`${className} flex items-center justify-center bg-green3 rounded-full w-10 h-10 z-10 absolute right-[37%] -top-15 -translate-y-1/2`}
      onClick={onClick}
      style={{ ...style }}
    >
      <FaChevronRight className="text-black text-xl" />
    </div>
  );
};

// Category data with both default and hover images
const categories = [
  { name: "Almonds", defaultImage: cashews, hoverImage: almonds },
  { name: "Cashews", defaultImage: cashews, hoverImage: almonds },
  { name: "Dates", defaultImage: cashews, hoverImage: almonds },
  { name: "Raisins", defaultImage: cashews, hoverImage: almonds },
  { name: "Pistachios", defaultImage: cashews, hoverImage: almonds },
  { name: "Mixed Dry Fruits", defaultImage: cashews, hoverImage: almonds },
];

const Category = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay:true,
    arrows: false,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  // State to track hover index
  const [hoverIndex, setHoverIndex] = useState(null);

  return (
    <section className="relative bg-white py-12 ">
      <img src={bg} alt="bg_image" className=" absolute -left-72 w-[35%]" />
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-no-repeat bg-contain bg-left z-0" />

      {/* Heading */}
      <h2 className="text-2xl font-bold text-center mb-10 relative z-10">
        Our <span className="text-green-600">Category</span>
        <div className="w-[16%] h-[2px] border-b-2 border-dashed border-green1 mt-5 mx-auto"></div>
      </h2>

      {/* Category Slider */}
      <div className="max-w-7xl mx-auto px-15 relative z-10">
        <Slider {...settings}>
          {categories.map((item, index) => (
            <div key={index} className="px-4">
              <Link
              to={"/shop"}
                className="flex flex-col items-center justify-center text-center relative group"
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {/* Image */}
                <div className="relative z-10 group">
                  <img
                    src={
                      hoverIndex === index ? item.hoverImage : item.defaultImage
                    }
                    alt={item.name}
                    className="w-[120px] h-[120px] object-contain z-10 mb-2 transition duration-700 ease-in-out"
                  />
                </div>

                <div className="relative w-full h-[80px] shadow border border-green1 border-t-0 rounded-b-full mt-[-75px] group-hover:shadow-md group-hover:shadow-green2 ">
                  <span className="absolute left-[-3px] top-0 w-2 h-2 bg-green1 rounded-full -translate-y-1/2"></span>
                  <span className="absolute right-[-4px] top-0 w-2 h-2 bg-green1 rounded-full -translate-y-1/2"></span>
                </div>

                {/* Label */}
                <p className="font-semibold text-black text-lg mt-5 ">{item.name}</p>
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Category;
