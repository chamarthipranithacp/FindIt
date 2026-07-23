import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('findit_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('findit_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Set API base URL
  axios.defaults.baseURL = 'http://127.0.0.1:8000';

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token/fetch profile to verify it's still active
      axios.get('/api/auth/profile')
        .then(res => {
          if (res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('findit_user', JSON.stringify(res.data.user));
          }
        })
        .catch(err => {
          console.error("Token verification failed, logging out...", err);
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, [token]);

  const login = async (userId, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        UserId: userId,
        Password: password
      });
      const { token: receivedToken, user: receivedUser } = response.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('findit_token', receivedToken);
      localStorage.setItem('findit_user', JSON.stringify(receivedUser));
      return { success: true, user: receivedUser };
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Login failed. Please check your credentials.";
      return { success: false, error: errorMsg };
    }
  };

  const signup = async (name, userId, email, password, role) => {
    try {
      const response = await axios.post('/api/auth/register', {
        Name: name,
        UserId: userId,
        Email: email,
        Password: password,
        Role: role
      });
      return { success: true, message: response.data?.message || "User registered successfully!" };
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Registration failed. Please check your details.";
      return { success: false, error: errorMsg };
    }
  };

  const sendOTP = async (email) => {
    try {
      const response = await axios.post('/api/auth/send-otp', {
        Email: email
      });
      return { 
        success: true, 
        message: response.data.message, 
        dev_otp: response.data.dev_otp 
      };
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to send OTP code.";
      return { success: false, error: errorMsg };
    }
  };

  const verifyOTP = async (email, code) => {
    try {
      await axios.post('/api/auth/verify-otp', {
        Email: email,
        Code: code
      });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Invalid verification code.";
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('findit_token');
    localStorage.removeItem('findit_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    token,
    user,
    loading,
    login,
    signup,
    sendOTP,
    verifyOTP,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
