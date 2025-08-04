import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

// Auth Components
import Landing from './components/Auth/Landing';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';

// Layout Components
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';

// Main Components
import Dashboard from './components/Dashboard/Dashboard';
import PettyCash from './components/PettyCash/PettyCash';
import Expenses from './components/Expenses/Expenses';
import Income from './components/Income/Income';
import Budgets from './components/Budgets/Budgets';
import BalanceSheet from './components/Reports/BalanceSheet';
import ProfitLoss from './components/Reports/ProfitLoss';
import CashFlow from './components/Reports/CashFlow';
import Analytics from './components/Analytics/Analytics';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <Landing />} 
      />
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
      />
      <Route 
        path="/forgot-password" 
        element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} 
      />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/petty-cash"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PettyCash />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Expenses />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/income"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Income />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/budgets"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Budgets />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Analytics />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/balance-sheet"
        element={
          <ProtectedRoute>
            <MainLayout>
              <BalanceSheet />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profit-loss"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfitLoss />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/cash-flow"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CashFlow />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppRoutes />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;