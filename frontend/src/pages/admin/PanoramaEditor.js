import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronUp, ChevronDown, Save, Trash2, MapPin } from 'lucide-react';
import './PanoramaEditor.css';

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

const PanoramaEditor = () => {
  const viewerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [selectedScene, setSelectedScene] = useState('');
  const [sceneHotspots, setSceneHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [clickPosition, setClickPosition] = useState({ pitch: 0, yaw: 0 });
  const [hotspotForm, setHotspotForm] = useState({ text: '', description: '', target_scene_id: '' });
  const [message, setMessage] = useState(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const isMobile = useMobileDetect();

  useEffect(() => {
    fetchScenes();
  }, []);

  useEffect(() => {
    if (selectedScene) {
      loadScene(selectedScene);
      fetchSceneHotspots(selectedScene);
    }
  }, [selectedScene]);

  const fetchScenes = async () => {
    try {
      const response = await fetch('/api/scenes/list');
      const data = await response.json();
      setScenes(data);
      if (data.length > 0) {
        setSelectedScene(data[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching scenes:', error);
      setLoading(false);
    }
  };

  const fetchSceneHotspots = async (sceneId) => {
    try {
      const response = await fetch(`/api/hotspots?sceneId=${sceneId}`);
      const data = await response.json();
      setSceneHotspots(data);
    } catch (error) {
      console.error('Error fetching hotspots:', error);
    }
  };

  const loadScene = async (sceneId) => {
    const scene = scenes.find(s => Number(s.id) === Number(sceneId));
    if (!scene) return;

    if (!window.pannellum) {
      setTimeout(() => loadScene(sceneId), 100);
      return;
    }

    const hotspotsForViewer = sceneHotspots.map(h => {
      const targetScene = scenes.find(s => s.id === h.target_scene_id);
      return {
        pitch: h.pitch,
        yaw: h.yaw,
        type: 'scene',
        text: h.text || '',
        sceneId: h.target_scene_id,
        sceneName: targetScene ? targetScene.name : ''
      };
    });

    if (viewer) {
      viewer.destroy();
      setViewer(null);
    }

    const v = window.pannellum.viewer(viewerRef.current, {
      default: {
        firstScene: scene.name,
        autoLoad: true,
        compass: true,
        showControls: true,
        clickToGo: false
      },
      scenes: {
        [scene.name]: {
          type: 'equirectangular',
          panorama: `/uploads/${scene.image_path}`,
          hotSpots: hotspotsForViewer
        }
      }
    });

    v.on('scenechange', (sceneName) => {
      const targetScene = scenes.find(s => s.name === sceneName);
      if (targetScene) {
        setSelectedScene(targetScene.id);
      }
    });

    setViewer(v);

    v.on('load', () => {
      const container = viewerRef.current;
      let isDragging = false;
      let startX = 0;
      let startY = 0;

      container.onmousedown = (e) => {
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
      };

      container.onmousemove = (e) => {
        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);
        if (dx > 5 || dy > 5) {
          isDragging = true;
        }
      };

      container.onmouseup = (e) => {
        if (e.target.classList.contains('pnlm-hotspot')) return;
        if (isDragging) return;

        const coords = v.mouseEventToCoords(e);
        if (coords && coords.length >= 2) {
          setClickPosition({ pitch: coords[0], yaw: coords[1] });
          setShowForm(true);
          if (isMobile) {
            setIsBottomSheetOpen(true);
          }
        }
        isDragging = false;
      };
    });
  };

  const handleSaveHotspot = async () => {
    if (!selectedScene) return;

    try {
      const response = await fetch('/api/hotspots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_id: selectedScene,
          pitch: clickPosition.pitch,
          yaw: clickPosition.yaw,
          text: hotspotForm.text,
          description: hotspotForm.description,
          target_scene_id: hotspotForm.target_scene_id || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Hotspot berhasil dibuat' });
        setShowForm(false);
        setIsBottomSheetOpen(false);
        setHotspotForm({ text: '', description: '', target_scene_id: '' });
        loadScene(selectedScene);
        fetchSceneHotspots(selectedScene);
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal membuat hotspot' });
      }
    } catch (error) {
      console.error('Error creating hotspot:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    }
  };

  const handleDeleteHotspot = async (id) => {
    if (!window.confirm('Hapus hotspot ini?')) return;

    try {
      const response = await fetch(`/api/hotspots/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Hotspot dihapus' });
        loadScene(selectedScene);
        fetchSceneHotspots(selectedScene);
      }
    } catch (error) {
      console.error('Error deleting hotspot:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (scenes.length === 0) {
    return (
      <div className="panorama-editor">
        <h1>Panorama Editor</h1>
        <div className="card">
          <p className="empty-state">
            Belum ada scene. Silakan upload scene terlebih dahulu di halaman Kelola Scene.
          </p>
        </div>
      </div>
    );
  }

  const renderHotspotForm = () => (
    <>
      <div className="form-group">
        <label>Pitch:</label>
        <input
          type="number"
          step="0.1"
          value={clickPosition.pitch.toFixed(2)}
          readOnly
        />
      </div>
      <div className="form-group">
        <label>Yaw:</label>
        <input
          type="number"
          step="0.1"
          value={clickPosition.yaw.toFixed(2)}
          readOnly
        />
      </div>
      <div className="form-group">
        <label>Text Label:</label>
        <input
          type="text"
          value={hotspotForm.text}
          onChange={(e) => setHotspotForm({ ...hotspotForm, text: e.target.value })}
          placeholder="Nama hotspot"
        />
      </div>
      <div className="form-group">
        <label>Deskripsi (untuk tooltip):</label>
        <textarea
          value={hotspotForm.description}
          onChange={(e) => setHotspotForm({ ...hotspotForm, description: e.target.value })}
          placeholder="Deskripsi yang akan muncul saat hover hotspot"
          rows={3}
          style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
        />
      </div>
      <div className="form-group">
        <label>Target Scene:</label>
        <select
          value={hotspotForm.target_scene_id}
          onChange={(e) => setHotspotForm({ ...hotspotForm, target_scene_id: e.target.value })}
        >
          <option value="">Pilih scene tujuan</option>
          {scenes
            .filter(s => Number(s.id) !== Number(selectedScene))
            .map((scene) => (
              <option key={scene.id} value={scene.id}>{scene.name}</option>
            ))}
        </select>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleSaveHotspot}>
          Simpan Hotspot
        </button>
        <button className="btn btn-secondary" onClick={() => { setShowForm(false); setIsBottomSheetOpen(false); }}>
          Batal
        </button>
      </div>
    </>
  );

  return (
    <div className="panorama-editor">
      <h1>Panorama Editor</h1>
      <p className="subtitle">Klik pada panorama untuk membuat hotspot</p>

      {message && (
        <div className={`toast toast-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="editor-layout">
        <div className="editor-main">
          <div className="scene-selector card">
            <label>Pilih Scene:</label>
            <select
              value={selectedScene}
              onChange={(e) => setSelectedScene(e.target.value)}
            >
              {scenes.map((scene) => (
                <option key={scene.id} value={scene.id}>{scene.name}</option>
              ))}
            </select>
          </div>

          <div className="viewer-container card">
            <div ref={viewerRef} className={`panorama-viewer ${!showForm ? 'placement-mode' : ''}`}></div>
            {!isMobile && showForm && (
              <div className="coord-overlay">
                <div className="coord-pill">
                  <span className="coord-key">Pitch</span>
                  <span className="coord-val">{clickPosition.pitch.toFixed(2)}°</span>
                </div>
                <div className="coord-divider" />
                <div className="coord-pill">
                  <span className="coord-key">Yaw</span>
                  <span className="coord-val">{clickPosition.yaw.toFixed(2)}°</span>
                </div>
                <button
                  className="btn btn-secondary btn-xs"
                  onClick={() => setShowForm(false)}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {!isMobile && (
          <div className="editor-sidebar">
            <div className="card hotspot-form-card">
              <h3>Hotspot Baru</h3>
              {showForm ? (
                <div className="hotspot-form">
                  {renderHotspotForm()}
                </div>
              ) : (
                <p className="hint-text">Klik pada panorama untuk menambahkan hotspot</p>
              )}
            </div>

            <div className="card hotspot-list-card">
              <h3>Hotspot di Scene Ini ({sceneHotspots.length})</h3>
              {sceneHotspots.length === 0 ? (
                <p className="empty-text">Belum ada hotspot</p>
              ) : (
                <div className="hotspot-list">
                  {sceneHotspots.map((h) => (
                    <div key={h.id} className="hotspot-item">
                      <div className="hotspot-info">
                        <span className="hotspot-text">{h.text || 'Tanpa label'}</span>
                        <span className="hotspot-target">
                          → {h.target_scene_name || 'Tanpa target'}
                        </span>
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteHotspot(h.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isMobile && (
        <AnimatePresence>
          {isBottomSheetOpen && showForm && (
            <>
              <motion.div
                className="editor-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setShowForm(false); setIsBottomSheetOpen(false); }}
              />
              <motion.div
                className="editor-bottom-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="bottom-sheet-header">
                  <div className="bottom-sheet-indicator" />
                  <h3>
                    <MapPin size={18} />
                    Hotspot Baru
                  </h3>
                  <button
                    className="bottom-sheet-close"
                    onClick={() => { setShowForm(false); setIsBottomSheetOpen(false); }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="bottom-sheet-coords">
                  <span className="coord-pill-mobile">
                    Pitch: <strong>{clickPosition.pitch.toFixed(2)}°</strong>
                  </span>
                  <span className="coord-pill-mobile">
                    Yaw: <strong>{clickPosition.yaw.toFixed(2)}°</strong>
                  </span>
                </div>

                <div className="bottom-sheet-form">
                  {renderHotspotForm()}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default PanoramaEditor;
