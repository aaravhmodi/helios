'use client'

import styles from './RoleBasedViews.module.css'

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

interface ShipControlViewProps {
  telemetryData: TelemetryData[]
  currentState: any
}

export default function ShipControlView({ telemetryData, currentState }: ShipControlViewProps) {
  // Ship Control sees ALL system levels organized by category
  const systemLevels = {
    'Atmospheric Systems': [
      { label: 'Oxygen (O2)', value: currentState?.o2_pct?.toFixed(2) || '0.00', unit: '%', status: currentState?.o2_pct >= 20.5 ? 'normal' : 'warning' },
      { label: 'Carbon Dioxide (CO2)', value: currentState?.co2_ppm?.toFixed(0) || '0', unit: 'ppm', status: currentState?.co2_ppm <= 450 ? 'normal' : 'warning' },
      { label: 'Atmospheric Pressure', value: currentState?.pressure_kpa?.toFixed(1) || '0.0', unit: 'kPa', status: currentState?.pressure_kpa >= 98 ? 'normal' : 'warning' },
      { label: 'Temperature', value: currentState?.temp_c?.toFixed(1) || '0.0', unit: '°C', status: 'normal' }
    ],
    'Power Systems': [
      { label: 'Solar Power Generation', value: currentState?.solar_kw?.toFixed(0) || '0', unit: 'kW', status: currentState?.solar_kw >= 200 ? 'normal' : 'warning' },
      { label: 'Battery Storage', value: currentState?.battery_kwh?.toFixed(0) || '0', unit: 'kWh', status: currentState?.battery_kwh >= 100 ? 'normal' : 'warning' },
      { label: 'Power Efficiency', value: '85', unit: '%', status: 'normal' },
      { label: 'Load Distribution', value: '720', unit: 'kW', status: 'normal' }
    ],
    'Radiation & Safety': [
      { label: 'Radiation Level', value: currentState?.radiation_msv_hr?.toFixed(4) || '0.0000', unit: 'mSv/hr', status: currentState?.radiation_msv_hr <= 0.05 ? 'normal' : 'warning' },
      { label: 'Shielding Effectiveness', value: '98.5', unit: '%', status: 'normal' },
      { label: 'Emergency Systems', value: 'Operational', unit: '', status: 'normal' }
    ],
    'Structural Systems': [
      { label: 'Rotation Rate', value: '1.9', unit: 'RPM', status: 'normal' },
      { label: 'Artificial Gravity', value: '0.38', unit: 'g', status: 'normal' },
      { label: 'Structural Integrity', value: '99.2', unit: '%', status: 'normal' },
      { label: 'Bearing Load', value: 'Normal', unit: '', status: 'normal' }
    ],
    'Life Support Systems': [
      { label: 'Water Recovery Rate', value: '98.5', unit: '%', status: 'normal' },
      { label: 'Waste Recycling', value: '95.2', unit: '%', status: 'normal' },
      { label: 'Air Filtration', value: '99.8', unit: '%', status: 'normal' }
    ],
    'Agricultural Systems': [
      { label: 'Crop Health Index', value: '0.87', unit: '', status: 'normal' },
      { label: 'Food Production Rate', value: '102', unit: '% of target', status: 'normal' },
      { label: 'Nutrient Cycle Efficiency', value: '94.5', unit: '%', status: 'normal' }
    ]
  }

  return (
    <div className={styles.shipControlView}>
      <h2 className={styles.viewTitle}>Complete System Status - Ship Control</h2>
      <p className={styles.viewDescription}>
        Comprehensive overview of all station systems and levels. Monitor all metrics across all departments.
      </p>
      
      <div className={styles.systemGrid}>
        {Object.entries(systemLevels).map(([category, levels]) => (
          <div key={category} className={styles.systemCategory}>
            <h3 className={styles.categoryTitle}>{category}</h3>
            <div className={styles.levelsList}>
              {levels.map((level, idx) => (
                <div key={idx} className={`${styles.levelItem} ${styles[`status${level.status}`]}`}>
                  <div className={styles.levelLabel}>{level.label}</div>
                  <div className={styles.levelValue}>
                    <span className={styles.value}>{level.value}</span>
                    {level.unit && <span className={styles.unit}>{level.unit}</span>}
                  </div>
                  <div className={`${styles.statusIndicator} ${styles[level.status]}`}>
                    {level.status === 'normal' ? '✓' : '⚠'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
