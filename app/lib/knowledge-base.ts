export const HELIOS_KNOWLEDGE_BASE = {
  introduction: {
    executiveSummary: `HELIOS represents a comprehensive asteroid-anchored space settlement designed for long-term human habitation. The settlement utilizes a captured near-Earth asteroid as both structural foundation and resource reservoir, featuring rotating habitats for artificial gravity, advanced life support systems, and the HELIOS AI management system for autonomous operations.`,
    scope: `The project encompasses complete settlement design including orbital mechanics, structural engineering, life support, radiation protection, population management, governance frameworks, and economic models. The scope includes initial deployment of 500-1000 settlers with expansion plans to support 10,000+ inhabitants.`
  },
  
  settlementOverview: {
    missionStatement: `To establish a sustainable, self-sufficient space settlement that serves as a model for future space colonization, advancing human presence beyond Earth while demonstrating viable long-term habitation in deep space environments.`,
    vision: `A thriving multi-generational space settlement that operates independently, conducts advanced research, facilitates commercial activities, and serves as a gateway for deeper space exploration. The settlement will eventually support 10,000+ residents with full economic and social infrastructure.`
  },
  
  orbitAndAsteroid: {
    orbitalCharacteristics: `The settlement operates in a stable Near-Earth Asteroid (NEA) orbit, positioned to optimize solar energy collection, Earth communication windows, and resource accessibility. The orbit is selected for minimal delta-V requirements for resupply missions and strategic positioning for future expansion.`,
    asteroidSelection: `Asteroids are selected based on size (1-3 km diameter), composition (C-type or M-type with high metal content), stable orbit characteristics, water-ice presence, and structural integrity. Primary candidates include carbonaceous chondrites rich in volatiles and metallic asteroids with construction materials.`,
    advantages: `Asteroid-anchored configuration provides: immediate access to raw materials (metals, water, regolith), reduced construction mass from Earth, natural radiation shielding capabilities, stable anchoring point for rotating habitats, and ISRU (In-Situ Resource Utilization) opportunities for manufacturing.`
  },
  
  heliosAI: {
    purpose: `HELIOS serves as the central AI management system coordinating all settlement operations including life support monitoring, energy distribution, emergency response protocols, resource allocation, and system diagnostics.`,
    architecture: `The system operates on distributed computing architecture with redundant nodes throughout the settlement. Core functions include: real-time sensor monitoring, predictive maintenance, resource optimization algorithms, emergency response automation, and human-interface protocols.`,
    lifeSupport: `HELIOS continuously monitors atmospheric composition (O2, CO2, N2 levels), water recycling efficiency, waste processing systems, and agricultural output. Automated adjustments maintain optimal conditions with human oversight for critical decisions.`,
    emergency: `Emergency protocols include: rapid depressurization response, fire suppression, radiation event protocols, medical emergency coordination, and evacuation procedures. All systems maintain 30-day autonomous operation capability.`,
    knowledgeModel: `HELIOS maintains a continuously updated, high-fidelity internal model of Kepler Station and its interaction with asteroid Bennu. This model encompasses physical systems, biological processes, energy flows, structural dynamics, environmental hazards, and human-driven demand patterns. HELIOS does not merely monitor values in isolation; it understands how changes in one domain propagate through the entire settlement.`,
    knowledgeDomains: `HELIOS maintains awareness across multiple domains: Physical & Environmental (atmospheric state, radiation environment), Structural & Mechanical (rotating habitat dynamics, Bennu interface), Energy & Power Systems (generation, storage, consumption), Life Support & Biological Systems (water, agriculture), Waste & Closed-Loop Material Systems, Population & Human Activity (aggregate models only), Emergency & Failure Knowledge, Expansion & Scalability, and Ethical Constraints.`,
    ethicalConstraints: `HELIOS is explicitly forbidden from: making governance decisions, enforcing laws or discipline, controlling reproduction or population size, manipulating behavior, or making value judgments. HELIOS does not know political preferences, cultural norms, or personal identities. Its knowledge domain ends where human autonomy begins.`,
    explainability: `Every HELIOS output includes: data sources used, reasoning steps, confidence estimates, and alternative options considered. All actions are logged permanently for human review.`
  },
  
  design: {
    structural: `The settlement consists of modular cylindrical and toroidal sections connected via pressurized corridors. Primary structure utilizes asteroid-derived materials supplemented with Earth-manufactured critical components. Core sections include: residential habitats, agricultural modules, industrial facilities, command center, and recreation areas.`,
    materials: `Base construction materials derived from asteroid include: iron-nickel alloys (structural framework), carbon composites (pressure vessels), regolith concrete (shielding), and extracted silicon (electronics). Earth-supplied materials limited to complex electronics, specialty alloys, and initial life support components.`,
    shielding: `Multi-layer radiation shielding: 3-5 meters regolith covering on outer surfaces, water-filled compartments providing secondary shielding, magnetic field generators for charged particle deflection, and solar storm shelters with enhanced protection. Total shielding equivalent to 1.5 meters water or 0.5 meters lead.`,
    asteroidAnchor: `The settlement is structurally anchored to the captured asteroid using reinforced connection points. The asteroid provides: mass foundation for rotation stability, mining access points, and additional shielding. Anchoring systems include expansion bolts, regolith stabilization, and structural reinforcement.`,
    rotation: `The habitat rotates at 1.9 RPM to generate 0.38g artificial gravity (Mars-like), sufficient for long-term health maintenance. Rotation radius of 225 meters. Adjustable rotation rates accommodate different gravity needs for various activities.`,
    deployment: `Human deployment occurs in phases: Phase 1 - Automated systems activation and verification (6 months), Phase 2 - Initial crew of 50 specialists (establish operations), Phase 3 - Expansion to 500 residents (18 months), Phase 4 - Full capacity of 1000+ residents with infrastructure for growth to 10,000.`
  },
  
  lifeSupport: {
    atmosphere: `Atmospheric management maintains: 21% oxygen, 78% nitrogen, 0.04% CO2, with trace gases. Primary systems include: Sabatier reactors (CO2 to O2 conversion), nitrogen extraction from regolith, atmospheric scrubbing filters, and pressure regulation systems. Target: 14.7 psi, 20°C average temperature, 50% relative humidity.`,
    waterRecovery: `Water recovery achieves 98%+ efficiency through: urine processing (vapor compression distillation), graywater filtration (membrane bioreactors), atmospheric humidity capture (condensation systems), and wastewater treatment. Primary storage in redundant tanks with 90-day reserves.`,
    wasteRecycling: `Complete closed-loop waste processing: organic waste composting for agriculture, plastic recycling via pyrolysis, metal reclamation, and medical waste sterilization. Target: 95% waste reduction through recycling, with minimal material export.`,
    agriculture: `Agricultural systems include: vertical hydroponic farms (LED spectrum-optimized), aeroponic growing systems, aquaculture facilities, and laboratory-grown protein production. Primary crops: leafy greens, root vegetables, grains, and protein sources. Target: 100% food production for 1000 residents with 20% surplus capacity.`,
    healthcare: `Medical facilities include: surgical suites, diagnostic imaging, pharmacy, rehabilitation center, and psychological support services. Telemedicine connections to Earth specialists, autonomous diagnostic AI, and comprehensive health monitoring systems. Population health tracking via wearable sensors and regular medical evaluations.`,
    solarPower: `Solar power generation utilizes high-efficiency photovoltaic arrays (40%+ efficiency) covering 2,500 m², generating 1 MW continuous power. Arrays track sun position automatically and include backup deployment systems.`,
    energyStorage: `Energy storage systems: lithium-ion battery banks (500 kWh capacity), flywheel storage for short-term fluctuations, and hydrogen fuel cells for extended backup (7-day autonomy). Redundant distribution networks ensure critical systems always have power.`
  },
  
  safety: {
    radiation: `Radiation protection strategies: multi-layer regolith shielding (primary), water-filled compartments (secondary), magnetic field deflection (charged particles), solar storm shelters (thick shielding), and radiation monitoring networks throughout settlement. Target exposure: <50 mSv/year for residents.`,
    structural: `Structural safety includes: redundant pressure vessels, compartmentalized sections (prevent cascade failures), emergency bulkheads, fire suppression systems (foam, water mist, inert gas), and structural health monitoring via HELIOS AI. Regular inspections and predictive maintenance prevent failures.`,
    emergency: `Emergency systems: evacuation protocols for each section, emergency supplies (30-day survival), redundant communication systems, medical emergency response teams, fire crews, and automated safety shutdown procedures. Emergency drills conducted monthly.`
  },
  
  population: {
    structure: `Initial population: 500-1000 residents with target growth to 10,000+. Demographics: 40% engineers/technicians, 25% scientists/researchers, 20% support staff, 10% medical/education, 5% administration/governance. Age distribution optimized for long-term sustainability with family units.`,
    education: `Education system: primary/secondary schools, technical training programs, university partnerships for higher education, adult continuing education, and research collaboration programs. Emphasis on STEM fields, space sciences, and settlement-specific skills.`,
    healthcare: `Comprehensive healthcare with: preventive medicine programs, routine health screenings, mental health services, reproductive health services, and emergency medical response. Integration with Earth medical institutions for complex cases via telemedicine.`
  },
  
  governance: {
    framework: `Governance structure: Representative council elected by residents (30 members), executive committee for day-to-day operations, specialized committees (safety, resource allocation, expansion planning), and direct democracy for major decisions. Charter establishes rights, responsibilities, and dispute resolution mechanisms.`,
    economic: `Economic model: Mixed economy with public infrastructure and private enterprise. Primary sectors: research and development, manufacturing, agriculture, services, and trade with Earth. Currency system linked to Earth economics initially, transitioning toward independent resource-based economy. Barter and credit systems for internal transactions.`
  },
  
  growth: {
    expansion: `Expansion phases: Phase 1 (0-2 years): Initial deployment and operational establishment. Phase 2 (2-5 years): Population growth to 2000, infrastructure expansion, industrial development. Phase 3 (5-10 years): Population 5000, additional modules, specialized facilities. Phase 4 (10+ years): Population 10,000+, self-sustaining economy, multiple settlements. Each phase includes specific infrastructure additions and resource requirements.`
  },
  
  // Research section - Add your research papers and studies here
  research: {
    heliosKnowledgeModel: `HELIOS Knowledge Model Documentation:

HELIOS maintains a continuously updated, high-fidelity internal model of Kepler Station and its interaction with asteroid Bennu. This model encompasses physical systems, biological processes, energy flows, structural dynamics, environmental hazards, and human-driven demand patterns. HELIOS does not merely monitor values in isolation; it understands how changes in one domain propagate through the entire settlement.

A. Physical & Environmental Knowledge:
- Atmospheric State: Tracks O2 (%), CO2 (ppm), N2 balance, pressure (kPa), temperature gradients, humidity. Understands human respiratory demand, acceptable physiological bounds, time-to-harm thresholds, and how atmospheric changes affect plant growth, fire risk, and material degradation. Predicts atmospheric drift and recommends corrective action.

- Radiation Environment: Tracks background galactic cosmic radiation, solar particle event flux, shielding effectiveness by location, cumulative dose exposure per zone. Knows Bennu's contribution to passive shielding, shielding distribution in habitat walls, safe exposure limits. Can predict radiation storms and recommend movement to storm shelters, load-shedding, and operational mode changes.

B. Structural & Mechanical Knowledge:
- Rotating Habitat Dynamics: Tracks rotation rate (rpm), angular momentum, bearing loads, vibration spectra, Coriolis-induced stress patterns. Understands mass redistribution effects, acceptable deviation before human discomfort, long-term fatigue accumulation. Predicts maintenance needs and flags instability.

- Bennu Interface & Anchoring: Tracks anchor point loads, regolith movement, truss strain, thermal expansion, material transfer rates. Understands Bennu as a rubble-pile asteroid with low cohesion, variable-gravity, non-uniform mass. Ensures no mechanical disturbances propagate into rotating habitat.

C. Energy & Power Systems Knowledge:
- Generation: Solar array output (real-time + forecast), shadowing effects, degradation rates
- Storage: Battery state-of-charge, fuel cell reserves, charge/discharge efficiency
- Consumption: Life support baseline, agricultural lighting, industrial operations, habitat heating/cooling
- HELIOS understands which systems are life-critical, which loads are deferrable, and how energy scarcity propagates. Schedules energy use proactively.

D. Life Support & Biological Systems Knowledge:
- Water Systems: Tracks water reserves (potable, industrial, shielding), recycling efficiency (%), contamination risk, emergency reserves. Understands water's dual role as shielding and life support, how shortages cascade into oxygen and food production.

- Agriculture & Food Systems: Tracks crop species distribution, growth stage, yield forecasts, nutrient cycles, lighting exposure, pollination. Understands nutritional requirements, crop redundancy, how plant health affects oxygen balance. Predicts food shortages months in advance.

E. Waste & Closed-Loop Material Systems:
Models organic waste streams, inorganic recycling flows, fertilizer production, biogas yield. Understands material conservation constraints, how inefficiencies accumulate, storage vs processing tradeoffs. Nothing is treated as "waste" — only delayed resources.

F. Population & Human Activity Knowledge:
Tracks population size, age distribution, activity cycles (sleep/work/recreation), healthcare system load, consumption rates. Understands how population behavior affects oxygen, food, and power demand. Does NOT profile individuals, monitor personal behavior, or make social decisions.

G. Emergency & Failure Knowledge:
Contains predefined models for: hull breaches, fire propagation, radiation storms, power collapse, agricultural failure, structural fatigue. For each scenario, knows detection signatures, time-to-critical thresholds, containment strategies, human response protocols. Can simulate outcomes and present ranked response paths.

H. Expansion & Scalability Knowledge:
Scales computationally per habitat ring, maintains independent yet coordinated control zones, prevents resource contention. Understands when expansion exceeds safe margins and when new construction threatens stability. Can recommend when not to expand.

I. Ethical Constraints & Forbidden Knowledge:
HELIOS is explicitly forbidden from: making governance decisions, enforcing laws or discipline, controlling reproduction or population size, manipulating behavior, making value judgments. HELIOS does not know political preferences, cultural norms, or personal identities. Its knowledge domain ends where human autonomy begins.

J. Explainability & Auditability:
Every HELIOS output includes: data sources used, reasoning steps, confidence estimates, alternative options considered. All actions are logged permanently for human review.`
  }
}

