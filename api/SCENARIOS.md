# Scenario Replay Mode Documentation

## Overview

The scenario engine provides replay mode for predefined emergency scenarios. Scenarios modify sensor readings to simulate real-world emergency conditions, allowing testing of alert systems, safety protocols, and operator responses.

## Available Scenarios

### 1. Radiation Storm Scenario

**Description**: Simulates a solar radiation storm with dramatic radiation spike.

**Behavior**:
- Radiation levels spike exponentially over 60 seconds
- Peak at 2.0 mSv/hr (100x normal baseline of 0.02 mSv/hr)
- Gradual exponential decline over remaining duration
- Shielding effectiveness decreases during storm
- Triggers radiation alerts and storm shelter recommendations

**Parameters**:
- Duration: 60-1800 seconds (default: 300 seconds)
- Peak time: 60 seconds
- Peak radiation: 2.0 mSv/hr

**Triggers**:
- `ALERT_RADIATION_SPIKE` (warning)
- `ALERT_RADIATION_CRITICAL` (critical)
- Storm shelter recommendations

### 2. Pressure Leak Scenario

**Description**: Simulates a critical pressure leak at 2% per minute.

**Behavior**:
- Pressure drops exponentially at 2% per minute (critical leak rate)
- Continues for specified duration
- CO2 levels gradually increase after 30 seconds (less efficient scrubbing)
- Pressure minimum: 10 psi (prevents going below critical threshold)
- Triggers pressure leak alerts and compartment isolation recommendations

**Parameters**:
- Duration: 60-600 seconds (default: 180 seconds)
- Leak rate: 2% per minute
- Minimum pressure: 10 psi

**Triggers**:
- `ALERT_PRESSURE_LEAK` (critical)
- `ALERT_PRESSURE_CRITICAL` (if pressure drops below 90 kPa)
- Compartment isolation recommendations

## API Endpoints

### Start Radiation Storm
```
POST /api/scenarios/radiation-storm?duration=300
```
Start radiation storm scenario with optional duration (60-1800 seconds).

### Start Pressure Leak
```
POST /api/scenarios/pressure-leak?duration=180
```
Start pressure leak scenario with optional duration (60-600 seconds).

### Stop Scenario
```
POST /api/scenarios/stop
```
Stop the currently running scenario and restore normal sensor readings.

### Get Scenario Status
```
GET /api/scenarios/status
```
Get current scenario status including:
- Active scenario name
- Elapsed time
- Remaining time
- Progress percentage

### List Scenarios
```
GET /api/scenarios/list
```
List all available scenarios with descriptions and parameters.

## Example Usage

### Start Radiation Storm
```bash
curl -X POST "http://localhost:8000/api/scenarios/radiation-storm?duration=300"
```

### Start Pressure Leak
```bash
curl -X POST "http://localhost:8000/api/scenarios/pressure-leak?duration=180"
```

### Check Status
```bash
curl http://localhost:8000/api/scenarios/status
```

### Stop Scenario
```bash
curl -X POST http://localhost:8000/api/scenarios/stop
```

## Scenario Lifecycle

1. **Start**: Scenario begins, original state is saved
2. **Execution**: Sensor readings are modified according to scenario
3. **Monitoring**: Alerts and recommendations are generated automatically
4. **End**: Scenario completes or is stopped, original state is restored

## Audit Logging

All scenario actions are logged to the append-only audit log:
- Scenario start (with duration)
- Scenario end (with actual duration)
- Scenario stop (if manually stopped)

## Integration

Scenarios integrate with:
- **Sensor Simulator**: Modifies sensor readings in real-time
- **Safety Layer**: Triggers alerts based on thresholds
- **Anomaly Detector**: Detects statistical anomalies
- **Decision Engine**: Generates recommendations
- **Audit Logger**: Logs all scenario actions

## Best Practices

1. **Test Scenarios**: Run scenarios in test environments first
2. **Monitor Alerts**: Watch for alerts and recommendations during scenarios
3. **Stop When Needed**: Use stop endpoint if scenario needs to be interrupted
4. **Review Logs**: Check audit logs after scenario completion
5. **Duration Limits**: Respect duration limits to prevent system overload

## Scenario Restoration

When a scenario ends (naturally or stopped):
- Original sensor readings are restored
- Normal sensor variation resumes
- Alerts and recommendations continue based on current state
