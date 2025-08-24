/**
 * Environment configuration with validation and type safety
 */

interface EnvironmentConfig {
  apiBaseUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  nodeEnv: 'development' | 'production' | 'test';
  useMockData: boolean;
  enableDebugMode: boolean;
}

/**
 * Validates and returns environment variables with proper types
 */
function getEnvironmentConfig(): EnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV as 'development' | 'production' | 'test';
  
  if (!nodeEnv) {
    throw new Error('NODE_ENV is not defined');
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Parse mock data flag first
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || 
                      (nodeEnv === 'development' && !apiBaseUrl);
  
  // Only require API_URL in production if not using mock data
  if (!apiBaseUrl && nodeEnv === 'production' && !useMockData) {
    throw new Error('NEXT_PUBLIC_API_URL is required in production environment when not using mock data');
  }
  
  // Parse debug mode flag
  const enableDebugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true' || 
                          nodeEnv === 'development';

  return {
    apiBaseUrl: apiBaseUrl || 'http://localhost:8000/api/v1',
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
    nodeEnv,
    useMockData,
    enableDebugMode,
  };
}

export const env = getEnvironmentConfig();

/**
 * Type-safe environment variable getter
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not defined and no default value provided`);
  }
  
  return value || defaultValue!;
}

/**
 * Check if running in browser environment
 */
export const isBrowser = typeof window !== 'undefined';