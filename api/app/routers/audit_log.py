from fastapi import APIRouter, HTTPException, Query
from app.models import AuditLogEntry
from app.audit_logger import get_audit_logger
from datetime import datetime
from typing import List, Optional
import uuid

router = APIRouter()

# Keep in-memory for backward compatibility, but use file-based logger
audit_log_db: List[AuditLogEntry] = []

def log_audit_event(
    user: Optional[str],
    action: str,
    resource: str,
    status: str,
    details: Optional[str] = None
):
    """Helper function to create audit log entries (append-only)"""
    audit_logger = get_audit_logger()
    
    # Log to file (append-only)
    file_entry = audit_logger.log(user, action, resource, status, details)
    
    # Also create Pydantic model for in-memory compatibility
    entry = AuditLogEntry(
        id=str(uuid.uuid4()),
        timestamp=datetime.fromisoformat(file_entry["timestamp"].replace("Z", "+00:00")),
        user=user,
        action=action,
        resource=resource,
        status=status,
        details=str(details) if details else None
    )
    audit_log_db.append(entry)
    return entry

@router.get("/audit-log")
async def get_audit_log(
    user: Optional[str] = Query(None, description="Filter by user"),
    action: Optional[str] = Query(None, description="Filter by action"),
    resource: Optional[str] = Query(None, description="Filter by resource"),
    status: Optional[str] = Query(None, description="Filter by status: success, failure, pending"),
    limit: int = Query(100, ge=1, le=10000, description="Maximum number of entries to return"),
    offset: int = Query(0, ge=0, description="Number of entries to skip")
):
    """
    Get audit log entries from append-only log file, optionally filtered
    """
    audit_logger = get_audit_logger()
    
    # Define filter function
    def filter_func(entry: dict) -> bool:
        if user and entry.get("user") != user:
            return False
        if action and entry.get("action") != action:
            return False
        if resource and entry.get("resource") != resource:
            return False
        if status and entry.get("status") != status:
            return False
        return True
    
    # Read from file
    entries = audit_logger.read_logs(limit=limit + offset, filter_func=filter_func)
    
    # Apply pagination
    total = len(entries)
    paginated_entries = entries[offset:offset + limit]
    
    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "count": len(paginated_entries),
        "entries": paginated_entries
    }

@router.get("/audit-log/{entry_id}")
async def get_audit_log_entry(entry_id: str):
    """Get a specific audit log entry by ID"""
    entry = next((e for e in audit_log_db if e.id == entry_id), None)
    
    if not entry:
        raise HTTPException(status_code=404, detail="Audit log entry not found")
    
    return entry.dict()

@router.post("/audit-log")
async def create_audit_log_entry(
    user: Optional[str] = None,
    action: str = None,
    resource: str = None,
    status: str = None,
    details: Optional[str] = None
):
    """
    Create a new audit log entry
    """
    if not all([action, resource, status]):
        raise HTTPException(
            status_code=400,
            detail="action, resource, and status are required"
        )
    
    if status not in ["success", "failure", "pending"]:
        raise HTTPException(
            status_code=400,
            detail="status must be one of: success, failure, pending"
        )
    
    entry = log_audit_event(user, action, resource, status, details)
    return entry.dict()
