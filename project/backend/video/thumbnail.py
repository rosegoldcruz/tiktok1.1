from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import os

def generate_thumbnail(text, output="content/assets/thumb.jpg"):
    """
    Generate a thumbnail with text overlay.
    
    Args:
        text (str): The text to display on the thumbnail
        output (str): The output path for the thumbnail
        
    Returns:
        str: The path to the generated thumbnail
    """
    # Create a new image with a dark background
    img = Image.new("RGB", (1280, 720), (30, 30, 30))
    draw = ImageDraw.Draw(img)
    
    # Try to load a font, fall back to default if not available
    try:
        font_path = os.path.join(os.path.dirname(__file__), "fonts", "Roboto-Bold.ttf")
        font = ImageFont.truetype(font_path, 60)
    except Exception:
        font = ImageFont.load_default()
    
    # Calculate text size and position
    text_width = draw.textlength(text[:50], font=font)
    text_x = (1280 - text_width) // 2
    text_y = 300
    
    # Add text shadow for better visibility
    shadow_offset = 3
    draw.text((text_x + shadow_offset, text_y + shadow_offset), text[:50], 
              fill=(0, 0, 0), font=font)
    
    # Draw main text
    draw.text((text_x, text_y), text[:50], fill=(255, 255, 255), font=font)
    
    # Add a subtle gradient overlay
    gradient = Image.new("RGBA", (1280, 720), (0, 0, 0, 0))
    gradient_draw = ImageDraw.Draw(gradient)
    for y in range(720):
        alpha = int(255 * (y / 720) * 0.5)  # 50% max opacity
        gradient_draw.line([(0, y), (1280, y)], fill=(0, 0, 0, alpha))
    
    img = Image.alpha_composite(img.convert("RGBA"), gradient)
    img = img.convert("RGB")
    
    # Ensure output directory exists
    Path(output).parent.mkdir(parents=True, exist_ok=True)
    
    # Save the image
    img.save(output, quality=95, optimize=True)
    return output