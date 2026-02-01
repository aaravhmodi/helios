# Decision Engine Documentation

## Overview

The Decision Engine generates ranked, explainable recommendations for life support and energy dispatch systems. All recommendations include detailed reasoning that references current values and thresholds.

## Features

### 1. Life Support Recommendations
Monitors and recommends actions for:
- **Oxygen (O2)**: Generation adjustments based on percentage levels
- **CO2**: Scrubbing adjustments based on PPM levels
- **Pressure**: Atmospheric pressure adjustments
- **Temperature**: Heating/cooling recommendations
- **Humidity**: Humidification/dehumidification recommendations
- **Crop Health**: Agriculture system optimization

### 2. Energy Dispatch Recommendations
Monitors and recommends actions for:
- **Battery Storage**: Charging/discharging strategies
- **Solar Generation**: Load management during low generation
- **Power Load**: Load optimization and reduction
- **Energy Balance**: Overall supply/demand balance

### 3. Explainable Reasoning
Every recommendation includes:
- **Current Value**: Actual measured value
- **Threshold Value**: Target or limit value
- **Deviation**: Difference between current and threshold
- **Reasoning**: Detailed explanation of why the recommendation is needed
- **Estimated Effect**: Expected outcome of the action
- **Confidence**: Confidence level (0.0-1.0)

### 4. Priority Ranking
Recommendations are ranked by priority (1-10) based on:
- Deviation from threshold
- Impact level (critical, high, medium, low)
- Critical flag status

## Priority Calculation

Priority scores (1-10) are calculated using:
1. **Base Priority**: 5
2. **Deviation Adjustment**: 
   - >20% deviation: +3
   - >10% deviation: +2
   - >5% deviation: +1
3. **Impact Multiplier**:
   - Critical: 2x
   - High: 1.5x
   - Medium: 1.0x
   - Low: 0.5x
4. **Critical Flag**: +2 if critical

## Thresholds

### Life Support Thresholds
```python
o2_min: 20.0%              # Minimum safe oxygen
o2_optimal_min: 20.5%      # Optimal range minimum
o2_optimal_max: 21.5%      # Optimal range maximum
co2_max: 500.0 ppm         # Maximum safe CO2
co2_warning: 450.0 ppm     # Warning level
pressure_min: 95.0 kPa     # Minimum safe pressure
pressure_optimal_min: 98.0 kPa
pressure_optimal_max: 103.0 kPa
temp_min: 18.0°C           # Minimum comfortable
temp_max: 22.0°C           # Maximum comfortable
humidity_min: 40.0%        # Minimum comfortable
humidity_max: 60.0%        # Maximum comfortable
crop_health_min: 75.0      # Minimum acceptable
crop_health_optimal: 85.0  # Optimal level
```

### Energy Thresholds
```python
battery_min: 30.0 kWh      # Critical low
battery_warning: 50.0 kWh  # Warning level
battery_optimal_min: 60.0 kWh
battery_optimal_max: 90.0 kWh
solar_min: 500.0 kW        # Minimum acceptable generation
load_max: 900.0 kW         # Maximum safe load
load_optimal_max: 850.0 kW # Optimal maximum load
energy_reserve_min: 0.2    # 20% minimum reserve
```

## API Endpoints

### Get All Recommendations
```
GET /api/decisions/recommendations
Query params:
  - category: "life_support" or "energy_dispatch" (optional)
  - min_priority: Minimum priority (1-10, default: 1)
```

### Get Life Support Recommendations
```
GET /api/decisions/recommendations/life-support
Query params:
  - min_priority: Minimum priority (1-10, default: 1)
```

### Get Energy Dispatch Recommendations
```
GET /api/decisions/recommendations/energy-dispatch
Query params:
  - min_priority: Minimum priority (1-10, default: 1)
```

### Get Comprehensive Analysis
```
GET /api/decisions/analysis
```
Returns current state, summary, and all recommendations categorized.

