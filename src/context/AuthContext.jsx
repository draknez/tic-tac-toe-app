import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(true);

  const [socket, setSocket] = useState(null);

  const lastActivity = useRef(Date.now());



  const INACTIVITY_LOGOUT_MS = 15 * 60 * 1000; // 15 minutos

  const INACTIVITY_WARNING_MS = 10 * 60 * 1000; // 10 minutos



  // Detectamos la IP automáticamente para que funcione en red local

  const API_URL = `http://${window.location.hostname}:3000`;



  // Control de Inactividad

  useEffect(() => {

    if (!user) return;



    const updateActivity = () => {

      lastActivity.current = Date.now();

    };



    const checkInactivity = () => {

      const now = Date.now();

      const elapsed = now - lastActivity.current;



      if (elapsed >= INACTIVITY_LOGOUT_MS) {

        alert("Tu sesión ha expirado por inactividad.");

        logout();

      } else if (elapsed >= INACTIVITY_WARNING_MS) {

        console.warn("Aviso: Tu sesión se cerrará pronto por inactividad.");

      }

    };



    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    events.forEach(e => document.addEventListener(e, updateActivity));



    const interval = setInterval(checkInactivity, 30000); // Revisar cada 30 seg



    return () => {

      events.forEach(e => document.removeEventListener(e, updateActivity));

      clearInterval(interval);

    };

  }, [user]);



  // Inicializar Socket

  useEffect(() => {

    const newSocket = io(API_URL, {

      reconnectionAttempts: 5,

      reconnectionDelay: 1000,

    });



    

    setSocket(newSocket);



    const savedToken = localStorage.getItem('token');

    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {

      setUser(JSON.parse(savedUser));

      setToken(savedToken);

      newSocket.emit('authenticate', savedToken);

    }

    setLoading(false);



    return () => {

      newSocket.disconnect();

    };

  }, []);



  // Re-autenticar socket cuando el token cambie (login/logout)

  useEffect(() => {

    if (socket && token) {

      socket.emit('authenticate', token);

    }

  }, [token, socket]);



  const login = async (username, password) => {

    try {

      const res = await fetch(`${API_URL}/api/login`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ username, password })

      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);



      localStorage.setItem('token', data.token);

      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);

      setToken(data.token);

      return { success: true };

    } catch (error) {

      return { success: false, error: error.message };

    }

  };



  const register = async (username, password) => {

    try {

      const res = await fetch(`${API_URL}/api/register`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ username, password })

      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);



      localStorage.setItem('token', data.token);

      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);

      setToken(data.token);

      return { success: true };

    } catch (error) {

      return { success: false, error: error.message };

    }

  };



  const logout = async () => {

    if (user && user.username) {

      try {

        await fetch(`${API_URL}/api/logout`, {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ username: user.username })

        });

      } catch (error) {

        console.error("Error al notificar logout", error);

      }

    }

    localStorage.removeItem('token');

    localStorage.removeItem('user');

    setUser(null);

    setToken(null);

  };



  return (

    <AuthContext.Provider value={{ user, token, login, register, logout, loading, API_URL, socket }}>

      {!loading && children}

    </AuthContext.Provider>

  );

};
