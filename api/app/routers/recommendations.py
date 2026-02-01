from fastapi import APIRouter, HTTPException, Query, Depends
from app.models import Recommendation
from app.sensor_simulator import SensorSimulator, get_sensor_simulator
from datetime import datetime
from typing import List, Optional
import uuid

router = APIRouter()

# In-memory recommendations storage (in production, use a database)
recommendations_db: List[Recommendation] = []

def generate_recommendations(sensor_simulator: SensorSimulator) -> List[Recommendation]:
    """Generate recommendations based on current sensor readings"""
    state = sensor_simulator.get_current_state()
    new_recommendations = []
    
    # Power recommendations
    if state["power"]["battery_charge"] < 60.0:
        new_recommendations.append(Recommendation(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            priority="high",
            category="power",
            title="Increase Solar Power Generation",
            description=f"Battery charge at {state['power']['battery_charge']:.2f}%. Consider deploying additional solar arrays or reducing non-essential power consumption.",
            action_required=True
        ))
    
    # Life support recommendations
    if state["life_support"]["water_recovery_rate"] < 97.0:
        new_recommendations.append(Recommendation(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            priority="medium",
            category="life_support",
            title="Optimize Water Recovery System",
            description=f"Water recovery rate at {state['life_support']['water_recovery_rate']:.2f}%. Review filtration systems and check for leaks.",
            action_required=False
        ))
    
    # Agriculture recommendations
    if state["agriculture"]["crop_health"] < 80.0:
        new_recommendations.append(Recommendation(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            priority="medium",
            category="agriculture",
            title="Improve Crop Health",
            description=f"Crop health at {state['agriculture']['crop_health']:.2f}%. Check nutrient levels, lighting, and irrigation systems.",
            action_required=False
        ))
    
    if state["agriculture"]["nutrient_levels"] < 75.0:
        new_recommendations.append(Recommendation(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            priority="high",
            category="agriculture",
            title="Replenish Nutrient Solution",
            description=f"Nutrient levels at {state['agriculture']['nutrient_levels']:.2f}%. Add nutrients to maintain optimal crop growth.",
            action_required=True
        ))
    
    # Structural recommendations
    if state["structural"]["rotation_rate"] < 1.85 or state["structural"]["rotation_rate"] > 1.95:
        new_recommendations.append(Recommendation(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            priority="high",
            category="structural",
            title="Adjust Rotation Rate",
            description=f"Rotation rate at {state['structural']['rotation_rate']:.2f} RPM. Adjust to maintain 1.9 RPM for optimal gravity.",
            action_required=True
        ))
    
    # Radiation recommendations
    if state["radiation"]["shielding_effectiveness"] < 93.0:
        new_recommendations.append(Recommendation(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            priority="high",
            category="radiation",
            title="Inspect Radiation Shielding",
            description=f"Shielding effectiveness at {state['radiation']['shielding_effectiveness']:.2f}%. Inspect and repair shielding layers.",
            action_required=True
        ))
    
    return new_recommendations

@router.get("/recommendations")
async def get_recommendations(
    priority: Optional[str] = Query(None, description="Filter by priority: low, medium, high"),
    category: Optional[str] = Query(None, description="Filter by category"),
    action_required: Optional[bool] = Query(None, description="Filter by action required"),
    limit: int = Query(50, ge=1, le=1000, description="Maximum number of recommendations to return")
):
    """
    Get all recommendations, optionally filtered by priority, category, or action required
    """
    filtered_recs = recommendations_db.copy()
    
    if priority:
        filtered_recs = [r for r in filtered_recs if r.priority == priority]
    
    if category:
        filtered_recs = [r for r in filtered_recs if r.category == category]
    
    if action_required is not None:
        filtered_recs = [r for r in filtered_recs if r.action_required == action_required]
    
    # Sort by priority (high > medium > low) and timestamp
    priority_order = {"high": 3, "medium": 2, "low": 1}
    filtered_recs.sort(key=lambda x: (priority_order.get(x.priority, 0), x.timestamp), reverse=True)
    filtered_recs = filtered_recs[:limit]
    
    return {
        "count": len(filtered_recs),
        "recommendations": [rec.dict() for rec in filtered_recs]
    }

@router.get("/recommendations/{recommendation_id}")
async def get_recommendation(recommendation_id: str):
    """Get a specific recommendation by ID"""
    recommendation = next((r for r in recommendations_db if r.id == recommendation_id), None)
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    return recommendation.dict()

@router.post("/recommendations/generate")
async def generate_recommendations_endpoint(sensor_simulator: SensorSimulator = Depends(get_sensor_simulator)):
    """Generate new recommendations based on current sensor state (internal use)"""
    new_recs = generate_recommendations(sensor_simulator)
    if new_recs:
        recommendations_db.extend(new_recs)
    return {"generated": len(new_recs) if new_recs else 0}
