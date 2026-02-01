"""
Decision Engine: Generates ranked recommendations for life support and energy dispatch
with explainable reasoning based on current values and thresholds
"""
from dataclasses import dataclass
from typing import List, Dict, Optional
from datetime import datetime
from app.models import SettlementState
import uuid

# Thresholds for decision making
LIFE_SUPPORT_THRESHOLDS = {
    "o2_min": 20.0,  # % - minimum safe oxygen
    "o2_optimal_min": 20.5,  # % - optimal range minimum
    "o2_optimal_max": 21.5,  # % - optimal range maximum
    "co2_max": 500.0,  # ppm - maximum safe CO2
    "co2_warning": 450.0,  # ppm - warning level
    "pressure_min": 95.0,  # kPa - minimum safe pressure
    "pressure_optimal_min": 98.0,  # kPa - optimal range minimum
    "pressure_optimal_max": 103.0,  # kPa - optimal range maximum
    "temp_min": 18.0,  # °C - minimum comfortable
    "temp_max": 22.0,  # °C - maximum comfortable
    "humidity_min": 40.0,  # % - minimum comfortable
    "humidity_max": 60.0,  # % - maximum comfortable
    "crop_health_min": 75.0,  # minimum acceptable crop health
    "crop_health_optimal": 85.0,  # optimal crop health
}

ENERGY_THRESHOLDS = {
    "battery_min": 30.0,  # kWh - critical low
    "battery_warning": 50.0,  # kWh - warning level
    "battery_optimal_min": 60.0,  # kWh - optimal minimum
    "battery_optimal_max": 90.0,  # kWh - optimal maximum
    "solar_min": 500.0,  # kW - minimum acceptable generation
    "load_max": 900.0,  # kW - maximum safe load
    "load_optimal_max": 850.0,  # kW - optimal maximum load
    "energy_reserve_min": 0.2,  # 20% minimum reserve
}

@dataclass
class Recommendation:
    """Decision engine recommendation"""
    id: str
    priority: int  # 1-10, higher is more urgent
    category: str  # "life_support" or "energy_dispatch"
    action: str
    title: str
    description: str
    reasoning: str  # Explainable reasoning
    current_value: float
    threshold_value: float
    impact: str  # "critical", "high", "medium", "low"
    estimated_effect: str  # Expected outcome
    confidence: float  # 0.0-1.0

def calculate_priority(
    deviation_from_threshold: float,
    impact_level: str,
    is_critical: bool
) -> int:
    """Calculate priority score (1-10)"""
    base_priority = 5
    
    # Adjust based on deviation
    if abs(deviation_from_threshold) > 20:
        base_priority += 3
    elif abs(deviation_from_threshold) > 10:
        base_priority += 2
    elif abs(deviation_from_threshold) > 5:
        base_priority += 1
    
    # Adjust based on impact
    impact_multiplier = {
        "critical": 2,
        "high": 1.5,
        "medium": 1.0,
        "low": 0.5
    }
    base_priority = int(base_priority * impact_multiplier.get(impact_level, 1.0))
    
    # Critical flag adds urgency
    if is_critical:
        base_priority += 2
    
    return min(10, max(1, base_priority))

