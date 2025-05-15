```typescript
import { supabase } from '../supabase';

interface QueueItem {
  id: string;
  content: any;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export class OptimizationQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  private maxConcurrent = 3;
  private currentProcessing = 0;

  constructor() {
    this.initializeQueue();
  }

  private async initializeQueue() {
    // Load pending items from database
    const { data, error } = await supabase
      .from('optimization_results')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading queue:', error);
      return;
    }

    this.queue = data || [];
    this.processQueue();
  }

  public async addToQueue(content: any, priority: number = 1): Promise<string> {
    const item: QueueItem = {
      id: crypto.randomUUID(),
      content,
      priority,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Store in database
    const { error } = await supabase
      .from('optimization_results')
      .insert([item]);

    if (error) {
      throw new Error(`Failed to add item to queue: ${error.message}`);
    }

    // Add to memory queue
    this.queue.push(item);
    this.queue.sort((a, b) => b.priority - a.priority);

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }

    return item.id;
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0 || this.currentProcessing >= this.maxConcurrent) {
      return;
    }

    this.processing = true;
    this.currentProcessing++;

    try {
      const item = this.queue.shift();
      if (!item) return;

      // Update status
      await this.updateItemStatus(item.id, 'processing');

      // Process item
      const result = await this.processItem(item);

      // Update with result
      await this.updateItemStatus(item.id, 'completed', result);

    } catch (error) {
      console.error('Error processing queue item:', error);
      if (item) {
        await this.updateItemStatus(item.id, 'failed', { error: error.message });
      }
    } finally {
      this.currentProcessing--;
      this.processing = false;

      // Continue processing queue if items remain
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }

  private async processItem(item: QueueItem) {
    // Implement actual processing logic here
    // This is a placeholder that simulates processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      recommended_source: Math.random() > 0.5 ? 'human_ai' : 'ai_only',
      confidence: Math.random(),
      expected_revenue: Math.random() * 1000
    };
  }

  private async updateItemStatus(
    id: string, 
    status: QueueItem['status'], 
    result: any = {}
  ) {
    const { error } = await supabase
      .from('optimization_results')
      .update({
        status,
        ...result,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating item status:', error);
    }
  }

  public async getQueueStatus() {
    return {
      pending: this.queue.length,
      processing: this.currentProcessing,
      maxConcurrent: this.maxConcurrent
    };
  }

  public async clearQueue() {
    this.queue = [];
    
    await supabase
      .from('optimization_results')
      .update({ status: 'cancelled' })
      .eq('status', 'pending');
  }
}
```