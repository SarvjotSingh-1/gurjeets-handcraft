import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';
import { ProductImageUploader } from '../../components/admin/ProductImageUploader';
import OrderDetailModal from '../../components/orders/OrderDetailModal';
import { BUSINESS_CONFIG } from '../../config/business';
import {
  Shield,
  Package,
  Sparkles,
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Clock,
  X,
  Eye,
  Search,
  Star,
  MessageCircle,
  Phone,
  Check,
  ArrowRight,
  User,
  MessageSquare,
  EyeOff,
  Calendar,
  Layers,
  CheckSquare,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'custom-orders' | 'reviews'

  // Data states
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Search & Filter states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [customStatusFilter, setCustomStatusFilter] = useState('ALL');

  // Modals state
  const [selectedAdminOrder, setSelectedAdminOrder] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedCustomOrder, setSelectedCustomOrder] = useState(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // New Product Modal State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: 'scarves',
    craftTechnique: 'Hand-Knitted',
    material: '100% Pure Merino Wool',
    description: '',
    stock: 2,
    isAvailable: true,
    isMadeToOrder: false,
    isFeatured: false,
    images: [],
  });

  // Edit Product Modal State
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const orderStatuses = [
    'Order Placed',
    'Payment Confirmed',
    'Processing',
    'Handmade',
    'Packed',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  const customOrderStatuses = [
    'Pending',
    'Under Review',
    'Accepted',
    'Rejected',
    'Completed',
  ];

  const categories = [
    'scarves',
    'gloves',
    'beanies',
    'mufflers',
    'socks',
    'other',
    'accessories',
  ];

  const craftTechniques = [
    'Hand-Knitted',
    'Crocheted',
    'Knitted & Crocheted',
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, customRes, prodRes, revRes] = await Promise.all([
        api.get('/orders').catch(() => ({ data: [] })),
        api.get('/custom-orders').catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: { products: [] } })),
        api.get('/reviews').catch(() => ({ data: [] })),
      ]);

      setOrders(ordersRes.data || []);
      setCustomOrders(customRes.data || []);
      setProducts(prodRes.data?.products || prodRes.data || []);
      setReviews(revRes.data || []);
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ORDER HANDLERS ---
  const handleUpdateOrderStatus = async (orderIdentifier, newStatus) => {
    setActionError(null);
    try {
      await api.put(`/orders/${orderIdentifier}/status`, {
        status: newStatus,
        artisanNotes: `Status updated to ${newStatus} by Gurjeet`,
      });
      setActionMessage(`Order ${orderIdentifier} status updated to "${newStatus}"`);
      fetchData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to update order status');
      setTimeout(() => setActionError(null), 6000);
    }
  };

  // --- CUSTOM ORDER HANDLERS ---
  const handleUpdateCustomOrderStatus = async (customOrderId, newStatus, estPrice = null, adminNotes = null) => {
    setActionError(null);
    try {
      const payload = { status: newStatus };
      if (estPrice !== null && estPrice !== '') payload.estimatedPrice = Number(estPrice);
      if (adminNotes !== null) payload.adminNotes = adminNotes;

      await api.put(`/custom-orders/${customOrderId}`, payload);
      setActionMessage(`Custom order marked as ${newStatus}`);
      fetchData();
      if (selectedCustomOrder && selectedCustomOrder.customOrderNumber === customOrderId) {
        setSelectedCustomOrder((prev) => ({ ...prev, ...payload }));
      }
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to update custom order status');
      setTimeout(() => setActionError(null), 6000);
    }
  };

  // --- PRODUCT HANDLERS ---
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      await api.post('/products', newProduct);
      setShowAddProduct(false);
      setNewProduct({
        title: '',
        price: '',
        category: 'scarves',
        craftTechnique: 'Hand-Knitted',
        material: '100% Pure Merino Wool',
        description: '',
        stock: 2,
        isAvailable: true,
        isMadeToOrder: false,
        isFeatured: false,
        images: [],
      });
      setActionMessage('New handcrafted product created successfully');
      fetchData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to create product');
      setTimeout(() => setActionError(null), 6000);
    }
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct({
      _id: prod._id,
      title: prod.title || '',
      price: prod.price || '',
      category: prod.category || 'scarves',
      craftTechnique: prod.craftTechnique || 'Hand-Knitted',
      material: prod.material || '',
      description: prod.description || '',
      stock: prod.stock !== undefined ? prod.stock : 1,
      isAvailable: prod.isAvailable !== undefined ? prod.isAvailable : true,
      isMadeToOrder: prod.isMadeToOrder !== undefined ? prod.isMadeToOrder : false,
      isFeatured: prod.isFeatured !== undefined ? prod.isFeatured : false,
      images: prod.images ? [...prod.images] : [],
    });
    setShowEditProduct(true);
    setShowAddProduct(false);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setActionError(null);
    try {
      await api.put(`/products/${editingProduct._id}`, editingProduct);
      setShowEditProduct(false);
      setEditingProduct(null);
      setActionMessage('Handcrafted piece updated successfully');
      fetchData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to update product');
      setTimeout(() => setActionError(null), 6000);
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to remove this piece from the catalog?')) {
      return;
    }
    setActionError(null);
    try {
      await api.delete(`/products/${prodId}`);
      setActionMessage('Product removed from catalog');
      fetchData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to delete product');
      setTimeout(() => setActionError(null), 6000);
    }
  };

  // --- REVIEW HANDLERS ---
  const handleModerateReview = async (reviewId, currentApproved) => {
    const nextApproved = !currentApproved;
    setActionError(null);
    try {
      await api.put(`/reviews/${reviewId}/moderate`, { isApproved: nextApproved });
      setActionMessage(`Review marked as ${nextApproved ? 'Approved' : 'Hidden'}`);
      fetchData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to moderate review');
      setTimeout(() => setActionError(null), 6000);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer review?')) {
      return;
    }
    setActionError(null);
    try {
      await api.delete(`/reviews/${reviewId}`);
      setActionMessage('Review deleted successfully');
      fetchData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to delete review');
      setTimeout(() => setActionError(null), 6000);
    }
  };

  // --- DERIVED METRICS ---
  const totalProducts = products.length;
  const availableProducts = products.filter((p) => p.isAvailable).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) =>
      o.orderStatus === 'Order Placed' ||
      o.orderStatus === 'Inquiry' ||
      o.orderStatus === 'Processing' ||
      o.paymentStatus === 'Pending'
  ).length;
  const totalCustomOrders = customOrders.length;
  const recentOrders = orders.slice(0, 5);

  // --- FILTERED DATA ---
  const filteredOrders = orders.filter((o) => {
    const q = orderSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
      (o.customerInfo?.name && o.customerInfo.name.toLowerCase().includes(q)) ||
      (o.customerInfo?.phone && o.customerInfo.phone.includes(q)) ||
      (o.customerInfo?.email && o.customerInfo.email.toLowerCase().includes(q));

    const matchesStatus =
      orderStatusFilter === 'ALL' || o.orderStatus === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.material && p.material.toLowerCase().includes(q));

    const matchesCategory =
      productCategoryFilter === 'ALL' || p.category === productCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  const filteredCustomOrders = customOrders.filter((co) => {
    return customStatusFilter === 'ALL' || co.status === customStatusFilter;
  });

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-10 space-y-8">
      <SEO title="Studio Administration | Gurjeet's Handcraft" noindex={true} />
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-artisan-heather/70 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <Badge variant="terracotta">
              <Shield className="w-3 h-3 mr-1 inline" />
              Studio Administration
            </Badge>
            <span className="text-xs text-artisan-softBrown font-medium">
              &bull; Gurjeet's Handcraft
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown">
            Artisan Studio Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-artisan-softBrown">
            Private studio manager for Gurjeet: catalog pieces, customer inquiries, order tracking, and reviews.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs font-semibold text-artisan-earthBrown hover:bg-artisan-sandstone/30 transition tap-target self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. Notification Alerts */}
      {actionMessage && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-subtle animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-subtle animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 3. Navigation Tabs Bar */}
      <div className="flex border-b border-artisan-heather/80 overflow-x-auto text-xs sm:text-sm font-semibold gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-artisan-terracotta text-artisan-terracotta font-bold'
              : 'border-transparent text-artisan-softBrown hover:text-artisan-earthBrown'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-3.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-artisan-terracotta text-artisan-terracotta font-bold'
              : 'border-transparent text-artisan-softBrown hover:text-artisan-earthBrown'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Products ({totalProducts})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-artisan-terracotta text-artisan-terracotta font-bold'
              : 'border-transparent text-artisan-softBrown hover:text-artisan-earthBrown'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders ({totalOrders})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom-orders')}
          className={`pb-3 px-3.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'custom-orders'
              ? 'border-artisan-terracotta text-artisan-terracotta font-bold'
              : 'border-transparent text-artisan-softBrown hover:text-artisan-earthBrown'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Custom Orders ({totalCustomOrders})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 px-3.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'reviews'
              ? 'border-artisan-terracotta text-artisan-terracotta font-bold'
              : 'border-transparent text-artisan-softBrown hover:text-artisan-earthBrown'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Reviews ({reviews.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DASHBOARD OVERVIEW (Metrics & Recent Orders)        */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 5 Core Artisan Business Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* 1. Total Products */}
            <div className="p-4 sm:p-5 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-1 shadow-subtle">
              <div className="flex items-center justify-between text-artisan-softBrown">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Total Products
                </span>
                <ShoppingBag className="w-4 h-4 text-artisan-terracotta" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-artisan-earthBrown">
                {totalProducts}
              </p>
              <p className="text-[10px] text-artisan-softBrown">Active in catalog</p>
            </div>

            {/* 2. Available Products */}
            <div className="p-4 sm:p-5 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-1 shadow-subtle">
              <div className="flex items-center justify-between text-artisan-softBrown">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Available
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-800">
                {availableProducts}
              </p>
              <p className="text-[10px] text-artisan-softBrown">In-stock & ready</p>
            </div>

            {/* 3. Orders */}
            <div className="p-4 sm:p-5 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-1 shadow-subtle">
              <div className="flex items-center justify-between text-artisan-softBrown">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Orders
                </span>
                <Package className="w-4 h-4 text-artisan-terracotta" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-artisan-earthBrown">
                {totalOrders}
              </p>
              <p className="text-[10px] text-artisan-softBrown">All-time logged</p>
            </div>

            {/* 4. Pending Orders */}
            <div className="p-4 sm:p-5 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-1 shadow-subtle">
              <div className="flex items-center justify-between text-artisan-softBrown">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Pending Orders
                </span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-800">
                {pendingOrders}
              </p>
              <p className="text-[10px] text-artisan-softBrown">Awaiting craft / confirm</p>
            </div>

            {/* 5. Custom Order Requests */}
            <div className="p-4 sm:p-5 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-1 shadow-subtle col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-artisan-softBrown">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Custom Requests
                </span>
                <Sparkles className="w-4 h-4 text-artisan-terracotta" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-artisan-terracotta">
                {totalCustomOrders}
              </p>
              <p className="text-[10px] text-artisan-softBrown">Bespoke commissions</p>
            </div>
          </div>

          {/* Quick Studio Actions */}
          <div className="p-5 sm:p-6 rounded-3xl bg-artisan-sandstone/20 border border-artisan-heather flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif text-base font-bold text-artisan-earthBrown">
                Handmade Studio Shortcuts
              </h3>
              <p className="text-xs text-artisan-softBrown">
                Quickly add new woolen creations, check inquiries, or moderate customer reviews.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button
                size="sm"
                onClick={() => {
                  setActiveTab('products');
                  setShowAddProduct(true);
                }}
                className="gap-1.5 shadow-subtle tap-target"
              >
                <Plus className="w-4 h-4" />
                <span>Add Handcrafted Piece</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab('orders')}
                className="gap-1.5 tap-target"
              >
                <Package className="w-4 h-4 text-artisan-terracotta" />
                <span>Review Orders</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab('custom-orders')}
                className="gap-1.5 tap-target"
              >
                <Sparkles className="w-4 h-4 text-artisan-terracotta" />
                <span>Custom Inquiries</span>
              </Button>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
                  Recent Orders
                </h3>
                <p className="text-xs text-artisan-softBrown">
                  Latest customer order requests submitted to the studio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="text-xs font-semibold text-artisan-terracotta hover:underline flex items-center gap-1"
              >
                <span>View All ({totalOrders})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-8 rounded-3xl bg-artisan-cream border border-artisan-heather text-center text-xs text-artisan-softBrown">
                No orders logged yet.
              </div>
            ) : (
              <div className="divide-y divide-artisan-heather/80 rounded-3xl border border-artisan-heather bg-artisan-cream overflow-hidden shadow-subtle">
                {recentOrders.map((ord) => (
                  <div
                    key={ord._id || ord.orderNumber}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-artisan-sandstone/15 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-artisan-terracotta">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-artisan-softBrown">
                          &bull; {ord.customerInfo?.name} ({ord.customerInfo?.phone})
                        </span>
                      </div>
                      <p className="text-xs text-artisan-softBrown">
                        {ord.items?.length || 0} items &bull; Total: <strong>₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-artisan-ivory border border-artisan-heather text-artisan-earthBrown">
                        {ord.orderStatus}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedAdminOrder(ord);
                          setIsAdminModalOpen(true);
                        }}
                        className="gap-1 tap-target"
                      >
                        <Eye className="w-3.5 h-3.5 text-artisan-terracotta" />
                        <span>Inspect</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PRODUCTS MANAGEMENT                                */}
      {/* ========================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-artisan-softBrown absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search piece by title or material..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta"
                />
              </div>

              {/* Category Filter */}
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs font-semibold text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <Button
              size="md"
              onClick={() => {
                setShowAddProduct(true);
                setShowEditProduct(false);
              }}
              className="gap-1.5 shadow-subtle tap-target"
            >
              <Plus className="w-4 h-4" />
              <span>Add Handcrafted Piece</span>
            </Button>
          </div>

          {/* Products List */}
          {filteredProducts.length === 0 ? (
            <div className="p-8 rounded-3xl bg-artisan-cream text-center text-xs text-artisan-softBrown">
              No handcrafted pieces matched your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => {
                const coverImage =
                  prod.images?.find((img) => img.isPrimary)?.url ||
                  prod.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80';

                return (
                  <div
                    key={prod._id}
                    className="p-5 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-4 shadow-subtle flex flex-col justify-between hover:border-artisan-terracotta/40 transition"
                  >
                    <div className="space-y-3">
                      {/* Image Thumbnail & Badges */}
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-artisan-sandstone/30 border border-artisan-heather/70">
                        <img
                          src={coverImage}
                          alt={prod.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              prod.isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {prod.isAvailable ? 'Available' : 'Sold Out'}
                          </span>

                          {prod.isMadeToOrder && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-artisan-terracotta/90 text-white">
                              Made to Order
                            </span>
                          )}

                          {prod.isFeatured && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              <span>Featured</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div>
                        <span className="text-[10px] font-semibold text-artisan-softBrown uppercase tracking-wider">
                          {prod.category} &bull; {prod.craftTechnique}
                        </span>
                        <h4 className="font-serif text-base font-bold text-artisan-earthBrown line-clamp-1">
                          {prod.title}
                        </h4>
                        <p className="text-xs text-artisan-softBrown line-clamp-2 mt-1">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer: Price, Stock, Actions */}
                    <div className="pt-3 border-t border-artisan-heather/70 flex items-center justify-between">
                      <div>
                        <span className="font-serif text-lg font-bold text-artisan-terracotta">
                          ₹{Number(prod.price || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-artisan-softBrown block">
                          Stock: <strong>{prod.stock}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-artisan-earthBrown hover:bg-artisan-sandstone/30 transition"
                          title="Edit piece"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="p-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-rose-600 hover:bg-rose-50 transition"
                          title="Delete piece"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ORDERS MANAGEMENT                                  */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Controls Bar: Search & Status Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-artisan-softBrown absolute left-3.5 top-3" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search orders by ID (GH-ORD-...), customer name, phone, or email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta font-mono"
              />
            </div>

            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs font-semibold text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta"
            >
              <option value="ALL">All Statuses</option>
              {orderStatuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="p-8 rounded-3xl bg-artisan-cream text-center text-xs text-artisan-softBrown">
              No orders matched your search criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((ord) => (
                <div
                  key={ord._id || ord.orderNumber}
                  className="p-5 sm:p-6 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-4 shadow-subtle hover:border-artisan-terracotta/40 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-artisan-heather/60 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-artisan-terracotta">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.paymentStatus === 'Completed'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : ord.paymentStatus === 'Cancelled'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          Payment: {ord.paymentStatus || 'Pending'}
                        </span>
                        <span className="text-[10px] text-artisan-softBrown">
                          &bull; {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <h3 className="font-serif text-base font-bold text-artisan-earthBrown">
                        Customer: {ord.customerInfo?.name} ({ord.customerInfo?.phone})
                      </h3>
                      <p className="text-[11px] text-artisan-softBrown">{ord.customerInfo?.email}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-artisan-softBrown">Status:</span>
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord.orderNumber, e.target.value)}
                          className="px-3 py-1.5 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs font-semibold text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta"
                        >
                          {orderStatuses.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedAdminOrder(ord);
                          setIsAdminModalOpen(true);
                        }}
                        className="gap-1 tap-target"
                      >
                        <Eye className="w-3.5 h-3.5 text-artisan-terracotta" />
                        <span>Inspect</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-artisan-softBrown">
                    <div>
                      <span className="font-bold text-artisan-earthBrown block">Items:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {ord.items?.map((it, idx) => (
                          <li key={idx}>
                            {it.quantity}x {it.title} {it.selectedColor && `(${it.selectedColor})`} — ₹
                            {(it.unitPrice * it.quantity).toLocaleString('en-IN')}
                          </li>
                        ))}
                      </ul>
                      <p className="font-bold text-artisan-earthBrown mt-1">
                        Total Amount: ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-artisan-earthBrown block">Shipping Address:</span>
                      <p>
                        {ord.shippingAddress?.street}, {ord.shippingAddress?.city},{' '}
                        {ord.shippingAddress?.state} - {ord.shippingAddress?.postalCode}
                      </p>
                      {ord.notes && <p className="italic mt-1">"Notes: {ord.notes}"</p>}
                      {ord.artisanNotes && (
                        <p className="mt-1 text-artisan-terracotta font-medium">
                          Artisan Note: {ord.artisanNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: CUSTOM ORDERS MANAGEMENT                           */}
      {/* ========================================================= */}
      {activeTab === 'custom-orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-xl font-bold text-artisan-earthBrown">
              Bespoke Custom Requests ({filteredCustomOrders.length})
            </h2>

            <select
              value={customStatusFilter}
              onChange={(e) => setCustomStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs font-semibold text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta"
            >
              <option value="ALL">All Statuses</option>
              {customOrderStatuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {filteredCustomOrders.length === 0 ? (
            <div className="p-8 rounded-3xl bg-artisan-cream text-center text-xs text-artisan-softBrown">
              No bespoke custom orders found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomOrders.map((co) => (
                <div
                  key={co._id || co.customOrderNumber}
                  className="p-5 sm:p-6 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-4 shadow-subtle hover:border-artisan-terracotta/40 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-artisan-heather/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-artisan-terracotta">
                          {co.customOrderNumber}
                        </span>
                        <span className="text-[10px] text-artisan-softBrown">
                          &bull; {co.createdAt ? new Date(co.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <h3 className="font-serif text-base font-bold text-artisan-earthBrown">
                        {co.name} ({co.phone}) &bull; {co.email}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={co.status}
                        onChange={(e) =>
                          handleUpdateCustomOrderStatus(co.customOrderNumber, e.target.value)
                        }
                        className="px-3 py-1.5 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs font-semibold text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta"
                      >
                        {customOrderStatuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomOrder(co);
                          setIsCustomModalOpen(true);
                        }}
                        className="gap-1 tap-target"
                      >
                        <Eye className="w-3.5 h-3.5 text-artisan-terracotta" />
                        <span>Details</span>
                      </Button>

                      <a
                        href={`https://wa.me/${co.phone?.replace(/\D/g, '') || BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                          `Hello ${co.name},\nRegarding your custom order request *${co.customOrderNumber}* for a handcrafted ${co.productType}:`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="sm"
                          className="gap-1 bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-subtle tap-target"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-artisan-softBrown bg-white/60 p-3.5 rounded-2xl border border-artisan-heather/70">
                    <div>
                      <span className="font-bold text-artisan-earthBrown block">Product Type:</span>
                      <span>{co.productType}</span>
                    </div>
                    <div>
                      <span className="font-bold text-artisan-earthBrown block">Color Preference:</span>
                      <span>{co.colorPreference}</span>
                    </div>
                    <div>
                      <span className="font-bold text-artisan-earthBrown block">Size & Qty:</span>
                      <span>{co.size} (Qty: {co.quantity})</span>
                    </div>
                    <div>
                      <span className="font-bold text-artisan-earthBrown block">Estimate:</span>
                      <span className="text-artisan-terracotta font-bold">
                        {co.estimatedPrice ? `₹${co.estimatedPrice}` : 'Pending quote'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: REVIEWS MODERATION                                 */}
      {/* ========================================================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-artisan-earthBrown">
                Customer Reviews & Moderation ({reviews.length})
              </h2>
              <p className="text-xs text-artisan-softBrown">
                Review and moderate customer feedback before it appears on public product pages.
              </p>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="p-8 rounded-3xl bg-artisan-cream text-center text-xs text-artisan-softBrown">
              No customer reviews submitted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-5 sm:p-6 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-3 shadow-subtle hover:border-artisan-terracotta/40 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-artisan-heather/60 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-artisan-earthBrown text-sm">
                          {rev.userName}
                        </span>
                        <span className="text-[11px] text-artisan-softBrown">
                          on <strong>{rev.productTitle || rev.product?.title || 'Handmade Woolen Piece'}</strong>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rev.isApproved !== false
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {rev.isApproved !== false ? 'Approved & Published' : 'Hidden from Public'}
                        </span>
                      </div>

                      {/* Star Rating Display */}
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating ? 'fill-amber-500' : 'text-artisan-heather'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-artisan-earthBrown ml-1">
                          {rev.rating} / 5
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={rev.isApproved !== false ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => handleModerateReview(rev._id, rev.isApproved !== false)}
                        className="gap-1 tap-target"
                      >
                        {rev.isApproved !== false ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </>
                        )}
                      </Button>

                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev._id)}
                        className="p-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-rose-600 hover:bg-rose-50 transition"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-artisan-earthBrown leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                  <span className="text-[10px] text-artisan-softBrown block">
                    Submitted: {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD PRODUCT MODAL                                */}
      {/* ========================================================= */}
      {showAddProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl bg-artisan-cream rounded-3xl border border-artisan-heather shadow-2xl overflow-hidden my-6">
            <div className="p-5 sm:p-6 border-b border-artisan-heather/80 flex items-center justify-between bg-white/60">
              <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
                Add New Handcrafted Piece
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProduct(false)}
                className="p-1.5 rounded-full hover:bg-artisan-heather text-artisan-earthBrown"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="space-y-1">
                <label className="font-bold text-artisan-earthBrown">Piece Title *</label>
                <input
                  type="text"
                  required
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  placeholder="e.g. Hand-Knitted Pure Merino Cowl"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-artisan-ivory border border-artisan-heather focus:outline-none focus:border-artisan-terracotta text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-artisan-earthBrown">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather focus:outline-none focus:border-artisan-terracotta text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-artisan-earthBrown">Available Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather focus:outline-none focus:border-artisan-terracotta text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-artisan-earthBrown">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-artisan-earthBrown">Craft Technique *</label>
                  <select
                    value={newProduct.craftTechnique}
                    onChange={(e) => setNewProduct({ ...newProduct, craftTechnique: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs"
                  >
                    {craftTechniques.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-artisan-earthBrown">Material Details *</label>
                <input
                  type="text"
                  required
                  value={newProduct.material}
                  onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })}
                  placeholder="e.g. 100% Pure Himalayan Merino Wool"
                  className="w-full px-3.5 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-artisan-earthBrown">Description *</label>
                <textarea
                  rows="3"
                  required
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs"
                />
              </div>

              {/* Toggles: Availability, Made-to-order, Featured */}
              <div className="p-4 rounded-2xl bg-white/60 border border-artisan-heather/80 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.isAvailable}
                    onChange={(e) => setNewProduct({ ...newProduct, isAvailable: e.target.checked })}
                    className="rounded text-artisan-terracotta focus:ring-artisan-terracotta"
                  />
                  <span className="font-semibold text-artisan-earthBrown">Available for Instant Order</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.isMadeToOrder}
                    onChange={(e) => setNewProduct({ ...newProduct, isMadeToOrder: e.target.checked })}
                    className="rounded text-artisan-terracotta focus:ring-artisan-terracotta"
                  />
                  <span className="font-semibold text-artisan-earthBrown">Made-to-Order Piece</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.isFeatured}
                    onChange={(e) => setNewProduct({ ...newProduct, isFeatured: e.target.checked })}
                    className="rounded text-artisan-terracotta focus:ring-artisan-terracotta"
                  />
                  <span className="font-semibold text-artisan-earthBrown">Feature on Homepage Showcase</span>
                </label>
              </div>

              {/* Product Images Management */}
              <div className="space-y-1">
                <label className="font-bold text-artisan-earthBrown block">Product Photos (Cloudinary)</label>
                <ProductImageUploader
                  images={newProduct.images}
                  onChange={(imgs) => setNewProduct({ ...newProduct, images: imgs })}
                />
              </div>

              <div className="pt-3 border-t border-artisan-heather/80 flex justify-end gap-2.5">
                <Button type="button" variant="secondary" size="md" onClick={() => setShowAddProduct(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="md">
                  Publish Piece
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EDIT PRODUCT MODAL                               */}
      {/* ========================================================= */}
      {showEditProduct && editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl bg-artisan-cream rounded-3xl border border-artisan-heather shadow-2xl overflow-hidden my-6">
            <div className="p-5 sm:p-6 border-b border-artisan-heather/80 flex items-center justify-between bg-white/60">
              <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
                Edit Handcrafted Piece
              </h3>
              <button
                type="button"
                onClick={() => setShowEditProduct(false)}
                className="p-1.5 rounded-full hover:bg-artisan-heather text-artisan-earthBrown"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="space-y-1">
                <label className="font-bold text-artisan-earthBrown">Piece Title *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-artisan-earthBrown">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-artisan-earthBrown">Available Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-artisan-earthBrown">Category *</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-artisan-earthBrown">Craft Technique *</label>
                  <select
                    value={editingProduct.craftTechnique}
                    onChange={(e) => setEditingProduct({ ...editingProduct, craftTechnique: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs"
                  >
                    {craftTechniques.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-artisan-earthBrown">Material *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.material}
                  onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-artisan-earthBrown">Description *</label>
                <textarea
                  rows="3"
                  required
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs"
                />
              </div>

              {/* Toggles: Availability, Made-to-order, Featured */}
              <div className="p-4 rounded-2xl bg-white/60 border border-artisan-heather/80 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isAvailable}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })}
                    className="rounded text-artisan-terracotta focus:ring-artisan-terracotta"
                  />
                  <span className="font-semibold text-artisan-earthBrown">Available for Instant Order</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isMadeToOrder}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isMadeToOrder: e.target.checked })}
                    className="rounded text-artisan-terracotta focus:ring-artisan-terracotta"
                  />
                  <span className="font-semibold text-artisan-earthBrown">Made-to-Order Piece</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFeatured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                    className="rounded text-artisan-terracotta focus:ring-artisan-terracotta"
                  />
                  <span className="font-semibold text-artisan-earthBrown">Feature on Homepage Showcase</span>
                </label>
              </div>

              {/* Product Images Management */}
              <div className="space-y-1">
                <label className="font-bold text-artisan-earthBrown block">Product Photos (Cloudinary)</label>
                <ProductImageUploader
                  images={editingProduct.images || []}
                  onChange={(imgs) => setEditingProduct({ ...editingProduct, images: imgs })}
                />
              </div>

              <div className="pt-3 border-t border-artisan-heather/80 flex justify-end gap-2.5">
                <Button type="button" variant="secondary" size="md" onClick={() => setShowEditProduct(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="md">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: CUSTOM ORDER DETAILS MODAL                       */}
      {/* ========================================================= */}
      {isCustomModalOpen && selectedCustomOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl bg-artisan-cream rounded-3xl border border-artisan-heather shadow-2xl overflow-hidden my-6">
            <div className="p-5 sm:p-6 border-b border-artisan-heather/80 flex items-center justify-between bg-white/60">
              <div>
                <span className="text-[11px] font-mono text-artisan-terracotta font-bold">
                  {selectedCustomOrder.customOrderNumber}
                </span>
                <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
                  Bespoke Commission Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-artisan-heather text-artisan-earthBrown"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Customer Info */}
              <div className="p-4 rounded-2xl bg-white/70 border border-artisan-heather/70 space-y-1">
                <span className="font-bold text-artisan-earthBrown block">Customer Contact:</span>
                <p><strong>Name:</strong> {selectedCustomOrder.name}</p>
                <p><strong>Phone:</strong> {selectedCustomOrder.phone}</p>
                <p><strong>Email:</strong> {selectedCustomOrder.email}</p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/70 border border-artisan-heather/70">
                <div>
                  <strong>Product Type:</strong> {selectedCustomOrder.productType}
                </div>
                <div>
                  <strong>Quantity:</strong> {selectedCustomOrder.quantity}
                </div>
                <div>
                  <strong>Color Preference:</strong> {selectedCustomOrder.colorPreference}
                </div>
                <div>
                  <strong>Size:</strong> {selectedCustomOrder.size}
                </div>
                <div className="col-span-2">
                  <strong>Design / Pattern:</strong> {selectedCustomOrder.designPattern || 'Not specified'}
                </div>
                {selectedCustomOrder.requiredDate && (
                  <div className="col-span-2">
                    <strong>Required Date:</strong> {new Date(selectedCustomOrder.requiredDate).toLocaleDateString()}
                  </div>
                )}
                {selectedCustomOrder.additionalNotes && (
                  <div className="col-span-2 italic text-artisan-softBrown">
                    "Notes: {selectedCustomOrder.additionalNotes}"
                  </div>
                )}
              </div>

              {/* Reference Image if any */}
              {selectedCustomOrder.referenceImage && (
                <div className="space-y-1">
                  <strong>Reference Photo:</strong>
                  <div className="max-w-xs rounded-2xl overflow-hidden border border-artisan-heather">
                    <img
                      src={selectedCustomOrder.referenceImage}
                      alt="Reference"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Admin Estimate & Status Controls */}
              <div className="p-4 rounded-2xl bg-artisan-sandstone/30 border border-artisan-heather space-y-3">
                <strong className="text-artisan-earthBrown block">Artisan Quotation & Status:</strong>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-artisan-softBrown mb-1">
                      Status:
                    </label>
                    <select
                      value={selectedCustomOrder.status}
                      onChange={(e) =>
                        handleUpdateCustomOrderStatus(
                          selectedCustomOrder.customOrderNumber,
                          e.target.value,
                          selectedCustomOrder.estimatedPrice,
                          selectedCustomOrder.adminNotes
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs font-semibold"
                    >
                      {customOrderStatuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-artisan-softBrown mb-1">
                      Estimated Price (₹):
                    </label>
                    <input
                      type="number"
                      value={selectedCustomOrder.estimatedPrice || ''}
                      onChange={(e) =>
                        setSelectedCustomOrder({
                          ...selectedCustomOrder,
                          estimatedPrice: e.target.value,
                        })
                      }
                      onBlur={(e) =>
                        handleUpdateCustomOrderStatus(
                          selectedCustomOrder.customOrderNumber,
                          selectedCustomOrder.status,
                          e.target.value,
                          selectedCustomOrder.adminNotes
                        )
                      }
                      placeholder="e.g. 2400"
                      className="w-full px-3 py-1.5 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-artisan-softBrown mb-1">
                    Artisan Note to Customer:
                  </label>
                  <textarea
                    rows="2"
                    value={selectedCustomOrder.adminNotes || ''}
                    onChange={(e) =>
                      setSelectedCustomOrder({
                        ...selectedCustomOrder,
                        adminNotes: e.target.value,
                      })
                    }
                    onBlur={(e) =>
                      handleUpdateCustomOrderStatus(
                        selectedCustomOrder.customOrderNumber,
                        selectedCustomOrder.status,
                        selectedCustomOrder.estimatedPrice,
                        e.target.value
                      )
                    }
                    placeholder="e.g. Verified pure sheep wool availability in desired shade."
                    className="w-full px-3 py-1.5 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-artisan-heather/80 flex justify-between items-center bg-white/40">
              <a
                href={`https://wa.me/${selectedCustomOrder.phone?.replace(/\D/g, '') || BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                  `Hello ${selectedCustomOrder.name},\nRegarding your bespoke commission request *${selectedCustomOrder.customOrderNumber}*:`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" className="gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white">
                  <MessageCircle className="w-4 h-4" />
                  <span>Discuss on WhatsApp</span>
                </Button>
              </a>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCustomModalOpen(false)}
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ORDER DETAILS MODAL (Order Inspection) */}
      <OrderDetailModal
        order={selectedAdminOrder}
        isOpen={isAdminModalOpen}
        onClose={() => {
          setSelectedAdminOrder(null);
          setIsAdminModalOpen(false);
        }}
      />
    </div>
  );
};

export default AdminDashboardPage;
