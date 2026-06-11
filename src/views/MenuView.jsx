import React, { useEffect, useState } from 'react';
import { Heart, Image, Mail, Calendar, Disc, Globe, Download, Music } from 'lucide-react';

const MenuView = ({ onNavigate, onMusicToggle, isMusicPlaying, active }) => {
  const [daysTogether, setDaysTogether] = useState(0);

  useEffect(() => {
    const anniversaryDate = new Date('2024-05-13T00:00:00');
    const today = new Date();
    const diffTime = today.getTime() - anniversaryDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 0) {
      setDaysTogether(diffDays);
    }
  }, []);

  const menuItems = [
    { id: 'memories-screen', title: 'Memories', desc: 'A gallery of our best moments together.', icon: Image, index: 1 },
    { id: 'letter-screen', title: 'Love Letters', desc: 'Handwritten letters straight from the heart.', icon: Mail, index: 2 },
    { id: 'reasons-screen', title: 'Why I Love You', desc: 'A list of all the things that make you special.', icon: Heart, index: 3 },
    { id: 'date-screen', title: 'Date Planner', desc: 'Choose the time, place, and activity for our next date.', icon: Calendar, index: 4 },
    { id: 'lyrics-screen', title: 'Our Song', desc: 'Sit back and listen to the song I chose for you.', icon: Disc, index: 5 },
    { id: 'secret-screen', title: 'Our World', desc: 'Float in our private universe together.', icon: Globe, index: 6 },
  ];

  return (
    <div id="menu-screen" className={`screen ${active ? 'active' : ''}`}>
      <header className="main-header">
        <div className="days-counter-badge glass-card" id="days-counter-container">
          <Heart className="heart-pulse-slow active-heart text-[#c0392b]" />
          <span id="days-counter">{daysTogether} Days Together</span>
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
// 
