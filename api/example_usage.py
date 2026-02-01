"""
Example usage of SettlementState and update_settlement_state_from_telemetry
"""

from app.models import SettlementState, update_settlement_state_from_telemetry

# Create initial settlement state
state = SettlementState()

# Example telemetry message (matches the structure from sensor_simulator)
telemetry_message = {
    "timestamp": "2024-01-08T12:00:00",
    "atmosphere": {
        "oxygen_level": 21.5,
        "co2_level": 0.04,
        "pressure": 14.7,  # psi
        "temperature": 20.5,
        "humidity": 52.0
    },
    "power": {
        "solar_generation": 1050.0,  # kW
        "battery_charge": 85.0,  # percentage
        "power_consumption": 820.0,  # kW
        "energy_storage_level": 85.0
    },
    "agriculture": {
        "crop_health": 88.0,
        "nutrient_levels": 82.0,
        "harvest_readiness": 65.0
    },
    "radiation": {
        "radiation_level": 0.5,  # mSv/day
        "shielding_effectiveness": 96.0
    },
    "structural": {
        "rotation_rate": 1.9,
        "structural_integrity": 98.5,  # percentage
        "module_pressure": 14.7
    }
}

# Update state from telemetry
updated_state = update_settlement_state_from_telemetry(state, telemetry_message)

# Print updated values
print("Updated Settlement State:")
print(f"  O2: {updated_state.o2_pct}%")
print(f"  CO2: {updated_state.co2_ppm} ppm")
print(f"  Pressure: {updated_state.pressure_kpa} kPa")
print(f"  Temperature: {updated_state.temp_c}°C")
print(f"  Humidity: {updated_state.humidity_pct}%")
print(f"  Solar: {updated_state.solar_kw} kW")
print(f"  Battery: {updated_state.battery_kwh} kWh")
print(f"  Load: {updated_state.load_kw} kW")
print(f"  Crop Health: {updated_state.crop_health_index}")
print(f"  Radiation: {updated_state.radiation_msv_hr} mSv/hr")
print(f"  Strain Index: {updated_state.strain_index}")
