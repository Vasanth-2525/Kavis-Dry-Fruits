import bgImg from "/images/offer-bg.png";
import bg from "/images/offer-side-bg1.png";

const OfferBanner = () => {
  return (
    <section className="h-auto md:h-[60vh] bg-green4 px-4 md:px-35 py-10 overflow-hidden relative">
      <img src={bg} alt="bg_image" className=" absolute -right-72 w-[35%]" />
      <div className="w-full h-full border-4 border-dashed border-green-600 rounded-lg p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Text Section */}
        <div className="lg:w-2/3 text-center lg:text-left">
          <h1 className="text-lg md:text-xl font-semibold mb-2">
            TODAY OFFER: 70% OFF ALL DRY FRUITS
          </h1>
          <p className="text-xl font-semibold mb-4">
            FOR THE NEXT 02 HOURS ONLY
          </p>
        </div>

        {/* Image */}
        <div className="lg:w-1/2 w-2/3">
          <img
            src={bgImg}
            alt="Offer Banner"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Coupon Code */}
        <div className="lg:w-1/3 text-center lg:text-right">
          <p className="text-lg font-bold mb-2">USE COUPON CODE</p>
          <p className="text-2xl font-bold text-green1 px-4 py-2 rounded ">
            "DRYFRUITS"
          </p>
        </div>
      </div>
    </section>
  );
};

export default OfferBanner;
