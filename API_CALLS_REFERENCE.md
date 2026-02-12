# API Calls Reference

This document shows all API calls in the HELIOS codebase.

## 1. OpenAI API Call (Chat Route)

**Location:** `app/api/chat/route.ts`

```typescript
// OpenAI API call with JSON response format
completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: jsonMessages,
  temperature: 0.7,
  max_tokens: 1500,
  response_format: { type: "json_object" }
})

// Fallback if JSON format fails
completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: jsonMessages,
  temperature: 0.7,
  max_tokens: 1500
})
```

**Purpose:** Generates AI responses for the HELIOS chatbot
**Parameters:**
- `model`: "gpt-4o-mini" (OpenAI model)
- `messages`: Array of conversation messages (system, user, assistant)
- `temperature`: 0.7 (creativity level)
- `max_tokens`: 1500 (max response length)
- `response_format`: { type: "json_object" } (forces JSON response)

---

## 2. Frontend Chat API Call (HeliosConsole)

**Location:** `app/ui/helios/HeliosConsole.tsx`

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: input,
    conversationHistory: conversationHistory,
    context: {
      userRole,
      shiftMode,
      vitals,
      dietaryConstraints
    }
  })
})

const data = await response.json()
```

**Purpose:** Sends user message to the chat API with context
**Request Body:**
- `message`: User's input text
- `conversationHistory`: Previous messages for context
- `context`: User role, shift mode, vitals, dietary constraints

---

## 3. Frontend Chat API Call (Home Page)

**Location:** `app/page.tsx`

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userMessage }),
})

const data = await response.json()
```

**Purpose:** Simple chat interface on home page
**Request Body:**
- `message`: User's input text

---

## 4. FastAPI Backend - Settlement State

**Location:** `app/dashboard/page.tsx`

```typescript
const stateRes = await fetch(`${API_BASE}/settlement-state`)
const stateData = await stateRes.json()
```

**Purpose:** Fetches current settlement state (O2, CO2, power, etc.)
**Endpoint:** `http://localhost:8000/api/settlement-state`
**Response:** Settlement state object with telemetry data

---

## 5. FastAPI Backend - Alerts

**Location:** `app/dashboard/page.tsx`

```typescript
const alertsRes = await fetch(`${API_BASE}/alerts?limit=10&resolved=false`)
const alertsData = await alertsRes.json()
```

**Purpose:** Fetches active alerts
**Endpoint:** `http://localhost:8000/api/alerts`
**Query Parameters:**
- `limit`: Number of alerts to return (default: 10)
- `resolved`: Filter by resolved status (false = active alerts)

---

## 6. FastAPI Backend - Recommendations

**Location:** `app/dashboard/page.tsx`

```typescript
const recsRes = await fetch(`${API_BASE}/recommendations?limit=10&action_required=true`)
const recsData = await recsRes.json()
```

**Purpose:** Fetches recommendations requiring action
**Endpoint:** `http://localhost:8000/api/recommendations`
**Query Parameters:**
- `limit`: Number of recommendations to return
- `action_required`: Filter for recommendations needing action

---

## 7. FastAPI Backend - Approve Recommendation

**Location:** `app/api/approve/route.ts`

```typescript
const response = await fetch(`${API_BASE}/safety/approve/${recommendation_id}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ approved_by: approved_by || 'dashboard_user' })
})
```

**Purpose:** Approves a safety recommendation
**Endpoint:** `http://localhost:8000/api/safety/approve/{recommendation_id}`
**Method:** POST
**Request Body:**
- `approved_by`: Username or identifier of approver

---

## API Base URLs

```typescript
// Frontend API (Next.js)
const FRONTEND_API = '/api'  // Relative to Next.js server

// Backend API (FastAPI)
const API_BASE = 'http://localhost:8000/api'
```

---

## Error Handling Patterns

### OpenAI API Errors
```typescript
try {
  completion = await openai.chat.completions.create({...})
} catch (apiError: any) {
  // Retry without JSON format
  completion = await openai.chat.completions.create({...})
} catch (retryError: any) {
  // Fall back to rule-based responses
}
```

### Fetch API Errors
```typescript
const response = await fetch(url, options)

if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.error || `Server error: ${response.status}`)
}

const data = await response.json()
```

---

## Request/Response Examples

### Chat API Request
```json
{
  "message": "What should I monitor as a Medical Officer?",
  "conversationHistory": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" }
  ],
  "context": {
    "userRole": "medical-officer",
    "shiftMode": "normal",
    "vitals": {
      "heartRate": 72,
      "bloodPressure": { "systolic": 120, "diastolic": 80 }
    },
    "dietaryConstraints": ["vegetarian"]
  }
}
```

### Chat API Response
```json
{
  "response": "As a Medical Officer, you should monitor...",
  "riskLevel": "low",
  "reasoningSummary": "Based on your role and current vitals...",
  "suggestedActions": [
    "Monitor crew vitals hourly",
    "Check oxygen saturation levels"
  ],
  "citations": ["HELIOS Medical Protocols"],
  "confidence": 0.85,
  "logId": "helios_1234567890_abc123",
  "modelUsed": "gpt-4o-mini",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Environment Variables

```bash
# .env.local
OPENAI_API_KEY=sk-proj-...
```

The OpenAI API key is loaded from `.env.local` at runtime in the API route.
