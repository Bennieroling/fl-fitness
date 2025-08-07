export interface User {
  id: number;
  username: string;
  role: string;
  permissions: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (credentials: LoginCredentials) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}