### Get Thresholds
```
GET /api/decisions/thresholds
```
Returns all decision engine thresholds.

## Example Usage

### Get All Recommendations
```bash
curl http://localhost:8000/api/decisions/recommendations
```

### Get High Priority Life Support Recommendations
```bash
curl "http://localhost:8000/api/decisions/recommendations/life-support?min_priority=7"
```

### Get Energy Dispatch Recommendations
```bash
curl http://localhost:8000/api/decisions/recommendations/energy-dispatch
```

### Get Comprehensive Analysis
```bash
curl http://localhost:8000/api/decisions/analysis
```

## Example Recommendation Response

```json
{
  "id": "uuid-here",
  "priority": 9,
  "category": "life_support",
  "action": "INCREASE_O2_GENERATION",
  "title": "Critical: Increase Oxygen Generation",
  "description": "Oxygen level is below minimum safe threshold. Immediate action required.",
  "reasoning": "Current O2: 19.5% is below critical threshold of 20.0% (deviation: -0.5%). Life support systems must increase O2 generation immediately to prevent hypoxia risk.",
  "current_value": 19.5,
  "threshold_value": 20.0,
  "impact": "critical",
  "estimated_effect": "Will restore O2 to safe levels within 5-10 minutes",
  "confidence": 0.95
}
```

## Recommendation Actions

### Life Support Actions
- `INCREASE_O2_GENERATION` - Increase oxygen production
- `REDUCE_O2_GENERATION` - Reduce oxygen production
- `INCREASE_CO2_SCRUBBING` - Increase CO2 removal
- `INCREASE_PRESSURE` - Increase atmospheric pressure
- `REDUCE_PRESSURE` - Reduce atmospheric pressure
- `INCREASE_TEMPERATURE` - Activate heating
- `DECREASE_TEMPERATURE` - Activate cooling
- `INCREASE_HUMIDITY` - Activate humidification
- `DECREASE_HUMIDITY` - Activate dehumidification
- `IMPROVE_CROP_HEALTH` - Improve agriculture systems
- `OPTIMIZE_CROP_HEALTH` - Optimize agriculture systems

### Energy Dispatch Actions
- `PRIORITIZE_CHARGING` - Prioritize battery charging
- `INCREASE_CHARGING` - Increase battery charging
- `OPTIMIZE_CHARGING` - Optimize battery charging
- `CHARGE_BATTERY` - Charge battery with surplus
- `INCREASE_LOAD` - Increase power load
- `REDUCE_LOAD` - Reduce power load
- `OPTIMIZE_LOAD` - Optimize load distribution
- `REDUCE_NON_ESSENTIAL_LOAD` - Reduce non-essential loads
- `EMERGENCY_LOAD_SHEDDING` - Emergency load reduction
- `REDUCE_LOAD_OR_INCREASE_GENERATION` - Balance energy

## Decision Logic

### Life Support Decision Flow
1. Check if value is below critical threshold → Generate critical recommendation
2. Check if value is below optimal minimum → Generate high priority recommendation
3. Check if value is above optimal maximum → Generate medium/low priority recommendation
4. Include reasoning with current value, threshold, and deviation

### Energy Dispatch Decision Flow
1. Analyze battery levels → Generate charging/discharging recommendations
2. Analyze solar generation → Generate load management recommendations
3. Analyze power load → Generate load optimization recommendations
4. Analyze energy balance → Generate supply/demand balance recommendations
5. Include reasoning with current values, thresholds, and calculations

## Integration

The decision engine integrates with:
- **Sensor Simulator**: Gets current telemetry data
- **SettlementState**: Uses simplified state model
- **Safety Layer**: Can work alongside safety monitoring
- **Alerts System**: Recommendations can trigger alerts

## Performance

- Recommendations are generated in real-time
- All calculations are deterministic
- Priority ranking ensures critical issues are addressed first
- Explainable reasoning helps operators understand decisions
