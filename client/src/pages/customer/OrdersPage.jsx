import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';
import VisualTimeline from '../../components/orders/VisualTimeline';
import OrderDetailModal from '../../components/orders/OrderDetailModal';
import {
  Package,
  Calendar,
  Search,
  MessageCircle,
  Phone,
  Eye,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BUSINESS_CONFIG } from '../../config/business';
import api from '../../api/client';

export const OrdersPage = () => {
  const { user } = useAuth();

  // State for authenticated customer orders
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // State for manual Order ID search
  const [orderQuery, setOrderQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch authenticated customer's orders
  const fetchMyOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    setFetchError('');
    try {
      const res = await api.get('/orders/my-orders');
      if (res?.data) {
        setMyOrders(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.warn('Could not fetch customer orders:', err.message);
      setFetchError(err.message || 'Unable to load your orders right now.');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [user]);

  // Handle Search by Order ID
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setSearchLoading(true);
    setSearchError('');
    try {
      const res = await api.get(`/orders/${orderQuery.trim()}`);
      if (res?.data) {
        setSearchedOrder(res.data);
      }
    } catch (err) {
      setSearchError(err.message || 'Order request not found. Please verify your Order Request ID.');
      setSearchedOrder(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleOpenDetailModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

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

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 space-y-10">
      <SEO title="Track Your Handmade Order | Gurjeet's Handcraft" noindex={true} />
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-artisan-heather/80 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2">
            <Badge variant="terracotta">Artisan Customer Portal</Badge>
            <span className="text-xs text-artisan-taupe font-medium">
              &bull; Gurjeet's Handcraft
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-artisan-espresso">
            My Orders & Craft Timeline
          </h1>
          <p className="text-xs sm:text-sm text-artisan-taupe max-w-2xl leading-relaxed">
            Follow your order's handcrafted journey from pure wool selection through stitch-by-stitch needles and postal dispatch.
          </p>
        </div>

        {user && (
          <button
            type="button"
            onClick={fetchMyOrders}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs font-semibold text-artisan-espresso hover:bg-artisan-cream transition tap-target self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
            <span>Refresh Orders</span>
          </button>
        )}
      </div>

      {/* Manual Order Request ID Lookup Form */}
      <div className="p-6 sm:p-7 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-4 shadow-subtle">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-artisan-terracotta" />
          <h2 className="font-serif text-base font-bold text-artisan-espresso">
            Track by Order Request ID
          </h2>
        </div>
        <p className="text-xs text-artisan-taupe">
          Have an order ID from your confirmation or message? Enter it below (e.g.{' '}
          <code>GH-ORD-123456-789</code>) to see immediate crafting status.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-artisan-taupe absolute left-4 top-3" />
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="e.g. GH-ORD-..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-artisan-heather bg-artisan-ivory text-xs sm:text-sm text-artisan-espresso placeholder-artisan-taupe/60 focus:outline-none focus:ring-2 focus:ring-artisan-terracotta/40 font-mono"
            />
          </div>
          <Button type="submit" loading={searchLoading} size="md" className="tap-target">
            <span>Find Order</span>
          </Button>
        </form>

        {searchError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Searched Order Result Card */}
      {searchedOrder && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-artisan-espresso">
              Search Result
            </h3>
            <button
              type="button"
              onClick={() => setSearchedOrder(null)}
              className="text-xs text-artisan-terracotta hover:underline"
            >
              Clear Search
            </button>
          </div>
          <OrderCard
            order={searchedOrder}
            onOpenModal={handleOpenDetailModal}
            getStatusBadgeVariant={getStatusBadgeVariant}
            getPaymentStatusBadge={getPaymentStatusBadge}
          />
        </div>
      )}

      {/* Authenticated Customer Orders Section */}
      {user ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-artisan-espresso flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-artisan-terracotta" />
              <span>My Orders ({myOrders.length})</span>
            </h2>
            <span className="text-xs text-artisan-taupe">
              Registered Account: <strong>{user.email}</strong>
            </span>
          </div>

          {loadingOrders ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-artisan-cream/60 border border-artisan-heather animate-pulse space-y-4"
                >
                  <div className="h-6 bg-artisan-sandstone/40 rounded w-1/3" />
                  <div className="h-24 bg-artisan-sandstone/30 rounded" />
                  <div className="h-10 bg-artisan-sandstone/40 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : myOrders.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-artisan-cream border border-artisan-heather text-center space-y-4 shadow-subtle">
              <div className="w-14 h-14 mx-auto rounded-full bg-artisan-ivory border border-artisan-heather flex items-center justify-center text-artisan-taupe">
                <Package className="w-7 h-7 text-artisan-terracotta/70" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="font-serif text-xl font-bold text-artisan-espresso">
                  No orders placed yet
                </h3>
                <p className="text-xs sm:text-sm text-artisan-taupe leading-relaxed">
                  You haven't submitted any handcrafted orders yet. Explore our pure wool scarves, beanies, and custom bespoke pieces!
                </p>
              </div>
              <Link to="/shop">
                <Button size="md" className="gap-2 shadow-subtle tap-target">
                  <span>Explore Handcrafted Shop</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {myOrders.map((order) => (
                <OrderCard
                  key={order._id || order.orderNumber}
                  order={order}
                  onOpenModal={handleOpenDetailModal}
                  getStatusBadgeVariant={getStatusBadgeVariant}
                  getPaymentStatusBadge={getPaymentStatusBadge}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Guest Invitation Box */
        <div className="p-6 sm:p-8 rounded-3xl bg-artisan-sandstone/20 border border-artisan-heather flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-artisan-espresso">
              Want to see all your orders automatically?
            </h3>
            <p className="text-xs sm:text-sm text-artisan-taupe">
              Sign in to your account to view your past orders, active craft journeys, and saved preferences without typing an ID each time.
            </p>
          </div>
          <div className="flex gap-2.5 flex-shrink-0">
            <Link to="/login">
              <Button size="md" className="tap-target">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="md" className="tap-target">
                Register
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Artisan Lifecycle Guide */}
      <div className="p-6 sm:p-8 rounded-3xl bg-artisan-cream/50 border border-artisan-heather space-y-4 text-xs sm:text-sm text-artisan-taupe">
        <h3 className="font-serif text-base font-bold text-artisan-espresso flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-artisan-terracotta" />
          <span>Understanding the 7 Stages of Our Handcrafted Journey</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-white/70 border border-artisan-heather/80 space-y-1">
            <strong className="text-artisan-espresso block">1. Order Placed</strong>
            <span>Your request is recorded in Gurjeet's artisan order log.</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 border border-artisan-heather/80 space-y-1">
            <strong className="text-artisan-espresso block">2. Payment Confirmed</strong>
            <span>Gurjeet verifies details, pricing, and payment confirmation.</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 border border-artisan-heather/80 space-y-1">
            <strong className="text-artisan-espresso block">3. Processing</strong>
            <span>Pure wool skeins are selected and yarn is wound for crafting.</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 border border-artisan-heather/80 space-y-1">
            <strong className="text-artisan-espresso block">4. Handmade</strong>
            <span>Carefully handcrafted stitch-by-stitch with knitting needles or crochet hook.</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 border border-artisan-heather/80 space-y-1">
            <strong className="text-artisan-espresso block">5. Packed</strong>
            <span>Steamed, inspected, labeled, and wrapped with love and care instructions.</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 border border-artisan-heather/80 space-y-1">
            <strong className="text-artisan-espresso block">6. Shipped & 7. Delivered</strong>
            <span>Handed over to courier with tracking until it arrives safely at your door.</span>
          </div>
        </div>
      </div>

      {/* Detail Modal Component */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};

/**
 * Sub-component: Clean, Highly-Responsive Order Card
 */
const OrderCard = ({
  order,
  onOpenModal,
  getStatusBadgeVariant,
  getPaymentStatusBadge,
}) => {
  const totalQuantity = order.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 0;
  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';

  const paymentBadge = getPaymentStatusBadge(order.paymentStatus);
  const waUrl = `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hello Gurjeet,\nI have an inquiry about my Order *${order.orderNumber}* (Status: ${order.orderStatus}).`
  )}`;

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-6 shadow-subtle hover:border-artisan-terracotta/40 transition-all">
      {/* 1. Header Row: Order Number, Date, Status Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-artisan-heather/70 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-artisan-taupe uppercase tracking-wider">
              Order No.
            </span>
            <span className="font-mono text-sm font-bold text-artisan-terracotta">
              {order.orderNumber}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-artisan-taupe">
            <Calendar className="w-3.5 h-3.5 text-artisan-taupe" />
            <span>Ordered on {formattedDate}</span>
          </div>
        </div>

        {/* Badges: Order Status & Payment Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={getStatusBadgeVariant(order.orderStatus)} size="md">
            {order.orderStatus}
          </Badge>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${paymentBadge.className}`}>
            {paymentBadge.text}
          </span>
        </div>
      </div>

      {/* 2. Visual Timeline */}
      <div className="p-4 sm:p-5 rounded-2xl bg-artisan-ivory border border-artisan-heather/80">
        <VisualTimeline currentStatus={order.orderStatus} />
      </div>

      {/* 3. Products Preview & Quantity Summary */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs text-artisan-taupe font-medium">
          <span className="uppercase tracking-wider font-semibold">
            Products ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
          </span>
          <span>
            {order.shippingAddress?.city}, {order.shippingAddress?.state}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white/70 border border-artisan-heather/80 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-artisan-sandstone/50 flex-shrink-0 flex items-center justify-center border border-artisan-heather/70 text-artisan-taupe">
                  <Package className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="font-serif font-bold text-artisan-espresso truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-artisan-taupe">
                    Qty: {item.quantity} {item.selectedColor ? `&bull; Color: ${item.selectedColor}` : ''}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-artisan-espresso flex-shrink-0">
                ₹{((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Total & Action Footer Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-artisan-heather/70">
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-artisan-taupe">Order Total:</span>
          <span className="font-serif text-2xl font-bold text-artisan-espresso">
            ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
          </span>
          {order.shippingFee === 0 && (
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Free Delivery
            </span>
          )}
        </div>

        {/* Buttons: View Full Details & Message WhatsApp */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenModal(order)}
            className="flex-1 sm:flex-none gap-1.5 justify-center tap-target"
          >
            <Eye className="w-4 h-4 text-artisan-terracotta" />
            <span>View Full Details</span>
          </Button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none"
          >
            <Button
              size="sm"
              className="w-full gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white justify-center shadow-subtle tap-target"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Gurjeet</span>
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
