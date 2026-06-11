import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Plus, X } from 'lucide-react';
import { supabase, isSupabaseConfigured, getLocalFallbackData, setLocalFallbackData } from '../lib/supabase';

const DEFAULT_HIS_REASONS = [
  "You make my bad days softer and my good days brighter.",
  "You listen – really listen – and that means everything to me.",
  "You're my calm and my beautiful chaos at the same time.",
  "You support my dreams as if they were your own.",
  "Just being around you feels like home.",
  "I love you through every single doubt, every distance, and every day that lies ahead.",
  "I love you because even on our hardest days, you are the only one I want to talk to.",
  "I love you for your warmth, your care, and the beautiful reassurance you give my heart.",
  "I love you in the quiet moments, in the chaos, and in everything in between.",
  "I love you simply because you are my home, my peace, and my favorite adventure."
];

const ReasonsView = ({ onBack, active }) => {
  const [reasons, setReasons] = useState([]);
  const [activeTab, setActiveTab] = useState('his');
  const [showAdd, setShowAdd] = useState(false);
  const [newReasonText, setNewReasonText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) return;
    fetchReasons();
  }, [active]);

  const fetchReasons = async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('reasons')
          .select('*')
          .order('created_at', { ascending: true });
        if (error) throw error;
        setReasons(data || []);
      } catch (err) {
        console.error('Error fetching reasons:', err);
        loadFallbackReasons();
      }
    } else {
      loadFallbackReasons();
    }
  };

  const loadFallbackReasons = () => {
    const hisLocal = getLocalFallbackData('local_his_reasons', DEFAULT_HIS_REASONS);
    const herLocal = getLocalFallbackData('local_her_reasons', []);
    
    const combined = [
      ...hisLocal.map((text, idx) => ({ id: `his-${idx}`, text, author: 'his' })),
      ...herLocal.map((text, idx) => ({ id: `her-${idx}`, text, author: 'her' }))
    ];
    setReasons(combined);
  };

  const handleAddReason = async (e) => {
    e.preventDefault();
    if (!newReasonText.trim()) return;
    setLoading(true);

    const newReason = {
      text: newReasonText.trim(),
      author: activeTab,
      created_at: new Date().toISOString()
    };

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('reasons').insert([newReason]);
        if (error) throw error;
        fetchReasons();
      } else {
        const storeKey = activeTab === 'his' ? 'local_his_reasons' : 'local_her_reasons';
        const currentLocal = getLocalFallbackData(storeKey, activeTab === 'his' ? DEFAULT_HIS_REASONS : []);
        const updated = [...currentLocal, newReason.text];
        setLocalFallbackData(storeKey, updated);
        loadFallbackReasons();
      }
      setNewReasonText('');
      setShowAdd(false);
    } catch (err) {
      alert('Failed to add reason: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeReasons = reasons.filter((r) => r.author === activeTab);

  if (!active) return null;

  return (
    <div id="reasons-screen" className="screen active">
      <div className="container">
        <header className="section-header">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="section-title text-white">Why I Love You</h1>
          <p className="section-subtitle">A few reasons why you are my favorite person.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="btn btn-primary mt-6 px-5 py-2.5 flex items-center gap-2 text-sm rounded-full mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reason</span>
          </button>
        </header>

        <div className="tabs-container glass-card mb-8">
          <button
            className={`tab-btn ${activeTab === 'his' ? 'active' : ''}`}
            onClick={() => setActiveTab('his')}
          >
            His Reasons
          </button>
          <button
            className={`tab-btn ${activeTab === 'her' ? 'active' : ''}`}
            onClick={() => setActiveTab('her')}
          >
            Her Reasons
          </button>
        </div>

        <div className="reasons-list-wrapper">
          {activeReasons.length === 0 ? (
            <div className="empty-tab-placeholder glass-card">
              <p>{activeTab === 'his' ? 'He hasn\'t added any reasons.' : 'She hasn\'t added any reasons yet... 🥺'}</p>
            </div>
          ) : (
            <ul className="reasons-list">
              {activeReasons.map((reason, index) => (
                <li
                  key={reason.id}
                  className="reason-item glass-card show"
                  style={{ '--item-index': index + 1 }}
                >
                  <div className="reason-icon">
                    <Heart className="active-heart w-4.5 h-4.5 text-[#c0392b]" />
                  </div>
                  <p className="reason-text text-left">{reason.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="modal-form-overlay">
          <div className="modal-form-content glass-card relative">
            <button
              onClick={() => setShowAdd(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6 text-white text-center">
              Add Reason ({activeTab === 'his' ? 'His' : 'Her'} list)
            </h2>
            <form onSubmit={handleAddReason} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="info-label">WHY I LOVE YOU REASON</label>
                <textarea
                  value={newReasonText}
                  onChange={(e) => setNewReasonText(e.target.value)}
                  className="glass-input min-h-[100px] resize-none"
                  placeholder="e.g. Because you understand my silence..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 mt-4"
              >
                {loading ? 'Adding...' : 'Add Reason ❤️'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReasonsView;
// 
