import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

interface HealthCheck {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  checks: {
    database: boolean
    auth: boolean
    environment: boolean
  }
  version?: string
}

async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const requiredTables = ['profiles','employers','candidates','jobs']
    const checks = await Promise.all(
      requiredTables.map(async (t) => {
        const { error } = await supabase.from(t).select('id').limit(1)
        return !error
      })
    )
    return checks.every(Boolean)
  } catch {
    return false
  }
}

async function checkAuthService(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.getSession()
    return !error
  } catch {
    return false
  }
}

function checkEnvironment(): boolean {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  
  return requiredVars.every(varName => !!process.env[varName])
}

export async function GET() {
  try {
    const [database, auth, environment] = await Promise.all([
      checkDatabaseConnection(),
      checkAuthService(),
      Promise.resolve(checkEnvironment())
    ])

    const checks = { database, auth, environment }
    const isHealthy = Object.values(checks).every(check => check === true)

    const healthCheck: HealthCheck = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.npm_package_version || '1.0.0'
    }

    logger.info('Health check performed', { 
      status: healthCheck.status, 
      checks: healthCheck.checks 
    })

    return NextResponse.json(healthCheck, { 
      status: isHealthy ? 200 : 503 
    })
  } catch (error) {
    logger.error('Health check failed', error as Error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 503 })
  }
}