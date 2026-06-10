import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const LOCAL_KEY = 'roopvibe_cart';

function getToken() {
  return localStorage.getItem('roopvibe_token');
}

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; }
    catch { return []; }
  });
  const [synced, setSynced] = useState(false);

  // Login ke baad backend se fetch karo
  const fetchCartFromServer = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res  = await fetch(`${BASE}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCartItems(data.items || []);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(data.items || []));
      }
    } catch (e) {
      // network error — local data use karo
    } finally {
      setSynced(true);
    }
  }, []);

  // Backend pe save karo
  const saveCartToServer = useCallback(async (items) => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${BASE}/cart/save`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ items }),
      });
    } catch (e) { /* silent */ }
  }, []);

  // App start pe fetch karo
  useEffect(() => { fetchCartFromServer(); }, [fetchCartFromServer]);

  // Har change pe localStorage + backend sync
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(cartItems));
    if (synced) saveCartToServer(cartItems);
  }, [cartItems, synced, saveCartToServer]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => setCartItems((prev) => prev.filter((item) => item.id !== id));

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem(LOCAL_KEY);
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${BASE}/cart/clear`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) { /* silent */ }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart,
      updateQuantity, clearCart,
      cartCount, cartTotal,
      fetchCartFromServer,
    }}>
      {children}
    </CartContext.Provider>
  );
};