import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

const Invoice = () => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: "",
    invoiceDate: "",
    invoiceValue: "",
    invoiceGSTValue: "",
    invoiceTotalValue: "",
    transportAmount: "",
    billPdfBase64: null,
    billPdfName: "",
  });

  const [invoices, setInvoices] = useState([]);
  const [view, setView] = useState("form");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setInvoiceData((prev) => ({
        ...prev,
        billPdfBase64: reader.result.split(",")[1], // remove data: prefix
        billPdfName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const fetchInvoices = async () => {
    const querySnapshot = await getDocs(collection(db, "invoices"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setInvoices(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!invoiceData.billPdfBase64) {
      toast.error("Please upload a bill (PDF only)");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "invoices"), {
        ...invoiceData,
        createdAt: new Date().toISOString(),
      });

      toast.success("Invoice submitted!");
      setInvoiceData({
        invoiceNo: "",
        invoiceDate: "",
        invoiceValue: "",
        invoiceGSTValue: "",
        invoiceTotalValue: "",
        transportAmount: "",
        billPdfBase64: null,
        billPdfName: "",
      });

      fetchInvoices();
      setView("table");
    } catch (error) {
      console.error("Firestore error:", error);
      toast.error("Failed to upload invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Invoice Management</h2>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setView("form")}
          className={`px-4 py-2 rounded text-white ${
            view === "form" ? "bg-blue-600" : "bg-gray-400 hover:bg-gray-500"
          }`}
        >
          Add Invoice
        </button>
        <button
          onClick={() => {
            fetchInvoices();
            setView("table");
          }}
          className={`px-4 py-2 rounded text-white ${
            view === "table" ? "bg-green-600" : "bg-gray-400 hover:bg-gray-500"
          }`}
        >
          View Invoices
        </button>
      </div>

      {view === "form" ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "invoiceNo",
              "invoiceDate",
              "invoiceValue",
              "invoiceGSTValue",
              "invoiceTotalValue",
              "transportAmount",
            ].map((field, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium mb-1">
                  {field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (s) => s.toUpperCase())}
                </label>
                <input
                  type={field === "invoiceDate" ? "date" : "number"}
                  name={field}
                  value={invoiceData[field]}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required={field !== "transportAmount"}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Upload Bill (PDF only)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full"
            />
            {invoiceData.billPdfName && (
              <p className="text-sm text-green-600 mt-1">
                {invoiceData.billPdfName}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4"
          >
            {loading ? "Submitting..." : "Submit Invoice"}
          </button>
        </form>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded p-4">
          {invoices.length === 0 ? (
            <p className="text-gray-600 text-sm">No invoices found.</p>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 text-sm">
                  <th className="border px-3 py-2">Invoice No</th>
                  <th className="border px-3 py-2">Date</th>
                  <th className="border px-3 py-2">Value</th>
                  <th className="border px-3 py-2">GST</th>
                  <th className="border px-3 py-2">Total</th>
                  <th className="border px-3 py-2">Transport</th>
                  <th className="border px-3 py-2">Bill</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, index) => (
                  <tr key={index} className="text-sm text-center">
                    <td className="border px-3 py-2">{inv.invoiceNo}</td>
                    <td className="border px-3 py-2">{inv.invoiceDate}</td>
                    <td className="border px-3 py-2">₹{inv.invoiceValue}</td>
                    <td className="border px-3 py-2">₹{inv.invoiceGSTValue}</td>
                    <td className="border px-3 py-2">
                      ₹{inv.invoiceTotalValue}
                    </td>
                    <td className="border px-3 py-2">
                      ₹{inv.transportAmount || 0}
                    </td>
                    <td className="border px-3 py-2">
                      {inv.billPdfBase64 ? (
                        <Link
                          to={`/admin/invoice?no=${inv.invoiceNo}`}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View PDF
                        </Link>
                      ) : (
                        <span className="text-gray-500">No File</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Invoice;