class DecisionEngine:
    """Decision engine for life support and energy dispatch"""
    
    def __init__(self):
        self.recommendations_history: List[Recommendation] = []
    
    def generate_recommendations(self, state: SettlementState) -> List[Recommendation]:
        """
        Generate ranked recommendations for life support and energy dispatch
        
        Returns:
            List of recommendations sorted by priority (highest first)
        """
        recommendations = []
        
        # Life support recommendations
        recommendations.extend(self._analyze_life_support(state))
        
        # Energy dispatch recommendations
        recommendations.extend(self._analyze_energy_dispatch(state))
        
        # Sort by priority (highest first)
        recommendations.sort(key=lambda x: x.priority, reverse=True)
        
        return recommendations
    
    def _analyze_life_support(self, state: SettlementState) -> List[Recommendation]:
        """Analyze life support systems and generate recommendations"""
        recommendations = []
        
        # Oxygen analysis
        o2_rec = self._analyze_oxygen(state)
        if o2_rec:
            recommendations.append(o2_rec)
        
        # CO2 analysis
        co2_rec = self._analyze_co2(state)
        if co2_rec:
            recommendations.append(co2_rec)
        
        # Pressure analysis
        pressure_rec = self._analyze_pressure(state)
        if pressure_rec:
            recommendations.append(pressure_rec)
        
        # Temperature analysis
        temp_rec = self._analyze_temperature(state)
        if temp_rec:
            recommendations.append(temp_rec)
        
        # Humidity analysis
        humidity_rec = self._analyze_humidity(state)
        if humidity_rec:
            recommendations.append(humidity_rec)
        
        # Agriculture/Crop health analysis
        crop_rec = self._analyze_crop_health(state)
        if crop_rec:
            recommendations.append(crop_rec)
        
        return recommendations
    
    def _analyze_oxygen(self, state: SettlementState) -> Optional[Recommendation]:
        """Analyze oxygen levels"""
        o2 = state.o2_pct
        threshold_min = LIFE_SUPPORT_THRESHOLDS["o2_min"]
        threshold_optimal_min = LIFE_SUPPORT_THRESHOLDS["o2_optimal_min"]
        
        if o2 < threshold_min:
            # Critical: Below minimum safe level
            deviation = threshold_min - o2
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "critical", True),
                category="life_support",
                action="INCREASE_O2_GENERATION",
                title="Critical: Increase Oxygen Generation",
                description="Oxygen level is below minimum safe threshold. Immediate action required.",
                reasoning=f"Current O2: {o2:.2f}% is below critical threshold of {threshold_min}% (deviation: -{deviation:.2f}%). Life support systems must increase O2 generation immediately to prevent hypoxia risk.",
                current_value=o2,
                threshold_value=threshold_min,
                impact="critical",
                estimated_effect="Will restore O2 to safe levels within 5-10 minutes",
                confidence=0.95
            )
        elif o2 < threshold_optimal_min:
            # Warning: Below optimal but above minimum
            deviation = threshold_optimal_min - o2
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "high", False),
                category="life_support",
                action="INCREASE_O2_GENERATION",
                title="Increase Oxygen Generation",
                description="Oxygen level is below optimal range.",
                reasoning=f"Current O2: {o2:.2f}% is below optimal minimum of {threshold_optimal_min}% (deviation: -{deviation:.2f}%). Increasing O2 generation will restore optimal conditions.",
                current_value=o2,
                threshold_value=threshold_optimal_min,
                impact="high",
                estimated_effect="Will restore O2 to optimal range within 10-15 minutes",
                confidence=0.85
            )
        elif o2 > LIFE_SUPPORT_THRESHOLDS["o2_optimal_max"]:
            # Above optimal: Reduce generation
            deviation = o2 - LIFE_SUPPORT_THRESHOLDS["o2_optimal_max"]
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "medium", False),
                category="life_support",
                action="REDUCE_O2_GENERATION",
                title="Reduce Oxygen Generation",
                description="Oxygen level is above optimal range.",
                reasoning=f"Current O2: {o2:.2f}% exceeds optimal maximum of {LIFE_SUPPORT_THRESHOLDS['o2_optimal_max']}% (deviation: +{deviation:.2f}%). Reducing O2 generation will optimize resource usage.",
                current_value=o2,
                threshold_value=LIFE_SUPPORT_THRESHOLDS["o2_optimal_max"],
                impact="medium",
                estimated_effect="Will reduce O2 to optimal range and save energy",
                confidence=0.80
            )
        
        return None
    
    def _analyze_co2(self, state: SettlementState) -> Optional[Recommendation]:
        """Analyze CO2 levels"""
        co2 = state.co2_ppm
        threshold_max = LIFE_SUPPORT_THRESHOLDS["co2_max"]
        threshold_warning = LIFE_SUPPORT_THRESHOLDS["co2_warning"]
        
        if co2 > threshold_max:
            # Critical: Above maximum safe level
            deviation = co2 - threshold_max
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "critical", True),
                category="life_support",
                action="INCREASE_CO2_SCRUBBING",
                title="Critical: Increase CO2 Scrubbing",
                description="CO2 level exceeds maximum safe threshold.",
                reasoning=f"Current CO2: {co2:.1f} ppm exceeds critical threshold of {threshold_max} ppm (deviation: +{deviation:.1f} ppm). CO2 scrubbing systems must be increased immediately to prevent health risks.",
                current_value=co2,
                threshold_value=threshold_max,
                impact="critical",
                estimated_effect="Will reduce CO2 to safe levels within 5-10 minutes",
                confidence=0.95
            )
        elif co2 > threshold_warning:
            # Warning: Approaching maximum
            deviation = co2 - threshold_warning
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "high", False),
                category="life_support",
                action="INCREASE_CO2_SCRUBBING",
                title="Increase CO2 Scrubbing",
                description="CO2 level is approaching maximum safe threshold.",
                reasoning=f"Current CO2: {co2:.1f} ppm is above warning level of {threshold_warning} ppm (deviation: +{deviation:.1f} ppm). Increasing scrubbing will prevent reaching critical levels.",
                current_value=co2,
                threshold_value=threshold_warning,
                impact="high",
                estimated_effect="Will reduce CO2 to safe range within 10-15 minutes",
                confidence=0.85
            )
        
        return None
    
    def _analyze_pressure(self, state: SettlementState) -> Optional[Recommendation]:
        """Analyze atmospheric pressure"""
        pressure = state.pressure_kpa
        threshold_min = LIFE_SUPPORT_THRESHOLDS["pressure_min"]
        threshold_optimal_min = LIFE_SUPPORT_THRESHOLDS["pressure_optimal_min"]
        
        if pressure < threshold_min:
            # Critical: Below minimum safe pressure
            deviation = threshold_min - pressure
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "critical", True),
                category="life_support",
                action="INCREASE_PRESSURE",
                title="Critical: Increase Atmospheric Pressure",
                description="Pressure is below minimum safe threshold.",
                reasoning=f"Current pressure: {pressure:.2f} kPa is below critical threshold of {threshold_min} kPa (deviation: -{deviation:.2f} kPa). Pressure systems must be activated immediately.",
                current_value=pressure,
                threshold_value=threshold_min,
                impact="critical",
                estimated_effect="Will restore pressure to safe levels within 3-5 minutes",
                confidence=0.95
            )
        elif pressure < threshold_optimal_min:
            # Warning: Below optimal
            deviation = threshold_optimal_min - pressure
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "high", False),
                category="life_support",
                action="INCREASE_PRESSURE",
                title="Increase Atmospheric Pressure",
                description="Pressure is below optimal range.",
                reasoning=f"Current pressure: {pressure:.2f} kPa is below optimal minimum of {threshold_optimal_min} kPa (deviation: -{deviation:.2f} kPa). Adjusting pressure will restore comfort.",
                current_value=pressure,
                threshold_value=threshold_optimal_min,
                impact="high",
                estimated_effect="Will restore pressure to optimal range within 5-10 minutes",
                confidence=0.85
            )
        elif pressure > LIFE_SUPPORT_THRESHOLDS["pressure_optimal_max"]:
            # Above optimal: Reduce pressure
            deviation = pressure - LIFE_SUPPORT_THRESHOLDS["pressure_optimal_max"]
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "medium", False),
                category="life_support",
                action="REDUCE_PRESSURE",
                title="Reduce Atmospheric Pressure",
                description="Pressure is above optimal range.",
                reasoning=f"Current pressure: {pressure:.2f} kPa exceeds optimal maximum of {LIFE_SUPPORT_THRESHOLDS['pressure_optimal_max']} kPa (deviation: +{deviation:.2f} kPa). Reducing pressure will optimize conditions.",
                current_value=pressure,
                threshold_value=LIFE_SUPPORT_THRESHOLDS["pressure_optimal_max"],
                impact="medium",
                estimated_effect="Will reduce pressure to optimal range",
                confidence=0.80
            )
        
        return None
    
    def _analyze_temperature(self, state: SettlementState) -> Optional[Recommendation]:
        """Analyze temperature"""
        temp = state.temp_c
        threshold_min = LIFE_SUPPORT_THRESHOLDS["temp_min"]
        threshold_max = LIFE_SUPPORT_THRESHOLDS["temp_max"]
        
        if temp < threshold_min:
            deviation = threshold_min - temp
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "high", False),
                category="life_support",
                action="INCREASE_TEMPERATURE",
                title="Increase Temperature",
                description="Temperature is below comfortable range.",
                reasoning=f"Current temperature: {temp:.2f}°C is below minimum comfortable level of {threshold_min}°C (deviation: -{deviation:.2f}°C). Heating systems should be activated.",
                current_value=temp,
                threshold_value=threshold_min,
                impact="high",
                estimated_effect="Will restore temperature to comfortable range within 10-15 minutes",
                confidence=0.85
            )
        elif temp > threshold_max:
            deviation = temp - threshold_max
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "high", False),
                category="life_support",
                action="DECREASE_TEMPERATURE",
                title="Decrease Temperature",
                description="Temperature is above comfortable range.",
                reasoning=f"Current temperature: {temp:.2f}°C exceeds maximum comfortable level of {threshold_max}°C (deviation: +{deviation:.2f}°C). Cooling systems should be activated.",
                current_value=temp,
                threshold_value=threshold_max,
                impact="high",
                estimated_effect="Will restore temperature to comfortable range within 10-15 minutes",
                confidence=0.85
            )
        
        return None
    
    def _analyze_humidity(self, state: SettlementState) -> Optional[Recommendation]:
        """Analyze humidity"""
        humidity = state.humidity_pct
        threshold_min = LIFE_SUPPORT_THRESHOLDS["humidity_min"]
        threshold_max = LIFE_SUPPORT_THRESHOLDS["humidity_max"]
        
        if humidity < threshold_min:
            deviation = threshold_min - humidity
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "medium", False),
                category="life_support",
                action="INCREASE_HUMIDITY",
                title="Increase Humidity",
                description="Humidity is below comfortable range.",
                reasoning=f"Current humidity: {humidity:.2f}% is below minimum comfortable level of {threshold_min}% (deviation: -{deviation:.2f}%). Humidification systems should be activated.",
                current_value=humidity,
                threshold_value=threshold_min,
                impact="medium",
                estimated_effect="Will restore humidity to comfortable range within 15-20 minutes",
                confidence=0.80
            )
        elif humidity > threshold_max:
            deviation = humidity - threshold_max
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "medium", False),
                category="life_support",
                action="DECREASE_HUMIDITY",
                title="Decrease Humidity",
                description="Humidity is above comfortable range.",
                reasoning=f"Current humidity: {humidity:.2f}% exceeds maximum comfortable level of {threshold_max}% (deviation: +{deviation:.2f}%). Dehumidification systems should be activated.",
                current_value=humidity,
                threshold_value=threshold_max,
                impact="medium",
                estimated_effect="Will restore humidity to comfortable range within 15-20 minutes",
                confidence=0.80
            )
        
        return None
    
    def _analyze_crop_health(self, state: SettlementState) -> Optional[Recommendation]:
        """Analyze crop health"""
        crop_health = state.crop_health_index
        threshold_min = LIFE_SUPPORT_THRESHOLDS["crop_health_min"]
        threshold_optimal = LIFE_SUPPORT_THRESHOLDS["crop_health_optimal"]
        
        if crop_health < threshold_min:
            deviation = threshold_min - crop_health
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "high", False),
                category="life_support",
                action="IMPROVE_CROP_HEALTH",
                title="Improve Crop Health",
                description="Crop health is below acceptable threshold.",
                reasoning=f"Current crop health index: {crop_health:.2f} is below minimum acceptable level of {threshold_min} (deviation: -{deviation:.2f}). Review nutrient levels, lighting, and irrigation systems.",
                current_value=crop_health,
                threshold_value=threshold_min,
                impact="high",
                estimated_effect="Will improve crop health over 24-48 hours with proper intervention",
                confidence=0.75
            )
        elif crop_health < threshold_optimal:
            deviation = threshold_optimal - crop_health
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "medium", False),
                category="life_support",
                action="OPTIMIZE_CROP_HEALTH",
                title="Optimize Crop Health",
                description="Crop health is below optimal level.",
                reasoning=f"Current crop health index: {crop_health:.2f} is below optimal level of {threshold_optimal} (deviation: -{deviation:.2f}). Optimizing nutrients and conditions will improve yield.",
                current_value=crop_health,
                threshold_value=threshold_optimal,
                impact="medium",
                estimated_effect="Will improve crop health to optimal levels over 48-72 hours",
                confidence=0.70
            )
        
        return None
    
    def _analyze_energy_dispatch(self, state: SettlementState) -> List[Recommendation]:
        """Analyze energy systems and generate dispatch recommendations"""
        recommendations = []
        
        # Battery level analysis
        battery_rec = self._analyze_battery(state)
        if battery_rec:
            recommendations.append(battery_rec)
        
        # Solar generation analysis
        solar_rec = self._analyze_solar(state)
        if solar_rec:
            recommendations.append(solar_rec)
        
        # Load management analysis
        load_rec = self._analyze_load(state)
        if load_rec:
            recommendations.append(load_rec)
        
        # Energy balance analysis
        balance_rec = self._analyze_energy_balance(state)
        if balance_rec:
            recommendations.append(balance_rec)
        
        return recommendations
    
    def _analyze_battery(self, state: SettlementState) -> Optional[Recommendation]:
        """Analyze battery storage levels"""
        battery = state.battery_kwh
        threshold_min = ENERGY_THRESHOLDS["battery_min"]
        threshold_warning = ENERGY_THRESHOLDS["battery_warning"]
        threshold_optimal_min = ENERGY_THRESHOLDS["battery_optimal_min"]
        
        if battery < threshold_min:
            # Critical: Battery critically low
            deviation = threshold_min - battery
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "critical", True),
                category="energy_dispatch",
                action="PRIORITIZE_CHARGING",
                title="Critical: Prioritize Battery Charging",
                description="Battery storage is critically low.",
                reasoning=f"Current battery: {battery:.2f} kWh is below critical threshold of {threshold_min} kWh (deviation: -{deviation:.2f} kWh). All available solar power should be directed to battery charging. Non-essential loads should be reduced.",
                current_value=battery,
                threshold_value=threshold_min,
                impact="critical",
                estimated_effect="Will restore battery to safe levels within 30-60 minutes with full solar charging",
                confidence=0.90
            )
        elif battery < threshold_warning:
            # Warning: Battery low
            deviation = threshold_warning - battery
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "high", False),
                category="energy_dispatch",
                action="INCREASE_CHARGING",
                title="Increase Battery Charging",
                description="Battery storage is below warning level.",
                reasoning=f"Current battery: {battery:.2f} kWh is below warning threshold of {threshold_warning} kWh (deviation: -{deviation:.2f} kWh). Increase solar power allocation to battery charging.",
                current_value=battery,
                threshold_value=threshold_warning,
                impact="high",
                estimated_effect="Will restore battery to safe levels within 1-2 hours",
                confidence=0.85
            )
        elif battery < threshold_optimal_min:
            # Below optimal: Increase charging
            deviation = threshold_optimal_min - battery
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "medium", False),
                category="energy_dispatch",
                action="OPTIMIZE_CHARGING",
                title="Optimize Battery Charging",
                description="Battery storage is below optimal level.",
                reasoning=f"Current battery: {battery:.2f} kWh is below optimal minimum of {threshold_optimal_min} kWh (deviation: -{deviation:.2f} kWh). Allocate more solar power to charging to build reserves.",
                current_value=battery,
                threshold_value=threshold_optimal_min,
                impact="medium",
                estimated_effect="Will restore battery to optimal levels within 2-3 hours",
                confidence=0.80
            )
        elif battery > ENERGY_THRESHOLDS["battery_optimal_max"]:
            # Above optimal: Can use more power
            deviation = battery - ENERGY_THRESHOLDS["battery_optimal_max"]
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "low", False),
                category="energy_dispatch",
                action="INCREASE_LOAD",
                title="Increase Power Load",
                description="Battery storage is above optimal level.",
                reasoning=f"Current battery: {battery:.2f} kWh exceeds optimal maximum of {ENERGY_THRESHOLDS['battery_optimal_max']} kWh (deviation: +{deviation:.2f} kWh). Battery is well-charged; can increase load or reduce charging.",
                current_value=battery,
                threshold_value=ENERGY_THRESHOLDS["battery_optimal_max"],
                impact="low",
                estimated_effect="Will optimize energy usage and prevent overcharging",
                confidence=0.75
            )
        
        return None
    
    def _analyze_solar(self, state: SettlementState) -> Optional[Recommendation]:
        """Analyze solar generation"""
        solar = state.solar_kw
        threshold_min = ENERGY_THRESHOLDS["solar_min"]
        
        if solar < threshold_min:
            deviation = threshold_min - solar
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "high", False),
                category="energy_dispatch",
                action="REDUCE_NON_ESSENTIAL_LOAD",
                title="Reduce Non-Essential Load",
                description="Solar generation is below minimum acceptable level.",
                reasoning=f"Current solar generation: {solar:.2f} kW is below minimum threshold of {threshold_min} kW (deviation: -{deviation:.2f} kW). This may indicate eclipse period or panel issues. Reduce non-essential loads to preserve battery.",
                current_value=solar,
                threshold_value=threshold_min,
                impact="high",
                estimated_effect="Will preserve battery reserves during low generation period",
                confidence=0.85
            )
        
        return None
    
    def _analyze_load(self, state: SettlementState) -> Optional[Recommendation]:
        """Analyze power load"""
        load = state.load_kw
        threshold_max = ENERGY_THRESHOLDS["load_max"]
        threshold_optimal_max = ENERGY_THRESHOLDS["load_optimal_max"]
        
        if load > threshold_max:
            deviation = load - threshold_max
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "critical", True),
                category="energy_dispatch",
                action="REDUCE_LOAD",
                title="Critical: Reduce Power Load",
                description="Power load exceeds maximum safe threshold.",
                reasoning=f"Current load: {load:.2f} kW exceeds maximum safe threshold of {threshold_max} kW (deviation: +{deviation:.2f} kW). Immediate load reduction required to prevent system overload.",
                current_value=load,
                threshold_value=threshold_max,
                impact="critical",
                estimated_effect="Will prevent system overload and maintain stability",
                confidence=0.95
            )
        elif load > threshold_optimal_max:
            deviation = load - threshold_optimal_max
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(deviation, "high", False),
                category="energy_dispatch",
                action="OPTIMIZE_LOAD",
                title="Optimize Power Load",
                description="Power load is above optimal maximum.",
                reasoning=f"Current load: {load:.2f} kW exceeds optimal maximum of {threshold_optimal_max} kW (deviation: +{deviation:.2f} kW). Optimize load distribution to improve efficiency.",
                current_value=load,
                threshold_value=threshold_optimal_max,
                impact="high",
                estimated_effect="Will improve energy efficiency and reduce strain on systems",
                confidence=0.85
            )
        
        return None
    
    def _analyze_energy_balance(self, state: SettlementState) -> Optional[Recommendation]:
        """Analyze overall energy balance"""
        solar = state.solar_kw
        load = state.load_kw
        battery = state.battery_kwh
        battery_capacity = 500.0  # Total battery capacity in kWh
        battery_pct = (battery / battery_capacity) * 100.0
        
        net_power = solar - load
        reserve_ratio = battery_pct / 100.0
        
        # Check if we're in energy deficit
        if net_power < 0 and reserve_ratio < ENERGY_THRESHOLDS["energy_reserve_min"]:
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(abs(net_power), "critical", True),
                category="energy_dispatch",
                action="EMERGENCY_LOAD_SHEDDING",
                title="Critical: Emergency Load Shedding Required",
                description="Energy deficit with insufficient reserves.",
                reasoning=f"Energy deficit: {abs(net_power):.2f} kW (solar {solar:.2f} kW < load {load:.2f} kW) with battery reserves at {battery_pct:.1f}% (below {ENERGY_THRESHOLDS['energy_reserve_min']*100:.0f}% minimum). Emergency load shedding required to prevent blackout.",
                current_value=reserve_ratio,
                threshold_value=ENERGY_THRESHOLDS["energy_reserve_min"],
                impact="critical",
                estimated_effect="Will prevent blackout by reducing load to match generation",
                confidence=0.95
            )
        elif net_power < 0:
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(abs(net_power), "high", False),
                category="energy_dispatch",
                action="REDUCE_LOAD_OR_INCREASE_GENERATION",
                title="Reduce Load or Increase Generation",
                description="Energy deficit detected.",
                reasoning=f"Energy deficit: {abs(net_power):.2f} kW (solar {solar:.2f} kW < load {load:.2f} kW). Battery is being drained. Reduce load or wait for increased solar generation.",
                current_value=net_power,
                threshold_value=0.0,
                impact="high",
                estimated_effect="Will balance energy supply and demand",
                confidence=0.85
            )
        elif net_power > 0 and battery_pct < 90.0:
            # Surplus power, charge battery
            return Recommendation(
                id=str(uuid.uuid4()),
                priority=calculate_priority(net_power, "medium", False),
                category="energy_dispatch",
                action="CHARGE_BATTERY",
                title="Charge Battery with Surplus",
                description="Energy surplus available for battery charging.",
                reasoning=f"Energy surplus: {net_power:.2f} kW (solar {solar:.2f} kW > load {load:.2f} kW) with battery at {battery_pct:.1f}%. Direct surplus to battery charging to build reserves.",
                current_value=battery_pct,
                threshold_value=90.0,
                impact="medium",
                estimated_effect="Will increase battery reserves for future use",
                confidence=0.80
            )
        
        return None

# Singleton instance
_decision_engine_instance = None

def get_decision_engine() -> DecisionEngine:
    """Get the singleton decision engine instance"""
    global _decision_engine_instance
    if _decision_engine_instance is None:
        _decision_engine_instance = DecisionEngine()
    return _decision_engine_instance
