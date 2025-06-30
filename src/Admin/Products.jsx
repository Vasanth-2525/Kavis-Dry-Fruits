// src/Products.jsx
// NOTE: Updated version using Firestore onSnapshot for live product updates
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrash, FaArrowRight } from "react-icons/fa";

const initialProduct = () => ({
  productId: "",
  name: "",
  category: "",
  images: [],
  rating: 0,
  offer: 0,
  description: "",
  health_benefits: [],
  weights: [],
  prices: {},
  combos: [],
  type: "",
});

const Products = () => {
  const [mode, setMode] = useState("product");
  const [product, setProduct] = useState(initialProduct());
  const [productList, setProductList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const firestoreProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        source: "firebase",
        ...doc.data(),
      }));
      setProductList(firestoreProducts);
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });
  const handleArrayChange = (e, key) => setProduct({ ...product, [key]: e.target.value.split(",") });
  const handleWeightsAndPrices = (e) => {
    const weights = e.target.value.split(",").map((w) => w.trim());
    const prices = {};
    weights.forEach((w) => (prices[w] = 0));
    setProduct({ ...product, weights, prices });
  };
  const handlePriceChange = (weight, price) => setProduct((prev) => ({ ...prev, prices: { ...prev.prices, [weight]: parseFloat(price) } }));
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    const readers = files.map(
      (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })
    );
    Promise.all(readers)
      .then((base64Images) => setProduct((prev) => ({ ...prev, images: base64Images })))
      .catch(() => toast.error("Failed to upload images."));
  };

  const handleEdit = (product) => {
    setMode(product.combos?.length ? "combo" : "product");
    setProduct({ ...product });
    setEditingId(product.id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Deleted!");
    } catch {
      toast.error("Failed to delete!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isCombo = product.category === "Combo";
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), product);
        toast.success("Product updated!");
        setEditingId(null);
      } else {
        const snapshot = await getDocs(collection(db, "products"));
        const productId = `${isCombo ? "KC" : "KP"}${(snapshot.size + 1).toString().padStart(3, "0")}`;
        const newProduct = { ...product, productId };
        await addDoc(collection(db, "products"), newProduct);
        toast.success(`${isCombo ? "Combo" : "Product"} added!`);
      }
      setProduct(initialProduct());
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setMode("product");
            setProduct(initialProduct());
            setEditingId(null);
          }}
          className={`px-4 py-2 rounded font-semibold ${mode === "product" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >Add Regular Product</button>
        <button
          onClick={() => {
            setMode("combo");
            setProduct({ ...initialProduct(), combos: [], type: "" });
            setEditingId(null);
          }}
          className={`px-4 py-2 rounded font-semibold ${mode === "combo" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >Add Combo Product</button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <input name="name" value={product.name} onChange={handleChange} placeholder="Product Name" className="border p-2 rounded" required />
        <select name="category" value={product.category} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Select Category</option>
          <option value="Almonds">Almonds</option>
          <option value="Cashews">Cashews</option>
          <option value="Pistachios">Pistachios</option>
          <option value="Walnuts">Walnuts</option>
          <option value="Raisins">Raisins</option>
          <option value="Dates">Dates</option>
          <option value="Mixed">Mixed</option>
          <option value="Combo">Combo</option>
          <option value="Nuts">Nuts</option>
          <option value="Seeds">Seeds</option>
          <option value="DryFruits">Dry Fruits</option>
          <option value="DriedFruits">Dried Fruits</option>
          <option value="Ayurvedic">Ayurvedic</option>
        </select>
        <input name="rating" type="number" step="0.1" value={product.rating} onChange={handleChange} placeholder="Rating" className="border p-2 rounded" />
        <input name="offer" type="number" value={product.offer} onChange={handleChange} placeholder="Offer %" className="border p-2 rounded" />
        <textarea name="description" value={product.description} onChange={handleChange} placeholder="Description" className="border p-2 rounded col-span-2" rows={2} />
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="col-span-2" />
        {product.images.length > 0 && (
          <div className="col-span-2 flex gap-2 flex-wrap">
            {product.images.map((img, i) => <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded border" />)}
          </div>
        )}
        <input value={product.health_benefits.join(",")} onChange={(e) => handleArrayChange(e, "health_benefits")} placeholder="Health Benefits" className="border p-2 rounded col-span-2" />
        <input onChange={handleWeightsAndPrices} placeholder="Weights (comma separated)" className="border p-2 rounded col-span-2" />
        {product.weights.map((w, i) => (
          <input key={i} type="number" value={product.prices[w] || ""} onChange={(e) => handlePriceChange(w, e.target.value)} placeholder={`Price for ${w}`} className="border p-2 rounded" />
        ))}
        {mode === "combo" && (
          <>
            <input value={product.combos?.join(",")} onChange={(e) => handleArrayChange(e, "combos")} placeholder="Combo Items" className="border p-2 rounded col-span-2" />
            <input name="type" value={product.type} onChange={handleChange} placeholder="Type (Festive etc.)" className="border p-2 rounded col-span-2" />
          </>
        )}
        <button type="submit" className="bg-green-600 text-white py-2 rounded col-span-2">
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </form>

      <div className="bg-white shadow rounded p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <h2 className="text-xl font-semibold">All Products</h2>
          <input type="text" placeholder="Search by name, category, ID or type" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border p-2 rounded w-full md:w-1/2" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Images</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productList
                .filter((p) => {
                  const term = searchTerm.toLowerCase();
                  return (
                    p.name?.toLowerCase().includes(term) ||
                    p.category?.toLowerCase().includes(term) ||
                    p.productId?.toLowerCase().includes(term) ||
                    p.type?.toLowerCase().includes(term)
                  );
                })
                .map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-2">{p.productId || "-"}</td>
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">{p.category}</td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        {p.images?.slice(0, 2).map((img, idx) => (
                          <img key={idx} src={img} alt="" className="w-8 h-8 object-cover rounded" />
                        ))}
                      </div>
                    </td>
                    <td className="p-2 flex gap-2">
                      <button onClick={() => handleEdit(p)} className="bg-yellow-500 text-white px-2 py-1 rounded">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;