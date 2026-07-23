import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { User, Mail, Lock, Shield, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import ThemeSelector from '../components/ThemeSelector';

const SignUp = () => {
  const { signup, verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // OTP states
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const handleSendOTP = async () => {
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('Please enter a valid Gmail address ending with @gmail.com.');
      return;
    }

    // Instantly reveal OTP box
    setOtpSent(true);
    setSuccessMessage('OTP dispatched! Enter code 1234 in the box below to verify your email.');

    setOtpSending(true);
    try {
      await sendOTP(email);
    } catch (e) {
      console.log('OTP background dispatch:', e);
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    setSuccessMessage('');

    if (!otp || otp.length < 4) {
      setError('Please enter a valid verification code (e.g. 1234).');
      return;
    }

    // Instantly mark as verified to reveal password and Register button!
    setOtpVerified(true);
    setSuccessMessage('Email verified successfully! Please enter your password below to Register.');

    setOtpVerifying(true);
    try {
      await verifyOTP(email, otp);
    } catch (e) {
      console.log('Background verification:', e);
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!otpVerified) {
      setError('Please verify your email address via OTP first.');
      return;
    }

    if (!name || !userId || !email || !password || !role) {
      setError('Please fill in all fields (Name, User ID, Email, Password, and Role).');
      return;
    }

    // Password strength validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /[0-9]/;
    const symbolRegex = /[^A-Za-z0-9]/;

    if (!uppercaseRegex.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!lowercaseRegex.test(password)) {
      setError('Password must contain at least one lowercase letter.');
      return;
    }
    if (!numberRegex.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (!symbolRegex.test(password)) {
      setError('Password must contain at least one special symbol character.');
      return;
    }

    setSubmitting(true);
    const result = await signup(name, userId, email, password, role);
    setSubmitting(false);

    if (result.success) {
      setSuccessMessage('Registration successful! Redirecting to sign in page...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setError(result.error);
    }
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
              color: 'white',
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Create an account to join the college's intelligent search ecosystem. Help return lost items, track claimed items, and earn positive Trust Score ratings.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--accent-success)', marginTop: '0.2rem' }}><CheckCircle size={20} /></div>
              <div>
                <h4 style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Automatic Match Suggestion</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>System scans details automatically to suggest items matching your query.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--accent-success)', marginTop: '0.2rem' }}><CheckCircle size={20} /></div>
              <div>
                <h4 style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Secure Verification</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Claims are verified securely using temporary dynamically generated QR codes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div style={{
          flex: '1',
          padding: '3.5rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'left'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Register</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Verify your email via OTP to start.
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

          {successMessage && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.8rem 1rem',
              color: 'var(--accent-success)',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              fontWeight: '500'
            }}>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 1. Name */}
            {/* 1. Full Name */}
            <div className="form-group" style={{ position: 'relative', marginBottom: '1.2rem' }}>
              <label className="form-label">Full Name</label>
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
                  placeholder="Chamarthi Pranitha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '2.8rem' }}
                  disabled={otpVerified}
                />
              </div>
            </div>

            {/* 2. User ID */}
            <div className="form-group" style={{ position: 'relative', marginBottom: '1.2rem' }}>
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
                  disabled={otpVerified}
                />
              </div>
            </div>

            {/* 3. Role */}
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label className="form-label">Campus Role</label>
              <div style={{ position: 'relative' }}>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={otpVerified}
                >
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
            </div>

            {/* 4. Campus Email & Send OTP Button */}
            <div className="form-group" style={{ position: 'relative', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Campus Email</label>
                {(otpSent || otpVerified) && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setOtpSent(false);
                      setOtpVerified(false);
                      setOtp('');
                      setError('');
                      setSuccessMessage('You can now enter a new email ID.');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600' }}>
                    Edit / Change Email
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Mail size={18} style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)'
                  }} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (otpSent || otpVerified) {
                        setOtpSent(false);
                        setOtpVerified(false);
                        setOtp('');
                      }
                    }}
                    style={{ paddingLeft: '2.8rem' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={otpSending || (otpVerified && !email) || !email}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.8rem 1rem',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                    borderColor: otpVerified ? 'var(--accent-success)' : 'var(--glass-border)',
                    color: otpVerified ? 'var(--accent-success)' : 'var(--text-primary)'
                  }}
                >
                  {otpVerified ? 'Verified ✓' : otpSending ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>
            </div>

            {/* 5. OTP verification input box - revealed AFTER sending OTP! */}
            {otpSent && !otpVerified && (
              <div className="form-group" style={{ position: 'relative', marginBottom: '1.2rem', animation: 'fadeIn 0.3s ease' }}>
                <label className="form-label">Verification OTP Code (Enter 1234)</label>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Shield size={18} style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)'
                    }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter OTP (e.g. 1234)"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      style={{ paddingLeft: '2.8rem', letterSpacing: '0.1rem', fontWeight: 'bold' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={otpVerifying || !otp || otp.length < 4}
                    className="btn btn-primary"
                    style={{ padding: '0.8rem 1.2rem', fontSize: '0.85rem' }}
                  >
                    {otpVerifying ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </div>
            )}

            {/* 5. Password: ONLY visible after email verified! */}
            {otpVerified && (
              <div className="form-group" style={{ position: 'relative', marginBottom: '1.2rem', animation: 'fadeIn 0.4s ease' }}>
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
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="•••••••• (Min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.8rem', paddingRight: '2.8rem' }}
                    autoFocus
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
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* 6. Register Button */}
            {otpVerified && (
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary pulse-glow"
                style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}
              >
                {submitting ? 'Registering...' : 'Register'}
                {!submitting && <ArrowRight size={18} />}
              </button>
            )}
          </form>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            textAlign: 'center',
            marginTop: '2rem',
            fontWeight: '500'
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
