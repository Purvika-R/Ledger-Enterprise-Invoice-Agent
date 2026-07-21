import api from "./api";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
};

type AuthResponse = {
  access_token: string;
  user: AuthUser;
};

export async function login(email: string, password: string) {
  const response = await api.post<AuthResponse>("/auth/login", { email, password });
  return response.data;
}

export async function register(name: string, email: string, password: string) {
  const response = await api.post<AuthResponse>("/auth/register", { name, email, password });
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get<AuthUser>("/me");
  return response.data;
}
