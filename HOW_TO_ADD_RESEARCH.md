# How to Add Your Research to the App

## Quick Answer: 3 Ways to Add Research

### Option 1: Add to Knowledge Base (Easiest) ✅
Edit `app/lib/knowledge-base.ts` and add your research content directly.

### Option 2: Create Research Files (Organized)
Create research files in `app/lib/research/` and import them.

### Option 3: Use OpenAI with Documents (Advanced)
Upload your research PDFs to OpenAI and reference them in prompts.

---

## Option 1: Direct Edit (Recommended for Start)

### Step 1: Open the Knowledge Base File
```
app/lib/knowledge-base.ts
```

### Step 2: Add Your Research

Find the relevant section and add your research. For example:

```typescript
export const HELIOS_KNOWLEDGE_BASE = {
  // ... existing content ...
  
  // ADD YOUR RESEARCH HERE:
  research: {
    study1: `Your research findings from Study 1...`,
    study2: `Your research findings from Study 2...`,
    universityReport: `Findings from university report on space habitats...`,
  },
  
  // Or add to existing sections:
  lifeSupport: {
    atmosphere: `...existing text...`,
    // ADD YOUR RESEARCH:
    researchFindings: `According to [Your Study Name], atmospheric control systems...`,
  }
}
```

### Step 3: Update the Search Function

In the same file, update `getKnowledgeContext()` to include your research:

```typescript
export function getKnowledgeContext(query: string): string {
  // ... existing code ...
  
  // Add research queries
  if (lowerQuery.includes('research') || lowerQuery.includes('study') || lowerQuery.includes('paper')) {
    sections.push(`RESEARCH FINDINGS:\n${HELIOS_KNOWLEDGE_BASE.research.study1}\n\n${HELIOS_KNOWLEDGE_BASE.research.study2}`)
  }
  
  // ... rest of code ...
}
```

---

## Option 2: Organized Research Files (Better for Many Papers)

### Step 1: Create Research Directory
```
app/lib/research/
```

### Step 2: Create Research Files

Create files like:
- `app/lib/research/radiation-studies.ts`
- `app/lib/research/life-support-research.ts`
- `app/lib/research/asteroid-mining.ts`

Example file structure:
```typescript
// app/lib/research/radiation-studies.ts
export const RADIATION_RESEARCH = {
  study1: {
    title: "Radiation Shielding in Space Habitats",
    author: "Dr. Smith et al.",
    year: 2023,
    findings: `Detailed findings from the study...`,
    keyPoints: [
      "Point 1",
      "Point 2",
      "Point 3"
    ],
    citations: "Smith, J. et al. (2023). Journal of Space Engineering..."
  },
  study2: {
    // ... another study
  }
}
```

### Step 3: Import in Knowledge Base

```typescript
// app/lib/knowledge-base.ts
import { RADIATION_RESEARCH } from './research/radiation-studies'
import { LIFE_SUPPORT_RESEARCH } from './research/life-support-research'

export const HELIOS_KNOWLEDGE_BASE = {
  // ... existing ...
  research: {
    radiation: RADIATION_RESEARCH,
    lifeSupport: LIFE_SUPPORT_RESEARCH,
  }
}
```

---

## Option 3: OpenAI with Document Upload (Advanced)

If you have PDFs or documents:

### Step 1: Upload to OpenAI (if using OpenAI API)
- Use OpenAI's file upload API
- Or use a vector database like Pinecone

### Step 2: Update Chat Route

Modify `app/api/chat/route.ts` to include document references:

```typescript
const SYSTEM_PROMPT = `...existing prompt...

Your knowledge also includes research from:
- [Your Research Paper 1]
- [Your Research Paper 2]
- University studies on space settlement design

When answering, reference specific research findings when relevant.`
```

---

## Example: Adding a Research Paper

Let's say you have a paper on "Water Recovery in Space Habitats":

### Method 1: Add to Existing Section

```typescript
// In app/lib/knowledge-base.ts
lifeSupport: {
  waterRecovery: `Water recovery achieves 98%+ efficiency through: urine processing (vapor compression distillation), graywater filtration (membrane bioreactors), atmospheric humidity capture (condensation systems), and wastewater treatment. Primary storage in redundant tanks with 90-day reserves.

RESEARCH FINDINGS: According to the 2023 MIT study on closed-loop water systems, advanced membrane bioreactors can achieve 99.2% efficiency in microgravity environments. The study found that rotating the filtration modules at 2 RPM improves particle separation by 15% compared to static systems.`
}
```

### Method 2: Create New Research Section

```typescript
// In app/lib/knowledge-base.ts
research: {
  waterRecovery: {
    mit2023: `MIT 2023 Study: "Closed-Loop Water Systems in Space"
    - Efficiency: 99.2% achievable with rotating membrane bioreactors
    - Optimal rotation: 2 RPM improves separation by 15%
    - Energy cost: 0.8 kWh per 1000L processed
    - Citation: MIT Space Systems Lab, 2023`,
    
    nasa2022: `NASA 2022 Report: "Water Recycling in Long-Duration Missions"
    - Current ISS systems: 93% efficiency
    - Next-gen systems target: 98%+
    - Key challenge: Microbial contamination control
    - Citation: NASA Technical Report 2022-12345`
  }
}
```

Then update the search:
```typescript
if (lowerQuery.includes('water') || lowerQuery.includes('recovery')) {
  sections.push(`LIFE SUPPORT - Water: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.waterRecovery}`)
  sections.push(`RESEARCH:\n${HELIOS_KNOWLEDGE_BASE.research.waterRecovery.mit2023}\n\n${HELIOS_KNOWLEDGE_BASE.research.waterRecovery.nasa2022}`)
}
```

---

## Where to Put Different Types of Research

| Research Type | Where to Add |
|--------------|--------------|
| **Radiation studies** | `safety.radiation` or `research.radiation` |
| **Life support research** | `lifeSupport` sections or `research.lifeSupport` |
| **Structural engineering** | `design` sections or `research.structural` |
| **Asteroid mining** | `orbitAndAsteroid` or `research.asteroids` |
| **Population studies** | `population` sections or `research.population` |
| **Economic models** | `governance.economic` or `research.economics` |

---

## Tips for Adding Research

1. **Keep it organized**: Group related research together
2. **Include citations**: Add author, year, source
3. **Use specific numbers**: Include actual findings, percentages, measurements
4. **Link to sections**: Reference which part of your table of contents it relates to
5. **Update search keywords**: Make sure `getKnowledgeContext()` can find it

---

## Testing Your Research

After adding research:

1. Start the app: `npm run dev`
2. Ask questions related to your research
3. Check if the chatbot references your research
4. If not found, add more keywords to `getKnowledgeContext()`

Example questions to test:
- "What does the research say about [your topic]?"
- "Tell me about studies on [your topic]"
- "What are the findings on [your topic]?"

---

## Need Help?

If you have:
- **PDF files**: I can help you extract text and add it
- **Multiple papers**: I can help organize them into the structure
- **Specific topics**: Tell me what research you have and I'll show exactly where to add it

Just tell me what research you have and I'll help you add it! 📚
