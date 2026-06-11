import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import CanvasNebula from '../components/CanvasNebula';

const LOVE_QUOTES = [
  "You are my today and all of my tomorrows. ❤️",
  "In a sea of people, my eyes will always search for you.",
  "If I know what love is, it is because of you.",
  "My heart is and always will be yours. 🌹",
  "To the world you may be one person, but to me you are the world.",
  "I love you more than words can show, I think about you more than you could know.",
  "Distance means so little when someone means so much.",
  "Every love story is beautiful, but ours is my favorite.",
  "Together with you is my favorite place to be. ✨",
  "You make my heart smile in ways nobody else can.",
  "You are my favorite notification. 😊",
  "We love because it's the only true adventure.",
  "You are the best thing that's ever been mine.",
  "You make me want to be a better person.",
  "You are my home, my peace, and my beautiful chaos.",
  "In your smile, I see something more beautiful than the stars.",
  "Loving you is the easiest thing I have ever done. ❤️",
  "My favorite place in the universe is right next to you.",
  "You are the music that my heart beats to. 🎶",
  "With you, time stands still and forever doesn't seem long enough.",
  "You have a place in my heart no one else could ever have.",
  "I would walk through a thousand universes just to hold your hand.",
  "You are my calm in the middle of any storm.",
  "Every day spent with you is my favorite day. So, today is my new favorite day.",
  "I love you not only for what you are, but for what I am when I am with you.",
  "You are my heart's permanent home. 🏠",
  "I need you like a heart needs a beat.",
  "You are the poem I never knew how to write, and this life is the story I always wanted to tell.",
  "You are my anchor in this crazy universe.",
  "My love for you is a journey, starting at forever and ending at never."
];

const OurWorldView = ({ onBack, active }) => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    if (!active) return;
    const today = new Date();
    const dayIndex = (today.getFullYear() * 372 + today.getMonth() * 31 + today.getDate()) % LOVE_QUOTES.length;
    setQuote(LOVE_QUOTES[dayIndex]);
  }, [active]);

  if (!active) return null;

  return (
    <div id="secret-screen" className="screen active">
      <CanvasNebula active={active} />
      <div className="secret-container glass-card">
        <header className="secret-header w-full flex justify-start mb-6">
          <button className="back-btn relative transform-none static" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            <span>Leave Our World</span>
          </button>
        </header>
        <div className="secret-content">
          <div className="secret-icon-wrapper text-[#c0392b] mb-4 flex justify-center">
            <Heart className="heart-pulse-slow active-heart w-11 h-11" />
          </div>
          <h1 className="secret-title mb-6">Our World</h1>
          <div className="quote-container border-l-2 border-[#c0392b] pl-4 text-left mb-6">
            <p id="daily-quote" className="daily-quote">
              "{quote}"
            </p>
            <span className="quote-author text-[#dfb76c] text-[11px] font-semibold tracking-wider uppercase block mt-1">
              — a little daily reminder
            </span>
          </div>
          <div className="secret-message-box">
            <p className="secret-msg-text text-left">
              No matter where we are in this universe, we are always under the same stars, looking at the same sky, holding each other in our hearts. This is our little place, just for us. ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurWorldView;
// 
