// Billing.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  runTransaction,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-hot-toast";

const Billing = () => {
  const [client, setClient] = useState({ name: "", phone: "", gst: "", address: "" });
  const [selectedProduct, setSelectedProduct] = useState({});
  const [productList, setProductList] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [gstAmount, setGstAmount] = useState(0);

  const generateOrderId = async () => {
    const counterRef = doc(db, "metadata", "orderCounter");
    return await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(counterRef);
      let number = 1;
      if (snap.exists()) {
        number = (snap.data().lastOrderNumber || 0) + 1;
      }
      transaction.set(counterRef, { lastOrderNumber: number }, { merge: true });
      return `KDF00${String(number).padStart(3, "0")}`;
    });
  };

  useEffect(() => {
    getDocs(collection(db, "products")).then((snap) => {
      const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProductList(items);
    });
  }, []);

  const handleProductSelect = (id) => {
    const product = productList.find((p) => p.productId === id);
    if (!product) return;
    setSelectedProduct({
      id: product.productId,
      name: product.name,
      weights: product.weights || [],
      quantity: 1,
      weight: "",
      priceMap: product.prices || {},
      gst: 0,
    });
  };

  const addProductToInvoice = () => {
    if (!selectedProduct.id || !selectedProduct.weight) return;
    const price = selectedProduct.priceMap[selectedProduct.weight] || 0;
    const total = price * selectedProduct.quantity;
    const gst = parseFloat(selectedProduct.gst || 0);
    setGstAmount((prev) => prev + gst);
    setInvoiceItems([...invoiceItems, { ...selectedProduct, price, total, gst }]);
    setSelectedProduct({});
  };

  const handleSave = async () => {
    if (!client.name || invoiceItems.length === 0) return toast.error("Fill all fields");

    const newOrderId = await generateOrderId();
    const totalAmount = invoiceItems.reduce((acc, i) => acc + i.total + i.gst, 0);
    const data = {
      orderId: newOrderId,
      client,
      items: invoiceItems,
      gstAmount,
      totalAmount,
      date: new Date().toISOString(),
    };
    await addDoc(collection(db, "delivery"), data);
    toast.success("Bill saved successfully!");

    const printable = window.open("", "", "width=800,height=600");
    printable.document.write(`
      <html><head><title>Invoice ${newOrderId}</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        td, th { border: 1px solid #ccc; padding: 8px; }
        .header { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 20px; color: green; }
        .footer { margin-top: 30px; font-style: italic; text-align: center; font-size: 14px; color: #555; }
      </style></head><body>
        <div class="header">Kavi's Dry Fruits</div>
        <p><strong>Order ID:</strong> ${newOrderId}</p>
        <p><strong>Client Name:</strong> ${client.name}</p>
        <p><strong>Phone:</strong> ${client.phone}</p>
        ${client.gst ? `<p><strong>GST No:</strong> ${client.gst}</p>` : ""}
        <p><strong>Address:</strong> ${client.address}</p>

        <table><thead>
          <tr><th>Product ID</th><th>Name</th><th>Qty</th><th>Weight</th><th>Total</th><th>GST</th></tr>
        </thead><tbody>
          ${invoiceItems.map(item => `
            <tr>
              <td>${item.id}</td>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${item.weight}</td>
              <td>₹${item.total.toFixed(2)}</td>
              <td>₹${item.gst.toFixed(2)}</td>
            </tr>`).join('')}
        </tbody></table>

        <p><strong>GST Total:</strong> ₹${gstAmount.toFixed(2)}</p>
        <p><strong>Final Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
        <div class="footer">Thank you for shopping at Kavi's Dry Fruits. We appreciate your business!</div>
      </body></html>`);
    printable.document.close();
    printable.focus();
    printable.print();
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Billing Page</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label>Client Name:</label>
          <input className="w-full border p-2 mb-2" value={client.name || ""} onChange={(e) => setClient({ ...client, name: e.target.value })} />
          <label>Phone Number:</label>
          <input className="w-full border p-2 mb-2" value={client.phone || ""} onChange={(e) => setClient({ ...client, phone: e.target.value })} />
          <label>GST Number (optional):</label>
          <input className="w-full border p-2 mb-2" value={client.gst || ""} onChange={(e) => setClient({ ...client, gst: e.target.value })} />
          <label>Address:</label>
          <textarea className="w-full border p-2 mb-2" value={client.address || ""} onChange={(e) => setClient({ ...client, address: e.target.value })}></textarea>
        </div>

        <div>
          <label>Select Product:</label>
          <select className="w-full border p-2 mb-2" value={selectedProduct.id || ""} onChange={(e) => handleProductSelect(e.target.value)}>
            <option value="">-- Select Product ID --</option>
            {productList.map((p) => (
              <option key={p.id} value={p.productId}>{p.productId}</option>
            ))}
          </select>

          {selectedProduct.name && (
            <>
              <label>Product Name:</label>
              <p className="mb-1 border p-2">{selectedProduct.name}</p>
              <label>Quantity:</label>
              <input type="number" className="w-full border p-2 mb-2" value={selectedProduct.quantity || 1} onChange={(e) => setSelectedProduct({ ...selectedProduct, quantity: parseInt(e.target.value) })} />
              <label>Weight:</label>
              <select className="w-full border p-2 mb-2" value={selectedProduct.weight || ""} onChange={(e) => setSelectedProduct({ ...selectedProduct, weight: e.target.value })}>
                <option value="">-- Select Weight --</option>
                {selectedProduct.weights.map((w, i) => (
                  <option key={i} value={w}>{w}</option>
                ))}
              </select>
              <label>GST Amount (₹):</label>
              <input type="number" className="w-full border p-2 mb-2" value={selectedProduct.gst || ""} onChange={(e) => setSelectedProduct({ ...selectedProduct, gst: parseFloat(e.target.value) || 0 })} />
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={addProductToInvoice}>Add Product</button>
            </>
          )}
        </div>
      </div>

      <hr className="my-6" />

      <h2 className="text-xl font-semibold mb-3">Invoice Items</h2>
      {invoiceItems.length > 0 ? (
        <table className="table-auto w-full text-sm mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Product ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Weight</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">GST</th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, i) => (
              <tr key={i}>
                <td className="p-2 border">{item.id}</td>
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border">{item.quantity}</td>
                <td className="p-2 border">{item.weight}</td>
                <td className="p-2 border">₹{item.total.toFixed(2)}</td>
                <td className="p-2 border">₹{item.gst.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No items added yet.</p>
      )}

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">GST Total: ₹{gstAmount.toFixed(2)}</p>
          <p className="text-lg font-bold">Total Amount: ₹{invoiceItems.reduce((a, b) => a + b.total + b.gst, 0).toFixed(2)}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">Save & Print</button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
