import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Shield, ArrowRight, CheckCircle, Eye, EyeOff, AlertCircle, KeyRound } from 'lucide-react';
import ThemeSelector from '../components/ThemeSelector';
import { useAuth } from '../context/authContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { sendOTP } = useAuth();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  const [otpVerified, setOtpVerified] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your campus email address.');
      return;
    }
    setOtpSending(true);
    try {
      if (sendOTP) await sendOTP(email);
    } catch (err) {
      console.log('OTP notice:', err);
    } finally {
      setOtpSending(false);
      setOtpSent(true);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) {
      setError('Please enter the OTP code.');
      return;
    }

    setOtpVerifying(true);
    if (otp.strip ? otp.strip() === '1234' : otp.trim() === '1234') {
      setTimeout(() => {
        setOtpVerifying(false);
        setOtpVerified(true);
      }, 400);
    } else {
      try {
        await axios.post('/api/auth/verify-otp', { Email: email, Code: otp });
        setOtpVerified(true);
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid OTP code. Please use code 1234.');
      } finally {
        setOtpVerifying(false);
      }
    }
  };

  // Step 3: Reset Password Submit
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-check your entries.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('/api/auth/reset-password', {
        Email: email,
        NewPassword: newPassword
      });

      setSuccessMsg(res.data.message || 'Password reset successfully! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'Error resetting password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="glass-panel floating-card" style={{
        maxWidth: '960px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}>
        
        {/* Left Side: Brand Overview & Info */}
        <div style={{
          padding: '3rem 2.5rem',
          background: 'linear-gradient(135deg, var(--gradient-1), var(--gradient-2))',
          borderRight: '1px solid var(--glass-border)',
          textAlign: 'left',
          position: 'relative'
        }}>
          {/* Upper Left Theme Selector */}
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
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

          <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--accent-cyan)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Account Recovery
          </p>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Forgot your password? Enter your verified campus email below, verify with your constant OTP (<strong>1234</strong>), and choose a new secure password.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <div style={{ color: 'var(--accent-success)' }}><CheckCircle size={18} /></div>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Step 1: Enter Campus Email & Request OTP</span>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <div style={{ color: 'var(--accent-success)' }}><CheckCircle size={18} /></div>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Step 2: Verify OTP Code (1234)</span>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <div style={{ color: 'var(--accent-success)' }}><CheckCircle size={18} /></div>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Step 3: Set New Password & Sign In</span>
            </div>
          </div>
        </div>

        {/* Right Side: Reset Password Interactive Workspace */}
        <div style={{ padding: '3rem 2.5rem', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.8rem' }}>
            Recover your access to FindIt+ in a few simple steps.
          </p>

          {error && (
            <div className="glass-panel" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: 'var(--accent-error)',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.2rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="glass-panel" style={{
              background: 'rgba(16, 185, 129, 0.15)',
              borderColor: 'rgba(16, 185, 129, 0.4)',
              color: 'var(--accent-success)',
              padding: '0.9rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.2rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600'
            }}>
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={!otpSent ? handleSendOTP : !otpVerified ? handleVerifyOTP : handleResetPassword}>
            
            {/* Field 1: Email Input & Send OTP */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Campus Email Address</label>
                {(otpSent || otpVerified) && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setOtpSent(false);
                      setOtpVerified(false);
                      setOtp('');
                      setError('');
                      setSuccessMsg('You can now enter a new email address.');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600' }}>
                    Edit / Change Email
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                    placeholder="student@campus.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (otpSent || otpVerified) {
                        setOtpSent(false);
                        setOtpVerified(false);
                        setOtp('');
                      }
                    }}
                    required
                    style={{ paddingLeft: '2.8rem' }}
                  />
                </div>
                {!otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={otpSending || !email}
                    className="btn btn-primary"
                    style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                  >
                    {otpSending ? 'Sending...' : 'Send OTP'}
                  </button>
                )}
              </div>
            </div>

            {/* Field 2: OTP Verification Box */}
            {otpSent && !otpVerified && (
              <div className="form-group fade-in-el" style={{
                background: 'rgba(59, 130, 246, 0.05)',
                padding: '1.2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--glass-border)',
                marginBottom: '1.5rem'
              }}>
                <label className="form-label" style={{ color: 'var(--primary)' }}>Verification OTP Code</label>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                  OTP dispatched to email. Default code is <strong style={{ color: 'var(--accent-warning)' }}>1234</strong>.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <KeyRound size={18} style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)'
                    }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter code 1234"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      style={{ paddingLeft: '2.8rem', letterSpacing: '2px', fontWeight: '700' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={otpVerifying || !otp}
                    className="btn btn-primary"
                    style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap', background: 'var(--accent-success)' }}
                  >
                    {otpVerifying ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </div>
            )}

            {/* Field 3: Verified Badge */}
            {otpVerified && (
              <div className="fade-in-el" style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--accent-success)',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                <CheckCircle size={16} />
                <span>Email Verified via OTP (1234)</span>
              </div>
            )}

            {/* Field 4: New Password & Confirm Password */}
            {otpVerified && (
              <div className="fade-in-el" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)'
                    }} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{ paddingLeft: '2.8rem', paddingRight: '2.8rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.8rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)'
                    }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ paddingLeft: '2.8rem', paddingRight: '2.8rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.8rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submit / Action Button */}
            {otpVerified && (
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary pulse-glow fade-in-el"
                style={{ width: '100%', marginTop: '1rem', padding: '0.9rem' }}
              >
                <span>{submitting ? 'Resetting Password...' : 'Reset Password & Sign In'}</span>
                <ArrowRight size={18} />
              </button>
            )}

            {/* Footer Back to Login Link */}
            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Remembered your password?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
