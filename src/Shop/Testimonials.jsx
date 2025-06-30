import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useState } from "react";
import rightBg from "/images/offer-side-bg2.png";

const Testimonials = ({ reviews = [] }) => {
  const [start, setStart] = useState(0);

  // Safe guard
  const hasReviews = Array.isArray(reviews) && reviews.length > 0;

  const prevSlide = () => {
    if (!hasReviews) return;
    setStart((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    if (!hasReviews) return;
    setStart((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const review = hasReviews ? reviews[start] : null;

  return (
    <div className="py-12 px-4 bg-green4">
      {/* Title */}
      <div className="text-center mb-8 relative">
        <h2 className="text-3xl font-bold text-green-800">Testimonials</h2>
        <div className="w-24 h-1 border-b-2 border-dashed border-green-600 mx-auto mt-2"></div>
        <img
          src={rightBg}
          alt=""
          className="hidden md:block absolute right-0 top-0 w-30"
        />
        <img
          src={rightBg}
          alt=""
          className="hidden md:block absolute left-0 top-0 w-30"
        />
      </div>

      {hasReviews ? (
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="border border-green-600 text-black rounded-full w-14 h-12 flex items-center justify-center hover:bg-green-100 transition"
          >
            <FiChevronLeft size={24} />
          </button>

          {/* Single Review Card */}
          <div className="rounded-xl p-6 w-full text-center transition">
            <div className="flex justify-between text-green-700">
              <p className="text-5xl">❝</p>
              <p className="text-5xl">❞</p>
            </div>

            <p className="text-black font-semibold text-lg hover:underline">
              {review.user}
            </p>
            <span className="text-black font-semibold text-sm">
              {review.date}
            </span>

            <p className="text-gray-700 italic mt-2">“{review.comment}”</p>
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="border border-green-600 text-black rounded-full w-14 h-12 flex items-center justify-center hover:bg-green-100 transition"
          >
            <FiChevronRight size={24} />
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-600 mt-10">
          No reviews available.
        </div>
      )}
    </div>
  );
};

export default Testimonials;
