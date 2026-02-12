# Simple Guide: Adding Information to HELIOS

Follow these exact steps to add your own information.

## Step 1: Open the File

Open this file in your editor:
```
app/lib/knowledge-base.ts
```

## Step 2: Find a Section

Scroll down and find a section like `lifeSupport`. You'll see something like:

```typescript
lifeSupport: {
  atmosphere: `...`,
  waterRecovery: `...`,
  wasteRecycling: `...`,
  agriculture: `...`,
  // ... more stuff
}
```

## Step 3: Add Your Information

Add a new line inside that section. For example, if you want to add food production info:

```typescript
lifeSupport: {
  atmosphere: `...`,
  waterRecovery: `...`,
  wasteRecycling: `...`,
  agriculture: `...`,
  
  // ADD THIS NEW LINE:
  foodProduction: `Daily food production is 1,000 kg per day. We grow vegetables, fruits, and protein sources in vertical farms.`
}
```

**Important:** 
- Use backticks `` ` `` (not regular quotes)
- Add a comma after the last item
- Write your information between the backticks

## Step 4: Make It Searchable

Scroll down further in the same file until you find a function called `getKnowledgeContext`. Look for lines like:

```typescript
if (lowerQuery.includes('food') || lowerQuery.includes('agriculture') || lowerQuery.includes('crop')) {
  sections.push(`LIFE SUPPORT - Agriculture: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.agriculture}`)
}
```

Add a new line right after it:

```typescript
if (lowerQuery.includes('food') || lowerQuery.includes('agriculture') || lowerQuery.includes('crop')) {
  sections.push(`LIFE SUPPORT - Agriculture: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.agriculture}`)
}

// ADD THIS NEW LINE:
if (lowerQuery.includes('food production') || lowerQuery.includes('daily production')) {
  sections.push(`FOOD PRODUCTION:\n${HELIOS_KNOWLEDGE_BASE.lifeSupport.foodProduction}`)
}
```

## Step 5: Save and Restart

1. Save the file (Ctrl+S)
2. Restart your server:
   - Stop it (Ctrl+C in terminal)
   - Run `npm run dev` again

## Step 6: Test It

Go to the dashboard and ask HELIOS:
- "Tell me about food production"
- "What is daily production?"

It should show your new information!

---

## Complete Example (Copy & Paste)

Here's exactly what to add:

### In the `lifeSupport` section (around line 38):

```typescript
lifeSupport: {
  atmosphere: `Atmospheric management maintains: 21% oxygen, 78% nitrogen, 0.04% CO2, with trace gases. Primary systems include: Sabatier reactors (CO2 to O2 conversion), nitrogen extraction from regolith, atmospheric scrubbing filters, and pressure regulation systems. Target: 14.7 psi, 20°C average temperature, 50% relative humidity.`,
  waterRecovery: `Water recovery achieves 98%+ efficiency through: urine processing (vapor compression distillation), graywater filtration (membrane bioreactors), atmospheric humidity capture (condensation systems), and wastewater treatment. Primary storage in redundant tanks with 90-day reserves.`,
  
  // ADD THIS:
  foodProduction: `Daily food production: 1,000 kg per day. We have vertical hydroponic farms growing vegetables, fruits, and grains. Protein comes from algae and insects.`,
  
  wasteRecycling: `Complete closed-loop waste processing: organic waste composting for agriculture, plastic recycling via pyrolysis, metal reclamation, and medical waste sterilization. Target: 95% waste reduction through recycling, with minimal material export.`,
  // ... rest of the section
}
```

### In the `getKnowledgeContext` function (around line 189):

```typescript
if (lowerQuery.includes('food') || lowerQuery.includes('agriculture') || lowerQuery.includes('farm') || lowerQuery.includes('grow')) {
  sections.push(`LIFE SUPPORT - Agriculture: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.agriculture}`)
}

// ADD THIS:
if (lowerQuery.includes('food production') || lowerQuery.includes('daily production') || lowerQuery.includes('food output')) {
  sections.push(`FOOD PRODUCTION:\n${HELIOS_KNOWLEDGE_BASE.lifeSupport.foodProduction}`)
}

if (lowerQuery.includes('healthcare') || lowerQuery.includes('medical') || lowerQuery.includes('health')) {
  sections.push(`LIFE SUPPORT - Healthcare: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.healthcare}`)
}
```

That's it! Just copy, paste, save, and restart!
