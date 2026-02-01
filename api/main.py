from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import json
import asyncio
from datetime import datetime
from typing import List, Dict
import uvicorn

from app.sensor_simulator import SensorSimulator, get_sensor_simulator
from app.models import SystemState, Alert, Recommendation, AuditLogEntry
from app.routers import state, alerts, recommendations, audit_log, settlement_state, safety, decisions, anomaly, scenarios

app = FastAPI(title="HELIOS Space Settlement API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(state.router, prefix="/api", tags=["state"])
app.include_router(alerts.router, prefix="/api", tags=["alerts"])
app.include_router(recommendations.router, prefix="/api", tags=["recommendations"])
app.include_router(audit_log.router, prefix="/api", tags=["audit-log"])
app.include_router(settlement_state.router, prefix="/api", tags=["settlement-state"])
app.include_router(safety.router, prefix="/api", tags=["safety"])
app.include_router(decisions.router, prefix="/api", tags=["decisions"])
app.include_router(anomaly.router, prefix="/api", tags=["anomaly"])
app.include_router(scenarios.router, prefix="/api", tags=["scenarios"])

# Get singleton sensor simulator instance
sensor_simulator = get_sensor_simulator()

# Initialize safety layer
from app.safety_layer import get_safety_layer
safety_layer = get_safety_layer()

@app.on_event("startup")
async def startup_event():
    """Start sensor simulator on application startup"""
    asyncio.create_task(sensor_simulator.run())
    
    # Start periodic safety checks
    asyncio.create_task(periodic_safety_check())
    
    # Start periodic anomaly detection
    asyncio.create_task(periodic_anomaly_detection())

async def periodic_safety_check():
    """Periodically check safety thresholds"""
    from app.models import SettlementState, update_settlement_state_from_telemetry
    
    while True:
        try:
            await asyncio.sleep(5.0)  # Check every 5 seconds
            telemetry = sensor_simulator.get_current_state()
            state = SettlementState()
            state = update_settlement_state_from_telemetry(state, telemetry)
            
            # Check safety and get alerts/recommendations
            alerts, recommendations = safety_layer.check_safety(state, telemetry)
            
            # Add alerts to alerts database (import at runtime to avoid circular imports)
            if alerts:
                import app.routers.alerts as alerts_module
                alerts_module.alerts_db.extend(alerts)
            
            # Add recommendations to recommendations database
            if recommendations:
                import app.routers.recommendations as recommendations_module
                recommendations_module.recommendations_db.extend(recommendations)
        except Exception as e:
            print(f"Safety check error: {e}")

async def periodic_anomaly_detection():
    """Periodically run anomaly detection"""
    from app.models import SettlementState, update_settlement_state_from_telemetry
    from app.anomaly_detector import get_anomaly_detector
    
    anomaly_detector = get_anomaly_detector()
    
    while True:
        try:
            await asyncio.sleep(10.0)  # Check every 10 seconds
            telemetry = sensor_simulator.get_current_state()
            state = SettlementState()
            state = update_settlement_state_from_telemetry(state, telemetry)
            
            # Detect anomalies
            anomaly_alerts = anomaly_detector.detect_anomalies(
                pressure=state.pressure_kpa,
                radiation=state.radiation_msv_hr,
                battery=state.battery_kwh
            )
            
            # Add anomaly alerts to alerts database
            if anomaly_alerts:
                import app.routers.alerts as alerts_module
                for anomaly_alert in anomaly_alerts:
                    alert = Alert(
                        id=anomaly_alert.id,
                        timestamp=anomaly_alert.timestamp,
                        severity=anomaly_alert.severity,
                        category=f"anomaly_{anomaly_alert.metric}",
                        message=anomaly_alert.message,
                        system=anomaly_alert.metric
                    )
                    alerts_module.alerts_db.append(alert)
        except Exception as e:
            print(f"Anomaly detection error: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Stop sensor simulator on application shutdown"""
    sensor_simulator.stop()

@app.get("/")
async def root():
    return {
        "message": "HELIOS Space Settlement API",
        "version": "1.0.0",
        "endpoints": {
            "telemetry": "/telemetry",
            "state": "/api/state",
            "alerts": "/api/alerts",
            "recommendations": "/api/recommendations",
            "audit-log": "/api/audit-log",
            "safety": "/api/safety",
            "decisions": "/api/decisions",
            "anomaly": "/api/anomaly",
            "scenarios": "/api/scenarios"
        }
    }

@app.get("/telemetry")
async def get_telemetry():
    """Get current telemetry data"""
    return sensor_simulator.get_current_state()

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    """WebSocket endpoint for real-time telemetry streaming at 1 Hz"""
    await websocket.accept()
    try:
        while True:
            telemetry = sensor_simulator.get_current_state()
            await websocket.send_json(telemetry)
            await asyncio.sleep(1.0)  # 1 Hz = 1 second interval
    except WebSocketDisconnect:
        pass

@app.get("/stream/telemetry")
async def stream_telemetry():
    """Server-Sent Events (SSE) endpoint for telemetry streaming at 1 Hz"""
    async def generate():
        while True:
            telemetry = sensor_simulator.get_current_state()
            yield f"data: {json.dumps(telemetry)}\n\n"
            await asyncio.sleep(1.0)  # 1 Hz
    
    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
