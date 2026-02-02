# Setup Guide - What to Install and Fix

## 🚀 Quick Setup Checklist

### 1. Next.js Frontend Setup

**Install Dependencies:**
```bash
cd /path/to/helios  # Root directory (where package.json is)
npm install
```

**What gets installed:**
- ✅ `recharts` - Already in package.json (for dashboard charts)
- ✅ All Next.js dependencies

**Potential Issues:**
- If `npm install` fails, try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- Make sure Node.js 18+ is installed

### 2. FastAPI Backend Setup

**Install Python Dependencies:**
```bash
cd api  # Go to API directory
pip install -r requirements.txt
```

**What's in requirements.txt:**
- ✅ `fastapi==0.104.1`
- ✅ `uvicorn[standard]==0.24.0`
- ✅ `pydantic==2.5.0`
- ✅ `websockets==12.0`
- ✅ `python-multipart==0.0.6`

**All Python imports are standard library or in requirements.txt:**
- ✅ `asyncio` - Standard library
- ✅ `copy` - Standard library
- ✅ `math` - Standard library
- ✅ `json` - Standard library
- ✅ `pathlib` - Standard library
- ✅ `datetime` - Standard library
- ✅ `uuid` - Standard library

**Potential Issues:**
- Make sure Python 3.8+ is installed
- Use virtual environment: `python -m venv venv` then `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)

### 3. Fix Type Hint Issue

**File:** `api/app/scenario_engine.py` line 6

**Issue:** `Callable` type hint may cause issues in some Python versions

**Fix:** Change this line:
```python
from typing import Dict, Any, Optional, Callable
```

To:
```python
from typing import Dict, Any, Optional
from collections.abc import Callable
```

OR simply remove `Callable` if not used (it's not actually used in the code).

### 4. Audit Log File Location

**Issue:** Audit log file needs write permissions

**Fix:** The audit log will be created in the `api/` directory as `audit_log.jsonl`

**If you get permission errors:**
- Make sure the `api/` directory is writable
- Or change the path in `api/app/audit_logger.py`:
  ```python
  def __init__(self, log_file: str = "logs/audit_log.jsonl"):
  ```

### 5. CORS Issues (Frontend → Backend)

**Issue:** Next.js frontend (port 3000) calling FastAPI (port 8000) may have CORS issues

**Fix:** Already handled in `api/main.py` with CORS middleware, but if you still get errors:

Make sure FastAPI is running on `http://localhost:8000` and Next.js on `http://localhost:3000`

### 6. Missing API Route Fix

**File:** `app/dashboard/page.tsx`

**Issue:** Dashboard tries to call FastAPI at `http://localhost:8000`

**Fix:** Make sure:
1. FastAPI is running: `cd api && python main.py` or `uvicorn main:app --reload`
2. The API_BASE constant is correct (line 30 in dashboard/page.tsx)

If FastAPI is on a different port, change:
```typescript
const API_BASE = 'http://localhost:8000/api'
```

## 🔧 Running Everything

### Terminal 1: FastAPI Backend
```bash
cd api
python main.py
# OR
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2: Next.js Frontend
```bash
# In root directory (where package.json is)
npm run dev
```

### Verify:
- FastAPI: http://localhost:8000/docs (Swagger UI)
- Next.js Chat: http://localhost:3000
- Next.js Dashboard: http://localhost:3000/dashboard

## 🐛 Common Errors and Fixes

### Error: "Module not found: recharts"
**Fix:** Run `npm install` in the root directory

### Error: "Cannot find module 'app.models'"
**Fix:** Make sure you're running from the `api/` directory, or set PYTHONPATH:
```bash
export PYTHONPATH="${PYTHONPATH}:/path/to/helios/api"
```

### Error: "Permission denied" on audit_log.jsonl
**Fix:** Check write permissions on `api/` directory, or change log file path

### Error: "CORS policy" in browser console
**Fix:** CORS is already configured, but make sure:
- FastAPI is running
- Next.js is running
- Both are on localhost (not 127.0.0.1 vs localhost mismatch)

### Error: "Failed to fetch" in dashboard
**Fix:** 
1. Check FastAPI is running: `curl http://localhost:8000/`
2. Check API endpoint: `curl http://localhost:8000/api/settlement-state`
3. Update `API_BASE` in dashboard if needed

### Error: "TypeError: Cannot read property 'map' of undefined"
**Fix:** Dashboard is trying to render before data loads. The code handles this, but if it persists:
- Check browser console for actual error
- Verify FastAPI is returning data in expected format

## ✅ Verification Checklist

- [ ] `npm install` completed successfully
- [ ] `pip install -r requirements.txt` completed successfully
- [ ] FastAPI starts without errors: `python api/main.py`
- [ ] Next.js starts without errors: `npm run dev`
- [ ] Can access http://localhost:8000/docs
- [ ] Can access http://localhost:3000
- [ ] Dashboard loads and shows charts (may take a few seconds for data)
- [ ] Audit log file is created in `api/audit_log.jsonl`

## 📝 Notes

- **No additional packages needed** - Everything is already in requirements.txt and package.json
- **All imports are standard** - No third-party Python packages beyond requirements.txt
- **Type hints are optional** - If `Callable` causes issues, it can be removed
- **Audit log is append-only** - File grows over time, consider log rotation in production
