"""
Safety Layer API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from app.sensor_simulator import SensorSimulator, get_sensor_simulator
from app.models import SettlementState, update_settlement_state_from_telemetry
from app.safety_layer import SafetyLayer, get_safety_layer
from typing import Dict, List

router = APIRouter()

@router.post("/safety/check")
async def check_safety(
    sensor_simulator: SensorSimulator = Depends(get_sensor_simulator),
    safety_layer: SafetyLayer = Depends(get_safety_layer)
):
    """
    Check safety thresholds and generate alerts/recommendations
    """
    try:
        # Get current telemetry
        telemetry = sensor_simulator.get_current_state()
        
        # Create/update settlement state
        state = SettlementState()
        state = update_settlement_state_from_telemetry(state, telemetry)
        
        # Check safety
        alerts, recommendations = safety_layer.check_safety(state, telemetry)
        
        return {
            "status": "checked",
            "alerts_generated": len(alerts),
            "recommendations_generated": len(recommendations),
            "alerts": [alert.dict() for alert in alerts],
            "recommendations": [rec.dict() for rec in recommendations]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Safety check failed: {str(e)}")

@router.get("/safety/pending-approvals")
async def get_pending_approvals(safety_layer: SafetyLayer = Depends(get_safety_layer)):
    """
    Get all pending critical action approvals
    """
    try:
        approvals = safety_layer.get_pending_approvals()
        return {
            "count": len(approvals),
            "pending_approvals": approvals
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get pending approvals: {str(e)}")

@router.get("/safety/approval/{recommendation_id}")
async def get_approval_status(
    recommendation_id: str,
    safety_layer: SafetyLayer = Depends(get_safety_layer)
):
    """
    Get approval status for a specific recommendation
    """
    try:
        status = safety_layer.get_approval_status(recommendation_id)
        if status is None:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        return status
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get approval status: {str(e)}")

@router.post("/safety/approve/{recommendation_id}")
async def approve_action(
    recommendation_id: str,
    request: dict = Body(...),
    safety_layer: SafetyLayer = Depends(get_safety_layer)
):
    """
    Approve a critical action
    
    Body:
        {
            "approved_by": "username or identifier"
        }
    """
    try:
        approved_by = request.get("approved_by")
        if not approved_by:
            raise HTTPException(status_code=400, detail="approved_by is required")
        
        success = safety_layer.approve_action(recommendation_id, approved_by)
        if not success:
            raise HTTPException(
                status_code=400,
                detail="Approval failed: Recommendation not found or already approved"
            )
        
        status = safety_layer.get_approval_status(recommendation_id)
        return {
            "status": "approved",
            "recommendation_id": recommendation_id,
            "approved_by": approved_by,
            "approval_details": status
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Approval failed: {str(e)}")

@router.get("/safety/thresholds")
async def get_thresholds():
    """
    Get current safety thresholds
    """
    from app.safety_layer import (
        PRESSURE_LEAK_THRESHOLD,
        RADIATION_SPIKE_THRESHOLD,
        RADIATION_CRITICAL_THRESHOLD,
        PRESSURE_CRITICAL_THRESHOLD
    )
    
    return {
        "pressure": {
            "leak_threshold_percent_per_minute": PRESSURE_LEAK_THRESHOLD,
            "critical_threshold_kpa": PRESSURE_CRITICAL_THRESHOLD
        },
        "radiation": {
            "spike_threshold_msv_hr": RADIATION_SPIKE_THRESHOLD,
            "critical_threshold_msv_hr": RADIATION_CRITICAL_THRESHOLD
        }
    }
