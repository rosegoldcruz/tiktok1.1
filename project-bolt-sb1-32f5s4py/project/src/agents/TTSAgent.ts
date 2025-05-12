import fs from 'fs';
import googleTTS from 'google-tts-api';
import logger from '../services/logger';

export default async function runTTSAgent(text: string, outputPath: string): Promise<void> {
  try {
    const url = googleTTS.getAudioUrl(text, { lang: 'en', slow: false });
    const buffer = await fetch(url).then(res => res.arrayBuffer());
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    logger.info(`[TTSAgent] Audio saved to ${outputPath}`);
  } catch (error) {
    logger.error('[TTSAgent] Failed to generate audio:', error);
    throw error;
  }
}