from fastapi import APIRouter, HTTPException, Depends
from app.sensor_simulator import SensorSimulator, get_sensor_simulator
from app.models import SettlementState, update_settlement_state_from_telemetry

router = APIRouter()

# Global settlement state instance
settlement_state = SettlementState()

@router.get("/settlement-state")
async def get_settlement_state(sensor_simulator: SensorSimulator = Depends(get_sensor_simulator)):
    """
    Get current settlement state in the simplified SettlementState format
    """
    try:
        # Get current telemetry
        telemetry = sensor_simulator.get_current_state()
        
        # Update settlement state from telemetry
        updated_state = update_settlement_state_from_telemetry(settlement_state, telemetry)
        
        return {
            "status": "operational",
            "state": {
                "o2_pct": updated_state.o2_pct,
                "co2_ppm": updated_state.co2_ppm,
                "pressure_kpa": updated_state.pressure_kpa,
                "temp_c": updated_state.temp_c,
                "humidity_pct": updated_state.humidity_pct,
                "solar_kw": updated_state.solar_kw,
                "battery_kwh": updated_state.battery_kwh,
                "load_kw": updated_state.load_kw,
                "crop_health_index": updated_state.crop_health_index,
                "radiation_msv_hr": updated_state.radiation_msv_hr,
                "strain_index": updated_state.strain_index
            },
            "timestamp": telemetry.get("timestamp")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve settlement state: {str(e)}")

@router.post("/settlement-state/update")
async def update_settlement_state(
    telemetry: dict,
    sensor_simulator: SensorSimulator = Depends(get_sensor_simulator)
):
    """
    Update settlement state from a telemetry message
    """
    try:
        global settlement_state
        updated_state = update_settlement_state_from_telemetry(settlement_state, telemetry)
        settlement_state = updated_state
        
        return {
            "status": "updated",
            "state": {
                "o2_pct": updated_state.o2_pct,
                "co2_ppm": updated_state.co2_ppm,
                "pressure_kpa": updated_state.pressure_kpa,
                "temp_c": updated_state.temp_c,
                "humidity_pct": updated_state.humidity_pct,
                "solar_kw": updated_state.solar_kw,
                "battery_kwh": updated_state.battery_kwh,
                "load_kw": updated_state.load_kw,
                "crop_health_index": updated_state.crop_health_index,
                "radiation_msv_hr": updated_state.radiation_msv_hr,
                "strain_index": updated_state.strain_index
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update settlement state: {str(e)}")
