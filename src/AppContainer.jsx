import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { initialCustomers, initialOrders } from './adminData';
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
import { clearLoginFeedback, clearSignupFeedback, logoutUser } from './redux/slices/authSlice';
import { clearCreateProductError, clearUpdateProductError, createProduct, fetchProducts, updateProduct } from './redux/slices/productSlice';

function AdminWorkspace({ onLogout, user, logoutStatus, logoutError }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(initialOrders);
  const { items: products, fetchStatus: productStatus, createStatus: productCreateStatus, updateStatus: productUpdateStatus, fetchError: productError, createError: productCreateError, updateError: productUpdateError } = useSelector((state) => state.products);
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
  }, [dispatch]);
  const selectedOrder = useMemo(() => orders.find((item) => item.id === selectedId), [orders, selectedId]);
  const showToast = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };
  const transition = (id, status, proofVersion) => {
    setOrders((all) => all.map((order) => order.id === id ? { ...order, status, ...(proofVersion ? { proofVersion } : {}) } : order));
    showToast(`${id} moved to ${statusLabel(status)}.`);
  };
  const download = (order) => {
    const content = `DIGITAL HEROES PRODUCTION PACKAGE\nJob: ${order.id}\nCustomer: ${order.customer}\nProduct: ${order.product}\nQuantity: ${order.qty}\nOutput: ${order.format}\n`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${order.id}-production-package.txt`; anchor.click(); URL.revokeObjectURL(url);
    setOrders((all) => all.map((item) => item.id === order.id ? { ...item, downloaded: true } : item));
    showToast(`${order.id} production package downloaded.`);
  };
  const createOrder = (form) => {
    const customer = initialCustomers.find((item) => item.id === form.customerId);
    const product = products.find((item) => item.id === form.productId);
    if (!customer || !product) return;
    const nextId = `DH-${Math.max(...orders.map((item) => Number(item.id.split('-')[1]))) + 1}`;
    const order = { id: nextId, customer: customer.name, customerId: customer.id, product: product.name, productId: product.id, qty: Number(form.qty), total: Number(form.qty) * product.price, due: form.due, priority: form.priority, status: 'quote', proofVersion: 0, variableData: false, format: 'High resolution PDF', notes: 'New quote awaiting confirmation.' };
    setOrders([order, ...orders]); setNewOrderOpen(false); setSelectedId(nextId); showToast(`${nextId} quote created.`);
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

  return <div className={`admin-shell ${collapsed ? 'nav-collapsed' : ''}`}><Sidebar orders={orders} collapsed={collapsed} setCollapsed={setCollapsed} user={user} /><div className="admin-content"><Header search={search} setSearch={setSearch} onNewOrder={() => setNewOrderOpen(true)} onLogout={logout} loggingOut={logoutStatus === 'loading'} /><main><AppRoutes orders={orders} products={products} productStatus={productStatus} productError={productError} onRetryProducts={() => dispatch(fetchProducts())} customers={initialCustomers} search={search} setSearch={setSearch} onOpenOrder={setSelectedId} onAddProduct={openProductModal} onEditProduct={editProduct} onManageTemplates={setTemplateProduct} onViewCustomerOrders={viewCustomerOrders} /></main></div>{selectedOrder && <OrderDrawer order={selectedOrder} onClose={() => setSelectedId(null)} onTransition={transition} onDownload={download} />}{newOrderOpen && <NewOrderModal customers={initialCustomers} products={products} onClose={() => setNewOrderOpen(false)} onCreate={createOrder} />}{newProductOpen && <AddProductModal product={selectedProduct} onClose={closeProductModal} onCreate={submitProduct} status={selectedProduct ? productUpdateStatus : productCreateStatus} error={selectedProduct ? productUpdateError : productCreateError} clearError={clearProductErrors} />}{templateProduct && <TemplateManagerModal product={templateProduct} onClose={() => setTemplateProduct(null)} />}{toast && <div className="toast"><CheckCircle2 />{toast}</div>}{logoutError && <div className="toast auth-error-toast" role="alert"><AlertCircle />{logoutError}</div>}</div>;
}

export default function AppContainer() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, logoutStatus, logoutError } = useSelector((state) => state.auth);
  const [authView, setAuthView] = useState('login');
  const [authNotice, setAuthNotice] = useState('');
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
