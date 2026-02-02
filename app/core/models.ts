/**
 * Core data models for Bennu Kepler Station
 * All units are normalized to standard SI/metric units internally
 */

export type UnitSystem = 'metric' | 'imperial'

export type HeightUnit = 'cm' | 'm' | 'ft-in'
export type WeightUnit = 'kg' | 'lb'
export type TemperatureUnit = 'celsius' | 'fahrenheit'

export type CrewRole = 
  | 'life-support-engineer'
  | 'medical-officer'
  | 'agricultural-specialist'
  | 'structural-engineer'
  | 'robotics-tech'
  | 'commander'
  | 'ship-control'
  | 'educator'
  | 'general-crew'
  | 'visitor'

export type ShiftMode = 'normal' | 'emergency' | 'training'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface BloodPressure {
  systolic: number // mmHg
  diastolic: number // mmHg
}

export interface Vitals {
  heartRate: number | null // BPM
  bloodPressure: BloodPressure | null
  oxygenSaturation: number | null // SpO2 percentage (0-100)
  temperature: number | null // Celsius
}

export interface UserProfile {
  // Identity
  name: string
  age: number
  gender: string
  
  // Physical measurements (normalized units)
  height: number | null // cm
  weight: number | null // kg
  bmi: number | null
  
  // Vitals
  vitals: Vitals
  
  // Activity & Health
  activityLevel: string
  sleepHours: number | null
  healthConditions: string[]
  dietaryRestrictions: string[]
  
  // Role & Station Context
  crewRole: CrewRole
  shiftMode: ShiftMode
  
  // Preferences
  preferredUnits: {
    height: HeightUnit
    weight: WeightUnit
    temperature: TemperatureUnit
  }
  
  // Timestamps
  createdAt: string
  lastUpdated: string
}

export interface RiskAssessment {
  level: RiskLevel
  category: string
  message: string
  recommendations: string[]
  confidence: number // 0-1
  timestamp: string
}

export interface HeliosLogEntry {
  id: string
  timestamp: string
  inputContext: {
    userMessage: string
    userRole: CrewRole
    vitals?: Vitals
    shiftMode: ShiftMode
    dietaryConstraints?: string[]
  }
  modelUsed: string | null
  outputSummary: string
  reasoningSummary: string
  riskLevel: RiskLevel
  suggestedActions: string[]
  citations?: string[]
  userAction: 'accepted' | 'ignored' | 'pending'
  confidence: number
}

export interface SessionReport {
  userProfile: UserProfile
  riskFlags: RiskAssessment[]
  heliosLogs: HeliosLogEntry[]
  timestamp: string
  sessionDuration: number // seconds
}
