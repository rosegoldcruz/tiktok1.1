import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import googleTTS from 'google-tts-api';

const execPromise = util.promisify(exec);
const OUTPUT_DIR = path.join(process.cwd(), 'outputs', 'rendered-videos');

interface VideoPayload {
  script: string;
  trendCategory: string;
  filename: string;
}

/**
 * Fully-automated generation of .mp4 videos from script text
 * Pipeline supports:
 *  - Text-to-speech with Google TTS
 *  - Static image background
 *  - FFmpeg video composition
 *  - Agent chaining hooks (output sharing)
 *  - Output saved to categorized folder for manual editing or upload
 */
export async function generateVideo({ script, trendCategory, filename }: VideoPayload): Promise<string> {
  const categoryDir = path.join(OUTPUT_DIR, trendCategory);
  if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir, { recursive: true });

  const audioUrl = googleTTS.getAudioUrl(script, { lang: 'en', slow: false });
  const audioPath = path.join(categoryDir, `${filename}.mp3`);
  const imagePath = path.join(__dirname, '../../public/placeholder.jpg');
  const videoPath = path.join(categoryDir, `${filename}.mp4`);

  const audioBuffer = await fetch(audioUrl).then(res => res.arrayBuffer());
  fs.writeFileSync(audioPath, Buffer.from(audioBuffer));

  const cmd = `ffmpeg -loop 1 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -shortest -y "${videoPath}"`;
  await execPromise(cmd);

  return videoPath;
}