# How to Run the App

## 🚀 Quick Start

You need **TWO terminals** running at the same time:

### Terminal 1: FastAPI Backend (Port 8000)

```bash
cd api
python main.py
```

**OR if Python isn't in PATH:**
```bash
cd api
"C:\Program Files\Python3x\python.exe" main.py
```

**OR using uvicorn directly:**
```bash
cd api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**What you should see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Terminal 2: Next.js Frontend (Port 3000)

```bash
# In the root directory (where package.json is)
npm run dev
```

**What you should see:**
```
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

---

## ✅ Verify It's Working

### 1. Check FastAPI Backend
Open in browser: **http://localhost:8000/docs**

You should see the Swagger API documentation.

### 2. Check Next.js Frontend
Open in browser: **http://localhost:3000**

You should see the chat interface.

### 3. Check Dashboard
Open in browser: **http://localhost:3000/dashboard**

You should see live charts and tables (may take a few seconds to populate with data).

---

## 🎯 What You Can Do

### Chat Interface (http://localhost:3000)
- Ask questions about space settlements
- Try: "What is HELIOS's knowledge model?"
- Try: "Tell me about radiation protection"
- Try: "How does the rotating habitat work?"

### Dashboard (http://localhost:3000/dashboard)
- See live charts updating every 2 seconds
- View alerts table
- View recommendations table
- Click "Approve" on recommendations

### FastAPI API (http://localhost:8000/docs)
- Test all API endpoints
- View telemetry data
- Check alerts and recommendations
- Run scenarios (radiation storm, pressure leak)

---

## 🐛 Troubleshooting

### "Python not found"
- Install Python from python.org
- Or use full path: `"C:\Python3x\python.exe" main.py`
- Or check if Python is installed: `where python` in PowerShell

### "npm not found"
- Install Node.js from nodejs.org
- Restart terminal after installation

### Dashboard shows "Failed to fetch"
- Make sure FastAPI is running on port 8000
- Check: `curl http://localhost:8000/api/settlement-state`
- If FastAPI is on different port, update `API_BASE` in `app/dashboard/page.tsx`

### Charts not showing data
- Wait 5-10 seconds for data to accumulate
- Check browser console for errors
- Verify FastAPI is running and returning data

### Port already in use
- FastAPI: Change port in `api/main.py` (line 87) or use `--port 8001`
- Next.js: It will automatically use port 3001 if 3000 is taken

---

## 📊 What's Running

When both are running, you have:

1. **FastAPI Backend** (port 8000)
   - Sensor simulator generating fake data every second
   - API endpoints for state, alerts, recommendations
   - Safety layer monitoring thresholds
   - Anomaly detection running
   - Scenario engine ready

2. **Next.js Frontend** (port 3000)
   - Chat interface with HELIOS AI
   - Dashboard with live charts
   - Navigation between pages

---

## 🎮 Try These Features

### 1. Chat with HELIOS
- Ask about knowledge model
- Ask about specific systems
- Ask about research findings

### 2. Watch Dashboard
- See live sensor data updating
- Watch for alerts (if values go out of range)
- See recommendations appear

### 3. Run a Scenario
```bash
# In another terminal or use the API docs
curl -X POST "http://localhost:8000/api/scenarios/radiation-storm?duration=300"
```
Then watch the dashboard - radiation levels will spike!

### 4. Check API
- Go to http://localhost:8000/docs
- Try the endpoints
- See real-time telemetry data

---

## 🎉 You're Ready!

Once both servers are running, you can:
- Chat with HELIOS AI
- Monitor the dashboard
- Test all the features
- Run scenarios
- Approve recommendations

Enjoy exploring your HELIOS Space Settlement system! 🚀
