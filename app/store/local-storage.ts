/**
 * Local storage utilities for persisting user data
 */

import { UserProfile, HeliosLogEntry, SessionReport } from '../core/models'

const STORAGE_KEYS = {
  USER_PROFILE: 'kepler_station_user_profile',
  QUIZ_STATE: 'kepler_station_quiz_state',
  HELIOS_LOGS: 'kepler_station_helios_logs',
  SESSION_REPORT: 'kepler_station_session_report'
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile))
  } catch (error) {
    console.error('Failed to save user profile:', error)
  }
}

export function loadUserProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE)
    if (!data) return null
    return JSON.parse(data) as UserProfile
  } catch (error) {
    console.error('Failed to load user profile:', error)
    return null
  }
}

export function clearUserProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE)
  } catch (error) {
    console.error('Failed to clear user profile:', error)
  }
}

export function saveQuizState(state: any): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_STATE, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save quiz state:', error)
  }
}

export function loadQuizState(): any | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZ_STATE)
    if (!data) return null
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to load quiz state:', error)
    return null
  }
}

export function clearQuizState(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.QUIZ_STATE)
  } catch (error) {
    console.error('Failed to clear quiz state:', error)
  }
}

export function saveHeliosLog(entry: HeliosLogEntry): void {
  try {
    const logs = loadHeliosLogs()
    logs.push(entry)
    localStorage.setItem(STORAGE_KEYS.HELIOS_LOGS, JSON.stringify(logs))
  } catch (error) {
    console.error('Failed to save HELIOS log:', error)
  }
}

export function loadHeliosLogs(): HeliosLogEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HELIOS_LOGS)
    if (!data) return []
    return JSON.parse(data) as HeliosLogEntry[]
  } catch (error) {
    console.error('Failed to load HELIOS logs:', error)
    return []
  }
}

export function clearHeliosLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HELIOS_LOGS)
  } catch (error) {
    console.error('Failed to clear HELIOS logs:', error)
  }
}

export function saveSessionReport(report: SessionReport): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION_REPORT, JSON.stringify(report))
  } catch (error) {
    console.error('Failed to save session report:', error)
  }
}

export function loadSessionReport(): SessionReport | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION_REPORT)
    if (!data) return null
    return JSON.parse(data) as SessionReport
  } catch (error) {
    console.error('Failed to load session report:', error)
    return null
  }
}
