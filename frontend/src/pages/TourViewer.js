import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import './TourViewer.css';

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

const QuickTravelSidebar = ({ isOpen, onToggle, scenes, currentScene, loadScene }) => {
  const isMobile = useMobileDetect();

  const sceneListContent = (
    <>
      <div className="sidebar-header">
        <h3>{isMobile ? 'Navigasi Scene' : 'Navigasi Cepat'}</h3>
        <button className="sidebar-close-btn" onClick={onToggle}>
          {isMobile ? <Menu size={20} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <div className="sidebar-list">
        {scenes.map((name, index) => {
          const isActive = name === currentScene;
          return (
            <motion.div
              key={name}
              className={`scene-nav-item ${isActive ? 'active' : ''}`}
              layout
              whileHover={{ scale: isActive ? 1 : 1.02, x: isActive ? 0 : 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                loadScene(name);
                onToggle();
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div className={`scene-thumb-wrapper ${isActive ? 'active-glow' : ''}`}>
                <span className="scene-number">{index + 1}</span>
              </div>
              <span className="scene-nav-name">{name}</span>
              {isActive && <div className="active-border" />}
            </motion.div>
          );
        })}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              className="mobile-sidebar-trigger"
              onClick={onToggle}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="mobile-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.aside
              className="mobile-sidebar-drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {sceneListContent}
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="sidebar-backdrop" onClick={onToggle} />
        )}
      </AnimatePresence>

      <motion.div
        className="sidebar-assembly"
        layout
        initial={false}
        animate={{ x: isOpen ? 0 : 'calc(100% - 48px)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <aside className="quick-travel-sidebar">
          {sceneListContent}
        </aside>

        <div className="sidebar-hitbox" onClick={onToggle}>
          <motion.div
            className="sidebar-toggle-inner"
            whileHover={{ scale: 1.08, backgroundColor: 'rgba(40, 40, 40, 0.9)' }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

const TourViewer = () => {
  const viewerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentScene, setCurrentScene] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [allScenes, setAllScenes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized) return;

    const init = async () => {
      setInitialized(true);

      const container = viewerRef.current;
      if (!container) {
        console.log('Container not ready, retrying...');
        setInitialized(false);
        setTimeout(init, 50);
        return;
      }

      if (!window.pannellum) {
        console.log('Pannellum not ready, retrying...');
        setInitialized(false);
        setTimeout(init, 50);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/scenes');
        const data = await response.json();

        if (!data.scenes || Object.keys(data.scenes).length === 0) {
          setError('Belum ada scene. Silakan buat scene di admin panel.');
          setLoading(false);
          return;
        }

        const sceneNames = Object.keys(data.scenes);
        setAllScenes(sceneNames);

        const hotSpotsConfig = {};
        Object.keys(data.scenes).forEach(sceneName => {
          const scene = data.scenes[sceneName];
          const fullPanoramaUrl = `http://localhost:5000${scene.panorama}`;
          if (scene.hotSpots && scene.hotSpots.length > 0) {
            scene.hotSpots = scene.hotSpots.map(hotspot => {
              const labelText = hotspot.text || hotspot.sceneName || 'Lokasi';
              const descText = hotspot.description || '';
              const fullText = descText ? labelText + ': ' + descText : labelText;
              return {
                pitch: hotspot.pitch,
                yaw: hotspot.yaw,
                type: 'info',
                text: fullText,
                sceneId: hotspot.sceneName,
                clickHandlerFunc: () => {
                  if (hotspot.sceneName) {
                    navigate(`/tour?scene=${encodeURIComponent(hotspot.sceneName)}`);
                  }
                }
              };
            });
          }
          hotSpotsConfig[sceneName] = {
            ...scene,
            panorama: fullPanoramaUrl
          };
        });

        if (viewer) {
          viewer.destroy();
          setViewer(null);
        }

        const v = window.pannellum.viewer(container, {
          default: {
            ...data.default,
            autoLoad: true
          },
          scenes: hotSpotsConfig
        });

        v.on('scenechange', (sceneName) => {
          setCurrentScene(sceneName);
          setShowDescription(false);
          if (hotSpotsConfig[sceneName]?.description) {
            setCurrentDescription(hotSpotsConfig[sceneName].description);
          } else {
            setCurrentDescription('');
          }
          const idx = sceneNames.indexOf(sceneName);
          if (idx >= 0) setCurrentIndex(idx);
        });

        setViewer(v);
        setCurrentScene(data.default.firstScene);
        if (hotSpotsConfig[data.default.firstScene]?.description) {
          setCurrentDescription(hotSpotsConfig[data.default.firstScene].description);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const sceneParam = urlParams.get('scene');
        if (sceneParam && hotSpotsConfig[sceneParam]) {
          v.loadScene(sceneParam);
          const idx = sceneNames.indexOf(sceneParam);
          if (idx >= 0) setCurrentIndex(idx);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading tour:', err);
        setError('Gagal memuat: ' + err.message);
        setLoading(false);
      }
    };

    init();
  }, [navigate, viewer, initialized]);

  const handleToggleSidebar = (e) => {
    if (e) {
      const path = e.composedPath ? e.composedPath() : [];
      const isDescriptionUI = path.some(el => {
        if (el.classList) {
          return el.classList.contains('scene-desc-btn') || 
                 el.classList.contains('scene-title-card') || 
                 el.classList.contains('description-panel');
        }
        return false;
      });
      
      if (isDescriptionUI) {
        e.stopPropagation();
        return;
      }
    }
    setIsSidebarOpen(prev => !prev);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="tour-viewer">
      <div ref={viewerRef} className="panorama-viewer"></div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Memuat panorama...</p>
        </div>
      )}

      {error && (
        <div className="error-overlay">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/admin" className="btn btn-primary">
            Ke Admin Panel
          </Link>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="viewer-header">
            <button className="back-btn" onClick={handleBack}>
              ← Kembali
            </button>
          </div>

          <div className="controls-hint">
            Klik &amp; drag untuk melihat • Klik hotspot untuk berpindah
          </div>

          <div
            className="scene-title-card"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <h3>{currentScene}</h3>
            <p>Scene {currentIndex + 1} dari {allScenes.length}</p>
            {currentDescription && (
              <button
                type="button"
                className="scene-desc-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowDescription((prev) => !prev);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowDescription((prev) => !prev);
                }}
              >
                {showDescription ? '▼ Sembunyikan' : '▶ Lihat Deskripsi'}
              </button>
            )}
          </div>

          {showDescription && currentDescription && (
            <div className="description-panel" onClick={(e) => e.stopPropagation()}>
              <h4>Tentang {currentScene}</h4>
              <p>{currentDescription}</p>
            </div>
          )}

          <div className="viewer-footer">
            <span className="scene-indicator">
              {allScenes.map((name, i) => (
                <span
                  key={name}
                  className={`dot ${i === currentIndex ? 'active' : ''}`}
                  onClick={() => viewer && viewer.loadScene(name)}
                />
              ))}
            </span>
          </div>

          <QuickTravelSidebar
            isOpen={isSidebarOpen}
            onToggle={handleToggleSidebar}
            scenes={allScenes}
            currentScene={currentScene}
            loadScene={(name) => viewer && viewer.loadScene(name)}
          />
        </>
      )}
    </div>
  );
};

export default TourViewer;
