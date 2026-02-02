'use client'

import { useState } from 'react'
import styles from './MultiUnitInput.module.css'

export interface UnitOption {
  value: string
  label: string
  example?: string
}

interface MultiUnitInputProps {
  label: string
  value: string
  unit: string
  unitOptions: UnitOption[]
  onChange: (value: string) => void
  onUnitChange: (unit: string) => void
  placeholder?: string
  error?: string
  warning?: string
  info?: string
}

export default function MultiUnitInput({
  label,
  value,
  unit,
  unitOptions,
  onChange,
  onUnitChange,
  placeholder,
  error,
  warning,
  info
}: MultiUnitInputProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>
        {label}
        {info && (
          <span className={styles.infoIcon} title={info}>
            ℹ️
          </span>
        )}
      </label>
      
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${styles.input} ${error ? styles.inputError : ''} ${warning ? styles.inputWarning : ''}`}
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          className={styles.unitSelect}
        >
          {unitOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {unitOptions.find(o => o.value === unit)?.example && (
        <div className={styles.example}>
          Example: {unitOptions.find(o => o.value === unit)?.example}
        </div>
      )}
      
      {error && <div className={styles.error}>{error}</div>}
      {warning && <div className={styles.warning}>{warning}</div>}
    </div>
  )
}
