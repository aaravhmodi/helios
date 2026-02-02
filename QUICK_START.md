# Quick Start - Run the App

## ✅ Next.js is Running!
The frontend is already running at: **http://localhost:3000**

## 🚀 Start FastAPI Backend

Open a **NEW terminal** and run:

```bash
cd api
python main.py
```

**OR if Python isn't found:**
```bash
cd api
py main.py
```

**OR using uvicorn:**
```bash
cd api
uvicorn main:app --reload --port 8000
```

## 📊 What You'll See

### Dashboard (http://localhost:3000/dashboard)
- **Left side**: Status cards, live charts, alerts, recommendations
- **Right side**: HELIOS chatbot (fixed - no more repetition!)

### Chat Page (http://localhost:3000)
- Full-screen chat interface

## 🎯 Try These

### In the Dashboard Chatbot:
- "What is HELIOS's knowledge model?"
- "Tell me about radiation protection"
- "How does oxygen monitoring work?"
- "What are the safety protocols?"
- "Explain the energy balance system"

### The chatbot is now smarter:
- ✅ No more repeating the same response
- ✅ Understands keywords better
- ✅ Provides specific answers based on your question
- ✅ Uses the knowledge base you added

## 🔧 If Dashboard Shows "Failed to fetch"

Make sure FastAPI is running! Check:
- Open http://localhost:8000/docs
- If that works, the dashboard will work too

## 🎉 Everything Should Work Now!

The chatbot will give different, relevant responses based on what you ask!
