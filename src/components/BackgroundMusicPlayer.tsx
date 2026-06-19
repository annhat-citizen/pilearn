import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Volume2, VolumeX, Play, Pause, Disc } from 'lucide-react';
import { useAppContext } from '../store';

export function BackgroundMusicPlayer() {
  const { view } = useAppContext();
  const isStudentView = view !== 'admin-dashboard';
  const isStudying = view === 'lesson';

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const studyAudioRef = useRef<HTMLAudioElement | null>(null);
  const bossAudioRef = useRef<HTMLAudioElement | null>(null);

  const [bgConfig, setBgConfig] = useState({
    url: '',
    volume: 20,
    enabled: false,
    loop: true,
  });
  const [studyConfig, setStudyConfig] = useState({
    url: '',
    volume: 20,
    enabled: false,
    loop: true,
  });
  const [bossConfig, setBossConfig] = useState({
    url: '',
    volume: 30,
    enabled: false,
    loop: true,
  });
  const [masterVolume, setMasterVolume] = useState(100);

  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [studentMuted, setStudentMuted] = useState(false);

  // Clean up audio references on unmount
  useEffect(() => {
    return () => {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current = null;
      }
      if (studyAudioRef.current) {
        studyAudioRef.current.pause();
        studyAudioRef.current = null;
      }
      if (bossAudioRef.current) {
        bossAudioRef.current.pause();
        bossAudioRef.current = null;
      }
    };
  }, []);

  // Load config on mount & on config event
  const loadConfig = () => {
    try {
      // Load student mute preference
      const isMuted = localStorage.getItem('pilearn_student_bg_music_muted') === 'true';
      setStudentMuted(isMuted);

      const saved = localStorage.getItem('pilearn_nocode_layout_config');
      if (saved) {
        const configData = JSON.parse(saved);
        const audioSettings = configData?.systemSettings?.audioSettings || {};
        
        setBgConfig({
          url: audioSettings.bgMusicUrl || '',
          volume: typeof audioSettings.bgMusicVolume === 'number' ? audioSettings.bgMusicVolume : 20,
          enabled: !!audioSettings.bgMusicEnabled,
          loop: audioSettings.bgMusicLoop !== false,
        });

        // Maintain study music at 20% default if undefined, but can be updated by admin/user
        setStudyConfig({
          url: audioSettings.studyMusicUrl || '',
          volume: typeof audioSettings.studyMusicVolume === 'number' ? audioSettings.studyMusicVolume : 20,
          enabled: !!audioSettings.studyMusicEnabled,
          loop: audioSettings.studyMusicLoop !== false,
        });

        // Boss fight music parameters
        setBossConfig({
          url: audioSettings.bossMusicUrl || '',
          volume: typeof audioSettings.bossMusicVolume === 'number' ? audioSettings.bossMusicVolume : 30,
          enabled: !!audioSettings.bossMusicEnabled,
          loop: audioSettings.bossMusicLoop !== false,
        });

        setMasterVolume(typeof audioSettings.masterVolume === 'number' ? audioSettings.masterVolume : 100);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadConfig();
    window.addEventListener('pilearn_config_sync', loadConfig);
    return () => {
      window.removeEventListener('pilearn_config_sync', loadConfig);
    };
  }, []);

  const isBossBattle = view === 'boss-battle';
  const activeMusicConfig = isBossBattle ? bossConfig : (isStudying ? studyConfig : bgConfig);

  // Set up Audio instances and handle toggles in real-time
  useEffect(() => {
    // 1. Determine active and inactive players
    const activeConfig = isBossBattle ? bossConfig : (isStudying ? studyConfig : bgConfig);
    const activeAudioObj = isBossBattle ? bossAudioRef.current : (isStudying ? studyAudioRef.current : bgAudioRef.current);
    
    // Pause other non-active music players immediately so they NEVER overlap
    if (isBossBattle) {
      if (bgAudioRef.current) bgAudioRef.current.pause();
      if (studyAudioRef.current) studyAudioRef.current.pause();
    } else if (isStudying) {
      if (bgAudioRef.current) bgAudioRef.current.pause();
      if (bossAudioRef.current) bossAudioRef.current.pause();
    } else {
      if (studyAudioRef.current) studyAudioRef.current.pause();
      if (bossAudioRef.current) bossAudioRef.current.pause();
    }

    // 3. If muted or has no URL or is disabled, pause the active one too and stop
    if (studentMuted || !activeConfig.enabled || !activeConfig.url || activeConfig.url.startsWith('[TRUNCATED_BASE64:')) {
      const activeObj = isBossBattle ? bossAudioRef.current : (isStudying ? studyAudioRef.current : bgAudioRef.current);
      if (activeObj) {
        activeObj.pause();
      }
      setIsPlaying(false);
      return;
    }

    // 4. Lazy initialize / update source of active player
    let currentActiveObj = isBossBattle ? bossAudioRef.current : (isStudying ? studyAudioRef.current : bgAudioRef.current);
    if (!currentActiveObj) {
      currentActiveObj = new Audio(activeConfig.url);
      if (isBossBattle) {
        bossAudioRef.current = currentActiveObj;
      } else if (isStudying) {
        studyAudioRef.current = currentActiveObj;
      } else {
        bgAudioRef.current = currentActiveObj;
      }
    } else if (currentActiveObj.src !== activeConfig.url) {
      currentActiveObj.src = activeConfig.url;
    }

    const audio = currentActiveObj;
    audio.loop = activeConfig.loop;
    
    // Set volume correctly
    const calculatedVolume = (activeConfig.volume / 100) * (masterVolume / 100);
    audio.volume = Math.max(0, Math.min(1, calculatedVolume));

    // Handle end of audio
    const handleEnded = () => {
      if (activeConfig.loop) {
        audio.currentTime = 0;
        audio.play().catch(err => console.log("Replay blocked", err));
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('ended', handleEnded);

    // 5. Try to play the active one
    audio.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        console.log("Play on load blocked by browser. Awaiting interaction:", err.message);
        setIsPlaying(false);
      });

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [bgConfig, studyConfig, bossConfig, masterVolume, studentMuted, isStudying, isBossBattle]);

  // Sync volumes when config volumes update
  useEffect(() => {
    if (bgAudioRef.current) {
      const calculatedVolume = (bgConfig.volume / 100) * (masterVolume / 100);
      bgAudioRef.current.volume = Math.max(0, Math.min(1, calculatedVolume));
    }
  }, [bgConfig.volume, masterVolume]);

  useEffect(() => {
    if (studyAudioRef.current) {
      const calculatedVolume = (studyConfig.volume / 100) * (masterVolume / 100);
      studyAudioRef.current.volume = Math.max(0, Math.min(1, calculatedVolume));
    }
  }, [studyConfig.volume, masterVolume]);

  useEffect(() => {
    if (bossAudioRef.current) {
      const calculatedVolume = (bossConfig.volume / 100) * (masterVolume / 100);
      bossAudioRef.current.volume = Math.max(0, Math.min(1, calculatedVolume));
    }
  }, [bossConfig.volume, masterVolume]);

  // Capture global interaction/gesture to resume if browser blocked autoplay
  useEffect(() => {
    const handleGestureAndPlay = () => {
      setUserInteracted(true);
      const activeAudioRef = isBossBattle ? bossAudioRef : (isStudying ? studyAudioRef : bgAudioRef);
      const activeConfig = isBossBattle ? bossConfig : (isStudying ? studyConfig : bgConfig);

      if (activeConfig.enabled && !studentMuted && activeConfig.url && activeAudioRef.current && !isPlaying && !activeConfig.url.startsWith('[TRUNCATED_BASE64:')) {
        activeAudioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => console.log("Play failed on gesture:", err));
      }
      
      window.removeEventListener('click', handleGestureAndPlay);
      window.removeEventListener('keydown', handleGestureAndPlay);
    };

    const activeConfig = isBossBattle ? bossConfig : (isStudying ? studyConfig : bgConfig);
    if (activeConfig.enabled && !studentMuted && activeConfig.url && !isPlaying && !activeConfig.url.startsWith('[TRUNCATED_BASE64:')) {
      window.addEventListener('click', handleGestureAndPlay);
      window.addEventListener('keydown', handleGestureAndPlay);
    }

    return () => {
      window.removeEventListener('click', handleGestureAndPlay);
      window.removeEventListener('keydown', handleGestureAndPlay);
    };
  }, [bgConfig, studyConfig, bossConfig, isPlaying, studentMuted, isStudying, isBossBattle]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const activeAudioObj = isBossBattle ? bossAudioRef.current : (isStudying ? studyAudioRef.current : bgAudioRef.current);
    if (!activeAudioObj) return;

    if (isPlaying) {
      activeAudioObj.pause();
      setIsPlaying(false);
    } else {
      activeAudioObj.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error("Toggle play error:", err));
    }
  };

  const handleLocalVolumeChange = (newVol: number) => {
    if (isBossBattle) {
      setBossConfig(prev => ({ ...prev, volume: newVol }));
    } else if (isStudying) {
      setStudyConfig(prev => ({ ...prev, volume: newVol }));
    } else {
      setBgConfig(prev => ({ ...prev, volume: newVol }));
    }
    try {
      const saved = localStorage.getItem('pilearn_nocode_layout_config');
      if (saved) {
        const configData = JSON.parse(saved);
        if (!configData.systemSettings) configData.systemSettings = {};
        if (!configData.systemSettings.audioSettings) configData.systemSettings.audioSettings = {};
        if (isBossBattle) {
          configData.systemSettings.audioSettings.bossMusicVolume = newVol;
        } else if (isStudying) {
          configData.systemSettings.audioSettings.studyMusicVolume = newVol;
        } else {
          configData.systemSettings.audioSettings.bgMusicVolume = newVol;
        }
        localStorage.setItem('pilearn_nocode_layout_config', JSON.stringify(configData));
        window.dispatchEvent(new Event('pilearn_config_sync'));
      }
    } catch(e) {}
  };

  // If student view, hide the floating player widget entirely (Pihouse Player is of course only displayed where appropriate)
  if (!activeMusicConfig.enabled || !activeMusicConfig.url || studentMuted || isStudentView) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-6 z-50 select-none">
      <div className="relative">
        {/* Floating Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative p-3.5 rounded-full shadow-2xl flex items-center justify-center border transition-all duration-300 cursor-pointer ${
            isPlaying 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400' 
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
          title={isBossBattle ? "Quyết Chiến Boss ⚔️" : (isStudying ? "Nhạc Học Tập 📕" : "Nhạc nền Website 🎵")}
        >
          {isPlaying ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="relative flex items-center justify-center w-5 h-5"
            >
              <Disc size={20} className="absolute" />
              <div className="absolute w-1.5 h-1.5 bg-white rounded-full border border-indigo-600"></div>
            </motion.div>
          ) : (
            <Music size={20} className="w-5 h-5 animate-pulse" />
          )}

          {/* Autoplay recommendation glow badge */}
          {!isPlaying && activeMusicConfig.enabled && (
            <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500 text-[8px] text-white font-extrabold items-center justify-center">!</span>
            </div>
          )}
        </motion.button>

        {/* Panel Expanded UI */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15, x: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 15, x: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute bottom-16 left-0 w-64 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xl backdrop-blur-md text-slate-800 dark:text-slate-100 font-sans space-y-3.5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{isBossBattle ? "⚔️" : (isStudying ? "📚" : "📻")}</span>
                  <div className="text-left">
                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">
                      {isBossBattle ? "Boss Battle" : (isStudying ? "Study Player" : "Pihouse Player")}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {isBossBattle ? "Nhạc quyết chiến Boss" : (isStudying ? "Nhạc học tập" : "Nhạc nền Website")}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase transition"
                >
                  ✕
                </button>
              </div>

              {/* Player control row */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isPlaying 
                      ? 'bg-slate-100 dark:bg-slate-855 text-slate-800 dark:text-white hover:bg-slate-200' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                  }`}
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="translate-x-[1px]" fill="currentColor" />}
                </button>

                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-bold truncate">
                    {isPlaying ? "🎵 Đang phát nhạc" : "⏹️ Đã tạm dừng phát"}
                  </p>
                  <p className="text-[9.5px] text-slate-500 truncate">
                    {activeMusicConfig.loop ? "Tự động phát lại khi hết" : "Dừng phát khi hết"}
                  </p>
                </div>
              </div>

              {/* Volume sliders */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400">
                  <span className="flex items-center gap-1">
                    {activeMusicConfig.volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    ÂM LƯỢNG
                  </span>
                  <span className="font-mono text-indigo-500">{activeMusicConfig.volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeMusicConfig.volume}
                  onChange={(e) => handleLocalVolumeChange(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1 rounded"
                />
              </div>

              {/* Browser Autoplay indicator message */}
              {!isPlaying && !activeMusicConfig.url.startsWith('[TRUNCATED_BASE64:') && (
                <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-955/20 border border-orange-100 dark:border-orange-900/30 text-[9px] text-orange-600 dark:text-orange-400 text-left font-medium leading-relaxed">
                  ⚠️ Trình duyệt chặn tự động phát nhạc. Bấm nút <b>Play</b> hoặc click một góc bất kỳ trên trang để mở lại nhạc nhé!
                </div>
              )}

              {/* Truncated base64 indicator message */}
              {activeMusicConfig.url.startsWith('[TRUNCATED_BASE64:') && (
                <div className="p-2.5 rounded-xl bg-indigo-50/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-300 text-left font-medium leading-relaxed space-y-1">
                  <div className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                    ℹ️ Nhạc cục bộ (Admin)
                  </div>
                  <div>
                    Nhạc này được tải trực tiếp dưới dạng tệp và chỉ hoạt động trên trình duyệt hiện tại của bạn.
                  </div>
                  <div className="text-[9px] text-slate-400 leading-snug">
                    Để tất cả học sinh nghe thấy nhạc nền, admin vui lòng sử dụng liên kết <b>URL trực tuyến (HTTP/HTTPS)</b> thay vì tải lên tệp trực tiếp trong Trang Quản Trị nhé!
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
