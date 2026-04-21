// Test backend connection
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:3010/health');
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      backendStatus: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
