export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

export interface AuthTokens {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface BulkActionRequest {
  ids: string[];
  action: "delete" | "publish" | "draft" | "archive" | "restore";
}

export interface UploadResponse {
  id: string;
  url: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  size: number;
}
