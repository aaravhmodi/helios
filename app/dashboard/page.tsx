'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import styles from './dashboard.module.css'

// Core models and types
import { 
  UserProfile, 
  CrewRole, 
  ShiftMode, 
  Vitals, 
  BloodPressure,
  HeightUnit,
  WeightUnit,
  TemperatureUnit,
  RiskAssessment
} from '../core/models'

// Utilities
import {
  convertHeightToCm,
  convertWeightToKg,
  convertTemperatureToC,
  validateHeight,
  validateWeight,
  validateTemperature,
  validateBloodPressure,
  validateOxygenSaturation,
  calculateBMI,
  feetInchesToInches,
  inchesToCm
} from '../core/unit-conversions'
import { getRoleDefinition, getRoleDisplayName } from '../core/roles'
import { saveUserProfile, loadUserProfile, saveQuizState, loadQuizState } from '../store/local-storage'
import { generateSessionReport, downloadSessionReportAsText } from '../services/session-report'

// UI Components
import QuizProgress from '../ui/quiz/QuizProgress'
import MultiUnitInput, { UnitOption } from '../ui/quiz/MultiUnitInput'
import BloodPressureInput from '../ui/quiz/BloodPressureInput'
import RolePicker from '../ui/quiz/RolePicker'
import HeliosConsole from '../ui/helios/HeliosConsole'
import FoodList from '../ui/food/FoodList'
import ShipControlView from '../ui/dashboard/ShipControlView'
import EducatorView from '../ui/dashboard/EducatorView'

interface TelemetryData {
  timestamp: string
  o2_pct: number
  co2_ppm: number
  solar_kw: number
  battery_kwh: number
  radiation_msv_hr: number
  pressure_kpa: number
  temp_c: number
}

interface Alert {
  id: string
  timestamp: string
  severity: string
  category: string
  message: string
  system: string
  resolved: boolean
}

interface Recommendation {
  id: string
  timestamp: string
  priority: string
  category: string
  title: string
  description: string
  action_required: boolean
}

const API_BASE = 'http://localhost:8000/api'

// Quiz step definitions
const TOTAL_QUIZ_STEPS = 12

