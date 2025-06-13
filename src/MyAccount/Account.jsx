import { useState, useEffect } from "react";
import { FaEdit, FaPrint } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import PageHeader from "../Component/PageHeader";
import Services from "../Home/Services";
import { useLocation } from "react-router-dom";

const Account = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [allOrders, setAllOrders] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
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
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const username = localStorage.getItem("username");
  const location = useLocation();

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("RegisterUser")) || [];
    const found = users.find((u) => u.username === username);
    if (found) setUserInfo(found);

    const storedOrders =
      JSON.parse(localStorage.getItem(`${username}_orders`)) || [];
    setAllOrders(storedOrders.reverse());

    const addrArr =
      JSON.parse(localStorage.getItem(`${username}_address`)) || [];
    setAddresses(addrArr);
  }, [username]);

  useEffect(() => {
    if (location.state?.goToOrders) {
      setActiveTab("orders");
    }
  }, [location]);

  const saveAddresses = (list) => {
    setAddresses(list);
    localStorage.setItem(`${username}_address`, JSON.stringify(list));
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

    setAddresses(currentAddresses);
    localStorage.setItem(
      `${username}_address`,
      JSON.stringify(currentAddresses)
    );
    setNewAddress({});
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

  const handlePasswordUpdate = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordFields;
    if (
      !currentPassword ||
      !newPassword ||
      newPassword !== confirmPassword ||
      currentPassword !== userInfo.password
    ) {
      return alert("Check all fields and confirm password entries.");
    }
    const users = JSON.parse(localStorage.getItem("RegisterUser")) || [];
    const updated = users.map((u) =>
      u.username === username ? { ...u, password: newPassword } : u
    );
    localStorage.setItem("RegisterUser", JSON.stringify(updated));
    setUserInfo((prev) => ({ ...prev, password: newPassword }));
    setPasswordFields({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    alert("Password updated!");
  };

  const removerOrder = (productId) => {
    const updatedOrders = allOrders.filter(
      (item) => item.orderId !== productId
    );
    setAllOrders(updatedOrders);
    localStorage.setItem(`${username}_orders`, JSON.stringify(updatedOrders));
  };

  const handlePrint = (order, e) => {
    e.stopPropagation();
    const printWindow = window.open("", "", "width=800,height=600");
    const content = `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Kavis Dry Fruits - Invoice</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      color: #333;
    }
    h2 {
      text-align: center;
      color: #222;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    hr {
      border: 0;
      border-top: 1px solid #ddd;
      margin: 15px 0;
    }
    .total {
      text-align: right;
      font-weight: bold;
      font-size: 16px;
      margin-top: 10px;
    }
    .thank-you {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #555;
    }
    footer {
      position: absolute;
      bottom: 10px;
      left: 0;
      width: 100%;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #ccc;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <h2>Invoice - Order ID: ${order.orderId}</h2>
  <p><strong>Date:</strong> ${order.date}</p>
  <hr />
  ${order.cartItems
    .map(
      (item) => `
      <div class="item-row">
        <span>${item.name} (x${item.qty})</span>
        <span>₹${(item.qty * item.price).toFixed(2)}</span>
      </div>`
    )
    .join("")}
  <hr />
  <div class="total">Total: ₹${order.totalAmount.toFixed(2)}</div>

  <p class="thank-you">Thank You For Your Order!</p>

  <footer>Printed on: ${new Date().toLocaleString()}</footer>
</body>
</html>`;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
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
                <label className="text-sm font-bold mb-1">Phone No *</label>
                <input
                  type="text"
                  placeholder="12345-67890"
                  className="border border-green-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="flex flex-col col-span-2">
                <label className="text-sm font-bold mb-1">
                  Alternative Phone No{" "}
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

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handlePrint(order, e)}
                        className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white text-sm px-6 py-3 rounded"
                      >
                        <FaPrint /> Invoice
                      </button>

                      {/* ✅ Fix applied here */}
                      <button
                        onClick={() => removerOrder(order.orderId)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-3.5 rounded"
                      >
                        <RiDeleteBinLine />
                      </button>
                    </div>
                  </div>

                  {/* Order Details (Only visible when selected) */}
                  {selectedIndex === index && (
                    <div className="bg-white px-6 py-4">
                      <div className="divide-y">
                        {order.cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-4"
                          >
                            <div className="flex items-center">
                              <img
                                src={item.img || "/placeholder.png"}
                                alt={item.name}
                                className="w-14 h-14 object-cover rounded mr-4"
                              />
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  Qty: {item.qty}
                                </p>
                              </div>
                            </div>
                            <p className="text-orange-600 font-semibold">
                              ₹{(item.qty * item.price).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Totals Section */}
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
