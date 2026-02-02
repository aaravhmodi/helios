# HELIOS AI Setup Guide

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

The app works **immediately** without any API keys using an enhanced knowledge base system!

## Optional: Enable OpenAI AI Features

For more advanced, conversational AI responses:

1. Get an OpenAI API key:
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in
   - Create a new API key

2. Create a `.env.local` file in the root directory:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```

3. Restart the dev server:
   ```bash
   npm run dev
   ```

### OpenAI Model Options

You can change the AI model in `app/api/chat/route.ts`:

- `gpt-4o-mini` - Cost-effective, fast (default)
- `gpt-4o` - More capable, faster
- `gpt-4-turbo` - High performance
- `gpt-3.5-turbo` - Cheaper alternative

### Cost Notes

- Without OpenAI: **Free** - uses enhanced knowledge base
- With OpenAI: Pay-per-use based on OpenAI pricing
  - GPT-4o-mini: Very affordable (~$0.15 per 1M input tokens)
  - GPT-4o: Higher cost but better quality

## Knowledge Base

The app includes a comprehensive knowledge base covering:
- Complete HELIOS Space Settlement design specifications
- Life support systems details
- Safety and radiation protection
- Population and governance
- Growth and expansion plans

All responses are based on the detailed table of contents structure you provided, ensuring accuracy and specificity.
