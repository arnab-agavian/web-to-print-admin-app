import React, { useState } from 'react';
import { LockKeyhole } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@digitalheroes.co');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) return setError('Enter your email and password.');
    onLogin();
  };
  return (
    <main className="login-page">
      <section className="login-story"><div className="login-brand"><span>DH</span><b>DIGITAL HEROES<small>PRODUCTION STUDIO</small></b></div><div className="story-copy"><p>ADMIN OPERATIONS</p><h1>From first quote to final print.</h1><span>Manage artwork, approvals and production from one clear workspace.</span></div><div className="story-flow"><span>Quote</span><i /><span>Proof</span><i /><span>Production</span><i /><span>Complete</span></div></section>
      <section className="login-panel"><form onSubmit={submit}><div className="login-mark"><LockKeyhole /></div><p>ADMIN PORTAL</p><h2>Welcome back.</h2><span>Sign in to manage studio production.</span><label>Email address<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" /></label><label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" /></label>{error && <div className="form-error">{error}</div>}<button className="primary-button login-button" type="submit">Sign in</button><small>Demo credentials are pre-filled for review.</small></form></section>
    </main>
  );
}
