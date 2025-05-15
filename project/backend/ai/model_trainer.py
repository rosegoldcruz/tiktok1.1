import os
import json
import numpy as np
from typing import List, Dict, Any
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments
from datasets import Dataset
from pathlib import Path

class ModelTrainer:
    def __init__(self):
        self.base_model = "mistralai/Mistral-7B-v0.1"
        self.tokenizer = AutoTokenizer.from_pretrained(self.base_model)
        self.model = AutoModelForCausalLM.from_pretrained(self.base_model)
        
        self.training_args = TrainingArguments(
            output_dir="./results",
            num_train_epochs=3,
            per_device_train_batch_size=4,
            gradient_accumulation_steps=4,
            learning_rate=2e-5,
            warmup_steps=100,
            logging_steps=10,
            save_steps=100,
            evaluation_strategy="steps",
            eval_steps=100,
            load_best_model_at_end=True
        )
        
    async def prepare_dataset(self, content_data: List[Dict[str, Any]]) -> Dataset:
        """Prepare training dataset from successful content."""
        processed_data = []
        
        for content in content_data:
            # Extract performance metrics
            engagement_score = self._calculate_engagement_score(content)
            retention_score = self._calculate_retention_score(content)
            
            # Only include high-performing content
            if engagement_score > 0.7 and retention_score > 0.6:
                processed_data.append({
                    'text': content['script'],
                    'title': content['title'],
                    'hook': content['hook'],
                    'engagement_score': engagement_score,
                    'retention_score': retention_score
                })
        
        return Dataset.from_dict({
            'text': [d['text'] for d in processed_data],
            'title': [d['title'] for d in processed_data],
            'hook': [d['hook'] for d in processed_data],
            'metrics': [{'engagement': d['engagement_score'], 'retention': d['retention_score']} 
                       for d in processed_data]
        })
    
    def _calculate_engagement_score(self, content: Dict[str, Any]) -> float:
        """Calculate normalized engagement score."""
        likes = content.get('likes', 0)
        comments = content.get('comments', 0)
        shares = content.get('shares', 0)
        views = max(content.get('views', 1), 1)  # Avoid division by zero
        
        engagement = (likes + comments * 2 + shares * 3) / views
        return min(engagement / 0.1, 1.0)  # Normalize to 0-1 range
    
    def _calculate_retention_score(self, content: Dict[str, Any]) -> float:
        """Calculate normalized retention score."""
        watch_time = content.get('average_watch_time', 0)
        duration = max(content.get('duration', 1), 1)  # Avoid division by zero
        
        retention = watch_time / duration
        return min(retention, 1.0)
    
    async def fine_tune_model(self, dataset: Dataset) -> None:
        """Fine-tune the model on successful content."""
        try:
            # Tokenize dataset
            tokenized_dataset = dataset.map(
                lambda x: self.tokenizer(
                    x['text'],
                    truncation=True,
                    padding='max_length',
                    max_length=512
                ),
                batched=True
            )
            
            # Train model
            trainer = Trainer(
                model=self.model,
                args=self.training_args,
                train_dataset=tokenized_dataset,
                tokenizer=self.tokenizer
            )
            
            trainer.train()
            
            # Save fine-tuned model
            trainer.save_model("./models/content_generator")
            self.tokenizer.save_pretrained("./models/content_generator")
            
        except Exception as e:
            raise Exception(f"Error during model fine-tuning: {str(e)}")
    
    async def evaluate_model(self, test_data: List[Dict[str, Any]]) -> Dict[str, float]:
        """Evaluate model performance on test data."""
        results = {
            'perplexity': [],
            'engagement_correlation': [],
            'retention_correlation': []
        }
        
        for content in test_data:
            # Calculate perplexity
            inputs = self.tokenizer(content['text'], return_tensors="pt")
            outputs = self.model(**inputs)
            perplexity = torch.exp(outputs.loss).item()
            results['perplexity'].append(perplexity)
            
            # Generate content and compare metrics
            generated = await self.generate_content(content['title'])
            engagement_pred = self._predict_engagement(generated)
            retention_pred = self._predict_retention(generated)
            
            results['engagement_correlation'].append(
                abs(engagement_pred - self._calculate_engagement_score(content))
            )
            results['retention_correlation'].append(
                abs(retention_pred - self._calculate_retention_score(content))
            )
        
        return {
            'avg_perplexity': np.mean(results['perplexity']),
            'engagement_correlation': 1 - np.mean(results['engagement_correlation']),
            'retention_correlation': 1 - np.mean(results['retention_correlation'])
        }
    
    async def generate_content(self, prompt: str) -> Dict[str, Any]:
        """Generate content using fine-tuned model."""
        try:
            inputs = self.tokenizer(prompt, return_tensors="pt")
            outputs = self.model.generate(
                **inputs,
                max_length=512,
                num_return_sequences=1,
                temperature=0.7,
                top_p=0.9,
                do_sample=True
            )
            
            generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            return {
                'text': generated_text,
                'predicted_engagement': self._predict_engagement(generated_text),
                'predicted_retention': self._predict_retention(generated_text)
            }
            
        except Exception as e:
            raise Exception(f"Error generating content: {str(e)}")
    
    def _predict_engagement(self, text: str) -> float:
        """Predict engagement score for generated content."""
        # Use ML model to predict engagement
        features = self._extract_content_features(text)
        return self.engagement_predictor.predict(features)[0]
    
    def _predict_retention(self, text: str) -> float:
        """Predict retention score for generated content."""
        # Use ML model to predict retention
        features = self._extract_content_features(text)
        return self.retention_predictor.predict(features)[0]
    
    def _extract_content_features(self, text: str) -> List[float]:
        """Extract features from content for prediction."""
        return [
            len(text),  # Content length
            len(text.split()),  # Word count
            sum(1 for c in text if c.isupper()) / len(text),  # Capitalization ratio
            len(text.split('!')) - 1,  # Exclamation count
            len(text.split('?')) - 1,  # Question count
            # Add more sophisticated features as needed
        ]

# Create singleton instance
model_trainer = ModelTrainer()