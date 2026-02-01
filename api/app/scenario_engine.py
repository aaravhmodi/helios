"""
Scenario Engine: Replay mode for predefined scenarios
"""
import asyncio
import copy
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from app.sensor_simulator import SensorSimulator
from app.audit_logger import get_audit_logger
import math

class ScenarioEngine:
    """Engine for running predefined scenarios"""
    
    def __init__(self, sensor_simulator: SensorSimulator):
        self.sensor_simulator = sensor_simulator
        self.audit_logger = get_audit_logger()
        self.active_scenario: Optional[str] = None
        self.scenario_start_time: Optional[datetime] = None
        self.scenario_duration: float = 0.0
        self.original_state = None
        self._scenario_task: Optional[asyncio.Task] = None
    
    async def run_radiation_storm_scenario(self, duration_seconds: float = 300.0):
        """
        Run radiation storm scenario
        
        Scenario:
        - Radiation levels spike dramatically over 60 seconds
        - Peak at 2.0 mSv/hr (40x normal)
        - Gradual decline over remaining duration
        - Triggers alerts and recommendations
        """
        if self.active_scenario:
            raise ValueError(f"Scenario '{self.active_scenario}' is already running")
        
        self.active_scenario = "radiation_storm"
        self.scenario_start_time = datetime.utcnow()
        self.scenario_duration = duration_seconds
        
        # Log scenario start
        self.audit_logger.log(
            user="system",
            action="SCENARIO_START",
            resource="sensor_simulator",
            status="success",
            details={
                "scenario": "radiation_storm",
                "duration_seconds": duration_seconds
            }
        )
        
        # Save original state (deep copy)
        self.original_state = copy.deepcopy(self.sensor_simulator.current_state)
        
        # Run scenario
        self._scenario_task = asyncio.create_task(
            self._execute_radiation_storm(duration_seconds)
        )
        
        return {
            "status": "started",
            "scenario": "radiation_storm",
            "duration_seconds": duration_seconds
        }
    
    async def run_pressure_leak_scenario(self, duration_seconds: float = 180.0):
        """
        Run pressure leak scenario
        
        Scenario:
        - Pressure drops at 2% per minute (critical leak rate)
        - Continues for specified duration
        - Triggers pressure leak alerts
        - Requires compartment isolation
        """
        if self.active_scenario:
            raise ValueError(f"Scenario '{self.active_scenario}' is already running")
        
        self.active_scenario = "pressure_leak"
        self.scenario_start_time = datetime.utcnow()
        self.scenario_duration = duration_seconds
        
        # Log scenario start
        self.audit_logger.log(
            user="system",
            action="SCENARIO_START",
            resource="sensor_simulator",
            status="success",
            details={
                "scenario": "pressure_leak",
                "duration_seconds": duration_seconds
            }
        )
        
        # Save original state (deep copy)
        self.original_state = copy.deepcopy(self.sensor_simulator.current_state)
        
        # Run scenario
        self._scenario_task = asyncio.create_task(
            self._execute_pressure_leak(duration_seconds)
        )
        
        return {
            "status": "started",
            "scenario": "pressure_leak",
            "duration_seconds": duration_seconds
        }
    
    async def _execute_radiation_storm(self, duration_seconds: float):
        """Execute radiation storm scenario"""
        start_time = datetime.utcnow()
        peak_time = 60.0  # Peak at 60 seconds
        base_radiation = 0.02  # Normal: 0.02 mSv/hr
        peak_radiation = 2.0  # Peak: 2.0 mSv/hr (100x normal)
        
        try:
            while True:
                elapsed = (datetime.utcnow() - start_time).total_seconds()
                
                if elapsed >= duration_seconds:
                    break
                
                # Calculate radiation level based on time
                if elapsed < peak_time:
                    # Rising phase: exponential rise to peak
                    progress = elapsed / peak_time
                    # Exponential curve: e^(x*ln(peak/base))
                    factor = math.exp(progress * math.log(peak_radiation / base_radiation))
                    radiation = base_radiation * factor
                else:
                    # Declining phase: exponential decay
                    decline_time = elapsed - peak_time
                    decline_duration = duration_seconds - peak_time
                    progress = decline_time / decline_duration
                    # Exponential decay
                    radiation = peak_radiation * math.exp(-progress * 2.0)
                
                # Apply radiation spike
                self.sensor_simulator.current_state.radiation.radiation_level = radiation * 24.0  # Convert to mSv/day
                
                # Reduce shielding effectiveness during storm
                self.sensor_simulator.current_state.radiation.shielding_effectiveness = max(
                    70.0,
                    95.0 - (radiation / peak_radiation) * 25.0
                )
                
                await asyncio.sleep(1.0)  # Update every second
        
        except asyncio.CancelledError:
            pass
        finally:
            # Restore original state
            if self.original_state:
                self.sensor_simulator.current_state.radiation = self.original_state.radiation
            
            self.active_scenario = None
            self.scenario_start_time = None
            
            # Log scenario end
            self.audit_logger.log(
                user="system",
                action="SCENARIO_END",
                resource="sensor_simulator",
                status="success",
                details={
                    "scenario": "radiation_storm",
                    "duration_seconds": duration_seconds
                }
            )
    
    async def _execute_pressure_leak(self, duration_seconds: float):
        """Execute pressure leak scenario"""
        start_time = datetime.utcnow()
        initial_pressure = self.sensor_simulator.current_state.atmosphere.pressure  # psi
        leak_rate_per_minute = 0.02  # 2% per minute
        leak_rate_per_second = leak_rate_per_minute / 60.0
        
        try:
            while True:
                elapsed = (datetime.utcnow() - start_time).total_seconds()
                
                if elapsed >= duration_seconds:
                    break
                
                # Calculate pressure drop
                # Pressure decreases exponentially: P(t) = P0 * e^(-r*t)
                # where r is the leak rate per second
                current_pressure = initial_pressure * math.exp(-leak_rate_per_second * elapsed)
                
                # Apply pressure drop
                self.sensor_simulator.current_state.atmosphere.pressure = max(
                    10.0,  # Don't go below 10 psi (critical)
                    current_pressure
                )
                
                # Slight increase in CO2 as pressure drops (less efficient scrubbing)
                if elapsed > 30:  # After 30 seconds
                    co2_increase = (elapsed - 30) / 60.0 * 0.01  # Gradual increase
                    self.sensor_simulator.current_state.atmosphere.co2_level = min(
                        0.1,  # Max 0.1%
                        0.04 + co2_increase
                    )
                
                await asyncio.sleep(1.0)  # Update every second
        
        except asyncio.CancelledError:
            pass
        finally:
            # Restore original state
            if self.original_state:
                self.sensor_simulator.current_state.atmosphere = self.original_state.atmosphere
            
            self.active_scenario = None
            self.scenario_start_time = None
            
            # Log scenario end
            self.audit_logger.log(
                user="system",
                action="SCENARIO_END",
                resource="sensor_simulator",
                status="success",
                details={
                    "scenario": "pressure_leak",
                    "duration_seconds": duration_seconds
                }
            )
    
    def stop_scenario(self):
        """Stop the currently running scenario"""
        if self._scenario_task and not self._scenario_task.done():
            self._scenario_task.cancel()
        
        if self.active_scenario:
            scenario_name = self.active_scenario
            self.active_scenario = None
            self.scenario_start_time = None
            
            # Log scenario stop
            self.audit_logger.log(
                user="system",
                action="SCENARIO_STOP",
                resource="sensor_simulator",
                status="success",
                details={
                    "scenario": scenario_name
                }
            )
            
            return {"status": "stopped", "scenario": scenario_name}
        
        return {"status": "no_scenario_running"}
    
    def get_scenario_status(self) -> Dict[str, Any]:
        """Get current scenario status"""
        if not self.active_scenario:
            return {"status": "idle", "active_scenario": None}
        
        elapsed = (datetime.utcnow() - self.scenario_start_time).total_seconds() if self.scenario_start_time else 0
        remaining = max(0, self.scenario_duration - elapsed)
        
        return {
            "status": "running",
            "active_scenario": self.active_scenario,
            "elapsed_seconds": elapsed,
            "remaining_seconds": remaining,
            "duration_seconds": self.scenario_duration,
            "progress_percent": (elapsed / self.scenario_duration * 100) if self.scenario_duration > 0 else 0
        }

# Singleton instance
_scenario_engine_instance = None

def get_scenario_engine(sensor_simulator: SensorSimulator) -> ScenarioEngine:
    """Get the singleton scenario engine instance"""
    global _scenario_engine_instance
    if _scenario_engine_instance is None:
        _scenario_engine_instance = ScenarioEngine(sensor_simulator)
    return _scenario_engine_instance
