// ============================================
// API SERVICE - Conexión Frontend con Backend
// ============================================

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper para obtener el token
const getToken = () => {
  return localStorage.getItem('energia_vis_token');
};

// Helper para configurar headers
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Helper para manejar respuestas
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('energia_vis_token');
      window.location.href = '/login';
    }
    throw new Error(data.error || 'Error en la petición');
  }
  
  return data;
};

// ============================================
// AUTENTICACIÓN
// ============================================

export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(userData)
    });
    
    const data = await handleResponse(response);
    
    if (data.token) {
      localStorage.setItem('energia_vis_token', data.token);
    }
    
    return data;
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(credentials)
    });
    
    const data = await handleResponse(response);
    
    if (data.token) {
      localStorage.setItem('energia_vis_token', data.token);
    }
    
    return data;
  },

  logout: () => {
    localStorage.removeItem('energia_vis_token');
    window.location.href = '/login';
  }
};

// ============================================
// USUARIO
// ============================================

export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: getHeaders()
    });
    
    return handleResponse(response);
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    
    return handleResponse(response);
  },

  getConsumption: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/user/consumption?${queryString}`, {
      headers: getHeaders()
    });
    
    return handleResponse(response);
  }
};

// ============================================
// TRANSACCIONES
// ============================================

export const transactionAPI = {
  recharge: async (amount, paymentMethod = 'online') => {
    const response = await fetch(`${API_URL}/transactions/recharge`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, paymentMethod })
    });
    
    return handleResponse(response);
  },

  getHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/transactions?${queryString}`, {
      headers: getHeaders()
    });
    
    return handleResponse(response);
  }
};

// ============================================
// TARIFAS
// ============================================

export const tariffAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/tariffs`, {
      headers: getHeaders(false)
    });
    
    return handleResponse(response);
  },

  subscribe: async (tariffId) => {
    const response = await fetch(`${API_URL}/tariffs/subscribe`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ tariffId })
    });
    
    return handleResponse(response);
  }
};

// ============================================
// RECOMENDACIONES
// ============================================

export const recommendationAPI = {
  getCurrent: async () => {
    const response = await fetch(`${API_URL}/recommendations`, {
      headers: getHeaders()
    });
    
    return handleResponse(response);
  },

  getHistory: async () => {
    const response = await fetch(`${API_URL}/recommendations/history`, {
      headers: getHeaders()
    });
    
    return handleResponse(response);
  },

  markAsRead: async (id) => {
    const response = await fetch(`${API_URL}/recommendations/${id}/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
    
    return handleResponse(response);
  }
};

// ============================================
// MEDIDOR (Para simulación o integración real)
// ============================================

export const meterAPI = {
  submitReading: async (readingData) => {
    const response = await fetch(`${API_URL}/meter/reading`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(readingData)
    });
    
    return handleResponse(response);
  }
};

// ============================================
// ADMINISTRACIÓN
// ============================================

export const adminAPI = {
  getUsers: async () => {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: getHeaders()
    });
    
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: getHeaders()
    });
    
    return handleResponse(response);
  },

  createTariff: async (tariffData) => {
    const response = await fetch(`${API_URL}/admin/tariffs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(tariffData)
    });
    
    return handleResponse(response);
  }
};

// ============================================
// HOOKS PERSONALIZADOS (para React)
// ============================================

// Hook para autenticación
export const useAuth = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const userData = await userAPI.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Error cargando usuario:', error);
          localStorage.removeItem('energia_vis_token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  return { user, loading, isAuthenticated: !!user };
};

// Hook para consumo
export const useConsumption = (period = 'week') => {
  const [consumption, setConsumption] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadConsumption = async () => {
      try {
        const data = await userAPI.getConsumption({ period });
        setConsumption(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadConsumption();
  }, [period]);

  return { consumption, loading, error };
};

// Hook para recomendaciones
export const useRecommendations = () => {
  const [recommendations, setRecommendations] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const loadRecommendations = async () => {
    try {
      const data = await recommendationAPI.getCurrent();
      setRecommendations(data);
    } catch (error) {
      console.error('Error cargando recomendaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadRecommendations();
  }, []);

  return { recommendations, loading, refresh: loadRecommendations };
};

// ============================================
// EJEMPLO DE USO EN COMPONENTES REACT
// ============================================

/*
import { authAPI, userAPI, transactionAPI, useAuth } from './apiService';

// En un componente de Login
const LoginComponent = () => {
  const handleLogin = async (email, password) => {
    try {
      const result = await authAPI.login({ email, password });
      console.log('Login exitoso:', result.user);
      // Redirigir al dashboard
    } catch (error) {
      console.error('Error en login:', error.message);
      // Mostrar mensaje de error
    }
  };
};

// En un componente de Dashboard
const Dashboard = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const { consumption } = useConsumption('week');
  const { recommendations } = useRecommendations();

  const handleRecharge = async (amount) => {
    try {
      const result = await transactionAPI.recharge(amount);
      console.log('Recarga exitosa:', result);
      // Actualizar UI
    } catch (error) {
      console.error('Error en recarga:', error.message);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!isAuthenticated) return <Redirect to="/login" />;

  return (
    <div>
      <h1>Bienvenido, {user.name}</h1>
      <p>Saldo: ${user.balance}</p>
      {recommendations && (
        <div>
          {recommendations.recommendations.map(rec => (
            <Alert key={rec.title}>{rec.message}</Alert>
          ))}
        </div>
      )}
    </div>
  );
};
*/

export default {
  authAPI,
  userAPI,
  transactionAPI,
  tariffAPI,
  recommendationAPI,
  meterAPI,
  adminAPI
};