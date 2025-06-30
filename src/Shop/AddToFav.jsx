import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import PageHeader from "../Component/PageHeader";
import { useStore } from "../Context/StoreContext";
import Services from "../Home/Services";
import { toast } from "react-hot-toast";


const AddToFav = () => {
  const {
    favItems,
    removeFavItem,
    addToCart,
    setFavItems,
  } = useStore();

  const navigate = useNavigate();

  const addAllToCart = async () => {
    for (const item of favItems) {
      const activeWeight = item.selectedWeight || item.weights?.[0] || "100g";
      const price = item.prices?.[activeWeight] || item.price || 0;

      await addToCart({
        id: item.productId,
        name: item.name,
        price,
        image: item.imageUrl,
        selectedWeight: activeWeight,
        qty: 1,
        weights: item.weights,
        prices: item.prices,
      });
    }
    toast.success("All wishlist products added to cart!");
    navigate("/addtocart");
  };

  const clearFavorites = async () => {
    for (const item of favItems) {
      await removeFavItem(item.productId);
    }
    setFavItems([]);
    toast.info("Wishlist cleared!");
  };

  return (
    <>
      <PageHeader title="Wishlist" subtitle="Shop" curpage="FavoritePage" />

      <div className="p-6 md:p-10 max-w-7xl mx-auto bg-green-100 rounded">
        {favItems.length === 0 ? (
          <div className="text-center py-20 text-black text-xl">
            Your wishlist is currently empty.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm bg-green-50 border rounded-lg">
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
                  {favItems.map((item, index) => {
                    const activeWeight = item.selectedWeight || item.weights?.[0] || "100g";
                    const price = item.prices?.[activeWeight] || item.price || 0;

                    return (
                      <tr
                        key={item.productId || index}
                        className="border-b border-black hover:bg-gray-100 transition"
                      >
                        <td className="p-4 flex items-center gap-4 max-w-[300px]">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-14 h-14 object-cover border border-green-400 rounded-md flex-shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-bold truncate">{item.name}</p>
                          </div>
                        </td>
                        <td className="p-4 font-semibold">₹{price}</td>
                        <td className="p-4">{new Date().toLocaleDateString("en-GB", {
                          day: "numeric", month: "long", year: "numeric"
                        })}</td>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              addToCart({
                                id: item.productId,
                                name: item.name,
                                price,
                                image: item.imageUrl,
                                selectedWeight: activeWeight,
                                qty: 1,
                                weights: item.weights,
                                prices: item.prices,
                              });
                              navigate("/addtocart");
                            }}
                            className="px-5 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                          >
                            Add To Cart
                          </button>
                        </td>
                        <td className="p-4 text-center font-semibold">
                          <button
                            onClick={() => removeFavItem(item.productId)}
                            className="text-red-600 hover:text-red-800 text-xl flex-shrink-0"
                            title="Remove"
                            aria-label="Remove item"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Wishlist Bottom Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-end">
              <button
                onClick={clearFavorites}
                className="text-green-700 font-semibold hover:underline"
              >
                Clear Wishlist
              </button>
              <button
                onClick={addAllToCart}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition flex items-center gap-2"
              >
                <FaShoppingCart /> Add All to Cart
              </button>
            </div>
          </>
        )}
      </div>

      <Services />
    </>
  );
};

export default AddToFav;
