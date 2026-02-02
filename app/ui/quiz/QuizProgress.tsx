'use client'

import styles from './QuizProgress.module.css'

interface QuizProgressProps {
  currentStep: number
  totalSteps: number
}

export default function QuizProgress({ currentStep, totalSteps }: QuizProgressProps) {
  const percentage = (currentStep / totalSteps) * 100
  
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressHeader}>
        <span className={styles.progressLabel}>Question {currentStep + 1} of {totalSteps}</span>
        <span className={styles.progressPercentage}>{Math.round(percentage)}%</span>
      </div>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
