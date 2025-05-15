import os
from typing import Dict, Any
import sharp
from pathlib import Path

class CrossPlatformAdapter:
    def __init__(self):
        self.platform_specs = {
            'tiktok': {
                'video': {'max_duration': 60, 'aspect_ratio': '9:16', 'max_size': 287108864},
                'image': {'width': 1080, 'height': 1920, 'max_size': 20971520}
            },
            'youtube': {
                'video': {'max_duration': 43200, 'aspect_ratio': '16:9', 'max_size': 137438953472},
                'image': {'width': 1920, 'height': 1080, 'max_size': 20971520}
            },
            'instagram': {
                'video': {'max_duration': 90, 'aspect_ratio': '1:1', 'max_size': 104857600},
                'image': {'width': 1080, 'height': 1080, 'max_size': 20971520}
            }
        }
        
    async def adapt_content(self, content: Dict[str, Any], target_platform: str) -> Dict[str, Any]:
        """Adapt content for specific platform requirements."""
        platform_specs = self.platform_specs[target_platform]
        
        adapted_content = {
            'original_id': content['id'],
            'platform': target_platform,
            'media': await self._adapt_media(content['media'], platform_specs),
            'text': await self._adapt_text(content['text'], target_platform),
            'metadata': await self._generate_metadata(content, target_platform)
        }
        
        return adapted_content
    
    async def _adapt_media(self, media: Dict[str, Any], specs: Dict[str, Any]) -> Dict[str, Any]:
        """Adapt media files to platform specifications."""
        if media['type'] == 'video':
            return await self._adapt_video(media, specs['video'])
        elif media['type'] == 'image':
            return await self._adapt_image(media, specs['image'])
        else:
            raise ValueError(f"Unsupported media type: {media['type']}")
    
    async def _adapt_video(self, video: Dict[str, Any], specs: Dict[str, Any]) -> Dict[str, Any]:
        """Adapt video to platform specifications."""
        # In production, this would use a video processing service
        return {
            'url': video['url'],
            'duration': min(video['duration'], specs['max_duration']),
            'aspect_ratio': specs['aspect_ratio'],
            'size': min(video['size'], specs['max_size'])
        }
    
    async def _adapt_image(self, image: Dict[str, Any], specs: Dict[str, Any]) -> Dict[str, Any]:
        """Adapt image to platform specifications."""
        try:
            # Resize and format image according to platform specs
            processed_image = await sharp(image['path'])
                .resize(specs['width'], specs['height'], {
                    fit: 'cover',
                    position: 'center'
                })
                .toFormat('jpeg', { quality: 85 })
                .toBuffer()
            
            return {
                'data': processed_image,
                'width': specs['width'],
                'height': specs['height'],
                'format': 'jpeg'
            }
        except Exception as e:
            raise Exception(f"Error processing image: {str(e)}")
    
    async def _adapt_text(self, text: str, platform: str) -> str:
        """Adapt text content for platform-specific requirements."""
        max_lengths = {
            'tiktok': 2200,
            'youtube': 5000,
            'instagram': 2200
        }
        
        # Truncate text to platform limits
        adapted_text = text[:max_lengths[platform]]
        
        # Add platform-specific formatting
        if platform == 'tiktok':
            adapted_text = self._format_for_tiktok(adapted_text)
        elif platform == 'youtube':
            adapted_text = self._format_for_youtube(adapted_text)
        elif platform == 'instagram':
            adapted_text = self._format_for_instagram(adapted_text)
            
        return adapted_text
    
    def _format_for_tiktok(self, text: str) -> str:
        """Format text for TikTok."""
        # Add trending hashtags
        hashtags = "\n\n#fyp #viral #trending"
        return f"{text}{hashtags}"
    
    def _format_for_youtube(self, text: str) -> str:
        """Format text for YouTube."""
        # Add timestamps and description structure
        description = f"""
{text}

TIMESTAMPS:
0:00 - Intro
1:00 - Main Content
4:30 - Summary

FOLLOW ME:
Instagram: @username
Twitter: @username
"""
        return description
    
    def _format_for_instagram(self, text: str) -> str:
        """Format text for Instagram."""
        # Add line breaks and hashtags
        formatted_text = text.replace('. ', '.\n\n')
        hashtags = "\n.\n.\n.\n#instagram #content #viral"
        return f"{formatted_text}{hashtags}"
    
    async def _generate_metadata(self, content: Dict[str, Any], platform: str) -> Dict[str, Any]:
        """Generate platform-specific metadata."""
        return {
            'title': await self._optimize_title(content['title'], platform),
            'tags': await self._optimize_tags(content['tags'], platform),
            'category': self._map_category(content['category'], platform),
            'language': content['language'],
            'visibility': 'public'
        }
    
    async def _optimize_title(self, title: str, platform: str) -> str:
        """Optimize title for specific platform."""
        max_lengths = {
            'tiktok': 100,
            'youtube': 100,
            'instagram': 125
        }
        
        return title[:max_lengths[platform]]
    
    async def _optimize_tags(self, tags: List[str], platform: str) -> List[str]:
        """Optimize tags for specific platform."""
        max_tags = {
            'tiktok': 8,
            'youtube': 15,
            'instagram': 30
        }
        
        # Filter and limit tags
        platform_tags = tags[:max_tags[platform]]
        
        # Add platform-specific trending tags
        trending_tags = {
            'tiktok': ['fyp', 'viral', 'trending'],
            'youtube': ['trending', 'viral', platform],
            'instagram': ['instagram', 'content', 'viral']
        }
        
        return platform_tags + trending_tags[platform]
    
    def _map_category(self, category: str, platform: str) -> str:
        """Map content category to platform-specific categories."""
        category_mappings = {
            'tiktok': {
                'education': 'Learning',
                'entertainment': 'Entertainment',
                'gaming': 'Gaming'
            },
            'youtube': {
                'education': 'Education',
                'entertainment': 'Entertainment',
                'gaming': 'Gaming'
            },
            'instagram': {
                'education': 'Education',
                'entertainment': 'Entertainment',
                'gaming': 'Gaming'
            }
        }
        
        return category_mappings[platform].get(category.lower(), 'Other')

# Create singleton instance
adapter = CrossPlatformAdapter()