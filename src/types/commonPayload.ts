export interface CommonResponse {
  message: string;
}

export type ErrorType = "SystemError" | "ApplicationError";

export interface ErrorResponse extends CommonResponse {
  type: ErrorType;
  src: string;
}

export interface CommonRequest {
  id: number;
}
