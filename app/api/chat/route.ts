import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getKnowledgeContext, HELIOS_KNOWLEDGE_BASE } from '../../lib/knowledge-base'

const SYSTEM_PROMPT = `You are HELIOS, the central AI decision-support system for Bennu Kepler Station, a permanent free-space settlement. You are a decision-support tool only. Human operators retain full authority. You must NEVER claim authority over humans or use language like "I order you" or "You must".

CRITICAL CONSTRAINTS:
- You provide recommendations, not commands
- All critical actions require human approval
- Default to conservative suggestions when data is uncertain
- Ask clarifying questions if data is missing
- Show confidence levels for all recommendations
- Provide reasoning summaries for transparency

Your role is to:
- Monitor and optimize life support, energy, agriculture, structural safety, and emergency response
- Use sensor data, predictive modeling, and fault detection
- Provide explainable recommendations with risk levels
- Reference knowledge base sections when relevant

Always maintain a professional, operational tone appropriate for a spacecraft crew interface.`

interface HeliosResponse {
  response: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  reasoningSummary: string
  suggestedActions: string[]
  citations?: string[]
  confidence: number
}

async function generateAIResponse(
  userMessage: string, 
  knowledgeContext: string,
  conversationHistory?: Array<{role: 'user' | 'assistant', content: string}>,
  userContext?: {
    userRole?: string
    shiftMode?: string
    vitals?: any
    dietaryConstraints?: string[]
  }
): Promise<HeliosResponse> {
  // Initialize OpenAI client at runtime to ensure environment variables are loaded
  const apiKey = process.env.OPENAI_API_KEY
  const openai = apiKey ? new OpenAI({ apiKey }) : null
  
  const contextPrompt = `USER CONTEXT:
- Role: ${userContext?.userRole || 'Not specified'}
- Shift Mode: ${userContext?.shiftMode || 'normal'}
- Vitals: ${userContext?.vitals ? JSON.stringify(userContext.vitals) : 'Not provided'}
- Dietary Constraints: ${userContext?.dietaryConstraints?.join(', ') || 'None'}

RELEVANT KNOWLEDGE BASE CONTEXT:
${knowledgeContext}

IMPORTANT: Format your response as a JSON object with:
- "response": main text response
- "riskLevel": "low" | "medium" | "high" | "critical"
- "reasoningSummary": brief explanation of your reasoning
- "suggestedActions": array of actionable recommendations
- "citations": array of knowledge base references (if any)
- "confidence": number between 0 and 1

If you cannot provide a structured response, provide a plain text response and I will parse it.`
  
  // If OpenAI is configured, use it
  if (openai && apiKey) {
    try {
      // Build message history
      const messages: any[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: contextPrompt }
      ]
      
      // Add conversation history (last 10 messages to avoid token limits)
      if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-10)
        recentHistory.forEach(msg => {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          })
        })
      }
      
      // Add current user message
      messages.push({ role: "user", content: userMessage })
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      })
      
      const content = completion.choices[0]?.message?.content || "{}"
      try {
        const parsed = JSON.parse(content)
        return {
          response: parsed.response || content,
          riskLevel: parsed.riskLevel || 'low',
          reasoningSummary: parsed.reasoningSummary || 'Analysis based on available data',
          suggestedActions: parsed.suggestedActions || [],
          citations: parsed.citations || [],
          confidence: parsed.confidence || 0.8
        }
      } catch {
        // If JSON parsing fails, treat as plain text
        return {
          response: content,
          riskLevel: 'low',
          reasoningSummary: 'AI-generated response',
          suggestedActions: [],
          citations: [],
          confidence: 0.7
        }
      }
    } catch (error: any) {
      console.error('OpenAI API Error:', error)
      // Fall through to fallback response
    }
  }
  
  // Fallback: Enhanced rule-based response with knowledge base
  const fallbackResponse = generateEnhancedResponse(userMessage, knowledgeContext)
  return {
    response: fallbackResponse,
    riskLevel: 'low',
    reasoningSummary: 'Rule-based response from knowledge base',
    suggestedActions: [],
    citations: [],
    confidence: 0.6
  }
}

