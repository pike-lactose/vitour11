import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import nana from '../assets/kumpul.jpeg';
import ayamChilling from '../assets/upacara.jpeg';
import dana from '../assets/hujan.jpeg';

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

const historyPhotos = [
  { id: 1, src: nana, label: '1985', caption: 'Pendirian sekolah pada tahun 1985' },
  { id: 2, src: dana, label: '1995', caption: 'Perkembangan fasilitas tahun 1995' },
  { id: 3, src: ayamChilling, label: '2005', caption: 'Prestasi gemilang tahun 2005' },
  { id: 4, src: nana, label: '2024', caption: 'Teknologi modern saat ini' },
];

const InteractivePhotoStack = () => {
  const [orderedPhotos, setOrderedPhotos] = useState([...historyPhotos]);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedId, setSelectedId] = useState(1);
  const isMobile = useMobileDetect();

  const handleClick = (clickedId) => {
    if (isMobile) {
      setSelectedId(clickedId);
      return;
    }
    const clickedIndex = orderedPhotos.findIndex(p => p.id === clickedId);
    if (clickedIndex === 0) return;

    const newOrder = [...orderedPhotos];
    const [removed] = newOrder.splice(clickedIndex, 1);
    newOrder.unshift(removed);
    setOrderedPhotos(newOrder);
  };

  if (isMobile) {
    return (
      <div className="photo-stack-mobile">
        {historyPhotos.map((photo) => {
          const isSelected = photo.id === selectedId;
          return (
            <motion.div
              key={photo.id}
              className={`mobile-photo-card ${isSelected ? 'selected' : ''}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(photo.id)}
              layout
            >
              <div className="mobile-photo-content">
                <img src={photo.src} alt={photo.label} />
                <div className="mobile-photo-label">
                  <span>{photo.label}</span>
                  {isSelected && <p>{photo.caption}</p>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="photo-stack-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {orderedPhotos.map((photo, index) => {
        const isFront = index === 0;
        const baseX = index * 15;
        const hoverX = index * 55;

        return (
          <motion.div
            key={photo.id}
            className="photo-card"
            layout
            initial={{ x: baseX, y: 0, rotate: 0 }}
            animate={{
              x: isHovered ? hoverX : baseX,
              y: isHovered ? index * -8 : 0,
              rotate: isHovered ? index * 4 : 0,
              scale: isFront ? 2 : 2,
              zIndex: isFront ? 100 : 50 - index,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            onClick={() => handleClick(photo.id)}
            whileHover={{ scale: 2.20 }}
            whileTap={{ scale: 2.20 }}
          >
            <div className="photo-content">
              <img src={photo.src} alt={photo.label} />
              <div className="photo-label">
                <span>{photo.label}</span>
                {isFront && <p>{photo.caption}</p>}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default InteractivePhotoStack;
