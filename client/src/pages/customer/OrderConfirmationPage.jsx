import React, { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  Phone,
  Printer,
  Copy,
  Check,
  ShoppingBag,
  ArrowRight,
  Package,
  ShieldCheck,
  MapPin,
  Mail,
  User,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { SEO } from '../../components/common/SEO';
import { BUSINESS_CONFIG } from '../../config/business';
import api from '../../api/client';

export const OrderConfirmationPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [whatsappUrl, setWhatsappUrl] = useState(location.state?.whatsappUrl || '');
  const [loading, setLoading] = useState(!location.state?.order);
  const [copied, setCopied] = useState(false);

  // Fetch order if accessed via direct URL or refresh
  useEffect(() => {
    if (!order && orderNumber) {
      setLoading(true);
      api
        .get(`/orders/${orderNumber}`)
        .then((res) => {
          const ord = res.data || res;
          setOrder(ord);
          const generatedWa = BUSINESS_CONFIG.getOrderRequestWhatsAppUrl({
            orderNumber: ord.orderNumber,
            name: ord.customerInfo?.name,
            totalAmount: ord.totalAmount,
            items: ord.items || [],
          });
          setWhatsappUrl(generatedWa);
        })
        .catch((err) => {
          console.warn('Could not fetch order:', err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (order && !whatsappUrl) {
      const generatedWa = BUSINESS_CONFIG.getOrderRequestWhatsAppUrl({
        orderNumber: order.orderNumber,
        name: order.customerInfo?.name,
        totalAmount: order.totalAmount,
        items: order.items || [],
      });
      setWhatsappUrl(generatedWa);
    }
  }, [order, orderNumber, whatsappUrl]);

  const handleCopyOrderNumber = () => {
    if (!order?.orderNumber) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <SEO title="Loading Order Request | Gurjeet's Handcraft" noindex={true} />
        <div className="w-12 h-12 mx-auto rounded-full border-2 border-artisan-terracotta border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-artisan-softBrown">
          Retrieving your order request...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <SEO title="Order Not Found | Gurjeet's Handcraft" noindex={true} />
        <div className="w-16 h-16 mx-auto rounded-3xl bg-artisan-cream border border-artisan-heather flex items-center justify-center text-3xl">
          🧶
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-artisan-earthBrown">
            Order Request Not Found
          </h2>
          <p className="text-xs text-artisan-softBrown">
            We couldn't locate this order request. Please check the order number or contact Gurjeet directly.
          </p>
        </div>
        <Link to="/shop">
          <Button size="md">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-12 space-y-8 print:py-0">
      <SEO
        title={`Order #${order.orderNumber} Confirmed | Gurjeet's Handcraft`}
        noindex={true}
      />
      {/* Main Success Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-6 shadow-cozy">
        {/* Header Icon & Title */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shadow-subtle">
            <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="inline-flex items-center gap-2">
            <Badge variant="sage">Status: {order.orderStatus || 'Inquiry'}</Badge>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Payment: {order.paymentStatus || 'Pending'}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown">
            Order Request Received!
          </h1>
          <p className="text-xs sm:text-sm text-artisan-softBrown max-w-lg mx-auto leading-relaxed">
            Thank you, <strong className="text-artisan-earthBrown">{order.customerInfo?.name}</strong>. Your handcrafted order request has been logged in Gurjeet's atelier queue.
          </p>

          {/* Order Request Number Box */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-artisan-ivory border border-artisan-heather shadow-subtle mt-2">
            <span className="text-xs text-artisan-softBrown font-medium">Order Number:</span>
            <span className="font-mono text-sm font-bold text-artisan-terracotta">
              {order.orderNumber}
            </span>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="p-1 text-artisan-softBrown hover:text-artisan-earthBrown transition"
              title="Copy Order Number"
              aria-label="Copy order number"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Payment Pending Notice */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1.5 shadow-subtle">
          <div className="flex items-center gap-2 font-bold">
            <Clock className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>Payment Remains Pending</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Payment remains pending until Gurjeet personally verifies yarn feasibility, color tones, and production schedule. No payment is charged upfront online.
          </p>
        </div>

        {/* Itemized Piece Summary */}
        <div className="space-y-3 border-t border-artisan-heather/70 pt-6">
          <h3 className="font-serif text-base font-bold text-artisan-earthBrown flex items-center justify-between">
            <span>Handcrafted Pieces Requested</span>
            <span className="text-xs text-artisan-softBrown font-normal">
              {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
            </span>
          </h3>

          <div className="divide-y divide-artisan-heather/50 rounded-2xl bg-artisan-ivory border border-artisan-heather/70 overflow-hidden">
            {order.items?.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5 min-w-0">
                  <h4 className="font-serif font-bold text-artisan-earthBrown line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-artisan-softBrown">
                    Qty: <strong className="text-artisan-earthBrown">{item.quantity}</strong>
                    {item.selectedColor && ` &bull; Color: ${item.selectedColor}`}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-serif font-bold text-sm text-artisan-earthBrown">
                    ₹{((item.unitPrice || 0) * item.quantity).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-artisan-softBrown">
                    ₹{(item.unitPrice || 0).toLocaleString('en-IN')} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="p-4 rounded-2xl bg-artisan-ivory border border-artisan-heather/70 space-y-2 text-xs">
            <div className="flex justify-between text-artisan-softBrown">
              <span>Subtotal:</span>
              <span className="font-semibold text-artisan-earthBrown">
                ₹{order.subtotal?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-artisan-softBrown">
              <span>Shipping Fee:</span>
              <span className="font-semibold text-artisan-earthBrown">
                {order.shippingFee === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE Delivery</span>
                ) : (
                  `₹${order.shippingFee}`
                )}
              </span>
            </div>
            <div className="pt-2 border-t border-artisan-heather/60 flex justify-between items-baseline">
              <span className="font-serif text-sm font-bold text-artisan-earthBrown">
                Total Amount:
              </span>
              <span className="font-serif text-xl font-bold text-artisan-terracotta">
                ₹{order.totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Details Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-artisan-heather/70 pt-6 text-xs text-artisan-softBrown">
          <div className="p-4 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-artisan-earthBrown mb-1">
              <User className="w-3.5 h-3.5 text-artisan-terracotta" />
              <span>Customer Information</span>
            </div>
            <p><strong>Name:</strong> {order.customerInfo?.name}</p>
            <p><strong>Phone:</strong> {order.customerInfo?.phone}</p>
            <p><strong>Email:</strong> {order.customerInfo?.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-artisan-earthBrown mb-1">
              <MapPin className="w-3.5 h-3.5 text-artisan-terracotta" />
              <span>Delivery Address</span>
            </div>
            <p>{order.shippingAddress?.street}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
              {order.shippingAddress?.postalCode}
            </p>
            <p>{order.shippingAddress?.country || 'India'}</p>
          </div>
        </div>

        {/* Action Buttons: WhatsApp, Call, Print, Continue Browsing */}
        <div className="space-y-3 border-t border-artisan-heather/70 pt-6 print:hidden">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                size="lg"
                className="w-full justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-subtle"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Continue Discussion on WhatsApp</span>
              </Button>
            </a>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <a
              href={`tel:${BUSINESS_CONFIG.phone}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-artisan-heather bg-artisan-ivory text-xs font-semibold text-artisan-earthBrown hover:bg-artisan-sandstone/30 transition tap-target"
            >
              <Phone className="w-3.5 h-3.5 text-artisan-terracotta" />
              <span>Call: {BUSINESS_CONFIG.displayPhone}</span>
            </a>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-artisan-heather bg-artisan-ivory text-xs font-semibold text-artisan-earthBrown hover:bg-artisan-sandstone/30 transition tap-target"
            >
              <Printer className="w-3.5 h-3.5 text-artisan-softBrown" />
              <span>Print Receipt</span>
            </button>

            <Link to="/shop" className="block">
              <Button
                variant="secondary"
                size="md"
                className="w-full justify-center text-xs"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
