# How to Add Information to HELIOS Knowledge Base

The HELIOS chatbot uses a comprehensive knowledge base when OpenAI API is not available. This guide shows you exactly how to add your own information.

## 📍 Location

**File:** `app/lib/knowledge-base.ts`

This file contains all the knowledge that HELIOS uses to answer questions.

---

## 🏗️ Structure

The knowledge base is organized into sections:

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
  growth: { ... },
  research: { ... }
}
```

---

## ✏️ How to Add Information

### Method 1: Add to Existing Section

1. Open `app/lib/knowledge-base.ts`
2. Find the section you want to update (e.g., `lifeSupport`)
3. Add or modify properties:

```typescript
lifeSupport: {
  atmosphere: `Your existing text...`,
  waterRecovery: `Your existing text...`,
  // ADD NEW PROPERTY HERE:
  newTopic: `Your new information here. You can write multiple paragraphs.
  
  Use backticks for multi-line strings.
  
  Include technical details, specifications, or any information you want.`
}
```

### Method 2: Add a New Section

1. Open `app/lib/knowledge-base.ts`
2. Add a new section to `HELIOS_KNOWLEDGE_BASE`:

```typescript
export const HELIOS_KNOWLEDGE_BASE = {
  // ... existing sections ...
  
  // ADD NEW SECTION:
  yourNewSection: {
    topic1: `Information about topic 1`,
    topic2: `Information about topic 2`,
    importantNote: `Any important notes or details`
  }
}
```

3. Update the `getKnowledgeContext` function to include your new section:

```typescript
export function getKnowledgeContext(query: string): string {
  const lowerQuery = query.toLowerCase()
  const sections: string[] = []
  
  // ... existing checks ...
  
  // ADD THIS:
  if (lowerQuery.includes('your-keyword') || lowerQuery.includes('related-term')) {
    sections.push(`YOUR NEW SECTION:\n${HELIOS_KNOWLEDGE_BASE.yourNewSection.topic1}\n\n${HELIOS_KNOWLEDGE_BASE.yourNewSection.topic2}`)
  }
  
  // ... rest of function ...
}
```

---

## 📝 Examples

### Example 1: Add Information About Food Production

```typescript
lifeSupport: {
  // ... existing properties ...
  
  foodProduction: `HELIOS manages food production through:
  
  - Vertical hydroponic farms: 500 m² growing area
  - Crop rotation: 3-month cycles for optimal yield
  - Protein sources: Algae (60%), insects (25%), lab-grown (15%)
  - Daily production: 2,500 kg fresh produce
  - Target: 100% self-sufficiency for 1,000 residents
  
  The system tracks nutrient levels, growth stages, and harvest schedules automatically.`
}
```

### Example 2: Add Emergency Procedures

```typescript
safety: {
  // ... existing properties ...
  
  evacuationProcedures: `Emergency evacuation protocols:
  
  1. Immediate Actions:
     - Sound station-wide alert
     - Activate emergency lighting
     - Seal affected sections
  
  2. Evacuation Routes:
     - Primary: Central corridor to emergency shelters
     - Secondary: Service tunnels (if primary blocked)
  
  3. Emergency Shelters:
     - Location: Sections 3, 7, and 12
     - Capacity: 200 people each
     - Supplies: 30-day survival kits
  
  4. Communication:
     - Use emergency channels (frequency 121.5 MHz)
     - Report status every 5 minutes
     - Follow HELIOS voice instructions`
}
```

### Example 3: Add New Research Section

```typescript
research: {
  // ... existing research ...
  
  yourResearch: `Your Research Title:
  
  Abstract: Brief summary of your research findings.
  
  Methodology: How the research was conducted.
  
  Results: Key findings and data.
  
  Conclusions: What this means for the settlement.
  
  References: Links or citations to papers.`
}
```

---

## 🔍 Making Information Searchable

After adding information, update the `getKnowledgeContext` function so HELIOS can find it:

```typescript
export function getKnowledgeContext(query: string): string {
  const lowerQuery = query.toLowerCase()
  const sections: string[] = []
  
  // Add keywords that should trigger your new content
  if (lowerQuery.includes('food') || lowerQuery.includes('agriculture') || lowerQuery.includes('crop')) {
    sections.push(`FOOD PRODUCTION:\n${HELIOS_KNOWLEDGE_BASE.lifeSupport.foodProduction}`)
  }
  
  if (lowerQuery.includes('evacuation') || lowerQuery.includes('emergency') || lowerQuery.includes('shelter')) {
    sections.push(`EVACUATION PROCEDURES:\n${HELIOS_KNOWLEDGE_BASE.safety.evacuationProcedures}`)
  }
  
  // ... rest of function ...
}
```

---

## 🎯 Best Practices

1. **Use Clear Section Names**: Make it easy to find later
   ```typescript
   // Good:
   lifeSupport: { waterRecovery: `...` }
   
   // Bad:
   ls: { wr: `...` }
   ```

2. **Use Multi-line Strings**: Use backticks for readability
   ```typescript
   // Good:
   topic: `First paragraph.
   
   Second paragraph with more details.
   
   Third paragraph.`
   ```

3. **Include Keywords**: Think about how users might ask questions
   - "food" → foodProduction
   - "emergency" → evacuationProcedures
   - "power" → energySystems

4. **Update Search Function**: Always update `getKnowledgeContext` when adding new content

5. **Be Specific**: Include numbers, specifications, and concrete details
   ```typescript
   // Good:
   capacity: `500 m² growing area, producing 2,500 kg daily`
   
   // Less useful:
   capacity: `Large growing area with good production`
   ```

---

## 🧪 Testing Your Changes

1. **Save the file** (`app/lib/knowledge-base.ts`)
2. **Restart the Next.js server** (the knowledge base is loaded at startup)
3. **Test in the chatbot**:
   - Ask a question related to your new content
   - Check if HELIOS finds and returns your information
   - Try different phrasings to test keyword matching

---

## 📚 Current Knowledge Base Sections

You can add to or modify any of these:

- `introduction` - Project overview
- `settlementOverview` - Mission and vision
- `orbitAndAsteroid` - Orbital mechanics and asteroid details
- `heliosAI` - AI system information
- `design` - Structural design and materials
- `lifeSupport` - Atmosphere, water, waste, agriculture, healthcare, power
- `safety` - Radiation, structural safety, emergency systems
- `population` - Demographics, education, healthcare
- `governance` - Government framework, economy
- `growth` - Expansion plans
- `research` - Research papers and studies

---

## 💡 Quick Reference

**File to edit:** `app/lib/knowledge-base.ts`

**Function to update:** `getKnowledgeContext(query: string)`

**After changes:** Restart Next.js server (`npm run dev`)

**Test location:** Dashboard → HELIOS Console

---

## 🚀 Example: Complete Addition

Here's a complete example of adding new information:

```typescript
// 1. Add to knowledge base object
export const HELIOS_KNOWLEDGE_BASE = {
  // ... existing sections ...
  
  maintenance: {
    schedule: `Maintenance schedules:
    
    Daily: Life support system checks
    Weekly: Structural integrity scans
    Monthly: Full system diagnostics
    Quarterly: Major component overhauls`,
    
    procedures: `Standard maintenance procedures:
    
    1. Safety check: Verify all systems in safe mode
    2. Inspection: Visual and sensor-based checks
    3. Repair: Follow technical manuals
    4. Testing: Verify functionality before reactivation
    5. Documentation: Log all work in HELIOS system`
  }
}

// 2. Update search function
export function getKnowledgeContext(query: string): string {
  const lowerQuery = query.toLowerCase()
  const sections: string[] = []
  
  // ... existing checks ...
  
  // Add your new check
  if (lowerQuery.includes('maintenance') || lowerQuery.includes('repair') || lowerQuery.includes('service')) {
    sections.push(`MAINTENANCE:\nSchedule: ${HELIOS_KNOWLEDGE_BASE.maintenance.schedule}\n\nProcedures: ${HELIOS_KNOWLEDGE_BASE.maintenance.procedures}`)
  }
  
  // ... rest of function ...
}
```

That's it! Your new information is now part of HELIOS's knowledge base.
