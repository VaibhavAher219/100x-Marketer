// Form validation utilities
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateForm<T extends Record<string, unknown>>(
  data: T,
  rules: ValidationRules
): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const error = validateField(value, rule);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

export function validateField(value: unknown, rule: ValidationRule): string | null {
  // Required validation
  if (rule.required && (value === null || value === undefined || value === '')) {
    return 'This field is required';
  }

  // Skip other validations if value is empty and not required
  if (!rule.required && (value === null || value === undefined || value === '')) {
    return null;
  }

  // String validations
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return `Must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `Must be no more than ${rule.maxLength} characters`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return 'Invalid format';
    }
  }

  // Custom validation
  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
}

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    }
  },

  url: {
    pattern: /^https?:\/\/.+/,
    custom: (value: string) => {
      if (value && !/^https?:\/\/.+/.test(value)) {
        return 'Please enter a valid URL (starting with http:// or https://)';
      }
      return null;
    }
  },

  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (value && value.length < 8) {
        return 'Password must be at least 8 characters';
      }
      if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
      return null;
    }
  },

  confirmPassword: (originalPassword: string) => ({
    required: true,
    custom: (value: string) => {
      if (value !== originalPassword) {
        return 'Passwords do not match';
      }
      return null;
    }
  }),

  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    custom: (value: string) => {
      if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
        return 'Please enter a valid phone number';
      }
      return null;
    }
  },

  positiveNumber: {
    custom: (value: number) => {
      if (value !== null && value !== undefined && value < 0) {
        return 'Must be a positive number';
      }
      return null;
    }
  },

  salaryRange: (minSalary: number) => ({
    custom: (maxSalary: number) => {
      if (minSalary && maxSalary && minSalary >= maxSalary) {
        return 'Maximum salary must be greater than minimum salary';
      }
      return null;
    }
  })
};

// Validation hook for forms
export function useFormValidation<T extends Record<string, unknown>>(
  initialData: T,
  rules: ValidationRules
) {
  const [data, setData] = React.useState<T>(initialData);
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateFieldValue = (field: string, value: unknown) => {
    const rule = rules[field];
    if (!rule) return null;

    return validateField(value as string, rule);
  };

  const handleChange = (field: string, value: unknown) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const error = validateFieldValue(field, data[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validate = () => {
    const newErrors = validateForm(data, rules);
    setErrors(newErrors);
    setTouched(Object.keys(rules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setData(initialData);
    setErrors({});
    setTouched({});
  };

  return {
    data,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  };
}

// React import for the hook
import React from 'react';