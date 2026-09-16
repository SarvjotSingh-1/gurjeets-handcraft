import React, { useEffect, useState } from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import VisualTimeline from './VisualTimeline';
import { BUSINESS_CONFIG } from '../../config/business';
import {
  X,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  User,
  MessageCircle,
  Printer,
  Copy,
  Check,
  FileText,
  Sparkles,
} from 'lucide-react';

export const OrderDetailModal = ({ order, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
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

  if (!isOpen || !order) return null;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Recent Order';

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Delivered':
        return 'sage';
      case 'Payment Confirmed':
      case 'Handmade':
      case 'Packed':
      case 'Shipped':
        return 'terracotta';
      case 'Cancelled':
        return 'amber';
      default:
        return 'craft';
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return {
          text: 'Payment Confirmed',
          className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
        };
      case 'Cancelled':
        return {
          text: 'Cancelled',
          className: 'bg-rose-50 text-rose-800 border border-rose-200',
        };
      default:
        return {
          text: 'Payment Pending',
          className: 'bg-amber-50 text-amber-800 border border-amber-200',
        };
    }
  };

  const paymentBadge = getPaymentStatusBadge(order.paymentStatus);

  const waMessage = `Hello Gurjeet,\nI am reaching out regarding my Order Request *${order.orderNumber}* (Status: ${order.orderStatus}). Could you please share an update?`;
  const waUrl = `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl bg-artisan-cream rounded-3xl border border-artisan-heather shadow-2xl overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-7 border-b border-artisan-heather/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-artisan-taupe uppercase tracking-wider">
                Order Request
              </span>
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                title="Copy Order ID"
                className="inline-flex items-center gap-1 font-mono text-xs font-bold text-artisan-terracotta hover:underline"
              >
                <span>{order.orderNumber}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-artisan-taupe" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-serif text-2xl font-bold text-artisan-espresso">
                Order Details
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(order.orderStatus)} size="md">
                  {order.orderStatus}
                </Badge>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${paymentBadge.className}`}>
                  {paymentBadge.text}
                </span>
              </div>
            </div>
            <p className="text-xs text-artisan-taupe flex items-center gap-1.5 pt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Placed on {formattedDate}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="self-end sm:self-start p-2 rounded-full bg-artisan-ivory hover:bg-artisan-heather text-artisan-espresso transition tap-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-7 max-h-[75vh] overflow-y-auto">
          {/* 1. Visual Timeline Progress */}
          <div className="p-5 sm:p-6 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-3">
            <h3 className="font-serif text-sm font-bold text-artisan-espresso uppercase tracking-wider">
              Craft & Delivery Status
            </h3>
            <VisualTimeline currentStatus={order.orderStatus} />
          </div>

          {/* 2. Items List */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-bold text-artisan-espresso flex items-center gap-2">
              <Package className="w-4 h-4 text-artisan-terracotta" />
              <span>Handcrafted Items ({order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0})</span>
            </h3>

            <div className="divide-y divide-artisan-heather border border-artisan-heather rounded-2xl bg-white/70 overflow-hidden">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-artisan-sandstone/10 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-artisan-sandstone/50 flex-shrink-0 flex items-center justify-center overflow-hidden border border-artisan-heather">
                      <Sparkles className="w-6 h-6 text-artisan-taupe/60" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-serif font-bold text-sm text-artisan-espresso">
                        {item.title}
                      </h4>
                      {item.selectedColor && (
                        <p className="text-xs text-artisan-taupe">
                          Color: <span className="font-medium text-artisan-espresso">{item.selectedColor}</span>
                        </p>
                      )}
                      {item.craftNote && (
                        <p className="text-[11px] text-artisan-taupe italic">
                          "{item.craftNote}"
                        </p>
                      )}
                      <p className="text-xs text-artisan-taupe">
                        Qty: <span className="font-semibold text-artisan-espresso">{item.quantity}</span> &bull; Unit: ₹{Number(item.unitPrice || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right self-end sm:self-center">
                    <span className="font-serif font-bold text-base text-artisan-espresso">
                      ₹{((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Financial Breakdown & Recipient Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Delivery Destination */}
            <div className="p-5 rounded-2xl bg-white/70 border border-artisan-heather space-y-3">
              <h4 className="font-serif text-sm font-bold text-artisan-espresso flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-artisan-terracotta" />
                <span>Delivery Destination</span>
              </h4>

              <div className="text-xs text-artisan-taupe space-y-1 leading-relaxed">
                <p className="font-bold text-artisan-espresso flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-artisan-taupe" />
                  <span>{order.customerInfo?.name}</span>
                </p>
                <p className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-artisan-taupe" />
                  <span>{order.customerInfo?.phone}</span>
                </p>
                <p className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-artisan-taupe" />
                  <span>{order.customerInfo?.email}</span>
                </p>
                <div className="pt-2 border-t border-artisan-heather/60 text-artisan-espresso">
                  <p>{order.shippingAddress?.street}</p>
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                  </p>
                  <p>{order.shippingAddress?.country || 'India'}</p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-5 rounded-2xl bg-white/70 border border-artisan-heather space-y-3">
              <h4 className="font-serif text-sm font-bold text-artisan-espresso flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-artisan-terracotta" />
                <span>Price & Payment</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-artisan-taupe">
                  <span>Subtotal</span>
                  <span className="font-semibold text-artisan-espresso">
                    ₹{Number(order.subtotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-artisan-taupe">
                  <span>Artisan Shipping</span>
                  <span className="font-semibold text-artisan-espresso">
                    {order.shippingFee === 0 ? (
                      <span className="text-emerald-700">Free (Above ₹1,499)</span>
                    ) : (
                      `₹${order.shippingFee || 99}`
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-artisan-heather flex justify-between font-serif font-bold text-base text-artisan-espresso">
                  <span>Total Amount</span>
                  <span className="text-artisan-terracotta">
                    ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2 text-[11px] text-artisan-taupe">
                  <p>
                    <strong>Payment Mode:</strong> Confirmed personally via WhatsApp/phone. Zero online gateway charges.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section if any */}
          {(order.notes || order.artisanNotes) && (
            <div className="p-4 rounded-2xl bg-artisan-sandstone/30 border border-artisan-heather text-xs space-y-2">
              {order.notes && (
                <div>
                  <span className="font-bold text-artisan-espresso">Your Special Instructions: </span>
                  <span className="italic text-artisan-taupe">"{order.notes}"</span>
                </div>
              )}
              {order.artisanNotes && (
                <div>
                  <span className="font-bold text-artisan-terracotta">Artisan Gurjeet's Note: </span>
                  <span className="text-artisan-espresso">{order.artisanNotes}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Action CTA Buttons */}
        <div className="p-5 sm:p-7 border-t border-artisan-heather/80 bg-artisan-ivory flex flex-col sm:flex-row gap-3 items-center justify-between">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-artisan-taupe hover:text-artisan-espresso py-2 px-3 rounded-xl border border-artisan-heather hover:bg-artisan-cream transition self-stretch sm:self-auto justify-center"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            <a
              href={`tel:${BUSINESS_CONFIG.phone}`}
              className="inline-flex"
            >
              <Button variant="secondary" size="md" className="w-full gap-1.5 justify-center">
                <Phone className="w-4 h-4 text-artisan-terracotta" />
                <span>Call Gurjeet</span>
              </Button>
            </a>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button size="md" className="w-full gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white justify-center shadow-sm">
                <MessageCircle className="w-4 h-4" />
                <span>Message on WhatsApp</span>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
