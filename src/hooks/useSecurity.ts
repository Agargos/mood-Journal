import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Security-focused hook for input validation and sanitization
export const useSecureInput = () => {
  // Sanitize text input to prevent XSS and other attacks
  const sanitizeText = (text: string): string => {
    if (!text) return '';
    
    // Remove any script tags and potentially harmful content
    return text
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
      .substring(0, 10000); // Limit length
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  // Check for rate limiting on sensitive operations
  const checkRateLimit = async (action: string, maxRequests = 10): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        action_name: action,
        max_requests: maxRequests,
        window_minutes: 60
      });
      
      if (error) {
        console.error('Rate limit check failed:', error);
        return false; // Fail securely
      }
      
      return data;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return false; // Fail securely
    }
  };

  return {
    sanitizeText,
    validateEmail,
    validatePassword,
    checkRateLimit
  };
};

// Security monitoring hook
export const useSecurityMonitoring = () => {
  const { user } = useAuth();
  const [securityAlerts, setSecurityAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    // Monitor for suspicious activity patterns
    const monitorActivity = async () => {
      try {
        // Check for multiple failed login attempts (this would be in audit logs)
        // Check for unusual access patterns
        // For now, just basic monitoring
        console.log('Security monitoring active for user:', user.id);
      } catch (error) {
        console.error('Security monitoring error:', error);
      }
    };

    monitorActivity();
  }, [user]);

  const reportSecurityEvent = async (event: string, details?: any) => {
    try {
      console.warn('Security event:', event, details);
      // In a real app, this would send to a security monitoring service
      setSecurityAlerts(prev => [...prev, event]);
    } catch (error) {
      console.error('Failed to report security event:', error);
    }
  };

  return {
    securityAlerts,
    reportSecurityEvent
  };
};