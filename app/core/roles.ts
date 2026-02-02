/**
 * Crew role definitions and role-based personalization
 */

import { CrewRole, RiskLevel } from './models'

export interface RoleDefinition {
  id: CrewRole
  displayName: string
  description: string
  keyResponsibilities: string[]
  priorityMetrics: string[]
  defaultThresholds: {
    [key: string]: {
      warning: number
      critical: number
    }
  }
}

export const CREW_ROLES: RoleDefinition[] = [
  {
    id: 'life-support-engineer',
    displayName: 'Life Support Engineer',
    keyResponsibilities: [
      'Monitor O2/CO2 levels',
      'Maintain atmospheric pressure',
      'Oversee water recovery systems',
      'Coordinate with agricultural systems'
    ],
    priorityMetrics: ['o2_pct', 'co2_ppm', 'pressure_kpa', 'humidity_pct'],
    defaultThresholds: {
      o2_pct: { warning: 20.5, critical: 19.5 },
      co2_ppm: { warning: 450, critical: 500 },
      pressure_kpa: { warning: 98, critical: 95 }
    },
    description: 'Oversees atmospheric control, water recovery, and life support systems'
  },
  {
    id: 'medical-officer',
    displayName: 'Medical Officer',
    keyResponsibilities: [
      'Monitor crew health vitals',
      'Triage medical emergencies',
      'Coordinate with HELIOS for health alerts',
      'Maintain medical supplies'
    ],
    priorityMetrics: ['radiation_msv_hr', 'temp_c', 'o2_pct'],
    defaultThresholds: {
      radiation_msv_hr: { warning: 0.1, critical: 0.5 },
      temp_c: { warning: 25, critical: 20 }
    },
    description: 'Primary healthcare provider and medical emergency coordinator'
  },
  {
    id: 'agricultural-specialist',
    displayName: 'Agricultural Specialist',
    keyResponsibilities: [
      'Manage crop production',
      'Monitor nutrient cycles',
      'Coordinate O2/CO2 balance with life support',
      'Optimize food production'
    ],
    priorityMetrics: ['crop_health_index', 'co2_ppm', 'o2_pct'],
    defaultThresholds: {
      crop_health_index: { warning: 0.7, critical: 0.5 },
      co2_ppm: { warning: 450, critical: 500 }
    },
    description: 'Manages food production, crop health, and agricultural systems'
  },
  {
    id: 'structural-engineer',
    displayName: 'Structural/Mechanical Engineer',
    keyResponsibilities: [
      'Monitor structural integrity',
      'Track rotation stability',
      'Oversee maintenance schedules',
      'Coordinate with asteroid anchoring systems'
    ],
    priorityMetrics: ['strain_index', 'pressure_kpa'],
    defaultThresholds: {
      strain_index: { warning: 0.7, critical: 0.9 },
      pressure_kpa: { warning: 98, critical: 95 }
    },
    description: 'Ensures structural integrity and mechanical systems operation'
  },
  {
    id: 'robotics-tech',
    displayName: 'Robotics/Operations Tech',
    keyResponsibilities: [
      'Maintain robotic systems',
      'Monitor power distribution',
      'Coordinate EVA operations',
      'Manage equipment status'
    ],
    priorityMetrics: ['solar_kw', 'battery_kwh', 'load_kw'],
    defaultThresholds: {
      battery_kwh: { warning: 100, critical: 50 },
      solar_kw: { warning: 200, critical: 100 }
    },
    description: 'Maintains robotic systems, power infrastructure, and operational equipment'
  },
  {
    id: 'commander',
    displayName: 'Commander / Shift Lead',
    keyResponsibilities: [
      'Overall station coordination',
      'Emergency decision-making',
      'Crew safety oversight',
      'HELIOS recommendation review'
    ],
    priorityMetrics: ['all'],
    defaultThresholds: {},
    description: 'Overall station command and emergency coordination'
  },
  {
    id: 'ship-control',
    displayName: 'Ship Control / Operations',
    keyResponsibilities: [
      'Monitor all station systems',
      'Track all levels and metrics',
      'Coordinate system-wide operations',
      'Oversee multi-system integration'
    ],
    priorityMetrics: ['all'],
    defaultThresholds: {},
    description: 'Comprehensive oversight of all station systems and levels'
  },
  {
    id: 'educator',
    displayName: 'Educator',
    keyResponsibilities: [
      'Crew training',
      'Educational programs (Grades 1-12, University)',
      'Curriculum development',
      'Documentation',
      'Knowledge transfer'
    ],
    priorityMetrics: [],
    defaultThresholds: {},
    description: 'Manages education, training, and knowledge systems'
  },
  {
    id: 'general-crew',
    displayName: 'General Crew / Resident',
    keyResponsibilities: [
      'Daily operations',
      'Maintenance tasks',
      'Community support'
    ],
    priorityMetrics: ['o2_pct', 'pressure_kpa', 'radiation_msv_hr'],
    defaultThresholds: {
      o2_pct: { warning: 20.5, critical: 19.5 },
      pressure_kpa: { warning: 98, critical: 95 }
    },
    description: 'General station resident and crew member'
  },
  {
    id: 'visitor',
    displayName: 'Visitor / Temporary Specialist',
    keyResponsibilities: [
      'Follow station protocols',
      'Complete assigned tasks'
    ],
    priorityMetrics: ['o2_pct', 'pressure_kpa'],
    defaultThresholds: {
      o2_pct: { warning: 20.5, critical: 19.5 },
      pressure_kpa: { warning: 98, critical: 95 }
    },
    description: 'Temporary visitor or specialist on station'
  }
]

export function getRoleDefinition(roleId: CrewRole): RoleDefinition {
  return CREW_ROLES.find(r => r.id === roleId) || CREW_ROLES[CREW_ROLES.length - 1]
}

export function getRoleDisplayName(roleId: CrewRole): string {
  return getRoleDefinition(roleId).displayName
}
