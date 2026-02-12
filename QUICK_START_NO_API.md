# Quick Start: Using HELIOS Without API Key

✅ **API key has been disabled** - HELIOS will now use the built-in knowledge base.

## How It Works

The chatbot uses a comprehensive knowledge base stored in:
- **File:** `app/lib/knowledge-base.ts`

When you ask a question, HELIOS:
1. Searches the knowledge base for relevant information
2. Matches keywords in your question
3. Returns detailed responses from the knowledge base

## Adding Your Own Information

**See the full guide:** `HOW_TO_ADD_KNOWLEDGE.md`

### Quick Steps:

1. **Open the knowledge base file:**
   ```
   app/lib/knowledge-base.ts
   ```

2. **Add to an existing section or create a new one:**
   ```typescript
   lifeSupport: {
     // ... existing content ...
     yourNewTopic: `Your information here.`
   }
   ```

3. **Update the search function** (so HELIOS can find it):
   ```typescript
   if (lowerQuery.includes('your-keyword')) {
     sections.push(`YOUR TOPIC:\n${HELIOS_KNOWLEDGE_BASE.lifeSupport.yourNewTopic}`)
   }
   ```

4. **Restart the server:**
   ```bash
   npm run dev
   ```

5. **Test it** in the HELIOS Console on the dashboard

## Example: Adding Food Production Info

```typescript
// In app/lib/knowledge-base.ts

lifeSupport: {
  // ... existing properties ...
  
  foodProduction: `Daily food production:
  - Fresh vegetables: 500 kg
  - Protein sources: 200 kg
  - Grains: 300 kg
  Total: 1,000 kg per day for 1,000 residents.`
}
```

Then update the search function:

```typescript
if (lowerQuery.includes('food') || lowerQuery.includes('production')) {
  sections.push(`FOOD PRODUCTION:\n${HELIOS_KNOWLEDGE_BASE.lifeSupport.foodProduction}`)
}
```

## Current Knowledge Base Sections

You can add to or modify:
- `introduction` - Project overview
- `settlementOverview` - Mission and vision  
- `orbitAndAsteroid` - Orbital mechanics
- `heliosAI` - AI system info
- `design` - Structural design
- `lifeSupport` - Atmosphere, water, waste, agriculture, healthcare, power
- `safety` - Radiation, structural safety, emergency
- `population` - Demographics, education
- `governance` - Government, economy
- `growth` - Expansion plans
- `research` - Research papers

## Testing

1. Ask questions in the HELIOS Console
2. Try different phrasings to test keyword matching
3. Check if your new information appears in responses

## Re-enabling OpenAI (Later)

If you want to use OpenAI again:
1. Edit `.env.local`
2. Add: `OPENAI_API_KEY=sk-your-key-here`
3. Restart the server

For now, the knowledge base system is active and ready to use!
