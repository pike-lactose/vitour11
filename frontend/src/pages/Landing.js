import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import InteractivePhotoStack from '../components/InteractivePhotoStack';
import ScrollRevealGallery from '../components/ScrollRevealGallery';
import './Landing.css';
import sekolah from '../assets/sekolah.jpeg';
import kepalaSekolah from '../assets/kepala_sekolah.jpg';

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

const HeroCard = ({ isMobile }) => {
  const ref = useRef(null);
  const navigate = useNavigate();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  const handleMouseMove = (e) => {
    if (!ref.current || isMobile) return;
    const rect = ref.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={isMobile ? { transformStyle: 'flat' } : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="glass-card"
    >
      <motion.div style={isMobile ? { transform: 'none' } : { transform: 'translateZ(75px)' }}>
        <h1 className="glass-card-title">Selamat Datang di Virtual Tour</h1>
        <p className="glass-card-subtitle">Jelajahi sekolah kami secara virtual dari mana saja</p>
      </motion.div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <motion.button
          className="glass-card-btn"
          whileHover={{ scale: isMobile ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/tour')}
          style={isMobile ? { transform: 'none' } : { transform: 'translateZ(50px)' }}
        >
          Mulai Virtual Tour
        </motion.button>
        <motion.button
          className="glass-card-btn glass-card-btn-secondary"
          whileHover={{ scale: isMobile ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/denah')}
          style={isMobile ? { transform: 'none' } : { transform: 'translateZ(50px)' }}
        >
          Lihat Denah Sekolah
        </motion.button>
      </div>
    </motion.div>
  );
};

const ParallaxHero = ({ children }) => {
  const isMobile = useMobileDetect();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 100, damping: 30 };
  const xSpring = useSpring(mouseX, springConfig);
  const ySpring = useSpring(mouseY, springConfig);

  const translateX = useTransform(xSpring, [0, 1], ['0px', '-20px']);
  const translateY = useTransform(ySpring, [0, 1], ['0px', '-20px']);

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const normalizedX = e.clientX / window.innerWidth;
    const normalizedY = e.clientY / window.innerHeight;
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };

  return (
    <header
      className="hero parallax-hero"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="hero-bg-image"
        style={isMobile ? { x: 0, y: 0 } : { x: translateX, y: translateY }}
      />
      <div className="hero-particles">
        <Particles
          id="hero-particles"
          init={async (engine) => {
            await loadSlim(engine);
          }}
          options={{
            fullScreen: { enable: false },
            background: { opacity: 0 },
            particles: {
              number: { value: isMobile ? 20 : 40, density: { enable: true, value_area: 800 } },
              color: { value: '#ffffff' },
              shape: { type: 'circle' },
              opacity: {
                value: 0.2,
                random: true,
                anim: { enable: true, speed: 0.5, opacity_min: 0.1, sync: false },
              },
              size: {
                value: { min: 1, max: 4 },
                random: true,
              },
              move: {
                enable: true,
                speed: 0.6,
                direction: 'none',
                random: true,
                straight: false,
                outModes: { default: 'out' },
              },
            },
            interactivity: {
              detect_on: 'window',
              events: {
                onhover: { enable: false },
                onclick: { enable: false },
              },
            },
            detectRetina: true,
          }}
        />
      </div>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        {children}
      </div>
    </header>
  );
};

const Landing = () => {
  const isMobile = useMobileDetect();

  return (
    <div className="landing">
      <ParallaxHero>
        <HeroCard isMobile={isMobile} />
      </ParallaxHero>

      <section className="section school-history">
        <div className="container">
          <h2>Sejarah Sekolah</h2>
          <div className="history-content">
            <div className="history-text">
              <p>
                Didirikan pada tahun 1985, sekolah kami telah menjadi lembaga pendidikan
                terkemuka di wilayah ini selama lebih dari tiga dekade. Kami berkomitmen
                untuk memberikan pendidikan berkualitas tinggi yang membentuk karakter
                dan masa depan siswa-siswi kami.
              </p>
              <p>
                Dengan filosofi pendidikan yang berpusat pada siswa, kami terus innovate
                dan mengembangkan program pembelajaran yang relevan dengan kebutuhan
                zaman modern sambil tetap mempertahankan nilai-nilai tradisional yang
                menjadi fondasi kuat kami.
              </p>
              <p>
                Saat ini, sekolah kami telah meluluskan ribuan alumni yang tersebar
                di berbagai bidang profesi dan terus memberikan kontribusi positif
                bagi masyarakat.
              </p>
            </div>
            <div className="history-image">
              <InteractivePhotoStack />
            </div>
          </div>
        </div>
      </section>

      <section className="section school-gallery">
        <div className="container">
          <h2>Galeri Sekolah</h2>
          <ScrollRevealGallery />
        </div>
      </section>

      <section className="section principal-section">
        <div className="container">
          <h2>Kepala Sekolah</h2>
          <div className="principal-content">
            <div className="principal-image">
              <img src={kepalaSekolah} alt="Kepala Sekolah" className="principal-img" />
            </div>
            <div className="principal-info">
              <h3>Eka Rachman, S.Kom., M.M.Pd</h3>
              <p className='principal-id'>NIP: 197704102011011001</p>
              <p className="principal-title">Kepala Sekolah periode 2020 - 2024</p>
              <p className="principal-bio">
                Dengan pengalaman lebih dari 20 tahun di bidang pendidikan,
                Dr. Ahmad Wijaya telah memimpin sekolah kami dengan visi
                untuk menciptakan lingkungan belajar yang inovatif dan
                inklusif. Menyelesaikan pendidikan S3 di Universitas
                Negeri Jakarta,Beliau fokus pada pengembangan teknologi
                pendidikan dan penguatan karakter siswa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer id="tour-section" className="footer-section">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-info">
              <h3>Ikuti Kami</h3>
              <p>Tetap terhubung melalui media sosial kami</p>
            </div>
            <div className="social-links">
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="social-link">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://tiktok.com/" target="_blank" rel="noopener noreferrer" className="social-link">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.49-3.35-3.98-5.6-.49-2.25-.05-4.63 1.2-6.58 1.36-2.17 3.65-3.63 6.18-3.79.18-.01.37-.01.55-.02v4.09c-.83.03-1.66.28-2.35.73-.7.45-1.23 1.1-1.52 1.87-.29.77-.33 1.62-.12 2.41.21.79.68 1.49 1.34 2.01.66.52 1.47.8 2.29.79 1.64-.01 3.1-.97 3.77-2.47.67-1.5.46-3.27-.52-4.57-.98-1.3-2.63-2.01-4.28-1.83-.84.09-1.63.36-2.33.79V.02h3.31z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-right">
            <div className="footer-info">
              <h3>Kontak Kami</h3>
              <div className="contact-details">
                <p>Jl. Budhi Cilember, Sukaraja, Cicendo, Bandung</p>
                <p><a href="tel:(022)6652442" className="contact-link">(022) 6652442</a></p>
                <p><a href="mailto:smkn11bdg@gmail.com" className="contact-link">smkn11bdg@gmail.com</a></p>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Virtual Tour Sekolah. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <a href="#tour-section" className="floating-tour-btn" onClick={(e) => {
        e.preventDefault();
        const footerSection = document.getElementById('tour-section');
        if (footerSection) footerSection.scrollIntoView({ behavior: 'smooth' });
      }}>
        Ayo Tour Virtual
      </a>
    </div>
  );
};

export default Landing;
