import React, { useEffect, useRef } from 'react';

const CanvasNebula = ({ active }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let secretStars = [];
    let secretNebulaTime = 0;
    let secretZoomSpeed = 30;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create secret stars
    const numStars = 120;
    for (let i = 0; i < numStars; i++) {
      secretStars.push({
        x: (Math.random() - 0.5) * canvas.width * 2,
        y: (Math.random() - 0.5) * canvas.height * 2,
        z: Math.random() * canvas.width,
        twinkle: Math.random() * 0.04 + 0.01,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    const animate = () => {
      if (!active) return;
      animationId = requestAnimationFrame(animate);

      // Decelerate entry zoom
      if (secretZoomSpeed > 0.45) {
        secretZoomSpeed -= 0.65;
      } else {
        secretZoomSpeed = 0.45;
      }

      // Draw Nebula background
      secretNebulaTime += 0.002;
      const h1 = 260 + Math.sin(secretNebulaTime) * 35; // purples
      const h2 = 200 + Math.cos(secretNebulaTime * 0.8) * 30; // dark blues
      const h3 = 345 + Math.sin(secretNebulaTime * 0.5) * 15; // soft reds

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      const gradient = ctx.createRadialGradient(
        centerX + Math.sin(secretNebulaTime * 1.5) * (width * 0.25),
        centerY + Math.cos(secretNebulaTime) * (height * 0.25),
        10,
        centerX,
        centerY,
        Math.max(width, height) * 0.8
      );

      gradient.addColorStop(0, `hsla(${h1}, 70%, 10%, 1)`);
      gradient.addColorStop(0.4, `hsla(${h2}, 60%, 7%, 1)`);
      gradient.addColorStop(0.7, `hsla(${h3}, 55%, 8%, 0.8)`);
      gradient.addColorStop(1, '#050505');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      for (let i = 0; i < secretStars.length; i++) {
        const star = secretStars[i];
        star.z -= secretZoomSpeed;

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * canvas.width * 2;
          star.y = (Math.random() - 0.5) * canvas.height * 2;
          star.z = canvas.width;
        }

        const px = (star.x / star.z) * centerX + centerX;
        const py = (star.y / star.z) * centerY + centerY;

        if (px >= 0 && px < width && py >= 0 && py < height) {
          if (secretZoomSpeed <= 0.5) {
            star.opacity += star.twinkle * star.twinkleDir;
            if (star.opacity >= 1) {
              star.opacity = 1;
              star.twinkleDir = -1;
            } else if (star.opacity <= 0.15) {
              star.opacity = 0.15;
              star.twinkleDir = 1;
            }
          }

          const size = (1 - star.z / canvas.width) * 3 + 0.3;

          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
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
  }, [active]);

  return <canvas ref={canvasRef} id="secret-canvas" />;
};

export default CanvasNebula;
// 
