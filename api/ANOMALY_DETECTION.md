# Anomaly Detection Documentation

## Overview

Anomaly detection system using EWMA (Exponentially Weighted Moving Average) and Z-Score statistical methods to detect anomalies in pressure, radiation, and battery metrics. All alerts include confidence scores and supporting evidence.

## Methods

### 1. EWMA (Exponentially Weighted Moving Average)
- **Purpose**: Smooth out noise and track trends
- **Formula**: `EWMA = α × current_value + (1 - α) × previous_EWMA`
- **Alpha (α)**: 0.3 (smoothing factor)
- **Benefits**: More responsive to recent changes, less sensitive to outliers

### 2. Z-Score
- **Purpose**: Measure how many standard deviations a value is from the mean
- **Formula**: `z = (value - mean) / std_dev`
- **Threshold**: 2.5 standard deviations (warning)
- **Critical Threshold**: 3.5 standard deviations (critical)
- **Benefits**: Statistically sound method for detecting outliers

## Monitored Metrics

### 1. Pressure (kPa)
- Tracks atmospheric pressure
- Detects both high and low anomalies
- Minimum 10 samples required for detection

### 2. Radiation (mSv/hr)
- Tracks radiation levels
- Primarily detects spikes (high anomalies)
- Minimum 10 samples required for detection

### 3. Battery (kWh)
- Tracks battery energy storage
- Detects both high (overcharging) and low (rapid discharge) anomalies
- Minimum 10 samples required for detection

## Anomaly Detection Logic

### Detection Process
1. **Update Statistics**: Add new value to history and update statistics
2. **Calculate Z-Score**: `z = (value - mean) / std_dev`
3. **Check Thresholds**:
   - `|z| >= 3.5` → Critical anomaly
   - `|z| >= 2.5` → Warning anomaly
4. **Calculate Confidence**: Based on z-score magnitude
5. **Generate Alert**: With evidence and recommendations

### Confidence Score Calculation
- **Critical (z >= 3.5)**: `0.7 + (z - 3.5) × 0.1` (max 0.99)
- **Warning (z >= 2.5)**: `0.5 + (z - 2.5) × 0.15` (max 0.95)
- Higher z-scores = higher confidence

## Alert Structure

Each anomaly alert includes:

```python
{
    "id": "uuid",
    "timestamp": "ISO datetime",
    "metric": "pressure|radiation|battery",
    "severity": "WARNING|CRITICAL",
    "current_value": float,
    "z_score": float,
    "confidence": float,  # 0.0-1.0
    "evidence": {
        "current_value": float,
        "mean": float,
        "std_dev": float,
        "ewma": float,
        "z_score": float,
        "z_score_threshold": 2.5,
        "z_score_critical": 3.5,
        "deviation_from_mean": float,
        "deviation_percent": float,
        "sample_count": int,
        "min_value": float,
        "max_value": float,
        "anomaly_type": "high|low|spike",
        "statistical_significance": "critical|significant",
        # Additional metric-specific fields
    },
    "message": "Human-readable message",
    "recommendation": "Action recommendation"
}
```

## Supporting Evidence

### Common Evidence Fields
- **current_value**: Current measured value
- **mean**: Historical mean value
- **std_dev**: Standard deviation
- **ewma**: Exponentially weighted moving average
- **z_score**: Calculated z-score
- **deviation_from_mean**: Absolute difference from mean
- **deviation_percent**: Percentage deviation from mean
- **sample_count**: Number of samples used
- **min_value**: Minimum value seen
- **max_value**: Maximum value seen
- **anomaly_type**: Type of anomaly (high/low/spike)
- **statistical_significance**: Critical or significant

### Metric-Specific Evidence
- **Pressure**: Standard fields
- **Radiation**: Includes `ewma_deviation`
- **Battery**: Includes `ewma_deviation` and `charge_rate` (percentage change from EWMA)

## API Endpoints