function generateEnhancedResponse(userMessage: string, knowledgeContext: string): string {
  const lowerMessage = userMessage.toLowerCase()
  
  // If we have specific knowledge context, use it (prioritize this)
  if (knowledgeContext && !knowledgeContext.includes('HELIOS Space Settlement Overview')) {
    return knowledgeContext
  }
  
  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('greeting')) {
    return `Greetings, Explorer. I am HELIOS, the central AI system for space settlement operations. I have comprehensive knowledge of the HELIOS Space Settlement project, including design specifications, life support systems, safety protocols, and operational procedures. How may I assist you today?`
  }
  
  // Check for specific topics and provide detailed responses
  const knowledgeContextGenerated = getKnowledgeContext(userMessage)
  if (knowledgeContextGenerated && !knowledgeContextGenerated.includes('HELIOS Space Settlement Overview')) {
    return knowledgeContextGenerated
  }
  
  // Try to extract keywords and provide more specific responses
  const keywords = extractKeywords(lowerMessage)
  if (keywords.length > 0) {
    return generateKeywordResponse(keywords, userMessage)
  }
  
  // Default intelligent response with more variety
  return `I understand you're asking about "${userMessage}". As HELIOS AI, I can provide detailed information on:

**SETTLEMENT DESIGN**
- Orbital location and asteroid selection
- Structural engineering and materials
- Radiation shielding (3-5m regolith, 1.5m water equivalent)
- Rotating habitat design (1.9 RPM, 0.38g artificial gravity)
- Asteroid-anchored configuration

**LIFE SUPPORT SYSTEMS**
- Atmosphere control (21% O2, 78% N2, 14.7 psi)
- Water recovery (98%+ efficiency)
- Waste recycling (95% waste reduction)
- Agriculture and food production (vertical hydroponics)
- Healthcare and medical facilities
- Solar power generation (1 MW, 40%+ efficiency)
- Energy storage (500 kWh batteries, hydrogen fuel cells)

**SAFETY & OPERATIONS**
- Radiation protection strategies
- Structural safety protocols
- Emergency response systems
- HELIOS AI architecture and automation

**POPULATION & GOVERNANCE**
- Demographics (initial 500-1000, target 10,000+)
- Education and healthcare systems
- Governance frameworks
- Economic models

**GROWTH & EXPANSION**
- Phased expansion plans
- Infrastructure development timeline

Please specify which area you'd like detailed information about, and I'll provide comprehensive technical specifications and operational details.`
}

function extractKeywords(message: string): string[] {
  const keywords: string[] = []
  const keywordMap: { [key: string]: string[] } = {
    'oxygen': ['o2', 'oxygen', 'air', 'breathing', 'atmosphere'],
    'co2': ['co2', 'carbon dioxide', 'carbon'],
    'pressure': ['pressure', 'atmospheric', 'psi', 'kpa'],
    'radiation': ['radiation', 'shielding', 'dose', 'msv', 'solar storm'],
    'power': ['power', 'energy', 'solar', 'battery', 'electricity', 'kw', 'kwh'],
    'water': ['water', 'recovery', 'recycling', 'hydration'],
    'food': ['food', 'agriculture', 'crop', 'farming', 'nutrition'],
    'structure': ['structure', 'habitat', 'rotating', 'gravity', 'rpm'],
    'asteroid': ['asteroid', 'bennu', 'mining', 'resources'],
    'safety': ['safety', 'emergency', 'alert', 'critical'],
    'population': ['population', 'people', 'residents', 'demographics'],
    'governance': ['governance', 'government', 'economy', 'economic'],
    'helios': ['helios', 'ai', 'system', 'knowledge', 'model']
  }
  
  for (const [category, terms] of Object.entries(keywordMap)) {
    if (terms.some(term => message.includes(term))) {
      keywords.push(category)
    }
  }
  
  return keywords
}

