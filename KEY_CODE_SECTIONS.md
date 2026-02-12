# Key Code Sections - Quick Reference

## 1. Chatbot Response Generation (Most Important)

**File**: `app/api/chat/route.ts`

```typescript
// Main API handler
export async function POST(request: NextRequest) {
  const { message, conversationHistory, context } = await request.json()
  
  // Get knowledge context from knowledge base
  const knowledgeContext = getKnowledgeContext(message)
  
  // Try OpenAI API first
  if (openai && apiKey) {
    try {
      // Build messages with conversation history
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: contextPrompt }
      ]
      
      // Add last 10 messages for context
      if (conversationHistory) {
        conversationHistory.slice(-10).forEach(msg => {
          messages.push({ role: msg.role, content: msg.content })
        })
      }
      
      // Add current user message
      messages.push({ role: "user", content: message })
      
      // Call OpenAI
      const completion = await openai.chat.completions.create({...})
      
      return { response, riskLevel, reasoningSummary, ... }
    } catch (error) {
      // Fall through to fallback
    }
  }
  
  // Fallback: Rule-based response
  const fallbackResponse = generateEnhancedResponse(message, knowledgeContext)
  return { response: fallbackResponse, ... }
}
```

---

## 2. Knowledge Base Search

**File**: `app/lib/knowledge-base.ts`

```typescript
// Search function that matches keywords to knowledge sections
export function getKnowledgeContext(query: string): string {
  const lowerQuery = query.toLowerCase()
  const sections: string[] = []
  
  // Match keywords to knowledge sections
  if (lowerQuery.includes('orbit') || lowerQuery.includes('orbital')) {
    sections.push(`ORBITAL CHARACTERISTICS:\n${HELIOS_KNOWLEDGE_BASE.orbitAndAsteroid.orbitalCharacteristics}`)
  }
  
  if (lowerQuery.includes('water') || lowerQuery.includes('recovery')) {
    sections.push(`LIFE SUPPORT - Water: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.waterRecovery}`)
  }
  
  if (lowerQuery.includes('life support') || lowerQuery.includes('atmosphere')) {
    sections.push(`LIFE SUPPORT - Atmosphere: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.atmosphere}`)
  }
  
  // ... many more keyword matches
  
  // If no match, return overview
  if (sections.length === 0) {
    return `HELIOS Space Settlement Overview:\n\n${...}`
  }
  
  return sections.join('\n\n---\n\n')
}
```

---

## 3. Chatbot UI - Conversation History

**File**: `app/ui/helios/HeliosConsole.tsx`

```typescript
const handleSend = async () => {
  // Build conversation history from previous messages
  const conversationHistory = messages
    .filter(msg => msg.role !== 'helios' || msg.content !== 'HELIOS Console active...')
    .map(msg => ({
      role: msg.role === 'helios' ? 'assistant' : 'user',
      content: msg.content
    }))
  
  // Send to API with conversation history
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: input,
      conversationHistory: conversationHistory,  // ← Context for AI
      context: {
        userRole,
        shiftMode,
        vitals,
        dietaryConstraints
      }
    })
  })
  
  const data = await response.json()
  
  // Add response to messages
  setMessages(prev => [...prev, {
    id: Date.now().toString(),
    role: 'helios',
    content: data.response,
    riskLevel: data.riskLevel,
    reasoningSummary: data.reasoningSummary,
    suggestedActions: data.suggestedActions
  }])
}
```

---

## 4. Role-Based Dashboard Filtering

**File**: `app/dashboard/page.tsx`

```typescript
// Get role definition
const roleDef = getRoleDefinition(userProfile.crewRole)

// Filter status cards based on role priorities
const filteredStatusCards = statusCards.filter(card => 
  roleDef.priorityMetrics.includes(card.id) || 
  roleDef.priorityMetrics.includes('all')
)

// Filter alerts
const filteredAlerts = alerts.filter(alert => {
  if (roleDef.priorityMetrics.includes('all')) return true
  // Map alert categories to metrics
  return roleDef.priorityMetrics.some(metric => 
    alert.category.toLowerCase().includes(metric)
  )
})

// Render role-specific views
if (userProfile.crewRole === 'ship-control') {
  return <ShipControlView currentState={currentState} />
}

if (userProfile.crewRole === 'educator') {
  return <EducatorView />
}
```

---

## 5. User Profile Model

**File**: `app/core/models.ts`

