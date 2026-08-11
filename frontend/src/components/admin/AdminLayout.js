import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Image, MapPin, Palette, Home, Eye, Menu, X, Users, LogOut, Clock, Map } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const isSuperAdmin = user?.role === 'super_admin';

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/scenes', label: 'Kelola Scene', icon: Image },
    { path: '/admin/hotspots', label: 'Kelola Hotspot', icon: MapPin },
    { path: '/admin/editor', label: 'Panorama Editor', icon: Palette },
    { path: '/admin/denah', label: 'Kelola Denah', icon: Map },
    ...(isSuperAdmin ? [{ path: '/admin/activity', label: 'Log Aktivitas', icon: Clock }] : []),
    ...(isSuperAdmin ? [{ path: '/admin/users', label: 'Kelola Admin', icon: Users }] : []),
    { path: '/', label: 'Landing Page', icon: Home, external: true },
    { path: '/tour', label: 'Virtual Tour', icon: Eye, external: true },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      <aside className="floating-sidebar">
        <div className="sidebar-header">
          <div className="logo-mark">V</div>
          <span className="logo-text">Vitour</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <motion.div
                  className="nav-icon-wrapper"
                  whileHover={{ scale: 1.15, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Icon className="nav-icon" strokeWidth={1.8} />
                  <span className="nav-label">{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="active-indicator"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut className="logout-icon" size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <button
          className="mobile-hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                className="mobile-menu-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                className="mobile-menu-drawer"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="mobile-menu-header">
                  <div className="logo-mark">V</div>
                  <span className="logo-text">Vitour</span>
                </div>
                <nav className="mobile-menu-nav">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`mobile-nav-item ${active ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="mobile-nav-icon" strokeWidth={1.8} />
                        <span className="mobile-nav-label">{item.label}</span>
                        {active && <div className="mobile-active-dot" />}
                      </Link>
                    );
                  })}
                  <button className="mobile-logout-btn" onClick={handleLogout}>
                    <LogOut className="mobile-nav-icon" strokeWidth={1.8} size={20} />
                    <span className="mobile-nav-label">Logout</span>
                  </button>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="admin-content-wrapper"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminLayout;
