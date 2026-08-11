import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image, MapPin, Plus, Palette, ListChecks, Eye, Map } from 'lucide-react';
import './Admin.css';

const StatCard = ({ icon: Icon, value, label, gradient, delay }) => (
  <motion.div
    className="stat-card-modern"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -4 }}
  >
    <div className="stat-gradient-border">
      <div className="stat-card-inner">
        <div className="stat-header">
          <div className="stat-icon-wrap" style={{ background: gradient }}>
            <Icon className="stat-icon-modern" strokeWidth={1.5} />
          </div>
        </div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  </motion.div>
);

const ActionCard = ({ icon: Icon, title, description, to, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <Link to={to} className="action-card-modern">
      <div className="action-card-inner">
        <motion.div
          className="action-icon-wrap"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="action-icon-modern" strokeWidth={1.5} />
        </motion.div>
        <h3 className="action-title">{title}</h3>
        <p className="action-desc">{description}</p>
        <div className="action-arrow">
          <Eye className="arrow-icon" strokeWidth={1.5} />
        </div>
      </div>
    </Link>
  </motion.div>
);

const Admin = () => {
  const [stats, setStats] = useState({ scenes: 0, hotspots: 0, denah: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [scenesRes, hotspotsRes, denahRes] = await Promise.all([
          fetch('/api/scenes/list'),
          fetch('/api/hotspots'),
          fetch('/api/denah')
        ]);
        const scenes = await scenesRes.json();
        const hotspots = await hotspotsRes.json();
        const denah = await denahRes.json();
        setStats({
          scenes: scenes.length,
          hotspots: hotspots.length,
          denah: denah.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard-modern">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Kelola virtual tour sekolah Anda</p>
        </div>
        <motion.button
          className="btn-primary-modern"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="btn-icon" strokeWidth={2} />
          Scene Baru
        </motion.button>
      </div>

      <div className="stats-grid-modern">
        <StatCard
          icon={Image}
          value={stats.scenes}
          label="Total Scene"
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          delay={0.1}
        />
        <StatCard
          icon={MapPin}
          value={stats.hotspots}
          label="Total Hotspot"
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          delay={0.2}
        />
        <StatCard
          icon={Map}
          value={stats.denah}
          label="Total Denah"
          gradient="linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)"
          delay={0.3}
        />
      </div>

      <div className="quick-actions-modern">
        <h2 className="section-title">Aksi Cepat</h2>
        <div className="actions-grid-modern">
          <ActionCard
            icon={Plus}
            title="Tambah Scene"
            description="Unggah panorama baru"
            to="/admin/scenes"
            delay={0.3}
          />
          <ActionCard
            icon={Palette}
            title="Panorama Editor"
            description="Edit dan atur panorama"
            to="/admin/editor"
            delay={0.4}
          />
          <ActionCard
            icon={Map}
            title="Kelola Denah"
            description="Atur denah dan sphere"
            to="/admin/denah"
            delay={0.45}
          />
          <ActionCard
            icon={ListChecks}
            title="Kelola Hotspot"
            description="Lihat dan edit hotspot"
            to="/admin/hotspots"
            delay={0.5}
          />
          <ActionCard
            icon={Eye}
            title="Lihat Tour"
            description="Preview virtual tour"
            to="/tour"
            delay={0.6}
          />
        </div>
      </div>
    </div>
  );
};

export default Admin;
