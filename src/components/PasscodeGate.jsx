import React, { useState } from 'react';
import { Heart, Lock } from 'lucide-react';

const PasscodeGate = ({ onCorrectPasscode }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const envPasscode = import.meta.env.VITE_APP_PASSCODE || 'ayushi';
    if (passcode.toLowerCase() === envPasscode.toLowerCase()) {
      onCorrectPasscode();
    } else {
      setError(true);
      setPasscode('');
      setTimeout(() => setError(false), 800);
    }
  };

  return (
    <div className="auth-container">
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
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="glass-input text-center text-lg tracking-widest pl-10"
              placeholder="••••••••"
              required
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a8a93]" />
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
