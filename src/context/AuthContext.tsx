import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (user: User) => void;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be within AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Try both keys for compatibility
    const storedToken = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    if (storedToken) setAccessToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
        const response = await fetch("http://localhost:8000/api/auth/login/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "kaushaljain7000@gmail.com", // exactly as in Postman
            password: "admin"
          }),
        });

      
      const data = await response.json();
      if (response.ok && data.access) {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("access_token", data.access); // Also set snake_case variant for cart compatibility
        localStorage.setItem("refreshToken", data.refresh);
        setAccessToken(data.access);

        // Optional: Get user profile
        const userResponse = await fetch("http://localhost:8000/api/auth/profile/", {
          headers: { Authorization: `Bearer ${data.access}` }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          setUser(null);
        }
        return true;
      }
    } catch (error) {}
    return false;
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    toast.success("Logout successful!");
  };

  const signup = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const isLoggedIn = !!accessToken && !!user;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, signup, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
