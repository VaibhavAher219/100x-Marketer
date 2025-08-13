import { config } from './config'

interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  timestamp: Date
  error?: Error
  metadata?: Record<string, unknown>
  userId?: string
  sessionId?: string
}

interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void
  info(message: string, meta?: Record<string, unknown>): void
  warn(message: string, meta?: Record<string, unknown>): void
  error(message: string, error?: Error, meta?: Record<string, unknown>): void
}

class ProductionLogger implements Logger {
  private isProduction: boolean
  private logLevel: string

  constructor() {
    this.isProduction = config.isProduction()
    this.logLevel = config.getConfig().app.logLevel
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }

  private createLogEntry(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    error?: Error,
    metadata?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      error,
      metadata,
      // Add user context if available
      userId: typeof window !== 'undefined' ? (window as unknown as { currentUserId?: string })?.currentUserId : undefined,
      sessionId: typeof window !== 'undefined' ? (window as unknown as { sessionId?: string })?.sessionId : undefined
    }
  }

  private logToConsole(entry: LogEntry): void {
    if (this.isProduction) return

    const { level, message, error, metadata } = entry
    const logMessage = `[${entry.timestamp.toISOString()}] ${level.toUpperCase()}: ${message}`

    switch (level) {
      case 'debug':
        console.debug(logMessage, metadata, error)
        break
      case 'info':
        console.info(logMessage, metadata)
        break
      case 'warn':
        console.warn(logMessage, metadata, error)
        break
      case 'error':
        console.error(logMessage, error, metadata)
        break
    }
  }

  private logToService(): void {
    if (!this.isProduction) return

    // In production, send to external logging service
    // This could be Sentry, LogRocket, DataDog, etc.
    try {
      // Example: Send to external service
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // })
    } catch {
      // Fallback to console in case of service failure
      // console.error('Failed to send log to service:', error)
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return
    
    const entry = this.createLogEntry('debug', message, undefined, meta)
    this.logToConsole(entry)
    this.logToService()
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return
    
    const entry = this.createLogEntry('info', message, undefined, meta)
    this.logToConsole(entry)
    this.logToService()
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return
    
    const entry = this.createLogEntry('warn', message, undefined, meta)
    this.logToConsole(entry)
    this.logToService()
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return
    
    const entry = this.createLogEntry('error', message, error, meta)
    this.logToConsole(entry)
    this.logToService()
  }
}

// Create singleton logger instance
export const logger = new ProductionLogger()

// Async operation wrapper with error handling
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  errorMessage: string,
  fallback?: T
): Promise<T | null> => {
  try {
    return await operation()
  } catch (error) {
    logger.error(errorMessage, error as Error)
    return fallback ?? null
  }
}

// Database operation wrapper with retry logic
export const withDatabaseRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      logger.warn(`Database operation failed, attempt ${attempt}/${maxRetries}`, { error: lastError.message })
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  logger.error('Database operation failed after all retries', lastError!)
  throw lastError!
}