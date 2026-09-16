import { getProductByIdOrSlug } from './product.service.js';

const FREE_SHIPPING_THRESHOLD = 1499;
const STANDARD_SHIPPING_FEE = 99;

/**
 * Verify and calculate shopping cart items against live database records.
 * Enforces:
 * 1. Live price verification (never trust client prices)
 * 2. Real-time stock boundary enforcement (never exceed available stock)
 * 3. Availability and existence checks (handles deleted or deactivated pieces)
 * 
 * @param {Array} items - Array of { productId, quantity, selectedColor, craftNote }
 * @returns {Object} Verified cart calculation with status flags and pricing
 */
export const verifyCart = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
      shipping: 0,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      freeShippingRemaining: FREE_SHIPPING_THRESHOLD,
      isFreeShipping: false,
      total: 0,
      hasOutOfStockItems: false,
      hasDeletedItems: false,
      hasUnavailableItems: false,
      hasAdjustments: false,
      canCheckout: false,
    };
  }

  const verifiedItems = [];
  let subtotal = 0;
  let hasOutOfStockItems = false;
  let hasDeletedItems = false;
  let hasUnavailableItems = false;
  let hasAdjustments = false;

  for (const item of items) {
    const rawProductId = item.productId || item.product?._id || item.product;
    const requestedQty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const selectedColor = item.selectedColor || '';
    const craftNote = item.craftNote || '';

    if (!rawProductId) {
      hasDeletedItems = true;
      verifiedItems.push({
        productId: 'unknown',
        title: 'Unknown Product',
        image: '',
        unitPrice: 0,
        quantity: requestedQty,
        itemTotal: 0,
        stock: 0,
        isAvailable: false,
        selectedColor,
        craftNote,
        status: 'deleted',
        message: 'Product identifier missing or invalid.',
      });
      continue;
    }

    try {
      const product = await getProductByIdOrSlug(rawProductId);

      if (!product) {
        hasDeletedItems = true;
        verifiedItems.push({
          productId: rawProductId,
          title: item.title || 'Removed Product',
          image: item.image || '',
          unitPrice: 0,
          quantity: requestedQty,
          itemTotal: 0,
          stock: 0,
          isAvailable: false,
          selectedColor,
          craftNote,
          status: 'deleted',
          message: 'This piece is no longer available in the studio catalog.',
        });
        continue;
      }

      // 1. Check artisan availability flag
      if (product.isAvailable === false) {
        hasUnavailableItems = true;
        verifiedItems.push({
          productId: product._id,
          title: product.title,
          slug: product.slug,
          category: product.category,
          craftTechnique: product.craftTechnique,
          image: product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || '',
          unitPrice: Number(product.price),
          quantity: requestedQty,
          itemTotal: 0,
          stock: product.stock,
          isAvailable: false,
          isMadeToOrder: product.isMadeToOrder,
          selectedColor,
          craftNote,
          status: 'unavailable',
          message: `"${product.title}" is currently not available for purchase.`,
        });
        continue;
      }

      // 2. Check stock levels (never exceed available stock)
      const availableStock = product.stock !== undefined ? product.stock : 0;

      if (availableStock <= 0) {
        hasOutOfStockItems = true;
        verifiedItems.push({
          productId: product._id,
          title: product.title,
          slug: product.slug,
          category: product.category,
          craftTechnique: product.craftTechnique,
          image: product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || '',
          unitPrice: Number(product.price),
          quantity: requestedQty,
          itemTotal: 0,
          stock: 0,
          isAvailable: true,
          isMadeToOrder: product.isMadeToOrder,
          selectedColor,
          craftNote,
          status: 'out_of_stock',
          message: `"${product.title}" is currently out of stock.`,
        });
        continue;
      }

      let finalQty = requestedQty;
      let status = 'valid';
      let message = null;

      // Clamp quantity to available stock (never exceed available stock)
      if (requestedQty > availableStock) {
        finalQty = availableStock;
        status = 'quantity_adjusted';
        hasAdjustments = true;
        message = `Quantity adjusted to maximum available stock (${availableStock} remaining).`;
      }

      const verifiedPrice = Number(product.price);
      const itemTotal = verifiedPrice * finalQty;
      subtotal += itemTotal;

      verifiedItems.push({
        productId: product._id,
        title: product.title,
        slug: product.slug,
        category: product.category,
        craftTechnique: product.craftTechnique,
        image: product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || '',
        unitPrice: verifiedPrice, // authoritative database price
        quantity: finalQty,
        itemTotal,
        stock: availableStock,
        isAvailable: true,
        isMadeToOrder: Boolean(product.isMadeToOrder),
        selectedColor,
        craftNote,
        status,
        message,
      });
    } catch (err) {
      hasDeletedItems = true;
      verifiedItems.push({
        productId: rawProductId,
        title: item.title || 'Unavailable Piece',
        image: item.image || '',
        unitPrice: 0,
        quantity: requestedQty,
        itemTotal: 0,
        stock: 0,
        isAvailable: false,
        selectedColor,
        craftNote,
        status: 'deleted',
        message: 'This piece could not be retrieved from the catalog.',
      });
    }
  }

  // Shipping calculation
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = subtotal === 0 ? 0 : (isFreeShipping ? 0 : STANDARD_SHIPPING_FEE);
  const total = subtotal + shipping;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const validItemsCount = verifiedItems.filter(
    (it) => it.status === 'valid' || it.status === 'quantity_adjusted'
  ).length;

  const canCheckout =
    validItemsCount > 0 &&
    !hasOutOfStockItems &&
    !hasDeletedItems &&
    !hasUnavailableItems;

  return {
    items: verifiedItems,
    itemCount: verifiedItems.reduce((acc, item) => acc + (item.status === 'valid' || item.status === 'quantity_adjusted' ? item.quantity : 0), 0),
    subtotal,
    shipping,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    freeShippingRemaining,
    isFreeShipping,
    total,
    hasOutOfStockItems,
    hasDeletedItems,
    hasUnavailableItems,
    hasAdjustments,
    canCheckout,
  };
};
