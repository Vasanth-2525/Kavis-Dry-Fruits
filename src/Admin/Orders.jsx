// src/Orders.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { FaPrint, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelInput, setShowCancelInput] = useState(null);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (usersSnap) => {
      usersSnap.docs.forEach((userDoc) => {
        const uid = userDoc.id;
        const unsubOrders = onSnapshot(collection(db, "users", uid, "orders"), (ordersSnap) => {
          let tempOrders = [];
          ordersSnap.forEach((doc) => {
            const data = doc.data();
            if (data.orderStatus !== "Delivered" && data.orderStatus !== "Cancelled") {
              tempOrders.push({ id: doc.id, uid, ...data });
            }
          });
          setOrders((prevOrders) => {
            const filtered = prevOrders.filter((o) => o.uid !== uid);
            return [...filtered, ...tempOrders];
          });
        });
      });
    });

    return () => unsubUsers();
  }, []);

  const handleStatusUpdate = async (uid, orderId, newStatus) => {
    if (!newStatus) return;

    try {
      const orderRef = doc(db, "users", uid, "orders", orderId);
      const updatedOrder = orders.find(
        (order) => order.id === orderId && order.uid === uid
      );

      if (newStatus === "Delivered") {
        await addDoc(collection(db, "delivery"), {
          ...updatedOrder,
          orderStatus: "Delivered",
          deliveryDate: new Date().toISOString(),
        });
        await updateDoc(orderRef, { orderStatus: "Delivered" });
        toast.success("Delivered and moved to Delivery DB!");
      } else if (newStatus === "Cancelled") {
        if (!cancelReason.trim()) return toast.error("Please enter cancel reason");
        await addDoc(collection(db, "cancelOrders"), {
          ...updatedOrder,
          orderStatus: "Cancelled",
          cancelReason,
          cancelledAt: new Date().toISOString(),
        });
        await updateDoc(orderRef, { orderStatus: "Cancelled", cancelReason });
        setCancelReason("");
        setShowCancelInput(null);
        toast.success("Order Cancelled and moved to CancelOrders DB!");
      } else {
        await updateDoc(orderRef, { orderStatus: newStatus });
        toast.success("Status updated!");
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update status!");
    }
  };

  const handlePrint = (order) => {
    const address = order.shippingAddress || {};
    const itemsList = (order.cartItems || [])
      .map((item) => `${item.name} × ${item.qty || item.quantity}`)
      .join("\n");

    const printContent = `
    --- Invoice ---
    Order ID: ${order.orderId}
    User ID: ${order.uid}
    Payment Type: ${order.paymentMethod || "-"}
    Payment ID: ${order.paymentMethod === "Online Payment" ? order.paymentId || "-" : "-"}
    Total Amount: ₹ ${order.totalAmount}
    Status: ${order.orderStatus || "Not Available"}

    Shipping Address:
    ${address.fullname}, ${address.street}, ${address.city}, ${address.state} - ${address.zip}, ${address.country}
    Contact: ${address.contact}
    Email: ${address.email}

    Items:
    ${itemsList}

    Date: ${new Date(order.date).toLocaleString()}
    ------------------
    `;

    const printWindow = window.open("", "", "width=600,height=600");
    printWindow.document.write(`<pre>${printContent}</pre>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">Payment</th>
              <th className="p-3 border">Payment ID</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td
                  className="p-3 border text-blue-600 underline cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  {order.orderId}
                </td>
                <td className="p-3 border">{order.paymentMethod || "-"}</td>
                <td className="p-3 border">
                  {order.paymentMethod === "Online Payment" ? order.paymentId : "-"}
                </td>
                <td className="p-3 border text-green-600 font-semibold">₹ {order.totalAmount}</td>
                <td className="p-3 border">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "Cancelled") {
                        setShowCancelInput(order.id);
                      } else {
                        handleStatusUpdate(order.uid, order.id, value);
                      }
                    }}
                    className="border p-1 rounded"
                  >
                    <option value="Placed">Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  {showCancelInput === order.id && (
                    <div className="mt-2">
                      <textarea
                        className="w-full border rounded text-xs p-1"
                        placeholder="Reason for cancellation"
                        onChange={(e) => setCancelReason(e.target.value)}
                      />
                      <button
                        onClick={() => handleStatusUpdate(order.uid, order.id, "Cancelled")}
                        className="mt-1 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
                      >
                        Confirm Cancel
                      </button>
                    </div>
                  )}
                </td>
                <td className="p-3 flex gap-2 justify-center">
                  <button
                    onClick={() => handlePrint(order)}
                    className="text-gray-600 hover:text-black"
                  >
                    <FaPrint />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setSelectedOrder(null)}
            >
              <FaTimes />
            </button>
            <h2 className="text-xl font-bold mb-4 text-green-700">
              Order Details - {selectedOrder.orderId}
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>User ID:</strong> {selectedOrder.uid}</p>
              <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
              <p><strong>Payment ID:</strong> {selectedOrder.paymentId || "-"}</p>
              <p><strong>Status:</strong> {selectedOrder.orderStatus}</p>
              <p><strong>Total:</strong> ₹{selectedOrder.totalAmount}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>
              <div className="mt-3">
                <h4 className="font-semibold underline mb-1">Items:</h4>
                <ul className="list-disc pl-5">
                  {selectedOrder.cartItems?.map((item, idx) => (
                    <li key={idx}>
                      {item.name} - {item.qty || item.quantity} × ₹{item.price}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3">
                <h4 className="font-semibold underline mb-1">Shipping Address:</h4>
                <p>
                  {selectedOrder.shippingAddress?.fullname},
                  {" "}{selectedOrder.shippingAddress?.street},
                  {" "}{selectedOrder.shippingAddress?.city},
                  {" "}{selectedOrder.shippingAddress?.state} -
                  {" "}{selectedOrder.shippingAddress?.zip},
                  {" "}{selectedOrder.shippingAddress?.country}
                </p>
                <p><strong>Contact:</strong> {selectedOrder.shippingAddress?.contact}</p>
                <p><strong>Email:</strong> {selectedOrder.shippingAddress?.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;