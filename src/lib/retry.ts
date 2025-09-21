/**
 * Retry utility for database operations and API calls
 * Implements exponential backoff with jitter for better performance
 */

interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  retryCondition?: (error: any) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  jitter: true,
  retryCondition: (error: any) => {
    // Retry on network errors, timeouts, and temporary server errors
    const retryableErrors = [
      'ECONNRESET',
      'ECONNREFUSED', 
      'ENOTFOUND',
      'ETIMEDOUT',
      'P1001', // Prisma: Can't reach database server
      'P1008', // Prisma: Operations timed out
      'P1017', // Prisma: Server has closed the connection
      'P2024', // Prisma: Timed out fetching a new connection from the connection pool
    ];
    
    // Check for HTTP 5xx status codes (server errors)
    if (error?.status >= 500 && error?.status < 600) {
      return true;
    }
    
    // Check for specific error codes
    if (error?.code && retryableErrors.includes(error.code)) {
      return true;
    }
    
    // Check for Prisma error codes
    if (error?.meta?.code && retryableErrors.includes(error.meta.code)) {
      return true;
    }
    
    // Check for connection-related error messages
    const errorMessage = error?.message?.toLowerCase() || '';
    const retryableMessages = [
      'connection',
      'timeout',
      'network',
      'econnreset',
      'econnrefused',
      'socket hang up',
    ];
    
    return retryableMessages.some(msg => errorMessage.includes(msg));
  }
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry if this is the last attempt
      if (attempt === opts.maxAttempts) {
        break;
      }
      
      // Don't retry if the error doesn't match retry conditions
      if (!opts.retryCondition(error)) {
        break;
      }
      
      // Calculate delay with exponential backoff and optional jitter
      let delay = Math.min(
        opts.baseDelayMs * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelayMs
      );
      
      if (opts.jitter) {
        // Add random jitter (±25% of delay)
        const jitterRange = delay * 0.25;
        delay += (Math.random() - 0.5) * 2 * jitterRange;
      }
      
      console.warn(`Retry attempt ${attempt}/${opts.maxAttempts} failed:`, {
        error: error?.message || error,
        nextRetryIn: `${Math.round(delay)}ms`,
      });
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we get here, all retries failed
  console.error(`All ${opts.maxAttempts} retry attempts failed:`, lastError);
  throw lastError;
}

/**
 * Specialized retry wrapper for Prisma database operations
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  return withRetry(operation, {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 5000,
    retryCondition: (error: any) => {
      // Prisma-specific retry logic
      const prismaRetryableCodes = [
        'P1001', // Can't reach database server
        'P1008', // Operations timed out  
        'P1017', // Server has closed the connection
        'P2024', // Timed out fetching a new connection from the connection pool
      ];
      
      return prismaRetryableCodes.includes(error?.code) ||
             error?.message?.includes('connection') ||
             error?.message?.includes('timeout');
    },
    ...options
  });
}

/**
 * Specialized retry wrapper for API fetch operations
 */
export async function withFetchRetry<T>(
  fetchOperation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  return withRetry(fetchOperation, {
    maxAttempts: 3,
    baseDelayMs: 800,
    maxDelayMs: 4000,
    retryCondition: (error: any) => {
      // Retry on network errors and 5xx server errors
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return true;
      }
      
      if (error?.status >= 500 && error?.status < 600) {
        return true;
      }
      
      // Don't retry on client errors (4xx) except for 408 (timeout) and 429 (rate limit)
      if (error?.status === 408 || error?.status === 429) {
        return true;
      }
      
      return false;
    },
    ...options
  });
}
