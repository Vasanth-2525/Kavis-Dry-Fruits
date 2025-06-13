import PageHeader from "../Component/PageHeader";
import { useStore } from "../Context/StoreContext";
import bgImage from "/images/empty-cart.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const AddToCart = () => {
  const { cartItems, setCartItems } = useStore();
  const navigate = useNavigate();
  const [product, setProduct] = useState([]);
  useEffect(() => {
    fetch("/DryFruitsProductData.json")
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
      })
      .catch((err) => {
        console.error("Error loading ProductData.json", err);
      });
  }, []);

  const calculateItemTotal = (item) => {
    const price = parseFloat(item?.price) || 0;
    const qty = parseInt(item?.qty) || 1;
    return price * qty;
  };

  const calculateCartTotal = () =>
    cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);

  const handleIncrease = (item) => {
    const updatedCart = cartItems.map((cartItem) =>
      cartItem.id === item.id
        ? { ...cartItem, qty: cartItem.qty + 1 }
        : cartItem
    );
    setCartItems(updatedCart);
  };

  const handleDecrease = (item) => {
    const updatedCart = cartItems.map((cartItem) =>
      cartItem.id === item.id && cartItem.qty > 1
        ? { ...cartItem, qty: cartItem.qty - 1 }
        : cartItem
    );
    setCartItems(updatedCart);
  };

  const handleRemoveItem = (item) => {
    setCartItems(cartItems.filter((cartItem) => cartItem.id !== item.id));
  };

  const weight = product.filter((item) => item.id === cartItems.id);

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
            <div className="overflow-x-auto rounded-xl ">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead className="bg-yellow-400 text-black text-sm md:text-base">
                  <tr>
                    <th className="p-4 font-bold rounded-tl-lg">Product</th>
                    <th className="p-4 font-bold">Kg</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold">Quantity</th>
                    <th className="p-4 font-bold ">Subtotal</th>
                    <th className="p-4 font-bold rounded-tr-lg">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id} className="border-b bg-green4">
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
                      <td className="p-4">
                        {item.type === "Combo" ? (
                          <p className="text-sm font-medium">
                            {item.selectedWeight}
                          </p>
                        ) : (
                          <select
                            value={item.selectedWeight}
                            onChange={(e) => {
                              const newWeight = e.target.value;
                              const newPrice = item.prices?.[newWeight] || 0;
                              const updatedCart = cartItems.map((cartItem) =>
                                cartItem.id === item.id
                                  ? {
                                      ...cartItem,
                                      selectedWeight: newWeight,
                                      price: newPrice,
                                    }
                                  : cartItem
                              );
                              setCartItems(updatedCart);
                            }}
                            className="border border-gray-300 rounded px-2 py-1 text-sm bg-green4"
                          >
                            {item.weights?.map((weightOption) => (
                              <option key={weightOption} value={weightOption}>
                                {weightOption}
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
                            onClick={() => handleDecrease(item)}
                            className="px-3 py-1 text-lg hover:bg-green-200 transition"
                            aria-label="Decrease quantity"
                          >
                            –
                          </button>
                          <span className="px-4 py-1 border-l border-r font-medium select-none">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => handleIncrease(item)}
                            className="px-3 py-1 text-lg hover:bg-green-200 transition"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-4 font-semibold whitespace-nowrap">
                        ₹
                        {isNaN(calculateItemTotal(item))
                          ? "0.00"
                          : calculateItemTotal(item).toFixed(2)}
                      </td>
                      <td className="p-4 font-semibold whitespace-nowrap text-center">
                        <button
                          onClick={() => handleRemoveItem(item)}
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
              <div className="text-right mt-4">
                <button
                  onClick={() => setCartItems([])}
                  className="text-green-700 font-semibold hover:underline"
                >
                  Clear Shopping Cart
                </button>
              </div>
            </div>

            <aside className="bg-white border border-green-300 rounded-xl p-6 shadow-md">
              <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
              <div className="divide-y divide-dashed divide-green-300 text-sm">
                <div className="flex justify-between py-3">
                  <span>Items</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span>Sub Total</span>
                  <span>₹{calculateCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span>Shipping</span>
                  <span>₹00.00</span>
                </div>
                <div className="flex justify-between py-3">
                  <span>Taxes</span>
                  <span>₹00.00</span>
                </div>
                <div className="flex justify-between py-3">
                  <span>Coupon Discount</span>
                  <span>-₹00.00</span>
                </div>
                <div className="flex justify-between pt-6 font-semibold border-t border-dashed border-green-400">
                  <span>Total</span>
                  <span>₹{calculateCartTotal().toFixed(2)}</span>
                </div>
              </div>
              <button
                className="w-full mt-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </>
  );
};

export default AddToCart;
