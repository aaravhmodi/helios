# Bennu Kepler Station - UX Refactoring Guide

## Overview

This document describes the comprehensive refactoring of the quiz and chatbot UX into a professional "Bennu Kepler Station" crew interface for a permanent free-space settlement project.

## Architecture

### Folder Structure

```
app/
├── core/                    # Core data models and utilities
│   ├── models.ts           # TypeScript interfaces (UserProfile, Vitals, etc.)
│   ├── unit-conversions.ts  # Unit conversion utilities
│   └── roles.ts            # Crew role definitions
├── services/                # Business logic services
│   ├── helios-logger.ts    # HELIOS interaction logging
│   └── session-report.ts   # Session report generation
├── store/                   # State management
│   └── local-storage.ts    # LocalStorage utilities
├── ui/                      # UI components
│   ├── quiz/               # Quiz components
│   │   ├── QuizProgress.tsx
│   │   ├── MultiUnitInput.tsx
│   │   ├── BloodPressureInput.tsx
│   │   └── RolePicker.tsx
│   ├── food/               # Food/nutrition components
│   │   └── FoodList.tsx
│   └── helios/             # HELIOS chatbot
│       └── HeliosConsole.tsx
└── api/
    └── chat/
        └── route.ts        # Updated with HELIOS requirements
```

## Key Features Implemented

### 1. Core Data Models (`app/core/models.ts`)

- **UserProfile**: Complete user profile with normalized units (cm, kg, °C)
- **Vitals**: Heart rate, blood pressure, SpO2, temperature
- **CrewRole**: 9 predefined roles (Life Support Engineer, Medical Officer, etc.)
- **HeliosLogEntry**: Full logging of all AI interactions
- **RiskAssessment**: Risk level tracking
- **SessionReport**: Complete session export

### 2. Unit Conversions (`app/core/unit-conversions.ts`)

All inputs support multiple units and convert to standard units internally:
- **Height**: cm, m, ft-in → stored as cm
- **Weight**: kg, lb → stored as kg
- **Temperature**: °C, °F → stored as °C

Includes validation with hard bounds and soft warnings.

### 3. Role-Based Personalization (`app/core/roles.ts`)

Each crew role has:
- Key responsibilities
- Priority metrics (what they should monitor)
- Default thresholds (warning/critical levels)

### 4. Quiz Components

#### QuizProgress
- Shows "Question X of 11"
- Visual progress bar
- Percentage complete

#### MultiUnitInput
- Supports multiple unit systems
- Unit dropdown selector
- Examples and validation
- Error/warning messages

#### BloodPressureInput
- Systolic/diastolic inputs
- Tooltip explaining terms
- mmHg unit display
- Validation

#### RolePicker
- Searchable role list
- Role descriptions
- Key responsibilities display

### 5. HELIOS Console (`app/ui/helios/HeliosConsole.tsx`)

Professional chatbot interface with:
- **Disclaimer**: "Decision-support tool. Human operators retain authority."
- **Risk Levels**: Visual badges (low/medium/high/critical)
- **Confidence Scores**: Percentage display
- **Reasoning Summaries**: Transparent AI reasoning
- **Suggested Actions**: Actionable recommendations
- **Citations**: Knowledge base references
- **Accept/Ignore**: User can accept or ignore recommendations
- **Full Logging**: All interactions logged with metadata

### 6. Food/Nutrition (`app/ui/food/FoodList.tsx`)

- Searchable food list
- Category filtering
- Available/unavailable status
- Food selection tracking

### 7. Logging & Transparency

#### HELIOS Logger (`app/services/helios-logger.ts`)
- Logs all AI interactions
- Stores: timestamp, input context, model used, output, risk level, confidence
- Tracks user actions (accepted/ignored)

#### Session Reports (`app/services/session-report.ts`)
- Generates comprehensive session reports
- Exports as JSON or text
- Includes: user profile, risk flags, HELIOS logs, session duration

### 8. Updated Chat API (`app/api/chat/route.ts`)

Enhanced with:
- Context-aware responses (user role, shift mode, vitals)
- Structured JSON responses (risk level, reasoning, actions)
- Conservative defaults when uncertain
- Knowledge base citations
- Full transparency

## Integration Status

### ✅ Completed
- Core data models and utilities
- Unit conversion system
- Role definitions
- Quiz UI components (Progress, MultiUnitInput, BloodPressureInput, RolePicker)
- HELIOS Console component
- Food list component
- Logging services
- Session report generation
- Updated chat API route

