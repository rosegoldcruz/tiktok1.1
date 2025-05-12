import { Request, Response } from 'express';
import path from 'path';
import { generateVideo } from '../../services/VideoGenerator';
import runTTSAgent from '../../agents/TTSAgent';
import runSceneComposerAgent from '../../agents/SceneComposerAgent';
import runMusicOverlayAgent from '../../agents/MusicOverlayAgent';
import runCaptionAgent from '../../agents/CaptionAgent';
import logger from '../../services/logger';

export async function post(req: Request, res: Response) {
  const { script, trendCategory, filename } = req.body;

  if (!script || !trendCategory || !filename) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const base = path.join(process.cwd(), 'outputs', 'rendered-videos', trendCategory);
    const audioPath = path.join(base, `${filename}.mp3`);
    const imagePath = path.join(process.cwd(), 'public', 'placeholder.jpg');
    const videoPath = path.join(base, `${filename}.mp4`);
    const srtPath = videoPath.replace('.mp4', '.srt');

    // Chain media agents
    await runTTSAgent(script, audioPath);
    await runSceneComposerAgent(imagePath, audioPath, videoPath);
    await runMusicOverlayAgent(videoPath);
    await runCaptionAgent(videoPath, srtPath);

    return res.status(200).json({ 
      message: 'Video generated successfully',
      path: videoPath
    });
  } catch (err) {
    logger.error('[VideoGenError]', err);
    return res.status(500).json({ error: 'Video generation failed' });
  }
}