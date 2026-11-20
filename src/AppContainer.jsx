import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import OrderDrawer from './components/orders/OrderDrawer';
import NewOrderModal from './components/orders/NewOrderModal';
import AddProductModal from './components/products/AddProductModal';
import TemplateManagerModal from './components/products/TemplateManagerModal';
import AppRoutes from './routes/AppRoutes';
import { statusLabel } from './utils/formatters';
import { clearLoginFeedback, clearSignupFeedback, logoutUser, sessionExpired } from './redux/slices/authSlice';
import { clearCreateProductError, clearUpdateProductError, createProduct, fetchProducts, updateProduct } from './redux/slices/productSlice';
import { clearJobFeedback, downloadProductionFile, fetchAdminAnalytics, fetchOrders, prependOrderLocally, updateJobStatus } from './redux/slices/orderSlice';
import { decodeAccessToken, getValidAccessToken } from './redux/api/tokenCookie';
import { fetchCustomers } from './redux/slices/customerSlice';

function AdminWorkspace({ onLogout, user, logoutStatus, logoutError }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    items: orders,
    fetchStatus: orderStatus,
    fetchError: orderError,
    statusMutationStatus,
    statusMutationError,
    statusMutationOrderId,
    downloadStatus,
    downloadError,
    downloadOrderId,
    analytics,
    analyticsStatus,
    analyticsError,
  } = useSelector((state) => state.orders);
  const { items: products, fetchStatus: productStatus, createStatus: productCreateStatus, updateStatus: productUpdateStatus, fetchError: productError, createError: productCreateError, updateError: productUpdateError } = useSelector((state) => state.products);
  const { items: customers, fetchStatus: customerStatus, fetchError: customerError } = useSelector((state) => state.customers);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [templateProduct, setTemplateProduct] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState('');
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchOrders());
    dispatch(fetchAdminAnalytics());
    dispatch(fetchCustomers());
  }, [dispatch]);
  const selectedOrder = useMemo(() => orders.find((item) => item.id === selectedId), [orders, selectedId]);
  const showToast = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };
  const transition = async (id, status) => {
    const order = orders.find((item) => item.id === id);
    if (!order) return;
    const apiStatus = { received: 'order', artwork: 'artwork', production_queue: 'production', completed: 'completed' }[status];
    if (!apiStatus) return;
    dispatch(clearJobFeedback());
    try {
      await dispatch(updateJobStatus({ orderId: order.apiId || order.id, orderKey: order.id, status: apiStatus, localStatus: status })).unwrap();
      dispatch(fetchAdminAnalytics());
      showToast(`${id} moved to ${statusLabel(status)}.`);
    } catch {
      // The drawer presents the API or proof-readiness error.
    }
  };
  const download = async (order) => {
    dispatch(clearJobFeedback());
    try {
      await dispatch(downloadProductionFile({ orderId: order.apiId || order.id, orderKey: order.id, orderNumber: order.id })).unwrap();
      showToast(`${order.id} production PDF downloaded.`);
    } catch {
      // The drawer presents the download error.
    }
  };
  const createOrder = (form) => {
    const customer = customers.find((item) => item.id === form.customerId);
    const product = products.find((item) => item.id === form.productId);
    if (!customer || !product) return;
    const highestOrderNumber = orders.reduce((highest, item) => {
      const value = Number(String(item.id).match(/(\d+)$/)?.[1]);
      return Number.isFinite(value) ? Math.max(highest, value) : highest;
    }, 2056);
    const nextId = `DH-${highestOrderNumber + 1}`;
    const order = { id: nextId, customer: customer.name, customerId: customer.id, product: product.name, productId: product.id, qty: Number(form.qty), total: Number(form.qty) * product.price, due: form.due, priority: form.priority, status: 'quote', proofVersion: 0, variableData: false, format: 'High resolution PDF', notes: 'New quote awaiting confirmation.' };
    dispatch(prependOrderLocally(order)); setNewOrderOpen(false); setSelectedId(nextId); showToast(`${nextId} quote created.`);
  };
  const submitProduct = async (form) => {
    try {
      const editing = Boolean(selectedProduct);
      const product = editing
        ? await dispatch(updateProduct({ originalSlug: selectedProduct.slug, product: form })).unwrap()
        : await dispatch(createProduct(form)).unwrap();
      setNewProductOpen(false);
      setSelectedProduct(null);
      showToast(`${product.name} ${editing ? 'updated' : 'added to products'}.`);
    } catch {
      // The modal displays the API error from the product slice.
    }
  };
  const clearProductErrors = () => { dispatch(clearCreateProductError()); dispatch(clearUpdateProductError()); };
  const openProductModal = () => { clearProductErrors(); setSelectedProduct(null); setNewProductOpen(true); };
  const editProduct = (product) => { clearProductErrors(); setSelectedProduct(product); setNewProductOpen(true); };
  const closeProductModal = () => {
    const mutationStatus = selectedProduct ? productUpdateStatus : productCreateStatus;
    if (mutationStatus !== 'loading') { clearProductErrors(); setNewProductOpen(false); setSelectedProduct(null); }
  };
  const viewCustomerOrders = (name) => { setSearch(name); navigate('/orders'); };
  const logout = () => { onLogout(); };

  return <div className={`admin-shell ${collapsed ? 'nav-collapsed' : ''}`}><Sidebar orders={orders} collapsed={collapsed} setCollapsed={setCollapsed} user={user} /><div className="admin-content"><Header search={search} setSearch={setSearch} onNewOrder={() => setNewOrderOpen(true)} onLogout={logout} loggingOut={logoutStatus === 'loading'} /><main><AppRoutes orders={orders} orderStatus={orderStatus} orderError={orderError} onRetryOrders={() => dispatch(fetchOrders())} analytics={analytics} analyticsStatus={analyticsStatus} analyticsError={analyticsError} onRetryAnalytics={() => dispatch(fetchAdminAnalytics())} products={products} productStatus={productStatus} productError={productError} onRetryProducts={() => dispatch(fetchProducts())} customers={customers} customerStatus={customerStatus} customerError={customerError} onRetryCustomers={() => dispatch(fetchCustomers())} search={search} setSearch={setSearch} onOpenOrder={setSelectedId} onAddProduct={openProductModal} onEditProduct={editProduct} onManageTemplates={setTemplateProduct} onViewCustomerOrders={viewCustomerOrders} /></main></div>{selectedOrder && <OrderDrawer order={selectedOrder} onClose={() => { dispatch(clearJobFeedback()); setSelectedId(null); }} onTransition={transition} onDownload={download} statusMutationStatus={statusMutationStatus} statusMutationError={statusMutationError} statusMutationOrderId={statusMutationOrderId} downloadStatus={downloadStatus} downloadError={downloadError} downloadOrderId={downloadOrderId} />}{newOrderOpen && <NewOrderModal customers={customers} products={products} onClose={() => setNewOrderOpen(false)} onCreate={createOrder} />}{newProductOpen && <AddProductModal product={selectedProduct} onClose={closeProductModal} onCreate={submitProduct} status={selectedProduct ? productUpdateStatus : productCreateStatus} error={selectedProduct ? productUpdateError : productCreateError} clearError={clearProductErrors} />}{templateProduct && <TemplateManagerModal product={templateProduct} onClose={() => setTemplateProduct(null)} />}{toast && <div className="toast"><CheckCircle2 />{toast}</div>}{logoutError && <div className="toast auth-error-toast" role="alert"><AlertCircle />{logoutError}</div>}</div>;
}

