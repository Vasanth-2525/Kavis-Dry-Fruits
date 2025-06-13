import { useState, useEffect } from "react";
import { useStore } from "../Context/StoreContext";
import PageHeader from "../Component/PageHeader";
import { useNavigate, useLocation } from "react-router-dom";
import emailjs from "emailjs-com"; 

const Checkout = () => {
  const { cartItems: storeCartItems, setCartItems } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username") || "guest";

  const checkoutProduct = location.state?.checkoutProduct || null;

  const [cartItems, setLocalCartItems] = useState(
    checkoutProduct ? [checkoutProduct] : storeCartItems
  );

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    contact: "",
    zip: "",
    city: "",
    state: "",
    street: "",
    country: "",
    delivery: "same",
    billing: {
      fullname: "",
      email: "",
      contact: "",
      zip: "",
      city: "",
      state: "",
      street: "",
      country: "",
    },
  });

  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    const stored = JSON.parse(
      localStorage.getItem(`${username}_address`) || "[]"
    );
    setSavedAddresses(Array.isArray(stored) ? stored : []);
  }, [username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("billing.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        billing: { ...prev.billing, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectSavedAddress = (address) => {
    if (!address || !address.fullname) return;
    setForm((prev) => ({
      ...prev,
      ...address,
      delivery: "same",
      billing: {
        fullname: "",
        email: "",
        contact: "",
        zip: "",
        city: "",
        state: "",
        street: "",
        country: "",
      },
    }));
  };

  const saveNewAddress = (address) => {
    if (!address.fullname || !address.contact || !address.street) return;
    const storedRaw = localStorage.getItem(`${username}_address`);
    let stored = [];
    try {
      stored = Array.isArray(JSON.parse(storedRaw))
        ? JSON.parse(storedRaw)
        : [];
    } catch (err) {
      stored = [];
    }

    const isDuplicate = stored.some(
      (a) =>
        a.fullname === address.fullname &&
        a.email === address.email &&
        a.contact === address.contact &&
        a.street === address.street
    );

    if (!isDuplicate) {
      const updated = [...stored, address];
      localStorage.setItem(`${username}_address`, JSON.stringify(updated));
      setSavedAddresses(updated);
    }
  };

  const calculateItemTotal = (item) => {
    const price = parseFloat(item?.price || item?.Offer_price || 0);
    const qty = parseInt(item?.qty) || 1;
    return price * qty;
  };

  const calculateCartTotal = () =>
    cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);

  const totalAmount = calculateCartTotal();

  // -------- EMAILJS FUNCTION ---------
  const sendInvoiceEmail = (orderData) => {
    const templateParams = {
      to_email: orderData.email,
      to_name: orderData.fullname,
      order_id: orderData.orderId,
      total_amount: orderData.totalAmount.toFixed(2),
      items: orderData.cartItems
        .map(
          (item) =>
            `${item.name} (Qty: ${item.qty}) - ₹${(
              item.qty * item.price
            ).toFixed(2)}`
        )
        .join("\n"),
      address: `${orderData.street}, ${orderData.city}, ${orderData.state}, ${orderData.zip}, ${orderData.country}`,
    };

    emailjs
      .send(
        "service_a6grxsl", 
        "template_cmt9s1t", 
        templateParams,
        "isAR5Sy8Y4PABFBmC" 
      )
      .then(
        (result) => {
          console.log("Invoice Email Sent!", result.text);
        },
        (error) => {
          console.error("Invoice Email Failed...", error.text);
        }
      );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const orderData = {
      ...form,
      cartItems,
      totalAmount,
      orderId: "ODR" + Date.now(),
      date: new Date().toISOString(),
    };

    const ordersKey = `${username}_orders`;
    const existingOrders = JSON.parse(localStorage.getItem(ordersKey)) || [];
    existingOrders.push(orderData);
    localStorage.setItem(ordersKey, JSON.stringify(existingOrders));

    const addressToSave = form.delivery === "different" ? form.billing : form;
    saveNewAddress(addressToSave);

    const options = {
      key: "rzp_test_yTS52rDf4bQQKY",
      amount: totalAmount * 100,
      currency: "INR",
      name: "STARTUP_PROJECTS",
      description: "Order Payment",
      handler: function () {
        setCartItems([]);
        sendInvoiceEmail(orderData); 
        navigate("/account", { state: { goToOrders: true } });
      },
      prefill: {
        name: form.fullname,
        email: form.email,
        contact: form.contact,
      },
      notes: {
        address:
          form.delivery === "different"
            ? `${form.billing.street}, ${form.billing.city}, ${form.billing.state}, ${form.billing.zip}`
            : `${form.street}, ${form.city}, ${form.state}, ${form.zip}`,
      },
      theme: { color: "#388e3c" },
    };

    if (window.Razorpay) {
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } else {
      alert("Razorpay SDK failed to load.");
    }
  };

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
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
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  return (
    <>
      <PageHeader
        title="Check Out Page"
        subtitle="shop"
        curpage="Check Out Page"
      />
      <div className="bg-Beach min-h-screen py-10 px-4 sm:px-10 grid md:grid-cols-3 gap-8">
        <form
          onSubmit={handleSubmit}
          className="md:col-span-2 space-y-6 bg-white p-6 rounded-md border border-green-300 shadow"
        >
          <h2 className="text-2xl font-bold mb-2">Billing Details</h2>

          {savedAddresses.length > 0 && (
            <div className="bg-gray-100 p-4 border border-green-400 rounded-md">
              <h3 className="font-bold text-lg mb-3">Saved Addresses</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {savedAddresses.map((addr, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectSavedAddress(addr)}
                    className="p-3 border border-gray-300 rounded hover:border-green-500 cursor-pointer bg-white"
                  >
                    <p className="font-semibold">{addr.fullname}</p>
                    <p className="text-sm">
                      {addr.street}, {addr.city}, {addr.state}, {addr.zip},{" "}
                      {addr.country}
                    </p>
                    <p className="text-sm">Phone: {addr.contact}</p>
                    <p className="text-sm">Email: {addr.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {["fullname", "email", "contact", "zip", "city"].map((field) => (
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
              <label className="block text-sm font-semibold mb-1">
                State *
              </label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full border bg-white border-green-400 rounded-md px-3 py-2"
                required
              >
                <option value="">Select State</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Country *
              </label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full border bg-white border-green-400 rounded-md px-3 py-2"
                required
              >
                <option value="">Select Country</option>
                <option value="India">India</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-1">
                Street Address *
              </label>
              <input
                type="text"
                name="street"
                value={form.street}
                onChange={handleChange}
                className="w-full border bg-white border-green-400 rounded-md px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Delivery Address *
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              {[
                { label: "Same as shipping address", value: "same" },
                { label: "Use different billing address", value: "different" },
              ].map(({ label, value }) => (
                <label
                  key={value}
                  className="flex items-center gap-2 px-3 py-2 border bg-white border-green-400 rounded-md"
                >
                  <input
                    type="radio"
                    name="delivery"
                    value={value}
                    checked={form.delivery === value}
                    onChange={handleChange}
                    className="accent-green-600"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {form.delivery === "different" && (
            <div className="bg-gray-50 p-4 rounded-md border border-green-400 grid sm:grid-cols-2 gap-4">
              <h4 className="col-span-2 font-semibold text-lg mb-2">
                Billing Address
              </h4>

              {["fullname", "email", "contact", "zip", "city"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-semibold mb-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)} *
                  </label>
                  <input
                    type="text"
                    name={`billing.${field}`}
                    value={form.billing[field]}
                    onChange={handleChange}
                    className="w-full border bg-white border-green-400 rounded-md px-3 py-2"
                    required
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold mb-1">
                  State *
                </label>
                <select
                  name="billing.state"
                  value={form.billing.state}
                  onChange={handleChange}
                  className="w-full border bg-white border-green-400 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select State</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Country *
                </label>
                <select
                  name="billing.country"
                  value={form.billing.country}
                  onChange={handleChange}
                  className="w-full border bg-white border-green-400 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select Country</option>
                  <option value="India">India</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="billing.street"
                  value={form.billing.street}
                  onChange={handleChange}
                  className="w-full border bg-white border-green-400 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-4 bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700"
          >
            Place Order
          </button>
        </form>

        <div className="border border-green-500 rounded-xl p-6 bg-white shadow-sm h-fit">
          <h3 className="text-xl font-bold mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm font-medium">
            <div className="flex justify-between">
              <span>Items</span> <span>{cartItems.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Sub Total</span> <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span> <span>₹00.00</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes</span> <span>₹00.00</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Coupon Discount</span> <span>-₹00.00</span>
            </div>
            <hr className="border-dashed border-green-400 my-4" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span> <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
