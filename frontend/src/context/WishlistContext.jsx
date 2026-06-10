import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export const WishlistContext = createContext(null);

const LOCAL_KEY = 'roopvibe_wishlist';
const BASE      = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('roopvibe_token');
}

export function WishlistProvider({ children }) {
  const [likedIds, setLikedIds] = useState(() => {
    try { const d = JSON.parse(localStorage.getItem(LOCAL_KEY)); return Array.isArray(d) ? d : []; }
    catch { return []; }
  });
  const [synced, setSynced] = useState(false);

  const fetchWishlistFromServer = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res  = await fetch(`${BASE}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLikedIds(data.productIds || []);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(data.productIds || []));
      }
    } catch (e) { /* silent */ }
    finally { setSynced(true); }
  }, []);

  const saveWishlistToServer = useCallback(async (ids) => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${BASE}/wishlist/save`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ productIds: ids }),
      });
    } catch (e) { /* silent */ }
  }, []);

  useEffect(() => { fetchWishlistFromServer(); }, [fetchWishlistFromServer]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(likedIds));
    if (synced) saveWishlistToServer(likedIds);
  }, [likedIds, synced, saveWishlistToServer]);

  const toggleWishlist = (product) => {
    if (!product) return;
    const id = String(product.id ?? product._id ?? '');
    if (!id) return;
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addToWishlist    = (product) => {
    if (!product) return;
    const id = String(product.id ?? product._id ?? '');
    if (!id) return;
    setLikedIds((prev) => prev.includes(id) ? prev : [...prev, id]);
  };

  const removeFromWishlist = (id) => setLikedIds((prev) => prev.filter((x) => x !== String(id)));

  const isLiked      = (id) => likedIds.includes(String(id));
  const likedCount   = likedIds.length;

  const value = useMemo(() => ({
    likedIds, likedCount,
    isLiked, addToWishlist,
    removeFromWishlist, toggleWishlist,
    fetchWishlistFromServer,
  }), [likedIds, likedCount]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}