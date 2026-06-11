import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import { supabase, isSupabaseConfigured, getLocalFallbackData, setLocalFallbackData } from '../lib/supabase';

const DEFAULT_MEMORIES = [
  {
    id: 1,
    image_url: '/assets/memory1.png',
    title: 'the day distance finally lost',
    date: 'May 13, 2024',
    description: `for 1.5 years, we only knew each other through screens. Then came the day distance lost... It was even better than we imagined.`
  },
  {
    id: 2,
    image_url: '/assets/memory2.png',
    title: 'the weekend promise',
    date: 'June 8, 2024',
    description: `Picking you up from PW classes and making sure you get to the metro safely.`
  },
  {
    id: 3,
    image_url: '/assets/memory3.png',
    title: 'lost in the woods',
    date: 'July 22, 2024',
    description: `Walking around Sanjay Van, enjoying trees, nature, and silent peace together.`
  }
];

const MemoriesView = ({ onBack, active }) => {
  const [memories, setMemories] = useState([]);
  const [lightboxData, setLightboxData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!active) return;
    fetchMemories();
  }, [active]);

  const fetchMemories = async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('memories')
          .select('*')
          .order('date', { ascending: false });
        if (error) throw error;
        setMemories(data || []);
      } catch (err) {
        console.error('Error fetching memories:', err);
        loadFallbackMemories();
      }
    } else {
      loadFallbackMemories();
    }
  };

  const loadFallbackMemories = () => {
    const localData = getLocalFallbackData('local_memories', DEFAULT_MEMORIES);
    setMemories(localData);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !date || !description) return;
    setLoading(true);

    try {
      let imageUrl = '/assets/memory1.png'; // fallback placeholder

      if (imageFile) {
        if (isSupabaseConfigured) {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('memories')
            .upload(filePath, imageFile);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('memories')
            .getPublicUrl(filePath);

          imageUrl = urlData.publicUrl;
        } else {
          // If no Supabase configured, convert to Base64 to save locally
          imageUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(imageFile);
          });
        }
      }

      const newMemory = {
        title,
        date: new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        description,
        image_url: imageUrl,
        created_at: new Date().toISOString()
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase.from('memories').insert([newMemory]);
        if (error) throw error;
        fetchMemories();
      } else {
        const localData = getLocalFallbackData('local_memories', DEFAULT_MEMORIES);
        const updated = [{ ...newMemory, id: Date.now() }, ...localData];
        setLocalFallbackData('local_memories', updated);
        setMemories(updated);
      }

      // Reset Form
      setTitle('');
      setDate('');
      setDescription('');
      setImageFile(null);
      setShowForm(false);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevents opening the lightbox
    if (!confirm('Are you sure you want to delete this memory? 🥺')) return;

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('memories').delete().eq('id', id);
        if (error) throw error;
        fetchMemories();
      } else {
        const localData = getLocalFallbackData('local_memories', DEFAULT_MEMORIES);
        const updated = localData.filter((item) => item.id !== id);
        setLocalFallbackData('local_memories', updated);
        setMemories(updated);
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  if (!active) return null;

  return (
    <div id="memories-screen" className="screen active">
      <div className="container">
        <header className="section-header">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="section-title text-white">Our Best Moments</h1>
          <p className="section-subtitle">Click on an image to see it clearly.</p>

          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary mt-6 px-5 py-2.5 flex items-center gap-2 text-sm rounded-full mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>
        </header>

        <div className="gallery-grid">
          {memories.map((memory, index) => (
            <div
              key={memory.id}
              className="gallery-item glass-card relative group"
              style={{ '--item-index': index + 1 }}
              onClick={() => setLightboxData(memory)}
            >
              <div className="gallery-img-container">
                <img src={memory.image_url} alt={memory.title} loading="lazy" />
              </div>
              <div className="gallery-card-content">
                <span className="gallery-card-date">{memory.date}</span>
                <h3 className="gallery-card-title">{memory.title}</h3>
                <p className="gallery-card-desc line-clamp-3">{memory.description}</p>
                <div className="gallery-card-footer flex justify-between items-center w-full">
                  <span className="gallery-card-tag">Memory</span>
                  <button
                    onClick={(e) => handleDelete(memory.id, e)}
                    className="p-1.5 rounded-md text-red-400 hover:text-red-500 hover:bg-red-500/10 transition"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Modal Overlay */}
      {showForm && (
        <div className="modal-form-overlay">
          <div className="modal-form-content glass-card relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6 text-white text-center">Add New Memory</h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="info-label">MEMORABLE TITLE</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input"
                  placeholder="e.g. The first sunset together"
                  required
                />
              </div>
              <div className="form-group">
                <label className="info-label">DATE</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="info-label">STORY / CAPTION</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input min-h-[100px] resize-none"
                  placeholder="Write down details about this beautiful day..."
                  required
                />
              </div>
              <div className="form-group">
                <label className="info-label">PHOTO</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="glass-input text-xs"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 mt-4"
              >
                {loading ? 'Uploading memory...' : 'Save Memory ❤️'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Narrative Modal */}
      {lightboxData && (
        <div className="lightbox active" onClick={() => setLightboxData(null)}>
          <button className="lightbox-close" onClick={() => setLightboxData(null)}>
            &times;
          </button>
          <div className="lightbox-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-layout">
              <div className="lightbox-img-wrapper">
                <img src={lightboxData.image_url} alt={lightboxData.title} />
              </div>
              <div className="lightbox-info">
                <h3 className="lightbox-title">{lightboxData.title}</h3>
                <div className="lightbox-date">{lightboxData.date}</div>
                <div className="lightbox-caption">
                  <p>{lightboxData.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoriesView;