export function getKnowledgeContext(query: string): string {
  const lowerQuery = query.toLowerCase()
  const sections: string[] = []
  
  // Introduction queries
  if (lowerQuery.includes('introduction') || lowerQuery.includes('summary') || lowerQuery.includes('executive') || lowerQuery.includes('scope')) {
    sections.push(`INTRODUCTION:\n${HELIOS_KNOWLEDGE_BASE.introduction.executiveSummary}\n\nSCOPE: ${HELIOS_KNOWLEDGE_BASE.introduction.scope}`)
  }
  
  // Settlement overview
  if (lowerQuery.includes('mission') || lowerQuery.includes('vision') || lowerQuery.includes('purpose') || lowerQuery.includes('objective')) {
    sections.push(`MISSION: ${HELIOS_KNOWLEDGE_BASE.settlementOverview.missionStatement}\n\nVISION: ${HELIOS_KNOWLEDGE_BASE.settlementOverview.vision}`)
  }
  
  // Orbit and asteroid
  if (lowerQuery.includes('orbit') || lowerQuery.includes('asteroid') || lowerQuery.includes('location') || lowerQuery.includes('position')) {
    sections.push(`ORBITAL LOCATION:\n${HELIOS_KNOWLEDGE_BASE.orbitAndAsteroid.orbitalCharacteristics}\n\nASTEROID SELECTION: ${HELIOS_KNOWLEDGE_BASE.orbitAndAsteroid.asteroidSelection}\n\nADVANTAGES: ${HELIOS_KNOWLEDGE_BASE.orbitAndAsteroid.advantages}`)
  }
  
  // HELIOS AI
  if (lowerQuery.includes('helios') || lowerQuery.includes('ai') || lowerQuery.includes('system') || lowerQuery.includes('automation')) {
    sections.push(`HELIOS AI SYSTEM:\nPurpose: ${HELIOS_KNOWLEDGE_BASE.heliosAI.purpose}\n\nArchitecture: ${HELIOS_KNOWLEDGE_BASE.heliosAI.architecture}\n\nLife Support Management: ${HELIOS_KNOWLEDGE_BASE.heliosAI.lifeSupport}\n\nEmergency Response: ${HELIOS_KNOWLEDGE_BASE.heliosAI.emergency}\n\nKnowledge Model: ${HELIOS_KNOWLEDGE_BASE.heliosAI.knowledgeModel}\n\nKnowledge Domains: ${HELIOS_KNOWLEDGE_BASE.heliosAI.knowledgeDomains}\n\nEthical Constraints: ${HELIOS_KNOWLEDGE_BASE.heliosAI.ethicalConstraints}\n\nExplainability: ${HELIOS_KNOWLEDGE_BASE.heliosAI.explainability}`)
  }
  
  // HELIOS Knowledge Model queries
  if (lowerQuery.includes('knowledge model') || lowerQuery.includes('internal model') || lowerQuery.includes('digital twin') || lowerQuery.includes('kepler station')) {
    sections.push(`HELIOS KNOWLEDGE MODEL:\n${HELIOS_KNOWLEDGE_BASE.research.heliosKnowledgeModel}`)
  }
  
  // Specific domain queries
  if (lowerQuery.includes('atmospheric state') || lowerQuery.includes('atmosphere tracking')) {
    sections.push(`HELIOS tracks atmospheric state including O2 (%), CO2 (ppm), N2 balance, pressure (kPa), temperature gradients, and humidity. It understands human respiratory demand, acceptable physiological bounds, time-to-harm thresholds, and how atmospheric changes affect plant growth, fire risk, and material degradation.`)
  }
  
  if (lowerQuery.includes('radiation environment') || lowerQuery.includes('radiation tracking')) {
    sections.push(`HELIOS tracks background galactic cosmic radiation, solar particle event flux, shielding effectiveness by location, and cumulative dose exposure per zone. It knows Bennu's contribution to passive shielding and can predict radiation storms using heliophysical data.`)
  }
  
  if (lowerQuery.includes('rotating habitat') || lowerQuery.includes('rotation dynamics')) {
    sections.push(`HELIOS tracks rotation rate (rpm), angular momentum, bearing loads, vibration spectra, and Coriolis-induced stress patterns. It understands how mass redistribution affects stability and predicts maintenance needs.`)
  }
  
  if (lowerQuery.includes('energy balance') || lowerQuery.includes('power systems') || lowerQuery.includes('energy model')) {
    sections.push(`HELIOS maintains a settlement-wide energy balance model tracking solar array output, battery state-of-charge, fuel cell reserves, and consumption across life support, agriculture, industrial operations, and habitat systems. It schedules energy use proactively.`)
  }
  
  if (lowerQuery.includes('closed loop') || lowerQuery.includes('waste systems') || lowerQuery.includes('material recycling')) {
    sections.push(`HELIOS models organic waste streams, inorganic recycling flows, fertilizer production, and biogas yield. It understands material conservation constraints and that nothing is treated as "waste" — only delayed resources.`)
  }
  
  if (lowerQuery.includes('ethical') || lowerQuery.includes('forbidden') || lowerQuery.includes('constraints')) {
    sections.push(`HELIOS Ethical Constraints: HELIOS is explicitly forbidden from making governance decisions, enforcing laws, controlling reproduction or population size, manipulating behavior, or making value judgments. It does not know political preferences, cultural norms, or personal identities. Its knowledge domain ends where human autonomy begins.`)
  }
  
  if (lowerQuery.includes('explainability') || lowerQuery.includes('auditability') || lowerQuery.includes('reasoning')) {
    sections.push(`HELIOS Explainability: Every HELIOS output includes data sources used, reasoning steps, confidence estimates, and alternative options considered. All actions are logged permanently for human review.`)
  }
  
  // Design
  if (lowerQuery.includes('design') || lowerQuery.includes('structure') || lowerQuery.includes('construction') || lowerQuery.includes('materials')) {
    sections.push(`SETTLEMENT DESIGN:\nStructural Overview: ${HELIOS_KNOWLEDGE_BASE.design.structural}\n\nMaterials: ${HELIOS_KNOWLEDGE_BASE.design.materials}\n\nRadiation Shielding: ${HELIOS_KNOWLEDGE_BASE.design.shielding}\n\nAsteroid Anchoring: ${HELIOS_KNOWLEDGE_BASE.design.asteroidAnchor}\n\nRotation & Gravity: ${HELIOS_KNOWLEDGE_BASE.design.rotation}\n\nDeployment: ${HELIOS_KNOWLEDGE_BASE.design.deployment}`)
  }
  
  // Life support
  if (lowerQuery.includes('life support') || lowerQuery.includes('atmosphere') || lowerQuery.includes('air') || lowerQuery.includes('oxygen')) {
    sections.push(`LIFE SUPPORT - Atmosphere: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.atmosphere}`)
  }
  if (lowerQuery.includes('water') || lowerQuery.includes('recycling') || lowerQuery.includes('recovery')) {
    sections.push(`LIFE SUPPORT - Water: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.waterRecovery}`)
  }
  if (lowerQuery.includes('waste') || lowerQuery.includes('recycle')) {
    sections.push(`LIFE SUPPORT - Waste: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.wasteRecycling}`)
  }
  if (lowerQuery.includes('food') || lowerQuery.includes('agriculture') || lowerQuery.includes('farm') || lowerQuery.includes('grow')) {
    sections.push(`LIFE SUPPORT - Agriculture: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.agriculture}`)
  }
  if (lowerQuery.includes('healthcare') || lowerQuery.includes('medical') || lowerQuery.includes('health')) {
    sections.push(`LIFE SUPPORT - Healthcare: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.healthcare}`)
  }
  if (lowerQuery.includes('solar') || lowerQuery.includes('power') || lowerQuery.includes('energy') || lowerQuery.includes('electricity')) {
    sections.push(`LIFE SUPPORT - Power: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.solarPower}\n\nEnergy Storage: ${HELIOS_KNOWLEDGE_BASE.lifeSupport.energyStorage}`)
  }
  
  // Safety
  if (lowerQuery.includes('radiation') || lowerQuery.includes('safety') || lowerQuery.includes('shielding') || lowerQuery.includes('protection')) {
    sections.push(`SAFETY & RADIATION:\nRadiation Protection: ${HELIOS_KNOWLEDGE_BASE.safety.radiation}\n\nStructural Safety: ${HELIOS_KNOWLEDGE_BASE.safety.structural}\n\nEmergency Systems: ${HELIOS_KNOWLEDGE_BASE.safety.emergency}`)
  }
  
  // Population
  if (lowerQuery.includes('population') || lowerQuery.includes('people') || lowerQuery.includes('residents') || lowerQuery.includes('demographics')) {
    sections.push(`POPULATION: ${HELIOS_KNOWLEDGE_BASE.population.structure}`)
  }
  if (lowerQuery.includes('education') || lowerQuery.includes('school') || lowerQuery.includes('learning')) {
    sections.push(`EDUCATION: ${HELIOS_KNOWLEDGE_BASE.population.education}`)
  }
  
  // Governance
  if (lowerQuery.includes('governance') || lowerQuery.includes('government') || lowerQuery.includes('politics') || lowerQuery.includes('law')) {
    sections.push(`GOVERNANCE: ${HELIOS_KNOWLEDGE_BASE.governance.framework}`)
  }
  if (lowerQuery.includes('economy') || lowerQuery.includes('economic') || lowerQuery.includes('money') || lowerQuery.includes('trade')) {
    sections.push(`ECONOMY: ${HELIOS_KNOWLEDGE_BASE.governance.economic}`)
  }
  
  // Growth
  if (lowerQuery.includes('growth') || lowerQuery.includes('expansion') || lowerQuery.includes('future') || lowerQuery.includes('plan')) {
    sections.push(`GROWTH & EXPANSION: ${HELIOS_KNOWLEDGE_BASE.growth.expansion}`)
  }
  
  // Research queries
  if (lowerQuery.includes('research') || lowerQuery.includes('study') || lowerQuery.includes('paper') || lowerQuery.includes('findings')) {
    const researchEntries = Object.entries(HELIOS_KNOWLEDGE_BASE.research)
    if (researchEntries.length > 0) {
      const researchText = researchEntries.map(([key, value]) => 
        `RESEARCH - ${key}: ${value}`
      ).join('\n\n')
      sections.push(researchText)
    }
  }
  
  // If no specific match, provide overview
  if (sections.length === 0) {
    return `HELIOS Space Settlement Overview:\n\n${Object.values(HELIOS_KNOWLEDGE_BASE.introduction).join('\n\n')}\n\nFor specific information, please ask about: Introduction, Mission/Vision, Orbit & Asteroid, HELIOS AI, Design, Life Support, Safety, Population, Governance, or Growth & Expansion.`
  }
  
  return sections.join('\n\n---\n\n')
}