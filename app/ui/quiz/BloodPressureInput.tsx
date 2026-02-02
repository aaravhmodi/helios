'use client'

import styles from './BloodPressureInput.module.css'

interface BloodPressureInputProps {
  systolic: string
  diastolic: string
  onSystolicChange: (value: string) => void
  onDiastolicChange: (value: string) => void
  error?: string
  warning?: string
}

export default function BloodPressureInput({
  systolic,
  diastolic,
  onSystolicChange,
  onDiastolicChange,
  error,
  warning
}: BloodPressureInputProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>
        Blood Pressure
        <span className={styles.infoIcon} title="Systolic: pressure when heart beats. Diastolic: pressure when heart rests.">
          ℹ️
        </span>
      </label>
      
      <div className={styles.inputGroup}>
        <div className={styles.inputWrapper}>
          <input
            type="number"
            value={systolic}
            onChange={(e) => onSystolicChange(e.target.value)}
            placeholder="120"
            className={`${styles.input} ${error ? styles.inputError : ''} ${warning ? styles.inputWarning : ''}`}
            min="70"
            max="250"
          />
          <span className={styles.inputLabel}>Systolic</span>
        </div>
        
        <div className={styles.separator}>/</div>
        
        <div className={styles.inputWrapper}>
          <input
            type="number"
            value={diastolic}
            onChange={(e) => onDiastolicChange(e.target.value)}
            placeholder="80"
            className={`${styles.input} ${error ? styles.inputError : ''} ${warning ? styles.inputWarning : ''}`}
            min="40"
            max="150"
          />
          <span className={styles.inputLabel}>Diastolic</span>
        </div>
        
        <div className={styles.unitLabel}>mmHg</div>
      </div>
      
      <div className={styles.example}>
        Example: 120/80 mmHg (normal range)
      </div>
      
      {error && <div className={styles.error}>{error}</div>}
      {warning && <div className={styles.warning}>{warning}</div>}
    </div>
  )
}
