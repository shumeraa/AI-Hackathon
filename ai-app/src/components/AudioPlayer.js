import React, { useState, useRef, useEffect } from 'react';
import styles from './AudioPlayer.module.css';

function AudioPlayer({ src }) {
    const audioRef = useRef(new Audio(src));
    const [isPlaying, setIsPlaying] = useState(false);
  
    const togglePlayPause = () => {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    };
  
    // Update state when audio ends
    useEffect(() => {
      const audio = audioRef.current;
      audio.addEventListener('ended', () => setIsPlaying(false));
      return () => {
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }, []);
  
    return (
      <div className={styles.audioPlayer}>
        <button onClick={togglePlayPause} className={styles.playPauseBtn}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
  
        <div className={`${styles.bars} ${isPlaying ? styles.barsPlaying : ''}`}>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
        </div>
      </div>
    );
  }
  
  export default AudioPlayer;