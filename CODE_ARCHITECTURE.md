# HELIOS Codebase Architecture - Key Components

This document outlines the most important parts of the HELIOS codebase and how they work together.

---

## 🏗️ **1. Core Data Models** (`app/core/models.ts`)

**Purpose**: Defines all TypeScript interfaces and types used throughout the application.

### Key Types:
- **`UserProfile`**: Complete user information (name, age, vitals, role, preferences)
- **`Vitals`**: Health metrics (heart rate, blood pressure, SpO2, temperature)
- **`CrewRole`**: User roles (life-support-engineer, medical-officer, educator, etc.)
- **`HeliosLogEntry`**: Chatbot interaction logs with conversation history
- **`RiskAssessment`**: Risk level evaluations
- **`SessionReport`**: Complete session data export

**Why it's important**: All components use these types for type safety and consistency.

---

## 🧠 **2. Knowledge Base** (`app/lib/knowledge-base.ts`)

**Purpose**: Contains all the information the chatbot knows about Kepler Station.

### Structure:
```typescript
export const HELIOS_KNOWLEDGE_BASE = {
  introduction: { ... },
  settlementOverview: { ... },
  orbitAndAsteroid: { ... },
  heliosAI: { ... },
  design: { ... },
  lifeSupport: { ... },
  safety: { ... },
  population: { ... },
  governance: { ... },
  // ... more sections
}
```

### Key Function:
**`getKnowledgeContext(query: string)`**: Searches the knowledge base based on keywords in the user's query and returns relevant sections.

**Why it's important**: This is the chatbot's "brain" - all responses come from here when OpenAI API is not available.

**To add new information**: Edit `HELIOS_KNOWLEDGE_BASE` and add keyword matching in `getKnowledgeContext()`.

---

## 💬 **3. Chat API Route** (`app/api/chat/route.ts`)

**Purpose**: Handles all chatbot requests and generates responses.

### Flow:
1. Receives user message + conversation history
2. Gets knowledge context from `getKnowledgeContext()`
3. Tries OpenAI API (if key is available)
4. Falls back to rule-based system if OpenAI fails
5. Returns structured response with risk level, reasoning, etc.

### Key Functions:
- **`generateAIResponse()`**: Main function that orchestrates OpenAI or fallback
- **`generateEnhancedResponse()`**: Rule-based response generator using knowledge base
- **`extractKeywords()`**: Extracts relevant keywords from user message
- **`generateKeywordResponse()`**: Creates responses based on keywords

**Why it's important**: This is where all chatbot logic lives. It decides whether to use AI or fallback.

---

## 🎨 **4. Chatbot UI** (`app/ui/helios/HeliosConsole.tsx`)

**Purpose**: The user interface for chatting with HELIOS.

### Key Features:
- Displays message history
- Shows risk levels, reasoning summaries, suggested actions
- Maintains conversation history
- Sends context (user role, vitals, shift mode) with each message

### Important State:
```typescript
const [messages, setMessages] = useState<HeliosMessage[]>([])
const [conversationHistory, setConversationHistory] = useState([])
```

**Why it's important**: This is what users interact with. It collects conversation history for contextual responses.

---

## 📊 **5. Dashboard Page** (`app/dashboard/page.tsx`)

**Purpose**: Main application page that orchestrates everything.

### Key Responsibilities:
1. **Quiz Flow**: Multi-step onboarding quiz to collect user profile
2. **Data Fetching**: Gets telemetry data from FastAPI backend
3. **Role-Based Views**: Shows different dashboards based on user role
4. **State Management**: Manages user profile, telemetry, alerts, recommendations

### Role-Based Personalization:
```typescript
// Different views for different roles
if (userProfile.crewRole === 'ship-control') {
  return <ShipControlView />
}
if (userProfile.crewRole === 'educator') {
  return <EducatorView />
}
// Filter metrics based on role priorities
const roleDef = getRoleDefinition(userProfile.crewRole)
const filteredMetrics = metrics.filter(m => 
  roleDef.priorityMetrics.includes(m.id) || roleDef.priorityMetrics.includes('all')
)
```

**Why it's important**: This is the main entry point and coordinates all features.

---

## 👥 **6. Role Definitions** (`app/core/roles.ts`)

**Purpose**: Defines what each crew role sees and prioritizes.

