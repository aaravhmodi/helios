from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum
from dataclasses import dataclass

# System State Models
class AtmosphereState(BaseModel):
    oxygen_level: float = 21.0  # percentage
    co2_level: float = 0.04  # percentage
    pressure: float = 14.7  # psi
    temperature: float = 20.0  # Celsius
    humidity: float = 50.0  # percentage

class LifeSupportState(BaseModel):
    water_recovery_rate: float = 98.0  # percentage
    waste_processing_efficiency: float = 95.0  # percentage
    air_quality_index: float = 95.0  # 0-100

class PowerState(BaseModel):
    solar_generation: float = 1000.0  # kW
    battery_charge: float = 80.0  # percentage
    power_consumption: float = 800.0  # kW
    energy_storage_level: float = 80.0  # percentage

class RadiationState(BaseModel):
    radiation_level: float = 0.5  # mSv/day
    shielding_effectiveness: float = 95.0  # percentage

class AgricultureState(BaseModel):
    crop_health: float = 85.0  # percentage
    nutrient_levels: float = 80.0  # percentage
    harvest_readiness: float = 60.0  # percentage

class StructuralState(BaseModel):
    rotation_rate: float = 1.9  # RPM
    structural_integrity: float = 98.0  # percentage
    module_pressure: float = 14.7  # psi

class SystemState(BaseModel):
    atmosphere: AtmosphereState = AtmosphereState()
    life_support: LifeSupportState = LifeSupportState()
    power: PowerState = PowerState()
    radiation: RadiationState = RadiationState()
    agriculture: AgricultureState = AgricultureState()
    structural: StructuralState = StructuralState()

# Alert Models
class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

class Alert(BaseModel):
    id: str
    timestamp: datetime
    severity: AlertSeverity
    category: str
    message: str
    system: str
    resolved: bool = False

# Recommendation Models
class Recommendation(BaseModel):
    id: str
    timestamp: datetime
    priority: str  # "low", "medium", "high"
    category: str
    title: str
    description: str
    action_required: bool = False

# Audit Log Models
class AuditLogEntry(BaseModel):
    id: str
    timestamp: datetime
    user: Optional[str] = None
    action: str
    resource: str
    status: str  # "success", "failure", "pending"
    details: Optional[str] = None

# Settlement State Dataclass
@dataclass
class SettlementState:
    """Settlement state dataclass with key telemetry metrics"""
    o2_pct: float = 21.0  # Oxygen percentage
    co2_ppm: float = 400.0  # CO2 parts per million
    pressure_kpa: float = 101.325  # Pressure in kilopascals (standard atmospheric pressure)
    temp_c: float = 20.0  # Temperature in Celsius
    humidity_pct: float = 50.0  # Humidity percentage
    solar_kw: float = 1000.0  # Solar power generation in kilowatts
    battery_kwh: float = 500.0  # Battery energy storage in kilowatt-hours
    load_kw: float = 800.0  # Power load/consumption in kilowatts
    crop_health_index: float = 85.0  # Crop health index (0-100)
    radiation_msv_hr: float = 0.02  # Radiation in millisieverts per hour
    strain_index: float = 0.5  # Structural strain index (0-1, where 1 is maximum strain)

def update_settlement_state_from_telemetry(state: SettlementState, telemetry: dict) -> SettlementState:
    """
    Update SettlementState from telemetry message dictionary.
    
    Args:
        state: Current SettlementState instance
        telemetry: Dictionary containing telemetry data with keys matching the structure
        
    Returns:
        Updated SettlementState instance
    """
    # Extract atmosphere data
    if "atmosphere" in telemetry:
        atm = telemetry["atmosphere"]
        state.o2_pct = atm.get("oxygen_level", state.o2_pct)
        # Convert CO2 percentage to PPM (if needed)
        co2_level = atm.get("co2_level", state.co2_ppm / 10000.0)
        state.co2_ppm = co2_level * 10000.0 if co2_level < 1.0 else co2_level
        # Convert pressure from psi to kPa (1 psi = 6.89476 kPa)
        pressure_psi = atm.get("pressure", state.pressure_kpa / 6.89476)
        state.pressure_kpa = pressure_psi * 6.89476
        state.temp_c = atm.get("temperature", state.temp_c)
        state.humidity_pct = atm.get("humidity", state.humidity_pct)
    
    # Extract power data
    if "power" in telemetry:
        power = telemetry["power"]
        state.solar_kw = power.get("solar_generation", state.solar_kw)
        # Convert battery percentage to kWh (assuming 500 kWh is 100%)
        battery_pct = power.get("battery_charge", (state.battery_kwh / 500.0) * 100.0)
        state.battery_kwh = (battery_pct / 100.0) * 500.0
        state.load_kw = power.get("power_consumption", state.load_kw)
    
    # Extract agriculture data
    if "agriculture" in telemetry:
        ag = telemetry["agriculture"]
        state.crop_health_index = ag.get("crop_health", state.crop_health_index)
    
    # Extract radiation data
    if "radiation" in telemetry:
        rad = telemetry["radiation"]
        # Convert mSv/day to mSv/hr
        rad_day = rad.get("radiation_level", state.radiation_msv_hr * 24.0)
        state.radiation_msv_hr = rad_day / 24.0
    
    # Extract structural data for strain index
    if "structural" in telemetry:
        struct = telemetry["structural"]
        # Calculate strain index from structural integrity (inverse relationship)
        # 100% integrity = 0 strain, 0% integrity = 1.0 strain
        integrity = struct.get("structural_integrity", 100.0 - (state.strain_index * 100.0))
        state.strain_index = max(0.0, min(1.0, (100.0 - integrity) / 100.0))
    
    return state
