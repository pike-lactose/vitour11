import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Save, X, Edit2, Trash2, ImagePlus, Loader2, MapPin } from 'lucide-react';
import './DenahManager.css';

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

const DenahManager = () => {
  const [denahList, setDenahList] = useState([]);
  const [floorPlan, setFloorPlan] = useState(null);
  const [spheres, setSpheres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const isMobile = useMobileDetect();
  const floorplanRef = useRef(null);

  const [denahName, setDenahName] = useState('');
  const [denahDesc, setDenahDesc] = useState('');
  const [denahImage, setDenahImage] = useState(null);
  const [editingDenahId, setEditingDenahId] = useState(null);
  const [editDenahForm, setEditDenahForm] = useState({ name: '', description: '' });

  const [fpImage, setFpImage] = useState(null);
  const [uploadingFp, setUploadingFp] = useState(false);

  const [placingSphere, setPlacingSphere] = useState(false);
  const [sphereForm, setSphereForm] = useState({ text: '', target_denah_id: '' });
  const [pendingSpherePos, setPendingSpherePos] = useState(null);
  const [editingSphereId, setEditingSphereId] = useState(null);
  const [editSphereForm, setEditSphereForm] = useState({ text: '', target_denah_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [denahRes, fpRes, spheresRes] = await Promise.all([
        fetch('/api/denah'),
        fetch('/api/floorplan'),
        fetch('/api/denah-spheres')
      ]);
      setDenahList(await denahRes.json());
      const fpData = await fpRes.json();
      setFloorPlan(fpData.image_path ? fpData : null);
      setSpheres(await spheresRes.json());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDenahUpload = async (e) => {
    e.preventDefault();
    if (!denahName || !denahImage) {
      showMessage('error', 'Mohon isi nama dan pilih gambar');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('name', denahName);
    formData.append('description', denahDesc);
    formData.append('image', denahImage);
    try {
      const res = await fetch('/api/denah', { method: 'POST', body: formData });
      if (res.ok) {
        showMessage('success', 'Denah berhasil ditambahkan');
        setDenahName('');
        setDenahDesc('');
        setDenahImage(null);
        document.getElementById('denah-image').value = '';
        fetchData();
      } else {
        const err = await res.json();
        showMessage('error', err.error || 'Gagal mengunggah');
      }
    } catch (error) {
      showMessage('error', 'Terjadi kesalahan');
    }
    setUploading(false);
  };

  const handleDenahDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus denah ini?')) return;
    try {
      const res = await fetch(`/api/denah/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showMessage('success', 'Denah berhasil dihapus');
        fetchData();
      } else {
        showMessage('error', 'Gagal menghapus denah');
      }
    } catch (error) {
      showMessage('error', 'Terjadi kesalahan');
    }
  };

  const handleDenahEdit = (d) => {
    setEditingDenahId(d.id);
    setEditDenahForm({ name: d.name, description: d.description || '' });
  };

  const handleDenahSave = async (id) => {
    try {
      const res = await fetch(`/api/denah/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDenahForm)
      });
      if (res.ok) {
        showMessage('success', 'Denah berhasil diperbarui');
        setEditingDenahId(null);
        fetchData();
      } else {
        showMessage('error', 'Gagal memperbarui denah');
      }
    } catch (error) {
      showMessage('error', 'Terjadi kesalahan');
    }
  };

  const handleFpUpload = async () => {
    if (!fpImage) {
      showMessage('error', 'Pilih gambar denah terlebih dahulu');
      return;
    }
    setUploadingFp(true);
    const formData = new FormData();
    formData.append('image', fpImage);
    try {
      const res = await fetch('/api/floorplan', { method: 'POST', body: formData });
      if (res.ok) {
        showMessage('success', 'Denah utama berhasil diunggah');
        setFpImage(null);
        if (floorplanRef.current) floorplanRef.current.value = '';
        fetchData();
      } else {
        showMessage('error', 'Gagal mengunggah denah utama');
      }
    } catch (error) {
      showMessage('error', 'Terjadi kesalahan');
    }
    setUploadingFp(false);
  };

  const handleFloorplanClick = (e) => {
    if (!placingSphere || !floorPlan) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingSpherePos({ x, y });
    setPlacingSphere(false);
  };

  const handleSaveSphere = async () => {
    if (!pendingSpherePos) return;
    try {
      const res = await fetch('/api/denah-spheres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          denah_id: denahList.length > 0 ? denahList[0].id : 1,
          x: pendingSpherePos.x,
          y: pendingSpherePos.y,
          text: sphereForm.text,
          target_denah_id: sphereForm.target_denah_id || null
        })
      });
      if (res.ok) {
        showMessage('success', 'Sphere berhasil ditambahkan');
        setPendingSpherePos(null);
        setSphereForm({ text: '', target_denah_id: '' });
        fetchData();
      }
    } catch (error) {
      showMessage('error', 'Terjadi kesalahan');
    }
  };

  const handleDeleteSphere = async (id) => {
    if (!window.confirm('Yakin ingin menghapus sphere ini?')) return;
    try {
      const res = await fetch(`/api/denah-spheres/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showMessage('success', 'Sphere berhasil dihapus');
        fetchData();
      }
    } catch (error) {
      showMessage('error', 'Terjadi kesalahan');
    }
  };

  const handleEditSphere = (sphere) => {
    setEditingSphereId(sphere.id);
    setEditSphereForm({ text: sphere.text || '', target_denah_id: sphere.target_denah_id || '' });
  };

  const handleSaveEditSphere = async (id) => {
    try {
      const sphere = spheres.find(s => s.id === id);
      const res = await fetch(`/api/denah-spheres/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editSphereForm, x: sphere.x, y: sphere.y })
      });
      if (res.ok) {
        showMessage('success', 'Sphere berhasil diperbarui');
        setEditingSphereId(null);
        fetchData();
      }
    } catch (error) {
      showMessage('error', 'Terjadi kesalahan');
    }
  };

  if (loading) {
    return (
      <div className="dm-loading">
        <div className="dm-spinner"></div>
      </div>
    );
  }

  return (
    <div className="denah-manager-modern">
      <div className="page-header">
        <h1 className="page-title">Kelola Denah</h1>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`dm-toast dm-toast-${message.type}`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="dm-grid">
        <div className="dm-left-panel">
          <div className="dm-card">
            <h2 className="dm-card-title">
              <ImagePlus className="dm-title-icon" strokeWidth={1.5} />
              Tambah Denah Baru
            </h2>
            <form onSubmit={handleDenahUpload}>
              <div className="dm-form-group">
                <label className="dm-label">Nama Lokasi</label>
                <input
                  type="text"
                  className="dm-input"
                  value={denahName}
                  onChange={(e) => setDenahName(e.target.value)}
                  placeholder="Contoh: Kelas X RPL 1"
                  disabled={uploading}
                />
              </div>
              <div className="dm-form-group">
                <label className="dm-label">Deskripsi</label>
                <textarea
                  className="dm-textarea"
                  value={denahDesc}
                  onChange={(e) => setDenahDesc(e.target.value)}
                  placeholder="Deskripsi lokasi"
                  rows={3}
                  disabled={uploading}
                />
              </div>
              <div className="dm-form-group">
                <label className="dm-label">Gambar (2D)</label>
                <div className="dm-file-input">
                  <input
                    id="denah-image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => setDenahImage(e.target.files[0])}
                    disabled={uploading}
                  />
                  {denahImage && <span className="dm-file-name">{denahImage.name}</span>}
                </div>
              </div>
              <motion.button
                type="submit"
                className="dm-btn dm-btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={uploading}
              >
                {uploading ? (
                  <><Loader2 className="dm-btn-icon dm-btn-icon-spin" strokeWidth={2} /> Mengunggah...</>
                ) : (
                  <><Upload className="dm-btn-icon" strokeWidth={2} /> Unggah Denah</>
                )}
              </motion.button>
            </form>
          </div>

          <div className="dm-card">
            <h2 className="dm-card-title">
              <MapPin className="dm-title-icon" strokeWidth={1.5} />
              Denah Utama
            </h2>
            {floorPlan ? (
              <div className="dm-fp-preview">
                <img
                  src={`http://localhost:5000/uploads/${floorPlan.image_path}`}
                  alt="Denah Utama"
                  className="dm-fp-img"
                />
              </div>
            ) : (
              <p className="dm-empty-hint">Belum ada denah utama</p>
            )}
            <div className="dm-form-group" style={{ marginTop: 12 }}>
              <div className="dm-file-input">
                <input
                  ref={floorplanRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setFpImage(e.target.files[0])}
                />
                {fpImage && <span className="dm-file-name">{fpImage.name}</span>}
              </div>
            </div>
            <motion.button
              className="dm-btn dm-btn-primary"
              onClick={handleFpUpload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={uploadingFp || !fpImage}
            >
              {uploadingFp ? (
                <><Loader2 className="dm-btn-icon dm-btn-icon-spin" strokeWidth={2} /> Mengunggah...</>
              ) : (
                <><Upload className="dm-btn-icon" strokeWidth={2} /> {floorPlan ? 'Ganti Denah' : 'Unggah Denah'}</>
              )}
            </motion.button>
          </div>
        </div>

        <div className="dm-right-panel">
          {floorPlan && (
            <div className="dm-card">
              <h2 className="dm-card-title">
                <MapPin className="dm-title-icon" strokeWidth={1.5} />
                Editor Sphere
              </h2>
              <p className="dm-hint">
                {placingSphere ? 'Klik pada denah untuk menempatkan sphere' : 'Klik "Tambah Sphere" lalu klik pada denah'}
              </p>
              <motion.button
                className={`dm-btn ${placingSphere ? 'dm-btn-cancel' : 'dm-btn-accent'}`}
                onClick={() => {
                  setPlacingSphere(!placingSphere);
                  setPendingSpherePos(null);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ marginBottom: 12 }}
              >
                <MapPin className="dm-btn-icon" strokeWidth={2} />
                {placingSphere ? 'Batal' : 'Tambah Sphere'}
              </motion.button>

              <div
                className={`dm-floorplan-editor ${placingSphere ? 'dm-placing' : ''}`}
                onClick={handleFloorplanClick}
              >
                <img
                  src={`http://localhost:5000/uploads/${floorPlan.image_path}`}
                  alt="Denah Utama"
                  className="dm-fp-editor-img"
                />
                {spheres.map((sphere) => (
                  <div
                    key={sphere.id}
                    className="dm-sphere"
                    style={{ left: `${sphere.x}%`, top: `${sphere.y}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!editingSphereId) handleEditSphere(sphere);
                    }}
                  >
                    <div className="dm-sphere-dot"></div>
                    {editingSphereId === sphere.id && (
                      <div className="dm-sphere-editor-popup" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className="dm-input dm-input-sm"
                          value={editSphereForm.text}
                          onChange={(e) => setEditSphereForm({ ...editSphereForm, text: e.target.value })}
                          placeholder="Label"
                        />
                        <select
                          className="dm-select dm-select-sm"
                          value={editSphereForm.target_denah_id}
                          onChange={(e) => setEditSphereForm({ ...editSphereForm, target_denah_id: e.target.value })}
                        >
                          <option value="">Pilih Target</option>
                          {denahList.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        <div className="dm-sphere-editor-actions">
                          <motion.button
                            className="dm-btn dm-btn-sm dm-btn-save"
                            onClick={() => handleSaveEditSphere(sphere.id)}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Save size={14} />
                          </motion.button>
                          <motion.button
                            className="dm-btn dm-btn-sm dm-btn-delete"
                            onClick={() => { setEditingSphereId(null); handleDeleteSphere(sphere.id); }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Trash2 size={14} />
                          </motion.button>
                          <motion.button
                            className="dm-btn dm-btn-sm dm-btn-cancel"
                            onClick={() => setEditingSphereId(null)}
                            whileTap={{ scale: 0.95 }}
                          >
                            <X size={14} />
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {pendingSpherePos && (
                  <div
                    className="dm-sphere dm-sphere-pending"
                    style={{ left: `${pendingSpherePos.x}%`, top: `${pendingSpherePos.y}%` }}
                  >
                    <div className="dm-sphere-dot dm-sphere-dot-pending"></div>
                  </div>
                )}
              </div>

              {pendingSpherePos && (
                <motion.div
                  className="dm-sphere-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="dm-form-group">
                    <label className="dm-label">Label Sphere</label>
                    <input
                      type="text"
                      className="dm-input"
                      value={sphereForm.text}
                      onChange={(e) => setSphereForm({ ...sphereForm, text: e.target.value })}
                      placeholder="Label sphere"
                    />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-label">Target Denah</label>
                    <select
                      className="dm-select"
                      value={sphereForm.target_denah_id}
                      onChange={(e) => setSphereForm({ ...sphereForm, target_denah_id: e.target.value })}
                    >
                      <option value="">Pilih Target</option>
                      {denahList.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <motion.button
                    className="dm-btn dm-btn-primary"
                    onClick={handleSaveSphere}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save className="dm-btn-icon" strokeWidth={2} />
                    Simpan Sphere
                  </motion.button>
                </motion.div>
              )}
            </div>
          )}

          <div className="dm-card">
            <h2 className="dm-card-title">
              Daftar Denah ({denahList.length})
            </h2>
            {denahList.length === 0 ? (
              <p className="dm-empty">Belum ada denah. Silakan tambah denah terlebih dahulu.</p>
            ) : (
              <div className="dm-denah-list">
                {denahList.map((d) => (
                  <div key={d.id} className="dm-denah-item">
                    <div className="dm-denah-item-img-wrap">
                      <img
                        src={`http://localhost:5000/uploads/${d.image_path}`}
                        alt={d.name}
                        className="dm-denah-item-img"
                      />
                    </div>
                    <div className="dm-denah-item-info">
                      {editingDenahId === d.id ? (
                        <>
                          <input
                            type="text"
                            className="dm-input dm-input-sm"
                            value={editDenahForm.name}
                            onChange={(e) => setEditDenahForm({ ...editDenahForm, name: e.target.value })}
                          />
                          <textarea
                            className="dm-textarea dm-textarea-sm"
                            value={editDenahForm.description}
                            onChange={(e) => setEditDenahForm({ ...editDenahForm, description: e.target.value })}
                            placeholder="Deskripsi"
                            rows={2}
                          />
                        </>
                      ) : (
                        <>
                          <h4 className="dm-denah-item-name">{d.name}</h4>
                          <p className="dm-denah-item-desc">{d.description || '-'}</p>
                        </>
                      )}
                    </div>
                    <div className="dm-denah-item-actions">
                      {editingDenahId === d.id ? (
                        <>
                          <motion.button
                            className="dm-btn dm-btn-sm dm-btn-save"
                            onClick={() => handleDenahSave(d.id)}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Save size={14} />
                          </motion.button>
                          <motion.button
                            className="dm-btn dm-btn-sm dm-btn-cancel"
                            onClick={() => setEditingDenahId(null)}
                            whileTap={{ scale: 0.95 }}
                          >
                            <X size={14} />
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            className="dm-btn dm-btn-sm dm-btn-edit"
                            onClick={() => handleDenahEdit(d)}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit2 size={14} />
                          </motion.button>
                          <motion.button
                            className="dm-btn dm-btn-sm dm-btn-delete"
                            onClick={() => handleDenahDelete(d.id)}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DenahManager;