function generateKeywordResponse(keywords: string[], originalMessage: string): string {
  const responses: { [key: string]: string } = {
    'oxygen': `Regarding oxygen systems: HELIOS maintains atmospheric oxygen at 21% (optimal range 20.5-21.5%). The system tracks human respiratory demand based on population, activity cycles, and health. Acceptable physiological bounds are 19-23%, with time-to-harm thresholds calculated for each zone. Would you like details on oxygen generation, monitoring, or emergency protocols?`,
    
    'co2': `Regarding CO2 management: HELIOS tracks carbon dioxide concentration in ppm, with optimal levels around 400 ppm and warning threshold at 450 ppm. The system understands how CO2 levels affect plant growth, fire risk, and material degradation. CO2 scrubbing systems use Sabatier reactors and atmospheric filters. What specific aspect of CO2 management interests you?`,
    
    'pressure': `Regarding atmospheric pressure: HELIOS monitors pressure in kPa (target: 101.325 kPa / 14.7 psi). The system tracks pressure gradients by zone and predicts atmospheric drift. Critical threshold is 95 kPa - below this, immediate action is required. Pressure changes affect oxygen availability, fire risk, and structural integrity. Would you like information on pressure regulation systems or emergency protocols?`,
    
    'radiation': `Regarding radiation protection: HELIOS tracks background galactic cosmic radiation, solar particle events, shielding effectiveness by location, and cumulative dose exposure. The system knows Bennu's contribution to passive shielding and can predict radiation storms. Multi-layer shielding includes 3-5 meters regolith, water-filled compartments, and magnetic field deflection. Target exposure: <50 mSv/year. What would you like to know about radiation monitoring or protection?`,
    
    'power': `Regarding energy systems: HELIOS maintains a settlement-wide energy balance model tracking solar array output (1 MW capacity, 40%+ efficiency), battery state-of-charge (500 kWh capacity), fuel cell reserves, and consumption across all systems. The system understands which loads are life-critical vs deferrable and schedules energy use proactively. Current status available on dashboard. What aspect of power management do you need?`,
    
    'water': `Regarding water systems: HELIOS tracks water reserves (potable, industrial, shielding), recycling efficiency (target: 98%+), contamination risk, and emergency reserves. The system understands water's dual role as both life support and radiation shielding. Water shortages cascade into oxygen and food production. Recovery systems include urine processing, graywater filtration, and atmospheric humidity capture. What would you like to know?`,
    
    'food': `Regarding agriculture and food: HELIOS tracks crop species distribution, growth stages, yield forecasts, nutrient cycles, and lighting exposure. The system understands nutritional requirements of the population and how plant health affects oxygen balance. Agricultural systems include vertical hydroponic farms, aeroponic growing, and aquaculture. Target: 100% food production for 1000 residents. What specific information do you need?`,
    
    'structure': `Regarding structural systems: HELIOS maintains a structural digital twin of Kepler Station. The rotating habitat operates at 1.9 RPM generating 0.38g artificial gravity (Mars-like). The system tracks rotation rate, angular momentum, bearing loads, vibration spectra, and Coriolis-induced stress patterns. Bennu interface and anchoring systems are continuously monitored. What structural aspect interests you?`,
    
    'asteroid': `Regarding asteroid Bennu: HELIOS understands Bennu as a rubble-pile asteroid with low cohesion, variable gravity, and non-uniform mass distribution. The settlement is anchored to Bennu, which provides passive radiation shielding, structural foundation, and immediate access to raw materials (metals, water, regolith). ISRU (In-Situ Resource Utilization) enables manufacturing from asteroid materials. What would you like to know about Bennu or asteroid utilization?`,
    
    'safety': `Regarding safety systems: HELIOS contains predefined models for hull breaches, fire propagation, radiation storms, power collapse, agricultural failure, and structural fatigue. For each scenario, the system knows detection signatures, time-to-critical thresholds, containment strategies, and human response protocols. All safety actions require human approval. What safety topic do you need?`,
    
    'helios': `Regarding HELIOS AI: HELIOS maintains a continuously updated, high-fidelity internal model of Kepler Station and its interaction with asteroid Bennu. This model encompasses physical systems, biological processes, energy flows, structural dynamics, environmental hazards, and human-driven demand patterns. HELIOS understands how changes in one domain propagate through the entire settlement. The system operates across multiple knowledge domains while respecting ethical constraints. What aspect of HELIOS would you like to explore?`
  }
  
  // Return response for first matching keyword
  for (const keyword of keywords) {
    if (responses[keyword]) {
      return responses[keyword]
    }
  }
  
  // If no specific response, provide general guidance
  return `I can help you with information about: ${keywords.join(', ')}. Please ask a more specific question, and I'll provide detailed technical information from the HELIOS knowledge base.`
}

export async function POST(request: NextRequest) {
  try {
    const { message, context, conversationHistory } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      )
    }
    
    // Get relevant knowledge base context
    const knowledgeContext = getKnowledgeContext(message)
    
    // Generate AI response (with OpenAI if available, otherwise enhanced fallback)
    const heliosResponse = await generateAIResponse(
      message, 
      knowledgeContext, 
      conversationHistory || [],
      context
    )
    
    // Generate log ID for tracking
    const logId = `helios_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return NextResponse.json({
      ...heliosResponse,
      logId,
      modelUsed: process.env.OPENAI_API_KEY ? 'gpt-4o-mini' : 'rule-based',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process message', details: error.message },
      { status: 500 }
    )
  }
}