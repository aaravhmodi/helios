import { NextRequest, NextResponse } from 'next/server'

const API_BASE = 'http://localhost:8000/api'

export async function POST(request: NextRequest) {
  try {
    const { recommendation_id, approved_by } = await request.json()
    
    if (!recommendation_id) {
      return NextResponse.json(
        { error: 'recommendation_id is required' },
        { status: 400 }
      )
    }
    
    // Forward to FastAPI safety approval endpoint
    const response = await fetch(`${API_BASE}/safety/approve/${recommendation_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved_by: approved_by || 'dashboard_user' })
    })
    
    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || 'Failed to approve recommendation' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to approve recommendation', details: error.message },
      { status: 500 }
    )
  }
}