### Detect Anomalies
```
POST /api/anomaly/detect
```
Manually trigger anomaly detection. Returns detected anomalies with full evidence.

### Get Statistics
```
GET /api/anomaly/statistics
```
Get current statistics (mean, std dev, EWMA) for all monitored metrics.

### Reset Statistics
```
POST /api/anomaly/reset?metric=pressure
```
Reset statistics for a specific metric or all metrics.
- Query param `metric`: "pressure", "radiation", "battery", or omit for all

### Get Configuration
```
GET /api/anomaly/config
```
Get anomaly detection configuration (thresholds, alpha, etc.).

## Example Usage

### Detect Anomalies
```bash
curl -X POST http://localhost:8000/api/anomaly/detect
```

### Get Statistics
```bash
curl http://localhost:8000/api/anomaly/statistics
```

### Reset Statistics
```bash
curl -X POST "http://localhost:8000/api/anomaly/reset?metric=pressure"
```

### Get Configuration
```bash
curl http://localhost:8000/api/anomaly/config
```

## Example Response

```json
{
  "status": "checked",
  "anomalies_detected": 1,
  "anomalies": [
    {
      "id": "uuid-here",
      "timestamp": "2024-01-08T12:00:00",
      "metric": "pressure",
      "severity": "CRITICAL",
      "current_value": 88.5,
      "z_score": -3.8,
      "confidence": 0.93,
      "evidence": {
        "current_value": 88.5,
        "mean": 101.2,
        "std_dev": 3.3,
        "ewma": 100.8,
        "z_score": -3.8,
        "z_score_threshold": 2.5,
        "z_score_critical": 3.5,
        "deviation_from_mean": -12.7,
        "deviation_percent": -12.55,
        "sample_count": 45,
        "min_value": 88.5,
        "max_value": 103.2,
        "anomaly_type": "low",
        "statistical_significance": "critical"
      },
      "message": "Pressure anomaly detected: 88.5 kPa (z-score: -3.80, below mean by 12.70 kPa)",
      "recommendation": "Pressure is abnormally low (12.70 kPa deviation from mean 101.20 kPa). Investigate pressure systems and verify sensor readings."
    }
  ]
}
```

## Automatic Detection

Anomaly detection runs automatically every 10 seconds:
- Updates statistics with current values
- Detects anomalies
- Generates alerts with confidence scores
- Adds alerts to the alerts database

## Configuration

### Thresholds
- **Z-Score Warning**: 2.5 standard deviations
- **Z-Score Critical**: 3.5 standard deviations
- **EWMA Alpha**: 0.3 (smoothing factor)
- **Min Samples Required**: 10 (before detection starts)
- **Max History Size**: 100 samples per metric

### Tuning Recommendations
- **Lower Z-Score Threshold**: More sensitive (more false positives)
- **Higher Z-Score Threshold**: Less sensitive (may miss anomalies)
- **Lower EWMA Alpha**: More smoothing (slower to respond)
- **Higher EWMA Alpha**: Less smoothing (faster to respond)

## Integration

The anomaly detector integrates with:
- **Sensor Simulator**: Gets real-time telemetry
- **SettlementState**: Uses simplified state model
- **Alerts System**: Automatically adds detected anomalies as alerts
- **Safety Layer**: Can work alongside threshold-based safety checks

## Statistical Validity

- Requires minimum 10 samples before detection starts
- Uses rolling window of last 100 samples
- Mean and standard deviation calculated from history
- Z-scores provide statistical significance
- Confidence scores reflect certainty of anomaly

## Best Practices

1. **Warm-up Period**: Allow system to collect 10+ samples before relying on detection
2. **Monitor Statistics**: Regularly check statistics to ensure they're reasonable
3. **Reset When Needed**: Reset statistics if system conditions change significantly
4. **Review Evidence**: Always review supporting evidence before taking action
5. **Combine Methods**: Use alongside threshold-based safety checks for comprehensive monitoring