### Structure:
```typescript
export const CREW_ROLES: RoleDefinition[] = [
  {
    id: 'life-support-engineer',
    displayName: 'Life Support Engineer',
    priorityMetrics: ['o2_pct', 'co2_ppm', 'pressure_kpa'],
    defaultThresholds: { ... },
    keyResponsibilities: [ ... ]
  },
  // ... more roles
]
```

### Key Function:
**`getRoleDefinition(roleId)`**: Returns the role configuration for dashboard personalization.

**Why it's important**: Enables role-based dashboard filtering and customization.

---

## 💾 **7. Local Storage** (`app/store/local-storage.ts`)

**Purpose**: Persists user data in the browser.

### What's Saved:
- User profile (quiz results)
- Quiz state (for resuming)
- HELIOS interaction logs
- Session reports

### Key Functions:
- `saveUserProfile()` / `loadUserProfile()`
- `saveHeliosLog()` / `loadHeliosLogs()`
- `saveSessionReport()` / `loadSessionReport()`

**Why it's important**: Data persists across page refreshes. User doesn't lose their profile.

---

## 🔧 **8. Unit Conversions** (`app/core/unit-conversions.ts`)

**Purpose**: Converts between metric and imperial units.

### Key Functions:
- `convertHeightToCm()`: Converts feet/inches or meters to cm
- `convertWeightToKg()`: Converts pounds to kg
- `convertTemperatureToC()`: Converts Fahrenheit to Celsius
- Validation functions for all units

**Why it's important**: Users can input data in their preferred units, but internally everything is normalized to metric.

---

## 🎯 **9. Specialized Views**

### Ship Control View (`app/ui/dashboard/ShipControlView.tsx`)
- Shows ALL system levels and telemetry
- For users who need comprehensive oversight

### Educator View (`app/ui/dashboard/EducatorView.tsx`)
- Shows curriculum data (Grades 1-12, University)
- For education-focused users

**Why it's important**: Provides role-specific interfaces beyond the standard dashboard.

---

## 🔄 **Data Flow**

```
User Input (HeliosConsole)
    ↓
POST /api/chat
    ↓
getKnowledgeContext() → searches knowledge-base.ts
    ↓
generateAIResponse() → tries OpenAI or fallback
    ↓
generateEnhancedResponse() → uses knowledge base
    ↓
Response with risk level, reasoning, actions
    ↓
Display in HeliosConsole
    ↓
Log to localStorage (helios-logger.ts)
```

---

## 🎯 **Key Files Summary**

| File | Purpose | Critical For |
|------|---------|--------------|
| `app/core/models.ts` | Type definitions | Type safety, data structure |
| `app/lib/knowledge-base.ts` | Chatbot knowledge | Chatbot responses |
| `app/api/chat/route.ts` | Chatbot API | Chatbot logic |
| `app/ui/helios/HeliosConsole.tsx` | Chat UI | User interaction |
| `app/dashboard/page.tsx` | Main page | Application orchestration |
| `app/core/roles.ts` | Role definitions | Dashboard personalization |
| `app/store/local-storage.ts` | Data persistence | Saving user data |
| `app/core/unit-conversions.ts` | Unit handling | Multi-unit support |

---

## 🚀 **How to Extend**

### Add New Knowledge:
1. Edit `app/lib/knowledge-base.ts` → Add to `HELIOS_KNOWLEDGE_BASE`
2. Edit `getKnowledgeContext()` → Add keyword matching

### Add New Role:
1. Edit `app/core/roles.ts` → Add to `CREW_ROLES` array
2. Create view component (optional) → `app/ui/dashboard/NewRoleView.tsx`
3. Edit `app/dashboard/page.tsx` → Add conditional rendering

### Modify Chatbot Behavior:
1. Edit `app/api/chat/route.ts` → Modify `generateEnhancedResponse()`
2. Add new keyword patterns in `getKnowledgeContext()`

---

## 📝 **Notes**

- **OpenAI API**: If `OPENAI_API_KEY` is set and valid, uses GPT-4o-mini. Otherwise uses rule-based fallback.
- **Conversation History**: Last 10 messages are sent to OpenAI for context.
- **Debug Logging**: Check terminal running `npm run dev` for chatbot debug logs.
- **FastAPI Backend**: Provides telemetry data at `http://localhost:8000/api/settlement-state`
