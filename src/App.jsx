import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import RegisterHeader from './components/RegisterHeader';
import RegisterForm from './components/RegisterForm';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/dashboard/Dashboard';

import UsersIndex from './components/admin/users/index';
import ManagersIndex from './components/admin/managers/index';
import ManagersDeleted from './components/admin/managers/deleted';
import TokensIndex from './components/admin/tokens/index';
import StatusView from './components/admin/status';
import RequestsView from './components/admin/requests';
import NotFound from './components/NotFound';
import ThemeToggle from './components/ThemeToggle';

// Manager Views
import ManagerLayout from './components/manager/ManagerLayout';
import ManagerDashboard from './components/manager/dashboard/Dashboard';
import ManagerUsersIndex from './components/manager/users/index';

// User Views
import UserLayout from './components/user/UserLayout';
import UserDashboard from './components/user/Dashboard';
import UserStatus from './components/user/Status';
import UserRequests from './components/user/Requests';
import UserTokens from './components/user/tokens/index';

import './App.css';

function AuthLayout({ children }) {
  return (
    <>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <ThemeToggle />
      </div>
      <div className="login-container">
        {children}
      </div>
    </>
  );
}

function LoginWrapper() {
  const navigate = useNavigate();
  return (
    <>
      <LoginHeader />
      <LoginForm 
        apiPath="/admin/login"
        checkAuthPath="/admin/dashboard"
        onSwitchView={(view) => {
          if (view === 'register') navigate('/admin/register');
          else if (view.startsWith('/')) navigate(view);
          else navigate('/admin/dashboard');
        }} 
      />
    </>
  );
}

function RegisterWrapper() {
  const navigate = useNavigate();
  return (
    <>
      <RegisterHeader />
      <RegisterForm onSwitchView={(view) => navigate(view === 'login' ? '/admin/login' : '/admin/login')} />
    </>
  );
}

function UserLoginWrapper() {
  const navigate = useNavigate();
  return (
    <>
      <LoginHeader title="User Portal" subtitle="Sign in to your user account." />
      <LoginForm 
        apiPath="/login" 
        checkAuthPath="/dashboard"
        btnLabel="Login to User Dashboard" 
        createAccLabel="Create a user account"
        onSwitchView={(view) => navigate(view === 'register' ? '/register' : '/user/dashboard')} 
      />
    </>
  );
}

function UserRegisterWrapper() {
  const navigate = useNavigate();
  return (
    <>
      <RegisterHeader title="Create User" subtitle="Register a new user account." />
      <RegisterForm 
        apiPath="/register"
        btnLabel="Register User"
        successMsgText="User account created successfully! Please log in."
        alreadyAccLabel="Already have a user account? Login"
        onSwitchView={(view) => navigate(view === 'login' ? '/login' : '/login')} 
      />
    </>
  );
}

function DashboardWrapper() {
  const navigate = useNavigate();
  return <Dashboard onSwitchView={() => navigate('/admin/login')} />;
}

function ManagerDashboardWrapper() {
  const navigate = useNavigate();
  return <ManagerDashboard onSwitchView={() => navigate('/admin/login')} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* User Auth Routes */}
        <Route path="/login" element={<AuthLayout><UserLoginWrapper /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><UserRegisterWrapper /></AuthLayout>} />

        {/* Admin Auth Routes */}
        <Route path="/admin/login" element={<AuthLayout><LoginWrapper /></AuthLayout>} />
        <Route path="/admin/register" element={<AuthLayout><RegisterWrapper /></AuthLayout>} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardWrapper />} />
          <Route path="users" element={<UsersIndex />} />
          <Route path="managers" element={<ManagersIndex />} />
          <Route path="managers/deleted" element={<ManagersDeleted />} />
          <Route path="tokens" element={<TokensIndex />} />
          <Route path="requests" element={<RequestsView />} />
          <Route path="status" element={<StatusView />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        
        {/* Manager Routes */}
        <Route path="/manager/*" element={<ManagerLayout />}>
          <Route index element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboardWrapper />} />
          <Route path="users" element={<ManagerUsersIndex />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        
        {/* User Routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="status" element={<UserStatus />} />
          <Route path="requests" element={<UserRequests />} />
          <Route path="tokens" element={<UserTokens />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
