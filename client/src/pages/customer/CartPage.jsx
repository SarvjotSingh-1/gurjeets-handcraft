import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { BUSINESS_CONFIG } from '../../config/business';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SEO from '../../components/common/SEO';
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Trash2,
  MessageCircle,
  Info,
  AlertTriangle,
  CheckCircle2,
  Package,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal,
    shipping,
    total,
    freeShippingThreshold,
    freeShippingRemaining,
    isFreeShipping,
    totalItems,
    hasOutOfStockItems,
    hasDeletedItems,
    hasAdjustments,
    canCheckout,
    isVerifying,
    apiError,
    verifyCart,
  } = useCart();

  // Pre-filled WhatsApp inquiry link with verified cart contents
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

  // Empty cart view
  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 sm:py-24 space-y-8 px-4">
        <SEO title="Shopping Bag | Gurjeet's Handcraft" noindex={true} />
        <div className="w-24 h-24 mx-auto rounded-3xl bg-artisan-cream border border-artisan-heather flex items-center justify-center text-4xl shadow-subtle animate-fade-in">
          🧶
        </div>
        <div className="space-y-3">
          <Badge variant="terracotta">Your Bag is Empty</Badge>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown">
            No Handcrafted Pieces Yet
          </h1>
          <p className="text-xs sm:text-sm text-artisan-softBrown max-w-md mx-auto leading-relaxed">
            Every piece in Gurjeet's atelier begins with pure Himalayan wool, time, and careful hands. Explore our collection of scarves, beanies, gloves, and mufflers.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/shop">
            <Button size="lg" className="gap-2 shadow-subtle tap-target">
              <span>Explore The Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 space-y-8">
      <SEO title="Shopping Bag | Gurjeet's Handcraft" noindex={true} />
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-artisan-heather pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <Badge variant="terracotta">
              <ShoppingBag className="w-3 h-3 mr-1 inline" />
              Your Bag
            </Badge>
            <span className="text-xs text-artisan-softBrown font-medium">
              &bull; {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown tracking-tight">
            Shopping Bag
          </h1>
          <p className="text-xs sm:text-sm text-artisan-softBrown">
            Review your selected handcrafted items before sending your order inquiry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={verifyCart}
            disabled={isVerifying}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-artisan-cream border border-artisan-heather text-xs font-semibold text-artisan-earthBrown hover:bg-artisan-sandstone/30 transition tap-target"
            title="Re-verify price & stock with live catalog"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying...' : 'Check Stock'}</span>
          </button>

          <Link to="/shop">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Network / Offline Error Notice */}
      {apiError && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-3 shadow-subtle"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
          <button
            type="button"
            onClick={verifyCart}
            className="underline font-bold hover:text-amber-900 flex-shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Out of Stock Warning Banner */}
      {(hasOutOfStockItems || hasDeletedItems) && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-subtle"
        >
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Items Require Attention</p>
            <p className="text-[11px] leading-relaxed">
              One or more pieces in your bag are currently out of stock or have been updated in the studio catalog. Please remove unavailable items to continue to checkout.
            </p>
          </div>
        </div>
      )}

      {/* Quantity Adjustment Notification */}
      {hasAdjustments && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5 shadow-subtle"
        >
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            Some item quantities were automatically adjusted to match Gurjeet's remaining studio stock.
          </span>
        </div>
      )}

      {/* Free Shipping Progress Card */}
      <div className="p-4 rounded-2xl bg-artisan-cream border border-artisan-heather space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-artisan-earthBrown flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-artisan-terracotta" />
            <span>Delivery Policy</span>
          </span>
          <span className="font-bold text-artisan-terracotta">
            {isFreeShipping
              ? '🎉 You unlocked FREE Delivery across India!'
              : `Add ₹${freeShippingRemaining.toLocaleString('en-IN')} more for FREE Delivery`}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-artisan-heather/50 overflow-hidden">
          <div
            className="h-full bg-artisan-terracotta transition-all duration-500 rounded-full"
            style={{
              width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
            }}
          />
        </div>
        <p className="text-[11px] text-artisan-softBrown">
          Orders ₹1,499 and above receive complimentary shipping across India (standard delivery is flat ₹99).
        </p>
      </div>

      {/* Main Grid: Item List & Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Item Cards */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, index) => {
            const isOOS = item.status === 'out_of_stock';
            const isDeleted = item.status === 'deleted';
            const isUnavailable = item.status === 'unavailable';
            const hasStockIssue = isOOS || isDeleted || isUnavailable;
            const maxStock = item.stock !== undefined ? item.stock : 99;
            const isAtMaxStock = item.quantity >= maxStock;

            return (
              <div
                key={`${item.productId}-${item.selectedColor}-${index}`}
                className={`p-4 sm:p-5 rounded-3xl bg-artisan-cream border transition-all space-y-4 shadow-subtle ${
                  hasStockIssue
                    ? 'border-rose-300 bg-rose-50/40'
                    : 'border-artisan-heather hover:border-artisan-terracotta/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Thumbnail & Product Details */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-artisan-ivory border border-artisan-heather/60 flex-shrink-0 shadow-subtle">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-artisan-softBrown/60">
                          <Package className="w-6 h-6 stroke-[1.5]" />
                          <span className="text-[9px] mt-0.5">Handmade</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.category && (
                          <span className="text-[10px] font-bold text-artisan-terracotta uppercase tracking-wider">
                            {item.category}
                          </span>
                        )}
                        {item.craftTechnique && (
                          <span className="text-[10px] text-artisan-softBrown font-medium">
                            &bull; {item.craftTechnique}
                          </span>
                        )}
                      </div>

                      {item.slug ? (
                        <Link
                          to={`/product/${item.slug}`}
                          className="font-serif font-bold text-sm sm:text-base text-artisan-earthBrown hover:text-artisan-terracotta transition line-clamp-1"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <h3 className="font-serif font-bold text-sm sm:text-base text-artisan-earthBrown line-clamp-1">
                          {item.title}
                        </h3>
                      )}

                      {item.selectedColor && (
                        <p className="text-xs text-artisan-softBrown">
                          Color: <strong className="text-artisan-earthBrown">{item.selectedColor}</strong>
                        </p>
                      )}

                      {/* Stock Status Badge */}
                      <div className="pt-0.5">
                        {isOOS ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                            Out of Stock
                          </span>
                        ) : isDeleted ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                            Removed from Catalog
                          </span>
                        ) : isUnavailable ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Currently Unavailable
                          </span>
                        ) : item.isMadeToOrder ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-artisan-ivory border border-artisan-heather text-artisan-softBrown">
                            Made to Order
                          </span>
                        ) : maxStock <= 2 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Only {maxStock} left in studio!
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-artisan-softBrown">
                            In Stock ({maxStock} available)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-artisan-heather/50">
                    <div className="text-left sm:text-right">
                      <p className="font-serif font-bold text-base sm:text-lg text-artisan-earthBrown">
                        ₹{item.itemTotal?.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] text-artisan-softBrown">
                        ₹{item.unitPrice?.toLocaleString('en-IN')} each
                      </p>
                    </div>

                    {/* Stepper Controls */}
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center border border-artisan-heather rounded-xl bg-artisan-ivory shadow-subtle overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedColor)}
                          disabled={item.quantity <= 1}
                          className="px-3 py-1.5 text-xs font-bold text-artisan-earthBrown hover:bg-artisan-cream disabled:opacity-40 disabled:cursor-not-allowed transition"
                          title="Decrease quantity"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-artisan-earthBrown min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedColor)}
                          disabled={isAtMaxStock || hasStockIssue}
                          className="px-3 py-1.5 text-xs font-bold text-artisan-earthBrown hover:bg-artisan-cream disabled:opacity-40 disabled:cursor-not-allowed transition"
                          title={isAtMaxStock ? 'Maximum available stock reached' : 'Increase quantity'}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId, item.selectedColor)}
                        className="p-2 rounded-xl text-artisan-softBrown hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Remove from bag"
                        aria-label={`Remove ${item.title} from shopping bag`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stock Warning Message for Specific Item */}
                {item.message && (
                  <div className="p-2.5 rounded-xl bg-artisan-ivory border border-artisan-heather text-[11px] text-artisan-softBrown flex items-center justify-between gap-2">
                    <span className="text-artisan-terracotta font-medium">{item.message}</span>
                    {hasStockIssue && (
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId, item.selectedColor)}
                        className="text-xs font-bold text-rose-600 hover:underline flex-shrink-0"
                      >
                        Remove Item
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-6 shadow-cozy sticky top-24">
          <div>
            <h2 className="font-serif text-xl font-bold text-artisan-earthBrown">
              Order Summary
            </h2>
            <p className="text-xs text-artisan-softBrown mt-0.5">
              Personalized artisan inquiry & delivery
            </p>
          </div>

          <div className="space-y-3 text-xs sm:text-sm border-y border-artisan-heather/70 py-4">
            <div className="flex justify-between items-center text-artisan-softBrown">
              <span>Subtotal ({totalItems} items):</span>
              <span className="font-semibold text-artisan-earthBrown">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center text-artisan-softBrown">
              <span>Delivery / Shipping:</span>
              <span className="font-semibold text-artisan-earthBrown">
                {shipping === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  `₹${shipping}`
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-artisan-heather/60 flex justify-between items-baseline">
              <span className="font-serif text-base font-bold text-artisan-earthBrown">
                Estimated Total:
              </span>
              <span className="font-serif text-2xl font-bold text-artisan-terracotta">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Checkout and WhatsApp Actions */}
          <div className="space-y-3">
            {canCheckout ? (
              <Link to="/checkout" className="block">
                <Button size="lg" className="w-full justify-center shadow-subtle tap-target">
                  <span>Proceed to Order Request</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-4 rounded-2xl bg-artisan-sandstone/40 border border-artisan-heather text-xs font-bold text-artisan-softBrown cursor-not-allowed text-center"
              >
                Resolve Stock Issues to Checkout
              </button>
            )}

            <a
              href={whatsappBagUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="secondary"
                size="md"
                className="w-full justify-center gap-2 text-xs border-emerald-600/30 hover:bg-emerald-50 text-emerald-900"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Ask About This Bag on WhatsApp</span>
              </Button>
            </a>
          </div>

          {/* Artisan Handcrafted Model Notice */}
          <div className="p-3.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-[11px] text-artisan-softBrown space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-artisan-earthBrown">
              <ShieldCheck className="w-3.5 h-3.5 text-artisan-terracotta flex-shrink-0" />
              <span>No Online Payment Required</span>
            </div>
            <p className="leading-relaxed">
              {BUSINESS_CONFIG.confirmationDisclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
