"""
Anomaly Detection using EWMA and Z-Score for pressure, radiation, and battery
"""
from dataclasses import dataclass, field
from typing import List, Optional, Dict
from datetime import datetime
from app.models import Alert, AlertSeverity
import uuid
import math

# Anomaly detection thresholds
Z_SCORE_THRESHOLD = 2.5  # Standard deviations for anomaly detection
Z_SCORE_CRITICAL = 3.5  # Critical anomaly threshold
EWMA_ALPHA = 0.3  # Smoothing factor for EWMA (0 < alpha <= 1)

@dataclass
class MetricStatistics:
    """Statistics for a metric"""
    mean: float = 0.0
    std_dev: float = 0.0
    ewma: float = 0.0
    min_value: float = float('inf')
    max_value: float = float('-inf')
    sample_count: int = 0
    last_value: float = 0.0

@dataclass
class AnomalyAlert:
    """Anomaly detection alert with confidence and evidence"""
    id: str
    timestamp: datetime
    metric: str  # "pressure", "radiation", "battery"
    severity: AlertSeverity
    current_value: float
    z_score: float
    confidence: float  # 0.0-1.0
    evidence: Dict  # Supporting evidence
    message: str
    recommendation: str

class AnomalyDetector:
    """Anomaly detection using EWMA and Z-Score"""
    
    def __init__(self):
        self.pressure_stats = MetricStatistics()
        self.radiation_stats = MetricStatistics()
        self.battery_stats = MetricStatistics()
        self.history: Dict[str, List[float]] = {
            "pressure": [],
            "radiation": [],
            "battery": []
        }
        self.max_history_size = 100  # Keep last 100 samples
    
    def update_metric(self, metric_name: str, value: float):
        """Update metric statistics with new value"""
        stats = self._get_stats(metric_name)
        
        # Update history
        if metric_name in self.history:
            self.history[metric_name].append(value)
            if len(self.history[metric_name]) > self.max_history_size:
                self.history[metric_name].pop(0)
        
        # Update min/max
        stats.min_value = min(stats.min_value, value)
        stats.max_value = max(stats.max_value, value)
        stats.last_value = value
        stats.sample_count += 1
        
        # Update EWMA
        if stats.sample_count == 1:
            stats.ewma = value
        else:
            stats.ewma = EWMA_ALPHA * value + (1 - EWMA_ALPHA) * stats.ewma
        
        # Update mean and std dev from history
        if len(self.history[metric_name]) >= 2:
            values = self.history[metric_name]
            stats.mean = sum(values) / len(values)
            
            # Calculate standard deviation
            variance = sum((x - stats.mean) ** 2 for x in values) / len(values)
            stats.std_dev = math.sqrt(variance) if variance > 0 else 0.0
    
    def detect_anomalies(self, pressure: float, radiation: float, battery: float) -> List[AnomalyAlert]:
        """
        Detect anomalies in pressure, radiation, and battery
        
        Returns:
            List of anomaly alerts with confidence scores and evidence
        """
        alerts = []
        
        # Update metrics
        self.update_metric("pressure", pressure)
        self.update_metric("radiation", radiation)
        self.update_metric("battery", battery)
        
        # Detect anomalies
        pressure_alert = self._detect_pressure_anomaly(pressure)
        if pressure_alert:
            alerts.append(pressure_alert)
        
        radiation_alert = self._detect_radiation_anomaly(radiation)
        if radiation_alert:
            alerts.append(radiation_alert)
        
        battery_alert = self._detect_battery_anomaly(battery)
        if battery_alert:
            alerts.append(battery_alert)
        
        return alerts
    
    def _detect_pressure_anomaly(self, value: float) -> Optional[AnomalyAlert]:
        """Detect pressure anomalies"""
        stats = self.pressure_stats
        
        if stats.sample_count < 10:  # Need minimum samples for reliable detection
            return None
        
        if stats.std_dev == 0:
            return None
        
        # Calculate z-score
        z_score = (value - stats.mean) / stats.std_dev if stats.std_dev > 0 else 0.0
        
        # Check for anomaly
        abs_z_score = abs(z_score)
        
        if abs_z_score >= Z_SCORE_CRITICAL:
            # Critical anomaly
            confidence = min(0.99, 0.7 + (abs_z_score - Z_SCORE_CRITICAL) * 0.1)
            severity = AlertSeverity.CRITICAL
        elif abs_z_score >= Z_SCORE_THRESHOLD:
            # Warning anomaly
            confidence = min(0.95, 0.5 + (abs_z_score - Z_SCORE_THRESHOLD) * 0.15)
            severity = AlertSeverity.WARNING
        else:
            return None
        
        # Determine if high or low anomaly
        is_high = z_score > 0
        
        # Build evidence
        evidence = {
            "current_value": value,
            "mean": round(stats.mean, 4),
            "std_dev": round(stats.std_dev, 4),
            "ewma": round(stats.ewma, 4),
            "z_score": round(z_score, 4),
            "z_score_threshold": Z_SCORE_THRESHOLD,
            "z_score_critical": Z_SCORE_CRITICAL,
            "deviation_from_mean": round(value - stats.mean, 4),
            "deviation_percent": round(((value - stats.mean) / stats.mean * 100) if stats.mean != 0 else 0, 2),
            "sample_count": stats.sample_count,
            "min_value": round(stats.min_value, 4),
            "max_value": round(stats.max_value, 4),
            "anomaly_type": "high" if is_high else "low",
            "statistical_significance": "critical" if abs_z_score >= Z_SCORE_CRITICAL else "significant"
        }
        
        message = (
            f"Pressure anomaly detected: {value:.2f} kPa "
            f"(z-score: {z_score:.2f}, {'above' if is_high else 'below'} mean by {abs(value - stats.mean):.2f} kPa)"
        )
        
        recommendation = (
            f"Pressure is {'abnormally high' if is_high else 'abnormally low'} "
            f"({abs(value - stats.mean):.2f} kPa deviation from mean {stats.mean:.2f} kPa). "
            f"Investigate pressure systems and verify sensor readings."
        )
        
        return AnomalyAlert(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            metric="pressure",
            severity=severity,
            current_value=value,
            z_score=z_score,
            confidence=confidence,
            evidence=evidence,
            message=message,
            recommendation=recommendation
        )
    
    def _detect_radiation_anomaly(self, value: float) -> Optional[AnomalyAlert]:
        """Detect radiation anomalies"""
        stats = self.radiation_stats
        
        if stats.sample_count < 10:
            return None
        
        if stats.std_dev == 0:
            return None
        
        # Calculate z-score
        z_score = (value - stats.mean) / stats.std_dev if stats.std_dev > 0 else 0.0
        abs_z_score = abs(z_score)
        
        # Radiation anomalies are typically high (spikes)
        if abs_z_score >= Z_SCORE_CRITICAL and z_score > 0:
            confidence = min(0.99, 0.7 + (abs_z_score - Z_SCORE_CRITICAL) * 0.1)
            severity = AlertSeverity.CRITICAL
        elif abs_z_score >= Z_SCORE_THRESHOLD and z_score > 0:
            confidence = min(0.95, 0.5 + (abs_z_score - Z_SCORE_THRESHOLD) * 0.15)
            severity = AlertSeverity.WARNING
        else:
            return None
        
        # Build evidence
        evidence = {
            "current_value": value,
            "mean": round(stats.mean, 6),
            "std_dev": round(stats.std_dev, 6),
            "ewma": round(stats.ewma, 6),
            "z_score": round(z_score, 4),
            "z_score_threshold": Z_SCORE_THRESHOLD,
            "z_score_critical": Z_SCORE_CRITICAL,
            "deviation_from_mean": round(value - stats.mean, 6),
            "deviation_percent": round(((value - stats.mean) / stats.mean * 100) if stats.mean != 0 else 0, 2),
            "sample_count": stats.sample_count,
            "min_value": round(stats.min_value, 6),
            "max_value": round(stats.max_value, 6),
            "anomaly_type": "spike",
            "statistical_significance": "critical" if abs_z_score >= Z_SCORE_CRITICAL else "significant",
            "ewma_deviation": round(value - stats.ewma, 6)
        }
        
        message = (
            f"Radiation anomaly detected: {value:.6f} mSv/hr "
            f"(z-score: {z_score:.2f}, {value - stats.mean:.6f} mSv/hr above mean)"
        )
        
        recommendation = (
            f"Radiation spike detected ({value:.6f} mSv/hr, {value - stats.mean:.6f} mSv/hr above mean). "
            f"Verify sensor readings and check for solar events or shielding issues."
        )
        
        return AnomalyAlert(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            metric="radiation",
            severity=severity,
            current_value=value,
            z_score=z_score,
            confidence=confidence,
            evidence=evidence,
            message=message,
            recommendation=recommendation
        )
    
    def _detect_battery_anomaly(self, value: float) -> Optional[AnomalyAlert]:
        """Detect battery anomalies"""
        stats = self.battery_stats
        
        if stats.sample_count < 10:
            return None
        
        if stats.std_dev == 0:
            return None
        
        # Calculate z-score
        z_score = (value - stats.mean) / stats.std_dev if stats.std_dev > 0 else 0.0
        abs_z_score = abs(z_score)
        
        # Battery anomalies can be high (overcharging) or low (rapid discharge)
        if abs_z_score >= Z_SCORE_CRITICAL:
            confidence = min(0.99, 0.7 + (abs_z_score - Z_SCORE_CRITICAL) * 0.1)
            severity = AlertSeverity.CRITICAL
        elif abs_z_score >= Z_SCORE_THRESHOLD:
            confidence = min(0.95, 0.5 + (abs_z_score - Z_SCORE_THRESHOLD) * 0.15)
            severity = AlertSeverity.WARNING
        else:
            return None
        
        is_high = z_score > 0
        
        # Build evidence
        evidence = {
            "current_value": value,
            "mean": round(stats.mean, 2),
            "std_dev": round(stats.std_dev, 2),
            "ewma": round(stats.ewma, 2),
            "z_score": round(z_score, 4),
            "z_score_threshold": Z_SCORE_THRESHOLD,
            "z_score_critical": Z_SCORE_CRITICAL,
            "deviation_from_mean": round(value - stats.mean, 2),
            "deviation_percent": round(((value - stats.mean) / stats.mean * 100) if stats.mean != 0 else 0, 2),
            "sample_count": stats.sample_count,
            "min_value": round(stats.min_value, 2),
            "max_value": round(stats.max_value, 2),
            "anomaly_type": "high" if is_high else "low",
            "statistical_significance": "critical" if abs_z_score >= Z_SCORE_CRITICAL else "significant",
            "ewma_deviation": round(value - stats.ewma, 2),
            "charge_rate": round((value - stats.ewma) / stats.ewma * 100 if stats.ewma != 0 else 0, 2)  # % change from EWMA
        }
        
        message = (
            f"Battery anomaly detected: {value:.2f} kWh "
            f"(z-score: {z_score:.2f}, {'above' if is_high else 'below'} mean by {abs(value - stats.mean):.2f} kWh)"
        )
        
        if is_high:
            recommendation = (
                f"Battery level is abnormally high ({value:.2f} kWh, {value - stats.mean:.2f} kWh above mean). "
                f"Possible overcharging or sensor malfunction. Verify charging systems."
            )
        else:
            recommendation = (
                f"Battery level is abnormally low ({value:.2f} kWh, {abs(value - stats.mean):.2f} kWh below mean). "
                f"Possible rapid discharge or system issue. Investigate power consumption and battery health."
            )
        
        return AnomalyAlert(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            metric="battery",
            severity=severity,
            current_value=value,
            z_score=z_score,
            confidence=confidence,
            evidence=evidence,
            message=message,
            recommendation=recommendation
        )
    
    def _get_stats(self, metric_name: str) -> MetricStatistics:
        """Get statistics for a metric"""
        if metric_name == "pressure":
            return self.pressure_stats
        elif metric_name == "radiation":
            return self.radiation_stats
        elif metric_name == "battery":
            return self.battery_stats
        else:
            raise ValueError(f"Unknown metric: {metric_name}")
    
    def get_statistics(self) -> Dict:
        """Get all metric statistics"""
        return {
            "pressure": {
                "mean": round(self.pressure_stats.mean, 4),
                "std_dev": round(self.pressure_stats.std_dev, 4),
                "ewma": round(self.pressure_stats.ewma, 4),
                "sample_count": self.pressure_stats.sample_count,
                "min": round(self.pressure_stats.min_value, 4),
                "max": round(self.pressure_stats.max_value, 4)
            },
            "radiation": {
                "mean": round(self.radiation_stats.mean, 6),
                "std_dev": round(self.radiation_stats.std_dev, 6),
                "ewma": round(self.radiation_stats.ewma, 6),
                "sample_count": self.radiation_stats.sample_count,
                "min": round(self.radiation_stats.min_value, 6),
                "max": round(self.radiation_stats.max_value, 6)
            },
            "battery": {
                "mean": round(self.battery_stats.mean, 2),
                "std_dev": round(self.battery_stats.std_dev, 2),
                "ewma": round(self.battery_stats.ewma, 2),
                "sample_count": self.battery_stats.sample_count,
                "min": round(self.battery_stats.min_value, 2),
                "max": round(self.battery_stats.max_value, 2)
            }
        }
    
    def reset_statistics(self, metric_name: Optional[str] = None):
        """Reset statistics for a metric or all metrics"""
        if metric_name is None:
            self.pressure_stats = MetricStatistics()
            self.radiation_stats = MetricStatistics()
            self.battery_stats = MetricStatistics()
            self.history = {"pressure": [], "radiation": [], "battery": []}
        else:
            stats = self._get_stats(metric_name)
            stats.__init__()
            if metric_name in self.history:
                self.history[metric_name] = []

# Singleton instance
_anomaly_detector_instance = None

def get_anomaly_detector() -> AnomalyDetector:
    """Get the singleton anomaly detector instance"""
    global _anomaly_detector_instance
    if _anomaly_detector_instance is None:
        _anomaly_detector_instance = AnomalyDetector()
    return _anomaly_detector_instance
