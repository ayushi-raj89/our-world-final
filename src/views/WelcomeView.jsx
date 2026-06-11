import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';
import Starfield from '../components/Starfield';

const WelcomeView = ({ onEnterWorld, active }) => {
  const [typedText, setTypedText] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [warpActive, setWarpActive] = useState(false);
  const [fadeActive, setFadeActive] = useState(false);

  useEffect(() => {
    if (!active) return;

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.getDate();

    let message = "somewhere in this universe... there is a place just for us";
    if (currentMonth === 5 && currentDate === 13) {
      message = "happy anniversary, my love! ❤️ somewhere in this universe... there is a place just for us";
    } else if (currentMonth === 10 && currentDate === 15) {
      message = "happy birthday, beautiful! 🎂 somewhere in this universe... there is a place just for us";
    }

    let index = 0;
    setTypedText('');
    setShowButton(false);

    const type = () => {
      if (index < message.length) {
        const char = message.charAt(index);
        setTypedText((prev) => prev + char);
        index++;

        let speed = 40;
        if (char === '.' || char === '!' || char === '❤️' || char === '🎂') {
          speed = 350;
        } else if (char === ',') {
          speed = 200;
        } else {
          speed = 35 + Math.random() * 30;
        }
        setTimeout(type, speed);
      } else {
        setShowButton(true);
      }
    };

    const startTimeout = setTimeout(type, 1500);
    return () => clearTimeout(startTimeout);
  }, [active]);

  const handleEnterClick = () => {
    setWarpActive(true);
    setTimeout(() => {
      setFadeActive(true);
    }, 300);

    setTimeout(() => {
      onEnterWorld();
    }, 2000);
  };

  if (!active) return null;

  return (
    <div
      id="welcome-screen"
      className={`screen active welcome-theme ${fadeActive ? 'warp-fade' : ''}`}
    >
      <Starfield warpActive={warpActive} active={active} />
      <div id="galaxy-orb"></div>
      <div className="welcome-content">
        <div id="welcome-text-container">
          <h1 id="welcome-text">{typedText}</h1>
        </div>
        <button
          onClick={handleEnterClick}
          id="enter-btn"
          className={`btn btn-primary welcome-enter-btn ${
            showButton ? 'show' : ''
          }`}
          style={{ pointerEvents: showButton ? 'auto' : 'none' }}
        >
          <span>Enter Our World</span>
          <Compass className="btn-icon" />
        </button>
      </div>
    </div>
  );
};

export default WelcomeView;
// 
