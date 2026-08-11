import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Edit2, Trash2 } from 'lucide-react';
import './HotspotManager.css';

const useMobileDetect = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

const HotspotManager = () => {
  const [hotspots, setHotspots] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ pitch: 0, yaw: 0, text: '', description: '', target_scene_id: '' });
  const [message, setMessage] = useState(null);
  const isMobile = useMobileDetect();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [hotspotsRes, scenesRes] = await Promise.all([
        fetch('/api/hotspots'),
        fetch('/api/scenes/list')
      ]);
      const hotspotsData = await hotspotsRes.json();
      const scenesData = await scenesRes.json();
      setHotspots(hotspotsData);
      setScenes(scenesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleEdit = (hotspot) => {
    setEditingId(hotspot.id);
    setEditForm({
      pitch: hotspot.pitch,
      yaw: hotspot.yaw,
      text: hotspot.text || '',
      description: hotspot.description || '',
      target_scene_id: hotspot.target_scene_id || ''
    });
  };

  const handleSave = async (id) => {
    try {
      const response = await fetch(`/api/hotspots/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Hotspot berhasil diperbarui' });
        setEditingId(null);
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Gagal memperbarui hotspot' });
      }
    } catch (error) {
      console.error('Error updating hotspot:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus hotspot ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/hotspots/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Hotspot berhasil dihapus' });
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Gagal menghapus hotspot' });
      }
    } catch (error) {
      console.error('Error deleting hotspot:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ pitch: 0, yaw: 0, text: '', description: '', target_scene_id: '' });
  };

  if (loading) {
    return (
      <div className="hm-loading">
        <div className="hm-spinner"></div>
      </div>
    );
  }

  return (
    <div className="hotspot-manager-modern">
      <div className="page-header">
        <h1 className="page-title">Kelola Hotspot</h1>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`hm-toast hm-toast-${message.type}`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="hm-card">
        {hotspots.length === 0 ? (
          <p className="hm-empty">Belum ada hotspot. Gunakan Panorama Editor untuk membuat hotspot.</p>
        ) : (
          isMobile ? (
            <div className="hm-cards-list">
              {hotspots.map((hotspot) => (
                <div key={hotspot.id} className="hm-hotspot-card">
                  <div className="hm-hotspot-card-header">
                    <div className="hm-hotspot-card-id">#{hotspot.id}</div>
                    <div className="hm-hotspot-card-actions">
                      {editingId === hotspot.id ? (
                        <>
                          <motion.button
                            className="hm-btn hm-btn-sm hm-btn-save"
                            onClick={() => handleSave(hotspot.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Save className="hm-btn-icon-sm" strokeWidth={2} />
                          </motion.button>
                          <motion.button
                            className="hm-btn hm-btn-sm hm-btn-cancel"
                            onClick={cancelEdit}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <X className="hm-btn-icon-sm" strokeWidth={2} />
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            className="hm-btn hm-btn-sm hm-btn-edit"
                            onClick={() => handleEdit(hotspot)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit2 className="hm-btn-icon-sm" strokeWidth={2} />
                          </motion.button>
                          <motion.button
                            className="hm-btn hm-btn-sm hm-btn-delete"
                            onClick={() => handleDelete(hotspot.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Trash2 className="hm-btn-icon-sm" strokeWidth={2} />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="hm-hotspot-card-body">
                    {editingId === hotspot.id ? (
                      <>
                        <div className="hm-hotspot-field">
                          <label className="hm-hotspot-label">Text</label>
                          <input
                            type="text"
                            className="hm-input hm-input-sm"
                            value={editForm.text}
                            onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                          />
                        </div>
                        <div className="hm-hotspot-field">
                          <label className="hm-hotspot-label">Deskripsi</label>
                          <textarea
                            className="hm-textarea hm-textarea-sm"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Deskripsi tooltip"
                            rows={2}
                          />
                        </div>
                        <div className="hm-hotspot-field">
                          <label className="hm-hotspot-label">Target Scene</label>
                          <select
                            className="hm-select hm-select-sm"
                            value={editForm.target_scene_id}
                            onChange={(e) => setEditForm({ ...editForm, target_scene_id: e.target.value })}
                          >
                            <option value="">Pilih Scene</option>
                            {scenes.map((scene) => (
                              <option key={scene.id} value={scene.id}>{scene.name}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="hm-hotspot-field">
                          <span className="hm-hotspot-label">Scene Asal</span>
                          <span className="hm-hotspot-value">{hotspot.scene_name}</span>
                        </div>
                        <div className="hm-hotspot-field">
                          <span className="hm-hotspot-label">Text</span>
                          <span className="hm-hotspot-value">{hotspot.text || '-'}</span>
                        </div>
                        <div className="hm-hotspot-field">
                          <span className="hm-hotspot-label">Deskripsi</span>
                          <span className="hm-hotspot-value">{hotspot.description || '-'}</span>
                        </div>
                        <div className="hm-hotspot-field">
                          <span className="hm-hotspot-label">Target Scene</span>
                          <span className="hm-hotspot-value">{hotspot.target_scene_name || '-'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="hm-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Scene Asal</th>
                    <th>Text</th>
                    <th>Deskripsi</th>
                    <th>Target Scene</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {hotspots.map((hotspot) => (
                    <tr key={hotspot.id}>
                      <td>{hotspot.id}</td>
                      <td>{hotspot.scene_name}</td>
                      {editingId === hotspot.id ? (
                        <>
                          <td>
                            <input
                              type="text"
                              className="hm-input hm-input-sm"
                              value={editForm.text}
                              onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                            />
                          </td>
                          <td>
                            <textarea
                              className="hm-textarea hm-textarea-sm"
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              placeholder="Deskripsi tooltip"
                              rows={2}
                            />
                          </td>
                          <td>
                            <select
                              className="hm-select hm-select-sm"
                              value={editForm.target_scene_id}
                              onChange={(e) => setEditForm({ ...editForm, target_scene_id: e.target.value })}
                            >
                              <option value="">Pilih Scene</option>
                              {scenes.map((scene) => (
                                <option key={scene.id} value={scene.id}>{scene.name}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <motion.button
                              className="hm-btn hm-btn-sm hm-btn-save"
                              onClick={() => handleSave(hotspot.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Save className="hm-btn-icon-sm" strokeWidth={2} />
                            </motion.button>
                            <motion.button
                              className="hm-btn hm-btn-sm hm-btn-cancel"
                              onClick={cancelEdit}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <X className="hm-btn-icon-sm" strokeWidth={2} />
                            </motion.button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{hotspot.text || '-'}</td>
                          <td className="hm-desc-cell">{hotspot.description || '-'}</td>
                          <td>{hotspot.target_scene_name || '-'}</td>
                          <td>
                            <motion.button
                              className="hm-btn hm-btn-sm hm-btn-edit"
                              onClick={() => handleEdit(hotspot)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Edit2 className="hm-btn-icon-sm" strokeWidth={2} />
                            </motion.button>
                            <motion.button
                              className="hm-btn hm-btn-sm hm-btn-delete"
                              onClick={() => handleDelete(hotspot.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash2 className="hm-btn-icon-sm" strokeWidth={2} />
                            </motion.button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default HotspotManager;