```typescript
export interface UserProfile {
  // Identity
  name: string
  age: number
  gender: string
  
  // Physical (normalized to metric)
  height: number | null  // cm
  weight: number | null  // kg
  bmi: number | null
  
  // Vitals
  vitals: Vitals  // { heartRate, bloodPressure, oxygenSaturation, temperature }
  
  // Role & Context
  crewRole: CrewRole
  shiftMode: ShiftMode
  
  // Preferences
  preferredUnits: {
    height: HeightUnit  // 'cm' | 'm' | 'ft-in'
    weight: WeightUnit  // 'kg' | 'lb'
    temperature: TemperatureUnit  // 'celsius' | 'fahrenheit'
  }
  
  // Timestamps
  createdAt: string
  lastUpdated: string
}
```

---

## 6. Rule-Based Response Generation

**File**: `app/api/chat/route.ts`

```typescript
function generateEnhancedResponse(userMessage: string, knowledgeContext: string): string {
  const lowerMessage = userMessage.toLowerCase()
  
  // Use specific knowledge context if available
  if (knowledgeContext && !knowledgeContext.includes('HELIOS Space Settlement Overview')) {
    return knowledgeContext
  }
  
  // Try to get more specific context
  const specificContext = getKnowledgeContext(userMessage)
  if (specificContext && !specificContext.includes('HELIOS Space Settlement Overview')) {
    return specificContext
  }
  
  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return `Greetings, Explorer. I am HELIOS...`
  }
  
  // Extract keywords and generate response
  const keywords = extractKeywords(lowerMessage)
  if (keywords.length > 0) {
    return generateKeywordResponse(keywords, userMessage)
  }
  
  // Default response with helpful suggestions
  return `I understand you're asking about "${userMessage}". As HELIOS AI...`
}
```

---

## 7. Role Definitions

**File**: `app/core/roles.ts`

```typescript
export const CREW_ROLES: RoleDefinition[] = [
  {
    id: 'life-support-engineer',
    displayName: 'Life Support Engineer',
    priorityMetrics: ['o2_pct', 'co2_ppm', 'pressure_kpa', 'humidity_pct'],
    defaultThresholds: {
      o2_pct: { warning: 20.5, critical: 19.5 },
      co2_ppm: { warning: 450, critical: 500 }
    },
    keyResponsibilities: [
      'Monitor O2/CO2 levels',
      'Maintain atmospheric pressure',
      'Oversee water recovery systems'
    ]
  },
  {
    id: 'ship-control',
    displayName: 'Ship Control / Operations',
    priorityMetrics: ['all'],  // ← Shows everything
    defaultThresholds: {},
    keyResponsibilities: [
      'Monitor all station systems',
      'Track all levels and metrics'
    ]
  },
  {
    id: 'educator',
    displayName: 'Educator',
    priorityMetrics: [],  // ← No metrics, shows curriculum
    defaultThresholds: {},
    keyResponsibilities: [
      'Crew training',
      'Educational programs (Grades 1-12, University)'
    ]
  }
  // ... more roles
]
```

---

## 8. Data Persistence

**File**: `app/store/local-storage.ts`

```typescript
// Save user profile
export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem('kepler_station_user_profile', JSON.stringify(profile))
}

// Load user profile
export function loadUserProfile(): UserProfile | null {
  const data = localStorage.getItem('kepler_station_user_profile')
  return data ? JSON.parse(data) : null
}

// Save HELIOS logs
export function saveHeliosLog(entry: HeliosLogEntry): void {
  const logs = loadHeliosLogs()
  logs.push(entry)
  localStorage.setItem('kepler_station_helios_logs', JSON.stringify(logs))
}
```

---

## 🔑 **Quick Tips**

1. **To add chatbot knowledge**: Edit `app/lib/knowledge-base.ts` → `HELIOS_KNOWLEDGE_BASE` object
2. **To modify chatbot logic**: Edit `app/api/chat/route.ts` → `generateEnhancedResponse()`
3. **To add a new role**: Edit `app/core/roles.ts` → Add to `CREW_ROLES` array
4. **To change dashboard filtering**: Edit `app/dashboard/page.tsx` → Role-based filtering logic
5. **To debug chatbot**: Check terminal running `npm run dev` for console logs

---

## 📍 **File Locations**

```
app/
├── core/
│   ├── models.ts          ← Type definitions
│   ├── roles.ts           ← Role configurations
│   └── unit-conversions.ts ← Unit conversion utilities
├── lib/
│   └── knowledge-base.ts  ← Chatbot knowledge (MOST IMPORTANT)
├── api/
│   └── chat/
│       └── route.ts        ← Chatbot API logic
├── ui/
│   ├── helios/
│   │   └── HeliosConsole.tsx ← Chat UI
│   └── dashboard/
│       ├── ShipControlView.tsx
│       └── EducatorView.tsx
├── dashboard/
│   └── page.tsx            ← Main dashboard (orchestrates everything)
└── store/
    └── local-storage.ts    ← Data persistence
```