export default function Dashboard() {
  const [showQuiz, setShowQuiz] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([])
  const [currentState, setCurrentState] = useState<any>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sessionStartTime] = useState<Date>(new Date())
  const [riskFlags, setRiskFlags] = useState<RiskAssessment[]>([])
  
  // Quiz state
  const [quizStep, setQuizStep] = useState(0)
  const [quizData, setQuizData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    heightUnit: 'cm' as HeightUnit,
    heightFeet: '',
    heightInches: '',
    weight: '',
    weightUnit: 'kg' as WeightUnit,
    temperature: '',
    temperatureUnit: 'celsius' as TemperatureUnit,
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    oxygenSaturation: '',
    activityLevel: '',
    heartRate: '',
    sleepHours: '',
    healthConditions: [] as string[],
    dietaryRestrictions: [] as string[],
    crewRole: '' as CrewRole | '',
    shiftMode: 'normal' as ShiftMode
  })
  
  // Heart rate measurement state
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(10)
  const [beatCount, setBeatCount] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(false)
  
  // Food/nutrition state
  const [foodSearchQuery, setFoodSearchQuery] = useState('')
  const [foodCategory, setFoodCategory] = useState('All')
  const [selectedFoods, setSelectedFoods] = useState<string[]>([])
  const [emergencyRationMode, setEmergencyRationMode] = useState(false)
  const [dailyWater, setDailyWater] = useState('')
  const [dailyCalories, setDailyCalories] = useState('')
  const [dailyProtein, setDailyProtein] = useState('')

  // Fetch data from FastAPI
  const fetchData = async () => {
    try {
      const stateRes = await fetch(`${API_BASE}/settlement-state`)
      const stateData = await stateRes.json()
      
      if (stateData.status === 'operational' && stateData.state) {
        setCurrentState(stateData.state)
        
        const newData: TelemetryData = {
          timestamp: new Date().toLocaleTimeString(),
          o2_pct: stateData.state.o2_pct || 0,
          co2_ppm: stateData.state.co2_ppm || 0,
          solar_kw: stateData.state.solar_kw || 0,
          battery_kwh: stateData.state.battery_kwh || 0,
          radiation_msv_hr: stateData.state.radiation_msv_hr || 0,
          pressure_kpa: stateData.state.pressure_kpa || 0,
          temp_c: stateData.state.temp_c || 0
        }
        
        setTelemetryData(prev => {
          const updated = [...prev, newData]
          return updated.slice(-50)
        })
      }

      const alertsRes = await fetch(`${API_BASE}/alerts?limit=10&resolved=false`)
      const alertsData = await alertsRes.json()
      if (alertsData.alerts) {
        setAlerts(alertsData.alerts)
      }

      const recsRes = await fetch(`${API_BASE}/recommendations?limit=10&action_required=true`)
      const recsData = await recsRes.json()
      if (recsData.recommendations) {
        setRecommendations(recsData.recommendations)
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!showQuiz) {
      fetchData()
      const interval = setInterval(fetchData, 2000)
      return () => clearInterval(interval)
    }
  }, [showQuiz])

  // Load saved profile and quiz state
  useEffect(() => {
    const savedProfile = loadUserProfile()
    if (savedProfile) {
      setUserProfile(savedProfile)
      setShowQuiz(false)
    } else {
      const savedQuizState = loadQuizState()
      if (savedQuizState) {
        setQuizData(savedQuizState.data)
        setQuizStep(savedQuizState.step)
      }
    }
  }, [])

  // Save quiz state on change
  useEffect(() => {
    if (showQuiz) {
      saveQuizState({ step: quizStep, data: quizData })
    }
  }, [quizStep, quizData, showQuiz])

  const handleQuizNext = () => {
    if (quizStep === TOTAL_QUIZ_STEPS - 1) {
      // Complete quiz - create UserProfile
      let heightCm: number | null = null
      if (quizData.height) {
        if (quizData.heightUnit === 'ft-in') {
          const feet = parseFloat(quizData.heightFeet) || 0
          const inches = parseFloat(quizData.heightInches) || 0
          const totalInches = feetInchesToInches(feet, inches)
          heightCm = inchesToCm(totalInches)
        } else {
          heightCm = convertHeightToCm(parseFloat(quizData.height), quizData.heightUnit)
        }
      }
      
      const weightKg = quizData.weight ? convertWeightToKg(parseFloat(quizData.weight), quizData.weightUnit) : null
      const tempC = quizData.temperature ? convertTemperatureToC(parseFloat(quizData.temperature), quizData.temperatureUnit) : null
      
      const bloodPressure: BloodPressure | null = 
        (quizData.bloodPressureSystolic && quizData.bloodPressureDiastolic)
          ? {
              systolic: parseFloat(quizData.bloodPressureSystolic),
              diastolic: parseFloat(quizData.bloodPressureDiastolic)
            }
          : null
      
      const vitals: Vitals = {
        heartRate: quizData.heartRate ? parseInt(quizData.heartRate) : null,
        bloodPressure,
        oxygenSaturation: quizData.oxygenSaturation ? parseFloat(quizData.oxygenSaturation) : null,
        temperature: tempC
      }
      
      const bmi = (heightCm && weightKg) ? calculateBMI(heightCm, weightKg) : null
      
      const profile: UserProfile = {
        name: quizData.name,
        age: parseInt(quizData.age),
        gender: quizData.gender,
        height: heightCm,
        weight: weightKg,
        bmi,
        vitals,
        activityLevel: quizData.activityLevel,
        sleepHours: quizData.sleepHours ? parseFloat(quizData.sleepHours) : null,
        healthConditions: quizData.healthConditions,
        dietaryRestrictions: quizData.dietaryRestrictions,
        crewRole: quizData.crewRole as CrewRole,
        shiftMode: quizData.shiftMode,
        preferredUnits: {
          height: quizData.heightUnit,
          weight: quizData.weightUnit,
          temperature: quizData.temperatureUnit
        },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
      
      setUserProfile(profile)
      saveUserProfile(profile)
      setShowQuiz(false)
    } else {
      setQuizStep(prev => prev + 1)
    }
  }

  const handleQuizBack = () => {
    if (quizStep > 0) {
      setQuizStep(prev => prev - 1)
    }
  }

  // Heart rate measurement handlers
  const startHeartRateMeasurement = () => {
    setIsMeasuring(true)
    setTimeRemaining(10)
    setBeatCount(0)
    setHasCompleted(false)
  }

  const handleBeatTap = () => {
    if (isMeasuring && timeRemaining > 0) {
      setBeatCount(prev => prev + 1)
    }
  }

  const resetHeartRateMeasurement = () => {
    setIsMeasuring(false)
    setTimeRemaining(10)
    setBeatCount(0)
    setHasCompleted(false)
    setQuizData({...quizData, heartRate: ''})
  }

  // Heart rate countdown timer
  useEffect(() => {
    if (isMeasuring && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsMeasuring(false)
            setHasCompleted(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isMeasuring, timeRemaining])

  // Calculate BPM when measurement completes
  useEffect(() => {
    if (hasCompleted && !isMeasuring && timeRemaining === 0) {
      const bpm = beatCount * 6
      setQuizData(prev => ({...prev, heartRate: bpm.toString()}))
    }
  }, [hasCompleted, isMeasuring, timeRemaining, beatCount])

  // Logout handler
  const handleLogout = () => {
    setUserProfile(null)
    setShowQuiz(true)
    setQuizStep(0)
    setQuizData({
      name: '',
      age: '',
      gender: '',
      height: '',
      heightUnit: 'cm',
      heightFeet: '',
      heightInches: '',
      weight: '',
      weightUnit: 'kg',
      temperature: '',
      temperatureUnit: 'celsius',
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      oxygenSaturation: '',
      activityLevel: '',
      heartRate: '',
      sleepHours: '',
      healthConditions: [],
      dietaryRestrictions: [],
      crewRole: '',
      shiftMode: 'normal'
    })
    setIsMeasuring(false)
    setTimeRemaining(10)
    setBeatCount(0)
    setHasCompleted(false)
  }

  // Validation helpers
  const getHeightValidation = () => {
    if (!quizData.height && quizData.heightUnit !== 'ft-in') return null
    if (quizData.heightUnit === 'ft-in') {
      if (!quizData.heightFeet || !quizData.heightInches) return null
      const feet = parseFloat(quizData.heightFeet)
      const inches = parseFloat(quizData.heightInches)
      const totalInches = feetInchesToInches(feet, inches)
      const heightCm = inchesToCm(totalInches)
      return validateHeight(heightCm)
    }
    const heightCm = convertHeightToCm(parseFloat(quizData.height), quizData.heightUnit)
    return validateHeight(heightCm)
  }

  const getWeightValidation = () => {
    if (!quizData.weight) return null
    const weightKg = convertWeightToKg(parseFloat(quizData.weight), quizData.weightUnit)
    return validateWeight(weightKg)
  }

  const getTemperatureValidation = () => {
    if (!quizData.temperature) return null
    const tempC = convertTemperatureToC(parseFloat(quizData.temperature), quizData.temperatureUnit)
    return validateTemperature(tempC)
  }

  const getBloodPressureValidation = () => {
    if (!quizData.bloodPressureSystolic || !quizData.bloodPressureDiastolic) return null
    return validateBloodPressure(
      parseFloat(quizData.bloodPressureSystolic),
      parseFloat(quizData.bloodPressureDiastolic)
    )
  }

  const getOxygenSaturationValidation = () => {
    if (!quizData.oxygenSaturation) return null
    return validateOxygenSaturation(parseFloat(quizData.oxygenSaturation))
  }

  // Check if Next button should be disabled
  const isNextDisabled = () => {
    switch(quizStep) {
      case 0: return !quizData.name || quizData.name.trim() === ''
      case 1: return !quizData.age || quizData.age.trim() === ''
      case 2: return !quizData.gender
      case 3: {
        if (quizData.heightUnit === 'ft-in') {
          return !quizData.heightFeet || !quizData.heightInches
        }
        const val = getHeightValidation()
        return !quizData.height || !val || !val.valid
      }
      case 4: {
        const val = getWeightValidation()
        return !quizData.weight || !val || !val.valid
      }
      case 5: {
        const val = getTemperatureValidation()
        return !quizData.temperature || !val || !val.valid
      }
      case 6: {
        const val = getBloodPressureValidation()
        return !quizData.bloodPressureSystolic || !quizData.bloodPressureDiastolic || !val || !val.valid
      }
      case 7: {
        const val = getOxygenSaturationValidation()
        return !quizData.oxygenSaturation || !val || !val.valid
      }
      case 8: return !quizData.activityLevel
      case 9: return !quizData.heartRate || quizData.heartRate.trim() === ''
      case 10: return !quizData.sleepHours || quizData.sleepHours.trim() === ''
      case 11: return !quizData.crewRole
      default: return false
    }
  }

  const toggleCheckbox = (array: string[], value: string, setter: (val: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(item => item !== value))
    } else {
      setter([...array, value])
    }
  }

  // Session report download
  const handleDownloadSessionReport = () => {
    if (!userProfile) return
    const report = generateSessionReport(userProfile, riskFlags, sessionStartTime)
    downloadSessionReportAsText(report)
  }

  const handleApprove = async (recommendationId: string) => {
    try {
      const response = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recommendation_id: recommendationId,
          approved_by: userProfile?.name || 'dashboard_user' 
        })
      })

      if (response.ok) {
        fetchData()
        alert('Recommendation approved successfully')
      } else {
        const error = await response.json()
        alert(`Failed to approve: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error approving recommendation:', error)
      alert('Failed to approve recommendation')
    }
  }

  // Role-based personalization
  const getRoleBasedSummary = () => {
    if (!userProfile) return []
    const roleDef = getRoleDefinition(userProfile.crewRole)
    return [
      `Role: ${roleDef.displayName}`,
      `Shift Mode: ${userProfile.shiftMode.charAt(0).toUpperCase() + userProfile.shiftMode.slice(1)}`,
      ...roleDef.keyResponsibilities.map(r => `• ${r}`)
    ]
  }

  // Quiz Component
  if (showQuiz) {
    const heightValidation = getHeightValidation()
    const weightValidation = getWeightValidation()
    const tempValidation = getTemperatureValidation()
    const bpValidation = getBloodPressureValidation()
    const spo2Validation = getOxygenSaturationValidation()

    const heightUnitOptions: UnitOption[] = [
      { value: 'cm', label: 'cm', example: '175 cm' },
      { value: 'm', label: 'm', example: '1.75 m' },
      { value: 'ft-in', label: 'ft/in', example: '5\'9"' }
    ]

    const weightUnitOptions: UnitOption[] = [
      { value: 'kg', label: 'kg', example: '70 kg' },
      { value: 'lb', label: 'lb', example: '154 lbs' }
    ]

    const tempUnitOptions: UnitOption[] = [
      { value: 'celsius', label: '°C', example: '37°C' },
      { value: 'fahrenheit', label: '°F', example: '98.6°F' }
    ]

    return (
      <div className={styles.quizContainer}>
        <div className={styles.quizCard}>
          <div className={styles.quizHeader}>
            <h1 className={styles.quizTitle}>BENNU KEPLER STATION</h1>
            <p className={styles.quizSubtitle}>Crew Onboarding & Daily Check</p>
            <p className={styles.quizDescription}>Please complete the following information</p>
          </div>

          <QuizProgress currentStep={quizStep} totalSteps={TOTAL_QUIZ_STEPS} />

          <div className={styles.quizContent}>
            {quizStep === 0 && (
              <div className={styles.quizStep}>
                <h3>What is your name?</h3>
                <input
                  type="text"
                  value={quizData.name}
                  onChange={(e) => setQuizData({...quizData, name: e.target.value})}
                  placeholder="Enter your name"
                  className={styles.quizInput}
                />
              </div>
            )}
            
            {quizStep === 1 && (
              <div className={styles.quizStep}>
                <h3>What is your age?</h3>
                <input
                  type="number"
                  value={quizData.age}
                  onChange={(e) => setQuizData({...quizData, age: e.target.value})}
                  placeholder="Enter your age"
                  className={styles.quizInput}
                  min="1"
                  max="120"
                />
              </div>
            )}

            {quizStep === 2 && (
              <div className={styles.quizStep}>
                <h3>Gender</h3>
                <div className={styles.quizOptions}>
                  {['Male', 'Female', 'Other', 'Prefer not to say'].map(option => (
                    <button
                      key={option}
                      onClick={() => setQuizData({...quizData, gender: option})}
                      className={`${styles.quizOption} ${quizData.gender === option ? styles.quizOptionActive : ''}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 3 && (
              <div className={styles.quizStep}>
                {quizData.heightUnit === 'ft-in' ? (
                  <>
                    <h3>What is your height?</h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={quizData.heightFeet}
                        onChange={(e) => setQuizData({...quizData, heightFeet: e.target.value})}
                        placeholder="5"
                        className={styles.quizInput}
                        style={{ flex: 1 }}
                      />
                      <span>ft</span>
                      <input
                        type="number"
                        value={quizData.heightInches}
                        onChange={(e) => setQuizData({...quizData, heightInches: e.target.value})}
                        placeholder="9"
                        className={styles.quizInput}
                        style={{ flex: 1 }}
                      />
                      <span>in</span>
                    </div>
                    <select
                      value={quizData.heightUnit}
                      onChange={(e) => setQuizData({...quizData, heightUnit: e.target.value as HeightUnit})}
                      className={styles.quizInput}
                      style={{ marginTop: '10px' }}
                    >
                      {heightUnitOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {heightValidation && (
                      <>
                        {heightValidation.warning && (
                          <div className={heightValidation.valid ? styles.warning : styles.error}>
                            {heightValidation.warning}
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <MultiUnitInput
                    label="What is your height?"
                    value={quizData.height}
                    unit={quizData.heightUnit}
                    unitOptions={heightUnitOptions}
                    onChange={(val) => setQuizData({...quizData, height: val})}
                    onUnitChange={(unit) => setQuizData({...quizData, heightUnit: unit as HeightUnit})}
                    placeholder="Enter height"
                    error={heightValidation && !heightValidation.valid ? heightValidation.warning : undefined}
                    warning={heightValidation && heightValidation.valid && heightValidation.warning ? heightValidation.warning : undefined}
                    info="Height is used to calculate BMI and assess health metrics"
                  />
                )}
              </div>
            )}

            {quizStep === 4 && (
              <div className={styles.quizStep}>
                <MultiUnitInput
                  label="What is your weight?"
                  value={quizData.weight}
                  unit={quizData.weightUnit}
                  unitOptions={weightUnitOptions}
                  onChange={(val) => setQuizData({...quizData, weight: val})}
                  onUnitChange={(unit) => setQuizData({...quizData, weightUnit: unit as WeightUnit})}
                  placeholder="Enter weight"
                  error={weightValidation && !weightValidation.valid ? weightValidation.warning : undefined}
                  warning={weightValidation && weightValidation.valid && weightValidation.warning ? weightValidation.warning : undefined}
                  info="Weight is used to calculate BMI and nutritional requirements"
                />
                {quizData.height && quizData.weight && quizData.heightUnit !== 'ft-in' && (
                  <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(100, 150, 255, 0.1)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '14px', margin: 0 }}>
                      BMI: {calculateBMI(
                        convertHeightToCm(parseFloat(quizData.height), quizData.heightUnit),
                        convertWeightToKg(parseFloat(quizData.weight), quizData.weightUnit)
                      ).toFixed(1)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {quizStep === 5 && (
              <div className={styles.quizStep}>
                <MultiUnitInput
                  label="What is your body temperature?"
                  value={quizData.temperature}
                  unit={quizData.temperatureUnit}
                  unitOptions={tempUnitOptions}
                  onChange={(val) => setQuizData({...quizData, temperature: val})}
                  onUnitChange={(unit) => setQuizData({...quizData, temperatureUnit: unit as TemperatureUnit})}
                  placeholder="Enter temperature"
                  error={tempValidation && !tempValidation.valid ? tempValidation.warning : undefined}
                  warning={tempValidation && tempValidation.valid && tempValidation.warning ? tempValidation.warning : undefined}
                  info="Normal body temperature is 36.1-37.2°C (97-99°F)"
                />
              </div>
            )}

            {quizStep === 6 && (
              <div className={styles.quizStep}>
                <BloodPressureInput
                  systolic={quizData.bloodPressureSystolic}
                  diastolic={quizData.bloodPressureDiastolic}
                  onSystolicChange={(val) => setQuizData({...quizData, bloodPressureSystolic: val})}
                  onDiastolicChange={(val) => setQuizData({...quizData, bloodPressureDiastolic: val})}
                  error={bpValidation && !bpValidation.valid ? bpValidation.warning : undefined}
                  warning={bpValidation && bpValidation.valid && bpValidation.warning ? bpValidation.warning : undefined}
                />
              </div>
            )}

            {quizStep === 7 && (
              <div className={styles.quizStep}>
                <h3>Oxygen Saturation (SpO2)</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={quizData.oxygenSaturation}
                    onChange={(e) => setQuizData({...quizData, oxygenSaturation: e.target.value})}
                    placeholder="98"
                    className={styles.quizInput}
                    style={{ flex: 1 }}
                    min="50"
                    max="100"
                  />
                  <span>%</span>
                </div>
                <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.6 }}>
                  Normal range: 95-100%. Values below 90% require immediate medical attention.
                </p>
                {spo2Validation && (
                  <>
                    {spo2Validation.warning && (
                      <div className={spo2Validation.valid ? styles.warning : styles.error}>
                        {spo2Validation.warning}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {quizStep === 8 && (
              <div className={styles.quizStep}>
                <h3>Activity Level</h3>
                <div className={styles.quizOptions}>
                  {['Low', 'Medium', 'High'].map(option => (
                    <button
                      key={option}
                      onClick={() => setQuizData({...quizData, activityLevel: option.toLowerCase()})}
                      className={`${styles.quizOption} ${quizData.activityLevel === option.toLowerCase() ? styles.quizOptionActive : ''}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 9 && (
              <div className={styles.quizStep}>
                <h3>Heart Rate Measurement</h3>
                <p className={styles.heartRateInstructions}>
                  Tap once per heartbeat for 10 seconds. The system will calculate your BPM.
                </p>
                
                {!hasCompleted && !isMeasuring && (
                  <div className={styles.heartRateContainer}>
                    <button 
                      onClick={startHeartRateMeasurement}
                      className={styles.heartRateStartBtn}
                    >
                      Start Measurement
                    </button>
                  </div>
                )}

                {isMeasuring && (
                  <div className={styles.heartRateContainer}>
                    <div className={styles.heartRateTimer}>
                      <div className={styles.timerDisplay}>{timeRemaining}</div>
                      <p className={styles.timerLabel}>seconds remaining</p>
                    </div>
                    <div className={styles.beatCounter}>
                      <p className={styles.beatLabel}>Beats counted:</p>
                      <div className={styles.beatNumber}>{beatCount}</div>
                    </div>
                    <button 
                      onClick={handleBeatTap}
                      className={styles.heartRateTapBtn}
                      disabled={timeRemaining === 0}
                    >
                      Tap for Each Heartbeat
                    </button>
                  </div>
                )}

                {hasCompleted && (
                  <div className={styles.heartRateContainer}>
                    <div className={styles.heartRateResult}>
                      <div className={styles.resultDisplay}>
                        <div className={styles.resultNumber}>{beatCount}</div>
                        <div className={styles.resultLabel}>beats in 10 seconds</div>
                        <div className={styles.bpmDisplay}>
                          {parseInt(quizData.heartRate) || 0} BPM
                        </div>
                      </div>
                      <button 
                        onClick={resetHeartRateMeasurement}
                        className={styles.heartRateRetryBtn}
                      >
                        Redo Measurement
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {quizStep === 10 && (
              <div className={styles.quizStep}>
                <h3>How many hours do you sleep per night?</h3>
                <input
                  type="number"
                  value={quizData.sleepHours}
                  onChange={(e) => setQuizData({...quizData, sleepHours: e.target.value})}
                  placeholder="Enter hours (e.g., 7.5)"
                  className={styles.quizInput}
                  min="0"
                  max="24"
                  step="0.5"
                />
                <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.6 }}>
                  Recommended: 7-9 hours for optimal health
                </p>
              </div>
            )}

            {quizStep === 11 && (
              <div className={styles.quizStep}>
                <RolePicker
                  selectedRole={quizData.crewRole}
                  onRoleChange={(role) => setQuizData({...quizData, crewRole: role})}
                />
                <div style={{ marginTop: '20px' }}>
                  <h4>Shift Mode</h4>
                  <div className={styles.quizOptions}>
                    {(['normal', 'emergency', 'training'] as ShiftMode[]).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setQuizData({...quizData, shiftMode: mode})}
                        className={`${styles.quizOption} ${quizData.shiftMode === mode ? styles.quizOptionActive : ''}`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.quizFooter}>
            {quizStep > 0 && (
              <button onClick={handleQuizBack} className={styles.quizBtnSecondary}>
                Back
              </button>
            )}
            <button 
              onClick={handleQuizNext}
              className={styles.quizBtnPrimary}
              disabled={isNextDisabled()}
            >
              {quizStep === TOTAL_QUIZ_STEPS - 1 ? 'Complete Setup' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading && telemetryData.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading HELIOS Control Center...</div>
      </div>
    )
  }

  const roleSummary = getRoleBasedSummary()
  const roleDef = userProfile ? getRoleDefinition(userProfile.crewRole) : null

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>HELIOS</h1>
          <p className={styles.subtitle}>BENNU KEPLER STATION</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userProfile?.name || 'Explorer'}</span>
            <span className={styles.userRole}>{userProfile ? getRoleDisplayName(userProfile.crewRole) : 'Station Member'}</span>
            {userProfile && (
              <span className={styles.shiftMode}>
                Shift: {userProfile.shiftMode.charAt(0).toUpperCase() + userProfile.shiftMode.slice(1)}
              </span>
            )}
          </div>
          {userProfile && (
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Log Out
            </button>
          )}
          {userProfile && (
            <button onClick={handleDownloadSessionReport} className={styles.logoutBtn} style={{ marginLeft: '10px' }}>
              Download Report
            </button>
          )}
          <div className={styles.statusIndicator}>
            <span className={styles.statusDot}></span>
            <span>Operational</span>
          </div>
        </div>
      </header>

      <div className={styles.mainLayout}>
        {/* Main Content Area */}
        <div className={styles.mainContent}>
          {/* Role-based Views */}
          {userProfile && userProfile.crewRole === 'ship-control' && (
            <ShipControlView telemetryData={telemetryData} currentState={currentState} />
          )}
          
          {userProfile && userProfile.crewRole === 'educator' && (
            <EducatorView />
          )}
          
          {/* Standard Role Summary for other roles */}
          {userProfile && userProfile.crewRole !== 'ship-control' && userProfile.crewRole !== 'educator' && (
            <div className={styles.personalizedSection}>
              <div className={styles.personalCard}>
                <h2 className={styles.sectionTitle}>Your Role & Responsibilities</h2>
                <div className={styles.healthList}>
                  {roleSummary.map((info, idx) => (
                    <div key={idx} className={styles.healthItem}>
                      <span>{info}</span>
                    </div>
                  ))}
                </div>
                {roleDef && (
                  <div style={{ marginTop: '15px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Priority Metrics:</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {roleDef.priorityMetrics.map((metric, idx) => (
                        <span key={idx} style={{ 
                          padding: '4px 8px', 
                          background: 'rgba(100, 150, 255, 0.2)', 
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Food & Nutrition Section - Hide for ship-control and educator */}
          {userProfile && userProfile.crewRole !== 'ship-control' && userProfile.crewRole !== 'educator' && (
            <div className={styles.personalizedSection}>
              <div className={styles.personalCard}>
                <h2 className={styles.sectionTitle}>Meal and Safety Guidance (Kepler Station)</h2>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="checkbox"
                      checked={emergencyRationMode}
                      onChange={(e) => setEmergencyRationMode(e.target.checked)}
                    />
                    <span>Emergency Ration Mode</span>
                  </label>
                </div>
                <FoodList
                  selectedFoods={selectedFoods}
                  onFoodToggle={(id) => setSelectedFoods(prev => 
                    prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
                  )}
                  searchQuery={foodSearchQuery}
                  onSearchChange={setFoodSearchQuery}
                  selectedCategory={foodCategory}
                  onCategoryChange={setFoodCategory}
                />
                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(100, 150, 255, 0.1)', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Daily Intake Checklist</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Water (L)"
                      value={dailyWater}
                      onChange={(e) => setDailyWater(e.target.value)}
                      className={styles.quizInput}
                    />
                    <input
                      type="text"
                      placeholder="Calories (kcal)"
                      value={dailyCalories}
                      onChange={(e) => setDailyCalories(e.target.value)}
                      className={styles.quizInput}
                    />
                    <input
                      type="text"
                      placeholder="Protein (g)"
                      value={dailyProtein}
                      onChange={(e) => setDailyProtein(e.target.value)}
                      className={styles.quizInput}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Status Overview - Show for all except educator */}
          {(!userProfile || userProfile.crewRole !== 'educator') && (
          <div className={styles.statusGrid}>
            <div className={styles.statusCard}>
              <div className={styles.statusIcon}>🌬️</div>
              <div className={styles.statusInfo}>
                <div className={styles.statusLabel}>Oxygen</div>
                <div className={styles.statusValue}>{currentState?.o2_pct?.toFixed(2) || '0.00'}%</div>
              </div>
              <div className={styles.statusBar}>
                <div 
                  className={styles.statusBarFill} 
                  style={{ 
                    width: `${((currentState?.o2_pct || 0) / 23) * 100}%`,
                    backgroundColor: currentState?.o2_pct < 20 ? '#f44336' : '#4caf50'
                  }}
                ></div>
              </div>
            </div>

            <div className={styles.statusCard}>
              <div className={styles.statusIcon}>💨</div>
              <div className={styles.statusInfo}>
                <div className={styles.statusLabel}>CO2</div>
                <div className={styles.statusValue}>{currentState?.co2_ppm?.toFixed(0) || '0'} ppm</div>
              </div>
              <div className={styles.statusBar}>
                <div 
                  className={styles.statusBarFill} 
                  style={{ 
                    width: `${Math.min(((currentState?.co2_ppm || 0) / 500) * 100, 100)}%`,
                    backgroundColor: currentState?.co2_ppm > 450 ? '#f44336' : '#4caf50'
                  }}
                ></div>
              </div>
            </div>

            <div className={styles.statusCard}>
              <div className={styles.statusIcon}>🔧</div>
              <div className={styles.statusInfo}>
                <div className={styles.statusLabel}>Pressure</div>
                <div className={styles.statusValue}>{currentState?.pressure_kpa?.toFixed(1) || '0.0'} kPa</div>
              </div>
              <div className={styles.statusBar}>
                <div 
                  className={styles.statusBarFill} 
                  style={{ 
                    width: `${((currentState?.pressure_kpa || 0) / 103) * 100}%`,
                    backgroundColor: currentState?.pressure_kpa < 95 ? '#f44336' : '#4caf50'
                  }}
                ></div>
              </div>
            </div>

            <div className={styles.statusCard}>
              <div className={styles.statusIcon}>☀️</div>
              <div className={styles.statusInfo}>
                <div className={styles.statusLabel}>Solar Power</div>
                <div className={styles.statusValue}>{currentState?.solar_kw?.toFixed(0) || '0'} kW</div>
              </div>
              <div className={styles.statusBar}>
                <div 
                  className={styles.statusBarFill} 
                  style={{ 
                    width: `${((currentState?.solar_kw || 0) / 1100) * 100}%`,
                    backgroundColor: '#2196f3'
                  }}
                ></div>
              </div>
            </div>

            <div className={styles.statusCard}>
              <div className={styles.statusIcon}>🔋</div>
              <div className={styles.statusInfo}>
                <div className={styles.statusLabel}>Battery</div>
                <div className={styles.statusValue}>{currentState?.battery_kwh?.toFixed(0) || '0'} kWh</div>
              </div>
              <div className={styles.statusBar}>
                <div 
                  className={styles.statusBarFill} 
                  style={{ 
                    width: `${((currentState?.battery_kwh || 0) / 500) * 100}%`,
                    backgroundColor: currentState?.battery_kwh < 50 ? '#f44336' : '#9c27b0'
                  }}
                ></div>
              </div>
            </div>

            <div className={styles.statusCard}>
              <div className={styles.statusIcon}>☢️</div>
              <div className={styles.statusInfo}>
                <div className={styles.statusLabel}>Radiation</div>
                <div className={styles.statusValue}>{currentState?.radiation_msv_hr?.toFixed(4) || '0.0000'} mSv/hr</div>
              </div>
              <div className={styles.statusBar}>
                <div 
                  className={styles.statusBarFill} 
                  style={{ 
                    width: `${Math.min(((currentState?.radiation_msv_hr || 0) / 0.1) * 100, 100)}%`,
                    backgroundColor: currentState?.radiation_msv_hr > 0.05 ? '#f44336' : '#4caf50'
                  }}
                ></div>
              </div>
            </div>
          </div>
          )}

          {/* Charts Grid - Show for all except educator */}
          {(!userProfile || userProfile.crewRole !== 'educator') && (
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Oxygen (O2) %</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={telemetryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} />
                  <YAxis domain={[19, 23]} stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="o2_pct" stroke="#4CAF50" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>CO2 (ppm)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={telemetryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} />
                  <YAxis domain={[300, 600]} stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="co2_ppm" stroke="#FF9800" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Solar Power (kW)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={telemetryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} />
                  <YAxis domain={[0, 1200]} stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="solar_kw" stroke="#2196F3" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Battery (kWh)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={telemetryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} />
                  <YAxis domain={[0, 500]} stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="battery_kwh" stroke="#9C27B0" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Radiation (mSv/hr)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={telemetryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} />
                  <YAxis domain={[0, 0.1]} stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="radiation_msv_hr" stroke="#F44336" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Pressure (kPa)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={telemetryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} />
                  <YAxis domain={[90, 105]} stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: 10}} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="pressure_kpa" stroke="#00BCD4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          )}

          {/* Alerts and Recommendations - Show for all except educator */}
          {(!userProfile || userProfile.crewRole !== 'educator') && (
          <div className={styles.tablesGrid}>
            <div className={styles.tableCard}>
              <h2 className={styles.tableTitle}>Active Alerts ({alerts.length})</h2>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Severity</th>
                      <th>System</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className={styles.emptyCell}>No active alerts</td>
                      </tr>
                    ) : (
                      alerts.map((alert) => (
                        <tr key={alert.id} className={styles[alert.severity.toLowerCase()]}>
                          <td>{new Date(alert.timestamp).toLocaleTimeString()}</td>
                          <td>
                            <span className={styles[`badge_${alert.severity.toLowerCase()}`]}>
                              {alert.severity}
                            </span>
                          </td>
                          <td>{alert.system}</td>
                          <td>{alert.message}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.tableCard}>
              <h2 className={styles.tableTitle}>Recommendations ({recommendations.length})</h2>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Category</th>
                      <th>Title</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendations.length === 0 ? (
                      <tr>
                        <td colSpan={4} className={styles.emptyCell}>No recommendations</td>
                      </tr>
                    ) : (
                      recommendations.map((rec) => (
                        <tr key={rec.id}>
                          <td>
                            <span className={styles[`badge_${rec.priority}`]}>
                              {rec.priority}
                            </span>
                          </td>
                          <td>{rec.category}</td>
                          <td>{rec.title}</td>
                          <td>
                            {rec.action_required && (
                              <button
                                onClick={() => handleApprove(rec.id)}
                                className={styles.approveBtn}
                              >
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Sidebar - HELIOS Console */}
        {userProfile && (
          <div className={styles.sidebar}>
            <HeliosConsole
              userRole={userProfile.crewRole}
              shiftMode={userProfile.shiftMode}
              vitals={userProfile.vitals}
              dietaryConstraints={userProfile.dietaryRestrictions}
            />
          </div>
        )}
      </div>
    </div>
  )
}
