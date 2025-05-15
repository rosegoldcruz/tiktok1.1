import os
import json
from typing import List, Dict, Any
from openai import OpenAI
from pathlib import Path

class ContentMultiplier:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.performance_thresholds = {
            'views': 10000,
            'engagement_rate': 0.08,
            'completion_rate': 0.60
        }
        
    async def detect_winners(self, content_metrics: Dict[str, Any]) -> bool:
        """Determine if content meets performance thresholds."""
        return (
            content_metrics['views'] >= self.performance_thresholds['views'] and
            content_metrics['engagement_rate'] >= self.performance_thresholds['engagement_rate'] and
            content_metrics['completion_rate'] >= self.performance_thresholds['completion_rate']
        )
    
    async def generate_derivatives(self, content: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate derivative content pieces from winning content."""
        derivatives = []
        
        # Define derivative types
        derivative_types = [
            {'type': 'summary', 'format': 'short'},
            {'type': 'deep_dive', 'format': 'long'},
            {'type': 'tutorial', 'format': 'step_by_step'},
            {'type': 'reaction', 'format': 'commentary'},
            {'type': 'highlights', 'format': 'clips'}
        ]
        
        for derivative in derivative_types:
            # Generate derivative content using GPT-4
            prompt = self._create_derivative_prompt(content, derivative['type'])
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert content creator."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            derivative_content = {
                'original_id': content['id'],
                'type': derivative['type'],
                'format': derivative['format'],
                'content': response.choices[0].message.content,
                'platform_adaptations': await self._create_platform_adaptations(response.choices[0].message.content)
            }
            
            derivatives.append(derivative_content)
        
        return derivatives
    
    async def _create_platform_adaptations(self, content: str) -> Dict[str, Any]:
        """Create platform-specific adaptations of the content."""
        platforms = {
            'tiktok': {'max_duration': 60, 'format': 'vertical'},
            'youtube': {'max_duration': 600, 'format': 'landscape'},
            'instagram': {'max_duration': 90, 'format': 'square'}
        }
        
        adaptations = {}
        
        for platform, constraints in platforms.items():
            adaptation = await self._adapt_for_platform(content, constraints)
            adaptations[platform] = adaptation
            
        return adaptations
    
    async def _adapt_for_platform(self, content: str, constraints: Dict[str, Any]) -> Dict[str, Any]:
        """Adapt content for specific platform requirements."""
        prompt = f"""
        Adapt this content for a platform with the following constraints:
        - Maximum duration: {constraints['max_duration']} seconds
        - Format: {constraints['format']}
        
        Content: {content}
        """
        
        response = await self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert in platform-specific content adaptation."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return {
            'adapted_content': response.choices[0].message.content,
            'duration': constraints['max_duration'],
            'format': constraints['format']
        }
    
    def _create_derivative_prompt(self, content: Dict[str, Any], derivative_type: str) -> str:
        """Create prompts for different types of derivative content."""
        prompts = {
            'summary': f"Create a concise summary of the main points from this content: {content['text']}",
            'deep_dive': f"Create an in-depth analysis expanding on this topic: {content['text']}",
            'tutorial': f"Transform this content into a step-by-step tutorial: {content['text']}",
            'reaction': f"Create a reaction/commentary piece about this content: {content['text']}",
            'highlights': f"Extract the key highlights and memorable moments from: {content['text']}"
        }
        
        return prompts[derivative_type]
    
    async def analyze_performance(self, content_id: str) -> Dict[str, Any]:
        """Analyze content performance metrics."""
        # In production, this would fetch real metrics from your analytics system
        return {
            'views': 15000,
            'engagement_rate': 0.09,
            'completion_rate': 0.75,
            'shares': 500,
            'comments': 200
        }

# Create singleton instance
multiplier = ContentMultiplier()