# Helios - Jarvis AI Space Settlement Explorer

A Next.js text-based chatbot application designed for space settlement explorers. HELIOS AI assists with space settlement requirements, planning, and operations based on comprehensive design specifications and research.

## Features

- 🤖 **AI Assistant**: Advanced chatbot with OpenAI integration (optional) and enhanced knowledge base
- 🚀 **Space Settlement Focus**: Comprehensive knowledge base covering the complete HELIOS Space Settlement design
- 💬 **Real-time Chat**: Smooth conversation interface with intelligent responses
- 🌌 **Space Theme**: Beautiful starfield background and space-inspired UI
- 📱 **Responsive**: Works on desktop and mobile devices
- 📚 **University Research**: Integration of space settlement studies and engineering reports

## Knowledge Base Topics

The HELIOS AI system provides detailed information on:

### 1. Introduction & Scope
- Executive summary of the HELIOS project
- Project scope and objectives
- Settlement overview and mission

### 2. Settlement Design
- **Orbital Location**: Near-Earth Asteroid (NEA) orbit characteristics
- **Asteroid Selection**: Criteria for C-type and M-type asteroids
- **Structural Design**: Modular cylindrical and toroidal sections
- **Materials**: Asteroid-derived construction materials (iron-nickel, regolith concrete)
- **Radiation Shielding**: Multi-layer protection (3-5m regolith, 1.5m water equivalent)
- **Rotation & Gravity**: 1.9 RPM rotation generating 0.38g artificial gravity
- **Deployment**: Phased human deployment (0-2 years, 2-5 years, 5-10 years, 10+ years)

### 3. HELIOS AI System
- Central AI management architecture
- Life support monitoring and automation
- Emergency response protocols
- Resource allocation and optimization
- Human oversight mechanisms

### 4. Life Support Systems
- **Atmosphere**: 21% O2, 78% N2, 14.7 psi, temperature/humidity control
- **Water Recovery**: 98%+ efficiency through multiple processing systems
- **Waste Recycling**: 95% waste reduction with closed-loop processing
- **Agriculture**: Vertical hydroponics, aeroponics, 100% food production
- **Healthcare**: Comprehensive medical facilities with telemedicine
- **Solar Power**: 1 MW generation capacity, 40%+ efficiency panels
- **Energy Storage**: 500 kWh battery banks, hydrogen fuel cells

### 5. Safety & Radiation Protection
- Multi-layer radiation shielding strategies
- Structural safety with redundant systems
- Emergency response protocols
- Fire suppression and evacuation procedures

### 6. Population & Daily Life
- Demographics: 500-1000 initial, target 10,000+
- Education systems with university partnerships
- Healthcare and medical services
- Community structure and family units

### 7. Governance & Economy
- Representative council governance framework
- Mixed economy model
- Resource-based economic transition
- Trade systems with Earth

### 8. Growth & Expansion
- Phased expansion plans
- Infrastructure development timeline
- Population growth projections

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- (Optional) OpenAI API key for advanced AI features

### Installation

1. Install dependencies:
```bash
npm install
```

2. (Optional) Configure OpenAI API:
   - Create a `.env.local` file in the root directory
   - Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
   - Get your API key from: https://platform.openai.com/api-keys
   - Note: The app works without OpenAI using an enhanced knowledge base system

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
  ├── api/
  │   └── chat/
  │       └── route.ts          # API endpoint with OpenAI integration
  ├── components/
  │   └── ChatMessage.tsx       # Message component
  ├── lib/
  │   └── knowledge-base.ts     # Comprehensive HELIOS knowledge base
  ├── globals.css               # Global styles with starfield
  ├── layout.tsx                # Root layout
  └── page.tsx                  # Main chat page
```

## Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **OpenAI API** - Advanced AI capabilities (optional)
- **CSS Modules** - Component styling
- **Enhanced Knowledge Base** - Comprehensive space settlement data

## Configuration

### With OpenAI (Recommended)
The app will use GPT-4 for more intelligent, contextual responses while maintaining accuracy to the HELIOS knowledge base.

### Without OpenAI
The app uses an enhanced rule-based system with the comprehensive knowledge base, providing detailed technical information based on keyword matching and context extraction.

## Example Questions

Try asking:
- "What are the radiation shielding specifications?"
- "Tell me about the life support systems"
- "How does the rotating habitat work?"
- "What materials are used in construction?"
- "Explain the HELIOS AI system architecture"
- "What is the population structure?"
- "How does water recovery work?"
- "What are the expansion plans?"

## Future Enhancements

- Integration with additional AI providers (Anthropic Claude, etc.)
- Voice input/output capabilities
- Conversation history persistence
- Advanced space settlement calculations
- Real-time collaboration features
- Integration with space settlement databases
- Visualization tools for settlement design

## License

MIT

## Bibliography References

The knowledge base incorporates research and studies on:
- Space settlement design and engineering
- Asteroid mining and utilization
- Life support systems technology
- Radiation protection strategies
- Space habitat architecture
- Closed-loop ecological systems
- Space colonization economics and governance
