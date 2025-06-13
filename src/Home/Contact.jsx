import React from "react";
import bgImage from "/images/contact.jpg";
import nutTopRight from "/images/offer-side-bg2.png";

const Contact = () => {
  return (
    <div className=" py-10 px-4 relative overflow-hidden">
      {/* Decorative Top-Right Image */}
      <img
        src={nutTopRight}
        alt="nut decoration"
        className="hidden md:block absolute right-10 top-10 w-32"
      />

      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center pb-10">
          <h2 className="text-2xl font-bold mb-4">
            Contact <span className="text-primary">Us</span>
          </h2>
          <div className="md:w-[17%] w-[80%] h-[2px] border-b-2 border-dashed border-primary mx-auto"></div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left - Contact Info with background overlay */}
          <div className="relative rounded-2xl min-h-[400px] overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${bgImage})` }}
            ></div>
            <div className="absolute inset-0 bg-black opacity-60"></div>

            <div className="relative p-8 text-white z-10 h-full flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-15">OUR INFORMATION</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div>
                  <p className="mb-10">
                    <span className="font-semibold">Office Address</span>
                    <br />
                    501/B 5th Floor, Anna Street,
                    <br />
                    Chennai, Tamil Nadu, 600 001.
                  </p>
                  <p className="mb-4">
                    <span className="font-semibold">Call Us</span>
                    <br />
                    +91 9876438433
                  </p>
                </div>
                <div>
                  <p className="mb-10">
                    <span className="font-semibold">General Enquiry</span>
                    <br />
                    dryfruits@gmail.com
                  </p>
                  <p>
                    <span className="font-semibold">Our Timing</span>
                    <br />
                    Mon – Sun : 10:00 AM – 07:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Enquiry Form */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-6">
              ENQUIRY FORM
            </h3>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name*"
                  required
                  className="border border-green1 rounded-md px-4 py-2 w-full focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Contact No*"
                  required
                  className="border border-green1 rounded-md px-4 py-2 w-full focus:outline-none"
                />
              </div>
              <input
                type="email"
                placeholder="Email Id"
                required
                className="border border-green1 rounded-md px-4 py-2 w-full focus:outline-none"
              />
              <textarea
                placeholder="Your Message*"
                required
                className="border border-green1 rounded-md px-4 py-2 w-full h-32 resize-none focus:outline-none"
              ></textarea>
              <button
                type="submit"
                className="bg-primary text-white font-semibold px-8 py-2 rounded-md hover:bg-green-700 transition"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
