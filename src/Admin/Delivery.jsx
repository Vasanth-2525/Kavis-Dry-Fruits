// Delivery.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { FaPrint } from "react-icons/fa";

const Delivery = () => {
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchDeliveredOrders = async () => {
      const snapshot = await getDocs(collection(db, "delivery"));
      const deliveries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDeliveredOrders(deliveries);
    };
    fetchDeliveredOrders();
  }, []);

  const handlePrint = (order) => {
    const address = order.shippingAddress || order.client || {};
    const itemsList = (order.cartItems || order.items || [])
      .map((item) => `${item.name} × ${item.qty || item.quantity}`)
      .join("\n");

    const content = `
    --- Delivery Invoice ---
    Order ID: ${order.orderId}
    User ID: ${order.userId || "Shop Customer"}
    Payment Type: ${order.paymentMethod || "Cash"}
    Payment ID: ${order.paymentId || "-"}
    Total: ₹${order.totalAmount}

    Shipping To:
    ${address.fullname || ""}, ${address.street || ""}, ${address.city || ""}, ${address.state || ""}, ${address.zip || ""}, ${address.country || ""}
    Contact: ${address.contact || ""}
    Email: ${address.email || ""}

    Items:
    ${itemsList}

    Delivery Date: ${new Date(order.deliveryDate || order.date).toLocaleString()}
    --------------------------
    `;

    const printWindow = window.open("", "", "width=600,height=600");
    printWindow.document.write(`<pre>${content}</pre>`);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredOrders =
    filterType === "all"
      ? deliveredOrders
      : deliveredOrders.filter((order) =>
          filterType === "online"
            ? !!order.shippingAddress
            : !order.shippingAddress
        );

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Delivered Orders</h1>

      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter:</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          <option value="all">All</option>
          <option value="online">Online Customers</option>
          <option value="shop">Shop Customers</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-gray-500">No delivered orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm border border-gray-300 rounded-lg shadow">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border">Order ID</th>
                <th className="p-3 border">Total</th>
                <th className="p-3 border">User</th>
                <th className="p-3 border">Delivery Date</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      setSelectedOrderId(
                        selectedOrderId === order.id ? null : order.id
                      )
                    }
                  >
                    <td className="p-3 border text-blue-700 font-medium">
                      {order.orderId}
                    </td>
                    <td className="p-3 border text-green-600 font-semibold">
                      ₹{order.totalAmount}
                    </td>
                    <td className="p-3 border">
                      {order.shippingAddress ? "Online Customer" : "Shop Customer"}
                    </td>
                    <td className="p-3 border">
                      {new Date(
                        order.deliveryDate || order.date
                      ).toLocaleString()}
                    </td>
                    <td className="p-3 border text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrint(order);
                        }}
                        className="text-gray-600 hover:text-black"
                      >
                        <FaPrint />
                      </button>
                    </td>
                  </tr>

                  {selectedOrderId === order.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="p-4 border border-t-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                          <div>
                            <h4 className="font-semibold mb-1 text-gray-800 underline">
                              Shipping Details
                            </h4>
                            {order.shippingAddress ? (
                              <>
                                <p>{order.shippingAddress.fullname}</p>
                                <p>{order.shippingAddress.street}</p>
                                <p>
                                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}
                                </p>
                                <p>{order.shippingAddress.country}</p>
                                <p>📞 {order.shippingAddress.contact}</p>
                                <p>📧 {order.shippingAddress.email}</p>
                              </>
                            ) : (
                              <>
                                <p>{order.client?.name}</p>
                                <p>{order.client?.address}</p>
                                <p>📞 {order.client?.phone}</p>
                                {order.client?.gst && <p>GST: {order.client?.gst}</p>}
                              </>
                            )}
                          </div>

                          <div>
                            <h4 className="font-semibold mb-1 text-gray-800 underline">
                              Items
                            </h4>
                            <ul className="list-disc pl-5">
                              {(order.cartItems || []).length > 0 ? (
                                order.cartItems.map((item, idx) => (
                                  <li key={idx}>
                                    {item.name} × {item.qty || item.quantity} — ₹
                                    {(item.price * (item.qty || item.quantity)).toFixed(2)}
                                  </li>
                                ))
                              ) : (order.items || []).length > 0 ? (
                                order.items.map((item, id) => (
                                  <li key={id}>
                                    {item.name} × {item.quantity} — ₹
                                    {(item.price * item.quantity).toFixed(2)}
                                  </li>
                                ))
                              ) : (
                                <li>No items found</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Delivery;
