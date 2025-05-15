import os
from typing import Dict, Any, List
from datetime import datetime, timedelta
import json
from pathlib import Path

class PerformanceDatabase:
    def __init__(self):
        self.metrics_thresholds = {
            'viral_potential': 0.8,
            'engagement_rate': 0.1,
            'retention_rate': 0.6,
            'conversion_rate': 0.02
        }
        
    async def store_content_performance(self, content_id: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Store content performance metrics."""
        try:
            # Calculate performance scores
            scores = self._calculate_performance_scores(metrics)
            
            # Store in database
            performance_data = {
                'content_id': content_id,
                'metrics': metrics,
                'scores': scores,
                'timestamp': datetime.now().isoformat(),
                'recommendations': await self._generate_recommendations(scores)
            }
            
            # In production, this would use your actual database
            return performance_data
            
        except Exception as e:
            raise Exception(f"Error storing performance data: {str(e)}")
    
    def _calculate_performance_scores(self, metrics: Dict[str, Any]) -> Dict[str, float]:
        """Calculate various performance scores from metrics."""
        return {
            'viral_potential': self._calculate_viral_score(metrics),
            'engagement_quality': self._calculate_engagement_score(metrics),
            'audience_retention': self._calculate_retention_score(metrics),
            'monetization_potential': self._calculate_monetization_score(metrics)
        }
    
    def _calculate_viral_score(self, metrics: Dict[str, Any]) -> float:
        """Calculate viral potential score."""
        shares = metrics.get('shares', 0)
        views = metrics.get('views', 1)  # Avoid division by zero
        growth_rate = metrics.get('growth_rate', 0)
        
        viral_coefficient = (shares / views) * growth_rate
        return min(viral_coefficient, 1.0)
    
    def _calculate_engagement_score(self, metrics: Dict[str, Any]) -> float:
        """Calculate engagement quality score."""
        likes = metrics.get('likes', 0)
        comments = metrics.get('comments', 0)
        shares = metrics.get('shares', 0)
        views = metrics.get('views', 1)  # Avoid division by zero
        
        engagement_rate = (likes + comments * 2 + shares * 3) / views
        return min(engagement_rate / self.metrics_thresholds['engagement_rate'], 1.0)
    
    def _calculate_retention_score(self, metrics: Dict[str, Any]) -> float:
        """Calculate audience retention score."""
        watch_time = metrics.get('average_watch_time', 0)
        duration = metrics.get('duration', 1)  # Avoid division by zero
        
        retention_rate = watch_time / duration
        return min(retention_rate / self.metrics_thresholds['retention_rate'], 1.0)
    
    def _calculate_monetization_score(self, metrics: Dict[str, Any]) -> float:
        """Calculate monetization potential score."""
        revenue = metrics.get('revenue', 0)
        views = metrics.get('views', 1)  # Avoid division by zero
        
        rpm = revenue / (views / 1000)
        industry_avg_rpm = 2.0  # Example industry average RPM
        
        return min(rpm / industry_avg_rpm, 1.0)
    
    async def _generate_recommendations(self, scores: Dict[str, float]) -> List[Dict[str, Any]]:
        """Generate content optimization recommendations."""
        recommendations = []
        
        if scores['viral_potential'] < self.metrics_thresholds['viral_potential']:
            recommendations.append({
                'type': 'viral_optimization',
                'priority': 'high',
                'actions': [
                    'Optimize thumbnail for higher CTR',
                    'Add trending hashtags',
                    'Create shorter, more engaging hooks'
                ]
            })
            
        if scores['engagement_quality'] < self.metrics_thresholds['engagement_rate']:
            recommendations.append({
                'type': 'engagement_optimization',
                'priority': 'medium',
                'actions': [
                    'Add clear call-to-actions',
                    'Include questions to encourage comments',
                    'Create response-prompting content'
                ]
            })
            
        if scores['audience_retention'] < self.metrics_thresholds['retention_rate']:
            recommendations.append({
                'type': 'retention_optimization',
                'priority': 'high',
                'actions': [
                    'Improve pacing and structure',
                    'Add pattern interrupts',
                    'Create stronger hooks'
                ]
            })
            
        return recommendations
    
    async def get_performance_trends(self, content_id: str, timeframe: str = '30d') -> Dict[str, Any]:
        """Get performance trends over time."""
        # In production, this would query your actual database
        return {
            'content_id': content_id,
            'timeframe': timeframe,
            'trends': {
                'views': self._generate_trend_data(),
                'engagement': self._generate_trend_data(),
                'retention': self._generate_trend_data(),
                'revenue': self._generate_trend_data()
            }
        }
    
    def _generate_trend_data(self) -> List[Dict[str, Any]]:
        """Generate mock trend data for demonstration."""
        trend_data = []
        base_value = 1000
        growth_factor = 1.1
        
        for i in range(30):
            date = (datetime.now() - timedelta(days=i)).isoformat()
            value = base_value * (growth_factor ** i)
            
            trend_data.append({
                'date': date,
                'value': value
            })
            
        return trend_data
    
    async def analyze_audience_insights(self, content_id: str) -> Dict[str, Any]:
        """Analyze audience behavior and demographics."""
        return {
            'content_id': content_id,
            'demographics': {
                'age_groups': {
                    '18-24': 0.3,
                    '25-34': 0.4,
                    '35-44': 0.2,
                    '45+': 0.1
                },
                'locations': {
                    'US': 0.4,
                    'UK': 0.2,
                    'CA': 0.15,
                    'Other': 0.25
                },
                'devices': {
                    'mobile': 0.7,
                    'desktop': 0.2,
                    'tablet': 0.1
                }
            },
            'behavior': {
                'peak_viewing_times': [
                    {'hour': 9, 'engagement': 0.8},
                    {'hour': 15, 'engagement': 0.9},
                    {'hour': 20, 'engagement': 1.0}
                ],
                'interaction_patterns': {
                    'likes_ratio': 0.15,
                    'comment_ratio': 0.05,
                    'share_ratio': 0.02
                }
            }
        }

# Create singleton instance
performance_db = PerformanceDatabase()