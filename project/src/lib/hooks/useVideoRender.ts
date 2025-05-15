import { useState, useEffect } from 'react';
import { renderEngine } from '../video/render-engine';
import { supabase } from '../supabase';
import { Video } from '../api/types';

export function useVideoRender(videoId?: string) {
  const [status, setStatus] = useState<Video['status']>('queued');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;

    // Subscribe to video updates
    const subscription = supabase
      .channel(`video-${videoId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'videos',
          filter: `id=eq.${videoId}`
        },
        (payload) => {
          setStatus(payload.new.status);
          setProgress(payload.new.progress);
        }
      )
      .subscribe();

    // Initial status fetch
    supabase
      .from('videos')
      .select('status, progress')
      .eq('id', videoId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          setStatus(data.status);
          setProgress(data.progress);
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [videoId]);

  const startRender = async () => {
    if (!videoId) return;
    
    try {
      const success = await renderEngine.addToQueue(videoId);
      if (!success) {
        throw new Error('Failed to add video to render queue');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelRender = async () => {
    if (!videoId) return;
    
    try {
      const success = await renderEngine.cancelRender(videoId);
      if (!success) {
        throw new Error('Failed to cancel render');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    status,
    progress,
    error,
    startRender,
    cancelRender
  };
}