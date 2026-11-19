import React from 'react';
import { Box, CircleHelp, FileCheck2, Grid2X2, Layers3, Menu, MoreHorizontal, Settings, ShoppingBag, SlidersHorizontal, UsersRound } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navigation = [
  { path: '/dashboard', label: 'Overview', icon: Grid2X2, group: 'Workspace' },
  { path: '/orders', label: 'Orders', icon: ShoppingBag, count: 'orders' },
  { path: '/production', label: 'Production', icon: Layers3, count: 'production' },
  { path: '/proofs', label: 'Proofs', icon: FileCheck2, count: 'proofs' },
  { path: '/products', label: 'Products', icon: Box, group: 'Manage' },
  { path: '/customers', label: 'Customers', icon: UsersRound },
  { path: '/reports', label: 'Reports', icon: SlidersHorizontal },
];

export default function Sidebar({ orders, collapsed, setCollapsed, user }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const counts = {
    orders: orders.filter((item) => item.status !== 'archived').length,
    production: orders.filter((item) => ['approved', 'files_ready', 'production_queue', 'manufacturing'].includes(item.status)).length,
    proofs: orders.filter((item) => ['proof_ready', 'awaiting_approval', 'changes_requested'].includes(item.status)).length,
  };
  const userName = user?.fullName || user?.name || user?.email || 'Signed-in user';
  const userRole = user?.role
    ? String(user.role).replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
    : 'User';
  const initials = userName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="menu-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle menu"><Menu /></button>
      <div className="studio-brand"><span>DH</span><div>DIGITAL HEROES<small>PRODUCTION STUDIO</small></div></div>
      <nav>{navigation.map(({ path, label, icon: Icon, group, count }) => <div key={path}>{group && <p>{group}</p>}<button className={pathname === path ? 'active' : ''} onClick={() => navigate(path)} title={label}><Icon /><span>{label}</span>{count && counts[count] ? <b>{counts[count]}</b> : null}</button></div>)}</nav>
      <div className="side-bottom"><button><CircleHelp /><span>Help & docs</span></button><button><Settings /><span>Settings</span></button><div className="admin-user" title={user?.email || userName}><span>{initials}</span><div><b>{userName}</b><small>{userRole}</small></div><MoreHorizontal /></div></div>
    </aside>
  );
}
