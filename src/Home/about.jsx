import AboutImage from "/images/Kavi_logo.png";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";

const About = () => {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.4, 
  });

  const [startCount, setStartCount] = useState(false);

  useEffect(() => {
    if (inView) {
      setStartCount(true);
    }
  }, [inView]);

  const stats = [
    { number: 8, suffix: "+", label: "Years of Experience" },
    { number: 3500, suffix: "+", label: "Happy Customers" },
    { number: 100, suffix: "+", label: "Natural & Handpicked" },
  ];

  return (
    <section className="bg-Beach py-8 px-6 h-auto" ref={ref}>
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold mb-4">
          About <span className="text-green1">Us</span>
        </h2>
        <div className="md:w-[17%] w-[80%] h-[2px] border-b-2 border-dashed border-green1 mx-auto"></div>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Left Content */}
        <div>
          <h2 className="text-3xl font-bold text-green-800 mb-4">
            Bringing Nature’s Goodness to Your Home
          </h2>
          <p className="text-gray-700 mb-6 font-semibold">
            At Kavi Dry Fruits, we handpick premium quality dry fruits directly
            from farms. With over 8+ years of experience and 3500+ happy
            customers, we deliver freshness, quality, and care in every pack.
          </p>

          {/* Count-up Stats */}
          <div className="space-y-4 mb-6" ref={ref}>
            {stats.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shadow-lg">
                  {startCount ? (
                    <CountUp
                      end={item.number}
                      suffix={item.suffix}
                      duration={2}
                    />
                  ) : (
                    "0"
                  )}
                </div>
                <p className="text-lg font-medium text-green-900">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <button className="ml-[20%] bg-green1 hover:bg-primary transition text-white font-semibold px-6 py-3 rounded-lg shadow-md">
            Explore Our Story
          </button>
        </div>

        {/* Right Image */}
        <div>
          <img src={AboutImage} alt="About us" className=" drop-shadow-2xl" />
        </div>
      </div>
    </section>
  );
};

export default About;
