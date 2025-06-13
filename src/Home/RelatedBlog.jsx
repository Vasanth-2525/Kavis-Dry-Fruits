import Slider from "react-slick";
import { GoArrowUpRight } from "react-icons/go";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


const newsData = [
  {
    id: 1,
    image: "/images/hero-slider/1.png",
    hoverImage: "/images/hero-slider/4.png",
    date: "Jan 05, 2024",
    title: "Top 8 Amazing health benefits of Dry Fruits",
    description:
      "Nuts like almonds and walnuts are essential expensive as they are a good source beta...",
  },
  {
    id: 2,
    image: "/images/hero-slider/2.png",
    hoverImage: "/images/hero-slider/4.png",
    date: "Jan 05, 2024",
    title: "Top 8 Amazing health benefits of Dry Fruits",
    description:
      "Nuts like almonds and walnuts are essential expensive as they are a good source beta...",
  },
  {
    id: 3,
    image: "/images/hero-slider/3.png",
    hoverImage: "/images/hero-slider/4.png",
    date: "Jan 05, 2024",
    title: "Top 8 Amazing health benefits of Dry Fruits",
    description:
      "Nuts like almonds and walnuts are essential expensive as they are a good source beta...",
  },
  {
    id: 4,
    image: "/images/hero-slider/4.png",
    hoverImage: "/images/hero-slider/4.png",
    date: "Jan 05, 2024",
    title: "Top 8 Amazing health benefits of Dry Fruits",
    description:
      "Nuts like almonds and walnuts are essential expensive as they are a good source beta...",
  },
  {
    id: 5,
    image: "/images/hero-slider/5.png",
    hoverImage: "/images/hero-slider/4.png",
    date: "Jan 05, 2024",
    title: "Top 8 Amazing health benefits of Dry Fruits",
    description:
      "Nuts like almonds and walnuts are essential expensive as they are a good source beta...",
  },
];

const RelatedBlog = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <section className="bg-[#e5f4e9] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center pb-10">
          <h2 className="text-2xl font-bold mb-4">
            Latest Related <span className="text-green-600">News & Blogs</span>
          </h2>
          <div className="md:w-[17%] w-[80%] h-[2px] border-b-2 border-dashed border-green1 mx-auto"></div>
        </div>

        <Slider {...settings}>
          {newsData.map((news) => (
            <div key={news.id} className="p-2">
              <div className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-3 flex flex-col h-full ">
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-75"
                  />
                  <img
                    src={news.hoverImage}
                    alt="Hover"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:brightness-50 group-hover:scale-x-110 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="absolute top-1/2 left-1/2 border border-white transform -translate-x-1/2 -translate-y-1/2 bg-green1 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <GoArrowUpRight size={30} />
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-700 flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Kavi’s Dry Fruits</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green1 rounded-full"></span>
                      {news.date}
                    </span>
                  </div>
                  <hr className="my-2 border-dashed border-green1" />
                  <h3 className="font-bold text-base line-clamp-1">
                    {news.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {news.description}
                  </p>
                  <a
                    href="#"
                    className="text-primary font-semibold mt-2 inline-block underline"
                  >
                    Read More
                  </a>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default RelatedBlog;
