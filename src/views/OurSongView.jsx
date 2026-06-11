import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Plus, X } from 'lucide-react';
import { supabase, isSupabaseConfigured, getLocalFallbackData, setLocalFallbackData } from '../lib/supabase';

const DEFAULT_SONGS = [
  {
    id: 1,
    title: 'Until I Found You',
    artist: 'Stephen Sanchez',
    mp3_url: 'assets/bg_music.mp3',
    lyrics: `
[0.0] ♪ (Intro) ♪
[10.6] Georgia, wrap me up in all your...
[17.0] I want ya', in my arms
[22.4] Oh, let me hold ya'
[27.8] I'll never let you go again, like I did
[33.4] Oh, I used to say
[37.4] "I would never fall in love again until I found her"
[44.2] I said, "I would never fall unless it's you I fall into"
[51.4] I was lost within the darkness, but then I found her
[58.2] I found you
[67.7] Georgia, pulled me in, I asked to...
[74.4] Love her, once again
[79.5] You fell, I caught ya'
[83.3] I'll never let you go again, like I did
[90.7] Oh, I used to say
[94.2] "I would never fall in love again until I found her"
[101.3] I said, "I would never fall unless it's you I fall into"
[108.4] I was lost within the darkness, but then I found her
[115.2] I found you
[136.8] "I would never fall in love again until I found her"
[144.0] I said, "I would never fall unless it's you I fall into"
[151.2] I was lost within the darkness, but then I found her
[157.9] I found you
    `
  }
];