export default function AppContainer() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, logoutStatus, logoutError } = useSelector((state) => state.auth);
  const [authView, setAuthView] = useState('login');
  const [authNotice, setAuthNotice] = useState('');
  useEffect(() => {
    const expire = () => dispatch(sessionExpired());
    const verifySession = () => {
      if (isAuthenticated && !getValidAccessToken()) expire();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') verifySession();
    };
    window.addEventListener('auth:unauthorized', expire);
    window.addEventListener('focus', verifySession);
    document.addEventListener('visibilitychange', handleVisibility);
    verifySession();
    const token = getValidAccessToken();
    const expiresAt = Number(decodeAccessToken(token)?.exp) * 1000;
    const expiryDelay = expiresAt - Date.now();
    const expiryTimer = Number.isFinite(expiryDelay) && expiryDelay >= 0 && expiryDelay <= 2147483647
      ? window.setTimeout(verifySession, expiryDelay + 50)
      : null;
    return () => {
      if (expiryTimer != null) window.clearTimeout(expiryTimer);
      window.removeEventListener('auth:unauthorized', expire);
      window.removeEventListener('focus', verifySession);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [dispatch, isAuthenticated]);
  const showLogin = (notice = '') => {
    dispatch(clearSignupFeedback());
    setAuthNotice(notice);
    setAuthView('login');
  };
  const showSignup = () => {
    dispatch(clearLoginFeedback());
    setAuthNotice('');
    setAuthView('signup');
  };
  const signupComplete = (result) => {
    if (!result.session?.accessToken) showLogin(result.message || 'Account created. Confirm your email, then sign in.');
  };
  if (isAuthenticated) return <BrowserRouter><AdminWorkspace onLogout={() => dispatch(logoutUser())} user={user} logoutStatus={logoutStatus} logoutError={logoutError} /></BrowserRouter>;
  if (authView === 'signup') return <Signup onSignupSuccess={signupComplete} onShowLogin={() => showLogin()} />;
  return <Login notice={authNotice} onShowSignup={showSignup} />;
}
