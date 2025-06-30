import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const StockDetail = () => {
  const [form, setForm] = useState({
    productId: "",
    productName: "",
    productCategory: "",
    currentQuantity: "",
    invoiceNumber: "",
  });
  const [isCombo, setIsCombo] = useState(false);
  const [invoiceNumbers, setInvoiceNumbers] = useState([]);
  const [liveStocks, setLiveStocks] = useState([]);

  useEffect(() => {
    const unsubInvoice = onSnapshot(collection(db, "invoices"), (snap) => {
      const invoices = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setInvoiceNumbers(invoices);
    });

    const unsubStock = onSnapshot(collection(db, "products"), (snap) => {
      const products = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const idA = a.productId?.toLowerCase() || "";
          const idB = b.productId?.toLowerCase() || "";
          return idA.localeCompare(idB, "en", { numeric: true });
        });
      setLiveStocks(products);
    });

    return () => {
      unsubInvoice();
      unsubStock();
    };
  }, []);

  const handleProductIdChange = async (e) => {
    const value = e.target.value;
    setForm({ ...form, productId: value });
    if (!value.trim()) return;

    const snap = await getDocs(collection(db, "products"));
    const matched = snap.docs.find(
      (doc) => doc.data().productId === value.trim()
    );

    if (matched) {
      const data = matched.data();
      setIsCombo(!!data.combos?.length);
      setForm((prev) => ({
        ...prev,
        productName: data.name || "",
        productCategory: data.category || "",
        currentQuantity: "",
      }));
    } else {
      toast.warning("Product not found");
      setForm((prev) => ({
        ...prev,
        productName: "",
        productCategory: "",
        currentQuantity: "",
      }));
      setIsCombo(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const snap = await getDocs(collection(db, "products"));
      const matched = snap.docs.find(
        (doc) => doc.data().productId === form.productId.trim()
      );
      if (!matched) return toast.error("Product not found in database.");

      const docRef = matched.ref;
      const existingStock = matched.data().stock || 0;
      const addedQuantity = isCombo
        ? parseInt(form.currentQuantity)
        : parseInt(form.currentQuantity) * 1000;
      const newStock = existingStock + addedQuantity;

      await updateDoc(docRef, {
        stock: newStock,
        lastInvoice: form.invoiceNumber,
      });

      await addDoc(collection(db, "stockRecords"), {
        ...form,
        addedQuantity,
        finalStock: newStock,
        timestamp: Timestamp.now(),
      });

      toast.success("Stock updated and invoice saved!");
      setForm({
        productId: "",
        productName: "",
        productCategory: "",
        currentQuantity: "",
        invoiceNumber: "",
      });
      setIsCombo(false);
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Error submitting stock detail");
    }
  };

  return (
    <div className="relative max-w-6xl mx-auto bg-white shadow p-6 rounded mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Stock Detail</h2>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="font-semibold">Product ID</label>
          <select
            name="productId"
            value={form.productId}
            onChange={handleProductIdChange}
            className="w-full mt-1 border px-3 py-2 rounded border-gray-400"
            required
          >
            <option value="">Select Product ID</option>
            {liveStocks.map((item) => (
              <option key={item.id} value={item.productId}>
                {item.productId} - {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold">Product Name</label>
          <input
            type="text"
            name="productName"
            value={form.productName}
            readOnly
            className="w-full mt-1 border px-3 py-2 rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="font-semibold">Product Category</label>
          <input
            type="text"
            name="productCategory"
            value={form.productCategory}
            readOnly
            className="w-full mt-1 border px-3 py-2 rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="font-semibold">
            Quantity ({isCombo ? "in pcs" : "in kg"})
          </label>
          <input
            type="number"
            name="currentQuantity"
            value={form.currentQuantity}
            onChange={handleChange}
            className="w-full mt-1 border px-3 py-2 rounded border-gray-400"
            required
          />
        </div>
        <div>
          <label className="font-semibold">Invoice Number</label>
          <select
            name="invoiceNumber"
            value={form.invoiceNumber}
            onChange={handleChange}
            className="w-full mt-1 border px-3 py-2 rounded border-gray-400"
            required
          >
            <option value="">Select Invoice</option>
            {invoiceNumbers.map((inv) => (
              <option key={inv.id} value={inv.invoiceNo}>
                {inv.invoiceNo}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
          >
            Submit Stock Detail
          </button>
        </div>
      </form>

      <div className="mt-12">
        <h3 className="text-xl font-bold mb-4">Live Product Stock</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-white text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-2 border">Product ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Current Stock</th>
                <th className="p-2 border">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {liveStocks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No live stock data found.
                  </td>
                </tr>
              ) : (
                liveStocks.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2 border">{item.productId}</td>
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border">{item.category}</td>
                    <td className="p-2 border">
                      {item.combos?.length > 0
                        ? `${item.stock || 0} pcs`
                        : `${(item.stock || 0) / 1000} kg`}
                    </td>
                    <td className="p-2 border">
                      {item.lastInvoice ? (
                        <Link
                          to={`/admin/invoice?no=${item.lastInvoice}`}
                          className="text-blue-600 hover:underline text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Invoice
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
