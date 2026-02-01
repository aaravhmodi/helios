"""
Append-only audit logging system
"""
import json
import os
from datetime import datetime
from typing import Optional, Dict, Any
from pathlib import Path

class AuditLogger:
    """Append-only file-based audit logger"""
    
    def __init__(self, log_file: str = "audit_log.jsonl"):
        self.log_file = Path(log_file)
        self.log_dir = self.log_file.parent
        self.log_dir.mkdir(parents=True, exist_ok=True)
    
    def log(
        self,
        user: Optional[str],
        action: str,
        resource: str,
        status: str,
        details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Append an audit log entry (append-only)
        
        Args:
            user: User who performed the action
            action: Action performed
            resource: Resource affected
            status: success, failure, or pending
            details: Additional details as dict
        
        Returns:
            The logged entry
        """
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "user": user,
            "action": action,
            "resource": resource,
            "status": status,
            "details": details or {}
        }
        
        # Append to file (append-only)
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
        
        return entry
    
    def read_logs(
        self,
        limit: int = 100,
        offset: int = 0,
        filter_func: Optional[callable] = None
    ) -> list:
        """
        Read audit log entries
        
        Args:
            limit: Maximum number of entries to return
            offset: Number of entries to skip
            filter_func: Optional function to filter entries
        
        Returns:
            List of log entries
        """
        if not self.log_file.exists():
            return []
        
        entries = []
        with open(self.log_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    try:
                        entry = json.loads(line)
                        if filter_func is None or filter_func(entry):
                            entries.append(entry)
                    except json.JSONDecodeError:
                        continue
        
        # Sort by timestamp (newest first)
        entries.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        # Pagination
        return entries[offset:offset + limit]
    
    def get_log_count(self) -> int:
        """Get total number of log entries"""
        if not self.log_file.exists():
            return 0
        
        count = 0
        with open(self.log_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    count += 1
        return count

# Singleton instance
_audit_logger_instance = None

def get_audit_logger() -> AuditLogger:
    """Get the singleton audit logger instance"""
    global _audit_logger_instance
    if _audit_logger_instance is None:
        _audit_logger_instance = AuditLogger()
    return _audit_logger_instance
