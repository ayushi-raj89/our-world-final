import React, { useEffect } from 'react';

const ParticleBackground = ({ active }) => {
  useEffect(() => {
    if (!active) return;

    const container = document.getElementById('particles-container');
    if (!container) return;

    const createStarlight = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 4 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.opacity = Math.random() * 0.5 + 0.2;
      particle.style.animationDuration = `${Math.random() * 6 + 6}s`;
      container.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 12000);
    };

    const createHeart = () => {
      const heart = document.createElement('div');
      heart.className = 'heart-particle';
      heart.innerHTML = '❤️';
      heart.style.left = `${Math.random() * 100}vw`;
      heart.style.fontSize = `${Math.random() * 12 + 10}px`;
      heart.style.animationDuration = `${Math.random() * 8 + 8}s`;
      container.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 16000);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.45) {
        createStarlight();
      } else {
        createHeart();
      }
    }, 700);

    return () => {
      clearInterval(interval);
      container.innerHTML = '';
    };
  }, [active]);

  return <div id="particles-container" />;
};

export default ParticleBackground;
