import axios from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
  code?: number;
  detail?: {
    message?: string;
    code?: string;
  };
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as ApiErrorResponse;

    // Log full error details for debugging
    console.error('API Error Details:', {
      status,
      data,
      message: error.message,
      response: error.response?.data
    });

    switch (status) {
      case 401:
        return 'Authentication failed. Please check your API key.';
      case 403:
        return 'Access forbidden. Please check your account permissions.';
      case 429:
        return 'API rate limit exceeded. Please try again later.';
      case 500:
        // Check for different types of 500 errors
        if (data?.detail?.code === 'INSUFFICIENT_CREDITS') {
          return 'Credit limit exceeded. Please check your account balance.';
        }
        if (data?.detail?.message) {
          return `Server error: ${data.detail.message}`;
        }
        if (data?.message?.toLowerCase().includes('credit')) {
          return 'Credit limit exceeded. Please check your account balance.';
        }
        if (data?.message) {
          return `Server error: ${data.message}`;
        }
        return 'Server error. Please try again later or contact support.';
      default:
        return data?.message || error.message || 'An unexpected error occurred';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

export function isCreditsError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse;
    return Boolean(
      error.response?.status === 500 &&
      (data?.detail?.code === 'INSUFFICIENT_CREDITS' ||
       data?.message?.toLowerCase().includes('credit'))
    );
  }
  return false;
} 