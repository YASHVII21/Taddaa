import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isRegistering) {
      if (!name.trim()) {
        setError('Please enter your name.');
        return;
      }
      if (password !== repeatPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!agreeTerms) {
        setError('You must agree to the Terms and Services.');
        return;
      }
    }

    setLoading(true);
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegistering 
      ? { name: name.trim(), email: email.trim(), password }
      : { email: email.trim(), password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMessage = 'Authentication failed.';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          if (response.status === 504 || response.status === 502 || response.status === 404) {
            errorMessage = 'Cannot connect to the backend server. Please make sure the API server is running (try running "npm run dev:all").';
          } else {
            errorMessage = `Server error: ${response.statusText || response.status}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      onLoginSuccess(data);
    } catch (err) {
      let msg = err.message;
      if (msg === 'Failed to fetch' || msg.includes('Unexpected end of JSON') || msg.includes('Unexpected token')) {
        msg = 'Cannot connect to the backend server. Please make sure the API server is running (try running "npm run dev:all").';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper wifi-theme">
      {/* Soft blurry circular gradients in the background */}
      <div className="bg-blur-circle bg-blur-1"></div>
      <div className="bg-blur-circle bg-blur-2"></div>
      
      <div className="login-card-container wifi-card">
        
        {/* Left Side: White Wave with Seal and Christmas tree vector illustration */}
        <div className="login-illustration-side wifi-left">
          
          {/* Logo Header */}
          <div className="wifi-logo-header">
            <span className="logo-icon" style={{ fontSize: '24px' }}>🌿</span>
            <div className="logo-text">
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: '700', color: '#1e6b54', margin: 0, letterSpacing: '-0.3px' }}>Taddaa</h2>
              <p style={{ fontSize: '10px', color: '#64748b', margin: 0, fontWeight: '500', letterSpacing: '0.2px' }}>The To-do App</p>
            </div>
          </div>

          {/* Central Art (Holiday theme: Christmas tree, snowmen, reindeer, gift box) */}
          <div className="holiday-art-container">
            <svg viewBox="0 0 300 280" className="holiday-svg" xmlns="http://www.w3.org/2000/svg">
              {/* Organic background shadow blob */}
              <path d="M 60 140 C 60 70, 240 70, 240 140 C 240 210, 60 210, 60 140 Z" fill="#d8ede2" opacity="0.45" />
              
              {/* Snow floor */}
              <ellipse cx="150" cy="220" rx="90" ry="25" fill="#e9f5ef" />
              
              {/* Christmas Tree layers */}
              {/* Trunk */}
              <rect x="145" y="195" width="10" height="25" fill="#583110" />
              
              {/* Green foliage layers */}
              <polygon points="150,85 115,145 185,145" fill="#22573e" />
              <polygon points="150,115 105,180 195,180" fill="#1b4530" />
              <polygon points="150,145 90,210 210,210" fill="#0f3020" />
              
              {/* Red ornaments */}
              <circle cx="150" cy="110" r="4.5" fill="#e63946" />
              <circle cx="135" cy="140" r="4" fill="#e63946" />
              <circle cx="165" cy="140" r="4" fill="#e63946" />
              <circle cx="125" cy="170" r="4" fill="#e63946" />
              <circle cx="175" cy="170" r="4" fill="#e63946" />
              <circle cx="150" cy="165" r="4" fill="#e63946" />
              <circle cx="110" cy="200" r="4" fill="#e63946" />
              <circle cx="190" cy="200" r="4" fill="#e63946" />
              <circle cx="140" cy="198" r="4" fill="#e63946" />
              <circle cx="165" cy="198" r="4" fill="#e63946" />
              
              {/* Yellow Star at top */}
              <polygon points="150,70 153,78 162,78 155,83 158,91 150,86 142,91 145,83 138,78 147,78" fill="#ffb703" />

              {/* Reindeer on left */}
              <g fill="#0e2319" transform="translate(62, 195) scale(0.12)">
                <ellipse cx="60" cy="50" rx="30" ry="16" />
                <rect x="40" y="50" width="5" height="35" rx="2" />
                <rect x="50" y="50" width="5" height="35" rx="2" />
                <rect x="70" y="50" width="5" height="35" rx="2" />
                <rect x="80" y="50" width="5" height="35" rx="2" />
                <path d="M30 45 L15 15 L25 5 L35 32 Z" />
                <path d="M15 15 L5 2 L2 5 L12 15 Z" />
              </g>

              {/* Child reaching up on the left */}
              <g fill="#0e2319" transform="translate(100, 185) scale(0.12)">
                {/* Head */}
                <circle cx="50" cy="25" r="10" />
                {/* Body */}
                <path d="M42 35 H58 L54 85 H46 Z" />
                {/* Arm reaching up */}
                <path d="M56 38 L75 5 Q78 2 75 0 C70 0 68 8 56 35 Z" />
              </g>

              {/* Snowman on the right */}
              <g transform="translate(195, 175) scale(0.65)">
                {/* Bottom ball */}
                <circle cx="30" cy="50" r="18" fill="#e9f5ef" stroke="#cbe3d6" strokeWidth="1" />
                {/* Top ball */}
                <circle cx="30" cy="24" r="12" fill="#e9f5ef" stroke="#cbe3d6" strokeWidth="1" />
                {/* Face details */}
                <circle cx="26" cy="22" r="1.5" fill="#000" />
                <circle cx="34" cy="22" r="1.5" fill="#000" />
                <polygon points="30,24 38,26 30,28" fill="#fca34d" />
                {/* Scarf */}
                <path d="M19 32 Q30 35 41 32" stroke="#e63946" strokeWidth="4" strokeLinecap="round" fill="none" />
              </g>

              {/* Gift box opening with rising star */}
              <g transform="translate(200, 105) scale(0.38)">
                {/* Star rising */}
                <polygon points="50,15 53,25 64,25 55,30 59,40 50,34 41,40 45,30 36,25 47,25" fill="#ffd166" className="pulsing" />
                {/* Box base */}
                <rect x="30" y="55" width="40" height="30" rx="2" fill="#1b4d3e" />
                <rect x="47" y="55" width="6" height="30" fill="#e63946" />
                {/* Lid askew */}
                <rect x="25" y="47" width="50" height="8" rx="1" fill="#e63946" transform="rotate(-15, 50, 50)" />
              </g>
            </svg>
          </div>

          {/* Copyright Meta Footer */}
          <div className="wifi-footer-copyright">
            <p>© 2026 Taddaa - The To-do App</p>
            <p>Powered by Taddaa Core</p>
          </div>

        </div>

        {/* Right Side: Dark Green Login Form */}
        <div className="login-form-side wifi-right">
          <div className="form-inner-container wifi-form-inner">
            
            <h2 className="wifi-form-title">{isRegistering ? 'Register' : 'Login'}</h2>

            {error && <div className="form-error-banner fade-in">⚠️ {error}</div>}

            <form onSubmit={handleSubmit} className="wifi-form-fields">
              {isRegistering && (
                <div className="wifi-input-group fade-in">
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="wifi-input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="wifi-input-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {isRegistering && (
                <div className="wifi-input-group fade-in">
                  <label>Repeat Password</label>
                  <input
                    type="password"
                    placeholder="Repeat your password"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              {isRegistering ? (
                <div className="terms-checkbox-row wifi-checkbox-row fade-in">
                  <label className="checkbox-container-custom">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span className="checkmark-custom"></span>
                    <span className="terms-text" style={{ color: '#a3b19b' }}>
                      I agree to the <a href="#terms" style={{ color: '#5A8F95' }}>Terms and Services</a>
                    </span>
                  </label>
                </div>
              ) : (
                <div className="forgot-password-link wifi-forgot-link">
                  <a href="#forgot">Forgot Password?</a>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-wifi-submit">
                {loading ? 'Connecting...' : (isRegistering ? 'Register Now' : 'Sign In')}
              </button>
            </form>
            
            <div className="wifi-register-prompt">
              {isRegistering ? (
                <p>Already have an account? <span onClick={() => { setIsRegistering(false); setError(''); }} className="auth-toggle-link">Login Now</span></p>
              ) : (
                <p>Don't have an account? <span onClick={() => { setIsRegistering(true); setError(''); }} className="auth-toggle-link">Register Now</span></p>
              )}
            </div>

            <div className="wifi-footer-links">
              <a href="#terms" className="wifi-footer-link">Terms and Services</a>
              <p className="wifi-contact-info">Have a problem? Contact us at <a href="mailto:support@taddaa.com">support@taddaa.com</a></p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
