// StoreContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const username = localStorage.getItem("username");

  const getStorage = (key, fallback = []) => {
    if (!username) return fallback;
    const stored = localStorage.getItem(`${username}_${key}`);
    try {
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const [favorites, setFavorites] = useState(() => getStorage("favorites"));
  const [cartItems, setCartItems] = useState(() => getStorage("cart"));
  const [address, setAddress] = useState(() =>
    getStorage("address", {
      shipping: {},
      billing: {},
    })
  );

  useEffect(() => {
    if (username) {
      localStorage.setItem(`${username}_favorites`, JSON.stringify(favorites));
    }
  }, [favorites, username]);

  useEffect(() => {
    if (username) {
      localStorage.setItem(`${username}_cart`, JSON.stringify(cartItems));
    }
  }, [cartItems, username]);

  useEffect(() => {
    if (username) {
      localStorage.setItem(`${username}_address`, JSON.stringify(address));
    }
  }, [address, username]);

  const addToFavorites = (product) => {
    if (!favorites.some((item) => item.id === product.id)) {
      setFavorites([...favorites, product]);
    }
  };

  const removeFromFavorites = (productId) => {
    setFavorites(favorites.filter((item) => item.id !== productId));
  };

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find(
        (item) =>
          item.id === product.id &&
          item.selectedWeight === product.selectedWeight // Check ID + Weight
      );

      if (existing) {
        return prevItems.map((item) =>
          item.id === product.id &&
          item.selectedWeight === product.selectedWeight
            ? { ...item, qty: item.qty + (product.qty || 1) }
            : item
        );
      } else {
        return [...prevItems, { ...product, qty: product.qty || 1 }];
      }
    });
  };

  const updateCartQty = (productId, newQty) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, qty: newQty } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item.id !== productId));
  };

  return (
    <StoreContext.Provider
      value={{
        favorites,
        cartItems,
        address,
        setAddress,
        addToFavorites,
        removeFromFavorites,
        addToCart,
        removeFromCart,
        updateCartQty,
        setFavorites,
        setCartItems,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
