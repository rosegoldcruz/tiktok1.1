from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import torch
import numpy as np
from pathlib import Path

# Import custom modules
from .model_trainer import model_trainer
from .voice_engine import voice_engine

app = FastAPI()

class ContentRequest(BaseModel):
    title: str
    style: str
    target_metrics: Dict[str, float]

class VoiceRequest(BaseModel):
    text: str
    voice_id: str
    optimization_metrics: Dict[str, float]

@app.post("/generate")
async def generate_content(request: ContentRequest) -> Dict[str, Any]:
    """Generate content using fine-tuned model."""
    try:
        # Generate content
        content = await model_trainer.generate_content(
            prompt=request.title,
            style=request.style,
            target_metrics=request.target_metrics
        )
        
        return {
            "success": True,
            "content": content
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/synthesize")
async def synthesize_voice(request: VoiceRequest) -> Dict[str, Any]:
    """Synthesize voice using cloned characteristics."""
    try:
        # Load voice characteristics
        voice_path = f"voices/{request.voice_id}.pth"
        if not Path(voice_path).exists():
            raise HTTPException(status_code=404, detail="Voice not found")
            
        characteristics = torch.load(voice_path)
        
        # Generate speech
        audio = await voice_engine.clone_voice(
            characteristics=characteristics,
            text=request.text
        )
        
        # Optimize voice if metrics provided
        if request.optimization_metrics:
            audio = await voice_engine.optimize_voice(
                audio=audio,
                target_metrics=request.optimization_metrics
            )
        
        return {
            "success": True,
            "audio": audio.tolist()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model/status")
async def get_model_status() -> Dict[str, Any]:
    """Get current model status and metrics."""
    try:
        # Get model evaluation metrics
        metrics = await model_trainer.evaluate_model(
            test_data=await load_test_data()
        )
        
        return {
            "success": True,
            "metrics": metrics,
            "last_trained": get_last_training_time(),
            "total_parameters": count_model_parameters()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/voice/analyze")
async def analyze_voice(audio_file: bytes) -> Dict[str, Any]:
    """Analyze voice characteristics from audio."""
    try:
        # Save temporary audio file
        temp_path = Path("/tmp/temp_audio.wav")
        temp_path.write_bytes(audio_file)
        
        # Extract characteristics
        characteristics = await voice_engine.extract_voice_characteristics(
            audio_path=str(temp_path)
        )
        
        # Clean up
        temp_path.unlink()
        
        return {
            "success": True,
            "characteristics": characteristics
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def load_test_data() -> List[Dict[str, Any]]:
    """Load test data for model evaluation."""
    # In production, this would load from your test dataset
    return [
        {
            "text": "Sample test content 1",
            "engagement": 0.85,
            "retention": 0.75
        },
        {
            "text": "Sample test content 2",
            "engagement": 0.92,
            "retention": 0.88
        }
    ]

def get_last_training_time() -> str:
    """Get timestamp of last model training."""
    model_path = Path("./models/content_generator/pytorch_model.bin")
    if model_path.exists():
        return model_path.stat().st_mtime
    return "Never"

def count_model_parameters() -> int:
    """Count total number of model parameters."""
    total_params = 0
    for p in model_trainer.model.parameters():
        if p.requires_grad:
            total_params += p.numel()
    return total_params