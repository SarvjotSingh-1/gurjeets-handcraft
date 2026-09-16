import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client';

const CartContext = createContext();

const STORAGE_KEY = 'gurjeet_cart';
const FREE_SHIPPING_THRESHOLD = 1499;
const STANDARD_SHIPPING_FEE = 99;

export const CartProvider = ({ children }) => {
  // Load raw stored items from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error reading cart from localStorage', e);
      return [];
    }
  });

  // Authoritative server-verified cart state
  const [verifiedCart, setVerifiedCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    shipping: 0,
    total: 0,
    isFreeShipping: false,
    freeShippingRemaining: FREE_SHIPPING_THRESHOLD,
    hasOutOfStockItems: false,
    hasDeletedItems: false,
    hasUnavailableItems: false,
    hasAdjustments: false,
    canCheckout: false,
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [apiError, setApiError] = useState(null);
  const isInitialMount = useRef(true);

  // Synchronize cart changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [cartItems]);

  // Synchronize and verify cart with backend
  const verifyWithBackend = useCallback(async (currentItems) => {
    if (!currentItems || currentItems.length === 0) {
      setVerifiedCart({
        items: [],
        itemCount: 0,
        subtotal: 0,
        shipping: 0,
        total: 0,
        isFreeShipping: false,
        freeShippingRemaining: FREE_SHIPPING_THRESHOLD,
        hasOutOfStockItems: false,
        hasDeletedItems: false,
        hasUnavailableItems: false,
        hasAdjustments: false,
        canCheckout: false,
      });
      setApiError(null);
      return;
    }

    setIsVerifying(true);
    setApiError(null);

    try {
      const payload = {
        items: currentItems.map((item) => ({
          productId: item.product?._id || item.productId,
          quantity: item.quantity,
          selectedColor: item.selectedColor || '',
          craftNote: item.craftNote || '',
          title: item.product?.title || item.title || '',
          image: item.product?.images?.[0]?.url || item.image || '',
        })),
      };

      const res = await api.post('/cart/verify', payload);
      const data = res.data || res;

      if (data && data.items) {
        setVerifiedCart(data);

        // Check if backend clamped any quantities due to stock limits
        const hasClampedQty = data.items.some(
          (backendItem) =>
            backendItem.status === 'quantity_adjusted' &&
            currentItems.some(
              (ci) =>
                (ci.product?._id === backendItem.productId || ci.productId === backendItem.productId) &&
                ci.quantity !== backendItem.quantity
            )
        );

        // Synchronize local quantities to match authoritative clamped stock if needed
        if (hasClampedQty) {
          setCartItems((prev) =>
            prev.map((ci) => {
              const matchedBackend = data.items.find(
                (bi) =>
                  (bi.productId === ci.product?._id || bi.productId === ci.productId) &&
                  bi.selectedColor === (ci.selectedColor || '')
              );
              if (matchedBackend && matchedBackend.quantity !== ci.quantity) {
                return {
                  ...ci,
                  quantity: matchedBackend.quantity,
                };
              }
              return ci;
            })
          );
        }
      }
    } catch (err) {
      console.warn('Cart backend verification failed (using local estimate):', err.message);
      setApiError('Unable to connect to live studio catalog. Displaying estimated pricing.');

      // Fallback: estimate from local storage items so customer is not blocked
      const estSubtotal = currentItems.reduce(
        (acc, item) => acc + (item.product?.price || item.unitPrice || 0) * item.quantity,
        0
      );
      const isFree = estSubtotal >= FREE_SHIPPING_THRESHOLD;
      const estShipping = estSubtotal === 0 ? 0 : isFree ? 0 : STANDARD_SHIPPING_FEE;

      setVerifiedCart({
        items: currentItems.map((item) => ({
          productId: item.product?._id || item.productId,
          title: item.product?.title || item.title || 'Handcrafted Woolen Piece',
          slug: item.product?.slug || '',
          category: item.product?.category || '',
          craftTechnique: item.product?.craftTechnique || '',
          image: item.product?.images?.[0]?.url || item.image || '',
          unitPrice: item.product?.price || item.unitPrice || 0,
          quantity: item.quantity,
          itemTotal: (item.product?.price || item.unitPrice || 0) * item.quantity,
          stock: item.product?.stock !== undefined ? item.product.stock : 1,
          isAvailable: true,
          selectedColor: item.selectedColor || '',
          craftNote: item.craftNote || '',
          status: 'valid',
          message: null,
        })),
        itemCount: currentItems.reduce((acc, item) => acc + item.quantity, 0),
        subtotal: estSubtotal,
        shipping: estShipping,
        total: estSubtotal + estShipping,
        isFreeShipping: isFree,
        freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - estSubtotal),
        hasOutOfStockItems: false,
        hasDeletedItems: false,
        hasUnavailableItems: false,
        hasAdjustments: false,
        canCheckout: currentItems.length > 0,
      });
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // Run verification on mount and when cart items change
  useEffect(() => {
    verifyWithBackend(cartItems);
  }, [cartItems, verifyWithBackend]);

  /**
   * Add Item to Shopping Cart with Stock Guarding
   * Rules: Never exceed available stock.
   */
  const addToCart = (product, requestedQuantity = 1, selectedColor = '', craftNote = '') => {
    if (!product) return { success: false, reason: 'missing_product' };

    const availableStock = product.stock !== undefined ? product.stock : 1;
    const isOutOfStock = availableStock <= 0;

    if (isOutOfStock) {
      return {
        success: false,
        reason: 'out_of_stock',
        message: `"${product.title}" is currently out of stock.`,
      };
    }

    let addedQty = 0;
    let reachedMax = false;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          (item.product?._id === product._id || item.productId === product._id) &&
          item.selectedColor === selectedColor
      );

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const maxAddable = Math.max(0, availableStock - currentQty);

        if (maxAddable <= 0) {
          reachedMax = true;
          return prev;
        }

        const toAdd = Math.min(requestedQuantity, maxAddable);
        addedQty = toAdd;
        reachedMax = currentQty + toAdd >= availableStock;

        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          product,
          quantity: currentQty + toAdd,
          selectedColor,
          craftNote: craftNote || updated[existingIndex].craftNote,
        };
        return updated;
      }

      const toAdd = Math.min(requestedQuantity, availableStock);
      addedQty = toAdd;
      reachedMax = toAdd >= availableStock;

      return [
        ...prev,
        {
          product,
          productId: product._id,
          quantity: toAdd,
          selectedColor,
          craftNote,
        },
      ];
    });

    if (addedQty === 0) {
      return {
        success: false,
        reason: 'stock_limit_reached',
        availableStock,
        message: `You already have all ${availableStock} available pieces of "${product.title}" in your bag.`,
      };
    }

    return {
      success: true,
      addedQuantity: addedQty,
      reachedMax,
      availableStock,
      message: `Added ${addedQty} piece${addedQty > 1 ? 's' : ''} to your bag.`,
    };
  };

  /**
   * Remove Item from Cart
   */
  const removeFromCart = (productId, selectedColor = '') => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !((item.product?._id === productId || item.productId === productId) &&
            item.selectedColor === selectedColor)
      )
    );
  };

  /**
   * Update Quantity with Stock Guarding
   * Rules: Never exceed available stock.
   */
  const updateQuantity = (productId, requestedQuantity, selectedColor = '') => {
    if (requestedQuantity <= 0) {
      removeFromCart(productId, selectedColor);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (
          (item.product?._id === productId || item.productId === productId) &&
          item.selectedColor === selectedColor
        ) {
          // Look up stock limit from verified cart or item product object
          const verifiedItem = verifiedCart.items.find(
            (vi) => vi.productId === productId && vi.selectedColor === selectedColor
          );
          const maxStock =
            verifiedItem?.stock !== undefined
              ? verifiedItem.stock
              : item.product?.stock !== undefined
              ? item.product.stock
              : 99;

          const clampedQty = Math.min(requestedQuantity, Math.max(1, maxStock));
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    setCartItems([]);
    setVerifiedCart({
      items: [],
      itemCount: 0,
      subtotal: 0,
      shipping: 0,
      total: 0,
      isFreeShipping: false,
      freeShippingRemaining: FREE_SHIPPING_THRESHOLD,
      hasOutOfStockItems: false,
      hasDeletedItems: false,
      hasUnavailableItems: false,
      hasAdjustments: false,
      canCheckout: false,
    });
  };

  // Merge verified item details with cart items for UI display
  const displayItems = verifiedCart.items.length > 0
    ? verifiedCart.items
    : cartItems.map((item) => ({
        productId: item.product?._id || item.productId,
        title: item.product?.title || 'Handcrafted Woolen Piece',
        slug: item.product?.slug || '',
        category: item.product?.category || '',
        craftTechnique: item.product?.craftTechnique || '',
        image: item.product?.images?.[0]?.url || item.image || '',
        unitPrice: item.product?.price || 0,
        quantity: item.quantity,
        itemTotal: (item.product?.price || 0) * item.quantity,
        stock: item.product?.stock !== undefined ? item.product.stock : 1,
        isAvailable: true,
        selectedColor: item.selectedColor || '',
        craftNote: item.craftNote || '',
        status: 'valid',
        message: null,
      }));

  const totalItems = verifiedCart.itemCount || cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems: displayItems,
        rawItems: cartItems,
        totalItems,
        subtotal: verifiedCart.subtotal,
        shipping: verifiedCart.shipping,
        total: verifiedCart.total,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        freeShippingRemaining: verifiedCart.freeShippingRemaining,
        isFreeShipping: verifiedCart.isFreeShipping,
        hasOutOfStockItems: verifiedCart.hasOutOfStockItems,
        hasDeletedItems: verifiedCart.hasDeletedItems,
        hasUnavailableItems: verifiedCart.hasUnavailableItems,
        hasAdjustments: verifiedCart.hasAdjustments,
        canCheckout: verifiedCart.canCheckout,
        isVerifying,
        apiError,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        verifyCart: () => verifyWithBackend(cartItems),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
