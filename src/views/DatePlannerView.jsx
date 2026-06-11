import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase, isSupabaseConfigured, getLocalFallbackData, setLocalFallbackData } from '../lib/supabase';

const DatePlannerView = ({ onBack, active }) => {
  const [dateVal, setDateVal] = useState('');
  const [timeVal, setTimeVal] = useState('19:00');
  const [placeVal, setPlaceVal] = useState('');
  const [activityVal, setActivityVal] = useState('');
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpDetails, setRsvpDetails] = useState('');

  useEffect(() => {
    if (!active) return;
    const today = new Date().toISOString().split('T')[0];
    setDateVal(today);
  }, [active]);

  const triggerConfettiExplosion = () => {
    const colors = ['#ff3366', '#dfb76c', '#ffffff', '#ffccd5'];

    // Left cannon
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.1, y: 0.6 },
      colors: colors
    });

    // Right cannon
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.9, y: 0.6 },
      colors: colors
    });

    // Center spray
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.55 },
        colors: colors
      });
    }, 250);
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    if (!dateVal || !timeVal) {
      alert("Please pick a date and time first! ❤️");
      return;
    }

    const placeInput = placeVal.trim() || 'Our Special Spot';
    const activityInput = activityVal.trim() || 'Spending Sweet Time Together';

    // Format the date nicely using local timezone
    const dateParts = dateVal.split('-');
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-US', options);

    // Format the time nicely
    const timeParts = timeVal.split(':');
    let hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedTime = `${hours}:${minutes} ${ampm}`;

    const newRsvp = {
      date: formattedDate,
      time: formattedTime,
      place: placeInput,
      activity: activityInput,
      created_at: new Date().toISOString()
    };

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('dates').insert([newRsvp]);
        if (error) throw error;
      } else {
        setLocalFallbackData('local_rsvp', newRsvp);
      }

      setRsvpDetails(`
        Can't wait to see you on <br>
        <span style="color:var(--gold); font-size:16px; font-weight:600; display:inline-block; margin:6px 0;">${formattedDate}</span><br>
        at <span style="color:var(--accent); font-size:16px; font-weight:600; display:inline-block; margin-bottom:6px;">${formattedTime}</span>.<br>
        <span style="color:var(--text-secondary); font-size:13px;">Place: <b>${placeInput}</b></span><br>
        <span style="color:var(--text-secondary); font-size:13px;">Activity: <b>${activityInput}</b></span>
      `);

      setRsvpSuccess(true);
      triggerConfettiExplosion();
    } catch (err) {
      alert('Failed to lock in the date: ' + err.message);
    }
  };

  if (!active) return null;

  return (
    <div id="date-screen" className="screen active">
      <div className="container">
        <header className="section-header">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="section-title text-white">next date when ?</h1>
          <p className="section-subtitle">Pick the perfect time for our next meetup.</p>
        </header>

        <div className="ticket-container">
          <div
            className="ticket glass-card"
            id="date-ticket"
            style={{
              borderColor: rsvpSuccess ? 'rgba(192, 57, 43, 0.45)' : '',
              boxShadow: rsvpSuccess ? '0 15px 45px rgba(192, 57, 43, 0.3)' : ''
            }}
          >
            <div className="ticket-header">
              <div className="ticket-badge">EXCLUSIVELY FOR YOU</div>
              <h2 className="ticket-title text-white">Our Next Date</h2>
            </div>

            <div className="ticket-divider">
              <div className="notch left"></div>
              <div className="dashed-line"></div>
              <div className="notch right"></div>
            </div>

            <div className="ticket-body w-full">
              {!rsvpSuccess ? (
                <form onSubmit={handleRsvpSubmit} className="ticket-form" id="rsvp-controls">
                  <div className="input-row">
                    <div className="form-group">
                      <label htmlFor="date-picker" className="info-label">SELECT DATE</label>
                      <input
                        type="date"
                        id="date-picker"
                        value={dateVal}
                        onChange={(e) => setDateVal(e.target.value)}
                        className="glass-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="time-picker" className="info-label">SELECT TIME</label>
                      <input
                        type="time"
                        id="time-picker"
                        value={timeVal}
                        onChange={(e) => setTimeVal(e.target.value)}
                        className="glass-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group mt-4 w-full">
                    <label htmlFor="place-picker" className="info-label">PLACE IDEA</label>
                    <input
                      type="text"
                      id="place-picker"
                      value={placeVal}
                      onChange={(e) => setPlaceVal(e.target.value)}
                      className="glass-input"
                      placeholder="e.g. Sanjay Van, Cozy Cafe, Metro..."
                    />
                  </div>

                  <div className="form-group mt-4 w-full">
                    <label htmlFor="activity-picker" class="info-label">ACTIVITY IDEA</label>
                    <input
                      type="text"
                      id="activity-picker"
                      value={activityVal}
                      onChange={(e) => setActivityVal(e.target.value)}
                      className="glass-input"
                      placeholder="e.g. Walking, Coffee & talks..."
                    />
                  </div>

                  <div className="rsvp-actions mt-6">
                    <button type="submit" className="btn btn-rsvp">
                      <span>Lock in our date!</span>
                      <HeartHandshake className="w-5 h-5 inline-block ml-2" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rsvp-success" id="rsvp-success-message">
                  <div className="success-icon-wrapper">
                    <Heart className="heart-pulse-slow w-12 h-12 text-[#c0392b]" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-4">It's a date! ❤️</h3>
                  <p
                    id="rsvp-success-details"
                    className="info-value"
                    style={{ textAlign: 'center', marginTop: '12px', lineHeight: '1.6' }}
                    dangerouslySetInnerHTML={{ __html: rsvpDetails }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatePlannerView;
// 
