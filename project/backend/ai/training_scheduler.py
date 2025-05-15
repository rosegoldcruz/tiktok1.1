import os
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List
import json
from pathlib import Path

class TrainingScheduler:
    def __init__(self):
        self.performance_threshold = 0.8
        self.min_samples = 100
        self.max_training_frequency = timedelta(days=7)
        self.last_training_time = None
        
    async def check_training_needed(self) -> bool:
        """Check if model retraining is needed."""
        try:
            # Get recent content performance
            recent_content = await self._get_recent_content()
            
            # Check if enough high-performing content
            high_performing = self._filter_high_performing(recent_content)
            
            if len(high_performing) < self.min_samples:
                return False
                
            # Check if enough time has passed since last training
            if self.last_training_time:
                time_since_training = datetime.now() - self.last_training_time
                if time_since_training < self.max_training_frequency:
                    return False
            
            # Calculate performance improvement potential
            improvement_potential = self._calculate_improvement_potential(high_performing)
            
            return improvement_potential > 0.1  # 10% potential improvement threshold
            
        except Exception as e:
            print(f"Error checking training need: {str(e)}")
            return False
    
    async def _get_recent_content(self) -> List[Dict[str, Any]]:
        """Get recent content performance data."""
        # In production, this would query your database
        return [
            {
                "id": "content1",
                "performance": {
                    "engagement": 0.85,
                    "retention": 0.75,
                    "conversion": 0.12
                }
            },
            {
                "id": "content2",
                "performance": {
                    "engagement": 0.92,
                    "retention": 0.88,
                    "conversion": 0.15
                }
            }
        ]
    
    def _filter_high_performing(self, content: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filter high-performing content for training."""
        return [
            c for c in content
            if (c['performance']['engagement'] > self.performance_threshold and
                c['performance']['retention'] > self.performance_threshold)
        ]
    
    def _calculate_improvement_potential(self, content: List[Dict[str, Any]]) -> float:
        """Calculate potential model improvement from new training data."""
        if not content:
            return 0.0
            
        # Calculate average performance metrics
        avg_engagement = sum(c['performance']['engagement'] for c in content) / len(content)
        avg_retention = sum(c['performance']['retention'] for c in content) / len(content)
        
        # Compare with current model performance
        current_performance = self._get_current_model_performance()
        
        engagement_improvement = max(0, avg_engagement - current_performance['engagement'])
        retention_improvement = max(0, avg_retention - current_performance['retention'])
        
        return (engagement_improvement + retention_improvement) / 2
    
    def _get_current_model_performance(self) -> Dict[str, float]:
        """Get current model performance metrics."""
        # In production, this would load actual model metrics
        return {
            'engagement': 0.75,
            'retention': 0.70
        }
    
    async def schedule_training(self) -> None:
        """Schedule and manage model training jobs."""
        while True:
            try:
                if await self.check_training_needed():
                    print("Starting model retraining...")
                    
                    # Get training data
                    training_data = await self._prepare_training_data()
                    
                    # Train model
                    await self._train_model(training_data)
                    
                    # Update training timestamp
                    self.last_training_time = datetime.now()
                    
                    print("Model retraining completed successfully")
                
                # Wait before next check
                await asyncio.sleep(3600)  # Check every hour
                
            except Exception as e:
                print(f"Error in training scheduler: {str(e)}")
                await asyncio.sleep(300)  # Wait 5 minutes on error
    
    async def _prepare_training_data(self) -> Dict[str, Any]:
        """Prepare data for model training."""
        try:
            # Get high-performing content
            content = await self._get_recent_content()
            high_performing = self._filter_high_performing(content)
            
            # Extract training features
            training_data = {
                'content': [],
                'labels': []
            }
            
            for item in high_performing:
                # Extract content features
                features = self._extract_features(item)
                training_data['content'].append(features)
                
                # Create labels from performance metrics
                labels = self._create_labels(item['performance'])
                training_data['labels'].append(labels)
            
            return training_data
            
        except Exception as e:
            raise Exception(f"Error preparing training data: {str(e)}")
    
    def _extract_features(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Extract training features from content."""
        return {
            'text_length': len(content.get('text', '')),
            'has_hook': bool(content.get('hook')),
            'hashtag_count': len(content.get('hashtags', [])),
            'media_type': content.get('media_type'),
            'formatting_score': self._calculate_formatting_score(content)
        }
    
    def _create_labels(self, performance: Dict[str, float]) -> Dict[str, float]:
        """Create training labels from performance metrics."""
        return {
            'engagement_score': performance['engagement'],
            'retention_score': performance['retention'],
            'conversion_score': performance.get('conversion', 0.0)
        }
    
    def _calculate_formatting_score(self, content: Dict[str, Any]) -> float:
        """Calculate content formatting quality score."""
        score = 0.0
        text = content.get('text', '')
        
        # Check for proper paragraphs
        if '\n\n' in text:
            score += 0.2
            
        # Check for headers/sections
        if any(line.startswith('#') for line in text.split('\n')):
            score += 0.2
            
        # Check for lists
        if any(line.startswith(('- ', '* ', '1. ')) for line in text.split('\n')):
            score += 0.2
            
        # Check for emphasis (bold/italic)
        if any(marker in text for marker in ['**', '*', '__', '_']):
            score += 0.2
            
        # Check for links
        if '[' in text and '](' in text:
            score += 0.2
            
        return score
    
    async def _train_model(self, training_data: Dict[str, Any]) -> None:
        """Execute model training."""
        try:
            # Import model trainer
            from .model_trainer import model_trainer
            
            # Prepare dataset
            dataset = await model_trainer.prepare_dataset(training_data['content'])
            
            # Fine-tune model
            await model_trainer.fine_tune_model(dataset)
            
            # Evaluate results
            evaluation = await model_trainer.evaluate_model(training_data['content'][:100])
            
            # Log results
            self._log_training_results(evaluation)
            
        except Exception as e:
            raise Exception(f"Error training model: {str(e)}")
    
    def _log_training_results(self, results: Dict[str, Any]) -> None:
        """Log training results and metrics."""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'metrics': results,
            'samples_used': len(results.get('samples', [])),
            'training_duration': results.get('duration')
        }
        
        # In production, this would write to your logging system
        print(f"Training results: {json.dumps(log_entry, indent=2)}")

# Create singleton instance
scheduler = TrainingScheduler()

# Start scheduler
if __name__ == "__main__":
    asyncio.run(scheduler.schedule_training())