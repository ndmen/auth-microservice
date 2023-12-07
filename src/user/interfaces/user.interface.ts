export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface ValidatePasswordResponse {
  isValid?: boolean;
}
