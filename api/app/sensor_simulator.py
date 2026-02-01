import asyncio
import random
from datetime import datetime
from typing import Dict, Any
from app.models import SystemState

# Singleton instance
_sensor_simulator_instance = None

def get_sensor_simulator() -> 'SensorSimulator':
    """Get the singleton sensor simulator instance"""
    global _sensor_simulator_instance
    if _sensor_simulator_instance is None:
        _sensor_simulator_instance = SensorSimulator()
    return _sensor_simulator_instance

class SensorSimulator:
    """Simulates space settlement sensors and generates telemetry data at 1 Hz"""
    
    def __init__(self):
        self.running = False
        self.current_state = SystemState()
        self._task = None
        
    def get_current_state(self) -> Dict[str, Any]:
        """Get current sensor readings"""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "atmosphere": {
                "oxygen_level": round(self.current_state.atmosphere.oxygen_level, 2),
                "co2_level": round(self.current_state.atmosphere.co2_level, 4),
                "pressure": round(self.current_state.atmosphere.pressure, 2),
                "temperature": round(self.current_state.atmosphere.temperature, 2),
                "humidity": round(self.current_state.atmosphere.humidity, 2)
            },
            "life_support": {
                "water_recovery_rate": round(self.current_state.life_support.water_recovery_rate, 2),
                "waste_processing_efficiency": round(self.current_state.life_support.waste_processing_efficiency, 2),
                "air_quality_index": round(self.current_state.life_support.air_quality_index, 2)
            },
            "power": {
                "solar_generation": round(self.current_state.power.solar_generation, 2),
                "battery_charge": round(self.current_state.power.battery_charge, 2),
                "power_consumption": round(self.current_state.power.power_consumption, 2),
                "energy_storage_level": round(self.current_state.power.energy_storage_level, 2)
            },
            "radiation": {
                "radiation_level": round(self.current_state.radiation.radiation_level, 4),
                "shielding_effectiveness": round(self.current_state.radiation.shielding_effectiveness, 2)
            },
            "agriculture": {
                "crop_health": round(self.current_state.agriculture.crop_health, 2),
                "nutrient_levels": round(self.current_state.agriculture.nutrient_levels, 2),
                "harvest_readiness": round(self.current_state.agriculture.harvest_readiness, 2)
            },
            "structural": {
                "rotation_rate": round(self.current_state.structural.rotation_rate, 2),
                "structural_integrity": round(self.current_state.structural.structural_integrity, 2),
                "module_pressure": round(self.current_state.structural.module_pressure, 2)
            }
        }
    
    async def _update_sensors(self):
        """Continuously update sensor readings"""
        while self.running:
            # Simulate realistic sensor variations
            self._update_atmosphere()
            self._update_life_support()
            self._update_power()
            self._update_radiation()
            self._update_agriculture()
            self._update_structural()
            
            await asyncio.sleep(1.0)  # Update at 1 Hz
    
    def _update_atmosphere(self):
        """Update atmosphere sensor readings"""
        # Oxygen: target 21%, vary ±0.5%
        self.current_state.atmosphere.oxygen_level = max(19.0, min(23.0, 
            21.0 + random.gauss(0, 0.3)))
        
        # CO2: target 0.04%, vary ±0.01%
        self.current_state.atmosphere.co2_level = max(0.03, min(0.05,
            0.04 + random.gauss(0, 0.005)))
        
        # Pressure: target 14.7 psi, vary ±0.2 psi
        self.current_state.atmosphere.pressure = max(14.0, min(15.5,
            14.7 + random.gauss(0, 0.1)))
        
        # Temperature: target 20°C, vary ±2°C
        self.current_state.atmosphere.temperature = max(18.0, min(22.0,
            20.0 + random.gauss(0, 1.0)))
        
        # Humidity: target 50%, vary ±5%
        self.current_state.atmosphere.humidity = max(45.0, min(55.0,
            50.0 + random.gauss(0, 2.5)))
    
    def _update_life_support(self):
        """Update life support system readings"""
        # Water recovery: target 98%, vary ±1%
        self.current_state.life_support.water_recovery_rate = max(96.0, min(99.5,
            98.0 + random.gauss(0, 0.5)))
        
        # Waste processing: target 95%, vary ±2%
        self.current_state.life_support.waste_processing_efficiency = max(92.0, min(97.0,
            95.0 + random.gauss(0, 1.0)))
        
        # Air quality: target 95, vary ±3
        self.current_state.life_support.air_quality_index = max(90.0, min(100.0,
            95.0 + random.gauss(0, 2.0)))
    
    def _update_power(self):
        """Update power system readings"""
        # Solar generation: target 1 MW, vary ±50 kW (day/night cycle simulation)
        base_power = 1000.0
        time_factor = 0.7 + 0.3 * abs(random.gauss(0, 0.3))  # Simulate day/night
        self.current_state.power.solar_generation = max(0.0, min(1100.0,
            base_power * time_factor + random.gauss(0, 30.0)))
        
        # Battery charge: target 80%, vary ±10%
        self.current_state.power.battery_charge = max(60.0, min(100.0,
            80.0 + random.gauss(0, 5.0)))
        
        # Power consumption: target 800 kW, vary ±50 kW
        self.current_state.power.power_consumption = max(700.0, min(900.0,
            800.0 + random.gauss(0, 30.0)))
        
        # Energy storage: target 80%, vary ±5%
        self.current_state.power.energy_storage_level = max(70.0, min(95.0,
            80.0 + random.gauss(0, 3.0)))
    
    def _update_radiation(self):
        """Update radiation sensor readings"""
        # Radiation level: target 0.5 mSv/day, vary ±0.1 mSv
        self.current_state.radiation.radiation_level = max(0.3, min(0.7,
            0.5 + random.gauss(0, 0.05)))
        
        # Shielding effectiveness: target 95%, vary ±2%
        self.current_state.radiation.shielding_effectiveness = max(92.0, min(98.0,
            95.0 + random.gauss(0, 1.0)))
    
    def _update_agriculture(self):
        """Update agriculture system readings"""
        # Crop health: target 85%, vary ±5%
        self.current_state.agriculture.crop_health = max(75.0, min(95.0,
            85.0 + random.gauss(0, 3.0)))
        
        # Nutrient levels: target 80%, vary ±8%
        self.current_state.agriculture.nutrient_levels = max(70.0, min(90.0,
            80.0 + random.gauss(0, 4.0)))
        
        # Harvest readiness: target 60%, vary ±10%
        self.current_state.agriculture.harvest_readiness = max(40.0, min(80.0,
            60.0 + random.gauss(0, 5.0)))
    
    def _update_structural(self):
        """Update structural system readings"""
        # Rotation rate: target 1.9 RPM, vary ±0.05 RPM
        self.current_state.structural.rotation_rate = max(1.85, min(1.95,
            1.9 + random.gauss(0, 0.02)))
        
        # Structural integrity: target 98%, vary ±1%
        self.current_state.structural.structural_integrity = max(96.0, min(100.0,
            98.0 + random.gauss(0, 0.5)))
        
        # Module pressure: target 14.7 psi, vary ±0.1 psi
        self.current_state.structural.module_pressure = max(14.5, min(14.9,
            14.7 + random.gauss(0, 0.05)))
    
    async def run(self):
        """Start the sensor simulator"""
        if not self.running:
            self.running = True
            self._task = asyncio.create_task(self._update_sensors())
    
    def stop(self):
        """Stop the sensor simulator"""
        self.running = False
        if self._task:
            self._task.cancel()
