export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AdminResponse {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface OAuthClientResponse {
  id: number;
  clientName: string;
  redirectUri: string;
  clientSecret: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminPayload {
  username: string;
  password: string;
}

export interface UpdateAdminPayload {
  username?: string;
  password?: string;
}

export interface CreateOAuthClientPayload {
  clientName: string;
  redirectUri: string;
}

export interface UpdateOAuthClientPayload {
  clientName?: string;
  redirectUri?: string;
}