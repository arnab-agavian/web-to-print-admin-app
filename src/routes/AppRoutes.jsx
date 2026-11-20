import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '../components/dashboard/Dashboard';
import OrdersPage from '../components/orders/OrdersPage';
import ProductsPage from '../components/products/ProductsPage';
import CustomersPage from '../components/customers/CustomersPage';
import ReportsPage from '../components/reports/ReportsPage';

export default function AppRoutes({ orders, orderStatus, orderError, onRetryOrders, analytics, analyticsStatus, analyticsError, onRetryAnalytics, products, productStatus, productError, onRetryProducts, customers, customerStatus, customerError, onRetryCustomers, search, setSearch, onOpenOrder, onAddProduct, onEditProduct, onManageTemplates, onViewCustomerOrders }) {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard orders={orders} analytics={analytics} analyticsStatus={analyticsStatus} analyticsError={analyticsError} onRetryAnalytics={onRetryAnalytics} search={search} onOpen={onOpenOrder} />} />
      <Route path="/orders" element={<OrdersPage orders={orders} status={orderStatus} error={orderError} onRetry={onRetryOrders} search={search} setSearch={setSearch} onOpen={onOpenOrder} />} />
      <Route path="/production" element={<OrdersPage title="Production queue." description="Approved files, queued jobs and active manufacturing." orders={orders} status={orderStatus} error={orderError} onRetry={onRetryOrders} search={search} setSearch={setSearch} onOpen={onOpenOrder} subset={(item) => ['approved', 'files_ready', 'production_queue', 'manufacturing'].includes(item.status)} />} />
      <Route path="/proofs" element={<OrdersPage title="Proof centre." description="Generate, send and resolve every customer proof." orders={orders} status={orderStatus} error={orderError} onRetry={onRetryOrders} search={search} setSearch={setSearch} onOpen={onOpenOrder} subset={(item) => ['proof_ready', 'awaiting_approval', 'changes_requested'].includes(item.status)} />} />
      <Route path="/products" element={<ProductsPage products={products} status={productStatus} error={productError} onRetry={onRetryProducts} onAdd={onAddProduct} onEdit={onEditProduct} onTemplates={onManageTemplates} />} />
      <Route path="/customers" element={<CustomersPage customers={customers} status={customerStatus} error={customerError} onRetry={onRetryCustomers} search={search} onViewOrders={onViewCustomerOrders} />} />
      <Route path="/reports" element={<ReportsPage orders={orders} analytics={analytics} analyticsStatus={analyticsStatus} analyticsError={analyticsError} onRetryAnalytics={onRetryAnalytics} />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