const OurSongView = ({ active, onBack, onGlobalMusicPause }) => {
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(177);
  const [randomCover, setRandomCover] = useState('assets/memory1.png');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Upload Form State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyricsText, setLyricsText] = useState('');
  const [audioFile, setAudioFile] = useState(null);

  const audioRef = useRef(null);
  const lyricsListRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    fetchSongs();
    pickRandomCover();
  }, [active]);

  const fetchSongs = async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('songs').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          setSongs(data);
        } else {
          setSongs(DEFAULT_SONGS);
        }
      } catch (err) {
        setSongs(DEFAULT_SONGS);
      }
    } else {
      const localData = getLocalFallbackData('local_songs', DEFAULT_SONGS);
      setSongs(localData);
    }
  };

  const pickRandomCover = async () => {
    let memoriesList = [];
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('memories').select('image_url');
      memoriesList = data || [];
    } else {
      memoriesList = getLocalFallbackData('local_memories', []);
    }

    if (memoriesList.length > 0) {
      const randIdx = Math.floor(Math.random() * memoriesList.length);
      setRandomCover(memoriesList[randIdx].image_url);
    } else {
      setRandomCover('assets/memory1.png');
    }
  };

  const currentSong = songs[currentSongIndex] || DEFAULT_SONGS[0];

  // Parse lyrics from text [10.6] lyric line
  const parseLyrics = (text) => {
    if (!text) return [];
    const lines = text.split('\n');
    const result = [];
    const regex = /\[(\d+(?:\.\d+)?)\](.*)/;

    lines.forEach((line) => {
      const match = line.match(regex);
      if (match) {
        result.push({
          time: parseFloat(match[1]),
          text: match[2].trim()
        });
      }
    });
    return result.sort((a, b) => a.time - b.time);
  };

  const parsedLyrics = parseLyrics(currentSong?.lyrics);

  // Sync scrolling lyrics
  useEffect(() => {
    if (!isPlaying) return;
    const activeEl = lyricsListRef.current?.querySelector('.active-lyric');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 177);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      onGlobalMusicPause(); // Pause the ambient background music
      audioRef.current.play();
      setIsPlaying(true);
      pickRandomCover();
    }
  };

  useEffect(() => {
    // If screen becomes inactive, pause player
    if (!active && isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [active]);

  const handleSkip = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        duration,
        Math.max(0, audioRef.current.currentTime + seconds)
      );
    }
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = clickX / width;
    if (audioRef.current) {
      audioRef.current.currentTime = percent * duration;
    }
  };

  const handleLyricLineClick = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleUploadSong = async (e) => {
    e.preventDefault();
    if (!title || !artist || !lyricsText || !audioFile) return;
    setUploadLoading(true);

    try {
      let mp3Url = 'assets/bg_music.mp3';

      if (isSupabaseConfigured) {
        const fileExt = audioFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('music')
          .upload(filePath, audioFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('music')
          .getPublicUrl(filePath);

        mp3Url = urlData.publicUrl;
      } else {
        // Fallback local base64/objectURL (temporary file URL for local preview)
        mp3Url = URL.createObjectURL(audioFile);
      }

      const newSong = {
        title,
        artist,
        mp3_url: mp3Url,
        lyrics: lyricsText,
        created_at: new Date().toISOString()
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase.from('songs').insert([newSong]);
        if (error) throw error;
        fetchSongs();
      } else {
        const localData = getLocalFallbackData('local_songs', DEFAULT_SONGS);
        const updated = [{ ...newSong, id: Date.now() }, ...localData];
        setLocalFallbackData('local_songs', updated);
        setSongs(updated);
      }

      setTitle('');
      setArtist('');
      setLyricsText('');
      setAudioFile(null);
      setShowUpload(false);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  if (!active) return null;

  // Find active lyric line index
  let activeLyricIdx = -1;
  for (let i = 0; i < parsedLyrics.length; i++) {
    if (currentTime >= parsedLyrics[i].time) {
      activeLyricIdx = i;
    } else {
      break;
    }
  }

  const percentProgress = (currentTime / duration) * 100;

  return (
    <div id="lyrics-screen" className="screen active">
      {/* Blurred Cover Art Backdrop */}
      <div
        className="spotify-bg-blur"
        style={{ backgroundImage: `url(${randomCover})` }}
      ></div>
      <div className="spotify-bg-overlay"></div>

      <div className="spotify-container">
        <header className="spotify-header flex justify-between items-center w-full">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={() => setShowUpload(true)}
            className="btn btn-primary px-4 py-2 flex items-center gap-1.5 text-xs rounded-full"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Song</span>
          </button>
        </header>

        <div className="spotify-layout">
          {/* Left Side: Cover Art & Playback Controls */}
          <div className="spotify-player-left">
            <div className="spotify-album-card">
              <img src={randomCover} alt="Album Cover" className="spotify-cover-img" />
            </div>

            <div className="spotify-song-info">
              <h2 className="spotify-song-title text-white">{currentSong?.title}</h2>
              <p className="spotify-song-artist">{currentSong?.artist}</p>
            </div>

            {/* Progress Bar Slider */}
            <div className="spotify-progress-container">
              <span className="progress-time">{formatTime(currentTime)}</span>
              <div
                className="spotify-progress-bar"
                onClick={handleProgressClick}
              >
                <div
                  className="spotify-progress-fill"
                  style={{ width: `${percentProgress}%` }}
                ></div>
              </div>
              <span className="progress-time">{formatTime(duration)}</span>
            </div>

            {/* Media Controls */}
            <div className="spotify-controls">
              <button className="spotify-ctrl-btn secondary" title="Shuffle" onClick={pickRandomCover}>
                <Shuffle className="w-5 h-5 text-white/50" />
              </button>
              <button
                className="spotify-ctrl-btn"
                onClick={() => handleSkip(-10)}
                title="Backward 10s"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                className="spotify-ctrl-btn play-pause-main"
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5.5 h-5.5 text-black fill-black" />
                ) : (
                  <Play className="w-5.5 h-5.5 text-black fill-black ml-0.5" />
                )}
              </button>
              <button
                className="spotify-ctrl-btn"
                onClick={() => handleSkip(10)}
                title="Forward 10s"
              >
                <SkipForward className="w-5 h-5" />
              </button>
              <button className="spotify-ctrl-btn secondary" title="Repeat">
                <Repeat className="w-5 h-5 text-white/50" />
              </button>
            </div>
          </div>

          {/* Right Side: Synced Lyrics Column */}
          <div className="spotify-player-right">
            <div className="spotify-lyrics-scroll" ref={lyricsListRef}>
              {parsedLyrics.length === 0 ? (
                <div className="text-white/40 text-center py-20 italic">
                  No timestamped lyrics uploaded for this song.
                </div>
              ) : (
                parsedLyrics.map((line, idx) => (
                  <div
                    key={idx}
                    className={`spotify-lyric-line ${
                      idx === activeLyricIdx ? 'active-lyric' : ''
                    }`}
                    onClick={() => handleLyricLineClick(line.time)}
                  >
                    {line.text}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Audio Player */}
      <audio
        ref={audioRef}
        src={currentSong?.mp3_url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Upload Song Form Modal */}
      {showUpload && (
        <div className="modal-form-overlay">
          <div className="modal-form-content glass-card relative max-w-xl">
            <button
              onClick={() => setShowUpload(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6 text-white text-center">Upload Song</h2>
            <form onSubmit={handleUploadSong} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="info-label">SONG TITLE</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input"
                  placeholder="e.g. Until I Found You"
                  required
                />
              </div>
              <div className="form-group">
                <label className="info-label">ARTIST</label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="glass-input"
                  placeholder="e.g. Stephen Sanchez"
                  required
                />
              </div>
              <div className="form-group">
                <label className="info-label">MP3 AUDIO FILE</label>
                <input
                  type="file"
                  accept="audio/mpeg, audio/mp3"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="glass-input text-xs"
                  required
                />
              </div>
              <div className="form-group">
                <label className="info-label">TIMESTAMPED LYRICS (LRC FORMAT)</label>
                <textarea
                  value={lyricsText}
                  onChange={(e) => setLyricsText(e.target.value)}
                  className="glass-input min-h-[150px] text-xs font-mono resize-none"
                  placeholder={`[0.0] ♪ (Intro) ♪\n[10.6] Georgia, wrap me up...\n[17.0] I want ya'`}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={uploadLoading}
                className="btn btn-primary w-full py-3 mt-4"
              >
                {uploadLoading ? 'Uploading song...' : 'Save Song 🎵'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OurSongView;
// 
