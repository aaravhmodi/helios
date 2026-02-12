'use client'

import { useState } from 'react'
import { CrewRole, ShiftMode, Vitals, RiskLevel } from '../../core/models'
import { logHeliosInteraction, updateHeliosLogAction } from '../../services/helios-logger'
import styles from './HeliosConsole.module.css'

interface HeliosMessage {
  id: string
  role: 'user' | 'helios'
  content: string
  timestamp: string
  riskLevel?: RiskLevel
  reasoningSummary?: string
  suggestedActions?: string[]
  citations?: string[]
  confidence?: number
  logId?: string
}

interface HeliosConsoleProps {
  userRole: CrewRole
  shiftMode: ShiftMode
  vitals?: Vitals
  dietaryConstraints?: string[]
}

export default function HeliosConsole({
  userRole,
  shiftMode,
  vitals,
  dietaryConstraints
}: HeliosConsoleProps) {
  const [messages, setMessages] = useState<HeliosMessage[]>([
    {
      id: '1',
      role: 'helios',
      content: 'HELIOS Console active. Decision-support tool. Human operators retain authority. How may I assist you?',
      timestamp: new Date().toISOString()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage: HeliosMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.role !== 'helios' || msg.content !== 'HELIOS Console active. Decision-support tool. Human operators retain authority. How may I assist you?')
        .map(msg => ({
          role: msg.role === 'helios' ? 'assistant' as const : 'user' as const,
          content: msg.content
        }))
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: conversationHistory,
          context: {
            userRole,
            shiftMode,
            vitals,
            dietaryConstraints
          }
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.details || `Server error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Handle error response from API
      if (data.error) {
        throw new Error(data.error || data.details || 'Unknown error')
      }
      
      const heliosMessage: HeliosMessage = {
        id: (Date.now() + 1).toString(),
        role: 'helios',
        content: data.response || data.outputSummary || 'Unable to generate response.',
        timestamp: new Date().toISOString(),
        riskLevel: data.riskLevel || 'low',
        reasoningSummary: data.reasoningSummary,
        suggestedActions: data.suggestedActions || [],
        citations: data.citations || [],
        confidence: data.confidence || 0.8,
        logId: data.logId
      }
      
      setMessages(prev => [...prev, heliosMessage])
    } catch (error: any) {
      console.error('HELIOS API Error:', error)
      const errorMessage: HeliosMessage = {
        id: (Date.now() + 1).toString(),
        role: 'helios',
        content: error.message || 'Error communicating with HELIOS. Please try again.',
        timestamp: new Date().toISOString(),
        riskLevel: 'low'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleAction = (logId: string, action: 'accepted' | 'ignored') => {
    updateHeliosLogAction(logId, action)
    // Update message to show action taken
    setMessages(prev => prev.map(msg => 
      msg.logId === logId ? { ...msg, userAction: action } : msg
    ))
  }
  
  const getRiskColor = (risk?: RiskLevel) => {
    switch (risk) {
      case 'critical': return '#f44336'
      case 'high': return '#ff9800'
      case 'medium': return '#ffc107'
      case 'low': return '#4caf50'
      default: return 'rgba(255, 255, 255, 0.5)'
    }
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <span className={styles.headerIcon}>⚡</span>
          <span>HELIOS Console</span>
        </div>
        <div className={styles.disclaimer}>
          Decision-support tool. Human operators retain authority.
        </div>
      </div>
      
      <div className={styles.messages}>
        {messages.map(msg => (
          <div key={msg.id} className={`${styles.message} ${styles[`message${msg.role === 'user' ? 'User' : 'Helios'}`]}`}>
            <div className={styles.messageHeader}>
              <span className={styles.messageRole}>
                {msg.role === 'user' ? 'You' : 'HELIOS'}
              </span>
              <span className={styles.messageTime}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className={styles.messageContent}>{msg.content}</div>
            
            {msg.role === 'helios' && (
              <div className={styles.messageMetadata}>
                {msg.riskLevel && (
                  <span 
                    className={styles.riskBadge}
                    style={{ backgroundColor: getRiskColor(msg.riskLevel) }}
                  >
                    Risk: {msg.riskLevel.toUpperCase()}
                  </span>
                )}
                {msg.confidence && (
                  <span className={styles.confidenceBadge}>
                    Confidence: {Math.round(msg.confidence * 100)}%
                  </span>
                )}
                
                {msg.reasoningSummary && (
                  <div className={styles.reasoning}>
                    <strong>Reasoning:</strong> {msg.reasoningSummary}
                  </div>
                )}
                
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className={styles.suggestedActions}>
                    <strong>Suggested Actions:</strong>
                    <ul>
                      {msg.suggestedActions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {msg.citations && msg.citations.length > 0 && (
                  <div className={styles.citations}>
                    <strong>References:</strong>
                    <ul>
                      {msg.citations.map((citation, idx) => (
                        <li key={idx}>{citation}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {msg.logId && (
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleAction(msg.logId!, 'accepted')}
                      className={styles.actionBtn}
                    >
                      Accept Recommendation
                    </button>
                    <button
                      onClick={() => handleAction(msg.logId!, 'ignored')}
                      className={`${styles.actionBtn} ${styles.actionBtnIgnore}`}
                    >
                      Ignore
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className={styles.loading}>HELIOS is thinking...</div>
        )}
      </div>
      
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask HELIOS..."
          className={styles.input}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          className={styles.sendBtn}
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}
