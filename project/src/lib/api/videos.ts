import { supabase } from '../supabase';
import { VideosResponse, VideoSchema } from './types';

export const videosApi = {
  async getAll(): Promise<VideosResponse> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const validatedData = data.map(video => VideoSchema.parse(video));

      return { data: validatedData, error: null };
    } catch (error) {
      console.error('Error fetching videos:', error);
      return { data: null, error: error.message };
    }
  },

  async getByStatus(status: string): Promise<VideosResponse> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const validatedData = data.map(video => VideoSchema.parse(video));

      return { data: validatedData, error: null };
    } catch (error) {
      console.error('Error fetching videos by status:', error);
      return { data: null, error: error.message };
    }
  },

  async updateStatus(id: string, status: string, progress: number): Promise<VideosResponse> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .update({ status, progress })
        .eq('id', id)
        .select();

      if (error) throw error;

      const validatedData = data.map(video => VideoSchema.parse(video));

      return { data: validatedData, error: null };
    } catch (error) {
      console.error('Error updating video status:', error);
      return { data: null, error: error.message };
    }
  }
};