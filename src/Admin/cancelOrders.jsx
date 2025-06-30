import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { FaTimes } from "react-icons/fa";

const CancelOrders = () => {
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchCancelledOrders();
  }, []);

  const fetchCancelledOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, "cancelOrders"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCancelledOrders(data);
    } catch (error) {
      console.error("Error fetching cancelled orders:", error);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Cancelled Orders</h1>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">User ID</th>
              <th className="p-3 border">Payment Type</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">Reason</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cancelledOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-3 border">{order.orderId}</td>
                <td className="p-3 border">{order.uid}</td>
                <td className="p-3 border">{order.paymentMethod}</td>
                <td className="p-3 border text-green-600 font-semibold">
                  ₹ {order.totalAmount}
                </td>
                <td className="p-3 border text-red-500">{order.cancelReason}</td>
                <td className="p-3 border text-center">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 underline text-sm"
                  >
                    View
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
            <h2 className="text-xl font-bold mb-4 text-red-700">
              Cancelled Order - {selectedOrder.orderId}
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>User ID:</strong> {selectedOrder.uid}</p>
              <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
              <p><strong>Status:</strong> {selectedOrder.orderStatus}</p>
              <p><strong>Total:</strong> ₹{selectedOrder.totalAmount}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>
              <p><strong>Reason:</strong> {selectedOrder.cancelReason}</p>

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
                  {selectedOrder.shippingAddress?.fullname}, {" "}
                  {selectedOrder.shippingAddress?.street}, {" "}
                  {selectedOrder.shippingAddress?.city}, {" "}
                  {selectedOrder.shippingAddress?.state} - {" "}
                  {selectedOrder.shippingAddress?.zip}, {" "}
                  {selectedOrder.shippingAddress?.country}
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

export default CancelOrders;
