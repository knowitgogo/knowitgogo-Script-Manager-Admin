import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

const API_URL = "http://localhost:8000";
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

function LoginForm({ onSwitchView, apiPath = '/admin/login', btnLabel = 'Login to Dashboard', createAccLabel = 'Create an admin account', checkAuthPath = null }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(!!checkAuthPath);

  useEffect(() => {
    if (checkAuthPath) {
      axios.get(`${API_URL}${checkAuthPath}`, { headers: { Accept: 'application/json' } })
        .then(() => {
          onSwitchView("dashboard");
        })
        .catch(() => {
          setIsCheckingAuth(false);
        });
    }
  }, [checkAuthPath, onSwitchView]);

  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");

    if (!validate()) return;

    setIsLoading(true);

    try {
      await axios.get(`${API_URL}/sanctum/csrf-cookie`).catch(() => {});

      const response = await axios.post(`${API_URL}${apiPath}`, formData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      setSuccessMsg("Login successful! Redirecting...");

      let redirectPath = "dashboard";
      if (response.data && response.data.redirect) {
        try {
          const url = new URL(response.data.redirect);
          redirectPath = url.pathname;
        } catch(e) {
          redirectPath = "dashboard";
        }
      }

      setTimeout(() => {
        onSwitchView(redirectPath);
      }, 1500);
    } catch (err) {
      if (err.response && err.response.status === 422 && err.response.data.errors) {
        const backendErrors = err.response.data.errors;
        const newErrors = {};
        for (const key in backendErrors) {
          newErrors[key] = backendErrors[key][0];
        }
        setErrors(newErrors);
      } else if (
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        setServerError(err.response.data.message);
      } else {
        setServerError(
          "An unexpected error occurred. Please try connecting to the server.",
        );
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
          <label htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              type="email"
              id="email"
              name="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
          </div>
          {errors.email && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: "0.5rem" }}>
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className={`form-control has-right-icon ${errors.password ? "is-invalid" : ""}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="current-password"
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

        <div className="remember-group" style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
          <div className="checkbox-wrapper-30" style={{ marginRight: "8px" }}>
            <span className="checkbox">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                disabled={isLoading}
              />
              <svg>
                <use xlinkHref="#checkbox-30" className="checkbox"></use>
              </svg>
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
              <symbol id="checkbox-30" viewBox="0 0 22 22">
                <path fill="none" stroke="currentColor" d="M5.5,11.3L9,14.8L20.2,3.3l0,0c-0.5-1-1.5-1.8-2.7-1.8h-13c-1.7,0-3,1.3-3,3v13c0,1.7,1.3,3,3,3h13 c1.7,0,3-1.3,3-3v-13c0-0.4-0.1-0.8-0.3-1.2"/>
              </symbol>
            </svg>
          </div>
          <span>Remember me</span>
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <span>Login</span>
          )}
        </button>
      </form>

      <div className="footer-link">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSwitchView("register");
          }}
        >
          {createAccLabel}
        </a>
      </div>
    </>
  );
}

export default LoginForm;
