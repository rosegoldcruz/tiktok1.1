import { supabase } from '../supabase';
import { VideoSchema } from '../api/types';

export class VideoRenderEngine {
  private static instance: VideoRenderEngine;
  private renderQueue: string[] = [];
  private isProcessing = false;

  private constructor() {}

  public static getInstance(): VideoRenderEngine {
    if (!VideoRenderEngine.instance) {
      VideoRenderEngine.instance = new VideoRenderEngine();
    }
    return VideoRenderEngine.instance;
  }

  public async addToQueue(videoId: string): Promise<boolean> {
    try {
      const { data: video, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (error) throw error;

      // Validate video data
      const validatedVideo = VideoSchema.parse(video);

      // Add to queue if not already present
      if (!this.renderQueue.includes(validatedVideo.id)) {
        this.renderQueue.push(validatedVideo.id);
        
        // Start processing if not already running
        if (!this.isProcessing) {
          this.processQueue();
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding video to queue:', error);
      return false;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.renderQueue.length === 0 || this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.renderQueue.length > 0) {
        const videoId = this.renderQueue[0];
        
        // Update status to rendering
        await supabase
          .from('videos')
          .update({ status: 'rendering', progress: 0 })
          .eq('id', videoId);

        // Simulate render process with progress updates
        await this.renderVideo(videoId);

        // Remove from queue
        this.renderQueue.shift();
      }
    } catch (error) {
      console.error('Error processing render queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async renderVideo(videoId: string): Promise<void> {
    const totalSteps = 5;
    
    for (let step = 1; step <= totalSteps; step++) {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const progress = Math.floor((step / totalSteps) * 100);
      
      // Update progress
      await supabase
        .from('videos')
        .update({ progress })
        .eq('id', videoId);
    }

    // Mark as completed
    await supabase
      .from('videos')
      .update({ 
        status: 'completed',
        progress: 100,
        duration: '3:45', // This would be actual duration in production
        thumbnail_url: 'https://images.pexels.com/photos/2544554/pexels-photo-2544554.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      })
      .eq('id', videoId);
  }

  public async cancelRender(videoId: string): Promise<boolean> {
    try {
      // Remove from queue if present
      this.renderQueue = this.renderQueue.filter(id => id !== videoId);
      
      // Update status if currently rendering
      const { data: video } = await supabase
        .from('videos')
        .select('status')
        .eq('id', videoId)
        .single();

      if (video?.status === 'rendering') {
        await supabase
          .from('videos')
          .update({ 
            status: 'cancelled',
            progress: 0
          })
          .eq('id', videoId);
      }

      return true;
    } catch (error) {
      console.error('Error cancelling render:', error);
      return false;
    }
  }

  public async getQueueStatus(): Promise<{
    queueLength: number;
    isProcessing: boolean;
    currentProgress?: number;
  }> {
    try {
      if (this.renderQueue.length === 0) {
        return {
          queueLength: 0,
          isProcessing: false
        };
      }

      const currentVideoId = this.renderQueue[0];
      const { data: video } = await supabase
        .from('videos')
        .select('progress')
        .eq('id', currentVideoId)
        .single();

      return {
        queueLength: this.renderQueue.length,
        isProcessing: this.isProcessing,
        currentProgress: video?.progress
      };
    } catch (error) {
      console.error('Error getting queue status:', error);
      return {
        queueLength: this.renderQueue.length,
        isProcessing: this.isProcessing
      };
    }
  }
}

export const renderEngine = VideoRenderEngine.getInstance();