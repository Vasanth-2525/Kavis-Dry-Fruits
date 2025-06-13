import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import PageHeader from "../Component/PageHeader";
import { useStore } from "../Context/StoreContext";
import Services from "../Home/Services";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddToFav = () => {
  const { favorites, removeFromFavorites, addToCart, setFavorites } = useStore();
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const addAllToCart = () => {
    favorites.forEach((item) => {
      addToCart(item);
    });
    toast.success("All products added to Cart!");
    navigate("/addtocart");
  };

  const clearFavorites = () => {
    setFavorites([]);
    toast.info("Wishlist Cleared");
  };

  return (
    <>
      <PageHeader title="Wishlist" subtitle="Shop" curpage="FavoritePage" />

      <div className="p-6 md:p-10 max-w-7xl mx-auto bg-green4">
        {favorites.length === 0 ? (
          <div className="text-center py-20 text-black text-xl">
            Your wishlist is currently empty.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-green4 rounded-lg">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="bg-yellow-400 text-black font-medium">
                  <tr>
                    <th className="p-4 text-left">Product</th>
                    <th className="p-4 text-left">Price</th>
                    <th className="p-4 text-left">Date Added</th>
                    <th className="p-4 text-left">Action</th>
                    <th className="p-4 text-center">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {favorites.map((item, index) => (
                    <tr
                      key={item.id + index}
                      className="border-b border-black hover:bg-blacktransition"
                    >
                      <td className="p-4 flex items-center gap-4 max-w-[300px]">
                        <img
                          src={item.img || item.images?.[0]}
                          alt={item.name}
                          className="w-14 h-14 object-cover border border-green-400 rounded-md flex-shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-bold truncate">{item.name}</p>
                        </div>
                      </td>
                      <td className="p-4 text-black">₹{item.price}</td>
                      <td className="p-4 text-black">
                        {formatDate(item.dateAdded || new Date().toISOString())}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            addToCart(item);
                            toast.success("Product Added to Cart!");
                            navigate("/addtocart");
                          }}
                          className="px-5 py-2 bg-primary text-white text-sm rounded hover:bg-green-700 transition"
                        >
                          Add To Cart
                        </button>
                      </td>
                      <td className="p-4 text-center font-semibold">
                        <button
                          onClick={() => {
                            removeFromFavorites(item.id);
                            toast.info("Product Removed from Wishlist");
                          }}
                          className="text-red-600 hover:text-red-800 text-xl flex-shrink-0"
                          title="Remove"
                          aria-label="Remove item"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-end">
              <button
                onClick={clearFavorites}
                className="text-green-700 font-semibold hover:underline"
              >
                Clear Wishlist
              </button>
              <button
                onClick={addAllToCart}
                className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-green-700 transition"
              >
                <FaShoppingCart className="mr-2" /> Add All to Cart
              </button>
            </div>
            <Services />
          </>
        )}
      </div>
    </>
  );
};

export default AddToFav;
