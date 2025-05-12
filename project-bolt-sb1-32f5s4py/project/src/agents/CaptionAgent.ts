import { exec } from 'child_process';
import util from 'util';
import logger from '../services/logger';

const execPromise = util.promisify(exec);

export default async function runCaptionAgent(videoPath: string, srtPath: string): Promise<void> {
  try {
    const outPath = videoPath.replace('.mp4', '_captioned.mp4');
    const cmd = `ffmpeg -i "${videoPath}" -vf subtitles="${srtPath}" -c:a copy "${outPath}"`;
    await execPromise(cmd);
    logger.info(`[CaptionAgent] Captions added: ${outPath}`);
  } catch (error) {
    logger.error('[CaptionAgent] Failed to add captions:', error);
    throw error;
  }
}