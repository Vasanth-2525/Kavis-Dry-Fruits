import handimg from "/images/Subscribe.png";
import subscribesideimg from "/images/Subscribe-bg.png";

const Subscribe = () => {
  return (
    <div className="bg-green-200 px-4 py-12 md:py-20 border-t-1 border-primary relative overflow-hidden">
      {/* Background image on bottom-left */}
      <img
        src={subscribesideimg}
        alt="Subscribe Decoration"
        className="absolute bottom-0 left-0 w-30 md:w-38 lg:w-46 hidden md:block"
      />

      <div className="max-w-6xl mx-auto flex flex-col-reverse  items-center justify-between gap-12">
        {/* Text and Form Section */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700 mb-4">
            Subscribe to Get Exclusive Offers & Fresh Dry Fruit Deals!
          </h1>
          <div className=' flex flex-col justify-center items-center'>
            
          <p className="text-gray-800 text-sm sm:text-xl font-semibold mb-6">
            Join Our newsletter to receive health tips, festive offers,<br />
            and tasty surprises straight to your inbox
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <input
              type="email"
              placeholder="Enter Your Email..."
              className="px-5 py-3 rounded-2xl border-green1 border-2 font-bold text-green1 focus:outline-none w-full sm:w-auto min-w-[200px] sm:min-w-[350px]"
            />
            <button 
            type='submit'
            className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-md transition">
              Subscribe Now
            </button>
          </div>
          </div>
        </div>

        {/* Image of Hands with Dry Fruits */}
        <div className="flex-1 flex absolute bottom-0 right-0 lg:right-18">
          <img src={handimg} alt="Hand holding dry fruits" className=" hidden md:block md:w-42 lg:w-80" />
        </div>
      </div>
    </div>
  );
};

export default Subscribe;