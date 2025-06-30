// src/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import Orders from "./Orders";
import Products from "./Products";
import Users from "./Users";
import Delivery from "./Delivery";
import CancelOrders from "./cancelOrders";
import StockDetails from "./StockDetails";
import AddDealer from "./AddDealer";
import Reviews from "./Reviews";
import Invoice from "./Invoice";
import Billing from "./Billing";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeftLong, FaBars } from "react-icons/fa6";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { toast } from "react-hot-toast";

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collectionCounts, setCollectionCounts] = useState({});
  const [orders, setOrders] = useState([]);
  const [adminName, setAdminName] = useState("Administrator");
  const [liveStocks, setLiveStocks] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const navigate = useNavigate();

  const SideBarmenu = [
    { label: "dashboard" },
    { label: "users", collection: "users" },
    { label: "products List", collection: "products" },
    { label: "orders", collection: "orders" },
    { label: "order Details", collection: "delivery" },
    { label: "cancel Orders", collection: "cancelOrders" },
    { label: "stock Details", collection: "products" },
    { label: "dealer", collection: "dealers" },
    { label: "reviews", collection: "reviews" },
    { label: "invoice", collection: "invoices" },
    { label: "billing" },
  ];

  useEffect(() => {
    fetchAdminName();

    const unsub = [];

    // Realtime listeners
    SideBarmenu.forEach((item) => {
      if (item.collection) {
        const unsubListener = onSnapshot(collection(db, item.collection), (snapshot) => {
          setCollectionCounts((prev) => ({ ...prev, [item.label]: snapshot.size }));
        });
        unsub.push(unsubListener);
      }
    });

    const unsubOrders = onSnapshot(collection(db, "users"), async (userSnap) => {
      let orderList = [];
      for (const userDoc of userSnap.docs) {
        const uid = userDoc.id;
        const orderCol = collection(db, "users", uid, "orders");
        onSnapshot(orderCol, (orderSnap) => {
          orderSnap.forEach((doc) => {
            const data = doc.data();
            if (data.orderStatus !== "Delivered" && data.orderStatus !== "Cancelled") {
              orderList.push({ id: doc.id, uid, ...data });
            }
          });
          setOrders(orderList);
        });
      }
    });
    unsub.push(unsubOrders);

    const unsubStock = onSnapshot(collection(db, "products"), (snap) => {
      const sorted = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (a.productId || "").localeCompare(b.productId || "", "en", { numeric: true }));
      setLiveStocks(sorted);
      const low = sorted.filter((p) =>
        (p.category === "Combo" && (p.stock || 0) <= 5) ||
        (p.category !== "Combo" && (p.stock || 0) <= 5000)
      ).length;
      setLowStockCount(low);
    });
    unsub.push(unsubStock);

    return () => unsub.forEach((u) => u());
  }, []);

  const fetchAdminName = () => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const unsub = onSnapshot(collection(db, "users"), (snap) => {
          const matched = snap.docs.find((doc) => doc.data().email === currentUser.email);
          if (matched) {
            setAdminName(matched.data().username || "Administrator");
          }
        });
        return () => unsub();
      }
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Logout failed!");
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard": return <Dashboard />;
      case "users": return <Users />;
      case "products List": return <Products />;
      case "orders": return <Orders />;
      case "order Details": return <Delivery />;
      case "cancel Orders": return <CancelOrders />;
      case "stock Details": return <StockDetails />;
      case "dealer": return <AddDealer />;
      case "reviews": return <Reviews />;
      case "invoice": return <Invoice />;
      case "billing": return <Billing />;
      default: return <p className="text-gray-500">Select a section.</p>;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className={`w-64 bg-white border-r border-gray-200 shadow-md transition-all duration-300 z-20 ${isSidebarOpen ? "absolute md:relative" : "hidden md:block"}`}>
        <div className="sticky top-0 bg-white flex items-center justify-between px-4 py-5.5 shadow">
          <Link to="/" className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline">
            <FaArrowLeftLong /> Back to Site
          </Link>
        </div>
        <div className="px-6 py-4 text-2xl font-bold text-primary">Admin Panel</div>
        <nav className="px-2 space-y-1">
          {SideBarmenu.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setActiveSection(item.label);
                setIsSidebarOpen(false);
              }}
              className={`flex justify-between items-center w-full px-4 py-2 text-left rounded hover:bg-gray-100 transition ${activeSection === item.label ? "bg-green-100 text-primary font-medium" : ""}`}
            >
              <span className="capitalize">{item.label}</span>
              {item.collection && (
                <span className={`text-primary text-xs px-2 py-0.5 rounded-full ${item.label === "stock Details" && lowStockCount > 0 ? "bg-red-500 text-white" : "bg-green-100"}`}>
                  {item.label === "orders" ? orders.length : item.label === "stock Details" ? lowStockCount : collectionCounts[item.label] || 0}
                </span>
              )}
            </button>
          ))}
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 rounded transition">
            Logout
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button className="text-gray-700 md:hidden" onClick={() => setIsSidebarOpen((prev) => !prev)}>
              <FaBars size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              {activeSection === "dashboard" ? "Dashboard" : `${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} List`}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:block text-sm text-gray-500">
              Home / <span className="capitalize text-gray-800">{activeSection}</span>
            </nav>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {adminName.charAt(0)}
              </div>
              <span className="text-sm text-primary">{adminName}</span>
            </div>
            <button onClick={handleLogout} className="text-white bg-red-500 p-2 rounded">Logout</button>
          </div>
        </header>
        <main className="p-4">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminPanel;