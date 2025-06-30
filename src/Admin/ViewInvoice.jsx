import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const ViewInvoice = () => {
  const [searchParams] = useSearchParams();
  const invoiceNo = searchParams.get("no");

  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "invoices"));
        const matched = snapshot.docs.find(
          (doc) => doc.data().invoiceNo === invoiceNo
        );
        if (matched) {
          setInvoiceData(matched.data());
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    if (invoiceNo) fetchInvoice();
  }, [invoiceNo]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-4">Invoice Viewer</h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : !invoiceNo ? (
        <p className="text-center text-red-500">No invoice number provided.</p>
      ) : !invoiceData ? (
        <p className="text-center text-red-500">
          Invoice <strong>{invoiceNo}</strong> not found.
        </p>
      ) : (
        <div className="text-center">
          <p className="text-gray-700 mb-2">
            Viewing invoice for: <strong>{invoiceNo}</strong>
          </p>
          {invoiceData.billPdfBase64 ? (
            <iframe
              title="Invoice PDF"
              src={`data:application/pdf;base64,${invoiceData.billPdfBase64}`}
              className="w-full h-[80vh] border"
            />
          ) : (
            <p className="text-red-500">No PDF attached for this invoice.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewInvoice;
