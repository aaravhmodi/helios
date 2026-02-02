/**
 * Session report generation and export
 */

import { UserProfile, RiskAssessment, HeliosLogEntry, SessionReport } from '../core/models'
import { loadHeliosLogs, saveSessionReport } from '../store/local-storage'

export function generateSessionReport(
  userProfile: UserProfile,
  riskFlags: RiskAssessment[],
  sessionStartTime: Date
): SessionReport {
  const heliosLogs = loadHeliosLogs()
  const sessionDuration = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
  
  const report: SessionReport = {
    userProfile,
    riskFlags,
    heliosLogs,
    timestamp: new Date().toISOString(),
    sessionDuration
  }
  
  saveSessionReport(report)
  return report
}

export function downloadSessionReport(report: SessionReport): void {
  const dataStr = JSON.stringify(report, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `kepler_station_report_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function formatSessionReportAsText(report: SessionReport): string {
  const lines: string[] = []
  
  lines.push('='.repeat(60))
  lines.push('BENNU KEPLER STATION - SESSION REPORT')
  lines.push('='.repeat(60))
  lines.push('')
  lines.push(`Generated: ${new Date(report.timestamp).toLocaleString()}`)
  lines.push(`Session Duration: ${Math.floor(report.sessionDuration / 60)} minutes`)
  lines.push('')
  
  lines.push('USER PROFILE')
  lines.push('-'.repeat(60))
  lines.push(`Name: ${report.userProfile.name}`)
  lines.push(`Role: ${report.userProfile.crewRole}`)
  lines.push(`Age: ${report.userProfile.age}`)
  lines.push(`Shift Mode: ${report.userProfile.shiftMode}`)
  if (report.userProfile.vitals.heartRate) {
    lines.push(`Heart Rate: ${report.userProfile.vitals.heartRate} BPM`)
  }
  if (report.userProfile.vitals.bloodPressure) {
    lines.push(`Blood Pressure: ${report.userProfile.vitals.bloodPressure.systolic}/${report.userProfile.vitals.bloodPressure.diastolic} mmHg`)
  }
  if (report.userProfile.vitals.oxygenSaturation) {
    lines.push(`SpO2: ${report.userProfile.vitals.oxygenSaturation}%`)
  }
  lines.push('')
  
  if (report.riskFlags.length > 0) {
    lines.push('RISK FLAGS')
    lines.push('-'.repeat(60))
    report.riskFlags.forEach((risk, idx) => {
      lines.push(`${idx + 1}. [${risk.level.toUpperCase()}] ${risk.category}`)
      lines.push(`   ${risk.message}`)
      if (risk.recommendations.length > 0) {
        lines.push(`   Recommendations:`)
        risk.recommendations.forEach(rec => lines.push(`     - ${rec}`))
      }
      lines.push('')
    })
  }
  
  if (report.heliosLogs.length > 0) {
    lines.push('HELIOS INTERACTION LOGS')
    lines.push('-'.repeat(60))
    report.heliosLogs.forEach((log, idx) => {
      lines.push(`${idx + 1}. [${log.timestamp}]`)
      lines.push(`   User: ${log.inputContext.userMessage}`)
      lines.push(`   Risk Level: ${log.riskLevel.toUpperCase()}`)
      lines.push(`   Confidence: ${(log.confidence * 100).toFixed(1)}%`)
      lines.push(`   Summary: ${log.outputSummary}`)
      if (log.reasoningSummary) {
        lines.push(`   Reasoning: ${log.reasoningSummary}`)
      }
      if (log.suggestedActions.length > 0) {
        lines.push(`   Suggested Actions:`)
        log.suggestedActions.forEach(action => lines.push(`     - ${action}`))
      }
      lines.push(`   User Action: ${log.userAction}`)
      lines.push('')
    })
  }
  
  lines.push('='.repeat(60))
  lines.push('END OF REPORT')
  lines.push('='.repeat(60))
  
  return lines.join('\n')
}

export function downloadSessionReportAsText(report: SessionReport): void {
  const text = formatSessionReportAsText(report)
  const dataBlob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `kepler_station_report_${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
