/**
 * Example Research File
 * 
 * Copy this file and rename it for your research category.
 * Add your actual research findings here.
 */

export const EXAMPLE_RESEARCH = {
  // Example Study 1
  study1: {
    title: "Radiation Shielding Effectiveness in Space Habitats",
    author: "Dr. Jane Smith, Dr. John Doe",
    year: 2023,
    institution: "MIT Space Systems Laboratory",
    abstract: "This study examines the effectiveness of multi-layer radiation shielding in long-duration space habitats...",
    keyFindings: [
      "Regolith shielding of 3-5 meters provides 95%+ protection against solar particle events",
      "Water-filled compartments add 15% additional protection",
      "Magnetic field deflection reduces charged particle exposure by 40%"
    ],
    methodology: "Simulation-based analysis using Monte Carlo methods...",
    results: "Results showed that combined shielding approaches achieve <50 mSv/year exposure targets...",
    conclusions: "Multi-layer approach is essential for long-term habitation...",
    citation: "Smith, J., Doe, J. (2023). Radiation Shielding Effectiveness in Space Habitats. Journal of Space Engineering, 45(2), 123-145."
  },
  
  // Example Study 2
  study2: {
    title: "Closed-Loop Water Recovery Systems",
    author: "Dr. Alice Johnson",
    year: 2022,
    institution: "NASA Ames Research Center",
    abstract: "Analysis of water recovery efficiency in closed-loop life support systems...",
    keyFindings: [
      "Membrane bioreactors achieve 99.2% efficiency in microgravity",
      "Rotating filtration modules improve separation by 15%",
      "Energy cost: 0.8 kWh per 1000L processed"
    ],
    methodology: "Laboratory testing in simulated microgravity environment...",
    results: "Current systems achieve 93% efficiency, next-gen target 98%+...",
    conclusions: "Advanced membrane systems are critical for long-duration missions...",
    citation: "Johnson, A. (2022). Closed-Loop Water Recovery Systems. NASA Technical Report 2022-12345."
  }
}

/**
 * Usage in knowledge-base.ts:
 * 
 * import { EXAMPLE_RESEARCH } from './research/example-research'
 * 
 * export const HELIOS_KNOWLEDGE_BASE = {
 *   research: {
 *     example: EXAMPLE_RESEARCH
 *   }
 * }
 */
