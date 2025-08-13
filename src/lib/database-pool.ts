import { supabase } from './supabase'
import { logger } from './logger'

interface DatabaseManager {
  createClient(): typeof supabase
  withRetry<T>(operation: () => Promise<T>): Promise<T>
  healthCheck(): Promise<boolean>
}

class SupabaseManager implements DatabaseManager {
  private static instance: SupabaseManager
  private healthCheckCache: { isHealthy: boolean; lastCheck: number } = {
    isHealthy: true,
    lastCheck: 0
  }

  private constructor() {}

  static getInstance(): SupabaseManager {
    if (!SupabaseManager.instance) {
      SupabaseManager.instance = new SupabaseManager()
    }
    return SupabaseManager.instance
  }

  createClient() {
    return supabase
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        logger.warn(`Database operation failed, attempt ${attempt}/${maxRetries}`, {
          error: lastError.message,
          attempt
        })
        
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1) // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    logger.error('Database operation failed after all retries', lastError!, {
      maxRetries,
      operation: operation.name || 'anonymous'
    })
    
    throw lastError!
  }

  async healthCheck(): Promise<boolean> {
    const now = Date.now()
    const cacheTimeout = 30000 // 30 seconds

    // Return cached result if recent
    if (now - this.healthCheckCache.lastCheck < cacheTimeout) {
      return this.healthCheckCache.isHealthy
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      this.healthCheckCache = {
        isHealthy: !error,
        lastCheck: now
      }

      if (error) {
        logger.warn('Database health check failed', { error: error.message })
      } else {
        logger.debug('Database health check passed')
      }

      return this.healthCheckCache.isHealthy
    } catch (error) {
      logger.error('Database health check error', error as Error)
      
      this.healthCheckCache = {
        isHealthy: false,
        lastCheck: now
      }
      
      return false
    }
  }

  // Graceful degradation helper
  async withGracefulDegradation<T>(
    operation: () => Promise<T>,
    fallback: T,
    errorMessage: string = 'Database operation failed'
  ): Promise<T> {
    try {
      const isHealthy = await this.healthCheck()
      
      if (!isHealthy) {
        logger.warn('Database unhealthy, using fallback', { errorMessage })
        return fallback
      }

      return await this.withRetry(operation)
    } catch (error) {
      logger.error(errorMessage, error as Error)
      return fallback
    }
  }
}

export const databaseManager = SupabaseManager.getInstance()