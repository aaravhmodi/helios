"""
Decision Engine API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from app.sensor_simulator import SensorSimulator, get_sensor_simulator
from app.models import SettlementState, update_settlement_state_from_telemetry
from app.decision_engine import DecisionEngine, get_decision_engine
from typing import List

router = APIRouter()

@router.get("/decisions/recommendations")
async def get_recommendations(
    category: str = None,  # "life_support" or "energy_dispatch"
    min_priority: int = 1,
    sensor_simulator: SensorSimulator = Depends(get_sensor_simulator),
    decision_engine: DecisionEngine = Depends(get_decision_engine)
):
    """
    Get ranked recommendations from decision engine
    
    Query params:
        category: Filter by "life_support" or "energy_dispatch"
        min_priority: Minimum priority (1-10) to include
    """
    try:
        # Get current telemetry
        telemetry = sensor_simulator.get_current_state()
        
        # Create/update settlement state
        state = SettlementState()
        state = update_settlement_state_from_telemetry(state, telemetry)
        
        # Generate recommendations
        recommendations = decision_engine.generate_recommendations(state)
        
        # Apply filters
        if category:
            recommendations = [r for r in recommendations if r.category == category]
        
        recommendations = [r for r in recommendations if r.priority >= min_priority]
        
        # Convert to dict format
        recommendations_dict = [
            {
                "id": r.id,
                "priority": r.priority,
                "category": r.category,
                "action": r.action,
                "title": r.title,
                "description": r.description,
                "reasoning": r.reasoning,
                "current_value": r.current_value,
                "threshold_value": r.threshold_value,
                "impact": r.impact,
                "estimated_effect": r.estimated_effect,
                "confidence": r.confidence
            }
            for r in recommendations
        ]
        
        return {
            "status": "success",
            "count": len(recommendations_dict),
            "recommendations": recommendations_dict
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

@router.get("/decisions/recommendations/life-support")
async def get_life_support_recommendations(
    min_priority: int = 1,
    sensor_simulator: SensorSimulator = Depends(get_sensor_simulator),
    decision_engine: DecisionEngine = Depends(get_decision_engine)
):
    """Get life support recommendations only"""
    return await get_recommendations(category="life_support", min_priority=min_priority)

@router.get("/decisions/recommendations/energy-dispatch")
async def get_energy_dispatch_recommendations(
    min_priority: int = 1,
    sensor_simulator: SensorSimulator = Depends(get_sensor_simulator),
    decision_engine: DecisionEngine = Depends(get_decision_engine)
):
    """Get energy dispatch recommendations only"""
    return await get_recommendations(category="energy_dispatch", min_priority=min_priority)

@router.get("/decisions/thresholds")
async def get_thresholds():
    """Get all decision engine thresholds"""
    from app.decision_engine import LIFE_SUPPORT_THRESHOLDS, ENERGY_THRESHOLDS
    
    return {
        "life_support": LIFE_SUPPORT_THRESHOLDS,
        "energy": ENERGY_THRESHOLDS
    }

@router.get("/decisions/analysis")
async def get_analysis(
    sensor_simulator: SensorSimulator = Depends(get_sensor_simulator),
    decision_engine: DecisionEngine = Depends(get_decision_engine)
):
    """
    Get comprehensive analysis with current state and recommendations
    """
    try:
        # Get current telemetry
        telemetry = sensor_simulator.get_current_state()
        
        # Create/update settlement state
        state = SettlementState()
        state = update_settlement_state_from_telemetry(state, telemetry)
        
        # Generate recommendations
        recommendations = decision_engine.generate_recommendations(state)
        
        # Categorize recommendations
        life_support_recs = [r for r in recommendations if r.category == "life_support"]
        energy_recs = [r for r in recommendations if r.category == "energy_dispatch"]
        
        # Get highest priority recommendations
        top_priority = recommendations[0] if recommendations else None
        
        return {
            "status": "success",
            "current_state": {
                "o2_pct": state.o2_pct,
                "co2_ppm": state.co2_ppm,
                "pressure_kpa": state.pressure_kpa,
                "temp_c": state.temp_c,
                "humidity_pct": state.humidity_pct,
                "solar_kw": state.solar_kw,
                "battery_kwh": state.battery_kwh,
                "load_kw": state.load_kw,
                "crop_health_index": state.crop_health_index,
                "radiation_msv_hr": state.radiation_msv_hr,
                "strain_index": state.strain_index
            },
            "summary": {
                "total_recommendations": len(recommendations),
                "life_support_count": len(life_support_recs),
                "energy_dispatch_count": len(energy_recs),
                "highest_priority": top_priority.priority if top_priority else None,
                "critical_count": len([r for r in recommendations if r.impact == "critical"])
            },
            "top_recommendations": [
                {
                    "priority": r.priority,
                    "category": r.category,
                    "action": r.action,
                    "title": r.title,
                    "reasoning": r.reasoning
                }
                for r in recommendations[:5]  # Top 5
            ],
            "life_support": [
                {
                    "priority": r.priority,
                    "action": r.action,
                    "title": r.title,
                    "reasoning": r.reasoning
                }
                for r in life_support_recs
            ],
            "energy_dispatch": [
                {
                    "priority": r.priority,
                    "action": r.action,
                    "title": r.title,
                    "reasoning": r.reasoning
                }
                for r in energy_recs
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate analysis: {str(e)}")
