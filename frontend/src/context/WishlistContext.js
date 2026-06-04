import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { safeParse, WISHLIST_STORAGE_KEY } from '../utils/wishlistStorage';

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) { 

  const [likedIds, setLikedIds] = useState(() => {
    const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const arr = safeParse(saved);
    return Array.isArray(arr) ? arr : [];
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(likedIds));
  }, [likedIds]);

  const isLiked = (id) => likedIds.includes(id);

  const addToWishlist = (product) => {
    if (!product || typeof product.id === 'undefined' || product.id === null) return;
    const productId = product.id;
    setLikedIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
  };

  const removeFromWishlist = (id) => {
    setLikedIds((prev) => prev.filter((x) => x !== id));
  };

  const toggleWishlist = (product) => {
    if (!product) return;
    const id = product.id ?? product._id;
    if (typeof id === 'undefined' || id === null) return;
    const strId = String(id);
    setLikedIds((prev) => (prev.includes(strId) ? prev.filter((x) => x !== strId) : [...prev, strId]));
  };

  const likedCount = likedIds.length;

  const value = useMemo(
    () => ({
      likedIds,
      likedCount,
      isLiked,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
    }),
    [likedIds, likedCount]
  );

  return React.createElement(
    WishlistContext.Provider,
    { value },
    children
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

