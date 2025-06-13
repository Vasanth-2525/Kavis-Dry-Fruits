import { Link } from "react-router-dom";
import bgImage from "/images/header-page-bg.jpg";

const PageHeader = ({ title,subtitle,curpage }) => {
  return (
    <div
      className="relative flex flex-col justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage: `url(${bgImage})`,
        minHeight: "40vh",
        backgroundPosition:"bottom",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      {/* Title in Center */}
      <div className="relative z-10 flex justify-center items-center h-full">
        <h2 className="uppercase text-3xl md:text-4xl font-bold text-white text-center">
          {title}
        </h2>
      </div>

      {/* Breadcrumb at Bottom Left */}
      <div className="absolute bottom-6 left-10 z-10">
        <p className="text-white text-sm md:text-xl">
          <Link to="/" className="font-semibold text-white ">
            Home 
          </Link>{" > "}
          <Link to={`/${subtitle}`} className="font-semibold text-green1   ">
            {subtitle}
          </Link>{" > "}
          <span className="text-primary font-semibold"> {curpage}</span>
        </p>
      </div>
    </div>
  );
};

export default PageHeader;
