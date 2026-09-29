import { useRef, useState, useEffect } from "react";
import {
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiRotateCw,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";

const HIDE_DELAY = 2500; // ms of inactivity before controls auto-hide while playing

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);

  // Reset player state whenever the video source changes (e.g. carousel navigation)
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setShowControls(true);
  }, [src]);

  // Auto-hide controls after a period of inactivity, but only while playing
  useEffect(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    if (isPlaying && showControls) {
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, HIDE_DELAY);
    }

    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isPlaying, showControls]);

  const wakeControls = () => {
    setShowControls(true);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    wakeControls();
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(
      Math.max(video.currentTime + seconds, 0),
      video.duration || 0,
    );
    wakeControls();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    wakeControls();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setCurrentTime(video.currentTime);
    setProgress((video.currentTime / video.duration) * 100);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const newProgress = Number(e.target.value);
    video.currentTime = (newProgress / 100) * video.duration;
    setProgress(newProgress);
    wakeControls();
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="relative w-full h-96 bg-black group"
      onMouseMove={wakeControls}
      onClick={wakeControls}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => {
          setIsPlaying(false);
          setShowControls(true); // always show controls when paused
        }}
        onClick={togglePlay}
        onEnded={() => {
          setIsPlaying(false);
          setShowControls(true);
        }}
      />

      {/* Center controls: -10s / play-pause / +10s */}
      <div
        className={`absolute inset-0 flex items-center justify-center gap-8 pointer-events-none transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => skip(-10)}
          className="pointer-events-auto flex flex-col items-center gap-0.5 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition"
          aria-label="Rewind 10 seconds"
        >
          <FiRotateCcw className="text-2xl" />
          <span className="text-[10px] font-medium leading-none">10</span>
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-5 rounded-full transition"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <FiPause className="text-4xl" />
          ) : (
            <FiPlay className="text-4xl ml-1" />
          )}
        </button>

        <button
          type="button"
          onClick={() => skip(10)}
          className="pointer-events-auto flex flex-col items-center gap-0.5 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition"
          aria-label="Forward 10 seconds"
        >
          <FiRotateCw className="text-2xl" />
          <span className="text-[10px] font-medium leading-none">10</span>
        </button>
      </div>

      {/* Bottom bar: seek + time + mute */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent px-4 pt-8 pb-3 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleSeek}
          className="w-full h-1.5 accent-indigo-500 cursor-pointer"
        />

        <div className="flex items-center justify-between mt-2 text-white text-xs">
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <button
            type="button"
            onClick={toggleMute}
            className="hover:text-indigo-300 transition"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <FiVolumeX className="text-lg" />
            ) : (
              <FiVolume2 className="text-lg" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
