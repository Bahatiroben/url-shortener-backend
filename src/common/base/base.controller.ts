import { 
  BadRequestException, 
  NotFoundException, 
  UnauthorizedException 
} from '@nestjs/common';
import { ApiResponse, ApiErrorResponse } from '../dto/response.dto';

export abstract class BaseController {
  /**
   * Success response with data
   */
  protected success<T>(
    data: T,
    message: string = 'Success',
    meta?: any,
  ): ApiResponse<T> {
    return ApiResponse.success(data, message, meta);
  }

  /**
   * Paginated success response
   */
  protected paginated<T>(
    data: T[],
    meta: { page: number; limit: number; total: number },
    message: string = 'Success',
  ): ApiResponse<T[]> {
    return ApiResponse.paginated(data, meta, message);
  }

  /**
   * Created response (201)
   */
  protected created<T>(
    data: T,
    message: string = 'Resource created successfully',
  ): ApiResponse<T> {
    return ApiResponse.success(data, message);
  }

  /**
   * No content response (204)
   */
  protected noContent(): { success: boolean; message: string } {
    return {
      success: true,
      message: 'Operation completed successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Helper to handle common service exceptions and convert them to proper HTTP exceptions
   */
  protected handleError(error: any): never {
    if (error instanceof NotFoundException) {
      throw error;
    }
    if (error instanceof UnauthorizedException) {
      throw error;
    }
    if (error instanceof BadRequestException) {
      throw error;
    }

    // Default to BadRequest for validation or business errors
    if (error.message) {
      throw new BadRequestException(error.message);
    }

    throw new BadRequestException('An unexpected error occurred');
  }

  /**
   * Safe execution wrapper - catches errors and re-throws as NestJS exceptions
   */
  protected async execute<T>(
    operation: () => Promise<T> | T,
    successMessage?: string,
  ): Promise<ApiResponse<T>> {
    try {
      const result = await operation();
      return this.success(result, successMessage);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Common pattern for create operations
   */
  protected async createResponse<T>(
    createFn: () => Promise<T>,
    successMessage: string = 'Resource created successfully',
  ): Promise<ApiResponse<T>> {
    try {
      const result = await createFn();
      return this.created(result, successMessage);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Common pattern for update operations
   */
  protected async updateResponse<T>(
    updateFn: () => Promise<T>,
    successMessage: string = 'Resource updated successfully',
  ): Promise<ApiResponse<T>> {
    try {
      const result = await updateFn();
      return this.success(result, successMessage);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Common pattern for delete operations
   */
  protected async deleteResponse(
    deleteFn: () => Promise<void>,
    successMessage: string = 'Resource deleted successfully',
  ): Promise<{ success: boolean; message: string }> {
    try {
      await deleteFn();
      return this.noContent();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Common pattern for paginated list
   */
  protected async listResponse<T>(
    listFn: () => Promise<{ items: T[]; total: number }>,
    page: number = 1,
    limit: number = 20,
    successMessage: string = 'Success',
  ): Promise<ApiResponse<T[]>> {
    try {
      const { items, total } = await listFn();
      return this.paginated(items, { page, limit, total }, successMessage);
    } catch (error) {
      this.handleError(error);
    }
  }
}