import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import NutsImage from "/images/about.png"; 
import rightBg from '/images/offer-side-bg2.png'

const testimonials = [
  {
    name: "Surya",
    time: "2 days ago",
    text: "Lorem ipsum sed eleifend lacus nec bibendum pulvinar, nibh maruis vehicula auges. Lorem ipsum sed.",
  },
  {
    name: "Siva",
    time: "3 days ago",
    text: "Lorem ipsum sed eleifend lacus nec bibendum pulvinar, nibh maruis vehicula auges. Lorem ipsum sed.",
  },
  {
    name: "Vinoth",
    time: "2 days ago",
    text: "Lorem ipsum sed eleifend lacus nec bibendum pulvinar, nibh maruis vehicula auges. Lorem ipsum sed.",
  },
  {
    name: "Sakthi",
    time: "3 days ago",
    text: "Lorem ipsum sed eleifend lacus nec bibendum pulvinar, nibh maruis vehicula auges. Lorem ipsum sed.",
  },
];

const ClientsAbout = () => {
  const [start, setStart] = useState(0);

  const prevSlide = () => {
    setStart((prev) => (prev - 2 + testimonials.length) % testimonials.length);
  };

  const nextSlide = () => {
    setStart((prev) => (prev + 2) % testimonials.length);
  };

  const visibleTestimonials = [
    testimonials[start],
    testimonials[(start + 1) % testimonials.length],
  ];

  return (
    <section className="bg-green4 py-10 px-4 md:px-10">
        <div className="text-center relative">
        <h2 className="text-2xl font-bold mb-4">
          CLIENTS <span className="text-green-600">ABOUT US</span>
        </h2>
        <div className="md:w-[17%] w-[80%] h-[2px] border-b-2 border-dashed border-green1 mx-auto"></div>
          <img src={rightBg} alt="" className="hidden md:block absolute right-0 top-0 w-30" />
      </div>
        
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10">
        {/* Image */}
        <div className="w-full lg:w-1/3 flex justify-center">
          <img
            src={NutsImage}
            alt="Nuts Bowl"
            className="w-[250px] md:w-[300px] object-contain drop-shadow-xl"
          />
        </div>

        {/* Content */}
        <div className="w-full lg:w-2/3 text-center relative">

          
          <div className="flex items-center justify-between gap-4">
            {/* Left Arrow */}
            <button
              onClick={prevSlide}
              className="border border-green1 text-black rounded-full w-14 h-12 flex items-center justify-center hover:bg-green-100 transition"
              aria-label="Previous testimonials"
            >
              <FiChevronLeft size={24} />
            </button>

            {/* Testimonials */}
            <div className="flex gap-6 flex-col sm:flex-row w-full justify-between">
              {visibleTestimonials.map((item, index) => (
                <div key={index} className="w-full max-w-md">
                  <p className="text-4xl text-left text-black font-bold">❝</p>
                  <h4 className="font-bold text-justify text-lg mb-2">
                    {item.name}, <span className="font-medium">{item.time}</span>
                  </h4>
                  <p className="text-gray-700 text-justify">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={nextSlide}
              className="border border-green1 text-black  rounded-full w-14 h-12 flex items-center justify-center hover:bg-green-100 transition"
              aria-label="Next testimonials"
            >
              <FiChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientsAbout;
