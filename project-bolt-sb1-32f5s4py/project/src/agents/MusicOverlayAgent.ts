import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import logger from '../services/logger';

const execPromise = util.promisify(exec);

export default async function runMusicOverlayAgent(videoPath: string): Promise<void> {
  try {
    const bgmPath = path.join(process.cwd(), 'assets', 'bgm.mp3');
    const outPath = videoPath.replace('.mp4', '_bgm.mp4');
    const cmd = `ffmpeg -i "${videoPath}" -i "${bgmPath}" -filter_complex "[0:a][1:a]amix=inputs=2:duration=shortest" -shortest "${outPath}"`;
    await execPromise(cmd);
    logger.info(`[MusicOverlayAgent] Background music added: ${outPath}`);
  } catch (error) {
    logger.error('[MusicOverlayAgent] Failed to add background music:', error);
    throw error;
  }
}