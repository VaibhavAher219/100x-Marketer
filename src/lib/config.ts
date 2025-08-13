interface EnvironmentConfig {
  supabase: {
    url: string
    anonKey: string
  }
  app: {
    environment: 'development' | 'production' | 'staging'
    logLevel: 'debug' | 'info' | 'warn' | 'error'
  }
}

class ConfigManager {
  private static instance: ConfigManager
  private config: EnvironmentConfig | null = null

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  validateEnvironment(): void {
    // Only validate on server-side or when actually needed
    if (typeof window !== 'undefined') {
      // Client-side: just check if variables exist, don't throw
      return
    }
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]

    const missing = requiredEnvVars.filter(key => !process.env[key])
    
    if (missing.length > 0) {
      console.error(`Missing required environment variables: ${missing.join(', ')}`)
      // Don't throw in production, just log the error
      if (process.env.NODE_ENV !== 'production') {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
      }
    }
  }

  getConfig(): EnvironmentConfig {
    if (!this.config) {
      this.validateEnvironment()
      
      this.config = {
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        },
        app: {
          environment: (process.env.NODE_ENV as 'development' | 'production' | 'staging') || 'development',
          logLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info'
        }
      }
    }
    
    return this.config
  }

  isProduction(): boolean {
    return this.getConfig().app.environment === 'production'
  }

  isDevelopment(): boolean {
    return this.getConfig().app.environment === 'development'
  }
}

export const config = ConfigManager.getInstance()