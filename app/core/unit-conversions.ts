/**
 * Unit conversion utilities
 * All conversions normalize to standard SI/metric units
 */

import { HeightUnit, WeightUnit, TemperatureUnit } from './models'

/**
 * Convert height to centimeters (standard unit)
 */
export function convertHeightToCm(value: number, unit: HeightUnit): number {
  switch (unit) {
    case 'cm':
      return value
    case 'm':
      return value * 100
    case 'ft-in':
      // Assume value is total inches
      return value * 2.54
    default:
      return value
  }
}

/**
 * Convert feet and inches to total inches
 */
export function feetInchesToInches(feet: number, inches: number): number {
  return feet * 12 + inches
}

/**
 * Convert inches to centimeters
 */
export function inchesToCm(inches: number): number {
  return inches * 2.54
}

/**
 * Convert height from cm to display unit
 */
export function convertHeightFromCm(valueCm: number, unit: HeightUnit): number {
  switch (unit) {
    case 'cm':
      return valueCm
    case 'm':
      return valueCm / 100
    case 'ft-in':
      return valueCm / 2.54 // returns total inches
    default:
      return valueCm
  }
}

/**
 * Convert weight to kilograms (standard unit)
 */
export function convertWeightToKg(value: number, unit: WeightUnit): number {
  switch (unit) {
    case 'kg':
      return value
    case 'lb':
      return value * 0.453592
    default:
      return value
  }
}

/**
 * Convert weight from kg to display unit
 */
export function convertWeightFromKg(valueKg: number, unit: WeightUnit): number {
  switch (unit) {
    case 'kg':
      return valueKg
    case 'lb':
      return valueKg / 0.453592
    default:
      return valueKg
  }
}

/**
 * Convert temperature to Celsius (standard unit)
 */
export function convertTemperatureToC(value: number, unit: TemperatureUnit): number {
  switch (unit) {
    case 'celsius':
      return value
    case 'fahrenheit':
      return (value - 32) * 5 / 9
    default:
      return value
  }
}

/**
 * Convert temperature from Celsius to display unit
 */
export function convertTemperatureFromC(valueC: number, unit: TemperatureUnit): number {
  switch (unit) {
    case 'celsius':
      return valueC
    case 'fahrenheit':
      return (valueC * 9 / 5) + 32
    default:
      return valueC
  }
}

/**
 * Validate height bounds (in cm)
 */
export function validateHeight(heightCm: number): { valid: boolean; warning?: string } {
  if (heightCm < 50) {
    return { valid: false, warning: 'Height below 50 cm is not physically possible' }
  }
  if (heightCm > 250) {
    return { valid: false, warning: 'Height above 250 cm is extremely uncommon' }
  }
  if (heightCm < 100 || heightCm > 220) {
    return { valid: true, warning: 'That height is uncommon—please double-check' }
  }
  return { valid: true }
}

/**
 * Validate weight bounds (in kg)
 */
export function validateWeight(weightKg: number): { valid: boolean; warning?: string } {
  if (weightKg < 10) {
    return { valid: false, warning: 'Weight below 10 kg is not physically possible' }
  }
  if (weightKg > 300) {
    return { valid: false, warning: 'Weight above 300 kg is extremely uncommon' }
  }
  if (weightKg < 30 || weightKg > 200) {
    return { valid: true, warning: 'That weight is uncommon—please double-check' }
  }
  return { valid: true }
}

/**
 * Validate temperature bounds (in Celsius)
 */
export function validateTemperature(tempC: number): { valid: boolean; warning?: string } {
  if (tempC < 30) {
    return { valid: false, warning: 'Temperature below 30°C indicates hypothermia' }
  }
  if (tempC > 45) {
    return { valid: false, warning: 'Temperature above 45°C indicates hyperthermia' }
  }
  if (tempC < 35 || tempC > 40) {
    return { valid: true, warning: 'Temperature outside normal range (36.1-37.2°C)' }
  }
  return { valid: true }
}

/**
 * Validate blood pressure
 */
export function validateBloodPressure(systolic: number, diastolic: number): { valid: boolean; warning?: string } {
  if (systolic < 70 || systolic > 250) {
    return { valid: false, warning: 'Systolic pressure outside valid range (70-250 mmHg)' }
  }
  if (diastolic < 40 || diastolic > 150) {
    return { valid: false, warning: 'Diastolic pressure outside valid range (40-150 mmHg)' }
  }
  if (systolic <= diastolic) {
    return { valid: false, warning: 'Systolic must be greater than diastolic' }
  }
  if (systolic > 140 || diastolic > 90) {
    return { valid: true, warning: 'Blood pressure elevated—consider medical consultation' }
  }
  if (systolic < 90 || diastolic < 60) {
    return { valid: true, warning: 'Blood pressure low—consider medical consultation' }
  }
  return { valid: true }
}

/**
 * Validate oxygen saturation (SpO2)
 */
export function validateOxygenSaturation(spo2: number): { valid: boolean; warning?: string } {
  if (spo2 < 50 || spo2 > 100) {
    return { valid: false, warning: 'SpO2 must be between 50-100%' }
  }
  if (spo2 < 90) {
    return { valid: true, warning: 'SpO2 below 90%—immediate medical attention recommended' }
  }
  if (spo2 < 95) {
    return { valid: true, warning: 'SpO2 below normal range (95-100%)' }
  }
  return { valid: true }
}

/**
 * Calculate BMI from height (cm) and weight (kg)
 */
export function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}
