import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

function buildUserFromToken(token) {
  const decoded = jwtDecode(token);
  const rawRoles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles].filter(Boolean);

  return {
    id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
    email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
    roles,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        setUser(buildUserFromToken(token));
      } catch {
        localStorage.removeItem('accessToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);
    const { accessToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    const userData = buildUserFromToken(accessToken);
    setUser(userData);
    return userData;
  }, []);

  const socialLogin = useCallback(async (provider, idToken) => {
    const response = await authApi.socialLogin(provider, idToken);
    const { accessToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    const userData = buildUserFromToken(accessToken);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const response = await authApi.register(data);
    return response.data.data; // UserDto — no token, no auto-login (backend doesn't issue one on register)
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setUser(null);
  }, []);

  const hasRole = useCallback((roles) => {
    if (!user) return false;
    if (user.roles.includes('Administrator')) return true;
    return roles.some(role => user.roles.includes(role));
  }, [user]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    socialLogin,
    register,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};