# HELIOS Chatbot Setup Guide

The HELIOS Console chatbot is already integrated into your dashboard. To make it fully functional with AI capabilities, follow these steps:

## Quick Setup

### Option 1: With OpenAI API (Recommended for Best Experience)

1. **Get an OpenAI API Key:**
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in to your OpenAI account
   - Click "Create new secret key"
   - Copy the key (it starts with `sk-`)

2. **Create Environment File:**
   - In the root directory of your project, create a file named `.env.local`
   - Add your API key:
     ```
     OPENAI_API_KEY=sk-your-actual-key-here
     ```

3. **Restart the Development Server:**
   - Stop the current server (Ctrl+C)
   - Run `npm run dev` again
   - The chatbot will now use GPT-4o-mini for intelligent responses

### Option 2: Without OpenAI API (Fallback Mode)

The chatbot will work without an API key using an enhanced rule-based system with the knowledge base. It will:
- Provide detailed responses based on the HELIOS knowledge base
- Use keyword matching and context extraction
- Still provide helpful information, but with less conversational intelligence

**Note:** The fallback system is already active if no API key is found.

## How It Works

### Current Implementation

The chatbot (`HeliosConsole`) is integrated into the dashboard and:
- ✅ Sends user context (role, vitals, shift mode, dietary constraints) to the API
- ✅ Maintains conversation history for context
- ✅ Displays risk levels, reasoning summaries, and suggested actions
- ✅ Logs all interactions for transparency
- ✅ Provides "Accept" and "Ignore" buttons for recommendations
- ✅ Shows confidence levels and citations

### API Route Features

The `/api/chat` route:
- Uses OpenAI GPT-4o-mini if API key is available
- Falls back to enhanced rule-based responses if no key
- Integrates with the HELIOS knowledge base
- Provides structured JSON responses with:
  - Main response text
  - Risk level (low/medium/high/critical)
  - Reasoning summary
  - Suggested actions array
  - Citations
  - Confidence score

## Testing the Chatbot

1. **Complete the quiz** to set your role and vitals
2. **Navigate to the dashboard** - the HELIOS Console appears in the sidebar
3. **Try asking:**
   - "What should I monitor as a Medical Officer?"
   - "How are my vitals looking?"
   - "What's the oxygen level in the station?"
   - "Tell me about life support systems"
   - "What are the safety protocols?"

## Troubleshooting

### Chatbot not responding?
- Check browser console for errors
- Verify the API route is accessible: `http://localhost:3000/api/chat`
- Check server logs for API errors

### OpenAI API errors?
- Verify your API key is correct in `.env.local`
- Check your OpenAI account has credits
- Ensure the key has proper permissions
- Check server logs for specific error messages

### Chatbot shows same response?
- The conversation history should fix this - make sure you're sending different messages
- Check that the `conversationHistory` is being passed correctly

### Environment variables not loading?
- Make sure `.env.local` is in the root directory (same level as `package.json`)
- Restart the Next.js dev server after creating/modifying `.env.local`
- Next.js only loads `.env.local` at server startup

## Security Notes

- ✅ `.env.local` is already in `.gitignore` (your API key won't be committed)
- ✅ API key is only used server-side (never sent to frontend)
- ✅ API key is never logged or exposed in responses
- ✅ All interactions are logged locally for transparency

## Advanced Configuration

### Change AI Model

Edit `app/api/chat/route.ts` line 90:
```typescript
model: "gpt-4o-mini",  // Change to "gpt-4", "gpt-3.5-turbo", etc.
```

### Adjust Response Format

The API expects JSON responses. To modify the structure, edit the `HeliosResponse` interface in `app/api/chat/route.ts`.

### Customize System Prompt

Edit the `SYSTEM_PROMPT` constant in `app/api/chat/route.ts` to change HELIOS's behavior and tone.

## Next Steps

Once the chatbot is functional:
1. Test with different roles to see role-based responses
2. Try different shift modes (Normal/Emergency/Training)
3. Check the session report to see logged interactions
4. Customize the knowledge base in `app/lib/knowledge-base.ts`
