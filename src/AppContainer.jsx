import React, { useMemo, useState } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { initialCustomers, initialOrders, initialProducts } from './adminData';
import Login from './components/auth/Login';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import OrderDrawer from './components/orders/OrderDrawer';
import NewOrderModal from './components/orders/NewOrderModal';
import AddProductModal from './components/products/AddProductModal';
import AppRoutes from './routes/AppRoutes';
import { statusLabel } from './utils/formatters';

function AdminWorkspace({ onLogout }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState('');
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
    const nextId = `DH-${Math.max(...orders.map((item) => Number(item.id.split('-')[1]))) + 1}`;
    const order = { id: nextId, customer: customer.name, customerId: customer.id, product: product.name, productId: product.id, qty: Number(form.qty), total: Number(form.qty) * product.price, due: form.due, priority: form.priority, status: 'quote', proofVersion: 0, variableData: false, format: 'High resolution PDF', notes: 'New quote awaiting confirmation.' };
    setOrders([order, ...orders]); setNewOrderOpen(false); setSelectedId(nextId); showToast(`${nextId} quote created.`);
  };
  const createProduct = (form) => {
    const id = `PRD-${100 + products.length + 1}`;
    setProducts([...products, { id, name: form.name, category: form.category, price: Number(form.price), stock: 'In stock', orders: 0 }]); setNewProductOpen(false); showToast(`${form.name} added to products.`);
  };
  const viewCustomerOrders = (name) => { setSearch(name); navigate('/orders'); };
  const logout = () => { sessionStorage.removeItem('dh-admin'); onLogout(); };

  return <div className={`admin-shell ${collapsed ? 'nav-collapsed' : ''}`}><Sidebar orders={orders} collapsed={collapsed} setCollapsed={setCollapsed} /><div className="admin-content"><Header search={search} setSearch={setSearch} onNewOrder={() => setNewOrderOpen(true)} onLogout={logout} /><main><AppRoutes orders={orders} products={products} customers={initialCustomers} search={search} setSearch={setSearch} onOpenOrder={setSelectedId} onAddProduct={() => setNewProductOpen(true)} onViewCustomerOrders={viewCustomerOrders} /></main></div>{selectedOrder && <OrderDrawer order={selectedOrder} onClose={() => setSelectedId(null)} onTransition={transition} onDownload={download} />}{newOrderOpen && <NewOrderModal customers={initialCustomers} products={products} onClose={() => setNewOrderOpen(false)} onCreate={createOrder} />}{newProductOpen && <AddProductModal onClose={() => setNewProductOpen(false)} onCreate={createProduct} />}{toast && <div className="toast"><CheckCircle2 />{toast}</div>}</div>;
}

export default function AppContainer() {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('dh-admin') === 'true');
  const login = () => { sessionStorage.setItem('dh-admin', 'true'); setLoggedIn(true); };
  return loggedIn ? <BrowserRouter><AdminWorkspace onLogout={() => setLoggedIn(false)} /></BrowserRouter> : <Login onLogin={login} />;
}
