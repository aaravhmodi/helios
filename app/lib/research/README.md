# Research Directory

Add your research papers, studies, and reports here.

## File Structure

Create TypeScript files for each research category:

- `radiation-studies.ts` - Radiation protection research
- `life-support-research.ts` - Life support system studies
- `structural-engineering.ts` - Structural design research
- `asteroid-mining.ts` - Asteroid utilization studies
- `population-studies.ts` - Demographics and social research
- `economic-models.ts` - Economic and governance research

## Example File Format

```typescript
export const RADIATION_RESEARCH = {
  study1: {
    title: "Study Title",
    author: "Author Name",
    year: 2023,
    institution: "University/Organization",
    abstract: "Brief summary...",
    keyFindings: [
      "Finding 1",
      "Finding 2",
      "Finding 3"
    ],
    methodology: "How the study was conducted...",
    results: "Detailed results...",
    conclusions: "Conclusions and recommendations...",
    citation: "Full citation format"
  }
}
```

## How to Use

1. Create a file in this directory
2. Export your research as a TypeScript object
3. Import it in `app/lib/knowledge-base.ts`
4. Add it to the knowledge base structure
5. Update `getKnowledgeContext()` to search for it

See `HOW_TO_ADD_RESEARCH.md` for detailed instructions.
