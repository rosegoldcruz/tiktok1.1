import os
import random
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
USER_ASSETS_FOLDER = "user_assets"

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_caption(topic="saturn portals"):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a viral short video content creator."},
            {"role": "user", "content": f"Write a short engaging caption for a video about: {topic}"}
        ]
    )
    return response.choices[0].message.content.strip()


def get_random_video():
    videos = [
        os.path.join(USER_ASSETS_FOLDER, file)
        for file in os.listdir(USER_ASSETS_FOLDER)
        if file.lower().endswith((".mp4", ".mov", ".mkv"))
    ]
    if not videos:
        raise FileNotFoundError("❌ No videos found in 'user_assets' folder.")
    return random.choice(videos)


def send_to_telegram(video_path, caption):
    print("[*] Sending video to Telegram...")
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendVideo"
    with open(video_path, "rb") as video_file:
        response = requests.post(
            url,
            data={"chat_id": TELEGRAM_CHAT_ID, "caption": caption},
            files={"video": video_file}
        )
    if response.status_code != 200:
        raise Exception(f"❌ Failed to send video: {response.text}")
    print("✅ Video sent successfully!")


def main():
    print("[*] Generating caption...")
    caption = generate_caption()

    print("[*] Selecting video...")
    video_path = get_random_video()

    print(f"[*] Video selected: {os.path.basename(video_path)}")
    print(f"[*] Caption: {caption}")

    send_to_telegram(video_path, caption)


if __name__ == "__main__":
    main()
