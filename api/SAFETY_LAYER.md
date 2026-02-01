# Safety Layer Documentation

## Overview

The Safety Layer monitors critical thresholds and generates alerts and recommendations that require human approval for all critical actions.

## Features

### 1. Pressure Leak Detection
- **Threshold**: Pressure drop > 2% per minute
- **Alert**: `ALERT_PRESSURE_LEAK` (CRITICAL severity)
- **Recommendation**: "Isolate Compartments" (requires human approval)
- **Tracking**: Maintains pressure history over 5 minutes to calculate rate of change

### 2. Radiation Spike Detection
- **Spike Threshold**: > 0.1 mSv/hr above baseline
- **Critical Threshold**: ≥ 0.5 mSv/hr
- **Alerts**:
  - `ALERT_RADIATION_SPIKE` (WARNING) - when spike detected
  - `ALERT_RADIATION_CRITICAL` (CRITICAL) - when critical level reached
- **Recommendations**:
  - "Prepare Storm Shelter" (for spikes)
  - "Activate Storm Shelter Protocol" (for critical levels)
- **Tracking**: Maintains baseline radiation level and detects deviations

### 3. Critical Pressure Level
- **Threshold**: Pressure < 90.0 kPa
- **Alert**: `ALERT_PRESSURE_CRITICAL` (CRITICAL severity)
- **Recommendation**: "Immediate Evacuation Required" (requires human approval)

### 4. Human Approval System
- All critical actions require explicit human approval
- Approval tracking with:
  - Who approved
  - When approved
  - Approval status
- Pending approvals can be queried
- Actions cannot be executed without approval

## API Endpoints

### Safety Check
```
POST /api/safety/check
```
Manually trigger a safety check. Returns generated alerts and recommendations.

### Get Pending Approvals
```
GET /api/safety/pending-approvals
```
Get all critical actions awaiting human approval.

### Get Approval Status
```
GET /api/safety/approval/{recommendation_id}
```
Get approval status for a specific recommendation.

### Approve Action
```
POST /api/safety/approve/{recommendation_id}
Body: { "approved_by": "username" }
```
Approve a critical action. Requires `approved_by` field.

### Get Thresholds
```
GET /api/safety/thresholds
```
Get current safety threshold values.

## Thresholds

### Pressure
- **Leak Threshold**: 2.0% per minute
- **Critical Threshold**: 90.0 kPa

### Radiation
- **Spike Threshold**: 0.1 mSv/hr above baseline
- **Critical Threshold**: 0.5 mSv/hr

## Automatic Monitoring

The safety layer runs automatically every 5 seconds, checking:
1. Pressure leak detection (rate of change)
2. Critical pressure levels
3. Radiation spikes
4. Critical radiation levels

All generated alerts and recommendations are automatically added to the alerts and recommendations databases.

## Example Usage

### Check Safety
```bash
curl -X POST http://localhost:8000/api/safety/check
```

### Get Pending Approvals
```bash
curl http://localhost:8000/api/safety/pending-approvals
```

### Approve Action
```bash
curl -X POST http://localhost:8000/api/safety/approve/{recommendation_id} \
  -H "Content-Type: application/json" \
  -d '{"approved_by": "commander_smith"}'
```

### Get Thresholds
```bash
curl http://localhost:8000/api/safety/thresholds
```

## Alert Types

- `ALERT_PRESSURE_LEAK`: Pressure dropping faster than 2% per minute
- `ALERT_PRESSURE_CRITICAL`: Pressure below 90 kPa
- `ALERT_RADIATION_SPIKE`: Radiation spike detected
- `ALERT_RADIATION_CRITICAL`: Radiation at critical level (≥0.5 mSv/hr)

## Recommendations Requiring Approval

1. **ISOLATE_COMPARTMENTS**: Pressure leak detected
2. **PREPARE_STORM_SHELTER**: Radiation spike detected
3. **ACTIVATE_STORM_SHELTER**: Critical radiation level
4. **IMMEDIATE_EVACUATION**: Critical pressure level

## Implementation Details

- **PressureHistory**: Tracks pressure readings over time to calculate rate of change
- **RadiationHistory**: Maintains baseline and detects spikes
- **SafetyLayer**: Main monitoring class with threshold checking
- **Approval System**: Tracks all pending and approved critical actions

All critical actions are blocked until human approval is received.
