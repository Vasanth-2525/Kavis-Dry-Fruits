import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaStar, FaPlus, FaMinus, FaHeart } from "react-icons/fa";
import { useStore } from "../Context/StoreContext";
import PageHeader from "../Component/PageHeader";
import Testimonials from "../Shop/Testimonials";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

const SingleComboProduct = () => {
  const { id } = useParams();
  const { addToCart, addToFavorites } = useStore();
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeSize, setActiveSize] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/DryFruitsProductData.json")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error("Error loading ProductData.json", err);
      });
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const selectedProduct = products.find((p) => p.id === parseInt(id));
      if (selectedProduct) {
        const weightArray = selectedProduct.weights?.[0]
          ? selectedProduct.weights[0].split(",").map((w) => w.trim())
          : [];

        setProduct({
          ...selectedProduct,
          weights: weightArray,
        });

        setSelectedImage(selectedProduct.images?.[0] || "");
        setActiveSize(weightArray[0] || "");
        setQuantity(1);
      } else {
        setProduct(null);
      }
      window.scrollTo(0, 0);
    }
  }, [products, id]);

  if (!product) {
    return (
      <div className="text-center mt-10 text-red-600">Product not found</div>
    );
  }

  const priceKey = `${activeSize}g`;
  const mrp = product.prices?.[priceKey] || 0;
  const offerPrice = Math.floor(mrp - mrp / 10);
  const averageRating = product.rating?.toFixed(1) || "4.5";

  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    addToCart({
      ...product,
      qty: quantity,
      // selectedWeight: activeSize,
      price: offerPrice,
      img: product.images?.[0],
      prices: product.prices,
      type: "Combo",
    });
     toast.success("Product Added Successfully"); 
  };

  const handleAddToFav = () => {
    addToFavorites({
      ...product,
      qty: quantity,
      selectedWeight: activeSize,
      price: offerPrice,
      img: product.images?.[0],
    });
    toast.success("Product Added To Favorite")
  };

  return (
    <>
      <PageHeader
        title="Product Details"
        subtitle="combos"
        curpage={product.name}
      />
      <section className="bg-green4">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-4">
            Product <span className="text-primary">Details</span>
          </h2>
          <div className="w-[80%] sm:w-[40%] md:w-[17%] h-[2px] border-b-2 border-dashed border-green1 mx-auto"></div>
        </div>

        <div className="bg-white border-2 border-primary rounded-xl p-4 sm:p-6 mx-4 sm:mx-10 lg:mx-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:border-2 md:border-dashed md:border-primary rounded-lg">
            {/* Images */}
            <div className="flex flex-col items-center md:border-r-2 border-dashed border-primary md:rounded-xl">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-70 sm:h-96 object-contain"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 px-4 py-4 overflow-x-auto">
                {product.images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 object-cover border rounded-lg cursor-pointer ${
                      selectedImage === img
                        ? "border-green-600"
                        : "border-2 border-green-200"
                    }`}
                    alt={`thumb-${idx}`}
                  />
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="p-2 sm:p-4">
              <h2 className="text-xl sm:text-2xl font-bold text-black">
                {product.name} – {activeSize}g
              </h2>

              <div className="flex items-center gap-2 mt-2 text-primary">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < Math.round(product.rating)
                        ? "text-primary"
                        : "text-gray-300"
                    }
                  />
                ))}
                <span className="text-gray-700 text-sm">
                  ({averageRating}/5) - {product.reviews?.length} Reviews
                </span>
              </div>
              {/* What's Inside */}
              {product.combos?.length > 0 && (
                <div className="mt-3">
                  <div className="text-gray-700 leading-relaxed">
                    {product.combos.map((item, idx) => (
                      <span key={idx}>
                        {item}
                        {idx < product.combos.length - 1 && (
                          <span className="mx-2 text-gray-400">
                            <br />
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-lg font-semibold mt-4">
                Price:{" "}
                <span className="line-through text-gray-400">₹{mrp}</span>{" "}
                <span className="text-primary text-lg md:text-xl font-bold">
                  ₹{offerPrice}
                </span>{" "}
                <span className="text-xs md:text-sm text-gray-500">
                  (You save ₹{mrp - offerPrice})
                </span>
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="bg-primary text-white flex items-center border rounded-md overflow-hidden">
                  <button
                    onClick={decreaseQty}
                    className="px-3 py-2 font-bold cursor-pointer"
                  >
                    <FaMinus />
                  </button>
                  <span className="px-4 font-semibold">
                    {String(quantity).padStart(2, "0")}
                  </span>
                  <button
                    onClick={increaseQty}
                    className="px-3 py-2 font-bold cursor-pointer"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  className="bg-primary text-white px-6 py-2 rounded-lg font-semibold cursor-pointer"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    const checkoutProduct = {
                      ...product,
                      qty: quantity,
                      selectedWeight: activeSize,
                      price: offerPrice, 
                      img: product.images[0],
                    };
                    navigate("/checkout", { state: { checkoutProduct } });
                  }}
                  className="border border-green-600 text-primary px-6 py-2 rounded-lg font-semibold cursor-pointer"
                >
                  Buy Now
                </button>

                <button
                  className="border border-green1 text-primary p-3 rounded-full cursor-pointer"
                  onClick={handleAddToFav}
                >
                  <FaHeart />
                </button>
              </div>

              <div className="border-t-2 border-dashed border-green1 mt-6 py-4 text-sm font-semibold text-gray-700">
                <p>Free Shipping on orders above ₹399</p>
                <p className="mt-1">100% Premium Quality ~ No Preservatives</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-10 border-2 border-dashed border-primary rounded-xl p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-black mb-2">
                Product Description
              </h3>
              <p className="text-gray-700 mb-3">{product.description}</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>
                  <strong>Size:</strong> {activeSize}g
                </li>
                <li>
                  <strong>Packaging:</strong> Airtight Resealable pouch
                </li>
                <li>
                  <strong>Shelf Life:</strong> 6 months
                </li>
                <li>
                  <strong>Ideal for:</strong> Snacking, Cooking, Gifting
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-black mb-2">
                Health Benefits
              </h3>
              <ul className="list-decimal pl-5 space-y-2 text-gray-700">
                {product.health_benefits?.map((benefit, idx) => (
                  <li key={idx}>{benefit}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Testimonials reviews={product.reviews} />
    </>
  );
};

export default SingleComboProduct;
