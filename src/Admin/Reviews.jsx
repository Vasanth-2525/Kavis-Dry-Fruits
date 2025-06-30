import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviewIds, setSelectedReviewIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    comment: "",
  });

  // ✅ Safe date formatter
  const formatDate = (createdAt) => {
    if (!createdAt) return "No Date";
    if (typeof createdAt === "string") return new Date(createdAt).toLocaleString();
    if (createdAt.toDate) return createdAt.toDate().toLocaleString();
    return "Invalid Date";
  };

  // Fetch all reviews
  const fetchReviews = async () => {
    try {
      const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Toggle selected ID
  const toggleSelect = (id) => {
    setSelectedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };

  // Select All or Deselect All
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedReviewIds([]);
    } else {
      const allIds = reviews.map((review) => review.id);
      setSelectedReviewIds(allIds);
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    setSelectAll(selectedReviewIds.length === reviews.length && reviews.length > 0);
  }, [selectedReviewIds, reviews]);

  // ✅ Mark selected reviews as featured
  const markSelectedAsFeatured = async () => {
    if (selectedReviewIds.length === 0) {
      toast.error("Please select at least one review");
      return;
    }

    try {
      const updatePromises = selectedReviewIds.map((id) => {
        const docRef = doc(db, "reviews", id);
        return updateDoc(docRef, { selected: true });
      });

      await Promise.all(updatePromises);
      toast.success("Selected reviews marked as featured!");
      fetchReviews();
    } catch (err) {
      console.error("Error updating reviews:", err);
      toast.error("Failed to update selected reviews.");
    }
  };

  // ✅ Manually toggle featured status
  const toggleFeatured = async (id, value) => {
    try {
      const docRef = doc(db, "reviews", id);
      await updateDoc(docRef, { selected: value });
      toast.success(`Review ${value ? "marked" : "unmarked"} as featured.`);
      fetchReviews();
    } catch (error) {
      console.error("Error updating featured status:", error);
      toast.error("Failed to update featured status.");
    }
  };

  // Handle new review form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit new review
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!formData.userName || !formData.comment) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addDoc(collection(db, "reviews"), {
        ...formData,
        createdAt: serverTimestamp(),
        selected: false,
      });
      toast.success("Review submitted!");
      setFormData({ userName: "", comment: "" });
      fetchReviews();
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error("Failed to submit review.");
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Product Reviews</h2>

      {/* Add New Review Form */}
      <form
        onSubmit={handleSubmitReview}
        className="mb-6 bg-white p-4 shadow rounded space-y-4"
      >
        <h3 className="text-lg font-semibold">Add New Review</h3>
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="Your Name"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Comment</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="Your Comment"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Submit Review
        </button>
      </form>

      {/* Review List */}
      {loading ? (
        <p className="text-gray-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-600">No reviews found.</p>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-blue-600">
              Selected: {selectedReviewIds.length}
            </p>
            {/* <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
              Select All
            </label> */}
          </div>

          <div className="space-y-4 mb-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`bg-white p-4 rounded shadow flex items-start gap-3 ${
                  selectedReviewIds.includes(review.id)
                    ? "border border-green-500"
                    : ""
                }`}
              >
                {/* <input
                  type="checkbox"
                  checked={selectedReviewIds.includes(review.id)}
                  onChange={() => toggleSelect(review.id)}
                  className="mt-1"
                /> */}
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    {review.userName}
                  </p>
                  <p className="text-gray-700">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(review.createdAt)}
                  </p>

                  {/* ✅ Toggle Featured Checkbox */}
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={review.selected || false}
                      onChange={() =>
                        toggleFeatured(review.id, !review.selected)
                      }
                    />
                    <label className="text-xs text-gray-700">
                      Mark as Featured
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={markSelectedAsFeatured}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            Mark Selected as Featured
          </button>
        </>
      )}
    </div>
  );
};

export default Reviews;
