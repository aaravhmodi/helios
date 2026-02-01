"""
Scenario replay API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from app.sensor_simulator import SensorSimulator, get_sensor_simulator
from app.scenario_engine import ScenarioEngine, get_scenario_engine
from app.audit_logger import get_audit_logger

router = APIRouter()

@router.post("/scenarios/radiation-storm")
async def start_radiation_storm(
    duration: float = Query(300.0, ge=60.0, le=1800.0, description="Duration in seconds (60-1800)"),
    sensor_simulator: SensorSimulator = Depends(get_sensor_simulator)
):
    """
    Start radiation storm scenario
    
    Scenario simulates:
    - Radiation spike to 2.0 mSv/hr (100x normal)
    - Peak at 60 seconds
    - Gradual decline over duration
    - Triggers alerts and recommendations
    """
    try:
        scenario_engine = get_scenario_engine(sensor_simulator)
        result = await scenario_engine.run_radiation_storm_scenario(duration)
        
        # Log action
        audit_logger = get_audit_logger()
        audit_logger.log(
            user="api_user",
            action="START_SCENARIO",
            resource="radiation_storm",
            status="success",
            details={"duration_seconds": duration}
        )
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start scenario: {str(e)}")

@router.post("/scenarios/pressure-leak")
async def start_pressure_leak(
    duration: float = Query(180.0, ge=60.0, le=600.0, description="Duration in seconds (60-600)"),
    sensor_simulator: SensorSimulator = Depends(get_sensor_simulator)
):
    """
    Start pressure leak scenario
    
    Scenario simulates:
    - Pressure drop at 2% per minute (critical leak rate)
    - Continues for specified duration
    - Triggers pressure leak alerts
    - Requires compartment isolation
    """
    try:
        scenario_engine = get_scenario_engine(sensor_simulator)
        result = await scenario_engine.run_pressure_leak_scenario(duration)
        
        # Log action
        audit_logger = get_audit_logger()
        audit_logger.log(
            user="api_user",
            action="START_SCENARIO",
            resource="pressure_leak",
            status="success",
            details={"duration_seconds": duration}
        )
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start scenario: {str(e)}")

@router.post("/scenarios/stop")
async def stop_scenario(
    sensor_simulator: SensorSimulator = Depends(get_sensor_simulator)
):
    """
    Stop the currently running scenario
    """
    try:
        scenario_engine = get_scenario_engine(sensor_simulator)
        result = scenario_engine.stop_scenario()
        
        # Log action
        audit_logger = get_audit_logger()
        audit_logger.log(
            user="api_user",
            action="STOP_SCENARIO",
            resource="scenario_engine",
            status="success",
            details=result
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop scenario: {str(e)}")

@router.get("/scenarios/status")
async def get_scenario_status(
    sensor_simulator: SensorSimulator = Depends(get_sensor_simulator)
):
    """
    Get current scenario status
    """
    try:
        scenario_engine = get_scenario_engine(sensor_simulator)
        status = scenario_engine.get_scenario_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get scenario status: {str(e)}")

@router.get("/scenarios/list")
async def list_scenarios():
    """
    List available scenarios
    """
    return {
        "scenarios": [
            {
                "name": "radiation_storm",
                "description": "Simulates a radiation storm with spike to 2.0 mSv/hr",
                "duration_range": {"min": 60, "max": 1800},
                "default_duration": 300,
                "triggers": ["radiation alerts", "storm shelter recommendations"]
            },
            {
                "name": "pressure_leak",
                "description": "Simulates a pressure leak at 2% per minute",
                "duration_range": {"min": 60, "max": 600},
                "default_duration": 180,
                "triggers": ["pressure leak alerts", "compartment isolation recommendations"]
            }
        ]
    }
