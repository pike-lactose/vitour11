import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Edit2, PlusCircle, RefreshCw, User } from 'lucide-react';
import './ActivityLog.css';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/activity-log', {
        credentials: 'include'
      });
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (err) {
      console.error('Fetch logs error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionIcon = (action) => {
    switch (action) {
      case 'scene_created': return <PlusCircle size={18} />;
      case 'scene_updated': return <Edit2 size={18} />;
      case 'hotspot_created': return <PlusCircle size={18} />;
      case 'hotspot_updated': return <Edit2 size={18} />;
      default: return <FileText size={18} />;
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'scene_created': return 'Menambahkan Scene baru';
      case 'scene_updated': return 'Memperbarui Scene';
      case 'hotspot_created': return 'Menambahkan Hotspot baru';
      case 'hotspot_updated': return 'Memperbarui Hotspot';
      default: return 'Aktivitas tidak diketahui';
    }
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    return `${diffDays} hari yang lalu`;
  };

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="activity-log">
      <div className="activity-log-header">
        <div>
          <h1 className="activity-log-title">Log Aktivitas</h1>
          <p className="activity-log-subtitle">Pantau aktivitas yang dilakukan oleh semua admin dan editor</p>
        </div>
        <button className="refresh-log-btn" onClick={fetchLogs}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="logs-loading">
          <div className="spinner"></div>
          <p>Memuat log aktivitas...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="logs-empty">Belum ada aktivitas yang tercatat</div>
      ) : (
        <div className="timeline">
          {logs.map((log, index) => (
            <motion.div
              key={index}
              className="timeline-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="timeline-icon">
                {getActionIcon(log.action)}
              </div>
              <div className="timeline-content">
                <div className="timeline-main">
                  <span className="timeline-action">{getActionLabel(log.action)}</span>
                  <span className="timeline-item-name">{log.item_name}</span>
                </div>
                <div className="timeline-meta">
                  <span className="timeline-user">
                    <User size={12} />
                    {log.actor}
                  </span>
                  <span className="timeline-time" title={formatFullDate(log.action_time)}>
                    {getRelativeTime(log.action_time)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
