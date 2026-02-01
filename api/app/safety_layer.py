"""
Safety Layer: Monitors thresholds and generates critical alerts
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from app.models import Alert, AlertSeverity, Recommendation, SettlementState
from app.sensor_simulator import SensorSimulator
import uuid

# Thresholds
PRESSURE_LEAK_THRESHOLD = 2.0  # 2% per minute
RADIATION_SPIKE_THRESHOLD = 0.1  # mSv/hr (above normal background)
RADIATION_CRITICAL_THRESHOLD = 0.5  # mSv/hr (critical level)
PRESSURE_CRITICAL_THRESHOLD = 90.0  # kPa (critical low pressure)

# Alert Types
ALERT_PRESSURE_LEAK = "PRESSURE_LEAK"
ALERT_RADIATION_SPIKE = "RADIATION_SPIKE"
ALERT_RADIATION_CRITICAL = "RADIATION_CRITICAL"
ALERT_PRESSURE_CRITICAL = "PRESSURE_CRITICAL"

class PressureHistory:
    """Track pressure readings over time"""
    def __init__(self, max_history_minutes: int = 5):
        self.readings: List[Tuple[datetime, float]] = []
        self.max_history_minutes = max_history_minutes
    
    def add_reading(self, pressure_kpa: float):
        """Add a pressure reading with timestamp"""
        now = datetime.utcnow()
        self.readings.append((now, pressure_kpa))
        
        # Remove old readings (older than max_history_minutes)
        cutoff_time = now - timedelta(minutes=self.max_history_minutes)
        self.readings = [(ts, val) for ts, val in self.readings if ts >= cutoff_time]
    
    def get_rate_of_change(self) -> Optional[float]:
        """Calculate pressure change rate (% per minute)"""
        if len(self.readings) < 2:
            return None
        
        # Get oldest and newest readings
        oldest_ts, oldest_pressure = self.readings[0]
        newest_ts, newest_pressure = self.readings[-1]
        
        # Calculate time difference in minutes
        time_diff = (newest_ts - oldest_ts).total_seconds() / 60.0
        
        if time_diff == 0:
            return None
        
        # Calculate percentage change per minute
        if oldest_pressure == 0:
            return None
        
        pressure_change_pct = ((newest_pressure - oldest_pressure) / oldest_pressure) * 100.0
        rate_per_minute = pressure_change_pct / time_diff
        
        return rate_per_minute

class RadiationHistory:
    """Track radiation readings"""
    def __init__(self):
        self.baseline: Optional[float] = None
        self.readings: List[Tuple[datetime, float]] = []
        self.max_readings = 10
    
    def add_reading(self, radiation_msv_hr: float):
        """Add a radiation reading"""
        now = datetime.utcnow()
        self.readings.append((now, radiation_msv_hr))
        
        # Keep only recent readings
        if len(self.readings) > self.max_readings:
            self.readings = self.readings[-self.max_readings:]
        
        # Update baseline (average of recent readings, excluding spikes)
        if len(self.readings) >= 5:
            recent = [r[1] for r in self.readings[-5:]]
            self.baseline = sum(recent) / len(recent)
    
    def is_spike(self, current: float) -> bool:
        """Check if current reading is a spike above baseline"""
        if self.baseline is None:
            return False
        return current > (self.baseline + RADIATION_SPIKE_THRESHOLD)
    
    def is_critical(self, current: float) -> bool:
        """Check if radiation level is critical"""
        return current >= RADIATION_CRITICAL_THRESHOLD

# Singleton instance
_safety_layer_instance = None

def get_safety_layer() -> 'SafetyLayer':
    """Get the singleton safety layer instance"""
    global _safety_layer_instance
    if _safety_layer_instance is None:
        _safety_layer_instance = SafetyLayer()
    return _safety_layer_instance

class SafetyLayer:
    """Safety monitoring layer with threshold detection"""
    
    def __init__(self):
        self.pressure_history = PressureHistory()
        self.radiation_history = RadiationHistory()
        self.active_alerts: Dict[str, Alert] = {}
        self.pending_approvals: Dict[str, Dict] = {}
    
    def check_safety(self, state: SettlementState, telemetry: dict) -> Tuple[List[Alert], List[Recommendation]]:
        """
        Check safety thresholds and generate alerts/recommendations
        
        Returns:
            Tuple of (alerts, recommendations)
        """
        alerts = []
        recommendations = []
        
        # Update history
        self.pressure_history.add_reading(state.pressure_kpa)
        self.radiation_history.add_reading(state.radiation_msv_hr)
        
        # Check pressure leak
        pressure_alerts, pressure_recs = self._check_pressure(state)
        alerts.extend(pressure_alerts)
        recommendations.extend(pressure_recs)
        
        # Check critical pressure level
        if state.pressure_kpa < PRESSURE_CRITICAL_THRESHOLD:
            alert_id = ALERT_PRESSURE_CRITICAL
            if alert_id not in self.active_alerts:
                alert = Alert(
                    id=str(uuid.uuid4()),
                    timestamp=datetime.utcnow(),
                    severity=AlertSeverity.CRITICAL,
                    category="pressure",
                    message=f"CRITICAL: Pressure critically low at {state.pressure_kpa:.2f} kPa",
                    system="atmosphere"
                )
                alerts.append(alert)
                self.active_alerts[alert_id] = alert
                
                # Generate recommendation requiring approval
                rec = self._create_critical_recommendation(
                    "IMMEDIATE_EVACUATION",
                    "pressure",
                    "Immediate Evacuation Required",
                    f"Pressure has dropped to critical level ({state.pressure_kpa:.2f} kPa). Immediate evacuation to emergency shelters required.",
                    requires_approval=True
                )
                recommendations.append(rec)
        
        # Check radiation
        radiation_alerts, radiation_recs = self._check_radiation(state)
        alerts.extend(radiation_alerts)
        recommendations.extend(radiation_recs)
        
        return alerts, recommendations
    
    def _check_pressure(self, state: SettlementState) -> Tuple[List[Alert], List[Recommendation]]:
        """Check for pressure leaks"""
        alerts = []
        recommendations = []
        
        rate = self.pressure_history.get_rate_of_change()
        
        if rate is not None and rate < -PRESSURE_LEAK_THRESHOLD:
            # Pressure dropping faster than threshold
            alert_id = ALERT_PRESSURE_LEAK
            if alert_id not in self.active_alerts:
                alert = Alert(
                    id=str(uuid.uuid4()),
                    timestamp=datetime.utcnow(),
                    severity=AlertSeverity.CRITICAL,
                    category="pressure",
                    message=f"PRESSURE LEAK DETECTED: Pressure dropping at {abs(rate):.2f}% per minute",
                    system="atmosphere"
                )
                alerts.append(alert)
                self.active_alerts[alert_id] = alert
                
                # Generate recommendation requiring approval
                rec = self._create_critical_recommendation(
                    "ISOLATE_COMPARTMENTS",
                    "pressure",
                    "Isolate Compartments",
                    f"Pressure leak detected (dropping at {abs(rate):.2f}% per minute). Recommend immediate compartment isolation to prevent further pressure loss.",
                    requires_approval=True
                )
                recommendations.append(rec)
        elif ALERT_PRESSURE_LEAK in self.active_alerts and (rate is None or rate >= -PRESSURE_LEAK_THRESHOLD):
            # Leak resolved
            del self.active_alerts[ALERT_PRESSURE_LEAK]
        
        return alerts, recommendations
    
    def _check_radiation(self, state: SettlementState) -> Tuple[List[Alert], List[Recommendation]]:
        """Check for radiation spikes"""
        alerts = []
        recommendations = []
        
        # Check for critical radiation level
        if self.radiation_history.is_critical(state.radiation_msv_hr):
            alert_id = ALERT_RADIATION_CRITICAL
            if alert_id not in self.active_alerts:
                alert = Alert(
                    id=str(uuid.uuid4()),
                    timestamp=datetime.utcnow(),
                    severity=AlertSeverity.CRITICAL,
                    category="radiation",
                    message=f"CRITICAL: Radiation level at {state.radiation_msv_hr:.4f} mSv/hr (threshold: {RADIATION_CRITICAL_THRESHOLD} mSv/hr)",
                    system="radiation"
                )
                alerts.append(alert)
                self.active_alerts[alert_id] = alert
                
                # Generate recommendation requiring approval
                rec = self._create_critical_recommendation(
                    "ACTIVATE_STORM_SHELTER",
                    "radiation",
                    "Activate Storm Shelter Protocol",
                    f"Radiation level critical ({state.radiation_msv_hr:.4f} mSv/hr). All personnel must immediately proceed to storm shelters.",
                    requires_approval=True
                )
                recommendations.append(rec)
        
        # Check for radiation spike
        elif self.radiation_history.is_spike(state.radiation_msv_hr):
            alert_id = ALERT_RADIATION_SPIKE
            if alert_id not in self.active_alerts:
                baseline = self.radiation_history.baseline or 0.0
                alert = Alert(
                    id=str(uuid.uuid4()),
                    timestamp=datetime.utcnow(),
                    severity=AlertSeverity.WARNING,
                    category="radiation",
                    message=f"Radiation spike detected: {state.radiation_msv_hr:.4f} mSv/hr (baseline: {baseline:.4f} mSv/hr)",
                    system="radiation"
                )
                alerts.append(alert)
                self.active_alerts[alert_id] = alert
                
                # Generate recommendation requiring approval
                rec = self._create_critical_recommendation(
                    "PREPARE_STORM_SHELTER",
                    "radiation",
                    "Prepare Storm Shelter",
                    f"Radiation spike detected ({state.radiation_msv_hr:.4f} mSv/hr). Prepare to move to storm shelters if levels continue to rise.",
                    requires_approval=True
                )
                recommendations.append(rec)
        elif ALERT_RADIATION_SPIKE in self.active_alerts and not self.radiation_history.is_spike(state.radiation_msv_hr):
            # Spike resolved
            del self.active_alerts[ALERT_RADIATION_SPIKE]
        
        return alerts, recommendations
    
    def _create_critical_recommendation(
        self,
        action_id: str,
        category: str,
        title: str,
        description: str,
        requires_approval: bool = True
    ) -> Recommendation:
        """Create a critical recommendation that requires human approval"""
        rec_id = str(uuid.uuid4())
        
        # Store approval requirement
        if requires_approval:
            self.pending_approvals[rec_id] = {
                "action_id": action_id,
                "category": category,
                "title": title,
                "description": description,
                "timestamp": datetime.utcnow(),
                "approved": False,
                "approved_by": None,
                "approved_at": None
            }
        
        return Recommendation(
            id=rec_id,
            timestamp=datetime.utcnow(),
            priority="high",
            category=category,
            title=title,
            description=description,
            action_required=True
        )
    
    def approve_action(self, recommendation_id: str, approved_by: str) -> bool:
        """
        Approve a critical action
        
        Returns:
            True if approval successful, False if not found or already approved
        """
        if recommendation_id not in self.pending_approvals:
            return False
        
        approval = self.pending_approvals[recommendation_id]
        if approval["approved"]:
            return False
        
        approval["approved"] = True
        approval["approved_by"] = approved_by
        approval["approved_at"] = datetime.utcnow()
        
        return True
    
    def get_pending_approvals(self) -> List[Dict]:
        """Get all pending approvals"""
        return [
            {**approval, "recommendation_id": rec_id}
            for rec_id, approval in self.pending_approvals.items()
            if not approval["approved"]
        ]
    
    def get_approval_status(self, recommendation_id: str) -> Optional[Dict]:
        """Get approval status for a recommendation"""
        if recommendation_id not in self.pending_approvals:
            return None
        return self.pending_approvals[recommendation_id]
