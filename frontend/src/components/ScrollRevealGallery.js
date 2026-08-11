import React, { useState, useEffect } from 'react';
import nana from '../assets/alfa.png';
import dana from '../assets/tanaman.png';
import ayamChilling from '../assets/ramadhan.png';

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

const photos = [
  { id: 1, src: nana, label: 'Kelas alfa', desc: 'Fasilitas gedung sekolah yang memadai' },
  { id: 2, src: dana, label: 'Pesantren ekologi', desc: 'Ruang belajar yang nyaman' },
  { id: 3, src: ayamChilling, label: 'Tadarus Bumi', desc: 'Koleksi buku lengkap' },
  { id: 4, src: nana, label: 'Kelas alfa', desc: 'Area olahraga siswa' },
];

const ScrollRevealGallery = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const isMobile = useMobileDetect();

  const handlePhotoClick = (index) => {
    setSelectedIndex(index === selectedIndex ? null : index);
  };

  const getPhotoStyle = (index) => {
    if (!isExpanded) {
      const stackOffset = (index - 1) * (isMobile ? 6 : 8);
      return {
        x: stackOffset,
        y: stackOffset,
        rotate: (index - 1) * (isMobile ? 3 : 4),
        scale: isMobile ? (index === 3 ? 1.1 : 1.12) : (index === 3 ? 1.25 : 1.27),
        zIndex: index,
      };
    }

    if (isMobile) {
      const yPositions = [-80, 0, 80, 160];
      const xPositions = [0, 0, 0, 0];
      return {
        x: xPositions[index],
        y: yPositions[index],
        rotate: 0,
        scale: 1.05,
        zIndex: index === selectedIndex ? 10 : 4 - index,
      };
    }

    const positions = [
      { x: -200, y: -140 },
      { x: 200, y: -140 },
      { x: -200, y: 140 },
      { x: 200, y: 140 },
    ];
    const pos = positions[index];
    return {
      x: pos.x,
      y: pos.y,
      rotate: (index % 2 === 0 ? -1 : 1) * 6,
      scale: 1.30,
      zIndex: index === selectedIndex ? 10 : 4 - index,
    };
  };

  return (
    <div style={{
      padding: isMobile ? '24px 0' : '40px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: isMobile ? '20px' : '30px',
    }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: isMobile ? '12px 24px' : '14px 32px',
          background: isExpanded ? '#6c757d' : 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        }}
      >
        {isExpanded ? 'Tutup Galeri' : 'Buka Galeri'}
      </button>

      <div style={{
        position: 'relative',
        width: isMobile ? (isExpanded ? '280px' : '220px') : (isExpanded ? '600px' : '280px'),
        height: isMobile ? (isExpanded ? '320px' : '160px') : (isExpanded ? '420px' : '200px'),
        transition: 'all 0.5s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {photos.map((photo, index) => {
          const style = getPhotoStyle(index);
          return (
            <div
              key={photo.id}
              onClick={() => isExpanded && handlePhotoClick(index)}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${style.x}px), calc(-50% + ${style.y}px)) rotate(${style.rotate}deg) scale(${style.scale})`,
                zIndex: style.zIndex,
                cursor: isExpanded ? 'pointer' : 'default',
                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
              }}
            >
              <div className="scroll-photo-content" style={{
                boxShadow: selectedIndex === index && isExpanded
                  ? '0 12px 40px rgba(0,0,0,0.3)'
                  : '0 4px 12px rgba(0,0,0,0.15)',
              }}>
                <img src={photo.src} alt={photo.label} />
                <div className="scroll-photo-label">
                  <span>{photo.label}</span>
                  <p>{photo.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScrollRevealGallery;
