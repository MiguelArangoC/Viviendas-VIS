import React, { useState } from 'react';
import { Battery, Zap, TrendingDown, Award, Users, Settings, CreditCard, BarChart3, Lightbulb, Home, User, LogOut } from 'lucide-react';

// Simulación de datos iniciales
const initialUsers = [
  { id: 1, name: 'María González', email: 'maria@email.com', balance: 45000, consumption: 150, plan: 'Básico', rewards: 320 }
];

const initialTariffs = [
  { id: 1, name: 'Básico', price: 500, kwh: 100, color: 'blue' },
  { id: 2, name: 'Familiar', price: 800, kwh: 200, color: 'green' },
  { id: 3, name: 'Premium', price: 1200, kwh: 350, color: 'purple' }
];

const consumptionData = [
  { day: 'Lun', kwh: 4.5 },
  { day: 'Mar', kwh: 5.2 },
  { day: 'Mié', kwh: 4.8 },
  { day: 'Jue', kwh: 6.1 },
  { day: 'Vie', kwh: 5.5 },
  { day: 'Sáb', kwh: 7.2 },
  { day: 'Dom', kwh: 6.8 }
];

const savingTips = [
  { title: 'Desconecta electrodomésticos', savings: '10-15%', icon: '🔌' },
  { title: 'Usa bombillas LED', savings: '75%', icon: '💡' },
  { title: 'Ajusta temperatura nevera', savings: '5-8%', icon: '❄️' },
  { title: 'Lava con agua fría', savings: '90%', icon: '🌊' }
];

const achievements = [
  { name: 'Ahorrista Novato', points: 100, unlocked: true },
  { name: 'Eco Guerrero', points: 250, unlocked: true },
  { name: 'Maestro del Ahorro', points: 500, unlocked: false }
];

interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
  consumption: number;
  plan: string;
  rewards: number;
}

interface ConsumptionAnalysis {
  alert: boolean;
  message: string;
  recommendations: string[];
  potentialSavings: number;
}

interface ConsumptionData {
  day: string;
  kwh: number;
}

