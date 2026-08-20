import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Save, X, Edit2, Trash2, ImagePlus, Loader2 } from 'lucide-react';
import './SceneManager.css';

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

const SceneManager = () => {
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const isMobile = useMobileDetect();

  useEffect(() => {
    fetchScenes();
  }, []);

  const fetchScenes = async () => {
    try {
      const response = await fetch('/api/scenes/list');
      const data = await response.json();
      setScenes(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching scenes:', error);
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!name || !image) {
      setMessage({ type: 'error', text: 'Mohon isi nama dan pilih gambar' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('image', image);

    try {
      const response = await fetch('/api/scenes', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Scene berhasil ditambahkan' });
        setName('');
        setDescription('');
        setImage(null);
        document.getElementById('scene-image').value = '';
        fetchScenes();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Gagal mengunggah scene' });
      }
    } catch (error) {
      console.error('Error uploading scene:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengunggah' });
    }

    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus scene ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/scenes/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Scene berhasil dihapus' });
        fetchScenes();
      } else {
        setMessage({ type: 'error', text: 'Gagal menghapus scene' });
      }
    } catch (error) {
      console.error('Error deleting scene:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    }
  };

  const handleEdit = (scene) => {
    setEditingId(scene.id);
    setEditForm({
      name: scene.name,
      description: scene.description || ''
    });
  };

  const handleSave = async (id) => {
    try {
      const response = await fetch(`/api/scenes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description || ''
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Scene berhasil diperbarui' });
        setEditingId(null);
        fetchScenes();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal memperbarui scene' });
      }
    } catch (error) {
      console.error('Error updating scene:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan: ' + error.message });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', description: '' });
  };

  if (loading) {
    return (
      <div className="sc-loading">
        <div className="sc-spinner"></div>
      </div>
    );
  }

  const renderSceneActions = (scene) => (
    <td>
      {editingId === scene.id ? (
        <>
          <motion.button
            className="sc-btn sc-btn-sm sc-btn-save"
            onClick={() => handleSave(scene.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Save className="sc-btn-icon-sm" strokeWidth={2} />
          </motion.button>
          <motion.button
            className="sc-btn sc-btn-sm sc-btn-cancel"
            onClick={cancelEdit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="sc-btn-icon-sm" strokeWidth={2} />
          </motion.button>
        </>
      ) : (
        <>
          <motion.button
            className="sc-btn sc-btn-sm sc-btn-edit"
            onClick={() => handleEdit(scene)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit2 className="sc-btn-icon-sm" strokeWidth={2} />
          </motion.button>
          <motion.button
            className="sc-btn sc-btn-sm sc-btn-delete"
            onClick={() => handleDelete(scene.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="sc-btn-icon-sm" strokeWidth={2} />
          </motion.button>
        </>
      )}
    </td>
  );

  const renderSceneContent = (scene) => {
    if (editingId === scene.id) {
      return (
        <>
          <td>
            <input
              type="text"
              className="sc-input sc-input-sm"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </td>
          <td>
            <textarea
              className="sc-textarea sc-textarea-sm"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Deskripsi"
              rows={2}
            />
          </td>
          <td>
            <img
              src={`/uploads/${scene.image_path}`}
              alt={scene.name}
              className="sc-thumbnail"
            />
          </td>
        </>
      );
    }
    return (
      <>
        <td>{scene.name}</td>
        <td className="sc-desc-cell">{scene.description || '-'}</td>
        <td>
          <img
            src={`/uploads/${scene.image_path}`}
            alt={scene.name}
            className="sc-thumbnail"
          />
        </td>
      </>
    );
  };

  return (
    <div className="scene-manager-modern">
      <div className="page-header">
        <h1 className="page-title">Kelola Scene</h1>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`sc-toast sc-toast-${message.type}`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="sc-grid">
        <div className="sc-card sc-upload-card">
          <h2 className="sc-card-title">
            <ImagePlus className="sc-title-icon" strokeWidth={1.5} />
            Tambah Scene Baru
          </h2>
          <form onSubmit={handleUpload}>
            <div className="sc-form-group">
              <label className="sc-label">Nama Scene</label>
              <input
                type="text"
                className="sc-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama scene"
                disabled={uploading}
              />
            </div>
            <div className="sc-form-group">
              <label className="sc-label">Deskripsi Scene</label>
              <textarea
                className="sc-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi tentang tempat ini (akan muncul di tour)"
                rows={3}
                disabled={uploading}
              />
            </div>
            <div className="sc-form-group">
              <label className="sc-label">File Panorama (360°)</label>
              <div className="sc-file-input">
                <input
                  id="scene-image"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setImage(e.target.files[0])}
                  disabled={uploading}
                />
                {image && <span className="sc-file-name">{image.name}</span>}
              </div>
            </div>
            <motion.button
              type="submit"
              className="sc-btn sc-btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="sc-btn-icon sc-btn-icon-spin" strokeWidth={2} />
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="sc-btn-icon" strokeWidth={2} />
                  Unggah Scene
                </>
              )}
            </motion.button>
          </form>
        </div>

        <div className="sc-card sc-scenes-card">
          <h2 className="sc-card-title">Daftar Scene ({scenes.length})</h2>
          {scenes.length === 0 ? (
            <p className="sc-empty">Belum ada scene. Silakan upload scene pertama Anda.</p>
          ) : (
            <>
              {isMobile ? (
                <div className="sc-cards-list">
                  {scenes.map((scene) => (
                    <div key={scene.id} className="sc-scene-card">
                      <div className="sc-scene-card-header">
                        <div className="sc-scene-card-id">#{scene.id}</div>
                        <div className="sc-scene-card-actions">
                          {editingId === scene.id ? (
                            <>
                              <motion.button
                                className="sc-btn sc-btn-sm sc-btn-save"
                                onClick={() => handleSave(scene.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Save className="sc-btn-icon-sm" strokeWidth={2} />
                              </motion.button>
                              <motion.button
                                className="sc-btn sc-btn-sm sc-btn-cancel"
                                onClick={cancelEdit}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <X className="sc-btn-icon-sm" strokeWidth={2} />
                              </motion.button>
                            </>
                          ) : (
                            <>
                              <motion.button
                                className="sc-btn sc-btn-sm sc-btn-edit"
                                onClick={() => handleEdit(scene)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Edit2 className="sc-btn-icon-sm" strokeWidth={2} />
                              </motion.button>
                              <motion.button
                                className="sc-btn sc-btn-sm sc-btn-delete"
                                onClick={() => handleDelete(scene.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Trash2 className="sc-btn-icon-sm" strokeWidth={2} />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="sc-scene-card-body">
                        {editingId === scene.id ? (
                          <>
                            <div className="sc-scene-field">
                              <label className="sc-scene-label">Nama</label>
                              <input
                                type="text"
                                className="sc-input sc-input-sm"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              />
                            </div>
                            <div className="sc-scene-field">
                              <label className="sc-scene-label">Deskripsi</label>
                              <textarea
                                className="sc-textarea sc-textarea-sm"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                placeholder="Deskripsi"
                                rows={2}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="sc-scene-field">
                              <span className="sc-scene-label">Nama</span>
                              <span className="sc-scene-value">{scene.name}</span>
                            </div>
                            <div className="sc-scene-field">
                              <span className="sc-scene-label">Deskripsi</span>
                              <span className="sc-scene-value">{scene.description || '-'}</span>
                            </div>
                          </>
                        )}
                        <div className="sc-scene-thumbnail">
                          <img
                            src={`/uploads/${scene.image_path}`}
                            alt={scene.name}
                            className="sc-thumbnail-mobile"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sc-scenes-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nama</th>
                        <th>Deskripsi</th>
                        <th>Gambar</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenes.map((scene) => (
                        <tr key={scene.id}>
                          <td>{scene.id}</td>
                          {renderSceneContent(scene)}
                          {renderSceneActions(scene)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SceneManager;
