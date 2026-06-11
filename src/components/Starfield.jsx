import React, { useEffect, useRef } from 'react';

const Starfield = ({ warpActive, active }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let stars = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const numStars = 180;
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * canvas.width * 2,
        y: (Math.random() - 0.5) * canvas.height * 2,
        z: Math.random() * canvas.width,
        color: Math.random() > 0.82 ? '#c0392b' : '#ffffff',
      });
    }

    const animate = () => {
      if (!active) return;
      animationId = requestAnimationFrame(animate);

      if (warpActive) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const speed = warpActive ? 32 : 0.45;
        star.z -= speed;

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * canvas.width * 2;
          star.y = (Math.random() - 0.5) * canvas.height * 2;
          star.z = canvas.width;
        }

        const px = (star.x / star.z) * centerX + centerX;
        const py = (star.y / star.z) * centerY + centerY;

        if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
          const size = (1 - star.z / canvas.width) * 3 + 0.5;
          const alpha = (1 - star.z / canvas.width) * 0.8 + 0.2;

          ctx.fillStyle =
            star.color === '#ffffff'
              ? `rgba(255, 255, 255, ${alpha})`
              : `rgba(192, 57, 43, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [active, warpActive]);

  return <canvas ref={canvasRef} id="welcome-stars-canvas" />;
};

export default Starfield;
