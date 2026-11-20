import React from 'react';
import { Bell, LogOut, Plus, Search } from 'lucide-react';
import { AppSearchInput } from '../ui/AppFields';

export default function Header({ search, setSearch, onNewOrder, onLogout, loggingOut }) {
  return (
    <header className="admin-header">
      <div className="global-search"><Search /><AppSearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search orders, customers, products..." inputProps={{ 'aria-label': 'Search orders, customers, and products' }} /><kbd>⌘ K</kbd></div>
      <div className="header-actions">
        <button className="round-btn" aria-label="Notifications"><Bell /><i /></button>
        {/* <button className="primary-button" onClick={onNewOrder}><Plus />New order</button> */}
        <button className="round-btn" onClick={onLogout} disabled={loggingOut} aria-label={loggingOut ? 'Signing out' : 'Sign out'} aria-busy={loggingOut} title={loggingOut ? 'Signing out…' : 'Sign out'}><LogOut /></button>
      </div>
    </header>
  );
}
