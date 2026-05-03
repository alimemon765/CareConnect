import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('cc_token'));
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  const connectSocket = (userId) => {
    const s = io(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL.replace('/api', ''), {
      transports: ['websocket', 'polling'],
    });
    s.emit('user:join', userId);
    setSocket(s);
    return s;
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios
        .get(`${import.meta.env.VITE_API_URL}/auth/me`)
        .then((r) => {
          setUser(r.data);
          connectSocket(r.data._id);
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (tokenVal, userData) => {
    localStorage.setItem('cc_token', tokenVal);
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenVal}`;
    setToken(tokenVal);
    setUser(userData);
    connectSocket(userData.id);
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    delete axios.defaults.headers.common['Authorization'];
    socket?.disconnect();
    setSocket(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, socket }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
