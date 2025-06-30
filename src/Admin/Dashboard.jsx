import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [monthlyOrders, setMonthlyOrders] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [liveStocks, setLiveStocks] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (usersSnap) => {
        const unsubList = [];
        let orders = 0;
        let revenue = 0;
        const revenueByMonth = {};
        const ordersByMonth = {};
        const topProductOrdersMap = {};

        usersSnap.docs.forEach((userDoc) => {
          const uid = userDoc.id;
          const orderRef = collection(db, "users", uid, "orders");
          const unsubOrder = onSnapshot(orderRef, (ordersSnap) => {
            ordersSnap.forEach((orderDoc) => {
              const data = orderDoc.data();
              const total = data.totalAmount || 0;
              const month = new Date(data.date || Date.now()).toLocaleString(
                "default",
                { month: "short" }
              );
              revenue += total;
              orders++;
              revenueByMonth[month] = (revenueByMonth[month] || 0) + total;
              ordersByMonth[month] = (ordersByMonth[month] || 0) + 1;

              (data.cartItems || []).forEach((item) => {
                const key = item.name;
                if (!topProductOrdersMap[key]) topProductOrdersMap[key] = {};
                topProductOrdersMap[key][month] =
                  (topProductOrdersMap[key][month] || 0) + (item.qty || 1);
              });
            });

            const months = Object.keys(revenueByMonth);
            const topProductChartData = Object.entries(topProductOrdersMap)
              .map(([name, monthlyData]) => ({
                label: name,
                data: months.map((m) => monthlyData[m] || 0),
              }))
              .slice(0, 3);

            setStats((prev) => ({
              ...prev,
              users: usersSnap.size,
              orders,
              revenue,
            }));
            setMonthlyRevenue(
              months.map((m) => ({ month: m, amount: revenueByMonth[m] }))
            );
            setMonthlyOrders(
              months.map((m) => ({ month: m, count: ordersByMonth[m] }))
            );
            setTopProducts(topProductChartData);
          });
          unsubList.push(unsubOrder);
        });

        return () => unsubList.forEach((unsub) => unsub());
      }
    );

    const unsubProducts = onSnapshot(
      collection(db, "products"),
      (productsSnap) => {
        const cats = {};
        const sorted = productsSnap.docs
          .map((doc) => {
            const data = doc.data();
            cats[data.category || "Other"] =
              (cats[data.category || "Other"] || 0) + 1;
            return { id: doc.id, ...data };
          })
          .sort((a, b) =>
            (a.productId || "").localeCompare(b.productId || "", "en", {
              numeric: true,
            })
          );

        setStats((prev) => ({ ...prev, products: productsSnap.size }));
        setProductCategories(
          Object.entries(cats).map(([name, value]) => ({ name, value }))
        );
        setLiveStocks(sorted);
      }
    );

    return () => {
      unsubProducts();
      unsubscribeUsers();
    };
  }, []);

  const revenueChart = {
    labels: monthlyRevenue.map((d) => d.month),
    datasets: [
      {
        label: "Revenue",
        data: monthlyRevenue.map((d) => d.amount),
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderRadius: 6,
      },
    ],
  };

  const ordersChart = {
    labels: monthlyOrders.map((d) => d.month),
    datasets: [
      {
        label: "Orders",
        data: monthlyOrders.map((d) => d.count),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.3)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const categoryChart = {
    labels: productCategories.map((d) => d.name),
    datasets: [
      {
        data: productCategories.map((d) => d.value),
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#6366f1",
        ],
        borderWidth: 2,
      },
    ],
  };

  const topProductOrdersChart = {
    labels: monthlyRevenue.map((d) => d.month),
    datasets: topProducts.map((item, i) => ({
      label: item.label,
      data: item.data,
      borderColor: ["#3b82f6", "#f59e0b", "#10b981"][i % 3],
      backgroundColor: ["#93c5fd", "#fde68a", "#6ee7b7"][i % 3],
      fill: false,
      tension: 0.4,
    })),
  };

  const stockChart = {
    labels: liveStocks.map((p) => p.name),
    datasets: [
      {
        label: "Stock",
        data: liveStocks.map((p) =>
          p.combos?.length > 0 ? p.stock : (p.stock || 0) / 1000
        ),
        backgroundColor: "rgba(239, 68, 68, 0.6)",
        borderColor: "#dc2626",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-primary mb-6">Admin Dashboard</h1>
      {liveStocks.some((item) =>
        item.combos?.length > 0 ? item.stock <= 5 : item.stock <= 5000
      ) && (
        <div className="w-full mb-10 bg-white border border-red-300  rounded-xl z-50 overflow-hidden">
          <div className="bg-red-100 px-4 py-3 border-b border-red-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-red-600 text-xl">⚠</span>
              <h4 className="text-sm sm:text-base font-semibold text-red-700">
                Low Stock Alert
              </h4>
            </div>
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {
                liveStocks.filter((item) =>
                  item.combos?.length > 0 ? item.stock <= 5 : item.stock <= 5000
                ).length
              }
            </span>
          </div>
          <div className="max-h-72 overflow-y-auto px-4 py-3">
            <ul className="space-y-3 text-sm">
              {liveStocks
                .filter((item) =>
                  item.combos?.length > 0 ? item.stock <= 5 : item.stock <= 5000
                )
                .map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center bg-red-50 px-3 py-2 rounded-md border border-red-100 hover:bg-red-100"
                  >
                    <div>
                      <p className="font-medium text-red-700">
                        {item.name}{" "}
                        <span className="text-xs text-gray-500">
                          ({item.productId})
                        </span>
                      </p>
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-200 px-2 py-0.5 rounded">
                      {item.combos?.length > 0
                        ? `${item.stock} pcs`
                        : ` ${(item.stock || 0) / 1000} kg`}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500"
          >
            <h2 className="text-xs font-semibold uppercase text-gray-500">
              {key}
            </h2>
            <p className="text-3xl font-bold text-primary mt-2">
              {key === "revenue" ? `₹ ${value}` : value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Monthly Revenue
          </h2>
          <Bar data={revenueChart} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Monthly Orders
          </h2>
          <Line data={ordersChart} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Product Category Distribution
        </h2>
        <div className="w-full md:w-1/2 mx-auto">
          <Pie data={categoryChart} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Top Product Orders Over Months
        </h2>
        <Line data={topProductOrdersChart} />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Current Product Stock Levels
        </h2>
        <Bar data={stockChart} />
      </div>
    </div>
  );
};

export default Dashboard;
