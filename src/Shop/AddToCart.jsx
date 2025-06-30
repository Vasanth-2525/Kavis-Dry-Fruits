import PageHeader from "../Component/PageHeader";
import { useStore } from "../Context/StoreContext";
import bgImage from "/images/empty-cart.png";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

const AddToCart = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
    updateWeight,
  } = useStore();

  const navigate = useNavigate();

  const calculateItemTotal = (item) => {
    const price = parseFloat(item?.price || 0);
    const qty = parseInt(item?.quantity || 1);
    return price * qty;
  };

  const calculateCartTotal = () =>
    cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);

  const handleWeightChange = (item, weight) => {
    const price = item.prices?.[weight] || 0;
    updateWeight(item.productId, weight, price);
  };

  return (
    <>
      <PageHeader title="Shopping Cart" subtitle="shop" curpage="Cart Page" />

      <div className="bg-green4 min-h-[70vh] p-4 md:p-10 max-w-7xl mx-auto space-y-8">
        {cartItems.length === 0 ? (
          <div
            className="text-center text-gray-600 text-xl flex flex-col items-center justify-center"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "30%",
              minHeight: "60vh",
            }}
          >
            <p>Your cart is currently empty.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_320px] gap-3">
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead className="bg-yellow-400 text-black text-sm md:text-base">
                  <tr>
                    <th className="p-4 font-bold rounded-tl-lg">Product</th>
                    <th className="p-4 font-bold">Weight</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold">Quantity</th>
                    <th className="p-4 font-bold">Subtotal</th>
                    <th className="p-4 font-bold rounded-tr-lg">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    const imageUrl = Array.isArray(item.imageUrl)
                      ? item.imageUrl[0]
                      : item.imageUrl || "";

                    const subtotal = calculateItemTotal(item);

                    return (
                      <tr key={item.productId} className="border-b bg-green4">
                        <td className="p-4 flex items-center gap-4 max-w-[300px]">
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-14 h-14 object-cover border border-green-400 rounded-md flex-shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-bold truncate">{item.name}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-medium">
                          {item.category === "Combo" ? (
                            <span className="font-semibold italic text-primary text-xl">COMBO</span>
                          ) : (
                            <select
                              value={item.selectedWeight}
                              onChange={(e) =>
                                handleWeightChange(item, e.target.value)
                              }
                              className="border p-1 rounded"
                            >
                              {item.weights?.map((w) => (
                                <option key={w} value={w}>
                                  {w}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="p-4 font-semibold whitespace-nowrap">
                          ₹{parseFloat(item?.price || 0).toFixed(2)}
                        </td>
                        <td className="p-4">
                          <div className="flex border rounded overflow-hidden w-max">
                            <button
                              onClick={() => decreaseQuantity(item)}
                              className="px-3 py-1 text-lg hover:bg-green-200 transition"
                              aria-label="Decrease quantity"
                            >
                              –
                            </button>
                            <span className="px-4 py-1 border-l border-r font-medium select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => increaseQuantity(item)}
                              className="px-3 py-1 text-lg hover:bg-green-200 transition"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-4 font-semibold whitespace-nowrap">
                          ₹{subtotal.toFixed(2)}
                        </td>
                        <td className="p-4 text-center font-semibold">
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-600 hover:text-red-800 text-xl"
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
              <div className="mt-4 text-right">
                <button
                  onClick={clearCart}
                  className="text-green-700 font-semibold hover:underline"
                >
                  Clear Shopping Cart
                </button>
              </div>
            </div>

            <div className="bg-white border border-green-300 rounded-xl p-6 h-fit">
              <h2 className="text-xl font-bold mb-4 text-green-700">Order Summary</h2>
              <div className="flex justify-between mb-2 text-sm">
                <span>Items</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span>Sub Total</span>
                <span>₹{calculateCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span>Shipping</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span>Taxes</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span>Coupon Discount</span>
                <span>-₹0.00</span>
              </div>
              <hr className="my-2 border-dashed border-green-500" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{calculateCartTotal().toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="mt-6 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AddToCart;