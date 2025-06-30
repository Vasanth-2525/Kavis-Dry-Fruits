import { useState, useEffect } from "react";
import { FaEdit, FaPrint } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import PageHeader from "../Component/PageHeader";
import Services from "../Home/Services";
import { useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

const Account = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [allOrders, setAllOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    fullname: "",
    contact: "",
    email: "",
    city: "",
    zip: "",
    state: "",
    street: "",
    country: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const location = useLocation();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      const userDoc = await getDoc(doc(db, "users", userId));
      setUserInfo(userDoc.data() || {});
      const ordersSnap = await getDocs(
        collection(db, "users", userId, "orders")
      );
      const orders = ordersSnap.docs.map((doc) => ({
        ...doc.data(),
        showReviewForm: false,
      }));
      setAllOrders(orders.reverse());
      const addressSnap = await getDocs(
        collection(db, "users", userId, "addresses")
      );
      const addrs = addressSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAddresses(addrs);
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (location.state?.goToOrders) setActiveTab("orders");
  }, [location]);

  const saveAddresses = async (list) => {
    if (!userId) return;
    const addressCol = collection(db, "users", userId, "addresses");
    const docsSnap = await getDocs(addressCol);
    await Promise.all(docsSnap.docs.map((docSnap) => deleteDoc(docSnap.ref)));
    await Promise.all(
      list.map((addr, idx) => setDoc(doc(addressCol, `addr-${idx}`), addr))
    );
    setAddresses(list);
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateAddress = () => {
    const updated = { ...newAddress };
    if (!updated.fullname || !updated.contact || !updated.street) return;
    let currentAddresses = Array.isArray(addresses) ? addresses : [];
    if (editingIndex !== null) {
      currentAddresses[editingIndex] = updated;
    } else {
      currentAddresses = [...currentAddresses, updated];
    }
    saveAddresses(currentAddresses);
    setNewAddress({
      fullname: "",
      contact: "",
      email: "",
      city: "",
      zip: "",
      state: "",
      street: "",
      country: "",
    });
    setEditingIndex(null);
  };

  const handleEdit = (idx) => {
    setEditingIndex(idx);
    setNewAddress(addresses[idx]);
  };

  const handleDelete = (idx) => {
    const updated = addresses.filter((_, i) => i !== idx);
    saveAddresses(updated);
    if (editingIndex === idx) setEditingIndex(null);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFields((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordUpdate = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordFields;
    if (
      !currentPassword ||
      !newPassword ||
      newPassword !== confirmPassword ||
      currentPassword !== userInfo.password
    ) {
      toast.error("Please check all fields and ensure passwords match.");
      return;
    }
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { password: newPassword });
      setUserInfo((prev) => ({ ...prev, password: newPassword }));
      setPasswordFields({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password updated successfully!");
    } catch (err) {
      toast.error("Error updating password.");
    }
  };

  const handlePrint = (order, e) => {
    e.stopPropagation();
    const printWindow = window.open("", "", "width=800,height=600");
    const content = `<html><body><h2>Invoice - ${
      order.orderId
    }</h2><p>Date: ${new Date(order.date).toLocaleString()}</p>${order.cartItems
      .map(
        (item) =>
          `<div>${item.name} x${item.qty || item.quantity} - ₹${(
            item.qty * item.price
          ).toFixed(2)}</div>`
      )
      .join("")}<p>Total: ₹${order.totalAmount.toFixed(2)}</p></body></html>`;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const cancelOrder = async (orderId, reason, index) => {
    try {
      const ordersRef = collection(db, "users", userId, "orders");
      const snap = await getDocs(ordersRef);
      const docRef = snap.docs.find((d) => d.data().orderId === orderId);

      if (docRef) {
        const cancelledOrder = {
          ...docRef.data(),
          orderStatus: "Cancelled",
          cancelReason: reason,
          cancelledAt: new Date().toISOString(),
          userId,
        };

        // Step 1: Update order status in user's orders
        await updateDoc(docRef.ref, {
          orderStatus: "Cancelled",
          cancelReason: reason,
        });

        // Step 2: Add the cancelled order to the cancelOrders DB
        await addDoc(collection(db, "cancelOrders"), cancelledOrder);

        // Step 3: Update local state
        const updated = [...allOrders];
        updated[index].orderStatus = "Cancelled";
        updated[index].cancelReason = reason;
        setAllOrders(updated);

        toast.success("Order cancelled and moved to cancelOrders!");
      }
    } catch (err) {
      console.error("Cancel order failed:", err);
      toast.error("Failed to cancel order.");
    }
  };

  const AddReviewForm = ({ onReviewSubmitted, order, userInfo, userId }) => {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmitReview = async () => {
      if (!message.trim()) return toast.error("Review message cannot be empty");
      if (!order?.orderId || !userId) {
        return toast.error("Missing order or user information.");
      }

      setLoading(true);
      try {
        await addDoc(collection(db, "reviews"), {
          name: userInfo?.username || "Anonymous",
          userId: userId,
          orderId: order.orderId,
          message: message.trim(),
          createdAt: serverTimestamp(),
          selected: false, // Default: not shown in public testimonials
        });

        toast.success("Review submitted successfully!");
        setMessage("");
        onReviewSubmitted?.(); // callback to hide review form
      } catch (error) {
        console.error("Error submitting review:", error);
        toast.error("Error submitting review. Try again.");
      }
      setLoading(false);
    };

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={userInfo?.username || "Anonymous"}
            disabled
            className="bg-gray-100 w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Review</label>
          <textarea
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Write your feedback here..."
          />
        </div>
        <button
          onClick={handleSubmitReview}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    );
  };

  const tabs = [
    { key: "personal", label: "Personal Info" },
    { key: "orders", label: "My Orders" },
    { key: "address", label: "Manage Address" },
    { key: "password", label: "Password Manager" },
  ];
  const renderContent = () => {
    const firstName = userInfo.username.split(" ")[0] || "";
    const lastName = userInfo.username.split(" ")[1] || "";
    switch (activeTab) {
      case "personal":
        return (
          <div className="bg-white p-6 rounded-xl shadow border border-green-200 w-full">
            {/* Profile Image and Edit */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center text-4xl font-bold text-green-800">
                  {userInfo.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-600 text-white p-1 rounded-full cursor-pointer">
                  <FaEdit size={14} />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {firstName} {lastName}
                </h3>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-sm font-bold mb-1">First Name *</label>
                <input
                  type="text"
                  defaultValue={firstName}
                  className="border border-green-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-bold mb-1">Last Name *</label>
                <input
                  type="text"
                  defaultValue={lastName}
                  className="border border-green-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="flex flex-col col-span-2">
                <label className="text-sm font-bold mb-1">Email ID *</label>
                <input
                  type="email"
                  defaultValue={userInfo.email}
                  className="border border-green-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="flex flex-col col-span-2">
                <label className="text-sm font-bold mb-1">Password</label>
                <input
                  type="text"
                 defaultValue={userInfo.password}
                  className="border border-green-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="flex flex-col col-span-2">
                <label className="text-sm font-bold mb-1">
                 Phone No *{" "}
                </label>
                <input
                  type="text"
                  placeholder="12345-67890"
                  className="border border-green-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-semibold">
                Update Changes
              </button>
            </div>
          </div>
        );
      case "orders":
        return (
          <div className="bg-white min-h-screen py-10 px-4 rounded-xl">
            {allOrders.length === 0 ? (
              <p className="text-center text-gray-500">Orders Not Found</p>
            ) : (
              allOrders.map((order, index) => (
                <div
                  key={index}
                  className="max-w-4xl mx-auto shadow-md mb-6 rounded-lg overflow-hidden border border-yellow-300"
                >
                  <div
                    className="bg-yellow-400 md:flex-row flex-col flex justify-between items-center px-6 py-4 cursor-pointer"
                    onClick={() =>
                      setSelectedIndex(selectedIndex === index ? null : index)
                    }
                  >
                    <div>
                      <h2 className="text-lg font-bold text-black">
                        Order ID: {order.orderId}
                      </h2>
                      <p className="text-sm text-black">
                        Placed on: {new Date(order.date).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3">
                      <button
                        onClick={(e) => handlePrint(order, e)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded"
                      >
                        <FaPrint /> Invoice
                      </button>

                      {/* Cancel Button & Reason */}
                      {order.orderStatus !== "Cancelled" &&
                        order.orderStatus !== "Delivered" && (
                          <>
                            {!order.showCancelReason ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updated = [...allOrders];
                                  updated[index].showCancelReason = true;
                                  setAllOrders(updated);
                                }}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                              >
                                Cancel Order
                              </button>
                            ) : (
                              <div className="bg-red-50 p-3 border border-red-300 rounded w-full md:w-64">
                                <label className="block text-xs font-semibold mb-1">
                                  Reason for cancellation
                                </label>
                                <textarea
                                  className="w-full border border-red-300 rounded p-1 text-sm mb-2"
                                  placeholder="Enter your reason..."
                                  onChange={(e) => {
                                    const updated = [...allOrders];
                                    updated[index].cancelReason =
                                      e.target.value;
                                    setAllOrders(updated);
                                  }}
                                />
                                <button
                                  className="w-full bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      !order.cancelReason ||
                                      order.cancelReason.trim() === ""
                                    ) {
                                      return toast.error(
                                        "Please enter a cancellation reason."
                                      );
                                    }
                                    cancelOrder(
                                      order.orderId,
                                      order.cancelReason,
                                      index
                                    );
                                  }}
                                >
                                  Confirm Cancel
                                </button>
                              </div>
                            )}
                          </>
                        )}

                      {/* Status Icon */}
                      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium mt-2 md:mt-0">
                        {order.orderStatus === "Placed" && (
                          <>
                            <span className="text-yellow-600">🛒</span>
                            <span className="text-yellow-600">Placed</span>
                          </>
                        )}
                        {order.orderStatus === "Packing" && (
                          <>
                            <span className="text-purple-600">📦</span>
                            <span className="text-purple-600">Packing</span>
                          </>
                        )}
                        {order.orderStatus === "Shipped" && (
                          <>
                            <span className="text-blue-600">🚚</span>
                            <span className="text-blue-600">Shipped</span>
                          </>
                        )}
                        {order.orderStatus === "Out for Delivery" && (
                          <>
                            <span className="text-orange-600">🛵</span>
                            <span className="text-orange-600">
                              Out for Delivery
                            </span>
                          </>
                        )}
                        {order.orderStatus === "Delivered" && (
                          <>
                            <span className="text-green-600">✅</span>
                            <span className="text-green-600">Delivered</span>
                          </>
                        )}
                        {order.orderStatus === "Cancelled" && (
                          <>
                            <span className="text-red-600">❌</span>
                            <span className="text-red-600">Cancelled</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order details */}
                  {selectedIndex === index && (
                    <div className="bg-white px-6 py-4">
                      <div className="divide-y">
                        <h1 className="text-lg font-bold mb-4">
                          Order Status Tracker
                        </h1>
                        <div className="flex items-center justify-between relative mx-4">
                          {[
                            "Placed",
                            "Packed",
                            "Shipped",
                            "Out for Delivery",
                            "Delivered",
                          ].map((step, idx, arr) => {
                            const isActive =
                              [
                                "Placed",
                                "Packed",
                                "Shipped",
                                "Out for Delivery",
                                "Delivered",
                              ].indexOf(order.orderStatus) >= idx;

                            return (
                              <div
                                key={idx}
                                className="flex-1 flex flex-col items-center relative"
                              >
                                <div
                                  className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-sm z-10 ${
                                    isActive ? "bg-green-600" : "bg-gray-300"
                                  }`}
                                >
                                  {idx + 1}
                                </div>
                                <p className="mt-2 text-xs text-center">
                                  {step}
                                </p>
                                {idx !== arr.length - 1 && (
                                  <div
                                    className={`absolute top-4 left-full h-1 w-full transform -translate-x-1/2 ${
                                      isActive ? "bg-green-600" : "bg-gray-300"
                                    }`}
                                  ></div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {order.cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-4"
                          >
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="text-orange-600 font-semibold">
                              ₹{(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Price Summary */}
                      <div className="mt-6 text-sm text-gray-700 space-y-2">
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>₹00.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxes</span>
                          <span>₹00.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coupon Discount</span>
                          <span>₹00.00</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-3 mt-2">
                          <span>Total</span>
                          <span>₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Add Review */}
                      {order.orderStatus === "Delivered" && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded space-y-4">
                          <h3 className="text-lg font-bold text-green-700">
                            Add Review
                          </h3>
                          {!order.showReviewForm ? (
                            <button
                              onClick={() => {
                                const updatedOrders = [...allOrders];
                                updatedOrders[index].showReviewForm = true;
                                setAllOrders(updatedOrders);
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                              Add Review
                            </button>
                          ) : (
                            <AddReviewForm
                              order={order}
                              userInfo={userInfo}
                              userId={userId}
                              onReviewSubmitted={() => {
                                const updatedOrders = [...allOrders];
                                updatedOrders[index].showReviewForm = false;
                                setAllOrders(updatedOrders);
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        );

      case "address":
        return (
          <div className="space-y-4">
            {addresses.length > 0 &&
              addresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded shadow md:flex-row flex-col flex justify-between"
                >
                  <div>
                    <p className="font-semibold">{addr.fullname}</p>
                    <p className="text-sm">
                      {addr.street}, {addr.city}, {addr.state} - {addr.zip},{" "}
                      {addr.country}
                    </p>
                    <p className="text-sm">Phone: {addr.contact}</p>
                    <p className="text-sm">Email: {addr.email}</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => handleEdit(idx)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 underline"
                      onClick={() => handleDelete(idx)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

            <div className="p-4 bg-white rounded shadow">
              <h4 className="text-lg font-semibold mb-2">
                {editingIndex != null ? "Edit Address" : "Add New Address"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {[
                  { name: "fullname", label: "Full Name" },
                  { name: "contact", label: "Phone Number" },
                  { name: "email", label: "Email" },
                  { name: "street", label: "Street" },
                  { name: "city", label: "City" },
                  { name: "zip", label: "ZIP Code" },
                  { name: "state", label: "State" },
                  { name: "country", label: "Country" },
                ].map(({ name, label }) => (
                  <input
                    key={name}
                    name={name}
                    placeholder={label}
                    value={newAddress[name] || ""}
                    onChange={handleNewAddressChange}
                    className="border border-green-400 p-2 rounded"
                    required
                  />
                ))}
              </div>
              <button
                onClick={handleAddOrUpdateAddress}
                className="mt-3 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                {editingIndex != null ? "Update Address" : "Add Address"}
              </button>
            </div>
          </div>
        );

      case "password":
        return (
          <div className="bg-[#F3F9EC] p-6 rounded-xl space-y-4">
            <div>
              <label className="block font-bold text-lg mb-2">Password *</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordFields.currentPassword}
                onChange={handlePasswordChange}
                className="bg-white w-full border border-green-600 rounded-md px-4 py-2"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block font-bold text-lg mb-2">
                New Password *
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordFields.newPassword}
                onChange={handlePasswordChange}
                className="bg-white w-full border border-green-600 rounded-md px-4 py-2"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block font-bold text-lg mb-2">
                Confirm New Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordFields.confirmPassword}
                onChange={handlePasswordChange}
                className="bg-white w-full border border-green-600 rounded-md px-4 py-2"
                placeholder="Confirm new password"
              />
            </div>

            <div>
              <button
                onClick={handlePasswordUpdate}
                className="bg-green1 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-md w-full md:w-1/2"
              >
                Update Password
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-white rounded shadow">Content here...</div>
        );
    }
  };

  return (
    <>
      <PageHeader
        title="Account"
        curpage={tabs.find((t) => t.key === activeTab)?.label || "Account"}
      />
      <div className="flex flex-col lg:flex-row min-h-screen py-5 px-4 lg:py-10 lg:px-20 gap-4">
        <div className="w-full lg:w-1/3 bg-white p-4 rounded-xl shadow">
          <div className="space-y-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left px-4 py-3 shadow-md font-semibold rounded ${
                  activeTab === tab.key ? "bg-yellow-400" : "bg-white"
                } hover:bg-yellow-100 transition`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => {
                if (window.confirm("Logout?")) {
                  localStorage.removeItem("isAuthenticated");
                  localStorage.removeItem("username");
                  window.location.href = "/";
                }
              }}
              className="w-full mt-4 bg-primary text-white py-3 rounded-md hover:bg-green-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="w-full lg:w-2/3 bg-white p-4 rounded-xl shadow">
          {renderContent()}
        </div>
      </div>
      <Services />
    </>
  );
};
export default Account;
