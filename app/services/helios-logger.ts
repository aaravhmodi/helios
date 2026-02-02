/**
 * HELIOS logging service
 * Logs all AI interactions with full transparency
 */

import { HeliosLogEntry, CrewRole, ShiftMode, Vitals, RiskLevel } from '../core/models'
import { saveHeliosLog, loadHeliosLogs } from '../store/local-storage'

export interface HeliosLogInput {
  userMessage: string
  userRole: CrewRole
  vitals?: Vitals
  shiftMode: ShiftMode
  dietaryConstraints?: string[]
  modelUsed: string | null
  outputSummary: string
  reasoningSummary: string
  riskLevel: RiskLevel
  suggestedActions: string[]
  citations?: string[]
  confidence: number
}

export function createHeliosLogEntry(input: HeliosLogInput): HeliosLogEntry {
  return {
    id: `helios_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    inputContext: {
      userMessage: input.userMessage,
      userRole: input.userRole,
      vitals: input.vitals,
      shiftMode: input.shiftMode,
      dietaryConstraints: input.dietaryConstraints
    },
    modelUsed: input.modelUsed,
    outputSummary: input.outputSummary,
    reasoningSummary: input.reasoningSummary,
    riskLevel: input.riskLevel,
    suggestedActions: input.suggestedActions,
    citations: input.citations,
    userAction: 'pending',
    confidence: input.confidence
  }
}

export function logHeliosInteraction(input: HeliosLogInput): HeliosLogEntry {
  const entry = createHeliosLogEntry(input)
  saveHeliosLog(entry)
  return entry
}

export function updateHeliosLogAction(logId: string, action: 'accepted' | 'ignored'): void {
  const logs = loadHeliosLogs()
  const log = logs.find(l => l.id === logId)
  if (log) {
    log.userAction = action
    // Save back to storage
    localStorage.setItem('kepler_station_helios_logs', JSON.stringify(logs))
  }
}

export function getAllHeliosLogs(): HeliosLogEntry[] {
  return loadHeliosLogs()
}

export function getHeliosLogsByRole(role: CrewRole): HeliosLogEntry[] {
  return loadHeliosLogs().filter(log => log.inputContext.userRole === role)
}

export function getHeliosLogsByRiskLevel(riskLevel: RiskLevel): HeliosLogEntry[] {
  return loadHeliosLogs().filter(log => log.riskLevel === riskLevel)
}