export default function EnergiaPlatform() {
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState(initialUsers);
  const [tariffs] = useState(initialTariffs);
  const [showLogin, setShowLogin] = useState(true);

  // Sistema de recomendaciones basado en consumo
  const analyzeConsumption = (consumption: number): ConsumptionAnalysis => {
    const avgConsumption: number = consumptionData.reduce((a: number, b: ConsumptionData) => a + b.kwh, 0) / consumptionData.length;
    const trend: 'alto' | 'normal' = consumption > avgConsumption ? 'alto' : 'normal';
    
    if (trend === 'alto') {
      return {
        alert: true,
        message: 'Tu consumo está por encima del promedio',
        recommendations: [
          'Revisa electrodomésticos en modo standby',
          'Programa lavadora en horarios valle',
          'Verifica aislamiento térmico'
        ],
        potentialSavings: Math.round(consumption * 0.15)
      };
    }
    
    return {
      alert: false,
      message: '¡Excelente! Mantienes un consumo eficiente',
      recommendations: ['Continúa con tus buenos hábitos'],
      potentialSavings: 0
    };
  };

  const handleLogin = (type: 'user' | 'admin'): void => {
    setUserType(type);
    if (type === 'user') {
      setCurrentUser(users[0]);
    }
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUserType(null);
    setCurrentUser(null);
    setShowLogin(true);
  };

  const addRecharge = (amount: number) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, balance: currentUser.balance + amount };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    }
  };

  const getTariffColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      purple: 'bg-purple-50 border-purple-200'
    };
    return colorMap[color] || 'bg-gray-50 border-gray-200';
  };

  const getTariffTextColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600'
    };
    return colorMap[color] || 'text-gray-600';
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">EnergíaVIS</h1>
            <p className="text-gray-600">Gestión inteligente de energía para tu hogar</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => handleLogin('user')}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <User size={20} />
              Ingresar como Usuario
            </button>
            
            <button
              onClick={() => handleLogin('admin')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Settings size={20} />
              Ingresar como Administrador
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">¿No tienes cuenta?</p>
            <button className="text-blue-600 font-semibold hover:underline">
              Regístrate aquí
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Panel de Usuario
  if (userType === 'user' && currentUser) {
    const analysis = analyzeConsumption(currentUser.consumption);
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap size={28} />
              <h1 className="text-2xl font-bold">EnergíaVIS</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:inline">{currentUser.name}</span>
              <button onClick={handleLogout} className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition">
                <LogOut size={18} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Saldo y Consumo */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 font-semibold">Saldo Disponible</h3>
                    <Battery className="text-green-500" size={24} />
                  </div>
                  <p className="text-3xl font-bold text-gray-800">${currentUser.balance.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-2">Plan {currentUser.plan}</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 font-semibold">Consumo Mensual</h3>
                    <Zap className="text-blue-500" size={24} />
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{currentUser.consumption} kWh</p>
                  <p className="text-sm text-gray-500 mt-2">Últimos 30 días</p>
                </div>
              </div>

              {/* Análisis de Consumo */}
              <div className={`rounded-xl shadow-md p-6 ${analysis.alert ? 'bg-orange-50 border-l-4 border-orange-500' : 'bg-green-50 border-l-4 border-green-500'}`}>
                <div className="flex items-start gap-3 mb-4">
                  <TrendingDown className={analysis.alert ? 'text-orange-500' : 'text-green-500'} size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{analysis.message}</h3>
                    {analysis.potentialSavings > 0 && (
                      <p className="text-sm text-gray-700 mb-3">
                        Puedes ahorrar hasta <strong>{analysis.potentialSavings} kWh</strong> este mes
                      </p>
                    )}
                    <ul className="space-y-1">
                      {analysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                          <span className="text-green-600">✓</span> {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Gráfico de Consumo Semanal */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 size={20} />
                  Consumo Semanal
                </h3>
                <div className="flex items-end justify-between h-48 gap-2">
                  {consumptionData.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg relative" 
                           style={{ height: `${(day.kwh / 8) * 100}%` }}>
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700">
                          {day.kwh}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{day.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recargas */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard size={20} />
                  Recargas Rápidas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[10000, 20000, 50000, 100000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => addRecharge(amount)}
                      className="bg-gradient-to-br from-green-400 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-green-500 hover:to-green-600 transition transform hover:scale-105"
                    >
                      ${(amount / 1000)}K
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel Educativo y Recompensas */}
            <div className="space-y-6">
              {/* Recompensas */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Award size={20} />
                    Mis Recompensas
                  </h3>
                </div>
                <p className="text-4xl font-bold mb-2">{currentUser.rewards}</p>
                <p className="text-sm opacity-90">puntos acumulados</p>
                <div className="mt-4 space-y-2">
                  {achievements.map((ach, idx) => (
                    <div key={idx} className={`flex items-center gap-2 text-sm ${ach.unlocked ? 'opacity-100' : 'opacity-50'}`}>
                      <span>{ach.unlocked ? '🏆' : '🔒'}</span>
                      <span>{ach.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips de Ahorro */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Lightbulb size={20} className="text-yellow-500" />
                  Tips de Ahorro
                </h3>
                <div className="space-y-3">
                  {savingTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <span className="text-2xl">{tip.icon}</span>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{tip.title}</p>
                        <p className="text-xs text-green-600">Ahorra hasta {tip.savings}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Panel de Administrador
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings size={28} />
            <h1 className="text-2xl font-bold">Panel Administrativo</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition">
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Estadísticas Globales */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Usuarios Activos</h3>
              <Users className="text-blue-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800">{users.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Consumo Total</h3>
              <Zap className="text-green-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {users.reduce((acc, u) => acc + u.consumption, 0)} kWh
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Ingresos</h3>
              <CreditCard className="text-purple-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              ${users.reduce((acc, u) => acc + u.balance, 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Planes Activos</h3>
              <Home className="text-orange-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800">{tariffs.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Gestión de Usuarios */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4 text-xl">Gestión de Usuarios</h3>
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">Plan: {user.plan} | Consumo: {user.consumption} kWh</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${user.balance.toLocaleString()}</p>
                    <button className="text-xs text-blue-600 hover:underline">Ver detalles</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gestión de Tarifas */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4 text-xl">Planes y Tarifas</h3>
            <div className="space-y-3">
              {tariffs.map(tariff => (
                <div key={tariff.id} className={`p-4 ${getTariffColorClasses(tariff.color)} border rounded-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-800">{tariff.name}</h4>
                    <span className={`${getTariffTextColor(tariff.color)} font-bold`}>${tariff.price}</span>
                  </div>
                  <p className="text-sm text-gray-600">Incluye {tariff.kwh} kWh mensuales</p>
                  <button className="mt-2 text-xs text-blue-600 hover:underline">Editar tarifa</button>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition">
              + Agregar Nueva Tarifa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}