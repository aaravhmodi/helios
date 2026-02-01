"""
Anomaly Detection API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from app.sensor_simulator import SensorSimulator, get_sensor_simulator
from app.models import SettlementState, update_settlement_state_from_telemetry, Alert
from app.anomaly_detector import AnomalyDetector, get_anomaly_detector, AnomalyAlert
from typing import List

router = APIRouter()

@router.post("/anomaly/detect")
async def detect_anomalies(
    sensor_simulator: SensorSimulator = Depends(get_sensor_simulator),
    anomaly_detector: AnomalyDetector = Depends(get_anomaly_detector)
):
    """
    Detect anomalies in pressure, radiation, and battery using EWMA and z-score
    """
    try:
        # Get current telemetry
        telemetry = sensor_simulator.get_current_state()
        
        # Create/update settlement state
        state = SettlementState()
        state = update_settlement_state_from_telemetry(state, telemetry)
        
        # Detect anomalies
        anomaly_alerts = anomaly_detector.detect_anomalies(
            pressure=state.pressure_kpa,
            radiation=state.radiation_msv_hr,
            battery=state.battery_kwh
        )
        
        # Convert to Alert format and add to alerts database
        alerts = []
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
                alerts.append(alert)
                alerts_module.alerts_db.append(alert)
        
        return {
            "status": "checked",
            "anomalies_detected": len(anomaly_alerts),
            "anomalies": [
                {
                    "id": a.id,
                    "timestamp": a.timestamp.isoformat(),
                    "metric": a.metric,
                    "severity": a.severity.value,
                    "current_value": a.current_value,
                    "z_score": a.z_score,
                    "confidence": a.confidence,
                    "evidence": a.evidence,
                    "message": a.message,
                    "recommendation": a.recommendation
                }
                for a in anomaly_alerts
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@router.get("/anomaly/statistics")
async def get_anomaly_statistics(
    anomaly_detector: AnomalyDetector = Depends(get_anomaly_detector)
):
    """
    Get current anomaly detection statistics (mean, std dev, EWMA, etc.)
    """
    try:
        stats = anomaly_detector.get_statistics()
        return {
            "status": "success",
            "statistics": stats,
            "thresholds": {
                "z_score_threshold": 2.5,
                "z_score_critical": 3.5,
                "ewma_alpha": 0.3,
                "min_samples_required": 10
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

@router.post("/anomaly/reset")
async def reset_anomaly_statistics(
    metric: str = None,  # "pressure", "radiation", "battery", or None for all
    anomaly_detector: AnomalyDetector = Depends(get_anomaly_detector)
):
    """
    Reset anomaly detection statistics for a metric or all metrics
    """
    try:
        if metric and metric not in ["pressure", "radiation", "battery"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid metric. Must be 'pressure', 'radiation', 'battery', or None for all"
            )
        
        anomaly_detector.reset_statistics(metric)
        
        return {
            "status": "reset",
            "metric": metric or "all",
            "message": f"Statistics reset for {metric or 'all metrics'}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset statistics: {str(e)}")

@router.get("/anomaly/config")
async def get_anomaly_config():
    """
    Get anomaly detection configuration
    """
    from app.anomaly_detector import Z_SCORE_THRESHOLD, Z_SCORE_CRITICAL, EWMA_ALPHA
    
    return {
        "z_score_threshold": Z_SCORE_THRESHOLD,
        "z_score_critical": Z_SCORE_CRITICAL,
        "ewma_alpha": EWMA_ALPHA,
        "max_history_size": 100,
        "min_samples_required": 10,
        "monitored_metrics": ["pressure", "radiation", "battery"]
    }
