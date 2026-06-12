import React, { useState, useEffect } from 'react';
import { Heart, Lock, Eye, EyeOff } from 'lucide-react';

const PasscodeGate = ({ onCorrectPasscode }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Entrance animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const envPasscode = import.meta.env.VITE_APP_PASSCODE || 'ayushi';
    if (passcode.toLowerCase() === envPasscode.toLowerCase()) {
      // Haptic feedback on success
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      onCorrectPasscode();
    } else {
      setError(true);
      setPasscode('');
      if (navigator.vibrate) navigator.vibrate(100);
      setTimeout(() => setError(false), 800);
    }
  };

  return (
    <div className="auth-container">
      {/* Ambient background glow */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(192, 57, 43, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'galaxyPulse 8s infinite ease-in-out'
        }}
      />
      
      <div className={`auth-card glass-card ${error ? 'animate-shake' : ''}`}>
        <div className="flex justify-center mb-6">
          <div className="card-icon-wrapper">
            <Heart className="heart-pulse-slow active-heart w-10 h-10 text-[#c0392b]" />
          </div>
        </div>
        <h2 className="section-title text-center text-white mb-2">Our Private Space</h2>
        <p className="text-sm text-[#8a8a93] mb-8">
          Enter the secret passcode to enter our world.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="glass-input text-center text-lg tracking-widest pl-10 pr-10"
              placeholder="••••••••"
              required
              autoFocus
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a8a93]" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a8a93] hover:text-white transition min-w-[32px] min-h-[32px] flex items-center justify-center"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
          <button type="submit" className="btn btn-primary w-full py-4 mt-2">
            Open Space
          </button>
        </form>
        {error && (
          <p className="text-red-500 text-xs mt-4 animate-pulse">
            Incorrect passcode. Try again, love. ❤️
          </p>
        )}
      </div>
    </div>
  );
};

export default PasscodeGate;
