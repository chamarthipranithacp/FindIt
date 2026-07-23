import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { User, Users, Mail, Lock, Shield, ArrowRight, Info, Eye, EyeOff } from 'lucide-react';
import ThemeSelector from '../components/ThemeSelector';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('Student/Faculty');
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!userId || !password) {
      setError('Please fill in both User ID and Password.');
      return;
    }
    setSubmitting(true);
    const result = await login(userId, password);
    setSubmitting(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleQuickFill = (roleUserId, rolePass, roleName, selectedRole) => {
    setName(roleName);
    setUserId(roleUserId);
    setPassword(rolePass);
    setRole(selectedRole);
    setError('');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      position: 'relative',
      zIndex: 1
    }} className="fade-in-el">
      <div className="glass-panel floating-card" style={{
        display: 'flex',
        maxWidth: '1000px',
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Left Side: Brand Showcase */}
        <div style={{
          flex: '1',
          background: 'linear-gradient(135deg, var(--gradient-1) 0%, var(--gradient-2) 100%)',
          padding: '2rem 2.2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderRight: '1px solid var(--glass-border)',
          textAlign: 'left',
          position: 'relative'
        }}>
          {/* Upper Left Theme Selector inside Card */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            zIndex: 10
          }}>
            <ThemeSelector />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              color: '#white',
              boxShadow: 'var(--shadow-primary)'
            }}>
              <Shield size={28} style={{ color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>
              FINDIT<span className="gradient-text">+</span>
            </h1>
          </div>
          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent-cyan)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            FIDES + INDAGARE
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            "Fides" (Latin: trust, faith) and "Indagare" (Latin: to search, to track down) — a trusted campus search that reunites lost belongings.
          </p>
        </div>

        {/* Right Side: Login Form */}
        <div style={{
          flex: '1',
          padding: '2.2rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'left'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Enter your User ID and Password to access FindIt+.
          </p>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.8rem 1rem',
              color: 'var(--accent-error)',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ position: 'relative', marginBottom: '1rem' }}>
              <label className="form-label">Role</label>
              <div style={{ position: 'relative' }}>
                <Users size={18} style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)'
                }} />
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ paddingLeft: '2.8rem' }}
                >
                  <option value="Student/Faculty">Student / Faculty</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ position: 'relative', marginBottom: '1rem' }}>
              <label className="form-label">User ID</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)'
                }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. STU101 or 21001A0501"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  style={{ paddingLeft: '2.8rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ position: 'relative', marginBottom: '1rem' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.8rem', paddingRight: '2.8rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary pulse-glow"
              style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '2rem',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            <Link 
              to="/forgot-password" 
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '600' }}
            >
              Forgot Password?
            </Link>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>New here? </span>
              <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
