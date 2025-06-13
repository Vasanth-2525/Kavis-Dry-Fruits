import ser1 from "/images/Services/s2.png";
import ser2 from "/images/Services/s4.png";
import ser3 from "/images/Services/s1.png";
import ser4 from "/images/Services/s3.png";

const Services = () => {
  const serviceList = [
    { name: "100% CLEAN & FRESH", image: ser1 },
    { name: "NO PESTICIDES", image: ser2 },
    { name: "RICH IN NUTRIENTS", image: ser3 },
    { name: "CHEAPEST PRICE ON MARKET", image: ser4 },
  ];

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-4">
            Why <span className="text-green1">Choose Us</span>
          </h2>
          <div className="md:w-[17%] w-[80%] h-[2px] border-b-2 border-dashed border-green1 mx-auto"></div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceList.map((service, index) => (
            <div
              key={index}
              className="group relative overflow-hidden p-8 text-center rounded-lg "
            >
              <div className="mb-6 flex justify-center">
                <div className=" w-32 h-32 p-1 rounded-full border-2 border-dashed border-green1 ">
                  <img
                    src={service.image}
                    alt={service.name.toLowerCase()}
                    className=" object-contain w-full h-full p-6 bg-green1 rounded-full "
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 uppercase tracking-wide">
                {service.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
