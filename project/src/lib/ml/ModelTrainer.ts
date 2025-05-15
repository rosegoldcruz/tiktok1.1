import * as tf from '@tensorflow/tfjs';
import { supabase } from '../supabase';

export class ModelTrainer {
  private model: tf.LayersModel;
  
  constructor() {
    this.model = this.createModel();
  }

  private createModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ 
          units: 128, 
          activation: 'relu', 
          inputShape: [10] // Update based on feature count
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1 })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(),
      loss: 'meanSquaredError',
      metrics: ['meanAbsoluteError']
    });

    return model;
  }

  async prepareData() {
    // Fetch data from Supabase
    const { data: contentData, error } = await supabase
      .from('content_analysis')
      .select(`
        *,
        content_variants (*),
        monetization_logs (*)
      `);

    if (error) throw error;

    // Process features
    const features = contentData.map(content => [
      content.complexity_score,
      content.engagement_rate,
      content.completion_rate,
      content.sentiment_score,
      content.word_count,
      // One-hot encode categorical variables
      ...this.oneHotEncode(content.vertical, ['tech', 'lifestyle', 'finance', 'health']),
      ...this.oneHotEncode(content.platform, ['tiktok', 'youtube', 'instagram']),
      ...this.oneHotEncode(content.source, ['ai_only', 'human_ai', 'human_only'])
    ]);

    // Process labels (revenue)
    const labels = contentData.map(content => 
      content.monetization_logs.reduce((sum, log) => sum + log.revenue, 0)
    );

    // Convert to tensors
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels.map(l => [l]));

    // Split data
    const splitIdx = Math.floor(features.length * 0.8);
    const trainXs = xs.slice([0, 0], [splitIdx, -1]);
    const trainYs = ys.slice([0, 0], [splitIdx, -1]);
    const testXs = xs.slice([splitIdx, 0], [-1, -1]);
    const testYs = ys.slice([splitIdx, 0], [-1, -1]);

    return {
      trainXs,
      trainYs,
      testXs,
      testYs
    };
  }

  private oneHotEncode(value: string, categories: string[]): number[] {
    return categories.map(cat => value === cat ? 1 : 0);
  }

  async train() {
    const data = await this.prepareData();
    
    // Train model
    await this.model.fit(data.trainXs, data.trainYs, {
      epochs: 100,
      batchSize: 32,
      validationData: [data.testXs, data.testYs],
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
        }
      }
    });

    // Evaluate model
    const evalResult = this.model.evaluate(data.testXs, data.testYs);
    const metrics = {
      loss: Array.isArray(evalResult) ? evalResult[0].dataSync()[0] : evalResult.dataSync()[0],
      mae: Array.isArray(evalResult) ? evalResult[1].dataSync()[0] : 0
    };

    return metrics;
  }

  async predict(features: number[][]) {
    const xs = tf.tensor2d(features);
    const predictions = await this.model.predict(xs) as tf.Tensor;
    return predictions.dataSync();
  }

  async save() {
    await this.model.save('localstorage://human-ai-model');
  }

  async load() {
    this.model = await tf.loadLayersModel('localstorage://human-ai-model');
  }
}