'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ChatMessage from '../components/ChatMessage'
import styles from './dashboard.module.css'

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

interface UserProfile {
  name: string
  age: number
  gender: string
  height: number | null // in cm
  weight: number | null // in kg
  bmi: number | null
  activityLevel: string
  sleepHours: number | null
  healthConditions: string[]
  dietaryRestrictions: string[]
  role: string
  heartRate: number | null
}

const API_BASE = 'http://localhost:8000/api'

export default function Dashboard() {
  const [showQuiz, setShowQuiz] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([])
  const [currentState, setCurrentState] = useState<any>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Quiz state
  const [quizStep, setQuizStep] = useState(0)
  const [quizData, setQuizData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    heartRate: '',
    sleepHours: '',
    healthConditions: [] as string[],
    dietaryRestrictions: [] as string[],
    role: ''
  })
  
  // Heart rate measurement state
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(10)
  const [beatCount, setBeatCount] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(false)
  
  // Chat state
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    {
      role: 'assistant',
      content: 'HELIOS Control Center active. All systems operational. How may I assist you?'
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)

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

  const handleQuizNext = () => {
    if (quizStep === 10) {
      // Complete quiz
      const height = quizData.height ? parseFloat(quizData.height) : null
      const weight = quizData.weight ? parseFloat(quizData.weight) : null
      const bmi = (height && weight) ? calculateBMI(height, weight) : null
      
      const profile: UserProfile = {
        name: quizData.name,
        age: parseInt(quizData.age),
        gender: quizData.gender,
        height: height,
        weight: weight,
        bmi: bmi,
        activityLevel: quizData.activityLevel,
        healthConditions: quizData.healthConditions,
        dietaryRestrictions: quizData.dietaryRestrictions,
        role: quizData.role,
        heartRate: quizData.heartRate ? parseInt(quizData.heartRate) : null,
        sleepHours: quizData.sleepHours ? parseFloat(quizData.sleepHours) : null
      }
      setUserProfile(profile)
      setShowQuiz(false)
      localStorage.setItem('helios_user_profile', JSON.stringify(profile))
    } else {
      setQuizStep((prevStep) => prevStep + 1)
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
      setBeatCount(beatCount + 1)
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

  const handleQuizBack = () => {
    if (quizStep > 0) {
      setQuizStep(quizStep - 1)
    }
  }

  // Logout handler - clears profile and returns to quiz
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('helios_user_profile')
    
    // Reset all state
    setUserProfile(null)
    setShowQuiz(true)
    setQuizStep(0)
    setQuizData({
      name: '',
      age: '',
      gender: '',
      height: '',
      weight: '',
      activityLevel: '',
      heartRate: '',
      sleepHours: '',
      healthConditions: [],
      dietaryRestrictions: [],
      role: ''
    })
    
    // Reset heart rate measurement state
    setIsMeasuring(false)
    setTimeRemaining(10)
    setBeatCount(0)
    setHasCompleted(false)
    
    // Reset chat messages
    setMessages([
      {
        role: 'assistant',
        content: 'HELIOS Control Center active. All systems operational. How may I assist you?'
      }
    ])
  }

  // Calculate BMI from height (cm) and weight (kg)
  const calculateBMI = (height: number, weight: number): number => {
    const heightInMeters = height / 100
    return weight / (heightInMeters * heightInMeters)
  }

  // Get missing field name for error message
  const getMissingField = () => {
    switch(quizStep) {
      case 0: return 'Name'
      case 1: return 'Age'
      case 2: return 'Gender'
      case 3: return 'Height'
      case 4: return 'Weight'
      case 5: return 'Activity Level'
      case 6: return 'Heart Rate'
      case 7: return 'Sleep Hours'
      case 10: return 'Role'
      default: return 'Required field'
    }
  }

  // Check if Next button should be disabled
  const isNextDisabled = () => {
    switch(quizStep) {
      case 0: 
        return !quizData.name || quizData.name.trim() === ''
      case 1: 
        return !quizData.age || quizData.age.trim() === ''
      case 2: 
        return !quizData.gender
      case 3: 
        return !quizData.height || quizData.height.trim() === '' || isNaN(parseFloat(quizData.height))
      case 4: 
        return !quizData.weight || quizData.weight.trim() === '' || isNaN(parseFloat(quizData.weight))
      case 5: 
        return !quizData.activityLevel
      case 6: 
        return !quizData.heartRate || quizData.heartRate.trim() === ''
      case 7: 
        return !quizData.sleepHours || quizData.sleepHours.trim() === '' || isNaN(parseFloat(quizData.sleepHours))
      case 8: 
        return false // Health conditions are optional
      case 9: 
        return false // Dietary restrictions are optional
      case 10: 
        return !quizData.role
      default: 
        return false
    }
  }

  const toggleCheckbox = (array: string[], value: string, setter: (val: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(item => item !== value))
    } else {
      setter([...array, value])
    }
  }

  const getFoodRecommendations = () => {
    if (!userProfile) return []
    
    const foods: string[] = []
    
    // Base recommendations
    foods.push('Leafy greens (spinach, kale) - High in iron and vitamins')
    foods.push('Root vegetables (potatoes, carrots) - Energy dense')
    foods.push('Grains (rice, quinoa) - Carbohydrate source')
    foods.push('Protein sources (soy, lab-grown meat) - Essential amino acids')
    
    // BMI-based recommendations
    if (userProfile.bmi !== null) {
      if (userProfile.bmi < 18.5) {
        foods.push('High-calorie nutrient-dense foods - Weight gain support')
        foods.push('Healthy fats (avocado, nuts) - Calorie boost')
        foods.push('Protein-rich meals - Muscle building')
      } else if (userProfile.bmi >= 25 && userProfile.bmi < 30) {
        foods.push('Portion-controlled meals - Weight management')
        foods.push('High-fiber foods - Satiety and digestion')
        foods.push('Lean proteins - Maintain muscle mass')
      } else if (userProfile.bmi >= 30) {
        foods.push('Low-calorie, high-volume foods - Weight loss support')
        foods.push('Vegetables and fruits - Nutrient density')
        foods.push('Whole grains - Sustained energy, lower calories')
      }
    }
    
    // Activity-based
    if (userProfile.activityLevel === 'high') {
      foods.push('High-protein supplements - For muscle recovery')
      foods.push('Complex carbohydrates - Sustained energy')
      foods.push('Post-workout protein - Muscle repair')
    } else if (userProfile.activityLevel === 'low') {
      foods.push('Light, easily digestible meals - Low activity support')
      foods.push('Small frequent meals - Metabolism support')
    }
    
    // Sleep-based recommendations
    if (userProfile.sleepHours !== null) {
      if (userProfile.sleepHours < 6) {
        foods.push('Magnesium-rich foods (dark chocolate, almonds) - Sleep support')
        foods.push('Tryptophan sources (turkey, dairy) - Natural sleep aid')
        foods.push('Avoid caffeine after 2 PM - Better sleep quality')
      } else if (userProfile.sleepHours > 9) {
        foods.push('Energy-boosting foods - Combat oversleep fatigue')
        foods.push('B-vitamin rich foods - Energy metabolism')
      }
    }
    
    // Age-based
    if (userProfile.age > 50) {
      foods.push('Calcium-rich foods - Bone health in microgravity')
      foods.push('Vitamin D supplements - Essential for space')
      foods.push('Omega-3 fatty acids - Cognitive and heart health')
    }
    
    // Health conditions
    if (userProfile.healthConditions.includes('Diabetes')) {
      foods.push('Low-glycemic foods - Blood sugar management')
      foods.push('Complex carbs over simple sugars - Stable glucose')
      foods.push('Fiber-rich foods - Blood sugar control')
    }
    if (userProfile.healthConditions.includes('Hypertension')) {
      foods.push('Low-sodium options - Blood pressure control')
      foods.push('Potassium-rich foods (bananas, sweet potatoes) - BP regulation')
      foods.push('DASH diet principles - Heart health')
    }
    if (userProfile.healthConditions.includes('Asthma')) {
      foods.push('Anti-inflammatory foods (berries, fish) - Lung health')
      foods.push('Vitamin C sources - Respiratory support')
    }
    
    // Dietary restrictions
    if (userProfile.dietaryRestrictions.includes('vegetarian')) {
      foods.push('Plant-based proteins - Tofu, tempeh, legumes')
      foods.push('Iron-rich plant foods - Prevent anemia')
    }
    if (userProfile.dietaryRestrictions.includes('vegan')) {
      foods.push('Complete plant proteins - Quinoa, chia seeds')
      foods.push('B12-fortified foods - Essential nutrient')
      foods.push('Iron and calcium sources - Plant-based nutrition')
    }
    if (userProfile.dietaryRestrictions.includes('gluten-free')) {
      foods.push('Gluten-free grains - Rice, quinoa, buckwheat')
      foods.push('Naturally gluten-free options - Safe alternatives')
    }
    
    return foods
  }

  const getHealthInfo = () => {
    if (!userProfile) return []
    
    const health: string[] = []
    
    // BMI information
    if (userProfile.bmi !== null) {
      const bmi = userProfile.bmi
      let bmiCategory = ''
      let bmiRecommendation = ''
      
      if (bmi < 18.5) {
        bmiCategory = 'Underweight'
        bmiRecommendation = 'Consider nutritional consultation for healthy weight gain'
      } else if (bmi >= 18.5 && bmi < 25) {
        bmiCategory = 'Normal'
        bmiRecommendation = 'Maintain current weight with balanced nutrition'
      } else if (bmi >= 25 && bmi < 30) {
        bmiCategory = 'Overweight'
        bmiRecommendation = 'Focus on portion control and increased activity'
      } else {
        bmiCategory = 'Obese'
        bmiRecommendation = 'Consult medical for weight management plan'
      }
      
      health.push(`BMI: ${bmi.toFixed(1)} (${bmiCategory})`)
      health.push(`Weight Status: ${bmiRecommendation}`)
      
      if (userProfile.height && userProfile.weight) {
        health.push(`Height: ${userProfile.height} cm | Weight: ${userProfile.weight} kg`)
      }
    }
    
    // Heart rate information
    if (userProfile.heartRate !== null) {
      const hr = userProfile.heartRate
      let hrStatus = 'Normal'
      let hrRecommendation = ''
      
      if (hr < 60) {
        hrStatus = 'Resting (Low)'
        hrRecommendation = 'Consider consulting medical if consistently below 60 BPM'
      } else if (hr >= 60 && hr <= 100) {
        hrStatus = 'Normal'
        hrRecommendation = 'Heart rate is within healthy range'
      } else if (hr > 100 && hr <= 120) {
        hrStatus = 'Elevated'
        hrRecommendation = 'Monitor heart rate, may indicate stress or activity'
      } else {
        hrStatus = 'High'
        hrRecommendation = 'Consider rest and monitoring. Consult medical if persistent'
      }
      
      health.push(`Current Heart Rate: ${hr} BPM (${hrStatus})`)
      health.push(`Heart Rate Status: ${hrRecommendation}`)
    }
    
    // Sleep information
    if (userProfile.sleepHours !== null) {
      const sleep = userProfile.sleepHours
      let sleepStatus = ''
      let sleepRecommendation = ''
      
      if (sleep < 6) {
        sleepStatus = 'Insufficient'
        sleepRecommendation = 'Aim for 7-9 hours. Consider sleep hygiene practices'
      } else if (sleep >= 6 && sleep < 7) {
        sleepStatus = 'Below Optimal'
        sleepRecommendation = 'Try to increase to 7-9 hours for better recovery'
      } else if (sleep >= 7 && sleep <= 9) {
        sleepStatus = 'Optimal'
        sleepRecommendation = 'Maintain this sleep schedule for optimal health'
      } else {
        sleepStatus = 'Excessive'
        sleepRecommendation = 'Monitor for underlying health issues if consistently over 9 hours'
      }
      
      health.push(`Sleep: ${sleep} hours/night (${sleepStatus})`)
      health.push(`Sleep Recommendation: ${sleepRecommendation}`)
    } else {
      health.push('Sleep: 7-9 hours recommended (maintain circadian rhythm)')
    }
    
    // Calculate caloric needs based on BMI and activity
    let baseCalories = 2000
    if (userProfile.weight) {
      // Mifflin-St Jeor approximation
      const base = userProfile.gender === 'Male' ? 10 * userProfile.weight + 6.25 * (userProfile.height || 170) - 5 * userProfile.age + 5
        : 10 * userProfile.weight + 6.25 * (userProfile.height || 160) - 5 * userProfile.age - 161
      baseCalories = base
    }
    
    const activityMultiplier = userProfile.activityLevel === 'high' ? 1.725 : userProfile.activityLevel === 'medium' ? 1.55 : 1.375
    const dailyCalories = Math.round(baseCalories * activityMultiplier)
    
    health.push(`Daily caloric needs: ${dailyCalories} kcal (based on your profile)`)
    health.push(`Protein requirement: ${userProfile.activityLevel === 'high' ? '1.6-2.0' : userProfile.activityLevel === 'medium' ? '1.4-1.6' : '1.2-1.4'} g per kg body weight`)
    health.push('Vitamin D: 2000 IU daily (critical in space)')
    health.push('Calcium: 1200-1500 mg daily (bone health in microgravity)')
    health.push('Iron: Monitor levels monthly (space anemia risk)')
    
    if (userProfile.age > 50) {
      health.push('Bone density scans: Every 6 months')
      health.push('Cardiovascular monitoring: Enhanced protocol')
    }
    
    if (userProfile.healthConditions.length > 0) {
      health.push(`Specialized monitoring for: ${userProfile.healthConditions.join(', ')}`)
    }
    
    health.push('Exercise: 2.5 hours weekly minimum (counteract microgravity effects)')
    
    return health
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

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatLoading) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsChatLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error processing your request. Please try again.' 
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  // Check for saved profile
  useEffect(() => {
    const saved = localStorage.getItem('helios_user_profile')
    if (saved) {
      setUserProfile(JSON.parse(saved))
      setShowQuiz(false)
    }
  }, [])

  // Quiz Component
  if (showQuiz) {
    return (
      <div className={styles.quizContainer}>
        <div className={styles.quizCard}>
          <div className={styles.quizHeader}>
            <h1 className={styles.quizTitle}>HELIOS</h1>
            <p className={styles.quizSubtitle}>KEPLER STATION AI HUB</p>
            <p className={styles.quizDescription}>Personalization Setup</p>
          </div>

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
                <h3>What is your height?</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={quizData.height}
                    onChange={(e) => setQuizData({...quizData, height: e.target.value})}
                    placeholder="Enter height"
                    className={styles.quizInput}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: '14px', opacity: 0.7 }}>cm</span>
                </div>
                <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.6 }}>
                  Example: 175 cm (5'9")
                </p>
              </div>
            )}

            {quizStep === 4 && (
              <div className={styles.quizStep}>
                <h3>What is your weight?</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={quizData.weight}
                    onChange={(e) => setQuizData({...quizData, weight: e.target.value})}
                    placeholder="Enter weight"
                    className={styles.quizInput}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: '14px', opacity: 0.7 }}>kg</span>
                </div>
                <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.6 }}>
                  Example: 70 kg (154 lbs)
                </p>
                {quizData.height && quizData.weight && (
                  <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(100, 150, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(100, 150, 255, 0.3)' }}>
                    <p style={{ fontSize: '14px', margin: 0 }}>
                      BMI: {calculateBMI(parseFloat(quizData.height), parseFloat(quizData.weight)).toFixed(1)}
                      {(() => {
                        const bmi = calculateBMI(parseFloat(quizData.height), parseFloat(quizData.weight))
                        if (bmi < 18.5) return ' (Underweight)'
                        if (bmi < 25) return ' (Normal)'
                        if (bmi < 30) return ' (Overweight)'
                        return ' (Obese)'
                      })()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {quizStep === 5 && (
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

            {quizStep === 6 && (
              <div className={styles.quizStep}>
                <h3>Heart Rate Measurement</h3>
                <p className={styles.heartRateInstructions}>
                  Place your finger on your pulse (wrist or neck). When ready, click Start and count your heartbeats for 10 seconds.
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
                        Retry Measurement
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {quizStep === 7 && (
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

            {quizStep === 8 && (
              <div className={styles.quizStep}>
                <h3>Health Conditions (Select all that apply)</h3>
                <div className={styles.quizCheckboxes}>
                  {['Diabetes', 'Hypertension', 'Asthma', 'Heart condition', 'None'].map(condition => (
                    <label key={condition} className={styles.quizCheckbox}>
                      <input
                        type="checkbox"
                        checked={quizData.healthConditions.includes(condition)}
                        onChange={() => toggleCheckbox(quizData.healthConditions, condition, (val) => setQuizData({...quizData, healthConditions: val}))}
                      />
                      <span>{condition}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 9 && (
              <div className={styles.quizStep}>
                <h3>Dietary Restrictions (Select all that apply)</h3>
                <div className={styles.quizCheckboxes}>
                  {['Vegetarian', 'Vegan', 'Gluten-free', 'Lactose intolerant', 'None'].map(restriction => (
                    <label key={restriction} className={styles.quizCheckbox}>
                      <input
                        type="checkbox"
                        checked={quizData.dietaryRestrictions.includes(restriction.toLowerCase())}
                        onChange={() => toggleCheckbox(quizData.dietaryRestrictions, restriction.toLowerCase(), (val) => setQuizData({...quizData, dietaryRestrictions: val}))}
                      />
                      <span>{restriction}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 10 && (
              <div className={styles.quizStep}>
                <h3>Your Role on Kepler Station</h3>
                <div className={styles.quizOptions}>
                  {['Engineer', 'Scientist', 'Medical', 'Agriculture', 'Administration', 'Other'].map(role => (
                    <button
                      key={role}
                      onClick={() => setQuizData({...quizData, role: role.toLowerCase()})}
                      className={`${styles.quizOption} ${quizData.role === role.toLowerCase() ? styles.quizOptionActive : ''}`}
                    >
                      {role}
                    </button>
                  ))}
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
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                
                if (isNextDisabled()) {
                  alert(`Please complete the required field before continuing.\n\nCurrent step: ${quizStep + 1}\nMissing: ${getMissingField()}`)
                  return
                }
                
                // Direct state update
                if (quizStep === 10) {
                  // Complete quiz
                  const height = quizData.height ? parseFloat(quizData.height) : null
                  const weight = quizData.weight ? parseFloat(quizData.weight) : null
                  const bmi = (height && weight) ? calculateBMI(height, weight) : null
                  
                  const profile: UserProfile = {
                    name: quizData.name,
                    age: parseInt(quizData.age),
                    gender: quizData.gender,
                    height: height,
                    weight: weight,
                    bmi: bmi,
                    activityLevel: quizData.activityLevel,
                    healthConditions: quizData.healthConditions,
                    dietaryRestrictions: quizData.dietaryRestrictions,
                    role: quizData.role,
                    heartRate: quizData.heartRate ? parseInt(quizData.heartRate) : null,
                    sleepHours: quizData.sleepHours ? parseFloat(quizData.sleepHours) : null
                  }
                  setUserProfile(profile)
                  setShowQuiz(false)
                  localStorage.setItem('helios_user_profile', JSON.stringify(profile))
                } else {
                  setQuizStep((prev) => {
                    const next = prev + 1
                    console.log('Updating quiz step from', prev, 'to', next)
                    return next
                  })
                }
              }}
              className={styles.quizBtnPrimary}
              type="button"
            >
              {quizStep === 10 ? 'Complete Setup' : 'Next'}
            </button>
          </div>

          <div className={styles.quizProgress}>
            <div className={styles.quizProgressBar}>
              <div 
                className={styles.quizProgressFill} 
                style={{ width: `${((quizStep + 1) / 11) * 100}%` }}
              ></div>
            </div>
            <span>Step {quizStep + 1} of 11</span>
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

  const foodRecommendations = getFoodRecommendations()
  const healthInfo = getHealthInfo()

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>HELIOS</h1>
          <p className={styles.subtitle}>KEPLER STATION AI HUB</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userProfile?.name || 'Explorer'}</span>
            <span className={styles.userRole}>{userProfile?.role || 'Station Member'}</span>
          </div>
          {userProfile && (
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Log Out
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
          {/* Personalized Health & Nutrition Section */}
          <div className={styles.personalizedSection}>
            <div className={styles.personalCard}>
              <h2 className={styles.sectionTitle}>Your Nutrition Plan</h2>
              <div className={styles.foodList}>
                {foodRecommendations.map((food, idx) => (
                  <div key={idx} className={styles.foodItem}>
                    <span className={styles.foodIcon}>🍽️</span>
                    <span>{food}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.personalCard}>
              <h2 className={styles.sectionTitle}>Health Information</h2>
              <div className={styles.healthList}>
                {healthInfo.map((info, idx) => (
                  <div key={idx} className={styles.healthItem}>
                    <span className={styles.healthIcon}>⚕️</span>
                    <span>{info}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Status Overview */}
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

          {/* Charts Grid */}
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

          {/* Alerts and Recommendations */}
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
        </div>

        {/* Sidebar - HELIOS Chat */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>HELIOS AI</h3>
            <div className={styles.chatStatus}>
              <span className={styles.statusDot}></span>
              Online
            </div>
          </div>
          
          <div className={styles.chatMessages}>
            {messages.map((message, index) => (
              <ChatMessage key={index} role={message.role} content={message.content} />
            ))}
            {isChatLoading && (
              <div className={styles.loading}>
                <span className={styles.loadingDot}></span>
                <span className={styles.loadingDot}></span>
                <span className={styles.loadingDot}></span>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className={styles.chatInput}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask HELIOS..."
              className={styles.chatInputField}
              disabled={isChatLoading}
            />
            <button type="submit" className={styles.chatSendBtn} disabled={isChatLoading || !chatInput.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
