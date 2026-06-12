import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Trash2, Send } from 'lucide-react';
import { supabase, isSupabaseConfigured, getLocalFallbackData, setLocalFallbackData } from '../lib/supabase';

const DEFAULT_LETTERS = [
  {
    id: 'shivam-letter-1',
    title: 'To My Valentine',
    salutation: 'Dearest Ayushi,',
    body: 'I wanted to take a moment to tell you how incredibly lucky I feel to have you in my life. Every day with you is a new adventure, and your smile is literally my favorite thing in the world.',
    signature: 'Forever yours,\nShivam',
    sender: 'him',
    date: 'May 13, 2024'
  }
];

const LettersView = ({ onBack, active }) => {
  const [letters, setLetters] = useState([]);
  const [activeTab, setActiveTab] = useState('him');
  const [readingLetter, setReadingLetter] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [salutation, setSalutation] = useState('');
  const [body, setBody] = useState('');
  const [signature, setSignature] = useState('');
  const [sender, setSender] = useState('him');

  useEffect(() => {
    if (!active) return;
    fetchLetters();
  }, [active]);

  // ESC key handler
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setReadingLetter(null);
        setShowCompose(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const fetchLetters = async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('letters')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setLetters(data || []);
      } catch (err) {
        console.error('Error fetching letters:', err);
        loadFallbackLetters();
      }
    } else {
      loadFallbackLetters();
    }
  };

  const loadFallbackLetters = () => {
    const localData = getLocalFallbackData('local_letters', DEFAULT_LETTERS);
    setLetters(localData);
  };

  const handleCompose = async (e) => {
    e.preventDefault();
    if (!title || !salutation || !body || !signature) return;
    setLoading(true);

    const newLetter = {
      title,
      salutation,
      body,
      signature,
      sender,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      created_at: new Date().toISOString()
    };

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('letters').insert([newLetter]);
        if (error) throw error;
        fetchLetters();
      } else {
        const localData = getLocalFallbackData('local_letters', DEFAULT_LETTERS);
        const updated = [{ ...newLetter, id: Date.now() }, ...localData];
        setLocalFallbackData('local_letters', updated);
        setLetters(updated);
      }

      setTitle('');
      setSalutation('');
      setBody('');
      setSignature('');
      setShowCompose(false);
    } catch (err) {
      alert('Failed to send letter: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this letter? 🥺')) return;

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('letters').delete().eq('id', id);
        if (error) throw error;
        fetchLetters();
      } else {
        const localData = getLocalFallbackData('local_letters', DEFAULT_LETTERS);
        const updated = localData.filter((item) => item.id !== id);
        setLocalFallbackData('local_letters', updated);
        setLetters(updated);
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const activeLetters = letters.filter((l) => l.sender === activeTab);

  if (!active) return null;

  return (
    <div id="letter-screen" className="screen active">
      <div className="container">
        <header className="section-header">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="section-title text-white">Love Letters</h1>
          <button
            onClick={() => setShowCompose(true)}
            className="btn btn-primary mt-6 px-5 py-2.5 flex items-center gap-2 text-sm rounded-full mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Write Letter</span>
          </button>
        </header>

        <div className="tabs-container glass-card mb-8">
          <button
            className={`tab-btn ${activeTab === 'him' ? 'active' : ''}`}
            onClick={() => setActiveTab('him')}
          >
            From Him
          </button>
          <button
            className={`tab-btn ${activeTab === 'her' ? 'active' : ''}`}
            onClick={() => setActiveTab('her')}
          >
            From Her
          </button>
        </div>

        <div className="tab-panel active">
          {activeLetters.length === 0 ? (
            <div className="empty-tab-placeholder glass-card">
              <p>No letters yet... 🥺</p>
              <p className="text-sm mt-2 opacity-60">Write the first one!</p>
            </div>
          ) : (
            <div className="letters-grid">
              {activeLetters.map((letter, index) => (
                <div
                  key={letter.id}
                  className="letter-preview-card glass-card relative cursor-pointer"
                  onClick={() => setReadingLetter(letter)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-between items-center w-full mb-4">
                    <span className="letter-badge">{letter.date}</span>
                    <button
                      onClick={(e) => handleDelete(letter.id, e)}
                      className="text-red-400 hover:text-red-500 min-w-[36px] min-h-[36px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                  <h3 className="letter-preview-title">{letter.title}</h3>
                  <p className="letter-preview-snippet line-clamp-3">{letter.body}</p>
                  <span className="letter-read-more">Read Letter &rarr;</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Write Letter Modal */}
      {showCompose && (
        <div className="modal-form-overlay" onClick={() => setShowCompose(false)}>
          <div className="modal-form-content glass-card relative max-w-xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowCompose(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6 text-white text-center">Write a Love Letter</h2>
            <form onSubmit={handleCompose} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="info-label">SENDER</label>
                <select
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="glass-input"
                >
                  <option value="him">Shivam (Him)</option>
                  <option value="her">Ayushi (Her)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="info-label">LETTER TITLE</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input"
                  placeholder="e.g. My Favorite Memory"
                  required
                />
              </div>
              <div className="form-group">
                <label className="info-label">SALUTATION</label>
                <input
                  type="text"
                  value={salutation}
                  onChange={(e) => setSalutation(e.target.value)}
                  className="glass-input"
                  placeholder="e.g. Dearest Ayushi,"
                  required
                />
              </div>
              <div className="form-group">
                <label className="info-label">LETTER BODY</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="glass-input min-h-[150px] resize-none"
                  placeholder="Write from your heart..."
                  required
                />
              </div>
              <div className="form-group">
                <label className="info-label">SIGNATURE</label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="glass-input"
                  placeholder="e.g. Yours forever, Shivam"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 mt-4"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="loading-spinner"></span>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    Send Letter
                    <Send className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reading Letter Parchment Modal */}
      {readingLetter && (
        <div className="letter-modal active" onClick={() => setReadingLetter(null)}>
          <div className="letter-modal-content parchment-glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="letter-modal-close" onClick={() => setReadingLetter(null)}>
              &times;
            </button>
            <div className="letter-modal-body">
              <div className="letter-modal-salutation">{readingLetter.salutation}</div>
              <div className="text-base leading-relaxed text-[#f5eedc] mb-6 whitespace-pre-wrap italic">
                {readingLetter.body}
              </div>
              <div className="letter-modal-signature whitespace-pre-line">{readingLetter.signature}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LettersView;
