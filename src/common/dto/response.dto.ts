export class ApiResponse<T = any> {
  success: boolean;

  message: string;

  data?: T;

  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };

  timestamp: string;

  constructor(
    data?: T,
    message: string = 'Success',
    meta?: any,
  ) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
  }

  // Static helper methods for cleaner usage
  static success<T>(
    data?: T,
    message: string = 'Success',
    meta?: any,
  ): ApiResponse<T> {
    return new ApiResponse<T>(data, message, meta);
  }

  static paginated<T>(
    data: T[],
    meta: {
      page: number;
      limit: number;
      total: number;
    },
    message: string = 'Success',
  ): ApiResponse<T[]> {
    const totalPages = Math.ceil(meta.total / meta.limit);
    return new ApiResponse<T[]>(data, message, {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages,
      hasNext: meta.page < totalPages,
      hasPrevious: meta.page > 1,
    });
  }
}

// Error Response Wrapper (separate for clarity)
export class ApiErrorResponse {
  success: boolean;

  message: string;

  error?: string;

  errors?: any; // field validation errors

  timestamp: string;

  constructor(
    message: string = 'An error occurred',
    error?: string,
    errors?: any,
  ) {
    this.success = false;
    this.message = message;
    this.error = error;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }

  static error(
    message: string = 'An error occurred',
    error?: string,
    errors?: any,
  ): ApiErrorResponse {
    return new ApiErrorResponse(message, error, errors);
  }
}