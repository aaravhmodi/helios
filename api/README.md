# HELIOS Space Settlement API

FastAPI backend for HELIOS space settlement monitoring and management system.

## Features

- **Sensor Simulator**: Real-time telemetry streaming at 1 Hz
- **RESTful API**: Comprehensive endpoints for system monitoring
- **WebSocket Support**: Real-time telemetry streaming
- **Server-Sent Events**: Alternative streaming method
- **Alert System**: Automated alert generation based on sensor readings
- **Recommendations**: AI-powered recommendations for system optimization
- **Audit Logging**: Complete audit trail of all system actions

## Project Structure

```
api/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── README.md              # This file
└── app/
    ├── sensor_simulator.py    # Sensor simulation engine
    ├── models.py              # Pydantic models
    └── routers/
        ├── __init__.py
        ├── state.py           # /api/state endpoint
        ├── alerts.py           # /api/alerts endpoint
        ├── recommendations.py  # /api/recommendations endpoint
        └── audit_log.py       # /api/audit-log endpoint
```

## Installation

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

### Development Server

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

### API Documentation

Once running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Telemetry

- `GET /telemetry` - Get current telemetry snapshot
- `GET /stream/telemetry` - Server-Sent Events stream (1 Hz)
- `WS /ws/telemetry` - WebSocket stream (1 Hz)

### System State

- `GET /api/state` - Get complete system state
- `GET /api/state/{system}` - Get state for specific system
  - Systems: `atmosphere`, `life_support`, `power`, `radiation`, `agriculture`, `structural`

### Alerts

- `GET /api/alerts` - Get all alerts (with filters)
  - Query params: `severity`, `system`, `resolved`, `limit`
- `GET /api/alerts/{alert_id}` - Get specific alert
- `POST /api/alerts/{alert_id}/resolve` - Resolve an alert

### Recommendations

- `GET /api/recommendations` - Get all recommendations (with filters)
  - Query params: `priority`, `category`, `action_required`, `limit`
- `GET /api/recommendations/{recommendation_id}` - Get specific recommendation

### Audit Log

- `GET /api/audit-log` - Get audit log entries (with filters)
  - Query params: `user`, `action`, `resource`, `status`, `limit`, `offset`
- `GET /api/audit-log/{entry_id}` - Get specific audit log entry
- `POST /api/audit-log` - Create new audit log entry

## Example Usage

### Get Current System State

```bash
curl http://localhost:8000/api/state
```

### Stream Telemetry (SSE)

```bash
curl http://localhost:8000/stream/telemetry
```

### Get Active Alerts

```bash
curl http://localhost:8000/api/alerts?resolved=false&severity=critical
```

### Get High Priority Recommendations

```bash
curl http://localhost:8000/api/recommendations?priority=high&action_required=true
```

### Get Audit Log

```bash
curl http://localhost:8000/api/audit-log?limit=50&status=success
```

## WebSocket Example (JavaScript)

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/telemetry');

ws.onmessage = (event) => {
    const telemetry = JSON.parse(event.data);
    console.log('Telemetry:', telemetry);
};
```

## Sensor Data Structure

The sensor simulator generates data for:

- **Atmosphere**: Oxygen, CO2, pressure, temperature, humidity
- **Life Support**: Water recovery, waste processing, air quality
- **Power**: Solar generation, battery charge, consumption, storage
- **Radiation**: Radiation levels, shielding effectiveness
- **Agriculture**: Crop health, nutrient levels, harvest readiness
- **Structural**: Rotation rate, structural integrity, module pressure

## Development

### Adding New Sensors

1. Add sensor fields to `app/models.py` in the appropriate state model
2. Update `app/sensor_simulator.py` to simulate the new sensor
3. Add alert/recommendation logic in respective routers if needed

### Adding New Endpoints

1. Create a new router file in `app/routers/`
2. Import and include the router in `main.py`

## Production Considerations

- Replace in-memory storage with a database (PostgreSQL, MongoDB, etc.)
- Add authentication and authorization
- Implement rate limiting
- Add comprehensive error handling
- Set up monitoring and logging
- Use environment variables for configuration
- Add unit and integration tests

## License

MIT
