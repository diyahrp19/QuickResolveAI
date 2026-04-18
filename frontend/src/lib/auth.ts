export const AUTH_TOKEN_KEY = "quickresolveai.auth.token";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}
