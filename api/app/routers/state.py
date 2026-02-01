from fastapi import APIRouter, HTTPException, Depends
from app.sensor_simulator import SensorSimulator, get_sensor_simulator
from app.models import SystemState
import uuid

router = APIRouter()

@router.get("/state")
async def get_state(sensor_simulator: SensorSimulator = Depends(get_sensor_simulator)):
    """
    Get current system state from all sensors
    Returns comprehensive telemetry data
    """
    try:
        state = sensor_simulator.get_current_state()
        return {
            "status": "operational",
            "data": state,
            "timestamp": state.get("timestamp")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve system state: {str(e)}")

@router.get("/state/{system}")
async def get_system_state(system: str, sensor_simulator: SensorSimulator = Depends(get_sensor_simulator)):
    """
    Get state for a specific system
    Systems: atmosphere, life_support, power, radiation, agriculture, structural
    """
    valid_systems = ["atmosphere", "life_support", "power", "radiation", "agriculture", "structural"]
    
    if system not in valid_systems:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid system. Valid systems: {', '.join(valid_systems)}"
        )
    
    try:
        full_state = sensor_simulator.get_current_state()
        system_state = full_state.get(system)
        
        if not system_state:
            raise HTTPException(status_code=404, detail=f"System '{system}' state not found")
        
        return {
            "status": "operational",
            "system": system,
            "data": system_state,
            "timestamp": full_state.get("timestamp")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve {system} state: {str(e)}")
