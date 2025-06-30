// src/StoreContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [favItems, setFavItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeCart = () => {};
    let unsubscribeFav = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setUserData(userDoc.data());

        const cartRef = collection(db, "users", currentUser.uid, "cart");
        unsubscribeCart = onSnapshot(cartRef, (snap) => {
          setCartItems(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });

        const favRef = collection(db, "users", currentUser.uid, "favorites");
        unsubscribeFav = onSnapshot(favRef, (snap) => {
          setFavItems(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
      } else {
        setUserData(null);
        setCartItems([]);
        setFavItems([]);
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeCart();
      unsubscribeFav();
    };
  }, []);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllProducts(products);
    });
    return () => unsubProducts();
  }, []);

  const addToCart = async (product) => {
    if (!user) return toast.error("Login to add to cart!");

    const productRef = doc(db, "products", product.id);
    const productSnap = await getDoc(productRef);
    const productData = productSnap.data();

    if (!productData || productData.stock <= 0) {
      return toast.warning("This product is out of stock!");
    }

    try {
      const ref = doc(db, "users", user.uid, "cart", product.id);
      await setDoc(ref, {
        productId: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        quantity: product.qty || 1,
        imageUrl: product.image || product.img || product.imageUrl || "",
        selectedWeight: product.selectedWeight || "",
        weights: product.weights || [],
        prices: product.prices || {},
      });
      toast.success("Added to Cart!");
    } catch (error) {
      console.error("Add Cart Error:", error);
      toast.error("Failed to add to cart.");
    }
  };

  const addToFav = async (product) => {
    if (!user) return toast.error("Login to add to favorites!");
    try {
      const ref = doc(db, "users", user.uid, "favorites", product.id);
      await setDoc(ref, {
        productId: product.id,
        name: product.name,
        imageUrl: product.image || product.img || product.imageUrl || "",
        price: product.price || 0,
        selectedWeight: product.selectedWeight || "",
        weights: product.weights || "100",
        prices: product.prices || {},
      });
      toast.success("Added to Favorites!");
    } catch (error) {
      console.error("Add Fav Error:", error);
      toast.error("Failed to add to favorites.");
    }
  };

  const increaseQuantity = async (item) => {
    const ref = doc(db, "users", user.uid, "cart", item.id);
    await updateDoc(ref, { quantity: item.quantity + 1 });
  };

  const decreaseQuantity = async (item) => {
    if (item.quantity > 1) {
      const ref = doc(db, "users", user.uid, "cart", item.id);
      await updateDoc(ref, { quantity: item.quantity - 1 });
    }
  };

  const removeItem = async (itemId) => {
    const ref = doc(db, "users", user.uid, "cart", itemId);
    await deleteDoc(ref);
    toast.success("Item removed from cart");
  };

  const removeFavItem = async (itemId) => {
    const ref = doc(db, "users", user.uid, "favorites", itemId);
    await deleteDoc(ref);
    toast.success("Removed from Favorites");
  };

  const clearCart = async () => {
    const ref = collection(db, "users", user.uid, "cart");
    const snap = await getDocs(ref);
    const batchPromises = snap.docs.map((docu) => deleteDoc(doc(db, "users", user.uid, "cart", docu.id)));
    await Promise.all(batchPromises);
    toast.success("Cleared Cart");
  };

  const updateWeight = async (productId, newWeight, newPrice) => {
    const ref = doc(db, "users", user.uid, "cart", productId);
    await updateDoc(ref, { selectedWeight: newWeight, price: newPrice });
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        userData,
        loading,
        allProducts,
        cartItems,
        favItems,
        addToCart,
        addToFav,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        removeFavItem,
        clearCart,
        updateWeight,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);