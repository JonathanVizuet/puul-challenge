export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
  }
  
  export interface ApiError {
    success: boolean;
    statusCode: number;
    error: string;
    message: string[];
    path: string;
  }