import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Denah.css';

const Denah = () => {
  const [floorPlan, setFloorPlan] = useState(null);
  const [spheres, setSpheres] = useState([]);
  const [denahList, setDenahList] = useState([]);
  const [selectedDenah, setSelectedDenah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredSphere, setHoveredSphere] = useState(null);
  const [denahPhotos, setDenahPhotos] = useState({});
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fpRes, spheresRes, denahRes] = await Promise.all([
        fetch('/api/floorplan'),
        fetch('/api/denah-spheres'),
        fetch('/api/denah')
      ]);
      const fpData = await fpRes.json();
      const spheresData = await spheresRes.json();
      const denahData = await denahRes.json();
      setFloorPlan(fpData.image_path ? fpData : null);
      setSpheres(spheresData);
      setDenahList(denahData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching denah data:', error);
      setLoading(false);
    }
  };

  const handleSphereClick = (sphere) => {
    if (sphere.target_denah_id) {
      const target = denahList.find(d => d.id === sphere.target_denah_id);
      if (target) openDenah(target);
    }
  };

  const handleDenahCardClick = (denah) => {
    openDenah(denah);
  };

  const openDenah = async (denah) => {
    setSelectedDenah(denah);
    setActivePhotoIndex(0);
    setSlideDirection(1);
    if (!denahPhotos[denah.id]) {
      try {
        const res = await fetch(`/api/denah/${denah.id}/photos`);
        if (res.ok) {
          const data = await res.json();
          setDenahPhotos(prev => ({ ...prev, [denah.id]: data }));
        }
      } catch (error) {
        console.error('Error fetching denah photos:', error);
      }
    }
  };

  const photosFor = (denah) => {
    const cached = denahPhotos[denah.id];
    if (cached && cached.length > 0) return cached;
    return [{ id: 0, image_path: denah.image_path, is_cover: true }];
  };

  const handleNextPhoto = () => {
    setSlideDirection(1);
    setActivePhotoIndex(prev => (prev + 1) % photosFor(selectedDenah).length);
  };

  const handlePrevPhoto = () => {
    setSlideDirection(-1);
    setActivePhotoIndex(prev => (prev - 1 + photosFor(selectedDenah).length) % photosFor(selectedDenah).length);
  };

  if (loading) {
    return (
      <div className="denah-loading">
        <div className="denah-spinner"></div>
      </div>
    );
  }

  const selectedPhotos = selectedDenah ? photosFor(selectedDenah) : [];
  const hasMultiple = selectedPhotos.length > 1;

  return (
    <div className="denah-page">
      <div className="denah-header">
        <motion.button
          className="denah-back-btn"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </motion.button>
        <h1 className="denah-title">Denah Sekolah</h1>
      </div>

      <div className="denah-content">
        {floorPlan ? (
          <div className="denah-floorplan-container">
            <div className="denah-floorplan-wrapper">
              <img
                src={`/uploads/${floorPlan.image_path}`}
                alt="Denah Sekolah"
                className="denah-floorplan-img"
              />
              {spheres.map((sphere) => (
                <motion.div
                  key={sphere.id}
                  className="denah-sphere"
                  style={{ left: `${sphere.x}%`, top: `${sphere.y}%` }}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoveredSphere(sphere)}
                  onMouseLeave={() => setHoveredSphere(null)}
                  onClick={() => handleSphereClick(sphere)}
                >
                  <div className="denah-sphere-pulse"></div>
                  <div className="denah-sphere-dot"></div>
                  {hoveredSphere?.id === sphere.id && (
                    <motion.div
                      className="denah-sphere-tooltip"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {sphere.text || sphere.target_denah_name || 'Lihat'}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="denah-no-floorplan">
            <MapPin size={48} />
            <p>Denah sekolah belum tersedia</p>
          </div>
        )}

        {denahList.length > 0 && (
          <div className="denah-grid-section">
            <h2 className="denah-grid-title">Lokasi Sekolah</h2>
            <div className="denah-grid">
              {denahList.map((d) => (
                <motion.div
                  key={d.id}
                  className="denah-card"
                  whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDenahCardClick(d)}
                >
                  <div className="denah-card-img-wrap">
                    <img
                      src={`/uploads/${d.image_path}`}
                      alt={d.name}
                      className="denah-card-img"
                    />
                  </div>
                  <div className="denah-card-info">
                    <h3 className="denah-card-name">{d.name}</h3>
                    {d.description && (
                      <p className="denah-card-desc">{d.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!floorPlan && denahList.length === 0 && (
          <div className="denah-empty-state">
            <p>Belum ada data denah yang tersedia.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedDenah && (
          <motion.div
            className="denah-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDenah(null)}
          >
            <motion.div
              className="denah-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="denah-modal-close"
                onClick={() => setSelectedDenah(null)}
              >
                <X size={20} />
              </button>
              <div className="denah-modal-img-wrap">
                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.img
                    key={selectedPhotos[activePhotoIndex]?.image_path || selectedDenah.image_path}
                    src={`/uploads/${(selectedPhotos[activePhotoIndex] || selectedDenah).image_path}`}
                    alt={selectedDenah.name}
                    className="denah-modal-img"
                    custom={slideDirection}
                    initial={{ opacity: 0, rotateY: slideDirection > 0 ? -90 : 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: slideDirection > 0 ? 90 : -90 }}
                    transition={{ duration: 0.5 }}
                    style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                  />
                </AnimatePresence>
                {hasMultiple && (
                  <>
                    <button
                      className="denah-modal-arrow denah-modal-arrow-left"
                      onClick={handlePrevPhoto}
                      aria-label="Foto sebelumnya"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      className="denah-modal-arrow denah-modal-arrow-right"
                      onClick={handleNextPhoto}
                      aria-label="Foto berikutnya"
                    >
                      <ChevronRight size={24} />
                    </button>
                    <div className="denah-modal-counter">
                      {activePhotoIndex + 1} / {selectedPhotos.length}
                    </div>
                  </>
                )}
              </div>
              <div className="denah-modal-info">
                <h2 className="denah-modal-name">{selectedDenah.name}</h2>
                {selectedDenah.description && (
                  <p className="denah-modal-desc">{selectedDenah.description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Denah;
