import { exec } from 'child_process';
import util from 'util';
import logger from '../services/logger';

const execPromise = util.promisify(exec);

export default async function runSceneComposerAgent(imagePath: string, audioPath: string, outPath: string): Promise<void> {
  try {
    const cmd = `ffmpeg -loop 1 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -shortest -y "${outPath}"`;
    await execPromise(cmd);
    logger.info(`[SceneComposerAgent] Video created: ${outPath}`);
  } catch (error) {
    logger.error('[SceneComposerAgent] Failed to compose scene:', error);
    throw error;
  }
}