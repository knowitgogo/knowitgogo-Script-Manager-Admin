import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';

axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function RegisterForm({ onSwitchView, apiPath = '/admin/register', btnLabel = 'Register Admin', successMsgText = 'Admin account created successfully! Please log in.', alreadyAccLabel = 'Already have an account? Login' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      await axios.get(`${API_URL}/sanctum/csrf-cookie`).catch(() => {});
      
      const response = await axios.post(`${API_URL}${apiPath}`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      setSuccessMsg(successMsgText);
      
      setTimeout(() => {
         onSwitchView('login');
      }, 2000);
      
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const backendErrors = err.response.data.errors;
        const newErrors = {};
        for (const key in backendErrors) {
          newErrors[key] = backendErrors[key][0];
        }
        setErrors(newErrors);
      } else if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('An unexpected error occurred. Please try connecting to the server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {serverError && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{serverError}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <div className="input-wrapper">
            <User className="input-icon" size={18} />
            <input
              type="text"
              id="name"
              name="name"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              autoFocus
            />
          </div>
          {errors.name && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{errors.name}</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              type="email"
              id="email"
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className={`form-control has-right-icon ${errors.password ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div 
              className="toggle-password-icon" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </div>
          </div>
          {errors.password && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{errors.password}</span>
            </div>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: "0.5rem" }}>
          <label htmlFor="password_confirmation">Confirm Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              id="password_confirmation"
              name="password_confirmation"
              className={`form-control has-right-icon ${errors.password_confirmation ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              value={formData.password_confirmation}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div 
              className="toggle-password-icon" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </div>
          </div>
          {errors.password_confirmation && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{errors.password_confirmation}</span>
            </div>
          )}
        </div>


        <button type="submit" className="submit-btn" disabled={isLoading} style={{ marginTop: '1.5rem' }}>
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <span>Register</span>
          )}
        </button>
      </form>

      <div className="footer-link">
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchView('login'); }}>
          {alreadyAccLabel}
        </a>
      </div>
    </>
  );
}

export default RegisterForm;
