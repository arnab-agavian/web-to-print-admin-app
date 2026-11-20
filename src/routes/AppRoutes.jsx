import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '../components/dashboard/Dashboard';
import OrdersPage from '../components/orders/OrdersPage';
import ProductsPage from '../components/products/ProductsPage';
import CustomersPage from '../components/customers/CustomersPage';
import ReportsPage from '../components/reports/ReportsPage';

export default function AppRoutes({ orders, products, productStatus, productError, onRetryProducts, customers, search, setSearch, onOpenOrder, onAddProduct, onEditProduct, onManageTemplates, onViewCustomerOrders }) {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard orders={orders} search={search} onOpen={onOpenOrder} />} />
      <Route path="/orders" element={<OrdersPage orders={orders} search={search} setSearch={setSearch} onOpen={onOpenOrder} />} />
      <Route path="/production" element={<OrdersPage title="Production queue." description="Approved files, queued jobs and active manufacturing." orders={orders} search={search} setSearch={setSearch} onOpen={onOpenOrder} subset={(item) => ['approved', 'files_ready', 'production_queue', 'manufacturing'].includes(item.status)} />} />
      <Route path="/proofs" element={<OrdersPage title="Proof centre." description="Generate, send and resolve every customer proof." orders={orders} search={search} setSearch={setSearch} onOpen={onOpenOrder} subset={(item) => ['proof_ready', 'awaiting_approval', 'changes_requested'].includes(item.status)} />} />
      <Route path="/products" element={<ProductsPage products={products} status={productStatus} error={productError} onRetry={onRetryProducts} onAdd={onAddProduct} onEdit={onEditProduct} onTemplates={onManageTemplates} />} />
      <Route path="/customers" element={<CustomersPage customers={customers} orders={orders} onViewOrders={onViewCustomerOrders} />} />
      <Route path="/reports" element={<ReportsPage orders={orders} />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