### 🔄 Needs Integration
- **Main Dashboard Page**: Needs to be refactored to use new components
- **Quiz Flow**: Needs to integrate new quiz components with local storage persistence
- **Food/Nutrition Section**: Needs to be added to dashboard
- **Session Report Download**: Needs to be added to dashboard
- **Shift Mode Toggle**: Needs to be added to dashboard
- **Role-Based Dashboard Personalization**: Needs to be implemented

## Next Steps

### 1. Refactor Dashboard Page

The main dashboard (`app/dashboard/page.tsx`) needs to:
- Use new `UserProfile` model from `app/core/models.ts`
- Integrate new quiz components
- Add HELIOS Console component
- Add food/nutrition section
- Add session report download button
- Add shift mode selector
- Implement role-based personalization

### 2. Quiz Integration

Update quiz flow to:
- Use `MultiUnitInput` for height, weight, temperature
- Use `BloodPressureInput` for blood pressure
- Use `RolePicker` for role selection
- Save state to localStorage using `saveQuizState()`
- Load state from localStorage on mount
- Show progress with `QuizProgress` component

### 3. Dashboard Personalization

After quiz completion:
- Display role-specific metrics
- Show role-specific thresholds
- Customize alerts based on role
- Show role-specific tips and recommendations

### 4. Food/Nutrition Integration

Add to dashboard:
- Food list component
- Daily intake checklist
- Allergy/diet preference management
- Emergency ration mode toggle
- Role-based nutrition notes

## API Key Setup

1. Create `.env.local` in the project root:
```
OPENAI_API_KEY=your-api-key-here
```

2. **IMPORTANT**: Never commit `.env.local` to git (already in `.gitignore`)

3. The API key is:
   - Only read server-side (in API routes)
   - Never sent to frontend
   - Never logged
   - Only used for HELIOS AI responses

## Usage Examples

### Using MultiUnitInput

```tsx
import MultiUnitInput from '@/app/ui/quiz/MultiUnitInput'

<MultiUnitInput
  label="Height"
  value={heightValue}
  unit={heightUnit}
  unitOptions={[
    { value: 'cm', label: 'cm', example: '170 cm' },
    { value: 'm', label: 'm', example: '1.70 m' },
    { value: 'ft-in', label: 'ft/in', example: '5 ft 7 in' }
  ]}
  onChange={(value) => setHeightValue(value)}
  onUnitChange={(unit) => setHeightUnit(unit)}
  error={validationError}
  warning={validationWarning}
/>
```

### Using HELIOS Console

```tsx
import HeliosConsole from '@/app/ui/helios/HeliosConsole'

<HeliosConsole
  userRole="medical-officer"
  shiftMode="normal"
  vitals={userVitals}
  dietaryConstraints={dietaryRestrictions}
/>
```

### Saving User Profile

```tsx
import { saveUserProfile } from '@/app/store/local-storage'
import { UserProfile } from '@/app/core/models'

const profile: UserProfile = {
  // ... profile data
}

saveUserProfile(profile)
```

### Logging HELIOS Interaction

```tsx
import { logHeliosInteraction } from '@/app/services/helios-logger'

const logEntry = logHeliosInteraction({
  userMessage: "What's the O2 level?",
  userRole: "life-support-engineer",
  shiftMode: "normal",
  modelUsed: "gpt-4o-mini",
  outputSummary: "O2 is at 21.2%",
  reasoningSummary: "Based on current sensor readings",
  riskLevel: "low",
  suggestedActions: ["Continue monitoring"],
  confidence: 0.9
})
```

## Design Principles

1. **Safety-First**: All critical actions require human approval
2. **Transparency**: All AI decisions are logged and explainable
3. **Professional**: UI tone matches real spacecraft crew interfaces
4. **Operational**: Clear labels, units, and validation
5. **Role-Based**: Personalization based on crew role
6. **Conservative**: Default to safe recommendations when uncertain

## Notes

- All units are normalized internally (cm, kg, °C)
- User can choose preferred display units
- All AI interactions are logged for transparency
- HELIOS is decision-support only, never authoritative
- Session reports can be exported for documentation

## Testing

To test the new components:

1. Start the development server: `npm run dev`
2. Navigate to `/dashboard`
3. Complete the quiz with new components
4. Test HELIOS Console with various queries
5. Check localStorage for saved data
6. Test session report download

## Future Enhancements

- Real-time vitals monitoring
- Integration with FastAPI backend for live data
- Advanced role-based dashboard customization
- Multi-language support
- Accessibility improvements
- Mobile-responsive design
