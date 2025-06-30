import { useState, useEffect } from "react";
import { useStore } from "../Context/StoreContext";
import PageHeader from "../Component/PageHeader";
import { useNavigate, useLocation } from "react-router-dom";
import emailjs from "@emailjs/browser";
import {
  collection,
  addDoc,
  getDocs,
  runTransaction,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-hot-toast";

const Checkout = () => {
  const { cartItems, clearCart, user } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const checkoutProduct = location.state?.checkoutProduct || null;

  const [itemsToCheckout, setItemsToCheckout] = useState(
    checkoutProduct ? [checkoutProduct] : cartItems
  );

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    contact: "",
    zip: "",
    city: "",
    state: "",
    street: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState("Online Payment");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const generateOrderId = async () => {
    const counterRef = doc(db, "metadata", "orderCounter");
    return await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(counterRef);
      let orderNumber = 1;
      if (snap.exists()) {
        orderNumber = (snap.data().lastOrderNumber || 0) + 1;
      }
      transaction.set(
        counterRef,
        { lastOrderNumber: orderNumber },
        { merge: true }
      );
      return `KDF00${String(orderNumber).padStart(3, "0")}`;
    });
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      if (user) {
        const snap = await getDocs(
          collection(db, "users", user.uid, "addresses")
        );
        setSavedAddresses(snap.docs.map((doc) => doc.data()));
      }
    };
    fetchAddresses();
  }, [user]);

  const calculateItemTotal = (item) => {
    const price = parseFloat(item?.price || 0);
    const qty = parseInt(item?.qty || item?.quantity || 1);
    return price * qty;
  };

  const totalAmount = itemsToCheckout.reduce(
    (total, item) => total + calculateItemTotal(item),
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const autofillAddress = (addr) => {
    setForm({ ...addr });
    toast.success("Address autofilled!");
  };

  const isDuplicateAddress = (newAddr) =>
    savedAddresses.some((addr) =>
      Object.keys(newAddr).every((key) => addr[key] === newAddr[key])
    );

  const saveAddressAfterPayment = async () => {
    if (!user || isDuplicateAddress(form)) return;
    try {
      await addDoc(collection(db, "users", user.uid, "addresses"), form);
      toast.success("Address saved!");
    } catch (err) {
      console.error("Save address error:", err);
      toast.error("Failed to save address.");
    }
  };

  const sendInvoiceEmail = (orderData) => {
    const templateParams = {
      to_email: orderData.email,
      to_name: orderData.fullname,
      order_id: orderData.orderId,
      total_amount: orderData.totalAmount.toFixed(2),
      items: orderData.cartItems
        .map(
          (item) =>
            `${item.name} (Qty: ${item.qty || item.quantity}) - ₹${(
              (item.qty || item.quantity) * item.price
            ).toFixed(2)}`
        )
        .join("\n"),
      address: `${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}, ${orderData.shippingAddress.zip}, ${orderData.shippingAddress.country}`,
    };

    emailjs
      .send(
        "service_a6grxsl",
        "template_cmt9s1t",
        templateParams,
        "isAR5Sy8Y4PABFBmC"
      )
      .then(() => console.log("Invoice email sent"))
      .catch((error) => console.error("Email error:", error));
  };

  const placeOrder = async (paymentId = "") => {
    const orderId = await generateOrderId();
    const orderData = {
      orderId,
      userId: user.uid,
      cartItems: itemsToCheckout,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "Online Payment" ? "Paid" : "Pending",
      shippingAddress: form,
      date: new Date().toISOString(),
      orderStatus: "Placed",
      paymentId,
      email: form.email,
      fullname: form.fullname,
    };

    await addDoc(collection(db, "users", user.uid, "orders"), orderData);

    for (const item of itemsToCheckout) {
      const qty = parseInt(item.qty || item.quantity || 1);

      const productRef = doc(db, "products", item.id);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const productData = productSnap.data();
        let updatedStock = 0;

        if (item.category === "Combo") {
          updatedStock = Math.max((productData.stock || 0) - qty, 0);
        } else {
          const weightInGrams =
            parseInt(item.selectedWeight?.replace("g", "")) || 0;
          updatedStock = Math.max(
            (productData.stock || 0) - qty * weightInGrams,
            0
          );
        }

        await updateDoc(productRef, { stock: updatedStock });
      }
    }

    sendInvoiceEmail(orderData);
    await saveAddressAfterPayment();
    if (!checkoutProduct) clearCart();
    toast.success("Order placed successfully!");
    navigate("/account", { state: { goToOrders: true } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please log in to place an order.");
    if (itemsToCheckout.length === 0) return toast.warn("Your cart is empty!");

    setIsPlacingOrder(true);

    try {
      if (paymentMethod === "Online Payment") {
        const options = {
          key: "rzp_test_yTS52rDf4bQQKY",
          amount: totalAmount * 100,
          currency: "INR",
          name: "Kavi DryFruits",
          description: "Order Payment",
          handler: async (response) => {
            await placeOrder(response.razorpay_payment_id);
            setIsPlacingOrder(false);
          },
          prefill: {
            name: form.fullname,
            email: form.email,
            contact: form.contact,
          },
          notes: {
            address: `${form.street}, ${form.city}, ${form.state}, ${form.zip}`,
          },
          theme: { color: "#388e3c" },
        };

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      } else {
        await placeOrder();
        setIsPlacingOrder(false);
      }
    } catch (err) {
      console.error("Order error", err);
      toast.error("Something went wrong. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu & Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttarakhand",
    "Uttar Pradesh",
    "West Bengal",
    "Andaman & Nicobar",
    "Chandigarh",
    "Dadra & Nagar Haveli",
    "Daman & Diu",
    "Lakshadweep",
    "Puducherry",
  ];

  return (
    <>
      <PageHeader title="Check Out Page" subtitle="shop" curpage="Check Out Page" />
      <div className="bg-Beach min-h-screen py-10 px-4 sm:px-10 grid md:grid-cols-3 gap-8">
        <form
          onSubmit={handleSubmit}
          className="md:col-span-2 space-y-6 bg-white p-6 rounded-md border border-green-300 shadow"
        >
          <h2 className="text-2xl font-bold mb-2">Billing Details</h2>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Saved Addresses</h3>
            {savedAddresses.length > 0 ? (
              savedAddresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="border p-3 mb-2 rounded cursor-pointer hover:bg-green-50"
                  onClick={() => autofillAddress(addr)}
                >
                  <p className="font-semibold">{addr.fullname}</p>
                  <p>{`${addr.street}, ${addr.city}, ${addr.state}, ${addr.zip}, ${addr.country}`}</p>
                  <p>{addr.contact}</p>
                  <p>{addr.email}</p>
                </div>
              ))
            ) : (
              <p>No saved addresses found.</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {["fullname", "email", "contact", "zip", "city", "street"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)} *
                </label>
                <input
                  type="text"
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="w-full border bg-white border-green-400 rounded-md px-3 py-2"
                  required
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold mb-1">State *</label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full border bg-white border-green-400 rounded-md px-3 py-2"
                required
              >
                <option value="">Select State</option>
                {indianStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Country *</label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full border bg-white border-green-400 rounded-md px-3 py-2"
                required
              >
                <option value="India">India</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Payment Method *</label>
            <div className="flex gap-4">
              {["Online Payment", "Cash on Delivery"].map((method) => (
                <label key={method}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-1"
                  />
                  {method}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={`w-full px-6 py-2 rounded mt-4 transition text-white font-semibold ${
              isPlacingOrder ? "bg-gray-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
            }`}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 018 8h-4l3.5 3.5L20 12h-4a8 8 0 01-8 8v-4l-3.5 3.5L4 12z"
                  />
                </svg>
                Processing...
              </div>
            ) : (
              `Place Order (₹${totalAmount.toFixed(2)})`
            )}
          </button>
        </form>

        <div className="border border-green-500 rounded-xl p-6 bg-white shadow-sm h-fit md:sticky top-4">
          <h3 className="text-xl font-bold mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm font-medium">
            <div className="flex justify-between">
              <span>Items</span>
              <span>{itemsToCheckout.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Sub Total</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₹00.00</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes</span>
              <span>₹00.00</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Coupon Discount</span>
              <span>-₹00.00</span>
            </div>
            <hr className="border-dashed border-green-400 my-4" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
