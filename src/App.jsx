import React, { useState, useEffect, useRef } from 'react';
import PasscodeGate from './components/PasscodeGate';
import ParticleBackground from './components/ParticleBackground';
import WelcomeView from './views/WelcomeView';
import MenuView from './views/MenuView';
import MemoriesView from './views/MemoriesView';
import LettersView from './views/LettersView';
import ReasonsView from './views/ReasonsView';
import DatePlannerView from './views/DatePlannerView';
import OurSongView from './views/OurSongView';
import OurWorldView from './views/OurWorldView';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeScreen, setActiveScreen] = useState('welcome-screen');
  const [isAmbientMusicPlaying, setIsAmbientMusicPlaying] = useState(false);
  
  const ambientAudioRef = useRef(null);

  // Stop background music if it is playing
  const pauseAmbientMusic = () => {
    if (ambientAudioRef.current && isAmbientMusicPlaying) {
      ambientAudioRef.current.pause();
      setIsAmbientMusicPlaying(false);
    }
  };

  const handleCorrectPasscode = () => {
    setIsAuthenticated(true);
  };

  const handleEnterWorld = () => {
    setActiveScreen('menu-screen');
    // Start background music automatically
    if (ambientAudioRef.current) {
      ambientAudioRef.current.play()
        .then(() => {
          setIsAmbientMusicPlaying(true);
        })
        .catch((err) => {
          console.warn("Autoplay blocked or failed:", err);
        });
    }
  };

  const handleAmbientMusicToggle = () => {
    if (ambientAudioRef.current) {
      if (isAmbientMusicPlaying) {
        ambientAudioRef.current.pause();
        setIsAmbientMusicPlaying(false);
      } else {
        ambientAudioRef.current.play();
        setIsAmbientMusicPlaying(true);
      }
    }
  };

  if (!isAuthenticated) {
    return <PasscodeGate onCorrectPasscode={handleCorrectPasscode} />;
  }

  // Determine if sub-screens are active
  const isSubScreen = activeScreen !== 'welcome-screen' && activeScreen !== 'menu-screen';

  return (
    <div className="w-full min-h-screen relative overflow-x-hidden">
      {/* Background Video Loop */}
      <video autoPlay muted loop playsInline id="bg-video">
        <source src="/assets/bgvideo.mp4" type="video/mp4" />
      </video>

      {/* Dark Readability Overlay */}
      <div id="video-overlay"></div>

      {/* Particle sparkles & hearts */}
      <ParticleBackground active={activeScreen === 'menu-screen'} />

      {/* Ambient background music line */}
      <div id="lyrics-background" className={isSubScreen ? 'sub-screen-active' : ''}>
        <p className="lyric-line"></p>
      </div>

      {/* Welcome Screen */}
      <WelcomeView
        active={activeScreen === 'welcome-screen'}
        onEnterWorld={handleEnterWorld}
      />

      {/* Main Menu Screen */}
      <MenuView
        active={activeScreen === 'menu-screen'}
        onNavigate={(screenId) => setActiveScreen(screenId)}
        onMusicToggle={handleAmbientMusicToggle}
        isMusicPlaying={isAmbientMusicPlaying}
      />

      {/* Memories Gallery */}
      <MemoriesView
        active={activeScreen === 'memories-screen'}
        onBack={() => setActiveScreen('menu-screen')}
      />

      {/* Love Letters Screen */}
      <LettersView
        active={activeScreen === 'letter-screen'}
        onBack={() => setActiveScreen('menu-screen')}
      />

      {/* Why I Love You Reasons */}
      <ReasonsView
        active={activeScreen === 'reasons-screen'}
        onBack={() => setActiveScreen('menu-screen')}
      />

      {/* RSVP Date Night Planner */}
      <DatePlannerView
        active={activeScreen === 'date-screen'}
        onBack={() => setActiveScreen('menu-screen')}
      />

      {/* Spotify Synced Song Player */}
      <OurSongView
        active={activeScreen === 'lyrics-screen'}
        onBack={() => setActiveScreen('menu-screen')}
        onGlobalMusicPause={pauseAmbientMusic}
      />

      {/* Our World Secret Screen */}
      <OurWorldView
        active={activeScreen === 'secret-screen'}
        onBack={() => setActiveScreen('menu-screen')}
      />

      {/* Ambient Audio Element */}
      <audio ref={ambientAudioRef} src="/assets/bg_music.mp3" loop />
    </div>
  );
}

export default App;
