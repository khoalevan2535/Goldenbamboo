export interface ErrorInfo {
  type: 'network' | 'timeout' | 'cancelled' | 'server' | 'auth' | 'unknown';
  message: string;
  userMessage: string;
  canRetry: boolean;
  suggestions: string[];
}

export const analyzeError = (error: any): ErrorInfo => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  // Request cancelled errors
  if (errorMessage.includes('Request cancelled') || 
      errorMessage.includes('AbortError') ||
      error?.name === 'AbortError') {
    return {
      type: 'cancelled',
      message: errorMessage,
      userMessage: 'Request was cancelled',
      canRetry: false,
      suggestions: [
        'This usually happens when navigating away from the page',
        'Try refreshing the page if needed'
      ]
    };
  }

  // Network connection errors
  if (errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('Network error') ||
      errorMessage.includes('Connection refused') ||
      errorMessage.includes('ERR_CONNECTION_REFUSED')) {
    return {
      type: 'network',
      message: errorMessage,
      userMessage: 'Cannot connect to server',
      canRetry: true,
      suggestions: [
        'Check if backend server is running',
        'Verify network connection',
        'Try: cd ../RESTAURANT && mvn spring-boot:run'
      ]
    };
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || 
      errorMessage.includes('Request timeout')) {
    return {
      type: 'timeout',
      message: errorMessage,
      userMessage: 'Server is taking too long to respond',
      canRetry: true,
      suggestions: [
        'Check server performance',
        'Verify network speed',
        'Try again in a few moments'
      ]
    };
  }

  // Authentication errors
  if (errorMessage.includes('401') || 
      errorMessage.includes('Unauthorized') ||
      errorMessage.includes('403') ||
      errorMessage.includes('Forbidden')) {
    return {
      type: 'auth',
      message: errorMessage,
      userMessage: 'Authentication required',
      canRetry: false,
      suggestions: [
        'Please log in again',
        'Check if your session has expired'
      ]
    };
  }

  // Server errors (HTML instead of JSON)
  if (errorMessage.includes('HTML instead of JSON') ||
      errorMessage.includes('<!doctype') ||
      errorMessage.includes('Unexpected token')) {
    return {
      type: 'server',
      message: errorMessage,
      userMessage: 'Server configuration issue',
      canRetry: true,
      suggestions: [
        'Backend may be returning error pages',
        'Check server logs for errors',
        'Verify API endpoints are correctly configured'
      ]
    };
  }

  // Default unknown error
  return {
    type: 'unknown',
    message: errorMessage,
    userMessage: 'An unexpected error occurred',
    canRetry: true,
    suggestions: [
      'Try refreshing the page',
      'Check browser console for more details',
      'Contact support if the problem persists'
    ]
  };
};

export const getErrorIcon = (errorType: ErrorInfo['type']): string => {
  switch (errorType) {
    case 'network': return '🔌';
    case 'timeout': return '⏰';
    case 'cancelled': return '🚫';
    case 'server': return '🔧';
    case 'auth': return '🔐';
    default: return '❌';
  }
};

export const shouldRetryError = (error: any, retryCount: number, maxRetries: number): boolean => {
  const errorInfo = analyzeError(error);
  
  // Don't retry if we've hit the limit
  if (retryCount >= maxRetries) return false;
  
  // Don't retry certain error types
  if (!errorInfo.canRetry) return false;
  
  return true;
};

export const getRetryDelay = (retryCount: number, baseDelay: number = 1000): number => {
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, retryCount);
  const jitter = Math.random() * 0.1 * exponentialDelay;
  return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
};

export const formatErrorForUser = (error: any): string => {
  const errorInfo = analyzeError(error);
  return `${getErrorIcon(errorInfo.type)} ${errorInfo.userMessage}`;
};

export const getErrorSuggestions = (error: any): string[] => {
  const errorInfo = analyzeError(error);
  return errorInfo.suggestions;
};
