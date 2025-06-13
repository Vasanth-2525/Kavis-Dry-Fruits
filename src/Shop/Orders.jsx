import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../Component/PageHeader";

const Orders = () => {
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem("username") || "guest";
    const storedOrders =
      JSON.parse(localStorage.getItem(`${username}_orders`)) || [];
    if (storedOrders.length > 0) {
      setAllOrders(storedOrders.reverse());
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handlePrint = (order, e) => {
    e.stopPropagation(); 
    const printWindow = window.open("", "", "width=800,height=600");
    const content = `
      <html>
        <head>
          <title>Kavis Dry Fruits - Invoice</title>
          <style>
            body { font-family: Arial; padding: 20px; color: #333; }
            .print-container { border: 1px solid #ccc; padding: 20px; max-width: 800px; margin: auto; }
            .product-img { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 10px; }
            .item-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
            footer { margin-top: 40px; text-align: center; font-size: 12px; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h2>Invoice - Order ID: ${order.orderId}</h2>
            <p>Date: ${order.date}</p>
            <hr />
            ${order.cartItems
              .map(
                (item) => `
              <div class="item-row">
                <div style="display:flex; align-items:center;">
                  <img src="${item.img}" class="product-img" />
                  <div>
                    <strong>${item.name}</strong><br/>
                    Qty: ${item.qty} | ₹${item.price} each
                  </div>
                </div>
                <div>₹${(item.qty * item.price).toFixed(2)}</div>
              </div>
            `
              )
              .join("")}
            <hr />
            <div style="text-align:right; font-weight:bold;">Total: ₹${order.totalAmount.toFixed(
              2
            )}</div>
          </div>
          <footer><p>Printed on: ${new Date().toLocaleString()}</p></footer>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  if (!allOrders.length) {
    return (
      <div className="text-center text-red-600 mt-10">No orders found.</div>
    );
  }

  return (
    <>
      <PageHeader title="Your Orders" curpage="Order Completed" />
      <div className="bg-Beach min-h-screen py-10 px-4">
        {allOrders.map((order, index) => (
          <div
            key={index}
            className="max-w-4xl mx-auto shadow-md mb-6 rounded-lg overflow-hidden border border-yellow-300"
          >
            {/* Header Section */}
            <div
              className="bg-yellow-400 flex justify-between items-center px-6 py-4 cursor-pointer"
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
                  className="bg-green-600 hover:bg-green-700 text-white text-sm px-6 py-3 rounded"
                >
                  Download Invoice
                </button>
                {/* <div className="text-black text-xl">
                  {selectedIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                </div> */}
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
        ))}
      </div>
    </>
  );
};

export default Orders;
