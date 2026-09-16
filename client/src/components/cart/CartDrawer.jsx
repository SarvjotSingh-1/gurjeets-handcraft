import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  ArrowRight,
  Trash2,
  MessageCircle,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { BUSINESS_CONFIG } from '../../config/business';
import Button from '../common/Button';

export const CartDrawer = ({ isOpen, onClose }) => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal,
    shipping,
    total,
    totalItems,
    canCheckout,
    hasOutOfStockItems,
    hasDeletedItems,
  } = useCart();

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const whatsappBagUrl = BUSINESS_CONFIG.getOrderRequestWhatsAppUrl({
    orderNumber: 'BAG-INQUIRY',
    name: 'Valued Customer',
    totalAmount: total,
    items: cartItems.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      selectedColor: item.selectedColor,
    })),
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-artisan-earthBrown/50 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="relative w-full max-w-md h-full bg-artisan-ivory border-l border-artisan-heather shadow-drawer z-10 flex flex-col justify-between"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag drawer"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-artisan-heather/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-artisan-terracotta" />
                <h2 className="font-serif text-lg font-bold text-artisan-earthBrown">
                  Shopping Bag
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-artisan-cream border border-artisan-heather text-artisan-softBrown">
                  {totalItems} {totalItems === 1 ? 'piece' : 'pieces'}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-artisan-softBrown hover:text-artisan-earthBrown hover:bg-artisan-cream transition tap-target"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning banner inside drawer if items require attention */}
            {(hasOutOfStockItems || hasDeletedItems) && (
              <div className="px-5 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                <span>Some items are out of stock. Please review your bag.</span>
              </div>
            )}

            {/* Content / Items List */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-16 h-16 rounded-2xl bg-artisan-cream border border-artisan-heather flex items-center justify-center text-3xl">
                    🧶
                  </div>
                  <div className="space-y-1">
                    <p className="font-serif text-base font-semibold text-artisan-earthBrown">
                      Your bag is empty
                    </p>
                    <p className="text-xs text-artisan-softBrown max-w-xs leading-relaxed">
                      Discover handmade woolen scarves, beanies, gloves, and mufflers crafted by Gurjeet.
                    </p>
                  </div>
                  <Link to="/shop" onClick={onClose}>
                    <Button size="sm">Explore Creations</Button>
                  </Link>
                </div>
              ) : (
                cartItems.map((item, idx) => {
                  const maxStock = item.stock !== undefined ? item.stock : 99;
                  const isAtMaxStock = item.quantity >= maxStock;
                  const isOOS = item.status === 'out_of_stock' || item.status === 'deleted';

                  return (
                    <div
                      key={`${item.productId}-${item.selectedColor}-${idx}`}
                      className={`p-3.5 rounded-2xl border space-y-3 transition-all ${
                        isOOS
                          ? 'bg-rose-50/50 border-rose-200'
                          : 'bg-artisan-cream border-artisan-heather/70'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-artisan-ivory border border-artisan-heather/60 flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-artisan-softBrown/50">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        {/* Title & Info */}
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-artisan-earthBrown line-clamp-1">
                            {item.title || 'Handmade Woolen Piece'}
                          </h4>
                          {item.selectedColor && (
                            <p className="text-[10px] text-artisan-softBrown">
                              Color: <span className="font-semibold text-artisan-earthBrown">{item.selectedColor}</span>
                            </p>
                          )}
                          <p className="text-xs font-bold text-artisan-terracotta">
                            ₹{(item.unitPrice || 0).toLocaleString('en-IN')}
                          </p>

                          {isOOS && (
                            <span className="text-[10px] font-bold text-rose-600 block">
                              {item.message || 'Out of Stock'}
                            </span>
                          )}
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.selectedColor)}
                          className="p-1 text-artisan-softBrown hover:text-rose-600 transition"
                          title="Remove item"
                          aria-label={`Remove ${item.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity Stepper & Line Total */}
                      <div className="flex items-center justify-between pt-1 border-t border-artisan-heather/40 text-xs">
                        <div className="inline-flex items-center border border-artisan-heather rounded-lg bg-artisan-ivory text-xs overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedColor)}
                            disabled={item.quantity <= 1}
                            className="px-2.5 py-1 text-xs font-bold text-artisan-earthBrown hover:bg-artisan-cream disabled:opacity-40 transition"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-1 font-bold text-artisan-earthBrown min-w-[1.75rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedColor)}
                            disabled={isAtMaxStock || isOOS}
                            className="px-2.5 py-1 text-xs font-bold text-artisan-earthBrown hover:bg-artisan-cream disabled:opacity-40 transition"
                            title={isAtMaxStock ? 'Maximum available stock reached' : 'Increase quantity'}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-serif font-bold text-artisan-earthBrown">
                          ₹{((item.unitPrice || 0) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary & Actions */}
            {cartItems.length > 0 && (
              <div className="p-5 sm:p-6 border-t border-artisan-heather bg-artisan-ivory space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-artisan-softBrown">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-artisan-earthBrown">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-artisan-softBrown">
                    <span>Shipping:</span>
                    <span className="font-semibold text-artisan-earthBrown">
                      {shipping === 0 ? (
                        <span className="text-emerald-700 font-bold">FREE</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-artisan-heather/70 flex justify-between text-sm font-serif font-bold text-artisan-earthBrown">
                    <span>Estimated Total:</span>
                    <span className="font-serif text-lg font-bold text-artisan-terracotta">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    <Link
                      to="/cart"
                      onClick={onClose}
                      className="flex-1"
                    >
                      <Button
                        variant="secondary"
                        size="md"
                        className="w-full justify-center text-xs"
                      >
                        View Full Bag
                      </Button>
                    </Link>

                    {canCheckout ? (
                      <Link
                        to="/checkout"
                        onClick={onClose}
                        className="flex-1"
                      >
                        <Button size="md" className="w-full justify-center text-xs">
                          <span>Checkout</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex-1 py-2 px-3 rounded-2xl bg-artisan-sandstone/40 border border-artisan-heather text-xs font-bold text-artisan-softBrown cursor-not-allowed text-center"
                      >
                        Unavailable
                      </button>
                    )}
                  </div>

                  <a
                    href={whatsappBagUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full gap-2 text-xs border-emerald-600/30 hover:bg-emerald-50 text-emerald-900 justify-center"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Order via WhatsApp</span>
                    </Button>
                  </a>
                </div>

                <p className="text-[10px] text-center text-artisan-softBrown italic">
                  *Orders are confirmed personally by Gurjeet with no online payment required.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
