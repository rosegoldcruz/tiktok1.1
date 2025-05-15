import os
import requests
from dotenv import load_dotenv

# Load .env
load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
VIDEO_PATH = "sample_video.mp4"  # Replace this later with real videos

def send_video(video_path):
    if not TELEGRAM_TOKEN or not CHAT_ID:
        raise ValueError("Missing Telegram credentials in .env")

    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendVideo"
    with open(video_path, 'rb') as video:
        files = {'video': video}
        data = {'chat_id': CHAT_ID, 'caption': '🚀 AI Generated Video'}
        response = requests.post(url, files=files, data=data)

    if response.ok:
        print("✅ Video sent successfully!")
    else:
        print("❌ Failed to send:", response.text)

if __name__ == "__main__":
    send_video(VIDEO_PATH)
