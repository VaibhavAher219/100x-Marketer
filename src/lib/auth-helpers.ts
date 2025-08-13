import { AuthError } from '@supabase/supabase-js'

export function getAuthErrorMessage(error: AuthError): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password. Please try again.'
    case 'Email not confirmed':
      return 'Please check your email and click the confirmation link.'
    case 'User already registered':
      return 'An account with this email already exists. Try signing in instead.'
    case 'Password should be at least 6 characters':
      return 'Password must be at least 6 characters long.'
    case 'Signup requires a valid password':
      return 'Please enter a valid password.'
    case 'Invalid email':
      return 'Please enter a valid email address.'
    default:
      return error.message || 'An unexpected error occurred. Please try again.'
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}