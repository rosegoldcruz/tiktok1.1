import { supabase } from '../supabase';
import { TrendsResponse, TrendSchema } from './types';
import { format } from 'date-fns';

export const trendsApi = {
  async getAll(): Promise<TrendsResponse> {
    try {
      const { data, error } = await supabase
        .from('trends')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Validate response data
      const validatedData = data.map(trend => TrendSchema.parse(trend));

      return { data: validatedData, error: null };
    } catch (error) {
      console.error('Error fetching trends:', error);
      return { data: null, error: error.message };
    }
  },

  async getByDateRange(startDate: Date, endDate: Date): Promise<TrendsResponse> {
    try {
      const { data, error } = await supabase
        .from('trends')
        .select('*')
        .gte('created_at', format(startDate, 'yyyy-MM-dd'))
        .lte('created_at', format(endDate, 'yyyy-MM-dd'))
        .order('created_at', { ascending: false });

      if (error) throw error;

      const validatedData = data.map(trend => TrendSchema.parse(trend));

      return { data: validatedData, error: null };
    } catch (error) {
      console.error('Error fetching trends by date range:', error);
      return { data: null, error: error.message };
    }
  },

  async getByPlatform(platform: string): Promise<TrendsResponse> {
    try {
      const { data, error } = await supabase
        .from('trends')
        .select('*')
        .eq('platform', platform)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const validatedData = data.map(trend => TrendSchema.parse(trend));

      return { data: validatedData, error: null };
    } catch (error) {
      console.error('Error fetching trends by platform:', error);
      return { data: null, error: error.message };
    }
  }
};