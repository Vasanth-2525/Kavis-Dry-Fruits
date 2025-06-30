import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

const AddDealer = () => {
  const [formData, setFormData] = useState({
    dealerName: "",
    dealerGSTNumber: "",
    dealerPhoneNumber: "",
    dealerMail: "",
    dealerAddress: "",
  });

  const [loading, setLoading] = useState(false);
  const [dealerId, setDealerId] = useState("");
  const [viewMode, setViewMode] = useState("add"); // 'add' or 'view'
  const [dealers, setDealers] = useState([]);

  // Generate next dealer ID
  const generateDealerId = async () => {
    const q = query(
      collection(db, "dealers"),
      orderBy("dealerId", "desc"),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      setDealerId("KD0001");
    } else {
      const lastId = snap.docs[0].data().dealerId;
      const num = parseInt(lastId.replace("KD", ""), 10) + 1;
      const newId = "KD" + num.toString().padStart(4, "0");
      setDealerId(newId);
    }
  };

  const fetchDealers = async () => {
    const snap = await getDocs(collection(db, "dealers"));
    const list = snap.docs.map((doc) => doc.data());
    setDealers(list);
  };

  useEffect(() => {
    generateDealerId();
  }, []);

  useEffect(() => {
    if (viewMode === "view") fetchDealers();
  }, [viewMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dealerId || !formData.dealerName || !formData.dealerPhoneNumber) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "dealers"), {
        dealerId,
        ...formData,
        createdAt: new Date().toISOString(),
      });
      toast.success("Dealer added successfully!");
      setFormData({
        dealerName: "",
        dealerGSTNumber: "",
        dealerPhoneNumber: "",
        dealerMail: "",
        dealerAddress: "",
      });
      generateDealerId();
    } catch (error) {
      console.error(error);
      toast.error("Error adding dealer.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">Dealers Management</h2>
      {/* Top Toggle Buttons */}
      <div className="flex justify-start gap-4 mb-6">
        <button
          onClick={() => setViewMode("add")}
          className={`px-4 py-2 rounded-md text-white font-semibold ${
            viewMode === "add" ? "bg-green-600" : "bg-gray-400"
          }`}
        >
          Add Dealer
        </button>
        <button
          onClick={() => setViewMode("view")}
          className={`px-4 py-2 rounded-md text-white font-semibold ${
            viewMode === "view" ? "bg-green-600" : "bg-gray-400"
          }`}
        >
          Show Dealers
        </button>
      </div>

      {/* Form Section */}
      {viewMode === "add" && (
        <div className="flex items-center justify-center min-h-screen ">
          <div className="w-full max-w-xl bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-green-700 text-center">
              Add New Dealer
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Dealer ID
                </label>
                <input
                  type="text"
                  value={dealerId}
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Dealer Name *
                </label>
                <input
                  type="text"
                  name="dealerName"
                  value={formData.dealerName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  name="dealerGSTNumber"
                  value={formData.dealerGSTNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  name="dealerPhoneNumber"
                  value={formData.dealerPhoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="dealerMail"
                  value={formData.dealerMail}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <textarea
                  name="dealerAddress"
                  value={formData.dealerAddress}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full"
              >
                {loading ? "Adding..." : "Add Dealer"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dealers Card Section */}
      {viewMode === "view" && (
        <div className="grid md:grid-cols-2 gap-6">
          {dealers.length === 0 ? (
            <p className="text-gray-500">No dealers found.</p>
          ) : (
            dealers.map((dealer, idx) => (
              <div
                key={idx}
                className="bg-white border border-green-300 rounded-lg p-5 shadow-md"
              >
                <h3 className="text-lg font-bold text-green-800">
                  {dealer.dealerId}
                </h3>
                <p className="text-sm ">
                  <strong>Name:</strong> {dealer.dealerName}
                </p>
                {dealer.dealerGSTNumber && (
                  <p className="text-sm">
                    <strong>GST:</strong> {dealer.dealerGSTNumber}
                  </p>
                )}
                <p className="text-sm">
                  <strong>Phone:</strong> {dealer.dealerPhoneNumber}
                </p>
                {dealer.dealerMail && (
                  <p className="text-sm">
                    <strong>Email:</strong> {dealer.dealerMail}
                  </p>
                )}

                {dealer.dealerAddress && (
                  <p className="text-sm mt-1 text-gray-700">
                    <strong>Address:</strong> {dealer.dealerAddress}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AddDealer;
