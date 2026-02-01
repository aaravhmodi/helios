from fastapi import APIRouter, HTTPException, Query, Depends
from app.models import Alert, AlertSeverity
from app.sensor_simulator import SensorSimulator, get_sensor_simulator
from datetime import datetime
from typing import List, Optional
import uuid

router = APIRouter()

# In-memory alert storage (in production, use a database)
alerts_db: List[Alert] = []

def generate_alert(sensor_simulator: SensorSimulator) -> List[Alert]:
    """Generate alerts based on current sensor readings"""
    state = sensor_simulator.get_current_state()
    new_alerts = []
    
    # Check atmosphere
    if state["atmosphere"]["oxygen_level"] < 20.0:
        new_alerts.append(Alert(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            severity=AlertSeverity.CRITICAL,
            category="atmosphere",
            message=f"Oxygen level critically low: {state['atmosphere']['oxygen_level']:.2f}%",
            system="atmosphere"
        ))
    elif state["atmosphere"]["oxygen_level"] < 20.5:
        new_alerts.append(Alert(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            severity=AlertSeverity.WARNING,
            category="atmosphere",
            message=f"Oxygen level below optimal: {state['atmosphere']['oxygen_level']:.2f}%",
            system="atmosphere"
        ))
    
    if state["atmosphere"]["co2_level"] > 0.05:
        new_alerts.append(Alert(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            severity=AlertSeverity.WARNING,
            category="atmosphere",
            message=f"CO2 level elevated: {state['atmosphere']['co2_level']:.4f}%",
            system="atmosphere"
        ))
    
    # Check power
    if state["power"]["battery_charge"] < 30.0:
        new_alerts.append(Alert(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            severity=AlertSeverity.CRITICAL,
            category="power",
            message=f"Battery charge critically low: {state['power']['battery_charge']:.2f}%",
            system="power"
        ))
    elif state["power"]["battery_charge"] < 50.0:
        new_alerts.append(Alert(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            severity=AlertSeverity.WARNING,
            category="power",
            message=f"Battery charge low: {state['power']['battery_charge']:.2f}%",
            system="power"
        ))
    
    # Check radiation
    if state["radiation"]["radiation_level"] > 0.7:
        new_alerts.append(Alert(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            severity=AlertSeverity.WARNING,
            category="radiation",
            message=f"Radiation level elevated: {state['radiation']['radiation_level']:.4f} mSv/day",
            system="radiation"
        ))
    
    # Check structural
    if state["structural"]["structural_integrity"] < 95.0:
        new_alerts.append(Alert(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            severity=AlertSeverity.WARNING,
            category="structural",
            message=f"Structural integrity below optimal: {state['structural']['structural_integrity']:.2f}%",
            system="structural"
        ))
    
    return new_alerts

@router.get("/alerts")
async def get_alerts(
    severity: Optional[AlertSeverity] = Query(None, description="Filter by severity"),
    system: Optional[str] = Query(None, description="Filter by system"),
    resolved: Optional[bool] = Query(None, description="Filter by resolved status"),
    limit: int = Query(50, ge=1, le=1000, description="Maximum number of alerts to return")
):
    """
    Get all alerts, optionally filtered by severity, system, or resolved status
    """
    filtered_alerts = alerts_db.copy()
    
    if severity:
        filtered_alerts = [a for a in filtered_alerts if a.severity == severity]
    
    if system:
        filtered_alerts = [a for a in filtered_alerts if a.system == system]
    
    if resolved is not None:
        filtered_alerts = [a for a in filtered_alerts if a.resolved == resolved]
    
    # Sort by timestamp (newest first) and limit
    filtered_alerts.sort(key=lambda x: x.timestamp, reverse=True)
    filtered_alerts = filtered_alerts[:limit]
    
    return {
        "count": len(filtered_alerts),
        "alerts": [alert.dict() for alert in filtered_alerts]
    }

@router.get("/alerts/{alert_id}")
async def get_alert(alert_id: str):
    """Get a specific alert by ID"""
    alert = next((a for a in alerts_db if a.id == alert_id), None)
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return alert.dict()

@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Mark an alert as resolved"""
    alert = next((a for a in alerts_db if a.id == alert_id), None)
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.resolved = True
    return {"message": "Alert resolved", "alert": alert.dict()}

@router.post("/alerts/generate")
async def generate_alerts(sensor_simulator: SensorSimulator = Depends(get_sensor_simulator)):
    """Generate new alerts based on current sensor state (internal use)"""
    new_alerts = generate_alert(sensor_simulator)
    if new_alerts:
        alerts_db.extend(new_alerts)
    return {"generated": len(new_alerts) if new_alerts else 0}
