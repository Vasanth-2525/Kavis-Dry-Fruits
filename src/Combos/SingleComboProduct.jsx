import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaPlus, FaMinus, FaHeart } from "react-icons/fa";
import { useStore } from "../Context/StoreContext";
import PageHeader from "../Component/PageHeader";
import Testimonials from "../Shop/Testimonials";
import { toast } from "react-hot-toast";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";


const SingleComboProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allProducts, addToCart, addToFav } = useStore();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeSize, setActiveSize] = useState("");
  const [reviewInput, setReviewInput] = useState({ user: "", comment: "" });

  useEffect(() => {
    if (!id || !allProducts.length) return;

    const selectedProduct = allProducts.find((p) => p.id === id);
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
      window.scrollTo(0, 0);
    }
  }, [id, allProducts]);

  if (!product) {
    return (
      <div className="text-center mt-10 text-red-600">Product not found</div>
    );
  }

  const priceKey = activeSize.includes("g") ? activeSize : "500g";
  const mrp = product.prices?.[priceKey] || 0;
  const offerPrice = Math.floor(mrp - mrp / 10);
  const averageRating =
    typeof product.rating === "number" ? product.rating.toFixed(1) : "4.5";
  const isOutOfStock = product.stock <= 0;

  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    if (isOutOfStock) return toast.error("This product is out of stock.");
    addToCart({
      id: product.id,
      name: product.name,
      price: offerPrice,
      qty: quantity,
      image: product.images?.[0],
      selectedWeight: activeSize,
      category: "Combo",
    });
  };

  const handleAddToFav = () => {
    addToFav({
      id: product.id,
      name: product.name,
      image: product.images?.[0],
      price: offerPrice,
    });
  };

  const handleReviewSubmit = async () => {
    if (!reviewInput.user || !reviewInput.comment) {
      toast.error("Please fill all review fields!");
      return;
    }

    const newReview = {
      user: reviewInput.user,
      comment: reviewInput.comment,
      date: new Date().toISOString().split("T")[0],
    };

    try {
      const productRef = doc(db, "products", product.id);
      await updateDoc(productRef, {
        reviews: [...(product.reviews || []), newReview],
      });

      toast.success("Review added successfully!");
      setProduct((prev) => ({
        ...prev,
        reviews: [...(prev.reviews || []), newReview],
      }));
      setReviewInput({ user: "", comment: "" });
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Failed to add review.");
    }
  };

  return (
    <>
      <PageHeader
        title="Product Details"
        subtitle="Combos"
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
            <div className="flex flex-col items-center md:border-r-2 border-dashed border-primary md:rounded-xl">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-72 sm:h-96 object-contain"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 px-4 py-4">
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

            <div className="p-2 sm:p-4">
              <h2 className="text-xl sm:text-2xl font-bold text-black">
                {product.name} – {activeSize}
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
                  ({averageRating}/5) - {product.reviews?.length || 0} Reviews
                </span>
              </div>

              {product.combos?.length > 0 && (
                <div className="mt-3">
                  <p className="font-bold text-green-800">Combo Includes:</p>
                  <ul className="list-disc list-inside text-gray-700 mt-1">
                    {product.combos.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-lg font-semibold mt-4">
                Price: <span className="line-through text-gray-400">₹{mrp}</span>{" "}
                <span className="text-primary text-lg md:text-xl font-bold">
                  ₹{offerPrice}
                </span>{" "}
                <span className="text-xs md:text-sm text-gray-500">
                  (You save ₹{mrp - offerPrice})
                </span>
              </p>

              {isOutOfStock && (
                <p className="mt-2 text-red-600 font-semibold">Out of Stock</p>
              )}

              <div className="mt-4 flex items-center gap-3">
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
                  onClick={handleAddToCart}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    isOutOfStock ? "bg-gray-400 text-white cursor-not-allowed" : "bg-primary text-white hover:bg-green-700"
                  }`}
                  disabled={isOutOfStock}
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    const checkoutProduct = {
                      ...product,
                      quantity,
                      selectedWeight: activeSize,
                      price: offerPrice,
                      img: product.images[0],
                    };
                    navigate("/checkout", { state: { checkoutProduct } });
                  }}
                  className={`border px-6 py-2 rounded-lg font-semibold ${
                    isOutOfStock ? "border-gray-400 text-gray-400 cursor-not-allowed" : "border-green-600 text-primary hover:bg-green-50"
                  }`}
                  disabled={isOutOfStock}
                >
                  Buy Now
                </button>
                <button
                  onClick={handleAddToFav}
                  className="border border-green1 text-primary p-3 rounded-full cursor-pointer"
                >
                  <FaHeart />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 pt-3 gap-4 mt-6 text-center text-sm text-green-700 border-t-2 border-dashed border-green1">
                {[
                  {
                    img: "/images/New folder/New folder/healthy-heart.png",
                    text: "Healthy Heart",
                  },
                  {
                    img: "/images/New folder/New folder/vitamins.png",
                    text: "High Nutrition",
                  },
                  {
                    img: "/images/New folder/New folder/gluten-free.png",
                    text: "Gluten Free",
                  },
                  {
                    img: "/images/New folder/New folder/sugar-free.png",
                    text: "Cholesterol Free",
                  },
                ].map((item, idx) => (
                  <div key={idx}>
                    <img
                      src={item.img}
                      alt={item.text}
                      className="mx-auto w-16 h-16 border border-dashed border-green1 rounded-full p-3"
                    />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-2 border-dashed border-green1 p-4 rounded-lg">
            <div>
              <h3 className="font-bold text-lg mb-2">Product Description</h3>
              <p className="text-gray-700 mb-4">{product.description}</p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>
                  <strong>Weight:</strong> {activeSize}
                </li>
                <li>
                  <strong>Packaging:</strong> Airtight Resealable Pouch
                </li>
                <li>
                  <strong>Shelf Life:</strong> 6 months
                </li>
                <li>
                  <strong>Ideal for:</strong> Gifting, Festivals, Wellness
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Health Benefits</h3>
              <ul className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                {product.health_benefits?.map((benefit, idx) => (
                  <li key={idx}>{benefit}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="ml-[23%] w-full md:w-1/2 mt-10 bg-white shadow-lg border border-green-200 rounded-lg p-6">
          <h3 className="font-bold text-2xl mb-4 text-green-700 flex items-center gap-2">
            <FaStar className="text-yellow-500" /> Share Your Review
          </h3>

          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={reviewInput.user}
                onChange={(e) =>
                  setReviewInput({ ...reviewInput, user: e.target.value })
                }
                className="w-full p-3 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Write your honest feedback here..."
                value={reviewInput.comment}
                onChange={(e) =>
                  setReviewInput({ ...reviewInput, comment: e.target.value })
                }
                className="w-full p-3 border border-green-400 rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleReviewSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-semibold shadow-md transition duration-200"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>

        <Testimonials reviews={product.reviews || []} />
      </section>
    </>
  );
};

export default SingleComboProduct;
