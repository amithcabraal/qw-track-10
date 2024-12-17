import { useState, useEffect } from 'react';
import { SpotifyTrack } from '../types/spotify';
import { playerService } from '../services/playerService';
import { getStoredAccessToken } from '../utils/auth';

export const usePlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) return;

    playerService.initialize(token)
      .catch(err => {
        setError('Failed to initialize player: ' + err.message);
      });

    return () => {
      playerService.disconnect();
    };
  }, []);

  const playTrack = async (track: SpotifyTrack) => {
    try {
      setError(null);
      await playerService.playTrack(track);
      setIsPlaying(true);
    } catch (err) {
      setError('Failed to play track: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setIsPlaying(false);
    }
  };

  const togglePlayback = async () => {
    try {
      await playerService.togglePlayback();
      const isPaused = await playerService.getCurrentState();
      setIsPlaying(!isPaused);
    } catch (err) {
      setError('Failed to toggle playback: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return { isPlaying, error, playTrack, togglePlayback };
};