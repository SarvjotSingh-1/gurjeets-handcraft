import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import wishlistService from '../api/wishlistService';

const WishlistContext = createContext(null);

const STORAGE_KEY = 'gurjeet_wishlist';

// Helper to filter out corrupt/deleted item structures
const sanitizeWishlistItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && item._id && item.title);
};

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? sanitizeWishlistItems(JSON.parse(saved)) : [];
    } catch (e) {
      console.warn('Error loading wishlist from localStorage:', e);
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const isSyncingRef = useRef(false);

  // Sync to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (e) {
      console.warn('Error saving wishlist to localStorage:', e);
    }
  }, [wishlistItems]);

  // Synchronize with server when authentication state changes
  useEffect(() => {
    let isMounted = true;

    const syncWithServer = async () => {
      if (!isAuthenticated || !user) return;
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      try {
        setLoading(true);
        // 1. Fetch server wishlist
        const serverItems = await wishlistService.getWishlist();
        const cleanServerItems = sanitizeWishlistItems(serverItems);

        // 2. Retrieve any pending guest items from localStorage
        let localGuestItems = [];
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          localGuestItems = saved ? sanitizeWishlistItems(JSON.parse(saved)) : [];
        } catch (err) {}

        // 3. Merge guest items into server account
        const serverItemIds = new Set(cleanServerItems.map((it) => String(it._id)));
        const itemsToSync = localGuestItems.filter((it) => !serverItemIds.has(String(it._id)));

        for (const guestItem of itemsToSync) {
          try {
            await wishlistService.addToWishlist(guestItem._id);
            cleanServerItems.push(guestItem);
          } catch (err) {
            // Item might have been deleted from catalog
          }
        }

        if (isMounted) {
          setWishlistItems(cleanServerItems);
        }
      } catch (err) {
        console.warn('Failed to synchronize wishlist with server:', err.message);
      } finally {
        if (isMounted) setLoading(false);
        isSyncingRef.current = false;
      }
    };

    syncWithServer();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  /**
   * Check if a creation is currently in the customer's wishlist
   */
  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      const targetId = String(productId);
      return wishlistItems.some((item) => String(item?._id) === targetId);
    },
    [wishlistItems]
  );

  /**
   * Add Product to Wishlist (Prevents duplicates)
   */
  const addToWishlist = useCallback(
    async (product) => {
      if (!product || !product._id) return;
      const targetId = String(product._id);

      // Prevent duplicates
      if (isInWishlist(targetId)) return;

      // Optimistically update local state
      setWishlistItems((prev) => {
        if (prev.some((item) => String(item._id) === targetId)) return prev;
        return [...prev, product];
      });

      // Synchronize with server if authenticated
      if (isAuthenticated) {
        try {
          await wishlistService.addToWishlist(product._id);
        } catch (err) {
          console.warn('Failed to sync added wishlist item to server:', err.message);
        }
      }
    },
    [isInWishlist, isAuthenticated]
  );

  /**
   * Remove Product from Wishlist
   */
  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!productId) return;
      const targetId = String(productId);

      // Optimistically remove from local state
      setWishlistItems((prev) => prev.filter((item) => String(item._id) !== targetId));

      // Synchronize with server if authenticated
      if (isAuthenticated) {
        try {
          await wishlistService.removeFromWishlist(productId);
        } catch (err) {
          console.warn('Failed to sync removed wishlist item with server:', err.message);
        }
      }
    },
    [isAuthenticated]
  );

  /**
   * Toggle saved status of a creation
   */
  const toggleWishlist = useCallback(
    (product) => {
      if (!product || !product._id) return;
      if (isInWishlist(product._id)) {
        removeFromWishlist(product._id);
        addToast(`Removed "${product.title}" from your wishlist`, 'info');
      } else {
        addToWishlist(product);
        addToast(`Saved "${product.title}" to your wishlist`, 'success');
      }
    },
    [isInWishlist, removeFromWishlist, addToWishlist, addToast]
  );

  /**
   * Clear all wishlist items
   */
  const clearWishlist = useCallback(async () => {
    const currentItems = [...wishlistItems];
    setWishlistItems([]);

    if (isAuthenticated) {
      for (const item of currentItems) {
        try {
          await wishlistService.removeFromWishlist(item._id);
        } catch (e) {}
      }
    }
  }, [wishlistItems, isAuthenticated]);

  /**
   * Check if a product is available to be added to cart
   */
  const isProductAvailable = (product) => {
    if (!product) return false;
    if (product.isAvailable === false && !product.isMadeToOrder) {
      return false;
    }
    if ((product.stock === 0 || product.stock < 1) && !product.isMadeToOrder) {
      return false;
    }
    return true;
  };

  /**
   * Move an item from Wishlist directly to the Cart
   */
  const moveToCart = (addToCartFn, product, quantity = 1, selectedColor = null) => {
    if (!product || !product._id) return { success: false, reason: 'invalid_product' };

    // Verify availability
    if (!isProductAvailable(product)) {
      addToast(
        `"${product.title}" is currently unavailable in studio. You can inquire directly on WhatsApp for a custom order.`,
        'warning'
      );
      return { success: false, reason: 'unavailable' };
    }

    const color = selectedColor || product.availableColors?.[0] || 'Natural Pure Wool';
    addToCartFn(product, quantity, color);
    removeFromWishlist(product._id);
    addToast(`"${product.title}" moved to your cart!`, 'success');
    return { success: true };
  };

  const totalWishlistItems = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        totalWishlistItems,
        loading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        isProductAvailable,
        moveToCart,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
