import React, { useEffect, useState, useRef } from 'react';
import { Heart, Image, Mail, Calendar, Disc, Globe, Music, Sparkles } from 'lucide-react';

const MenuView = ({ onNavigate, onMusicToggle, isMusicPlaying, active }) => {
  const [daysTogether, setDaysTogether] = useState(0);
  const [animatedDays, setAnimatedDays] = useState(0);
  const counterRef = useRef(null);

  useEffect(() => {
    const anniversaryDate = new Date('2024-05-13T00:00:00');
    const today = new Date();
    const diffTime = today.getTime() - anniversaryDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 0) {
      setDaysTogether(diffDays);
    }
  }, []);

  // Animated number counter
  useEffect(() => {
    if (!active || daysTogether === 0) return;
    
    let start = 0;
    const end = daysTogether;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * end);
      setAnimatedDays(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [active, daysTogether]);

  const menuItems = [
    { id: 'memories-screen', title: 'Memories', desc: 'A gallery of our best moments together.', icon: Image, index: 1, emoji: '📸' },
    { id: 'letter-screen', title: 'Love Letters', desc: 'Handwritten letters straight from the heart.', icon: Mail, index: 2, emoji: '💌' },
    { id: 'reasons-screen', title: 'Why I Love You', desc: 'A list of all the things that make you special.', icon: Heart, index: 3, emoji: '💝' },
    { id: 'date-screen', title: 'Date Planner', desc: 'Choose the time, place, and activity for our next date.', icon: Calendar, index: 4, emoji: '📅' },
    { id: 'lyrics-screen', title: 'Our Song', desc: 'Sit back and listen to the song I chose for you.', icon: Disc, index: 5, emoji: '🎵' },
    { id: 'secret-screen', title: 'Our World', desc: 'Float in our private universe together.', icon: Globe, index: 6, emoji: '🌌' },
  ];

  return (
    <div id="menu-screen" className={`screen ${active ? 'active' : ''}`}>
      <header className="main-header">
        <div className="days-counter-badge glass-card" id="days-counter-container" ref={counterRef}>
          <Heart className="heart-pulse-slow active-heart text-[#c0392b]" />
          <span id="days-counter">{animatedDays} Days Together</span>
          <Sparkles className="w-3.5 h-3.5 text-[#dfb76c] opacity-60" />
        </div>
        <h1 className="app-title text-white">Choose an envelope</h1>
        <p className="app-subtitle">Explore the little things I love about us.</p>
      </header>

      <main className="envelope-grid">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="menu-card glass-card text-left"
              style={{ '--item-index': item.index }}
              onClick={() => onNavigate(item.id)}
            >
              <div className="card-icon-wrapper">
                <Icon className="card-icon text-[#c0392b]" />
              </div>
              <h2 className="card-title">{item.title}</h2>
              <p className="card-desc">{item.desc}</p>
            </button>
          );
        })}
      </main>

      <footer className="menu-footer">
        <button
          onClick={onMusicToggle}
          className={`music-btn ${isMusicPlaying ? 'music-playing' : ''}`}
          aria-label="Toggle music"
        >
          <div className="sound-wave">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
          <Music className="music-icon text-white" />
        </button>
      </footer>
    </div>
  );
};

export default MenuView;
